# Implementation Plan: Links Between Tools

**Branch**: `claude/project-thread-hu5ioe` (a cloud session's branch, in place of `features/089-cross-tool-links`) | **Date**: 2026-11-23 | **Spec**: [cross-tool-links.spec.md](cross-tool-links.spec.md)

**Input**: the specification, approved by the maintainer on 2026-11-23 ("Approve as written" on the decision card).

## Summary

The link is stated once, in FBL, because FBL already serves every kind of tool and already owns what lies between a tool type and its files: ids, references, the registration and routing (research R1). FBL 0.23 adds a section *Links between documents*: the link's grammar and escaping, the document id and where a binding stores it, resolution within the workspace, load-time validation, backlinks and the four findings `link.malformed`, `link.broken-document`, `link.broken-element` and `link.ambiguous-document` ([contracts/link-form.md](contracts/link-form.md), [contracts/resolution.md](contracts/resolution.md)). The specification languages each add only their side: DISL 0.12 a `link` attribute type, linked element types, `linkable` with its name property, `shows`, and a standard `lookup` action (R3, R4); DESL 0.5 the `link` value type and the relation picker (R5); DISL and DESL also gain a `length` and an `alphabet` on their random id strategy, so that `nanoid` with 8 characters of `0-9a-z` is stated (R2). ATD's grammar and the tool descriptions follow them (R6). The four tool types then declare links in their definitions and bindings (R7 to R10), the knowledge file's relations are converted once (R9), and a worked workspace with a conformance fixture checks resolution in the Build (R11).

## Technical Context

- **What changes in this repository**: `specifications/fbl/` (FBL 0.23: section 13 *Links between documents*, schema, the example bindings `mindmap.fbl`, `timeline.fbl`, `dependency-graph.fbl`, and a fixture folder `fixtures/links-*`), `specifications/disl/` (DISL 0.12: document and schema), `specifications/desl/` (DESL 0.5), `specifications/ded/` (DED 0.3: the envelope's `id`), `specifications/atd/` (grammar, the ATD document's mapping of the new constructs, regenerated tables and highlighting), `definitions/designers/knowledge.*` and `definitions/diagrams/{mindmap,timeline,dependency-graph}.*` (specification, binding, companion, tool description, trace), `definitions/examples/links/` (a worked workspace), and `.github/scripts/validate-examples.py` (the link grammar and the resolution fixture). DISL's appendix D.2 question 1 and DESL section 3 point at FBL section 13.
- **What changes in another repository**: the diagram types' bindings are served from `etalii.adp.ide.standalone` (`src/diagrams/{mindmap,timeline,dependency-graph}/backend/*/…fbl`, the URL in each `persistence.binding`). They get the same change as the copies here, in a pull request of their own on a branch named as this feature; nothing else in that repository changes in this feature. The mind map's persistence plugin `net.etalii.adp.freeplane.mm` gains two operations in its contract (FBL 11.2), stated here; its code is a host's (R8).
- **What checks it**: `validate-examples.py` (schemas, examples, fixture replay, and the new link fixture), `atd-grammar.py --check`, the Build's `descriptions` job, `terminology-check.py`, `licence-check.py`.
- **What the checks cannot see**: the lookup's search, the picker's chips, a linked node's badge, navigation and "Linked from", which a host draws. SC-001, SC-005 and SC-006 are carried to each host's specification; SC-002 to SC-004 are checked here by the resolution fixture (R11); SC-007 holds by construction, since nothing here is host code.
- **Hosts**: none change in this feature (spec, *Assumptions*).

## Constitution Check

Checked against `.specify/memory/constitution.md` as it stands on `develop` at `c031e08`, before research and again after the design.

| Principle | Assessment |
|---|---|
| I. One source of truth | PASS. The link is defined once, in FBL section 13; DISL, DESL, DED and ATD refer to it and define only their own constructs. |
| II. Implementable from the document alone | PASS. Each changed language comes with its schema and an example; FBL section 13 with its grammar, a fixture and a worked workspace. |
| III. Precise normative language | PASS. RFC 2119 key words; the link's grammar in ABNF; `shows` and name properties as CEL where computed. |
| IV. Versioned specifications | PASS. FBL 0.23, DISL 0.12, DESL 0.5, DED 0.3 are supersets of their predecessors; the knowledge file's conversion is a change of one designer type's documents, stated in its companion. |
| V. Simplicity | PASS. Every construct serves one of the four tool types; editors, transclusion and links outside the workspace are left out as the specification says. The `lookup` action is one standard action for three diagrams rather than one per type. |
| VI. No JetBrains Rider warnings in C# | PASS. No C#. |

After the design: PASS on every row.

### Complexity Tracking

| Deviation | Why it is needed | Simpler alternative rejected |
|---|---|---|
| One feature changes four languages (FBL, DISL, DESL, DED) and ATD, against "one Spec Kit feature per change to a specification" | The link is one construct seen from each language; reviewed apart, no part can be judged against the tool types it serves. Each language still gets its own pull request (R12). | A feature per language: four features with one requirement set. |
| Changes in `etalii.adp.ide.standalone` | The diagram types' bindings are served from there; a binding that does not store the document id makes FR-001 false for every host. | Moving the bindings here: a larger change the maintainer has not asked for. |

## Project Structure

```text
specs/089-cross-tool-links/
├── cross-tool-links.spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/link-form.md          (the link's grammar, escaping, examples)
├── contracts/resolution.md         (resolution, load-time validation, backlinks, findings)
├── contracts/language-constructs.md (what each language and tool type declares)
└── checklists/requirements.md

specifications/fbl/
├── FBL-specification.md            (0.23: section 13, Links between documents)
├── fbl.schema.json                 (document.id, link slots)
├── mindmap.fbl, timeline.fbl, dependency-graph.fbl
└── fixtures/links-workspace/       (new: documents, conformance.json of links and expected results)

specifications/disl/  DISL-specification.md, disl.schema.json   (0.12)
specifications/desl/  DESL-specification.md, desl.schema.json   (0.5)
specifications/ded/   DED-specification.md, ded.schema.json     (0.3: envelope id)
specifications/atd/   ATD-specification.md, grammar/*.lark, generated tables and highlighting

definitions/designers/knowledge.{des,fbl,md,schema.json,atd,*.atd,trace.json}
definitions/diagrams/{mindmap,timeline,dependency-graph}.{dis,md,atd,*.atd,trace.json}
definitions/examples/links/          (new: worked workspace with all four tool types)
.github/scripts/validate-examples.py

etalii.adp.ide.standalone/src/diagrams/{mindmap,timeline,dependency-graph}/backend/*/…fbl
```

**Structure Decision**: languages first, in the order FBL, DED, DISL, DESL, ATD, each its own pull request into `develop`; then the four tool types, one pull request each, with the standalone bindings' pull request alongside the diagram types'; the worked workspace and fixture land with FBL and grow with each tool type.
