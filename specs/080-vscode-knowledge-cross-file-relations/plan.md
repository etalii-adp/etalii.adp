# Implementation Plan: The VS Code Knowledge Designer Follows Relations into Other Files

**Branch**: `claude/project-thread-bvf5w4` (planning); the implementation's branches are named in *Delivery* | **Date**: 2026-11-21 | **Spec**: [vscode-knowledge-cross-file-relations.spec.md](vscode-knowledge-cross-file-relations.spec.md)

**Input**: the specification, approved by Peter on 2026-11-21 (decision card "Approve both", for specs 079 and 080), with the plan and tasks asked for.

## Summary

The core is given the texts of the files a document's relations name (research R1) and reads them through the same binding: a relation cell then shows titles and links, its editor lists the target's rows, a limit of one row replaces, and the two findings about unresolved targets and rows are raised. Steps that change two files are planned as splices of both and applied as one `WorkspaceEdit` (R2): creating a two-way relation, deleting one side of it, and the rewrite of `target` when a knowledge file is renamed or moved (R3). Deleting rows that other files relate to says how many first. Only files inside a trusted workspace are written (R4).

This feature builds on spec 079: the column menu's "Edit relation" and the new-property panel are 079's, and gain the relation's steps here.

## Technical Context

- **Language**: TypeScript 5.
- **What changes in `etalii.adp.ide.vscode`**:
  - `src/core/frame/toolType.ts`: `Source.related`.
  - `src/core/tool/tableView.ts`, `src/core/tool/toolTypeFrom.ts`: related rows' titles and the target's row list in the view; the two findings; two-file edit outcomes (`splices` per file).
  - `src/core/plugins/knowledge-views/`: the counterpart's values, computed from the files that point at this one; the limit of one row replacing.
  - `src/extension/toolEditor.ts` and a new `src/extension/relatedFiles.ts`: gathering and following the related texts, applying two-file edits, the list of knowledge files, `onWillRenameFiles`.
  - `src/webview/table/`: the links, the row picker, the relation panel's steps.
  - `docs/disl-support.md`, `docs/parity.md` (R5).
- **Tests**: vitest for the core with two-file fixtures from the vendored relations example; the real-IDE suite for the link opening a file, the two-file undo and the rename.
- **Checks**: as spec 079's.
- **Constraints**: the core does not touch a file system; no file outside the workspace is written; a two-file step writes both or neither.
- **Unknowns**: none blocking; R2's dialog is the platform's and is recorded when seen.

## Constitution Check

| etalii.adp principle | How |
|---|---|
| I. One source of truth | `knowledge.md` already states the relations and the two-file steps; nothing in the definition changes. |
| II. Implementable from the document alone | The host follows `knowledge.md` section *Relations and the steps that write two files*. |
| III – VI | No normative text, version or C# changes; one optional field and one extension module. |

| VS Code principle | How |
|---|---|
| I. Native citizenship | Two-file steps are one platform workspace edit, undone by the platform; files open in their editor. |
| II. The text file is the source of truth | Both files are edited by splices; a target is read, never rewritten, except by the named steps. |
| III. One frame, many tools | The core reads texts it is given and stays free of VS Code; the extension gathers them. The rule that a tool type is a function of one document's text gains its exception, recorded (R5). |
| IV. Test-first | Each task's test is seen failing first. |
| V. Simplicity | One field on `Source`, one extension module. |

## Delivery

| Pull request | Repository | Branch | Holds |
|---|---|---|---|
| A | etalii.adp | `claude/project-thread-bvf5w4` | This plan, its research and tasks, with spec 079's |
| B | VS Code | `features/080-knowledge-related-rows` | Reading targets: titles, links, picker, limit, findings (FR-001 – FR-005) |
| C | VS Code | `features/080-knowledge-two-file-steps` | Two-way creation and deletion, the delete count, renames, Edit relation (FR-006 – FR-012) |
| D | etalii.adp | `features/080-knowledge-cross-file-ticks` | The ticks |

B follows spec 079's pull request C, which brings the column menu; C follows B.

## Project Structure

```text
etalii.adp.ide.vscode/
├── src/core/frame/toolType.ts           Source.related
├── src/core/tool/…                      titles, rows of a target, findings, two-file outcomes
├── src/core/plugins/knowledge-views/    counterpart values, limit of one
├── src/extension/relatedFiles.ts        gathering, following, the list of knowledge files, renames
├── src/extension/toolEditor.ts          two-file WorkspaceEdit
├── src/webview/table/                   links, row picker, relation panel
└── test/core/…, test/vscode/knowledge.test.ts
```

## Complexity Tracking

| Deviation | Why it is needed | Simpler alternative rejected because |
|---|---|---|
| The core reads more than one document's text | `knowledge.md` requires titles from, and steps over, a second file; Peter chose cross-file parity on 2026-11-21 | Showing ids and refusing two-way relations is today's behaviour, which the feature exists to end |
