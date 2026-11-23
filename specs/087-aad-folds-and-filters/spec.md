# Feature Specification: Folded Groups, the Archive Switch and Unknown Values in a Description

**Feature Branch**: `features/087-aad-folds-and-filters`

**Created**: 2026-11-23

**Status**: Draft

**Input**: Peter's choice of 2026-11-23 on a decision card of spec 035, T132 ("Agent activity: the gaps DISL and ATD don't cover", the recommended option "Write a spec"): what the agent activity diagram's description cannot say today, so that its case can be held to its module as the other descriptions are. Specification only; the plan and the tasks follow Peter's approval.

## Context

Spec 035 gave the agent activity diagram a description and one conformance case, `two-projects`, of 31 steps, recorded from its module. With the desktop host's view data kept in the body (DISL 11.6, `persistence.view.bind`), its tiered force layout (DISL 10.4), and the description's own sentences for a connect it refuses, the case's bytes and findings match the module through step 15. Four things remain that neither the description nor ATD can say:

1. **A card's height follows its folded groups.** The module draws a specification or a location as its base height plus 18 for each row and 22 for each group heading it shows; a folded group shows its heading only. DISL 6.9 says a node's height follows its compartments' drawn headings and items, and leaves the numbers to the runtime. The description cannot state them: CEL has no member that says whether a compartment group of a node is folded, its stored state or else its default (DISL 6.9, "Collapse defaults and stored states"). Every position follows from the cards' sizes, so every drawing differs once one card does.
2. **A case folds a group by its heading.** The case's steps 16, 17 and 31 select `s-module#progressing` and `s-module#pending`, the module's id for a group heading, and run `collapse-group` and `expand-group`. ATD §2.3 gives a step no way to name a heading, nor says what gesture of the description those are.
3. **The archive switch is the module's view element.** Steps 18 and 27 select `diagram view`, the element the module sends for the diagram as a whole, and run `show-archived` and `hide-archived`. The description has the switch as a canvas filter (`archived`, DISL 6.13.1) kept in the file (`view.bind.filters`); ATD §2.3 does not say that a case's gesture on the module's view element is the description's filter.
4. **A value that is no value of an enum.** Step 3 sets a specification's status to `Paused`, which the module refuses with "'Paused' is not one of the values this can have." A form row the runtime generates refuses it with the runtime's own sentence (DISL 7.5), and DISL gives a description no standard message to word it.

### What this feature is not

- **Not a change to the case.** The case is the reference; the description and the language move.
- **Not the module's painting.** A heading's font, a row's link symbol and the like stay unchecked, as ATD §2.4 says for any drawing recorded from a module.
- **Not other descriptions.** Their cases must mean what they meant; any that passes still passes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A description sizes a card by what its groups show (Priority: P1)

A tool engineer describes a node whose height is its base height plus its shown rows and headings, as the agent activity module draws a card, and the card is drawn and laid out at that height, folded groups included.

**Why this priority**: every position in the agent activity case follows from the cards' heights.

**Independent Test**: the agent activity case's first reading: `l-definitions` is drawn 104 tall (64, its folder row 18 and its folded pull requests heading 22), as the module draws it.

**Acceptance Scenarios**:

1. **Given** a node with a compartment grouped by an enumeration, **When** a description's expression reads whether one of its groups is folded, **Then** it reads the group's stored state where the view data stores one (DISL 11.6), else the group's default (DISL 6.9).
2. **Given** a group folded or unfolded by a gesture, **When** the node is drawn and laid out again, **Then** its height follows in the same edit.
3. **Given** a node whose size its notation computes, **When** it is laid out by a force layout, **Then** the layout places it at that size.

---

### User Story 2 - A case folds a group by its heading (Priority: P1)

A case recorded from a module names a group heading by the module's id, `<element>#<group key>`, and runs the module's fold or unfold gesture on it. Validation folds or unfolds that group of that element, as activating its heading does (DISL 6.9), and the stored state is written as the description keeps it.

**Why this priority**: three of the case's steps, and what every later step draws.

**Independent Test**: step 16 folds `s-module`'s `progressing` group and writes `view.groups` as the module does.

**Acceptance Scenarios**:

1. **Given** a step selecting `<element>#<key>` with the module's fold gesture, **When** it is replayed, **Then** the group `<key>` of `<element>` is folded, its state stored only while it differs from its default (DISL 6.9).
2. **Given** a heading id that names no group of that element, **When** it is replayed, **Then** the step is refused, as a selection that names nothing is.

---

### User Story 3 - A case's archive switch is the description's filter (Priority: P1)

A case recorded from a module turns a canvas filter on or off through the element the module sends for the diagram as a whole. Validation sets the description's filter, kept in the file as the description says.

**Why this priority**: two of the case's steps, and what every later step shows.

**Independent Test**: step 18 shows archived specifications and writes `showArchived: true` as the module does.

**Acceptance Scenarios**:

1. **Given** a description that names, in its wire-id block, the element the module sends for the diagram and the gestures on it that set a filter, **When** a step runs such a gesture, **Then** the filter takes the value the gesture sets, written as `view.bind.filters` says.
2. **Given** a filter set, **When** the step's drawing is compared, **Then** what the filter hides is not drawn.

---

### User Story 4 - A description words the refusal of a value no option has (Priority: P2)

A tool engineer gives the sentence with which a form row refuses a value that is no value of its enumeration, as the module words it.

**Why this priority**: one step's sentence; the refusal itself already happens.

**Independent Test**: step 3 is refused with "'Paused' is not one of the values this can have.".

**Acceptance Scenarios**:

1. **Given** a description that gives the sentence, **When** a row is given a value that is no value of its enumeration, **Then** it is refused with that sentence, the value bound in it.
2. **Given** a description that gives none, **When** that happens, **Then** it is refused with the runtime's own sentence, as today.

### Edge Cases

- A group whose state is stored equal to its default: it reads as the default, and the next write removes the stored state (DISL 6.9).
- A heading id whose element is gone after an undo: the step is refused as a selection that names nothing.
- A filter turned on that is already on: nothing is written.
- A node with no grouped compartment: the new member reads every group as unfolded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: CEL MUST let a description read, for a node and a compartment group key, whether that group is folded: its stored state where view data stores one, else its default.
- **FR-002**: A node's computed size MUST be the size a layout places it at and the drawing draws it at.
- **FR-003**: ATD §2.3 MUST say how a case recorded from a module names a group heading (`<element>#<key>`), and which gestures on it fold and unfold the group.
- **FR-004**: ATD §2.3 MUST say how a case recorded from a module turns a description's canvas filter on or off through the element the module sends for the diagram, named in the description's wire-id block.
- **FR-005**: DISL MUST let a description give the sentence a form row refuses a value that is no value of its enumeration with, the value bound in it.
- **FR-006**: The agent activity diagram's description MUST use these to state its module's cards, folds, switch and sentence.
- **FR-007**: Every description whose cases passed before MUST still pass, with the same meaning.

### Key Entities

- **Group state**: whether a compartment group of a node is folded: stored view data where it differs from the default, else the default.
- **Heading id**: the id a module gives a group heading in a case, `<element>#<key>`.
- **View element**: the element a module sends for the diagram as a whole, through which a case sets the diagram's filters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The agent activity diagram's case passes in the desktop host, apart from the differences listed by name in its test, each with a reason.
- **SC-002**: Every description that passed `atd validate` before this feature passes it after, natively and through WebAssembly.
- **SC-003**: A tool engineer can state a card height like the module's in one expression of the notation, without host code.

## Assumptions

- The module's numbers (18 per row, 22 per heading) are the description's to state, not the language's.
- The wire-id block that names chrome (ATD §2.3, amendment of 2026-11-23) is the place to name the module's view element too.
