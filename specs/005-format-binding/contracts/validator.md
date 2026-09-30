# Contract: what CI checks

`python .github/scripts/validate-examples.py`, run by the Build workflow (FR-005, research R12 and R14), gains three kinds of example beside `*.dis` and `*.did`:

| File | Checked against | How |
|---|---|---|
| `*.fbl` | `fbl.schema.json#/$defs/Document` | parsed as JSON, validated like the other examples; the version key `fbl` names the schema |
| `*.adp` under `specifications/fbl/` | `fbl.schema.json#/$defs/Registration` | parsed from the line form (line 1 origin; `key: value` headers; `layout:` block of `  <id>: <x> <y>`) into the logical form, then validated |
| `fixtures/*/fixture.json` | `fbl.schema.json#/$defs/Fixture` | validated, then checked for consistency: for each step, applying its splices (UTF-8 byte offsets, non-overlapping, in the document before the step) gives the expected document, and applying their inverses gives the document before it; splice operation names must be in the catalogue |

A fixture's input and expected files are read as bytes; line endings and a byte-order mark are significant, so `specifications/fbl/fixtures/**` is marked `-text` in `.gitattributes` to keep Git from converting them.

The script's output stays one line per example; a fixture failure names the step and the first differing byte.
