# Feature Specification: The Knowledge Designer's Definition

**Feature Branch**: `claude/project-thread-rmr2na` (a cloud session's branch, in place of `features/013-knowledge-designer`)
**Created**: 2026-10-09
**Status**: Implementing
**Input**: Tasks 1 to 5 of the Knowledge designer specification of `etalii.adp.ide.standalone`, which plans with spec-workflow: [requirements.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/fdcff792dc8c7ed3948311c4bfc7395de5594f80/.spec-workflow/specs/knowledge-designer/requirements.md), [design.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/fdcff792dc8c7ed3948311c4bfc7395de5594f80/.spec-workflow/specs/knowledge-designer/design.md) and [tasks.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/fdcff792dc8c7ed3948311c4bfc7395de5594f80/.spec-workflow/specs/knowledge-designer/tasks.md), approved in its dashboard on 2026-10-08 and read at that repository's commit `fdcff79`. The maintainer said "proceed" in the project's thread "Knowledge Designer spec" on 2026-10-08.

## Context

The Knowledge designer is ADP's first designer: one table per plain text file (YAML, JSON or XML), with typed properties, relations between files and stored views, working the way Notion's table view does. Its requirements and design were written and approved in `etalii.adp.ide.standalone`, the host that builds it first. Their Requirement 1 says the definition comes first, in this repository, so that every host builds the same tool from it: the FBL bindings of the knowledge file, DESL 0.1 and `definitions/designers/knowledge.des` with `knowledge.md` beside it.

This feature is that definition. It specifies nothing the standalone documents do not: what the tool does and why is theirs, and this folder records how the definition is delivered here and what was settled on the way. Where the definition files and the standalone documents disagree, the definition files win (their Requirement 1.7) and the standalone documents are amended.

## What this feature delivers

- **FR-001** The knowledge file's FBL bindings, `yaml`, `json` and `xml`, in `definitions/designers/knowledge.fbl`, each with a template of one title property, one view and no rows (standalone Requirements 1.1, 2.6, 2.7, 2.10).
- **FR-002** Fixtures under `specifications/fbl/fixtures/` that prove, per format, reading and every kind of edit the standalone requirements name, with an undo; one that reads the same table from all three formats; and one that keeps an unknown key and an unreadable cell (Requirement 1.3).
- **FR-003** The validator resolves the names an FBL document's rules refer to (FBL section 14.1, step 4), so that a rule naming a rule its binding lacks fails the build.
- **FR-004** FBL 0.3: wording that covers a specification in DISL or in DESL, and a binding chosen by the body's format family, with no change of behaviour (language decisions L3 and L4).
- **FR-005** DESL 0.1, with its schema and a minimal example, holding only what `knowledge.des` needs, each construct named for what it does; DED stays a placeholder (Requirement 1.2).
- **FR-006** `definitions/designers/knowledge.des`, `knowledge.md`, `knowledge.schema.json` and one example per format, validated in the Build workflow (Requirements 1.1, 1.5, 1.7, 1.8, 2.8, 7.7, 8.4).
- **FR-007** `docs/terminology.md` says why a tool whose cells hold relations is a designer, and names the Knowledge designer as the example of a designer (Requirement 1.5, Q7).

## Success criteria

- **SC-001** `python .github/scripts/validate-examples.py` passes on every binding, fixture, example and the DESL specification, and fails on the planted defect each task names.
- **SC-002** A second host can build the Knowledge designer from `definitions/designers/` alone (Requirement 1.8).
