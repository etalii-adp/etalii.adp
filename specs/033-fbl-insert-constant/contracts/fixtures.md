# Contract: the fixtures and the refused binding

All under `specifications/fbl/`, each fixture folder with its own binding (`board.fbl`), its body and its `fixture.json` against `$defs/Fixture` (section 15.3). Bodies are CRLF, as `insert-empty-*` are, so that offsets are stated against bytes git does not convert (`.gitattributes` already marks `specifications/fbl/fixtures/**` `-text`). `refused/` holds no offsets and needs no rule.

| Folder | Family | Shows |
|---|---|---|
| `fixtures/insert-constant-yaml/` | yaml | An add of a `task` with its constant at its place in `keys` (`id`, `type`, `name`); an add of a `note` whose two constants `keys` does not name, written after its keys in member order, one of them `"1.0"` quoted by the plain-safe rule; a set of the new task's name that leaves the constant's bytes as they are; the undo and redo of the first add (FR-002, FR-003, FR-004, FR-005, FR-011; US1 scenarios 1, 2, 4, 5, 6). |
| `fixtures/insert-constant-yaml-read/` | yaml | The body the last step above expects, byte for byte, read: each new entry is an element of the rule that added it, with its attributes (FR-009; US1 scenario 3). |
| `fixtures/insert-constant-json/` | json | The same steps; the new entries have the same keys in the same order as in yaml (FR-011). |
| `fixtures/insert-constant-json-read/` | json | The read-back of the json body (FR-009). |
| `refused/insert-constant-collision.fbl` | yaml | A rule whose constant's key `type` is also the key of a writable attribute binding: valid against the schema, refused by section 14.1 step 6 (FR-006; US2 scenario 1). Beside it, in the same document, a second binding whose `type` is read by a read-only attribute is not refused, so the document fails for the one reason its `doc` names (US2 scenario 2). |

The validator's contract for `refused/`: every `*.fbl` there validates against the schema and fails at least one check of section 14.1; the validator prints each refusal and fails the run when a document there is accepted, or is refused by the schema instead.
