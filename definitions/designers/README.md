# Designer definitions

This folder holds the files for ADP's designer types, the form-based visual layouts in which nothing is connected:

- **DESL specification files** (`.des`), in which a tool engineer specifies one designer type ([DESL](../../specifications/desl/DESL-specification.md));
- beside each, a `.md` file holding what DESL cannot express, the FBL bindings (`.fbl`) its documents are read and written through, and the JSON Schema and examples of those documents.

| Designer | Origin | Files |
|---|---|---|
| Knowledge | `etalii/knowledge` | `knowledge.des`, `knowledge.md`, `knowledge.fbl`, `knowledge.schema.json`, `examples/` |

DED, the Designer Definition Language (`.ded`), is still a placeholder ([DED](../../specifications/ded/DED-specification.md)): designer documents are stored through FBL. The words used here are defined in [docs/terminology.md](../../docs/terminology.md).
