---
description: "Tasks for spec 006, the ADP plug-in for Visual Studio Code"
---

# Tasks: The ADP Plug-in for Visual Studio Code

**Input**: [plan.md](plan.md), [vscode-plugin.spec.md](vscode-plugin.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Prerequisites**: the specification as merged with pull request 55, and the plan of 2026-10-05.

**Tests**: asked for (FR-042 to FR-047), and the VS Code repository's constitution makes them test-first (principle V). Every story phase starts with its tests, which are written and seen failing before the code they cover, and every pull request carries the tests for what it delivers (FR-047).

**Organization**: phases follow the user stories, in the order their dependencies allow rather than strictly by priority: the frame (user story 4) comes before the two diagram types (user stories 2 and 3), and the first half of user story 7, the definitions, is foundational because both diagram types are built against it. Each task starts with the pull request of [plan.md](plan.md), Delivery, that carries it (`PR A`, `PR 0` to `PR 5`, `PR B` for the last change here).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel with the other [P] tasks around it (different files, no dependency on an unfinished task)
- **[Story]**: US1 to US7 from the specification; setup, foundational and final tasks carry none

## Shared contract (read before any task)

- **Paths.** A path without a prefix is in `etalii.adp.ide.vscode`. A path that starts with `etalii.adp/` is in this repository. `standalone:` means `etalii.adp.ide.standalone` at commit `13b517b3`, read with `git show 13b517b3:<path>` and never from the working tree; find a module's files with `git ls-tree -r --name-only 13b517b3 | grep -i <name>`.
- **Branches.** One branch and worktree per pull request, deleted after the merge, merged with a merge commit, never pushed to `develop`: here `features/006-vscode-plugin` (PR A) and `features/006-vscode-plugin-hosts` (PR B); in the VS Code repository `features/006-vscode-plugin-constitution` (PR 0), `-skeleton` (PR 1), `-frame` (PR 2), `-hype-cycle-graph` (PR 3), `-behavior-modelling` (PR 4), `-catalogue` (PR 5).
- **Layers** ([contracts/frame-api.md](contracts/frame-api.md)): core imports no `vscode`, DOM, `preact`, host or view; host imports core and `vscode`; view imports core and `preact`. Nothing under `src/diagrams/<a>/` imports from `src/diagrams/<b>/`, nothing under `src/frame/` imports from `src/diagrams/` or names a diagram type, and `src/diagrams/index.ts` is the only file that names them.
- **Ported code.** A file ported or copied from the standalone host states its source file and commit in its header and keeps the standalone names where TypeScript allows (research R3). The standalone test file is ported with it, test for test.
- **Sentences.** Every refusal, question, read-only explanation and finding message is the definition's sentence, verbatim, taken from the vendored `definitions/`.
- **Plain JSON.** `.vscode/*.json` and every `tsconfig*.json` carry no comments and no trailing commas, because `check-files.py` parses them.
- **Tests.** Level 1 and 2 tests live under `tests/unit/`, mirroring `src/`; level 3 under `tests/real-ide/`. Tests read `examples/`, `fixtures/` and `definitions/` and never `.debug/`.
- **Words.** "tool", "diagram", "ADP Toolbox", "ADP Properties" as `etalii.adp/docs/terminology.md` has them (FR-004).

---

## Phase 1: Setup

**Purpose**: the checkouts, the branch and the one ruling everything else waits for.

- [ ] T001 Fetch `origin` in `etalii.adp.ide.standalone`, `etalii.adp.ide.intellij` and `etalii.adp.ide.vscode` and fast-forward each local `develop` (research O2: they are 22, 16 and 10 commits behind); confirm with `git merge-base --is-ancestor 13b517b3 origin/develop` in `etalii.adp.ide.standalone` that the commit this plan was read at is there
- [ ] T002 PR A: make the branch `features/006-vscode-plugin` again from `develop` in a worktree of `etalii.adp`, and move `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/`, `tasks.md` and the changed `.spec-context.json` of `etalii.adp/specs/006-vscode-plugin/` from the `develop` working tree, where they lie uncommitted, into it and commit them there; `develop`'s working tree is left without them
- [ ] T003 Ask the owner to rule on research open point O1 (the definition gives Do the fill `#86e6d9` and Ask the user and Delegate `#ededed`; the standalone stylesheet gives them the other way round) and write the ruling under O1 in `etalii.adp/specs/006-vscode-plugin/research.md`

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: the definitions the host is built against (PR A, which is also user story 7's scenarios 1 and 2 and SC-010), the constitution the plan is checked against (PR 0, FR-060), and a package that builds (the start of PR 1).

**⚠️ CRITICAL**: no user story work starts before this phase is done. PR A must be merged before T024 vendors the definitions.

### Pull request A: "Arrange diagram" in the two definitions ([contracts/definitions-change.md](contracts/definitions-change.md))

- [ ] T004 [P] PR A: in `etalii.adp/definitions/diagrams/gartner-hype-cycle-graph.dis` raise `language.version` from `1.0.0` to `1.1.0`; add `behavior.operations.arrange` (label "Arrange diagram", `for: "diagram"`, `enabled` while the diagram is writable and has a trend, one `layout` action over the diagram's nodes with the algorithm `arrangeRows`, a `doc` stating the rule and both refusals); add `layout.algorithms.arrangeRows` as `plugin:net.etalii.adp.gartner.arrangeRows` with its `doc`; add the `plugins` entry `net.etalii.adp.gartner.arrangeRows` with `provides: ["layout"]`, not required; leave `layout.trigger` at `manual`, modelling the operation on the supply chain and causal loop definitions
- [ ] T005 [P] PR A: re-read `etalii.adp/definitions/diagrams/gartner-hype-cycle-graph.md` against `standalone:` and correct every point that names a file where the code has moved on; the opening paragraph names commit `13b517b3` in place of `b2a2692`, and a line under it names the standalone host as the host that implements the diagram type
- [ ] T006 PR A: add the section "Arrange diagram" after "Compact mode" in `etalii.adp/definitions/diagrams/gartner-hype-cycle-graph.md`, from `standalone:` `GhgArrangement.cs`, `Commands/ArrangeGhgCommandHandler.cs` and `RowPacking.cs`: what changes (the `row` of trends, triggers and notes, nothing else); the rule (as few rows as the elements allow, each element as wide as it is drawn, label widths by the shared text metric at size 12 with a gap of 8, at least 16 canvas units clear between two elements on a row, influences as links, the packing described in enough detail to implement it); what is skipped; one undoable step; the refusals verbatim, "There is nothing to arrange until this graph has a trend." and "This graph is already arranged."; where it is offered (the canvas's background menu, action `ghg.arrange`). Add the background menu's entry to "Toolbox, context actions and the property grid" and both sentences to "Refusals and confirmations"
- [ ] T007 [P] PR A: in `etalii.adp/definitions/diagrams/agent-behavior-modelling.dis` raise `language.version` from `0.1.0` to `0.2.0`; add `behavior.operations.arrange` (label "Arrange diagram", `for: "diagram"`, a `plugin` body named `net.etalii.adp.etalii.abmForgetPositions`, a `doc` stating what it forgets and the refusals); add the `plugins` entry `net.etalii.adp.etalii.abmForgetPositions` with `provides: ["action"]`, required; add to `layout.doc` the sentence "Arrange diagram forgets every pin."
- [ ] T008 [P] PR A: in `etalii.adp/definitions/diagrams/agent-behavior-modelling.md` name commit `13b517b3` in the opening paragraph and the standalone host in a line under it; add **Arrange diagram** to "Interaction" from `standalone:` `Commands/ArrangeAbmCommand.cs` (the registration's `layout:` block is removed, the Markdown is not touched, one undo puts the registration back, offered on the canvas's background menu, and the refusals verbatim: "This behavior model was opened without a registration, so it has no dragged positions to forget." and "This behavior model is already arranged."); say in "Layout" that "Arrange diagram" is the way back to the computed layout; add to "Known gaps" that no browser pass is recorded for "Arrange diagram" or the drag
- [ ] T009 PR A: apply the ruling of T003: either correct `color.abm.action` and `color.abm.other` in `etalii.adp/definitions/diagrams/agent-behavior-modelling.dis` and the companion's sentence on the leaf colours, or leave both and open an issue in `etalii.adp.ide.standalone` for its stylesheet; where the two still disagree when PR A is opened, a line in the "Known gaps" of `etalii.adp/definitions/diagrams/agent-behavior-modelling.md` says so
- [ ] T010 PR A: run `python .github/scripts/validate-examples.py` and `python .github/scripts/licence-check.py` in `etalii.adp` and see 0 invalid; run `git grep -n "Arrange diagram" -- definitions/diagrams/gartner-hype-cycle-graph.* definitions/diagrams/agent-behavior-modelling.*` and see the operation in both `.dis` files and a section in both companions (FR-027, FR-028, SC-010)
- [ ] T011 PR A: push `features/006-vscode-plugin` and open a pull request into `develop` of `etalii.adp`; once it is merged with a merge commit, delete the branch locally and on `origin` and remove the worktree

### Pull request 0: the VS Code repository's constitution ([contracts/vscode-constitution.md](contracts/vscode-constitution.md))

- [ ] T012 [P] PR 0: in a worktree of `etalii.adp.ide.vscode` on `features/006-vscode-plugin-constitution`, run `/speckit-constitution` with the content of `etalii.adp/specs/006-vscode-plugin/contracts/vscode-constitution.md` (terminology, the six principles, platform and technology constraints, development workflow, governance), ratifying `.specify/memory/constitution.md` as version 1.0.0
- [ ] T013 [P] PR 0: in `CLAUDE.md` add that pull requests are merged with a merge commit, never a squash or a rebase, and a pointer to `specs/006-vscode-plugin/` in `etalii.adp` for this feature's plan and tasks
- [ ] T014 PR 0: push, open the pull request into `develop` of `etalii.adp.ide.vscode`, and after the merge delete the branch and remove the worktree
- [ ] T015 Repeat the Constitution Check of `etalii.adp/specs/006-vscode-plugin/plan.md` against the ratified text and note its date and result under "The VS Code repository" there; a principle changed in ratification stops the work and brings the plan back to `/speckit-plan` (FR-060)

### Pull request 1, first part: a package that builds

- [ ] T016 PR 1: in a worktree on `features/006-vscode-plugin-skeleton`, create `package.json` with the identity of [contracts/package-manifest.md](contracts/package-manifest.md) (`name` `adp`, `publisher` `EtAlii`, `displayName` `ADP: A Different Perspective`, `version` `0.1.0`, `engines.vscode` `^1.140.0`, `license` `Apache-2.0`, `main` `./dist/host.js`, `categories` `Visualization` and `Other`, `capabilities.untrustedWorkspaces.supported: true`, no `activationEvents`), the scripts of [contracts/dev-interface.md](contracts/dev-interface.md) (`build`, `watch`, `lint`, `test:unit`, `package`, `test:real-ide`, `check`, `test`, `examples`, `vendor`), the runtime dependencies `yaml` 2, `preact` 11 and `@mdi/js` 7 and the build and test dependencies at the versions research.md lists under "What was read"; run `npm install` to write `package-lock.json`
- [ ] T017 [P] PR 1: write `tsconfig.json` (strict, Node, covering core and host and `tests/`) and `tsconfig.view.json` (strict, DOM, Preact's JSX, covering core and view), both plain JSON
- [ ] T018 [P] PR 1: write `esbuild.mjs` producing `dist/host.js` (CommonJS, Node, `vscode` external) and `dist/view.js` with `dist/view.css` (browser), with source maps that carry their sources; a production mode without them being needed at runtime; a watch mode that rebuilds both on change and prints errors in the form the problem matcher of T040 reads
- [ ] T019 [P] PR 1: write `eslint.config.mjs` over `src/` and `tests/` with the restricted-imports rules of the layer table and the two rules across diagram types, so `npm run lint` fails on a breach; warnings are errors
- [ ] T020 [P] PR 1: write `vitest.config.ts` running `tests/unit/**` in Node, and under jsdom for `tests/unit/**/view/**` and `tests/unit/**/host/**`, writing `reports/unit/junit.xml` and an HTML report beside it
- [ ] T021 [P] PR 1: write `.gitignore` (`node_modules/`, `dist/`, `reports/`, `.vscode-test/`, `.debug/`, `*.vsix`), `.vscodeignore` (so the `.vsix` holds `dist/`, `package.json`, `README.md`, `LICENSE` and nothing of `src/`, `tests/`, `scripts/`, `examples/`, `fixtures/`, `definitions/`) and `.gitattributes` (`examples/**`, `fixtures/**` and `definitions/**` marked `-text`)
- [ ] T022 [P] PR 1: write `src/extension.ts` with an `activate` and a `deactivate` that do nothing else yet, and `src/diagrams/index.ts` exporting an empty list of diagram types
- [ ] T023 [P] PR 1: write `scripts/real-ide.mjs`: downloads Visual Studio Code into `.vscode-test/` with `@vscode/test-electron`, installs the `.vsix` given with `--vsix` or the one at the repository root into an empty profile, starts it with `ADP_TEST=1` and the Mocha suites of `tests/real-ide/` (narrowed by `ADP_TEST_GREP`), and writes `reports/real-ide/junit.xml` with an HTML report
- [ ] T024 PR 1: write `scripts/vendor.mjs` (`npm run vendor -- --standalone <path> --adp <path>`), reading a named commit and not the working tree, and run it: `examples/gartner-hype-cycle-graph/` (9 graphs with their `.adp` files and readme) and `examples/agent-behavior-modelling/` (4 agents with theirs) from the standalone module folders; `fixtures/gartner-hype-cycle-graph/` (23 `.ghg` fixtures and `scale-fixture.json`); `fixtures/cross-tier/` (`row-rounding.json`, `text-metric.json`, `element-types.json`); `fixtures/registrations/` (the registration examples of `etalii.adp/specifications/fbl/registrations/`, which research R7 tests against); `definitions/` (the two `.dis` files and companions from `etalii.adp` after T011); each folder with a `PROVENANCE.md` naming the source repository, path, commit and licence (FR-043)
- [ ] T025 [P] PR 1: change `.github/scripts/check-files.py` so it skips `fixtures/` for JSON and YAML parsing and `examples/` and `definitions/` for links, and nothing else (research R14)

**Checkpoint**: `npm ci && npm run build && npm run lint` pass on an extension that activates and does nothing; the definitions state "Arrange diagram"; the constitution is ratified.

---

## Phase 3: User Story 1 - Download the plug-in and install it (Priority: P1) 🎯 MVP

**Goal**: every run of the Build workflow offers `etalii-adp-0.1.0.vsix`, and the Releases page offers the one from the latest passing `develop` as the development build.

**Independent Test**: quickstart step 1: a merged pull request's run offers the file itself; the Releases page has one pre-release whose commit is the head of `develop`; the file installs into a clean Visual Studio Code and is listed as "ADP: A Different Perspective".

### Tests for User Story 1

- [ ] T026 [P] [US1] PR 1: level 1 test `tests/unit/manifest.test.ts`: `package.json` has every Identity value of [contracts/package-manifest.md](contracts/package-manifest.md), declares no settings, no `activationEvents` and no `extensionDependencies`, and its scripts are exactly those of [contracts/dev-interface.md](contracts/dev-interface.md)
- [ ] T027 [P] [US1] PR 1: level 3 test `tests/real-ide/activation.test.ts` with the Mocha entry `tests/real-ide/index.ts`: the installed extension `EtAlii.adp` is found, has the display name "ADP: A Different Perspective" and version `0.1.0`, and activates without an error

### Implementation for User Story 1

- [ ] T028 [US1] PR 1: make `npm run package` in `package.json` write the production bundles and `etalii-adp-<version>.vsix` at the repository root, the name taken from `package.json`'s `version` in Node and passed to `vsce package --out`, so it does not depend on the shell (FR-002)
- [ ] T029 [P] [US1] PR 1: take `.github/scripts/skipped-tests.py` from `etalii.adp.ide.intellij` at `origin/develop` with its glob set to `reports/**/*.xml`; it appends a `## Skipped tests` table (`Test`, `Reason`) or "No tests were skipped." to the job summary
- [ ] T030 [US1] PR 1: rewrite `.github/workflows/build.yml` as [contracts/ci-interface.md](contracts/ci-interface.md) states: `name: Build`; triggers `pull_request` into `develop`, `push` to `develop`, `workflow_dispatch`; `contents: read`; concurrency `build-${{ github.ref }}` cancelling for pull requests only; Node.js 22 on `ubuntu-latest`; the jobs `check`, `build` (replacing `plugin`; `npm ci`, "Build, check and test the plug-in", "Package the plug-in", "Report the skipped tests", "Keep the test reports" with `if: ${{ !cancelled() }}`, "Offer the plug-in for download" with `archive: false`, no `name`, no `if:` and `if-no-files-found: error`), `real-ide-tests` (needs `build`; takes the packaged file, `xvfb-run -a npm run test:real-ide -- --vsix <file>`, reports, "Keep the IDE logs" on failure), `development-build` (only for `refs/heads/develop`, needs both, the only job with `contents: write`) and `terminology` unchanged
- [ ] T031 [US1] PR 1: write the "Publish the development build" step of `.github/workflows/build.yml` with the `gh` command line and the workflow's own token: publish only when `compare development...<sha>` is `ahead`, otherwise a notice and success; upload the new asset, delete any other asset, set the title `Development build <version> (<short sha>, <yyyy-mm-dd>)` and the notes (the commit with its link and the UTC date, its subject quoted, a link to the run, "Every merge into develop replaces this build."), keep it a pre-release with `--latest=false`, and move the tag `development` last (FR-055, FR-057)
- [ ] T032 [P] [US1] PR 1: write in `README.md` what the plug-in brings and the section "Install from a file": the development build on the Releases page, the plug-in from a pull request's Build run, and `code --install-extension etalii-adp-0.1.0.vsix` (FR-058)

**Checkpoint**: `npm run package` writes the `.vsix`; `npm run test:real-ide` installs it and sees it activate.

---

## Phase 4: User Story 5 - Tests that say whether it works (Priority: P2)

**Goal**: one command runs three levels of tests headlessly and reports what it skipped. It is delivered here, ahead of the other P1 stories, because pull request 1 gives every later pull request its checks; the round-trip, fixture and real-IDE tests of each diagram type arrive with that type (phases 6 to 8).

**Independent Test**: quickstart step 2: `npm ci && npm test` on a clean clone runs the three levels in order, names how many ran and were skipped, and leaves `reports/unit/junit.xml` and `reports/real-ide/junit.xml`.

### Tests for User Story 5

- [ ] T033 [P] [US5] PR 1: level 1 test `tests/unit/vendored.test.ts`: `examples/` holds 9 `.ghg` and 4 agent Markdown files each with its `.adp`; `fixtures/gartner-hype-cycle-graph/` holds 23 `.ghg` files and `scale-fixture.json`; `fixtures/cross-tier/` holds the three named files; every vendored folder has a `PROVENANCE.md` naming repository, path, commit and licence; `.gitattributes` marks all three roots `-text`
- [ ] T034 [P] [US5] PR 1: level 1 test `tests/unit/licences.test.ts`: the licences of everything bundled into `dist/` are on an allow list (ISC, MIT, Apache-2.0), and a new entry fails the test (research R15)
- [ ] T035 [P] [US5] PR 1: level 2 test `tests/unit/frame/view/smoke.test.tsx`: a Preact component renders under jsdom, proving the second level's runner

### Implementation for User Story 5

- [ ] T036 [US5] PR 1: in `scripts/real-ide.mjs`, when there is no display and no `xvfb-run`, or the download is unreachable, write every level 3 test to `reports/real-ide/junit.xml` as skipped with that reason and exit 0; as its last lines print how many tests ran and how many were skipped at each level, with the reasons, read from both JUnit files (FR-046)
- [ ] T037 [US5] PR 1: run `npm test` (`check`, `package`, then `test:real-ide`) on a fresh clone of the branch, under `xvfb-run -a` on Linux, and see the three levels pass in that order with both reports written; state the `xvfb-run` prefix in `README.md`

**Checkpoint**: one test at each level runs from `npm test`; skips are reported with their reason.

---

## Phase 5: User Story 6 - Start debugging in one step (Priority: P2)

**Goal**: F5 on a fresh clone opens a development window with the plug-in loaded and a copy of the examples open; breakpoints bind in both halves.

**Independent Test**: quickstart step 6, timed from `git clone`.

### Tests for User Story 6

- [ ] T038 [P] [US6] PR 1: level 1 test `tests/unit/devInterface.test.ts`: `.vscode/launch.json` parses as plain JSON and has the configurations "Run the plug-in" (first, with `debugWebviews`, the folder `.debug/examples/` and other extensions disabled), "Debug this unit test file" and "Debug the real-IDE tests"; `.vscode/tasks.json` has the tasks `watch` (background, with a problem matcher written out) and `examples`; `.vscode/extensions.json` and every `tsconfig*.json` parse as plain JSON
- [ ] T039 [P] [US6] PR 1: level 1 test `tests/unit/scripts/examples.test.ts`: `scripts/examples.mjs` replaces `.debug/examples/` with a byte-identical copy of `examples/` and leaves `examples/` untouched (FR-051)

### Implementation for User Story 6

- [ ] T040 [P] [US6] PR 1: write `scripts/examples.mjs` and `.vscode/tasks.json` (`watch` running `npm run watch` in the background with its problem matcher written out so build errors reach the Problems panel without another extension, and `examples` running `npm run examples`) (FR-050)
- [ ] T041 [US6] PR 1: write `.vscode/launch.json` with the three configurations of [contracts/dev-interface.md](contracts/dev-interface.md), "Run the plug-in" starting the tasks `examples` and `watch` first, and `.vscode/extensions.json` recommending the Vitest and Extension Test Runner extensions (FR-048, FR-052)
- [ ] T042 [US6] PR 1: spike S3, by hand and timed: with a throwaway webview on a scratch commit that is not pushed, press F5 and see a breakpoint in a `.tsx` file under `src/` and one in `src/extension.ts` bind in the TypeScript source with the bundles as built; write the result under S3 in `etalii.adp/specs/006-vscode-plugin/research.md`; if the view's breakpoint does not bind, add to `.vscode/launch.json` an attached configuration for the webview and a compound that starts both, still one step (FR-049)
- [ ] T043 [US6] PR 1: write the "Build" section of `README.md`: the prerequisites (Node.js 22 or later with npm, git, Visual Studio Code 1.140 or later) and the command table of [contracts/dev-interface.md](contracts/dev-interface.md), with how to debug the plug-in and a single test (FR-058)

### Delivering pull request 1

- [ ] T044 [US6] PR 1: push `features/006-vscode-plugin-skeleton`, open the pull request into `develop`, see `check`, `build`, `real-ide-tests` and `terminology` pass and the run offer `etalii-adp-0.1.0.vsix` as a file; after the merge delete the branch and remove the worktree
- [ ] T045 [US1] PR 1: after the merge, work through quickstart step 1 on GitHub: the `develop` run published "Development build 0.1.0 (`<sha>`, `<date>`)" as a pre-release with that one file at the head of `develop`, and the downloaded file installs into a Visual Studio Code that never had it (SC-001, SC-006, SC-007)

**Checkpoint**: user stories 1, 5 and 6 are delivered; every later pull request is built, tested and offered for download.

---

## Phase 6: User Story 4 - A toolbox, a property grid and the rest of the frame (Priority: P1)

**Goal**: the frame of [contracts/frame-api.md](contracts/frame-api.md): the editor integration over the platform's text document, the canvas, ADP Toolbox, ADP Properties, findings, commands and themes, proven on a diagram type that exists only in the tests.

**Independent Test**: `npm test` passes with the fake diagram type; `npm run lint` and `git grep -n "gartner\|agent-behavior\|ghg\|abm" -- src/frame` find nothing (quickstart step 7). Quickstart step 5 is worked through once the two diagram types exist.

### Spikes, first (research, Spikes)

- [ ] T046 [US4] PR 2: spike S1 as the level 3 test `tests/real-ide/markerEdit.test.ts`, on `features/006-vscode-plugin-frame`: a `WorkspaceEdit` that replaces a line by itself leaves the bytes unchanged, makes the document dirty, adds one step to its undo history, and `undo` comes back as a change with the reason "undo" and a clean document. If it fails: stop, record it under S1 in `etalii.adp/specs/006-vscode-plugin/research.md`, and take the specification to `/speckit-clarify` on FR-031 before phase 8
- [ ] T047 [US4] PR 2: spike S2, by hand on Windows, macOS and Linux with two throwaway webviews: a drag started in a webview view reaches `dragover` and `drop` in a custom editor's webview with its `application/vnd.etalii.adp.toolbox` data, or it does not. Create `docs/parity.md` with the sections "The frame", "Gartner hype cycle graph" and "Agent Behavior Modelling" and record the result per platform under "The frame"; if it fails anywhere, T094 also mounts the toolbox inside the diagram's editor (FR-039)

### The contract and the fakes

- [ ] T048 [US4] PR 2: write `src/frame/api.ts` with the declarations of [contracts/frame-api.md](contracts/frame-api.md): `DiagramType`, `DiagramCore`, `Reading`, `Finding` (`rule`, `severity` one of `error`, `warning` or `information`, `line` and `endLine` counted from 0, `message`), `Intent` (kind, arguments, id, the document version it was computed from), `EditResult`, `DiagramHost`, `DiagramView`, `Scene`, `ToolboxGroup`, `PropertyGroup` with the seven controls, `Action`, the message types of the Messages table and the `Step` type of the test seam
- [ ] T049 [P] [US4] PR 2: write `tests/unit/fakes/vscode.ts`, a small fake of the `vscode` API for level 2: a text document with versions, `applyEdit` with a `WorkspaceEdit`, change events with a reason, undo and redo, a diagnostic collection, `setContext`, workspace state and the message dialogs
- [ ] T050 [P] [US4] PR 2: write `tests/unit/fakes/diagramType.ts`, a diagram type that exists only in the tests (a list of named boxes, one per line of a text file, with one relation kind, one rule, one refusal, one question and a registration), registered without a change to `src/frame/` (SC-011)
- [ ] T051 [P] [US4] PR 2: level 1 test `tests/unit/layers.test.ts`: no file under `src/frame/` contains `gartner`, `agent-behavior`, `ghg` or `abm` or imports from `src/diagrams/`; no file under `src/diagrams/<a>/` imports from `src/diagrams/<b>/`; no core file imports `vscode` or `preact`

### Tests for the frame's core (level 1)

- [ ] T052 [P] [US4] PR 2: `tests/unit/frame/core/lineDocument.test.ts`, ported from the standalone `LineDocument` tests: a text with CRLF, with LF, with no final newline, with mixed endings and with a byte-order mark splits into lines with their own endings and joins back byte for byte; the dominant ending is reported
- [ ] T053 [P] [US4] PR 2: `tests/unit/frame/core/splice.test.ts`, ported from the standalone `LineSplice` tests: a splice replaces whole lines and nothing else; a new line takes the file's dominant ending; overlapping splices are rejected; the inverse, computed from the text it was applied to, gives the text back byte for byte
- [ ] T054 [P] [US4] PR 2: `tests/unit/frame/core/registration.test.ts`: every file of `fixtures/registrations/` and the 13 `.adp` files of `examples/` reads and writes back byte for byte; the origin line after an optional byte-order mark; `body` and `view` known and other headers kept in order and reported; `layout:` entries in ordinal order with numbers of at most three decimals; a stale entry reported and removed at the next write; setting, removing and renaming entries and removing the block as splices; a new registration is the origin line, then `body:` when the base names differ, then the block, with the body's dominant ending (FBL 8.4, 8.5)
- [ ] T055 [P] [US4] PR 2: `tests/unit/frame/core/rowPacking.test.ts`, ported from the standalone `RowPacking` and `rowPackedLayout` tests, and reading `fixtures/cross-tier/row-rounding.json` unchanged (FR-044)
- [ ] T056 [P] [US4] PR 2: `tests/unit/frame/core/textMetric.test.ts`, ported from the standalone `TextMetric` and `textMetrics` tests, and reading `fixtures/cross-tier/text-metric.json` unchanged (FR-044)

### The frame's core

- [ ] T057 [P] [US4] PR 2: port `standalone:` `LineDocument` to `src/frame/core/lineDocument.ts`
- [ ] T058 [US4] PR 2: port `standalone:` `LineSplice` to `src/frame/core/splice.ts`, with the inverse of an ordered list of splices
- [ ] T059 [P] [US4] PR 2: write `src/frame/core/hash.ts`, the hash of a text the edit log and the workspace state compare by
- [ ] T060 [US4] PR 2: write `src/frame/core/registration.ts` (`Registration`, `RegistrationChange`: entries to set, to remove or to rename, or "remove the block"), implementing FBL section 8 as written and porting what `standalone:` `RegistrationLayout` shares with it; where the standalone writer differs (new lines as CRLF), follow FBL
- [ ] T061 [P] [US4] PR 2: port `standalone:` `RowPacking` and the client's `rowPackedLayout.ts` to `src/frame/core/rowPacking.ts`
- [ ] T062 [P] [US4] PR 2: port `standalone:` `TextMetric` and the client's `textMetrics.ts` to `src/frame/core/textMetric.ts`

### Tests for the frame's host (level 2)

- [ ] T063 [P] [US4] PR 2: `tests/unit/frame/host/session.test.ts` with the fakes: the session reads again after every change whoever made it and posts the model, stamped with the document's version, to every view; an intent computed from an older version is dropped, not applied; splices are applied as one `WorkspaceEdit`; a refusal changes nothing and returns the sentence to the view that sent the intent; a question is asked once with a modal dialog and the intent run again with the answer; a read-only reading refuses every intent; a session is created with the first diagram editor and disposed with the last
- [ ] T064 [P] [US4] PR 2: `tests/unit/frame/host/editLog.test.ts`: an entry holds the text's hash before and after and the registration before and after, equal hashes for a marker edit; an undo that takes the text from the top done entry's `after` to its `before` moves the entry to the undone stack and restores `registrationBefore`; a redo does the reverse; any other change clears the undone stack; an entry is only ever matched at the top of its stack, so a typed edit between two diagram edits is not taken for one of them
- [ ] T065 [P] [US4] PR 2: `tests/unit/frame/host/registrationStore.test.ts`: the states `absent`, `pending(new)`, `pending(changed)` and `on disk` of data-model.md; a pending registration is never written without the document being saved; revert or close unsaved returns to what is on disk or absent; it is kept in workspace state under the document's URI and the text's hash and taken back only when the restored text has that hash; a diagram type with `usesRegistration` false never writes one
- [ ] T066 [P] [US4] PR 2: `tests/unit/frame/host/diagnostics.test.ts`: findings become diagnostics in one collection named "ADP" with the source "ADP", the rule id as code, the definition's severity and the line range; they are replaced on every reading and cleared when the last diagram of a document closes; `tests/unit/frame/host/contextKeys.test.ts`: `etalii.adp.diagram`, `etalii.adp.readOnly`, `etalii.adp.selection` and `etalii.adp.can.<action>` follow the focused diagram and are unset without one

### The frame's host

- [ ] T067 [P] [US4] PR 2: write `src/frame/host/editLog.ts` (two stacks, done and undone, as data-model.md, Edit log entry)
- [ ] T068 [P] [US4] PR 2: write `src/frame/host/registrationStore.ts`: reads the `.adp` beside a document, holds the pending text, writes it by splices when the document is saved, creates it on the first placement, drops it on revert, and keeps it across a restart in workspace state (research R6)
- [ ] T069 [P] [US4] PR 2: write `src/frame/host/diagnostics.ts` and `src/frame/host/contextKeys.ts`
- [ ] T070 [US4] PR 2: write `src/frame/host/session.ts`, the document session of data-model.md (`document`, `type`, `reading`, `registration`, `editLog`, `views`, `selection`): the five steps of research R5, the marker edit (one line replaced by itself) for a result with a registration change and no splice, model updates debounced to one per animation frame, and read-only set when the file system is not writable, the file is read-only or the reading says so (FR-037)
- [ ] T071 [US4] PR 2: write `src/frame/host/editorProvider.ts`: one `CustomTextEditorProvider` per registered diagram type with `supportsMultipleEditorsPerDocument`, webviews with scripts enabled, local resources limited to `dist/`, and a content security policy allowing only the bundle's script by nonce and the bundle's stylesheet (FR-001, FR-030)
- [ ] T072 [US4] PR 2: write `src/frame/host/commands.ts` and contribute in `package.json`, all with the category `ADP`: `etalii.adp.openAsText`, `openTextBeside`, `addFromToolbox`, `arrange`, `rename` (F2), `remove` (Delete), `zoomIn`, `zoomOut`, `zoomToFit`, `zoomActualSize` (Ctrl+=, Ctrl+-, Ctrl+9, Ctrl+0, Cmd on macOS) and `selectAll` (Ctrl+A), each key a `keybindings` contribution with a `when` clause on the diagram's context key, the `editor/title` entries, and `commandPalette` clauses hiding those that need a diagram; a command reaches the focused canvas as a `command` message (FR-034)
- [ ] T073 [P] [US4] PR 2: write `src/frame/host/toolboxView.ts` and `src/frame/host/propertiesView.ts` and contribute in `package.json` the view container `etalii-adp` titled "ADP" in the activity bar with the webview views `etalii.adp.toolbox` "ADP Toolbox" and `etalii.adp.properties` "ADP Properties"; each follows the diagram that has the focus and shows one sentence when none has; `addFromToolbox` is a quick pick of the same entries (FR-039 to FR-041)
- [ ] T074 [P] [US4] PR 2: write `src/frame/host/registrationEditor.ts` and contribute in `package.json` the language `etalii.adp.registration` for `.adp` (alias "ADP registration") and the custom editor `etalii.adp.registration` "ADP" for `*.adp` with priority `default`: for a registered origin it opens that diagram on the body and closes itself; for another origin or a body that does not exist it says so, offers the text editor and writes nothing (FR-014)
- [ ] T075 [P] [US4] PR 2: write `src/frame/host/newDocument.ts`: asks for a name with the platform's input and save dialogs, writes what the diagram type's `create` returns and opens it in its diagram (FR-015)
- [ ] T076 [P] [US4] PR 2: write `src/frame/host/behaviorFiles.ts`: keeps a context key listing the paths of the workspace's files that pass a test a diagram type supplies, built once in the background, kept by a file watcher and stopping at 2,000 files; the key's name and the test come from the diagram type, so the frame names neither. Add the member that carries them to `DiagramType` in `src/frame/api.ts` and to `etalii.adp/specs/006-vscode-plugin/contracts/frame-api.md`, which does not have it yet (research R8)
- [ ] T077 [US4] PR 2: write `src/frame/host/testSeam.ts`: `etalii.adp.test.drive`, registered only when `ADP_TEST` is `1` at activation and absent from `package.json`, taking a URI and a list of `Step`s, dispatching pointer and key steps as DOM events inside the real webview and returning one result per step
- [ ] T078 [US4] PR 2: make `src/extension.ts` register the frame and every diagram type of `src/diagrams/index.ts`, and nothing by name

### Tests for the frame's view (level 2)

- [ ] T079 [P] [US4] PR 2: `tests/unit/frame/view/shapes.test.ts`, ported from the standalone client's `segments` and `outline` tests
- [ ] T080 [P] [US4] PR 2: `tests/unit/frame/view/canvas.test.tsx` with the fake diagram type and a fake bridge: pan and zoom; selecting one and several; only elements that meet the viewport are drawn; a drag and a resize go through the type's snap, show the end state until the next model arrives and end as one intent with the document's version; a drag is abandoned when a newer model arrives; drawing a relation; handles on a selection; in-place editing over an element, during which the keys are not let through; tooltips; the context menu lists the type's actions; the refusal line shows a `refused` sentence; nothing that edits is offered when read-only
- [ ] T081 [P] [US4] PR 2: `tests/unit/frame/view/toolbox.test.tsx`: groups and entries with icon, label and description; a drag carries the entry with the type `application/vnd.etalii.adp.toolbox`; Enter sends `add`; one sentence when there is no diagram
- [ ] T082 [P] [US4] PR 2: `tests/unit/frame/view/properties.test.tsx`: groups and fields; each of the seven controls (text, multi-line text, number, choice, slider with labelled stops, tag chips with suggestions, read-only) renders its value and sends its field's intent on change; a field not shown is not rendered; a refusal shows its sentence under the field and returns it to its value; one sentence when there is no selection
- [ ] T083 [P] [US4] PR 2: `tests/unit/frame/view/theme.test.ts`: `frame.css` uses only Visual Studio Code's CSS variables for surfaces, text, borders, focus and inputs and no literal colour

### The frame's view

- [ ] T084 [P] [US4] PR 2: copy `standalone:` client `segments.ts` and `outline.ts` to `src/frame/view/shapes/segments.ts` and `src/frame/view/shapes/outline.ts`
- [ ] T085 [US4] PR 2: write `src/frame/view/bridge.ts` (the messages of the contract, typed, over `acquireVsCodeApi`) and `src/frame/view/main.tsx` (mounts the canvas, the toolbox or the properties by what the host asks for, and resolves the diagram type's `view`)
- [ ] T086 [US4] PR 2: write `src/frame/view/canvas.tsx` with `src/frame/view/canvas/viewport.ts` (pan, zoom, culling to the viewport) and `src/frame/view/canvas/selection.ts`, drawing a `Scene` as SVG with Preact
- [ ] T087 [US4] PR 2: write `src/frame/view/canvas/drag.ts` and `src/frame/view/canvas/handles.tsx`: dragging and resizing through the diagram type's `GestureTable` (snap, preview, the intent on release)
- [ ] T088 [P] [US4] PR 2: write `src/frame/view/canvas/connect.ts`: drawing a relation from one element to another
- [ ] T089 [P] [US4] PR 2: write `src/frame/view/canvas/inlineEditor.tsx`: in-place text editing over an element, opened by the `model` message's label to edit
- [ ] T090 [P] [US4] PR 2: write `src/frame/view/canvas/contextMenu.tsx` and `src/frame/view/canvas/refusalLine.tsx`, and tooltips in `src/frame/view/canvas.tsx`; each menu entry runs its command through the host
- [ ] T091 [P] [US4] PR 2: write `src/frame/view/canvas/ruler.tsx` and `src/frame/view/canvas/chrome.tsx`: the ruler strip pinned to the bottom and the slots a diagram type's `chrome` fills
- [ ] T092 [P] [US4] PR 2: write `src/frame/view/properties/` with one component per control and the grid that groups them
- [ ] T093 [P] [US4] PR 2: write `src/frame/view/frame.css` on Visual Studio Code's CSS variables, with every outline taking the theme's contrast border in the high-contrast themes (FR-036)
- [ ] T094 [US4] PR 2: write `src/frame/view/toolbox/` (the entries with icons taken as SVG paths from `@mdi/js` by name, the drag source, Enter to add) and take the drop on the canvas through the diagram type's `drop`; mounted inside the editor as well, as a strip that folds away, where T047 found the drag does not cross

### The whole frame

- [ ] T095 [US4] PR 2: extend `tests/unit/manifest.test.ts` to the Languages, Custom editors, Views, Commands, Context keys and Menus tables of [contracts/package-manifest.md](contracts/package-manifest.md), as far as PR 2 contributes them: every command has the category `ADP`, every default key is a `keybindings` contribution with a `when` clause
- [ ] T096 [US4] PR 2: level 3 test `tests/real-ide/frame.test.ts`: every contributed command is registered once the plug-in is active; `etalii.adp.test.drive` exists under `ADP_TEST=1`; an `.adp` with an unknown origin opens with its explanation and is not written; the two views exist and say there is nothing to show
- [ ] T097 [US4] PR 2: enter under "The frame" in `docs/parity.md`: the high-contrast themes take the dark and light tokens with the contrast border; new lines in a registration take the file's ending where the standalone writer gives CRLF; the cross-tier `example-models` fixtures and `gesture-ids.json` are not vendored, each with its reason; the Explorer entry stops at 2,000 Markdown files
- [ ] T098 [US4] PR 2: push `features/006-vscode-plugin-frame`, open the pull request into `develop`, see the checks pass; after the merge delete the branch and remove the worktree

**Checkpoint**: a diagram type can be written against `src/frame/api.ts` alone. Phases 7 and 8 can now run side by side.

---

## Phase 7: User Story 2 - Work on a hype cycle graph (Priority: P1)

**Goal**: `.ghg` files open in the Gartner hype cycle graph as `definitions/gartner-hype-cycle-graph.dis` and its companion state, with every edit, refusal, confirmation, rule and piece of canvas chrome.

**Independent Test**: quickstart step 3 on the nine examples, and the 33 hype cycle checks of the standalone `tests.md`.

All paths in this phase are under `src/diagrams/gartner-hype-cycle-graph/` (written `ghg/` below) and `tests/unit/diagrams/gartner-hype-cycle-graph/` (written `tests/ghg/`). The standalone module's 134 backend and 73 client tests are ported into these test files, test for test.

### Tests for User Story 2

- [ ] T099 [P] [US2] PR 3: `tests/ghg/core/roundTrip.test.ts`: each of the 9 examples and 23 fixtures is read, written back with no edit and compared byte for byte, CRLF, LF and a missing final newline included; text that is not YAML at all reads as an empty model with the definition's read-only explanation; an entry that cannot be read becomes the finding `ghg.unreadable-entry` and the rest is read (FR-009, FR-011, SC-002)
- [ ] T100 [P] [US2] PR 3: `tests/ghg/core/phases.test.ts`, ported from `standalone:` `GhgPhases.Tests.cs`: boundaries spread evenly or stored, visible phases, a boundary never landing on its neighbour
- [ ] T101 [P] [US2] PR 3: `tests/ghg/core/scale.test.ts`: 4 canvas units per step, 1900-01 at 0, rows 56 apart, per unit; this host's results equal `fixtures/gartner-hype-cycle-graph/scale-fixture.json`, read unchanged (FR-044)
- [ ] T102 [P] [US2] PR 3: `tests/ghg/core/rules.test.ts`: each rule fixture yields exactly the findings the definition gives, for all twelve `ghg.*` rules, each a warning or the severity the definition states, with the line range of its entry counted from 0 (FR-020)
- [ ] T103 [P] [US2] PR 3: `tests/ghg/core/edits.test.ts`, ported from the standalone command handler tests: for every intent of data-model.md (add a trend, a trigger or a note; rename; set a placement; set a span; set the phase count; set a boundary; even the phases; add an influence with both ends; set one end's attachment; remove an influence; set tags; set a description; set a note's text; set a note's size and position; set the unit; remove an element) the splices change exactly the lines the definition names and keep comments, blank lines, key order and unknown keys; every refusal returns the definition's sentence, among them "A trend showing 4 phases must be at least 4 months long, one per phase." and a second influence in the same direction; removing an element with influences returns a question that names how many go with it, and one without is removed at once; no result carries a registration change (FR-010, FR-018)
- [ ] T104 [P] [US2] PR 3: `tests/ghg/core/arrangement.test.ts`, ported from the standalone `GhgArrangement` tests: only `row` lines change; as few rows as the elements allow; an entry without an id, a trend without a span, a trigger without a date and a note that cannot be placed keep their rows; the refusals "There is nothing to arrange until this graph has a trend." and "This graph is already arranged." (FR-021)
- [ ] T105 [P] [US2] PR 3: `tests/ghg/conformance.test.ts`: read `definitions/gartner-hype-cycle-graph.dis` and compare with the code the origin `gartner/hypecycle-graph` and language id, the toolbox groups, entries, icons and descriptions, the context menu labels and shortcuts, the form sections and field labels, the theme tokens per mode, the rule ids the `.dis` tags, the layout constants and the "Arrange diagram" operation; compare the element kinds with `fixtures/cross-tier/element-types.json` (research R2, FR-006)
- [ ] T106 [P] [US2] PR 3: `tests/ghg/host/host.test.ts`, ported from the standalone property provider and action tests: the toolbox entries; the property groups and fields per element kind with the control the definition's form asks for, shown or hidden by its conditions, each with the intent a change sends; the actions per selection, "Even Phases" only for a trend with a stored boundary, "Edit text..." for a note
- [ ] T107 [P] [US2] PR 3: `tests/ghg/view/scene.test.ts`, ported from the standalone client tests: for every example the place, size, path and class of every trend banner, phase, trigger circle with name and date, note box and influence curve, with the curve meeting the trend's edge at a right angle at its phase, edge and fraction; what the tag filter hides under Any and under All; the Compact layout of every example, which places every trend by all the others; the ruler's rungs by unit and spacing; the phase legend; the view state starting at its defaults and never written (FR-017, FR-019)
- [ ] T108 [P] [US2] PR 3: `tests/ghg/view/gestures.test.ts`: the snapping the definition gives each gesture (move, resize, boundary drag, note resize, an influence's end along a phase's edge) and the intent each releases; a toolbox drop in Compact behaves as the definition says; `tests/ghg/view/contrast.test.ts`: the contrast tests the standalone host has for the phase tokens, in each theme class

### Implementation for User Story 2

- [ ] T109 [US2] PR 3: write `ghg/core/model.ts`: the diagram's `unit` and four lists (trends, triggers, notes, influences), each entry with the line range it was read from, ids unique across all four
- [ ] T110 [US2] PR 3: port the standalone reader to `ghg/core/parser.ts` on `yaml` 2 with the line of every node: tolerant, never throwing, the header `gartner-hypecycle-graph: 1`, unreadable entries as findings, an unreadable text as an empty read-only model
- [ ] T111 [US2] PR 3: port the standalone writer to `ghg/core/writer.ts`: every change as line splices, never through a YAML library
- [ ] T112 [P] [US2] PR 3: port `standalone:` `GhgPhases` to `ghg/core/phases.ts` (`boundariesOf` and the rest, names kept)
- [ ] T113 [P] [US2] PR 3: port the standalone scale and the scale part of the client's `ghgIds.ts` to `ghg/core/scale.ts`
- [ ] T114 [P] [US2] PR 3: port the twelve rules to `ghg/core/rules.ts`
- [ ] T115 [P] [US2] PR 3: write `ghg/core/create.ts`: the content the definition gives a new graph
- [ ] T116 [US2] PR 3: in `ghg/core/edits.ts`, `edit` for adding a trend, a trigger or a note, renaming, setting a placement and setting a span, with their refusals
- [ ] T117 [US2] PR 3: in `ghg/core/edits.ts`, setting the phase count, setting a boundary and evening the phases, with their refusals
- [ ] T118 [US2] PR 3: in `ghg/core/edits.ts`, adding an influence with both ends, setting one end's attachment and removing an influence, with their refusals
- [ ] T119 [US2] PR 3: in `ghg/core/edits.ts`, setting tags, a description, a note's text, a note's size and position, and the unit
- [ ] T120 [US2] PR 3: in `ghg/core/edits.ts`, removing an element: a question, styled as dangerous, when influences go with it, and the removal of the element and those influences as one edit
- [ ] T121 [US2] PR 3: port `standalone:` `GhgArrangement.cs` to `ghg/core/arrangement.ts` on the frame's `rowPacking` and `textMetric`, and answer the `arrange` intent in `ghg/core/edits.ts`
- [ ] T122 [P] [US2] PR 3: write `ghg/host/toolbox.ts`
- [ ] T123 [P] [US2] PR 3: port the standalone property provider to `ghg/host/properties.ts`
- [ ] T124 [P] [US2] PR 3: port the standalone context actions to `ghg/host/actions.ts`, the background's "Arrange diagram" among them
- [ ] T125 [US2] PR 3: write `ghg/view/scene.ts`: the pure `scene` from model, view state and viewport, with the standalone geometry and constants
- [ ] T126 [US2] PR 3: write `ghg/view/compact.ts`, the row-packed Compact layout over the whole document
- [ ] T127 [US2] PR 3: write `ghg/view/gestures.ts`: the gesture table per element kind and `drop`
- [ ] T128 [US2] PR 3: write `ghg/view/chrome.tsx`: the tag filter with chips and the Any/All switch, the phase legend, the Compact switch and the ruler's rungs
- [ ] T129 [P] [US2] PR 3: write `ghg/view/ghg.css`: the definition's theme tokens as CSS variables keyed on `vscode-light`, `vscode-dark`, `vscode-high-contrast` and `vscode-high-contrast-light`
- [ ] T130 [US2] PR 3: write `ghg/index.ts` (origin `gartner/hypecycle-graph`, display name "Gartner hype cycle graph", view type `etalii.adp.gartner.hypecycle-graph`, `usesRegistration` false), name it in `src/diagrams/index.ts`, and contribute in `package.json`: the language `etalii.adp.gartner.hypecycle-graph` for `.ghg` with the YAML grammar and language configuration, the custom editor for `*.ghg` with priority `default`, the commands `etalii.adp.newHypeCycleGraph`, `etalii.adp.gartner.hypecycle-graph.evenPhases` and `.toggleCompact`, and their `explorer/context` and `file/newFile` entries; findings are published whenever a `.ghg` is open, in either editor (FR-003, FR-012)

### The whole diagram type

- [ ] T131 [P] [US2] PR 3: `tests/ghg/changedLines.test.ts`: every edit kind on every example changes only the lines the definition names for it, and its inverse gives the example back byte for byte (SC-004)
- [ ] T132 [P] [US2] PR 3: `tests/ghg/performance.test.ts`: reading `technology-trends.ghg` (200 trends, 4,194 lines), checking its rules and building its scene stays under 100 ms (research R16)
- [ ] T133 [US2] PR 3: level 3 test `tests/real-ide/hypeCycleGraph.test.ts` through the test seam: a `.ghg` opens in the diagram by default, with and without an `.adp` beside it; a drag on the canvas and a field of ADP Properties each change the file's text as one step; undo and redo; save, and the file on disk checked after each step; a save without an edit is byte-identical; `rule-boundary-order.ghg` puts one warning with the code `ghg.boundary-order` in the diagnostics; an edit in the text editor reaches the diagram and one in the diagram reaches the text editor; a refusal leaves the file unchanged; "Arrange Diagram" changes only `row:` lines (FR-045)
- [ ] T134 [US2] PR 3: work through the 33 hype cycle checks of `standalone:` `tests.md` and quickstart step 3 in the installed plug-in, in a light, a dark and a high-contrast theme; enter every check that does not pass, with its reason, under "Gartner hype cycle graph" in `docs/parity.md`
- [ ] T135 [US2] PR 3: push `features/006-vscode-plugin-hype-cycle-graph`, open the pull request into `develop`, see the checks pass; after the merge delete the branch and remove the worktree

**Checkpoint**: the nine example graphs open, edit, undo and save as the definition states.

---

## Phase 8: User Story 3 - Work on an agent's behavior model (Priority: P1)

**Goal**: a Markdown file opens, by choice, as an Agent Behavior Modelling diagram as `definitions/agent-behavior-modelling.dis` and its companion state, with dragged positions kept in the `.adp` registration and undone with the Markdown.

**Independent Test**: quickstart step 4 on the four examples, checking the Markdown and the registration after every gesture.

All paths in this phase are under `src/diagrams/agent-behavior-modelling/` (written `abm/` below) and `tests/unit/diagrams/agent-behavior-modelling/` (written `tests/abm/`). The standalone module's 50 backend and 17 client tests are ported into these test files. This phase starts only when T046 passed.

### Tests for User Story 3

- [ ] T136 [US3] PR 4: write `fixtures/agent-behavior-modelling/` from the inline strings of the standalone tests: one Markdown file per `abm.*` rule and one per line-ending case (CRLF, LF, no final newline, mixed), with a `PROVENANCE.md` saying which standalone test each came from, and mark them `-text` (research R13)
- [ ] T137 [P] [US3] PR 4: `tests/abm/core/roundTrip.test.ts`: each of the 4 examples and every fixture is read, written back with no edit and compared byte for byte, line endings included (FR-009, SC-002)
- [ ] T138 [P] [US3] PR 4: `tests/abm/core/parser.test.ts`: the tree is the list under the first `Behavior` or `Behaviour` heading; a second such heading and a tree quoted in a fenced code block are never read as one; a node, its children and its notes; the eleven keywords; Retry's count; an item without a keyword is an implicit "Do"; ids are places (`1.2.1`); each node carries the line range of its item and of its whole subtree; a file with no such section is an empty model with the definition's information finding; the heading test (`SuggestsBody`) the Explorer entry uses (FR-022)
- [ ] T139 [P] [US3] PR 4: `tests/abm/core/layout.test.ts`: nodes 200 by 60, 28 between siblings, 56 between levels; the children of one parent share a row; a row at a height stored in the registration; a row never closer than 16 to its parent; `examples/agent-behavior-modelling/research-assistant.md` with its `.adp` (`1.2: 360 160`) hangs that row lower (FR-023)
- [ ] T140 [P] [US3] PR 4: `tests/abm/core/rules.test.ts`: each rule fixture yields exactly the findings the definition gives for the seven `abm.*` rules, with the definition's severity and the item's line, `abm.no-keyword` among them (FR-025)
- [ ] T141 [P] [US3] PR 4: `tests/abm/core/edits.test.ts`, ported from the standalone command tests: add a node of a kind at a drop point, placed under the nearest node above with room, into an empty tree, into a file without a tree, and refused when no node above has room; rename; set the kind, refused with "\"Check\" holds no children, and this node has 2 children." for a kind that cannot hold the node's children; set the attempts; set the notes; move earlier and later; arrange a node (its new index among its siblings and its row's height, in one step); re-parent, refused for a line to a leaf; remove with everything under it. Each answers with splices on the tree's list lines only, with a registration change (set, remove, rename) where stored ids move, and a drag that only changes a row's height answers with a registration change and no splice (FR-010, FR-024)
- [ ] T142 [P] [US3] PR 4: `tests/abm/core/arrangement.test.ts`: "Arrange diagram" answers with "remove the block" and no splice; refused with "This behavior model was opened without a registration, so it has no dragged positions to forget." and with "This behavior model is already arranged." (FR-026)
- [ ] T143 [P] [US3] PR 4: `tests/abm/conformance.test.ts`: read `definitions/agent-behavior-modelling.dis` and compare with the code the origin `etalii/agent-behavior-modelling` and language id, the toolbox groups, entries, icons and descriptions, the context menu labels and shortcuts (F2, Delete, Alt+Up, Alt+Down), the form sections and field labels, the family colour tokens per mode, the rule ids and severities, the layout constants and the "Arrange diagram" operation; compare the element kinds with `fixtures/cross-tier/element-types.json` (FR-006)
- [ ] T144 [P] [US3] PR 4: `tests/abm/host/host.test.ts`: the toolbox's eleven kinds; the property fields for kind, label, attempts (shown for a Retry only) and notes; the actions per selection, "Move Earlier" only for a node that is not first and "Move Later" only for one that is not last
- [ ] T145 [P] [US3] PR 4: `tests/abm/view/scene.test.ts`: for every example the place, size and shape of each node (eleven shapes), its family colour class, the keyword above the label, and the dashed outline of an implicit "Do"; `tests/abm/view/drag.test.ts`, ported from the standalone `abmDrag` tests: a dragged node moves with its subtree, siblings step aside while it moves, and the release is the arrange-a-node intent with the index and the height; `tests/abm/view/contrast.test.ts` for the family tokens
- [ ] T146 [P] [US3] PR 4: level 2 test `tests/abm/registrationUndo.test.ts` with the session and the fake `vscode` API: a drag that reorders and lowers is one undo step that puts the Markdown and the pending registration back together; a drag that only lowers a row applies a marker edit, leaves the Markdown's bytes unchanged, makes the document dirty and is undone in one step; "Arrange diagram" likewise; the registration is written on save and created on the first placement; revert drops it

### Implementation for User Story 3

- [ ] T147 [US3] PR 4: write `abm/core/kinds.ts` (the eleven kinds with keyword, family and how many children each holds) and `abm/core/model.ts` (roots, nodes with kind, label, attempts, notes, whether the keyword was missing, children in order, place as id, line ranges, and where the Behavior section is)
- [ ] T148 [US3] PR 4: port the standalone line reader to `abm/core/parser.ts`, without a Markdown library, with the id part of the client's `abmIds.ts` and the heading test `suggestsBody`
- [ ] T149 [US3] PR 4: port the standalone writer to `abm/core/writer.ts`: list lines as splices, a subtree moved with everything under it, a tree added to a file without one
- [ ] T150 [P] [US3] PR 4: port the standalone tree layout to `abm/core/layout.ts`: the computed positions, then the registration's row heights
- [ ] T151 [P] [US3] PR 4: port the seven rules to `abm/core/rules.ts`
- [ ] T152 [P] [US3] PR 4: write `abm/core/create.ts`: the title, the "How to follow the behavior" legend and `- **Do in order:** Handle the request`
- [ ] T153 [US3] PR 4: in `abm/core/edits.ts`, `edit` for adding a node at a drop point, renaming, and setting the kind, the attempts and the notes, with their refusals
- [ ] T154 [US3] PR 4: in `abm/core/edits.ts`, move earlier, move later, re-parent and remove, each with the registration change that renames or removes the stored ids that move
- [ ] T155 [US3] PR 4: in `abm/core/edits.ts`, arrange a node: the reorder and the row's height as one result, a registration change alone when no sibling is passed
- [ ] T156 [US3] PR 4: port `standalone:` `Commands/ArrangeAbmCommand.cs` to `abm/core/arrangement.ts` and answer the `arrange` intent in `abm/core/edits.ts`
- [ ] T157 [P] [US3] PR 4: write `abm/host/toolbox.ts`, `abm/host/properties.ts` and `abm/host/actions.ts`
- [ ] T158 [US3] PR 4: write `abm/view/scene.ts` on the frame's `outline` and `segments`
- [ ] T159 [US3] PR 4: copy `standalone:` client `abmDrag.ts` to `abm/view/drag.ts` and write `abm/view/gestures.ts`: the drag, re-parenting by drawing a line, and `drop` under the nearest node above with room
- [ ] T160 [P] [US3] PR 4: write `abm/view/abm.css`: the family colour tokens per theme class, following the definition as T009 left it
- [ ] T161 [US3] PR 4: write `abm/index.ts` (origin `etalii/agent-behavior-modelling`, display name "Agent Behavior Modelling", view type `etalii.adp.etalii.agent-behavior-modelling`, `usesRegistration` true, the heading test and the context key `etalii.adp.behaviorFiles` for T076), name it in `src/diagrams/index.ts`, and contribute in `package.json`: the custom editor for `*.md` with priority `option`, the commands `etalii.adp.newBehaviorModel`, `etalii.adp.openAsBehaviorModel` and `etalii.adp.etalii.agent-behavior-modelling.moveEarlier` (Alt+Up), `.moveLater` (Alt+Down) and `.editNotes`, the `explorer/context` entry with `resourceExtname == .md && resourcePath in etalii.adp.behaviorFiles`, the `editor/title` and `file/newFile` entries; findings are published for a Markdown file only while it is open as a behavior model (FR-003, FR-013)

### The whole diagram type

- [ ] T162 [P] [US3] PR 4: `tests/abm/changedLines.test.ts`: every edit kind on every example changes only the list lines the definition names, never prose outside the tree, and its inverse gives the Markdown and the registration back byte for byte (SC-004)
- [ ] T163 [US3] PR 4: level 3 test `tests/real-ide/behaviorModel.test.ts` through the test seam: a Markdown file opens in the text editor by default and as a behavior model by the command; a drag past a sibling and a field of ADP Properties each change the Markdown as one step; undo and redo put the Markdown and the registration back together; save writes the `.adp`, and both files on disk are checked after each step; a drag that only lowers a row leaves the Markdown without a diff and the `.adp` with one; "Arrange Diagram" removes the `layout:` block and one undo restores it; a fixture puts `abm.no-keyword` in the diagnostics; the text editor and the diagram follow each other; opening `research-assistant.adp` opens the diagram on its body (FR-014, FR-045)
- [ ] T164 [US3] PR 4: work through quickstart step 4 in the installed plug-in, open `research-assistant.md` here and in the standalone IDE and see the same row at the same height, and close and reopen Visual Studio Code with an unsaved dragged row; enter every difference, with its reason, under "Agent Behavior Modelling" in `docs/parity.md`, the leaf colours among them if T009 left the hosts apart
- [ ] T165 [US3] PR 4: push `features/006-vscode-plugin-behavior-modelling`, open the pull request into `develop`, see the checks pass; after the merge delete the branch and remove the worktree

**Checkpoint**: the four example agents open, edit, undo and save; positions travel between this host and the standalone IDE.

---

## Phase 9: User Story 7 - The definitions describe what both hosts do (Priority: P2)

**Goal**: the VS Code repository lists its two tools and every difference from their definitions, and the definitions name this host. The first half of this story, "Arrange diagram" in the definitions, was delivered in phase 2 (T004 to T011).

**Independent Test**: quickstart step 8.

- [ ] T166 [P] [US7] PR 5: level 1 test `tests/unit/docs.test.ts`: `docs/tools.md` has a row for `gartner/hypecycle-graph` "Gartner hype cycle graph" and one for `etalii/agent-behavior-modelling` "Agent Behavior Modelling", each of kind Diagram with a state; `docs/parity.md` has the three sections; every relative link in `README.md` and `docs/` resolves
- [ ] T167 [P] [US7] PR 5: write `docs/tools.md` in the format of the standalone and IntelliJ catalogues: one row per diagram type with its state in this host, origin, display name and kind (FR-059)
- [ ] T168 [US7] PR 5: complete `docs/parity.md`: go through every edit, refusal, confirmation and rule the two definitions list and see that each is demonstrated by a named automated test or entered with its reason; compare the two hosts side by side on one example of each diagram type and enter whatever is in neither (FR-007, SC-003)
- [ ] T169 [P] [US7] PR 5: bring `README.md` in line with what was delivered: the two diagrams, opening a Markdown file as a behavior model, ADP Toolbox and ADP Properties, and links to `docs/tools.md` and `docs/parity.md`
- [ ] T170 [US7] PR 5: push `features/006-vscode-plugin-catalogue`, open the pull request into `develop`, see the checks pass; after the merge delete the branch and remove the worktree
- [ ] T171 [US7] PR B: in a worktree of `etalii.adp` on `features/006-vscode-plugin-hosts`, add `etalii.adp.ide.vscode` to the line that names the hosts in `etalii.adp/definitions/diagrams/gartner-hype-cycle-graph.md` and in `etalii.adp/definitions/diagrams/agent-behavior-modelling.md`, beside the standalone host (FR-029); run `python .github/scripts/validate-examples.py`; push, open the pull request into `develop`, and after the merge delete the branch and remove the worktree

---

## Phase 10: Polish & cross-cutting concerns

**Purpose**: prove the delivered feature as a reviewer would, and leave nothing behind.

- [ ] T172 Work through `etalii.adp/specs/006-vscode-plugin/quickstart.md` steps 1 to 8 against the merged `develop` of both repositories, step 5 (the frame with one diagram of each type side by side: focus, shared undo, theme change, a rebound shortcut, restart with an unsaved edit, a read-only file) included
- [ ] T173 [P] Make the three negative checks of quickstart step 2, each reverted afterwards: a splice in `src/frame/core/splice.ts` that replaces one line too many fails a level 1 round-trip test; a boundary landing on its neighbour in `src/diagrams/gartner-hype-cycle-graph/core/phases.ts` fails a test ported from `GhgPhases.Tests.cs`; a command removed from `package.json` fails the manifest test and the level 3 command test
- [ ] T174 [P] Time and record in the pull request that closes the feature: front page to an open example under 3 minutes (SC-001); each of the 13 examples drawn within 2 seconds (SC-005); `npm test` within 10 minutes locally and the Build run within 15 (SC-008); fresh clone to a breakpoint in each half under 10 minutes (SC-009)
- [ ] T175 [P] Confirm SC-011 on `develop` of `etalii.adp.ide.vscode`: `npm run lint` passes and `git grep -n "gartner\|agent-behavior\|ghg\|abm" -- src/frame` finds nothing
- [ ] T176 Confirm in both repositories that every branch of this feature is deleted locally and on `origin` and every worktree removed, and that the development build on the Releases page of `etalii.adp.ide.vscode` is the head of `develop`

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (phase 1)**: none. T003 can wait for the owner while T004 to T008 proceed; T009 needs it.
- **Foundational (phase 2)**: PR A (T004 to T011) and PR 0 (T012 to T015) are independent of each other. The skeleton (T016 to T025) needs T015; T024 needs T011.
- **User stories 1, 5 and 6 (phases 3 to 5)**: one pull request, PR 1. T030 calls the scripts of T016, T023 and T028; T044 closes all three.
- **User story 4 (phase 6)**: needs PR 1 merged. T046 and T047 come first.
- **User stories 2 and 3 (phases 7 and 8)**: each needs PR 2 merged; they do not depend on each other. Phase 8 also needs T046 passed and T009 settled.
- **User story 7 (phase 9)**: needs PR 3 and PR 4 merged; T171 needs T170.
- **Polish (phase 10)**: needs everything.

### Within each story

- Tests are written and seen failing before the code they cover.
- Core before host and view; `model` before `parser` before `writer` before `edits`; `index.ts` and the `package.json` contributions last.
- Tasks on the same file (`edits.ts`, `package.json`, `README.md`, `docs/parity.md`, `build.yml`) are sequential.

### Parallel opportunities

- T004, T005, T007, T008 (four files); T012 and T013; T017 to T023 and T025.
- T026, T027, T029, T032; T033 to T035; T038 to T040.
- In phase 6: T049 to T056 (fakes and core tests); T057, T059, T061, T062; T063 to T066; T067 to T069; T073 to T076; T079 to T083; T088 to T093.
- Phases 7 and 8 as a whole, by two contributors; within them, all test tasks (T099 to T108, T137 to T146).

---

## Parallel example: user story 2

```text
# After PR 2 is merged, the tests of the hype cycle graph together:
Task: "tests/ghg/core/roundTrip.test.ts"          (T099)
Task: "tests/ghg/core/phases.test.ts"             (T100)
Task: "tests/ghg/core/scale.test.ts"              (T101)
Task: "tests/ghg/core/rules.test.ts"              (T102)
Task: "tests/ghg/core/edits.test.ts"              (T103)
Task: "tests/ghg/core/arrangement.test.ts"        (T104)
Task: "tests/ghg/conformance.test.ts"             (T105)

# Then, once model, parser and writer exist (T109 to T111):
Task: "ghg/core/phases.ts"   (T112)
Task: "ghg/core/scale.ts"    (T113)
Task: "ghg/core/rules.ts"    (T114)
Task: "ghg/core/create.ts"   (T115)
```

---

## Implementation Strategy

### MVP first

1. Phases 1 and 2: the definitions, the constitution, a package that builds.
2. Phases 3 to 5, pull request 1: the plug-in is offered from every run and as the development build, with its three test levels and one-step debugging.
3. **Stop and validate** with quickstart steps 1, 2 and 6. What is offered installs and does nothing yet: that is user story 1 on its own, and it gives every later pull request its checks.

### Incremental delivery

1. Pull request 2, the frame: nothing new for a user, everything for the next two.
2. Pull request 3, the hype cycle graph: the first tool a user can work with.
3. Pull request 4, Agent Behavior Modelling, beside or after 3.
4. Pull request 5 and PR B: the catalogue, the parity record, the definitions naming this host.

Each pull request into the VS Code repository leaves `develop` with a plug-in that installs and a development build that is its head.

### Two contributors

After pull request 2, one takes phase 7 and the other phase 8. They meet only in `src/diagrams/index.ts`, `package.json` and `docs/parity.md`, each adding lines of their own.

---

## Notes

- Three things can stop the work and send it back: a principle changed in ratification (T015), spike S1 failing (T046), and a re-read of the hype cycle companion that finds a difference the definition should not simply follow (T005, raised with the owner as O1 was).
- `fixtures/registrations/` (T024) and the member of `DiagramType` that carries the heading test (T076) are not in the plan's structure or the frame contract yet; each task says where it adds them.
- Tasks done by hand (T042, T047, T134, T164, T172 to T174) record their result where the task says, so a later reader does not have to repeat them to know.
