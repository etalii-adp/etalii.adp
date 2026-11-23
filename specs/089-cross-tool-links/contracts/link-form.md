# Contract: The Link's Text Form (FBL 0.23, section 17.1)

The maintainer's form: `$[DOCUMENT-ID]@[DOCUMENT-NAME]#[ELEMENT-ID].[ELEMENT-NAME-PROP]=[ELEMENT-NAME]`.

## Grammar

The ABNF and the escaping rule are FBL section 17.1's; in short:

- `%` is escaped in every part; `#` in the document name; `$ @ # . =` in the document id, the element id and the name property. Every other character is written as it is, so a file name keeps its dots and a cached name its dots and equals signs.
- A reader splits at the first `@`, then the first `#`, then the first `.` or `=`, then the first `=`, and unescapes each part after.
- `name-prop` absent, or naming no attribute of the target: the target type's name property; load-time validation writes it.
- `name` absent: filled in at the next load (contracts/resolution.md).

## Examples

| Link | Meaning |
|---|---|
| `$k3f9x2ma@provinces.yaml#nh.name=Noord-Holland` | Row `nh` of the knowledge file `provinces.yaml`, named by property `name` |
| `$p0q7e2zd@release.tml#launch=Launch` | Element `launch` of a timeline, name property taken from the type |
| `$m8c1u4wa@ideas.mm#ID_1723.text=v1.2 scope` | A mind map node whose text is `v1.2 scope` |
| `$k3f9x2ma@provinces.yaml` | The document only |
| `k3f9x2ma@provinces.yaml` | Malformed: no leading `$` |
