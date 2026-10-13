# Concept: A designer over a Markdown file of requirements, for people and agents

- **Slug**: hierarchical-requirement-designer
- **Created**: 2026-10-13
- **Recommended option**: Option B — the designer with the narrowest change to the specifications, entered through Option A's trial
- **Maintainer's choice**: Option C — the idea in full, as captured (2026-10-13; see Maintainer's Choice)

The options below are concepts. Where one names a way of writing something in the file or a place where something is stored, that is a direction for the specification to settle and not a design. Sources are `problem.md`, `research.md` and `intake.md` in this folder; "the description" is the maintainer's description of 2026-10-13 of what the person sees and does (`problem.md`, Resolved, last entry).

Three things are the same in every option, because the maintainer has settled them: the document is a Markdown file of nested bullets that the agent keeps reading and writing as text; a hierarchy level carries `ITEM-000x` and a requirement `REQ-000x`, given once by the tool and never changed; and the first host is the standalone one, after its open work is done. The options differ in how much is built, in how many specifications change, and in what is known before the building starts.

Doing nothing is not listed as an option of its own. It is the baseline every option is weighed against, and `problem.md` records it under Cost of Inaction: the slowness of skimming and searching text stays, nothing breaks, no one is waiting, and the effort goes to tools whose need is evidenced. Buying is not an option either: the research found no tool that presents a requirement hierarchy kept in Markdown as anything but text, on one search (research, Prior Art, Elsewhere; confidence low).

## Options

### Option A — A trial of the file and of the layout, without a tool

- **Sketch**: Nothing is added to a host and no specification changes. The maintainer takes one real subject, outside this repository, and keeps its requirements for a few weeks in the Markdown the idea describes: nested bullets, `ITEM-000x` and `REQ-000x` prefixes, tags as anchors, a part for assessments, and a short legend at the top that tells an agent how the file is written. Agents work on that file as they would on any other; the person reads it in the standalone host's Markdown editor. Beside it stands one static picture of the same content in the layout of the description (boxes on the left, what they contain to the right, titles, tags, the assessment icon), drawn by hand or by an agent from the file, with nothing in it that can be edited. The trial is looked at for three things: how often an agent leaves the file out of its structure or gives a number that clashes, how long it takes to find and judge the requirements of one part in the text and in the picture, and how wide and how long the picture becomes for a subject of real size.
- **Appetite**: small
- **Trade-offs**: It wins the evidence that is missing everywhere in `problem.md`: a baseline for the one confirmed time metric, a count for the candidate metric on agents' changes, a first size of a real document, and a first answer to whether the presentation by hierarchy helps. It costs days, touches nothing every host has to implement, and can run while the standalone host's open work is being done, so the wait the maintainer chose is not lost time. It sacrifices the thing asked for: no one can work in the picture, an agent's change does not show in it until it is drawn again, and the person and the agent still meet in the text. Its result is one person's experience with one subject, the same person who raised the idea, so it informs and does not prove.
- **Rabbit holes**: The static picture growing into a viewer that reads the file, which is Option B begun without its specification. Tuning the file format until agents keep to it, where the trial is meant to find out whether they do. Running it on this repository's own specifications because they are at hand, which the maintainer has placed out of scope.

### Option B — The designer, with the narrowest change to the specifications

- **Sketch**: The Hierarchical Requirement Designer in the standalone host, as the description has it: one document that scrolls from top to bottom, hierarchy levels as boxes with what they contain to their right, a title and an optional description on each level and each requirement, collapsing, tags below the title, the assessment icon at the top right that opens an editable list, and references picked after typing a `#` and shown as a box in the text. A new document is filled with a starting structure of at most two levels and a legend for the agent. The person edits in the boxes; the agent edits the text; each sees what the other changed, and a bullet the designer cannot follow is a finding on that bullet while the rest stays editable, which is FBL's behaviour today. What makes this option narrow is how it sits on the specifications. The file is read and written by a persistence plugin, as the one existing tool over nested Markdown bullets is, so FBL gets no Markdown family. Where the envelope stands in the file is stated in the tool type's own specification, which DED already asks of a designer type whose document is another format, so DED does not change. DESL changes in two places that the tool cannot do without: a second surface kind for boxes that contain boxes, and an identifier that is counted up and kept. The tag list keeps the maintainer's rule, colours and order in the `.adp` file, with the tags a requirement or a level carries written in the Markdown, so that a lost registration loses colours and never a tag. The first version leaves out what the description does not name and no goal depends on: sorting, a state on a requirement, filters that are stored, and the wildcard form of filtering; it narrows by tag, by hierarchy level and by collapsing.
- **Appetite**: large — marked uncertain. Nothing on record says how long the one existing designer took, and this one adds a surface kind that no tool has drawn yet. It is a budget of months and not a count of them.
- **Trade-offs**: It wins every goal in `problem.md`: the requirements by the subject's structure, one place per subject, a number each party can point at, assessments at the requirement, and narrowing. It changes one specification where the idea as captured changed four, which lowers the cost the research raised against the idea and the price the constitution puts on each change. It reuses what exists: the tag behaviour and components of the Knowledge designer, the plugin pattern and the legend of Agent Behavior Modelling, FBL's handling of an edited or unreadable file. It sacrifices a declared binding for the Markdown, which FBL prefers where a format can be declared, and it leaves three wishes on record for later. Its risks are the ones no answer has removed: agents that break the structure or invent numbers, two writers on one file where the host refuses and does not merge ("a lost update a day", research), and a layout whose worth for a person is a conviction until Option A or use shows it.
- **Rabbit holes**: The width. Every level takes room to the right and the hierarchy has no maximum depth, so the layout needs an answer for depth that the description does not give; making one item the left edge of the page for a while is a direction, and it has to be settled before the surface kind is specified, not while it is built. The numbering: when the tool numbers an entry an agent wrote without one, what it does with a number that clashes or was reused, and where the count is remembered so that a deleted number is not given out again. The second surface kind turning into a general layout language, where one layout is needed. The Markdown reading turning into a general Markdown parser, where the existing one is hand-written for one list. Editing a description as rich text with boxes inlined in it, which is an editor inside a designer. The tag list split over two files, and what an agent that adds a tag as text finds in neither.

### Option C — The idea in full, as captured

- **Sketch**: Everything in Option B, and the rest of what is on record. Requirements carry a category from a list the user can change, a state, and can be sorted; filtering takes wildcards on hierarchy levels and filters are kept with the document. Nested Markdown bullets become a family FBL can declare, so that this tool and later ones bind their Markdown and do not each bring a plugin. The registration gets a block of its own for a tool's settings, the tag list among them, with what is collapsed and the stored filters beside it. The person gets the whole of what the maintainer compared the text against: "a hierarchical representation, enriched with tags, state and a visual layout", with filtering and sorting.
- **Appetite**: large — and larger than Option B by all four specification changes, each with its document, schema and examples, and by every host that then has to implement them.
- **Trade-offs**: It wins the complete tool and a Markdown reading other tools can use. It sacrifices the order of evidence: four specifications change for a first user who is the tool engineer, before anyone has worked a day in the layout, and three of the additions (state, sorting, a category list users manage) have no goal or metric in `problem.md` behind them. A Markdown family in FBL is justified by the constitution only by a current tool's need, and one tool that a plugin serves is a thin need for it.
- **Rabbit holes**: The Markdown family, which the FBL specification itself fences off ("FBL is not a general grammar formalism"). A registration block that becomes the place for everything not written in the file, against the two precedents that a tool works the same after its registration is deleted. Every rabbit hole of Option B, with more surface to fall into them from.

## Recommendation

Option B, and Option A before it.

Option B is the smallest option that solves the problem as defined. The problem is that the form that suits the agent is the form that suits the person least, and that there is no one place in which the two discuss the requirements of a subject by its structure. Option A cannot solve that, since nothing in it can be worked in; Option C solves it no better than B, since what C adds serves no goal on record. The confirmed metric, the time a person needs to find and judge the requirements of one part and to see how they fit together, is addressed by the layout, the collapsing and the narrowing, all of which B has. The second confirmed signal, a second user adopting it, needs a tool that exists, which only B and C give.

Option A goes first because of when the work can be done and what is not known. The maintainer has placed the building after the standalone host's open work. A trial that needs no host fits in that wait, costs days, and returns the three things the decision and the specification most lack: a baseline for the time metric, a count of how often agents break the structure, and the size and shape of a real document in the layout. It is recommended as the entry to B and not as a gate the maintainer has to pass: the maintainer has already judged the need to justify the change, and a trial by the same one person cannot overturn that. What it can do is change the specification, the answer for depth above all, before a surface kind is written down that every host must implement.

This recommendation rests on the maintainer's judgement of the need and not on evidence of demand. `problem.md` records one stated want, no second user asked or observed, and no measured cost. If `/speckit-assess-decide` weighs that as too little, Option A alone is the option that fits it: it is the only one whose cost is in proportion to what is known.

## Maintainer's Choice

Shown the three options and the recommendation on 2026-10-13, the maintainer answered "C". The recommendation above is left as it was written, so that `/speckit-assess-decide` sees both; what is carried forward is Option C. The answer is one letter, and is read here as follows:

- *The concept to weigh is the idea in full.* Everything in Option B, with a category list the user can change, a state on a requirement, sorting, wildcard filtering and stored filters, nested Markdown bullets as a family FBL can declare, and a block in the registration for a tool's settings.
- *It agrees with what the maintainer said before.* Asked whether the need justifies changing four specifications, the answer was "yes it does" (`problem.md`, Resolved), and state and sorting are the maintainer's own words for what the text is slow against. Option B set those aside; the choice takes them back in.
- *It is a choice, not evidence.* The objections recorded under Option C stand as findings for `/speckit-assess-decide`: four specifications change before anyone has worked in the layout, and state, sorting and a managed category list have no goal or metric in `problem.md` behind them. The choice says the maintainer accepts that; it adds no user or measurement.
- *It does not take the place of the constitution check.* A Markdown family in FBL and a block in the registration each still have to be justified on the plan as a current tool's need and as the simplest construct that meets it (principle V), and each comes as a document, a schema and worked examples together (principle II).
- *Option A's trial is not run.* The letter did not say whether the trial the recommendation put first still stands, so the maintainer was asked the same day, with the options to run it, not to run it or to decide later, and answered "No trial". So the way from a go leads straight to the specification of Option C, once the standalone host's open work is done. What the trial would have returned is then not known when the specification is written: a baseline for the time metric, a count of how often agents break the structure, and the size and shape of a real document in the layout. The answer for depth in particular has to be found in the specification itself, before the surface kind is written down. These are carried under Assumptions to Validate.

## Out of Scope (for the chosen option)

With Option C chosen, the list of what was newly excluded for the first version falls away except for three entries, which no option takes in: merging the edits of two writers, rich text in a description beyond the reference box, and Option A's trial itself, which the maintainer has decided not to run. The non-goals inherited from `problem.md` stand unchanged. The list as written for the recommended option follows, for the record.

## Out of Scope (for the recommended option)

Inherited from the non-goals of `problem.md`:

- Hosts other than the standalone host.
- Showing how requirements connect, beyond a reference from one to another.
- Taking the text away from the agent.
- The Knowledge designer beyond its looks.
- Getting agents to write less requirement text.
- Spec Kit's `spec.md` and spec-workflow's `requirements.md`: neither read nor replaced.
- References that leave the document: to an element of another tool or to a requirement in another file.

Newly excluded for the first version:

- A Markdown family in FBL; the file is read by a persistence plugin.
- A new block in the `.adp` registration, unless the tag colours and order turn out not to fit in what a registration already allows (see Assumptions).
- A state on a requirement, and sorting.
- Stored filters and wildcard filtering on hierarchy levels.
- A category list that users add to, rename or remove from; the first version has the default categories only.
- Merging the edits of two writers; the host's present behaviour stands, an edit against a changed file is refused.
- Rich text in a description beyond the reference box and what the looks of the Knowledge designer give.
- In Option A's trial: any code in a host, and any requirements of this repository or of the standalone host.

## Assumptions to Validate

Added with the maintainer's choice of Option C:

- With no trial run first, the three assumptions below that Option A was to give a first reading of (that a person is faster in the layout, that agents keep the file within its structure, that a subject of real size and depth stays workable) are validated by the specification and by use of the tool, and not before.
- Nested Markdown bullets can be made a family FBL declares without FBL becoming a general grammar formalism, which its specification rules out, and a second tool is in view that would bind its Markdown through it. With one tool, a plugin serves the need.
- A block in the registration for a tool's settings can be squared with the two precedents that a tool works the same after its registration is deleted: what is lost with the file is colours, order, stored filters and what is collapsed, and never a tag, a state or anything an agent reads.
- A requirement's state and category are written in the Markdown, since an agent reading the file would want both, and each has a way of being written that agents keep to. Which states exist and who sets one is open in `problem.md`.
- The two assumptions below that speak of DED not changing, of a persistence plugin and of the registration as it is belong to Option B and fall away under Option C; the others hold for both.

For the recommended option, as written:

- A person finds and judges the requirements of one part of a subject faster in the layout of the description than in the text. The maintainer holds this; no trial exists. Option A gives a first reading, use of Option B the real one.
- Agents keep the file within its structure often enough, with a legend in the file, that a finding on one bullet is the usual cost of a break and a file that is read-only until repaired is rare. Not measured; Option A counts it.
- A subject of real size stays workable as one document that scrolls from top to bottom, with collapsing, and a hierarchy of real depth fits a layout that grows to the right. No size is on record beyond that of a new document.
- The tool type's own specification can state where DED's envelope stands in a Markdown file, so that DED does not change. Read from DED section 2 as the research cites it; to be confirmed against the specification when the feature is specified.
- A persistence plugin is acceptable for a designer's own document, where the one precedent is a diagram over a file that belongs to its author. FBL says a format it can declare should be bound; nested bullets it cannot declare today.
- Tag colours and order, and what is collapsed, fit in the registration as it is, through what a binding or a plugin may declare there. If they do not, either one block is added to the registration, which is the FBL change this option set out to avoid, or the list goes in the document as the Knowledge designer has it, which is against the maintainer's rule. The maintainer decides which.
- A description can be written as lines under its bullet that are not themselves bullets, as Agent Behavior Modelling writes a node's notes, and the title is the requirement itself and not a short name for it. Both are open in `problem.md`.
- The `#` is the key that calls up the lookup and a reference is written in the file as a link that names the number, so that the anchor stays the sign of a tag. Open in `problem.md`.
- The tool can number an entry that an agent or a user wrote as text on its next reading of the file, and can tell a number that was deleted from one that was never given, without a second writer of the file having to know the count.
- The tag components of the Knowledge designer can be used in a surface that is not a table.
- The standalone host's open work, spec 025-standalone-code-structure among it, ends, and leaves a host on which a second designer can be built without redoing what that work restructures.
- One real subject outside this repository exists that the maintainer will keep this way, for the trial and afterwards. None is on record.
