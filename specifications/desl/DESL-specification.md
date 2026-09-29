# DESL — Designer Specification Language

**Specification, no version yet (Placeholder)**

|   |   |
|---|---|
| Kind | designer |
| Role | specification language |
| File extension | `.desl` |
| Paired language | DED, the Designer Definition Language (`.ded`) |
| Schema | none yet |

---

## Status of this document

This is a placeholder. It holds nothing normative: no construct, no schema and no examples. It exists so that each kind of ADP tool has its specification language and its definition language in one pattern, as the [terminology](../../docs/terminology.md) and the constitution's Structure and Naming section require. Its content is to come, when a designer needs it (constitution principle V).

## Purpose

In DESL a tool engineer will specify one designer type: how a form-based visual layout, in which nothing is connected, functions and looks. A DESL file (`.desl`) will hold one designer type, as a DISL file holds one diagram type. What users create of such a type is stored in DED, one designer per file.

When content arrives, it follows the pattern of [DISL](../disl/DISL-specification.md) and [DID](../did/DID-specification.md): this document, the schema `desl.schema.json` with `$id` `https://etalii.net/adp/desl/schema/<version>/desl.schema.json`, the version key `"desl": "<version>"`, and examples with the extension `.desl`, side by side in `specifications/desl/`.
