# Tasks: Export a Causal Loop Diagram's Flow Page from VS Code

**Input**: [vscode-cld-flow-export.spec.md](vscode-cld-flow-export.spec.md), [plan.md](plan.md), [research.md](research.md)

**Tests**: written first and seen failing, as VS Code principle IV asks. Paths start with the repository they are in.

**Format**: `[ID] [P?] [Story] Description`. A task is ticked only once the pull request it landed in has merged.

## Phase 1: The page (User Story 2)

- [ ] T001 [US2] `etalii.adp.ide.vscode/scripts/sync-flow-page.mjs`: copy the desktop host's `modules/diagrams/causal-loop-diagram/src/flow_page.html` into `etalii.adp.ide.vscode/src/core/plugins/cld-flow-page/template.ts` with `PROVENANCE.md`, and `--check` it; run in `.github/workflows/build.yml` (R1) [FR-014]
- [ ] T002 [US2] Write the desktop host's page of each of the six examples into `etalii.adp.ide.vscode/fixtures/tools/causal-loop-diagram/flow-pages/` with its provenance (R3) [SC-003]
- [ ] T003 [US2] Test first, `etalii.adp.ide.vscode/test/core/plugins/cld-flow-page/flowPage.test.ts`: the page name, numbers as Rust writes them, JSON and HTML escaping, the template apart from its markers, and each example's page byte for byte the desktop host's [FR-006, FR-007, FR-008, SC-002, SC-003, SC-006]
- [ ] T004 [US2] The generator in `etalii.adp.ide.vscode/src/core/plugins/cld-flow-page/index.ts`, a port of the desktop host's `flow_page.rs` (R2) [FR-007, FR-008]

## Phase 2: The export in the frame (User Story 1)

- [ ] T005 [US1] Test first, `etalii.adp.ide.vscode/test/core/tool/exports.test.ts`: a causal loop diagram offers Export flow page on the empty selection only, the action answers `export`, the page holds the canvas's positions and unsaved text, and the source is unchanged [FR-001, FR-005]
- [ ] T006 [US1] `ExportLogic` by origin in `etalii.adp.ide.vscode/src/core/tool/pluginRegistry.ts`, registered in `src/core/plugins/index.ts`; the outcome `export`, `exports` and `exported` in `src/core/frame/toolType.ts` and `src/core/tool/toolTypeFrom.ts` (R4) [FR-004, FR-012]
- [ ] T007 [US1] `etalii.adp.ide.vscode/src/extension/exports.ts`: write the page beside the document under its name, open it with `openExternal`, say where with Reveal in Explorer, refuse an untitled document with the spec's sentence and a failed write with its reason; the outcome handled in `src/extension/toolEditor.ts` (R6) [FR-005, FR-006, FR-010, FR-011]

## Phase 3: The places (User Story 3)

- [ ] T008 [US3] Test first, `etalii.adp.ide.vscode/test/extension/exportsManifest.test.ts`: every carried export has its command in category ADP and its entries in `commandPalette`, `explorer/context`, `editor/title/context` and the `etalii.adp.menu` submenu of `editor/title`, and no more [FR-002, FR-003, FR-003a, FR-003c]
- [ ] T009 [US3] `etalii.adp.ide.vscode/package.json` and `src/extension/commands.ts`, `extension.ts`: the command, the context key of the extensions, the submenu, and the resource each place passes, exported as an open editor holds it, else as the open text, else from disk (R5) [FR-002, FR-003, FR-003a, FR-003b, FR-003c]
- [ ] T010 [P] [US3] `etalii.adp.ide.vscode/test/vscode/`: the command on an example writes a page beside it that holds its variables, and leaves the document unmodified [FR-005, SC-004]

## Phase 4: Records and delivery

- [ ] T011 `etalii.adp.ide.vscode/docs/disl-support.md` ("Code for one tool type"), `docs/parity.md`, `docs/tools.md` and `README.md` describe the export [FR-015, FR-016]
- [ ] T012 Run the checks, open the pull request naming this folder and the etalii.adp commit of these tasks, and turn auto-merge on
- [ ] T013 [P] Where the website's description of the export names its hosts, add VS Code through the site's route for sourced content [FR-017]
- [ ] T014 Tick these tasks and mark the specification implemented once the pull requests have merged
