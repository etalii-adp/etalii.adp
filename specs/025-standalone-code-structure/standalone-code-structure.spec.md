# Feature Specification: The Structure of the Standalone Host's C# Code

**Feature Branch**: `claude/project-thread-do34w2` in `etalii.adp` (the branch this session's harness handed it); in `etalii.adp.ide.standalone`, one `features/025-<task>` branch per pull request
**Created**: 2026-10-11
**Status**: Draft, for the maintainer's review ([plan.md](plan.md), [tasks.md](tasks.md))
**Input**: The maintainer's request of 2026-10-11, verbatim: "In the etalii.adp repo, create a expansive and elaborate Spec Kit specification for this work. The work itself should of course be executed in the etalii.adp.ide.standalone repo. Be thorough. List the work you already have tracked but also do not be shy to at specific milestones in the process review if there are new refactorings that now all of a sudden also make sense." *This work* is the code analysis of the C# code of `etalii.adp.ide.standalone` at `develop` `fcb64c9`, read on 2026-10-10, kept verbatim beside this file as [analysis-2026-10-10.md](analysis-2026-10-10.md) and called **the report** below.

**A convention is set aside here, on purpose.** This repository's `CLAUDE.md`, its constitution and [specs/README.md](../README.md) say that `etalii.adp.ide.standalone` plans with spec-workflow in its own `.spec-workflow/`. The maintainer asked for this change as a Spec Kit feature in this repository, and that explicit request is followed. Those three documents are not changed by this feature: whether the convention itself changes is decision point DP-4. The folders `016-standalone-*` to `024-standalone-*` are migrated history, every task ticked before it arrived here; this is the first standalone feature that is live work in this folder.

## Context

The standalone host is the oldest and largest ADP host. Its C# code is about 246,000 lines in 2,133 files, of which about 121,000 are production code: 92,000 in the tool modules and 29,000 in the core and specification projects. The report read all of it and found the code inside a single type mostly decent, and the large problems **between** types:

1. **The diagram modules lack a middle layer.** Each of the 19 diagram modules with real code wraps the same low-level core pieces in the same ten role classes. About 9,000 to 10,000 production lines and about 300 files are copies of one another.
2. **Shared utilities are copied instead of shared**, and the copies have drifted. Several of the possible defects below come from that drift.
3. **The core project graph does not say what the architecture says.** The project that 67 modules reference as "diagram abstractions" is the host layer; one project holds no code; three tool families each have a hand-copied discovery, catalog, factory registry and router; and the product rule "diagram before designer before editor" is coded four times.
4. **The specification projects follow two philosophies**: FBL maps its JSON into typed records when it loads, DISL interprets raw JSON at every call, and CEL programs are compiled and cached in about five ways.
5. **The tests copy their infrastructure.** One flow-test harness is copied into 35 classes, a parity-transcript harness into 6 modules, and 25 fixed "stream startup" sleeps remain: the race that made a test fail on GitHub runners before.

This feature turns the report into ordered, reviewable work, and adds what the maintainer asked for beyond it: **at named milestones the work stops, the measurements are taken again, and the question "which refactorings make sense now that did not before?" is asked and answered in writing.**

### How to read this specification

A specification says *what* and *why*, and a plan says *how*. The subject here is the structure of code, so the *what* cannot be said without naming the things the report names. Where a requirement uses a type name (`LineDocument`, `ToolRouter`), it is the report's working name for a responsibility, used so that this text and the report can be laid side by side. The shape, the home and the final name of each are the plan's ([data-model.md](data-model.md)), and a task may choose a better name without changing this specification.

### What this feature is not

- It adds no capability a user of the application can see. The exceptions are the defects of section *Possible defects* and the entries of the behaviour-change register (FR-002), each of which is a correction.
- It changes no specification language. Where the work finds that a host library and a specification in this repository disagree, the finding comes back here as a feature of its own (constitution, principle I).
- It is not the conversion of the diagram modules to FBL and DISL. Fifteen spec-workflow specifications in `etalii.adp.ide.standalone` own that (`.spec-workflow/specs/*-disl-fbl`), and FR-012 says how the two bodies of work stay out of each other's way.

## Milestones

The work is cut into ten milestones. Each ends with a **milestone review** (User Story 9, FR-010), and no task of the next milestone starts before the review's record is merged.

| Milestone | Name | What it leaves behind | Report sections |
|---|---|---|---|
| M0 | Safety net | The measurements can be repeated; tests share a referenced testing project and one host harness; no test sleeps to let a stream start; the small defects are guarded and fixed; dead references and forwarders are gone | 8.1, 8.2, 8.6, 10, 11 step 1 |
| M1 | The module middle layer, piloted | The seven shared role types exist in core, shaped against four modules: sankey, supply-chain, functional-decomposition-graph and gartner-hype-cycle-graph | 1.1 to 1.7, 8.4 |
| M2 | The middle layer in every module, and the sibling modules | The other fifteen modules stand on the same types; the watched-folder modules, the RDF family and the timeline and dependency-graph pair share what they copied | 1, 2 |
| M3 | Shared utilities | One implementation of each utility the report found copied | 3, 8.5 |
| M4 | The core project graph | A thin diagram-abstractions project and a host project; generic tool families; one router; typed paths, origins and registrations | 4 |
| M5 | Core hotspots | No disk work and no event under the hierarchy lock; one owner of a connection's lifetime; an injectable file writer; one stream pump | 5 |
| M6 | The specification projects | One loader infrastructure, one CEL cache, one write template; DISL typed at load; parsers on libraries where a library serves | 6 |
| M7 | Module internals | The projection, parser, layout and session god types of the largest modules decomposed | 7 |
| M8 | Test consolidation and the stub modules | One transcript harness; module flows out of the core test project; the stub modules in the shape the maintainer rules | 2.1, 8.3, 8.6, 8.7 |
| M9 | Close | The final measurement against every success criterion; the follow-up features written down | all |

The order is the report's roadmap with two changes it suggested itself: the test safety net moves to the front "given past CI flakiness", and the stub modules go last because they wait on a steering decision.

## User Scenarios & Testing *(mandatory)*

The people this feature serves are the developers and agents who change the standalone host, the tool engineer who adds a tool type to it, the maintainer who reviews every pull request, and the user of the application, who must notice nothing but fewer faults.

### User Story 1 - The test suite can be trusted before the code moves (Priority: P1)

A developer about to move code between projects runs the suite and believes a green result, because no test passes or fails on the speed of the machine it ran on, and because the defects the report found are held by guards that were seen to fail.

**Why this priority**: every later milestone moves code that only the tests can vouch for. A refactoring judged by a suite that fails at random is judged by nothing. The 25 fixed sleeps are the same race `HierarchyWatchProbe` was written to close.

**Independent Test**: the suite is run twenty times in a row on a GitHub runner and on a developer machine, with the machine under load, and every run gives the same result. A search of the test code finds no fixed wait for a stream to become live.

**Acceptance Scenarios**:

1. **Given** a flow test that subscribes to a context or diagram stream, **When** it starts, **Then** it proceeds on evidence that the stream is live and not after a fixed delay.
2. **Given** any test project of a module, **When** it needs a temporary folder, the repository root, the real command pipeline or a wait-until helper, **Then** it gets each from one referenced testing project and declares none of its own.
3. **Given** a defect of section *Possible defects*, **When** its correction is merged, **Then** the same pull request holds a guard that was run against the uncorrected code and failed for that defect's reason.
4. **Given** the report's measurements, **When** anyone runs the measurement scripts on a commit, **Then** they get the line counts per project, the clone scan, the method-length counts and the project graph for that commit, and the baseline of this feature is on record.

---

### User Story 2 - A diagram module holds only what is particular to it (Priority: P1)

A developer adds an element kind to a diagram module, or a tool engineer adds a new diagram type, and writes the model, the mapping, the parser and writer (or a binding), the actions and the properties. They do not write a reloader, a changed-event type, an entry record, a session factory or the body of a store, and a command handler states only what its edit does.

**Why this priority**: it is the largest single finding, about three quarters of the reclaimable production code, and the copies are where defects were copied with the code (`TimelineFlow.Tests.cs` records that six of nine stores shared one faulty shape).

**Independent Test**: after M1, the clone scan shows no shared window between sankey and supply-chain in the role classes; the two modules' document stores are a subclass of a few lines each; and the contract tests of the shared store pass for both without a per-module copy.

**Acceptance Scenarios**:

1. **Given** a document-based diagram module, **When** its persistence types are listed, **Then** they are an entry, a store subclass and a session, and no reloader, event-args, session-factory or document-factory class of its own unless the module reads registration headers.
2. **Given** an edit that saves with a warning, **When** its command completes, **Then** the warning reaches the command's result in every module, because the shared handler carries it and a handler cannot drop it.
3. **Given** a session whose document changes on disk, **When** the change is delivered, **Then** the delta is computed by the one shared change handler, in all 19 modules.
4. **Given** an element selected on the canvas, **When** its context source is resolved, **Then** the module supplied its origin, how to load, how to describe an element and how to map one, and the shared resolver did the rest.
5. **Given** the three watched-folder modules, **When** a folder changes, **Then** one shared watched-folder store claims, releases, settles and raises the change for all three.

---

### User Story 3 - A shared utility exists once (Priority: P2)

A developer who needs a line document, an offset-to-line index, a rectangle, a layering of a graph, a YAML scalar, a formatted number, a quoted string, a watched file or a debounce finds one in core and uses it. A correction made to it is made for every tool.

**Why this priority**: the copies have already drifted, and drift is how D1, D2 and the `\r` difference between the two tokenizers came about. It follows the middle layer because the middle layer removes some of these copies by itself.

**Independent Test**: for each utility of FR-042 to FR-053, a search of the production code finds one definition, and each module that had a copy passes its unchanged tests on the shared one.

**Acceptance Scenarios**:

1. **Given** the three private line documents, **When** M3 ends, **Then** all three modules use the core line document and line endings are decided in one place.
2. **Given** a graph that two tools lay out, **When** each calls the shared layering, **Then** each names the cycle policy it uses, and each tool's layout of its fixtures is what it was before.
3. **Given** a debounce or an idle eviction, **When** its test runs, **Then** the test advances a clock and waits for no real time.

---

### User Story 4 - The project graph says what the architecture says (Priority: P2)

A developer opening the solution can tell from a project's name and its references what it is for. The project that holds the diagram contracts does not hold the web host. A rule that holds for every tool kind is written once and says *tool*.

**Why this priority**: every module reference and every architecture page rests on it, and it is the largest move of code between projects, which is why it waits until the modules are small.

**Independent Test**: the project graph of the measurement scripts shows the diagram-abstractions project referencing only the documents project and the shared primitives; no project without code; no core project naming a tool module; and a search finds the precedence of diagram, designer and editor decided in one method.

**Acceptance Scenarios**:

1. **Given** the diagram-abstractions project, **When** its references are listed, **Then** they are the documents project and the shared primitives, and it carries no web or gRPC hosting package of its own.
2. **Given** a path under a project root, **When** any part of the backend asks which tool serves it, **Then** it asks one router and switches on one result.
3. **Given** a path a client sends, **When** it is resolved against a project root, **Then** one implementation decides containment, compares names as the operating system does, and refuses a link that leaves the root.
4. **Given** an `.adp` registration, **When** it is read or written anywhere, **Then** one owning type parsed or produced it.

---

### User Story 5 - Core's hot paths are safe under load (Priority: P2)

A user works in a large project with several clients connected. A change on disk does not hold up every gRPC call while a folder is enumerated, a failed stream start does not keep a project's history in memory for ever, and a slow client does not grow a queue without bound.

**Why this priority**: these are the report's findings with consequences at run time. They come after the graph surgery because the types that would own the fix (a connection's session, a project's file events) get their home there.

**Independent Test**: a guard shows that no subscriber of a hierarchy change is called while the hierarchy lock is held; a guard shows that a cancelled discovery releases what it retained; and a test with a stalled client shows a bounded queue and a stated drop.

**Acceptance Scenarios**:

1. **Given** a folder with many entries that changes on disk, **When** the hierarchy synchronises, **Then** the directory is read outside the lock and only the result is applied under it.
2. **Given** a watch whose first discovery throws or is cancelled, **When** the call ends, **Then** everything it retained is released.
3. **Given** a stream to a client that stops reading, **When** messages keep arriving, **Then** the channel holds at most its stated bound and applies its stated policy.

---

### User Story 6 - The specification libraries read FBL and DISL one way (Priority: P3)

A developer changing how a DISL construct behaves changes the typed node for it, and finds the schema knowledge in the loader and nowhere else. A developer adding a format family writes its parser and three slot operations, and inherits the write loop.

**Why this priority**: it is contained in three projects with strong test suites and blocks nobody, but the fifteen conversions build on these libraries, so its order against them is decision point DP-2.

**Independent Test**: the conformance fixtures of FBL vendored from this repository and the DISL test suite pass unchanged; a search of DISL's derivation code finds no raw JSON access; and one cache serves every compiled expression.

**Acceptance Scenarios**:

1. **Given** a DISL definition, **When** it is loaded, **Then** its operations, actions, toolbox, menus, forms, constraints and hooks are typed nodes, each expression already compiled, and a missing expression is an error at load and never a silent compile at run.
2. **Given** an insert of a value through the JSON family and through the YAML family, **When** the value is computed or empty, **Then** both families do what the FBL specification says, by one shared template.
3. **Given** a module that needs a DISL model from its own reading, **When** it builds one, **Then** it does not construct FBL elements by hand to get it.

---

### User Story 7 - The largest modules can be read (Priority: P3)

A developer opening the OWL projection, the Wardley parser, the SPARQL parser, the C4 layout or the knowledge designer's edits finds types with one job each and methods that fit a screen.

**Why this priority**: it is real cost to whoever maintains those modules and affects no other. It is also where a conversion to FBL may remove the code before it is restructured (FR-012), so it is late on purpose.

**Independent Test**: the method-length count shows the listed methods under the stated length, and each module's tests pass unchanged.

**Acceptance Scenarios**:

1. **Given** the 420-line `OwlProjection.Project`, **When** M7 ends, **Then** it is a builder type whose methods are each under 50 code lines.
2. **Given** the knowledge designer's 45-arm switch on gesture-kind text, **When** M7 ends, **Then** a gesture is looked up in a table that states whether it needs a view, and reordering entries changes nothing.

---

### User Story 8 - Test code is written once (Priority: P2)

A developer writing a flow test for a new module writes the flow. The host, the sign-in, the project, the channel, the baseline and the transcript comparison come from shared harnesses, and a store or reloader is held to its contract by an abstract contract test the module derives from.

**Why this priority**: about 6,000 to 7,000 test lines are copies, and a copied test copies its blind spot. The harness itself arrives in M0 (User Story 1); the contracts arrive with the types they hold (M1); the rest is M8.

**Independent Test**: a search finds one sign-in helper, one transcript harness and one canonical-JSON writer; the module flow tests live with their modules.

**Acceptance Scenarios**:

1. **Given** the six parity-transcript harnesses, **When** M8 ends, **Then** one harness serves six module adapters and the six transcript files are unchanged.
2. **Given** the core backend test project, **When** M8 ends, **Then** it holds no flow that tests one module.

---

### User Story 9 - The plan is read again at every milestone (Priority: P1)

At the end of each milestone the owner runs the measurements again, compares them with the previous record, and asks which refactorings the milestone just made possible or pointless. The maintainer reads a short record and sees what was added, what was dropped and why.

**Why this priority**: it is the half of the request that the report could not contain. A plan this long, executed as written from a reading taken in October, would refactor code that an earlier step had already made unnecessary and miss what only became visible later.

**Independent Test**: for each milestone there is a file `reviews/M<n>-review.md` in this folder, merged before the first task of the next milestone was started, holding the measurements, the comparison, an answer for each candidate this feature names for that review, and every new task or follow-up feature it produced.

**Acceptance Scenarios**:

1. **Given** a milestone whose last task is merged, **When** its review is written, **Then** it holds the clone scan, the method-length counts, the line counts and the project graph of that commit beside those of the previous review.
2. **Given** a candidate refactoring found at a review, **When** it fits this feature's purpose and milestones, **Then** it becomes tasks in `tasks.md` with new numbers; **and when** it does not, **Then** it is written down as a follow-up feature with its evidence, and not lost.
3. **Given** a planned task the review finds unnecessary, **When** it is removed, **Then** it is struck in `tasks.md` with the review that struck it and never ticked.
4. **Given** a success criterion whose estimate did not hold, **When** the review meets it, **Then** it says which role or type did not fit as sketched, with evidence, and the criterion is met or amended openly.

---

### Edge Cases

- **A base type that does not fit a module.** Mindmap reacts to the kind of structural change, SPARQL is read-only, C4 keeps a boolean failure flag, and four modules read registration headers. A module that cannot adopt a shared type keeps its own and its adoption task records why, in one sentence, in the code and in the milestone review. A base type is never bent with a switch on the module to make it fit.
- **A copy that differs on purpose.** Before two copies are joined, their difference is read. A difference that is a decision stays, as a parameter with a name (a cycle policy, a comment rule). A difference that is drift goes into the behaviour-change register.
- **A conversion to FBL arrives first.** A task that restructures a parser, a writer, or an action or property provider of a module whose `*-disl-fbl` specification has started is not done; the review records it as overtaken.
- **Pull request 167 is closed without merging.** D1, D3, D7 and D8 then come back into this feature as guard-first tasks, added at the next review.
- **A guard cannot be made to fail.** Then the defect is not shown. The task records what was tried and the defect is struck from the list as unconfirmed, as the report itself allows ("none was confirmed with a failing test").
- **A count on the architecture pages changes.** The pull request that changes a project count, a project name or a path updates `docs/architecture.md` and `docs/solution-structure.md` and the figures `ArchitecturePages.Tests` holds, or its gates do not pass.
- **Two developers.** One developer owns this feature at a time. If ownership passes, it passes at a milestone review, and the review names both.
- **The baseline has moved.** The report read `fcb64c9`; `develop` has moved since. The first task measures the commit the work starts from, and every target below is against that baseline.
- **Linux and Windows.** Path containment and file watching behave differently on each. A guard for either runs on the GitHub runner (Linux) as well as locally (Windows), and says which behaviour it holds on which system.

## Requirements *(mandatory)*

### Functional Requirements

#### How the work is done

- **FR-001**: The feature MUST NOT change what a user of the application sees or what is written to a user's files, except for the corrections of section *Possible defects* and the entries of the register of FR-002.
- **FR-002**: Every place where sharing one implementation changes observable behaviour for some tool MUST be entered in [behaviour-changes.md](behaviour-changes.md) before the change merges, with the tools affected, the old and the new behaviour, the guard that holds it and the ruling that allowed it. An entry without a ruling blocks its task.
- **FR-003**: Each pull request in `etalii.adp.ide.standalone` MUST be made on a `features/<name>` branch in its own worktree, MUST pass the four gates (`npm test`, `npm run typecheck`, `dotnet format style --verify-no-changes --severity info`, `dotnet test`) with exit code zero and the inspection job with no finding, MUST be merged with a merge commit, and MUST name in its description this feature's folder and the `etalii.adp` commit its tasks were taken from.
- **FR-004**: A pull request that makes a sentence of `docs/architecture.md`, `docs/solution-structure.md`, `docs/creating-a-diagram-module.md`, `docs/creating-a-designer-module.md` or `docs/creating-an-editor-module.md` false MUST correct that page, and the figures `ArchitecturePages.Tests` holds, in the same pull request.
- **FR-005**: Every defect corrected MUST leave a guard that was run against the uncorrected code and seen to fail for that defect's reason. The pull request states the failing output.
- **FR-006**: Commits MUST be made under an `agent-<N>-<task>` identity. One developer owns this feature at a time; ownership passes only at a milestone review.
- **FR-007**: A comment that records when or under which task code was written MUST be reduced to what the code does and why, with the provenance moved to the commit message, in each file a task touches. This MUST NOT be done as a sweep over files no task touches.
- **FR-008**: A shared type MUST arrive in the same pull request as its first consumer and its contract tests, and MUST NOT be added ahead of a consumer. Adoption by further modules is one module per pull request.
- **FR-009**: The report's measurement method MUST be kept as runnable scripts in `etalii.adp.ide.standalone`: line counts per project, the normalized clone scan, the method-length count and the project graph. Their output for the commit the work starts from is this feature's baseline.
- **FR-010**: After the last task of each milestone, a milestone review MUST be carried out and recorded as `reviews/M<n>-review.md` in this folder, following [contracts/milestone-review.md](contracts/milestone-review.md). It re-runs the measurements, compares them with the previous record, answers each candidate named for that review, and asks what else has become worth doing. No task of the next milestone starts before the record is merged.
- **FR-011**: A refactoring a review finds MUST become new tasks in `tasks.md` when it serves this feature's requirements, or a written follow-up feature when it does not. A planned task a review finds unnecessary MUST be struck with a reference to the review. Nothing is dropped without a line saying so.
- **FR-012**: Before a task restructures the parser, the writer, the action provider or the property provider of a diagram module, the state of that module's `*-disl-fbl` specification in `etalii.adp.ide.standalone` MUST be read. Where that specification has implementation under way, or is ordered ahead of the task by DP-2, the task is reduced to what survives the conversion, and the review records it.
- **FR-013**: A task that depends on a decision point of section *Decision points* MUST NOT start before the maintainer's ruling is recorded in this specification.
- **FR-014**: A task is ticked in `tasks.md` only when the pull request in `etalii.adp.ide.standalone` that carries it is merged.

#### M0: the safety net (report 8.1, 8.2, 8.6, 11 step 1)

- **FR-015**: Test helpers MUST be reachable from every test project, module test projects included, through one referenced testing project attached by the shared build files: the command pipeline for tests, temporary folders, the repository paths, one wait-until helper, the host harness and the contract tests. The log capture stays compiled into each test project, because its module initializer needs that.
- **FR-016**: The gRPC flow tests MUST share one host fixture, one flow session (sign-in, add project, channel, message timeout, baseline) and one set of constants, in place of the copies in 35 classes.
- **FR-017**: No test MUST wait a fixed time for a stream to become live. The hierarchy-watch probe is generalized to context and diagram streams, or the server announces the subscription, and the `StreamStartupGrace` constant is removed.
- **FR-018**: The quick wins of the report's roadmap step 1 MUST be done: the project references nothing uses are removed, the toolbox-provider and rule-set forwarders are deleted, and the stale comments, the commented-out code and the `InternalsVisibleTo` for a method that no longer exists (report 5.1 and 5.4) are corrected.
- **FR-019**: It MUST be settled whether the shipped-examples sweep leaves out the `.ghg`, `.ttl` and `.rq` examples on purpose. If not, it sweeps every shipped extension without a hard-coded list.

#### Possible defects (report 10)

- **FR-020**: D1, D3, D7 and D8 are in flight in pull request 167 of `etalii.adp.ide.standalone`, open on 2026-10-11. This feature depends on it and MUST NOT repeat it. After it merges, M0 confirms that each of the four has its guard on `develop`. If it closes unmerged, the four return here as guard-first tasks.
- **FR-021**: D2 (shortcuts sent without modifier flags by the agent-behavior-modelling and mindmap modules) is documented in `AbmDefinition` as deliberate. It MUST be checked in the running application before anything is changed. If the shortcut does not work, a guard and a correction follow; if it does, D2 is struck with the evidence.
- **FR-022**: D4: a warning of a save MUST reach the command's result in every module. The shared handler carries it by construction (FR-033), and each module's adoption sees a guard fail first.
- **FR-023**: D5: a watch that fails or is cancelled during its first discovery MUST release the history and the problem watch it retained.
- **FR-024**: D6: containment of a path in a project root MUST be decided by one implementation that compares as the operating system does and refuses a symbolic link that leaves the root, and every one of the seven places the report lists MUST use it.
- **FR-025**: D9: the JSON and YAML families MUST agree on whether a computed or empty value is skipped on insert, by what the FBL specification says. If the specification does not say, the question comes back to this repository as a feature of its own before the code is changed.
- **FR-026**: D10: no subscriber of a hierarchy change MUST be called while the hierarchy's lock is held.

#### M1 and M2: the module middle layer (report 1)

- **FR-027**: The order of the middle layer MUST be the report's (1.7): the store contract and the generic reloader, the store base, the session-factory registration, the session base, the resolver base, the handler base, then the provider frame. Each is piloted on sankey, supply-chain, functional-decomposition-graph and gartner-hype-cycle-graph (M1) before it is rolled out to the other fifteen modules (M2).
- **FR-028**: One store contract MUST declare reloading, deletion of the body and forgetting, and one generic reloader MUST serve every store that meets it, in place of the 16 reloader classes (1.3).
- **FR-029**: One store base, one entry type with one failure field, and one changed-event type MUST replace the per-module stores' bodies, the 13 entry records and the 12 event-args types (1.3). A module keeps a marker interface only where registration or a command needs a distinct type.
- **FR-030**: A session factory and an empty document MUST be registrations and not classes, except in the four modules that read registration headers: c4, helm-chart, ansible-structure and dotnet-dependency-graph (1.4).
- **FR-031**: One document-session base MUST serve the document-based sessions, and the 13 sessions that compute their own delivered-elements diff MUST use the shared change handler (1.2).
- **FR-032**: One source-resolver base MUST carry the six steps every resolver repeats; a module supplies its origin, its loading, its description of an element, its mapping of one element and its change subscription. One disposable-from-action replaces the 12 unsubscriber types (1.1).
- **FR-033**: One command-handler base and one edit run MUST carry the checks, the loading, the find-by-id refusal, the inverse and the save, and MUST build the command's result from the save's result so that a warning cannot be dropped. One generic handler restores lines, in place of the hand-written restore handlers that duplicate it (1.5).
- **FR-034**: The action and property providers MUST share a frame for dispatch, scope, discovery, the unreadable-document guard and the deletion confirmation. Where one module maps the same actions to commands in more than one place, as wardley-map does in three, one record per action serves all of them (1.6).
- **FR-035**: The copies of the store's lost-edit tests and of the reloader tests MUST become two abstract contract tests that each module derives from (8.4).
- **FR-036**: After M2, every diagram module with real code MUST have the shape of report 1.7, or its milestone review MUST say which type it kept and why.

#### M2: sibling modules (report 2)

- **FR-037**: ansible-structure, helm-chart and dotnet-dependency-graph MUST share one watched-folder store (claim, release, settle, changed) and one tolerant YAML reader. Their readers, graphs and rules stay per module.
- **FR-038**: The rdf, owl, shacl and skos sessions MUST be one session parameterised by its projection, and their four factories one, parameterised by origin.
- **FR-039**: timeline and dependency-graph MUST lose their forwarders to the core gesture ids. Whether what is left of the two (model, parser, writer) shares a base is a candidate for the M2 review, read against FR-012.
- **FR-040**: sankey and supply-chain MUST stay two modules. What they share is what M1 gives them.

#### M3: shared utilities (report 3, 8.5)

- **FR-041**: Each utility of FR-042 to FR-053 MUST have one implementation in core, and every copy the report names MUST be replaced by it.
- **FR-042**: The line document: the wardley-map, c4 and causal-loop-diagram copies move onto the core one, which decides line endings for all.
- **FR-043**: The offset-to-line index, also offered by the line document.
- **FR-044**: The terminal scanner, the string escapes and the numeric literal of Turtle and SPARQL, in core because the sparql module may not reference the rdf module. The two parsers stay separate.
- **FR-045**: A layout library: one rectangle and one viewport-intersection test for the nine copies and the seventeen mappers; a layering of a graph with a named cycle policy, where each tool keeps the policy it has; an ordering within layers; a grid packer; an overlap resolver.
- **FR-046**: YAML access (scalar, sequence, line of a node), promoted from the databricks module.
- **FR-047**: Number formatting for line DSLs, in place of the ten definitions.
- **FR-048**: A line lexer with a configurable comment and escape policy, and the matching quoted-string writer.
- **FR-049**: One parse outcome (model, problems, usable) in place of the four styles. Exceptions stay inside tokenizers.
- **FR-050**: A watched file and a watched folder with an asynchronous read-retry, one reference-counted source of file events per project root that filters scratch files, and one test for a transient file name.
- **FR-051**: A debouncer and a retained registry, both on an injected clock, and the clock injected wherever production code waits. Tests of a debounce, an idle eviction or a retry advance a fake clock.
- **FR-052**: One adapter from a bundled DISL definition to a module's toolbox, menus and rows, and one DISL toolbox provider, in place of the seven adapters.
- **FR-053**: One text-editor session, with the markdown editor as a thin variant of it.

#### M4: the core project graph (report 4)

- **FR-054**: The diagram-abstractions project MUST hold the module contracts and the diagram definition and origin, and depend on the documents project only. The gRPC services, the connection registry, the table wire and the reload bridge MUST move to a host project (4.1).
- **FR-055**: The client-hosting project of 146 lines MUST be folded into the service project (4.2).
- **FR-056**: The documents project MUST be split into its wire, layout and file-system parts, and no core project MUST grant `InternalsVisibleTo` to a tool module (4.2).
- **FR-057**: Discovery, catalog, session-factory registry and registration MUST be generic over one tool-definition contract, each catalog registered once in its own family's registration (4.3).
- **FR-058**: One router MUST decide which tool serves a path, and the precedence of diagram, designer and editor MUST be coded there and nowhere else (4.3).
- **FR-059**: A project root and a path within it MUST be value types that normalize once and carry the containment of FR-024 (4.5).
- **FR-060**: One origin type MUST serve all three tool kinds (4.5).
- **FR-061**: One type MUST own the `.adp` registration (the MIME line, the headers, the layout), with a cache keyed on modification time, and the registration layout MUST move to the diagram-abstractions project so that no module references the hierarchy project for it (4.6).
- **FR-062**: `projects.json` MUST be cached per user, invalidated on write, written under a lock, and a request MUST resolve its project once. The project text file moves to the projects project (4.6).
- **FR-063**: Entry names MUST be validated by one validator (4.6).
- **FR-064**: History and Context MUST NOT depend on each other in both directions: the notice sink is owned by History, the broadcasters are hosted services, and the diagram catalog is not registered by the command registration (4.7).
- **FR-065**: The sessions project MUST NOT stay empty: by the end of M5 it is deleted or it owns connection and project lifetime, as DP-5 rules.

#### M5: core hotspots (report 5)

- **FR-066**: The hierarchy model MUST be decomposed into an event normalizer, an index with children-by-parent lookup and a state decorator; MUST do no disk work under its lock; MUST raise events after the lock is released (FR-026); and MUST have required dependencies in place of the optional ones kept "for older tests" (5.1).
- **FR-067**: One scope MUST acquire and release what a connection and a project hold (history, problem watching, the hierarchy model), and the gRPC services MUST delegate to domain services and not to each other (5.2).
- **FR-068**: The file writer MUST be injectable, with asynchronous, reference-counted locks per path that are released when unused (5.4).
- **FR-069**: Opening, pumping and closing a stream MUST be one helper for diagram and table streams, which checks once that the connection exists and belongs to the user and awaits its tasks on close (5.3).
- **FR-070**: Every channel MUST be bounded with a stated drop policy; no task MUST be left unobserved; no asynchronous work MUST be blocked on (5.3).
- **FR-071**: Adding a diagram MUST be one strategy per family in place of four workflows in one method (5.4).
- **FR-072**: The problem store MUST be split into a cache and a staleness policy (5.4).
- **FR-073**: The context service's wire mapping MUST be a mapper of its own, and the Project and Problems source kinds MUST be ordinary resolvers (5.4).

#### M6: the specification projects (report 6)

- **FR-074**: DISL and FBL MUST share one loader infrastructure: the diagnostic record and severity, JSON Pointer escaping, the scalar helpers, the conversion from JSON to CEL values, duplicate-key detection and the version check (6.5).
- **FR-075**: One thread-safe cache MUST serve every compiled CEL program; FBL rules hold their programs; DISL contexts are typed (6.4).
- **FR-076**: The four format families MUST inherit one write template with remove, replace and insert hooks, one resolver of inserted values and one key order (6.1), which settles D9 (FR-025).
- **FR-077**: The binding loader MUST be split into a reader and a checker, and MUST collect every problem on schema-invalid input without throwing (6.7).
- **FR-078**: A slot MUST be a closed set of cases, and its settings parsed once into enumerations (6.6).
- **FR-079**: DISL MUST be typed at load: operations, actions, toolbox, menus, forms, constraints and hooks are records, each expression-bearing field holds its compiled program, and a pointer that matches nothing is an error at load (6.3).
- **FR-080**: JSON bodies MUST be read with the platform's reader, which gives byte offsets, in place of the hand-written parser (6.2).
- **FR-081**: A spike MUST show whether a YAML token tree from the library the project already uses can replace the hand-written YAML parser. Its outcome is recorded either way, and the parser is replaced only if the spike succeeds (6.2).
- **FR-082**: The public surface of the three specification projects MUST be narrowed to what another project uses (6.9).
- **FR-083**: A module MUST be able to get a DISL model from its own reading through a bridge, without constructing FBL elements by hand (6.8).
- **FR-084**: Moving timeline and dependency-graph, and then databricks, to FBL bindings (6.10) is the work of their `*-disl-fbl` specifications in `etalii.adp.ide.standalone`. This feature MUST supply what they wait on from FR-074 to FR-083, MUST track them at each review, and MUST NOT do their work twice.
- **FR-085**: The FBL conformance fixtures vendored from this repository and the DISL test suite MUST pass unchanged through M6. A disagreement between a library and a specification that the work uncovers comes back to this repository as a feature of its own.

#### M7: module internals (report 7)

- **FR-086**: The OWL, SKOS and RDF projections MUST each be a builder type, with a shared budgeted graph builder for node registration and the budget cut.
- **FR-087**: The knowledge designer's value types MUST be a registry with one strategy per type, and its edits MUST be split into cell, column, view and filter edits behind a gesture table that states which gestures need a view.
- **FR-088**: The knowledge session MUST be split into a queue of pending edits, a watched file (FR-050) and a view state.
- **FR-089**: The wardley-map parser MUST read its keywords from a table in which order does not matter, and DSL text MUST be built by the writer and not by command handlers.
- **FR-090**: The SPARQL parser MUST be split into a grammar, a scope analyser and a token cursor.
- **FR-091**: The C4 layout MUST use the shared layering and overlap resolver (FR-045) and a boundary packer of its own.
- **FR-092**: Each of FR-086 to FR-091 is subject to FR-012, and the long methods the report lists besides them (7, last paragraph) MUST be brought under the lengths of SC-023 or named in the M7 review as left on purpose.

#### M8: test consolidation and the stub modules (report 2.1, 8.3, 8.6, 8.7)

- **FR-093**: The six parity-transcript harnesses MUST be one harness with a module adapter, with one canonical-JSON writer and one abstract transcript test (8.3).
- **FR-094**: The hand-written test dispatchers, the hand-built temporary folders and the copies of the repository-root locator MUST be replaced by the testing project of FR-015 (8.6).
- **FR-095**: Flows that test one module MUST live with that module, and the two hand-kept per-module type catalogues MUST be derived or removed (8.7).
- **FR-096**: The tests of `gate.sh` and `land.sh`, a process `CLAUDE.md` of that repository says no longer applies, MUST leave the product test suite (8.7).
- **FR-097**: The 48 stub modules MUST take the shape DP-1 rules. Where that changes the stub shape `.spec-workflow/steering/tech.md` mandates, the steering document and the architecture pages are changed in the same pull request as the first stub that moves.

#### M9: close

- **FR-098**: A final review MUST measure every success criterion, record each as met, amended (with the review that amended it) or missed (with the reason), and list the follow-up features the reviews produced.

### Key Entities

- **The report**: [analysis-2026-10-10.md](analysis-2026-10-10.md), the tracked work. Its sections are cited as "report 4.3".
- **Milestone**: a named stretch of work with an exit condition and a review. Ten, M0 to M9.
- **Milestone review**: the measurement, comparison and reconsideration at a milestone's end, with its record in `reviews/`.
- **Baseline**: the output of the measurement scripts for the commit the work starts from.
- **Behaviour-change register**: [behaviour-changes.md](behaviour-changes.md), every place where sharing changes what a tool does.
- **Decision point**: a choice that is the maintainer's, with the tasks it blocks.
- **Role class**: one of the ten classes every diagram module repeats: source resolver, session, session factory, document store, entry, changed-event args, reloader, document factory, edit helper, command handler.
- **Pilot module**: sankey, supply-chain, functional-decomposition-graph or gartner-hype-cycle-graph.
- **Conversion specification**: one of the fifteen `*-disl-fbl` spec-workflow specifications of `etalii.adp.ide.standalone`.

## Decision points

Each is the maintainer's to rule. The plan assumes the option marked *assumed* so that work which does not depend on the ruling can be planned, and FR-013 holds the tasks that do.

| # | Decision | Options | Blocks |
|---|---|---|---|
| DP-1 | The shape of the 48 stub modules. `.spec-workflow/steering/tech.md` (*Declaring a diagram definition*) mandates one project per stub, and the architecture pages say "a type is a folder". | (a) one catalog project holding all 48 definitions: 188 files and 47 projects fewer, no core change (*assumed*); (b) the catalog generated from `docs/tools.md`; (c) the stubs stay as they are | FR-097, the stub tasks of M8 |
| DP-2 | The order of this feature against the fifteen conversion specifications. | (a) M0 to M2 first, then the conversions, with M3, M6 and M7 re-read at their reviews for what the conversions removed (*assumed*); (b) the conversions first; (c) module by module, whichever reaches a module first | FR-012, the parser, writer and provider tasks of M2, M3, M6 and M7 |
| DP-3 | The ruling of 2026-09-15 in `backend-centralization` declined to share one-line members that are identical across modules, the reloader forwarders among them. FR-028 and FR-032 remove those classes whole. | (a) the ruling stands for sharing a line and does not stand in the way of deleting the class, so FR-028 and FR-032 proceed (*assumed*); (b) the ruling stands as written and the reloaders and one-line members stay per module | The reloader tasks of M1 and M2 |
| DP-4 | Whether standalone's planning convention changes. | (a) this feature only; `CLAUDE.md`, the constitution and `specs/README.md` stay as they are (*assumed*); (b) standalone's new features are Spec Kit features here from now on, with those three documents changed and a principles file `.specify/memory/repositories/etalii.adp.ide.standalone.md` written | Nothing in this feature; the close task of M9 records the ruling |
| DP-5 | The empty sessions project. | (a) it becomes the owner of connection and project lifetime in M5 (*assumed*, since report 5.2 needs a home for exactly that and the architecture page already says so); (b) it is deleted in M4 and the lifetime scope lives in the host project | FR-065, FR-067 |
| DP-6 | Ownership of a feature this long. | (a) one developer at a time, with handover only at a milestone review (*assumed*); (b) the milestones become features of their own, so that M6 and M7, which touch other code than M1 to M5, can run beside them under other owners | FR-006 |

## Success Criteria *(mandatory)*

### Measurable Outcomes

Every count is taken by the scripts of FR-009 against the baseline. The figures in brackets are the report's, read at `fcb64c9`; where the baseline differs, the criterion is the same proportion of the baseline. A criterion a milestone review amends is amended in this file, with the review named.

**The suite**

- **SC-001**: No fixed wait for a stream to become live remains in the tests (25), and the constant that named it is gone. From M0.
- **SC-002**: Twenty consecutive runs of the suite on the GitHub runner give twenty identical results, at the end of M0 and again at M9.
- **SC-003**: One sign-in helper, one add-project helper and one channel helper exist in the tests (23, 23 and 24 copies); one wait-until helper (13). From M0.
- **SC-004**: No test waits in real time for a debounce, an idle eviction or a retry. From M3.
- **SC-005**: Test code is at least 5,000 lines smaller than the baseline, with no test removed that was not replaced by a contract or harness test that covers it. At M9.

**The modules**

- **SC-006**: Production code of the diagram modules is at least 9,000 lines and 250 files smaller than the baseline at the end of M2, the stub modules not counted.
- **SC-007**: After M2 the modules declare no reloader class (16), no changed-event type (12), no unsubscriber type (12) and no session that computes its own delivered-elements diff (13); at most four session-factory classes and four document-factory classes (21 each).
- **SC-008**: The normalized clone scan reports fewer than 200 shared windows in the context-source-resolver role (1,911) and fewer than 50 in each of the session-factory (326), property-provider (134), document-store (115) and action-provider (99) roles. At the end of M2.
- **SC-009**: No command handler in a diagram module builds its result from a save without the save's warning, held by the contract test of FR-033 for every module. At the end of M2.

**The utilities**

- **SC-010**: One line document (4), one rectangle type (9 copies), one viewport-intersection test (about 17), one number format for line DSLs (10), one YAML scalar accessor (10), one read-retry (3) and no `Thread.Sleep` in production code. At the end of M3.
- **SC-011**: Each tool's fixtures lay out as before; the layering of every tool names its cycle policy. At the end of M3.

**The core**

- **SC-012**: The diagram-abstractions project references the documents project and the shared primitives, no other core project (8 at the report's reading), and no web or gRPC hosting package. At the end of M4.
- **SC-013**: No project of the solution is without code; no core project names a tool module, in a reference, in `InternalsVisibleTo` or in code. At the end of M5.
- **SC-014**: One implementation decides path containment (7), and it is exercised on Linux and on Windows by guards for case and for an escaping link. From M0.
- **SC-015**: The precedence of diagram, designer and editor is decided in one method (4 places); one discovery, one catalog type and one session-factory registry serve three families (3 of each). At the end of M4.
- **SC-016**: `projects.json` is read at most once per request, and at most once per user between writes (8 call sites that read it each time). At the end of M4.
- **SC-017**: The hierarchy model is at most half its size (918 lines), does no input or output and raises no event while holding its lock. At the end of M5.
- **SC-018**: Every channel is bounded; a search finds no blocking wait on asynchronous work and no task started and left unobserved in the places report 5.3 lists. At the end of M5.

**The specification projects**

- **SC-019**: DISL's derivation code holds no raw JSON access (about 430 sites); what remains is in the loader. At the end of M6.
- **SC-020**: One cache serves compiled CEL programs (5 mechanisms); one write loop serves four families (4). At the end of M6.
- **SC-021**: The FBL conformance fixtures and the DISL suite pass with no fixture's expected result changed. Through M6.
- **SC-022**: FBL's public types are those another project uses (72 public types). At the end of M6.

**Readability**

- **SC-023**: At most 100 production methods exceed 50 code lines (145), and at most 20 exceed 80 (40). At M9. These two targets are this specification's, not the report's.

**The process**

- **SC-024**: Ten milestone reviews are on record, each merged before the next milestone's first task started, each with its measurements and an answer for every named candidate.
- **SC-025**: Every pull request of the feature passed the four gates and the inspection job, and none left `docs/architecture.md` or `docs/solution-structure.md` describing something that is no longer so.
- **SC-026**: Every defect D1 to D10 is closed with a guard seen to fail, or struck with the evidence that it is not a defect.
- **SC-027**: The solution holds 47 projects fewer (129) if DP-1 is ruled (a) or (b). At the end of M8.

## Assumptions

- The report is right in what it measured and rough in what it estimated; it says so itself ("Savings estimates are rough and assume the proposed base types fit as sketched"). The pilots of M1 exist to test the sketch against four modules before fifteen more are moved.
- Pull request 167 of `etalii.adp.ide.standalone` merges before M0 ends.
- Standalone has no principles file under `.specify/memory/repositories/`. Its principles are its own `CLAUDE.md` and `.spec-workflow/steering/*.md`, and the plan's constitution check reads those and says that it does. No principles file is written by this feature (DP-4).
- The plan's placement of each shared type is the report's proposal. In `backend-centralization` the maintainer kept placement as his own judgement; the review of this feature's pull request is where that judgement is given, and a placement he changes there changes [data-model.md](data-model.md) only.
- Out of scope, as the report's own method excludes them: the TypeScript client, the `.proto` contracts and generated code. Three of the report's advices need a change to a contract and are therefore not requirements here but named candidates of the M4 review: a `text` member on the workspace stream so that editors stop posing as one-element diagrams (4.4), renaming the wire message `Path` so that the `IoPath` alias can go from 417 files (5.4), and removing the three legacy calls kept for tests (5.4).
- A module with real code references the context, history and hierarchy projects besides the diagram abstractions, and those projects hold their own gRPC services. FR-054 therefore does not by itself free a module of the hosting packages. Whether the services of those projects move to the host project as well is a named candidate of the M4 review.
- Giving functional-decomposition-graph a bundled definition (report 2, last row) is the work of its conversion specification and not of this feature.
- Making tools agree on one cycle policy for layering would change how diagrams are drawn. This feature gives each tool the policy it has; agreeing on one is a product decision outside it.
- The application's users are not asked to do anything, and no file of theirs is migrated.

## Clarifications

### Session 2026-10-11

No question was put to the maintainer in this session. The points below were open in the request and were settled by the brief that came with it; the six that the brief could not settle are the decision points above.

- Q: Spec Kit here or spec-workflow in standalone? → A: Spec Kit here, by the maintainer's explicit request; the convention is recorded as set aside, not changed (Input, DP-4).
- Q: Are D1, D3, D7 and D8 work of this feature? → A: No. They are in flight in pull request 167 and this feature depends on it (FR-020).
- Q: Is D2 a defect? → A: Not known. `AbmDefinition` documents it as deliberate, so a check in the running application comes before any change (FR-021).
- Q: Are comments that record history cleaned up in one pass? → A: No. Only in files a task touches (FR-007).
- Q: Where do the stream sleeps go in the order? → A: To the front, in M0, because of the flakiness seen before (Milestones).
- Q: Who answers when a milestone review finds new work? → A: The review adds tasks or writes a follow-up feature, and its record is a pull request the maintainer reviews (FR-010, FR-011).
