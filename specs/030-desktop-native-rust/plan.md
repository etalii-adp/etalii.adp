# Implementation Plan: The Native Desktop Host

**Branch**: `features/030-desktop-native-rust-plan` in `etalii.adp` (the specification's branch merged with pull request 279); in `etalii.adp.ide.desktop`, one `features/030-<pull request>` branch per pull request | **Date**: 2026-10-20 | **Spec**: [desktop-native-rust.spec.md](desktop-native-rust.spec.md)

**Input**: the feature specification; the standalone host read at `develop` `8b6ccfc` (the reference commit); `etalii.adp` at `develop` `20389cd` for the specifications and `definitions/`; the research note *Rust as the tool language* (2026-10-13).

**Scale note.** This is a new host built from nothing to parity with a host of about 800 test files and 30 working tool types. It lands as six increments, each usable on its own, in a new repository, across many pull requests. Estimates are not given; the order is.

## Summary

`etalii.adp.ide.desktop` is one Rust process: a headless **core** of library crates that does everything the standalone host's .NET backend does (projects, hierarchy, documents, history, context, problems, layout, and the DISL, DESL, DED, FBL and CEL runtimes), and a native **shell** drawn with egui on wgpu that does what the React client does, styled with VS Code's Dark Modern and Light Modern values and exposed to screen readers through AccessKit. The two talk through Rust calls and one event channel per window, the in-process counterpart of the standalone host's gRPC contract. Tool types are loaded from `etalii.adp`'s `definitions/`, vendored at a locked commit; each module's residue (custom readers, layouts, operations) is ported from C# into its own crate. Parity is proven by the vendored conformance fixtures, by golden edits recorded once from the standalone host, and by a parity inventory with a check per row.

## Technical Context

**Language/Version**: Rust, stable channel, edition 2024; the toolchain pinned in `rust-toolchain.toml` (1.90 or later at the first commit).

**Primary Dependencies**: `egui`/`eframe` with `wgpu` and AccessKit (R2); `rfd` (file dialogs); `notify` (watching, R8); `directories` (state folders); `ropey`, `tree-sitter` with the Markdown, JSON, XML and YAML grammars, `pulldown-cmark`, `jsonschema`, `libxml2` bindings (editors, R6); `saphyr`, `quick-xml` (offset-keeping parsers, R5); `cel-interpreter` (R7); `serde`/`serde_json` (state and definitions); `tracing` (logs); `cargo-dist` (packaging, R11).

**Storage**: the person's files in the workspace, written only as splices or as the editors' saves; per-user JSON state in the platform's application data folder (R8).

**Testing**: `cargo test` for every crate, headless; the conformance suite over the vendored fixtures (`adp-conformance`); the golden-edit suite (`adp-parity`); `insta` snapshots of scenes; criterion benchmarks for SC-005 and SC-006; `cargo clippy -D warnings` and `cargo fmt --check`; manual walks per user story, recorded in `parity/walks.md`, in both themes and with a screen reader.

**Target Platform**: Windows 10 22H2+ (x64, arm64), macOS 13+ (arm64, x64), Linux with glibc 2.35+ (x64, arm64) on X11 or Wayland.

**Project Type**: desktop application, as a Cargo workspace.

**Performance Goals**: SC-005 (project list in 2 s, 5,000-file workspace in 3 s), SC-006 (1,000-element canvas and 10,000-row table keep pace), SC-008 (disk change shown in 1 s).

**Constraints**: no .NET, JavaScript, browser, web view or listener at run time (FR-002); the same bytes as the standalone host for the same edit (FR-032); no colour or size outside the theme (FR-044).

**Scale/Scope**: about 30 working tool types, 40 identity-only tool types, five editors, one designer, the shell of the standalone host.

## Constitution Check

*Gate: passed before research, and re-read after the design files were written.*

### The etalii.adp constitution (1.6.0)

| Principle | Assessment |
|---|---|
| I. One source of truth | PASS. The desktop host interprets the vendored specifications and definitions and defines no format of its own; what it finds wrong comes back here as a feature. The theme and the parity files are the host's own, not formats. |
| II. Implementable from the document alone | PASS, and tested: a second implementation built from the documents is what the conformance suite checks. Any place a document proves insufficient is recorded and fed back. |
| III. Precise normative language | Not engaged. |
| IV. Versioned specifications | PASS. The host states the versions it implements (those of the standalone host at the reference commit) and refuses later ones with the reason. |
| V. Simplicity | PASS with one justified item in Complexity Tracking: a recorder in .NET for the goldens. No other dependency is added beyond what R2 to R11 justify one by one. |
| VI. No Rider warnings in C# | Not engaged by the host. The recorder is C# and follows it: it has a `.DotSettings` and runs `jb inspectcode` when changed. |
| Structure and Naming | PASS. The feature is specified here; the new repository's principles go to `.specify/memory/repositories/etalii.adp.ide.desktop.md` (R13). |
| Development Workflow | PASS. Each desktop pull request names this folder and the `etalii.adp` commit its tasks came from; a task is ticked only when that pull request is merged. |

### The desktop repository's principles

They do not exist yet; task 1 writes them (R13): native platform citizenship, the text file is the source of truth, one frame for many tools, test-first against real files, simplicity, and no `clippy` warnings. Every later task is checked against them.

## Increments

| # | Increment | Stories | Usable result |
|---|---|---|---|
| 1 | The repository, its principles, the documents here that list hosts (FR-001, FR-006), the vendoring of `etalii.adp`, the parity inventory, CI on three platforms | — | An empty app that builds, tests and releases on all three platforms |
| 2 | The frame: project list, explorer, tabs, panes, ribbon, context system, history, problems panel, the text component and the five editors, the VS Code theme | 1, part of 6 | Browse and edit a repository |
| 3 | The runtimes: FBL with the registration file, DISL, DESL, DED, CEL; the conformance suite; the recorder and the first goldens | 3 | Conformance green; bodies read and written headless |
| 4 | The canvas and the diagrams: gestures, toolbox, property grid, layout modes, scenes; then tool types one by one in the order of the standalone host's `docs/tools.md`, each with its goldens | 2, 5 | Each tool type usable as it lands |
| 5 | The Knowledge designer, windowed tables, views | 4 | The designer usable |
| 6 | Accessibility walk, the remaining theme and contrast work, signing and notarisation, the parity walk of every row | 6 | Release 1.0: every inventory row `checked` |

## Project Structure

### Documentation (this feature)

```text
specs/030-desktop-native-rust/
├── desktop-native-rust.spec.md
├── plan.md               # this file
├── research.md           # R1 to R13
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── core-shell.md     # the in-process counterpart of the gRPC contract
│   ├── parity.md         # inventory, edit scripts, goldens, recorder
│   └── vscode-theme.md   # what the look is checked against
├── checklists/requirements.md
└── tasks.md              # written by /speckit-tasks, not by this plan
```

### Source Code (`etalii.adp.ide.desktop`)

```text
Cargo.toml                    # the workspace
rust-toolchain.toml
crates/
├── adp-core/                 # Workspace handle, events, threads (contracts/core-shell.md)
├── adp-projects/
├── adp-hierarchy/            # tree, watching, add, rename, delete
├── adp-documents/
├── adp-history/              # commands, composites, barriers
├── adp-context/              # selection, actions, prompts, property rows
├── adp-problems/
├── adp-layout/               # layered and other layouts, geometry
├── adp-fbl/                  # families, splices, routing, registration file
├── adp-disl/                 # DISL and DID runtime, scenes
├── adp-desl/                 # DESL and DED runtime, tables
├── adp-cel/                  # facade over cel-interpreter
├── adp-theme/                # VS Code values and their check
├── adp-text/                 # the rope-based text component's model
├── adp-shell/                # the binary: egui, panes, canvas, editors, AccessKit
├── adp-conformance/          # replays the vendored fixtures
└── adp-parity/               # replays the edit scripts against the goldens
modules/
├── diagrams/<tool>/          # residue per tool type, names as standalone's src/diagrams/
├── designers/knowledge/
└── editors/{plain,markdown,json,xml,yaml}/
vendor/
├── etalii.adp/               # specifications/ and definitions/ at the locked commit
└── etalii.adp.lock
parity/
├── inventory.md
├── walks.md
├── reference-machine.md
├── scripts/<tool>/*.json
├── goldens/<tool>/<name>/
└── recorder/                 # .NET, only for re-recording
tools/
├── sync-etalii-adp           # refreshes vendor/ and the lock
└── extract-vscode-theme
benches/
.github/workflows/build.yml   # Build: fmt, clippy, test on three OSes, conformance, parity, terminology, release
```

**Structure Decision**: one Cargo workspace, a crate per backend concern of the standalone host so the parity inventory maps one to one, a crate per module so a tool type lands in its own pull request, and the shell as the only crate that knows the toolkit.

## Complexity Tracking

| Item | Why needed | Simpler alternative rejected because |
|---|---|---|
| A .NET recorder in a Rust repository (`parity/recorder/`) | The standalone host is the oracle and must not change; recording its writes through its own API is the only way to get byte-exact goldens from it | Writing goldens by hand would encode the desktop author's reading of the specification, not the standalone host's behaviour; running the standalone host in CI would put .NET into every build |
| `libxml2`, a C library, in a "fully native Rust" host | XSD and DTD validation for the XML editor (FR-020); no complete pure-Rust validator exists | Dropping XSD validation breaks parity; it is statically linked and invisible to the person, so FR-002 and FR-005 hold |
