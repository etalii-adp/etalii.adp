# Research: The Agent Activity Diagram's Definition

Read against FBL 0.3 (`specifications/fbl/FBL-specification.md`) and DISL 0.3 at `e3c264f`, the validator `.github/scripts/validate-examples.py`, and the standalone design's sections *The activity file*, *Language decisions* and *The DISL specification* at `08d917f`. Task T001 tried the file's shape with a draft binding (`definitions/diagrams/agent-activity-diagram.fbl`), its first fixture (`specifications/fbl/fixtures/agent-activity-read/`) and a draft specification holding the metamodel only.

## R1. Can a relation be a reference attribute that is drawn, connected and disconnected? (L8)

**Yes, with DISL 0.3 as it stands.** Three pieces, each already specified:

- **Stored.** FBL 5.2's `reference: { to, by: "id" }` binds the key: `specification: s-knowledge` on an agent names the specification by the id it stores with `id.from`. A rename rewrites it (FBL 5.7) and a dangling one is `fbl.dangling-reference` (FBL 7.4).
- **Drawn.** A derived relation in the object form (DISL 4.11.3) draws one line per element whose key names an element: `from: diagram.nodesOfType('Agent').filter(e, e.specification != null)`, `source: item.specification`, `target: item`, `sources: [item]`. Its id is `specification:<agent id>`, stable as long as the agent's is.
- **Edited.** DISL 4.11.4 maps a gesture on a derived element to an operation through `edits`: `connect` to an operation that sets the key (`set`, 9.4) and `delete` to one that clears it (`unset`). Agent Behavior Modelling's `Child` relation is the precedent: a derived relation whose `connect` runs `moveUnder`.

Deleting the element a key names clears the key (DISL 4.8, and `references: "unset"`, the default of a type's deletion policy, 9.5), which FBL writes as a `remove-key` because each relation key has `empty: "remove"`. The relation therefore never outlives its end and needs no cascade. "At most one" is the file's shape: an agent has one `specification` key. Refusing a second specification by a gesture (standalone Q6) is a gesture constraint on `connect` that holds while `self.source.specification` is already set; it is written in T004.

No language changes for L8, and `relations:` lists, the fallback, are not needed.

## R2. How is a placement or a group state identified without an id key?

**By the element it names, and for a group state also by the group.** FBL 5.3 says an entry whose rule has no `id` gets the id DISL derives. DISL 11.5.2 forbids an identity expression from reading the id of an element other than an ancestor or a relation's ends, so a placement cannot derive its id from the element it references as a model element would. It does not have to: under L7 a placement and a group state are not elements of the model but view data bound onto entries of the body (`persistence.view.bind`, DISL 0.4). DISL 0.4 therefore says that such an entry is keyed by the element it names (and the group) and that its id, where a host needs one, is `pinned:<element>` and `groups:<element>#<group>`, which is what the fixtures list. Two entries for the same key are a duplicate: the first in document order applies, as DISL 11.5.4 does for ids.

The binding gives `element` a reference by id to the five element rules, so a rename rewrites it (FBL 5.7) and removing an element removes its placement and its group states (`remove.cascade`, FBL 6.2), which is standalone Requirement 8.8.

## R3. Can a rule at `/` bind `view.showArchived`? And can `view` hold the placements and the groups?

**Reading, yes; writing, not in every file.** A rule at `/` binds root keys (as `databricks-pipeline.fbl` and `knowledge.fbl` do), and a slot with `child: "view"` reads `view.showArchived` (as `databricks-job.fbl` reads `new_cluster.spark_version`). But FBL can create one missing level only:

- `absent: "insert"` inserts a key into a mapping that exists; for a YAML or JSON slot reached through `child`, nothing creates the mapping when it is missing (`create` on an attribute binding is for XML).
- `insert.create` creates the container of an entry when it is missing, at `end-of-document`, before or after a key, or `{under: selector}`; when the selector's own container is missing too, nothing says what happens.

In a new file, or one an agent wrote without `view:`, the first lock, fold or switch would need both `view:` and `placements:` created, which two hosts would write differently or refuse. This is the problem etalii.adp spec 013 met with a view's nested `group` and `filter` mappings (013 research R3), solved there by flattening.

Put to the maintainer as a selection on 2026-10-09 (standalone Requirement 1.4):

| Option | Cost |
|---|---|
| **Flat keys (recommended):** `placements:`, `groups:` and `showArchived:` are top-level keys, each created at the end of the file when missing, or after the header for the switch | No language change. The user's part is three keys rather than one, which the agents' instruction text names. |
| **FBL 0.4:** keep `view:`, and FBL creates (and removes when empty) every missing level, and an attribute's `child` mapping in YAML and JSON | A change to FBL, which the design said would not change, and to every host's FBL runtime and the Notion host's copy, with fixtures for each. |
| **Template only:** keep `view:` and write it in every new file | A file without `view:` cannot be locked, folded or switched until someone adds it; ADP refuses with a reason. |
| **Other** | |

Until the answer, the binding and the fixtures follow the recommended option.

## R4. Can a rule at `/` bind `showArchived` at the top level?

**Yes.** The rule `diagram` at `/` binds the header read-only and `showArchived`, and the specification maps the rule's type to the diagram (`typeMap`, `as: "diagram"`). Setting it while the key is absent is an `insert-key` at the place the attribute order gives (FBL 6.1): right after the header, the one attribute bound before it.

## R5. A new file holds the header only

The design's new file has "the header, five empty lists". In YAML an empty list is written `[]`, a flow collection, whose only writable span is the whole collection (FBL 4.3): FBL defines no way to add the first entry to it. The template is therefore `agent-activity-diagram: 1` alone, and each list is created at the end of the file with its first entry (`insert.create`, `at: "end-of-document"`) and removed with its last (`remove-when-empty`). `agent-activity-diagram.md` tells agents to leave an empty list out rather than write `[]`. This changes no language and no requirement; by standalone Requirement 1.6 the definition wins and the design is amended.

## R6. Where a list created inside an entry goes

A specification's `tasks` and a location's `pullRequests` are created by `insert.create` with `{after: key}`, right after a key every entry has: `status` for a specification and `branch` for a location. So the keys are ordered `id, project, name, link, status, tasks` and `id, agent, environment, folder, folderLink, branchLink, branch, pullRequests`, the list last, which the binding's `insert.keys` and the example in `agent-activity-diagram.md` follow.
