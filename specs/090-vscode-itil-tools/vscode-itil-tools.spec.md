# Feature Specification: The Three Service Management Tools in VS Code

**Feature Branch**: `features/090-vscode-itil-tools`

**Created**: 2026-11-23

**Status**: Approved 2026-11-23 (Peter, decision card "Approve, then build"); plan and tasks written

**Input**: Peter, 2026-11-23, in the thread that built specs 084, 085 and 086: "proceed with the implementation", then "VS Code please". The three service management tools that those specs defined, the value stream map, the SLO map and the post-incident review designer, are to work in the VS Code host.

## Context

Specs [084](../084-value-stream-map/value-stream-map.spec.md), [085](../085-openslo-slo-map/openslo-slo-map.spec.md) and [086](../086-post-incident-review-designer/post-incident-review-designer.spec.md) wrote three tool types as definitions in etalii.adp, merged on 2026-11-23:

| Tool | Kind | Origin | Files | Definition |
| --- | --- | --- | --- | --- |
| Value stream map | Diagram | `generic/value-stream-map` | `.vsm` (YAML) | `definitions/diagrams/value-stream-map.dis`, `.fbl` (FBL 0.21), `.md` |
| SLO map | Diagram | `openslo/slo` | OpenSLO's own `.yaml` and `.yml` files, or a folder of them | `definitions/diagrams/openslo-slo.dis`, `.fbl` (FBL 0.22), `.md` |
| Post-incident review designer | Designer | `etalii/post-incident-review` | `.md` with the designer's envelope | `definitions/designers/post-incident-review.des` (DESL 0.4), `.fbl` (FBL 0.7), `.md` |

No host builds any of them yet. The standalone host lists them as specified only, so unlike specs 081 and 088 there is no standalone module to match. **The reference is the definition itself**: its companion, its examples and the read and edit fixtures under `specifications/fbl/fixtures/` (`value-stream-map-*`, `openslo-slo-*`, `post-incident-review-*`), which state what a reading yields and what each edit writes, byte for byte.

The VS Code host (`etalii.adp.ide.vscode`) builds every tool type from its definition. It reads DISL 0.4, DESL 0.2 and FBL 0.1 to 0.6 in full, according to its `docs/disl-support.md`. An inventory on 2026-11-23 (VS Code `develop` at `3c17376`, etalii.adp `develop` at `c031e08`) copied the three definitions into VS Code on a scratch tree and opened each example through VS Code's own interpreter. Nothing works yet:

| Rows | What the inventory found | This feature |
| --- | --- | --- |
| V1 | The value stream map loads and claims its examples, but draws no node: the placement expression `depth(self, []) * 230` fails ("no such overload: double + int"). | FR-001, FR-003 |
| V2 | Its functions over the flow, `reachable` and `inCycle`, are not found, so `vsm.unconnected-step` and `vsm.unmarked-cycle` report "could not be evaluated" on every step. | FR-001, FR-004 |
| V3 | Every element is reported by `std.missingId`, although the definition derives its ids. `vsm.missing-wait` names the step as `""`, so the step's name is not read. | FR-001, FR-005 |
| S1 | The SLO map does not load: FBL 0.22 is newer than the 0.8 VS Code's FBL library knows, and CEL's `distinct` is not supported. Without it, no OpenSLO file opens. | FR-006, FR-007 |
| S2 | The SLO map reads every document of a YAML stream (FBL 0.22 `body.stream`) and a folder of OpenSLO files (its `folder` binding); VS Code reads only a stream's first document and opens no folder subject. | FR-006, FR-008 |
| P1 | The post-incident review designer loads and claims its examples, but its surface is `sections` (DESL 0.4) and VS Code lays out `table` and `hierarchy` only, so a review opens empty and read-only. | FR-009, FR-010 |
| P2 | Its `many` attributes (an entry's evidence, a factor's entries and evidence) are read as single strings and reported by `std.unreadableEntry`. | FR-009, FR-011 |
| P3 | Its milestone kinds are not read: every review reports all five milestones missing, and `pir.second-milestone` holds on every entry. | FR-009, FR-011 |

### What this feature is not

- **Not a change to the definitions.** Where VS Code and a definition disagree, the definition is followed. A definition that turns out to be wrong is corrected in etalii.adp, and VS Code takes the newer copy.
- **Not a host for three tool types.** What VS Code lacks of DISL, DESL, FBL or CEL is built once, for every tool type it reads, as its rules require. Code for one tool type is a plugin its definition names, or a row under "Code for one tool type" in VS Code's `docs/disl-support.md`, with its reason.
- **Not the standalone host, nor the other hosts.** They are separate features.
- **Not the cut parts.** The post-incident review's folder overview (spec 086, Phase 10) was cut on 2026-11-23 and stays cut. The post-incident review's ATD tool description, which needs a `sections` surface in ATD, is with the ADP tool language's work.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Write a post-incident review in VS Code (Priority: P1)

A person, or an agent beside them, opens `checkout-latency.md` in VS Code and sees the review as the companion describes it. The summary shows the time zone and four intervals: time to detect, engage, mitigate and resolve. Below it come the impact, the timeline in time order with its milestones on a time strip, the contributing factors grouped by category with their state, and the actions with their owner and due date. The person accepts a proposed factor, adds an action for it, and marks the action done. Each step is one edit of the Markdown file that leaves every other line as it was.

**Why this priority**: The review is the tool of the three that a person and an agent most often write together, and its document is plain Markdown that VS Code users already keep in their repositories.

**Independent Test**: Both examples of spec 086 opened in VS Code give the elements, intervals and findings the `post-incident-review-read` fixture states. The ten steps of the `post-incident-review-edits` fixture, made as VS Code's gestures, write that fixture's bytes.

**Acceptance Scenarios**:

1. **Given** `checkout-latency.md`, **When** it opens, **Then** the summary shows the intervals 7 min, 8 min, 50 min and 1 h 25 min, and the Problems panel shows the findings the read fixture states and no other.
2. **Given** a proposed factor, **When** it is accepted, **Then** its line's `state:proposed` becomes `state:accepted`, it is marked *unaddressed* until an action addresses it, and one undo restores the line.
3. **Given** a factor, **When** "Add action for this factor" is chosen, **Then** an action addressing it is added under `## Actions` with the next number, and *unaddressed* is no longer shown.
4. **Given** lines an agent added with `E-NEW`, **When** the file is next edited in VS Code, **Then** they are numbered with the next free numbers, as the edits fixture states.

---

### User Story 2 - Draw a value stream map in VS Code (Priority: P1)

A person opens `restore-service.vsm` and sees its current and future states. Each state shows the trigger, its steps with their process and wait times and hand-offs, and the outcome. The person sees the lead time, process time and flow efficiency of each state. They add a step, change a wait time and watch the totals follow, and derive a future state from the current one.

**Why this priority**: The value stream map needs the least new to read: one YAML file, through FBL features VS Code mostly has.

**Independent Test**: Both examples of spec 084 opened in VS Code draw every element and give the totals and findings the `value-stream-map-read` fixture states. The steps of `value-stream-map-edits` and `value-stream-map-future` write those fixtures' bytes.

**Acceptance Scenarios**:

1. **Given** `request-fulfilment.vsm`, **When** it opens, **Then** every trigger, step and outcome is drawn at the place the definition's layout gives it, and the totals are shown as the companion's worked example computes them.
2. **Given** a step with no wait time, **When** the map opens, **Then** `vsm.missing-wait` names that step by its name.
3. **Given** a rework loop that is not marked as rework, **When** the map opens, **Then** `vsm.unmarked-cycle` reports it as the definition states, and no finding says that a constraint could not be evaluated.

---

### User Story 3 - See a service's SLOs in VS Code (Priority: P2)

A person opens an OpenSLO file of their repository, or the folder that holds several. They see each service with its SLOs, each SLO's indicator and alert policies, and each objective's target, window and error budget, computed as the companion's worked budgets show. They change a target in ADP Properties, and the OpenSLO file changes in that one value.

**Why this priority**: It needs the most new reading (every document of a YAML stream, and a folder of files), and the files belong to OpenSLO, so `oslo validate` must still accept every file VS Code writes.

**Independent Test**: The read fixtures `openslo-slo-read`, including every `findings-*` case, and `openslo-slo-folder` give their stated elements and findings in VS Code. The steps of `openslo-slo-edits` write their bytes.

**Acceptance Scenarios**:

1. **Given** a YAML stream of a Service, an SLO and an alert policy, **When** it opens, **Then** all three are drawn, joined by the references the companion describes.
2. **Given** an SLO that names a service no document holds, **When** it opens, **Then** `openslo.missing-reference` is reported at the SLO, and a dashed placeholder stands for the missing service.
3. **Given** a YAML file whose first document is not `openslo/v1`, **When** it is opened, **Then** VS Code does not offer the SLO map for it.

### Edge Cases

- A review written before the designer existed, with no envelope: it is not claimed, and stays plain Markdown.
- A review line the binding cannot follow: it is kept as written and reported by `std.unreadableEntry` (the review's `pir.unread`). No edit touches it.
- A value stream map whose step has no name, or whose flow loops back without a rework mark: it opens, and each finding the definition states is reported, none of them "could not be evaluated".
- An OpenSLO file with a `v2alpha` document: it opens read-only with the definition's reason.
- An OpenSLO file with documents of a kind the map does not draw: they are listed and kept as written.
- A file opened read-only: no toolbox and no menu entries that edit.

## Requirements *(mandatory)*

### Functional Requirements

Each requirement names the inventory rows it closes. "As the fixture states" means the read or edit fixture under etalii.adp's `specifications/fbl/fixtures/` named for that tool, at the etalii.adp commit the copy was taken from.

**Every tool**

- **FR-001** (V1 – V3, S1, P1 – P3): Each of the three definitions **MUST** load in VS Code with no finding that a part of it is unsupported or cannot be evaluated, and every expression it holds **MUST** evaluate.
- **FR-002**: VS Code **MUST** hold each tool to the read and edit fixtures of its definition, copied unchanged with their source recorded, in a test that runs in its build. Each fixture's elements and findings **MUST** come out as stated, and each edit step **MUST** write the stated bytes. Any difference **MUST** be listed with its reason in VS Code's parity record.

**The value stream map**

- **FR-003** (V1): Every element **MUST** be drawn where the definition's layout places it, with CEL arithmetic that mixes whole and decimal numbers as CEL's numeric rules give it.
- **FR-004** (V2): The functions the definition declares over the flow **MUST** be evaluated, so that each of its constraints is either reported with its own sentence or does not hold.
- **FR-005** (V3): Elements **MUST** take the ids the definition derives for them, without `std.missingId`, and a finding **MUST** name a step by the name the file gives it.

**The SLO map**

- **FR-006** (S1, S2): VS Code's FBL support **MUST** read FBL up to 0.22 as far as the SLO map's binding uses it. That includes every document of a YAML stream (`body.stream: "documents"`), adding a document after the last with its own `---` line, and removing one with its span.
- **FR-007** (S1): CEL's `distinct` and any other function the SLO map's definition or binding uses **MUST** be available to every tool type.
- **FR-008** (S2): A folder of OpenSLO files **MUST** open as one SLO map through the definition's folder binding, and an edit **MUST** write only the file it concerns.

**The post-incident review designer**

- **FR-009** (P1): VS Code **MUST** read DESL 0.4 and lay out the `sections` surface wherever a definition declares it. That covers a page of record parts and list parts in the definition's order, a list's order, grouping, figures, marks and time strip, and the operations a part offers.
- **FR-010** (P1): A review **MUST** be editable on that page: accepting and rejecting a factor, adding an entry, a factor, an action or an action for a factor, completing an action, and editing any field. Each **MUST** be one edit of the text document and one step of VS Code's undo.
- **FR-011** (P2, P3): Every attribute **MUST** be read as the binding states: a `many` attribute as all its values, a mention as the elements it names, and a mapped value such as a milestone kind as its mapped value.

**Throughout**

- **FR-012**: Every gesture **MUST** leave every byte it does not concern as it was, and a refused gesture **MUST** change nothing and show its reason.
- **FR-013**: VS Code's `docs/tools.md`, `README.md`, `docs/disl-support.md` and `docs/parity.md` **MUST** describe the three tools as built, in the change that builds each. Each tool **MUST** get an example in VS Code's examples and a screenshot.
- **FR-014**: The catalogue **MUST** follow: the VS Code state of each tool in standalone's `docs/tools.md` and the "VS Code" column of its Notion "Tools" page.

### Key Entities

- **Tool type**: one of the three definitions, read by VS Code from its copy in `definitions/<tool>/`.
- **Fixture**: a read or edit case of etalii.adp that states what a host reads from a file and what each edit writes. The reference for this feature.
- **Sections page**: the DESL 0.4 surface of a designer: record parts and list parts, one under the other.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 8 inventory rows are closed: opening the examples of the three tools again in VS Code finds none of them.
- **SC-002**: Every read and edit fixture of the three tools passes in VS Code's build, apart from what VS Code's parity record lists with its reason.
- **SC-003**: Every file VS Code writes for the SLO map is accepted by `oslo validate`.
- **SC-004**: A person new to each tool can go from a new file to a useful document with no error, no dead end and no step that needs the documentation, each in under three minutes. The useful documents are a review with three timeline entries and one factor, a map with three steps, and a service with one SLO. The host test records each attempt.
- **SC-005**: No part of VS Code's shared support built for this feature names a tool type, an element type or an attribute of the three, as VS Code's existing word check holds.

## Assumptions

- The definitions are read as they are in etalii.adp at `c031e08`. A newer copy taken during the work is followed if it changes nothing this feature relies on.
- Where VS Code meets something a definition or a fixture does not state, it follows the companion. Where the companion is silent, it raises an issue in etalii.adp and adds it to "Differences raised and not settled here". It does not settle it in VS Code.
- The work lands in `etalii.adp.ide.vscode` in several pull requests, one tool at a time: the value stream map first (least new), the post-incident review designer next (DESL 0.4 `sections`, wherever a definition declares it), the SLO map last (FBL up to 0.22, YAML streams, folders). Any correction to a definition lands in etalii.adp first.
- The host test, the new-user check and the screenshots are taken on the Mac mini, where VS Code runs.
