# Tasks: The Gartner Hype Cycle Graph as a Notion Add-on

**Input**: [plan.md](plan.md), [notion-hype-cycle-addon.spec.md](notion-hype-cycle-addon.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/addon-address.md](contracts/addon-address.md), [contracts/store.md](contracts/store.md), [contracts/service.md](contracts/service.md), [contracts/published-tree.md](contracts/published-tree.md), [contracts/shared-parts.md](contracts/shared-parts.md)

**Scale note**: 134 tasks over three repositories (`etalii.adp`, `etalii.adp.ide.notion`, `etalii.adp.site`) and the Notion workspace, about 110 files, four pull requests and ten sets of pages in the Showcase. Watch three things. The data model was reviewed after the contracts and the research were written and differs from them in four places; the analysis of 2026-10-08 brought the store contract, the shared-parts contract, the research and the plan in line (T011, T012, T015 and T016, ticked then), T013 and T014 finish that before any code is written, and the code follows the data model. The Cloudflare Worker comes last, as the maintainer asked on 2026-10-08: until Phase 8 the service is the local one of T028, a small Node process around the same handler the Worker wraps. Ten tasks are a maintainer's and are marked **Maintainer**: the Cloudflare account, the Notion integration, the secrets, a token for the Showcase, the first pass in Notion, timing the set-up steps, and the four merges. Nothing can be seen in a Notion page before T119, so the passes in Notion are in the last phase, not at the end of each story; the one exception is T078, the pass that shows whether access can be granted from an embed block at all, which is made before any story is built.

**Tests**: asked for by the plan (Testing, research D15). Each module is written with its unit test in the same task. The tests that state a story's outcome are under that story's `### Tests` and are written first, to fail.

**Organization**: by user story. The stories are built in order: Story 2 edits what Story 1 draws, and Story 3 undoes what Story 2 does. Each ends in a state its tests show; what only Notion shows is checked in Phase 8.

## Format: `- [ ] **T###** [P?] [US#] Description · path`

- **[P]**: independent of the other tasks of its wave (a different file, no unfinished dependency)
- **[US#]**: the user story of the specification the task serves

## Path conventions

- Every path starts with its repository. The clones sit side by side (`C:\git\<repository>` locally, `/home/user/<repository>` in a cloud session).
- The work of `etalii.adp.ide.notion` and `etalii.adp.site` is on a branch named `features/012-notion-hype-cycle-addon`, in its own worktree, started from a fetched `origin/develop`. The local clone of the Notion repository is four commits behind.
- A file copied from another repository is read from that repository's `origin/develop` at the commit noted in T002 or T003, never from its working tree. The specification is read from `etalii.adp` at the commit of T020.
- A task that names a module and a test writes both. A path under `Notion workspace/` is a page or a database, not a file.
- The pull requests: **1** `etalii.adp` (glossary, principles, this feature's folder), **2** `etalii.adp.ide.notion`, **3** `etalii.adp.site`, **4** `etalii.adp` (the record, and T129). Each is merged with a merge commit. The description of 2 and 3 names `specs/012-notion-hype-cycle-addon/` and the `etalii.adp` commit its tasks were taken from.

> **Ticking**: a task whose file lands in another repository is ticked only after that repository's pull request is merged (T119 for pull request 2, T131 for 3), never when the file is written or pushed. Tasks of `etalii.adp` itself, and tasks that are a setting, a page of the workspace or a check, are ticked when done.

---

## Phase 1: Setup

**Purpose**: the worktree, the sources of the copied files, and the Notion repository's first tooling.

**Wave 1: independent (different repositories)**

- [x] **T001** [P] Fetch `etalii.adp.ide.notion` and create a worktree on a new branch `features/012-notion-hype-cycle-addon` from `origin/develop` · etalii.adp.ide.notion/.claude/worktrees/012-notion-hype-cycle-addon
- [x] **T002** [P] Fetch `etalii.adp.ide.vscode` and note the commit of its `origin/develop`: the source of `src/core/fbl` (T033), of the nine examples in `examples/gartner-hypecycle-graph/` and of the places its `src/core/gartner-hypecycle-graph/view.ts` computes for them (T035) · etalii.adp.ide.vscode
- [x] **T003** [P] Fetch `etalii.adp.ide.standalone` and note the commit of its `origin/develop`: the source of the binding (T034), of the test fixtures (T035), and of `src/backend/EtAlii.Adp.History`, which T027 and T036 follow · etalii.adp.ide.standalone

**⟶ Wait for T001 to finish, then:**

**Wave 2: independent (different files)**

- [x] **T004** [P] Add the package: the scripts `build`, `test`, `lint` and `typecheck`; the development dependencies `typescript`, `esbuild`, `vitest`, `jsdom`, `eslint` and `wrangler`; the dependencies `yaml` and `@marcbachmann/cel-js`. Run `npm install` to write the lock file. Check that the licence of each is Apache-2.0-compatible, and name each with its licence in the description of pull request 2 (Notion principles, Publication and Technology Constraints) · etalii.adp.ide.notion/package.json, etalii.adp.ide.notion/package-lock.json
- [x] **T005** [P] Configure TypeScript 5.9 for browser modules, strict, with `src/`, `service/` and `test/` · etalii.adp.ide.notion/tsconfig.json
- [x] **T006** [P] Configure vitest, with jsdom for the tests under `test/panels/`, `test/frame/` and `test/canvas/` · etalii.adp.ide.notion/vitest.config.mts
- [x] **T007** [P] Configure eslint as the Visual Studio Code host does, with `src/fbl/` left out because it is a copy · etalii.adp.ide.notion/eslint.config.mjs
- [x] **T008** [P] Ignore `node_modules/` and the build's output folder · etalii.adp.ide.notion/.gitignore
- [x] **T009** [P] Run `npm ci` when `node_modules` is missing or older than `package-lock.json`, and nothing otherwise, as the script of that name in the Visual Studio Code host (research D12) · etalii.adp.ide.notion/scripts/ensure-dependencies.mjs

---

## Phase 2: Foundational

**Purpose**: the vocabulary and the contracts every other task reads, then the parts every story stands on: the copies, the history, the store's rows, the start of the interpreter, the service, the frame and the build. No story starts before T078.

Files in `etalii.adp`: `docs/terminology.md`, `.specify/memory/repositories/etalii.adp.ide.notion.md`, `specs/012-notion-hype-cycle-addon/contracts/store.md`, `contracts/shared-parts.md`, `contracts/service.md`, `contracts/addon-address.md`, `research.md`, `plan.md`, `specs/011-notion-repository/contracts/published-tree.md`

Files in `etalii.adp.ide.notion`: `scripts/sync-fbl.mjs`, `scripts/sync-specifications.mjs`, `scripts/sync-examples.mjs`, `scripts/build.mjs`, `addons/gartner-hype-cycle-graph/` (all five files), `src/fbl/`, `src/shims/node-crypto.ts`, `src/history/`, `src/disl/expressions.ts`, `src/disl/specification.ts`, `src/disl/support.ts`, `src/disl/metamodel.ts`, `src/disl/persistence.ts`, `src/store/notion.ts`, `src/store/session.ts`, `src/store/schema.ts`, `src/store/rows.ts`, `src/panels/notion.css`, `src/frame/config.ts`, `src/frame/page.ts`, `src/frame/main.ts`, `src/frame/frame.css`, `service/handler.ts`, `scripts/service.mjs`, `test/examples/`, `test/fixtures/`, `test/support/memoryNotion.ts`, `test/words.test.ts`, the unit tests of the modules above, `.github/workflows/build.yml`

### Part A: `etalii.adp`, pull request 1

- [x] **T010** Define **Store** as the Notion database that holds one document of a tool, its only store, and say how it stands beside **Body**. Commit it alone, before any commit of T011 to T018 (spec, Assumptions; plan, Constitution Check) · etalii.adp/docs/terminology.md

**⟶ Wait for T010 to finish, then:**

**Wave 1: independent (different files)**

- [x] **T011** [P] Bring the store contract in line with the data model: a reference is a Notion relation between two rows and is read as the related row's stored id, with at most one row and the allowed kinds checked as findings; state the rule that resolves a splice to its rows and properties from the binding alone; say whether a trashed row's id survives an undo; remove "the rows that differ" (data model: Store schema, Row, Edit; FR-007) · etalii.adp/specs/012-notion-hype-cycle-addon/contracts/store.md
- [x] **T012** [P] Add the `history` part to the parts table, between the interpreter and the store, with its interfaces (command, handler, dispatcher, history stack); say that `edit`, `undo` and `redo` of an open document are dispatches through it; name `src/frame/parts/` as where a story's wiring lives; add the collapsed state of a panel (data model: History, Shared part, Toolbox and property grid; FR-028) · etalii.adp/specs/012-notion-hype-cycle-addon/contracts/shared-parts.md
- [x] **T013** [P] State how long a token is valid and how it is renewed: find out whether Notion renews a token without the person, add the endpoint and the forwarded call if it does, and say that it does not if it does not; a token is asked for only when a call needs one. Find out as well how Notion says, when a store is opened, that the person may not write to it, and state that signal for the state `read-only`, or state that there is none before a refused write (data model: Access; FR-010, FR-021) · etalii.adp/specs/012-notion-hype-cycle-addon/contracts/service.md
- [x] **T014** [P] Name the local-storage key of a panel's collapsed state, per add-on and per panel, and say that `setup` asks for no token (data model: Open document, Toolbox and property grid) · etalii.adp/specs/012-notion-hype-cycle-addon/contracts/addon-address.md
- [x] **T015** [P] Rewrite D3 and D9 as the data model has them: the rows are the source of truth below the binding and an edit writes the rows its splices land on; the history is command based, a part of its own, after the standalone application's `EtAlii.Adp.History` · etalii.adp/specs/012-notion-hype-cycle-addon/research.md
- [x] **T016** [P] Add `src/history/`, `src/shims/` and `src/frame/parts/` to the source tree, and say that the build bundles `src/frame/main.ts` together with every module directly under `src/frame/parts/`, so that each story's wiring is a file of its own · etalii.adp/specs/012-notion-hype-cycle-addon/plan.md
- [x] **T017** [P] Amend the Notion repository's principles from 1.0.0 to 1.1.0 (MINOR) through `/speckit-constitution`: the service is named beside GitHub Pages, "no `npm install` before it" becomes "the script installs what it needs", and "in etalii.adp" becomes "the binding its specification names", and in principle I "the id of that tool type" becomes "the name of the tool type's specification file, without its extension" (plan, Complexity Tracking) · etalii.adp/.specify/memory/repositories/etalii.adp.ide.notion.md
- [x] **T018** [P] Add one line that points at the contract that replaces it · etalii.adp/specs/011-notion-repository/contracts/published-tree.md
- [x] **T019** [P] Raise the four differences of the research as issues in `etalii.adp`: the `.dis` says DISL `0.3` and points at the `0.2` schema; the binding lives in the standalone repository and is named by its `develop` branch; the four things the specification leaves unstated; the unit and the header are "changed in the file itself" (FR-003) · etalii.adp (GitHub issues)

**⟶ Wait for Wave 1 to finish, then:**

- [x] **T020** Run `python .github/scripts/validate-examples.py` and `python .github/scripts/licence-check.py`, commit, push the branch and open pull request 1 into `develop` · etalii.adp
- [ ] **T021** **Maintainer**: merge pull request 1 with a merge commit · etalii.adp

### Part B: `etalii.adp.ide.notion`

Part B starts when T011 to T016 are written. T034 waits for T020, whose commit it copies at. Nothing waits for T021 but T118.

**Wave 1: independent (different files)**

- [ ] **T022** [P] Copy `src/core/fbl` of the Visual Studio Code host at a given commit into `src/fbl/`, byte for byte, and write `PROVENANCE.md` with the commit and a SHA-256 per file; `--check` copies nothing and fails when a file differs from its record (research D4) · etalii.adp.ide.notion/scripts/sync-fbl.mjs
- [ ] **T023** [P] For each `addons/<id>/addon.json`, copy the specification from `etalii.adp` and the binding from the repository its `persistence.binding` names, byte for byte, and write the folder's `PROVENANCE.md`; `--check` as T022 (research D6) · etalii.adp.ide.notion/scripts/sync-specifications.mjs
- [ ] **T024** [P] Copy the examples and the test fixtures of each add-on's tool type into `test/examples/` and `test/fixtures/`, write beside each example the places the Visual Studio Code host computes for it, as the shared-parts contract says what a place is, and copy `mindmap.dis` from `etalii.adp` into `test/fixtures/` for T109; `--check` as T022 (research D14, D15) · etalii.adp.ide.notion/scripts/sync-examples.mjs
- [ ] **T025** [P] Name the specification, its source in `etalii.adp` and the binding, as the published-tree contract gives it · etalii.adp.ide.notion/addons/gartner-hype-cycle-graph/addon.json
- [ ] **T026** [P] Write the page of the shared-parts contract: `addon.css`, `addon.js`, `data-state="loading"`, no script or style of its own · etalii.adp.ide.notion/addons/gartner-hype-cycle-graph/index.html
- [ ] **T027** [P] Define a command as plain data that cannot change, a handler with its result and inverse, and a history entry, after `ICommand`, `ICommandHandler`, `CommandResult` and `HistoryEntry` of the standalone application (data model: History) · etalii.adp.ide.notion/src/history/command.ts
- [ ] **T028** [P] Write the service as a handler that knows no platform, taking a request and its configuration and answering a response, with its test: `/authorize`, `/callback`, `/refresh`, the preflight and `/notion/<path>` for the listed calls only, with the origin, the status codes and `Cache-Control` of the service contract, and no state. Write the local service that runs it, `node scripts/service.mjs`, on `http://localhost:8787`: it reads `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET` and `ALLOWED_ORIGIN` from the environment, and with `--memory` it answers the Notion calls from the in-memory Notion of T041 and grants a token without Notion, so that an add-on can be seen working with no account anywhere (FR-010, research D8) · etalii.adp.ide.notion/service/handler.ts, etalii.adp.ide.notion/scripts/service.mjs, etalii.adp.ide.notion/test/service/handler.test.ts
- [ ] **T030** [P] State Notion's type, colours, spacing, corners and focus ring as `--notion-` custom properties, taken from Notion's web client with the source and date of each noted for `docs/styling.md` (T113), in a light set and a dark set under `:root[data-theme="dark"]` (NFR-001, NFR-003, research D13) · etalii.adp.ide.notion/src/panels/notion.css
- [ ] **T031** [P] Write the digest esbuild puts in the place of `node:crypto` for the copied library (research D4) · etalii.adp.ide.notion/src/shims/node-crypto.ts

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2: independent (different files)**

- [ ] **T033** [P] Run `node scripts/sync-fbl.mjs` at the commit of T002 · etalii.adp.ide.notion/src/fbl/
- [ ] **T034** [P] Run `node scripts/sync-specifications.mjs` at the `etalii.adp` commit of T020 and the commit of T003; it writes the `.dis`, the `.fbl` and `PROVENANCE.md` (FR-002, FR-003) · etalii.adp.ide.notion/addons/gartner-hype-cycle-graph/
- [ ] **T035** [P] Run `node scripts/sync-examples.mjs` at the commits of T002 and T003: nine examples with their places, the fixtures and `mindmap.dis` · etalii.adp.ide.notion/test/examples/, etalii.adp.ide.notion/test/fixtures/
- [ ] **T036** [P] Write the dispatcher (one handler per command type, records nothing) and the history stack (runs a command, keeps the entry when an inverse is reported, undoes and redoes by dispatching, tells its listeners what is available, can be cleared), with a test of the transitions table of the data model. Neither names Notion, a store or a tool type (FR-026, FR-028) · etalii.adp.ide.notion/src/history/dispatcher.ts, etalii.adp.ide.notion/src/history/historyStack.ts, etalii.adp.ide.notion/test/history/historyStack.test.ts
- [ ] **T037** [P] Write the service's address, the one place in `src/` that names it: the local service's, `http://localhost:8787`, for a page served from `localhost`, and the Worker's for any other, written by T029 once T032 gives it · etalii.adp.ide.notion/src/frame/config.ts
- [ ] **T038** [P] **Maintainer**: register the Notion integration as public, with the redirect address `http://localhost:8787/callback` of the local service and the capabilities to read, update and insert content, and give its client id and client secret to the local service through the environment. The Worker's `<service>/callback` is added as a second redirect address in T045 · Notion integrations

**⟶ Wait for Wave 2 to finish, then:**

- [ ] **T039** Evaluate CEL with `@marcbachmann/cel-js`, with DISL's helper functions and a specification's own `functions` registered on it. Its test parses every expression of the copied specification. If the library cannot take one, stop, write the evaluator of research D7's fallback here instead, and update D7 before T040 starts · etalii.adp.ide.notion/src/disl/expressions.ts, etalii.adp.ide.notion/test/disl/expressions.test.ts

**⟶ Wait for T039 to finish, then:**

**Wave 3: independent (different files)**

- [ ] **T040** [P] Type a DISL specification and write `loadSpecification`, which returns the specification with the findings of loading it and never throws (shared-parts contract, Interfaces) · etalii.adp.ide.notion/src/disl/specification.ts, etalii.adp.ide.notion/test/disl/specification.test.ts
- [ ] **T041** [P] Write the in-memory Notion of the tests: the calls of the service contract's table, rows with edit times and who made each edit, the trash, relations, pages of 100 rows, a database with two data sources, and a switch for `401`, `429` with `Retry-After`, and a lost connection (research D15) · etalii.adp.ide.notion/test/support/memoryNotion.ts
- [ ] **T042** [P] Take the names of elements, attributes, relations, enum values and rules from every specification and binding under `addons/`, and fail when a file under `src/` holds one as a word of its own: a whole identifier, or a whole word of a string or template literal, whatever its case. A name that DISL, FBL, TypeScript or the web platform uses as a word too is exempt only by a line of `words.exempt.json` that names which of the four uses it (FR-004; shared-parts contract) · etalii.adp.ide.notion/test/words.test.ts, etalii.adp.ide.notion/test/words.exempt.json
- [ ] **T043** [P] Write the calls to the service and their queue: at most three a second, the edits in order and the writes of one edit in the order of its splices, waiting out a `Retry-After`, stopping on a refusal and sending nothing that is queued behind it, and reporting `storing`, `offline` and `failed` (SC-004, research R2) · etalii.adp.ide.notion/src/store/notion.ts, etalii.adp.ide.notion/test/store/notion.test.ts
- [ ] **T044** [P] Write the session: a token is asked for only when a call needs one, kept under `adp-notion.token` for as long as it is valid, renewed once through `POST /refresh` on a `401` and removed when that fails, and removed by `disconnect`; the grant opens a window of its own with a random `state`, and a message is taken only from the service's origin with that `state` (FR-010; data model: Access) · etalii.adp.ide.notion/src/store/session.ts, etalii.adp.ide.notion/test/store/session.test.ts

**⟶ Wait for Wave 3 to finish, then:**

**Wave 4: independent (different files)**

- [ ] **T046** [P] List the features the interpreter supports and report each feature of `requires.features` that is not among them as a finding that names it (FR-005, research D5) · etalii.adp.ide.notion/src/disl/support.ts, etalii.adp.ide.notion/test/disl/support.test.ts
- [ ] **T047** [P] Interpret `metamodel`: the diagram, enums, types with their attributes and defaults, and relations with their allowed ends · etalii.adp.ide.notion/src/disl/metamodel.ts, etalii.adp.ide.notion/test/disl/metamodel.test.ts
- [ ] **T048** [P] Interpret `persistence`: the binding it names and its fragment, `ids`, and `typeMap` from the binding's element rules to the metamodel's types · etalii.adp.ide.notion/src/disl/persistence.ts, etalii.adp.ide.notion/test/disl/persistence.test.ts
- [ ] **T049** [P] Define the page a part of the frame is given (the interpreted specification, the open document, the regions for the canvas, the two panels, the bar and the findings, the selection, the message) and `onPage`, by which a module under `src/frame/parts/` attaches itself; parts hear the page's events and depend on no order · etalii.adp.ide.notion/src/frame/page.ts, etalii.adp.ide.notion/test/frame/page.test.ts

**⟶ Wait for Wave 4 to finish, then:**

**Wave 5: independent (different files)**

- [ ] **T050** [P] Compute a store's schema from a binding and a specification, naming no key: the kinds, the title property, `Kind`, `Order`, and one property per key with the type its attribute gives, a relation for a reference; say what a database lacks, and `prepare` it without changing or removing a property that exists (contracts/store.md; FR-007) · etalii.adp.ide.notion/src/store/schema.ts, etalii.adp.ide.notion/test/store/schema.test.ts
- [ ] **T051** [P] Write the entry: read `store` and `theme` from the address, set `data-theme` and follow a change of `prefers-color-scheme`, set `data-addon` and `data-state`, read `addon.json` and load the two files it names, lay out the regions, and hand the page to every part. With no valid `store` the state is `setup` and no call is made. The layout uses `--notion-` properties only (FR-009, NFR-003) · etalii.adp.ide.notion/src/frame/main.ts, etalii.adp.ide.notion/src/frame/frame.css, etalii.adp.ide.notion/test/frame/main.test.ts

**⟶ Wait for Wave 5 to finish, then:**

**Wave 6: independent (different files)**

- [ ] **T052** [P] Turn rows into the document the binding describes and a document into rows, through the FBL library and the schema: kinds, `Order`, relations read as stored ids, the one-place kind, a row of an unknown kind or with unreadable values as a finding. Its test puts each of the nine examples into the in-memory Notion, takes it out and reads both through the binding: the same elements in the same order with the same attributes (FR-006, FR-007, SC-003) · etalii.adp.ide.notion/src/store/rows.ts, etalii.adp.ide.notion/test/store/rows.test.ts
- [ ] **T053** [P] Add the compile step, keeping the command line: run `ensure-dependencies`, bundle `src/frame/main.ts` with every module directly under `src/frame/parts/` into `addon.js` and every stylesheet under `src/` into `addon.css`, write both into each add-on's folder beside its own files, list each add-on in the index by its specification's `language.label`, and fail on a folder the published-tree contract refuses (FR-001, FR-031, research D12) · etalii.adp.ide.notion/scripts/build.mjs
- [ ] **T054** [P] Add a `test` job that runs `npm test`, `npm run lint` and `npm run typecheck`; extend the `addons` job's check with the files of each add-on's folder, the SHA-256 of every copy against its `PROVENANCE.md`, a search of `addon.js` for a name the words test collects, and a search of the tree for a secret; the job that deploys the Worker is T029's (contracts: published-tree, service) · etalii.adp.ide.notion/.github/workflows/build.yml

**Checkpoint**: `npm test` passes, and `node scripts/build.mjs --out <dir>` writes the index and the add-on's folder with a page that reaches the state `setup`.

**⟶ Wait for the checkpoint and T038, then:**

- [ ] **T078** **Maintainer**: the first pass in Notion (research R4), made before any story is built, because every story needs the grant. Run the local service of T028 with the integration's client id and secret and `ALLOWED_ORIGIN` set to the address of the pass, and serve this branch's build at an HTTPS address a Notion page can embed, with a page of the pass's own, not kept, that asks the session of T044 for a token when it opens and shows whether it has one. Embed it in a Notion page and grant access from inside the embed block. Record whether the window opens and whether the embed has the token after a grant made in a tab. If neither gives the embed a token, stop: the plan returns to research D1 and no story is started · Notion workspace

---

## Phase 3: User Story 1 - A reader sees a hype cycle graph inside a Notion page (P1)

**Goal**: a store's rows are read and drawn as the other hosts draw the same document, with findings, and nothing fails.

**Independent Test**: put an example into the in-memory Notion, open the page in jsdom, and compare the places of what is drawn with those the Visual Studio Code host computes. In Notion: T120.

Files: `src/disl/coordinates.ts`, `src/disl/notation.ts`, `src/disl/layout.ts`, `src/disl/viewpoints.ts`, `src/disl/constraints.ts`, `src/canvas/geometry.ts`, `src/canvas/scene.ts`, `src/canvas/shapes.ts`, `src/canvas/connectors.ts`, `src/canvas/ruler.ts`, `src/canvas/labels.ts`, `src/canvas/filters.ts`, `src/canvas/canvas.ts`, `src/canvas/canvas.css`, `src/store/document.ts`, `src/frame/parts/reading.ts`, `scripts/store.mjs`, `docs/set-up-a-graph.md`, `docs/service.md`, `service/README.md`, `docs/disl-support.md`

### Tests

Test files: `test/canvas/scene.examples.test.ts`, `test/store/document.read.test.ts`, `test/disl/constraints.fixtures.test.ts`, `test/frame/reading.test.ts`, and the unit tests named in the tasks below.

**Wave 1: independent (different files), written to fail first**

- [ ] **T055** [P] [US1] For each of the nine examples, the scene has every element of the document at the place, with the name, phases and influences, that the Visual Studio Code host computes: 0 differences (SC-001, FR-012) · etalii.adp.ide.notion/test/canvas/scene.examples.test.ts
- [ ] **T056** [P] [US1] Opening a store: an empty prepared store is an empty graph with no finding; a row that cannot be read is a finding and the rest is read; a document that cannot be read at all is `unreadable`; a database that lacks a property is `unprepared`; a database with two data sources is `unprepared` with its sentence; a person whose first write Notion refuses with `403` gets `read-only` from then on, and that write changes nothing (service contract); 518 rows are read in six calls (US1 scenarios 3 to 5, FR-013, FR-021) · etalii.adp.ide.notion/test/store/document.read.test.ts
- [ ] **T057** [P] [US1] Each `rule-*` fixture gives the findings the specification states, with its severity, its sentence and its element, and `rules-clean` gives none (FR-014) · etalii.adp.ide.notion/test/disl/constraints.fixtures.test.ts
- [ ] **T058** [P] [US1] The page reaches each state of the address contract with the identifiers that state shows: `connect` with `id="connect"` and `id="open-in-tab"`, `unshared`, `unprepared` with `id="prepare"`, `ready`, `read-only`, `unreadable` with its sentence; `id="findings"` has one item per finding; `id="status"` follows the document; `id="disconnect"` is there in every state that has a token; given a copy of the specification with one label and one default changed, the page shows both with no other change (US1 scenario 6; FR-013, FR-014, NFR-008) · etalii.adp.ide.notion/test/frame/reading.test.ts

### Implementation

**Wave 1: independent (different files)**

- [ ] **T059** [P] [US1] Interpret `coordinates`: the axes, the `yearMonth` axis and its units, the systems and the default (`axis.yearMonth`) · etalii.adp.ide.notion/src/disl/coordinates.ts, etalii.adp.ide.notion/test/disl/coordinates.test.ts
- [ ] **T060** [P] [US1] Interpret `notation`: the text metric, the theme tokens, styles, custom and composite shapes, nodes with bound placement, edges, and the canvas with its filters · etalii.adp.ide.notion/src/disl/notation.ts, etalii.adp.ide.notion/test/disl/notation.test.ts
- [ ] **T061** [P] [US1] Interpret `layout`: the algorithms the specification names, when each runs, and what it respects · etalii.adp.ide.notion/src/disl/layout.ts, etalii.adp.ide.notion/test/disl/layout.test.ts
- [ ] **T062** [P] [US1] Interpret `viewpoints` and their variants of the notation (`viewpoint.variants`) · etalii.adp.ide.notion/src/disl/viewpoints.ts, etalii.adp.ide.notion/test/disl/viewpoints.test.ts
- [ ] **T063** [P] [US1] Interpret `constraints`: the defaults, the order, the built-in rules and the rules, each evaluated over a model into findings with the specification's sentence, and which findings refuse an edit (FR-014) · etalii.adp.ide.notion/src/disl/constraints.ts
- [ ] **T064** [P] [US1] Write the geometry the drawing needs: points, boxes, outlines, Bézier curves and where a curve meets an outline · etalii.adp.ide.notion/src/canvas/geometry.ts, etalii.adp.ide.notion/test/canvas/geometry.test.ts
- [ ] **T065** [P] [US1] Write `openDocument`: read the whole store in pages of 100 before anything is given, build the model and the findings, decide the state (`ready`, `read-only`, `unreadable`, `unprepared`), offer `prepare` and `reload`, tell listeners of `changed`, `status` and `reloaded`, and run `edit`, `undo` and `redo` through a history stack of its own whose dispatcher takes the handlers a part registers. A reload empties the history (FR-006, FR-013, FR-021; shared-parts contract) · etalii.adp.ide.notion/src/store/document.ts
- [ ] **T066** [P] [US1] Write `put` and `take` with the code of `src/store/`: the token from `NOTION_TOKEN`, `--addon`, `--replace`, `--force`, `put` prepares first and reports what a store cannot hold, and the exit codes of the store contract; its test runs both against the in-memory Notion (FR-007, research D14) · etalii.adp.ide.notion/scripts/store.mjs, etalii.adp.ide.notion/test/scripts/store.test.ts
- [ ] **T067** [P] [US1] Write the steps that set a graph up: the database, sharing it with the connection, the page with the embed address, granting access once (SC-009) · etalii.adp.ide.notion/docs/set-up-a-graph.md
- [ ] **T068** [P] [US1] Document the service: its address, endpoints, secrets, what a maintainer does once, how the local service is run, with and without `--memory`, and how the Worker is deployed · etalii.adp.ide.notion/docs/service.md, etalii.adp.ide.notion/service/README.md

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2: independent (different files)**

- [ ] **T069** [P] [US1] Turn a model into a scene through the interpreted notation, coordinates, layout and viewpoint: every node and edge placed, with its shape, its parts and its labels (`placement.bound`, FR-012) · etalii.adp.ide.notion/src/canvas/scene.ts
- [ ] **T070** [P] [US1] Draw a custom and a composite shape of the notation as SVG, coloured from the specification's theme tokens (`shape.custom`, `shape.composite`, NFR-002) · etalii.adp.ide.notion/src/canvas/shapes.ts, etalii.adp.ide.notion/test/canvas/shapes.test.ts
- [ ] **T071** [P] [US1] Draw an edge as the notation asks, from and to a part of a shape (`edge.bezier`, `anchor.part`) · etalii.adp.ide.notion/src/canvas/connectors.ts, etalii.adp.ide.notion/test/canvas/connectors.test.ts
- [ ] **T072** [P] [US1] Draw the ruler of an axis, with ticks and labels that follow the zoom (`ruler.adaptive`) · etalii.adp.ide.notion/src/canvas/ruler.ts, etalii.adp.ide.notion/test/canvas/ruler.test.ts
- [ ] **T073** [P] [US1] Measure and draw text by the notation's text metric, with wrapping and clipping as it asks · etalii.adp.ide.notion/src/canvas/labels.ts, etalii.adp.ide.notion/test/canvas/labels.test.ts
- [ ] **T074** [P] [US1] Draw the canvas's filters and legend from the notation and apply a filter to a scene (`canvas.filters`) · etalii.adp.ide.notion/src/canvas/filters.ts, etalii.adp.ide.notion/test/canvas/filters.test.ts

**⟶ Wait for Wave 2 to finish, then:**

- [ ] **T075** [US1] Write `createCanvas`: draw a scene into `id="canvas"` with `data-element` and `data-type`, pan and zoom, switch viewpoint, select by pointer and by keyboard with `data-selected`, take the keyboard focus, and choose the background and the selection mark from the `--notion-` properties. Its test draws a scene of 50 nodes of the largest shape in under 1 second (SC-002, FR-011, NFR-002) · etalii.adp.ide.notion/src/canvas/canvas.ts, etalii.adp.ide.notion/src/canvas/canvas.css, etalii.adp.ide.notion/test/canvas/canvas.test.ts

**⟶ Wait for T075 to finish, then:**

- [ ] **T076** [US1] Attach reading to the page: open the document, show `connect`, `unshared`, `unprepared` and `unreadable` with their controls and sentences, offer `disconnect`, draw the canvas, list the findings with severity, sentence and element, show the status in Notion's manner, redraw on `changed`, and read again when the page regains the focus (FR-009, FR-013, FR-014, FR-021, NFR-008) · etalii.adp.ide.notion/src/frame/parts/reading.ts

**⟶ Wait for T076 to finish, then:**

- [ ] **T077** [US1] List what the interpreter supports of DISL and what it does not, generated from `src/disl/support.ts` where it can be, the four behaviours the specification leaves unstated, each with the interim rule the shared parts follow (research, Differences), and the known limits: the window between the drift check and a write, a store of more than about 250 rows and SC-002, a large arrangement and SC-004, and who sees the invitation to connect (FR-005; research R1 to R3, D10) · etalii.adp.ide.notion/docs/disl-support.md

**Checkpoint**: T055 to T058 pass. A store filled with an example is drawn in jsdom as the Visual Studio Code host draws it, with its findings.

---

## Phase 4: User Story 2 - A user changes the graph, and the database keeps it (P2)

**Goal**: every edit the specification offers can be made, is on the canvas at once and in the store's rows afterwards, and no change is lost or overwritten unseen.

**Independent Test**: against the in-memory Notion, add an element, rename it, move it and relate another to it; open the store again and find all four; then look at the rows. In Notion: T121.

Files: `src/disl/toolbox.ts`, `src/disl/forms.ts`, `src/disl/behavior.ts`, `src/store/writes.ts`, `src/store/drift.ts`, `src/store/handlers.ts`, `src/canvas/snapping.ts`, `src/canvas/gestures.ts`, `src/canvas/inPlaceEdit.ts`, `src/panels/panel.ts`, `src/panels/controls.ts`, `src/panels/panels.css`, `src/panels/toolbox.ts`, `src/panels/propertyGrid.ts`, `src/panels/menu.ts`, `src/frame/parts/editing.ts`, `src/frame/parts/panels.ts`

### Tests

Test files: `test/store/editing.test.ts`, `test/store/drift.test.ts`, `test/disl/offers.test.ts`, `test/panels/panels.test.ts`, `test/frame/editing.test.ts`, and the unit tests named in the tasks below.

**Wave 1: independent (different files), written to fail first**

- [ ] **T079** [P] [US2] Each kind of edit writes exactly its rows and properties: an insertion one row with its `Kind`, `Order`, values and relations; a removal one row in the trash and the rows its cascade takes; a changed value one property; a changed reference one relation; a changed place the `Order` of the rows that moved. The writes of one edit are sent in the order of its splices. An edit the specification or the binding refuses writes nothing and answers the sentence. An edit with a splice that cannot be resolved is not written in part (FR-018, FR-019; data model: Edit) · etalii.adp.ide.notion/test/store/editing.test.ts
- [ ] **T080** [P] [US2] A row edited, created or trashed by somebody else since the last read stops the write, tells the user, reads the store again and empties the history; a refused write does the same; a write that fails after others of the same edit were stored sends nothing later, takes nothing back, says that the edit was stored in part and reads the store again; an edit made while writes are queued is written behind them; a `429` is waited out; a lost connection shows `offline` and loses no edit unseen (FR-020, FR-022, research D10) · etalii.adp.ide.notion/test/store/drift.test.ts
- [ ] **T081** [P] [US2] List every tool, gesture, operation and context action the specification offers, read from the specification, and make each against the in-memory Notion: 0 that cannot be done (FR-015, SC-006) · etalii.adp.ide.notion/test/disl/offers.test.ts
- [ ] **T082** [P] [US2] The toolbox lists the specification's tools in their groups with `data-tool`, label, icon and description; the property grid shows the inspector form of the selection's type with `data-form` and `data-attribute` and honours `widget`, `visible`, `display`, `validate` and `parse`; each panel collapses, keeps that in local storage and restores it, and opens expanded when the storage is refused; `readOnly` shows no control that changes anything (FR-016, FR-017, FR-021) · etalii.adp.ide.notion/test/panels/panels.test.ts
- [ ] **T083** [P] [US2] In the page: an edit is on the canvas in the same turn and `data-status` is `storing` until the store holds it; a refusal fills `id="message"` and changes nothing; `read-only` has no toolbox and no editing control; in an embed narrower than both panels they are collapsed and the canvas stays usable; while `data-status` is `storing` the page asks to be warned before it is left; after any edit the browser's storage holds the token and the panels' state and nothing else (FR-006, FR-011, FR-017, FR-019, SC-004) · etalii.adp.ide.notion/test/frame/editing.test.ts

### Implementation

**Wave 1: independent (different files)**

- [ ] **T084** [P] [US2] Interpret `toolbox`: the groups, each tool with what it creates and where a keyboard drop goes, and the context menus · etalii.adp.ide.notion/src/disl/toolbox.ts, etalii.adp.ide.notion/test/disl/toolbox.test.ts
- [ ] **T085** [P] [US2] Interpret `forms`: per type, the items with their widget, visibility, display, validation and parsing, and the form's usages · etalii.adp.ide.notion/src/disl/forms.ts, etalii.adp.ide.notion/test/disl/forms.test.ts
- [ ] **T086** [P] [US2] Interpret `behavior`: the messages, hooks, operations with their gestures and keys, and deletion with its confirmations, each as a change to a model or a refusal with its sentence (`snap.byGesture`, `label.parse`) · etalii.adp.ide.notion/src/disl/behavior.ts, etalii.adp.ide.notion/test/disl/behavior.test.ts
- [ ] **T087** [P] [US2] Resolve the splices of one change to row writes by the rule of the store contract, from the binding alone: the place gives the kind, the entry the row, the key the property. A splice that lands on nothing writes nothing; one that cannot be resolved refuses the whole change (FR-004, FR-018) · etalii.adp.ide.notion/src/store/writes.ts
- [ ] **T088** [P] [US2] Ask the store for rows edited, created or trashed since the last read, and say whether somebody else made the change (FR-022) · etalii.adp.ide.notion/src/store/drift.ts
- [ ] **T089** [P] [US2] Write what every panel shares: a region with an accessible name, its toggle that stays visible, `data-collapsed`, and the collapsed state kept in local storage per add-on and per panel under the key of T014 (FR-017, NFR-006) · etalii.adp.ide.notion/src/panels/panel.ts
- [ ] **T090** [P] [US2] Write the controls a form's widgets ask for, each operable with the keyboard alone, named to assistive technology, and without a way to change when read-only (NFR-006) · etalii.adp.ide.notion/src/panels/controls.ts
- [ ] **T091** [P] [US2] Style the panels, the controls and the menus from the `--notion-` properties alone, with every class beginning with `adp-` and the focus drawn with `--notion-focus-ring` (NFR-001, NFR-005) · etalii.adp.ide.notion/src/panels/panels.css
- [ ] **T092** [P] [US2] Snap a dragged value as the specification asks for that gesture · etalii.adp.ide.notion/src/canvas/snapping.ts, etalii.adp.ide.notion/test/canvas/snapping.test.ts

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2: independent (different files)**

- [ ] **T093** [P] [US2] Write the commands of an open document and their handlers: a change is checked against the constraints that refuse an edit, planned as splices by the FBL library, resolved to row writes, applied to the model, reported with its inverse command, and queued after a drift check; a failure reloads the document. One gesture is one command (FR-018 to FR-020, FR-024, FR-026) · etalii.adp.ide.notion/src/store/handlers.ts
- [ ] **T094** [P] [US2] Write `createToolbox` as the shared-parts contract gives it: every tool in its group and order, picked by pointer or with Enter · etalii.adp.ide.notion/src/panels/toolbox.ts
- [ ] **T095** [P] [US2] Write `createPropertyGrid` as the shared-parts contract gives it: the form of the selection's type, the diagram's own form for an empty selection, each change answered with the edit's result · etalii.adp.ide.notion/src/panels/propertyGrid.ts
- [ ] **T096** [P] [US2] Write the menu a context menu of the specification is shown in, in Notion's manner, operable with the keyboard · etalii.adp.ide.notion/src/panels/menu.ts
- [ ] **T097** [P] [US2] Write the gestures of the canvas from the interpreted behavior: a drop from the toolbox, moving and resizing along an axis, dragging a part's boundary, drawing a relation between two elements, removing the selection, each ending in one change (FR-015, FR-024) · etalii.adp.ide.notion/src/canvas/gestures.ts, etalii.adp.ide.notion/test/canvas/gestures.test.ts
- [ ] **T098** [P] [US2] Edit a label in place, parsed as the specification asks (`label.parse`) · etalii.adp.ide.notion/src/canvas/inPlaceEdit.ts, etalii.adp.ide.notion/test/canvas/inPlaceEdit.test.ts

**⟶ Wait for Wave 2 to finish, then:**

**Wave 3: independent (different files)**

- [ ] **T099** [P] [US2] Attach editing to a page whose state is `ready`: register the handlers with the document, attach the gestures, the in-place edit, the context menus and the keys the behavior binds, show a refusal or a failure in `id="message"`, ask the browser to warn before the page is left while writes are queued, and show the progress of a long store (FR-015, FR-019, FR-020, NFR-008) · etalii.adp.ide.notion/src/frame/parts/editing.ts
- [ ] **T100** [P] [US2] Attach the panels: the property grid in `ready` and `read-only`, the toolbox in `ready` only, the selection shown in the grid, a picked tool placed on the canvas, and both collapsed when the embed is narrower than both (FR-011, FR-016, FR-017, FR-021) · etalii.adp.ide.notion/src/frame/parts/panels.ts

**Checkpoint**: T079 to T083 pass. Every edit of T081's list is made in jsdom and found in the rows of the in-memory Notion.

---

## Phase 5: User Story 3 - A user undoes and redoes with the usual keys (P3)

**Goal**: CTRL+Z and CTRL+Y, and two buttons, take an edit back and bring it again, on the canvas and in the store.

**Independent Test**: make five different edits, undo five times and compare the rows with those before the first; redo five times and compare with those after the last. In Notion: T121.

Files: `src/frame/parts/undoRedo.ts`

### Tests

Test files: `test/store/undo.test.ts`, `test/frame/undoRedo.test.ts`

**Wave 1: independent (different files), written to fail first**

- [ ] **T101** [P] [US3] After a sequence of 20 edits of every kind, 20 undos leave the store the same as before the first, by the store contract's meaning of "the same", and 20 redos the same as after the last; a drag that changed several attributes and a removal with its cascade are each one step; a new edit after an undo leaves nothing to redo; an undo made while the writes of its edit are still queued is stored behind them and leaves the store the same; the history is empty after a reload (FR-024, FR-026, SC-005) · etalii.adp.ide.notion/test/store/undo.test.ts
- [ ] **T102** [P] [US3] With the focus inside the page, `CTRL+Z` undoes, `CTRL+Y` and `CTRL+SHIFT+Z` redo, and Command+Z and Shift+Command+Z do the same on macOS; `id="undo"` and `id="redo"` do the same and are `disabled` when there is nothing to take; with nothing to take, a key changes and shows nothing; `read-only` has neither button (FR-023, FR-025) · etalii.adp.ide.notion/test/frame/undoRedo.test.ts

### Implementation

- [ ] **T103** [US3] Attach undo and redo to a page whose state is `ready`: the keys of the address contract while the focus is inside the page, and the two buttons, enabled as the history stack says (FR-023, FR-025) · etalii.adp.ide.notion/src/frame/parts/undoRedo.ts

**Checkpoint**: T101 and T102 pass.

---

## Phase 6: User Story 4 - The examples of the other hosts are in the Notion workspace (P4)

**Goal**: the Showcase holds the first graph and one entry per example, each with a store of its own and one diagram page.

**Independent Test**: tick each example of the Visual Studio Code host off in the Showcase and take each store out again to compare it with the example. Opening each diagram page waits for T119 and is T120.

Files: none in a repository. Pages: the entry "Gartner hype cycle graph" and nine entries under the Showcase, each with its database and its page "Diagram".

**Wave 1: independent (different pages)**

- [ ] **T104** [P] [US4] **Maintainer**: give a `NOTION_TOKEN` of an integration the Showcase is shared with, for `scripts/store.mjs`; it goes in the environment and in no file · Notion workspace
- [ ] **T105** [P] [US4] Rename the first graph's pages to the tool type's display name, `Gartner hype cycle graph` and `Gartner hype cycle graph - Data`, keep `Diagram`, and set the embed of `Diagram` to `https://etalii.net/adp-notion/gartner-hype-cycle-graph/?store=3f2be2fd05b680f5bfe1d89398eabb4e`. The page "Root" is left as it is (FR-008, FR-030) · Notion workspace/Showcase/Gartner hype cycle graph
- [ ] **T106** [P] [US4] Create nine entries under the Showcase, titled as the store contract lists them, each with a database `<title> - Data` and a page `Diagram` whose one embed block names that database (FR-029) · Notion workspace/Showcase

**⟶ Wait for Wave 1 to finish, then:**

- [ ] **T107** [US4] Prepare the first graph's database, and `put` each of the nine examples of `test/examples/` into its store. Then `take` each out and read it beside the example through the binding: 0 differences. Note what `put` reported as not kept (FR-007, FR-029, SC-003) · Notion workspace/Showcase

**⟶ Wait for T107 to finish, then:**

- [ ] **T108** [US4] Check the ten entries: each database is named by one diagram page and no other, no two embeds name the same store, and each title is the example's display name (US4 scenarios 1 and 3) · Notion workspace/Showcase

**Checkpoint**: ten stores hold their documents. The diagram pages show them once the add-on is published (T119, T120).

---

## Phase 7: User Story 5 - A contributor reuses the toolbox and the property grid in another add-on (P5)

**Goal**: the shared parts are shown to serve another tool type with no line changed, and to read as Notion's.

**Independent Test**: give the two panels the mind map's specification and find its tools and attributes, with the files under `src/panels/` unchanged.

Files: `docs/styling.md`, `addons/README.md`

### Tests

Test files: `test/panels/reuse.test.ts`, `test/disl/reuse.test.ts`, `test/panels/keyboard.test.ts`, `test/styles.test.ts`, `test/parts.test.ts`

**Wave 1: independent (different files)**

- [ ] **T109** [P] [US5] Given `test/fixtures/mindmap.dis`, the toolbox lists that type's tools with their names, icons and descriptions and the property grid shows an element's attributes with the controls its forms ask for; and the interpreter loads that specification without throwing, with every feature it does not support as a finding that names it (US5 scenarios 1 and 2, FR-027, FR-028, SC-007) · etalii.adp.ide.notion/test/panels/reuse.test.ts, etalii.adp.ide.notion/test/disl/reuse.test.ts
- [ ] **T110** [P] [US5] Every control of the toolbox and the property grid is reached with Tab and used with the keyboard alone, has an accessible name, and each panel is a named region: 0 controls that need a pointer (NFR-006, SC-012) · etalii.adp.ide.notion/test/panels/keyboard.test.ts
- [ ] **T111** [P] [US5] No stylesheet under `src/` but `notion.css` states a literal colour, type size, spacing or corner; every class the shared parts write begins with `adp-`; the add-on's page has no style of its own (NFR-005, US5 scenario 5) · etalii.adp.ide.notion/test/styles.test.ts
- [ ] **T112** [P] [US5] A part imports only parts above it in the shared-parts table; the panels import neither the store nor the canvas; the history imports no other part; only `src/store/session.ts` and `src/store/notion.ts` know the service or a token (FR-004, FR-028) · etalii.adp.ide.notion/test/parts.test.ts

### Implementation

**Wave 1: independent (different files)**

- [ ] **T113** [P] [US5] List every departure from Notion's styling with its reason, the source and date of each value of `notion.css`, and the contrast of each pair of text and background in both appearances, computed from those values (NFR-004, NFR-007) · etalii.adp.ide.notion/docs/styling.md
- [ ] **T114** [P] [US5] Say what a second add-on consists of and how it is made: a folder, the page, `addon.json`, `node scripts/sync-specifications.mjs`, and nothing under `src/` (FR-028) · etalii.adp.ide.notion/addons/README.md

**Checkpoint**: T109 to T112 pass with `git diff` empty under `src/panels/`.

---

## Phase 8: Polish, delivery and the record

**Purpose**: say what exists, validate against the Success Criteria, publish, check in Notion what only Notion shows, and make the site and the record follow.

Files: `etalii.adp.ide.notion/README.md`, `etalii.adp.ide.notion/CLAUDE.md`, `etalii.adp.ide.notion/service/worker.ts`, `etalii.adp.ide.notion/service/wrangler.toml`, `etalii.adp.site/src/data/hosts.yaml`, `etalii.adp.site/src/content/catalogue/`, `etalii.adp/definitions/diagrams/gartner-hype-cycle-graph.md`, `etalii.adp/specs/012-notion-hype-cycle-addon/tasks.md`

**Wave 1: independent (different files)**

- [ ] **T115** [P] Name the add-on as published, with its address, and say how the repository is built and tested now; remove every sentence that says no tool is available (FR-031) · etalii.adp.ide.notion/README.md
- [ ] **T116** [P] Describe the shared parts, the copies that are never edited, the scripts and the service · etalii.adp.ide.notion/CLAUDE.md

**⟶ Wait for Wave 1 to finish, then:**

**The Cloudflare Worker, last** (the maintainer's instruction of 2026-10-08): everything before this ran against the local service.

- [ ] **T032** **Maintainer**: create the Cloudflare account and note the Worker's address · Cloudflare


**⟶ Wait for T032 to finish, then:**

- [ ] **T029** Wrap the handler of T028 as a Cloudflare Worker and configure it: its name, `ALLOWED_ORIGIN` as `https://etalii.net`, and nothing of the handler's logic repeated. Write the Worker's address of T032 into `src/frame/config.ts`, and add to `Build` a job that runs `wrangler deploy` on a push to `develop` only, after the others pass (contracts: service) · etalii.adp.ide.notion/service/worker.ts, etalii.adp.ide.notion/service/wrangler.toml, etalii.adp.ide.notion/src/frame/config.ts, etalii.adp.ide.notion/.github/workflows/build.yml

**⟶ Wait for T029 to finish, then:**

- [ ] **T045** **Maintainer**: add `<service>/callback` to the Notion integration as a second redirect address, set the Worker's secrets `NOTION_CLIENT_ID` and `NOTION_CLIENT_SECRET`, and the repository's Actions secret `CLOUDFLARE_API_TOKEN`, a token that may deploy this one Worker · Cloudflare, etalii.adp.ide.notion (GitHub settings)


**⟶ Wait for T045 to finish, then:**

- [ ] **T117** Validate against the Success Criteria. In `etalii.adp.ide.notion`: `npm test`, `npm run lint`, `npm run typecheck`, `node scripts/build.mjs --out <temporary folder>` with the check of the `addons` job, and the three `sync` scripts with `--check`. The copied `.dis` and `.fbl` are byte for byte their sources: 0 lines (SC-008). No file of the built tree holds a secret (SC-010). In `etalii.adp`: `python .github/scripts/validate-examples.py` and `python .github/scripts/licence-check.py` · etalii.adp.ide.notion, etalii.adp


**⟶ Wait for T117 and T021 to finish, then:**

- [ ] **T118** Push the branch and open pull request 2 into `develop`; its description names `specs/012-notion-hype-cycle-addon/` and the `etalii.adp` commit of T021 · etalii.adp.ide.notion
- [ ] **T119** **Maintainer**: merge pull request 2 with a merge commit. Check that `Build` passes on `develop` and deploys the Worker, and that the site's `deploy` publishes `https://etalii.net/adp-notion/gartner-hype-cycle-graph/` · etalii.adp.ide.notion

**⟶ Wait for T119 and T108 to finish, then:**

**Wave 2: independent (passes in Notion)**

- [ ] **T120** [P] [US1] Open each of the ten diagram pages and compare each example with the same one in the Visual Studio Code host: 0 differences (SC-001). Time the opening of a graph of 50 trends: within 3 seconds (SC-002). Open the add-on's address with no `store`, with a database that is not shared, and with an empty one · Notion workspace
- [ ] **T121** [P] [US2] In the first graph: make every edit of T081's list (SC-006), time one edit to the canvas and to the database (SC-004), make 20 edits and undo them with `CTRL+Z` (SC-005), edit a row in the table while the diagram is open (FR-022), open the same store in two pages, and press `CTRL+Z` with the focus in the Notion page · Notion workspace
- [ ] **T122** [P] [US5] Set the panels beside Notion's own in the light and the dark appearance and with `?theme=`, and correct any value of `notion.css` that differs and add any departure that is not listed to `docs/styling.md`, in a pull request of its own into `develop` that is merged before T134 (SC-011, NFR-003, NFR-007); use every control with the keyboard alone (SC-012); open a diagram page on a phone and read it · Notion workspace
- [ ] **T123** [P] **Maintainer**: set up a new graph by following `docs/set-up-a-graph.md` alone, timed: under 5 minutes, with no change to the add-on (SC-009) · Notion workspace
- [ ] **T124** [P] Check the published tree: the index at `/adp-notion` lists the add-on by its display name and has no `id="no-addons"`, every resource is relative, no response refuses a frame, and no file holds a token or a client secret (FR-001, FR-010, SC-010) · https://etalii.net/adp-notion

**⟶ Wait for Wave 2 to finish, then:**

- [ ] **T125** Fetch `etalii.adp.site`, create a worktree on a new branch `features/012-notion-hype-cycle-addon` from `origin/develop`, and run `npm ci` · etalii.adp.site/.claude/worktrees/012-notion-hype-cycle-addon

**⟶ Wait for T125 to finish, then:**

**Wave 3: independent (different files and pages)**

- [ ] **T126** [P] Refresh the `notion` entry from the Notion repository's `README.md` at the merge commit of T119: its `state`, without `unavailableNote`, with the new `revision` and `taken` (FR-031) · etalii.adp.site/src/data/hosts.yaml
- [ ] **T127** [P] Make the tool catalogue say the Gartner hype cycle graph is available in the Notion host, by the site's `procedures/refresh-catalogue.md` (FR-031) · etalii.adp.site/src/content/catalogue/
- [ ] **T128** [P] State the tool's state in the Notion host on the Gartner hype cycle row of the "Tools" database (FR-032) · Notion workspace/Tools
- [ ] **T129** [P] Bring the section "The Notion row" up to date with T128. The `.dis` is not touched. The change travels in pull request 4 · etalii.adp/definitions/diagrams/gartner-hype-cycle-graph.md

**⟶ Wait for Wave 3 to finish, then:**

- [ ] **T130** Run the site's checks, push the branch and open pull request 3 into `develop`; its description names `specs/012-notion-hype-cycle-addon/` and the `etalii.adp` commit of T021 · etalii.adp.site
- [ ] **T131** **Maintainer**: merge pull request 3 with a merge commit · etalii.adp.site

**⟶ Wait for T131 to finish, then:**

- [ ] **T132** Tick the tasks whose pull requests are merged, record the delivery with the four commits, and open pull request 4, which carries T129's change as well, into `develop` from a branch of this feature's name · etalii.adp/specs/012-notion-hype-cycle-addon/tasks.md
- [ ] **T133** **Maintainer**: merge pull request 4 with a merge commit · etalii.adp
- [ ] **T134** Delete the branch `features/012-notion-hype-cycle-addon` locally and on `origin` in the three repositories, and remove the worktrees of T001 and T125 · etalii.adp, etalii.adp.ide.notion, etalii.adp.site

---

## Dependencies & Execution Order

**Phases**: Setup → Foundational → Story 1 → Story 2 → Story 3 → Polish. Story 5 needs Story 2. Story 4 needs T066 of Story 1 and is otherwise beside Stories 2, 3 and 5. Nothing is published before T119, so every pass in Notion but T078 is in Phase 8.

**Pull requests**: 1 (T020, merged T021) before 2 (T118, merged T119) before 3 (T130, merged T131) before 4 (T132, merged T133).

**A maintainer's tasks**: T021, T032, T038, T045, T078, T104, T119, T123, T131, T133. T038 before T078, and T078 before Phase 3. The Cloudflare tasks are last: T032 before T029 before T045, and T045 before T118.

**Waves**

- **Phase 1**: Wave 1 (T001 to T003) → Wave 2 (T004 to T009).
- **Phase 2, Part A**: T010 → Wave 1 (T011 to T019) → T020 → T021.
- **Phase 2, Part B**: Wave 1 (T022 to T031, without T029) → Wave 2 (T033 to T038) → T039 → Wave 3 (T040 to T044) → Wave 4 (T046 to T049) → Wave 5 (T050, T051) → Wave 6 (T052 to T054) → T078. T034 waits for T020.
- **Phase 3**: tests (T055 to T058) → Wave 1 (T059 to T068) → Wave 2 (T069 to T074) → T075 → T076 → T077.
- **Phase 4**: tests (T079 to T083) → Wave 1 (T084 to T092) → Wave 2 (T093 to T098) → Wave 3 (T099, T100).
- **Phase 5**: tests (T101, T102) → T103.
- **Phase 6**: Wave 1 (T104 to T106) → T107 → T108.
- **Phase 7**: tests (T109 to T112) beside Wave 1 (T113, T114).
- **Phase 8**: Wave 1 (T115, T116) → T032 → T029 → T045 → T117 → T118 → T119 → Wave 2 (T120 to T124) → T125 → Wave 3 (T126 to T129) → T130 → T131 → T132 → T133 → T134.
