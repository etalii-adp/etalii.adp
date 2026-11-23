# Tasks: The Dependency Graph in VS Code, as the Standalone One

**Input**: [vscode-dependency-graph.spec.md](vscode-dependency-graph.spec.md), [plan.md](plan.md), [research.md](research.md)

**Tests**: written first and seen failing, as VS Code principle IV asks. Paths start with the repository they are in.

**Format**: `[ID] [P?] [Story] Description`. `[P]` runs beside the other `[P]` tasks of its phase. A task is ticked only once the pull request it landed in has merged.

## Phase 1: The definition (pull requests B and C)

- [x] T001 [US1] In `etalii.adp/definitions/diagrams/dependency-graph.dis`, drop `persist.yaml` from `language.requires.features` and raise `language.version` to 1.1.1 (R1) [FR-001]
- [x] T002 [US1] In the same file, set `notation.theme.tokens` to standalone's light values and add `modes.dark` with its dark values, as research R4 lists them [FR-008]
- [x] T003 [P] [US1] In `etalii.adp/definitions/diagrams/dependency-graph.md`, correct section 4 (the X row shows at most four decimals) and section 8 (the colours, both themes); `python .github/scripts/validate-examples.py` passes [FR-008, FR-017]
- [x] T004 [US1] Open pull request B; turn auto-merge on. File an etalii.adp issue for the stale `persist.yaml` of the timeline, Sankey and supply-chain definitions
- [x] T005 [US1] Once B has merged, re-bundle `etalii.adp.ide.standalone/src/diagrams/dependency-graph/definition/` with `bash src/diagrams/tools/bundle-disl.sh dependency-graph <etalii.adp at develop>`, run the module's tests, and open pull request C with auto-merge on [FR-008]

## Phase 2: Open, read and find (pull request D, User Stories 1 and 3)

- [x] T006 [US1] Copy the definition into `etalii.adp.ide.vscode/definitions/dependency-graph/` with `npm run sync-definitions -- <etalii.adp> <standalone> --add definitions/diagrams/dependency-graph.dis`, keeping only that folder and its `package.json` entries [FR-001]
- [x] T007 [P] [US1] Copy `services.dgr` with its readme and licence into `etalii.adp.ide.vscode/examples/dependency-graph/` through `scripts/sync-examples.mjs` [FR-002]
- [x] T008 [US1] Test first, `etalii.adp.ide.vscode/test/core/disl/definitions/dependencyGraph.test.ts`: the definition reads with no finding, `services.dgr` gives its ten nodes and eleven dependencies [FR-001]
- [x] T009 [US3] Test first, then `ReadingLogic.order` in `etalii.adp.ide.vscode/src/core/tool/pluginRegistry.ts` and its use where findings are listed in `toolTypeFrom.ts` (R5) [FR-022]
- [x] T010 [US1] Test first, then `etalii.adp.ide.vscode/src/core/plugins/dependency-reading/`: nodes before dependencies (`reread`), the X row's four decimals (`numberText`), and the findings' order of the companion's section 3 (`order`) [FR-003, FR-017, FR-022]
- [x] T011 [US3] Test first, then `etalii.adp.ide.vscode/src/core/plugins/dependency-ends/` (`writtenEnd`, from the binding's `writtenFrom` and `writtenTo`), registered in `src/core/plugins/index.ts` [FR-021]
- [x] T012 [US3] Test first, then the built-in missing-id finding left to a definition's own rule as DISL 8.7 reads, in `etalii.adp.ide.vscode/src/core/disl/constraints.ts` (R5) [FR-020]
- [x] T013 [US1] Test first, then the refusal of an edit of a file that does not read, in the standalone host's words, and the binding's "The file has no place to create elements in." passed through, in `toolTypeFrom.ts` (R6) [FR-004, FR-015]
- [x] T014 [US3] Rows under "Code for one tool type" in `etalii.adp.ide.vscode/docs/disl-support.md` for the plugins of this phase, with their reasons
- [x] T015 [US1] Open pull request D, naming this folder and the etalii.adp commit of these tasks; turn auto-merge on

## Phase 3: Draw (pull request E, User Story 1)

- [x] T016 [US1] Test first, then the plugin kind `routing` in `etalii.adp.ide.vscode/src/core/tool/pluginRegistry.ts`, called by the scene for `line.routing.plugin`, with `fallback.routing` used when the plugin is not carried (R3) [FR-005]
- [x] T017 [US1] Test first, then `etalii.adp.ide.vscode/src/core/plugins/dependency-curve/`, the horizontal curve and the forward loop of the companion's section 7, held to standalone's `DependencyGraphCanvas.tsx` for `services.dgr` [FR-005, FR-006]
- [x] T018 [P] [US1] Test first, then an edge label at `at: middle`, `side: above`, `distance: 6`, in the size standalone draws, in `src/core/scene/scene.ts` and `src/webview/diagram/canvas.ts` [FR-007]
- [x] T019 [P] [US1] Test first, then the theme's `modes.dark` and the arrowhead in its line's colour, checked in the webview tests [FR-008, FR-009]
- [x] T020 [US1] Open pull request E; turn auto-merge on

## Phase 4: Gestures and properties (pull request F, User Stories 2 and 4)

- [x] T021 [US2] Test first, then `connect.from` read in `etalii.adp.ide.vscode/src/core/disl/notation.ts`, and a connection from an anchor mapped to `target` made with its ends swapped in `toolTypeFrom.ts` [FR-010]
- [x] T022 [US2] Test first, then a release on empty canvas: `connect` to a point in `src/core/frame/toolType.ts`, the library tool's `createTarget` or `createSource` and the connect as one transaction in `toolTypeFrom.ts`, and the gesture in `src/webview/diagram/canvas.ts` [FR-011]
- [x] T023 [US2] Test first, then "A node cannot depend on itself." and "Both ends of a dependency must be nodes of this graph." for a connection onto itself or onto no node [FR-012]
- [x] T024 [P] [US2] Test first, then Tab and Enter on a selected node run the actions with those shortcuts, in `src/webview/diagram/canvas.ts` [FR-013]
- [x] T025 [US2] Test first, then **ADP: Add node**: the label asked as standalone asks it, placed 240 right of the selection or at 0 on row 0, in `src/extension/commands.ts`, `package.json` and `toolTypeFrom.ts` [FR-014]
- [x] T026 [US2] Test first, then the binding's read-only refusal of a value behind a merge key or an alias before a row's `validate` [FR-016]
- [x] T027 [US4] Test first, then a row's `validate` given the typed text, in `src/core/disl/forms.ts`, with `1234.5`, `-2`, `0.00001` and `1e21` accepted and `1.5` refused for Row (R7) [FR-018]
- [x] T028 [US4] A row of `docs/parity.md` for X and Row edited as a line of text, if the control stays VS Code's number box [FR-019]
- [x] T029 [US2] Open pull request F; turn auto-merge on

## Phase 5: Held to the transcript (pull request G)

- [x] T030 Copy standalone's transcript, its twelve fixtures and the 26 inline documents written from `DependencyGraphCorpus.cs` into `etalii.adp.ide.vscode/fixtures/tools/dependency-graph/`, with a readme naming their source and commit [FR-025]
- [x] T031 Test first, `etalii.adp.ide.vscode/test/core/tool/dependencyGraph.test.ts`: toolbox, menus, rows, findings and every edit of the transcript replayed as `causalLoopDiagram.test.ts` does, its differences listed with their reasons (R8) [FR-023, FR-025, SC-002]
- [x] T032 [P] `docs/tools.md`, `README.md`, `docs/disl-support.md` and `docs/parity.md` describe the dependency graph as built [FR-026]
- [x] T033 Host test on the Mac mini: `services.dgr` side by side with the standalone host in both themes (SC-001), and a new user's attempt from **New Dependency graph** to three connected nodes recorded (SC-004); the screenshot `docs/screenshots/dependency-graph.png` [FR-026, SC-001, SC-004]
- [x] T034 Open pull request G; turn auto-merge on
- [x] T035 Tick the merged tasks in this file, and set the specification's status to implemented, in pull request H

## Coverage

Every functional requirement of the specification is claimed above: FR-001 (T001, T006, T008), FR-002 (T007), FR-003 (T010), FR-004 (T013), FR-005 (T016, T017), FR-006 (T017), FR-007 (T018), FR-008 (T002, T003, T005, T019), FR-009 (T019), FR-010 (T021), FR-011 (T022), FR-012 (T023), FR-013 (T024), FR-014 (T025), FR-015 (T013), FR-016 (T026), FR-017 (T003, T010), FR-018 (T027), FR-019 (T028), FR-020 (T012), FR-021 (T011), FR-022 (T009, T010), FR-023 (T031), FR-024 (held by `words.test.ts` in every phase), FR-025 (T030, T031), FR-026 (T032, T033). The success criteria: SC-001 and SC-004 (T033), SC-002 (T031), SC-003 (T008), SC-005 (`words.test.ts`).
