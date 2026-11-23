# Contract: What Each Language and Tool Type Declares

## FBL 0.23

- Binding: `document: { id: Slot }`: where the body keeps its document id (yaml/json: a root key; xml: a root attribute or, through a plugin, what its contract says).
- Section 17: the link (17.1), the workspace and index (17.2), resolution (17.3), load-time validation (17.4), backlinks (17.5), findings (17.6).

## DED 0.3

- The envelope gains `id` (YAML/JSON key, XML root attribute), the document id of FBL 17.

## DISL 0.12

- `persistence.ids`: `nanoid` with `alphabet` and `length`; `persistence.documentId`: the same rule for the document id.
- Attribute type `link`.
- Element type `linkable: { nameProperty: AttrRef }`.
- Element type `linked: { attribute: AttrRef, shows: [ { label, attribute } ] }`.
- Action `{ "lookup": { "create": TypeRef, "as": "child" | "at", "origins": [origin…]? } }`: opens the host's lookup over the workspace's linkable elements (of the listed origins, else all), and creates the element with its `link` set, in one transaction.
- Appendix D.2, question 1: answered, pointing at FBL 17.

## DESL 0.5

- `persistence.ids`: `nanoid` with `alphabet` and `length`; `persistence.documentId`.
- Value type `link`; a property of value type `relation` holds links, with `target` (a document link), `limit` and `backlinkName`.
- The relation picker (standard): type-ahead over the target's linkable rows by their name property, chips, "create new row" (one step over two documents, DESL 5.4), `limit: one` replaces.
- Element type `linkable: { nameProperty }`.
- Section 3's cross-document reference: points at FBL 17.

## ATD

The statement `lookup <Type> child | at [from ["<origin>", …]] [as <name>]` for DISL's action `lookup`, with the keywords `lookup` and `child`; the `link` type, `linkable`, `linked` and `documentId` are settings of `attribute`, `element` and `persistence`, which already carry their neighbours, so they need no new construct. Each has its row in Appendix C and the amendment entry in ATD's Changes (implementation, 2026-11-23).

## The four tool types

| Tool type | Document id | Linkable (name property) | Holds links as |
|---|---|---|---|
| Knowledge designer | DED envelope `id` | Row (the title property) | Relation cells; relation `target` |
| Mind map | root node attribute `adp-id` | Node (`text`) | Linked node: attribute `adp-link`, `TEXT` the cached name; `lookup` as child |
| Timeline | top-level `id` | Event (`label`) | `LinkedEvent` in `elements` with `link`; `lookup` at the pointer |
| Dependency graph | top-level `id` | Node (`label`) | `LinkedNode` in `elements` with `link`; `lookup` at the pointer |
