# Databricks pipeline: what DISL does not say

This is the companion to [databricks-pipeline.dis](databricks-pipeline.dis). The DISL file specifies the pipeline diagram's metamodel, notation, toolbox, forms, constraints, operations, layout choice and persistence. This page holds everything about the tool that DISL cannot express or can only approximate, each item traced to where it comes from.

It describes the tool as implemented in the standalone IDE, in `src/diagrams/databricks/` of [etalii.adp.ide.standalone](https://github.com/etalii-adp/etalii.adp.ide.standalone). That module serves three tools from one engine: this one, [databricks-job](databricks-job.dis) and [databricks-bundle](databricks-bundle.dis). Much of what is shared (the two-file storage, the `.adp` registration, the line-splicing writer, simulated actions, the Workspace placeholder) is described once in [databricks-job.md](databricks-job.md) and applies here unchanged. The module's original specification lives in that repository's history as `.spec-workflow/archive/specs/databricks-diagrams/` (requirements R1 to R13 and a design), removed from the tree in commit `53f68611`; requirement numbers below refer to it.

## Identity

| Aspect | Value | Source |
|---|---|---|
| MIME type | `databricks/pipeline` | `backend/.../Diagram.cs` |
| Display name | Databricks pipeline | `Diagram.cs` |
| Icon | `mdi-pipe` | `Diagram.cs` |
| Extension | `.json` for a bare settings file; the diagram also opens a pipeline in `.yml` or `.yaml`. Shared: claimed only through a `.adp` registration | `Diagram.cs` (`SharedExtension: true`), `DatabricksSelection.cs` |
| State | ⚗️ Prototype | standalone `docs/tools.md`, Notion "Tools" |
| Notion row | Kind Diagram, family "Data platforms & pipeline orchestration", focus area "Software delivery", rarity "Adoption from standard". Purpose: "Trace how data flows through the tables and views of a Databricks declarative pipeline." | Notion "Tools" database |

### The Notion row describes a different diagram

The Notion row promises the **dataset graph**: the streaming tables, materialized views and flows a pipeline defines, and how data moves between them. The implementation draws the **settings flow**: source libraries into the pipeline into its catalog and schema. The original specification chose this deliberately and put the dataset graph out of scope, because the datasets are defined in the libraries' Python and SQL code, not in the settings file, and reading them means parsing that code. The DISL file specifies what is implemented. Either the Notion text or the tool should change; nothing in the project conversations records a decision either way.

## Where the diagram lives

As for the job ([databricks-job.md, "Where the diagram lives"](databricks-job.md#where-the-diagram-lives-two-files-neither-of-them-did)): the model is Databricks' own file, which ADP reads and splices but never adds to, and the view is the `layout:` block of the `.adp` registration. The file can be either of two shapes (`PipelineParser.cs`):

- **A pipeline resource in a bundle**: `resources.pipelines.<key>` in `databricks.yml` or an included resource file. When the file declares several, the `.adp`'s `resource:` header picks one; the shipped example (`examples/lakehouse/databricks.pipeline.adp`) is

  ```
  databricks/pipeline
  body: databricks.yml
  resource: bronze_to_gold
  ```

- **A bare pipeline settings file**: a JSON (or YAML) document whose root has `name` or `libraries`, as the Databricks pipeline UI and API export it. JSON is read through the YAML reader, since JSON is YAML.

The DISL `files.model` pattern `{name}.json` names only the second shape.

### How the settings are read

| Settings | DISL |
|---|---|
| `name` | `Pipeline.name` |
| `catalog` | `Pipeline.catalog` |
| `schema`, or the legacy `target` when there is no `schema` | `Pipeline.schema` |
| `serverless`, `continuous`, `development` | `Pipeline` flags |
| `channel` | `Pipeline.channel` |
| `libraries[]`: `{ notebook: { path } }`, `{ file: { path } }`, `{ glob: { include } }` | `Library` with `kind` and `path` |
| any other library entry (`jar`, `whl`, `maven`, …) | `Library` with kind `other` and an empty path |
| `notifications[]` with `email_recipients` and `alerts` | `Notifications.entries` |

Every other key (clusters, configuration, photon, edition, event log, …) is kept untouched and not modelled. The parser records them as unmodelled nodes, but this diagram does not draw them, unlike the bundle's.

Libraries of kind `other` all get the element id `library:` (an empty path), so a pipeline with two of them draws one box, and the DISL file's `minLength: 1` on `path` is stricter than what is read.

### How the settings are written

The same line-splicing discipline as the job (`PipelineWriter.cs`): an untouched file saves byte for byte, refusals come before any splice, and each edit's inverse is a snapshot of the whole document. Both syntaxes are written in their own style:

- **Adding a library** appends after the last library, at its indentation. In YAML the entry is

  ```yaml
  - notebook:
      path: <path>
  ```

  (or `file:`; a glob would use `include:`), creating the `libraries:` key when there is none. In JSON the previous last item gains the comma that separates it, and the new item is written on one line as `{ "notebook": { "path": "<path>" } }`. A JSON file with no library at all is refused ("The settings file has no libraries array to add into."). Refused too when the path is empty ("A library needs a path.") or the same kind and path exist ("The notebook library 'x' is already there.").
- **Removing a library** removes its lines; in JSON, removing the last item also removes the trailing comma from the new last one. Removing the only library is refused ("A pipeline needs at least one library; removing the last one is not allowed.").
- **Setting name, catalog, schema or channel** rewrites the value on its line, keeping JSON's quoting and trailing comma or YAML's value style. A key the file does not have is inserted in YAML but refused in JSON ("The settings file has no "catalog" to rewrite."), because a JSON object cannot gain a line without comma surgery. An empty name is refused ("A pipeline needs a name."). Setting the schema writes a `schema` key; a file that only has the legacy `target` gains a `schema` line in YAML, and is refused in JSON.

The flags `serverless`, `continuous` and `development` are read-only in the DISL file because nothing writes them.

### Creating a new pipeline file

`DatabricksDocumentFactory.cs` writes a bare settings file, in CRLF:

```json
{
  "name": "<key>",
  "libraries": [
    { "notebook": { "path": "transformations/<key>" } }
  ]
}
```

The key is the base name lowercased with non-alphanumeric characters folded to `_`, or `untitled`.

## Element ids

Every non-library element has a fixed id, since there is exactly one of each:

| Element | Id |
|---|---|
| Library | `library:<path>` |
| Pipeline | `pipeline` |
| Target (DISL `Destination`) | `target` |
| Compute | `compute` |
| Notifications | `notifications` |
| Flow from a library | `flow:<path>->pipeline` |
| Flow to the target | `flow:pipeline->target` |

These are also the keys of the `.adp` `layout:` block. DISL's `natural` strategy with prefixes only covers the library and flow ids.

## Layout

The plugin layout `flow` (`DatabricksPipelineLayout.cs`):

- Libraries at x 0, stacked in file order with row pitch 120.
- The pipeline at x 320 and the target at x 640, both at y = (number of libraries − 1) × 120 / 2, the sources' vertical middle (0 when there are none).
- Compute at x 0 and notifications at x 320, both at y = max(number of libraries, 1) × 120 + 80.

It runs on every load; positions stored in the `.adp` override it per element.

## Notation details DISL approximates

- All nodes are 200 by 56 boxes with a left-aligned, truncating label and one badge line beneath.
- A library's label is its path and its badge its kind. The pipeline's label is its name; its badges, joined by " · ", are whichever of `serverless`, `continuous`, `development` apply, then the channel. The target's label is `catalog.schema`, or whichever of the two is set. Compute reads `serverless` or `cluster`. Notifications reads the recipients of every entry joined by ", ".
- DISL has no way to make a node's label come from another node's attributes except CEL over `diagram`; the DISL file does that for the target and compute, which in the implementation are just boxes the backend labels.
- Flow edges are the same bezier as the job's dependencies, from right edge to left edge, with an arrow. There are no edges to compute or notifications.
- Nothing is connectable, and no label can be edited in place; the pipeline's name is edited in the property grid.

## Interactions

| Gesture | Effect |
|---|---|
| Add notebook library… or Add file library… on the pipeline, or the toolbox entries | Asks for the path, then adds the library |
| Delete, or Remove library, on a library | Removes it |
| Start update (simulated) on the pipeline | Plays a mock update |
| Drag any element | Stores its position in the `.adp` |
| Property grid on the pipeline | Name, Catalog and Schema (Identity), Channel (Execution), all editable |

Every selection's grid also shows "Workspace connection" (always "Not connected", a placeholder) and "Last simulated run" (empty), both read-only. Glob libraries can be read and removed but not added; the toolbox and menu offer only notebook and file.

## Simulated update

"Start update (simulated)" (`databricks.simulated.pipeline-update`) is a mocked domain action, played on the canvas by the same client-side engine as the job's run ([databricks-job.md, "Simulated runs"](databricks-job.md#simulated-runs)): nothing is sent, written or put on the undo history. It is a ripple: the libraries, the pipeline and the target, in order of x then y, run and succeed one after another, one step every 700 ms. The banner reads "Simulated: pipeline update".

## Validation

The DISL constraints carry the implementation's rule ids in `x-adp-ruleId` and its messages; findings point at the pipeline's first line in the file. The two delete and create constraints in the DISL file are the writer's refusals, not validator findings.

## Gaps against the original specification

Specified but not implemented:

- The pipeline node does not show the edition or photon, there is no clusters summary (compute says only serverless or cluster), and the notifications node does not show which events send them (R5).
- No "Full refresh (simulated)" (R8), and no continuous or development toggle (R8).
- The property grid edits only name, catalog, schema and channel; the specification also made `edition`, `serverless`, `photon`, `continuous` and `development` editable, gave the compute node a cluster summary and the notifications node an editable recipient list (R10.3).
- No "Change path…" on a library (R11.5).
- A new pipeline file starts with one library rather than the empty list the specification described (R1.4); an empty list would be refused by the validator and could not gain a library in JSON.
- The Add flow does not suggest this type for a settings file (R1.2).

The dataset graph the Notion row describes is out of scope by design, as above.
