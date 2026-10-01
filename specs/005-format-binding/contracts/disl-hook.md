# Contract: the DISL persistence hook

The only change this feature makes to DISL (FR-003, research R2). Owned by feature 005; agreed with feature 004 (DISL 0.2), which does not touch §11 except §11.5 Identifiers. DISL 0.2 merged first (pull request 42), so the hook is carried in the 0.2 document and schema.

## Document (`DISL-specification.md`, §11.2)

The `format` row gains `"fbl"`, and the table gains one row:

| Property | Type | Description |
|---|---|---|
| `binding` | URI reference or FBL Binding | Required when `format` is `"fbl"`: the binding that reads and writes the model, as `<uri>#<name>` of an FBL document ([FBL-specification.md](../fbl/FBL-specification.md)), or an inline binding. |

One paragraph after the table states, normatively:

- When `format` is `"fbl"`, the stored model is the body the binding describes, not a DID definition. `files`, `encoding`, `indent`, `newline`, `finalNewline`, `compression`, `ordering`, `omitDefaults`, `precision`, `timestamps`, `canonical`, `metadata` and `definition` **MUST NOT** be given, because FBL writes by splices and keeps the file's own conventions. `view`, `migrations`, `collaboration`, `import` and `export` keep their meaning; view data is stored in the registration (FBL).
- A specification whose `format` is `"fbl"` needs no persistence plugin, and DISL §13.1's refusal for a missing required plugin applies only to a plugin the binding's reader names.

§1.2 or §11.1 gains one informative sentence pointing at FBL for tools whose model is another tool's file. §14.2 and §14.5 gain one sentence each: loading and saving a body with `format: "fbl"` follow FBL's processing model instead of DID's.

## Schema (`disl.schema.json`, `$defs/Persistence`)

- `format.anyOf[0].enum` gains `"fbl"`.
- `properties.binding`: `{"anyOf": [{"type": "string", "format": "uri-reference"}, {"$ref": "https://etalii.net/adp/fbl/schema/0.1/fbl.schema.json#/$defs/Binding"}]}`.
- An `if`/`then`: when `format` is `"fbl"`, `binding` is required and the DID writer settings listed above are forbidden.

## Examples

No DISL example changes: rewriting the definitions to use FBL is follow-up work (FR-091). The FBL folder gains `timeline.dis`-shaped evidence instead: the FBL document shows, in an informative section, the `persistence` object `definitions/diagrams/timeline.dis` would have.
