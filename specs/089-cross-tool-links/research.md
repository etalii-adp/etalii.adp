# Research: Links Between Tools

Each item: decision, rationale, alternatives considered.

## R1. Where the link is defined once (FR-028)

- **Decision**: FBL, as a new section 17 *Links between documents* in FBL 0.23.
- **Rationale**: FBL already serves diagrams and designers alike (FBL 1.3), and already owns ids as stored (5.3), references and their rewrite (5.7), the registration (8), several readings of one body (9), folders (10) and routing (12): everything a link needs that is not one language's metamodel. DISL and DESL each define their own constructs and neither takes from the other (FBL 1.3), so a definition shared by both cannot live in either. Every one of the four tool types is read through FBL.
- **Alternatives**: a new small specification ("ADP links"): a ninth document for one section, and it would still have to refer to FBL for ids and routing. ATD: ATD describes tool types, while a link is a property of documents and their files.

## R2. The 8-character id (FR-001, FR-003)

- **Decision**: DISL 11.5 and DESL 5.3 give the `nanoid` strategy (DESL gains it) two properties, `alphabet` (default nanoid's 64 characters; `base36` for `0-9a-z`) and `length` (default 21). The document id and the new element ids of the four tool types use `{ "strategy": "nanoid", "alphabet": "base36", "length": 8 }`. Existing ids stay as written (DISL 11.5.1: a hand-written id matching `pattern` is accepted whatever the strategy).
- **Rationale**: `nanoid` is already a DISL strategy; two settings make it state the maintainer's form without a new strategy. 36^8 ≈ 2.8·10^12: for a workspace of 10,000 documents the chance of any clash is about 1.8·10^-5, and a clash is still resolved by the name part and the ambiguity finding.
- **Alternatives**: a new strategy `short`; `uuid-v4` truncated (an id is opaque, DISL 11.5.1 forbids decoding, but truncating is generating, not decoding; rejected as less clear than nanoid's own length).

## R3. Where each document keeps its id (FR-001)

- **Decision**: FBL 0.23 adds `document.id` to a binding: a slot of the body's root that holds the document id, written with the template and, for a body read without one, by the load-time step (contracts/resolution.md, step 0). Per tool type: knowledge, DED 0.3's envelope gains `id` (`id: k3f9x2ma` beside `ded` and `designer`; `id="…"` on XML's root `<ded>`); timeline and dependency graph, a top-level `id` key beside `timeline: 1` and `elements`; mind map, a Freeplane attribute `adp-id` on the root node (`<attribute NAME="adp-id" VALUE="…"/>`), the maintainer's card.
- **Rationale**: each body keeps its id where the format already keeps identity; Freeplane keeps node attributes it does not know on save, which is why the maintainer chose it.
- **Alternatives**: the `.adp` registration (FBL 8): not every file has one (a knowledge file is recognised by its envelope, a `.mm` on sight), and a copied body without its registration would lose its identity, the case the maintainer named.

## R4. The link in a diagram: linked elements (FR-016, FR-019, FR-020, FR-023)

- **Decision**: DISL 0.12 adds an attribute type `link` (a string in the form of FBL 17.1) and lets an element type declare `linked: { attribute, shows }`: the element stands for the target of its `link` attribute, draws the target's current name in place of its label, and `shows` lists target attributes (by the target type's names) drawn with their current values. `linkable: { nameProperty }` on an element type says its elements can be linked to and which attribute names them. A standard action `{ "lookup": { "create": TypeRef, "as": "child" | "at" } }` opens the host's lookup and creates an element of `create` with the picked link, as a child of the context element or at the pointer.
- **Rationale**: a linked element is an element of the diagram (the maintainer's card), so it is placed, connected and deleted by the type's own gestures (FR-023); only its label and badge come from the link. One standard action serves three diagram types (FR-019, the maintainer's "reusable concept, probably a context menu action").
- **Alternatives**: a link as a decoration on any element (the card's option B, not chosen); a per-type gesture (three copies of one thing).

## R5. The link in the Knowledge designer: the relation picker (FR-021, FR-025)

- **Decision**: DESL 0.5 adds the value type `link` and, for a property whose value type is a relation, a standard picker with Notion's behaviour: type-ahead search of the target document's linkable rows by their name property, chosen rows as removable chips, "create new row" when nothing matches, and `limit: one` replacing. The relation's `targetFile` becomes `target`, a link without its element part.
- **Rationale**: the Knowledge designer already follows Notion's table (knowledge.des summary); its relation becomes an ordinary DESL link list, and the picker is DESL's, so any later designer type with links gets it.

## R6. ATD

- **Decision**: ATD gains the members `link` (attribute type), `linked { … }`, `linkable { … }`, the action `lookup`, and in persistence `document id { … }`, each mapping to the JSON constructs above as ATD's tables state; the grammar, its tables and its highlighting are regenerated with `atd-grammar.py`, and the four tool descriptions and traces are updated.
- **Rationale**: ATD is top priority and every tool description must say what its JSON says (spec 035 phase 1).

## R7. Mind map (FR-020, FR-024)

- **Decision**: a linked node is a Freeplane node whose `TEXT` is the cached name and which has an attribute `adp-link` holding the link. The lookup action on a node adds such a node as its last child. Nodes are `linkable` with `nameProperty: text`.
- **Rationale**: Freeplane shows the node as an ordinary node with an attribute (FR-024, SC-006); Freeplane's own `LINK` attribute holds URIs, and a link is not one, so it is not reused.

## R8. The mind map's plugin contract

- **Decision**: the plugin `net.etalii.adp.freeplane.mm` (FBL 11) gains, in its contract stated in `mindmap.md` and `mindmap.fbl`'s `doc`, reading and writing the root node's `adp-id` and a node's `adp-link`, with the reading and splice rules of the attributes it already handles. Its version requirement moves to `^0.2.0`.
- **Rationale**: the mind map's body is read by a plugin, not by declared rules (mindmap.fbl), so the contract is where FR-001 and FR-007 are stated for it.

## R9. The knowledge file's conversion (FR-026)

- **Decision**: knowledge.md states the conversion, and knowledge.fbl reads both forms. A relation `target: <path>` becomes `target: $<id>@<name>`; each cell's row id `r` becomes `$<id>@<name>#r.<title-property>=<title>`; a counterpart property (`computed: true`) found in a converted file is removed, and its name is written on the relation that names it as `backlinkName`, by the conversion of the file that holds that relation, which reads the counterpart's file read-only. A target without a document id gets one first, by its own load-time step, when it is loaded; a conversion that finds a target without an id leaves that relation in the old form and converts it on a later load.
- **Rationale**: the maintainer's card (convert every file once) with the one-way rule: no file is written while another is loaded, except for its own id.
- **Alternatives**: writing the target's id from the source's conversion (writes a second file, against the one-way rule).

## R10. Timeline and dependency graph (FR-020, FR-023)

- **Decision**: each gets a linked element type, `LinkedEvent` (timeline: placed by its own `begin`, `end`, `row`) and `LinkedNode` (dependency graph: its own `x`, `row`), stored as an entry of `elements` with a `link` key; the binding's rule picks it by the key. Both are `linkable` (events and nodes by `label`). The canvas context menu gets the `lookup` action with `as: "at"`.
- **Rationale**: a linked element keeps its own placement, which belongs to the consuming diagram; the target's attributes are only shown.

## R11. A check the Build can run

- **Decision**: `specifications/fbl/fixtures/links-workspace/` holds a small workspace (two knowledge files, a mind map, a timeline, a dependency graph, a copy, a moved file and an old-form knowledge file) and `conformance.json`: per link, the expected target path and element id or finding, and per document the expected rewritten link texts after load. `validate-examples.py` parses every link against FBL 17.1's grammar and replays resolution (contracts/resolution.md) over the fixture, the same way it replays other FBL fixtures.
- **Rationale**: SC-002, SC-003 and SC-004 become checks; resolution is pure over files, so it can be stated and checked without a host.

## R12. Delivery order

- **Decision**: pull requests in this order: FBL 0.23 with the fixture; DED 0.3; DISL 0.12; DESL 0.5; ATD; then the knowledge, mind map, timeline and dependency graph definitions, each with its fixture rows; and the standalone bindings' pull request with the diagram types'. Each merges with auto-merge on.
- **Rationale**: each language change is reviewed on its own, and each tool type can only refer to constructs that exist.
