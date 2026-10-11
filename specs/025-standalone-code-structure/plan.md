# Implementation Plan: The Structure of the Standalone Host's C# Code

**Branch**: `claude/project-thread-do34w2` in `etalii.adp`; in `etalii.adp.ide.standalone`, one `features/025-<task>` branch per pull request | **Date**: 2026-10-11 | **Spec**: [standalone-code-structure.spec.md](standalone-code-structure.spec.md)

**Input**: the feature specification, and the report it tracks, [analysis-2026-10-10.md](analysis-2026-10-10.md).

## Summary

Ten milestones restructure the C# code of `etalii.adp.ide.standalone` in the order that keeps each step small and checked: a safety net for the tests first (M0), then the missing middle layer of the diagram modules, piloted on four modules (M1) and rolled out to fifteen more (M2), then the shared utilities (M3), the core project graph (M4), the core hotspots (M5), the specification projects (M6), the internals of the largest modules (M7), the rest of the test code and the stub modules (M8), and a close (M9). Every milestone ends in a review that measures the code again and decides in writing what to add and what to drop. Nothing is implemented by this plan: it and its tasks are the specification of work for a developer in the standalone repository.

## Technical Context

**Language/Version**: C# on the .NET SDK that `etalii.adp.ide.standalone/src/global.json` pins. The measurement scripts are Python 3, standard library only.

**Primary Dependencies**: ASP.NET Core and gRPC (the host), YamlDotNet, `System.Text.Json`, Serilog, xUnit v3. One new package, for tests only: `Microsoft.Extensions.TimeProvider.Testing` (research R8). No other dependency is added; several references are removed.

**Storage**: files in the user's project folder. No format changes (FR-001).

**Testing**: `dotnet test --solution EtAlii.Adp.slnx` from `src/backend/`, with `MSBUILDDISABLENODEREUSE=1` and `DOTNET_CLI_USE_MSBUILD_SERVER=0`; `npm test` and `npm run typecheck` for the client, which this feature does not change but whose gates every pull request still passes; `dotnet format style --verify-no-changes --severity info`; and JetBrains InspectCode through `.github/tools/inspect/inspect.sh`, which the Build workflow's `inspection` job runs.

**Target Platform**: Windows for development, Linux on the GitHub runner. Both matter for path containment and file watching (spec, *Edge Cases*).

**Project Type**: one solution, `src/backend/EtAlii.Adp.slnx`, of 129 projects at the report's reading: 37 core and 92 in tool modules, 88 production and 41 test.

**Performance Goals**: none is added. Two are removed as hazards: disk work under the hierarchy lock (FR-066) and unbounded channels (FR-070).

**Constraints**: no change a user can see (FR-001); the wire contracts in `src/api/*.proto` and the TypeScript client are not changed; every pull request passes the four gates and the inspection job; the architecture pages stay true in the same pull request (FR-004).

**Scale/Scope**: about 121,000 production lines and 125,000 test lines. The report's estimates add up to about 12,000 production lines (9,000 to 10,000 of them in the module middle layer) and 6,000 to 7,000 test lines reclaimable. [tasks.md](tasks.md) holds 264 tasks; most are one pull request each, and several of the M1 and M2 tasks for one module may travel in one.

## Constitution Check

*Gate: passed before research, and re-read after the design files were written.*

### The etalii.adp constitution (1.6.0)

| Principle | How this feature meets it |
|---|---|
| I. One source of truth | No specification language is changed. Where M6 finds a host library and a specification disagreeing (D9 is the known case), FR-025 and FR-085 send the question back here as a feature of its own before any code changes. |
| II. Implementable from the document alone | Not engaged: no specification document, schema or example is touched. The FBL conformance fixtures vendored into the host are held unchanged as a success criterion (SC-021). |
| III. Precise normative language | Not engaged. |
| IV. Versioned specifications | Not engaged. |
| V. Simplicity | Engaged throughout: a shared type arrives only with its first consumer (FR-008), a base type is never bent with a switch on the module (spec, *Edge Cases*), and the five new projects are each justified below. |
| VI. No JetBrains Rider warnings in C# | Every pull request passes the inspection job (FR-003). A task that moves code moves its `.DotSettings` entries with it. |
| Structure and Naming: "`specs/` holds the Spec Kit features of every etalii-adp repository except `etalii.adp.ide.standalone`" | **Deviation**, recorded under *Complexity Tracking*. |
| Development Workflow | The feature's own files reach `develop` through one pull request, merged with a merge commit. Its branch is `claude/<name>`, the exception the constitution names for a cloud session's harness. Each standalone pull request names this folder and the commit its tasks came from; a task is ticked only when that pull request is merged (FR-014). |

### The standalone repository's principles

`etalii.adp.ide.standalone` has no file under `.specify/memory/repositories/`. Its principles are its own `CLAUDE.md` and `.spec-workflow/steering/` (`tech.md`, `structure.md`, `roles.md`, `processes.md`, `product.md`), read at `develop` `a421ed4` on 2026-10-11. This check is against those.

| Rule there | How this feature meets it |
|---|---|
| Vocabulary: a name that serves every kind says *tool* | M4's generic types are `ToolDefinition…`, `ToolRouter`, `ToolOrigin` (FR-057, FR-058, FR-060). "Designer" is used only for the form-based kind. |
| Every question to the user is a selection | The six decision points of the spec are tables of options with the assumed one marked; a review that needs a ruling asks in the same shape ([contracts/milestone-review.md](contracts/milestone-review.md)). |
| Roles: one Developer owns a specification until every task is done | FR-006 and DP-6. Architects write the review records; a Tester does T032, the check in the running application. |
| Worktrees: all implementation on `features/<name>` in `.claude/worktrees/<name>/` | FR-003, and step 1 of [quickstart.md](quickstart.md). |
| Specification documents are written on `develop` in the main checkout | Does not apply: this feature's documents are Spec Kit files in `etalii.adp`. Nothing is written under standalone's `.spec-workflow/`. |
| Delivery: four gates exit zero, pull request, merge commit, `retire.sh` | FR-003, [contracts/pull-request.md](contracts/pull-request.md). |
| Git identity `agent-<N>-<task>`, set with `git config --worktree` | FR-006, quickstart step 1. |
| "Ask what the command would print if your belief were false"; a fresh-tree build | The pull-request contract asks for the captured exit codes, and for a fresh worktree build on any pull request that moves a `.proto`'s generating project (M4). |
| A test written for a bug must be seen to fail | FR-005; each defect task is written guard-first. |
| Tasks cover requirements: extract and diff | Done for this feature: [tasks.md](tasks.md), *Coverage*, lists every requirement with its tasks, and names the ones no task can claim. |
| The architecture pages and the module guides change in the same change | FR-004; every task that changes a project, a count or a touch point says so. |
| Backend code style: no blocking call in an `async` method | FR-070 removes the remaining ones the report found; `ReadWithRetry` with `Thread.Sleep` goes with FR-050. |
| Line endings: CRLF in the working tree, byte-compared fixtures `-text` | No fixture is rewritten. The line-document work (FR-042) is where line endings are decided, and it is held by the existing byte round-trip fixtures. |
| Every bug leaves a guard | FR-005. |
| `tech.md`, *Declaring a diagram definition*: the stub shape | **Conflict with report 2.1**, which is why it is decision point DP-1 and why the stub tasks come last and change `tech.md` first. |
| `tech.md`, *Registering a diagram module's services*: one `ServiceCollection.AddX.cs`, split only for a consumer | Kept. FR-030 makes the file shorter; it does not split it. |
| `structure.md`: core must never depend on a diagram type | SC-013 makes it measurable: no `InternalsVisibleTo` from a core project to a module (two today, in the documents project). |
| `structure.md`: prefer small, composable projects; a `PackageReference` goes in the highest parent that uses it | The new projects below; R8 places the one new package. |
| `tech.md`, *JetBrains Rider warnings* | As principle VI above. |
| The ruling of 2026-09-15 (`backend-centralization`): identical one-line members are not shared | **Tension with FR-028 and FR-032**, which is decision point DP-3. The other four rulings of that day are followed: core's line document wins a tie (behaviour-changes.md, B-05), sessions use the shared diff (FR-031), a save returns a result the caller must inspect (FR-033). |

Two gates need the maintainer before the tasks they block can start: DP-1 and DP-3. Neither blocks M0.

## Decisions

Each is argued in [research.md](research.md).

1. **Spec Kit here, not spec-workflow there** (R1), by the maintainer's request.
2. **The order of the milestones** (R2): tests, then modules, then utilities, then the graph, then hotspots, then the specification projects, then module internals.
3. **The grain of a pull request** (R3): a shared type with its first consumer; then one module per pull request. M1 goes in three bands (persistence; session and resolver; commands and providers), each shaped on sankey and then adopted by the other three pilots before the next band builds on it.
4. **The measurement scripts** live in `etalii.adp.ide.standalone/.github/tools/analysis/` and are Python (R4). Their output is a JSON file and a Markdown summary.
5. **The review records** live in this folder, each delivered by a pull request into `etalii.adp` (R5).
6. **Two testing projects** (R6): the existing `EtAlii.Adp.TestSupport`, made reachable from every test project, and a new `EtAlii.Adp.TestSupport.Host` for the flow harness, so that a module's unit tests do not reference the web host.
7. **Stream readiness is proven by a probe, not announced by the server** (R7), because an announcement is a contract change.
8. **The clock is `TimeProvider`** (R8).
9. **Where the shared types live** (R9, [data-model.md](data-model.md)): the report's proposals, with one correction it did not see. A resolver base cannot live in a diagram-abstractions project that depends on the documents project only, so M4 gives the module-facing bases a project of their own.
10. **New projects** (R10): `EtAlii.Adp.TestSupport.Host` (M0), `EtAlii.Adp.Layout` (M3), `EtAlii.Adp.Workspace`, `EtAlii.Adp.Diagram.Modules` and `EtAlii.Adp.Files` (M4), `EtAlii.Adp.Specification.Json` (M6) and, by DP-1, `EtAlii.Adp.Diagram.Catalog` (M8). Removed: `EtAlii.Adp.Backend` (M4) and, by DP-1, 48 stub projects.
11. **Behaviour changes are registered and ruled** (R11, [behaviour-changes.md](behaviour-changes.md)). Eleven are known before the work starts.
12. **The conversions come after M2** (R12), assumed under DP-2.
13. **A wire change is out of scope** (R13); three of the report's advices become review candidates for that reason.
14. **What a milestone review does** (R14, [contracts/milestone-review.md](contracts/milestone-review.md)), and the candidates already foreseeable at each.

## Project Structure

### Documentation (this feature)

```text
specs/025-standalone-code-structure/
├── standalone-code-structure.spec.md   the specification
├── analysis-2026-10-10.md              the report, verbatim (research input)
├── plan.md                             this file
├── research.md                         the decisions, argued
├── data-model.md                       every shared type: its job, its home, what it replaces
├── behaviour-changes.md                the register of FR-002
├── quickstart.md                       how a developer takes a task from here to a merged pull request
├── contracts/
│   ├── pull-request.md                 what every standalone pull request of this feature holds
│   └── milestone-review.md             what a review does, its candidates per milestone, its record
├── checklists/requirements.md          the specification quality checklist
├── reviews/                            one record per milestone, written as the work proceeds
│   └── README.md
└── tasks.md                            the tasks, by milestone
```

### Source Code (`etalii.adp.ide.standalone`)

Paths in [tasks.md](tasks.md) are prefixed `etalii.adp.ide.standalone/`. The clones sit side by side: `C:\git\etalii.adp.ide.standalone` locally, `/home/user/etalii.adp.ide.standalone` in a cloud session.

```text
etalii.adp.ide.standalone/
├── .github/tools/analysis/                    new (M0): the measurement scripts
├── docs/                                      architecture.md, solution-structure.md, creating-a-*-module.md: changed with the code
├── .spec-workflow/steering/tech.md            changed once, by DP-1 (M8)
└── src/
    ├── Directory.Build.targets                attaches the testing project to every *.Tests project (M0)
    ├── TestSupport/                           LogCapture stays compiled in; TestFolder moves out (M0)
    ├── backend/
    │   ├── EtAlii.Adp/                        Disposable, Debouncer, RetainedRegistry, ProjectRoot, ProjectPath, ToolOrigin
    │   ├── EtAlii.Adp.Documents/              store contract and base, entry, reloader; LineDocument, LineIndex, YamlAccess, LineLexer, ParseOutcome
    │   ├── EtAlii.Adp.Layout/                 new (M3): Rect, layering, ordering, grid packer, overlap resolver, row and text geometry
    │   ├── EtAlii.Adp.Files/                  new (M4): the file writer, watched file and folder, project file events
    │   ├── EtAlii.Adp.Diagram/                thinned (M4): module contracts, definition, origin, registration
    │   ├── EtAlii.Adp.Diagram.Modules/        new (M4): the session, resolver, handler and provider bases of M1
    │   ├── EtAlii.Adp.Workspace/              new (M4): the gRPC services, connections, stream pumps
    │   ├── EtAlii.Adp.Sessions/               gets its content in M5 (DP-5), or is deleted
    │   ├── EtAlii.Adp.Backend/                folded into EtAlii.Adp.Backend.Service (M4)
    │   ├── EtAlii.Adp.History/                CommandResult.FromSave, the edit handler base (until M4)
    │   ├── EtAlii.Adp.Hierarchy/              the tool router (M4); HierarchyModel decomposed (M5)
    │   ├── EtAlii.Adp.Specification.Json/     new (M6): what the FBL and DISL loaders share
    │   ├── EtAlii.Adp.Specification.{Cel,Fbl,Disl}/
    │   ├── EtAlii.Adp.TestSupport/            reachable from every test project (M0)
    │   └── EtAlii.Adp.TestSupport.Host/       new (M0): HostFixture, FlowSession, StreamProbe; TranscriptHarness (M8)
    ├── diagrams/<type>/backend/               19 modules with real code lose their role classes (M1, M2)
    ├── diagrams/catalog/                      new by DP-1 (M8): one project for the 48 stub definitions
    ├── designers/knowledge/                   M7
    └── editors/{markdown,plain}/              one text editor session (M3)
```

**Structure Decision**: the solution stays one flat list of projects, as `structure.md` requires. Six projects are added and one is folded away; with DP-1 ruled (a), 48 stub projects become one catalog project and the solution ends at about 87 projects, from 129. Every one of those changes updates `docs/solution-structure.md` and the counts in `ArchitecturePages.Tests` in its own pull request.

## Milestones, their exits and their reviews

| Milestone | Tasks | Exit condition | Its review asks, besides the measurements |
|---|---|---|---|
| M0 Safety net | T001 to T042 | SC-001, SC-002, SC-003, SC-014; D5 and D6 closed; D2 and D9 settled; pull request 167 merged | Whether the suite is now stable enough to judge a refactoring; whether the contract tests of M1 can sit in the light testing project; whether anything in the baseline contradicts the report's counts |
| M1 Middle layer, piloted | T043 to T066 | The four pilot modules have the shape of report 1.7; the seven base types each serve four modules | Whether each base type fitted four modules without a switch; whether the estimates per role hold (and SC-006 with them); whether the rollout order of M2 should change; whether the entry type can carry a parse outcome already |
| M2 Rollout and siblings | T067 to T117 | SC-006 to SC-009; FR-036 for all 19 modules | Whether the action and property providers can become generic once FBL bindings and DISL definitions describe the edits; whether timeline and dependency-graph should share a model base or simply wait for their conversions; which M3 utilities the rollout already removed; whether a module's remaining `ServiceCollection.AddX.cs` can be derived |
| M3 Shared utilities | T118 to T154 | SC-004, SC-010, SC-011 | Whether tools should agree on one cycle policy (a product decision, to be put as a selection); whether the watchers can now be one per project root everywhere; which module layouts are small enough to be data |
| M4 Core project graph | T155 to T184 | SC-012, SC-015, SC-016 | Whether the problems project still needs the hierarchy project; whether the gRPC services of the context, hierarchy, history and projects projects should move to the host project too; the three wire candidates (a `text` stream member, renaming the wire `Path`, removing the legacy calls); whether the editor and designer projects still earn their own project |
| M5 Core hotspots | T185 to T206 | SC-013, SC-017, SC-018; D10 closed | Whether the three retained stores collapse into the connection session; whether `IContextWatchHooks` can go; what is left of `ContextService` |
| M6 Specification projects | T207 to T230 | SC-019 to SC-022; D9 closed | Which conversions are now unblocked and in what order; whether the hand-written XML parser is still justified; whether DISL still needs to reference FBL at all |
| M7 Module internals | T231 to T244 | The methods FR-086 to FR-092 name are under the lengths of SC-023, or struck under FR-012 | Which of these modules a conversion has overtaken; whether the budgeted graph builder serves SPARQL as well |
| M8 Tests and stubs | T245 to T260 | SC-005, SC-027; FR-093 to FR-097 | Whether any per-module test helper is left; whether the catalog should be generated from `docs/tools.md` |
| M9 Close | T261 to T264 | SC-023 to SC-026; FR-098 | What becomes a follow-up feature; the ruling on DP-4 |

## Complexity Tracking

| Deviation | Why it is needed | The simpler alternative, and why it was not taken |
|---|---|---|
| A standalone feature specified here, against the constitution's *Structure and Naming* | The maintainer asked for exactly this on 2026-10-11 (spec, *Input*). | A spec-workflow specification in standalone, as the convention says. Not taken because the request was explicit. The convention's text is left unchanged; DP-4 asks whether it should change. |
| Five new core projects and one new specification project (principle V) | Each has a consumer today: the flow tests (`TestSupport.Host`), nine rectangle copies and six layerings (`Layout`), the services that make the diagram-abstractions project a host (`Workspace`), the module bases that need the context project (`Diagram.Modules`), the file writer and three watchers (`Files`), two loaders with the same helpers (`Specification.Json`). | Folders inside existing projects. Not taken for `Workspace`, `Diagram.Modules` and `TestSupport.Host` because the point is what a referencing project pulls in; taken as the fallback for `Layout`, `Files` and `Specification.Json` if the M3, M4 or M6 pull request shows the project would hold fewer than a handful of types. |
| Base classes where the 2026-09-15 ruling preferred copies of one line | The classes removed are whole files of forwarding (16 reloaders, 21 session factories), not single lines. | Leaving them. DP-3 lets the maintainer choose that. |
| 264 tasks in one feature | The report is one reading and its findings lean on each other; one sequence of reviews needs one task list. | One feature per milestone. DP-6 (b) lets the maintainer choose that; the milestones are cut so that it can be done without rewriting the tasks. |

## What is not done here

- No line of `etalii.adp.ide.standalone` is changed by this feature's pull request.
- The fifteen conversions to FBL and DISL (FR-084).
- Any change to `src/api/*.proto`, the generated code or the TypeScript client (R13).
- A principles file for standalone, and any change to `CLAUDE.md`, the constitution or `specs/README.md` (DP-4).
