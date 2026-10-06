# Data Model: A Generic FBL Implementation for Visual Studio Code

**Feature**: [vscode-fbl-implementation.spec.md](vscode-fbl-implementation.spec.md) | **Plan**: [plan.md](plan.md) | **Research**: [research.md](research.md)

FBL's own entities (document, binding, rule, slot, splice, registration, fixture) are defined by [FBL-specification.md](../../specifications/fbl/FBL-specification.md) and `fbl.schema.json`; this file does not repeat them. It names how the library holds them, the rules a test checks on each, and the entities of the tests themselves. Names are those of [contracts/library-api.md](contracts/library-api.md).

## Held by the library

### Body text

The bytes of one file and what section 2.6 says about them.

| Field | Meaning |
|---|---|
| `bytes` | The file, as read. Never changed in place. |
| `bomLength` | 3 when the file starts with a byte-order mark, else 0. |
| `invalidOffset` | The byte offset of the first invalid UTF-8 sequence, or none. |
| `lines` | For each line: start, end of content, end including its ending, and the ending (CRLF, LF, CR or none). |
| `dominantEnding` | The ending of most lines; CRLF on a tie with LF; a lone CR counts as neither; none when no line has one. |

Rules: a column counts code points and the byte-order mark belongs to none; an invalid sequence makes the body unreadable at its offset.

### Loaded document and load problem

A loaded document is an FBL document as typed values: its version, and its bindings in document order, each with claims, body, reader, text defaults, header, rules and their compiled expressions. Maps whose order FBL makes significant (`attributes`, `map`, `byOrigin`, `readings`, `registration.headers`) keep document order.

A load problem is `{pointer, severity, message}`: the JSON Pointer of its cause, `error` or `warning`, and a sentence.

Rules: a duplicate key is the only problem reported when one is found; another major version is refused at `/fbl`; a newer minor version loads with one warning; every other problem of steps 4 to 6 of section 14.1 is reported, not only the first.

### Reading

What reading a body through a binding yields. Rebuilt from the bytes after every change; never patched.

| Field | Meaning |
|---|---|
| `elements` | Elements and relations in document order. Each: id, whether the id is stored, type, rule, whether it is a relation, parent and containment slot, source and target (relations), attribute values, its entry's spans, and for each attribute the slot it was read from with its span and whether it can be written. |
| `findings` | Each: code, severity, message, and a source location (file, line, column, length). |
| `unreadable` | None, or the one finding `std.unparseable` that replaces all others. |
| `views` | The views a `blocks` binding's block rules define, in document order. |
| `resources` | The entries a `registration.resource` capture can select. |

Rules: an entry becomes at most one element or relation, taken by the first rule in binding order whose `when` holds; an entry a rule matches and cannot read is `std.unreadableEntry` and its bytes are kept; a second equal id is `std.duplicateId` and not stored; an entry without an id is addressed by its place, `<rule>@<line>`, unless the caller derives one; a relation with an end that names nothing is `fbl.dangling-reference` and is not created; every byte of a readable body belongs to a node or to trivia.

### Model change, plan and edit

A model change is one of: `save`; `add {type, id?, attributes, parent?}`; `set {id, attributes}`; `remove {id}`; `place {id, x, y}`; `identify {key, id}`. The last two are for a registration.

A plan result is `planned` with an edit, or `refused` with a reason. An edit is an ordered list of splices, `{operation, start, end, text}`, with offsets into the body before the edit, and whether it is undone by snapshot.

Rules: splices of one edit do not overlap, and those at one offset apply in listed order; a save plans no splice; a change that cannot be planned is refused whole and writes nothing; the same body, binding and change give the same splices.

### Open body and history

An open body is the current bytes, the binding, the options and the reading, with a history.

| State | Meaning |
|---|---|
| readable | Changes are planned and applied; it can be saved. |
| read-only | The binding or the body is read-only; every change is refused with the reason. |
| unreadable | An empty model with one finding; never saved. |

A history entry holds the edit's splices, the bytes each replaced (or the whole body before it, for a snapshot), and the SHA-256 of the body before and after.

Transitions:

- `change` on a readable body: plan, apply, record, clear the redo stack, read again.
- `undo`: when the bytes given (or held) have the entry's digest after the edit, apply the inverse splices and move the entry to the redo stack; otherwise refuse with the drift sentence and write nothing.
- `redo`: the same against the digest before the edit.
- `reload` with new bytes: replace the bytes, read again, clear both stacks.
- `save`: hand the current bytes to the caller's writer; refused for a read-only or unreadable body.

### Registration

The parsed `.adp`: origin, headers in order, the `layout` and `identities` blocks with the span of every entry, and what follows them, kept as it is. An open registration is a registration with a history, the ids and natural keys its caller knows, and which ids are ephemeral.

Rules: layout entries are in the byte order of their ids, with numbers at three decimals at most; a header neither FBL nor the binding declares is kept and reported; a layout entry for an id the caller does not know is stale, reported, and removed with the next write; an ephemeral id is never stored.

A body location is `{path, exists, isFolder, refusal?}`: where a registration's body is, by section 8.2. It is refused when the path is absolute, leaves the workspace, or passes through a link.

A legacy sidecar is a JSON file read and written by json splices: positions by view, matched ignoring case, or identities.

### Routing and templates

A candidate list is the bindings that claim a file name and its first bytes, in the order given. A folder subject is recognised by its `all`, `any` and `none` globs and lists its files in ordinal order of their relative paths, never through a link. A template is a binding's text for an origin with the four placeholders replaced and nothing else.

### Plugin body

An open body whose reading and plans come from a persistence plugin the caller supplies, and whose bytes, history, drift check and save are the library's. Without the plugin the binding names, it is read-only with the one finding `std.pluginMissing`.

### Options and limits

| Option | Default | Meaning |
|---|---|---|
| `fileName` | `body` | The `file` of every source location. |
| `maxBodyBytes` | 32 MiB | A larger body is unreadable. |
| `maxEntries` | 500,000 | A body with more entries is unreadable. |
| `regexSteps` | 1,000,000 | The budget of one match attempt (research R3). |
| `deriveId` | none | The caller's derivation of an id for an entry that stores none; this is where DISL would come in. |
| `registrationHeaders`, `resource`, `identities` | empty | What the registration the body was opened through gives. |

The CEL budget is 100,000 steps; a marker looks at 20 lines unless it says otherwise; suggestions look at the first 64 KiB.

## Held by the tests

### Conformance corpus

`fixtures/fbl/conformance/`: eight bindings, eight fixtures and six registrations, copied from `specifications/fbl/` at one recorded commit.

### Real-file corpus

`fixtures/fbl/real-files/`: the files of research R14, under the paths they have in standalone, copied at one recorded commit. Each declared binding has a recorded minimum number of files.

### Manifest

`fixtures/fbl/manifest.json`:

```json
{
  "sources": [
    {
      "name": "conformance",
      "repository": "https://github.com/etalii-adp/etalii.adp",
      "commit": "<40 hex digits>",
      "licence": "Apache-2.0",
      "from": "specifications/fbl/",
      "to": "fixtures/fbl/conformance/",
      "files": { "<path under to>": "<SHA-256, hex>" }
    }
  ]
}
```

Rules: every file under a source's folder is listed and has the listed digest; nothing listed is missing.

### Test baseline

`test/core/fbl/baseline.json`: 86 entries.

```json
{
  "baseline": { "repository": "etalii.adp.ide.standalone", "commit": "25fc7b4a", "tests": 86 },
  "tests": [
    { "source": "Loading/Loading.Tests.cs", "test": "ADuplicateKeyAnywhereIsRejectedAtItsPointer", "file": "test/core/fbl/loading.test.ts", "title": "a duplicate key anywhere is rejected at its pointer" },
    { "source": "RealFiles/ModuleCrossCheck.Tests.cs", "test": "TheBindingReadsTheIdsTheModuleReads", "notApplicable": "<reason>" }
  ]
}
```

Rules: exactly the 86 names of [contracts/test-baseline.md](contracts/test-baseline.md); each entry has a counterpart or a reason, never both; a counterpart's title occurs in its file; only the entries that contract allows are not applicable.

### Divergence record

`test/core/fbl/realFiles/divergences.json`: `{doc, divergences: [{property, binding, file, observed, reason}]}`.

| `property` | Recorded when |
|---|---|
| `unreadable` | A real file a declared binding claims does not read. |
| `edit`, `remove` | The edit or removal property does not hold for a file. |
| `registration-body`, `registration-view`, `registration-resource`, `registration-layout` | A registration does not find its body, its view or its resource, or stores positions under ids the body does not have. |
| `reading-suggest` | A W3C reading's `suggest` does not match the body its registration names. |

Rules: a disagreement that is not listed fails its test; a listed one that no longer occurs, or is observed differently, fails; every entry has a reason and names a file of the corpus.
