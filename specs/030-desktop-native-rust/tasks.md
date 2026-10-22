# Tasks: The Native Desktop Host

**Input**: [desktop-native-rust.spec.md](desktop-native-rust.spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Prerequisites**: the plan's pull request (etalii.adp 381) merged; the repository `etalii-adp/etalii.adp.ide.desktop` created by the maintainer (T001).

**Tests**: requested by the specification (User Story 3, FR-034, SC-003, SC-004, SC-010), so every story carries its test tasks, written before the code they check.

**Paths**: every file is named with its repository as prefix, `etalii.adp.ide.desktop/` or `etalii.adp/`. The clones sit side by side (`C:\git\<repository>`). The standalone host is read at `8b6ccfc` and never changed.

**Ticking**: a task whose code lands in `etalii.adp.ide.desktop` is ticked here only when that repository's pull request is merged. Each desktop pull request names `specs/030-desktop-native-rust/` and the etalii.adp commit its tasks were taken from.

**Format**: `- [ ] [ID] [P?] [Story?] Description · file`. [P] runs in parallel with the other [P] tasks of its phase; [USn] is the user story of the specification.

**Order of the stories**: the three P1 stories are built in the order 1, 3, 2, because Story 2's diagrams stand on Story 3's runtimes. Stories 4 and 5 (P2) can run side by side once Story 2's canvas exists; Story 6 (P3) runs last, though its theme starts in Phase 2.

## Phase 1: Setup (increment 1)

**Purpose**: the repository, its principles, its build on three platforms, and the documents here that name the hosts.

- [x] T001 Ask the maintainer to create the public repository `etalii-adp/etalii.adp.ide.desktop` with `develop` as default branch, merge commits only and "Automatically delete head branches", and to give the Claude app access, as `docs/new-repository.md` lists · etalii.adp/docs/new-repository.md (read, not changed)
- [x] T002 In the terminology, add the desktop host to **Host** and **IDE host** and to the list of IDE hosts, before any other document changes (FR-006) · etalii.adp/docs/terminology.md
- [x] T003 Name `etalii.adp.ide.desktop` among the hosts and the repositories with principles of their own, through `/speckit-constitution` as a MINOR amendment (FR-006) · etalii.adp/.specify/memory/constitution.md
- [x] T004 [P] Name `etalii.adp.ide.desktop` among the IDE hosts in the naming rule (FR-006) · etalii.adp/docs/new-repository.md
- [x] T005 [P] Write the desktop repository's principles: native platform citizenship, the text file is the source of truth, one frame for many tools, test-first against real files, simplicity, no clippy warnings (R13) · etalii.adp/.specify/memory/repositories/etalii.adp.ide.desktop.md
- [x] T006 Write the starting files: `CLAUDE.md` copied from Eclipse's and adapted (branches, delivery, specifications written in etalii.adp), `LICENSE` (Apache-2.0, `Copyright © Peter Vrenken 2026`), `README.md` with the badge line, `.gitattributes` (`*.sh` LF; byte-compared fixtures and goldens `-text`), `.gitignore` (`target/`, `.claude/settings.local.json`) · etalii.adp.ide.desktop/
- [x] T007 Create the Cargo workspace with `rust-toolchain.toml` (stable, edition 2024), empty crates for every crate in the plan's tree, `rustfmt.toml` and workspace lints denying clippy warnings · etalii.adp.ide.desktop/Cargo.toml
- [x] T008 Write the `Build` workflow: fmt, clippy, `cargo test --workspace` on `ubuntu-latest`, `windows-latest` and `macos-latest`, and the `terminology` job copied from another repository's `build.yml` (FR-040) · etalii.adp.ide.desktop/.github/workflows/build.yml
- [x] T009 [P] Add the repository to both build tables · .github/profile/README.md and etalii.adp.site/src/data/builds.ts
- [x] T010 Write `tools/sync-etalii-adp`, which copies `specifications/` and `definitions/` of a given etalii.adp commit into `vendor/etalii.adp/` and writes `vendor/etalii.adp.lock`; run it for `20389cd` or the newer commit the plan's merge leaves; add a Build step that fails when the copy and the lock disagree (R3, FR-034) · etalii.adp.ide.desktop/tools/sync-etalii-adp
- [x] T011 Fill the parity inventory: one row per capability of the standalone host's shell and per tool type of its `docs/tools.md` at `8b6ccfc`, each with its standalone source and increment, in the format of contracts/parity.md (FR-010) · etalii.adp.ide.desktop/parity/inventory.md
- [x] T012 [P] Generate the catalogue of the identity-only tool types (origin, display name, vendor group, state) from the standalone host's modules at `8b6ccfc` (R3, FR-021) · etalii.adp.ide.desktop/crates/adp-core/catalogue/identity-only.json

**Checkpoint**: an empty window opens on all three platforms from a green `Build`; the documents here name the desktop host.

## Phase 2: Foundational

**Purpose**: what every story stands on: the core's handle and events, the history, the context, the theme, the per-user state.

- [x] T013 Write the core's tests for the contract's calls and events: every method returns `Done`, `Refused(reason)` or `Prompt`; events arrive in order and are never dropped (contracts/core-shell.md) · etalii.adp.ide.desktop/crates/adp-core/tests/contract.rs
- [x] T014 Implement the `Workspace` handle, the core thread and the event channel per window (R1, contracts/core-shell.md) · etalii.adp.ide.desktop/crates/adp-core/src/
- [x] T015 [P] Implement commands, composite commands and the history with its barrier at a change from outside, ported from `EtAlii.Adp.History` with its tests (FR-016) · etalii.adp.ide.desktop/crates/adp-history/
- [x] T016 [P] Implement the context: one selection per window with its chain, actions as data with id, label, group, shortcut, enabled state and reason, prompts and property rows with the editor kinds line, text, toggle, choice and ordered slider, ported from `EtAlii.Adp.Context` with its tests (FR-015, FR-017) · etalii.adp.ide.desktop/crates/adp-context/
- [x] T017 [P] Implement the per-user state folder and atomic JSON saves (`projects.json`, `problems/<project-id>.json`, window layout) under the platform's application data folder (R8, FR-036) · etalii.adp.ide.desktop/crates/adp-core/src/state.rs
- [x] T018 [P] Write `tools/extract-vscode-theme` and extract VS Code's default dark and light themes (Dark 2026 and Light 2026 at `1.142.0`) at the pinned VS Code tag, with `SOURCE.md`, the MIT licence and `sizes.md` (R9, contracts/vscode-theme.md) · etalii.adp.ide.desktop/crates/adp-theme/vscode/
- [x] T019 Write the theme test that compares every value of the `Theme` structs with the extracted files and `sizes.md` (SC-010) · etalii.adp.ide.desktop/crates/adp-theme/tests/vscode_values.rs
- [x] T020 Implement the `Theme` structs and the mapping onto egui's `Style` and `Visuals`, following the system's light or dark setting (FR-042, FR-044) · etalii.adp.ide.desktop/crates/adp-theme/src/
- [x] T021 Start the shell: one window per workspace, the event drain once per frame, AccessKit switched on, the theme applied, Codicons loaded (R2) · etalii.adp.ide.desktop/crates/adp-shell/src/main.rs

**Checkpoint**: a themed, empty window driven by a tested core.

## Phase 3: User Story 1 - Install, open a workspace and find one's way in it (Priority: P1) 🎯 MVP

**Goal**: the frame and the five editors (increment 2).

**Independent Test**: on a clean machine of each platform, install, open a copy of the standalone repository's `src/examples/` as a project, and walk the explorer, the tabs and the five editors (spec, Story 1).

- [x] T022 [P] [US1] Write the project list's tests: add validates the path (exists, is a folder, readable), a missing folder is reported when opened and not dropped, the list survives a restart · etalii.adp.ide.desktop/crates/adp-projects/tests/
- [x] T023 [P] [US1] Write the hierarchy's tests: nesting of registrations under what they register, several registrations of one subject, a folder's `folder/.adp`, add, rename, delete, and changes on disk applied in order · etalii.adp.ide.desktop/crates/adp-hierarchy/tests/
- [x] T024 [P] [US1] Write the editors' tests: plain keeps encoding and line endings; JSON reports schema findings and completes; XML validates against the XSD or DTD the document names; YAML takes its schema from a `yaml-language-server` comment; Markdown gives the heading outline · etalii.adp.ide.desktop/modules/editors/*/tests/
- [x] T025 [US1] Implement the project list (FR-011) · etalii.adp.ide.desktop/crates/adp-projects/src/
- [x] T026 [US1] Implement the hierarchy with live watching through `notify`, and the explorer's actions `hierarchy.add`, `hierarchy.add-folder`, `hierarchy.rename`, `hierarchy.delete`, `editor.open-as-text`, `editor.open-with`, `problems.validate`, `problems.validate.all` (FR-013, FR-023) · etalii.adp.ide.desktop/crates/adp-hierarchy/src/
- [x] T027 [US1] Implement documents and tabs: open or focus, dirty state, save with Ctrl+S (Cmd+S on macOS), close with a question when unsaved (FR-014) · etalii.adp.ide.desktop/crates/adp-documents/src/
- [x] T028 [US1] Implement problems: validate, cache per project, revalidate at start (FR-019) · etalii.adp.ide.desktop/crates/adp-problems/src/
- [x] T029 [US1] Implement the text component on a rope with tree-sitter highlighting, selection, undo inside the editor, find, and the completion popup on Ctrl+Space (R6) · etalii.adp.ide.desktop/crates/adp-text/ and etalii.adp.ide.desktop/crates/adp-shell/src/text/
- [x] T030 [P] [US1] Implement the plain and Markdown editors, with the preview and outline through `pulldown-cmark` (FR-020) · etalii.adp.ide.desktop/modules/editors/plain/ and modules/editors/markdown/
- [x] T031 [P] [US1] Implement the JSON editor with `jsonschema` checks and completion (FR-020) · etalii.adp.ide.desktop/modules/editors/json/
- [x] T032 [P] [US1] Implement the XML editor with `libxml2` validation, statically linked (FR-020; Complexity Tracking) · etalii.adp.ide.desktop/modules/editors/xml/
- [x] T033 [P] [US1] Implement the YAML editor with its schema comment (FR-020) · etalii.adp.ide.desktop/modules/editors/yaml/
- [x] T034 [US1] Draw the project list page and the workspace: resizable panes (explorer and search placeholder left, tabs centre, errors and warnings bottom, toolbox and properties right), the ribbon with Save, New, Undo, Redo, contextual groups and the zoom buttons, the context menu, and keyboard navigation with the standalone host's shortcuts (FR-012, FR-015, FR-024) · etalii.adp.ide.desktop/crates/adp-shell/src/workspace/
- [x] T035 [US1] Draw the prompts with native file dialogs through `rfd` and the other prompts as modal panels (FR-015) · etalii.adp.ide.desktop/crates/adp-shell/src/prompts/
- [x] T036 [US1] Package the first installers with `cargo-dist` for the three platforms, unsigned and marked so, and publish them from a green `develop` (R11, FR-004, FR-040) · etalii.adp.ide.desktop/dist-workspace.toml and .github/workflows/build.yml
- [ ] T037 [US1] Walk Story 1 on each platform and record it; set the inventory rows it covers to `checked` · etalii.adp.ide.desktop/parity/walks.md

**Checkpoint**: Story 1 passes on a clean machine of each platform (SC-001).

## Phase 4: User Story 3 - Pass the same conformance runs as the standalone host (Priority: P1)

**Goal**: the runtimes and their proof (increment 3).

**Independent Test**: run the conformance suite; plant one wrong byte in an expected result and see it fail at that step (spec, Story 3).

- [x] T038 [US3] Write the conformance runner that replays every fixture under `vendor/etalii.adp/specifications/fbl/fixtures/` and validates every example under `vendor/etalii.adp/specifications/` and `definitions/`, with a planted-defect self-test (FR-034, SC-003) · etalii.adp.ide.desktop/crates/adp-conformance/
- [x] T039 [US3] Implement the FBL body buffer and the eleven splice operations of FBL section 6.1, keeping every byte outside them, the byte order mark and the majority line ending (FR-031) · etalii.adp.ide.desktop/crates/adp-fbl/src/splice/
- [x] T040 [P] [US3] Implement the YAML family with offset-keeping `saphyr` events (R5) · etalii.adp.ide.desktop/crates/adp-fbl/src/family/yaml.rs
- [x] T041 [P] [US3] Implement the JSON family with an offset-keeping scanner (R5) · etalii.adp.ide.desktop/crates/adp-fbl/src/family/json.rs
- [x] T042 [P] [US3] Implement the XML family with `quick-xml` positions (R5) · etalii.adp.ide.desktop/crates/adp-fbl/src/family/xml.rs
- [x] T043 [P] [US3] Implement the Lines family · etalii.adp.ide.desktop/crates/adp-fbl/src/family/lines.rs
- [x] T044 [US3] Implement routing by glob and marker, plugin bodies, folder subjects and the registration file with unknown blocks kept byte for byte (FBL section 8; FR-033) · etalii.adp.ide.desktop/crates/adp-fbl/src/
- [x] T045 [P] [US3] Implement the CEL facade and port the standalone host's CEL tests (R7) · etalii.adp.ide.desktop/crates/adp-cel/
- [x] T046 [US3] Implement the DISL and DID runtime: loading with its findings, refusing a later version with the reason, types, attributes, toolbox, operations, constraints, notation, and scenes for a viewport (FR-030, Story 3 scenario 2) · etalii.adp.ide.desktop/crates/adp-disl/
- [x] T047 [US3] Implement the DESL and DED runtime for designers, with windowed table readings (FR-030) · etalii.adp.ide.desktop/crates/adp-desl/
- [x] T048 [US3] Load every tool type from `vendor/etalii.adp/definitions/` and the identity catalogue into the catalogue the add dialog uses (FR-021, FR-035) · etalii.adp.ide.desktop/crates/adp-core/src/catalogue.rs
- [x] T049 [US3] Write the recorder that replays an edit script through the standalone host's gRPC API, with its `.DotSettings` (contracts/parity.md) · etalii.adp.ide.desktop/parity/recorder/
- [x] T050 [US3] Write the parity runner that replays every script headless and compares each written file byte for byte with its golden (SC-004) · etalii.adp.ide.desktop/crates/adp-parity/
- [ ] T051 [US3] Port the standalone host's round-trip tests for the tool types whose module is not yet ported as pending tests named after them, so their count shows what is left (FR-034) · etalii.adp.ide.desktop/crates/adp-conformance/tests/round_trip.rs

**Checkpoint**: every vendored fixture and example passes (SC-003); the parity runner works on an empty set.

## Phase 5: User Story 2 - Work in a diagram with the same result on disk (Priority: P1)

**Goal**: the canvas, the property grid and the first three diagram types (start of increment 4).

**Independent Test**: replay the same scripted edits in both hosts on copies of the same example and compare the files byte for byte (spec, Story 2).

- [x] T052 [P] [US2] Write and record edit scripts of at least 20 edits each for the mind map, the timeline and the C4 container view, with their goldens (SC-004) · etalii.adp.ide.desktop/parity/scripts/ and parity/goldens/
- [ ] T053 [P] [US2] Write scene snapshot tests for the three types' examples (`insta`) · etalii.adp.ide.desktop/crates/adp-disl/tests/scenes/
- [x] T054 [US2] Implement the layouts: Manual, Automatic Horizontal, Vertical and Cloud, layered layout and collapse and expand, ported from `EtAlii.Adp.Layout` (FR-018) · etalii.adp.ide.desktop/crates/adp-layout/
- [x] T055 [US2] Draw the canvas from scenes with viewport culling: pan with right-drag and scroll bars, zoom, fit to view (FR-018, SC-006) · etalii.adp.ide.desktop/crates/adp-shell/src/canvas/
- [x] T056 [US2] Implement the one gesture arbiter for drag, move, resize and connect, with Escape to cancel, box and Ctrl selection, the toolbox dragged onto the canvas, a connection dropped on empty space creating its target, Tab and Enter for child and sibling, and inline label rename (FR-018) · etalii.adp.ide.desktop/crates/adp-shell/src/canvas/gestures/
- [x] T057 [US2] Draw the property grid for one and for several elements, one undo for a change to several (FR-017, Story 2 scenario 4) · etalii.adp.ide.desktop/crates/adp-shell/src/properties/
- [x] T058 [US2] Reconcile a body changed on disk with unsaved edits and the undo barrier, as the standalone host does (FR-023, Story 2 scenario 5) · etalii.adp.ide.desktop/crates/adp-documents/src/reconcile.rs
- [x] T059 [P] [US2] Port the mind map's residue (`.mm` reader, two-sided layout, sibling naming) · etalii.adp.ide.desktop/modules/diagrams/mindmap/
- [x] T060 [P] [US2] Port the timeline's residue · etalii.adp.ide.desktop/modules/diagrams/timeline/
- [x] T061 [P] [US2] Port the C4 residue: the Structurizr DSL reader and the six views over one workspace · etalii.adp.ide.desktop/modules/diagrams/c4/
- [x] T062 [US2] Walk Story 2 and record it · etalii.adp.ide.desktop/parity/walks.md

**Checkpoint**: three diagram types write the same bytes as the standalone host (SC-004 for those types).

## Phase 6: User Story 4 - Work in the Knowledge designer (Priority: P2)

**Goal**: the designer (increment 5).

**Independent Test**: open the standalone host's Knowledge designer examples and a generated table of 10,000 rows, and pass its acceptance checks (spec, Story 4).

- [x] T063 [P] [US4] Write and record edit scripts for cell edits, added rows and view changes over YAML, XML and JSON, with their goldens · etalii.adp.ide.desktop/parity/scripts/knowledge/
- [x] T064 [US4] Port the Knowledge designer module: typed properties, relations between files, views (visibility, sort, filter, group) (FR-022) · etalii.adp.ide.desktop/modules/designers/knowledge/
- [x] T065 [US4] Draw windowed tables with `ScrollArea::show_rows` and edit cells in place (SC-006) · etalii.adp.ide.desktop/crates/adp-shell/src/table/
- [x] T066 [US4] Benchmark scrolling 10,000 rows and memory per screen scrolled (Story 4 scenario 2) · etalii.adp.ide.desktop/benches/table.rs
- [x] T067 [US4] Walk Story 4 and record it · etalii.adp.ide.desktop/parity/walks.md

**Checkpoint**: the Knowledge designer at parity.

## Phase 7: User Story 5 - Every tool type of the standalone host, and the same catalogue (Priority: P2)

**Goal**: the remaining tool types (rest of increment 4). Each task is one module with its edit scripts, goldens and round-trip tests, in its own pull request, and can run in parallel with the others.

**Independent Test**: for each tool type, open its examples in both hosts and walk its acceptance checks from the standalone host's specification of it (spec, Story 5).

- [x] T068 [US5] Draw the add dialog from the catalogue, grouped by vendor, with the standalone host's names and states (Story 5 scenario 1) · etalii.adp.ide.desktop/crates/adp-shell/src/add_dialog.rs
- [x] T069 [P] [US5] Causal loop diagram (`.cld`) · etalii.adp.ide.desktop/modules/diagrams/causal-loop-diagram/
- [x] T070 [P] [US5] Wardley map (`.owm`, byte for byte) · etalii.adp.ide.desktop/modules/diagrams/wardley-map/
- [x] T071 [P] [US5] Dependency graph (`.dgr`) · etalii.adp.ide.desktop/modules/diagrams/dependency-graph/
- [x] T072 [P] [US5] Functional decomposition graph (`.fdg`) · etalii.adp.ide.desktop/modules/diagrams/functional-decomposition-graph/
- [x] T073 [P] [US5] Gartner hype cycle graph (`.ghg`), with compact mode, triggers, notes and the phase legend · etalii.adp.ide.desktop/modules/diagrams/gartner-hype-cycle-graph/
- [x] T074 [P] [US5] Agent Behavior Modelling (`.md`) · etalii.adp.ide.desktop/modules/diagrams/agent-behavior-modelling/
- [x] T075 [P] [US5] Agent activity diagram (`.aad`) · etalii.adp.ide.desktop/modules/diagrams/agent-activity-diagram/
- [x] T076 [P] [US5] Supply chain (`.supply`) · etalii.adp.ide.desktop/modules/diagrams/supply-chain/
- [x] T077 [P] [US5] Sankey (`.skv`) · etalii.adp.ide.desktop/modules/diagrams/sankey/
- [x] T078 [P] [US5] Azure DevOps pipeline (`.yml`) · etalii.adp.ide.desktop/modules/diagrams/azure-devops-pipeline/
- [x] T079 [P] [US5] Ansible structure (folder subject) · etalii.adp.ide.desktop/modules/diagrams/ansible-structure/
- [x] T080 [P] [US5] Helm chart (folder subject) · etalii.adp.ide.desktop/modules/diagrams/helm-chart/
- [x] T081 [P] [US5] Databricks bundle, job and pipeline · etalii.adp.ide.desktop/modules/diagrams/databricks/
- [x] T082 [P] [US5] .NET dependency graph (`.sln`, `.slnx`, read-only) · etalii.adp.ide.desktop/modules/diagrams/dotnet-dependency-graph/
- [x] T083 [P] [US5] RDF (`.ttl`, `.nt`) with its readings OWL, SKOS and SHACL · etalii.adp.ide.desktop/modules/diagrams/rdf/
- [x] T084 [P] [US5] SPARQL query (`.rq`, read-only) · etalii.adp.ide.desktop/modules/diagrams/sparql/
- [x] T085 [US5] Check the inventory's tool type rows against the standalone host's `docs/tools.md` at `8b6ccfc`; add a task here for any working tool type the list above misses · etalii.adp.ide.desktop/parity/inventory.md

**Checkpoint**: every tool type row of the inventory is `built`.

## Phase 8: User Story 6 - Look and feel of a native application in the style of VS Code (Priority: P3)

**Goal**: the look and the accessibility finished (increment 6).

**Independent Test**: compare with VS Code side by side in both themes, switch the system theme, walk Story 1 with a screen reader, run the contrast checks (spec, Story 6).

- [x] T086 [P] [US6] Port the standalone host's contrast tests and run them against both VS Code themes; adjust tool colours, never VS Code values (FR-042, R9) · etalii.adp.ide.desktop/crates/adp-theme/tests/contrast.rs
- [x] T087 [P] [US6] Give every tool's canvas and table colours per theme from the active theme (FR-045) · etalii.adp.ide.desktop/modules/*/src/theme.rs
- [x] T088 [US6] Expose every interactive element through AccessKit with role, name and state, and test the tree of the explorer, menus, dialogs, tabs and the errors panel (FR-041) · etalii.adp.ide.desktop/crates/adp-shell/tests/accessibility.rs
- [ ] T089 [US6] Walk Story 1 with a screen reader on at least one platform and Story 6 on all three, and record them (SC-009, SC-010) · etalii.adp.ide.desktop/parity/walks.md

**Checkpoint**: the look matches VS Code value for value; a screen reader user completes Story 1.

## Phase 9: Polish and release

- [x] T090 [P] Write the start-up probe and the benchmarks for SC-005, SC-006 and SC-008 with a generated 5,000-file workspace and a 1,000-element canvas; record the reference machine (R12) · etalii.adp.ide.desktop/benches/ and parity/reference-machine.md
- [x] T091 [P] Measure SC-007 against the standalone host at `8b6ccfc` in Chrome and record it · etalii.adp.ide.desktop/parity/reference-machine.md
- [ ] T092 Sign the Windows installers and sign and notarise the macOS ones with the maintainer's certificates (R11) · etalii.adp.ide.desktop/.github/workflows/build.yml
- [ ] T093 Set every inventory row to `checked`, or list what is left; release 1.0 when none is (SC-002) · etalii.adp.ide.desktop/parity/inventory.md
- [ ] T094 Tick in this file every task whose pull request is merged, and record the release in the feature's state · etalii.adp/specs/030-desktop-native-rust/tasks.md

## Dependencies

- Phase 1 → Phase 2 → Story 1 (Phase 3) → Story 3 (Phase 4) → Story 2 (Phase 5).
- Stories 4 and 5 (Phases 6 and 7) need Phase 5's canvas, tables and property grid; they are independent of each other, and each module of Phase 7 is independent of the others.
- Story 6 (Phase 8) needs the frame (Phase 3) and is finished once the tools exist (Phases 6 and 7); its theme starts in Phase 2.
- Phase 9 needs everything.

## Parallel examples

- Phase 1: T004, T005 and T009 together, while T006 to T008 build the repository.
- Phase 2: T015, T016, T017 and T018 together.
- Story 1: T022 to T024 together, then T030 to T033 together once T029 exists.
- Story 3: T040 to T043 and T045 together, after T039.
- Story 5: T069 to T084, one module per session, all at once.

## Implementation strategy

- **MVP**: Phases 1 to 3. A native app that opens a repository and edits its text files on all three platforms, released unsigned.
- **Then**: Phase 4 makes the formats correct before any diagram is drawn; Phase 5 proves byte identity on three diagram types; Phases 6 and 7 fill the catalogue one tool type at a time, each usable when merged.
- **Release 1.0** when Phase 9 finds every inventory row `checked`.
