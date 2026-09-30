# Helm chart (`helm/chart`)

[`helm-chart.dis`](helm-chart.dis) specifies the Helm chart diagram in DISL: its metamodel, notation, derived relations, constraints and the read-only gestures. This page holds everything about the diagram that DISL cannot express, each point tied to the code or source that shows it. Where the implementation and its original requirements disagree, both are named.

Paths below are in [etalii.adp.ide.standalone](https://github.com/etalii-adp/etalii.adp.ide.standalone) on `develop` unless they say otherwise; the module is `src/diagrams/helm-chart/` (backend `backend/EtAlii.Adp.Diagram.HelmChart/`, client `client/`, wire `api/helm-charts.proto`).

## Sources

- The standalone module: code, tests and fixtures under `src/diagrams/helm-chart/`, the integration tests `src/backend/EtAlii.Adp.Backend.Tests/Integration Tests/Helm*.cs`, the examples under `src/examples/diagrams/helm-chart/` and the screenshot `docs/screenshots/helm-chart.png`.
- The original spec-workflow specification `helm-charts` (requirements, design, tasks), removed from the tree in `53f68611` and read from its parent commit. It is cited below as R*n.m* (requirement) and "design".
- `docs/tools.md` in standalone, row `helm/chart` (state ⚗️ Prototype, kind Diagram).
- The Notion "Tools" row "Helm chart" (Kind Diagram, focus area Software delivery, Rarity "Adoption from concept", Standalone ⚗️ Prototype).
- This project's conversations: no thread was about the Helm chart diagram itself; it appears only as one row in the catalogue, screenshot and naming work.
- [Helm charts guide](https://helm.sh/docs/topics/charts/), [chart template guide](https://helm.sh/docs/chart_template_guide/), and [Helm-Visualizer](https://github.com/unrealandychan/Helm-Visualizer) (Apache-2.0, read for insight and not copied).

## The subject is a folder, and the registration is the only file ADP owns

DISL assumes the diagram is stored as a DID definition. This diagram has no DID definition at all.

- **The subject is a folder.** A small registration file (`.adp`) inside the chart root, beside `Chart.yaml`, makes that folder a diagram. Its first line is the type's MIME-style origin `helm/chart`. There is no document extension, no `body:` header and no sibling body file (`Diagram.cs`: `Subject: DiagramSubject.Folder`, no extension; R2.1, R2.2). That is why the `.dis` declares no `language.fileExtension`.
- **Add flow.** Adding a diagram on a folder that contains `Chart.yaml` suggests `helm/chart`, as a suggestion and never an automatic claim; Add also works on a folder without one, which then shows the not-a-chart state (R2.3). Creating the registration writes only the `.adp`; the diagram never scaffolds a chart, which is `helm create`'s job (R2.4).
- **The model is read, never written.** The whole model is produced by reading the folder (the `adp.helm.chartFolder` plugin in the `.dis`). Nothing in the chart folder is ever created, modified or deleted: the module has no writer for chart content at all (R7.1). `ZeroWrites.Tests.cs` pins it by opening, browsing, validating and closing a fixture chart and comparing every file byte for byte, including that no file was created or deleted.
- **Live update.** Every file under the chart root is watched. A burst of changes (for example `helm dependency build` rewriting `charts/`) settles for 400 ms and becomes one re-read of the whole chart (`HelmChartStore.DefaultSettleDelay`, `HelmWatchedFolder`). Open diagrams update without a refresh (R1.4). The session compares the new model with the last delivery and sends removes and adds for what differs; nothing folds, so no group or ungroup change is ever sent (`HelmElementMapper`).
- **Whole diagram at once.** A chart is bounded (dozens of nodes), so every element is delivered when the diagram opens and a viewport change brings nothing new (`HelmSession`, design "Whole diagram at open").

## Reading the chart folder

DISL has no way to say where a model comes from. The reader (`HelmChartReader.cs`) does this:

- **Chart root.** A folder is a chart when it contains `Chart.yaml`. Without it the model is empty and the canvas says: "This folder is not a Helm chart: it has no `Chart.yaml`, so there is nothing to draw." (`HelmCanvas.tsx`; R10.1).
- **Inventory.** `Chart.yaml`; `values.yaml` or `values.yml` as the default layer and every other top-level `values*.yaml`/`values*.yml` as an override; `values.schema.json` (presence only); every file under `templates/`, recursively; `crds/` (its `.yaml`/`.yml` files, recursively); `charts/` (directories and `*.tgz` files); `Chart.lock`. For `apiVersion: v1` (compared case-insensitively) dependencies come from `requirements.yaml` and the lock is `requirements.lock` (R1.1, R4.3). Anything else in the folder (a `ci/` folder, a readme, source code) is ignored without complaint (R1.3).
- **Chart.yaml fields.** `name`, `version`, `appVersion`, `apiVersion`, `type` (absent reads as `application`), `description`, `deprecated` (only a literal boolean true counts), and `dependencies[]` with `name`, `alias`, `version`, `repository` and `condition`. A dependency entry without a `name` is skipped. `tags` and `import-values` are not read.
- **Tolerant YAML.** Chart-owned YAML (Chart.yaml, values files, lock, requirements.yaml, CRD files, a subchart's Chart.yaml) is parsed with line marks. A file that does not parse becomes an unreadable-marked node carrying the parser's own message and line; the rest of the chart still reads (R3.1; `HelmYaml.cs`). Reading never throws.
- **Templates are lines, not YAML.** A Go-templated manifest is not YAML until rendered, so files under `templates/` are never parsed (R3.2). `TemplateScan.cs` scans each line for literally written facts only:
  - `kind:` and `apiVersion:` at column zero (an indented `kind:` inside an RBAC rule or a list belongs to something else), with a trailing ` #` comment and surrounding quotes removed; a value containing `{{` is unknown and never guessed;
  - `{{ define "name" }}` (also `{{- define`), a partial's exports;
  - `{{ include "name" … }}` and `{{ template "name" … }}` with a literal double-quoted name.

  All lists are sorted ordinally and deduplicated. A template that cannot be read yields no facts and no error.
- **Template roles** are decided by name and place: a file name starting with `_` is a partial, `NOTES.txt` (case-insensitive) is the install notes, anything under `templates/tests/` is a test hook, the rest are manifests.
- **Values.** The top-level keys of each values file, and whether `global:` is among them.
- **Condition state.** A dependency's `condition` is walked as a dotted path into the parsed default values: absent condition is `none`; a missing segment is `missing`; a boolean scalar at the end is `on` or `off`; anything else, or unparsed default values, is `unknown` (`HelmChartReader.Resolve`).
- **Vendored content.** Each directory under `charts/` is read one level deep: its own `Chart.yaml` (name, version, type), the number of files under its `templates/` and the number of entries in its own `charts/`, summarized by count and never recursed (R3.4). Each `*.tgz` is sealed: labeled by its file name, never unpacked (R3.3). An archive's entry name drops a trailing `-<version>` whose first character is a digit (`common-2.31.4.tgz` matches `common`; `StripVersionTail`).
- **No execution, no network.** No template rendering, no hooks, no `helm` commands, no registry or cluster access. Reparse points are skipped so a symlink loop cannot hang the read.

## Identity of elements

Element ids are content-derived because stored positions are keyed by them across sessions; a renamed file intentionally forfeits its stored position (design, "Data Models"). The `.dis` gets most of them from natural keys with prefixes; two cannot be expressed that way:

| Element | Id |
| --- | --- |
| Chart | `chart` (fixed; the natural key would give `Chart.yaml`) |
| CRDs | `crds` (fixed) |
| Values | `values:<path>` |
| Schema | `schema:<path>` |
| Template | `tpl:<path>` |
| Dependency | `dep:<effective name>` |
| Subchart | `sub:<path>` |
| Archive | `tgz:<path>` |
| Lock | `lock:<path>` |
| Relation | `edge:<source>\|<Kind>\|<target>\|<label>`, empty target for an open end |

## Persistence: positions in the registration

DISL's persistence layer describes DID files. Here the only stored data is a `layout:` block in the `.adp` registration, written by core's `RegistrationLayout` (`src/backend/EtAlii.Adp.Hierarchy/RegistrationLayout.cs`), for example:

```text
helm/chart
layout:
  chart: 1327.665 566.461
  dep:common: 1715.631 587.676
  tpl:templates/_helpers.tpl: 585.618 1594.676
```

- One line per element: two-space indent, id, colon, then x and y of the box's top-left corner in canvas units, formatted with up to three decimals (`0.###`, invariant culture), entries ordered by id ordinally, CRLF line endings. Only the position is stored, never a size: sizes are fixed per kind.
- Only elements the user dragged have an entry. A stored position wins over the computed one element by element; an element without one takes its computed place; an id that no longer exists is ignored when read and dropped at the next write (R6.3).
- A move is one undoable command (`SetRegistrationLayoutCommand`, undone by restoring the previous entry or its absence) and the diagram's only edit (R6.4). The client stores the dropped position unrounded; the canvas has no grid (`HelmCanvas.tsx`, `onElementMoved`). Relations cannot be moved: a move of an id starting with `edge:` is refused with "That element is not something this diagram can move." (`HelmSession`).
- The write comes back through the folder watcher and re-renders with the authored position overlaid; there is no second watcher.

## Layout

The `.dis` names the `adp.helm.anatomyBands` plugin with `layered` as fallback. The plugin is `HelmLayout.cs`, which is pure and deterministic:

- Five columns, left to right, starting at (40, 40), with 60 between columns and 24 between rows. A column is as wide as its widest node; an empty column takes no room.
  1. Metadata: chart, lock, schema, crds, in that order.
  2. Values: the default layer first, then overrides by path.
  3. Templates: manifests, partials, notes, test hooks; by path within each role.
  4. Dependencies, by effective name.
  5. Vendored content (subcharts and archives), by path.
- Node sizes are fixed per kind (they are the `size.fixed` values in the `.dis`): chart 220×110, values 200×72, schema 200×48, template 240×60, crds 200×48, dependency 210×96, subchart 210×84, archive 210×52, lock 200×56.

## Rendering details beyond the notation

- **Open ends.** An Unvendored dependency and an include no local partial defines are drawn as a 48-unit stub out of the source box's right side, with the name and " (unvendored)" or " (not defined here)" beside it, in the relation's color, dashed 3 3 at 70 % opacity (`HelmCanvas.tsx`, `helm-charts.css`). DISL relations need a target, so the `.dis` shows these as badges on the source node; one stub per open relation is the actual drawing.
- **Relations** leave the right-middle of the source and enter the left-middle of the target as a forward cubic Bézier (`forwardBezierPath`), with an arrow at the target and the label at the midpoint, 6 units above.
- **Node labels** are the name only, truncated to fit; the tooltip is the kind label plus the name ("Template deployment.yaml"). A partial travels as its own wire type `helm/chart+partial` so a client can style it apart without reading the payload; the standalone client styles it like any template.
- **Colors** are theme hues `--color-diagram-helm-{chart,values,template,dependency,subchart}` in `src/client/src/index.css` (the `.dis` tokens copy their light and dark values); fills are the hue mixed 14 % into transparent. Schema, lock and crds share the muted text color. An unreadable node gets a red dashed outline that overrides its kind's outline.

## Navigation

- Activating (double-clicking) a node with a backing artifact reveals it in the project explorer (`revealPath` with the chart-root-relative segments). A dependency has no artifact and nothing happens (R8.3).
- An archive is revealed like any other file in the implementation, although its property row says "there is no file to open".
- R8.1 asks for the file to open in the matching text editor; the implementation reveals it instead.
- R8.2 asks that activating a subchart that has its own `helm/chart` registration offers to open that diagram. That is not implemented: a subchart is revealed like a folder.

## Toolbox, context menus and the property panel

- The toolbox contributes nothing, and says so, rather than showing "no diagram is open" (R9.1; `HelmCanvas.tsx` registers the empty toolbox itself because the empty state renders before the canvas).
- Context menus offer only navigation and the standard diagram-level entries; no create, connect, rename or delete gesture exists anywhere (R9.2). The canvas definition marks every element non-deletable and declares no relation source anchor.
- Every property row is read-only and carries a reason naming the file the value lives in: "Defined in {file}; edit it in a text editor." (`HelmContextPropertyProvider.cs`). The file is the node's own path, `Chart.yaml` or `requirements.yaml` for dependency facts, the lock for the pinned version, and `<subchart>/Chart.yaml` for an unpacked subchart. Setting a value is refused unconditionally with "A helm chart diagram shows the folder as it is and changes nothing in it. Edit the file this value comes from in a text editor." DISL's generated forms can mark fields read-only but cannot carry a per-row reason.
- Rows are grouped Identity, Contents and Wiring (the `group` of each attribute in the `.dis`). Values the panel phrases rather than lists: role "override layer, stacked on values.yaml"; renders "undetermined - the kind is templated, and templates are never rendered here"; resolution "resolved - vendored at charts/x" or "unvendored - nothing in charts/ answers it; helm dependency build fetches it at deploy time"; condition "path (currently on)".
- Relations have rows too: the relationship verb, what the label says, and for an open end why it is open.
- With nothing selected, the panel shows the chart's name, version, app version, API version, type, description and the counts of templates, dependencies and values layers (R9.4).
- Inline renaming is exempt: no row is editable, so there is nothing to rename (`client/readme.md`).

## Validation, as the implementation reports it

The rules are in the `.dis` constraints. Where the implementation (`HelmRuleSet.cs`, rule ids in `HelmRules.cs` such as `helm.lock-drift`) differs in shape from what DISL can say:

- **Two severities.** The standalone problems panel knows error and warning, so the legacy-chart finding, specified as informational (R10.7), is reported as a warning worded as information. The `.dis` says `info`.
- **Where problems point.** Findings carry a chart-root-relative file and line and are rebased to project-relative paths before they reach the panel. Not-a-chart is attributed to the folder itself. Missing name, missing version, empty templates and legacy point at the start of Chart.yaml's root mapping; not-SemVer at the version line; condition and collision findings at the dependency's line in the declaring file; a stale lock entry at its line in the lock; a declared dependency missing from the lock at the lock file without a line.
- **One problem per item.** The implementation reports one unreadable finding per unparsable CRD file and one stale-lock finding per undeclared lock entry; the `.dis` reports each group once with all names in the message. It reports a name collision once, at the second declaration; the `.dis` marks every colliding dependency.
- **Noise guards.** No problem is raised about Chart.yaml's content when it is unreadable. Unvendored dependencies, includes no local partial defines, and a missing lock are never findings.
- **Matching choices.** A dependency resolves to the first vendored entry matching its name or alias, and an entry claimed by one dependency is not Undeclared. An include is drawn once per included name to the first partial defining it; the `.dis` draws one relation per template–partial pair, labeled with all names.
- The shipped examples validate clean (R10.9); `ExampleRegistrationTests` opens every example registration.

## Known gaps

- **Not drawn on the canvas.** R4.2 (a template's kinds as its caption) and R5.5/R5.7 (condition badge, pinned version beside the constraint) are only in the property panel; the canvas shows names. The `global:` mark (R5.4) is also a property row only. The `.dis` follows the implementation.
- **Notion's "why specialized"** says the view "shows which values feed which resources". It does not: templates are never rendered and values are never resolved (out of scope below), so the diagram shows which values file configures which subchart, not which value feeds which resource.
- **Duplicate effective names.** Two dependencies with the same effective name produce the same node id `dep:<name>` in `HelmGraph`, besides the error finding. Inferred from the code; no test covers the rendering of that case.
- **Two defaults.** If both `values.yaml` and `values.yml` exist, both are marked default; overrides stack onto the first. Inferred from the code.
- **CEL.** The `.dis` validates against `disl.schema.json` and every expression parses as CEL, but no DISL type checker exists yet, so the expressions are not type-checked against the metamodel.

## Deliberately out of scope

From the requirements' introduction, unchanged in the implementation: template rendering (no Go templates, no Sprig, no rendered manifests, so no Deployment-to-Service graph); computing the effective values of an environment (the diagram shows layering, not a merge); editing chart content; registry and cluster connectivity (`helm dependency update`, Artifact Hub, OCI, live releases); evaluating `values.schema.json`; security scanning of rendered output. No version range is ever evaluated: the lock's pin is display data.

## Examples

Under `src/examples/diagrams/helm-chart/`, each with its `.adp` in the chart root and upstream licence and provenance:

| Example | Source (Apache-2.0) | Shows |
| --- | --- | --- |
| `hello-world` | [helm/examples](https://github.com/helm/examples) | The minimal chart, untouched |
| `prometheus` | [prometheus-community/helm-charts](https://github.com/prometheus-community/helm-charts) | Conditional dependencies, all Unvendored open ends |
| `nginx` | [bitnami/charts](https://github.com/bitnami/charts) | OCI dependency with the `common` library chart vendored under `charts/`, and ADP-authored `values-dev.yaml` and `values-prod.yaml` for the override stack |

Test fixtures under `backend/EtAlii.Adp.Diagram.HelmChart.Tests/Fixtures/` cover a well-formed chart, a broken one and an unconventional one (legacy v1, alias, archive beside an unpacked subchart, deeper nesting), protected from line-ending normalization by a local `.gitattributes`.
