# Databricks bundle: what DISL does not say

This is the companion to [databricks-bundle.dis](databricks-bundle.dis). The DISL file specifies the bundle diagram's metamodel, notation, toolbox, forms, constraints, operations, layout choice and persistence. This page holds everything about the tool that DISL cannot express or can only approximate, each item traced to where it comes from.

It describes the tool as implemented in the standalone IDE, in `src/diagrams/databricks/` of [etalii.adp.ide.standalone](https://github.com/etalii-adp/etalii.adp.ide.standalone). That module serves three tools from one engine: this one, [databricks-job](databricks-job.dis) and [databricks-pipeline](databricks-pipeline.dis). Much of what is shared (the two-file storage, the `.adp` registration, the line-splicing writer, simulated actions, the Workspace placeholder) is described once in [databricks-job.md](databricks-job.md) and applies here unchanged. The module's original specification lives in that repository's history as `.spec-workflow/archive/specs/databricks-diagrams/` (requirements R1 to R13 and a design), removed from the tree in commit `53f68611`; requirement numbers below refer to it.

## Identity

| Aspect | Value | Source |
|---|---|---|
| MIME type | `databricks/bundle` | `backend/.../Diagram.cs` |
| Display name | Databricks bundle | `Diagram.cs` |
| Icon | `mdi-package-variant-closed` | `Diagram.cs` |
| Extension | `.yml` (also `.yaml`), shared: claimed only through a `.adp` registration | `Diagram.cs` (`SharedExtension: true`) |
| State | ⚗️ Prototype | standalone `docs/tools.md`, Notion "Tools" |
| Notion row | Kind Diagram, family "Data platforms & pipeline orchestration", focus area "Software delivery", rarity "Adoption from standard". Purpose: "See what a Databricks Asset Bundle deploys: its jobs, pipelines, targets and variables in one view." Why specialized: "A bundle is spread over YAML files and deployment targets; a specialized view shows what gets deployed where without reading every include." | Notion "Tools" database |

The Notion purpose promises variables "in one view"; the implementation reads the variables but does not draw them (see the gaps). Nothing in the project conversations records a decision specific to this tool.

## Where the diagram lives

As for the job ([databricks-job.md, "Where the diagram lives"](databricks-job.md#where-the-diagram-lives-two-files-neither-of-them-did)): the model is the bundle's own `databricks.yml`, which ADP reads and splices but never adds to, and the view is the `layout:` block of the `.adp` registration. A shipped example (`examples/lakehouse/`):

```
databricks/bundle
body: databricks.yml
layout:
  bundle: -68.665 289.917
```

### How the YAML is read

`BundleParser.cs` models five root keys:

| YAML | DISL |
|---|---|
| `bundle.name` | node `Bundle`, `name` |
| `include:` (a list of globs) | diagram attribute `includes` |
| `variables.<name>` with `default` and `description` | diagram attribute `variables` |
| `resources.jobs.<key>`, `resources.pipelines.<key>` | node `Resource` with `kind` and `key` |
| `targets.<name>` with `mode` and `default` | node `Target` |
| `targets.<name>.resources.<kind>.<key>` | `Target.overrides` entry `<kind>/<key>`, and an `Override` edge when that resource is drawn |

Every other root key (for example `workspace`, `sync`, `permissions`, `artifacts`) and every other resource kind (for example `experiments`, `models`, `schemas`) becomes an `Unknown` node: drawn generically with its key as the label and its path (`workspace`, `resources.experiments`) as the badge, and never written (R2.4). A resource's own contents are not read here: the job and pipeline tools read them.

Included files are not followed. A resource declared in an included file does not appear in this diagram, and an override of it draws no edge.

### How the YAML is written

The same line-splicing discipline as the job (`BundleWriter.cs`): an untouched file saves byte for byte, refusals come before any splice, and each edit's inverse is a snapshot of the whole document.

- **Adding a resource** inserts after the last resource of the same kind, at its indentation. With no resource of that kind it creates the kind key under the root `resources:`; with no `resources:` at all it appends the section at the end of the file. The skeletons:

  ```yaml
  <key>:
    name: <key>
    tasks:
      - task_key: main
        notebook_task:
          notebook_path: notebooks/<key>
  ```

  ```yaml
  <key>:
    name: <key>
    libraries:
      - notebook:
          path: transformations/<key>
  ```

  Refused when the key is empty ("A resource needs a key.") or taken ("A jobs resource named 'x' is already there."). The kind appears in the message as written in the file (`jobs`, `pipelines`).
- **Renaming the bundle** rewrites `bundle.name`, quoting as needed, or inserts it under `bundle:`. Refused when empty ("A bundle needs a name.") or when the file has no `bundle:` section ("The file has no bundle: section to name."). Root keys are found at column zero only, so a target's own nested `resources:` is never mistaken for the root one.

Resources, unknown nodes and targets cannot be removed, renamed or edited from the diagram; their fields are read-only in DISL for that reason.

### Creating a new bundle file

`DatabricksDocumentFactory.cs` writes a `databricks.yml` with `bundle.name: <key>` and one target, `dev`, with `mode: development` and `default: true`, in CRLF. The key is the base name lowercased with non-alphanumeric characters folded to `_`, or `untitled`.

## Element ids

| Element | Id |
|---|---|
| Bundle | `bundle` |
| Resource | `resource:<kind>/<key>` |
| Unknown | `unknown:<path>` |
| Target | `target:<name>` |
| Override | `override:<target>/<kind>/<key>` |

These are also the keys of the `.adp` `layout:` block.

## Layout

The plugin layout `bands` (`DatabricksBundleLayout.cs`):

- The bundle at (0, 0).
- Resources, in file order, then unknown nodes, in one row at y 180, x = column × 260.
- Target frames at y 400, x = index × 260.

It runs on every load; positions stored in the `.adp` override it per element. The `grid` fallback in the DISL file only approximates it.

## Notation details DISL approximates

- The bundle, resources and unknown nodes are 200 by 56 boxes with a left-aligned, truncating label and one badge line beneath. The bundle's label is its name, or `bundle` when it has none, and it has no badge; a resource's badge is its kind (`jobs`, `pipelines`); an unknown node's badge is its path.
- A target is a 220 by 120 frame with a transparent fill and a dashed (6 4) border, drawn before the boxes so they paint on top. Its name sits above the frame; inside, at the top-left, a line joins whichever of these apply with " · ": the mode, `default`, and "1 override" or "N overrides".
- Override edges are straight, dashed 3 3, with an arrow, from the frame to the resource. An override whose resource is not drawn has no edge (the target end exists but the other does not), though it still counts in the frame's override total.
- Nothing on this canvas is connectable; the user never draws an edge.
- F2 on the bundle opens the rename prompt in place, on the label, and committing it rewrites `bundle.name` (the shell answers a prompt that names an element inline). No other element on this canvas has an F2 action, so no other label can be edited.

## Interactions

| Gesture | Effect |
|---|---|
| F2, or Rename… on the bundle | Asks for the name, then rewrites `bundle.name` |
| Add job resource… or Add pipeline resource… on the bundle, or the toolbox's Job and Pipeline entries | Asks for the key, then writes the skeleton |
| Deploy here (simulated) on a target | Plays a mock deploy |
| Drag any element | Stores its position in the `.adp` |
| Property grid: Name on the bundle | Editable; the same write as rename |
| Property grid on a target | Target and Mode, read-only ("The target's key is the file's structure.", "Change the mode in the file.") |

Every selection's grid also shows "Workspace connection" (always "Not connected", a placeholder) and "Last simulated run" (empty), both read-only.

## Simulated deploy

"Deploy here (simulated)" (`databricks.simulated.deploy`) is a mocked domain action, played on the canvas by the same client-side engine as the job's run ([databricks-job.md, "Simulated runs"](databricks-job.md#simulated-runs)): nothing is sent, written or put on the undo history. It is a ripple: every resource and unknown node, in order of x then y, runs and succeeds one after another, one step every 700 ms. The banner reads "Simulated: deploy". The ripple currently covers every resource whichever target was chosen; the target does not narrow it.

## Validation

The DISL constraints carry the implementation's rule ids in `x-adp-ruleId` and its messages; findings point at a line of the YAML. What DISL cannot say exactly:

- `databricks.no-default-target` is placed on the first target's line.
- `databricks.multiple-default-targets` is reported on the second and later default targets, not the first; the DISL rule flags every default target while there is more than one.
- `databricks.override-of-undeclared` is one finding per stray override, on the override's own line, naming the kind and key as "overrides jobs 'x'". The DISL message names only the first stray, as `jobs/x`. It is silent while the bundle has any `include:`, because the rules never look at another file and an included file might declare the resource (R12.3).
- The DISL file adds `unique_resource`, the writer's refusal of a duplicate key, as a create constraint; the implementation has no validator finding for a duplicated resource key in the file (see the gaps).

## Gaps against the original specification

Specified but not implemented:

- The bundle node does not show the CLI version or the include count (R3.1).
- Override edges carry no label with the number of overridden fields, and the property grid does not show overridden values (R3.2).
- No reference edges between resources, such as a job's `pipeline_task` naming a pipeline in the bundle (R3.3).
- No badge for the file a resource is defined in, and no way to open it (R3.4); included files are not read at all.
- Variables are parsed but not drawn or marked where they are used (R3.5).
- A resource key cannot be renamed (R6.2).
- "Validate bundle (simulated)" does not exist (R8).
- No finding for duplicate resource keys (R12).

The Add flow does not suggest this type for a `databricks.yml` either (R1.2).
