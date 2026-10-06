# Data Model: A Generic FBL Implementation for IntelliJ

**Feature**: [intellij-fbl-implementation.spec.md](intellij-fbl-implementation.spec.md) | **Plan**: [plan.md](plan.md) | **Research**: [research.md](research.md)

This feature stores nothing of its own: no setting, no index, no file format. Its entities are of two kinds. The **runtime entities** are the values the `fbl` module holds in memory while it loads an FBL document, reads a body and plans, applies and undoes edits. The **test-data entities** are the files under `fbl/testdata/` that the tests are measured against. FBL's own terms (FBL document, binding, body, registration, reading, splice, edit, finding) keep the meaning [docs/terminology.md](../../docs/terminology.md) and the [FBL specification](../../specifications/fbl/FBL-specification.md) give them. This document says only how this host shapes them.

Type names are those of the plan's project structure. Where a field's exact name is not fixed by the plan or the research, the task that ports the layer takes it from standalone at `25fc7b4a`.

## Overview

```text
FBL document ──holds──> binding ──has──> rules, markers, templates
     │                     │
     │ loaded by           │ claims (Router)
     ▼                     ▼
  Problem             body bytes ──wrapped in──> BodyText ──spans──> Span
                           │
                           │ read through the binding (BodyReading)
                           ▼
                      FblModel: elements, relations, attribute values, positions, findings
                           │
                           │ ModelChange ──EditPlanner──> PlanResult: splices | refusal
                           ▼
                      SplicedFile (OpenBody, OpenRegistration, LegacySidecar, PluginBody)
                           │
                           └── EditHistory: entries with splices and the digests before and after
```

## Runtime entities

### Span

A range of bytes in a body.

| Field | Meaning |
| --- | --- |
| `start` | Byte offset, inclusive |
| `end` | Byte offset, exclusive |

**Rules**

- Offsets count bytes, never UTF-16 characters, and a byte-order mark is counted (R3).
- `0 <= start <= end <= length of the body`.

### BodyText

The bytes of one body, with what FBL section 2.6 derives from them.

| Field | Meaning |
| --- | --- |
| bytes | The body as read, a `byte[]`, never normalised |
| byte-order mark | Whether the body starts with one |
| lines | Each line with its span and its own line ending (LF, CRLF or a lone CR) |
| dominant line ending | The ending new text uses, as FBL section 2.6 defines it |
| invalid sequences | The offset of each invalid UTF-8 sequence |

**Rules**

- A body with an invalid UTF-8 sequence is unreadable: one finding with the offset, and the body is never saved (FR-007, edge cases).
- Each line keeps its own ending. Nothing is converted, also when endings are mixed.
- A line and column are derived from a byte offset, and the reverse.
- A body larger than the size limit of `FblOptions` is unreadable and is not read in part (FR-013).

### FBL document and its bindings

The loaded form of a `.fbl` file: the model records under `document/`. The document is read by the module's own JSON parser, so every key and value has its span.

| Entity | Holds |
| --- | --- |
| FBL document | The `fbl` version, and its bindings by name |
| Binding | What it claims (extensions, globs, markers, folder subjects), its format family, how it is read (declared rules or a plugin), its templates |
| Rule | What entries it selects, the type and id of what it reads, its attributes and relations, and how each is written |
| Marker | A content test that decides between candidate bindings (a root key, a pattern in the first lines, a CEL expression) |
| Template | The text a new body is produced from |

**Rules**

- Loading follows FBL section 14.1, steps 1, 2, 4, 5 and 6. Step 3, validation against the JSON Schema, is not made (FR-006, Assumptions).
- A duplicate key, an unsupported major version, a name that resolves to nothing and a failed rule check are each a problem at the location of its cause. Every problem is reported, not only the first (FR-006).
- A regular expression or CEL expression outside FBL's subsets is rejected at load by the name of the construct (R6, R7).
- The format family is one of `yaml`, `json`, `xml`, `lines` and `blocks` (FR-005). A binding for a family or plugin this host does not support opens its documents read-only with the reason.
- The loader checks that need DISL (a rule's `type` naming a type, no `fixed` attribute bound, a plugin declared by the specification) are not made (R20).
- Nothing in the loaded model, or in the code that holds it, names a tool type or an example binding (FR-001).

### Problem

What loading an FBL document reports.

| Field | Meaning |
| --- | --- |
| location | Where in the FBL document the cause is |
| severity | How serious it is |
| message | What is wrong |

**Rules**: a document with a problem that refuses it is not used to read a body.

### Finding

What reading a body reports, as FBL defines it. `FindingCodes` holds the codes this host uses, among them `fbl.regex-timeout`.

**Rules**

- Reading is tolerant: an entry without an id, two equal ids and a missing required header give findings, never a failure (FR-007).
- An unreadable body has exactly one finding, the one that says why.
- A regular expression that passes its time bound gives the warning `fbl.regex-timeout`, and the line reads as not matching (R6).
- A plugin-read body opened without its plugin has a finding that says why it is read-only (FR-012).

### FblOptions

The limits and hooks a caller passes. The module has no global state.

| Field | Default | Meaning |
| --- | --- | --- |
| body size limit | 32 MiB | A larger body is unreadable |
| entry limit | 500,000 | A body with more entries is unreadable |
| match time | 250 ms | The bound on one regular expression match |
| suggestion limit | 64 KiB | The bound on a suggestion |
| marker lines | 20 | How many lines a pattern marker looks at |
| `deriveId` | none | An optional function, called for an entry whose rule stores no id (R10) |

**Rules**

- Main code supplies no `deriveId`. The tests supply `NaturalIds`, which lives under `src/test`, because the derivations name bindings (FR-001).
- Paths resolve within a root the caller passes. A path outside it, or one reached through a symbolic link, is refused (FR-013, R19).

### FblModel

The reading: what one body yields through one binding.

| Part | Holds |
| --- | --- |
| Element | Its id, its type, its attribute values, and the span it was read from |
| Relation | Its id, its type, the elements it joins, its attribute values, and its span |
| Attribute value | The value, and the span of the bytes that state it |
| Findings | The findings of this reading |
| Readable | Whether the body may be edited and saved |

**Rules**

- The model is never patched. After every edit the bytes are spliced and read again (R9).
- Every element, relation and attribute value has a source position (FR-007).
- Ids come from the body where the rule stores one, and from `deriveId` otherwise.
- An unreadable body gives an empty model, one finding and `readable = false`.

### ModelChange

An edit asked for, before it is planned: add an element or relation, set an attribute, remove an entry, or place something (the fixture steps of User Story 1, scenario 2). It names its target by id and carries the new value.

### Splice

One replacement of bytes, as FBL section 6 defines it.

| Field | Meaning |
| --- | --- |
| operation | The operation name FBL gives it |
| `start`, `end` | The span replaced, in the bytes before the edit |
| text | The bytes written in its place |
| file | Optional: the file it applies to, when not the body itself |

**Rules**

- A fixture compares a splice by operation, start, end and text, in that order (R13).
- New text follows the body's own conventions: its dominant line ending, its indentation and its quoting (FR-008).
- Numbers in new text have the form of ECMAScript's `Number.prototype.toString`. Fixed decimals are rounded half up (R8).
- For the same binding, body and edit the splices are those every conforming host produces (FR-014).

### PlanResult

What planning a `ModelChange` gives: either the splices of the edit, or a refusal with its reason.

**Rules**

- A refusal writes nothing and leaves no history entry (User Story 1, scenario 4).
- The refusal sentences are standalone's, word for word (R11).
- An edit that plans no splices leaves no history entry (R9).

### SplicedFile and its kinds

Anything written by splices. One base type, four kinds.

| Kind | What it is |
| --- | --- |
| `OpenBody` | A body read through a declared binding |
| `OpenRegistration` | A `.adp` registration |
| `LegacySidecar` | A legacy sidecar of a registration |
| `PluginBody` | A body whose splices a persistence plugin plans |

| Field | Meaning |
| --- | --- |
| bytes | The current bytes |
| reading | The model read from them |
| history | Its `EditHistory` |
| writer | The callback saving goes through |

**Rules**

- A save without an edit writes the bytes that were read, with the byte-order mark, the line endings and a missing final newline as they were (FR-008).
- An unreadable body is never saved (FR-007).
- The module opens no file for writing itself. Saving goes through the writer callback (R9).
- A `PluginBody` without its plugin is read-only, with a finding (FR-012).

### EditHistory and its entries

The history of one `SplicedFile`.

| Field of an entry | Meaning |
| --- | --- |
| splices | The splices of the edit |
| digest before | SHA-256 of the bytes before the edit |
| digest after | SHA-256 of the bytes after it |

**Rules**

- Undo restores the bytes before the edit exactly. After every edit is undone, the input is restored byte for byte (FR-009).
- Undo is allowed only when the current bytes have the entry's digest after, and redo only when they have its digest before. On a mismatch, which is drift, the step is refused and nothing is written (FR-009).
- A new edit after an undo discards what could be redone.

### RegistrationDocument

The `.adp` registration, read and written by the same splice rules (FR-010, FBL section 8).

| Part | Meaning |
| --- | --- |
| body reference | Where the body is, found as FBL section 8.2 says |
| identities | The ids the registration records |
| layout | Positions and sizes, written in the fixed three-decimal form |
| legacy sidecars | The older files it is read from and migrated out of |

**Rules**

- `BodyLocator` refuses a body outside the project and a body reached through a link. It is neither read nor written (FR-010, FR-013).
- A registration can be read and edited with no body beside it (R13).

### Routing and templates

| Entity | Meaning |
| --- | --- |
| Route | For a file or folder, the candidate bindings in their order (FBL sections 10.1 and 12) |
| `FolderSubject` | A folder a binding claims, with the files selected from it |
| `Glob` | A path pattern |
| Template result | The new body `TemplateWriter` produces from a template (FBL section 13) |

**Rules**

- Path and glob matching ignore case on Windows and macOS only (R19).
- A marker decides between candidates by content. A YAML `rootKey` marker is read by the module's own YAML parser (R5).
- A template is never evaluated (FR-013).
- Folder subjects go as far as recognition and file selection. Watching files is out of scope (Assumptions).

### PersistencePlugin

The contract of FBL sections 11.1 to 11.3, as an interface. The module contains no plugin. `FakePlugin`, under `src/test`, stands in for one.

**Rules**: the host applies, records and undoes the splices a plugin plans, with the same history and drift rules as for a declared body (FR-012).

## Test-data entities

All under `fbl/testdata/` in `etalii.adp.ide.intellij`, covered by `fbl/testdata/** -text` in `.gitattributes` before the first file is added.

### Conformance corpus

`conformance/`: the eight `.fbl` documents, `fixtures/` and `registrations/`, written with `git archive` from one `etalii.adp` commit.

| Part | Meaning |
| --- | --- |
| `README.md` | The commit copied from, the licence (Apache-2.0), and that the files are never edited there |
| `SHA256SUMS` | One line for every file, with its digest |

**Rules**

- Every file is unchanged from its source (FR-015). `CorpusUnchangedTest` checks each against `SHA256SUMS`, names the file that differs, and fails when the folder is empty.
- A newer FBL is taken up by copying the whole corpus again at a newer commit, never by editing a file.

### Round-trip fixture

One folder under `conformance/fixtures/`, as FBL section 15.3 defines it.

| Part | Meaning |
| --- | --- |
| binding | The FBL document and binding it runs through |
| input | The input body, or a `.adp` registration |
| reading | Optional: the elements and findings reading the input yields |
| steps | The list of steps |

| Field of a step | Meaning |
| --- | --- |
| action | A save without an edit, an edit (add, set, remove, place), an undo or a redo |
| splices | The splices the step must produce |
| `expect` | The document the step must leave |
| `refused` | For a refused step, its reason |
| `expectFile` | Optional: a second file and the content it must have |

**Rules**

- A fixture passes when its reading matches and every step gives its splices and its document, byte for byte (FR-016).
- The test that finds the fixtures fails when it finds none. There are eight (SC-001).
- No fixture has a redo step, and three list no reading. Redo and tolerant reading are proven by the History and Reading tests (R13).

### Test baseline and its inventory

`baseline/fbl-test-inventory.md`: a table of 86 rows, one for each test of standalone's FBL test project at `25fc7b4a`.

| Column | Meaning |
| --- | --- |
| baseline test | `File.Method` in standalone |
| counterpart | `Class.method` here, or `not applicable` |
| reason | For `not applicable`, why |

**Rules**

- `BaselineCoverageTest` asserts 86 rows, and that every named class and method exists (FR-017, R14).
- A counterpart keeps standalone's method name in lower camel case, and has the same inputs and expected results.
- `not applicable` is allowed only for the cases FR-018 names: the registration tests that need files only standalone has, and the parts of the module cross-check for modules this host does not have (SC-002).

### Real-file corpus

| Part | Where | Recorded minimum |
| --- | --- | --- |
| The repository's own maps | `freemind/testdata`, every `.mm` file, found through the system property `adp.freemind.testdata` | 108 |
| Timeline | `real/src/...` | 15 |
| Causal loop | `real/src/...` | 4 |
| Structurizr | `real/src/...` | 16 |
| Databricks job | `real/src/...` | 4 |
| Databricks pipeline | `real/src/...` | 2 |
| Registrations | every `.adp` beside those files that names one of them | recorded at copy time |

`real/README.md` records standalone's commit and the Apache-2.0 licence.

**Rules**

- Files are copied unchanged, with standalone's paths kept (R15).
- A file whose licence is share-alike or unknown is refused (edge cases).
- Each enumeration asserts its recorded minimum (FR-021). A file added to the maps is picked up without a change to the tests.
- Every file is put through the five properties of FR-019: it reads; it saves unchanged; an attribute edit changes only its splices and undoes exactly; a removal likewise; an undo after an outside change is refused.
- Every real `.adp` is parsed and saved unchanged (FR-021).

### Divergence record

`divergences.json`: a list of the known disagreements between a copied binding and a real file.

| Field | Meaning |
| --- | --- |
| `property` | Which property the file breaks, with standalone's property names, and `cross-check` for FR-020 |
| `binding` | The binding |
| `file` | The file |
| `observed` | What was observed |
| `reason` | Why |

**Rules**

- The tests fail on a disagreement that is not listed, on a listed one whose observation changed, and on a listed one that no longer occurs (FR-022, R16).
- A copied binding is never edited, a file never skipped and an assertion never weakened instead (FR-022).
- An entry is added only when this host's tests show the disagreement.
- Every entry is reported to `etalii.adp`, marked as known from standalone or new (FR-027).

## State transitions

### A body

```text
bytes ──read──> readable ──edit planned, splices applied, read again──> readable
   │               │  ▲
   │               │  └── undo / redo, when the digest matches
   │               └── save: the current bytes, through the writer
   │
   ├──> unreadable (invalid UTF-8, not well-formed, over a limit): one finding, never edited, never saved
   └──> read-only (plugin missing, family not supported): read, with a finding, never edited
```

### A history

| From | Event | To |
| --- | --- | --- |
| Any | An edit whose plan has splices | A new entry on top. What could be redone is discarded |
| Any | An edit that is refused, or plans no splices | Unchanged. Nothing is written |
| An entry on top | Undo, and the bytes have its digest after | The bytes before the edit. The entry can be redone |
| An entry on top | Undo, and the bytes differ (drift) | Unchanged. Refused, nothing is written |
| An entry to redo | Redo, and the bytes have its digest before | The bytes after the edit |
| An entry to redo | Redo, and the bytes differ (drift) | Unchanged. Refused, nothing is written |
| Any | The body is reloaded from changed bytes | A new reading. Entries whose digests no longer match can no longer be applied |

### A divergence

| From | Event | To |
| --- | --- | --- |
| Not recorded | A test shows the disagreement | The test fails until the entry is added with its reason |
| Recorded | The disagreement occurs as observed | The test passes |
| Recorded | The observation changed, or the disagreement no longer occurs | The test fails until the entry is corrected or removed |
