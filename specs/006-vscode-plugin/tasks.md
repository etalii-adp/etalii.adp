# Tasks: The ADP Plug-in for Visual Studio Code

**Input**: [vscode-plugin.spec.md](vscode-plugin.spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)

**Where**: paths are in `etalii.adp.ide.vscode` unless they start with `etalii.adp:`. Work there happens on `features/` branches and reaches `develop` by pull request with a merge commit, in the seven steps of the plan's Delivery section; "PR n" below names the step.

**Tests**: asked for in the specification (FR-042 to FR-047). A task that adds behaviour writes its test first and sees it fail.

**Format**: `[ID] [P?] [Story] Description`. `[P]` can run beside its neighbours; `[USn]` is the user story of the specification.

## Phase 1: Skeleton and pipeline (PR 1)

**Purpose**: the plug-in builds, tests at three levels, debugs in one step and is offered for download. Delivers US1 and US6 and the ground of US5.

- [ ] T001 Create `features/006-plugin-skeleton` from `develop`
- [ ] T002 [US1] `package.json` as [contracts/plugin-contributions.md](contracts/plugin-contributions.md) gives the identity, with scripts `build`, `watch`, `check`, `test`, `test:unit`, `test:vscode`, `package`; `package-lock.json`; `.vscodeignore`; `.gitignore` entries for `node_modules`, `dist`, `reports`, `.debug`, `.vscode-test`, `*.vsix`
- [ ] T003 Ratify `.specify/memory/constitution.md`, modelled on `etalii.adp.ide.intellij`'s: native citizenship, the text file is the source of truth, one frame and many tools, test-first against real files, simplicity (FR-060)
- [ ] T004 [P] `tsconfig.json` (strict), `esbuild.mjs` (extension bundle and one bundle per webview, source maps, watch), `eslint.config.mjs`
- [ ] T005 [US5] `vitest.config.ts` with projects `core` (node) and `webview` (jsdom), JUnit output to `reports/`, and one passing test in each under `test/core/` and `test/webview/`
- [ ] T006 [US5] `.vscode-test.mjs` and `test/vscode/identity.test.ts`: the packaged plug-in activates in a real Visual Studio Code and reports the name and identifier of FR-002
- [ ] T007 [US1] `src/extension/extension.ts`: an `activate` that registers the (still empty) list of diagram types
- [ ] T008 [P] [US5] `scripts/skipped-tests.mjs`: lists skipped tests and reasons from `reports/` to the job summary and the log (FR-046, FR-056)
- [ ] T009 [P] [US5] Vendor the standalone examples to `examples/gartner-hypecycle-graph/` and `examples/agent-behavior-modelling/`, the rule and line-ending fixtures and `scale-fixture.json` to `fixtures/`, unchanged, with `examples/PROVENANCE.md` naming repository, commit and licence; `scripts/sync-examples.mjs` refreshes them; `.gitattributes` keeps both folders byte for byte (`-text`) (FR-043, FR-044)
- [ ] T010 [US6] `.vscode/launch.json` ("Run ADP" with `debugWebviews`, "Debug core and webview tests", "Debug tests in Visual Studio Code"), `.vscode/tasks.json` (watch, type check, prepare examples), `.vscode/extensions.json`; `scripts/prepare-debug-examples.mjs` copies `examples/` to `.debug/examples` (FR-048 to FR-052)
- [ ] T011 [US1] `.github/workflows/build.yml`: fill in the `plugin` job as [contracts/build-workflow.md](contracts/build-workflow.md) gives it; teach `.github/scripts/check-files.py` to skip `node_modules`, `dist` and `.vscode-test`
- [ ] T012 [US1] `.github/workflows/build.yml`: the `development-build` job, adapted from IntelliJ's (FR-055, FR-057)
- [ ] T013 [P] [US1] [US6] `README.md`: what the plug-in brings, install from the Releases page and from a run, build, test, debug, package (FR-058)
- [ ] T014 [US1] Open PR 1; from its run download the `.vsix` and install it into a clean profile; after the merge, check the development build on the Releases page (quickstart, US1)

**Checkpoint**: an installable, empty plug-in; F5 opens a development window; three test levels run in CI.

## Phase 2: Shared core (PR 2)

**Purpose**: what both diagram types stand on. Blocks every later phase.

- [ ] T015 [P] Tests for `LineDocument` and splices in `test/core/text/`: CRLF, LF, mixed, no final newline, a splice at the first and last line, new lines taking the file's ending
- [ ] T016 `src/core/text/lineDocument.ts` and `splice.ts` (data-model: Text)
- [ ] T017 [P] `src/core/frame/`: the types of [data-model.md](data-model.md) and the `DiagramType` contract of [contracts/frame.md](contracts/frame.md)
- [ ] T018 [P] Tests for the registration in `test/core/registration/`: origin, body, reading a `layout:` block, splicing one entry, pruning, creating a registration, the standalone examples' `.adp` files read unchanged
- [ ] T019 `src/core/registration/registration.ts` (FBL section 8; FR-014)

## Phase 3: Hype cycle graph, core (PR 2) — US2, US5

**Goal**: every statement the definition makes about the `.ghg` document, its rules and its edits holds in `src/core/gartner-hypecycle-graph/`, with no Visual Studio Code involved.

**Independent test**: `npm run test:unit` round-trips the nine examples and every fixture and yields each fixture's rule.

- [ ] T020 [P] [US2] Round-trip test over every example and fixture: read, write nothing, compare bytes; the parser never throws on `not-yaml.ghg` and `malformed-entries.ghg`
- [ ] T021 [US2] `parser.ts`: header, `unit`, the four lists, key spellings, entries that cannot be read as findings with lines, a body that cannot be read at all as a read-only empty model (FR-011)
- [ ] T022 [P] [US2] `scale.ts` with a test against `fixtures/scale-fixture.json` read unchanged: month index, signed astronomical years, x per unit, rows, the three snapping rules, `formatWhen`
- [ ] T023 [P] [US2] `phases.ts` with tests: even spreading, stored boundaries, `boundariesOf`, proportional rescale, keeping every visible phase a month long, Gartner names
- [ ] T024 [US2] `writer.ts` with tests: line splices only, fixed key order per entry kind, tags as a flow sequence, empty tags and descriptions removing their key, a note's block scalar, `at` with two decimals, opening `triggers:` and `notes:` before `influences:`
- [ ] T025 [US2] `rules.ts` with a test per `rule-*.ghg` fixture and `rules-clean.ghg`: the twelve `ghg.*` rules as warnings with their lines and the definition's sentences (FR-020)
- [ ] T026 [US2] `edits.ts`, adding and naming: add trend, trigger and note from a drop (floor to the step, row from the middle, unique names, new ids), rename, with the refusals verbatim
- [ ] T027 [US2] `edits.ts`, placing and phases: placement, span, phase count, boundary, even phases, time unit, note size, with their refusals
- [ ] T028 [US2] `edits.ts`, influences and the rest: add influence with default ends, one per direction counted in the document, set attachment, tags, description, remove with the counted confirmation, remove influence
- [ ] T029 [US2] `arrangement.ts` with tests: rows only, as the definition states after T065; refuses when nothing changes (FR-021)
- [ ] T030 [US2] `mapper.ts` with tests: the view model for true-time and for compact (row-packed, causes left of effects), the tag filter hiding elements and their influences, hidden influences, culling to the viewport, chrome (ruler rungs by unit, tags in use, legend)
- [ ] T031 [US2] `toolbox.ts`, `forms.ts`, `actions.ts` with tests: entries, the forms' groups, fields and controls (slider stops, per-phase influence lists, attachment fields), context actions per element kind, nothing that edits when read-only; `index.ts` exports the `DiagramType`
- [ ] T032 [US2] Open PR 2

**Checkpoint**: the hype cycle graph's logic is complete and tested without a canvas.

## Phase 4: The frame (PR 3) — US4

**Goal**: any `DiagramType` opens in an editor of Visual Studio Code, is drawn, follows the text and reports findings.

**Independent test**: a `.ghg` opens in the diagram by default, read-only for now; the text editor beside it and the diagram follow each other.

- [ ] T033 [US4] `test/vscode/frame.test.ts` first: a `.ghg` opens in the custom editor by default; a text edit reaches the view; a finding reaches the Problems panel; "Open as Text" opens the same document (FR-012, FR-016, FR-033)
- [ ] T034 [US4] `src/extension/diagramEditor.ts`: the custom text editor shared by every diagram type; reads on every document change; applies an outcome's splices as one workspace edit; answers a stale request `cancelled`; under `ADP_TEST` registers the two test commands of [contracts/frame.md](contracts/frame.md)
- [ ] T035 [P] [US4] `src/extension/findings.ts`: the "ADP" diagnostic collection (research R7)
- [ ] T036 [P] [US4] `src/webview/protocol.ts` and `src/extension/webviewHtml.ts`: the versioned messages, the content security policy with a nonce
- [ ] T037 [US4] `src/webview/canvas/surface.ts` with tests: SVG surface, pan and zoom, viewport reporting, drawing only what is in view
- [ ] T038 [US4] `src/webview/canvas/theme.css`: the definitions' theme tokens for light, dark, high contrast and high contrast light, switched by the body's theme class (FR-036)
- [ ] T039 [US4] `src/webview/canvas/selection.ts` with tests: one and several, rubber band, keyboard, selection sent to the extension
- [ ] T040 [US2] `src/webview/gartner-hypecycle-graph/notation.ts` with tests: the phased banner and its chevrons, trigger, note with wrapping and ellipsis, the cubic influence meeting the edge at a right angle, tooltips per phase (FR-017)
- [ ] T041 [US2] `src/webview/canvas/chrome.ts` with tests: the ruler pinned to the bottom with rungs by spacing, the legend
- [ ] T042 [US4] `src/extension/commands.ts` and the manifest: "Open as Text", a read-only file offering nothing that edits (FR-037)
- [ ] T043 [US4] Open PR 3

**Checkpoint**: the nine examples can be looked at in Visual Studio Code and compared with the standalone screenshots.

## Phase 5: Hype cycle graph, editing (PR 4) — US2, US4

**Goal**: every edit of FR-018 and the chrome of FR-019, from the canvas, the toolbox and ADP Properties.

**Independent test**: quickstart, US2, steps 1 to 6.

- [ ] T044 [US2] `test/vscode/gartner-hypecycle-graph.test.ts` first: an edit from the canvas and one from the property grid, undo and redo, save, byte-identical after open and save (FR-045)
- [ ] T045 [US4] `src/webview/canvas/gestures.ts` with tests: move and resize with a preview, connect, handles on a selection, a gesture abandoned when a newer view arrives
- [ ] T046 [US4] `src/webview/canvas/inlineEditor.ts` with tests: in-place text, single and multi-line, opened by F2, double-click and after a drop
- [ ] T047 [US4] `src/webview/toolbox/toolbox.ts` with tests: entries with icons and descriptions, drag onto the canvas, Enter adds at the centre of the view, collapsed state (FR-039)
- [ ] T048 [US4] `src/extension/propertiesView.ts` and `src/webview/properties/` with tests: the seven controls, groups, conditional fields, a refused edit shown at its field, following the focused diagram and saying so when none has the focus (FR-040, FR-041)
- [ ] T049 [US2] Hype cycle gestures in `src/webview/gartner-hypecycle-graph/gestures.ts` with tests: boundary handles, an influence's ends sliding along an edge, attachment while connecting, a trigger's three invisible handles, note resize as one request
- [ ] T050 [US2] The tag filter with chips, suggestions and Any/All, and the Compact switch, in `src/webview/canvas/chrome.ts` with tests; neither is saved (FR-019)
- [ ] T051 [US4] Context menu on the canvas, the commands and their shortcuts in the manifest, confirmations with the platform's dialog, refusals shown on the canvas (FR-034, FR-035)
- [ ] T052 [US2] "Arrange Diagram" and "New Gartner Hype Cycle Graph" (FR-015, FR-021)
- [ ] T053 [US2] Open PR 4; walk quickstart US2 and record differences in `docs/parity.md`

**Checkpoint**: the first diagram type is complete.

## Phase 6: Agent Behavior Modelling, core (PR 5) — US3, US5

**Goal**: the definition's statements about the Markdown, the registration, layout, rules and edits hold in `src/core/agent-behavior-modelling/`.

**Independent test**: `npm run test:unit` round-trips the four examples and applies every edit the definition's Interaction section lists.

- [ ] T054 [P] [US3] Round-trip test over the four examples and hand-written edge files: two Behavior headings, a tree in a fenced block, tabs, the three list markers, an item without a keyword, a file without a tree
- [ ] T055 [US3] `parser.ts`: where the tree is, nodes, children, notes, the eleven keywords, Retry's count, ids as places (FR-022)
- [ ] T056 [US3] `writer.ts` and `edits.ts` with tests: add under the nearest node above with room, rename, kind with its refusal, attempts, notes, move earlier and later, re-parent with its refusals, delete with the subtree, adding to a file without a tree, the new document's text
- [ ] T057 [US3] `layout.ts` and `arrangement.ts` with tests: the computed tidy tree (200 by 60, 28 and 56), rows at stored heights and never closer than 16, a drag that reorders past a sibling's middle and moves a row, renaming stored ids with reordered nodes, "Arrange diagram" pruning the registration with both refusals (FR-023, FR-026)
- [ ] T058 [US3] `test/vscode/two-file-undo.test.ts`: a workspace edit over a Markdown file and its registration is undone as one step, and saving the Markdown saves the registration (research R2); done first in PR 6, since the frame's handling of `registration` splices depends on its result
- [ ] T059 [US3] `rules.ts` with tests: the seven `abm.*` rules with their severities and lines (FR-025)
- [ ] T060 [US3] `mapper.ts`, `toolbox.ts`, `forms.ts`, `actions.ts`, `index.ts` with tests: the view model with keyword and family, the dashed implicit Do, Kind, Attempts, Notes and Place fields, context actions
- [ ] T061 [US3] Open PR 5

## Phase 7: Agent Behavior Modelling in the frame (PR 6) — US3

**Goal**: a Markdown file opened as a behavior model, with every gesture of FR-024.

**Independent test**: quickstart, US3.

- [ ] T062 [US3] `test/vscode/agent-behavior-modelling.test.ts` first: Markdown opens as text by default; the command opens it as a model; an edit, undo, save; a registration opens its body; a drag is kept across close and open (FR-013, FR-014, FR-045)
- [ ] T063 [US3] Register the type as an option for `*.md`; "Open as Agent Behavior Model" on the Explorer context menu behind a context key for Markdown with a Behavior heading; `src/extension/registrationEditor.ts` for `*.adp`
- [ ] T064 [US3] Registration splices in `diagramEditor.ts`: the registration opened in the background, created when first needed, saved with the Markdown
- [ ] T065 [US7] `etalii.adp:definitions/diagrams/gartner-hype-cycle-graph.dis` and `.md`: state "Arrange diagram" from standalone `develop`, re-read the companion against that commit and name it (FR-027); may be done any time before T029
- [ ] T066 [US7] `etalii.adp:definitions/diagrams/agent-behavior-modelling.dis` and `.md`: state "Arrange diagram" (FR-027)
- [ ] T067 [US7] `etalii.adp:` run `python .github/scripts/validate-examples.py`, open the definitions pull request (FR-028)
- [ ] T068 [US3] `src/webview/agent-behavior-modelling/notation.ts` with tests: superellipse, hexagon, pill, box, parallelogram and diode, family colours, keyword above label, the orthogonal parent line with its arrow
- [ ] T069 [US3] `src/webview/agent-behavior-modelling/gestures.ts` with tests: a drag carrying the subtree with siblings stepping aside, the row following, the right-button drag that re-parents and never offers a leaf, itself or a descendant
- [ ] T070 [US3] "Arrange Diagram" and "New Agent Behavior Model" for this type; Alt+Up and Alt+Down
- [ ] T071 [US3] Open PR 6; walk quickstart US3 and record differences in `docs/parity.md`

**Checkpoint**: both diagram types are complete.

## Phase 8: Catalogue, parity and polish (PR 7) — US7

- [ ] T072 [P] [US7] `docs/tools.md` in the catalogue format of the other hosts, a row per diagram type with its state here (FR-059)
- [ ] T073 [P] [US7] `docs/parity.md`: a section per diagram type, every difference from the definition with its reason (FR-007)
- [ ] T074 [US7] `etalii.adp:` both companions name `etalii.adp.ide.vscode` as a host that implements the type (FR-029)
- [ ] T075 [P] A document of several hundred trends and one of several hundred items stay usable; time the 13 examples against SC-005
- [ ] T076 Walk [quickstart.md](quickstart.md) from a fresh clone and a downloaded development build; check SC-001 to SC-011; final `README.md`
- [ ] T077 Open PR 7

## Dependencies

- Phase 1 before everything. Phase 2 before phases 3 and 6.
- Phase 3 before phases 4 and 5 (the frame is built against a real diagram type). Phase 4 before phase 5.
- Phase 6 needs only phase 2 and can run beside phases 4 and 5. Phase 7 needs phases 5 and 6.
- T065 before T029; T066 before T057's arrangement part. T067 after both.
- Phase 8 last.

## Parallel work

Within a phase, tasks marked `[P]` touch different files. Across phases, a second developer can take phase 6 while the first takes phases 4 and 5, and the definitions (T065 to T067) can go at any time.

## MVP

Phases 1 to 4: a downloadable plug-in that draws every hype cycle example from its file, follows the text and reports findings. Phase 5 makes it a tool; phases 6 and 7 add the second.
