# Feature Specification: FBL Reads a Scalar as Written

**Feature Branch**: `features/015-fbl-scalar-as-written`
**Created**: 2026-10-09
**Status**: Implemented as FBL 0.5 ([plan.md](plan.md), [tasks.md](tasks.md))
**Input**: The first language gap of seven conversion specifications of `etalii.adp.ide.standalone`, which plans with spec-workflow. Each is in that repository at commit `2680f361` under `.spec-workflow/specs/<name>/requirements.md`: `timeline-disl-fbl` (finding B1), `dependency-graph-disl-fbl` (B1, B2), `supply-chain-disl-fbl` (B1, B2), `sankey-disl-fbl` (B1 to B3), `functional-decomposition-graph-disl-fbl` (B1, B2), `databricks-disl-fbl` (B4) and `azure-devops-pipeline-disl-fbl` (B1). The maintainer asked on 2026-10-09 for the work that those specifications wait on to proceed.

## Context

FBL reads a YAML body into entries, and FBL 0.4 section 4.1 presents a YAML scalar to a binding as "a string, int, double, bool or null by the YAML 1.2 core schema". The tools that own a hand-edited YAML format do not read their files that way. They keep **what the author wrote**: a label written `yes` is the label "yes", an id written `007` is the id "007", a version written `1.0` is the text "1.0", and a key written with nothing after it is the empty text. Where they need a number they parse that text themselves, with their own rules: a quoted `"12"` is twelve, `0x10` is not a number.

So the same file gives two different models. Under FBL the label `yes` is a boolean, the id `007` is the number seven, and FBL 0.4 section 7.4 then calls a value "that does not convert to the attribute's type" an unreadable entry, which produces no element. A file that opens today would open with elements missing or renamed.

Fifteen tools of the standalone host are being converted to read and write their bodies through FBL bindings. Seven of them read YAML, and all seven found this, independently. The timeline had found it earlier: its module builds its model from its own reader "because FBL's YAML reading types a plain scalar (`1.0`, `null`, `yes`) while a timeline keeps every value as the text it was written with" (`TimelineDisl.cs`). In each of the seven approved specifications the half that moves reading and writing to the binding **waits on this change**. Nothing else in FBL holds back as much work.

This feature closes that gap in the FBL specification, its schema, its examples and its conformance fixtures. It changes no host; each host's own specification picks the construct up.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A text attribute is the text that was written (Priority: P1)

A tool engineer binds a text attribute (a label, an id, a note, a date kept as text) to a key of a YAML or JSON body, and the attribute's value is exactly the characters the author wrote for that scalar, whatever a YAML reader would type them as.

**Why this priority**: it is the whole of the gap for the timeline, and the larger half for the other six. Without it no hand-edited YAML format can be bound without changing what its files mean.

**Independent Test**: a fixture body holds text attributes written `yes`, `no`, `null`, `~`, `1.0`, `007`, `2026-07-01`, `0x10`, an empty value, and the same values in single and double quotes. Reading it through a binding that declares the attributes as text gives each attribute the written characters (without the quotes of a quoted scalar, with its escapes resolved), and no finding.

**Acceptance Scenarios**:

1. **Given** an entry `label: yes` and a binding whose `label` is bound as text, **When** the body is read, **Then** the attribute is the text "yes" and not a boolean.
2. **Given** an entry `id: 007` whose id is stored in that key, **When** the body is read, **Then** the element's id is "007", a relation that names "007" resolves to it, and one that names "7" does not.
3. **Given** `end:` with nothing after it, **When** the body is read, **Then** the attribute is the empty text and is present, so a rule that asks whether the key is there answers yes.
4. **Given** a text attribute read from `label: 1.0`, **When** another attribute of the same entry is changed and the body saved, **Then** the bytes of `label: 1.0` are unchanged.
5. **Given** a text attribute whose new value is "yes", "1.0" or "null", **When** it is written, **Then** it is written so that reading it back through the same binding gives the same text, in the style section 6.3 would choose, quoted only where the body's own reading would otherwise change it.

---

### User Story 2 - A rule can ask what was written (Priority: P1)

A tool engineer writes a rule's `when`, or a `value` slot, that depends on a scalar, and can ask for the scalar as written beside its typed value.

**Why this priority**: bindings tell entries apart by their content (a timeline's period has an `end`, a moment has none). If the expression sees only the typed value, an empty `end:` and an absent one cannot be told apart, and neither can `"12"` and `12`.

**Independent Test**: a fixture with two rules distinguished by an expression over the written text reads each entry by the right rule.

**Acceptance Scenarios**:

1. **Given** an entry with `end:` empty, **When** a rule asks whether `end` is present, **Then** it is present, and its written text is empty.
2. **Given** a scalar written `"12"` and one written `12`, **When** an expression asks for the written text of each, **Then** both give "12", and it can also learn that the first was quoted.

---

### User Story 3 - A value that does not convert does not cost the element (Priority: P2)

A tool engineer binds a number or a boolean to a key of a file that people, or another tool, also write. When the written value does not convert, the binding says what happens: the element is still read, the attribute takes a declared fallback, the written bytes stay untouched, and the tool can report it.

**Why this priority**: today the hosts read such a value as zero or false and draw the element. FBL 0.4 drops the element. For a file another tool owns (a Databricks bundle with `num_workers: ${var.workers}`) the difference is a cluster or a whole pipeline vanishing from the diagram. It is second because a host can stand in for it in code once User Story 1 exists.

**Independent Test**: a fixture body holds a number attribute written `wide`, one written `${var.workers}` and one written `"12"`. A binding that declares the tolerant reading gives the fallback for the first two and twelve for the third, reads every element, and reports the first two in the way the binding declares.

**Acceptance Scenarios**:

1. **Given** `row: wide` on an entry whose `row` is a number with a declared fallback of 0, **When** the body is read, **Then** the element is read with `row` 0, the bytes `wide` are kept, and the written text is available to the tool type's specification for a finding of its own.
2. **Given** the same entry and a binding that declares no fallback, **When** the body is read, **Then** FBL 0.4's behaviour holds unchanged: the entry is unreadable.
3. **Given** `value: "12"` on a number attribute whose binding says a quoted number reads as a number, **When** the body is read, **Then** the attribute is 12; **and given** the binding does not say so, **Then** FBL 0.4's behaviour holds unchanged.
4. **Given** an attribute read through its fallback, **When** a different attribute of the element is written, **Then** the unconverted bytes are not touched.

---

### Edge Cases

- A block scalar (`|`, `>`): its written text is its content as YAML defines it for that indicator, not the indicator.
- A quoted scalar: the written text is the content, with escapes resolved, without the quotes. That it was quoted, and how, is separately knowable.
- A scalar reached through an alias or a merge key: read as the anchored scalar was written; still read-only, as FBL 0.4 section 4.3 says.
- A flow collection (`[a, 1, yes]`): each member has a written text by the same rule.
- A tagged scalar (`!!str 12`): the tag does not change the written text; whether a tag forces a type for a typed attribute is stated.
- JSON: a string is already its text. A JSON number, `true`, `false` and `null` bound as text read as their literal characters, so one binding serves the YAML and the JSON form of one format.
- The `xml`, `lines` and `blocks` families already read text. This feature states that, and changes nothing there.
- A key that is absent stays absent: `default` applies as in FBL 0.4, and the fallback of User Story 3 is not used.
- An id that is a text which looks like a number in one entry and not in another: ids compare as texts.
- A value the binding's `map` translates: `map` is applied to the written text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: FBL MUST define, for every scalar of the `yaml` and `json` families, its **written text**: the characters the author wrote, without the quotes of a quoted scalar and with its escapes resolved, the content of a block scalar, and the empty text for a key with no value.
- **FR-002**: An attribute binding MUST be able to state that its slot is read as the written text, and FBL MUST state what an attribute reads when its binding does not say: whether an attribute the tool type's specification types as text reads the written text without being asked. The plan settles which; the outcome MUST be that a binding of a text attribute needs no workaround to get the text.
- **FR-003**: An id stored in a slot (FBL section 5.3) and a reference (section 5.7) MUST be read and compared as written text, so that `007` and `7` are different ids.
- **FR-004**: Expressions (FBL section 2.4) MUST be able to read a scalar's written text and whether it was quoted, beside the typed value FBL 0.4 presents, and MUST be able to tell a key with an empty value from an absent key.
- **FR-005**: Writing a text attribute MUST give bytes that read back as the same text through the same binding, and MUST keep the rule of section 6.3 that a replaced value keeps its style when the new value can be written in it.
- **FR-006**: An attribute binding of a number or a boolean MUST be able to declare a **fallback** for a value that is present and does not convert: the element is read, the attribute is the fallback, and the written bytes are kept. Without the declaration FBL 0.4 section 7.4 holds unchanged.
- **FR-007**: A binding MUST be able to declare, per attribute, that a quoted scalar converts (a number written `"12"`), and MUST NOT make it so unasked.
- **FR-008**: The written text of an attribute read through its fallback MUST be available to the tool type's specification, so that a tool can word its own finding ("`wide` is not a row"), and FBL MUST say whether it reports a finding of its own in that case and under which code.
- **FR-009**: Every valid FBL 0.4 document MUST remain valid with the same meaning. Each construct this feature adds is optional, and its absence is the 0.4 behaviour.
- **FR-010**: The feature MUST deliver, together: the prose in `specifications/fbl/FBL-specification.md` as the next minor version with its row in the status section, the constructs in `fbl.schema.json`, at least one example binding that uses them, and conformance fixtures under `specifications/fbl/fixtures/` for each acceptance scenario above, including edits and their undo.
- **FR-011**: Where the tool type's specification language must say something for this to work (how a text attribute's typing meets a binding, how a tool's rule reads the written text of a fallback), the feature MUST name the DISL and DESL sections concerned and deliver their change in the same pull request, or state that none is needed.
- **FR-012**: `specifications/fbl/timeline.fbl` MUST be brought to use the feature, as the example that showed the gap, and MUST read the timeline fixtures of `etalii.adp.ide.standalone` listed in its `timeline-disl-fbl` requirements with every label, id and time as written.

### Key Entities

- **Scalar**: a YAML or JSON value that is not a collection. It has a typed value (FBL 0.4), a written text (this feature), and a style.
- **Attribute binding**: the slot a value is read from and written to, with its options (FBL section 5.2). This feature adds what it reads a scalar as, and what a value that does not convert becomes.
- **Unreadable entry**: an entry a rule matches and cannot read (FBL section 7.4). This feature lets a binding keep such an entry readable for one attribute's sake.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `python .github/scripts/validate-examples.py` passes on the changed specification's examples and on every new fixture, and fails on a planted defect in each (a fixture whose expected text is the typed value).
- **SC-002**: The seven standalone specifications named under *Input* can each write the binding their appendix drafts with no key marked "not FBL": the markers `"as": "text"` in the timeline's, the dependency graph's and the functional decomposition graph's drafts have a valid spelling.
- **SC-003**: A body read and saved without a change through a binding that uses the feature gives no splice and the same bytes, for every new fixture.
- **SC-004**: No existing fixture, example binding or registration under `specifications/fbl/` changes its expected result, except `timeline.fbl` and its fixtures where FR-012 changes them on purpose.
- **SC-005**: A reader of the FBL specification can tell, from one section, what a text attribute, a number attribute and an id read for each of `yes`, `1.0`, `007`, `"12"`, an empty value and an absent key.

## Assumptions

- The hosts read these values through a YAML library that gives a scalar's text, so a host can implement the written text without a second parse. `EtAlii.Adp.Specification.Fbl` in the standalone host keeps each scalar's span today.
- The fallback of User Story 3 is wanted by the dependency graph, Sankey, supply chain and Databricks specifications, each of which reads an unconvertible number as zero today. A host can stand in for it in code once User Story 1 exists, so if the plan finds it contentious it can be split into a feature of its own without holding User Stories 1 and 2 back.
- Two neighbouring gaps the same specifications report are **not** in this feature and get their own: a value that is one scalar or a sequence of scalars (`azure-devops-pipeline-disl-fbl`, gap 5), and one binding type read as several model types by the value of a key (`supply-chain-disl-fbl`, gap 6; `functional-decomposition-graph-disl-fbl`, B3).
- The version this lands as is the next minor after the one current when it merges; FBL was at 0.4 on 2026-10-09.
