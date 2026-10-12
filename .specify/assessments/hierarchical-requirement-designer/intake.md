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

A new designer type, which its users see named "Hierarchical Requirement Designer", in which a user breaks an application down into a free-form hierarchy (UI, integration, backend, data, processes and so on), which starts out populated with a lightweight structure that resembles a common, generic web application, and attaches numbered, categorised requirements, tagged from a managed list that behaves as Notion's selection property does, at any level of it, which can refer to one another by links that stand out in the text. Its document is a Markdown file of the designer's own, written as nested bullets in which a hierarchy level carries an `ITEM-000x` prefix whose number is given by counting up and stays with the level wherever it is moved, and a requirement a `REQ-000x` prefix whose number is the requirement's identity and likewise stays with the requirement wherever it is moved, and whose structure the designer maintains and enforces, so that users and agents can both read and discuss it, with a separate part of the file for assessments (questions, remarks, warnings), each attached to a requirement and by that also applying to the hierarchy element the requirement belongs to, that the designer shows per requirement. The Markdown holds what an agent needs in order to read it; what is not relevant to that reading, the tag list and its colours among it, is stored in the `.adp` file. The designer takes its looks, and only its looks, from the Knowledge designer.

## Origin & Context

- **Raised by**: the maintainer (git user `vrenken`), in a chat session on 2026-10-12
- **Trigger**: an observation about how agents and people work together, not a single event. Asked what prompted it now, the maintainer answered (2026-10-12):

  > Agents consume and produce a lot of text, but for specific situations humans are better at interpeting and interacting with non-text based content. This is also the case for software applications that are often hierarchical in nature.

  So the motive has two halves: the Markdown file is the text that agents read and write, and the designer is the non-text presentation of the same content for people, following the hierarchy that applications have. The answer names no event, date or project that made it pressing now.

### What it relates to in this repository

Recorded for the later stages, not as a judgement of the idea:

- Designer types are specified in DESL (`specifications/desl/`) and their documents are DED definitions (`specifications/ded/`), read and written through FBL bindings (`specifications/fbl/`).
- The one existing designer type is the Knowledge designer, `etalii/knowledge`, in `definitions/designers/` (`knowledge.des`, `knowledge.md`, `knowledge.fbl`, `knowledge.schema.json`, `examples/`), delivered by `specs/013-knowledge-designer/`. The idea names it as the model for the styling, which the maintainer has since narrowed to its looks only.
- A knowledge document is YAML, JSON or XML and begins with DED's envelope (`ded`, `designer`); none of the existing designer documents is Markdown.
- The Knowledge designer already has tags (multiple selection), filtering, grouping and a parent relation that nests rows.

## Clarifications

Answers the maintainer gave to first-glance unknowns, in their own words.

- **Is the Markdown file the designer's own document, or a file of another tool that the designer reads and writes through an FBL binding?** (answered 2026-10-12)

  > Its the designers own document. i.e. the markdown structure is maintained and enforced by the designer.

  So the Markdown file is not another tool's file: the designer owns its structure, and keeps a file that a user or an agent has edited as text within that structure.

- **What does "enforced" mean when a user or an agent edits the file as text and breaks the structure: is the file refused, reported, or repaired, and what happens to prose the structure has no place for?** (answered 2026-10-12)

  > When an agent or user edits the file then the designer is updated. When it is not possible to update the designer then an error is shown.
  >
  > The currently available file interaction patterns and principles should be used and honored.

  So an edit made to the file as text is followed by the designer, which shows the file's new content. A file the designer cannot follow is reported with an error; the answer does not speak of repairing it. For everything else, prose the structure has no place for included, the answer sets no rule of its own and points to the patterns and principles that already govern how tools interact with files, without naming them.

- **Which of the existing file interaction patterns and principles apply to a Markdown document, and what do they say about prose the structure has no place for and about what the designer still shows while the file is in error?** (answered 2026-10-12)

  > The ones as in use in etalii.adp.ide.standalone. That when a file is changed it is detected which part of the file changed.

  So the patterns and principles meant are those the `etalii.adp.ide.standalone` repository uses today, and the one the answer singles out is that a change to a file is traced to the part of the file that changed, not treated as a change to the whole file. The answer does not list the others, and says nothing of its own about prose the structure has no place for or about what the designer shows while the file is in error; both are left to what those patterns turn out to say.

- **Which hosts are to offer it first (standalone, VS Code, IntelliJ, Eclipse, Notion)?** (answered 2026-10-12)

  > First only the standalone

  So the designer is offered first in the standalone host, `etalii.adp.ide.standalone`, and in no other host at that point. "First" leaves the other hosts (VS Code, IntelliJ, Eclipse, Notion) for later; the answer does not say which of them follow, in what order or when.

- **Are tags free text or a managed list, and do they apply to requirements only or to hierarchy elements too?** (answered 2026-10-12)

  > A managed list. The user can type text, when this resolves to a tag then that one is used. If it does not resolve to a tag and the user presses enter then a new tag is added. It should follow the selection property principles as per Notion

  So tags are a managed list, not free text. The user types: text that resolves to a tag in the list uses that tag, and text that resolves to none adds a new tag to the list when the user presses Enter. For the rest the answer points to the principles of Notion's selection property, without listing which of them are meant (answered in the clarification on Notion's selection property below). The second half of the question is not answered: the answer does not say whether tags apply to requirements only or to hierarchy elements too.

- **Can a requirement relate to other requirements or to elements of other tools (a diagram element, a knowledge row)?** (answered 2026-10-12)

  > Yes, there should be a way to refer to other requirements. Use href or link principles that visually stand out when presented in text.

  So a requirement can refer to other requirements, and such a reference follows the principles of an href or link: it stands out visually where it is presented in text. The answer does not say how a reference is written in the Markdown, what it points at, or whether references come in kinds. The second half of the question is not answered: the answer speaks of other requirements only, and does not say whether a requirement can refer to elements of other tools.

- **What does the Markdown look like: how are a hierarchy level, a requirement, its number, its category and its tags each written, and how much free prose is allowed around them?** (answered 2026-10-12)

  > Everything is nested bullets. And a prefix is added with the requirement number. Links provide links to other requirements and anchors (i.e. a link with a #) are used as tags. These tags are at the end of the text

  So the file is nested bullets throughout: the nesting of the bullets carries the hierarchy, and a requirement is a bullet too. A requirement's number is written as a prefix. A reference to another requirement is written as a link, and a tag is written as an anchor, that is a link with a `#`; the tags stand at the end of the text. Three parts of the question are not answered here: how a category is written, what tells a bullet that is a hierarchy level from a bullet that is a requirement (answered in the next clarification), and how much free prose is allowed. "Everything is nested bullets" names no place for prose outside a bullet, but the answer does not say that such prose is refused. Nor does it say what the number prefix looks like, what a link or an anchor points at, or how the distinct part of the file for assessments fits in a file that is nested bullets throughout.

- **In a file that is nested bullets throughout, what tells a bullet that is a hierarchy level from a bullet that is a requirement, and how is a requirement's category written?** (answered 2026-10-12)

  > hierarchy levels are bullets with a "ITEM" prefix. Requirements have a REQ-x.y.z prefix.

  So the prefix of a bullet tells the two apart: a bullet that is a hierarchy level begins with an "ITEM" prefix, and a bullet that is a requirement begins with a `REQ-x.y.z` prefix. This also gives the shape of the requirement number prefix that the previous answer spoke of: `REQ-` followed by numbers separated by dots. The answer does not say what `x`, `y` and `z` stand for, whether there are always three of them, or what follows "ITEM" in a hierarchy level's prefix (answered in the clarification on the "ITEM" prefix below). The `REQ-x.y.z` shape itself has since been replaced by `REQ-000x` (see the clarification on how a requirement is identified below). The second half of the question is not answered: the answer does not say how a requirement's category is written.

- **Is the number a requirement's identity (what assessments and other files refer to), or is there a separate stored id?** (answered 2026-10-12)

  > yes it is.

  The question offered two alternatives and the answer is a "yes"; it is read here as affirming the first: the number is the requirement's identity, and there is no separate stored id. So the `REQ-x.y.z` number is what assessments, links from other requirements and other files refer to. The answer does not say what happens to those references when a requirement's number changes, or whether a number can change at all once it is given; with the number as the identity, that question now decides whether references survive adding, moving and deleting requirements (answered in the clarification on how a requirement is identified below, which also replaces `REQ-x.y.z` by `REQ-000x`).

- **What does the "ITEM" prefix of a hierarchy level look like in full: the word alone or followed by a number or identifier, and how is it set off from the level's name?** (answered 2026-10-12)

  > Use ITEM-000x, where the x is incremented. The item number identity does not change, not even when the item is moved below another one. for example by drag and dropping.

  So the prefix is not the word alone: it is `ITEM-` followed by a number, written as `ITEM-000x`, in which `x` is incremented from one hierarchy level to the next that is given a number. That number is the level's identity and does not change once given, not even when the level is moved below another level; the number therefore says nothing about where the level stands in the hierarchy. The answer names drag and drop as one way a level is moved, which is the first mention of that gesture in this intake. The second half of the question is not answered: the answer does not say how the prefix is set off from the level's name. Nor does it say how many digits the number has (`000x` shows four, with leading zeros) and what happens past the last number that fits, whether the count is kept per file, whether the number of a deleted level is given out again, or what refers to a level by its number. It speaks of hierarchy levels only: whether a requirement's `REQ-x.y.z` number is as stable when the requirement is moved stays open (answered in the clarification on how a requirement is identified below).

- **Which of the principles of Notion's selection property does the managed tag list follow beyond typing to pick or add a tag (renaming, deleting, colours, ordering), what does "resolves to a tag" mean for a partial or differently cased match, and is the list kept per file?** (answered 2026-10-12)

  > all

  The question had three parts and the answer is one word; it is read here as answering the first, the only one that asks "which of": the managed tag list follows all of the principles of Notion's selection property, the four the question named (renaming a tag, deleting a tag, tag colours, the order of the tags) included, and not only typing to pick or add a tag. So a tag is more than its text: it has a colour and a place in an order, and it can be renamed or deleted as one tag, wherever it is used. The answer does not list the principles, so what "all" holds beyond those four is left to what Notion's selection property turns out to do. The other two parts are not answered: "all" does not say what "resolves to a tag" means for a partial or differently cased match, unless that too is taken from Notion's selection property, which the answer does not state, and it does not say whether the list is kept per file. Nor does it say where a tag's colour and the order of the list are written, in a file in which a tag is an anchor at the end of a requirement's text (answered in the next clarification).

- **Is the managed tag list kept per file, and where are a tag's colour and the order of the list written, given that a tag is an anchor at the end of a requirement's text?** (answered 2026-10-12)

  > all aspects not relevant for an ai to read the markdown should be stored in the .adp file. This includes tags and colors.

  So the answer gives a rule that reaches further than the question: the Markdown file holds what an agent needs in order to read it, and every aspect that is not relevant to that reading is stored in the `.adp` file, not in the Markdown. It names two such aspects, tags and colours. A tag's colour is therefore written in the `.adp` file. This is the first mention of the `.adp` file in this intake; in this repository's vocabulary it is the registration file a host keeps for a document (`docs/terminology.md`, FBL section 8), which today names the document's origin and, for a document whose model is another tool's file, keeps the positions the user placed. The answer does not say whether that file is the one meant, or what form tags and colours take in it.

  "Tags" is read here as the managed tag list, that is the tags as the list defines them, since the earlier answer on the Markdown has a requirement carry its tags as anchors at the end of its text, and which tags a requirement carries is something an agent reading the file would want to know. The answer does not say this, and it can also be read as moving the tags themselves out of the Markdown; which of the two is meant is open. The order of the list is not named: the rule would cover it if the order counts as not relevant to an agent, which the answer does not state. The first part of the question is not answered in its own terms: the answer does not say whether the list is kept per file, though a list stored in a document's `.adp` file would be a list for that document. Nor does it say which other aspects the rule covers beyond the two it names.

- **Which parts of the Knowledge designer's styling are meant: its look only, or also its views, tabs, bar and gestures?** (answered 2026-10-12)

  > its looks only

  So "similarly styled as the knowledge designer" is about appearance: the Hierarchical Requirement Designer looks like the Knowledge designer, and the idea does not take over the Knowledge designer's views, tabs, bar or gestures by that sentence. What the designer has in their place is therefore not settled by the styling; it is left to the other points of the idea (the form based structure, the filtering, the quick ways to add) and to the unknowns that belong to them. The answer does not say what the looks comprise (colours, typography, spacing, the shape of rows and fields, the way tags are drawn), or how they apply to parts the Knowledge designer does not have, such as a hierarchy level, a requirement's number or an assessment.

- **Is the hierarchy free-form, or are its top levels (UI, integration, backend, data, processes) predefined? Is there a maximum depth?** (answered 2026-10-13)

  > The hierarchy is free-form, but is initially populated with a lightweight structure that resembles a common, generic web application

  So the hierarchy is free-form: no level of it is predefined in the sense of being fixed, the top levels included. It does not start empty, though: it is initially populated with a lightweight structure that resembles a common, generic web application. The two halves are read together here as a starting point that the user is free to change, since a structure the user could not rename, move or remove would not leave the hierarchy free-form; the answer does not say this in so many words. Nor does it say what that structure holds: whether its levels are the five the idea names (UI, integration, backend, data, processes) or others, how deep "lightweight" goes, and whether it comes with hierarchy levels only or with requirements too. "Initially" is not placed: the answer does not say whether every new document starts with the structure or whether the user can start with an empty one, and it names one structure only, that of a web application, without saying what an application of another kind starts with. The second half of the question is not answered: the answer does not say whether there is a maximum depth.

- **Can an assessment be attached to a hierarchy element, or to the file as a whole, and not only to a requirement?** (answered 2026-10-13)

  > To requirements, and in so it also applies to a hierarchy element.

  So an assessment is attached to a requirement, as the idea already had it ("presented in the designer per requirement"), and to nothing else in its own right. "In so" is read here as "in doing so": an assessment that is attached to a requirement thereby also applies to the hierarchy element that requirement belongs to, so a hierarchy element has assessments through its requirements and not by an attachment of its own. The answer does not say this in so many words, and it can also be read as allowing an assessment to be attached to a hierarchy element directly; which of the two is meant is open. On the reading taken here, the answer does not say how far "applies" reaches: to the hierarchy element the requirement stands directly under only, or to every level above it too, and whether the designer shows those assessments at the hierarchy element or only at the requirement. The third part of the question is not answered: the answer names requirements and hierarchy elements and does not speak of the file as a whole, which leaves an assessment that concerns no single requirement (a remark on the hierarchy itself, a question about a level that has no requirements yet) without a stated place.

- **Its origin identifier and file extension, and whether "Hierarchical Requirement Designer" is the name users see or a working title** (answered 2026-10-13)

  > yes

  The question had three parts and the answer is one word. It cannot answer the first two, which ask for an identifier and an extension and not for a yes or a no. It is read here as answering the third, which offered two alternatives, and as affirming the first of them, as the earlier "yes it is" was read: "Hierarchical Requirement Designer" is the name users see, and not a working title. That agrees with the idea, which gives it as the "designer tool name". The answer does not say this in so many words, and a "yes" to a question of the form "this or that" can also be a confirmation that the question is a fair one to ask; the reading taken here is the one the idea supports. Nor does it say where users see the name (the list a user picks a tool type from, the title of an open document, the documentation), or whether it is shown in full everywhere or shortened where room is tight. The first two parts are not answered: the answer names no origin identifier, where the one existing designer type is `etalii/knowledge`, and no file extension, where the document is a Markdown file and the answer does not say whether it is a plain `.md` or carries an extension of its own that tells it from any other Markdown file.

- **How is a requirement identified?** (a change to the idea the maintainer made on 2026-10-13, after the research, and not an answer to a question put to them)

  > Change the way how a requirement is identified in the idea:
  > a requirement is identified using REQ-000x, and never changes. This means that even when a requirement is moved to another item (for example using a drag and drop) the identity still stays the same.

  So a requirement's prefix is `REQ-000x`, and no longer `REQ-x.y.z`: `REQ-` followed by one number, written as a hierarchy level's `ITEM-000x` is. This replaces the shape given in the clarification on what tells a hierarchy level from a requirement, and with it the question of what `x`, `y` and `z` stand for falls away. The number is still the requirement's identity, as the clarification on that says, and it never changes once given: not when the requirement is moved to another hierarchy level, for which the answer again names drag and drop as one way. The number therefore says nothing about where the requirement stands in the hierarchy, and a link from another requirement or an assessment that names it keeps pointing at the same requirement after a move. "Never changes" is read here as covering every other change too (requirements added before it, a hierarchy level above it moved or removed, its text or category changed), since the answer gives the move as an example ("even when") and not as the only case; the answer does not list them. The research (`research.md`, 2026-10-13) recorded that a place-shaped number as identity breaks references whenever the hierarchy is reorganised; the answer does not name that as its reason.

  The answer does not say how `x` is given: "incremented" is said of `ITEM-000x` only, and the same counting up is read here from the same notation. Nor does it say how many digits the number has and what happens past the last number that fits, whether the count is kept per file, whether requirements and hierarchy levels are counted separately (the two prefixes suggest they are), whether the number of a deleted requirement is given out again, or what happens to a link or an assessment that names a deleted requirement. With the place gone from the number, the idea's "requirements are automagically numbered" is read as the designer giving a new requirement the next number; the answer does not say what the designer does with a requirement an agent or a user wrote as text without a number, or with a number of their own choosing.

## First-Glance Unknowns

- [NEEDS CLARIFICATION: how a Markdown file can be a designer's own document, given that DED documents begin with DED's envelope (`ded`, `designer`) and are YAML, JSON or XML today: where the envelope goes in Markdown, or what takes its place]
- [NEEDS CLARIFICATION: what the file interaction patterns and principles in use in `etalii.adp.ide.standalone` are, beyond detecting which part of a changed file changed, and what they say about prose the structure has no place for and about what the designer still shows while the file is in error]
- [NEEDS CLARIFICATION: how a requirement's category is written in the Markdown, given that a requirement's bullet begins with a `REQ-000x` prefix]
- [NEEDS CLARIFICATION: how the `ITEM-000x` prefix is set off from the hierarchy level's name, and whether the designer or the writer of the text puts it there]
- [NEEDS CLARIFICATION: how the `ITEM-000x` number runs: how many digits it has and what happens past the last number that fits, whether the count is kept per file, and whether the number of a deleted hierarchy level is given out again]
- [NEEDS CLARIFICATION: what refers to a hierarchy level by its `ITEM-000x` number (links, assessments, filters on hierarchy elements)]
- [NEEDS CLARIFICATION: whether prose outside the bullets (a title, headings, an introduction, paragraphs between bullets) is allowed, and whether a requirement's text can run over several lines or paragraphs within its bullet]
- [NEEDS CLARIFICATION: how the `REQ-000x` prefix is set off from the requirement's text, and whether the designer or the writer of the text puts it there: what the designer does with a requirement that an agent or a user wrote as text without a number, or with a number of their own choosing]
- [NEEDS CLARIFICATION: what a tag's anchor looks like and points at: its link text, whether `#tag` resolves to anything in the file, and how the tags at the end of a requirement's text are told from a link inside that text]
- [NEEDS CLARIFICATION: how the distinct part of the file for assessments is written when everything is nested bullets: as bullets too, and how it is set apart from the hierarchy]
- [NEEDS CLARIFICATION: how the `REQ-000x` number runs: whether it is counted up as `ITEM-000x` is, how many digits it has and what happens past the last number that fits, whether the count is kept per file and apart from the count of hierarchy levels, and whether the number of a deleted requirement is given out again]
- [NEEDS CLARIFICATION: the full list of default requirement categories behind "functional, technical, non-functional etc.", and whether a user can add, rename or remove categories]
- [NEEDS CLARIFICATION: is there a maximum depth to the hierarchy?]
- [NEEDS CLARIFICATION: what the lightweight structure a hierarchy is initially populated with holds: which levels (the five the idea names, UI, integration, backend, data and processes, or others), how deep it goes, and whether it comes with hierarchy levels only or with requirements too]
- [NEEDS CLARIFICATION: whether every new document starts with that structure or the user can start with an empty hierarchy, whether the user can rename, move and remove its levels as any other, and what an application that is not a web application starts with]
- [NEEDS CLARIFICATION: do tags apply to requirements only, or to hierarchy elements too?]
- [NEEDS CLARIFICATION: what "resolves to a tag" means for a partial or differently cased match, and whether that is taken from Notion's selection property as the rest of the tag list's behaviour is]
- [NEEDS CLARIFICATION: whether "tags" stored in the `.adp` file means the managed tag list only, with a requirement still carrying its tags as anchors at the end of its text in the Markdown, or the tags of each requirement too]
- [NEEDS CLARIFICATION: whether the `.adp` file meant is the document's registration file beside the Markdown file, which would make the managed tag list a list per document, or a file shared by several documents, and what form the tag list and its colours take in it]
- [NEEDS CLARIFICATION: whether the order of the managed tag list counts as not relevant for an agent and is stored in the `.adp` file as the colours are]
- [NEEDS CLARIFICATION: which other aspects are "not relevant for an AI to read the markdown" and so belong in the `.adp` file, beyond tags and colours (stored filters, the state of the form, anything about assessments), and who decides that for an aspect the answer does not name]
- [NEEDS CLARIFICATION: what an agent that adds or changes a tag in the Markdown as text has to do about the `.adp` file, and what the designer does with a tag in the Markdown that the `.adp` file does not list]
- [NEEDS CLARIFICATION: what renaming or deleting a tag in the managed list does to the anchors of the requirements that carry it]
- [NEEDS CLARIFICATION: the wildcard syntax for filtering on hierarchy elements, and whether filters are stored in the file as the Knowledge designer's views are]
- [NEEDS CLARIFICATION: what "form based structure based on the hierarchy" looks like: what is shown beside or instead of a tree, and what one form holds]
- [NEEDS CLARIFICATION: who writes assessments (agents, users, or both), what kinds exist beyond "questions, remarks, warnings", and whether an assessment can be answered, resolved or dismissed]
- [NEEDS CLARIFICATION: how an assessment in its distinct part of the file refers to its requirement, and what happens to it when that requirement is deleted]
- [NEEDS CLARIFICATION: whether an assessment "also applies to a hierarchy element" only through the requirement it is attached to, or can be attached to a hierarchy element directly, and where an assessment goes that concerns a hierarchy element without requirements]
- [NEEDS CLARIFICATION: how far an assessment on a requirement reaches up the hierarchy (the hierarchy element the requirement stands directly under, or every level above it too), and whether the designer shows it at those hierarchy elements or only at the requirement]
- [NEEDS CLARIFICATION: can an assessment be attached to the file as a whole?]
- [NEEDS CLARIFICATION: what the "quick ways" to add hierarchy elements and requirements are: keyboard, inline entry, or something else]
- [NEEDS CLARIFICATION: what the looks taken from the Knowledge designer comprise (colours, typography, spacing, the shape of rows and fields, the way tags are drawn), and how they apply to parts the Knowledge designer does not have, such as a hierarchy level, a requirement's number or an assessment]
- [NEEDS CLARIFICATION: its origin identifier, given that the one existing designer type is `etalii/knowledge`]
- [NEEDS CLARIFICATION: its file extension: a plain `.md`, or an extension of its own that tells its document from any other Markdown file]
- [NEEDS CLARIFICATION: how it relates to existing requirement files that agents already use, such as Spec Kit's `spec.md` or spec-workflow's requirements: read those, replace those, or stay separate]
- [NEEDS CLARIFICATION: can a requirement refer to elements of other tools (a diagram element, a knowledge row), and not only to other requirements?]
- [NEEDS CLARIFICATION: how the link that refers to another requirement is written, given that it refers to that requirement by its number: its target and its link text, whether it can point at a requirement in another file, and what happens to it when that requirement is deleted]
- [NEEDS CLARIFICATION: is a reference a plain link inside a requirement's text, or a relation with a kind (depends on, refines, conflicts with) that the designer also shows from the requirement referred to?]
