# Databricks job: what DISL does not say

This is the companion to [databricks-job.dis](databricks-job.dis). The DISL file specifies the job diagram's metamodel, notation, toolbox, forms, constraints, operations, layout choice and persistence. This page holds everything about the tool that DISL cannot express or can only approximate, each item traced to where it comes from.

It describes the tool as implemented in the standalone IDE, in `src/diagrams/databricks/` of [etalii.adp.ide.standalone](https://github.com/etalii-adp/etalii.adp.ide.standalone). That module serves three tools from one engine: this one, [databricks-bundle](databricks-bundle.dis) and [databricks-pipeline](databricks-pipeline.dis). The module's original specification lives in that repository's history as `.spec-workflow/archive/specs/databricks-diagrams/` (requirements R1 to R13 and a design), removed from the tree in commit `53f68611`; requirement numbers below refer to it.

## Identity

| Aspect | Value | Source |
|---|---|---|
| MIME type | `databricks/job` | `backend/.../Diagram.cs` |
| Display name | Databricks job | `Diagram.cs` |
| Icon | `mdi-transit-connection-horizontal` | `Diagram.cs` |
| Extension | `.yml` (also `.yaml`), shared with every other YAML tool: the file is never claimed on sight, only through a `.adp` registration | `Diagram.cs` (`SharedExtension: true`), `DatabricksSelection.cs` |
| State | ⚗️ Prototype | standalone `docs/tools.md`, Notion "Tools" |
| Notion row | Kind Diagram, family "Data platforms & pipeline orchestration", focus area "Software delivery", rarity "Adoption from standard". Purpose: "Show the tasks of a Databricks job and the order in which they run." Why specialized: "Task dependencies in YAML read as a flat list; a graph shows the actual execution order and the critical path at a glance." | Notion "Tools" database |

The Notion row and the implementation agree on this tool. Nothing in the project conversations records a decision specific to it.

## Where the diagram lives: two files, neither of them DID

DISL assumes a diagram is stored as a DID definition. This tool stores none. `persistence.format` names the plugin `net.etalii.adp.databricks.files` and `files.mode` is `split`, which is the closest DISL gets; the reality is:

- **The model is Databricks' own file.** The job is the mapping `resources.jobs.<key>` in a Databricks Asset Bundle resource file (for example `resources/nightly_ingest.yml`) or in `databricks.yml` itself. Databricks' tooling owns the format; ADP reads and writes it and never adds anything of its own to it, positions included (R2, R7).
- **The view is the `.adp` registration.** A registration is ADP's own small text file beside the body:

  ```
  databricks/job
  body: resources/nightly_ingest.yml
  resource: nightly_ingest
  layout:
    task:ingest: 0 0
    task:quality_gate: 260 0
  ```

  The first line is the MIME type. `body:` names the YAML relative to the `.adp`'s folder. `resource:` picks one job when the file declares several; it is read from the first 8 lines only (`DatabricksHeaders.cs`), and without it the file's first job is used. `layout:` holds one `<element-id>: <x> <y>` line per element that the user has moved: the element's top-left corner, in canvas units, and nothing else (no size, no waypoints). `view.store: ["bounds"]` in the DISL file is the nearest DISL word; only the position part of bounds is kept.
- **Stored positions override computed ones element by element** (R7.4). An element without a stored line gets the computed layout. A stored id that no longer matches an element is ignored on read and dropped on the next write (R7.5).
- **A move is one undoable command** (`SetRegistrationLayoutCommand`, a core command), and it writes only the `.adp`; the YAML's bytes do not change. Without a registration there is nowhere to store a position, so moving is refused. Edges cannot be moved, and moving an element into a parent is refused (`DatabricksSession.cs`).

### How the YAML is read

`JobParser.cs` reads `resources.jobs.<key>`:

| YAML | DISL |
|---|---|
| `name` | diagram attribute `name` |
| `schedule.quartz_cron_expression` | diagram attribute `schedule` |
| a `continuous:` block | diagram attribute `continuous` |
| `tasks[]` with `task_key` | node `Task`, `key` |
| the task's `*_task` mapping | `type`, and `source` from the field listed below |
| `job_cluster_key` | `clusterKey` |
| `run_if` | `runIf` |
| `depends_on[]` with `task_key` and optional `outcome` | relation `Dependency` from the named task to this one, `outcome` |
| `job_clusters[]` with `job_cluster_key` and `new_cluster.spark_version`, `node_type_id`, `num_workers` | node `JobCluster` |

Task type and source field:

| Mapping | Type | Source field |
|---|---|---|
| `notebook_task` | notebook | `notebook_path` |
| `spark_python_task` | python | `python_file` |
| `python_wheel_task` | wheel | `entry_point` |
| `sql_task` | sql | the query, dashboard, alert or file id, or the file's path |
| `dbt_task` | dbt | `project_directory` |
| `pipeline_task` | pipeline | `pipeline_id` |
| `run_job_task` | run-job | `job_id` |
| `condition_task` | condition | `op` |
| `for_each_task` | for-each | `inputs` |
| `spark_jar_task` | jar | `main_class_name` |
| anything else | other | none |

DISL enum values must be identifiers, so `run-job` and `for-each` are written `run_job` and `for_each` in the DISL file; the implementation's wire values keep the hyphen.

Everything else in the job (retries, timeouts, parameters, email notifications, libraries, tags, permissions, a task's other fields) is read past and preserved untouched but not modelled. The job's `schedule` and `continuous` are parsed but not drawn (see the gaps).

### How the YAML is written

The persistence plugin is a line splicer, not a serializer (`JobWriter.cs`, `DatabricksSplices.cs`):

- The file is held as its raw lines plus a parsed model that knows each element's line range. Every edit replaces, inserts or removes the fewest lines it can, in the file's existing indentation. **An untouched file saves byte for byte**; the fixtures under `backend/.../Tests/Fixtures/` are the round-trip corpus, and are marked `-text` in `.gitattributes` by a narrow glob so git does not rewrite their line endings.
- A write the file could not accept is **refused before any splice**, never written and repaired, and the refusal's sentence is shown to the user (R6.4). The refusals are listed under "Interactions".
- Every edit is one command whose inverse is a snapshot of the whole document, so undo restores the exact bytes.
- A new task is inserted after the last task, as a skeleton for its type:

  | Type | Skeleton (`<source>` is `notebooks/<key>` for a notebook, `scripts/<key>.py` for Python, otherwise the key itself) |
  |---|---|
  | notebook | `notebook_task:` with `notebook_path: <source>` |
  | python | `spark_python_task:` with `python_file: <source>` |
  | wheel | `python_wheel_task:` with `package_name: <source>`, `entry_point: main` |
  | sql | `sql_task:` with `warehouse_id: ""` and `query.query_id: <source>` |
  | pipeline | `pipeline_task:` with `pipeline_id: <source>` |
  | run-job | `run_job_task:` with `job_id: <source>` |
  | condition | `condition_task:` with `op: EQUAL_TO`, `left: "<source>"`, `right: "true"` |

  Only notebook, Python and condition are reachable from the diagram today; the others exist in the writer for the toolbox entries the original specification asked for.
- Connecting adds a `- task_key: <from>` entry under the target task's `depends_on`, creating the `depends_on:` key directly under `task_key` when there is none. Disconnecting removes the entry, and the `depends_on:` key too when it was the last one, so undoing a connect restores the file byte for byte.
- Setting `run_if` or the cluster to empty removes the key rather than writing an empty value; that is how "absent means ALL_SUCCESS" and "absent means serverless" round-trip.
- Renaming a task rewrites its own `task_key` line and every `depends_on` `task_key` line naming it, in one command (R11.4).

A file that does not parse opens as unavailable, naming the parse error, and **every edit is withheld** until it parses again (R2.3). Constructs the reader does not know are kept as they are and never rewritten (R2.4).

### Creating a new job file

The Add flow's factory (`DatabricksDocumentFactory.cs`) writes, for a key derived from the file's base name:

```yaml
resources:
  jobs:
    <key>:
      name: <base name>
      tasks:
        - task_key: main
          notebook_task:
            notebook_path: notebooks/<key>
```

with CRLF line endings. The key is the base name lowercased, every non-alphanumeric character folded to `_`, and `untitled` when nothing is left.

## Element ids

DISL's `natural` id strategy with prefixes is the nearest match. The implementation's ids, which are also the keys of the `.adp` `layout:` block, are exactly:

| Element | Id |
|---|---|
| Task | `task:<task_key>` |
| Missing task | `task:<key>` (the same shape, marked unresolved) |
| Job cluster | `cluster:<job_cluster_key>` |
| Dependency | `edge:<from task_key>-><to task_key>` |

Because ids are keys, a rename changes the id, and a stored position under the old id is dropped.

## Layout

The DISL file names the plugin layout `jobColumns` and a declarative `layered` fallback. The plugin's exact rules (`DatabricksJobLayout.cs`):

- **Longest-path layering, left to right.** A task's column is the length of the longest chain of dependencies leading to it; column pitch 260, row pitch 120 (nodes are 200 by 56). Within a column tasks take rows 0, 1, 2 … in file order.
- **Cycle-tolerant.** Back-edges are excluded from layering, so a cycle neither hangs nor crashes the layout, and the back-edges are still drawn (R4.6).
- **A missing task sits one column left of the first task that depends on it** (column 0 at the least), in the next free row of that column.
- **Job clusters sit in a band beneath the tasks**: y = (deepest row index + 1) × 120 + 80, x = index × 260, in declaration order.
- Layout runs on every load; positions from the `.adp` then override it per element (`trigger: always`, `respect: all`).

## Notation details DISL approximates

- Tasks, missing tasks and clusters are 200 by 56 boxes. The label (the key) sits left-aligned just above the middle and truncates; beneath it one line of badges joined by " · ". A task's badges are its `run_if` when one is written, then its cluster key or `serverless`. A cluster's badges are its Spark version, node type and "N workers", each left out when empty.
- Condition tasks have corner radius 16.
- A missing task is dashed (5 4), transparent and at opacity 0.7.
- Dependency edges leave the source's right edge and enter the target's left edge as a cubic bezier whose control points reach 30 units out horizontally (`DatabricksCanvas.tsx`, `EDGE_REACH`), with an arrow. An outcome edge shows its outcome as a label at the midpoint, 6 units above the line, and is green for `true`, red for `false`.
- Colours are theme variables with fallbacks: success `#15803d`, danger `#dc2626`, muted text `#5a6376`, border `#8892a6`, primary `limegreen`. The DISL file writes the fallbacks where it needs a literal.
- Only the tasks' left and right side midpoints are connection anchors, and only a task can start a dependency. Clusters and missing tasks are not connectable.
- Edges cannot be selected on this canvas yet; the "Remove dependency" entry is reachable when an edge id is the selection target (for example from the problems panel), and "Disconnect from 'X'" on the task covers the same need.
- Viewport culling: the backend sends only the elements that intersect the reported viewport, plus the far end of any edge with one end in view (one hop, never the whole chain) (`DatabricksElementMapper.Visible`).

## Interactions

What the user can do, and what DISL could only approximate:

| Gesture | Effect | Refused when |
|---|---|---|
| Drop a toolbox entry on empty canvas | Adds a notebook, Python or condition task with a fresh key `<type>_<n>` (the first counter no task uses), at the drop point | the file declares no job |
| Drag from a task's side anchor to another task | "Depend on": the target comes to depend on the source | either end is empty canvas ("Drop the dependency on a task; a dependency needs both of its ends."), the same task ("A task cannot depend on itself."), the dependency exists ("'B' already depends on 'A'.") |
| F2, or Rename… | Asks for a key, then renames with references | empty ("A task needs a key."), taken ("A task named 'x' is already there.") |
| Set run if… | Asks for the value, free text; empty removes the key | none; any text is accepted |
| Assign cluster… | Asks for a key; empty means serverless | undeclared ("There is no cluster named 'x' in this job.") |
| Disconnect from 'X' | One menu entry per dependency of the selected task, naming what it severs | |
| Delete, or Remove | Removes the task and every dependency touching it, as one undo. When dependencies go with it, asks first: "Removing this task also removes the 1 dependency touching it." or "… the N dependencies touching it." | |
| Delete on a dependency | Removes that `depends_on` entry | |
| Drag any element | Stores its position in the `.adp` | no registration |

The approximations in the DISL file:

- **Fresh keys.** The toolbox's `initial` key counts tasks of the type plus one; the implementation takes the first counter no task already uses, which differs after a deletion. The source path (`notebooks/<key>`, `scripts/<key>.py`) is derived from that key. The implementation asks nothing on a drop; a toolbox click without a drop point asks for the key in a dialog.
- **The removal confirmation** counts the dependencies and is skipped when there are none; DISL's `deletion.confirm` is a fixed sentence.
- **Outcomes cannot be set from the diagram.** The connect gesture never writes an `outcome`; outcome edges come only from the file.
- **F2 on a task** opens the rename prompt in place, on the label (the shell answers a prompt that names an element inline), and committing it is the rename with references. Clusters and missing tasks have no F2 action, so their labels cannot be edited.
- **The property grid's read-only reasons** are shown as the field's explanation: Key: "Rename through the context menu, so every depends_on reference follows the key."; Type and Source: "The type is which *_task mapping the file carries; change it in the file."

## Simulated runs

"Run job (simulated)" is a mocked domain action (R8): nothing is sent to a Databricks workspace, nothing is written and nothing enters the undo history. DISL has no notion of an action that plays over time; the DISL file declares it as a plugin operation and a transient `simulated` attribute with conditional styles. What the plugin does (`client/useSimulatedRun.ts`):

- The action id carries the marker `.simulated.` (`databricks.simulated.run-job`). The canvas intercepts it before it reaches the backend and plays the run locally; if it reaches the backend anyway (a ribbon, a stale menu) it completes as a no-op (R11.6).
- The run is a sequence of waves, one step every 700 ms. Every resolved task starts `pending`. Each wave first finishes whatever was `running` (as `succeeded`, or `failed` for the profile's `failTaskId`), then starts or skips every task whose upstream tasks are all finished:
  - `ALL_SUCCESS` (the default): runs when no upstream failed **and** no upstream outcome edge names the outcome the condition did not take;
  - `ALL_DONE`: always runs;
  - `AT_LEAST_ONE_FAILED`: runs when any upstream failed;
  - `AT_LEAST_ONE_SUCCESS`: runs when any upstream succeeded, or it has none;
  - any other `run_if` behaves as ALL_SUCCESS.
- The mock profile: `failTaskId` (none), `conditionOutcome` (`true`), `stepMs` (700). There is no UI to change it yet.
- States draw as: pending at opacity 0.5; running with a 2.5 wide primary-colour stroke; succeeded with a 2 wide success stroke; failed with a 2.5 wide danger stroke; skipped at opacity 0.35 and dashed 3 3.
- A banner reads "Simulated: job run · dismiss", then "Simulated: job run — finished · dismiss"; clicking it clears the run from the canvas.
- The property grid's "Last simulated run" stays empty, and "Workspace connection" always reads "Not connected", a placeholder for a real workspace connection.

## Validation

The DISL constraints carry the implementation's rule ids in `x-adp-ruleId` and its messages. What DISL cannot say:

- Every finding points at a line of the YAML (`DiagramProblemLineLocation`), not at an element, and appears in the IDE's problems panel (`DatabricksValidator.cs`, `DatabricksRuleSet.cs`).
- The rules never look at a workspace, the disk or another file (R12.3).
- `databricks.task-key-missing` fires for a task written without `task_key`; such a task is not drawn at all, so in DISL terms it has no element to be scoped to.
- `databricks.duplicate-task-key` is reported on the second and later tasks with the key, not the first. The DISL rule flags them all.
- `databricks.cycle` names every task on a circle, found by repeatedly removing tasks whose dependencies are all gone; dependencies on missing tasks do not hold a task back.

## Gaps against the original specification

Specified in R1 to R13 but not implemented; a future version of this DISL file may add them:

- The Add flow does not suggest this type for a YAML file that contains a job (R1.2).
- No trigger or schedule node with its pause state (R4.4), and no pause or resume action (R8).
- A cluster is a badge on the task and a box in the band, but tasks are not coloured per cluster and there is no key legend (R4.3).
- The toolbox offers 3 of the 10 task types (R9.1).
- The property grid shows no retries, timeout or job-level properties, and the task's key and source are read-only where the specification made them editable in the grid (R10.1).
- "Run task (simulated)" does not exist; only the whole job runs (R8).
- Dropping a relation on empty canvas is refused instead of creating a task there (R11.3).
- Rename rewrites `depends_on` references only, not references inside `condition_task` operands (R11.4).
- No "Change path…" for a task's source (R11.5).
