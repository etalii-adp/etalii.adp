# Research: The Structure of the Standalone Host's C# Code

The primary research is the report, [analysis-2026-10-10.md](analysis-2026-10-10.md), copied verbatim from `research-input/standalone-csharp-analysis-2026-10-10.md` on branch `claude/project-thread-n4flrb` of this repository. That branch exists only to carry the file and can be deleted. What follows is what had to be decided on top of it, and what was read to decide it: standalone's `CLAUDE.md`, its `.spec-workflow/steering/`, its `docs/solution-structure.md`, its project files and `src/Directory.Build.targets`, at `develop` `a421ed4` on 2026-10-11.

## R1. A Spec Kit feature here

- **Decision**: this change is specified as feature 025 in `etalii.adp`, with its code landing in `etalii.adp.ide.standalone`.
- **Rationale**: the maintainer asked for it in those words. The mechanics already exist: tasks name files with their repository as prefix, each repository gets its own pull requests, and a task is ticked when that repository's pull request merges.
- **What does not carry over from spec-workflow**: the dashboard, its approval cards and its implementation logs. The maintainer approves by reviewing pull requests: this feature's, each review record's, and each standalone pull request.
- **Alternatives considered**: a spec-workflow specification per roadmap step, which the report itself suggested for steps 2 and 4. Not taken, by the request.

## R2. The order of the milestones

- **Decision**: M0 tests and defects; M1 and M2 the modules; M3 utilities; M4 the project graph; M5 hotspots; M6 the specification projects; M7 module internals; M8 remaining tests (the stubs stay, DP-1 (c)); M9 close.
- **Rationale**:
  - *Tests first.* Every later step is judged by the suite, and the suite has a known race in 25 places. The report says the sleeps "could move earlier, given past CI flakiness".
  - *Modules before utilities.* The middle layer deletes some utility copies by itself (the per-module `Edits.Run`, the unsubscribers, several `LineOf`), so doing utilities first would refactor code about to go.
  - *Modules before the graph.* Thinning the diagram-abstractions project moves every type a module references. Fifteen thousand fewer lines in the modules, and seven base types in place of hundreds of copies, make that move a fraction of the size.
  - *The graph before the hotspots.* The types that fix the hotspots (a connection's session, a project's file events, the stream pump) need the homes M4 creates.
  - *Specification projects late.* They are self-contained, well tested, and under active change by the conversions; M6 is also where DP-2 has the most effect.
  - *Module internals last of the code.* A conversion may delete a parser or a writer before M7 restructures it (FR-012).
- **Alternatives considered**: the report's roadmap as written (defects, modules, utilities, graph, hotspots, specification projects, tests, stubs). It differs only in where the test work sits.

## R3. The grain of a pull request

- **Decision**: a shared type arrives in the pull request of its first consumer, with its contract test. After that, one module per pull request. In M1 the seven steps of the report go in three bands, and each band is adopted by all four pilots before the next band starts:
  - **Band A, persistence**: the store contract and generic reloader; the store base, entry and changed event; the session-factory and empty-document registrations.
  - **Band B, session and resolver**: the document-session base; the source-resolver base.
  - **Band C, commands and providers**: the handler base and edit run; the provider frame.
- **Rationale**: the report says "each step lands per module, in its own pull request". Taken literally that is 7 × 19 pull requests. Bands keep the report's order, let a base type meet four modules before anything is built on it, and give a reviewer a diff that is mostly deletion. Sankey goes first in each band because it and supply-chain have an identical document layer, so the second adoption is the test of whether the type was shaped or merely moved.
- **In M2** a module's three bands are three tasks, which may travel in one pull request when the module is small, and must not be split across modules.
- **Alternatives considered**: all seven steps on sankey first, then each other pilot whole. Not taken: functional-decomposition-graph and gartner-hype-cycle-graph would meet the store base only after the handler base had been built on it.

## R4. The measurement scripts

- **Decision**: four Python 3 scripts, standard library only, in `etalii.adp.ide.standalone/.github/tools/analysis/`: `lines.py` (lines and files per project, production and test), `clones.py` (the normalized 10-line-window clone scan, with module prefixes, string literals and numbers normalized, reported by role pair), `methods.py` (brace-matched method lengths, with the counts over 50 and over 80 code lines and the top twenty), and `graph.py` (project references, package references and `InternalsVisibleTo`, as an edge list). One `measure.sh` runs all four on a commit and writes `measurements.json` and `measurements.md`.
- **Rationale**: the report's raw data "are in `/tmp` of the analysis container and are not kept". A review that cannot repeat the measurement can only repeat the opinion. Python because the scripts read text and no build is needed; beside `gate/` and `inspect/` because that is where standalone keeps its tools.
- **The scripts are not part of the product test suite.** FR-096 moves the gate-script tests out for the same reason. They get a self-check, `measure.sh --self-test`, on a small fixture tree kept beside them.
- **The first run reproduces the report.** T008 runs the scripts on `fcb64c9` and compares with the report's figures (±5%, the report's own margin); a larger difference is explained in the M0 review before any figure is used as a target.
- **Alternatives considered**: a Roslyn analyzer. More exact for method lengths, but a build per measurement, and the report's method was text-based; the targets are stated in its units.

## R5. Where the records live

- **Decision**: `specs/025-standalone-code-structure/reviews/M<n>-review.md` in this repository, each delivered by its own pull request into `develop`, on a branch `features/025-review-m<n>`. The same pull request edits `tasks.md` (new tasks, struck tasks, ticks) and, if a criterion is amended, the specification.
- **Rationale**: the maintainer reads one short document per milestone, in the place the feature lives, and his merge is the approval that lets the next milestone start (FR-010).
- **The measurements themselves** (`measurements.json`) are attached to the review as `reviews/M<n>-measurements.json`, so that two reviews can be compared by a script.

## R6. Two testing projects

- **Decision**: `EtAlii.Adp.TestSupport` stays the light one and becomes a `ProjectReference` of every `*.Tests` project through `src/Directory.Build.targets`. It holds `TestHistory`, `TestFolder.Create`, `RepositoryPaths`, `Eventually` and the contract tests. A new `EtAlii.Adp.TestSupport.Host` holds `HostFixture`, `FlowSession`, `FlowConstants`, `StreamProbe` and later `TranscriptHarness`, and is referenced only by projects with flow tests.
- **Rationale**: the report's root cause for copied test helpers is that "shared helpers are hard to reach". But a `WebApplicationFactory` harness references the service project, and a module's unit tests should not pull the whole host in to get a temporary folder. `EtAlii.Adp.TestSupport` already references the hierarchy, history, context and diagram projects, which every module with real code references too.
- **`LogCapture` stays compiled in.** `src/Directory.Build.targets` explains why, with a guard (`LogCaptureReachesModuleTestProjects.Tests.cs`): its module initializer runs once per assembly. `TestFolder.TryDelete` is a static helper without that constraint and moves to the project.
- **A stub module has no test project**, so nothing is attached to it.
- **Alternatives considered**: one testing project (the report's sketch). Not taken, for the reference it would give every module test project. If the M0 review finds the split unnecessary (the host reference is cheap, or every module test project ends up with flow tests), the two are merged then.

## R7. Stream readiness

- **Decision**: generalize `HierarchyWatchProbe` into `StreamProbe.WaitUntilLiveAsync(stream, provoke, recognize)`: provoke a change the stream must report, repeat until one is reported, and return on the last one provoked. Context streams are provoked through a selection that changes nothing, diagram streams through a probe file beside the body or a touch of the body, depending on the stream.
- **Rationale**: the hierarchy probe's own comment states the method and its trap ("the last probe rather than the first one seen"). The other way, the server sending a subscribed or baseline message, is a change to the wire contract and to the client, which this feature does not make (R13).
- **If a stream has nothing harmless to provoke**, the task says so and the review decides between a test-only hook and bringing the wire change in.

## R8. The clock

- **Decision**: `System.TimeProvider`, injected through constructors with `TimeProvider.System` as the registration, and `FakeTimeProvider` from `Microsoft.Extensions.TimeProvider.Testing` in tests. The package is referenced once, by `EtAlii.Adp.TestSupport`, and recorded in `docs/dependencies.md`.
- **Rationale**: it is in the framework, timers created through it are advanced by the fake, and `structure.md` puts a package in the highest parent that uses it.
- **Alternatives considered**: an `IClock` of our own. More code for less.

## R9. Where the shared types live

- **Decision**: [data-model.md](data-model.md) lists every type with its home. They are the report's proposals, with these corrections:
  - **The module-facing bases cannot stay where the report puts them once M4 happens.** The report puts `DiagramElementSourceResolver` and `DocumentDiagramSession` in the diagram-abstractions project (1.1, 1.2) and then asks for that project to depend on the documents project only (4.1). A resolver base needs the context project's contracts, and the handler base needs the history project's. So: in M1 they go where the report says, because today that project references everything; in M4 they move to a new `EtAlii.Adp.Diagram.Modules`, which references the thin diagram project, the context and history projects and no hosting package of its own. T157 does the move.
  - **The layout types get a project of their own in M3**, not a folder in the documents project that M4 would then split out (report 3 and 4.2 between them imply two moves).
  - **`CommandResult.FromSave` and the handler base** are in the history project as the report says; the documents project does not reference it, so the save result stays where it is and the conversion lives on the command side.
- **Placement is the maintainer's judgement.** In `backend-centralization` he kept it for himself ("Where each shared type lives is not decided here"). The review of this feature's pull request is where he gives it; a change there changes `data-model.md` and no requirement.

## R10. New and removed projects

| Project | Milestone | Why a project and not a folder |
|---|---|---|
| `EtAlii.Adp.TestSupport.Host` | M0 | R6 |
| `EtAlii.Adp.Layout` | M3 | Geometry with no dependency at all; modules and the future host both use it; the documents project is to be split anyway (FR-056) |
| `EtAlii.Adp.Workspace` | M4 | It is what makes the diagram-abstractions project thin (FR-054) |
| `EtAlii.Adp.Diagram.Modules` | M4 | R9 |
| `EtAlii.Adp.Files` | M4 | The file-system part of the documents project: the writer with its P/Invoke, the watchers, the project file events (FR-056) |
| `EtAlii.Adp.Specification.Json` | M6 | Shared by two specification projects that must not reference each other for it (FR-074) |
| removed: `EtAlii.Adp.Backend` | M4 | 146 lines of client hosting, folded into the service project (FR-055) |

Each project name was checked against `structure.md`: `EtAlii.Adp.<Area>`, singular `Diagram`, no `Backend` segment. A guard in standalone rejects an `EtAlii.Adp.*` name in `structure.md` that is not a project in the solution, so these names appear there only in the pull request that creates the project.

## R11. Behaviour changes are registered

- **Decision**: [behaviour-changes.md](behaviour-changes.md) lists every known place where joining copies changes what some tool does. Each entry gets a guard and a ruling before its task merges (FR-002). A ruling is asked as a selection, in the shape standalone's `CLAUDE.md` requires.
- **Rationale**: the report shows the copies have drifted. Joining drifted copies picks a winner, and picking silently is how a refactoring becomes a regression. The 2026-09-15 rulings are precedent: the line-ending tie was put to the maintainer and "core's behaviour wins".
- **Eleven entries are known today**; a task that finds another adds it before going on.

## R12. This feature and the fifteen conversions

- **What was read**: `.spec-workflow/specs/` in standalone holds fifteen `*-disl-fbl` specifications, one per diagram module, each with requirements and a design, and all but the timeline's with tasks; none has an implementation log. Each ends with "the parser and the writer gone from the product code" and the toolbox, menus, rows and findings derived from a bundled DISL definition.
- **What they overlap**: everything this feature would do to a module's parser, writer, action provider or property provider. That is FR-034 (the provider frame), FR-039, parts of FR-042 to FR-049 (line document, YAML access, number format, lexer, parse outcome), FR-052 (the DISL adapter), FR-084, and FR-089 to FR-091.
- **What they do not touch**: the store, the entry, the reloader, the session, the factories, the resolver, the command pipeline, the tests' harnesses, and all of core. That is M0, bands A and B of M1 and M2, M4 and M5.
- **Decision** (ruled under DP-2 (a) on 2026-10-11): M0 to M2 first. The middle layer makes each conversion smaller, because a converted module still needs a store, a session and a resolver, and those are the copies. After M2 the conversions can proceed, and each of M3, M6 and M7 re-reads at its start which of its tasks a conversion has overtaken (FR-012).
- **Band C in M2** is the exposed part: a handler base is worth having either way, because a converted module still has commands; a provider frame may not be, where DISL derives the menus. So in M2, band C is done for every module's command handlers, and for its providers only where the module has no DISL definition yet and its conversion has not started.
- **Alternatives considered**: conversions first. It would leave fifteen converted modules that still each carry ten copied role classes, and convert them through fifteen copies of the same store.

## R13. No wire change

- **Decision**: `src/api/*.proto`, the generated code and the TypeScript client are not changed.
- **Rationale**: the report excluded them from its reading, so it has no evidence on what a change there costs. Three of its advices need one: a `text` member on the workspace stream (4.4), renaming the wire message `Path` (5.4) and removing three legacy calls (5.4).
- **They are not dropped.** Each is a named candidate of the M4 review, where the host project exists and the cost can be read.

## R14. What a milestone review does

- **Decision**: [contracts/milestone-review.md](contracts/milestone-review.md). In short: run `measure.sh` on the milestone's last merge; compare with the previous record; check the milestone's exit condition and its success criteria; answer each named candidate with *do now*, *follow-up feature* or *no*, and the evidence; then look at the new clone scan and the new top-twenty methods for what nobody named; re-read FR-012 for the next milestone; update `tasks.md`.
- **Rationale**: the request is to review "if there are new refactorings that now all of a sudden also make sense". Named candidates make sure the foreseeable ones are answered; the fresh clone scan is what finds the ones nobody foresaw, because it shows what is *now* the most duplicated thing.
- **A review is bounded.** It adds tasks only for what serves a requirement of this feature. Anything else becomes a follow-up feature with its evidence, so that the feature ends.

## R15. Defects

| Defect | Where it is handled | Why there |
|---|---|---|
| D1, D3, D7, D8 | Pull request 167 of standalone; T031 confirms the guards after it merges | Already written, guard-first, by the maintainer's earlier request |
| D2 | T032, by a Tester in the running application, in M0 | `AbmDefinition` says the shape is deliberate; only the application can tell |
| D4 | T056 (the contract), then each module's band C | The correction is the shared handler; each adoption sees the guard fail for its module first |
| D5 | T034, in M0 | A small correction (retain inside the `try`); M5 then makes it structural (T193) |
| D6 | T035 to T037, in M0 | Security-relevant, so not left until M4; the single implementation written here is what `ProjectPath` wraps in M4 |
| D9 | T038 settles what the FBL specification says, in M0; T216 corrects it with the write template, in M6 | The answer may need a feature in this repository first (principle I) |
| D10 | T185 (the guard) and T190 (the correction), in M5 | The correction is the queueing of events, which is the hierarchy model's decomposition |

## R16. What the report says that this plan does not follow

- **"Steps 2 and 4 are large enough to deserve a spec-workflow specification each."** One Spec Kit feature instead (R1), and one it stays: DP-6 was ruled (a).
- **"Write failing tests for D1 to D8, then fix them"** as step 1. D4 moves to M1 and M2 with its correction; D1, D3, D7 and D8 are elsewhere (R15).
- **The catalog "generated from `docs/tools.md`".** Offered as DP-1 (b) and not taken: the maintainer ruled (c), keep the stubs.
- **`OrderByBarycentre`.** Kept in the layout library's list, but only added when a module's existing ordering is moved onto it without changing its fixtures; otherwise struck at the M3 review (FR-008: no type ahead of a consumer).

## R17. What the sessions project holds

- **The ruling** (DP-5, 2026-10-11): "it should own all session related logic and types." Asked which of the three things the host calls a session that covers, the maintainer ruled all three: the sign-in session, the lifetime of a connection and a project, and the tool sessions' contracts.
- **What was read**, at standalone's `b62b7f8`: `EtAlii.Adp.Sessions` holds a project file and no code, and references `EtAlii.Adp` and `EtAlii.Adp.Authentication`. The sign-in session code is five files in `EtAlii.Adp.Authentication/Sessions/`. The diagram session contract and the three factory registries are in `EtAlii.Adp.Diagram`; the designer and editor session and factory contracts are in `EtAlii.Adp.Designer` and `EtAlii.Adp.Editor`.
- **Decision**: three moves. In M4 the sign-in session code moves in, and the reference between the two projects turns round (T265). In M4, after the diagram project is thinned, the tool-session contracts, their factory contracts and registries and the document-session base move in (T266); the sessions project references `EtAlii.Adp.Diagram`, `EtAlii.Adp.Designer` and `EtAlii.Adp.Editor` for the types the contracts speak in. In M5 the lifetime scopes are added (T192), acquiring through contracts the sessions project declares wherever a direct reference to the history, problems or hierarchy project would close a cycle.
- **What stays out**: a module's own session class, which is the module's; and `EditorSessionAdapter`, which is host plumbing and goes to `EtAlii.Adp.Workspace` with the rest of it.
- **The cost, stated**: every module with real code references the sessions project for the contracts, and the sessions project holds a gRPC interceptor. FR-054 keeps the thin diagram project free of the hosting packages; it no longer keeps a module free of them through that one reference. The specification's assumptions already say a module is not free of them while the context, history and hierarchy projects hold services, so nothing that held before is lost, and the M4 review asks whether the interceptor's needs can be confined.
- **Alternatives considered**: the plan's first assumption, the lifetime scopes only, with the contracts in the thin diagram project. Not taken, by the ruling. Deleting the project (DP-5 (b)). Not taken, by the ruling.
