# Feature Specification: A Generic FBL Implementation for Visual Studio Code

**Feature Branch**: `features/009-vscode-fbl-implementation`

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: "For a generic FBL implementation that can run in VSCode (in the etalii.adp.ide.vscode repo), with simple unit tests to validate that the loading/saving works as expected (at minimum the same FBL unit tests as that have been added to the etalii.adp.ide.standalone repo."

## Context

FBL, the Format Binding Language ([FBL-specification.md](../../specifications/fbl/FBL-specification.md), version 0.1, Working Draft), declares how a tool reads and writes a model that lives in a file another tool owns. A binding says which files it claims, how a body is read into elements, relations and findings, and how every change is written back as minimal splices that leave every other byte alone and can be undone exactly. FBL exists so that this is declared once for all of ADP's hosts instead of coded once in each.

One host implements it today. `etalii.adp.ide.standalone` has an FBL library with 86 tests (read at its `develop`, commit `25fc7b4a`). `etalii.adp.ide.vscode` has none: its two diagrams each read and write their own format by hand, and the only FBL it knows is the first line of the `.adp` registration.

This feature gives the VS Code repository a generic FBL implementation, one that takes any FBL document and any body and holds nothing specific to a tool type, together with the tests that show loading and saving behave as FBL says. It is the second implementation of FBL, in another language than the first, so it is also the first check that two hosts given the same binding and the same body write the same bytes.

**Where the work lands.** This specification, its plan and its tasks live here in `etalii.adp`. The implementation and its tests land in `etalii.adp.ide.vscode`, through a pull request into its `develop`. A change to FBL itself that the work shows to be needed lands here, in `specifications/fbl/`, as its own feature.

**What "the same tests" is measured against.** The 86 tests of standalone's FBL test project at commit `25fc7b4a`, by area:

| Area | Tests | What they check |
| --- | --- | --- |
| Body text | 6 | Byte-order mark, line endings, lines and columns, invalid UTF-8 |
| Loading | 9 | Loading an FBL document, and refusing a broken one at the place of its cause |
| Expressions | 5 | The regular expression and CEL subsets FBL allows |
| Reading | 11 | Reading a body by rules into elements, relations and findings |
| History | 5 | Undo, redo, drift, reload and saving |
| Registration | 9 | Reading and writing the `.adp` registration |
| Routing | 9 | Which binding claims a file or folder |
| Templates | 5 | Producing a new body from a template |
| Plugins | 5 | The host's side of a plugin-read binding |
| YAML scalars | 4 | How new YAML text is quoted |
| Round-trip fixtures | 3 | The eight fixtures FBL publishes, step by step |
| Real files: declared bodies | 7 | Read, save, edit and undo over real files |
| Real files: registrations | 7 | Real `.adp` files parsed, saved and resolved |
| Real files: module cross-check | 1 | A binding reads the ids a standalone module's own parser reads |

Three roles appear below. A **contributor** is a person or agent who changes the plug-in. A **tool engineer** writes FBL documents. A **user** works on files in Visual Studio Code. No user sees anything of this feature yet; it is what a later tool is built on.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Loading and saving are proven by the shared fixtures (Priority: P1)

A contributor runs the repository's unit tests. For each round-trip fixture FBL publishes, the implementation loads the fixture's binding, reads the input body, and walks the fixture's steps: a save without an edit, edits, undos and redos. Reading gives the elements and findings the fixture lists, and every step produces exactly the splices and exactly the document the fixture expects, byte for byte.

**Why this priority**: the fixtures are FBL's own definition of a host that reads and writes correctly (FBL section 15.3), and they cover loading and saving in one pass. A host that passes them writes the bytes standalone writes. This story alone is a usable result: an implementation proven on eight end-to-end paths.

**Independent Test**: with only the bindings, fixtures and registrations copied from `specifications/fbl/`, run the fixture tests. All eight pass, and a deliberate fault (for example writing LF where the body has CRLF) makes at least one fail.

**Acceptance Scenarios**:

1. **Given** a fixture whose step is a save without an edit, **When** the body is read and saved, **Then** the bytes written are the bytes read, including a byte-order mark, the line endings and a missing final newline.
2. **Given** a fixture step that adds, sets, removes or places something, **When** the edit is planned, **Then** its splices are the fixture's, with the same operation names, byte offsets and text, and the document after it is the fixture's.
3. **Given** a fixture step that undoes or redoes, **When** it is applied, **Then** the document is the one the fixture expects, and after every edit of a fixture is undone the input is restored exactly.
4. **Given** a fixture step marked as refused, **When** the edit is asked for, **Then** it is refused with the fixture's reason and nothing is written.
5. **Given** the folder of fixtures, **When** the tests start, **Then** they find all of them, and fail rather than pass when they find none.

---

### User Story 2 - Every check standalone has, this host has (Priority: P1)

A contributor compares what this host tests with what standalone tests. Each of the 86 baseline tests has a counterpart here that checks the same behaviour with the same inputs and the same expected results, or is listed as not applicable with its reason. The counterparts cover the rules one at a time, including those no fixture reaches: a duplicate key in an FBL document, a body outside the workspace, a redo after the file changed.

**Why this priority**: it is the stated minimum of the request. The fixtures prove eight paths end to end; these tests prove each rule separately, so a fault is found at the rule that has it.

**Independent Test**: for every baseline test, name its counterpart here or the reason it does not apply, then run them. All pass.

**Acceptance Scenarios**:

1. **Given** an FBL document with a duplicate key, an unsupported major version, a name that resolves to nothing or a failed rule check, **When** it is loaded, **Then** it is refused with a problem at the location of its cause, every problem is reported and not only the first, and a newer minor version loads with a warning.
2. **Given** a body with a byte-order mark, mixed line endings, a lone CR or an invalid UTF-8 sequence, **When** it is read, **Then** its lines, columns and dominant line ending are what FBL section 2.6 says, and the invalid sequence is reported with its offset.
3. **Given** a regular expression or CEL expression outside FBL's subsets, **When** the document is loaded, **Then** it is rejected by the name of the construct; one inside the subset is accepted and evaluates to the expected value.
4. **Given** a body with an entry without an id, two equal ids, an entry a rule matches but cannot read, or a missing required header, **When** it is read, **Then** the model and the findings are those the baseline tests expect, and reading does not fail.
5. **Given** an edit that was undone, **When** the body's bytes changed in between, **Then** redo is refused and writes nothing; a reload clears the history; an unreadable body is never saved.
6. **Given** a registration, **When** it is read, **Then** its body is found as FBL section 8.2 says, a body outside the workspace or reached through a link is refused, and its layout is read and written by splices.
7. **Given** a file or folder, **When** it is routed, **Then** the candidate bindings and their order are those the baseline tests expect; a template is produced with its placeholders replaced literally.
8. **Given** a plugin-read binding and no plugin, **When** its body is opened, **Then** it opens read-only with a finding that says why.

---

### User Story 3 - The bindings are tried on real files (Priority: P2)

A contributor runs the real-file tests. Every real file in the corpus that a declared binding claims is read, saved without an edit, edited and undone, has an entry removed and restored, and has an undo refused after the file changed from outside. Every real `.adp` registration is parsed and saved unchanged. Where a binding and a real file disagree, the disagreement is recorded with its reason, and the tests fail on one that is not.

**Why this priority**: fixtures are written to pass; real files are where a reader meets what nobody thought of. Standalone's real-file tests are part of the stated minimum. It comes second because the corpus has to be chosen and copied first.

**Independent Test**: add one more real file with an unusual but valid layout to the corpus. The tests pick it up without a change to them and either pass or name the property it breaks.

**Acceptance Scenarios**:

1. **Given** the real-file corpus, **When** the tests enumerate it, **Then** each declared binding finds at least the number of files recorded for it, so that a broken enumeration fails instead of passing on nothing.
2. **Given** a real file a declared binding claims, **When** it is read and saved without an edit, **Then** the bytes written are the bytes read.
3. **Given** the same file, **When** an attribute is set and the edit undone, and when an entry is removed and the removal undone, **Then** only the bytes inside the edit's splices changed, and the undo restores the file exactly.
4. **Given** the same file edited, **When** its bytes are changed from outside and undo is asked for, **Then** the undo is refused and nothing is written.
5. **Given** a real file a binding reads differently from what is expected, **When** the tests run, **Then** they pass only if that disagreement is recorded with its reason, and fail on a recorded one that no longer occurs.

---

### User Story 4 - It runs inside Visual Studio Code (Priority: P3)

A contributor installs the packaged plug-in in a clean Visual Studio Code, with nothing else installed and no network. A test running in that editor loads an example binding, reads a fixture's body, saves it unchanged, makes an edit and undoes it, and finds the bytes it expects each time.

**Why this priority**: the request is for an implementation "that can run in VSCode". Tests that run beside the editor show the logic is right; this shows it is in the plug-in and works there. It is last because it adds no behaviour, only the proof of where it runs.

**Independent Test**: build the plug-in file, install it in a Visual Studio Code that has no other extension, and run the in-editor test with the network off. It passes.

**Acceptance Scenarios**:

1. **Given** the packaged plug-in, **When** it is inspected, **Then** the FBL implementation is part of it and needs no runtime, service or download beyond the plug-in itself.
2. **Given** a real Visual Studio Code running the packaged plug-in, **When** the in-editor test walks one fixture, **Then** every step gives the fixture's document.
3. **Given** the plug-in with the FBL implementation in it, **When** a user opens a file of one of the two existing diagrams, **Then** the diagram behaves exactly as before this feature.

---

### Edge Cases

- A body with mixed line endings: the implementation works on the body's bytes and keeps each line's own ending. It must not normalise anything, even though Visual Studio Code's own text document keeps one ending per file; reconciling the two belongs to the feature that first connects a tool to FBL.
- A body that is not valid UTF-8, or not well-formed at its top level: it opens as unreadable with one finding, and is never saved.
- A body over the size limit, or with more entries than the limit: reported as unreadable, not read in part.
- A regular expression that would run for a very long time on a hostile line: bounded, and reported as a finding instead of hanging the editor.
- A registration whose body is outside the workspace, or reached through a symbolic link: refused, neither read nor written.
- A binding for a format family or a plugin this host does not support: its documents open read-only with the reason.
- A fixture or binding copied from `specifications/fbl/` whose line endings were converted on checkout: the byte offsets no longer fit. The repository must keep these files from conversion, and a test must notice a converted copy.
- A baseline test that depends on something only standalone has (a module with a parser of its own to compare with, or files only that repository holds): listed as not applicable with its reason, never silently left out.
- A test that cannot run on a contributor's machine (for example one that needs symbolic links where the system refuses them): reported as skipped with its reason, never as passed.
- Two hosts that produce different bytes for the same fixture step: at least one is wrong or FBL is ambiguous. The question goes to `specifications/fbl/`; neither host settles it alone.

## Requirements *(mandatory)*

### Functional Requirements

#### The implementation and its place

- **FR-001**: `etalii.adp.ide.vscode` MUST gain one FBL implementation that is generic: it takes any FBL document and any body, and contains nothing that names or serves a particular tool type or one of the example bindings.
- **FR-002**: The implementation MUST be part of the installable plug-in and MUST work there with nothing else installed or running and with no network access.
- **FR-003**: The implementation MUST be usable without Visual Studio Code, so that every test of User Stories 1 to 3 runs without the editor.
- **FR-004**: This feature MUST NOT connect the implementation to any tool, editor, command or setting of the plug-in, and MUST NOT change how the two existing diagrams read, write or behave.

#### What it implements

- **FR-005**: The implementation MUST conform to FBL 0.1 as a *Host, declared* (FBL section 15.1) for all five format families: `yaml`, `json`, `xml`, `lines` and `blocks`.
- **FR-006**: It MUST load an FBL document as FBL section 14.1 says, steps 1, 2, 4, 5 and 6, and report every problem with its location, severity and message.
- **FR-007**: It MUST read a body through a declared binding into elements, relations, attribute values, source positions and findings, tolerantly (FBL sections 4, 5 and 7.4), and MUST treat an unreadable body as FBL section 7.5 says.
- **FR-008**: It MUST plan every edit as the splices of FBL section 6, with new text following the body's own conventions, and MUST save a body without an edit as the bytes that were read.
- **FR-009**: It MUST keep a history for each open body with exact undo and redo, and MUST refuse an undo or redo on drift without writing (FBL sections 7.1 and 7.2).
- **FR-010**: It MUST read and write the `.adp` registration, with its layout, identities and legacy sidecars, by the same splice rules (FBL section 8).
- **FR-011**: It MUST route a file or folder to its candidate bindings and produce a new body from a template (FBL sections 10.1, 12 and 13).
- **FR-012**: For a plugin-read binding it MUST do the host's part of the contract (FBL sections 11.1 to 11.3): open read-only with a finding when the plugin is missing, and apply, record and undo the splices a plugin plans. It need not contain any plugin.
- **FR-013**: It MUST apply the limits of FBL section 16: a bounded match time for regular expressions, limits on body size and entry count, paths resolved within the workspace without following links, and templates never evaluated.
- **FR-014**: For the same binding, body and edit it MUST produce the bytes every other conforming host produces. Where FBL leaves that open, the question MUST be raised as a change to `specifications/fbl/` and MUST NOT be settled in this host.

#### The tests

- **FR-015**: The repository MUST hold a copy of FBL's example bindings, round-trip fixtures and example registrations, unchanged, with the `etalii.adp` commit they were copied from recorded beside them, kept from line-ending conversion, and never edited there.
- **FR-016**: Every copied fixture MUST be run as FBL section 15.3 defines passing: the reading it lists, then every step's splices and document. The test that finds the fixtures MUST fail when it finds none.
- **FR-017**: Every baseline test MUST have a counterpart that checks the same behaviour with the same inputs and expected results, named so that the correspondence can be read off.
- **FR-018**: A baseline test that cannot apply to this host MUST be listed in the repository with its reason. The expected cases are the cross-check of a binding against a standalone module's own parser, and the parts of the real-file tests that name files only standalone has.
- **FR-019**: The real-file properties (reads; saves unchanged; an edit changes only its splices and undoes exactly; a removal likewise; an undo after an outside change is refused) MUST run over a corpus of real files, copied unchanged with their source and licence recorded, that holds at least one real file for each declared example binding, and over every file of the repository itself that such a binding claims.
- **FR-020**: Every real `.adp` registration in the corpus MUST be parsed and saved unchanged by a test, and each enumeration of real files MUST assert a recorded minimum count.
- **FR-021**: A disagreement between a copied binding and a real file MUST be recorded with the file, the property, what was observed and the reason. The tests MUST fail on an unrecorded disagreement and on a recorded one that no longer occurs. A copied binding MUST NOT be edited, a file skipped or an assertion weakened instead.
- **FR-022**: At least one test MUST run in a real Visual Studio Code against the packaged plug-in and walk one fixture through read, save, edit and undo.
- **FR-023**: Every test MUST be written before the behaviour it covers and seen to fail first. A test that cannot run MUST be reported as skipped with its reason.
- **FR-024**: The repository's Build workflow MUST run all of these tests on every pull request and on `develop`, and a failing test MUST fail the build.

#### Reporting back

- **FR-025**: The repository's documentation MUST say that the plug-in carries a generic FBL implementation, which conformance class and families it claims, where the copied corpus comes from, and that no tool uses it yet.
- **FR-026**: Every disagreement recorded under FR-021, and every place where FBL's document was not enough to decide what to write, MUST be reported to `etalii.adp` as a candidate change to the binding or the specification.

### Key Entities

- **FBL document**, **binding**, **body**, **registration**, **reading**, **splice**, **edit**, **finding**: as [docs/terminology.md](../../docs/terminology.md) and the FBL specification define them.
- **Round-trip fixture**: an input body with what reading it yields and a list of steps, each with the splices it must produce and the document it must leave (FBL section 15.3).
- **Conformance corpus**: the bindings, fixtures and registrations copied unchanged from `specifications/fbl/` at a recorded commit.
- **Test baseline**: the 86 tests of standalone's FBL test project at commit `25fc7b4a`, as the table under Context groups them.
- **Real-file corpus**: real files a declared binding claims, copied unchanged with their source recorded, and the repository's own files that such a binding claims.
- **Divergence record**: the list of known disagreements between a copied binding and a real file, each with its reason.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All eight round-trip fixtures pass: every save without an edit is byte-identical to its input, and every step produces the fixture's splices and document.
- **SC-002**: Each of the 86 baseline tests has a passing counterpart or a stated reason it does not apply, and nothing beyond the cases FR-018 names is not applicable.
- **SC-003**: For every real file in the corpus, a save without an edit writes the bytes read, and an edit followed by its undo restores the file byte for byte, or the file is in the divergence record.
- **SC-004**: For every fixture step, this host's splices are identical to standalone's, operation by operation and byte by byte.
- **SC-005**: The packaged plug-in passes the in-editor test in a clean Visual Studio Code with no other extension and no network.
- **SC-006**: The plug-in's existing tests pass unchanged, and nothing a user can see or do differs from before this feature.
- **SC-007**: A contributor runs every test that needs no editor with one command, in no more than twice the time the repository's unit tests take today.
- **SC-008**: Every divergence and every open question found is filed against `etalii.adp` before this feature's pull request is merged.

## Assumptions

- **"Generic" means not tied to a tool type.** The feature stops at the implementation and its tests. Connecting a tool to it, or moving the two existing diagrams onto a binding, is a later feature for each tool, as it is in standalone.
- **The level is FBL's *Host, declared* for all five families**, which is what standalone implements. Folder subjects are covered as far as recognition and file selection. Watching files and sharing one open body between several readings belong to a running host and are left to the feature that needs them.
- **"The same unit tests" means the same checks**, with the same inputs and expected results, written anew for this host. The baseline is standalone's `develop` at `25fc7b4a`. A branch of standalone that is not yet merged holds eight more tests, of how YAML is written; they join the baseline when they reach `develop`, and the baseline is read again at planning.
- **"Simple" means plain unit tests** that run without the editor, beside the plug-in's existing ones. Only the one in-editor test of User Story 4 needs Visual Studio Code.
- **Validating FBL documents against the JSON Schema** (FBL section 14.1 step 3) is not part of this feature, as in standalone: `etalii.adp`'s Build workflow already validates every file the corpus is copied from.
- **DISL stays out**: tool types, derived ids and constraints. The tests supply the ids the fixtures name, as standalone's do.
- **No persistence plugin is implemented**; a test stands in for one where the contract is exercised.
- **The real files** come from standalone's examples and test fixtures, under its Apache-2.0 licence. Which files, and how many beyond one for each declared binding, the plan decides.
- **FBL 0.1 as it stands on `develop` here** is the reference. A newer FBL is taken up by copying the corpus again at a newer commit.
- **Spec 007-vscode-format-binding**, merged on 2026-10-05, specified this same request. This specification is written anew at Peter's choice on 2026-10-06 and takes its place; 007 is not continued.
