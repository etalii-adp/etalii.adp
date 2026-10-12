# Tasks: The Tools on DISL and FBL in Visual Studio Code

**Input**: [plan.md](plan.md), [vscode-disl-fbl-tools.spec.md](vscode-disl-fbl-tools.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/tool-type.md](contracts/tool-type.md), [contracts/definitions.md](contracts/definitions.md), [contracts/support-record.md](contracts/support-record.md)

**Tests**: requested. FR-016 requires every test to be written before the behaviour it covers and seen to fail first, so every phase lists its tests before its code. A test task is done when its file is committed, in a commit whose message names the tests as failing, and the failure was seen.

**Organization**: by user story, in the six pull requests of the plan. Two phases are foundational: the FBL library at 0.6 (pull request 1) and reading a tool type from its definition (the first half of pull request 2).

## Format: `- [ ] **T###** [P?] [US#] Description · path`

- **[P]**: independent of the other tasks in its wave (different files, no dependency on an unfinished task)
- **[US#]**: the user story of the specification a task serves (US1 to US4)

## Path conventions

- Every path starts with its repository. The clones sit side by side (`C:\git\<repository>` locally, `/home/user/<repository>` in a cloud session).
- All code lands in `etalii.adp.ide.vscode`, on the branch `features/027-vscode-disl-fbl-tools`, in the worktree `etalii.adp.ide.vscode/.claude/worktrees/027-vscode-disl-fbl-tools`. The branch is cut from `origin/develop` again for each pull request, after the one before it is merged and its branch deleted.
- **The sources** are read with `git -C ../<repository> show <commit>:<path>`, never from a working tree: `etalii.adp.ide.standalone` at `5756a07`, `etalii.adp.ide.notion` at `4a0cdb4`, and `etalii.adp` at the merge commit of T003 or later (the five definitions are unchanged since `73ec4a7`).
- **The referee** is the definition, DISL, DESL and FBL in `etalii.adp`. Where a source and a definition disagree, the definition decides and the difference becomes an issue in `etalii.adp` and a row of `etalii.adp.ide.vscode/docs/disl-support.md` (FR-018).
- Nothing under `etalii.adp.ide.vscode/src/core/disl/`, `desl/`, `scene/` or `tool/` names a tool type, and nothing under `src/core/` imports `vscode` or the DOM ([contracts/tool-type.md](contracts/tool-type.md), "The layer rule").

> **Ticking**: a task whose code lands in `etalii.adp.ide.vscode` is ticked here only after its pull request is merged, never when the code is written or pushed. The tasks of `etalii.adp` itself are ticked when done.

> **Shared files**: the stories are delivered one after another, each merged before the next starts, so no two story phases are ever in work at once. Each story phase opens with `Files:`, the files it creates and owns, and `Extends:`, the files of Phase 3 it adds to. A file under `Extends:` is the reason the story phases cannot be handed to parallel workers.

---

## Phase 1: Setup

**Purpose**: the specification reaches `develop`, and what planning found is raised before any code meets it.

**Wave 1: independent (different files):**

- [x] **T001** [P] Correct User Story 2: its opening paragraph and its third scenario say the registration keeps dragged positions; the definition keeps them in the file's `view` mapping (research R10, R14 item 6) · etalii.adp/specs/027-vscode-disl-fbl-tools/vscode-disl-fbl-tools.spec.md
- [x] **T002** [P] File one issue in `etalii-adp/etalii.adp` for each of research R14 items 1, 2, 3, 4, 5 and 7, each naming this folder, and note the six numbers for T059 · etalii.adp (issues)

**⟶ Wait for Wave 1 to finish, then:**

- [ ] **T003** Commit this folder on `features/027-vscode-disl-fbl-tools`, push it and open a pull request into `develop`, merged with a merge commit · etalii.adp/specs/027-vscode-disl-fbl-tools/

**Checkpoint**: the specification is on `develop`; six issues are open.

---

## Phase 2: Foundational, the FBL library at FBL 0.6 (pull request 1)

**Purpose**: research R1. Standalone's library between `25fc7b4a` and `5756a07` is the worked example (43 files), FBL is the referee, and etalii.adp's nineteen fixture folders are the proof. Nothing a user sees changes. Standalone moved `Expressions/Cel.cs` and `RegexSubset.cs` out of its library in that range; the plug-in's `expressions/` stays as it is.

Files: `etalii.adp.ide.vscode/src/core/fbl/**`, `fixtures/fbl/**`, `test/core/fbl/**`, `docs/fbl.md`.

### Tests (first, seen failing)

- [x] **T004** Create the worktree and branch from `origin/develop`; run `npm ci` and `npm test` and confirm they pass before anything changes · etalii.adp.ide.vscode/.claude/worktrees/027-vscode-disl-fbl-tools
- [x] **T005** Run `npm run sync-fbl -- ../etalii.adp ../etalii.adp.ide.standalone <etalii.adp commit> 5756a07`, raise the recorded minimums to the new counts, and commit the copies. See `conformanceFixtures.test.ts` fail on the eleven new fixture folders · etalii.adp.ide.vscode/fixtures/fbl/, etalii.adp.ide.vscode/test/core/fbl/realFiles/minimums.json

**⟶ Wait for T005 to finish, then:**

- [x] **T006** Add to the baseline every test standalone's `EtAlii.Adp.Specification.Fbl.Tests` gained between `25fc7b4a` and `5756a07`, each with its counterpart's file and title or the reason it is not applicable. `baseline.test.ts` fails for want of counterparts · etalii.adp.ide.vscode/test/core/fbl/baseline.json

**⟶ Wait for T006 to finish, then Wave 2: independent (different files):**

- [x] **T007** [P] Counterparts for loading: `fbl` 0.1 to 0.6 load without a warning and 0.7 warns; a document holds one binding per format family (0.3) · etalii.adp.ide.vscode/test/core/fbl/loading.test.ts
- [x] **T008** [P] Counterparts for routing: a file goes to the binding of its document that claims it, and to none when none does · etalii.adp.ide.vscode/test/core/fbl/routing.test.ts
- [x] **T009** [P] Counterparts for plugins: a persistence plugin plans a `move` and an `add` with a position (0.2, section 11.2) · etalii.adp.ide.vscode/test/core/fbl/pluginBody.test.ts, etalii.adp.ide.vscode/test/core/fbl/support/testPlugin.ts
- [x] **T010** [P] Counterparts for planning: `move`, a positioned `add`, `by: "id"`, nested mappings created and removed with their entries (`at: "end"`, `child`, `remove-empty-levels`), and an empty value on an insert (0.6) · etalii.adp.ide.vscode/test/core/fbl/generic.test.ts
- [x] **T011** [P] Counterparts for reading: what a slot reads from a scalar (0.5) · etalii.adp.ide.vscode/test/core/fbl/reading.test.ts, etalii.adp.ide.vscode/test/core/fbl/yamlScalars.test.ts
- [x] **T012** [P] Counterparts for the registration and for history, where T006 lists any · etalii.adp.ide.vscode/test/core/fbl/registration.test.ts, etalii.adp.ide.vscode/test/core/fbl/history.test.ts

### Implementation

**Wave 3: independent (different files):**

- [ ] **T013** [P] Port `Documents/` and `FblModel.cs`: versions 0.1 to 0.6, several bindings in one document, the new model types and the new finding · etalii.adp.ide.vscode/src/core/fbl/documents/documentLoader.ts, documents/types.ts, model.ts, finding.ts
- [ ] **T014** [P] Port `Planning/_Model/ModelChange.cs` and `Plan.cs`: `move {id, parent, position?}` and a position on `add` · etalii.adp.ide.vscode/src/core/fbl/planning/modelChange.ts, planning/plan.ts
- [ ] **T015** [P] Add every sentence the range added to the source, verbatim · etalii.adp.ide.vscode/src/core/fbl/messages.ts

**⟶ Wait for Wave 3 to finish, then Wave 4: independent (different files):**

- [ ] **T016** [P] Port `Rules/`: `BodyReading`, `FamilyReader`, `TreeFamily` and the new `TypedValue` · etalii.adp.ide.vscode/src/core/fbl/rules/bodyReading.ts, rules/familyReader.ts, rules/treeFamily.ts, rules/typedValue.ts
- [ ] **T017** [P] Port `Plugins/`: the plan and read requests a plugin is given · etalii.adp.ide.vscode/src/core/fbl/plugins/persistencePlugin.ts, plugins/pluginBody.ts
- [ ] **T018** [P] Port `Routing/Router.cs` and `Registration/` · etalii.adp.ide.vscode/src/core/fbl/routing/router.ts, registration/bodyLocator.ts, registration/openRegistration.ts, registration/registrationDocument.ts

**⟶ Wait for Wave 4 to finish, then Wave 5: independent (different files):**

- [ ] **T019** [P] Port `Files/Yaml/` · etalii.adp.ide.vscode/src/core/fbl/families/yaml/yamlFamily.ts, yamlParser.ts, yamlScalars.ts, flowReader.ts
- [ ] **T020** [P] Port `Files/Json/` · etalii.adp.ide.vscode/src/core/fbl/families/json/jsonFamily.ts
- [ ] **T021** [P] Port `Files/Xml/` and `Files/Lines/` · etalii.adp.ide.vscode/src/core/fbl/families/xml/xmlFamily.ts, families/lines/linesFamily.ts

**⟶ Wait for Wave 5 to finish, then:**

- [ ] **T022** Port `Planning/EditPlanner.cs`, `NewText.cs` and `History/OpenBody.cs` · etalii.adp.ide.vscode/src/core/fbl/planning/editPlanner.ts, planning/newText.ts, history/openBody.ts
- [ ] **T023** Export what is new, and bring the record up to date: the version read, what "not built" no longer lists, each difference from standalone found · etalii.adp.ide.vscode/src/core/fbl/index.ts, etalii.adp.ide.vscode/docs/fbl.md
- [ ] **T024** Run `npm test`: the nineteen fixtures pass splice for splice, the baseline is complete, and every test under `test/vscode/` passes untouched · etalii.adp.ide.vscode
- [ ] **T025** Push, open pull request 1 naming this folder and the etalii.adp commit, and merge it with a merge commit once the Build passes. Open an issue in `etalii.adp.ide.notion` saying its copy of the library is behind. Delete the branch, then tick T004 to T025 here through a pull request · etalii.adp.ide.vscode (pull request 1), etalii.adp/specs/027-vscode-disl-fbl-tools/tasks.md

**Checkpoint**: the library reads and plans FBL 0.6; no user-visible change.

---

## Phase 3: Foundational, a tool type read from its definition (pull request 2, first half)

**Purpose**: research R2 to R8. The copied definitions and their check, the interpreter, the scene, the generic contract, the plugin registry, opening by claim and the support record. The hype cycle graph's definition is the proof here, because the interpreter already reads all of it; its hand-coded type keeps serving users until Phase 7.

Files: `etalii.adp.ide.vscode/definitions/gartner-hype-cycle-graph/`, `definitions/agent-behavior-modelling/`, `scripts/sync-definitions.mjs`, `scripts/sync-examples.mjs`, `src/core/disl/`, `src/core/scene/`, `src/core/tool/` (except `tableView.ts`), `src/core/plugins/index.ts`, `src/core/frame/`, `src/extension/toolTypes.ts`, `opening.ts`, `toolEditor.ts`, `suggestions.ts`, `commands.ts`, `extension.ts`, `src/webview/diagram/`, `docs/disl-support.md`, `package.json`, `.gitattributes`, `.vscodeignore`, `eslint.config.mjs`, `.github/workflows/build.yml`, and the tests named below.

### Tests (first, seen failing)

- [ ] **T026** Cut the branch again from `origin/develop`, and add `@marcbachmann/cel-js` 8 · etalii.adp.ide.vscode/package.json, etalii.adp.ide.vscode/package-lock.json

**⟶ Wait for T026 to finish, then Wave 1: independent (different files):**

- [ ] **T027** [P] The sync command against two temporary git repositories: copies are the git objects' bytes; `PROVENANCE.md` has its five columns; `--add` and a deleted folder; a relative binding, a URL binding and the by-name fallback; the manifest's contributions in folder order; `--check` fails on a changed byte, a file without a row, a row without a file and a contribution that differs · etalii.adp.ide.vscode/test/scripts/syncDefinitions.test.ts
- [ ] **T028** [P] Take Notion's `test/disl/` (16 files), reading the definition from `definitions/gartner-hype-cycle-graph/` · etalii.adp.ide.vscode/test/core/disl/
- [ ] **T029** [P] Take Notion's `test/canvas/scene.test.ts`, `scene.examples.test.ts`, `geometry.test.ts` and `snapping.test.ts` with the nine examples' recorded places · etalii.adp.ide.vscode/test/core/scene/
- [ ] **T030** [P] The contract: rename `diagramType.test.ts` and add `Claim`, `viewTypeOf`, an `applied` outcome that carries splices, the `open` outcome, and the requests for reparenting, folding, pinning and opening a link · etalii.adp.ide.vscode/test/core/frame/toolType.test.ts
- [ ] **T031** [P] Claims: the three claim kinds of the data model; a file is claimed by extension and marker both; two bindings on one extension; `suggests` from `claims.suggest` · etalii.adp.ide.vscode/test/core/tool/claims.test.ts
- [ ] **T032** [P] The plugin registry: a required plugin that is missing gives read-only documents with `std.pluginMissing` naming it; an optional one falls back · etalii.adp.ide.vscode/test/core/tool/pluginRegistry.test.ts
- [ ] **T033** [P] `toolTypeFrom` on the hype cycle graph's definition: each of the nine examples opens to a scene with its recorded places; no edit leaves the text untouched; an edit is splices and nothing outside them; a refusal carries the definition's sentence; an unreadable body is empty, read-only and refuses; an unsupported feature gives `disl.unsupported-feature`; a folder missing a part, or a definition not on FBL, is no tool type; removing a folder removes the type · etalii.adp.ide.vscode/test/core/tool/toolTypeFrom.test.ts
- [ ] **T034** [P] Byte offsets to positions: multi-byte text, CRLF, several splices of one gesture, a body with and without a final newline · etalii.adp.ide.vscode/test/core/tool/spliceRanges.test.ts
- [ ] **T035** [P] Nothing names a tool type: read `src/core/disl/`, `desl/`, `scene/` and `tool/` for every type, attribute and message id of the copied definitions, as Notion's `test/words.test.ts` does · etalii.adp.ide.vscode/test/core/tool/words.test.ts
- [ ] **T036** [P] The support record: `supportedFeatures` and the features table, the registry and the plugins table, the folders of `definitions/` and the subsections of differences, each read both ways · etalii.adp.ide.vscode/test/core/tool/supportRecord.test.ts
- [ ] **T037** [P] The scene renderer: shapes, parts, labels, markers and edges anchored on parts; `light` for the light kinds and `dark` for the dark ones; contrast border and foreground in both high contrast kinds; the editor's colour for a token without a mode · etalii.adp.ide.vscode/test/webview/diagram/scene.test.ts
- [ ] **T038** [P] In a real Visual Studio Code: the package ships `definitions/`; a Markdown, YAML, JSON and XML file nothing claims opens as text as before; "Open as Text" opens the text editor for a file in a tool · etalii.adp.ide.vscode/test/vscode/opening.test.ts

### Implementation

**Wave 2: independent (different files):**

- [ ] **T039** [P] Mark `definitions/** -text` and `definitions/**/PROVENANCE.md text` · etalii.adp.ide.vscode/.gitattributes
- [ ] **T040** [P] Write the sync command as [contracts/definitions.md](contracts/definitions.md) states it, on the shape of `sync-fbl.mjs` · etalii.adp.ide.vscode/scripts/sync-definitions.mjs
- [ ] **T041** [P] Extend the examples command and copy what the three new tool types' standalone modules publish, with `specifications/desl/minimal-table.des` and its binding from etalii.adp: the `.mm` examples, `Fixtures/architecture.mm` and `Parity/mindmap.transcript.json`; the three `.aad` examples with their places and `Fixtures/**/*.aad`; the four Knowledge examples · etalii.adp.ide.vscode/scripts/sync-examples.mjs, etalii.adp.ide.vscode/examples/, etalii.adp.ide.vscode/fixtures/tools/
- [ ] **T042** [P] Take Notion's `src/disl/` (14 files) and record where it came from · etalii.adp.ide.vscode/src/core/disl/, etalii.adp.ide.vscode/src/core/disl/ORIGIN.md
- [ ] **T043** [P] Take Notion's `src/canvas/scene.ts`, `geometry.ts` and `snapping.ts` · etalii.adp.ide.vscode/src/core/scene/
- [ ] **T044** [P] Rename `diagramType.ts` and make the contract generic as [contracts/tool-type.md](contracts/tool-type.md) declares it, keeping `DiagramType` as `ToolType<ViewModel, EditRequest>`; `protocolVersion` and every `v` become `2` · etalii.adp.ide.vscode/src/core/frame/toolType.ts, etalii.adp.ide.vscode/src/core/frame/protocol.ts
- [ ] **T045** [P] Hold the layer rule in lint: what `src/core/`, `src/extension/` and `src/webview/` may import · etalii.adp.ide.vscode/eslint.config.mjs

**⟶ Wait for Wave 2 to finish, then Wave 3: independent (different files):**

- [ ] **T046** [P] Add the `sync-definitions` script, run it with `--add` for the hype cycle graph and Agent Behavior Modelling, and commit the two folders and the contributions it writes. A contribution that differs from the hand-written one is reviewed, not reverted · etalii.adp.ide.vscode/definitions/gartner-hype-cycle-graph/, etalii.adp.ide.vscode/definitions/agent-behavior-modelling/, etalii.adp.ide.vscode/package.json
- [ ] **T047** [P] Read one folder as a definition with its bindings: the specification, its companion, and each binding reference resolved to the copied file of that name · etalii.adp.ide.vscode/src/core/tool/definitionFolder.ts
- [ ] **T048** [P] Claims from a binding, `claimed` and `suggests` · etalii.adp.ide.vscode/src/core/tool/claims.ts
- [ ] **T049** [P] The registry with its `LayoutPlugin` and `ActionPlugin` interfaces, and the one place plugins are registered, empty for now · etalii.adp.ide.vscode/src/core/tool/pluginRegistry.ts, etalii.adp.ide.vscode/src/core/plugins/index.ts
- [ ] **T050** [P] Splices as ranges of the text, with the library's `utf8.ts` · etalii.adp.ide.vscode/src/core/tool/spliceRanges.ts
- [ ] **T051** [P] Draw a scene, with the colour rule of research R13 · etalii.adp.ide.vscode/src/webview/diagram/scene.ts

**⟶ Wait for Wave 3 to finish, then:**

- [ ] **T052** `toolTypeFrom` for a diagram: view, findings, toolbox, fields, actions, `edit` as one model change planned into splices, the four states of an open document, and `newDocument` from the binding's template · etalii.adp.ide.vscode/src/core/tool/toolTypeFrom.ts

**⟶ Wait for T052 to finish, then Wave 4: independent (different files):**

- [ ] **T053** [P] Rename `diagramTypes.ts`: the tool types are the folders of `definitions/` that load, read from the install folder at start. `// simplified:` a hand-coded type wins for its origin until Phase 7 removes it · etalii.adp.ide.vscode/src/extension/toolTypes.ts
- [ ] **T054** [P] Opening by claim: an unclaimed file of a default extension is handed back to the text editor with nothing reported; "Open as Text" holds for the session; the Explorer entry is fed from `claims.suggest` · etalii.adp.ide.vscode/src/extension/opening.ts, etalii.adp.ide.vscode/src/extension/suggestions.ts
- [ ] **T055** [P] Rename `diagramEditor.ts`: an `applied` outcome is one `WorkspaceEdit` with the operation's name as its label; a registration change goes through the layout history; `open` is `vscode.open`; nothing that edits is offered for a read-only or unreadable document · etalii.adp.ide.vscode/src/extension/toolEditor.ts
- [ ] **T056** [P] Read the `view` message of version 2 and draw a `Scene` with `scene.ts`, a `ViewModel` as before · etalii.adp.ide.vscode/src/webview/diagram/main.ts, etalii.adp.ide.vscode/src/webview/diagram/canvas.ts
- [ ] **T057** [P] Ship `definitions/` in the package · etalii.adp.ide.vscode/.vscodeignore, etalii.adp.ide.vscode/scripts/package.mjs
- [ ] **T058** [P] Run `npm run sync-definitions -- --check` on every pull request · etalii.adp.ide.vscode/.github/workflows/build.yml
- [ ] **T059** [P] Write the support record with the sections of [contracts/support-record.md](contracts/support-record.md), the six issues of T002 in its last section, and the mixed line endings row now covering every tool type · etalii.adp.ide.vscode/docs/disl-support.md, etalii.adp.ide.vscode/docs/parity.md

**⟶ Wait for Wave 4 to finish, then:**

- [ ] **T060** Wire it: the custom editors and the `new`, `openAs` and `openAsText` commands come from the tool types · etalii.adp.ide.vscode/src/extension/extension.ts, etalii.adp.ide.vscode/src/extension/commands.ts
- [ ] **T061** Run `npm test` and `npm run sync-definitions -- --check`; every test of specs 006 and 009 still passes · etalii.adp.ide.vscode

**Checkpoint**: the plug-in reads a tool type from a folder of `definitions/`; users see the two diagrams as before.

---

## Phase 4: User Story 1, work on a mind map (P1, pull request 2 completes)

**Goal**: a `.mm` file opens in the mind map drawn from its definition, and every edit is splices of the file and one undo step.

**Independent Test**: open each standalone example, compare with the definition, perform every gesture of the transcript, and check the file after each.

Files: `etalii.adp.ide.vscode/definitions/mindmap/`, `src/core/plugins/freeplane-mm/`, `src/core/plugins/mindmap-layout/`, `src/extension/projectLinkPicker.ts`, `test/core/plugins/freeplane-mm/`, `test/core/plugins/mindmap-layout/`, `test/core/disl/definitions/mindmap.test.ts`, `test/core/tool/mindmap.test.ts`, `test/vscode/mindmap.test.ts`.

Extends: `src/core/disl/{notation,behavior,persistence,metamodel,expressions,layout,support}.ts`, `src/core/scene/scene.ts`, `src/core/tool/toolTypeFrom.ts`, `src/core/plugins/index.ts`, `src/webview/diagram/{scene,canvas}.ts`, `package.json`, `docs/disl-support.md`, `docs/tools.md`.

### Tests (first, seen failing)

- [ ] **T062** [US1] Run the sync command with `--add definitions/diagrams/mindmap.dis` and commit the folder and its contributions · etalii.adp.ide.vscode/definitions/mindmap/, etalii.adp.ide.vscode/package.json

**⟶ Wait for T062 to finish, then Wave 1: independent (different files):**

- [ ] **T063** [P] [US1] The definition reads with no `disl.unsupported-*` finding, and each of `autoSize: "fitContent"`, `clipboard`, the `view` action, `persistence.view` for `collapsed`, the id `prefix`, `descendants()` and a layout named as a plugin is read as written · etalii.adp.ide.vscode/test/core/disl/definitions/mindmap.test.ts
- [ ] **T064** [P] [US1] The plugin reads as standalone's does: the cases of `MindmapFreeplanePlugin.Tests.cs` and `MindmapDocument.Tests.cs`, and a body that is no map · etalii.adp.ide.vscode/test/core/plugins/freeplane-mm/reading.test.ts
- [ ] **T065** [P] [US1] The plugin plans: the cases of `Commands.Tests.cs` as splices, for `add` with a position, `set` of text, notes and link, `remove` and `move`; each changes only its splices and its inverse restores the bytes · etalii.adp.ide.vscode/test/core/plugins/freeplane-mm/planning.test.ts
- [ ] **T066** [P] [US1] The layout: the cases of `MindmapLayout.Tests.cs` and the placed nodes of the transcript · etalii.adp.ide.vscode/test/core/plugins/mindmap-layout/layout.test.ts
- [ ] **T067** [P] [US1] The tool type against the transcript for `architecture.mm`: its toolbox, menus and property rows, its 41 edits and the undo of each; every example opens and saves byte-identical · etalii.adp.ide.vscode/test/core/tool/mindmap.test.ts
- [ ] **T068** [P] [US1] In a real Visual Studio Code: a `.mm` file opens in the mind map with the text editor available; one gesture is one undo step; save; findings in Problems. Scenario 5 is skipped with issue 1 of T002 as its reason · etalii.adp.ide.vscode/test/vscode/mindmap.test.ts

### Implementation

**Wave 2: independent (different files):**

- [ ] **T069** [P] [US1] `autoSize: "fitContent"` · etalii.adp.ide.vscode/src/core/disl/notation.ts
- [ ] **T070** [P] [US1] `clipboard` and the `view` action · etalii.adp.ide.vscode/src/core/disl/behavior.ts
- [ ] **T071** [P] [US1] `persistence.view` for viewer state · etalii.adp.ide.vscode/src/core/disl/persistence.ts
- [ ] **T072** [P] [US1] The id `prefix` and `descendants()` · etalii.adp.ide.vscode/src/core/disl/metamodel.ts, etalii.adp.ide.vscode/src/core/disl/expressions.ts
- [ ] **T073** [P] [US1] A layout named as a plugin · etalii.adp.ide.vscode/src/core/disl/layout.ts
- [ ] **T074** [P] [US1] The reader, with standalone's `MindmapFreeplanePlugin` and `MindmapDocument` as the worked example · etalii.adp.ide.vscode/src/core/plugins/freeplane-mm/reader.ts
- [ ] **T075** [P] [US1] The layout, ported from standalone's `MindmapLayout` · etalii.adp.ide.vscode/src/core/plugins/mindmap-layout/layout.ts
- [ ] **T076** [P] [US1] The link picker: the platform's file and folder dialog, storing the path relative to the document · etalii.adp.ide.vscode/src/extension/projectLinkPicker.ts

**⟶ Wait for Wave 2 to finish, then Wave 3: independent (different files):**

- [ ] **T077** [P] [US1] The planner, with standalone's `FreeplaneXmlWriter` as the worked example, and the plugin's entry · etalii.adp.ide.vscode/src/core/plugins/freeplane-mm/planner.ts, etalii.adp.ide.vscode/src/core/plugins/freeplane-mm/index.ts
- [ ] **T078** [P] [US1] Folded nodes and content-sized nodes in the scene · etalii.adp.ide.vscode/src/core/scene/scene.ts
- [ ] **T079** [P] [US1] Draw a fold, and the gestures for folding, reparenting by drag and the clipboard · etalii.adp.ide.vscode/src/webview/diagram/scene.ts, etalii.adp.ide.vscode/src/webview/diagram/canvas.ts
- [ ] **T080** [P] [US1] Add the seven constructs and three plugins to the support record, and the mind map's row to the tool list · etalii.adp.ide.vscode/src/core/disl/support.ts, etalii.adp.ide.vscode/docs/disl-support.md, etalii.adp.ide.vscode/docs/tools.md

**⟶ Wait for Wave 3 to finish, then:**

- [ ] **T081** [US1] Register the three plugins, and map reparenting, folding and opening a link to model changes · etalii.adp.ide.vscode/src/core/plugins/index.ts, etalii.adp.ide.vscode/src/core/tool/toolTypeFrom.ts
- [ ] **T082** [US1] Run `npm test`; the skipped scenario is in the skipped-tests report with its reason · etalii.adp.ide.vscode
- [ ] **T083** [US1] Push, open pull request 2 naming this folder and the etalii.adp commit, merge it once the Build passes, delete the branch, then tick T026 to T083 here through a pull request · etalii.adp.ide.vscode (pull request 2), etalii.adp/specs/027-vscode-disl-fbl-tools/tasks.md

**Checkpoint**: the mind map works in Visual Studio Code from its definition, and is testable alone.

---

## Phase 5: User Story 2, work on an agent activity diagram (P1, pull request 3)

**Goal**: an `.aad` file opens in the agent activity diagram, with the states, lanes, findings and kept positions its DISL 0.4 definition states.

**Independent Test**: open each of the three examples, compare with the definition, and perform every gesture its behaviour lists, checking the file after each.

Files: `etalii.adp.ide.vscode/definitions/agent-activity-diagram/`, `src/core/disl/forceLayout.ts`, `test/core/disl/forceLayout.test.ts`, `test/core/disl/definitions/agentActivityDiagram.test.ts`, `test/core/tool/agentActivityDiagram.test.ts`, `test/webview/diagram/compartments.test.ts`, `test/vscode/agent-activity-diagram.test.ts`.

Extends: `src/core/disl/{notation,behavior,persistence,metamodel,layout,support}.ts`, `src/core/scene/scene.ts`, `src/core/tool/toolTypeFrom.ts`, `src/webview/diagram/{scene,canvas}.ts`, `package.json`, `docs/disl-support.md`, `docs/tools.md`.

### Tests (first, seen failing)

- [ ] **T084** [US2] Cut the branch again, run the sync command with `--add definitions/diagrams/agent-activity-diagram.dis`, and commit · etalii.adp.ide.vscode/definitions/agent-activity-diagram/, etalii.adp.ide.vscode/package.json

**⟶ Wait for T084 to finish, then Wave 1: independent (different files):**

- [ ] **T085** [P] [US2] The definition reads with no `disl.unsupported-*` finding: compartments with `groupBy`, `itemOrder` and `itemLink`, a kept filter, `pin`, `unpin` and `unpinAll`, the `open` action, `persistence.view.bind`, `paths` on a `uri` attribute, the shapes `folder` and `hexagon`, and icons · etalii.adp.ide.vscode/test/core/disl/definitions/agentActivityDiagram.test.ts
- [ ] **T086** [P] [US2] The `force` layout with the companion document's algorithm and numbers: tiers, `onChange`, the same file gives the same picture, a pinned node never moves, and the recorded places of the three examples · etalii.adp.ide.vscode/test/core/disl/forceLayout.test.ts
- [ ] **T087** [P] [US2] The tool type: each example opens and saves with file and registration byte-identical; every toolbox gesture gives the bytes of etalii.adp's `agent-activity-edits` fixture and undoes exactly; a refused edit writes nothing and carries the definition's sentence; each of `Fixtures/findings/*.aad` gives its finding on its line; a dragged position is a splice of the file's `view` mapping · etalii.adp.ide.vscode/test/core/tool/agentActivityDiagram.test.ts
- [ ] **T088** [P] [US2] Draw compartments with their items, the two shapes, icons and a pinned node · etalii.adp.ide.vscode/test/webview/diagram/compartments.test.ts
- [ ] **T089** [P] [US2] In a real Visual Studio Code: an `.aad` file opens in the diagram by default; undo and redo; save; a rule's finding in Problems on its line; a refusal shows its sentence · etalii.adp.ide.vscode/test/vscode/agent-activity-diagram.test.ts

### Implementation

**Wave 2: independent (different files):**

- [ ] **T090** [P] [US2] The `force` layout · etalii.adp.ide.vscode/src/core/disl/forceLayout.ts
- [ ] **T091** [P] [US2] Compartments, the kept filter, `folder`, `hexagon` and icons · etalii.adp.ide.vscode/src/core/disl/notation.ts
- [ ] **T092** [P] [US2] `pin`, `unpin`, `unpinAll` and `open` · etalii.adp.ide.vscode/src/core/disl/behavior.ts
- [ ] **T093** [P] [US2] `persistence.view.bind`, and `paths` on a `uri` attribute · etalii.adp.ide.vscode/src/core/disl/persistence.ts, etalii.adp.ide.vscode/src/core/disl/metamodel.ts

**⟶ Wait for Wave 2 to finish, then Wave 3: independent (different files):**

- [ ] **T094** [P] [US2] Use the `force` layout with `respect: "pinned"`, and carry compartments, icons and pins in the scene · etalii.adp.ide.vscode/src/core/disl/layout.ts, etalii.adp.ide.vscode/src/core/scene/scene.ts
- [ ] **T095** [P] [US2] Draw them, with the menu entries for pinning · etalii.adp.ide.vscode/src/webview/diagram/scene.ts, etalii.adp.ide.vscode/src/webview/diagram/canvas.ts
- [ ] **T096** [P] [US2] Pinning and a dragged position as splices where `persistence.view.bind` keeps them · etalii.adp.ide.vscode/src/core/tool/toolTypeFrom.ts
- [ ] **T097** [P] [US2] Add what DISL 0.4 brought to the support record, and the diagram's row to the tool list · etalii.adp.ide.vscode/src/core/disl/support.ts, etalii.adp.ide.vscode/docs/disl-support.md, etalii.adp.ide.vscode/docs/tools.md

**⟶ Wait for Wave 3 to finish, then:**

- [ ] **T098** [US2] Run `npm test` · etalii.adp.ide.vscode
- [ ] **T099** [US2] Push, open pull request 3, merge it once the Build passes, delete the branch, then tick T084 to T099 here through a pull request · etalii.adp.ide.vscode (pull request 3), etalii.adp/specs/027-vscode-disl-fbl-tools/tasks.md

**Checkpoint**: the agent activity diagram works from its definition, and the interpreter reads DISL 0.4.

---

## Phase 6: User Story 3, work in the Knowledge designer (P2, pull request 4)

**Goal**: a YAML, JSON or XML file whose envelope names the Knowledge designer opens in a table read from `knowledge.des`; every other such file opens as text.

**Independent Test**: open the four examples, compare with the definition, perform every operation it lists and check the file; then open a YAML, JSON and XML file without the envelope and see each open as text.

Files: `etalii.adp.ide.vscode/definitions/knowledge/`, `src/core/desl/`, `src/core/tool/tableView.ts`, `src/webview/table/`, `src/extension/reopening.ts`, `test/core/desl/`, `test/core/tool/tableView.test.ts`, `test/core/tool/knowledge.test.ts`, `test/core/tool/addToolType.test.ts`, `test/webview/table/`, `test/vscode/knowledge.test.ts`.

Extends: `src/core/tool/{toolTypeFrom,definitionFolder}.ts`, `src/core/disl/support.ts`, `src/extension/{toolEditor,extension,webviewHtml}.ts`, `esbuild.mjs`, `package.json`, `docs/disl-support.md`, `docs/tools.md`.

### Tests (first, seen failing)

- [ ] **T100** [US3] Cut the branch again, run the sync command with `--add definitions/designers/knowledge.des`, and commit · etalii.adp.ide.vscode/definitions/knowledge/, etalii.adp.ide.vscode/package.json

**⟶ Wait for T100 to finish, then Wave 1: independent (different files):**

- [ ] **T101** [P] [US3] DESL reads `knowledge.des` and `minimal-table.des`: the `table` surface, its nine value types, views, sorts, filters and groups, with the metamodel and expressions of `src/core/disl/` · etalii.adp.ide.vscode/test/core/desl/specification.test.ts
- [ ] **T102** [P] [US3] Every operation the definition lists, counted from the definition, is one transaction over model changes · etalii.adp.ide.vscode/test/core/desl/operations.test.ts
- [ ] **T103** [P] [US3] The table view: properties, rows, the view shown with its sorts, filters and groups applied, and each operation offered or disabled with its reason · etalii.adp.ide.vscode/test/core/tool/tableView.test.ts
- [ ] **T104** [P] [US3] The tool type: the four examples open and save byte-identical; each operation gives the bytes of etalii.adp's `knowledge-yaml`, `knowledge-json`, `knowledge-xml` and `knowledge-kept` fixtures and undoes exactly; the `knowledge-equivalence` fixture gives equal table views through the three bindings; a `.ded` file is claimed by its marker; a file without the envelope is not claimed · etalii.adp.ide.vscode/test/core/tool/knowledge.test.ts
- [ ] **T105** [P] [US3] Adding a tool type needs no code: `minimal-table.des` and its binding in a temporary definitions folder give a tool type that opens a document · etalii.adp.ide.vscode/test/core/tool/addToolType.test.ts
- [ ] **T106** [P] [US3] The table surface: an HTML table with the grid role, every cell reached and edited by keyboard, each value type's control, the operations in their menus, and the colour rule · etalii.adp.ide.vscode/test/webview/table/table.test.ts
- [ ] **T107** [P] [US3] In a real Visual Studio Code: a claimed YAML, JSON and XML file is reopened in the designer; one without the envelope stays text and is offered the designer only under "Open With"; a diff, a file from version control and an untitled document are never reopened; "Open as Text" holds for the session; undo, save and Problems · etalii.adp.ide.vscode/test/vscode/knowledge.test.ts

### Implementation

**Wave 2: independent (different files):**

- [ ] **T108** [P] [US3] Read a `.des` file and its `table` surface · etalii.adp.ide.vscode/src/core/desl/specification.ts, etalii.adp.ide.vscode/src/core/desl/surface.ts
- [ ] **T109** [P] [US3] `TableView`, `TableRequest`, and the view computed from a reading · etalii.adp.ide.vscode/src/core/tool/tableView.ts
- [ ] **T110** [P] [US3] The table surface, on the plug-in's existing controls and with no grid library · etalii.adp.ide.vscode/src/webview/table/main.ts, etalii.adp.ide.vscode/src/webview/table/table.ts, etalii.adp.ide.vscode/src/webview/table/table.css
- [ ] **T111** [P] [US3] Reopen a text tab on a workspace file its binding claims with `vscode.openWith` · etalii.adp.ide.vscode/src/extension/reopening.ts

**⟶ Wait for Wave 2 to finish, then Wave 3: independent (different files):**

- [ ] **T112** [P] [US3] The operations as DESL's transactions, run by the behaviour of `src/core/disl/` · etalii.adp.ide.vscode/src/core/desl/operations.ts
- [ ] **T113** [P] [US3] Bundle the table webview and give it its page · etalii.adp.ide.vscode/esbuild.mjs, etalii.adp.ide.vscode/src/extension/webviewHtml.ts
- [ ] **T114** [P] [US3] Read a `.des` folder with its several bindings · etalii.adp.ide.vscode/src/core/tool/definitionFolder.ts

**⟶ Wait for Wave 3 to finish, then:**

- [ ] **T115** [US3] `toolTypeFrom` for a designer, with ADP Properties given the fields of a selection · etalii.adp.ide.vscode/src/core/tool/toolTypeFrom.ts

**⟶ Wait for T115 to finish, then Wave 4: independent (different files):**

- [ ] **T116** [P] [US3] Serve a designer with the table webview, and wire the reopening · etalii.adp.ide.vscode/src/extension/toolEditor.ts, etalii.adp.ide.vscode/src/extension/extension.ts
- [ ] **T117** [P] [US3] Add DESL 0.1 and what is read of each of its sections to the support record, and the designer's row to the tool list · etalii.adp.ide.vscode/src/core/disl/support.ts, etalii.adp.ide.vscode/docs/disl-support.md, etalii.adp.ide.vscode/docs/tools.md

**⟶ Wait for Wave 4 to finish, then:**

- [ ] **T118** [US3] Run `npm test` · etalii.adp.ide.vscode
- [ ] **T119** [US3] Push, open pull request 4, merge it once the Build passes, delete the branch, then tick T100 to T119 here through a pull request · etalii.adp.ide.vscode (pull request 4), etalii.adp/specs/027-vscode-disl-fbl-tools/tasks.md

**Checkpoint**: the Knowledge designer works from its definition; no other YAML, JSON or XML file is touched.

---

## Phase 7: User Story 4, the two existing diagrams read their definitions (P3, pull request 5)

**Goal**: the hype cycle graph and Agent Behavior Modelling come from their definitions and plugins, their hand-coded modules are gone, and users see no difference.

**Independent Test**: the plug-in's existing tests for both diagrams pass, apart from those rewritten to name the same behaviour through the tool type.

Files: `etalii.adp.ide.vscode/src/core/plugins/abm-markdown/`, `src/core/plugins/abm-arrange/`, `test/core/plugins/abm-markdown/`, `test/core/plugins/abm-arrange/`, `test/core/disl/definitions/agentBehaviorModelling.test.ts`, `test/core/tool/definitionChange.test.ts`, and the removal of `src/core/gartner-hypecycle-graph/`, `src/core/agent-behavior-modelling/`, `src/webview/gartner-hypecycle-graph/`, `src/webview/agent-behavior-modelling/` and their tests.

Extends: `src/core/disl/{metamodel,notation,layout,support}.ts`, `src/core/plugins/index.ts`, `src/core/frame/toolType.ts`, `src/extension/toolTypes.ts`, `src/webview/diagram/`, `docs/disl-support.md`, `docs/parity.md`, `docs/tools.md`.

### Tests (first, seen failing)

- [ ] **T120** [US4] Cut the branch again from `origin/develop` · etalii.adp.ide.vscode/.claude/worktrees/027-vscode-disl-fbl-tools

**⟶ Wait for T120 to finish, then Wave 1: independent (different files):**

- [ ] **T121** [P] [US4] The definition reads with no `disl.unsupported-*` finding: `anchor.sides`, the derived id strategy, the `tidyTree` layout, parent placements and retyping · etalii.adp.ide.vscode/test/core/disl/definitions/agentBehaviorModelling.test.ts
- [ ] **T122** [P] [US4] Move the parser and writer tests to the plugin, naming the same behaviour through `PersistencePlugin` · etalii.adp.ide.vscode/test/core/plugins/abm-markdown/behaviorModel.test.ts
- [ ] **T123** [P] [US4] The arrange action gives the places today's `layout.ts` gives · etalii.adp.ide.vscode/test/core/plugins/abm-arrange/arrange.test.ts
- [ ] **T124** [P] [US4] Rewrite each test that names a hand-coded function to name the same behaviour through the tool type, and list each in the pull request; every other test stays as it is · etalii.adp.ide.vscode/test/core/gartner-hypecycle-graph/, etalii.adp.ide.vscode/test/core/agent-behavior-modelling/dragPreview.test.ts, etalii.adp.ide.vscode/test/webview/gartner-hypecycle-graph/, etalii.adp.ide.vscode/test/webview/agent-behavior-modelling/
- [ ] **T125** [P] [US4] A label, a colour and a refusal sentence changed in a temporary copy of a definition show in the tool type with no other change · etalii.adp.ide.vscode/test/core/tool/definitionChange.test.ts

### Implementation

**Wave 2: independent (different files):**

- [ ] **T126** [P] [US4] The derived id strategy and retyping · etalii.adp.ide.vscode/src/core/disl/metamodel.ts
- [ ] **T127** [P] [US4] `anchor.sides` and parent placements · etalii.adp.ide.vscode/src/core/disl/notation.ts
- [ ] **T128** [P] [US4] The `tidyTree` layout · etalii.adp.ide.vscode/src/core/disl/layout.ts
- [ ] **T129** [P] [US4] Today's parser, writer, model and rules under the plugin's interface · etalii.adp.ide.vscode/src/core/plugins/abm-markdown/
- [ ] **T130** [P] [US4] Today's `layout.ts` as the arrange action · etalii.adp.ide.vscode/src/core/plugins/abm-arrange/

**⟶ Wait for Wave 2 to finish, then:**

- [ ] **T131** [US4] Register the two plugins and remove the line that let a hand-coded type win · etalii.adp.ide.vscode/src/core/plugins/index.ts, etalii.adp.ide.vscode/src/extension/toolTypes.ts

**⟶ Wait for T131 to finish, then Wave 3: independent (different files):**

- [ ] **T132** [P] [US4] Remove the hand-coded modules, `ViewElement`, `ViewRelation`, `ViewModel` and `DiagramType`, and the webview's `DiagramDefinition` path with what only it used · etalii.adp.ide.vscode/src/core/gartner-hypecycle-graph/, etalii.adp.ide.vscode/src/core/agent-behavior-modelling/, etalii.adp.ide.vscode/src/webview/gartner-hypecycle-graph/, etalii.adp.ide.vscode/src/webview/agent-behavior-modelling/, etalii.adp.ide.vscode/src/webview/diagram/, etalii.adp.ide.vscode/src/core/frame/toolType.ts
- [ ] **T133** [P] [US4] Record what Agent Behavior Modelling added and every difference from spec 006's results, each with its reason or its issue in etalii.adp · etalii.adp.ide.vscode/src/core/disl/support.ts, etalii.adp.ide.vscode/docs/disl-support.md, etalii.adp.ide.vscode/docs/parity.md, etalii.adp.ide.vscode/docs/tools.md

**⟶ Wait for Wave 3 to finish, then:**

- [ ] **T134** [US4] Remove what nothing uses any more of the old text, registration and diagram helpers, with their tests · etalii.adp.ide.vscode/src/core/text/, etalii.adp.ide.vscode/src/core/registration/, etalii.adp.ide.vscode/src/core/diagram/
- [ ] **T135** [US4] Run `npm test`: every test under `test/vscode/` for the two diagrams passes untouched (SC-004) · etalii.adp.ide.vscode
- [ ] **T136** [US4] Push, open pull request 5, merge it once the Build passes, delete the branch, then tick T120 to T136 here through a pull request · etalii.adp.ide.vscode (pull request 5), etalii.adp/specs/027-vscode-disl-fbl-tools/tasks.md

**Checkpoint**: one way of building a tool; every tool type in the plug-in is a folder of `definitions/`.

---

## Phase 8: Polish (pull request 6)

**Purpose**: what a test cannot see, the documentation, and the last differences filed.

Files: `etalii.adp.ide.vscode/README.md`, `CLAUDE.md`.

- [ ] **T137** Cut the branch again from `origin/develop` · etalii.adp.ide.vscode/.claude/worktrees/027-vscode-disl-fbl-tools

**⟶ Wait for T137 to finish, then Wave 1: independent (different files):**

- [ ] **T138** [P] See each native dialog the three new tool types raise in a real Visual Studio Code window: the confirmation before a removal, the file and folder picker of a link, the save prompt. Record who saw it, the date and the version (FR-015) · etalii.adp.ide.vscode/docs/parity.md
- [ ] **T139** [P] Check the tool list against the five tool types, each with kind, display name and origin (FR-017) · etalii.adp.ide.vscode/docs/tools.md
- [ ] **T140** [P] Describe how a tool type is added, and the new folders · etalii.adp.ide.vscode/README.md, etalii.adp.ide.vscode/CLAUDE.md
- [ ] **T141** [P] Check research R14's seven and every difference found since against "Differences raised and not settled here"; file what is missing in etalii.adp (SC-006) · etalii.adp.ide.vscode/docs/disl-support.md

**⟶ Wait for Wave 1 to finish, then:**

- [ ] **T142** Validate against the Success Criteria: `npm test` (check, unit and the packaged plug-in), `npm run sync-definitions -- --check`, the skipped-tests report holding only scenario 5 of User Story 1 or nothing, and SC-005 by deleting and restoring one folder of `definitions/` · etalii.adp.ide.vscode
- [ ] **T143** Push, open pull request 6, merge it once the Build passes, then tick T137 to T143 here through a pull request, and delete the branch and the worktree in both repositories · etalii.adp.ide.vscode (pull request 6), etalii.adp/specs/027-vscode-disl-fbl-tools/tasks.md

---

## Dependencies & Execution Order

Setup → the FBL library → the definition foundation → User Story 1 → User Story 2 → User Story 3 → User Story 4 → Polish. Every phase waits for the one before it to be merged: the plan cuts each pull request's branch after the previous one is merged, and each story adds to the interpreter the phase before it left. The story phases are not handed to parallel workers.

- **Phase 1**: Wave 1 (T001, T002) blocks T003.
- **Phase 2**: T004, then T005, then T006; the test wave (T007 to T012); Wave 3, the types (T013 to T015), blocks Wave 4, rules, plugins, routing (T016 to T018), which blocks Wave 5, the families (T019 to T021), which blocks T022 to T025 in order.
- **Phase 3**: T026; the test wave (T027 to T038); Wave 2, what is taken and the contract (T039 to T045), blocks Wave 3 (T046 to T051), which blocks T052, which blocks Wave 4, the extension (T053 to T059), which blocks T060 and T061.
- **Phase 4**: T062; the test wave (T063 to T068); Wave 2, the constructs and the readers (T069 to T076), blocks Wave 3 (T077 to T080), which blocks T081 to T083 in order.
- **Phase 5**: T084; the test wave (T085 to T089); Wave 2 (T090 to T093) blocks Wave 3 (T094 to T097), which blocks T098 and T099.
- **Phase 6**: T100; the test wave (T101 to T107); Wave 2 (T108 to T111) blocks Wave 3 (T112 to T114), which blocks T115, which blocks Wave 4 (T116, T117), which blocks T118 and T119.
- **Phase 7**: T120; the test wave (T121 to T125); Wave 2 (T126 to T130) blocks T131, which blocks Wave 3 (T132, T133), which blocks T134 to T136 in order.
- **Phase 8**: T137; Wave 1 (T138 to T141) blocks T142 and T143.

Two things are outside this list. Scenario 5 of User Story 1 stays skipped until the mind map's binding has a marker in etalii.adp (issue 1 of T002); when it has, refreshing `definitions/mindmap/` and removing the skip is the whole change. T138 needs a person at a real window.
