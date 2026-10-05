# Feature Specification: A Generic FBL Implementation for Visual Studio Code

**Feature Branch**: `features/007-vscode-format-binding`
**Created**: 2026-10-05
**Status**: Draft
**Input**: "One for a generic FBL implementation that can run in VSCode (in the etalii.adp.ide.vscode repo), with simple unit tests to validate that the loading/saving works as expected (at minimum the same FBL unit tests as that have been added to the etalii.adp.ide.standalone repo." (Peter, 2026-10-05, in the project thread, as one of the Spec Kit specifications to be written in etalii.adp, "the only place where spec kit specifications are allowed to be added/maintained".)

## Context

FBL, the Format Binding Language ([FBL-specification.md](../../specifications/fbl/FBL-specification.md), version 0.1, Working Draft), declares how a tool reads and writes a model that lives in a file another tool owns: which files a binding claims, how a body is read into elements, relations and findings, how every change is written back as named, minimal splices with an exact undo, and how the `.adp` registration beside the body keeps what a user placed. FBL exists so that this is declared once instead of coded once for each of ADP's four hosts, and its round-trip fixtures are "the shared test: a host that passes them reads and writes bodies the way every other host does" (FBL section 1.2).

One host implements FBL today. `etalii.adp.ide.standalone` gained a library, `EtAlii.Adp.Specification.Fbl`, and its tests, `EtAlii.Adp.Specification.Fbl.Tests`, in its pull request 112 (merged 2026-10-03): all five format families, splices with undo, redo and the drift refusal, registrations, routing, templates, folder recognition and the host's side of the plugin contract, held to the eight vendored fixtures and to every real file of that repository a binding claims. It is wired into nothing there.

`etalii.adp.ide.vscode` has no FBL at all. Its two diagrams (spec 006) each read and write their own format by hand, and neither format is one of the eight example bindings. So nothing shows yet that FBL's promise, "one answer in every host", holds for a second host, written in another language, running inside an editor that has no .NET.

This feature gives the VS Code repository a generic FBL implementation: one that takes any FBL document and any body, with nothing in it specific to a tool type, and that runs inside the plug-in. It is proven by tests, at minimum the ones standalone has, and it is wired into no tool yet.

**What "the same tests" is measured against.** [test-baseline.md](test-baseline.md) lists the 86 tests of `EtAlii.Adp.Specification.Fbl.Tests` by name, as read at standalone `develop` commit `25fc7b4a`. That list is the minimum; a test of it is either present in this host or listed as not applicable with its reason (FR-021).

**Where the work lands.** This specification, its plan and its tasks live here in `etalii.adp`. The implementation and its tests land in `etalii.adp.ide.vscode` through a pull request into its `develop`. A change to FBL itself that the work shows to be needed lands here, in `specifications/fbl/`, through its own feature.

Three roles appear below. A **contributor** is a person or agent who changes the plug-in. A **tool engineer** writes FBL documents. A **user** works on files in Visual Studio Code; no user sees anything of this feature yet, and the stories say what it secures for them once a tool is built on it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The host passes the shared round-trip fixtures (Priority: P1)

A contributor runs the repository's tests. For each of the round-trip fixtures FBL publishes, the implementation loads the fixture's binding, reads the input body, and walks the fixture's steps: a save without an edit, edits, undos and redos. Reading gives the elements and findings the fixture lists; every step produces exactly the splices the fixture lists and exactly the document it expects, byte for byte.

**Why this priority**: the fixtures are FBL's own definition of a conforming host (FBL section 15.3). They cover loading and saving in one pass, they are the same in every host, and a host that passes them writes the bytes standalone writes. Everything else in this feature refines what they already establish.

**Independent Test**: with only the fixtures, bindings and registrations copied from `specifications/fbl/`, run the fixture tests; all eight pass, and breaking the implementation in one place (for example writing LF where the body has CRLF) makes at least one fail.

**Acceptance Scenarios**:

1. **Given** a fixture whose first step is a save without an edit, **When** the body is read and saved, **Then** the bytes written are the bytes read, including a byte-order mark, the line endings and a missing final newline.
2. **Given** a fixture step that adds, sets, removes or places something, **When** the edit is planned, **Then** its splices are the fixture's, with the same operation names, byte offsets and text, and the document after it is the fixture's.
3. **Given** a fixture step that undoes or redoes, **When** it is applied, **Then** the document is the one the fixture expects, and after every undo of a fixture the input is restored exactly.
4. **Given** a fixture step marked as refused, **When** the edit is asked for, **Then** it is refused with the fixture's reason and nothing is written.
5. **Given** any fixture input, **When** it is read, **Then** every byte of it belongs to the lossless reading: nothing is skipped and nothing is counted twice.
6. **Given** the folder of fixtures, **When** the tests start, **Then** they find all of them, and fail rather than pass if they find none.

---

### User Story 2 - Every check standalone has, this host has (Priority: P1)

A contributor compares what this host tests with what standalone tests, using [test-baseline.md](test-baseline.md). Each of its 86 tests has a counterpart here that checks the same behaviour with the same inputs and the same expected results: loading an FBL document and refusing a broken one at its location; lines, columns and endings of a body; the regular expression and CEL subsets; reading by rules; history, drift and saving; the registration; routing and templates; the host's side of a plugin-read binding; and the YAML scalar rules that decide how new text is written.

**Why this priority**: it is the ask's stated minimum. The fixtures prove eight paths end to end; these tests prove the rules one at a time, including the ones no fixture reaches (a duplicate key, a body outside the workspace, a redo after drift).

**Independent Test**: for every row of the baseline, name the test here that corresponds to it or the reason it does not apply; run them; all pass.

**Acceptance Scenarios**:

1. **Given** an FBL document with a duplicate key, another major version, a name that resolves to nothing or a failed check of FBL section 14.1 step 6, **When** it is loaded, **Then** it is refused with a problem at the JSON Pointer of its cause, every problem is reported rather than the first, and a newer minor version loads with a warning.
2. **Given** a body with a byte-order mark, mixed line endings, a lone CR or an invalid UTF-8 sequence, **When** it is read, **Then** lines, columns (in code points) and the dominant ending are what FBL section 2.6 says, and the invalid sequence is found with its offset.
3. **Given** a regular expression or CEL expression outside FBL's subsets, **When** the document is loaded, **Then** it is rejected by the name of the construct; one inside the subset is accepted and evaluates to the expected value.
4. **Given** a body with an entry without an id, two equal ids, an entry a rule matches but cannot read, or a missing required header, **When** it is read, **Then** the model, the findings and what is marked as not stored are those the baseline tests expect, and reading does not fail.
5. **Given** an edit that was undone, **When** the body's bytes changed in between, **Then** redo is refused and writes nothing; a reload clears the history; a save hands the writer the edited bytes; an unreadable body is never saved.
6. **Given** a registration, **When** it is read, **Then** its body is found as FBL section 8.2 says, a body outside the workspace or reached through a link is refused, identities and layout are read and written by splices, and legacy sidecars are read as section 8.7 says.
7. **Given** a file or folder, **When** it is routed, **Then** markers, extensions, globs, folder recognition and the order of candidates are those the baseline tests expect; a template is produced with its four placeholders replaced exactly.
8. **Given** a plugin-read binding and no plugin, **When** its body is opened, **Then** it opens read-only with a finding; with a plugin supplied by the test, its splices are applied, recorded and undone, and its refusal writes nothing.

---

### User Story 3 - The bindings are tried on real files (Priority: P2)

A contributor runs the real-file tests. Every file in the VS Code repository that one of the example bindings claims, and a set of real files of each declared binding copied unchanged from standalone, is read, saved without an edit, edited and undone, has an entry removed and restored, and has an undo refused after the file changed. Every `.adp` registration in the repository is parsed and saved unchanged. Where a binding and a real file disagree, the disagreement is in a record, and the tests fail on one that is not.

**Why this priority**: fixtures are written to pass. Real files are where a reader meets what nobody thought of, and standalone's real-file tests are part of the minimum the ask sets. It comes second because the repository's own files are few and the copied ones need choosing.

**Independent Test**: add a real `.tml` file with an unusual but valid layout to the corpus; the tests pick it up without a change to them and either pass or name the property it breaks.

**Acceptance Scenarios**:

1. **Given** the real-file corpus, **When** the tests enumerate it, **Then** each declared binding finds at least the number of files recorded for it, so that a broken enumeration fails instead of passing on nothing.
2. **Given** a real file a declared binding claims, **When** it is read and saved without an edit, **Then** the bytes written are the bytes read.
3. **Given** the same file, **When** an attribute is set and the edit undone, and when an entry is removed and the removal undone, **Then** only the bytes inside the edit's splices changed, and the undo restores the file exactly.
4. **Given** the same file edited, **When** its bytes are changed from outside and undo is asked for, **Then** the undo is refused and nothing is written.
5. **Given** every `.adp` file in the repository, **When** it is parsed and saved, **Then** it is unchanged.
6. **Given** a real file that a binding reads differently from what is expected, **When** the tests run, **Then** they pass only if that disagreement is in the divergence record with its reason, and fail on a recorded one that no longer occurs.
7. **Given** a divergence standalone recorded for a file that is also in this corpus, **When** the tests run here, **Then** the same divergence is found, or the difference between the hosts is itself reported.

---

### User Story 4 - It runs inside Visual Studio Code (Priority: P3)

A contributor installs the packaged plug-in in a clean Visual Studio Code, with nothing else installed and no network. A test running in that editor loads an example binding, reads a fixture's body, saves it unchanged, makes an edit, undoes it, and finds the bytes it expects each time.

**Why this priority**: the ask is an implementation "that can run in VSCode". Tests that run beside the editor show the logic is right; this shows it is in the plug-in and works there. It is last because it adds no new behaviour, only the proof of where it runs.

**Independent Test**: build the plug-in file, install it in a Visual Studio Code that has no other extension, disconnect the network, and run the in-editor test; it passes.

**Acceptance Scenarios**:

1. **Given** the packaged plug-in, **When** it is inspected, **Then** the FBL implementation is part of it and needs no runtime, service or download beyond the plug-in itself.
2. **Given** a real Visual Studio Code running the packaged plug-in, **When** the in-editor test walks one fixture, **Then** every step gives the fixture's document.
3. **Given** the plug-in with the FBL implementation in it, **When** a user opens a `.ghg` file or a behavior model, **Then** both diagrams behave exactly as before this feature.

---

### Edge Cases

- A body with mixed line endings: the implementation works on the body's bytes and keeps each line's own ending. Visual Studio Code's text document keeps one ending per file (recorded in the host's parity record); that difference belongs to the feature that first connects a tool to FBL, and this feature must not hide it by normalising anything.
- A body that is not valid UTF-8, or not well-formed at its top level: it opens as unreadable with one finding, and is never saved.
- A body over the size limit, or with more entries than the limit: reported as unreadable rather than read in part.
- A regular expression that would run for a very long time on a hostile line: bounded, and reported as a finding on the statement instead of hanging the editor.
- A registration whose body is outside the workspace, or reached through a symbolic link: refused, neither read nor written.
- A binding for a family or a plugin the host does not support: its documents open read-only with the reason.
- A fixture or binding copied from `specifications/fbl/` whose line endings were converted on checkout: the byte offsets no longer fit; the repository must keep these files from conversion, and a test must notice a converted copy.
- A baseline test that depends on something only standalone has (a module with a parser of its own to cross-check against): it is listed as not applicable with the reason, not silently left out.
- A test that cannot run on a contributor's machine (for example one that needs symbolic links where the system refuses them): reported as skipped with its reason, never as passed.
- Two hosts that produce different bytes for the same fixture step: at least one is wrong or FBL is ambiguous; the question goes to `specifications/fbl/`, and neither host settles it alone.

## Requirements *(mandatory)*

### Functional Requirements

#### The implementation and its place

- **FR-001**: `etalii.adp.ide.vscode` MUST gain one FBL implementation that is generic: it takes any FBL document and any body, and contains nothing that names or serves a particular tool type or one of the example bindings.
- **FR-002**: The implementation MUST be part of the installable plug-in and MUST work there with nothing else installed or running and with no network access.
- **FR-003**: The part of the implementation that knows documents, bodies, rules, splices, history, registrations, routing and templates MUST NOT depend on Visual Studio Code, so that every test of User Stories 1 to 3 runs without the editor.
- **FR-004**: The implementation MUST take bytes, paths and a workspace root and give back models, findings, splices and bytes. It MUST NOT watch files, keep state between bodies, or write a file other than through the atomic save FBL section 6.6 defines.
- **FR-005**: This feature MUST NOT connect the implementation to any tool, editor, command or setting of the plug-in, and MUST NOT change how the two existing diagrams read, write or behave.

#### What it implements

- **FR-006**: The implementation MUST conform to FBL 0.1 as a *Host, declared* (FBL section 15.1) for all five format families: `yaml`, `json`, `xml`, `lines` and `blocks`.
- **FR-007**: It MUST load an FBL document as FBL section 14.1 says, steps 1, 2, 4, 5 and 6, reporting every problem with its JSON Pointer, severity and message.
- **FR-008**: It MUST read a body through a declared binding into elements, relations, attribute values, source spans and findings, tolerantly (FBL sections 4, 5 and 7.4), and MUST open an unreadable body as FBL section 7.5 says.
- **FR-009**: It MUST plan every edit as the splices of FBL section 6, with new text following the body's own conventions, and MUST save a body without an edit as the bytes that were read.
- **FR-010**: It MUST keep a history per open body with exact undo and redo, including snapshot undo, and MUST refuse an undo or redo on drift without writing (FBL sections 7.1 and 7.2).
- **FR-011**: It MUST read and write the `.adp` registration, with its layout, identities and legacy sidecars, by the same splice rules (FBL section 8).
- **FR-012**: It MUST route a file or folder to its candidate bindings and readings, and produce a new body from a template (FBL sections 10.1, 12 and 13).
- **FR-013**: For a plugin-read binding it MUST do the host's part of the contract (FBL sections 11.1 to 11.3): open read-only with a finding when the plugin is missing, and apply, record and undo the splices a plugin plans. It need not contain any plugin.
- **FR-014**: It MUST apply the limits and bounds of FBL section 16: a bounded match time for regular expressions, limits on body size and entry count, paths resolved within the workspace without following links, and templates never evaluated.
- **FR-015**: For the same binding, body and edit it MUST produce the bytes every other conforming host produces. Where FBL leaves that open, the question MUST be raised as a change to `specifications/fbl/` and MUST NOT be settled in this host.

#### The tests

- **FR-016**: The repository MUST hold a copy of FBL's example bindings, round-trip fixtures and example registrations, unchanged, with the `etalii.adp` commit they were copied from recorded beside them, kept from line-ending conversion, and never edited there.
- **FR-017**: Every vendored fixture MUST be run as FBL section 15.3 defines passing: the reading it lists, then every step's splices and document.
- **FR-018**: For every vendored fixture input, a test MUST show that every byte belongs to the lossless reading.
- **FR-019**: The test that finds the fixtures MUST fail when it finds none.
- **FR-020**: Every test in [test-baseline.md](test-baseline.md) MUST have a counterpart that checks the same behaviour with the same inputs and expected results, named so that the correspondence can be read off.
- **FR-021**: A baseline test that cannot apply to this host MUST be listed in the repository with its reason. The expected cases are the cross-check of a binding against a module's own parser, which needs a module that has one for a bound format, and the parts of the real-file tests that name files only standalone has.
- **FR-022**: The real-file properties (reads; saves unchanged; an edit changes only its splices and undoes exactly; a removal likewise; an undo after a change is refused) MUST run over every file in the repository that a vendored declared binding claims and over a corpus of real files copied unchanged from standalone, with their source and licence recorded, holding at least one real file for each of the six declared bindings.
- **FR-023**: Every `.adp` registration in the repository MUST be parsed and saved unchanged by a test.
- **FR-024**: Each enumeration of real files MUST assert a recorded minimum count.
- **FR-025**: A disagreement between a vendored binding and a real file MUST be recorded with the file, the property, what was observed and the reason. The tests MUST fail on an unrecorded disagreement and on a recorded one that changed or no longer occurs. A vendored binding MUST NOT be edited, a file skipped or an assertion weakened instead.
- **FR-026**: At least one test MUST run in a real Visual Studio Code against the packaged plug-in and walk one fixture through read, save, edit and undo.
- **FR-027**: Every test MUST be written before the behaviour it covers and seen to fail first; a test that cannot run MUST be reported as skipped with its reason.
- **FR-028**: The repository's Build workflow MUST run all of these tests on every pull request and on `develop`, and a failure MUST fail the build.

#### Reporting back

- **FR-029**: The repository's documentation MUST say that the plug-in carries a generic FBL implementation, which conformance class and families it claims, where the vendored corpus comes from, and that no tool uses it yet.
- **FR-030**: Every divergence recorded under FR-025, and every place where FBL's document was not enough to decide what to write, MUST be reported to `etalii.adp` as a candidate change to the binding or the specification.

### Key Entities

- **FBL document**, **binding**, **body**, **registration**, **reading**, **splice**, **edit**, **finding**: as [docs/terminology.md](../../docs/terminology.md) and the FBL specification define them.
- **Round-trip fixture**: a `fixture.json` with its input body: what reading yields, then steps with their splices and expected documents (FBL section 15.3).
- **Conformance corpus**: the bindings, fixtures and registrations copied unchanged from `specifications/fbl/` at a recorded commit.
- **Test baseline**: the 86 tests of standalone's `EtAlii.Adp.Specification.Fbl.Tests`, listed in [test-baseline.md](test-baseline.md).
- **Real-file corpus**: the repository's own files that a binding claims, and real files copied from standalone with their source recorded.
- **Divergence record**: the list of known disagreements between a vendored binding and a real file, each with its reason.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All eight round-trip fixtures pass: 100% of no-edit saves are byte-identical to the input, and 100% of steps produce the fixture's splices and document.
- **SC-002**: Each of the 86 baseline tests has a passing counterpart or a stated reason it does not apply, and no more than the cases FR-021 names are not applicable.
- **SC-003**: For every real file in the corpus, a save without an edit writes the bytes read, and an edit followed by its undo restores the file byte for byte, or the file is in the divergence record.
- **SC-004**: For each fixture step, the splices this host produces are identical, operation by operation and byte by byte, to those standalone produces.
- **SC-005**: The packaged plug-in passes the in-editor test in a clean Visual Studio Code with no other extension and no network.
- **SC-006**: The plug-in's existing tests pass unchanged, and nothing a user can see or do differs from before this feature.
- **SC-007**: A contributor runs every test that needs no editor with one command, and the whole run takes no longer than the repository's existing tests of that kind take today.
- **SC-008**: Every divergence and every open question found is filed against `etalii.adp` before this feature's pull request is merged.

## Assumptions

- **"Generic" means not tied to a tool type**, and the feature stops at the implementation and its tests. Connecting a tool to it, or moving the two existing diagrams onto a binding, is a later feature for each tool, as it is in standalone. Neither `.ghg` nor the behavior model's Markdown has an FBL binding today.
- **The level is FBL's *Host, declared* for all five families**, which is what standalone implements. Folder subjects are covered as far as recognition and file selection; watching, settling and sharing one open body between several readings belong to a running host and are left to the feature that needs them (FBL sections 7.3, 9.1, 10.3).
- **"The same unit tests" means the same checks**, with the same inputs and expected results, written anew for this host. [test-baseline.md](test-baseline.md) is the list, read at standalone `develop` `25fc7b4a`; if standalone's tests change before planning, the list is read again.
- **Validating FBL documents, registrations and fixtures against `fbl.schema.json`** (FBL section 14.1 step 3) is not part of this feature, as in standalone: `etalii.adp`'s Build workflow already validates every file the corpus is copied from.
- **DISL stays out**: tool types and their attributes, derived and ephemeral ids and constraints. The tests supply the ids the fixtures name, as standalone's do.
- **No persistence plugin is implemented**; tests stand in for one where the contract is exercised.
- **The real files copied from standalone** are that repository's own examples and test fixtures, under its Apache-2.0 licence; which ones, and how many beyond one per declared binding, the plan decides.
- **FBL 0.1 as it stands on `develop` here** is the reference. A newer FBL is taken up by copying the corpus again at a newer commit.
- **This specification and its IntelliJ counterpart**, spec 008, ask the same of two hosts and are independent: neither waits for the other.
