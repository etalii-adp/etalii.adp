# Traceability: gaps summary to DISL 0.2

**Feature**: [../disl-0-2.spec.md](../disl-0-2.spec.md) | **Plan**: [../plan.md](../plan.md) | **Constructs**: [constructs.md](constructs.md)

This table is the check behind SC-001: every item under gaps 4 and 6 to 13 of the DISL gaps summary (`disl-gaps/disl-gaps-summary.md`, 2026-09-30), and the derived-element items of gap 3, is either expressible in DISL 0.2 or named here with the owner it is left to. Compound bullets of the summary are split into one row per need. The table also covers the `x-adp` keys and plugin declarations of `definitions/diagrams/*.dis` that fall within these themes (FR-004, SC-004).

Outcomes:

- **DISL 0.2 construct**: a new or extended property, `$def`, CEL context or function ([constructs.md](constructs.md)).
- **Sentence**: no construct needed, only a sentence: normative text in DISL 0.2 (or a 0.1 construct it points at) settles the item.
- **FBL**: left to the Format Binding Language (feature 005), per the boundary in the spec's Context.
- **Plugin**: stays a declared plugin function called from CEL (13.1).
- **Host**: a runtime concern, not a specification construct.
- **Later DISL feature**: the layouts feature (gap 5).
- **Done by PR #40**: settled before this feature (spec, Assumptions).

**Needed by** uses the definitions' file names without `.dis` (`w3c-rdf`, `c4-container`, and so on); "W3C ×4" is w3c-rdf, w3c-owl, w3c-shacl and w3c-skos, "C4 ×6" the six C4 types, "Databricks ×3" databricks-job, databricks-bundle and databricks-pipeline. **Example** names the DISL 0.2 example that shows it (see [constructs.md](constructs.md)); "stand-in" means the example's definition does not need it today.

## Gap 3: derived elements

| # | Item | Needed by | Outcome | Where | Example |
|---|---|---|---|---|---|
| 3.1 | Cards from triples | W3C ×4 | DISL 0.2 construct | 4.11 `derived` on a node type (`from`, `key`, `id`) | `rdf-graph.dis` |
| 3.2 | Rows from triples | w3c-rdf, w3c-shacl | DISL 0.2 construct | 4.11 `derived.attributes` (a list over the group) | `rdf-graph.dis` |
| 3.3 | Badges from triples | w3c-rdf, w3c-owl | DISL 0.2 construct | 4.11 `derived.attributes`, drawn by an ordinary badge | `rdf-graph.dis` |
| 3.4 | An `rdf:type` triple as a badge | w3c-rdf, w3c-owl | DISL 0.2 construct | 4.11 `derived.from` keeps the type object off the card keys | `rdf-graph.dis` |
| 3.5 | One IRI yielding two elements | w3c-owl | DISL 0.2 construct | 4.11: two derived types over the same triples | `rdf-graph.dis` (the pattern; stand-in for w3c-owl) |
| 3.6 | Edges that merge several triples | w3c-skos, w3c-shacl | DISL 0.2 construct | 4.9 derived relation object form with `key` | `c4-container.dis` (stand-in: same `key` merge) |
| 3.7 | SPARQL: everything from the query, the syntax entries (scopes, patterns, annotations) | sparql-query | FBL | FBL read binding, one stored record per syntax entry | none |
| 3.8 | SPARQL: everything from the query, the variables and pattern edges | sparql-query | DISL 0.2 construct | 4.11 derived node and relation types | `rdf-graph.dis` (stand-in) |
| 3.9 | SPARQL: shallowest-scope placement (computed containment) | sparql-query | DISL 0.2 construct | 4.11 `derived.parent`, `derived.slot`; 12.2 `ancestors()` order | `rdf-graph.dis` (stand-in) |
| 3.10 | SPARQL: edges owned by a scope other than their ends | sparql-query | DISL 0.2 construct | 4.9 `derived.owner`; 12.2 relation `owner` | `c4-container.dis` (stand-in) |
| 3.11 | Ansible: the model derived from a folder | ansible-structure | FBL | FBL folder subject (gap 2) | none |
| 3.12 | Helm: the model derived from a folder | helm-chart | FBL | FBL folder subject (gap 2) | none |
| 3.13 | .NET: the model derived from a solution folder | dotnet-dependency-graph | FBL | FBL folder subject (gap 2) | none |
| 3.14 | Azure: template attribution | azure-devops-pipeline | FBL | FBL read binding records the template file as the source location; DISL supplies `self.location()` (12.2) | none |
| 3.15 | Azure: "unresolved template" pseudo-nodes | azure-devops-pipeline | FBL | FBL stored element with no write rule | none |
| 3.16 | Databricks: unknown kinds as generic nodes, never written | databricks-bundle | FBL | FBL stored element with no write rule | none |
| 3.17 | C4: view membership from include and exclude lists | C4 ×6 | DISL 0.2 construct | 3.5 viewpoint `members` | `c4-container.dis` |
| 3.18 | C4: membership wildcards | C4 ×6 | DISL 0.2 construct | 3.5 `members` using `matchesGlob` (12.4, 0.1) | `c4-container.dis` |
| 3.19 | C4: relationships lifted to the nearest drawn ancestor | C4 ×6 | DISL 0.2 construct | 4.9 derived relation; 12.2 `ancestors()` order | `c4-container.dis` |
| 3.20 | C4: lifted relationships merged | C4 ×6 | DISL 0.2 construct | 4.9 `derived.key` | `c4-container.dis` |
| 3.21 | A recursive text renderer (OWL's expression text) | w3c-owl (w3c-shacl's one-level summary) | DISL 0.2 construct | 3.4 `recursion` | `rdf-graph.dis` (stand-in for w3c-owl) |
| 3.22 | Cycle enumeration | causal-loop-diagram (w3c-skos) | DISL 0.2 construct | 12.4 `diagram.cycles`, `diagram.cyclesTruncated` | `causal-loop.dis` |
| 3.23 | How CEL calls a plugin function | W3C ×4, causal-loop-diagram | DISL 0.2 construct | 13.1 `celFunctions` (bare name, `uses`, `fallback`); 15.2 | `rdf-graph.dis` |

## Gap 4: identity

| # | Item | Needed by | Outcome | Where | Example |
|---|---|---|---|---|---|
| 4.1 | Id strategy: ShortGuid | dependency-graph, gartner-hype-cycle-graph, timeline, functional-decomposition-graph, mindmap | DISL 0.2 construct | 11.5 `encoding` (`base64url`, `base36`) | `gartner-hype-cycle.dis`, `functional-decomposition.dis` |
| 4.2 | Id strategy: ids built from paths | dotnet-dependency-graph, ansible-structure, helm-chart, databricks-pipeline, azure-devops-pipeline | DISL 0.2 construct | 11.5 `strategy: "derived"` in `types` | `rdf-graph.dis` (same strategy; path ids not excerpted) |
| 4.3 | Id strategy: natural keys | causal-loop-diagram, databricks-job, databricks-bundle, sparql-query, C4 ×6 | DISL 0.2 construct | 11.5 `natural` composition and `suffix` | `causal-loop.dis`, `c4-container.dis` |
| 4.4 | Id strategy: IRIs | W3C ×4, sparql-query | DISL 0.2 construct | 11.5 `derived` | `rdf-graph.dis` |
| 4.5 | Id strategy: triples plus a repeat counter | w3c-rdf, w3c-owl, w3c-skos, sparql-query | DISL 0.2 construct | 11.5 `derived`; 12.4 `positionIn` | `rdf-graph.dis` |
| 4.6 | Id strategy: term forms | sparql-query | DISL 0.2 construct | 11.5 `derived` | `rdf-graph.dis` (stand-in) |
| 4.7 | Id strategy: scope paths | sparql-query | DISL 0.2 construct | 11.5 `derived` (a scope reads its parent's id) | `rdf-graph.dis` (stand-in) |
| 4.8 | Id strategy: formula ids for relations | ansible-structure, helm-chart, dotnet-dependency-graph, databricks-job, databricks-pipeline, azure-devops-pipeline, W3C ×4 | DISL 0.2 construct | 11.5 `derived` (`self.source.id`, `self.target.id`) | `databricks-job.dis` |
| 4.9 | Id strategy: fixed singleton ids (`pipeline`, `chart`, `crds`) | helm-chart, databricks-pipeline, sparql-query, w3c-rdf | DISL 0.2 construct | 11.5 `derived` with a constant | `rdf-graph.dis` (`truncation`) |
| 4.10 | Ids unstable across edits, marked as such | W3C ×4, sparql-query, C4 ×6, azure-devops-pipeline | DISL 0.2 construct | 11.5 `ephemeral` (bool or `{cel}`) and `reason` | `rdf-graph.dis`, `c4-container.dis` |
| 4.11 | Unstable ids never stored or positioned | W3C ×4, sparql-query, C4 ×6 | DISL 0.2 construct | 11.5, 11.6 (no view data, override or suppression); 8.7 `std.ephemeralViewData`; DID 5 | `rdf-graph.dis` |
| 4.12 | Unstable ids never related | W3C ×4, sparql-query, C4 ×6 | DISL 0.2 construct | 11.5 `ephemeral`: no parent, relation end or reference attribute by id; gestures refused with `reason` | `rdf-graph.dis` |
| 4.13 | Ids held outside the document in a sidecar, keyed by name | wardley-map | FBL | FBL sidecar; DISL supplies the generation strategy (11.5) | none |
| 4.14 | Loading that tolerates missing ids and reports them | dependency-graph, mindmap, timeline | DISL 0.2 construct | 11.5 `missing`; 8.7 `std.missingId`; DID 4 | `mindmap.dis` |
| 4.15 | Loading that tolerates duplicate ids and reports them, where DID's uniqueness rule forbids them | dependency-graph, mindmap, timeline, gartner-hype-cycle-graph, functional-decomposition-graph | DISL 0.2 construct | 11.5 (first in reading order keeps it); 8.7 `std.duplicateId`; DID 4 | `mindmap.dis`, `functional-decomposition.dis` |

## Gap 6: findings

| # | Item | Needed by | Outcome | Where | Example |
|---|---|---|---|---|---|
| 6.1 | Findings at a file and line rather than on an element | ansible-structure, azure-devops-pipeline, C4 ×6, Databricks ×3, dependency-graph, gartner-hype-cycle-graph, helm-chart, timeline, sparql-query, W3C ×4, wardley-map | DISL 0.2 construct | 8.6 `SourceLocation`; 8.2 `location`; 12.2 `location()` | `databricks-job.dis` |
| 6.2 | Findings on a triple | W3C ×4, sparql-query | DISL 0.2 construct | 8.2 `subject`, 8.6 `Finding.subject` | `rdf-graph.dis` |
| 6.3 | A finding about something that is not drawn | w3c-skos, helm-chart, databricks-bundle | DISL 0.2 construct | 8.2 `subject`; a finding needs no element (8.6) | `rdf-graph.dis` |
| 6.4 | A parse failure as a finding | dependency-graph, sparql-query, W3C ×4, timeline, mindmap, azure-devops-pipeline, ansible-structure, helm-chart | DISL 0.2 construct | 8.7 `std.unparseable` | `rdf-graph.dis`, `mindmap.dis` |
| 6.5 | The parse failure replaces all other findings | same as 6.4 | Sentence | 8.6: no other finding for that file; no constraint runs when it is the primary file | `rdf-graph.dis` |
| 6.6 | One finding per item from a diagram-scope rule | ansible-structure, databricks-bundle, helm-chart, sparql-query, W3C ×4, causal-loop-diagram | DISL 0.2 construct | 8.2 `forEach` | `causal-loop.dis`, `rdf-graph.dis` |
| 6.7 | One finding per cycle, naming the loop in order | azure-devops-pipeline, databricks-job, causal-loop-diagram, w3c-owl, w3c-skos, functional-decomposition-graph | DISL 0.2 construct | 8.2 `forEach` over 12.4 `diagram.cycles` (or `diagram.knots`) | `causal-loop.dis`, `databricks-job.dis` |
| 6.8 | Only the second and later duplicates flagged | databricks-job, databricks-bundle, helm-chart, dependency-graph, w3c-rdf | DISL 0.2 construct | 12.4 `positionIn` | `databricks-job.dis` |
| 6.9 | An order among findings | causal-loop-diagram | Sentence | 8.6 normative order | `causal-loop.dis` |
| 6.10 | Rules over the whole model, not one view | C4 ×6 | DISL 0.2 construct | 8.2 `over`; 12.2 `diagram.views` | `c4-container.dis` |
| 6.11 | Rules that consult the file system | wardley-map | DISL 0.2 construct | 12.4 `fs.exists`, `fs.isDirectory`; 16 | `mindmap.dis` (stand-in for wardley-map) |
| 6.12 | Common rule with no expression: duplicate id | dependency-graph, mindmap, timeline, gartner-hype-cycle-graph, functional-decomposition-graph | DISL 0.2 construct | 8.7 `std.duplicateId` | `mindmap.dis` |
| 6.13 | Common rule with no expression: missing id | dependency-graph, timeline, mindmap | DISL 0.2 construct | 8.7 `std.missingId` | `mindmap.dis` |
| 6.14 | Common rule with no expression: unreadable entry | gartner-hype-cycle-graph, functional-decomposition-graph, causal-loop-diagram, dotnet-dependency-graph, databricks-job | DISL 0.2 construct | 8.7 `std.unreadableEntry` | `functional-decomposition.dis` |
| 6.15 | Common rule with no expression: mixed precision | timeline | DISL 0.2 construct | 8.7 `std.mixedPrecision`; 4.3 `samePrecisionAs` | `gartner-hype-cycle.dis` (stand-in for timeline) |

## Gap 7: telling the user why

| # | Item | Needed by | Outcome | Where | Example |
|---|---|---|---|---|---|
| 7.1 | A refusal sentence per gesture | C4 ×6, functional-decomposition-graph, dependency-graph, databricks-job, gartner-hype-cycle-graph, w3c-skos, w3c-rdf, timeline, mindmap | DISL 0.2 construct | 8.4 `message` as a Message, `dropTarget` and `tool`, the order of checks; 8.1 built-in `message` | `c4-container.dis`, `functional-decomposition.dis` |
| 7.2 | A refusal sentence per element kind | sparql-query, w3c-owl, w3c-rdf, ansible-structure, helm-chart | DISL 0.2 construct | 6.9, 6.10 `refusals` | `rdf-graph.dis` |
| 7.3 | A refusal sentence per selection | w3c-rdf, dependency-graph, w3c-shacl | DISL 0.2 construct | 9.1 `behavior.messages` (`std.notApplicable`); 8.4 `selection` | `rdf-graph.dis` |
| 7.4 | A read-only reason on every property-grid row | ansible-structure, azure-devops-pipeline, C4 ×6, causal-loop-diagram, databricks-job, dotnet-dependency-graph, helm-chart, mindmap, sparql-query, W3C ×4, timeline, wardley-map | DISL 0.2 construct | 4.3, 7.5 `readOnlyReasons` | `c4-container.dis` |
| 7.5 | Read-only reasons in priority order | w3c-skos, dotnet-dependency-graph | DISL 0.2 construct | 7.5 order: field, attribute, edit gate, with `{reason}` placing a gate reason | `c4-container.dis` |
| 7.6 | "Absent" distinct from "empty" | dotnet-dependency-graph, ansible-structure | DISL 0.2 construct | 4.3, 7.5 `absentText`, `emptyText`, `showAbsent` | `c4-container.dis` (stand-in for dotnet-dependency-graph) |
| 7.7 | Unavailable-with-reason menu entries instead of hidden ones | causal-loop-diagram, w3c-shacl, w3c-rdf, c4-deployment, gartner-hype-cycle-graph, azure-devops-pipeline, timeline (and mindmap, which hides) | DISL 0.2 construct | 7.2, 7.3, 9.3 `unavailable`; 7.3 `visible` | `causal-loop.dis`, `mindmap.dis` |
| 7.8 | Confirmations that interpolate a name or count | mindmap, functional-decomposition-graph, gartner-hype-cycle-graph, databricks-job, W3C ×4, wardley-map, causal-loop-diagram | DISL 0.2 construct | 9.5 `Confirmation` with Message texts and `count` | `mindmap.dis`, `functional-decomposition.dis` |
| 7.9 | Confirmations that differ by element (branch or leaf) | mindmap | DISL 0.2 construct | 9.5 `count`, `threshold`, `when` | `mindmap.dis` |
| 7.10 | Confirmations skipped below a threshold | mindmap, functional-decomposition-graph, gartner-hype-cycle-graph, W3C ×4 | DISL 0.2 construct | 9.5 `threshold` | `mindmap.dis` |
| 7.11 | Menu labels that change with state | causal-loop-diagram, wardley-map, C4 ×6, mindmap | DISL 0.2 construct | 7.2, 7.3, 9.3 `label` as a Message | `mindmap.dis` |
| 7.12 | Menu labels that carry a count | w3c-shacl, w3c-rdf, w3c-owl, causal-loop-diagram | DISL 0.2 construct | `label` as a Message | `rdf-graph.dis` |
| 7.13 | Dialogs with placeholders | w3c-rdf, w3c-owl, w3c-shacl | Sentence | 7.5: a dialog shows the 0.1 `placeholder` | `rdf-graph.dis` |
| 7.14 | Dialogs with pre-filled values | w3c-rdf, w3c-skos, dependency-graph, timeline, causal-loop-diagram | DISL 0.2 construct | 7.5 form item `initial` | `rdf-graph.dis` |
| 7.15 | Dialogs with validated input | w3c-rdf, w3c-skos, timeline, causal-loop-diagram, gartner-hype-cycle-graph, dependency-graph | DISL 0.2 construct | 7.5 `validate` (0.1) with `timing` | `gartner-hype-cycle.dis` |
| 7.16 | Dialogs with a button label | w3c-shacl, w3c-rdf | DISL 0.2 construct | 7.5 `submitLabel`, `cancelLabel` | `rdf-graph.dis` |

## Gap 8: gestures and menus

| # | Item | Needed by | Outcome | Where | Example |
|---|---|---|---|---|---|
| 8.1 | Positional create ("insert after this sibling") | mindmap, azure-devops-pipeline | DISL 0.2 construct | 9.4 `after`, `before` | `mindmap.dis` |
| 8.2 | Toolbox items dropped onto an element of a given type | azure-devops-pipeline, causal-loop-diagram, mindmap, wardley-map, C4 ×6 | DISL 0.2 construct | 7.2 `mode: "drop"`, `drop.targets[].on` | `causal-loop.dis`, `c4-container.dis` |
| 8.3 | A drop whose target is whatever lies under it | w3c-shacl, functional-decomposition-graph, timeline, dependency-graph, databricks-job, w3c-rdf | DISL 0.2 construct | 7.2 drop target, `drop.elsewhere` | `causal-loop.dis` |
| 8.4 | Relation direction chosen by the anchor used | dependency-graph, timeline, w3c-owl, w3c-rdf | DISL 0.2 construct | 6.10 `connect.from` | `rdf-graph.dis` |
| 8.5 | Creating a node plus its edge as one step | dependency-graph, timeline | DISL 0.2 construct | 7.2 `createSource`, `createTarget` as `CreateEnd` | `databricks-job.dis` (stand-in) |
| 8.6 | A context tool answered by a picker of existing elements | wardley-map, databricks-job, w3c-shacl, C4 ×6 | DISL 0.2 construct | 7.3 `target: "pick"`, `candidates` | `databricks-job.dis` |
| 8.7 | Reorder | azure-devops-pipeline, mindmap | DISL 0.2 construct | 9.4 `reorder`; 7.3 `moveUp`, `moveDown`; 8.4 kind `reorder` | `mindmap.dis` |
| 8.8 | One menu entry per list item | w3c-shacl, databricks-job, wardley-map | DISL 0.2 construct | 7.3 `forEach`, `as`, `args` | `databricks-job.dis` |
| 8.9 | A context menu on empty canvas gated on a model fact | w3c-owl, timeline, causal-loop-diagram, C4 ×6, w3c-rdf | DISL 0.2 construct | 7.3 `contextMenus[].for: "diagram"` with `when` | `rdf-graph.dis` |
| 8.10 | Menu entries for transient targets | w3c-rdf, w3c-owl | DISL 0.2 construct | 7.3 `for: "connection"`, `runSingle`; `drop.elsewhere: "menu"` | `rdf-graph.dis` |
| 8.11 | Clamping a drag | wardley-map, functional-decomposition-graph, gartner-hype-cycle-graph, timeline | DISL 0.2 construct | 4.3, 5.3 `outOfRange.drag` | `gartner-hype-cycle.dis` |
| 8.12 | Refusing a typed value | wardley-map, timeline, dependency-graph | DISL 0.2 construct | 4.3, 5.3 `outOfRange.typed` | `gartner-hype-cycle.dis` |
| 8.13 | Shape handles that write model attributes (gartner phase boundaries) | gartner-hype-cycle-graph | DISL 0.2 construct | 6.8 handle `write`, `visible`, `refusals` | `gartner-hype-cycle.dis` |

## Gap 9: view state and canvas chrome

| # | Item | Needed by | Outcome | Where | Example |
|---|---|---|---|---|---|
| 9.1 | Per-viewer state (fold, expand and collapse) that is never persisted | mindmap, azure-devops-pipeline, dotnet-dependency-graph, gartner-hype-cycle-graph | DISL 0.2 construct | 11.6 `view.viewer`, `view.initial`; 4.3 `transient: "viewer"` | `mindmap.dis` |
| 9.2 | Per-viewer state that stays off undo | same as 9.1 | DISL 0.2 construct | 9.4 `view` action; 11.6 | `mindmap.dis` |
| 9.3 | User filters: tag chips | gartner-hype-cycle-graph (dotnet-dependency-graph as a switch) | DISL 0.2 construct | 6.13.1 `canvas.filters` | `gartner-hype-cycle.dis` |
| 9.4 | User filters: environment | c4-deployment | DISL 0.2 construct | 3.5 `members` (membership read from the file, not a viewer filter) | `c4-container.dis` (stand-in for c4-deployment) |
| 9.5 | A legend computed from what is drawn | C4 ×6, gartner-hype-cycle-graph | DISL 0.2 construct | 6.13 `legend.from`, `legend.computed` | `c4-container.dis` |
| 9.6 | A computed title | C4 ×6 | DISL 0.2 construct | 6.13 `canvas.title` | `c4-container.dis` |
| 9.7 | A header band outside the canvas | sparql-query | DISL 0.2 construct | 6.13 `canvas.header` | `c4-container.dis` (stand-in for sparql-query) |
| 9.8 | A truncation banner outside the canvas | W3C ×4, sparql-query | DISL 0.2 construct | 6.13 `canvas.notices` (built-in `budget:<id>`) | `rdf-graph.dis` |
| 9.9 | A status notice with its own buttons | dotnet-dependency-graph | DISL 0.2 construct | 6.13 `canvas.notices[].actions` | `rdf-graph.dis` (stand-in for dotnet-dependency-graph) |
| 9.10 | A compact-mode toggle | gartner-hype-cycle-graph | DISL 0.2 construct | 3.5 `variantOf`, `toggle` | `gartner-hype-cycle.dis` |
| 9.11 | A canvas that stretches to the pane | wardley-map | DISL 0.2 construct | 6.13 `canvas.fit: "stretch"`, `margin` | `gartner-hype-cycle.dis` (stand-in for wardley-map) |
| 9.12 | An empty-canvas message | ansible-structure, helm-chart, dotnet-dependency-graph, causal-loop-diagram | DISL 0.2 construct | 6.13 `canvas.empty` | `causal-loop.dis` |
| 9.13 | An initial zoom fitted to content | timeline | DISL 0.2 construct | 6.13 `zoom.initial: "fit"`, `fitPadding` | `gartner-hype-cycle.dis` (stand-in for timeline) |
| 9.14 | The fitted zoom then frozen | timeline | DISL 0.2 construct | 6.13 `zoom.fitWhen` and the rule that a model change never refits | `gartner-hype-cycle.dis` (stand-in for timeline) |

## Gap 10: scale

| # | Item | Needed by | Outcome | Where | Example |
|---|---|---|---|---|---|
| 10.1 | A hard budget that truncates | W3C ×4, sparql-query | DISL 0.2 construct | 3.2.1 `limits.budgets` | `rdf-graph.dis` |
| 10.2 | Truncation in a declared order | W3C ×4, sparql-query | DISL 0.2 construct | 3.2.1 `order`, `unit` | `rdf-graph.dis` |
| 10.3 | Edits withheld on a truncated view | W3C ×4 | DISL 0.2 construct | 3.2.1 `withhold`; 9.1 `editGate`; 12.4 `budget(id)` | `rdf-graph.dis` |
| 10.4 | Two budgets with different measures | w3c-shacl, w3c-skos | DISL 0.2 construct | 3.2.1 budgets map; `measure` as `count` or `{cel}` | `rdf-graph.dis` |
| 10.5 | Viewport delivery (what a connection receives, one hop across the edge) | W3C ×4, sparql-query, C4 ×6, Databricks ×3, dependency-graph, timeline | Host | runtime concern (spec, Assumptions) | none |

## Gap 11: notation

| # | Item | Needed by | Outcome | Where | Example |
|---|---|---|---|---|---|
| 11.1 | Anchors restricted to some sides | mindmap, databricks-job, timeline | DISL 0.2 construct | 6.9, 6.10 `sides` | `mindmap.dis` |
| 11.2 | Containment drawn as edges | mindmap | DISL 0.2 construct | 6.9 `container.nesting: "none"` with the 0.1 derived relation | `mindmap.dis` |
| 11.3 | A relation with no target, drawn as a stub | ansible-structure, helm-chart | DISL 0.2 construct | 4.9 `target.optional`; 6.10 `stub`; DID 3 | `databricks-job.dis` (stand-in), DID example |
| 11.4 | A bezier that loops forward when the target lies behind | timeline, dependency-graph, dotnet-dependency-graph, ansible-structure, helm-chart, azure-devops-pipeline, databricks-job | DISL 0.2 construct | 6.10 `line.bezier` | `databricks-job.dis` |
| 11.5 | A superellipse shape | functional-decomposition-graph | DISL 0.2 construct | 6.7 `superellipse`; B.2 | `functional-decomposition.dis` |
| 11.6 | A diode shape | functional-decomposition-graph | Sentence | 6.8: a 0.1 custom shape is exact | `functional-decomposition.dis` |
| 11.7 | The arc bow side | causal-loop-diagram | Sentence | 6.10: positive `curvature` bows left of the direction of travel | `causal-loop.dis` |
| 11.8 | Mirrored icons | causal-loop-diagram | DISL 0.2 construct | 6.9, 6.14 `flip` | `causal-loop.dis` |
| 11.9 | Badge slots that pack | azure-devops-pipeline | DISL 0.2 construct | 6.9 `badgeLayout`, `pack` | `databricks-job.dis` (stand-in) |
| 11.10 | A problem glyph on the node | azure-devops-pipeline | Sentence | 6.6 and 12.2: an ordinary badge driven by `self.findingSeverity()` (R12) | `databricks-job.dis` (stand-in) |
| 11.11 | Named unequal bands with labels on a linear axis | wardley-map | DISL 0.2 construct | 5.3 `ranges`; 12.4 `axisRange` | `gartner-hype-cycle.dis` (stand-in for wardley-map) |
| 11.12 | End labels on a linear axis | wardley-map | DISL 0.2 construct | 5.3 `endLabels` | `gartner-hype-cycle.dis` (stand-in for wardley-map) |
| 11.13 | A multi-level ruler | gartner-hype-cycle-graph | DISL 0.2 construct | 5.13 `levels[].minSpacingPx`, `step` | `gartner-hype-cycle.dis` |
| 11.14 | Adaptive tick formats | gartner-hype-cycle-graph, timeline | DISL 0.2 construct | 5.13 `ticks`, `boundaryFormats` | `gartner-hype-cycle.dis` (see constructs.md note 2) |
| 11.15 | Per-element label offsets in the model | wardley-map | DISL 0.2 construct | 6.9 `position.offset` bindable | `mindmap.dis` (stand-in for wardley-map) |
| 11.16 | `color-mix` in paints | ansible-structure, helm-chart | Sentence | 12.4: `color().mix()` and `.alpha()` pinned to CSS Color 5 | `c4-container.dis` (stand-in) |
| 11.17 | A fill contrast requirement | functional-decomposition-graph | DISL 0.2 construct | 6.2 `theme.contrast` | `functional-decomposition.dis` |
| 11.18 | A named text metric so every host measures text alike | mindmap, causal-loop-diagram, w3c-owl, w3c-skos, w3c-rdf | DISL 0.2 construct | 6.5 `textMetric`; 12.4 `textWidth`, `textHeight` | `mindmap.dis` |

## Gap 12: time and coordinates

| # | Item | Needed by | Outcome | Where | Example |
|---|---|---|---|---|---|
| 12.1 | Units coarser than a year | gartner-hype-cycle-graph | DISL 0.2 construct | 5.5 `TimeUnit` (`decade`, `century`, `millennium`); B.5 | `gartner-hype-cycle.dis` |
| 12.2 | Years before 1 | gartner-hype-cycle-graph | DISL 0.2 construct | 4.2 `yearMonth` (astronomical years); DID 3 | `gartner-hype-cycle.dis`, DID example |
| 12.3 | Month precision without days | gartner-hype-cycle-graph | DISL 0.2 construct | 4.2 `yearMonth`; 5.5 `valueType: "yearMonth"` | `gartner-hype-cycle.dis`, DID example |
| 12.4 | Keeping a value's written precision on write-back | timeline | DISL 0.2 construct | 4.2 `writtenPrecision`, `newPrecision`; 12.4 `precisionOf`; DID 3 | `gartner-hype-cycle.dis` (stand-in for timeline), DID example |
| 12.5 | Snapping rules per gesture (move rounds, drop floors) | gartner-hype-cycle-graph, timeline | DISL 0.2 construct | 5.9 `byGesture` | `gartner-hype-cycle.dis` |
| 12.6 | How halves round | timeline, gartner-hype-cycle-graph | DISL 0.2 construct | 5.10 `ties`; 12.4 `snap(v, step, ties)` | `gartner-hype-cycle.dis` |
| 12.7 | Anchors bound to model attributes (a phase, an edge and a fraction) | gartner-hype-cycle-graph | DISL 0.2 construct | 6.10 end anchor `mode: "part"` | `gartner-hype-cycle.dis` |

## Gap 13: smaller items

| # | Item | Needed by | Outcome | Where | Example |
|---|---|---|---|---|---|
| 13.1 | A simulated, animated action that plays over time and never enters undo | Databricks ×3 | DISL 0.2 construct | 9.3, new 9.6 `simulate` | `databricks-job.dis` |
| 13.2 | A hook `forEach` that sees the claims of earlier iterations | causal-loop-diagram | Sentence | 9.4 | `causal-loop.dis` |
| 13.3 | The ordering of CEL `sort()` on strings | w3c-skos (causal-loop-diagram, dotnet-dependency-graph) | Sentence | 12.1, 12.5: code point order, stable | `causal-loop.dis` |
| 13.4 | Enum wire values with hyphens (`run-job`, `for-each`) | databricks-job | DISL 0.2 construct | 4.5 `value`; DID 3 | `databricks-job.dis`, DID example |
| 13.5 | Whether `acyclic` on an abstract relation type covers its subtypes | functional-decomposition-graph | Sentence | 4.9, 8.7, 12.2 | `functional-decomposition.dis` |
| 13.6 | A way to mark a fixed attribute as not persisted | functional-decomposition-graph | DISL 0.2 construct | 4.3 `fixed`; DID 3 | `functional-decomposition.dis` |
| 13.7 | Hygiene: rule ids spelled `x-adp-rule-id` (Ansible) and `x-adp-ruleId` (Databricks) | ansible-structure, Databricks ×3 | Done by PR #40 | PR #40 made one key; DISL 0.2 `code` then replaces it (x-adp table below) | none |
| 13.8 | Hygiene: gartner uses its own `x-ghg-*` keys | gartner-hype-cycle-graph | DISL 0.2 construct | 6.8 handle `write`, 6.10 `mode: "part"`; the header key goes to FBL and the tooltip key remains (x-adp table below) | `gartner-hype-cycle.dis` |
| 13.9 | Hygiene: `definitions/` is not covered by the examples validator in CI | all 23 | Done by PR #40 | PR #40 | none |

## Totals

135 rows: 3 (23), 4 (15), 6 (15), 7 (16), 8 (13), 9 (14), 10 (5), 11 (18), 12 (7), 13 (9).

| Outcome | Rows |
|---|---|
| DISL 0.2 construct | 114 |
| Sentence (no construct needed) | 10 |
| FBL | 8 |
| Plugin | 0 |
| Host | 1 |
| Later DISL feature | 0 |
| Done by PR #40 | 2 |

No gap-summary item in these themes is left to a plugin or to the layouts feature; plugins and layouts appear only in the x-adp and plugin tables and in the out-of-scope list below.

The x-adp and plugin tables below add 32 rows: extension keys 18 (DISL 0.2 construct 12, FBL 4, remains 2) and plugin declarations 14 (DISL 0.2 construct 9, FBL 2, plugin 1, later DISL feature 1, host 1).

## Items the research added

These are not bullets of the gaps summary but came out of the definitions while researching them; each has a construct or a sentence in DISL 0.2 and is in [constructs.md](constructs.md): ids generated once per gesture, with redo reusing them (11.5, 14.4); case-insensitive ids (11.5 `compare`); a declared order of gesture checks (8.4); a diagram-wide edit gate (9.1 `editGate`); stored view data keyed by an unstable id (8.7 `std.ephemeralViewData`); failed, clashing and ill-ended derived elements (8.7 `std.derivedFailed`, `std.derivedId`, `std.derivedEnds`); one finding per missing plugin (8.7 `std.pluginMissing`); one drawing order for membership, derived elements, filters, budgets and visibility (3.5, `diagram.drawn`).

## x-adp keys and plugin declarations (FR-004, SC-004)

Found with a scan of every `"x-*"` key and every `plugins` entry in `definitions/diagrams/*.dis` on `features/004-disl-0-2`.

### Extension keys

| Definition | Key (path) | Uses | Theme | Replacement in DISL 0.2 | Outcome |
|---|---|---|---|---|---|
| ansible-structure | `constraints.rules[].x-adp-ruleId` (`ansible.role-missing`, `.dangling-import`, `.unmatched-hosts`, `.unreadable-yaml`, `.empty-role`) | 5 | findings | 8.2 `code`; `unreadable-yaml` can become `std.unparseable` with that `code` (8.1) | DISL 0.2 construct |
| databricks-job | `constraints.rules[].x-adp-ruleId` (`databricks.task-key-missing`, `.missing-task`, `.dangling-cluster`, `.duplicate-task-key`, `.cycle`) | 5 | findings | 8.2 `code`; `task-key-missing` can become `std.unreadableEntry`, `duplicate-task-key` uses `positionIn`, `cycle` uses `forEach` over `diagram.cycles` | DISL 0.2 construct |
| databricks-bundle | `constraints.rules[].x-adp-ruleId` (`databricks.no-default-target`, `.multiple-default-targets`, `.override-of-undeclared`) | 3 | findings | 8.2 `code`; `multiple-default-targets` uses `positionIn` | DISL 0.2 construct |
| databricks-pipeline | `constraints.rules[].x-adp-ruleId` (`databricks.no-libraries`, `.schema-without-catalog`) | 2 | findings | 8.2 `code` | DISL 0.2 construct |
| azure-devops-pipeline | rule ids in `constraints.rules[].label` (for example `azure-pipeline.cycle`) | all rules | findings | 8.2 `code`; `cycle` reports one finding per loop through `forEach` over `diagram.cycles` | DISL 0.2 construct |
| C4 ×6 | rule ids in `constraints.rules[].tags` (`c4.*`, for example `c4.disconnected-element`) | all rules | findings | 8.2 `code` (the `structurizr:*` tags stay tags) | DISL 0.2 construct |
| gartner-hype-cycle-graph | rule ids in `constraints.rules[].tags` (`ghg.*`, for example `ghg.stop-before-start`) | all rules | findings | 8.2 `code` | DISL 0.2 construct |
| ansible-structure, dependency-graph, dotnet-dependency-graph, functional-decomposition-graph, W3C ×4 | `x-adp.origin` | 8 | small items | 3.2 `language.origin` | DISL 0.2 construct |
| azure-devops-pipeline | `language.x-adp-origin` | 1 | small items | 3.2 `language.origin` | DISL 0.2 construct |
| helm-chart | `x-adp-origin` | 1 | small items | 3.2 `language.origin` | DISL 0.2 construct |
| gartner-hype-cycle-graph | `notation.shapes.phasedBanner.x-ghg-boundaryHandles` | 1 | gestures | 6.8 handle `write`, `visible`, `refusals` | DISL 0.2 construct |
| gartner-hype-cycle-graph | `notation.edges.Influence.x-ghg-attachment` | 1 | time and coordinates | 6.10 end anchor `mode: "part"` | DISL 0.2 construct |
| gartner-hype-cycle-graph | `notation.shapes.phasedBanner.parts[].x-ghg-tooltip` | 4 | notation, not a summary item | none: a tooltip per shape part is not in the gaps summary; it remains until a later notation change takes it up | Remains |
| gartner-hype-cycle-graph | `persistence.x-ghg-header` (file header key and value) | 1 | reading and writing | FBL (the file's header is part of its format) | FBL |
| functional-decomposition-graph | `metamodel.types.<T>.x-fdg.documentType`, `metamodel.relations.<R>.x-fdg.documentType` | 10 | reading and writing | FBL (the file's own type names; `derived-and-small.md#E4`) | FBL |
| ansible-structure | `x-adp.subject: "folder"` | 1 | reading (gap 2) | FBL (a folder as the subject) | FBL |
| dotnet-dependency-graph, azure-devops-pipeline, W3C ×4 | `x-adp.documentExtensions`, `x-adp.sharedExtension`, `language.x-adp-shared-extension`, `x-adp.extensions`, `x-adp.claimsBareFiles`, `x-adp.suggestWhenBodyContains`, `x-adp.family`, `x-adp.registrationHeaders` | 1 to 6 per key | routing and registration (gap 2) | FBL (routing, registration, one model with several readings) | FBL |
| ansible-structure, dependency-graph, dotnet-dependency-graph, functional-decomposition-graph, W3C ×4, azure-devops-pipeline | `x-adp.kind`, `x-adp.state`, `language.x-adp-state`, `x-adp.standaloneModule`, `x-adp.companion`, `x-adp.implementations` | 1 to 8 per key | catalogue metadata, not a theme | none: they describe the definition (its state, companion note and implementations), not the tool, and stay as extension keys | Remains |

### Plugin declarations

| Definition | Plugin and extension point | Theme | Replacement in DISL 0.2 | Outcome |
|---|---|---|---|---|
| causal-loop-diagram | `net.etalii.adp.systems.cld`, `celFunctions` `elementaryCycles`, `cycleSearchTruncated` | derived (cycle enumeration) | 12.4 `diagram.cycles`, `diagram.cyclesTruncated` | DISL 0.2 construct |
| Databricks ×3 | `net.etalii.adp.databricks.simulation`, `action` (`simulateRun`, `simulateDeploy`, `simulateUpdate`) | small items | 9.6 `simulate` | DISL 0.2 construct |
| mindmap | `net.etalii.adp.freeplane.mindmapFold`, `action` (`toggleFold`) | view state | 9.4 `view` action; 11.6 `view.viewer` | DISL 0.2 construct |
| dependency-graph | `net.etalii.adp.generic.dependencyCurve`, `routing` | notation | 6.10 `line.bezier` with `backward: "loop"` | DISL 0.2 construct |
| azure-devops-pipeline | `net.etalii.adp.azure-devops.pipelineYaml`, `action` `toggleExpansion` (`toggleJobs`, `toggleSteps`) | view state | 9.4 `view` action with `collapsed`; 11.6 `view.viewer` | DISL 0.2 construct |
| azure-devops-pipeline | `net.etalii.adp.azure-devops.pipelineYaml`, `action` `moveStep` (`moveUp`, `moveDown`) | gestures | 9.4 `reorder`; 7.3 `moveUp`, `moveDown`; 8.4 kind `reorder` | DISL 0.2 construct |
| W3C ×4 | `net.etalii.adp.w3c.turtle`, the projection of triples onto elements (part of `import` and `persistenceFormat`) | derived | 4.11 derived node types and 4.9 derived relations; the reading itself goes to FBL | DISL 0.2 construct |
| sparql-query | `net.etalii.adp.w3c.sparqlQuery`, the projection of the query onto elements | derived | 4.11 derived node and relation types, `derived.parent`, `derived.owner`; the reading goes to FBL | DISL 0.2 construct |
| C4 ×6 | `net.etalii.adp.c4.structurizrDsl`, view membership and relationship lifting (inside `import`) | derived | 3.5 `members`; 4.9 derived relation with `key` | DISL 0.2 construct |
| W3C ×4 | `net.etalii.adp.w3c.turtle`, `celFunctions` `rdfLocalName`, `rdfMintIri`, `rdfMintRefusal`, `rdfTermExists`, `rdfCompress`, `rdfDisplayName`, `rdfResolveTerm`, `rdfTermRefusal` | derived (plugin functions in CEL) | stay plugin functions (the term grammar and prefixes are the Turtle format's), now declared with named `params`, `uses` and `fallback` (13.1) | Plugin |
| W3C ×4 | `net.etalii.adp.w3c.turtle`, `action` (`renameTerm`, `declareTerm`, `addPrefix`, the SHACL write actions) | reading and writing | FBL (edits spliced into the Turtle file) | FBL |
| All 22 but timeline | the `persistenceFormat` and `import` plugins (`net.etalii.adp.ansible.folder`, `.azure-devops.pipelineYaml`, `.c4.structurizrDsl`, `.systems.cld`, `.databricks.files`, `.generic.dgr`, `.dotnet.solution`, `.etalii.fdg`, `.gartner.ghgYaml`, `.helm.chartFolder`, `.freeplane.mm`, `.w3c.sparqlQuery`, `.w3c.turtle`, `.wardley.owm`) | reading and writing (gaps 1 and 2) | FBL | FBL |
| 14 definitions | the `layout` plugins (`ansible.folder`, `systems.cld`, `databricks.layout` ×3, `dotnet.dependencyLayers`, `gartner.rowPacked`, `helm.anatomyBands`, `freeplane.mindmapLayout`, `w3c.sparqlScopeGrid`, `w3c.owlDepthColumns`, `w3c.rdfTypeBands`, `w3c.shaclGrid`, `w3c.skosBands`) | layouts (gap 5) | later DISL layouts feature | Later DISL feature |
| ansible-structure, dotnet-dependency-graph, helm-chart, mindmap | host actions: `ansible.folder` `reveal`, `dotnet.solution` `revealProjectFile` and `reload`, `ide.revealPath`, `ide.projectLinkPicker` (an action and a widget) | host integration | host (revealing a file, picking a project file); `reload` is FBL's file watching | Host |

## Out of scope: gaps 1, 2, the reading side of 3, and 5

| Gap | Item | Owner |
|---|---|---|
| 1 | The stored file is the model and belongs to other tools as much as to ADP | FBL |
| 1 | An unchanged file saves byte for byte; comments, unknown keys, indentation and line endings survive | FBL |
| 1 | An edit is a named, minimal splice (insert after the last entry of its kind, create a section on demand, remove an emptied key, rewrite references on rename, JSON comma surgery) | FBL |
| 1 | Undo is a splice inverse or a snapshot, and refuses when the file has drifted | FBL (the refusal's wording is a `behavior.messages` id FBL defines) |
| 1 | Reading never fails: bad entries become findings, an unreadable body opens empty and read-only | FBL; DISL 0.2 supplies the findings (`std.unparseable`, `std.unreadableEntry`, 8.6) |
| 1 | The new-document template is the bytes of a foreign file | FBL |
| 1 | Read-only foreign models (SPARQL, Helm, Ansible, .NET): read, never written, only positions saved | FBL |
| 1 | A standard contract for persistence plugins, including the right to report findings | FBL (findings through DISL's `SourceLocation`) |
| 2 | Registration plus body: an `.adp` registration names the model file and keeps positions for dragged elements only | FBL |
| 2 | One model, several readings, with one shared store and history | FBL |
| 2 | A folder as the subject: recognised, read tolerantly, watched with a debounce, diffed into open views | FBL |
| 2 | Routing: a shared extension that becomes a diagram only with an opt-in marker, suggested by marker text | FBL |
| 3 | The reading side: stored records one per source entry, with a source location and with or without a write rule (rows 3.7 and 3.11 to 3.16) | FBL |
| 5 | A family of banded and columned layered layouts (the 14 plugin layouts) | Later DISL layouts feature |
| 5 | Layout options taken from diagram attributes (C4 `autoLayout`) | Later DISL layouts feature |
| 5 | Stored positions honoured for some id shapes and not others | Later DISL layouts feature; DISL 0.2 already forbids positions for ephemeral ids (11.5) |
| 5 | A stored container position moving its computed contents | Later DISL layouts feature |
| 5 | Implicit pinning on drag with continuous re-layout | Later DISL layouts feature |
| 5 | Layout order equal to the model's discovery order | Later DISL layouts feature |
| 5 | A layout that can refuse with a message | Later DISL layouts feature |

Also left out by the research (R15), each with its owner: term grammars and parsers (IRI resolution, minting, gartner's month and size parsers) stay plugin functions called from CEL (13.1); gartner's iterative keep-a-month-apart clamp across neighbours is a declared function used in a handle `snap`; refusals about the host (no project history, no registration, undo drift) are FBL's and the host's, through `env.readOnly` and `behavior.messages` ids FBL defines; menu entries offered because the file asserts another reading's types are FBL's (one model, several readings); sidecar-keyed ids are FBL's (row 4.13). The standalone bugs the gaps summary lists are host bugs, handled in their own threads (spec, Assumptions).
