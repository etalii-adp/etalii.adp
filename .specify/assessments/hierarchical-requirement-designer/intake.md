# Idea Intake: Hierarchical Requirement Designer

- **Slug**: hierarchical-requirement-designer
- **Created**: 2026-10-12
- **Source**: pasted text (chat, 2026-10-12)
- **Type**: new-capability

## Idea (as captured)

> I want to add a new designer tool that is focussed on structuring requirements hierarchically.
> i.e. applications are always hierarchically, so the UI, integration, backend, data or even processes can be described in a hierarchical way. If this content would be stored in a markdown then that could help with the dialog between users and agents.
>
> Some more thougts:
> - on each level in the hierarchy requirements can be added.
> - Requirements are automagically numbered.
> - there are groupings in default requirement categories (functional, technical, non-functional etc.).
> - Tags can be added.
> - filtering can be done on tags, or on hierarchical elements (including wildcard based filtering)
> - It is not solely a treeview, rather a form based structure based on the hierarchy.
> - There is a distinct part of the file in which assessments are stored. This is also presented in the designer per requirement as questions, remarks, warnings etc.
> - The user has quick ways to add new hierarchical aspects, as well as requirements.
> - the UI is similary styled as the knowledge designer.
> - designer tool name is "Hierarchical Requirement Designer"

## Restated

A new designer type, named "Hierarchical Requirement Designer", in which a user breaks an application down into a hierarchy (UI, integration, backend, data, processes and so on) and attaches numbered, categorised and tagged requirements at any level of it. Its document is a Markdown file of the designer's own, whose structure the designer maintains and enforces, so that users and agents can both read and discuss it, with a separate part of the file for assessments (questions, remarks, warnings) that the designer shows per requirement.

## Origin & Context

- **Raised by**: the maintainer (git user `vrenken`), in a chat session on 2026-10-12
- **Trigger**: an observation about how agents and people work together, not a single event. Asked what prompted it now, the maintainer answered (2026-10-12):

  > Agents consume and produce a lot of text, but for specific situations humans are better at interpeting and interacting with non-text based content. This is also the case for software applications that are often hierarchical in nature.

  So the motive has two halves: the Markdown file is the text that agents read and write, and the designer is the non-text presentation of the same content for people, following the hierarchy that applications have. The answer names no event, date or project that made it pressing now.

### What it relates to in this repository

Recorded for the later stages, not as a judgement of the idea:

- Designer types are specified in DESL (`specifications/desl/`) and their documents are DED definitions (`specifications/ded/`), read and written through FBL bindings (`specifications/fbl/`).
- The one existing designer type is the Knowledge designer, `etalii/knowledge`, in `definitions/designers/` (`knowledge.des`, `knowledge.md`, `knowledge.fbl`, `knowledge.schema.json`, `examples/`), delivered by `specs/013-knowledge-designer/`. The idea names it as the model for the styling.
- A knowledge document is YAML, JSON or XML and begins with DED's envelope (`ded`, `designer`); none of the existing designer documents is Markdown.
- The Knowledge designer already has tags (multiple selection), filtering, grouping and a parent relation that nests rows.

## Clarifications

Answers the maintainer gave to first-glance unknowns, in their own words.

- **Is the Markdown file the designer's own document, or a file of another tool that the designer reads and writes through an FBL binding?** (answered 2026-10-12)

  > Its the designers own document. i.e. the markdown structure is maintained and enforced by the designer.

  So the Markdown file is not another tool's file: the designer owns its structure, and keeps a file that a user or an agent has edited as text within that structure.

## First-Glance Unknowns

- [NEEDS CLARIFICATION: how a Markdown file can be a designer's own document, given that DED documents begin with DED's envelope (`ded`, `designer`) and are YAML, JSON or XML today: where the envelope goes in Markdown, or what takes its place]
- [NEEDS CLARIFICATION: what "enforced" means when a user or an agent edits the file as text and breaks the structure: is the file refused, reported, or repaired, and what happens to prose the structure has no place for?]
- [NEEDS CLARIFICATION: what the Markdown looks like: how a hierarchy level, a requirement, its number, its category and its tags are each written, and how much free prose is allowed around them]
- [NEEDS CLARIFICATION: how requirements are numbered: per level, per category or across the file, in what format, and whether a number stays the same when requirements are added, moved or deleted]
- [NEEDS CLARIFICATION: is the number a requirement's identity (what assessments and other files refer to), or is there a separate stored id?]
- [NEEDS CLARIFICATION: the full list of default requirement categories behind "functional, technical, non-functional etc.", and whether a user can add, rename or remove categories]
- [NEEDS CLARIFICATION: is the hierarchy free-form, or are its top levels (UI, integration, backend, data, processes) predefined? Is there a maximum depth?]
- [NEEDS CLARIFICATION: are tags free text or a managed list, and do they apply to requirements only or to hierarchy elements too?]
- [NEEDS CLARIFICATION: the wildcard syntax for filtering on hierarchy elements, and whether filters are stored in the file as the Knowledge designer's views are]
- [NEEDS CLARIFICATION: what "form based structure based on the hierarchy" looks like: what is shown beside or instead of a tree, and what one form holds]
- [NEEDS CLARIFICATION: who writes assessments (agents, users, or both), what kinds exist beyond "questions, remarks, warnings", and whether an assessment can be answered, resolved or dismissed]
- [NEEDS CLARIFICATION: how an assessment in its distinct part of the file refers to its requirement, and what happens to it when that requirement is renumbered, moved or deleted]
- [NEEDS CLARIFICATION: can an assessment be attached to a hierarchy element, or to the file as a whole, and not only to a requirement?]
- [NEEDS CLARIFICATION: what the "quick ways" to add hierarchy elements and requirements are: keyboard, inline entry, or something else]
- [NEEDS CLARIFICATION: which parts of the Knowledge designer's styling are meant: its look only, or also its views, tabs, bar and gestures]
- [NEEDS CLARIFICATION: which hosts are to offer it first (standalone, VS Code, IntelliJ, Eclipse, Notion)]
- [NEEDS CLARIFICATION: its origin identifier and file extension, and whether "Hierarchical Requirement Designer" is the name users see or a working title]
- [NEEDS CLARIFICATION: how it relates to existing requirement files that agents already use, such as Spec Kit's `spec.md` or spec-workflow's requirements: read those, replace those, or stay separate]
- [NEEDS CLARIFICATION: can a requirement relate to other requirements or to elements of other tools (a diagram element, a knowledge row)?]
