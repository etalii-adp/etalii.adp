# DED — Designer Definition Language

**Specification, no version yet (Placeholder)**

|   |   |
|---|---|
| Kind | designer |
| Role | definition language |
| File extension | `.ded` |
| Paired language | DESL, the Designer Specification Language (`.desl`) |
| Schema | none yet |

---

## Status of this document

This is a placeholder. It holds nothing normative: no construct, no schema and no examples. It exists so that each kind of ADP tool has its specification language and its definition language in one pattern, as the [terminology](../../docs/terminology.md) and the constitution's Structure and Naming section require. Its content is to come, when a designer needs it (constitution principle V).

## Purpose

DED will specify how a designer a user created of a designer type is stored. A DED file (`.ded`) will hold one such designer and name the DESL specification it was made with, as a DID file does for a diagram.

When content arrives, it follows the pattern of [DISL](../disl/DISL-specification.md) and [DID](../did/DID-specification.md): this document, the schema `ded.schema.json` with `$id` `https://etalii.net/adp/ded/schema/<version>/ded.schema.json`, the version key `"ded": "<version>"`, and examples with the extension `.ded`, side by side in `specifications/ded/`.
