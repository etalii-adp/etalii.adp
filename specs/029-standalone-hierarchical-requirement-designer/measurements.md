# Measurements: standalone hierarchical requirement designer

The success criteria of [the specification](standalone-hierarchical-requirement-designer.spec.md) that only real use can show, written down as they come in (T113). SC-003 and SC-006 to SC-009 are shown by tests and the conformance run in the standalone host, recorded at T111. The rest are recorded here.

Started 2026-10-23, when the last pull request of the build (standalone #644) merged. No reading has been taken yet.

## Resolved by the maintainer's feedback

On 2026-10-24 the maintainer used the designer and sent one list of feedback, ruling that fixing it is the complete feedback that resolves T113, in place of the readings below. The readings stay here for whoever wants to take them later; T113 does not wait on them.

The feedback, and where it was built:

| Feedback | Built in |
| --- | --- |
| The collapse icon, number, title and icons aligned to the top, also for a title of several lines; the icons laid out from right to left, wrapping rather than covering the title; focus on hover | standalone #695 |
| The assessment list above every pane; the kinds with their icons; three rows of text and an Add button below them; resolve, change and remove as icons, beside a long assessment and under a short one | standalone #695 |
| The edit field the size of the label it replaces; a drag showing where the node lands; "n more levels" at every level, its icon first; the add controls as icons | standalone #695 |
| Labels smaller and aligned, and tag, category and state each drawn differently; the list editor's first column even, its fields and buttons alike, and a preview while dragging | standalone #695 |
| An item or requirement deleted by an icon on the selected box, asking first and saying what goes with it; the trail always shown, following the selection | standalone #695 |
| The filter completing the word being typed from the tags, categories and states | standalone #695 |
| `@` for a state in the filter, and the widths of the columns dragged and kept in the `.adp` | etalii.adp #508 (DESL 0.2 and the definition), standalone #696 |

## SC-001: finding and judging, as text and in the designer

The same person does one task on one real requirement document twice, at least a day apart: first with the file read as text in an editor, then in the designer. The task is to find and judge the requirements of one part of the subject, and to say how they fit with the rest. The criterion holds when the designer's time is the shorter.

| Reading | Date | Document | Part of the subject | Tool | Time | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | | | | Text editor | | |
| 2 | | | | Designer | | |

## SC-002: an agent's changes over the first four weeks

Every change an agent makes to a requirement document in the first four weeks of real use is counted. A change counts as clean when the designer reads it without a finding and the person does not repair the file by hand. The criterion holds when at least nine in ten are clean.

First day of real use:

| Week | Changes by an agent | Read without a finding | Repaired by hand | Clean share |
| --- | --- | --- | --- | --- |
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |

## SC-004: the maintainer's four weeks

The maintainer keeps the requirements of one real subject outside this repository in a requirement document for four weeks. The subject is the maintainer's to name. The criterion holds when, at the end, the maintainer prefers the document to the text.

| Subject | First day | Last day | Prefers the designer | Notes |
| --- | --- | --- | --- | --- |
| | | | | |

## SC-005: a second person

This criterion adds to success and is not a condition for it. Record it if a person other than the maintainer keeps the requirements of a real subject this way.

| Person (role, not name) | Subject | From | Notes |
| --- | --- | --- | --- |
| | | | |
