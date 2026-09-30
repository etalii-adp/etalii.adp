# Azure DevOps pipeline

The DISL specification of this diagram type is [azure-devops-pipeline.dis](azure-devops-pipeline.dis). This page holds everything about the diagram type that DISL 0.1 cannot say, or can say only as documentation, each point tied to the code or source that shows it. It describes the prototype in the standalone IDE (origin `azure-devops/pipeline`, state ⚗️ Prototype) as of standalone `develop` at `b2a26925` (2026-09-30).

Paths below are relative to [`src/diagrams/azure-devops-pipeline/`](https://github.com/etalii-adp/etalii.adp.ide.standalone/tree/develop/src/diagrams/azure-devops-pipeline) in etalii.adp.ide.standalone; `backend/` stands for `backend/EtAlii.Adp.Diagram.AzureDevOpsPipeline/`.

## What the diagram is for

A CI/CD pipeline's stages, jobs and steps, and which of them wait for which. Pipeline YAML nests stages, jobs and steps inside templates; drilling down one level at a time keeps a long pipeline readable. The diagram reads a pipeline, it does not run one: run status is deliberately not shown (archived requirement 8.8).

Sources: `backend/Diagram.cs`; the Notion "Tools" row "Azure DevOps pipeline" (Kind Diagram, family "Infrastructure / network / cloud diagrams", focus area "Software delivery", rarity "Adoption from concept", state ⚗️ Prototype); `docs/tools.md` in standalone.

## 1. The file is an Azure Pipelines YAML file, not a DID definition

DISL assumes the diagram is stored as a DID definition (or in a format a persistence plugin provides). Here the document is the pipeline file itself, so everything about reading and writing it lives in the `azure-devops.pipeline` plugin the `.dis` declares as `persistence.format`.

- **Registration.** The extension is `.yml`, shared with every other YAML file (`SharedExtension: true`). A `.yml` becomes this diagram only when the user registers it, which writes an `.adp` file beside it naming `azure-devops/pipeline`. DISL has one `fileExtension` and no notion of a shared extension or an opt-in marker file; the `.dis` records them as `x-adp-origin` and `x-adp-shared-extension`. (`backend/Diagram.cs`)
- **`.yaml` is not registered.** Archived requirement 2.1 named `.yml` and `.yaml`; the code declares only `.yml`. A discrepancy between spec and code, not a DISL gap.
- **A new document** is a working single-stage pipeline with the file's base name as a comment: `trigger: [main]`, `pool: vmImage: ubuntu-latest`, one job `Build` with one script step. DISL has no "new document content" property. (`backend/PipelineDocumentFactory.cs`)
- **Parsing** uses YamlDotNet with line ranges for every element. It unwraps `${{ if }}` and `${{ each }}` blocks and keeps the expression as the element's `gate`; it expands `<<:` merge keys, the mapping's own keys winning; it gathers deployment-job steps per lifecycle hook (`preDeploy`, `deploy`, `routeTraffic`, `postRouteTraffic`, `on.failure`, `on.success`); it marks the stages of an `extends` template as coming from that template. (`backend/PipelineParser.cs`)
- **Implicit elements.** A pipeline without `stages` gets one implicit stage; one with only `steps` also gets one implicit job. They are drawn but have no lines (`firstLine`/`lastLine` are 0) and cannot be edited. (`backend/PipelineParser.cs`, `_Model/PipelineStage.cs`, `_Model/PipelineJob.cs`)
- **Pool inheritance** goes job, then stage, then pipeline, and the origin is kept so the inspector can say where the pool was set. Both the bare scalar (`pool: Name`) and the mapping form are read. The `.dis` expresses this as derived `effectivePool`/`poolOrigin`. (`_Model/PipelinePool.cs`, `_Model/PipelinePoolOrigin.cs`)
- **Step kind** is the first recognised key in written order: `task`, `script`, `bash`, `pwsh`, `powershell`, `checkout`, `download`, `publish`, `template`. (`_Model/PipelineStepKind.cs`)
- **Execution keys are verbatim strings** (`condition`, `continueOnError`, `enabled`, `timeoutInMinutes`), with the set of declared keys kept so that absent and empty differ. Only the literal `false` disables; only the literal `true` continues on error. Expressions (`${{ }}`, `$( )`, `$[ ]`) are never evaluated. (`_Model/PipelineExecution.cs`)
- **Writing splices lines.** The writer never reflows or regenerates: it replaces, inserts or removes the lines of the edited element only, so a file opened and saved unchanged is byte-identical, and comments, anchors, indentation and line endings survive an edit. A file with as many CRLF as LF line breaks is written with CRLF (core's rule). `dependsOn` is written as a scalar for one name, a block list for several and `[]` for none. Only three properties are ever written: `displayName`, `dependsOn` and `enabled`. (`backend/PipelineWriter.cs`, `backend/PipelineLineIndent.cs`, `backend/PipelineEdits.cs`) DISL's persistence properties (`indent`, `newline`, `canonical`, `ordering`) describe a writer that generates the file, which is the opposite of this one.
- **Blocks written by additions** (`backend/PipelineBlocks.cs`):
  - stage: `- stage: {name}`, `jobs:`, then a job;
  - job: `- job: {name}`, `steps:`, `- script: echo Add your build steps here`;
  - deployment job: `- deployment: {name}`, `environment: {name}`, `strategy:`, `runOnce:`, `deploy:`, `steps:`, then the script step.
- **Reloads.** When the file changes on disk, the new model is pushed to open views as add/remove/change deltas and is not put on the undo history; a deleted file is removed from open views. DISL has no concept of an external edit to the stored document. (`backend/PipelineDocumentReloader.cs`, `backend/PipelineSession.cs`)
- **Unparseable file.** A file that is not readable YAML is reported by `azure-pipeline.unparseable` (error, at the line YamlDotNet names): "This is not YAML that can be read: {message}". Nothing is offered on the canvas while it stands. (`backend/PipelineValidator.cs`) DISL constraints are evaluated over a model, so a parse failure has no place there.

## 2. Templates

- **Resolution** follows a template path only inside the workspace, caches reads per workspace, and records a template that includes itself. A path containing an expression is not followed (it is parameter-dependent). No network access, and a repository resource (`path@resource`) is never checked out. (`backend/PipelineTemplates.cs`; archived non-functional requirement on security)
- **Elements from a template** are drawn in place with a dotted outline and the ⇱ badge, and are read-only with the reason "This comes from {template}, so it has to be edited there." The `.dis` models this as the read-only `template` attribute and a `change` constraint; what the plugin must do (read the other file, attribute the elements) is not expressible.
- **Unresolved templates** become their own node, placed below the arrangement at the x of the element that references it. Reasons and their explanations (`_Model/PipelineTemplateUnresolvedReason.cs`):
  - other repository: "It comes from the '{Resource}' repository resource, which is not checked out here."
  - outside the workspace: "Its path leads outside this workspace, so it was not read."
  - parameter dependent: "Its path depends on a parameter, so which file it means is decided at compile time."
  - not found: "There is no file at '{Path}'."
  - unreadable: "'{Path}' could not be read as a pipeline."
  - cyclic: "'{Path}' includes itself, directly or through another template."
- **Parameters are shown by name only**, never by value, so a secret passed to a template stays unseen (archived security requirement). DISL's `secret` flag hides an attribute's value; here the values are simply never read into the model.

## 3. Dependencies that cannot be drawn

A `dependsOn` name that matches nothing still produces an edge in the runtime: a *broken* edge (`PipelineEdge.IsBroken`, id `edge:?{name}->{to}`) drawn in the danger colour with a `2 4` dash. A DISL relation needs an element at both ends, so the `.dis` derives edges only for names that resolve and leaves the dangling ones to the `danglingDependency` constraint. The runtime also draws an edge only when both of its ends are visible (a closed stage hides its jobs' edges). (`backend/PipelineGraphBuilder.cs`, `client/PipelineCanvas.tsx`, `client/azure-pipeline.css`)

Name matching is case-insensitive and the first element with a name wins; the `.dis` says the same with `lower()` and `[0]`. Stage order for the default dependency is written order; the `.dis` relies on `diagram.nodesOfType('Stage')` returning stages in persistence order (DISL section 12), which for this plugin is the order in the file.

The edge condition is read from the waiting element's own `condition` with the regex `^(succeeded|failed|always|succeededOrFailed)\(\s*('[^']*'(\s*,\s*'[^']*')*)?\s*\)$` (case-insensitive): empty is "on success", one of the four functions is classified by name, anything else is custom. It is carried on the wire (`edge_condition`) but the client draws every condition the same way today. (`_Model/PipelineEdgeCondition.cs`, `api/azure-pipeline.proto`)

## 4. Opening one level at a time

- A stage opens to show its jobs and a job opens to show its steps. A new view starts with everything closed. Open/closed state is per connection per file, never written and not on the undo history. DISL's `collapsible` container plus `view.store: []` comes closest, but DISL does not say the default is collapsed or that collapse is outside the undo history. (`backend/PipelineViewState.cs`, `backend/PipelineConnectionView.cs`)
- Opening sends add/remove deltas for the children, not a group/ungroup, and re-runs layout; the stage then grows to its jobs. (`backend/PipelineElementMapper.cs`, `backend/PipelineLayout.cs`)
- The context menu offers "Show jobs"/"Hide jobs" on a stage that has jobs and "Show steps"/"Hide steps" on a job that has steps, with the shortcut Space. The label flips with the state, which DISL's static operation labels cannot say. The `.dis` routes both through a plugin action. (`backend/PipelineContextActionProvider.cs`)
- **Discrepancy:** `docs/tools.md` in standalone says "there is no keyboard path for expansion at either level", while the backend declares Space for both toggles; the canvas registers only F2 (rename) as a keyboard action, so whether Space reaches the toggle depends on the host's menu shortcut handling.

## 5. Layout in numbers

DISL's `layered` algorithm with `direction: right` names the approach; the exact rules live in `backend/PipelineLayout.cs` and `_Model/PipelineMetrics.cs`:

| Metric | Value |
|---|---|
| Stage (closed) | 220 × 88 |
| Job (closed), step | 180 × 56 |
| Horizontal gap between columns | 80 |
| Vertical gap within a column | 32 |
| Padding inside an open stage or job | 24 |
| Header of an open stage or job | 40 |

- A stage's column is the length of the longest chain of dependencies before it, ignoring broken edges and the edge that closes a cycle.
- A column is as wide as its widest element; each column is filled top-down in written order.
- An open stage is its jobs' width + 2 × 24 wide and their height + 40 + 2 × 24 tall, never smaller than closed. Its jobs are offset by 24 and 40 + 24.
- An open job is 180 + 2 × 24 wide and 40 + 2 × 24 + n × 56 + (n − 1) × 32 tall; its steps sit at x + 24, y + 40 + 24, one every 56 + 32.
- Unresolved templates go below everything else, at the x of the element that references them.
- Positions are top-left corners, deterministic, and never written. Dragging is refused.

## 6. Drawing details

- **Edge route.** A horizontal cubic from the right middle of what is waited for to the left middle of what waits, each control point 30 units out, with an arrow at the target. DISL's `bezier` routing with `startDirection`/`endDirection` is the nearest; `curvature: 30` in the `.dis` stands for that reach. (`client/PipelineCanvas.tsx`)
- **Stages are drawn beneath the connections**, so an arrow between two jobs is never hidden by their stage. (`client/PipelineCanvas.tsx`)
- **Indicator badges** run leftward from the top-right corner, 16 apart, in this fixed order, and only those that apply take a slot, so a badge's position depends on which others are shown (`client/pipelineIndicators.ts`). DISL badges have fixed offsets, so the `.dis` gives each a fixed slot.

  | Glyph | Meaning (tooltip) |
  |---|---|
  | ⊘ | Disabled: this will not run. |
  | ▶ | Manual trigger: this waits to be started by a person. |
  | ? | Runs only when: {condition} |
  | ! | Continues on error: a failure here does not fail the run. |
  | ×N | Runs N times, once per matrix entry. |
  | ×? | How many of these run is decided when the pipeline runs. |
  | ⇱ | From {path}: edit it there. |

- **The problem mark** sits at the bottom-right: ✖ for an error, ⚠ for a warning, an error outranking a warning; problems are matched to elements by file path and element id. DISL's `invalid`/`warning` states restyle the node but do not place a glyph. (`client/PipelineCanvas.tsx`)
- **Styles** (`client/azure-pipeline.css`), with the theme variable and its fallback: stage fill `--color-bg` (#f8fafc), stroke `--color-border` (#e2e8f0), name 14px/600 at offset (12, 24), job count 12px muted at (12, 44) when closed; job and step fill `--color-surface` (#fff), name 12px; deployment job fill `--color-accent-subtle` (#f0fdf4) and 2px `--color-primary` (limegreen) stroke; unresolved template no fill, dash `6 4`; element from a template dash `2 3`, opacity .85; indeterminate element dash `4 3`; edge `--color-border-strong` (#64748b) 1.5px; implicit edge dash `3 3`, opacity .7; broken edge `--color-danger` (#dc2626) dash `2 4`; indicators 11px muted; problem stroke #dc2626 (error) or #b45309 (warning).
- **Indeterminate.** A stage is indeterminate when it has a gate or a broken incoming edge; a job when it has a gate or a run count only known at run time. (`backend/PipelineElementMapper.cs`)

## 7. Editing rules the `.dis` states only as text

- **Rename** (F2) prompts for "Display name" and writes `displayName` only, never `name`, because other elements depend on the name; an empty value removes the key. (`backend/Commands/RenamePipelineElementCommand.cs`)
- **Add** appends to the end of the list, even though the toolbox says "Drop on a stage to add another after it". Names come from `NewStage` and `{stage}Job`, made unique by appending 2, 3, … compared case-insensitively (the `.dis` function `unusedName`). Refusals, which DISL operations cannot return as messages (`backend/Commands/AddPipelineElementCommand.cs`):
  - "This pipeline has no stages block to add a stage to. Add one in the file first."
  - "A job goes in a stage."
  - "This stage has no jobs of its own to add one beside."
  - "A step goes in a job."
  - "This job has no steps of its own to add one beside."
- **Remove** is offered only when the parent keeps more than one (more than one non-implicit stage, more than one job, more than one step). Undo puts the exact original lines back; if the file has changed too much since, undo is refused with "This pipeline has changed too much since then to put that back." (`backend/Commands/RemovePipelineElementCommand.cs`)
- **Depends on** refusals (`backend/Commands/SetPipelineDependenciesCommand.cs`):
  - "Steps run in order, so a step has nothing to wait for."
  - "This pipeline has nothing called '{x}' to wait for."
  - "That would make {Label} wait for something that is already waiting for it."
  - "A pipeline must contain at least one stage with no dependencies, or it has nothing to start with."
  Setting "the default order" removes the key.
- **The Depends on field** offers two entries that are not names: "(nothing)" (writes `[]`) and "(the default order)" (removes the key), then the named stages written before this one, or the other named jobs of the stage. Its label reads "Depends on (by default)" while the key is absent, and its value then shows the implicit dependency. It is read-only when the element waits for several things ("This waits for several things, which is edited in the pipeline file.") or when nothing comes before it ("There is nothing before this for it to wait for."). A DISL `select` has one option list and no way to map pseudo-entries to "remove the key". (`backend/PipelineContextPropertyProvider.cs`)
- **Enable/Disable** writes `enabled: false` to disable and removes the key to enable. When `enabled` is an expression the field is read-only: "This is decided by an expression when the pipeline runs." (`backend/Commands/SetPipelineElementEnabledCommand.cs`, `backend/PipelineContextPropertyProvider.cs`)
- **Move up/Move down** (Alt+Up/Alt+Down) reorders a step within its job; it is withheld at the ends and refused when any step of the job comes from a template: "Some of this job's steps come from a template, so their order cannot be changed here." DISL has no reorder action, so the `.dis` routes it through a plugin action. (`backend/Commands/MovePipelineStepCommand.cs`)
- **Read-only reasons.** Every inspector row except display name, depends on and enabled is read-only with "This is edited in the pipeline file. A wrong value here would break the build."; the pool row says "Set for the whole pipeline, at the top of the file." or "Set on the stage, not here." when inherited; on an implicit element every row says "This is implied by the pipeline's shape rather than written down, so there is nothing here to edit." DISL has `readOnly` but no per-field reason text, so the `.dis` keeps the reasons in `doc`. (`backend/PipelineContextPropertyProvider.cs`, `_Model/PipelineEditTarget.cs`)
- **Undo.** Every edit is one step on the shared history stack; view toggles and reloads from disk are not.
- **Nothing is offered** on an element from a template, on an implicit element, or while the file cannot be parsed. (`backend/PipelineContextActionProvider.cs`)
- **Toolbox items are dropped onto an element**, not onto empty canvas: a stage or job item on a stage, a step item on a job. DISL's `operation` tool kind does not say what it is dropped on. (`backend/PipelineToolboxProvider.cs`)

## 8. Validation the `.dis` approximates

The rule ids in the runtime are `azure-pipeline.*`; the `.dis` keeps them as each rule's `label`. None of them are reported when the pipeline has no stages at all. (`backend/PipelineRuleSet.cs`, `backend/PipelineRules.cs`)

- **Only two severities** exist, error and warning. Archived requirement 10 asked for "information" on templates that are not followed; the code reports a warning.
- **One problem per cycle.** The runtime finds each cycle once (depth-first, keyed by its members) and reports it on its first element with the whole loop: "These wait for each other and so none of them can run: A -> B -> A." or, for a self-loop, "'X' waits for itself, so it can never run." A DISL invariant is evaluated per element and cannot name the loop's members in order, so the `.dis` reports on every member with an abbreviated message.
- **Unreachable.** Seeds are stages with no incoming edges at all, broken ones included; reachability runs forward over edges that are not broken; stages in a cycle or with a broken edge are skipped. The `.dis` rule says this with `reachable()` but cannot see broken edges, so it treats a dangling name as "waits for something" through `dependsOn`.
- **File-level problems.** `azure-pipeline.no-starting-stage` is reported against the file, not an element; `azure-pipeline.template-not-followed` is located at `template:{id}`; `azure-pipeline.unparseable` at a line. DISL constraints always target elements or the diagram.
- **Guards the checker does not need.** Archived requirement 7.7 limits a stage to 256 jobs (`children.max` in the `.dis`).

## 9. What is outside the diagram

- **Wire format.** The client receives each element as a `PipelineElementPayload` with 29 fields (kind, edge condition, implicit and broken flags, size, pool and whether it is inherited, environment, strategy, hook, reference, unresolved reason, parent id, first and last line, job count, continues-on-error, manual trigger, …) and typed ids `azure-devops/pipeline+stage`, `+job`, `+step`, `+edge`, `+template`. A runtime concern, not a DISL one. (`api/azure-pipeline.proto`, `backend/PipelineElementMapper.cs`)
- **Ids** are paths, not stored: stage name (or position), `stage/job`, `job/index`, `edge:{from or ?name}->{to}`, `template:{id}`. The `.dis` says `natural` with the scheme in `doc`.
- **Navigation to the line** (archived 12.4) and opening the file in a text editor at a line (9.9) were descoped; `firstLine`/`lastLine` are carried so a host can add it.
- **Parameters** (archived 5.6) are read by name for templates only; pipeline-level `parameters:` and `variables:` are not drawn.
- **Security** (archived non-functional requirements): templates only inside the workspace, no network access, secrets shown only by name.
- **Test fixtures** are hand-written: multi-stage, jobs-only, steps-only, templates with a `templates/` folder, extends, and one file per edge kind. They are not published Microsoft samples, so the rule on vendored example data does not apply to them; the Microsoft documentation linked below is the reference for the format.
- **Manual checks** in standalone's `tests.md` (task 29) passed on 2026-09-05. A screenshot is at `docs/screenshots/azure-pipeline.png` in standalone.

## Sources

- Code: [`src/diagrams/azure-devops-pipeline/`](https://github.com/etalii-adp/etalii.adp.ide.standalone/tree/develop/src/diagrams/azure-devops-pipeline) in etalii.adp.ide.standalone.
- Archived specification `azure-pipeline-diagram` (requirements, design, tasks) in standalone's `.spec-workflow/archive/specs/`, removed in commit `ece03c36` and read from its parent.
- `docs/tools.md` and `docs/screenshots/azure-pipeline.png` in etalii.adp.ide.standalone.
- Notion "Tools" database, row "Azure DevOps pipeline".
- Project conversations: nothing specific to this diagram type was said; the general rulings used are the `.dis` extension (Peter, 2026-09-30), one diagram type per `.dis` file (Peter, 2026-09-29) and unchanged origins (naming alignment plan, 2026-09-28).
- Microsoft: [YAML schema reference](https://learn.microsoft.com/en-us/azure/devops/pipelines/yaml-schema/), [key concepts](https://learn.microsoft.com/en-us/azure/devops/pipelines/get-started/key-pipelines-concepts), [stages, dependencies and conditions](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/stages).
