# Implementation Plan: The Post-Incident Review Designer

**Branch**: `claude/project-thread-cj29ch` (a cloud session's branch, in place of `features/086-post-incident-review-designer`) | **Date**: 2026-11-23 | **Spec**: [post-incident-review-designer.spec.md](post-incident-review-designer.spec.md)

**Input**: the specification, approved by the maintainer on 2026-11-23 ("Approve all three" on the decision card for specs 084 to 086).

## Summary

A review is a plain Markdown file with the DED 0.2 envelope, read through FBL's `bullets` family under six headings, its entries, factors and actions numbered by DESL's counters, each a line an agent can append (research R1 to R6, [contracts/review-document.md](contracts/review-document.md)). DESL 0.3's two surfaces cannot show a review, so DESL 0.4 adds a third, `sections`: one page of record and list parts with ordering, grouping, figures, marks and a read-only time strip (R7, [contracts/desl-sections-surface.md](contracts/desl-sections-surface.md)). The definition then states the designer in `definitions/designers/`, with its intervals as DESL functions (R4). The folder overview of User Story 5 is a small second designer type over the same binding, delivered last and first to cut (R8).

## Technical Context

- **What changes**: `specifications/desl/` (DESL 0.4: document, schema, `minimal-sections` example), `.github/scripts/validate-examples.py` where it reads a DESL surface, and `definitions/designers/` (`post-incident-review.des`, `.fbl`, `.schema.json`, `.md`, `.atd` with its part and trace, `examples/`), with fixtures under `specifications/fbl/fixtures/post-incident-review-*/`. Outside: the catalogue row and the Notion page (FR-013).
- **What checks it**: `validate-examples.py` (schemas, fixture replay, and the reading of designer examples), the Build's `descriptions` job, `terminology-check.py`, `licence-check.py`.
- **What the checks cannot see**: the page a host lays out, and the intervals a host evaluates. SC-002 is checked by hand against the companion here; SC-003 and SC-005 need an agent or a reader and are carried to the first host's specification.
- **No FBL change**: the `bullets` family, word slots, `mentions`, counters and the envelope marker exist (FBL 0.7, DESL 0.2, DED 0.2).
- **Hosts**: none change. A host that adopts DESL 0.4 builds the `sections` surface once, for every tool type that uses it.

## Constitution Check

Checked against `.specify/memory/constitution.md` as it stands on `develop` at `91f6c0f`, before research and again after the design.

| Principle | Assessment |
|---|---|
| I. One source of truth | PASS. The review's format is a binding, and its page a DESL surface, both stated here before a host builds them. |
| II. Implementable from the document alone | PASS. DESL 0.4 comes with its schema and a worked example; the definition with its companion, schema, examples and fixtures. |
| III. Precise normative language | PASS. RFC 2119 key words in DESL 7.8; CEL for the intervals. |
| IV. Versioned specifications | PASS. DESL 0.4 is a superset of 0.3. |
| V. Simplicity | PASS for `sections`: the current tool's need is a page neither existing surface can lay out, and the surface is generic (R7). The overview's second designer type is the part least justified by a current need; it is delivered on its own and is the first to cut (R8). |
| VI. No JetBrains Rider warnings in C# | PASS. No C#. |

After the design: PASS on every row, with the reservation on R8 recorded above.

### Complexity Tracking

| Deviation | Why it is needed | Simpler alternative rejected |
|---|---|---|
| One feature for a language change and a definition, against "One Spec Kit feature per change to a specification" | The surface exists for this designer and is reviewed with it, as spec 028 delivered DESL 0.2 with the Hierarchical Requirement Designer. | A feature for DESL 0.4 alone: the surface would have no tool to be judged against. It still gets its own pull request. |
| A second origin, `etalii/post-incident-review-overview` | A folder reading is a tool type of its own in FBL (R8). | A folder query inside the review designer, which neither DESL nor FBL can state. |

## Project Structure

```text
specs/086-post-incident-review-designer/
├── post-incident-review-designer.spec.md, plan.md, research.md, data-model.md, quickstart.md, tasks.md
├── contracts/review-document.md
├── contracts/desl-sections-surface.md
└── checklists/requirements.md

specifications/desl/
├── DESL-specification.md            (0.4: the sections surface, section 7.8)
├── desl.schema.json
├── minimal-sections.des             (new)
├── minimal-sections.fbl             (new)
└── minimal-sections.md              (new: its document)

definitions/designers/
├── README.md                        (a row, and later a second)
├── post-incident-review.des
├── post-incident-review.fbl
├── post-incident-review.schema.json
├── post-incident-review.md          (the companion, with the worked intervals)
├── post-incident-review.atd         (and its part: .markdown.atd)
├── post-incident-review.trace.json
├── post-incident-review-overview.des, .atd, .trace.json   (pull request 4)
└── examples/
    ├── checkout-latency.md
    └── certificate-expiry.md

specifications/fbl/fixtures/
├── post-incident-review-read/
├── post-incident-review-edits/
└── post-incident-review-folder/     (pull request 4)

etalii.adp.ide.standalone/docs/tools.md   (the catalogue row)
```

**Structure Decision**: the definition copies the Hierarchical Requirement Designer's artefacts under one base name; DESL 0.4 copies DESL 0.2's delivery.

## Delivery

1. **This feature's documents.**
2. **DESL 0.4**, the `sections` surface, with its example.
3. **The definition**, its examples, fixtures and the README row.
4. **The folder overview** (User Story 5), on its own.
5. **The catalogue**: the standalone row and the Notion page.

## What is not done here

- Incident response during an incident, and fetching logs or metrics (*What this feature is not*).
- Building the designer in a host, conformance cases, SC-003 and SC-005.
