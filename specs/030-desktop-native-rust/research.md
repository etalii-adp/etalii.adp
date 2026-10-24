# Research: The Native Desktop Host

**Feature**: [desktop-native-rust.spec.md](desktop-native-rust.spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-20

Each entry gives the decision, why, and what else was weighed. The standalone host was read at `develop` `8b6ccfc` (the reference commit); crate names are the choice at planning time and are pinned in the desktop host's `Cargo.lock`, not here.

## R1. The shape of the application: one process, a headless core and a native shell

**Decision**: one Rust process with two layers. The **core** is a set of library crates with no window, no GPU and no platform API: projects, the explorer's hierarchy, documents, the history, the context (selection, actions, properties, prompts), problems, layout, and the DISL, DESL, DED, FBL and CEL runtimes. The **shell** is the one binary crate that draws the window and turns input into calls on the core. The core speaks to the shell through plain Rust traits and messages on channels: the standalone host's unary "action" calls become method calls, and its one `Watch` stream per tab becomes one event channel per window.

**Rationale**: the standalone host already separates backend concerns from the client, and that line is the right one to keep: every behaviour the parity inventory checks (commands, splices, findings, actions) is testable without a window, so the conformance and parity suites run headless on all three CI runners. Without a network boundary there is no serialisation on the hot path and no connection pool to wedge (the standalone host's two-tab wedge has no counterpart).

**Alternatives**: a Rust backend with a web view frontend (Tauri) — rejected by FR-002. A Rust process that keeps gRPC between core and shell — rejected: no second process exists to talk to, and FR-002 forbids a listener.

## R2. The UI toolkit: egui on wgpu, with AccessKit

**Decision**: `egui` with `eframe` on the `wgpu` renderer for the shell, its built-in AccessKit integration for accessibility, and `rfd` for the platform's native file dialogs. Canvases are drawn with egui's painter (shapes, paths, text galleys) into a clipped, transformed area; nothing about a canvas is an egui widget per element.

**Rationale**:
- **Accessibility (FR-041, SC-009).** AccessKit is wired into egui and exposes roles, names and states to UI Automation on Windows, NSAccessibility on macOS and AT-SPI on Linux. Of the native Rust toolkits weighed, it is the most complete today.
- **The VS Code look (FR-044).** egui's `Style` and `Visuals` set every colour, stroke width, rounding, spacing and font size from one place, which is exactly the set of values FR-044 lists. The VS Code theme values become one `Theme` struct (R9).
- **Large canvases and tables (SC-006).** Immediate-mode drawing with viewport culling repaints only what is visible; egui's `ScrollArea::show_rows` gives windowed tables for the Knowledge designer's 10,000 rows.
- **Portability (FR-004).** One code path on Windows, macOS and Linux (X11 and Wayland), with wgpu choosing DirectX 12, Metal or Vulkan, and a GL fallback.

**Alternatives**: `iced` — good architecture, but its accessibility is not yet complete. `Slint` — declarative and accessible, but a canvas of thousands of custom-drawn elements fights its model, and its licence terms need care. `gpui` (Zed) — excellent text and performance, but not published as a stable library. `Xilem`/`Masonry` — promising, not mature. `gtk4-rs` — native on Linux only in look, and heavy on Windows and macOS.

**Risk**: immediate-mode text input is weaker than a retained text widget for large files; the editors therefore get their own text component (R6), not egui's `TextEdit`.

## R3. Where the tool types come from

**Decision**: the desktop host loads tool types from the same files every host uses: the specification files, bindings and companions under `definitions/` in `etalii.adp`, at a pinned commit, vendored into the desktop repository by a sync script with a checked lock file (`vendor/etalii.adp.lock` holds the commit; CI fails when the vendored copy differs from that commit). Tool types that exist in the standalone host only as an identity (about forty stubs) are listed from a catalogue file generated once from the standalone host's modules at the reference commit.

**As built** (T012, T048): the catalogue file, `crates/adp-core/catalogue/tools.json`, lists every tool type of the standalone host's `docs/tools.md` at the reference commit, with its group, order and state, and the catalogue joins each by origin with its vendored specification. Several specifications name their binding by its address in the standalone host's repository, where the standalone host bundles it with its module; those bindings are copied at the reference commit into `vendor/etalii.adp.ide.standalone/` by `tools/vendor-standalone-bindings.py`, and the three such addresses that do not exist at the reference commit (C4, Azure DevOps pipeline, .NET dependency graph) are read by their modules' own code there and here.

**Rationale**: FR-035 and Principle I. The standalone host bundles DISL from its modules' `definition/` folders; the same files are in `etalii.adp/definitions/`, which is the source of truth. A lock file makes "the `etalii.adp` commit the plan names" (FR-034) a fact the build checks.

**Alternatives**: a git submodule — rejected for the friction it adds to every clone and worktree. Fetching at build time like the terminology job — rejected: a build must be reproducible offline.

## R4. What is ported and what is interpreted

**Decision**: the runtimes (DISL, DESL, DED, FBL, CEL) are written once in Rust as interpreters of the vendored files. The **residue** each standalone module carries in C# — readers FBL cannot declare (Structurizr DSL, Turtle, SPARQL, `.sln`/`.slnx`, Wardley `.owm`), layouts (layered, two-sided, hype curve), and per-tool operations — is ported by hand into one crate per module, under `modules/diagrams/<tool>/`, `modules/designers/<tool>/` and `modules/editors/<tool>/`, mirroring the standalone host's `src/diagrams/<tool>/` names.

**Rationale**: this is the "middle path" of the research note *Rust as the tool language* (section 7): declarative tool types stay data, one Rust runtime interprets them, and Rust appears only where code is needed. It keeps the desktop host from becoming a fourth place where a tool type is specified.

**Alternatives**: re-specifying tool types as Rust macros (the note's full proposal) — out of scope: it would change the specifications, not just add a host.

**As built** (T054): the layouts are the ones the standalone host ships at the reference commit: `EtAlii.Adp.Layout` (layering, cycle policies, overlap resolution, row packing, grid packing) and its client's layout seam with the manual, tree, row-packed and tiered force layouts, and collapse and expand as the mind map does it. The four named modes Manual, Automatic Horizontal, Vertical and Cloud were never built there: its `layout-modes` draft was rejected on 2026-09-05. Following the spec's assumption that the standalone host's behaviour wins, the desktop host has what it has and maps nothing onto those names.

## R5. FBL in Rust and identical bytes

**Decision**: a crate `adp-fbl` implements FBL's families (YAML, JSON, XML, Lines), plugin bodies, folder subjects, routing by glob and marker, the registration file, and the eleven splice operations of FBL section 6.1, on a byte buffer that keeps the byte order mark and the majority line ending (as the standalone host's `BodyText` does). Parsing that must keep byte offsets uses offset-preserving parsers: `saphyr`'s marked events for YAML, `quick-xml` with positions for XML, and a small hand-written JSON scanner, never a serialise-and-rewrite path.

**Rationale**: FR-031 and FR-032. Byte identity with the standalone host is only possible if both hosts compute the same splice for the same change; computing splices from source spans, as FBL specifies, gives that by construction, and the fixtures check it.

**Alternatives**: `serde_yaml` or `serde_json` round-tripping — rejected, they rewrite formatting.

## R6. Editors without CodeMirror

**Decision**: one text component in the shell, built on a rope (`ropey`), with `tree-sitter` grammars for highlighting (Markdown, JSON, XML, YAML), `pulldown-cmark` for the Markdown preview and outline, `jsonschema` for JSON Schema checks and completion, and schema lookup for YAML from the `yaml-language-server` comment as the standalone host does. XML validation against XSD and DTD uses `libxml2` through its Rust bindings, statically linked.

**Rationale**: FR-020 lists five editors with schema checks and completion. Each piece is a mature crate; only the text component and completion popup are new code. `libxml2` is the one native C dependency: it is part of the installed application (FR-005), not a runtime the person installs, and no pure-Rust XSD validator is complete.

**Alternatives**: embedding Zed's editor — not available as a library (R2). Dropping XSD validation — would break parity.

**Risk**: the text component is the largest single piece of new UI. It is planned as its own increment with its own acceptance walk.

**Update 2026-10-21, as built** (etalii-adp/etalii.adp.ide.desktop pull requests 8 to 11): highlighting uses `syntect` with TextMate grammars instead of `tree-sitter`, because VS Code's token colours are TextMate scope selectors and so become a highlighting theme as they are (FR-044). YAML is read with `saphyr-parser`'s events, which keep positions, and XML with `roxmltree`. Checking XML against XSD and DTD is not built yet: `libxml2` still is the plan, and its Windows build is the open question; until then the status line says "not checked yet" and T024 and T032 stay open.

## R7. CEL

**Decision**: the `cel-interpreter` crate, behind an `adp-cel` facade that exposes only the functions and types DISL and FBL use, with the standalone host's CEL tests ported as the facade's conformance suite.

**Rationale**: Principle III makes CEL the expression language; a facade keeps the host free to replace the crate if a gap appears.

## R8. Files, watching and state

**Decision**: `notify` (with its debouncer) for live changes on disk (FR-023, SC-008); atomic saves through a temporary file and rename in the same folder; per-user state (projects, problem cache, window layout) as JSON under the platform's application data folder found with `directories` (`%AppData%\EtAlii\ADP Desktop`, `~/Library/Application Support/net.etalii.adp.desktop`, `$XDG_DATA_HOME/etalii-adp-desktop`) (FR-036).

**Rationale**: the standalone host keeps the same kinds of state under `%AppData%`; separate folders keep the two hosts from fighting over one cache when both are installed.

## R9. The VS Code look

**Decision**: the theme values come from VS Code's default dark and light themes, the ones its `ThemeSettingDefaults` names, from the VS Code release current when the shell increment starts. At `1.142.0`, pinned by the desktop host on 2026-10-21, these are **Dark 2026** and **Light 2026**, which include Dark Modern and Light Modern and override part of them; the plan first named the Modern themes, which were the defaults before. The defaults are read from VS Code rather than named here, so a later release's defaults follow the specification's "default" (FR-044) without a change to this plan. They are extracted, with their `include` chains resolved, by a script from `extensions/theme-defaults/themes/*.json` in `microsoft/vscode` (MIT) into `crates/adp-theme/vscode/*.json` with the licence beside them. Sizes that are not in the theme files (font sizes, row heights, tab height, border widths, focus outline width) are taken from VS Code's workbench CSS at the same tag and recorded in one table in the theme crate, each value with its source line. The icons are the **Codicons** font (CC BY 4.0) for the chrome and the Material Design Icons the standalone host already uses inside tools.

**Rationale**: FR-044 and SC-010 need values that can be checked one by one against a named source. Taking them from the files VS Code ships makes the check mechanical: a test compares every value of the theme struct with the extracted file.

**Alternatives**: copying colours by eye from screenshots — not checkable. Following VS Code's high-contrast themes too — not asked; can be a later feature.

**Note**: VS Code's look replaces only the standalone host's chrome tokens. The standalone host's contrast tests (`theme.contrast.test.ts`, `moduleThemeContrast.test.ts`) are ported and run against the VS Code values (FR-042); where a pair fails, the tool's colour is adjusted, not the VS Code value.

## R10. The parity oracle

**Decision**: parity is proven by three suites, all in the desktop repository:
1. **Conformance**: every FBL fixture and specification example vendored from `etalii.adp` (FR-034).
2. **Golden edits**: for each tool type, edit scripts (JSON: open a file, apply a list of actions with arguments, save) whose expected bodies and registrations are recorded once by a **recorder** that drives the standalone host's gRPC API at the reference commit. The recorder lives in the desktop repository under `parity/recorder/` and needs .NET only when re-recording, never to build or run the desktop host; the goldens are committed (SC-004).
3. **The parity inventory** (`parity/inventory.md`, FR-010): one row per capability and tool type, its source in the standalone host, its increment, its check (a test name or a manual walk), and its state.

**Rationale**: the spec says the standalone host is the oracle and is not changed. Driving it from outside through the API it already has keeps it unchanged, and the goldens make the comparison run without it.

**Alternatives**: running both hosts side by side in CI — rejected, it would put .NET back into the desktop build.

## R11. Packaging and release

**Decision**: `cargo-dist` produces, per platform, an MSI for Windows x64 and arm64, a signed and notarised `.dmg` for macOS arm64 and x64, and an AppImage plus a `.deb` for Linux x64 and arm64, published to GitHub Releases from a green `develop`, versioned with the workspace version. Code signing uses the maintainer's certificates as repository secrets; until they exist, unsigned builds are published and marked as such.

**Rationale**: FR-004 and FR-040. The standalone host releases from every green `develop`; the desktop host does the same.

**Update 2026-10-21, as built** (etalii-adp/etalii.adp.ide.desktop pull request 12): the first packages are archives built by the `Build` workflow itself (a zip for Windows x64, tar.gz for macOS arm64 and Linux x64), published unsigned as a GitHub pre-release from each green tip of `develop`; MSI, `.dmg` and AppImage through `cargo-dist` follow with signing (T092).

**Update 2026-10-24, signing dropped**: the maintainer chose not to sign any release for now. 1.0.0 was published on 2026-10-23 as the same archives, unsigned, and its notes say that Windows SmartScreen and macOS Gatekeeper warn before the programs start; T092 is dropped rather than done.

**Minimum versions**: Windows 10 22H2, macOS 13, and Linux with glibc 2.35 (Ubuntu 22.04) and Vulkan or GL 3.3.

## R12. The reference machine and the numbers

**Decision**: SC-005 to SC-007 are measured on GitHub's `windows-latest` runner and on the maintainer's development machine (recorded in `parity/reference-machine.md`), with a generated workspace of 5,000 files and a generated canvas of 1,000 elements, by benchmarks in `benches/` (criterion for core paths) and a timed start-up probe in the shell. The memory comparison of SC-007 runs once per release by hand against the standalone host at the reference commit in Chrome.

## R13. The repository and its principles

**Decision**: create `etalii.adp.ide.desktop` by the rules of `docs/new-repository.md` (develop, merge commits, `CLAUDE.md`, Apache-2.0 `LICENSE`, `Build` workflow with the terminology job, readme badge, rows in both build tables), and write its principles in `.specify/memory/repositories/etalii.adp.ide.desktop.md` here, modelled on VS Code's: native platform citizenship, the text file is the source of truth, one frame many tools, test-first against real files, simplicity, plus "no clippy warnings" as the Rust counterpart of Principle VI. The terminology, constitution and new-repository documents name the desktop host as a sixth host and fifth IDE host (FR-006), terminology first.

**Rationale**: FR-001 and FR-006; the rule that a new repository's principles live here.
