# Feature Specification: The Post-Incident Review Designer

**Feature Branch**: `claude/project-thread-cj29ch` (a cloud session's branch, in place of `features/086-post-incident-review-designer`)

**Created**: 2026-11-23

**Status**: Draft, awaiting the maintainer's approval before plan and tasks

**Input**: The maintainer, 2026-11-23: "All of them.", answering which of the three leading candidates of the desk research *Service management tools: a ranked shortlist* (23 November 2026) should be specified first. This is candidate 3; candidates 1 and 2 are specs [084](../084-value-stream-map/value-stream-map.spec.md) and [085](../085-openslo-slo-map/openslo-slo-map.spec.md).

## Context

**The problem.** After a significant incident, ITIL's incident and problem management practices call for a review, and reliability engineering calls it a post-incident review or postmortem. Current guidance from cloud providers and the research on learning from incidents agrees on its shape: one shared timeline (from the change that preceded the incident, through detection, engagement and mitigation, to resolution), several contributing factors rather than a single root cause, and actions with owners. In practice a review is a prose document written from a template. The timeline is a list someone typed, the contributing factors are paragraphs, and the actions are bullets nobody follows up. Nothing in it is data: no organisation can see that the same factor contributed to five incidents, and the intervals that matter (time to detect, time to mitigate) are worked out by hand, if at all.

**Human and agent collaboration.** The same guidance separates the mechanical part of a review (assembling the timeline, correlating deployments and configuration changes with the incident window, pulling logs and metrics), which suits automation, from the judgement (what contributed, what to change), which stays with people. This designer gives both a place in one file: an agent writes timeline entries and evidence, and people classify factors and agree actions.

**What this feature delivers.** The definition of a new designer type, the **Post-incident review designer** (`etalii/post-incident-review`), in this repository: its specification, its FBL binding to a Markdown review document, its tool description, its companion document and worked examples. The review stays a Markdown file a person reads without any tool, as the Hierarchical Requirement Designer's documents do (spec [028](../028-hierarchical-requirement-designer/hierarchical-requirement-designer.spec.md)). Building it in a host is a separate feature per host and is not in scope.

**Words.** A **review** is one Markdown document about one incident. Its **summary** says what happened and its **impact** who was affected, how and for how long. A **timeline entry** is a moment with a time, a kind and a text. A **milestone** is one of the entry kinds that mark the incident's phases: trigger, start, detection, engagement, mitigation start, mitigated, resolved. An **interval** is the time between two milestones (time to detect, time to engage, time to mitigate, time to resolve). A **contributing factor** is a condition or action that, combined with others, allowed the incident; it has a **category** from a list the user manages. **Evidence** links an entry or a factor to a log, chart, change or message. An **action** is a change agreed to address one or more factors, with an owner, a due date and a state. Other words are those of [docs/terminology.md](../../docs/terminology.md).

### What this feature is not

- It is not an incident response tool: it is used after the incident, not to page or coordinate during one.
- It does not fetch logs, metrics or changes itself; an agent or a person writes them into the document.
- It does not assign blame: there is no field for a person's fault, and the companion document says why.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read a review as structure (Priority: P1)

An incident manager opens a review an agent drafted. They see the summary and impact, the timeline drawn on a time axis with its milestones marked, the intervals between milestones computed, the contributing factors as cards with their categories and evidence, and the actions with owners and states.

**Why this priority**: this is the gap as stated: the same document, shown as the structure it describes.

**Independent Test**: open a worked example and compare each entry, factor, action and interval with the file and with the hand-calculated values.

**Acceptance Scenarios**:

1. **Given** a review whose milestones are detection at 10:12 and mitigated at 11:02, **When** it is opened, **Then** the timeline shows both and states a time to mitigate of 50 minutes from detection.
2. **Given** a review with entries out of time order in the file, **When** it is shown, **Then** the timeline shows them in time order and the file is not reordered.
3. **Given** a factor linked to two timeline entries and one action, **When** it is selected, **Then** the entries and the action are highlighted.
4. **Given** a review, **When** it is opened as plain text, **Then** it reads as an ordinary Markdown review with headings, lists and a table of actions.

---

### User Story 2 - An agent assembles, a person judges (Priority: P1)

An agent writes timeline entries from deployment records and alert history, with evidence links, and proposes contributing factors marked as proposed. The person accepts, rewords or rejects each proposal, adds factors of their own, and agrees actions. The file records which entries and factors an agent proposed and which a person accepted.

**Why this priority**: it is the division of work the guidance recommends, and the reason the review is a file both can write.

**Independent Test**: have an agent add entries and proposed factors to an open review as text; accept one, reject one and reword one in the designer; read the file.

**Acceptance Scenarios**:

1. **Given** an open review, **When** an agent appends three timeline entries in the file, **Then** the designer shows them without being reopened.
2. **Given** a factor proposed by an agent, **When** the person accepts it, **Then** the file records it as accepted and the rest of the file is unchanged byte for byte.
3. **Given** a factor proposed by an agent, **When** the person rejects it, **Then** it is kept in the file as rejected, not deleted, so the reasoning stays visible.
4. **Given** only the companion document, **When** an agent writes a review, **Then** the designer opens it without a finding.

---

### User Story 3 - Agree actions and follow them (Priority: P2)

The team turns factors into actions, each with an owner, a due date and a state, and sees which factors no action addresses yet.

**Why this priority**: an unowned action is the common failure of reviews, and the link from factor to action is what makes it visible.

**Independent Test**: add actions to a review with four factors, leave one factor without an action, and check the designer's report.

**Acceptance Scenarios**:

1. **Given** a factor no action addresses, **When** the review is shown, **Then** the factor is marked as unaddressed.
2. **Given** an action without an owner or a due date, **When** the review is shown, **Then** a finding stands at the action.
3. **Given** an action, **When** the person sets it to done, **Then** only its state changes in the file.

---

### User Story 4 - Start a review (Priority: P2)

A person creates a new review. It is not empty: it starts with the sections, the milestone kinds, a starting category list for contributing factors and a legend that tells an agent how the file is written.

**Why this priority**: without a good start, every review drifts from the shape the designer reads.

**Independent Test**: create a review, inspect the file, and ask an agent that has never seen the tool to add two entries and a factor.

**Acceptance Scenarios**:

1. **Given** the designer, **When** a person creates a review, **Then** it holds every section, an empty timeline, the starting category list and a legend for agents.
2. **Given** a new review and an agent that has never seen the tool, **When** it adds two entries and a factor, **Then** the designer reads them without a finding.

---

### User Story 5 - Factors across reviews (Priority: P3)

A problem manager opens a folder of reviews and sees how often each factor category contributed, and which reviews share a factor.

**Why this priority**: it is where reviews start to teach the organisation, but each review is useful without it.

**Independent Test**: place five worked reviews in one folder and compare the counts the designer shows with a hand count.

**Acceptance Scenarios**:

1. **Given** a folder of five reviews, **When** the person opens the folder overview, **Then** it lists each category with the number of reviews and factors in it.
2. **Given** two reviews whose factors carry the same category and tag, **When** one factor is selected, **Then** the other review is named.

---

### User Story 6 - A host builds the designer from its definition (Priority: P1)

A developer of a host builds the designer from the definition alone.

**Why this priority**: every host implements the one specification (constitution, principle I).

**Independent Test**: run the example validator and the tool-description checks on the definition and its examples, with one defect planted at a time.

**Acceptance Scenarios**:

1. **Given** the definition, **When** the checks run, **Then** they pass, and each fails on the defect planted for it.

### Edge Cases

- A timeline entry without a time: kept in file order, shown apart from the axis, with a finding.
- Times in different time zones: the review states one zone; an entry in another is converted for display and kept as written.
- A milestone missing (no detection recorded): the intervals that need it are not shown, and a finding names the milestone.
- Two entries claiming the same milestone: a finding at the second.
- A Markdown file that is not a review: the designer does not claim it.
- A bullet the designer cannot follow: kept as written, with a finding, and every other entry stays editable.
- A file that cannot be read as a whole: the last readable content stays on screen, read-only, with one finding, and the file is not written.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001** The definition MUST specify the review's parts: summary, impact, timeline entries, contributing factors, evidence and actions, with the attributes named under *Words*.
- **FR-002** A timeline entry MUST carry a time, a kind (a milestone or an ordinary entry), a text, optional evidence and its author (person or agent).
- **FR-003** The definition MUST state how the intervals between milestones are computed, as expressions a host evaluates.
- **FR-004** A contributing factor MUST carry a text, a category from the document's own category list, optional tags, links to timeline entries and evidence, its author, and a state (proposed, accepted, rejected).
- **FR-005** An action MUST carry a text, the factors it addresses, an owner, a due date and a state, and a factor no accepted action addresses MUST be marked.
- **FR-006** The document MUST be a Markdown file that reads as an ordinary review without a tool, claimed by the designer only when it is marked as a review, as the Hierarchical Requirement Designer's documents are.
- **FR-007** Writing MUST keep every byte the designer did not change, and content it cannot follow MUST be kept as written, with a finding.
- **FR-008** A new review MUST start with every section, the starting category list and a legend for agents; the user MUST be able to change the category list.
- **FR-009** The definition MUST have no field for blame or a person's fault, and the companion document MUST state the blameless intent.
- **FR-010** The folder overview of User Story 5 MUST count factors per category across the reviews in one folder.
- **FR-011** The definition MUST be delivered as each type in `definitions/designers/` is: specification, binding, tool description with trace, companion document, schema and worked examples, named from the origin `etalii/post-incident-review`.
- **FR-012** At least two worked examples MUST be delivered, one with an agent-drafted timeline and proposed factors, and one complete review with actions, each with its intervals computed by hand in the companion document.
- **FR-013** The tool catalogue (`docs/tools.md` in the standalone repository and the Notion "Tools" database) MUST list the designer as *Specified* when this feature's definition merges.

### Key Entities

- **Review**: one Markdown document; holds the summary, the impact, the category list and the parts below.
- **Timeline entry, Milestone**: moments in the incident; milestones bound the intervals.
- **Contributing factor**: a condition or action with a category and a state.
- **Evidence**: a link from an entry or factor to an outside record.
- **Action**: an agreed change addressing factors, with an owner and a state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** The example validator and the tool-description checks pass on the definition and every example, and fail on each planted defect.
- **SC-002** For every worked example, each interval the designer shows equals the hand-calculated value in the companion document.
- **SC-003** An agent given only the companion document writes a review with eight entries and three proposed factors that opens with no finding, in at least four of five attempts.
- **SC-004** After an edit in the designer, every byte of the file outside the edited value is unchanged.
- **SC-005** A reader with no tool reads a worked review as plain Markdown and answers what happened, how long detection took and who owns each action, without error.

## Assumptions

- The origin is `etalii/post-incident-review`, as the Knowledge and Hierarchical Requirement designers are `etalii/*`, since no standard owns the format.
- The binding reuses the Markdown reading FBL already has for spec 028. If the review needs a construct FBL or DESL lacks, the plan records it and this feature delivers it, as spec 028 did.
- The timeline view may reuse what the Timeline diagram's definition states; whether it is drawn by the designer or opens the review in that diagram is the plan's choice.
- The folder overview (User Story 5) is the first part to cut if the plan cannot justify it as a current need (constitution, principle V).
- The first host to build the designer, and its separate specification, are chosen after this specification is approved.
