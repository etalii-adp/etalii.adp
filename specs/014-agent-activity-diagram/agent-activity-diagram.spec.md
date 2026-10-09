# Feature Specification: The Agent Activity Diagram's Definition

**Feature Branch**: `claude/project-thread-cqez7b` (a cloud session's branch, in place of `features/014-agent-activity-diagram`)
**Created**: 2026-10-09
**Status**: Implementing
**Input**: Tasks 1 to 4 of the Agent activity diagram specification of `etalii.adp.ide.standalone`, which plans with spec-workflow: [requirements.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/08d917f9594cda164bec355da93592231d7fa732/.spec-workflow/specs/agent-activity-diagram/requirements.md), [design.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/08d917f9594cda164bec355da93592231d7fa732/.spec-workflow/specs/agent-activity-diagram/design.md) and [tasks.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/08d917f9594cda164bec355da93592231d7fa732/.spec-workflow/specs/agent-activity-diagram/tasks.md), approved in its dashboard on 2026-10-09 and read at that repository's commit `08d917f`. The maintainer asked for implementation to start in the project's thread "Agent Activity Diagram spec" on 2026-10-09.

## Context

The Agent activity diagram shows, in one picture, which agents work on which specification of which project, where (a branch and a folder) and on what system: projects, specifications with their tasks, agents, locations with their pull requests, and environments. Agents write its file, a YAML `.aad` file; a person watches it and keeps the positions and folds they chose in the same file. Its requirements and design were written and approved in `etalii.adp.ide.standalone`, the host that builds it first. Their Requirement 1 says the definition comes first, in this repository, so that every host builds the same tool from it.

This feature is that definition. It specifies nothing the standalone documents do not: what the tool does and why is theirs, and this folder records how the definition is delivered here and what was settled on the way. Where the definition files and the standalone documents disagree, the definition files win (their Requirement 1.6) and the standalone documents are amended.

## What this feature delivers

- **FR-001** A trial of the file's shape against FBL and DISL before anything is built on it, answering the three questions of standalone task 1, with each answer that is no put to the maintainer as a selection (standalone Requirement 1.4; [research.md](research.md) R1 to R4).
- **FR-002** DISL 0.4: `groupBy` on a compartment with a collapse default per group (L1), how a declared default and a stored state meet (L2), `persist` on a canvas filter (L3), `pin`, `unpin` and `unpinAll` with `pinned` on the `view` action and "a drag pins" (L4), `tiers` on `force` with the properties its result must have (L5), the `open` action, `itemLink` and a relative path in `uri` (L6), and `persistence.view.bind` (L7), each in the specification, its schema and a worked example, listed under *Changes from 0.3* (standalone Requirement 1.2).
- **FR-003** The binding `aad` in `definitions/diagrams/agent-activity-diagram.fbl`, with a read fixture covering every key and one fixture per kind of edit (standalone Requirement 1.1).
- **FR-004** `definitions/diagrams/agent-activity-diagram.dis`, `agent-activity-diagram.md` and `agent-activity-diagram.schema.json`, with origin `etalii/agent-activity-diagram`, language id `net.etalii.adp.etalii.agent-activity-diagram` and extension `aad`, and the tool's page in the Notion "Tools" database brought in line (standalone Requirements 1.1, 1.3, 1.5 to 1.8, 8.2).

## Success criteria

- **SC-001** `python .github/scripts/validate-examples.py` passes on the binding, every fixture, the DISL 0.4 example and `agent-activity-diagram.dis`, and fails on the planted defect each task names.
- **SC-002** A second host can build the Agent activity diagram from `definitions/diagrams/` alone (standalone Requirement 1.7).
