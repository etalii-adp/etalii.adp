# Implementation Plan: The Hierarchical Requirement Designer

**Branch**: `features/028-hierarchical-requirement-designer` | **Date**: 2026-10-14 | **Spec**: [hierarchical-requirement-designer.spec.md](hierarchical-requirement-designer.spec.md)

**Scale note.** This is an oversized change: three specification languages each move a version (DED 0.2, FBL 0.7, DESL 0.2), a second designer type is defined, and the example validator learns to read a Markdown document, about seventy files in this repository. Watch two things. The definition needs five constructs of DESL, not the two the specification first named ([research.md](research.md) R13 to R16). And nothing here builds the designer: the standalone host does, in its own repository, after spec 025.

## Summary

A requirement document is a plain `.md` file: an envelope line, a legend for agents, the hierarchy as nested bullets under `## Requirements`, and the assessments as a task list under `## Assessments`. Its registration keeps the colours and order of the tag, category and state lists, what is collapsed, and the stored filters. This feature delivers the languages that can say so and the definition that says it: FBL gains a `bullets` family and declared blocks in the registration, DESL gains a `hierarchy` surface, counted identifiers and three smaller constructs, DED states where the envelope stands in Markdown, and `definitions/designers/` gains the designer type with its binding, companion document, examples and fixtures. The standalone host then builds the designer from those files, as spec 029-standalone-hierarchical-requirement-designer specifies.

## Technical Context

- **What changes**: `specifications/ded/`, `specifications/fbl/` and `specifications/desl/` (document, schema and worked examples each), `definitions/designers/` (a second designer type), `.github/scripts/validate-examples.py`, and the prose that names the designer formats (`CLAUDE.md`, `README.md`, `docs/terminology.md`, `definitions/designers/README.md`).
- **What checks it**: `python .github/scripts/validate-examples.py` (schemas, fixture replay, and a reading of all designer examples), `python .github/scripts/terminology-check.py --name etalii.adp` and `python .github/scripts/licence-check.py`. All three run in the Build workflow.
- **What the validator cannot check**: that a host plans the splices a fixture states, and anything a person sees. The fixtures are the contract a host's conformance run is held to; the layout, the gestures and SC-001, SC-002, SC-009, SC-010 and SC-011 are shown only in the standalone host.
- **Planted defects** (SC-008): as in spec 013, each task that adds a check names the defect to plant by hand and the failure to see. There is no harness for it and this feature adds none.
- **Hosts**: no host changes in this feature's pull requests. What the standalone host has to build and settle is listed in [contracts/host-handoff.md](contracts/host-handoff.md).

## Constitution Check

Checked against `.specify/memory/constitution.md` 1.6.0, before research and again after the design.

| Principle | Assessment |
|---|---|
| I. One source of truth | PASS. How a requirement document is read and written is stated here before any host builds it. The one existing tool over Markdown bullets has its reading in host code; this one has it in a binding. |
| II. Implementable from the document alone | PASS. Each language change comes with its schema and worked examples in the same pull request, and the definition with a companion document, a file schema, examples and fixtures. |
| III. Precise normative language | PASS. The new sections use the RFC 2119 key words; the filter and the id rules use regular expressions in FBL's common subset and CEL, and no new expression syntax. |
| IV. Versioned specifications | PASS. DED 0.2, FBL 0.7 and DESL 0.2 are drafts, each a superset of the version before. Every existing document stays valid, and each schema stays at its 0.1 address as FBL's does. |
| V. Simplicity | PASS, with the two reserved constructs judged below. What the design leaves out on purpose is in R21. |
| VI. No JetBrains Rider warnings in C# | PASS. No C# changes here. |

### The two constructs the decision reserved

**A `bullets` family in FBL: justified.** The current tool's need is to read and write nested Markdown bullets in every host. The alternative on record is a persistence plugin. It is not simpler here. DESL has no `plugins`, so a plugin for a designer is a DESL change too, and then the reading lives in each host's code and not in this repository, which is what principle I exists to prevent. A family costs each host one reader, as a plugin costs each host one plugin. A second tool is in view: Agent Behavior Modelling reads the same kind of file through a plugin, and its binding in this repository is still "not written yet". The family is specified so that it can state that reading, and one of its two worked examples does (R10). It stays within FBL's non-goal: it reads list items under named headings, not Markdown.

**Declared blocks in the registration: justified.** The need is the maintainer's rule that what an agent does not read stays out of the file the agent reads. Agent Behavior Modelling already follows it for positions ("Deleting it loses a layout, never a behavior"). The construct is the smallest that holds the data: the block grammar the registration already has for `layout:` and `identities:`, with a binding naming further blocks as it may already name further headers, and one rule for blocks whose order is kept (R12). The alternative, keeping the lists in the document as the Knowledge designer does, puts colours and collapsed state into text an agent reads and rewrites. The precedent that a tool works the same after its registration is deleted holds for everything an agent reads (FR-005).

### Complexity Tracking

| Deviation | Why it is needed | Simpler alternative rejected |
|---|---|---|
| One feature for three language changes and a definition, against "One Spec Kit feature per change to a specification" | The maintainer's choice of 2026-10-14 (specification, Clarifications). The four parts are one tool's need and are reviewed together, as spec 013 delivered DESL 0.1, DED 0.1, an FBL change and the Knowledge definition. | A feature per language. It was offered and declined. Each language still gets its own pull request, in the order below, so each is reviewed and can be refused on its own. |
| DESL gains five constructs where FR-057 named two | Moving an entry to another parent, a text that names entries by number, and state kept in the registration cannot be stated in DESL 0.1 (R13, R15, R16). Without them the definition would leave FR-004, FR-023 and FR-040 to FR-044 to each host. | Leaving them to the companion's prose, as "What DESL cannot express". That is what principle I forbids for behaviour every host must share. FR-057 is corrected to name all five (R22). |
| The host's specification written here, as spec 029, against "`etalii.adp.ide.standalone` plans with spec-workflow" | The maintainer asked for it on 2026-10-14, when T070 came up, as they did for spec 025. | A spec-workflow specification in the host's `.spec-workflow/`, as this plan first had it. The convention's text is left unchanged, as spec 025 ruled. |

## Project Structure

```text
specs/028-hierarchical-requirement-designer/
├── hierarchical-requirement-designer.spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   ├── requirement-document.md      (the file and its registration)
│   ├── language-changes.md          (DED 0.2, FBL 0.7, DESL 0.2)
│   ├── tool-type.md                 (the definition: roles, operations, findings)
│   └── host-handoff.md              (what the standalone host builds and settles)
└── checklists/requirements.md

specifications/ded/
├── DED-specification.md             (0.2: the envelope in a Markdown file)
├── ded.schema.json
└── web-shop.md                      (new: a Markdown definition as worked example)

specifications/fbl/
├── FBL-specification.md             (0.7: the bullets family, declared registration blocks, drift before an edit)
├── fbl.schema.json
├── behavior-tree.fbl                (new: Agent Behavior Modelling's reading, declared)
├── registrations/requirements.adp   (new: a registration with declared blocks)
└── fixtures/
    ├── bullets-read/                (new)
    ├── bullets-edits/               (new: add, set, remove, move across depths, a missing section)
    ├── behavior-tree-read/          (new)
    ├── registration-blocks/         (new: kept order, ordinal order, stale entries)
    └── hierarchical-requirement-*/  (new: the designer's binding, see contracts/tool-type.md)

specifications/desl/
├── DESL-specification.md            (0.2)
├── desl.schema.json
├── minimal-hierarchy.des            (new)
└── minimal-hierarchy.fbl            (new)

definitions/designers/
├── README.md                        (a second row)
├── hierarchical-requirement.des
├── hierarchical-requirement.fbl
├── hierarchical-requirement.md      (the companion)
├── hierarchical-requirement.schema.json
└── examples/
    ├── web-shop.md
    └── web-shop.adp

.github/scripts/validate-examples.py
CLAUDE.md, README.md, docs/terminology.md
```

**Structure Decision**: every file follows the pattern its folder already has. The definition copies the Knowledge designer's five artefacts under one base name, and each language change copies specs 015 and 026: document, schema, examples and fixtures together.

## Delivery

One branch at a time, each cut from `develop` after the pull request before it is merged, each with a green Build.

1. **This feature's documents**: the specification, this plan and the tasks.
2. **DED 0.2**: the envelope in a Markdown file, with the validator reading it. The smallest change, and nothing else depends on its review.
3. **FBL 0.7, the `bullets` family**, with drift before an edit.
4. **FBL 0.7, declared registration blocks.** A pull request of its own, so that this reserved construct can be refused without the family.
5. **DESL 0.2**: the `hierarchy` surface, counted identifiers, `move`, `mentions` and `persistence.settings`.
6. **The definition**: `definitions/designers/hierarchical-requirement.*`, its examples and fixtures, and the prose that names the designer formats.
7. **The hand-off**: the standalone host's specification of the designer, written in this repository as spec 029-standalone-hierarchical-requirement-designer from the merged definition. Spec 029 is specified now; its building waits for spec 025.

## What is not done here

- The designer in the standalone host, and every success criterion that needs a person or an agent at work: SC-001, SC-002, SC-009, SC-010, SC-011. They are carried to the host's own specification, spec 029, by step 7.
- Agent Behavior Modelling's move onto the `bullets` family. `behavior-tree.fbl` shows that the family can state its reading; changing that tool's definition and its hosts is a feature of its own.
- Hosts other than standalone. Visual Studio Code and IntelliJ implement FBL 0.7 and DESL 0.2 when a feature brings this designer to them.
- The copies of schemas that `etalii.adp.site` keeps. Whether the site shows DED, DESL or FBL schemas is checked when the first language pull request merges, and refreshed there if it does.
