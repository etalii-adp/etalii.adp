# Specification Quality Checklist: The Structure of the Standalone Host's C# Code

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-11
**Feature**: [standalone-code-structure.spec.md](../standalone-code-structure.spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs). *With one stated exception: the subject is the structure of code, so requirements name the responsibilities the report names (`LineDocument`, `ToolRouter`). The specification says so under "How to read this specification" and leaves shape, home and final name to the plan.*
- [x] Focused on user value and business needs. *The users are the developers and agents who change the host, the tool engineer who adds a tool type, the maintainer who reviews, and the application's user, who must notice nothing but fewer faults.*
- [x] Written for non-technical stakeholders. *As far as the subject allows: each user story says in plain words what gets easier or safer; the requirement text is for the people who will do the work.*
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain. *Six choices are the maintainer's. They are stated as decision points DP-1 to DP-6, each with options, the option the plan assumes, and the tasks it blocks, rather than as markers, so that the work that does not depend on them can be planned.*
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable. *Each has a count from the report and a target, taken by the measurement scripts of FR-009.*
- [x] Success criteria are technology-agnostic (no implementation details). *Not fully, by the nature of the feature: they count classes, projects and references. None prescribes how a requirement is met.*
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded. *"What this feature is not", and the out-of-scope list under Assumptions.*
- [x] Dependencies and assumptions identified. *Pull request 167 of standalone, the fifteen conversion specifications, the ruling of 2026-09-15.*

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification. *See the first item.*

## Cross-artifact analysis (2026-10-11)

Run after the tasks were written, over the specification, the plan and the tasks.

- Every functional requirement FR-001 to FR-098 is claimed by at least one task, or is a rule every task holds (FR-001, FR-003, FR-006) or a heading (FR-041). The table is in [tasks.md](../tasks.md), *Coverage*, and is generated from the task lines, not written by hand.
- Every success criterion SC-001 to SC-027 has the tasks that work for it and the review that measures it.
- No task names a requirement the specification does not define.
- Every section of the report has a requirement, or is named as out of scope or as a review candidate: 1.1 to 1.7 (FR-027 to FR-036), 2 and 2.1 (FR-037 to FR-040, FR-097), 3 (FR-041 to FR-053), 4.1 to 4.3 and 4.5 to 4.7 (FR-054 to FR-065), 4.4 (out of scope: a wire change, a candidate of the M4 review), 5.1 to 5.4 (FR-066 to FR-073, FR-018; the renaming of the wire `Path` and the removal of the legacy calls are candidates of the M4 review), 6.1 to 6.10 (FR-074 to FR-085), 7 (FR-086 to FR-092), 8.1 to 8.7 (FR-015 to FR-017, FR-019, FR-035, FR-051, FR-093 to FR-096), 9 (FR-007), 10 (FR-020 to FR-026), 11 (the milestones).
- Findings corrected during the analysis: the tool router's home (the hierarchy project, not the host project, because the hierarchy model must switch on its result); the order inside M4 that follows from it; SC-012 (a module with real code still references projects that hold gRPC services, so the criterion is about the diagram-abstractions project itself and the rest is a candidate of the M4 review); SC-017 (a size target for every core type was this specification's invention and was reduced to the hierarchy model); the project count in the plan.
- Open, and the maintainer's: DP-1 to DP-6, and the open rows of [behaviour-changes.md](../behaviour-changes.md).

## Notes

- Constitution: one recorded deviation, the standalone feature being specified here, by the maintainer's request (plan, *Complexity Tracking*).
