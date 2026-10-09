# Designer definitions

This folder holds the files for ADP's designer types, the form-based visual layouts in which nothing is connected:

- **DESL specification files** (`.des`), in which a tool engineer specifies one designer type ([DESL](../../specifications/desl/DESL-specification.md));
- beside each, a `.md` file holding what DESL cannot express, the FBL bindings (`.fbl`) its documents are read and written through, and the JSON Schema and examples of those documents.

| Designer | Origin | Files |
|---|---|---|
| Knowledge | `etalii/knowledge` | `knowledge.des`, `knowledge.md`, `knowledge.fbl`, `knowledge.schema.json`, `examples/` |

A designer's documents are DED definitions ([DED](../../specifications/ded/DED-specification.md)): each begins with DED's envelope, naming DED's version and its designer type, and is read and written through the FBL bindings of its designer type's specification. The words used here are defined in [docs/terminology.md](../../docs/terminology.md).
