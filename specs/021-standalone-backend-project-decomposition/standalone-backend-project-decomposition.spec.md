# Feature Specification: Backend Project Decomposition

**Feature Branch**: none of its own: specified with spec-workflow in `etalii.adp.ide.standalone` and delivered on that repository's `develop`
**Created**: 2026-09-06
**Status**: Completed (2026-09-07)
**Input**: The spec-workflow specification `backend-project-decomposition` of `etalii.adp.ide.standalone`: [requirements.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/backend-project-decomposition/requirements.md), [design.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/backend-project-decomposition/design.md), [tasks.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/backend-project-decomposition/tasks.md) and [findings.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/backend-project-decomposition/findings.md), read at that repository's commit `9a64600`. No dashboard approval is recorded for it, so its Created date is that of its first implementation log, 2026-09-06. Migrated to Spec Kit on 2026-10-10; the text below is the source's, rearranged into Spec Kit's sections.

## Context

Everything the source's Requirements Document says before its requirements, verbatim.

### Introduction

**The backend is one project doing eight jobs, and the user wants those jobs in projects of their own.** In their words: merge `EtAlii.Adp.Backend.Diagrams` into `EtAlii.Adp.Diagram`, and *"also move any other functionalities in dedicated projects. For example put all hierarchy related work in 'EtAlii.Adp.Hierarchy' and then reference that from the diagrams. But do so for other functionalities as well."*

**The mandate as literally stated is blocked, and confronting that is this document's first job rather than a discovery left for tasks.** Merging the Diagrams service into `EtAlii.Adp.Diagram` requires that project to reference Backend's Hierarchy, Sessions, History and generated gRPC base — but **Backend already references `EtAlii.Adp.Diagram` from 22 files** (verified: `grep -rl "using EtAlii\.Adp\.Diagram" src/backend/EtAlii.Adp.Backend`). Merging in the one direction while the dependency runs in the other creates a reference cycle between two projects, which MSBuild forbids. **The back-edges must be redesigned before the merge is even possible**, and no amount of moving files accomplishes that on its own.

**The eight folders inside `EtAlii.Adp.Backend` are one strongly-connected lump, so "move each functionality to its own project" is not a sequence of independent moves.** Verified cross-folder edges:

```
Hierarchy      → Context, Projects, Sessions
Context        → Projects, Sessions
Problems       → Context, Hierarchy
Projects       → Hierarchy, Sessions          (Projects ↔ Hierarchy)
Sessions       → Authentication, Problems
Authentication → Sessions                     (Authentication ↔ Sessions)
Client         → (nothing)
```

Those edges close at least four cycles — `Authentication↔Sessions`, `Projects↔Hierarchy`, `Hierarchy→Sessions→Problems→Hierarchy`, `Context→Projects→Hierarchy→Context`. A project cannot be extracted out of a cycle; the cycle must be broken first, by pulling the shared contracts each side depends on down into a project beneath both. **Only `Client` (3 files, zero cross-folder dependencies) can move as-is.**

**History is entangled invisibly, and this is the trap the whole decomposition turns on.** All **19 of its 19 files declare the bare root namespace `EtAlii.Adp.Backend`** (verified by reading each file, not by an import grep) — because the folder is marked namespace-skipped in `.DotSettings`. A type in the root namespace is usable from anywhere in the assembly **with no `using` statement at all**, so History's edges are invisible to every import-based survey. Measured by type-name reference instead: Context references History's types in 4 files, Hierarchy in 3, Problems and Sessions in 1 each — while History itself uses Hierarchy, Context and Diagram. So History both sits under the lump and reaches back up into it. **A decomposition planned from `using` statements would move History and silently break the compile**, which is precisely the failure the steering note *"a detector encoding one form of a thing reads absence-of-that-form as absence-of-the-thing"* was written about.

#### What was measured (verified for this document, 2026-09-06)

- **Back-edges blocking the literal merge**: 22 Backend files `using EtAlii.Adp.Diagram`.
- **Folder sizes** (`.cs` files): Hierarchy 65, Context 49, Problems 25, History 19, Projects 9, Sessions 5, Authentication 4, Client 3.
- **History root-namespace files**: 19 of 19 (an earlier relay said 15; the correction does not change the finding, only its size — every History file is invisible to import surveys, not most).
- **A possible landing zone**: `EtAlii.Adp.Backend/ShortGuid.Cast.cs` declares `namespace EtAlii.Adp.Contracts` (verified) — a seam that may already have been intended, which Decision 3 puts to the user rather than assuming.
- **Blast radius on the 60 module projects**: they import `Backend.Hierarchy` (~152 usings), `Backend.Context` (~99), and the `Backend` root (~210) — so any namespace that moves is a rename across the module tree, not only within the backend.

### Alignment with Product Vision

The product's structure principle is that a capability lives in a module discovered by scanning, not in a monolith edited by hand — the diagram modules already work this way, and `Diagram.Definitions` and the client `registrations` are the precedents. The backend is the last place that principle has not reached: eight capabilities in one project, wired by proximity rather than by contract. This decomposition brings the backend into line with how the rest of the system is already built, and the user's mandate is the instruction to do it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A contracts project beneath everything, first (Priority: P2)

Source: **Requirement 1 — A contracts project beneath everything, first**

**User Story:** As a maintainer, I want the interfaces that every area shares to live in one project that depends on nothing, so the cycles between areas can be broken by depending downward instead of sideways.

**Why this priority**: It is the prerequisite the source puts first: nothing can be extracted while the command/history contract sits in a peer folder, but it is a means to the user's mandate rather than the mandate.

**Independent Test**: Create the contracts project with no backend project references, move the contract into it by type-name reference, and check the solution still compiles.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **1.1** WHEN the decomposition begins THEN the **command/history contract SHALL be given a home before any functional area moves** — `ICommand`, `ICommandHandler`, `ICommandDispatcher`, `IHistoryStack`, `IHistoryStackStore`, `IContextNoticeSink`, `CommandResult`, `HistoryEntry` and the `AddCommands` registration are what Context, Hierarchy, Problems and Sessions all reach for, and nothing can be extracted while they sit in a peer folder.
2. **1.2** WHEN that project is created THEN it SHALL depend on no other backend project, so it can sit beneath all of them without forming a cycle.
3. **1.3** WHERE these types currently occupy the root namespace `EtAlii.Adp.Backend` THEN moving them SHALL be recognised as a **namespace change that touches every invisible consumer** — the move is found by type-name reference, never by `using`-statement search, and the acceptance of this task is that the solution still compiles, not that the imports were updated.

### User Story 2 - The cycles are broken before any area is extracted (Priority: P2)

Source: **Requirement 2 — The cycles are broken before any area is extracted**

**User Story:** As a maintainer, I want each functional area to depend only downward, so it can become its own project.

**Why this priority**: Breaking the cycles is what makes every extraction possible; the source calls the per-edge mapping the substance of the work, still in service of Requirements 3 and 5.

**Independent Test**: For each cycle the source names, check after the cut that the dependency between the two folders runs one way only, and that the design names the type that moved and where.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **2.1** WHEN an area is proposed for extraction THEN its dependencies SHALL first be shown to be acyclic — a folder in a cycle (`Authentication↔Sessions`, `Projects↔Hierarchy`, and the longer loops through Context and Problems) SHALL NOT be extracted until the shared type causing the back-edge is pulled down into the contracts project or another project beneath both.
2. **2.2** WHEN the cycle-breaking is designed THEN the design SHALL name, per edge, which type moves down and to which project — the design phase owns that mapping, and it is the substance of the work, not a preliminary to it.
3. **2.3** WHERE an area cannot be made acyclic without a judgement call about where a shared type belongs THEN that judgement SHALL be recorded in the design with its reasoning, not made silently in a task.

### User Story 3 - The Diagram↔Backend back-edges are redesigned before the merge (Priority: P1)

Source: **Requirement 3 — The Diagram↔Backend back-edges are redesigned before the merge**

**User Story:** As the person who issued the mandate, I want `EtAlii.Adp.Backend.Diagrams` merged into `EtAlii.Adp.Diagram` — and I want it to actually build.

**Why this priority**: This is the headline of the user's mandate: merge `EtAlii.Adp.Backend.Diagrams` into `EtAlii.Adp.Diagram`, and have it build.

**Independent Test**: After the back-edges are broken, merge the project and check that `EtAlii.Adp.Backend.Diagrams` no longer exists, its behaviour is reachable from `EtAlii.Adp.Diagram`, and the four gates and a fresh-tree build are green.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **3.1** WHEN the merge is planned THEN the **22 Backend files that use `EtAlii.Adp.Diagram` SHALL be accounted for**, because after the merge those become a dependency from the merged Diagram project back into Backend, and a two-project cycle is a hard MSBuild error.
2. **3.2** WHEN the back-edges are resolved THEN each SHALL be resolved by depending on a contract beneath both projects, not by leaving Backend depending on Diagram and Diagram depending on Backend.
3. **3.3** WHEN the merge lands THEN `EtAlii.Adp.Backend.Diagrams` SHALL no longer exist as a separate project and its behaviour SHALL be reachable from `EtAlii.Adp.Diagram`, with the four gates green and a fresh-tree build proving the generated code still resolves.

### User Story 4 - Generated protobuf types have exactly one owner, at the bottom (Priority: P3)

Source: **Requirement 4 — Generated protobuf types have exactly one owner, at the bottom**

**User Story:** As a maintainer, I want the generated gRPC types owned by one project that everything else references, so the shared contract is single-sourced.

**Why this priority**: The design superseded it at the user's later direction (each proto generated in its owning project into a `.Wire` namespace), so the original criteria were intentionally not met as written (tasks, coverage note).

**Independent Test**: Check that each generated type is owned by exactly one project and that a fresh-tree build resolves the generated code.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **4.1** WHEN the projects are laid out THEN **exactly one project SHALL own protobuf generation of the shared types and SHALL sit below every area that consumes them** — the existing rule that the shared generated types are single-owned by Backend is preserved in spirit, with the owner relocated to whatever bottom project the design names.
2. **4.2** WHERE per-area gRPC service classes live inside their folders today THEN they MAY move with their area, but the shared generated message types SHALL NOT be duplicated into more than one project.
3. **4.3** WHEN generation is relocated THEN a fresh-tree build SHALL be the acceptance check, because every other gate reads `obj/` and cannot see a generated-code break.

### User Story 5 - Each functionality becomes its own project, named as the user named them (Priority: P1)

Source: **Requirement 5 — Each functionality becomes its own project, named as the user named them**

**User Story:** As the user, I want hierarchy work in `EtAlii.Adp.Hierarchy`, and each other functionality likewise in its own project referenced by the diagrams.

**Why this priority**: This is the rest of the user's mandate in their own words: hierarchy work in `EtAlii.Adp.Hierarchy`, and every other functionality likewise.

**Independent Test**: Extract one area to `EtAlii.Adp.<Area>`, propagate its namespace through the module projects, and check the module tree builds and the namespace-provider check is clean.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **5.1** WHEN an area is extracted THEN it SHALL become a project named in the `EtAlii.Adp.<Area>` family the user gave by example (`EtAlii.Adp.Hierarchy`), a sibling of `EtAlii.Adp.Diagram` — not a `Backend.<Area>` sub-name — unless Decision 2 settles otherwise.
2. **5.2** WHEN `Client` is extracted THEN it MAY move independently and early, because it has zero cross-folder dependencies; every other area waits on its cycle being broken (Requirement 2).
3. **5.3** WHEN an area moves THEN the namespace change SHALL be propagated to the **60 module projects that import it** — `Backend.Hierarchy` (~152 usings) and `Backend.Context` (~99) are consumed across the module tree, so an extraction is a repo-wide rename, and the module projects' builds are part of its acceptance.
4. **5.4** WHERE the `.DotSettings` `NamespaceFoldersToSkip` mechanism is involved THEN it SHALL be used to control folder-to-namespace contribution rather than editing namespaces to match folders, and the escaping (`_005C` for a separator, `_005F` for an underscore) SHALL be verified by `jb inspectcode` — **a wrongly escaped key parses fine, matches nothing, and leaves every warning standing**, so by-eye confirmation is not acceptance.

### User Story 6 - Verified by a build that reads a different input (Priority: P2)

Source: **Requirement 6 — Verified by a build that reads a different input**

**User Story:** As a maintainer, I want the decomposition proven by the tools that can actually see structural breakage, not only by the four gates.

**Why this priority**: It is the acceptance bar of every step rather than a capability of its own; the source binds it to all landings.

**Independent Test**: On any landing, read the four gates' exit codes on the merged tree, build a fresh tree, and run the namespace-provider check.

**Acceptance Scenarios** (the source's Acceptance Criteria, each verbatim):

1. **6.1** WHEN any step lands THEN the four gates SHALL be green on the merged tree, judged by exit codes captured before any pipe, with `Zero tests ran` read as a broken build.
2. **6.2** WHEN a step relocates generated code, a namespace, or a project reference THEN a **fresh-tree build SHALL be part of its acceptance**, because the codegen and reference resolution a stale `obj/` caches are exactly what these steps change.
3. **6.3** WHERE namespace-provider warnings are concerned THEN `jb inspectcode` SHALL be run and shown clean for the affected projects — it sees what `dotnet format` cannot, it is not one of the four gates, and it is not installed by default, which is the reason these warnings accumulate unnoticed.

### Edge Cases

- History's 19 files declare the bare root namespace `EtAlii.Adp.Backend` and are used with no `using`, so a survey by `using` statement misses their consumers; moves are found by type-name reference (criterion 1.3, and the Introduction).
- A wrongly escaped `NamespaceFoldersToSkip` key parses fine, matches nothing and leaves every warning standing (criterion 5.4).
- A generated-code break is invisible to every gate that reads `obj/`, so a step that moves generation, a namespace or a reference is accepted on a fresh-tree build (criteria 4.3 and 6.2).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The command/history contract MUST move first into a contracts project that depends on no other backend project, found by type-name reference and accepted when the solution compiles (User Story 1; criteria 1.1–1.3).
- **FR-002**: An area MUST NOT be extracted until its dependencies are acyclic, and the design MUST name, per edge, which type moves down and where, with any judgement recorded and reasoned (User Story 2; criteria 2.1–2.3).
- **FR-003**: The 22 Backend files that use `EtAlii.Adp.Diagram` MUST be resolved through contracts beneath both projects before `EtAlii.Adp.Backend.Diagrams` is merged into `EtAlii.Adp.Diagram`, which MUST then build with the four gates and a fresh-tree build green (User Story 3; criteria 3.1–3.3).
- **FR-004**: The shared generated protobuf types MUST be owned by exactly one project and never duplicated, with a fresh-tree build as the acceptance of any relocation (superseded by the design: each proto is generated in its owning project into a `.Wire` namespace) (User Story 4; criteria 4.1–4.3).
- **FR-005**: Each functional area MUST become its own `EtAlii.Adp.<Area>` project, `Client` early, with its namespace change propagated through the module projects and folder-to-namespace contribution controlled through `.DotSettings` (User Story 5; criteria 5.1–5.4).
- **FR-006**: Every landing MUST be green on the four gates on the merged tree, MUST include a fresh-tree build when it moves generated code, a namespace or a reference, and MUST be shown clean for namespace-provider warnings (User Story 6; criteria 6.1–6.3).

### Non-Functional Requirements

#### Reliability

- The product SHALL be releasable after every landing: a half-extracted area that compiles but has lost a reference is worse than an un-started one. Each step is independently gated and merged.

#### Compatibility

- No behaviour changes. This is a structural move: the same types, the same gRPC contracts, the same runtime behaviour, in different projects. A test that changes meaning is a signal the move changed behaviour and is a defect.
- No `.proto` message-shape change. Generation may relocate (Requirement 4); the wire contract does not move.

#### Process

- Requirements, design and tasks on `develop` in the main checkout; implementation in one worktree owned by one Developer end to end, since the areas are entangled and cannot be fanned out. Develop is taking a commit every ~2 minutes, so landings are small and frequent, gated on the merged tree each time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `EtAlii.Adp.Backend` references no functional project, read from its reference graph rather than assumed, or every retained edge is logged with its cost (task 11).
- **SC-002**: `EtAlii.Adp.Backend.Diagrams` no longer exists and its behaviour is reachable from `EtAlii.Adp.Diagram` (criterion 3.3).
- **SC-003**: Every landing has the four gates at zero on the merged tree, judged by captured exit codes with `Zero tests ran` read as a broken build, and a fresh-tree build where it moves generated code, a namespace or a reference (criteria 6.1 and 6.2).
- **SC-004**: Namespace-provider drift is caught on every landing: by `jb inspectcode` as criterion 6.3 asks, or, while that tool cannot evaluate SDK 10, by the committed structural check the design's recorded deviation substitutes, seen to fail before it was trusted.
- **SC-005**: No test changes meaning: the move is structural, with the same types, the same gRPC contracts and the same runtime behaviour (Non-Functional Requirements, Compatibility).

### Outcome

All eleven tasks landed on develop between 2026-09-06 and 2026-09-07. Phase 1 removed the orphan `hierarchy.proto`, created `EtAlii.Adp.Common` with `EtAlii.Adp.Common.Wire`, and moved the command/history contract, the `Line` document family, `SessionContext` and the 13 Diagram-contract types down to it, which eliminated the 22 back-edges with an empty exception budget; task 8 then merged `EtAlii.Adp.Backend.Diagrams` into `EtAlii.Adp.Diagram` as `ba267eb3`. Phase 3 extracted `Client` and then Projects, Authentication, Sessions, Hierarchy, Context and Problems, one landing each, in an order re-measured on the landed tree. Task 11 (`8561f0e4`) found `EtAlii.Adp.Backend` referencing only `EtAlii.Adp.Common` and `EtAlii.Adp`, with `History/` its one remaining folder.

## Decisions this requires from the user

**These shape the design and are the user's to make; the design cannot be finalised without them.**

1. **Scope of the first pass.** Options: **(a, recommended)** land the contracts project and the cycle-breaking first, then merge Diagrams, then extract areas one per landing — safest, each step releasable; **(b)** merge Diagrams first behind a temporary contract shim, extract areas later — reaches the user's headline sooner but leaves a shim to remove; **(c)** extract only the clean wins (`Client`, and the contracts project) this pass and defer the entangled areas to a follow-up spec — smallest, lowest risk, leaves most of the mandate unmet. 
2. **Project naming.** Options: **(a, recommended — the user's own example)** top-level `EtAlii.Adp.Hierarchy`, `EtAlii.Adp.Context`, siblings of `EtAlii.Adp.Diagram`; **(b)** `EtAlii.Adp.Backend.Hierarchy`, keeping the Backend prefix to signal the service tier. This changes ~360 usings across the backend and module tree either way; the choice is which name they land on.
3. **The `EtAlii.Adp.Contracts` seam.** `ShortGuid.Cast.cs` already declares `namespace EtAlii.Adp.Contracts`. Options: **(a, recommended)** adopt `EtAlii.Adp.Contracts` as the bottom contracts project the command/history types move into, treating the existing declaration as the intended seam; **(b)** treat it as an incidental namespace and choose a different bottom-project name; **(c)** the user tells us what that namespace was for, if it was deliberate.

## Out of Scope

- **Behavioural change of any kind** — no new capability, no refactor of logic beyond what a project boundary requires.
- **The client and diagram module projects' internal structure** — they are consumers of the backend namespaces and are updated to follow a rename, not restructured.
- **Retiring the `.DotSettings` namespace-skip mechanism** — it is used, not removed; History's root-namespace types are relocated by this spec, but the mechanism itself stays.
