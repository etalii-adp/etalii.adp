# Feature Specification: Loose Ends of the Tool Language, FBL and the Hosts

**Feature Branch**: `features/077-loose-ends`

**Created**: 2026-11-05

**Status**: Draft

**Input**: Peter chose on 2026-11-05 ("6a") that the loose ends found while writing specs 066 to 076 and the ATD guide are gathered into one small specification, rather than left in notes or folded into a larger feature.

## Context

Specs 066 to 076 and the ATD guide (`specifications/atd/ATD-guide.md`) each left something small behind: a check that does not run, a sentence of a specification that says one thing where another says the opposite, a construct a host does not write. None was worth a feature of its own, and each is easy to lose. This feature names them, with the evidence for each, so that each can be closed and none is closed by accident.

Every item below was measured on 2026-11-05: etalii.adp at `origin/develop` (`ef04189`), and the desktop host at `origin/develop` (`81c1fdc`), whose `atd` was built in release from that commit and whose vendored copy of etalii.adp is the one that commit holds. All of them still hold; none was dropped.

The items fall into three groups, each a story that can land on its own: the tool language's commands and text (story 1), what FBL says or a host does with a binding (story 2), and what two hosts or a host and a specification disagree on (story 3).

### What this feature is not

- **Not a change to any recorded expected result.** A case or fixture that changes is recorded again, never edited, and only where a requirement below says so.
- **Not a new construct of any language** unless an item cannot be closed without one; such a change is specified with fixtures, as a minor version that keeps every earlier document's meaning.
- **Not the work of specs 074, 075 or 076**, which this feature neither waits on nor changes.

## The items

### Tool language: commands and text (story 1)

| # | What is wrong | Evidence |
|---|---|---|
| T1 | `atd fmt --check` fails on most files of the repository, so the canonical layout is not the layout the repository holds, and the check cannot guard it. | `atd fmt --check definitions specifications/atd` lists 80 of the 131 `.atd` files, 68 of them outside `refused/`. |
| T2 | The formatter's one-line output leaves out the commas between the members of a block whose members were separated by line breaks: `{ kind: linear unit: px }`. It parses, but it is not the canonical layout the guide describes at its line 1030. | Write `x: { kind: linear, unit: px }` of `specifications/atd/mindmap.notation.atd` line 7 over three lines without commas and run `atd fmt`: the line becomes `x: { kind: linear unit: px }`. |
| T3 | `--spec-dir` is read by `tables` alone, so `check` and every other command ignore it, although the usage line offers it to every command and quickstart step 2 of spec 035 relies on it. | `atd --spec-dir /nonexistent check specifications/atd/mindmap.atd` exits 0 with no finding; `etalii.adp.ide.desktop/crates/adp-atd-cli/src/main.rs` line 60 passes `spec_dir` to `tables_command` only. |
| T4 | `atd check` on a part named without its root reports findings about the description as a whole, such as `No element type`, which say nothing true of the part; the guide warns the reader about this rather than the tool saying it. | `mindmap.notation.atd` copied alone into an empty folder: `atd check mindmap.notation.atd` gives three `ATD2002 No element type` and one `ATD2010`; the guide, line 107. |
| T5 | `atd check specifications/atd` checks the refused corpus too, so it fails, where quickstart step 2 of spec 035 expects it to exit 0. | `atd --spec-dir specifications/atd check specifications/atd` exits 1 with 26 findings, every one in `specifications/atd/refused/`; `specs/035-adp-tool-language/quickstart.md`, step 2. |
| T6 | A toolbox tool whose `operation:` names no operation of the description gets no finding. | In a copy of the mind map's description, `operation: addSibling` changed to `operation: noSuchOperation` in `mindmap.notation.atd`: `atd check mindmap.atd` exits 0 with no finding. |
| T7 | `atd record` writes the commit it runs at into every case's `recordedWith`, so recording a tool type again rewrites every case it records, also the cases whose recorded content has not changed. | `etalii.adp.ide.desktop/crates/adp-atd-cli/src/record/mod.rs` lines 113 to 121 and 421; `atd record --check` has to put each case's own `recordedWith` back (`record/check.rs` line 4) to compare at all. |
| T8 | Messages build an article from the kind's name, which gives "A editor's description". | `atd validate definitions/editors/json.atd`: "A editor's description has no runtime yet; diagrams' have." (`crates/adp-atd-validate/src/cases.rs` line 60); `crates/adp-atd-check/src/checks.rs` line 686 builds "A {kind} has no canvas" the same way. |
| T9 | ATD's Appendix C.1 is headed DISL 0.6, where section 1.3 says ATD carries every construct of DISL 0.8, the version of the DISL specification. | `specifications/atd/ATD-specification.md` line 1652 (`### C.1 DISL 0.6`) against line 81. |
| T10 | The Sankey description does not lower to DISL, so it cannot be validated at all. | `atd validate definitions/diagrams/sankey.atd`: "The function 'value' takes 0 arguments, not 2, in 'layout.value(self, 'top')'", and the same for `sourceAt` and `targetAt` (`sankey.notation.atd` lines 139, 203 and 204). |

### FBL: what a binding says and a host does (story 2)

| # | What is wrong | Evidence |
|---|---|---|
| F1 | FBL calls an insert's `skeleton` fixed text, yet the bindings put placeholders in it, and FBL says neither that a skeleton's placeholders are replaced nor how a value that is not plain-safe is written there. The desktop host writes a skeleton's `{key}` unquoted, so a key such as `a: b` gives YAML that reads otherwise. FBL gives a skeleton no JSON form, and the desktop host refuses a JSON insert that has one. | `specifications/fbl/FBL-specification.md` line 691; `databricks.fbl` lines 46, 65 and 112 and `databricks-job.fbl` line 38 use `{key}` in a skeleton; the desktop's `crates/adp-fbl/src/families/yaml/mod.rs` lines 1059 to 1061 render it with `plain`; `families/json.rs` lines 620 to 623 refuse it. |
| F2 | The desktop host does not write an insert's `constant` (FBL 0.8), so its two fixtures are set aside rather than run. | `etalii.adp.ide.desktop/crates/adp-conformance/tests/standalone.rs` lines 200 to 210: `insert-constant-json` and `insert-constant-yaml` in `NOT_SUPPORTED`; `crates/adp-fbl/src/` has no `constant`. |
| F3 | The desktop host loads, without a problem, bindings that FBL section 14.1 step 6 refuses: `items-not-many.fbl` and `split-not-many.fbl`, whose refusal needs the tool type the binding is read for ("checked when the tool type's specification is loaded with the binding, as step 4's types are"), and also `insert-constant-collision.fbl`, `grammar-create-after-unknown.fbl`, `grammar-recover-nested-unknown-terminal.fbl` and `grammar-selected-view-without-views.fbl`. etalii.adp's own validator refuses all six. | Loading each of the 18 vendored `specifications/fbl/refused/*.fbl` with the desktop's `adp_fbl::documents::load_file`: these 6 load with no error, the other 12 are refused. `validate-examples.py` reports all 6 refused, for example "items stands only on a many attribute, and systems/causal-loop-diagram declares 'title' of 'Loop' single-valued". The desktop tests the refusal of 6 of the 18 by name (`standalone.rs` lines 1346 to 1390). |
| F4 | FBL section 9.1's one open body per body and binding, holding one model for each origin it is read for, is not built in the desktop host: it keeps one document per body path whichever tool type opens it, so a second reading of another origin of the same body is given the first reading. Spec 067's T045 added it only "if a case needs it", and none did. | `etalii.adp.ide.desktop/crates/adp-diagram/src/document.rs` lines 961 to 970 return the open document of a body path without looking at the tool; `specs/067-desktop-fbl-bindings/tasks.md` T045. |

### Hosts and specifications that disagree (story 3)

| # | What is wrong | Evidence |
|---|---|---|
| H1 | The capability `layout.rankedBoundaries` names a boundary's node `boundary:<id>` only in the doc of its `boundary` argument, and says nothing of how an edge names an element drawn as a boundary or of an element whose own id begins with `boundary:`. The desktop's runtime fills the gap from its fixtures: an edge's end that names `<id>` is taken to mean `boundary:<id>`. Another host reading the contract cannot arrive at the same ids. | `specifications/atd/capabilities/layout.rankedBoundaries/contract.json` line 19; `etalii.adp.ide.desktop/crates/adp-atd-runtime/src/capabilities/ranked_boundaries.rs` lines 191 to 194 ("as the fixtures record it") and `src/tool.rs` line 623. |
| H2 | The standalone host reports a Databricks file's findings from its own reading, YamlDotNet's, rather than from the reading of the file's binding, so a body that does not parse is reported in the parser's own sentence and line. The desktop lists the three cases where this shows as differences. | etalii.adp.ide.standalone `DatabricksFindings.cs` (the reader's `std.unparseable` with YamlDotNet's own message, lines 32 to 33) and `DatabricksValidator.cs` line 35; spec 069's plan, stage two not built; `etalii.adp.ide.desktop/crates/adp-atd-validate/tests/databricks_wardley.rs` lines 18 to 21 (`unparseable` twice, `unreadable`). |
| H3 | The DISL schema and the hosts' DISL loaders disagree. The schema lets a badge's `visible` be an attribute binding (`BBool`), and the loaders read it as CEL, so `visible: { attribute: inertia }` is "'inertia' is not a variable here". DISL gives a context tool's `candidateLabel` the context element plus `item`, and the loaders refuse `item` there. Both hosts' loaders agree with each other, so the Wardley map's definition and DISL's Databricks job example fail to load in both. | `specifications/disl/disl.schema.json` (`$defs/Badge/properties/visible` is `BBool`); `DISL-specification.md` line 3134; `etalii.adp.ide.desktop/crates/adp-disl/tests/fixtures/standalone-diagnostics.txt` lines 76 to 80 and 111, recorded from the standalone host's loader and matched by the desktop's (`crates/adp-disl/src/loading/walker.rs` line 34 treats every `visible` as CEL). |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The tool language's commands do what they say (Priority: P1)

A tool engineer formats, checks, validates and records descriptions, and each command does what its usage line and the guide say: the canonical layout is the repository's, every option is honoured, a finding is true of what was checked, a missing operation is found, recording again changes only what changed, every message reads correctly and the specification states one DISL version. The Sankey description can be validated.

**Why this priority**: The tool engineer meets these first, while writing a description, and the guide currently works around several of them in its text.

**Independent Test**: Run each command of the table's evidence again; each gives the result its success criterion names. Nothing else of this feature is needed.

**Acceptance Scenarios**:

1. **Given** the repository's `.atd` files, **When** `atd fmt --check` runs over `definitions` and `specifications/atd` outside `refused/`, **Then** it reports no file (T1).
2. **Given** a block whose members are separated by line breaks, **When** the formatter puts it on one line, **Then** its members are separated by commas, and formatting the result again changes nothing (T2).
3. **Given** `--spec-dir` naming a folder, **When** any command that reads ATD's specification runs, **Then** it reads that folder, and a folder that does not hold ATD's specification is reported (T3).
4. **Given** a part named alone, without its root beside it, **When** it is checked, **Then** the result says that the part's root was not found, and it gives no finding that only the whole description could justify (T4).
5. **Given** the folder `specifications/atd`, **When** it is checked as quickstart step 2 of spec 035 says, **Then** it exits 0, and the refused corpus is still checked by `check --corpus` (T5).
6. **Given** a toolbox tool whose `operation:` names no operation the description declares, **When** the description is checked, **Then** one finding names the tool and the missing operation (T6).
7. **Given** a tool type whose recorded content has not changed, **When** its cases are recorded again at another commit, **Then** no case file changes (T7).
8. **Given** any kind of tool, **When** a message names it with an article, **Then** the article fits the word: "An editor's description" (T8).
9. **Given** ATD's specification, **When** a reader compares section 1.3 with Appendix C, **Then** both name the same DISL version (T9).
10. **Given** the Sankey description, **When** `atd validate` runs, **Then** it lowers to DISL and replays its cases (T10).

---

### User Story 2 - FBL says what a skeleton is, and the desktop host does what FBL says (Priority: P2)

A tool engineer writes a binding with a skeleton, a constant or a step 6 construct, and a person opens one body in two readings; FBL states what each does, and the desktop host does it.

**Why this priority**: These are gaps between FBL and the desktop host that no case reaches yet, so they are quiet, but each one either writes bytes FBL does not describe or accepts a binding FBL refuses.

**Independent Test**: The FBL fixtures and refused documents, run by the desktop's conformance tests, with no item of stories 1 or 3.

**Acceptance Scenarios**:

1. **Given** an insert with a skeleton that holds a placeholder, **When** an add gives that placeholder a value that is not plain-safe, **Then** FBL states what is written and the bytes read back as the value given, in YAML; and FBL states what a skeleton means in a JSON body, which the desktop host does (F1).
2. **Given** the fixtures `insert-constant-json` and `insert-constant-yaml`, **When** the desktop's conformance tests run, **Then** both are run and pass, and neither is set aside (F2).
3. **Given** every document of `specifications/fbl/refused/` that the desktop host vendors, **When** it is loaded with the tool type it is read for, **Then** it is refused with a problem that names the check of section 14.1 it fails (F3).
4. **Given** one body read through one binding by two tool types of different origins, **When** a person edits it in one reading, **Then** the other reading shows the edit without a reload, each reading keeps its own model, and an undo in either undoes the body's latest edit (F4).

---

### User Story 3 - Hosts and specifications agree (Priority: P3)

A host author implements `layout.rankedBoundaries` from its contract, the standalone host reports a Databricks file's findings, and a tool engineer writes an attribute-bound `visible` or a `candidateLabel` with `item`; in each case the specification, the schema and every host agree.

**Why this priority**: Each of these needs a decision about which side is right before it can be closed (see Assumptions), and each touches more than one repository.

**Independent Test**: The capability's fixtures run from the contract alone; the Databricks cases validated with no difference listed for the parser's sentence; the vendored definitions loaded with no diagnostic about `visible` or `item`.

**Acceptance Scenarios**:

1. **Given** the contract of `layout.rankedBoundaries` and nothing else, **When** a host lays out a view with boundaries, **Then** the ids of its boundary nodes and the ends of its edges are those the fixtures record, and the contract says what an id that already begins with `boundary:` means (H1).
2. **Given** a Databricks body that does not parse, **When** the standalone host and the desktop host read it, **Then** both report the finding the file's binding gives, and the desktop lists no difference for it (H2).
3. **Given** a badge's `visible` written as an attribute binding, and a context tool's `candidateLabel` that reads `item`, **When** a host loads the definition, **Then** neither is a diagnostic, and the schema, DISL and the loaders say the same (H3).

### Edge Cases

- An item found, while planning or building, to be already closed by other work is reported as closed, with its evidence, and removed from this feature rather than built again.
- An item whose closing would change a recorded expected result is reported to Peter before anything is recorded again.
- A formatter change that would change the meaning of a file is a defect of the formatter, not of the file.
- A refused FBL document that a host refuses at a later stage than loading, such as when a body is opened, still counts as not refused when it is loaded (F3).
- A newer refused FBL document than the desktop host vendors, such as FBL 0.18's `holds-not-bool.fbl`, is covered once it is vendored, by the same requirement.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository's `.atd` files outside `refused/` MUST be in the canonical layout, and the Build MUST hold them to it (T1).
- **FR-002**: The formatter's output MUST separate the members of a one-line block by commas, and formatting its output again MUST change nothing (T2).
- **FR-003**: `--spec-dir` MUST be honoured by every command that reads ATD's specification, or the usage line MUST offer it only where it is (T3).
- **FR-004**: `atd check` on a part without its root MUST say so and MUST NOT report findings that only the whole description can justify (T4).
- **FR-005**: Checking `specifications/atd` as spec 035's quickstart step 2 says MUST exit 0, with the refused corpus still compared by `check --corpus` (T5).
- **FR-006**: A toolbox `operation:` that names no operation of the description MUST be a finding (T6).
- **FR-007**: Recording a case whose recorded content has not changed MUST leave its file byte-identical (T7).
- **FR-008**: No message of `atd` MAY pair "A" with a word that begins with a vowel sound (T8).
- **FR-009**: ATD's specification MUST name one DISL version in section 1.3 and in Appendix C (T9).
- **FR-010**: The Sankey description MUST lower to DISL, so that `atd validate` replays its cases (T10).
- **FR-011**: FBL MUST state whether an insert's skeleton has placeholders, how each is written when its value is not plain-safe, and what a skeleton means in a JSON body; the desktop host MUST write what FBL states (F1).
- **FR-012**: The desktop host MUST write an insert's `constant` as FBL 0.8 states it, and its fixtures MUST be run rather than set aside (F2).
- **FR-013**: The desktop host MUST refuse, when it loads a binding with the tool type it is read for, every vendored document of `specifications/fbl/refused/`, and a desktop test MUST hold every one of them (F3).
- **FR-014**: The desktop host MUST keep one open body per body and binding, with one model per origin it is read for, as FBL section 9.1 states (F4).
- **FR-015**: The contract of `layout.rankedBoundaries` MUST state how a boundary's node is named, how an edge names an element drawn as a boundary, and what an id that already has that form means, so that a host needs only the contract (H1).
- **FR-016**: A Databricks file's findings MUST be the same in the standalone host and the desktop host, as Peter rules (H2).
- **FR-017**: The DISL schema, the DISL specification and the hosts' loaders MUST agree on what `visible` and `candidateLabel` accept, as Peter rules (H3).
- **FR-018**: No recorded expected result MAY change except by being recorded again, and only where a requirement above needs it.
- **FR-019**: Any language change MUST be specified with fixtures in etalii.adp first, as a minor version that keeps every earlier document's meaning.

### Key Entities

- **Item**: one loose end of the tables above, with what is wrong, its evidence and its success criterion; it is closed when its criterion is met, or dropped with evidence that it no longer holds.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `atd fmt --check` over `definitions` and `specifications/atd` outside `refused/` reports 0 files (68 today).
- **SC-002**: The commands of T2 to T6 and T8 give the results their acceptance scenarios name (none does today).
- **SC-003**: Recording every vendored case again at a new commit, with no change to what is recorded, changes 0 files (every recorded case today).
- **SC-004**: `atd validate definitions/diagrams/sankey.atd` replays its cases (it does not lower today).
- **SC-005**: The desktop's conformance tests run `insert-constant-json` and `insert-constant-yaml` and set aside neither (both set aside today).
- **SC-006**: The desktop host refuses all 18 vendored refused FBL documents (12 today).
- **SC-007**: Two readings of one body of different origins share one history and each shows the other's edits without a reload (not built today).
- **SC-008**: The Databricks cases `unparseable` (bundle and job) and `unreadable` (pipeline) pass with no listed difference, or stay listed by Peter's ruling (listed without a ruling today).
- **SC-009**: Every vendored DISL definition loads with no diagnostic about `visible` as an attribute binding or about `item` in `candidateLabel` (six such diagnostics today).
- **SC-010**: Every existing test, conformance case and parity golden of each host stays green.

## Assumptions

- The three stories are independent: any one can be planned, built and merged without the others, and Peter may stop after any of them.
- H2 and H3 each need Peter's word on which side changes before planning: for H2, whether the standalone host reads a Databricks file's findings through its binding, which changes what its module records, or the difference becomes a listed quirk by his ruling; for H3, whether the loaders follow the schema and DISL, or the schema and DISL are narrowed to what the loaders do. Story 3 waits on those rulings; stories 1 and 2 do not.
- F3 covers all six documents the desktop loads, not only the two first noticed, because they fail the same requirement.
- T7's success leaves `recordedWith` naming the commit that recorded the content as it stands, which is still a true provenance.
- The desktop host is the host the tool language's commands are built in; the standalone host is touched only by H2 and H3.
