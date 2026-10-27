# Feature Specification: FBL 0.10, What the C4, Databricks and Wardley Map Conversions Wait On

**Feature Branch**: `features/066-fbl-conversion-gaps`

**Created**: 2026-10-27

**Status**: Draft

**Input**: The language gaps of three conversion specifications of `etalii.adp.ide.standalone`, which plans with spec-workflow, each read at that repository's commit `6faaeaeb3` under `.spec-workflow/specs/<name>/`: `c4-disl-fbl` (`requirements.md` section C, gaps C1 to C8 and C12; `tasks.md` tasks 13 to 17, which wait on gaps C1 to C7), `databricks-disl-fbl` (`requirements.md` section C, gaps 1 to 7; `tasks.md` tasks 10 to 13, which wait on gaps 1, 2 and 4, task 12 naming stand-ins for gaps 5 to 7) and `wardley-map-disl-fbl` (`requirements.md` section C, gaps 1 to 8; `tasks.md` tasks 11 to 13, which wait on gaps 1 to 4, 7 and 8). The same gaps are recorded, with the fixtures that show them, in this repository's companions `definitions/diagrams/c4-*.md` (*The gaps*, 1 to 8 and 12), `definitions/diagrams/databricks-*.md` (*The gaps*, 1 to 7) and `definitions/diagrams/wardley-map.md` (*Language gaps*, 1 to 8). The maintainer asked that the work those specifications wait on proceed. The model for this feature is the earlier FBL features [015](../015-fbl-scalar-as-written/), [026](../026-fbl-insert-empty/) and [033](../033-fbl-insert-constant/).

## Context

Three standalone conversions have finished their first stage: their toolboxes, menus, rows and findings are derived from DISL definitions, and their bodies are still read and written by the module's own parser and writer. Their second stage reads and writes the body through an FBL binding, and each of them stopped there because FBL could not state what its format needs. This feature states it.

Each gap was checked against FBL 0.9 (`specifications/fbl/FBL-specification.md`, 2026-10-25), since several FBL versions were published after the conversions were written. Four are answered already and are not part of this feature:

| Gap | Answered by |
|---|---|
| Databricks gap 3, a YAML scalar as written | FBL 0.5: the written text (section 4.1.5), `read`, `quoted` and `fallback` (section 5.2), from feature 015 |
| Databricks gap 6, which rule plans an add when several share a type | Section 6.2: "An add is planned by the first rule of its type, in the binding's order, that has an `insert` whose `when` holds" |
| Databricks gap 6, two containers created by one insert | FBL 0.4: *Missing levels* (section 6.2) |
| Wardley map gap 5, one set-valued attribute stored as the presence of words | FBL 0.7: a word slot of a `many` attribute holds every word of its group that matches, in written order, and a set writes only the difference, so an unknown word survives (sections 4.6, 6.3). The spaced form `( market )` is not one word, which is Wardley map gap 4 |

FBL 0.9's `grammar` family (section 4.9) reads a comment as trivia and a brace on any line, so it could read some of what follows. It does not answer the gaps as the conversions need them: it writes no absent value (no `insert-key`), writes every value unescaped, reads an unparsed body only unit by unit at its top level, and no host is required to support it (section 15.1). The conversions' bindings are drafted in the `blocks` and `lines` families, in which none of the remaining gaps is answered. Which family carries the answers is Q1 below.

### What this feature is not

- **Not a DISL change.** The DISL gaps of the same conversions (C4 gaps C9 to C11 and C13 to C15, Databricks gaps 8 and 9, Wardley map gaps 9 to 12) stay with DISL and are not specified here.
- **Not hierarchical identifiers.** C4 gap C12, an id that depends on `!identifiers hierarchical`, is kept unsupported by the tool on purpose (finding B12: "recorded so that nobody reads the conversion as adding it").
- **Not the host work.** The standalone host implements what FBL gains in the waiting tasks of the three conversions, with this feature's fixtures as their guard; the other hosts follow under their own FBL specifications.
- **Not the client's `simulate` player** that Databricks task 14 waits on. It is a runtime gap of the standalone canvas library (DISL 9.6 already defines `simulate`), not a language gap.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A Structurizr DSL workspace is read and written through a declared binding (Priority: P1)

A tool engineer writes one binding for a Structurizr DSL workspace (`.dsl`) that the six C4 readings share. Every workspace the C4 tool opens today opens through that binding with the same elements, views and attributes: comments after a brace, after a statement and across lines change nothing that is read; a quoted name holding an escaped quote reads as the quote; a body being typed, whose braces do not yet balance, still shows what can be read; and the view a registration selects brings its own statements (`include`, `exclude`, `title`, `autoLayout`, a dynamic view's interactions) into the reading. A user who sets a technology on `container "Web"` gets `container "Web" "" "Java"`, with every comment and every other argument of the line kept. Positions kept in an existing `<base>.layout.json` apply and are written back as FBL states.

**Why this priority**: it unblocks five waiting tasks (c4-disl-fbl 13 to 17), the most of the three, for six tool types at once, and two of its constructs (a trailing comment, an unbalanced body) also serve the Wardley map.

**Independent Test**: a round-trip fixture per construct, under a Structurizr binding written in FBL 0.10, reads each of the companion's fixtures (`comments-everywhere.dsl`, `findings/trailing-comments.dsl`, `findings/block-comments.dsl`, `findings/escaped-quote.dsl`, `findings/unbalanced.dsl`, `findings/view-statements.dsl`, `findings/sidecar-keys.dsl` with its `.layout.json`, `findings/view-without-key.dsl`) and states its elements and the splices of each edit; the validator replays them, and fails them with one planted wrong offset.

**Acceptance Scenarios**:

1. **Given** `model { // the model`, **When** the body is read, **Then** the statement opens the `model` block, the braces balance, and the comment is part of no value.
2. **Given** a statement followed by `// …` or `# …` outside a quoted string, **When** one of its values is set, **Then** only that value's bytes change and the comment is kept as it was.
3. **Given** a `/* … */` comment spanning three lines that holds a declaration and a brace, **When** the body is read, **Then** nothing inside it is a statement, an element or a brace.
4. **Given** `person "Jo \"the user\""`, **When** it is read, **Then** the name is `Jo "the user"`; **and When** the name is set to `Parity "name"`, **Then** it is written `"Parity \"name\""`.
5. **Given** `container "Web"` with no description, **When** its technology (the third argument) is set to `Java`, **Then** the line becomes `container "Web" "" "Java"`, written before any brace and before any trailing comment.
6. **Given** a statement that opens a block, **When** an argument of it is set, **Then** the block's opening and every byte of the block are kept.
7. **Given** a binding that reads unbalanced bodies and a workspace missing its last two `}`, **When** it is read, **Then** every element up to the end of the body is read, the body stays editable, the missing braces are reported, and an add into a block that is never closed is refused with a reason.
8. **Given** a registration whose `view` names the container view `containers`, **When** it is read, **Then** the reading's diagram attributes are that view's `include`, `exclude`, `title`, `autoLayout` and scope, and no other view's statements reach it, while every view is still an element of the model.
9. **Given** `<base>.layout.json` whose element keys differ in case from the ids, **When** the reading opens, **Then** every stored position applies, matched as FBL states, and a move writes the file back in the number form FBL states.
10. **Given** a registration whose `view` names no view of the body, **When** it opens, **Then** it shows no view's content and FBL says what is reported and what a move does.

---

### User Story 2 - One Databricks bundle file is three editable readings (Priority: P2)

A tool engineer writes one binding for a Databricks bundle file that the bundle, job and pipeline readings share. A user opens `databricks.yml` as the bundle through `databricks.adp` and as one pipeline through `databricks.pipeline.adp`; both readings are editable, an edit in one shows in the other without a reload, and one undo history serves both. The bundle reading sees every resource, a job registration shows the job its `resource:` header names, and a pipeline registration the pipeline its header names. A user can add a task to `tasks: []` and a dependency to `depends_on: [{task_key: a}]`, and the file stays valid YAML.

**Why this priority**: it unblocks four waiting tasks (databricks-disl-fbl 10 to 13) for three tool types.

**Independent Test**: round-trip fixtures over the example `examples/lakehouse/databricks.yml` and the fixtures `two-jobs-two-pipelines.yml`, `flow-collections.yml` and `flow-dependencies.yml` read each reading's elements and plan the edits the transcript makes, and the validator replays them; a fixture shows that a registration of each of the three readings over one body is editable.

**Acceptance Scenarios**:

1. **Given** `resources.pipelines.bronze_to_gold`, **When** the bundle reading and the pipeline reading read it through one binding, **Then** it is a resource to the first and the pipeline itself to the second, and neither reading holds an element of a type its metamodel does not declare.
2. **Given** both readings open, **When** a user renames a task in the job reading, **Then** the bundle reading shows the new name without a reload, and one undo in either restores it in both.
3. **Given** two job registrations and two pipeline registrations of one file, **When** each opens, **Then** each shows and edits the resource its own `resource:` header names, or the first of its kind in document order without one, and the bundle registration selects none.
4. **Given** `tasks: []`, **When** a task is added, **Then** the file holds the task as FBL states, reads back with one task, and the undo restores `tasks: []` byte for byte.
5. **Given** `depends_on: [{task_key: a}]`, **When** a dependency on `b` is added, **Then** it is written inside the one-line sequence after `, `, and removing it restores the line.
6. **Given** a task added to a file without a `tasks` section that the binding refuses, **When** the add is refused, **Then** the user sees the sentence the binding gives ("The job has no tasks section to add into."), not one built from type names.
7. **Given** a pipeline that has `target` and no `schema`, **When** it is read, **Then** its schema is the value of `target`; **and When** the schema is set, **Then** it is written to `schema` and `target` is removed.
8. **Given** a new document named `My_Job.yml`, **When** it is created from the template, **Then** its key is `my_job`.
9. **Given** a library added to a YAML pipeline, **When** it is written, **Then** it is a nested mapping (`- notebook:` with `path:` below it) that reads back as the library added.

---

### User Story 3 - A Wardley map is read and written through a declared binding (Priority: P3)

A tool engineer writes a binding for the Wardley map's `.owm` format. Every map the tool opens today opens through it with the same elements: a pipeline whose `{` stands on the line below its statement owns that block, a statement such as a title that happens to end in `{` opens nothing, a pipeline that is never closed keeps its children and the map stays editable, a `//` comment after a statement is kept by every edit and a `//` after a colon is not a comment, and `label [-30, 12]`, `( market )`, `inertia` and `url(name)` are found anywhere after the coordinates. Every id the tool stored in `<base>.identities.json`, an array of `{id, kind, key}`, stays the id of the same element, and two components of one name each keep an id of their own.

**Why this priority**: it unblocks three waiting tasks (wardley-map-disl-fbl 11 to 13) for one tool type; its comment and unbalanced-body needs are shared with User Story 1.

**Independent Test**: round-trip fixtures under an `.owm` binding written in FBL 0.10 read the companion's fixtures (`pipelines-both-forms.owm`, `unclosed-pipeline.owm`, `brace-ending-statements.owm`, `comments-everywhere.owm`, `trailing-comments.owm`, `lenient-trailer.owm`, `annotations-and-labels.owm`, `same-key-twice.owm`, `duplicate-names.owm`) and the identities files of `examples/example 2/`, and state their elements, ids and the splices of each edit; the validator replays them.

**Acceptance Scenarios**:

1. **Given** `pipeline Kettle` followed by a line holding only `{`, **When** the body is read, **Then** the pipeline owns that block and its `component` lines are its children; **and When** a pipeline is added, **Then** its brace is written in the form the binding declares.
2. **Given** `title A map {`, **When** the body is read under a binding that lets only its block-opening rules open blocks, **Then** the title opens nothing and the braces balance.
3. **Given** a pipeline that is never closed, **When** the body is read, **Then** its children are read, the map is editable, the missing brace is reported, and an add into that pipeline is refused with a reason.
4. **Given** `component Tea [0.2, 0.8] // hot` and `url(site) [0.1, 0.2] https://example.com`, **When** the coordinates of Tea are changed, **Then** only the numbers change and the comment is kept; and the `//` after `https:` is not a comment.
5. **Given** a component written `component Tea [0.2, 0.8] inertia label [-30, 12] ( market )`, **When** it is read, **Then** the label offset, the decorator and the inertia are read wherever they stand in the trailer, and setting one changes only its own bytes.
6. **Given** `annotation 1 [[0.43,0.49],[0.08,0.79]] text`, **When** it is read, **Then** it yields two positions, each with its two numbers, each writable on its own.
7. **Given** `annotations-and-labels.identities.json`, **When** the map opens through the binding, **Then** every element has the id the file stores for its kind and key, and no element gets a new id.
8. **Given** two components named `Tea`, **When** the map is read, **Then** each has an id of its own, stored, and the same when the map is opened again, the later holder's entry carrying its ordinal in its key.
9. **Given** a component whose name is part of its identity key, **When** it is renamed, **Then** its identity entry moves to the new key in the same edit, and an undo moves it back.

### Edge Cases

- **A comment marker inside a quoted string** (`"a // b"`, `"#1"`) is part of the string and never cuts the statement.
- **A comment that opens on a statement's line and closes lines later** (`model { /* start` … `end */`): the statement and its brace are read, and nothing inside the comment is.
- **A block comment that is never closed** runs to the end of the body, is reported, and the body is not unreadable for it.
- **An escape at the end of a quoted group** (`"a\"`): the group does not end at the escaped quote; a group that then never ends is unreadable as its entry, not as the body.
- **A positional argument set on a statement whose earlier arguments are present but empty** (`container "Web" ""`): the empty argument is replaced, not padded again.
- **Clearing the last positional argument** leaves the padded empty arguments before it as they are; FBL states whether trailing empty arguments are removed.
- **A stray `}` with no open block** under a binding that reads unbalanced bodies is unbound, kept and reported, and closes nothing.
- **Two entries of a legacy layout whose element keys differ only in case**: FBL states which one applies.
- **A registration with a `view` header and a binding whose blocks define no views**: as FBL 0.9 says, the header is kept and the reading shows the body.
- **A Databricks reading over a body whose resource its header names does not exist**: the reading opens empty and says why, as a missing `resource` does today; it is not unreadable.
- **A YAML flow sequence written over several lines**: it is not a one-line collection; FBL states how an insert into it is planned or refused.
- **An insert into a flow mapping** (`{}`): not needed by these formats; it stays refused.
- **A fallback slot present together with the slot it falls back from**: the first slot is read, and the fallback is removed when the attribute is written.
- **An `.owm` statement whose trailer holds one segment twice** (two labels): the first is read, as the tool does.
- **An identities entry of the legacy file whose kind no rule declares**: it is kept as written and reported as stale.
- **A rename to a name another holder already has**: refused, as today (section 5.7).

## Requirements *(mandatory)*

Every construct below is stated by what a binding can declare and what a host then reads and writes; the constructs' names and shapes are the plan's. Where the standalone drafts gave a construct a placeholder name (`trailingComment`, `blockComment`, `escape`, `pad`, `unbalanced`, `selectedViewOnly` in c4-disl-fbl's appendix), the plan gives it its FBL name. Each requirement names the gap it answers and the story it serves. The families named are those the conversions' bindings are drafted in, `blocks` and `lines`, which is the first open question: [NEEDS CLARIFICATION: Q1, answer these gaps in the `blocks` and `lines` families, or bind Structurizr DSL and `.owm` with the `grammar` family of FBL 0.9 and extend that family instead?] The requirements marked *retires a stand-in* answer gaps that no waiting task needs, because the conversion keeps named module code for them meanwhile, which is the second: [NEEDS CLARIFICATION: Q2, does FBL 0.10 also take the gaps that only retire a named stand-in (FR-012, FR-013, FR-019 to FR-022, FR-025), or only those a waiting task names?]

### Functional Requirements

**Constructs that User Stories 1 and 3 share.** Whichever of the two stories is delivered first delivers these.

- **FR-001** (C4 gap C2, Wardley map gap 3; US1, US3): A `lines` or `blocks` binding **MUST** be able to declare a **trailing comment**: what starts a comment after a statement's content, outside double-quoted strings, in a form that can express both Structurizr's `//` and `#` and the Wardley map's `//` that is not preceded by a colon. A trailing comment **MUST** be cut from its statement before the block test of section 4.7 and before any rule matches, **MUST** be part of no value, and **MUST** be kept byte for byte by every splice, a `re-emit-line` included, which rewrites only the statement's content before it.
- **FR-002** (C4 gap C6, Wardley map gap 2; US1, US3): A `blocks` binding **MUST** be able to declare that a body whose braces do not balance is read rather than unreadable: a block never closed ends at the end of the body, a closing brace with no open block is unbound, each is reported with a finding at its line, every entry read is editable, and an add into a block that is never closed is refused with a reason. Without the declaration, section 4.7's rule stands.
- **FR-003** (Wardley map gap 2; US3, and US1 where a binding declares it): A `blocks` binding **MUST** be able to declare that only statements matched by a block rule or by an element rule with `opens` open a block, so that any other statement ending in `{` (a title, a note's text) is an ordinary statement. Without the declaration, every such statement opens a block, as in FBL 0.9.

**User Story 1, Structurizr DSL.**

- **FR-004** (C4 gap C3): A `lines` or `blocks` binding **MUST** be able to declare a **block comment**, an opening and a closing mark, within a line or across lines. Its bytes **MUST** be trivia: no statement, element or brace inside it is read, it is kept byte for byte, and a statement's own content before or after it on its line is read as if the comment were not there.
- **FR-005** (C4 gap C4): A binding **MUST** be able to declare an **escape** for the double-quoted groups and words of the `lines` and `blocks` families. Reading **MUST** resolve it (`\"` reads as `"`, and the escape character escaped reads as itself), a quoted group or word **MUST NOT** end at an escaped quote, and a value written into a quoted group or word **MUST** be written escaped, so that it reads back through the same binding as the same text.
- **FR-006** (C4 gap C5): A binding **MUST** be able to declare that the optional arguments of a rule's statement are **positional**: setting argument *n* where arguments before it are absent **MUST** write an empty value, in the binding's quoting, for each absent argument before it, then the value, as one `insert-key` placed after the last present argument, before any brace and before any trailing comment (FR-001). An argument already present, empty or not, is replaced and not padded again.
- **FR-007** (C4 gap C5): A set on a statement that opens a block **MUST NOT** change the block's opening or any byte of the block; FBL **MUST** state this for `re-emit-line`, which 0.9 leaves open.
- **FR-008** (C4 gap C1): A binding whose block rules define views (section 4.7, `view`) **MUST** be able to declare rules read **for the selected view only**: the statements inside the view block that the registration's `view` header selects, or that section 9.3 selects without one, are read into the reading's diagram (for a DISL tool type, the entries a `typeMap` maps `as: "diagram"`), and the same statements inside every other view block are not. Every view block **MUST** remain readable as an entry of the model, so that a rule about the model still sees every view.
- **FR-009** (C4 gap C1): Section 9.3's sentence that a view's content "is the reading's DISL viewpoint's, not FBL's" **MUST** be restated so that it is true beside FR-008: which elements a view draws is still the viewpoint's, and what FBL reads of the selected view is what FR-008 says.
- **FR-010** (C4 gap C7): Section 8.7 **MUST** state, for a legacy layout file: how its element keys are compared with ids (matched as its view keys are, ignoring case, unless the plan finds a reason otherwise), which entry applies when two keys match one id, the form in which its numbers are written (one form for every host, defined in section 6.3's terms), and whether its stale entries are pruned at a write (they are kept and reported, unless the plan finds a reason otherwise), so that two hosts write the same bytes to the same file.
- **FR-011** (C4 gap C7): Section 9.3 **MUST** state what a registration whose `view` names no view of the body opens: a reading that shows no view's content, in which a change of view data is refused with a reason and nothing is written; [NEEDS CLARIFICATION: Q3, is that registration also reported as a finding, or opened in silence as the tool does today?]
- **FR-012** (C4 gap C8, retires a stand-in): A block rule **MUST** be able to declare an `insert`, so that a block that produces no element (a view block) can be added, with its text from an `emit`, at a place the insert states, and undone as one edit.
- **FR-013** (C4 gap C8, retires a stand-in): A **read-only** attribute binding **MUST** be able to gather its values from more than one place of its entry, such as a declaration's tags and the `tags` statements inside the declaration's own block, in document order. Section 3.3's one-place rule **MUST** stay as it is for every value that can be written.

**User Story 2, the Databricks bundle file.**

- **FR-014** (Databricks gap 1): One binding **MUST** be able to serve readings whose tool types have different metamodels: a rule **MUST** be able to be read for some of the binding's origins and not others, or the readings' type maps to leave a binding type out of a reading's model without making it a header or an unreadable entry, so that one entry is a resource to the bundle reading and the pipeline itself to the pipeline reading. Section 5.1's "an entry becomes at most one element" **MUST** hold per reading.
- **FR-015** (Databricks gap 1): Two readings of one body through that binding **MUST** both be editable, share the one open body and the one history of section 9.1, and show each other's edits without a reload; section 9.2's read-only rule **MUST** still apply to a reading whose specification names a different binding.
- **FR-016** (Databricks gap 2): A binding **MUST** be able to declare the `resource` capture per origin, or declare that an origin's readings select no resource, so that the job reading selects by job key, the pipeline reading by pipeline key and the bundle reading sees every resource. Section 8.2's default (the first entry in document order without a header) **MUST** apply per origin.
- **FR-017** (Databricks gap 2): Section 9.1 **MUST** state that one open body has one model, of which each registration's resource selection is a view, so that two registrations of one body that select different resources show and edit their own while sharing the body's history.
- **FR-018** (Databricks gap 4): Section 4.3 or 6.2 **MUST** state how an insert into an empty YAML flow sequence (`tasks: []`) and into a one-line YAML flow sequence (`depends_on: [{task_key: a}]`) is written: the empty one as a block sequence holding the new entry, a comment on its line kept where it is (the timeline's and the dependency graph's gap; the fixture `dependency-graph-empty-flow-sequence` records what the standalone library writes today and says that FBL does not yet state it), the one-line one with the new item inside it after `, `, and the removal of an item from a one-line sequence as that item and one separator; each with its exact inverse.
- **FR-019** (Databricks gap 5, retires a stand-in): A binding **MUST** be able to give the sentence of each refusal it causes, as `readOnly` already takes one (section 3.4): an attribute's `empty: "refuse"`, its `absent` refusal, an insert whose `when` does not hold, and an insert whose container is missing and has no `create`. Without one, the refusal's wording stays the host's (section 15.3).
- **FR-020** (Databricks gap 6, retires a stand-in): An add **MUST** write an attribute reached through `child` into a mapping it creates in the new entry, as a set does since FBL 0.4 (section 5.2, `create`), so that a YAML sequence item can be a nested mapping (`- notebook:` with `path:` below it) written by an add and read back as the element added.
- **FR-021** (Databricks gap 7, retires a stand-in): An attribute binding **MUST** be able to name a second slot that is read **only when the first is absent**, the attribute being written to the first slot and the second removed when it is (the reverse of `override`). Its name **MUST** differ from FBL 0.5's `fallback`, which is a value for a slot that does not convert.
- **FR-022** (Databricks gap 7, retires a stand-in): Section 13 **MUST** offer a key placeholder that is `{key}` in lower case, or an option that lowercases `{key}`, so that `My_Job.yml` gives the key `my_job`.

**User Story 3, the Wardley map.**

- **FR-023** (Wardley map gap 1): A `blocks` binding **MUST** be able to declare that a block's opening brace may stand alone on the line after its statement, so that the statement owns the block that line opens, and both forms are read in one body. A new block **MUST** be written in the form the binding declares, and FBL **MUST** state which form `open-block` writes.
- **FR-024** (Wardley map gap 4): A `lines` or `blocks` binding **MUST** be able to declare slots that are found **by search** within one group: a segment of one or more words (`label [-30, 12]`, `( market )`, `url(name)`, `inertia`), found wherever it stands in the group, in any order, each with its own span, so that a set replaces, inserts or removes that segment alone and every other byte of the group survives. A segment that is absent and set **MUST** be written at a place FBL states.
- **FR-025** (Wardley map gap 6, retires a stand-in): A slot **MUST** be able to yield a list of structured values from one group, such as an annotation's positions `[[0.43,0.49],[0.08,0.79]]`, each item having its own values (two numbers) and spans, so that one item's value is set by a `replace-value` of its span and an item is added or removed by a splice of its own.
- **FR-026** (Wardley map gap 7): Section 8.7 **MUST** describe the Wardley map's `<base>.identities.json` as the tool writes it, a JSON array of entries `{id, kind, key}`, and say how an entry is matched to an element (by its rule's kind and its natural key), read when the registration has no `identities:` block and written back while the file exists, by json splices.
- **FR-027** (Wardley map gap 8): Section 8.6 **MUST** give `identities:` keys a **key space per kind** that a rule declares, so that a component and a note with one text do not share an entry, and the legacy file's `kind` of FR-026 is that kind.
- **FR-028** (Wardley map gap 8): Section 8.6 **MUST** give each holder of one natural key an id of its own that is stored, replacing "the second is reported as DISL's `std.duplicateId` and gets an id that is not stored": a later holder's entry carries its ordinal in its key, holders are counted in document order, and a later holder's entry is first stored with the next write of the body, as the maintainer ruled for the Wardley map on 2026-10-11 and 2026-10-12.
- **FR-029** (Wardley map gap 8): When an attribute a natural key is computed from changes, the element's identity entry **MUST** move to the new key in the same edit as the change, and an undo **MUST** move it back; an id first stored for an element is written with the next write of the body and is not a step of the history of its own.

**Every story.**

- **FR-030**: The change **MUST** be a new FBL version, 0.10, whose status paragraph says what it adds and that every valid 0.9 document is a valid 0.10 document with the same meaning; section 2.1's table and section 2.7 **MUST** list every version from `"0.1"` to `"0.10"` (section 2.1's table lists versions only to `"0.8"` today). The schema, the examples and the round-trip fixtures **MUST** change in the same pull request as the document (constitution, principle II). If the plan delivers the stories in more than one pull request, each later one is the next minor version.
- **FR-031**: Every construct this feature adds **MUST** default to FBL 0.9's behaviour when a binding does not declare it, so that every existing example and fixture reads and writes the same bytes unchanged.
- **FR-032**: Each construct **MUST** have at least one round-trip fixture (section 15.3) that reads a body showing it and, where it writes, plans an edit and its undo; the fixtures **MUST** be built from the conversions' own fixtures named in the stories, with their provenance recorded, or written here where none can be copied.
- **FR-033**: The C4 example binding `specifications/fbl/structurizr.fbl`, and the Databricks and Wardley map example bindings where this repository has them, **MUST** be brought to what FBL 0.10 lets them say, or the difference recorded in the companion, so that the standalone conversions have an example to vendor.
- **FR-034**: The companions `definitions/diagrams/c4-*.md`, `databricks-*.md` and `wardley-map.md` **MUST** record each gap this feature answers as answered, with the section that answers it, as `databricks-*.md` records gap 3 today.
- **FR-035**: ATD **MUST** carry every construct FBL 0.10 adds, as it carries every construct of FBL 0.9 (ATD section 1, Appendix C), in the same pull request as the FBL change.
- **FR-036**: No DISL or DESL construct changes in this feature; a `typeMap` that FR-014 needs to leave a type out of a reading **MAY** gain a value for it, which is then the one DISL change, stated in DISL §11.2 in the same pull request.

### Key Entities

- **Trailing comment**: the part of a statement's line after its content that a binding declares a comment; trivia owned by the statement.
- **Block comment**: a comment between an opening and a closing mark, on one line or across lines; trivia owned by no statement.
- **Escape**: the character sequence that writes a quote, and the escape character itself, inside a quoted group or word.
- **Positional argument**: an optional value of a statement whose meaning is its position, so that an absent earlier argument is written empty to keep a later one in place.
- **Selected view**: the view block a registration's `view` header selects, whose statements the reading reads into its diagram.
- **Reading's origin set**: the origins a rule or a resource capture applies to, within a binding several tool types share.
- **Identity kind**: the key space of an `identities:` entry, declared by a rule, in which a holder's ordinal tells repeated natural keys apart.
- **Legacy identities file**: the Wardley map's `<base>.identities.json`, an array of `{id, kind, key}`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Each of the twelve waiting tasks (c4-disl-fbl 13 to 17, databricks-disl-fbl 10 to 13, wardley-map-disl-fbl 11 to 13; Databricks task 14 excepted, which waits on the client) can name, for every gap it waits on, the FBL 0.10 section that answers it and a fixture to implement against.
- **SC-002**: The three conversions' binding drafts (the appendices of their `requirements.md`) can be written in valid FBL 0.10 with no property marked as not FBL for a gap a waiting task names.
- **SC-003**: Every new fixture passes `python .github/scripts/validate-examples.py`, and each fails it with one planted wrong offset.
- **SC-004**: Every example, registration and fixture that passes the validator today passes it unchanged.
- **SC-005**: A reader of FBL 0.10 alone can say, for each of the 28 acceptance scenarios above, which bytes the host reads and writes, without reading a host's code.
- **SC-006**: The companions list no FBL gap of the three conversions as open that FBL 0.10 answers, and every gap still open names why.

## Assumptions

- The maintainer's request that the work proceed decides that these gaps are specified; the plan and tasks need his approval before they are written.
- The questions are answered as their recommended options until he rules: Q1, the `blocks` and `lines` families; Q2, every gap FBL does not answer, the stand-in ones included; Q3, opened in silence, as the tool does today and as C4's question Q4 ("switched off, and today's order kept") was ruled.
- The conversions' rulings stand and this feature does not reopen them: C4's Q1 to Q9 as ruled or defaulted in `c4-disl-fbl/requirements.md`, Databricks' Q1 to Q6, and the Wardley map's Q1 to Q7 with the rulings of 2026-10-11, 2026-10-12 and 2026-10-25 on identities and passed-over lines.
- What a host writes where FBL 0.9 already decides it (a value replaced in its own style, the indentation of a new entry, undo by bytes and the drift refusal) is unchanged; the conversions' question Q1 accepted FBL's writing.
- The hosts change under their own specifications: `etalii.adp.ide.standalone` in the waiting tasks named above, with this feature's fixtures vendored as their guard; Visual Studio Code and IntelliJ under their FBL implementation specifications, 009 and 010, when they bind these formats; the Notion add-ons through their copy of the Visual Studio Code library.
- The tool descriptions of specs 043 to 051 and 065 keep reading these formats through a capability until a feature of their own moves them to a declared binding.
- The fixtures of the standalone repository that this feature copies are under the Apache License 2.0, as this repository is, so they are copied with their provenance recorded and no licence file of their own, which `licence-check.py` would refuse under `specifications/`.
- Databricks task 14 waits on a player for DISL's `simulate` (DISL 9.6) in the standalone canvas library, which no specification has delivered or planned; it is not part of this feature.
