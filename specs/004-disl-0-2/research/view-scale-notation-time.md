# DISL 0.2 research: view state and chrome, scale, notation, time (gaps 9 to 12)

Research input for `specs/004-disl-0-2` (FR-050, FR-051, FR-060, FR-070, FR-080; User Stories 6 to 9). Read against `specifications/disl/DISL-specification.md` 0.1 (section numbers below are 0.1's), `specifications/disl/disl.schema.json`, `specifications/did/DID-specification.md`, and the 23 definitions and companion notes in `definitions/diagrams/`. Citations are `file:line`; `.md` lines are companion notes, `.dis` lines are the specification text.

Guiding choices, from constitution principle V (a construct needs a current tool's need; prefer extending 0.1 constructs and CEL):

- **Extend, do not add, where 0.1 has a home.** Viewer state extends `persistence.view` (11.6) and `transient` (4.3); chrome extends `canvas` (6.13); budgets extend `language.limits` (3.2); anchors extend `AnchorSpec`/`EndAnchor` (6.9, 6.10); ruler ticks extend `Ruler` (5.13); gesture snapping extends `Snapping` (5.9).
- **One new CEL context and a handful of functions**, no new expression language.
- **0.1 documents keep their meaning.** Every addition is an optional property whose absence is the 0.1 behaviour; the few places where 0.1 was silent and 0.2 now decides are listed under "Changes from 0.1".
- **Nothing here is stored except where noted**: viewer state, filters, budgets and chrome never reach a DID file. DID changes only for three value forms (items T1, T3, N3).

Contents: [Summary table](#summary-table) · [Gap 9](#gap-9-view-state-and-canvas-chrome) · [Gap 10](#gap-10-scale-hard-budgets) · [Gap 11](#gap-11-notation) · [Gap 12](#gap-12-time-and-coordinates) · [Schema impact](#schema-defs-impact-consolidated) · [DID impact](#did-impact-consolidated) · [Changes from 0.1](#changes-from-01-candidate-list) · [Left to plugins](#left-to-plugins) · [Feature ids](#feature-identifiers-b8)

---

## Summary table

| # | Item | Construct (0.2) | Section | Needed by | DID |
|---|---|---|---|---|---|
| V1 | Per-viewer fold, expand, collapse | `persistence.view.viewer`, `view.initial`, action `view` | 11.6, 9.4 | mindmap, azure-devops-pipeline | no |
| V2 | Viewer-scoped flags | `transient: "viewer"` | 4.3 | dotnet-dependency-graph, gartner | no |
| V3 | User filters (tag chips, switch) | `canvas.filters` | 6.13 (new 6.13.1) | gartner, dotnet | no |
| V4 | Legend computed from what is drawn | `canvas.legend.from: "drawn"`, `legend.computed` | 6.13 | C4 ×6, gartner | no |
| V5 | Computed title | `canvas.title` | 6.13 | C4 ×6 | no |
| V6 | Header band outside the canvas | `canvas.header` | 6.13 | sparql-query | no |
| V7 | Status notice with buttons; truncation banner; unavailable notice | `canvas.notices` | 6.13 | dotnet, W3C ×4, sparql, timeline, dependency-graph, databricks-job | no |
| V8 | Compact-mode toggle | `viewpoint.variantOf`, `toggle` | 3.5 | gartner | no |
| V9 | Canvas stretching to the pane | `canvas.fit: "stretch"` | 6.13 | wardley-map | no |
| V10 | Empty-canvas message | `canvas.empty` | 6.13 | ansible, helm, dotnet, CLD | no |
| V11 | Initial zoom fitted, then frozen | `canvas.zoom.initial: "fit"` | 6.13 | timeline (owl defect) | no |
| S1 | Hard budgets, truncation order, withheld edits, two measures | `language.limits.budgets` | 3.2 (new 3.2.1) | W3C ×4, sparql (CLD layout budget) | no |
| N1 | Anchors restricted to sides | `sides` on `AnchorSpec`/`EndAnchor` | 6.9, 6.10 | mindmap, databricks-job, timeline | no |
| N2 | Containment drawn as edges | `container.nesting: "none"` + derived relation (0.1) | 6.9 | mindmap | no |
| N3 | Relation with no target, drawn as a stub | `RelationEnd.optional`, `EdgeNotation.stub` | 4.9, 6.10 | ansible, helm | **yes** |
| N4 | Bezier looping forward | `LineSpec.bezier: {reach, backward}` | 6.10 | timeline, dependency-graph, dotnet, ansible, helm, azure, databricks | no |
| N5 | Superellipse | built-in `superellipse` | 6.7 | FDG | no |
| N6 | Diode | none: 0.1 custom shape is exact | – | FDG | no |
| N7 | Arc bow side | normative sentence on `curvature` | 6.10 | CLD | no |
| N8 | Mirrored icons | `flip` on `NodeIcon`, `Badge`, `IconRef` object | 6.9, 6.14 | CLD | no |
| N9 | Packing badge slots | `NodeNotation.badgeLayout`, `Badge.pack` | 6.9 | azure-devops-pipeline | no |
| N10 | Problem glyph on node | CEL `self.findingSeverity()` + ordinary `Badge` | 12.2 | azure-devops-pipeline, mindmap-style glyphs | no |
| N11 | Named unequal bands and end labels on a linear axis | `Axis.ranges`, `Axis.endLabels` | 5.3 | wardley-map | no |
| N12 | Multi-level ruler, adaptive tick formats | `Ruler.minSpacingPx`, `Ruler.ticks`, `boundaryFormats` | 5.13 | gartner, timeline | no |
| N13 | Per-element label offsets in the model | Bindable `offset` in `Position` | 6.9, 6.12 | wardley-map | no |
| N14 | `color-mix` in paints | pin `color(c).mix()` semantics (CEL, 0.1) | 12.4 | ansible, helm | no |
| N15 | Fill contrast requirement | `theme.contrast` | 6.2, 6.15 | FDG | no |
| N16 | Named text metric | `notation.textMetric`, CEL `textWidth()` | 6.5, 12.4 | mindmap, CLD, W3C ×3 | no |
| T1 | Units coarser than a year; years before 1; month precision | units `decade`, `century`, `millennium`; primitive `yearMonth`; `valueType: "yearMonth"` | 4.2, 5.5, B.5 | gartner | **yes** |
| T2 | Bindable time scale unit | `scale.unit` Bindable | 5.5 | gartner | no |
| T3 | Keeping written precision on write-back | `writtenPrecision` facet, CEL `precisionOf` | 4.2 | timeline | **yes** |
| T4 | Snapping per gesture | `Snapping.byGesture` | 5.9 | gartner, timeline | no |
| T5 | How halves round | `SnapRule.ties` | 5.10 | timeline, gartner | no |
| T6 | Anchors bound to model attributes | `EndAnchor.mode: "part"` with bound `part`, `side`, `at` | 6.10 | gartner | no |

---

## Gap 9: View state and canvas chrome

### Ordering of what is drawn (applies to V1 to V11 and S1)

A new normative paragraph in 3.5 (or 14.4), because filters, budgets, legends and the empty message all depend on it:

> The elements drawn in a view are computed in this order: (1) the viewpoint's `include`/`exclude`; (2) derived nodes and relations; (3) elements hidden by viewer state (collapsed containers, `canvas.filters`); (4) budgets (3.2.1); (5) `visible: false` styles. A relation is drawn only when both its ends are drawn, or it is a stub (N3). The result is available to CEL as `diagram.drawn`.

This settles the spec's edge case "a hard budget and a filter together: the budget applies to what the filter leaves" (spec.md line 193).

CEL (12.2, Diagram): `drawn → list(Element)` (elements drawn in the current view, after steps 1 to 5; `[]` in headless contexts). It is available in `element`, `legend`, `filter` and `chrome` contexts only; validators **MUST** reject it in `constraint`, `migration`, `create`, `placement` and `snap` contexts (12.5 determinism: findings never depend on a viewer).

### V1. Per-viewer fold, expand and collapse

**(1) Needed by**

- mindmap: fold is "per connection, keyed by viewer and map … never written to the file, never lands on the undo history, is allowed in read-only mode" (`mindmap.md:136-140`); `FOLDED` seeds the viewer's set on first open (`mindmap.md:136`); revealing a node expands collapsed ancestors (`mindmap.md:140`); listed as a DISL lack (`mindmap.md:256`); the `.dis` stores no view data and routes the toggle through plugin `net.etalii.adp.freeplane.mindmapFold` (`mindmap.md:142`, `mindmap.dis:200`, `mindmap.dis:450`).
- azure-devops-pipeline: "A new view starts with everything closed. Open/closed state is per connection per file, never written and not on the undo history" (`azure-devops-pipeline.md:56`); `azure-devops-pipeline.dis:337`, `:382`, `:428` (`collapsible: true`), `:900` (`view.store: []` with the rule in prose).

**(2) Construct.** Extend 11.6 `persistence.view` and 9.4 actions.

| Property | Type | Default | Description |
|---|---|---|---|
| `view.viewer` | ViewKind[] | `[]` | View-data kinds held per viewer: `collapsed`, `compartments` (collapse), `viewport`, `selection`, `filters`, `viewpoint`. |
| `view.initial` | map kind → Bindable | kind defaults | Value a viewer starts with; evaluated in the `element` context when a viewer first opens the view. |
| `view.revealExpands` | bool | `true` | Revealing or selecting an element inside a collapsed container expands its collapsed ancestors. |

New action (9.4): `{ "view": { "collapsed": expr, "filters": { "<id>": expr }, "viewpoint": expr }, "target": expr }`.

Normative text:

- A kind **MUST NOT** appear in both `view.store` and `view.viewer`.
- Viewer state **MUST NOT** be written to a DID definition, **MUST NOT** enter the undo or redo history, **MUST** be changeable in read-only mode, and **MUST NOT** be shared with another viewer. A runtime **MAY** keep it for the viewer's session; it **MUST NOT** outlive the view unless the host offers a per-user preference store, which is outside DISL.
- When a viewer first opens a view, each kind in `view.viewer` takes its `view.initial` value; `collapsed` without `initial` starts `false`.
- A `view` action changes viewer state only; an operation whose actions are all `view` actions (and `select`, `reveal`, `highlight`) **MUST** be offered in read-only mode and **MUST NOT** create an undo step.
- `self.view.collapsed` reads the viewer's value. Validators **MUST** reject `self.view` in `constraint`, `derived` and `migration` contexts when the kind is in `view.viewer`.

CEL: no new variable; `self.view.collapsed` (12.2) now resolves per viewer. Menu labels that flip ("Collapse"/"Expand", "Show jobs"/"Hide jobs", `azure-devops-pipeline.md:58`) belong to gap 7 (FR-034).

**(3) Schema.** `Persistence.properties.view` gains `viewer` (array of `$defs/ViewKind`), `initial` (object), `revealExpands` (bool). New `$defs/ViewKind` enum (the 0.1 `store` enum plus `selection`, `filters`, `viewpoint`), and `store` refactored to reference it (0.1 values unchanged). `$defs/Action` gains the `view` branch.

**(4) Example (mindmap).**

```json
{
  "persistence": {
    "view": {
      "store": [],
      "viewer": ["collapsed", "viewport"],
      "initial": { "collapsed": { "cel": "self.folded" } },
      "doc": "Folding belongs to each viewer: FOLDED in the file seeds it once."
    }
  },
  "behavior": {
    "operations": {
      "toggleFold": {
        "label": "Collapse",
        "for": ["Node"],
        "enabled": "self.children.size() > 0",
        "actions": [ { "view": { "collapsed": "!self.view.collapsed" } } ]
      }
    }
  }
}
```

azure-devops-pipeline: `"viewer": ["collapsed"], "initial": { "collapsed": true }`.

**(5) 0.1 compatibility.** Absent `viewer` means 0.1 behaviour: kinds not in `store` are recomputed on load. `view.store` entries keep their meaning. No change.

**(6) DID.** None: DID section 5 already stores only `view.store` kinds.

### V2. Viewer-scoped flags (`transient: "viewer"`)

**(1) Needed by**

- dotnet-dependency-graph: ambient packages hidden "as a view state of the open canvas, **never persisted**, and resets when the diagram is reopened" (`dotnet-dependency-graph.md:157`); today `showAmbientPackages` with `transient: true` (`dotnet-dependency-graph.dis:33-34`) and two operations (`:324-336`), which 0.1 does not keep off undo or per viewer.
- gartner: compact switch "is not remembered: every diagram opens in true-time" (`gartner-hype-cycle-graph.md:149`).

**(2) Construct.** 4.3 `transient` becomes `bool | "viewer"`.

- `true` keeps the 0.1 meaning: editable, not persisted (undo behaviour stays runtime-defined, as in 0.1).
- `"viewer"`: the value is held per viewer, starts at `default` every time a viewer opens the view, is never persisted, never enters undo, is settable in read-only mode, and **MUST NOT** be read in `constraint`, `derived`, `migration`, `create`, `placement` or `snap` contexts (validators **MUST** reject such reads).

A `set` action on a `"viewer"` attribute is a viewer-state change (same rules as the `view` action).

**(3) Schema.** `Attribute.properties.transient`: `anyOf [boolean, {const: "viewer"}]`.

**(4) Example (dotnet-dependency-graph).**

```json
"showAmbientPackages": { "type": "bool", "default": false, "transient": "viewer", "label": "Show ambient packages" }
```

(V3 offers the more direct form, a switch filter; either is valid.)

**(5) 0.1 compatibility.** `true` unchanged.

**(6) DID.** None.

### V3. User filters

**(1) Needed by**

- gartner: "Filter by tags" chips, lookup of tags in use, Any/All switch, case-insensitive; applies to trends and triggers only; non-matching elements hidden with their influences; notes always stay; view state only, never saved (`gartner-hype-cycle-graph.md:139`, `:132`, `:233`, `:238`); the `.dis` has only the `tags` attribute doc (`gartner-hype-cycle-graph.dis:196`).
- dotnet-dependency-graph: the ambient-package hiding is a filter with a switch (`dotnet-dependency-graph.md:156-158`).
- Not a user filter: C4 deployment's environment is view membership read from the file (`c4-deployment.md:25`); it belongs to derived membership (gap 3), not here.

**(2) Construct.** New `canvas.filters` (6.13), map id → Filter. The filter's value is viewer state (kind `filters` in V1; always viewer-scoped, whatever `view.viewer` says).

| Property | Type | Default | Description |
|---|---|---|---|
| `label` | LocalizedText | id | Shown on the control. |
| `control` | `"chips"`, `"switch"`, `"select"`, `"search"` | **required** | `chips`: a list of chosen values; `switch`: a bool; `select`: one of `options`; `search`: free text. |
| `appliesTo` | TypeRef[] | all node types | Types the filter can hide; others always stay. |
| `options` | `{cel}` | – | List of offered values (`chips`, `select`), in the `filter` context without `self`. |
| `default` | literal or `{cel}` | `[]` / `false` / `''` | Value a viewer starts with. |
| `match` | `{ "default": "any"\|"all", "userToggle": bool }` | `{any, true}` | For `chips`. |
| `keep` | Expression | **required** | True when `self` stays drawn, in the `filter` context. |
| `effect` | `"hide"`, `"dim"` | `"hide"` | `dim` applies the `filteredOut` interaction state instead of hiding. |
| `position` | Position | runtime | Where the control sits (chrome, outside the surface). |
| `doc` | Doc | – | |

New CEL context `filter`: `self`, `value`, `match`, `diagram`, `env`. A new interaction state `filteredOut` (6.6) for `effect: "dim"`.

Normative text: a filtered-out node **MUST NOT** be drawn (or, for `dim`, **MUST** take `filteredOut`); a relation with a filtered-out end **MUST NOT** be drawn; filtering **MUST NOT** change the model, findings or undo; filtered-out elements are excluded from `diagram.drawn` and from a `from: "drawn"` legend; a refusal or reason that names a filtered-out element still names it (spec.md line 194).

**(3) Schema.** `Canvas.properties.filters` → map of new `$defs/Filter`. `$defs/States` gains `filteredOut`.

**(4) Example (gartner).**

```json
"filters": {
  "tags": {
    "label": "Filter by tags",
    "control": "chips",
    "appliesTo": ["Trend", "Trigger"],
    "options": { "cel": "diagram.nodes.filter(n, n.isA('Trend') || n.isA('Trigger')).map(n, n.tags).flatten().map(t, lower(t)).distinct()" },
    "match": { "default": "any", "userToggle": true },
    "keep": "value.size() == 0 || (match == 'any' ? value.exists(t, self.tags.exists(s, lower(s) == lower(t))) : value.all(t, self.tags.exists(s, lower(s) == lower(t))))",
    "doc": "Hides trends and triggers without the chosen tags, and every influence to or from them. Notes always stay."
  }
}
```

dotnet-dependency-graph, as a switch: `"ambient": { "label": "Show ambient packages", "control": "switch", "default": false, "appliesTo": ["Package"], "keep": "value || !self.isAmbient" }`.

**(5) 0.1 compatibility.** New optional property.

**(6) DID.** None (filters are never stored; `settings` in `view.store` is not used for them).

### V4. Legend computed from what is drawn

**(1) Needed by**

- C4 ×6: "A key under the canvas, one entry per distinct kind tag drawn, `(external)` appended where it applies, each with a swatch in its background colour" (`c4-component.md:70`, same at `c4-container.md:70`, `c4-context.md:66`, `c4-deployment.md:70`, `c4-dynamic.md:70`, `c4-system-landscape.md:65`); `c4-component.dis:1589-1593` declares `legend: {visible, position: "bottom"}` with the rule in `doc`.
- gartner: "one swatch per phase painted by the same rule that paints the phase", under the filter box (`gartner-hype-cycle-graph.md:141`); `gartner-hype-cycle-graph.dis:611` names the `Phase` enum.
- The spec's acceptance scenario: "When a filter hides every node of a type, Then that type leaves the legend" (spec.md line 124).

**(2) Construct.** Extend 6.13 `legend`.

| Property | Type | Default | Description |
|---|---|---|---|
| `from` | `"declared"`, `"drawn"` | `"declared"` | `drawn`: an entry is shown only while at least one element of `diagram.drawn` matches it. |
| `computed` | `{key, label, swatch, order}` | – | Entries computed per drawn element: `key` (Expression, `legend` context) groups elements into one entry; `label` (BString) and `swatch` (`{shape, fill, stroke, icon}`, Bindable) are evaluated on the first element of each group; `order` sorts entries (default first appearance in persistence order). |
| `title` | LocalizedText | – | Heading of the key. |

New CEL context `legend`: `self`, `diagram`, `env`. A string entry in `entries` (0.1) matches, under `from: "drawn"`, when a drawn element has that type, takes that enum value, uses that marker, or satisfies that conditional style.

Positions `outside-*` on the canvas legend place it outside the drawing surface (chrome), not zoomed or panned.

**(3) Schema.** `Canvas.legend` gains `from`, `computed` (new `$defs/LegendComputed`), `title`.

**(4) Example (C4 container).**

```json
"legend": {
  "visible": true,
  "position": "outside-bottom",
  "from": "drawn",
  "computed": {
    "key": "self.kindTag + (self.external ? ' (external)' : '')",
    "label": { "cel": "self.kindTag + (self.external ? ' (external)' : '')" },
    "swatch": { "shape": "roundedRect", "fill": { "cel": "kindBackground(self)" } }
  }
}
```

(`kindTag`, `external` and `kindBackground` stand for what the C4 `.dis` already derives for its node colours.)

**(5) 0.1 compatibility.** `from` defaults to `declared`, the 0.1 behaviour.

**(6) DID.** None.

### V5. Computed title

**(1) Needed by.** C4 ×6: "Every view carries a title above the canvas: the view's own `title`, else `Component diagram for <scope name>`" (`c4-component.md:69`, likewise `c4-container.md:69`, `c4-context.md:65`, `c4-deployment.md:69`, `c4-dynamic.md:69`, `c4-system-landscape.md:64`); the heading is already a derived diagram attribute (`c4-component.dis:65-69`) and its placement is prose (`c4-component.dis:1593`).

**(2) Construct.** `canvas.title`: a Label (6.12) evaluated with `self` bound to the diagram, drawn above the drawing surface, outside it, never zoomed, panned or selectable. `editable` works as for any label (default `false` when bound to a derived attribute).

**(3) Schema.** `Canvas.properties.title` → `$ref Label`.

**(4) Example (C4 component).** `"title": { "id": "heading", "text": { "attribute": "heading" }, "style": "diagramTitle" }`

**(5) 0.1 compatibility.** New optional property.

**(6) DID.** None.

### V6. Header band outside the canvas

**(1) Needed by.** sparql-query: the header band shows the form line then dataset clauses and solution modifiers as rows (`sparql-query.md:90`), "is an HTML band above the drawing surface … DISL has no band outside the canvas" (`sparql-query.md:140`, `:208`); the `.dis` keeps it in diagram attributes and a layout offset (`sparql-query.dis:30`, `:44-46`, `:273`); refusal for dragging it (`sparql-query.md:120`).

**(2) Construct.** `canvas.header`: `{ "rows": Label[], "style": StyleRef, "visible": BBool, "doc": Doc }`, drawn between `title` and the drawing surface. Normative: the header **MUST NOT** be an element: it is not selectable, draggable or deletable, takes no part in layout, and the surface's coordinate origin is below it. Because it is not an element, no refusal sentence is needed for dragging it.

**(3) Schema.** `Canvas.properties.header` → new `$defs/ChromeBand`.

**(4) Example (sparql-query).**

```json
"header": {
  "rows": [
    { "id": "form", "text": { "attribute": "headerForm" }, "style": "formLine" },
    { "id": "modifiers", "text": { "cel": "diagram.modifierRows.join('   ')" }, "style": "muted", "wrap": "word" }
  ]
}
```

**(5) 0.1 compatibility.** New optional property.

**(6) DID.** None.

### V7. Notices: a status notice with its own buttons, the truncation banner, the unavailable notice

**(1) Needed by**

- dotnet-dependency-graph: a notice bottom-left, text interpolating a count and names, with a **Show them** button; the other state reads "Every package is drawn…" with **Hide ambient packages** (`dotnet-dependency-graph.md:158`, `:219`).
- Truncation banners outside the canvas: w3c-rdf (`w3c-rdf.md:237`, today a watermark at `w3c-rdf.dis:273`), w3c-owl (`w3c-owl.md:162`, `w3c-owl.dis:538`), w3c-skos (`w3c-skos.md:208`, `w3c-skos.dis:343`), w3c-shacl (`w3c-shacl.md:264`, `w3c-shacl.dis:280`), sparql-query (`sparql-query.md:141`, `:121` refusal for dragging it, `w3c-owl.md:134` likewise).
- Unavailable view after a parse failure, all edits withheld: timeline (`timeline.md:73`), dependency-graph (`dependency-graph.md:97`), databricks-job (`databricks-job.md:100`), sparql-query (`sparql-query.md:34`). The finding belongs to gap 6 (FR-021); the notice is chrome.
- databricks-job's simulated-run banner "Simulated: job run · dismiss" (`databricks-job.md:190`) belongs to the simulated action (FR-100) but uses the same notice.

**(2) Construct.** `canvas.notices`: Notice[].

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | identifier | **required** | |
| `text` | BString | **required** | `chrome` context. |
| `severity` | `"info"`, `"warning"`, `"error"` | `"info"` | Styles the notice (tokens `color.info`, `color.warning`, `color.danger`). |
| `position` | `"top"`, `"bottom"`, `"top-left"`, `"top-right"`, `"bottom-left"`, `"bottom-right"` | `"top"` | Anchored to the surface, outside the drawing (not zoomed or panned). |
| `visible` | BBool | `true` | |
| `actions` | `{label, operation, args}`[] | `[]` | Buttons; each runs an operation (9.3). |
| `dismissible` | bool | `false` | The viewer may close it; the dismissal is viewer state. |
| `style`, `doc` | | | |

New CEL context `chrome`: `diagram`, `env`, plus `budget(id)` (S1) and `diagram.drawn`.

Normative text: a notice **MUST NOT** be an element (not selectable, not movable, not in layout or export of the model); runtimes **MUST** expose visible notices to assistive technology as a status region; notices stack in declaration order per position. Built-in notices: each truncating budget contributes `budget:<id>` (S1) and a parse-failure finding contributes `unavailable` (text: the finding's message), unless the specification declares a notice with that id, which then replaces the built-in one. The 0.1 `watermark` keeps its meaning (drawn on the canvas, under everything).

**(3) Schema.** `Canvas.properties.notices` → array of new `$defs/Notice`.

**(4) Example (dotnet-dependency-graph, with the V3 switch filter `ambient`).**

```json
"notices": [
  { "id": "ambientHidden", "position": "bottom-left",
    "visible": { "cel": "!filterValue('ambient') && diagram.nodesOfType('Package').exists(p, p.isAmbient)" },
    "text": { "cel": "cel.bind(h, diagram.nodesOfType('Package').filter(p, p.isAmbient), string(h.size()) + (h.size() == 1 ? ' package is' : ' packages are') + ' hidden as ambient — referenced by so many of this solution\\'s projects that the edge tells you nothing: ' + h.map(p, p.name).join(', ') + '.')" },
    "actions": [ { "label": "Show them", "operation": "showAmbient" } ] },
  { "id": "ambientShown", "position": "bottom-left",
    "visible": { "cel": "filterValue('ambient') && diagram.nodesOfType('Package').exists(p, p.isAmbient)" },
    "text": "Every package is drawn, including the ambient ones.",
    "actions": [ { "label": "Hide ambient packages", "operation": "hideAmbient" } ] }
]
```

with `showAmbient` = `{ "actions": [ { "view": { "filters": { "ambient": "true" } } } ] }`. CEL `filterValue(id) → dyn` (`chrome`, `element` contexts) reads the viewer's filter value.

**(5) 0.1 compatibility.** New optional property; `watermark` unchanged. The four W3C `.dis` files keep validating with their watermark and can migrate later.

**(6) DID.** None.

### V8. Compact-mode toggle

**(1) Needed by.** gartner: "A toggle, not a viewpoint picker. A 'Compact' switch below the legend. It is not remembered: every diagram opens in true-time" (`gartner-hype-cycle-graph.md:149`); what still works in compact (`:152`); the `compact` viewpoint already exists (`gartner-hype-cycle-graph.dis:948`).

**(2) Construct.** Extend 3.5 viewpoints:

| Property | Type | Default | Description |
|---|---|---|---|
| `variantOf` | viewpoint name | – | This viewpoint is an alternative presentation of that one, offered as a toggle on its views, not as a view kind of its own. |
| `toggle` | `{label, icon, position}` | `{label: this viewpoint's label}` | The switch. |

Normative text: a view whose viewpoint has variants **MUST** open in the base viewpoint; switching is viewer state (kind `viewpoint`), **MUST NOT** be persisted or enter undo; a DID view **MUST NOT** name a viewpoint that has `variantOf`; new diagrams **MUST NOT** be created in a variant. Edits made while a variant is shown are ordinary edits.

**(3) Schema.** `Viewpoint.properties` gains `variantOf` (string), `toggle` (object).

**(4) Example (gartner).** `"compact": { "label": "Compact", "variantOf": "trueTime", "toggle": { "label": "Compact", "position": "outside-top-left" }, "coordinateSystem": "hypeCycle", "layout": "rowPacked", … }` (base viewpoint named per the `.dis`).

**(5) 0.1 compatibility.** Absent `variantOf`, every viewpoint is a view kind as in 0.1.

**(6) DID.** None (DID already names viewpoints; a validator rule forbids naming a variant).

### V9. Canvas stretching to the pane

**(1) Needed by.** wardley-map: the 1000-unit square "is **stretched to the pane's aspect ratio**, so the map always fills its pane. DISL canvas bounds are fixed; it has no 'fit and stretch' mode" (`wardley-map.md:102`, `:223`); `wardley-map.dis:272` (system bounds `[0,1]`), `:525` (canvas bounds 1000 × 1000).

**(2) Construct.** `canvas.fit`: `"none"` (default) or `"stretch"`, with `canvas.margin` (Insets, default 0).

Normative text: with `fit: "stretch"`, `bounds` **MUST** be set; the runtime scales x and y independently so that `bounds` fills the pane minus `margin`, and recomputes on pane resize; node sizes, strokes, fonts and label offsets are **not** stretched (they stay in canvas units at zoom 1 and are positioned at their stretched anchor); user zoom and pan **MAY** be disabled; stored positions are in domain values and are unaffected.

**(3) Schema.** `Canvas.properties.fit` enum, `margin` → Insets.

**(4) Example (wardley-map).** `"canvas": { "bounds": { "x": 0, "y": 0, "w": 1000, "h": 1000 }, "fit": "stretch", "margin": 90, "legend": { "visible": false } }`

**(5) 0.1 compatibility.** Default `none`.

**(6) DID.** None.

### V10. Empty-canvas message

**(1) Needed by.** ansible-structure (`ansible-structure.md:183`), helm-chart (`helm-chart.md:30`: "This folder is not a Helm chart…"), dotnet-dependency-graph ("Emptiness is judged on the whole graph, not on what the ambient filter hides", `dotnet-dependency-graph.md:191`), causal-loop-diagram ("DISL has no empty-canvas message", `causal-loop-diagram.md:149`). The spec's independent test names Databricks (spec.md line 119); its notes record drops on empty canvas (`databricks-job.md:159`) but no message, so the Databricks example should come from ansible or CLD instead.

**(2) Construct.** `canvas.empty`: `{ "text": BString, "when": Expression, "style": StyleRef }`.

Normative text: the message is drawn centred on the surface, outside the drawing, when `when` holds; the default `when` is "the view includes no element after steps 1 and 2 of the drawing order" (before viewer filters and budgets, matching dotnet). The toolbox and empty-canvas gestures stay available.

**(3) Schema.** `Canvas.properties.empty` → new `$defs/EmptyMessage`.

**(4) Example (causal-loop-diagram).** `"empty": { "text": "This causal loop diagram states no variables yet." }`; helm-chart: `"empty": { "text": { "cel": "diagram.hasChartYaml ? 'This chart has nothing to draw.' : 'This folder is not a Helm chart: it has no Chart.yaml, so there is nothing to draw.'" } }`.

**(5) 0.1 compatibility.** New optional property.

**(6) DID.** None.

### V11. Initial zoom fitted to content, then frozen

**(1) Needed by.** timeline: "The client freezes a seconds-to-canvas-units scale when the first non-empty model arrives: the span of all elements plus 10 % on each side … It is frozen so an edit never rescales the drawing under the user" (`timeline.md:87`); `timeline.dis:124` keeps the empty value (20 units a day). w3c-owl records the failure mode of refitting (`w3c-owl.md:146`). The mindmap's "open centred on the central topic" is recorded as a host choice (`mindmap.md:132`) and is not needed.

**(2) Construct.** Extend 6.13 `zoom`:

| Property | Type | Default | Description |
|---|---|---|---|
| `initial` | number or `"fit"` | `default` (0.1) | Zoom a viewer starts with. |
| `fitPadding` | fraction | `0.05` | Space kept on each side, as a fraction of the content extent. |
| `fitWhen` | `"open"`, `"firstContent"` | `"firstContent"` | Fit when the view opens, or the first time it has content. |

Normative text: with `initial: "fit"`, the runtime fits zoom and pan once per viewer per view; afterwards a model change **MUST NOT** change zoom or pan. A stored `viewport` (when in `view.store` and present) takes precedence. An empty view uses `default`. The fitted value is viewer state.

For timeline, the fitted quantity is the axis scale times zoom; since DISL keeps the axis scale fixed and varies zoom, `initial: "fit"` with `fitPadding: 0.1` gives the same picture.

**(3) Schema.** `Canvas.zoom` gains `initial` (`anyOf number, const "fit"`), `fitPadding`, `fitWhen`.

**(4) Example (timeline).** `"canvas": { "minimap": false, "zoom": { "default": 1, "initial": "fit", "fitPadding": 0.1 } }`

**(5) 0.1 compatibility.** Absent `initial` means `default`, as in 0.1.

**(6) DID.** None.

---

## Gap 10: Scale (hard budgets)

### S1. Hard budgets with a truncation order, withheld edits and more than one measure

**(1) Needed by**

- w3c-rdf: 1000 drawn cards, first in document order, only edges whose ends survive (`w3c-rdf.md:123`); the gate sentence (`w3c-rdf.md:196`); banner text (`w3c-rdf.md:237`); the missing info finding (`w3c-rdf.md:282`); over-budget fixture with band order (`w3c-rdf.md:302`); DISL lack (`w3c-rdf.md:316`). Today: `limits.maxElements: 1000` (`w3c-rdf.dis:13`) plus hand-made `truncated`/`shown`/`total` diagram attributes (`w3c-rdf.dis:64-69`) used by forms and menus (`w3c-rdf.dis:287-336`).
- w3c-owl: unit-whole cut, "whole units are kept while they fit the budget of 1000; the first unit that does not fit stops the cut" (`w3c-owl.md:98`); truncation refusal and banner (`w3c-owl.md:144`); three measures (`w3c-owl.md:252`); `w3c-owl.dis:13`, `:68-73`.
- w3c-shacl: cards over 1000 in discovery order, rows travel with their card (`w3c-shacl.md:144`); **two budgets**: banner and drawn cards by SHACL card count, edits withheld by the family's RDF-node count (`w3c-shacl.md:302`, `:343`); `w3c-shacl.dis:30-39` (`truncated` and `editsWithheld` as separate attributes).
- w3c-skos: hierarchy-aware keep order (schemes by IRI, then breadth-first per scheme) (`w3c-skos.md:120`); budget split three ways (`w3c-skos.md:252`); one rule instead of one constraint per edit kind (`w3c-skos.md:286`).
- sparql-query: 500 drawn elements counting regions, nodes, edges and annotations, kept in that order, edges with a cut end dropped (`sparql-query.md:96`); hard bound versus soft warning (`sparql-query.md:211`); `sparql-query.dis:23`.
- causal-loop-diagram: "The layout runs only within the budget of 1,000 variables" (`causal-loop-diagram.md:170`); `causal-loop-diagram.dis:22`. That is a layout guard, not a drawing budget: it stays `maxElements` plus a layout option.
- Out of scope, recorded: viewport delivery (`w3c-owl.md:146`, `w3c-shacl.md:146`, `sparql-query.md:134`, `timeline.md:165`, `dotnet-dependency-graph.md:190`) is a runtime concern (spec.md line 292).

**(2) Construct.** New 3.2.1 "Budgets", under `language.limits`:

`limits.budgets`: map id → Budget.

| Property | Type | Default | Description |
|---|---|---|---|
| `measure` | `{ "count": TypeRef[] }` or `{ "cel": expr }` | **required** | What is counted. `count`: drawn candidates of these node and relation types (after steps 1 to 3 of the drawing order). `cel`: an int in the `budget` context, for a measure that is not a count of drawn elements (SHACL's RDF nodes, supplied by a declared function). |
| `max` | int | **required** | The limit. |
| `truncate` | bool | `true` for `count`, `false` for `cel` | Whether the budget cuts what is drawn. A non-truncating budget only gates edits and notices. |
| `order` | Expression | persistence order | Sort key per candidate (`budget` context: `self`, `index`), ascending; ties by persistence order. May return a list for lexicographic keys. |
| `unit` | Expression | each element its own unit | Group key: the elements of one unit are kept or cut together; units are kept in `order` of their first element while the whole unit fits; the first unit that does not fit ends the cut. |
| `notice` | bool or `{text, severity, position}` | `true` | The built-in notice `budget:<id>` while truncated. Default text "Showing {shown} of {total} — edits are withheld on this truncated view". |
| `withhold` | `{ "edits": "model"\|"all"\|"none", "reason": LocalizedText }` | `{model, built-in sentence}` | What is refused while this budget is exceeded. `model`: every change to the model (property writes, operations with model actions, gestures, paste, delete); `all`: also stored view data (positions); `none`: nothing. |
| `finding` | `{severity, message}` | – | An optional diagram-level finding while exceeded (the RDF family's R8.2). |
| `doc` | Doc | – | |

New CEL context `budget`: `self` (candidate), `index` (persistence index), `diagram`, `env`. New function (element, form, operation, chrome contexts): `budget(id) → map` with `shown` (int), `total` (int), `truncated` (bool), `withheld` (bool); `budget() → map` aggregating all (`truncated`/`withheld` true when any is). A function rather than `diagram.*` members, because four existing definitions declare diagram attributes named `truncated`, `shown` and `total` (`w3c-rdf.dis:64-69`, `w3c-owl.dis:68-73`, `w3c-shacl.dis:30-39`, `w3c-skos.dis:78`), which a new built-in member would shadow.

Normative text:

- Budgets are evaluated after viewer filters (drawing-order step 4) and deterministically: the same model, viewer filters and specification **MUST** give the same kept set.
- A truncating `count` budget **MUST** draw exactly the kept candidates; a relation **MUST** be drawn only when both its ends are kept, and a relation that is itself counted is kept only when it is within the budget and both ends are kept.
- While a budget with `withhold.edits` other than `none` is exceeded, the runtime **MUST** refuse the withheld edits with `withhold.reason`, **MUST** show that reason as the read-only reason on every property row (FR-031) and on every unavailable menu entry (FR-032), and **MUST NOT** apply the edit partly.
- A budget **MUST NOT** remove model data or stored view data of elements it leaves undrawn.
- Selection, reveal and navigation to an undrawn element (for example from a finding) **MAY** be refused; the finding still names it.
- `limits.maxElements` keeps its 0.1 meaning: a soft limit beyond which runtimes **SHOULD** warn. It is independent of budgets.

**(3) Schema.** `Language.limits` gains `budgets` → map of new `$defs/Budget` (with `$defs/BudgetWithhold`).

**(4) Example (w3c-shacl, the two budgets).**

```json
"limits": {
  "maxElements": 1000,
  "budgets": {
    "cards": {
      "measure": { "count": ["NodeShape"] },
      "max": 1000,
      "notice": { "text": "Showing {shown} of {total} shapes. Edits are withheld while the view is partial." },
      "withhold": { "edits": "none" },
      "doc": "Cards beyond 1000, in discovery order, are not drawn; rows travel with their card."
    },
    "rdfNodes": {
      "measure": { "cel": "rdfNodeCount()" },
      "max": 1000,
      "notice": false,
      "withhold": { "edits": "model", "reason": "The diagram shows only the first part of this file under the drawn-element budget, so edits through it are withheld - an edit through a partial view could touch what the view does not show. Edit the file as text instead." },
      "doc": "The RDF family's node budget, which gates edits (w3c-shacl.md, two budgets)."
    }
  }
}
```

sparql-query: `"elements": { "measure": { "count": ["Region", "Variable", "PatternEdge", "Annotation"] }, "max": 500, "order": "[typeRank(self), index]" }`. w3c-owl: `"unit": "unitOf(self)"`. w3c-skos: `"order": "[schemeIri(self), bfsDepth(self), index]"`.

Note for the spec: the SHACL and SKOS splits are recorded as discrepancies (`w3c-shacl.md:302`, `w3c-skos.md:252`), so two budgets are needed to *describe* them faithfully; the migration feature may prefer to unify them.

**(5) 0.1 compatibility.** `maxElements` unchanged; `budgets` optional. The existing hand-made attributes keep validating.

**(6) DID.** None: budgets act on the view only.

---

## Gap 11: Notation

### N1. Anchors restricted to some sides

**(1) Needed by.** mindmap: branches leave "at the middle of its left or right side only … DISL's `sides` anchor mode may also pick the top or bottom side" (`mindmap.md:149`, `:260`; `mindmap.dis:196` `anchors: {mode: "sides"}`). databricks-job: "Only the tasks' left and right side midpoints are connection anchors" (`databricks-job.md:149`). timeline: "anchors never move to the top, bottom or a corner" (`timeline.md:107`), already expressible with `fixed` points (`timeline.dis:230-235`, `ansible-structure.dis:415-416`).

**(2) Construct.** `sides`: `("top"|"right"|"bottom"|"left")[]` on AnchorSpec (6.9) and EndAnchor (6.10), default all four. With `mode: "sides"` the midpoint of the nearest *allowed* side is used; with `outline`, the intersection is clamped to the allowed sides' segments. `fixed` ignores it.

**(3) Schema.** `AnchorSpec.properties.sides`, `EndAnchor.properties.sides` (array of enum, minItems 1, uniqueItems).

**(4) Example (mindmap).** `"anchors": { "mode": "sides", "sides": ["left", "right"] }`

**(5) 0.1 compatibility.** Default all sides equals 0.1.

**(6) DID.** None.

### N2. Containment drawn as edges

**(1) Needed by.** mindmap: "DISL containment nests children visually inside their parent. The `.dis` gets the mind-map picture from a derived relation plus a container that delegates to the layout, which works but says it sideways" (`mindmap.md:258`); `mindmap.dis:105-117` (derived `Branch`), `:198-202` (container `layout:mindmap`, `clip: false`).

**(2) Construct.** Keep the 0.1 derived relation for the lines (principle V: it already works) and add `container.nesting`: `"inside"` (default, 0.1) or `"none"`. Normative text: with `nesting: "none"`, children are **not** drawn inside the parent's bounds, the parent does not grow to enclose them (`autoGrow`, `clip`, `contentArea`, `header` and `dropZones` are ignored), child positions are not relative to the parent, and moving the parent does not move its children unless the layout does. Containment still governs `parent`, `children`, deletion, clipboard and `collapsible`.

**(3) Schema.** `ContainerSpec.properties.nesting` enum.

**(4) Example (mindmap).** `"container": { "layout": "layout:mindmap", "nesting": "none", "collapsible": true, "highlightOnDrop": true }` plus the existing `Branch` edge notation.

**(5) 0.1 compatibility.** Default `inside`.

**(6) DID.** None.

### N3. A relation with no target, drawn as a stub

**(1) Needed by.** ansible-structure: "a 48 px line out of the source's right side at mid-height, in the warning colour, dashed 3 3, with `<target as written> (missing)` … above it" (`ansible-structure.md:181`); the `.dis` invents `UnresolvedTarget` nodes (`ansible-structure.md:106`, `:193`, `:252`; `ansible-structure.dis:203-221`). helm-chart: unvendored dependencies and undefined includes as a 48-unit stub (`helm-chart.md:94`), shown as badges in the `.dis`.

**(2) Construct.**

- 4.9 RelationEnd gains `optional: bool` (target end only; default `false`). A relation of such a type **MAY** have no target; CEL `self.target` is then `null`.
- 6.10 EdgeNotation gains `stub`: `{ "length": 48, "side": "right"|"left"|"top"|"bottom"|"auto", "style": StyleRef, "label": Label }`, drawn when the target is null. The stub is the relation: selecting it selects the relation.
- Normative: built-in endpoint constraints (8.7) **MUST NOT** report a null target on an `optional` end; `connect` gestures never create target-less relations; reconnecting the free end to an element is a `connect` gesture.

**(3) Schema.** RelationEnd object form gains `optional`; `EdgeNotation.properties.stub` → new `$defs/Stub`.

**(4) Example (ansible-structure).**

```json
"relations": { "UsesRole": { "source": "Play", "target": { "types": ["Role"], "optional": true } } },
"edges": { "UsesRole": { "stub": { "length": 48, "side": "right",
  "style": { "stroke": { "color": { "token": "color.warning" }, "dash": [3, 3], "dashScale": "absolute" } },
  "label": { "id": "asWritten", "text": { "cel": "self.targetAsWritten + (self.resolution == 'expression' ? ' (expression)' : ' (missing)')" }, "side": "above" } } } }
```

**(5) 0.1 compatibility.** Default `optional: false`; the `UnresolvedTarget` approach keeps validating.

**(6) DID.** **Yes**: DID section 3's relation record requires `target`; it **MUST** become optional when the specification's relation type declares `target.optional: true`, and loaders **MUST** reject a missing target otherwise. (Ansible and Helm never store relations, but DID must be able to hold every model DISL can state.)

### N4. A bezier that loops forward when the target lies behind

**(1) Needed by.** timeline (`timeline.md:107`; `timeline.dis:279-287` states it in `doc`), dependency-graph (`dependency-graph.md:154-158`, routing plugin `net.etalii.adp.generic.dependencyCurve` at `dependency-graph.dis:206`, `:385-387`), dotnet-dependency-graph (`dotnet-dependency-graph.md:130-131`), ansible-structure (`ansible-structure.md:180`), helm-chart (`helm-chart.md:95`), and the fixed 30-unit reach of azure-devops-pipeline (`azure-devops-pipeline.md:83`, where `curvature: 30` stands in) and databricks (`databricks-job.md:147`).

**(2) Construct.** LineSpec gains `bezier`: `{ "reach": number | "auto", "backward": "direct"|"loop", "maxReach": number }`.

Normative geometry: with `routing: "bezier"`, the control points lie on the start and end directions (`startDirection`, `endDirection`), `reach` canvas units from each end (`auto`: half the horizontal distance, at least 30). With `backward: "loop"`, when the end lies behind the start along `startDirection` (for `right`: `target.x < source anchor.x`), the reach becomes `max(reach, |dx| / 2 + h)` where `h` is the larger node height, so the curve leaves forward and re-enters from behind rather than doubling back; `maxReach` caps it. This replaces the dependency-graph routing plugin.

**(3) Schema.** `LineSpec.properties.bezier` → new `$defs/BezierSpec`.

**(4) Example (timeline).** `"line": { "routing": "bezier", "startDirection": "right", "endDirection": "right", "bezier": { "reach": "auto", "backward": "loop" } }`

**(5) 0.1 compatibility.** Absent `bezier`, 0.1's unspecified control points remain runtime-defined. `curvature` keeps its meaning for `arc` and `curved`.

**(6) DID.** None (per-edge `controlPoints` in EdgeView unchanged).

### N5. Superellipse

**(1) Needed by.** functional-decomposition-graph: standalone draws "a superellipse with exponent n=4, sampled at 64 points … the `.dis` draws it with four cubic curves (k=0.919), a maximum radial error of 0.46%" (`functional-decomposition-graph.md:76`, `:87`; `functional-decomposition-graph.dis:278`).

**(2) Construct.** Built-in shape `superellipse` (6.7) with parameter `exponent` (default 4, min 2): the curve `|2x/w − 1|^n + |2y/h − 1|^n = 1`. Outline and text area as for `ellipse`, the text area inset by the curve at 45°.

**(3) Schema.** No `$defs` change (shape names are strings); Appendix B.2 gains the default.

**(4) Example (FDG).** `"shape": { "type": "superellipse", "params": { "exponent": 4 } }`

**(5) 0.1 compatibility.** A 0.1 custom shape named `superellipse` in `notation.shapes` shadows the built-in (6.8 already lets custom names win); add that sentence.

**(6) DID.** None.

### N6. Diode: no change recommended

`functional-decomposition-graph.md:77` says the `.dis` uses a custom shape whose radius is a GeomExpr with `min()` (`functional-decomposition-graph.dis:315`), which is exact up to sampling. Principle V: no built-in. Record in the spec's rationale that FDG's "rounded-end built-in" request (`functional-decomposition-graph.md:87`) is met by 6.8.

### N7. Arc bow side

**(1) Needed by.** causal-loop-diagram: control point at `0.2` of the chord "**to the left of the direction of travel**, so A → B and B → A bow to opposite sides … DISL does not define which side a positive curvature bows to, nor that it is relative to the chord" (`causal-loop-diagram.md:137`); `causal-loop-diagram.dis:333-339` (`curvature: 0.2` and a flipped variant at `-0.2`).

**(2) Construct.** Normative sentences in 6.10 (no new property):

- For `arc` and for `curved` without bendpoints, a positive `curvature` bows the line to the left of the direction from source to target as drawn on screen (y down), a negative one to the right.
- `curved` without bendpoints is one quadratic Bézier whose control point lies `curvature × chord length` from the chord's midpoint, perpendicular to the chord.
- `arc` is a circular arc whose sagitta is `curvature × chord length / 2` (1 = semicircle, as 0.1 says).

With these, CLD's `routing: "curved", curvature: 0.2` is exact.

**(3) Schema.** None (description text only).

**(4) Example (CLD).** `"line": { "routing": "curved", "curvature": 0.2 }`, variant `{ "when": "self.flipped", "line": { "curvature": -0.2 } }`.

**(5) 0.1 compatibility.** 0.1 left the side undefined; defining it is a "Changes from 0.1" entry (no valid 0.1 reading is contradicted, but runtimes that bowed right must change).

**(6) DID.** None.

### N8. Mirrored icons

**(1) Needed by.** causal-loop-diagram: the loop arrow turns "clockwise for a reinforcing loop and anticlockwise otherwise … DISL icons cannot be mirrored, so the balancing variant repeats `mdi-sync` and the direction is lost" (`causal-loop-diagram.md:145`; `causal-loop-diagram.dis:304`, `:310`).

**(2) Construct.** `flip`: `"none"|"horizontal"|"vertical"|"both"` (Bindable) on NodeIcon, Badge and the Label `icon` object form; an IconRef may be `{ "icon": IconRef, "flip": … }`. Hit testing is unchanged.

**(3) Schema.** `NodeIcon.properties.flip`, `Badge.properties.flip`; `IconRef` gains an object branch.

**(4) Example (CLD).** `"icon": { "icon": "mdi-sync", "position": "top", "size": 26, "flip": { "cel": "self.kind == 'reinforcing' ? 'none' : 'horizontal'" } }`

**(5) 0.1 compatibility.** Default `none`.

**(6) DID.** None.

### N9. Badge slots that pack

**(1) Needed by.** azure-devops-pipeline: "Indicator badges run leftward from the top-right corner, 16 apart, in this fixed order, and only those that apply take a slot … DISL badges have fixed offsets, so the `.dis` gives each a fixed slot" (`azure-devops-pipeline.md:85`); `azure-devops-pipeline.dis:344-353` (offsets −12, −28, −44, −60, −76).

**(2) Construct.** NodeNotation gains `badgeLayout`: `{ "start": Position, "offset": [dx, dy], "direction": "left"|"right"|"up"|"down", "spacing": number }`; Badge gains `pack: bool` (default `false`). Packed badges whose `visible` is true take consecutive slots in declaration order; `position` and `offset` of a packed badge are ignored.

**(3) Schema.** `NodeNotation.properties.badgeLayout` → new `$defs/BadgeLayout`; `Badge.properties.pack`. Also add to NodeVariant (variants may carry any NodeNotation property).

**(4) Example (azure-devops-pipeline).**

```json
"badgeLayout": { "start": "top-right", "offset": [-12, 12], "direction": "left", "spacing": 16 },
"badges": [
  { "id": "disabled", "pack": true, "text": "⊘", "style": "indicator", "visible": { "cel": "!self.enabled" }, "tooltip": "Disabled: this will not run." },
  { "id": "manual", "pack": true, "text": "▶", "style": "indicator", "visible": { "cel": "self.manual" } }
]
```

**(5) 0.1 compatibility.** Default `pack: false`.

**(6) DID.** None.

### N10. A problem glyph on the node

**(1) Needed by.** azure-devops-pipeline: "The problem mark sits at the bottom-right: ✖ for an error, ⚠ for a warning, an error outranking a warning … DISL's `invalid`/`warning` states restyle the node but do not place a glyph" (`azure-devops-pipeline.md:97`).

**(2) Construct.** No new notation: add to 12.2 Element `findingSeverity() → string` (`"error"`, `"warning"`, `"info"` or `""`, the worst open, unsuppressed problem on the element) and `problems() → list(map)` (`{severity, message, rule}`), available in the `element` and `chrome` contexts only. A Badge then draws the glyph. Validators **MUST** reject both in `constraint`, `derived`, `migration`, `create`, `placement` and `snap` contexts (no finding may depend on findings). 6.6 gains the sentence that a runtime's default problem badge is suppressed when the notation declares a badge with id `problem`.

**(3) Schema.** None (CEL only).

**(4) Example (azure-devops-pipeline).**

```json
{ "id": "problem", "position": "bottom-right", "offset": [-10, -10],
  "text": { "cel": "self.findingSeverity() == 'error' ? '✖' : '⚠'" },
  "visible": { "cel": "self.findingSeverity() in ['error', 'warning']" },
  "style": { "font": { "color": { "cel": "self.findingSeverity() == 'error' ? token('color.danger') : token('color.warning')" } } } }
```

**(5) 0.1 compatibility.** New functions only.

**(6) DID.** None.

### N11. Named unequal bands and end labels on a linear axis

**(1) Needed by.** wardley-map: four evolution stages [0, 0.175), [0.175, 0.4), [0.4, 0.7), [0.7, 1], drawn as bands of increasing opacity separated by dashed lines, labelled at font size 20; "no way to divide a **linear** axis into named, unequal ranges" (`wardley-map.md:107-110`, `:220`); end labels "Visible"/"Invisible" (`wardley-map.md:114`, `:221`); `wardley-map.dis:247-265` (axes; stages only as an enum and a derived attribute).

**(2) Construct.** 5.3 common axis properties:

| Property | Type | Description |
|---|---|---|
| `ranges` | AxisRange[] | Named, contiguous or not, possibly unequal ranges: `{ id, label, from, to, fill: Paint, style: StyleRef, separator: Stroke, labelPosition: "start"\|"center"\|"end" }`. Drawn with the grid (6.16), under elements. Not elements. |
| `endLabels` | `{ "min": LocalizedText, "max": LocalizedText }` | Labels at the ends of the axis line or ruler, by domain end. |

CEL (all contexts): `axisRange(axisName, value) → string` (the id of the range containing `value`, `''` if none), so the wardley `stage` attribute derives from the axis instead of repeating the numbers.

**(3) Schema.** `Axis.properties.ranges` → new `$defs/AxisRange`; `Axis.properties.endLabels`.

**(4) Example (wardley-map).**

```json
"maturity": { "kind": "linear", "label": "Evolution", "min": 0, "max": 1, "precision": 2,
  "ranges": [
    { "id": "genesis",   "label": "Genesis",               "from": 0,     "to": 0.175, "fill": { "token": "wardley.band" }, "style": { "fillOpacity": 0.35 } },
    { "id": "custom",    "label": "Custom Built",          "from": 0.175, "to": 0.4,   "style": { "fillOpacity": 0.5 },  "separator": { "dash": [6, 6], "dashScale": "absolute" } },
    { "id": "product",   "label": "Product (+rental)",     "from": 0.4,   "to": 0.7,   "style": { "fillOpacity": 0.65 }, "separator": { "dash": [6, 6], "dashScale": "absolute" } },
    { "id": "commodity", "label": "Commodity (+utility)",  "from": 0.7,   "to": 1,     "style": { "fillOpacity": 0.8 },  "separator": { "dash": [6, 6], "dashScale": "absolute" } } ] },
"visibility": { "kind": "linear", "label": "Value chain", "min": 0, "max": 1, "reversed": true,
  "endLabels": { "min": "Visible", "max": "Invisible" } }
```

**(5) 0.1 compatibility.** New optional properties.

**(6) DID.** None.

### N12. Multi-level ruler and adaptive tick formats

**(1) Needed by**

- gartner: rungs month (`MMM yyyy`), quarter, year, decade, century, millennium; a rung is shown only while its labels are at least 64 px apart (`minSpacingPx`); pinned to the bottom of the screen (`gartner-hype-cycle-graph.md:137`); `gartner-hype-cycle-graph.dis:262` declares only a visible bottom ruler.
- timeline: one adaptive row "at least 80 px per label, choosing from 1 s, 15 s, 1 min, 5 min, 15 min, 1 h, 6 h, 1 day and 1 week, then calendar months, quarters and years", formats by unit, "`Mon yyyy` on the first of a month … the bare year on 1 January" (`timeline.md:92-100`); `timeline.dis:126-130`.

**(2) Construct.** Extend 5.13 Ruler (0.1 `levels` stay):

| Property | Type | Default | Description |
|---|---|---|---|
| `levels[].minSpacingPx` | number | – | Show this level only while adjacent labels are at least this far apart on screen (alternative to `minZoom`/`maxZoom`). |
| `levels[].step` | int | 1 | Multiples of `unit`. |
| `ticks` | `{ "minSpacingPx": number, "steps": [{unit, step, format}] }` | – | A single adaptive row: the finest step whose labels are at least `minSpacingPx` apart is used. Mutually exclusive with `levels`. |
| `boundaryFormats` | map unit → format | – | A tick that falls exactly on the start of a listed unit uses that unit's format; the largest such unit wins. |
| `attach` | `"view"`, `"canvas"` | `"view"` | `view`: the ruler stays at its edge of the pane whatever is scrolled (the reading 0.1 implies; stated explicitly). |

Ticks **MUST** fall on round boundaries of their unit in the axis's time zone (for `yearMonth` axes: on month indices divisible by the step's month count, counted from year 0), never on offsets from the viewport edge. Units include the T1 additions.

**(3) Schema.** Ruler `levels.items` gains `minSpacingPx`, `step`; Ruler gains `ticks` (new `$defs/RulerTicks`), `boundaryFormats`, `attach`. Unit enums reference the new `$defs/TimeUnit` (T1).

**(4) Example (timeline).**

```json
"ruler": { "visible": true, "position": "bottom", "size": 24,
  "ticks": { "minSpacingPx": 80, "steps": [
    { "unit": "second", "step": 1, "format": "HH:mm:ss" }, { "unit": "second", "step": 15, "format": "HH:mm:ss" },
    { "unit": "minute", "step": 1, "format": "HH:mm" }, { "unit": "minute", "step": 5, "format": "HH:mm" },
    { "unit": "minute", "step": 15, "format": "HH:mm" }, { "unit": "hour", "step": 1, "format": "HH:mm" },
    { "unit": "hour", "step": 6, "format": "HH:mm" }, { "unit": "day", "step": 1, "format": "MMM d" },
    { "unit": "week", "step": 1, "format": "MMM d" }, { "unit": "month", "step": 1, "format": "MMM yyyy" },
    { "unit": "quarter", "step": 1, "format": "MMM yyyy" }, { "unit": "year", "step": 1, "format": "yyyy" } ] },
  "boundaryFormats": { "month": "MMM yyyy", "year": "yyyy" } }
```

gartner: `"levels": [ { "unit": "month", "format": "MMM u", "minSpacingPx": 64 }, { "unit": "quarter", "format": "MMM u", "minSpacingPx": 64 }, { "unit": "year", "format": "u", "minSpacingPx": 64 }, { "unit": "decade", "format": "u", "minSpacingPx": 64 }, { "unit": "century", "format": "u", "minSpacingPx": 64 }, { "unit": "millennium", "format": "u", "minSpacingPx": 64 } ]` (LDML `u` is the extended, signed year: T1). "Any whole number of years" in timeline is a `year` step list the engineer writes out; no open-ended step is proposed.

**(5) 0.1 compatibility.** Additive; `attach: "view"` states what 0.1's "rulers and headers" implied, listed under Changes from 0.1 as a clarification.

**(6) DID.** None.

### N13. Per-element label offsets in the model

**(1) Needed by.** wardley-map: `label [dx, dy]` is document data, "read-only in ADP: it is shown in the property grid when present and written back unchanged … DISL's label `position` is static, so the per-element offset is carried as the `labelOffsets` view data" (`wardley-map.md:45`, `:119`, `:224`; `wardley-map.dis:805` `view.store: ["viewport", "labelOffsets"]`).

**(2) Construct.** The `offset` of an object Position (6.9) becomes Bindable: `[dx, dy]`, `{ "attribute": name }` (an attribute of a data type with `dx` and `dy`, or a `number` list of two), or `{cel}`. When bound to an attribute, a label drag (if `draggable`) writes the attribute as a model edit (undo, constraints) instead of view data; when bound to a `readOnly` attribute the label is not draggable. An absent attribute value falls back to the notation's default position.

**(3) Schema.** `Position` object branch: `offset` becomes `anyOf [array of 2 numbers, AttrBinding, CelValue]`.

**(4) Example (wardley-map).**

```json
"labels": [ { "id": "name", "text": { "attribute": "name" },
  "position": { "anchor": [1, 0.5], "offset": { "cel": "has(self.labelOffset) ? [self.labelOffset.dx, self.labelOffset.dy] : [15.0, 4.0]" } },
  "draggable": false } ]
```

**(5) 0.1 compatibility.** Array form unchanged.

**(6) DID.** None: bound values live in the model (DID section 5).

### N14. `color-mix` in paints: pin the existing CEL function

**(1) Needed by.** ansible-structure: per-play fill `color-mix(in srgb, <hue> 18%, <raised surface>)`, approximated with `fillOpacity: 0.18` (`ansible-structure.md:178`, `:257`); helm-chart: "the hue mixed 14 % into transparent" (`helm-chart.md:97`).

**(2) Construct.** No new Paint form (principle V): 12.4 already has `color(c).mix(c2, f)` and `.alpha(f)`, usable in any Paint through `{cel}` with `token()`. The gap is that their semantics are not pinned. Normative text for 12.4:

- `color(c).mix(c2, f)` returns CSS `color-mix(in srgb, c (1 − f) × 100%, c2 f × 100%)`, `f` in [0, 1], interpolated on gamma-encoded sRGB with premultiplied alpha, as CSS Color 5 defines; `color(c).alpha(f)` multiplies alpha by `f`.
- Results are serialised as `#RRGGBBAA`.
- Paint strings **MAY** also be CSS Color 5 `color-mix()` literals whose arguments are color literals (not tokens).

**(3) Schema.** None.

**(4) Example (ansible-structure).** `"fill": { "cel": "color(token('ansible.play')).mix(token('color.surface.raised'), 0.82)" }`; helm-chart: `{ "cel": "color(token('helm.chart')).alpha(0.14)" }`.

**(5) 0.1 compatibility.** Pins undefined behaviour; listed under Changes from 0.1.

**(6) DID.** None.

### N15. A fill contrast requirement

**(1) Needed by.** functional-decomposition-graph: "The fills were chosen for text contrast against `--color-text` in both themes …; DISL has no way to state a contrast requirement" (`functional-decomposition-graph.md:80`).

**(2) Construct.** `theme.contrast` (6.2): `[{ "foreground": TokenName, "background": TokenName | TokenName[], "minRatio": number, "doc": Doc }]`. Normative: a specification validator **MUST** compute the WCAG 2.x contrast ratio for every pair in every theme mode (`modes` merged over `tokens`) and **MUST** report a pair below `minRatio` as a specification warning; runtimes are unaffected. 6.15 recommends 4.5 for text.

**(3) Schema.** `Theme.properties.contrast` → array of new `$defs/ContrastRequirement`.

**(4) Example (FDG).** `"contrast": [ { "foreground": "color.text", "background": ["fdg.ui", "fdg.data", "fdg.action", "fdg.function"], "minRatio": 4.5 } ]`

**(5) 0.1 compatibility.** New optional property.

**(6) DID.** None.

### N16. A named text metric

**(1) Needed by.** mindmap: "textWidth = characters × 14 × 0.55, where a character is a UTF-16 code unit (shared `TextMetric`)" (`mindmap.md:125-126`, node size at `:124`); causal-loop-diagram: "every host must measure text the same way for layouts to agree" (`causal-loop-diagram.md:147`); w3c-owl (`w3c-owl.md:160`, `:253`: "a user ruling fixed as characters × font size × 0.55"), w3c-skos (`w3c-skos.md:203`), w3c-rdf (`w3c-rdf.md:232`).

**(2) Construct.** `notation.textMetric`: `"host"` (default: the host's font metrics, 0.1 behaviour) or `{ "kind": "average", "advance": 0.55, "count": "utf16"|"codepoint"|"grapheme", "lineHeight": 1.4 }`. Normative: when declared, runtimes and headless layout **MUST** use it for every measurement that affects geometry (`autoSize`, `maxWidth` wrapping, `overflow: ellipsis`/`shrink`, layout inputs); drawing itself still uses the real font. CEL (all contexts, deterministic): `textWidth(text, fontSize) → double`, `textHeight(lines, fontSize) → double`, using the declared metric (with `"host"`, `textWidth` is not available in deterministic contexts and validators **MUST** reject it there).

**(3) Schema.** `Notation.properties.textMetric` → new `$defs/TextMetric`.

**(4) Example (mindmap).** `"textMetric": { "kind": "average", "advance": 0.55, "count": "utf16", "lineHeight": 1.4 }`, and `"size": { "width": { "cel": "math.round(max(32.0, textWidth(self.text, 14.0) + 20.0) * 100.0) / 100.0" } }`.

**(5) 0.1 compatibility.** Default `host`.

**(6) DID.** None.

---

## Gap 12: Time and coordinates

### T1. Units coarser than a year, years before 1, month precision without days

**(1) Needed by.** gartner only: units decade and century (`gartner-hype-cycle-graph.md:66`), signed astronomical years `0000` = 1 BCE, `-3200` (`:67`), `YYYY-MM` months with index `year * 12 + month - 1` (`:68`); ruler rungs up to millennium (`:137`). The `.dis` works around all three with a linear axis of steps, a `YearMonth` string data type and conversion functions (`gartner-hype-cycle-graph.dis:144-155` `unit`, `YearMonth`; `:161-167` `TimeUnit`; `:252-261` axis; `:460-470` placement through `stepOf`/`monthOfStep`).

**(2) Construct.**

- 4.2 new primitive `yearMonth`: JSON `"±YYYY-MM"` (ISO 8601 expanded year: four to six digits, a leading `-` for years before 0000, astronomical numbering); CEL type `int`, the **month index** `year × 12 + (month − 1)` (so `0000-01` = 0, `-0001-12` = −1). Facets `min`, `max`. A `timestamp` cannot be used because CEL timestamps span 0001 to 9999.
- 5.5 time units gain `decade`, `century`, `millennium` (calendar boundaries: years divisible by 10, 100, 1000; astronomical numbering, so year 0 starts a decade). Everywhere a unit is accepted: `scale.unit`, `zoomLevels`, ruler levels and ticks, `calendar` snap rules, grid `spacing`, CEL `startOf`/`endOf`/`addUnits`.
- 5.5 `valueType` gains `"yearMonth"`: the axis domain is the month index; `timezone`, `calendar` and `collapse` do not apply; units finer than `month` are rejected; `origin`, `min`, `max` are `yearMonth` strings.
- CEL (12.4): `yearMonth(y, m) → int`, `ym.year() → int`, `ym.month() → int`, `formatYearMonth(i, pattern) → string` (LDML; `u` is the signed extended year, `y` the proleptic year without era), `parseYearMonth(s) → int`.
- Normative: formats on `yearMonth` axes **MUST** interpret LDML `u` as the astronomical year; `y` **MUST** be rejected by validators on such axes to avoid era ambiguity.

**(3) Schema.** New `$defs/TimeUnit` enum (0.1 values plus the three) referenced from Axis `scale.unit`, ZoomLevel, Ruler levels, SnapRuleObject `calendar.unit`, GridDisplay `spacing.unit`; `Axis.valueType` gains `"yearMonth"`. Primitive names are free QualifiedIds, so `yearMonth` needs only prose and the built-in type table; add it to B.7 (widget `month`).

**(4) Example (gartner).**

```json
"attributes": { "start": { "type": "yearMonth", "required": true } },
"axes": { "time": { "kind": "time", "valueType": "yearMonth", "origin": "1900-01",
  "scale": { "unit": { "attribute": "unit" }, "size": 4 },
  "ruler": { "visible": true, "position": "bottom", "levels": [ { "unit": "decade", "format": "u", "minSpacingPx": 64 } ] } } },
"placement": { "x": { "attribute": "start" }, "x2": { "attribute": "stop" } }
```

This removes `stepOf`, `monthOfStep`, `monthIndex` and `formatMonth` from the gartner `.dis` and turns its computed placements into bound ones.

**(5) 0.1 compatibility.** New names only. The `TimeUnit` refactor keeps every 0.1 value.

**(6) DID.** **Yes**: DID's value table gains `yearMonth` as `"±YYYY-MM"`; writers **MUST** write at least four year digits and a `-` for negative years.

### T2. A time scale whose unit follows a diagram attribute

**(1) Needed by.** gartner: "four canvas units per step of the unit", the unit being the diagram's `unit` attribute (`gartner-hype-cycle-graph.md:70`; `gartner-hype-cycle-graph.dis:144-148`, `:252-257`).

**(2) Construct.** `scale.unit` (5.5) and a calendar snap rule's `unit` (5.10) accept a Bindable `{ "attribute": name }` on a diagram attribute whose type is an enum with unit names as values, as `timezone` already does (5.5). Changing the attribute rescales the axis (a model edit).

**(3) Schema.** `Axis.scale.unit` and `SnapRuleObject.calendar.unit`: `anyOf [TimeUnit, AttrBinding]`.

**(4) Example.** See T1 (`"scale": { "unit": { "attribute": "unit" }, "size": 4 }`) with snapping `"x": { "calendar": { "unit": { "attribute": "unit" } } }`.

**(5) 0.1 compatibility.** Additive.

**(6) DID.** None.

### T3. Keeping a value's written precision on write-back

**(1) Needed by.** timeline: `begin`/`end` are date-only or date-time without offset; "A value the tool writes back after a drag or resize takes the precision of the value it replaces: `2026-01-05` stays `2026-01-05`"; values created by the tool are date-only (`timeline.md:66-71`); x snapping depends on the element's precision (`timeline.md:90`); today `timezone: "preserve"` (`timeline.dis:49`, `:80`, `:558`).

**(2) Construct.**

- 4.2 facet on `datetime`: `writtenPrecision`: `"preserve"` | `"date"` | `"minute"` | `"second"` | `"millisecond"` (default: none, 0.1 behaviour = RFC 3339 at the writer's precision); and `newPrecision` (same values except `preserve`, default `"second"`), the precision of values the tool creates.
- Normative: with `preserve`, the runtime **MUST** record for each stored value the precision it was read with (date-only when it has no time part; otherwise the finest non-zero written field) and **MUST** write a changed value in that precision, rounding half away from zero; a date-only value is the start of that day.
- CEL (element, snap, placementWrite contexts): `precisionOf(self, 'begin') → string` (`"date"`, `"minute"`, `"second"`, `"millisecond"`, or `""` when unset).
- The precision-dependent snapping of `timeline.md:90` is then a CEL snap rule: `{ "cel": "precisionOf(self, 'begin') == 'date' ? value.startOf('day') : value" }`, which 5.10 already allows. The rule "one element never mixes a date-only value with a date-time value" (`timeline.md:69`) is the "mixed precision" built-in rule of FR-024 (gap 6).

**(3) Schema.** `Attribute.properties` gains `writtenPrecision`, `newPrecision` (enums).

**(4) Example (timeline).** `"begin": { "type": "datetime", "required": true, "timezone": "floating", "writtenPrecision": "preserve", "newPrecision": "date" }`

**(5) 0.1 compatibility.** Absent facet keeps 0.1 behaviour.

**(6) DID.** **Yes**: DID's `datetime` representation **MUST** also accept a full-date `YYYY-MM-DD` and a local date-time without offset when the attribute declares `writtenPrecision: "preserve"` (respectively `timezone: "floating"`), and writers **MUST** keep the form read. (The timeline's own YAML file is FBL's concern; DID must still hold the same values when a timeline is stored as DID.)

### T4. Snapping per gesture

**(1) Needed by.** gartner: "A move or resize snaps to the nearest step start … A toolbox drop lands in the step that contains the drop point (floor) … A row is found from an element's top for a move and from its middle for a drop" (`gartner-hype-cycle-graph.md:72-77`). timeline: a drop lands at "the start of the day under the drop" (floor), a drag at the nearest day (`timeline.md:118`, `:90`; `timeline.dis:158-172`).

**(2) Construct.** Snapping (5.9) gains `byGesture`: map `"move"|"resize"|"drop"|"paste"|"handle"` → Snapping (partial). The gesture's entry is merged over the enclosing snapping per property and per axis, with the 5.9 rule "the most specific declaration wins" (gesture entries are more specific than their level). `drop` covers toolbox drops, create-at-pointer (`createTarget`, create-and-relate) and context-menu "add here". `reference` (anchor, center, bounds, edges) may differ per gesture.

**(3) Schema.** `Snapping.properties.byGesture` → object with those keys, each `$ref Snapping`.

**(4) Example (gartner).**

```json
"snapping": {
  "x": { "grid": { "spacing": 1 }, "ties": "away-from-zero" },
  "y": { "grid": { "spacing": 1 }, "ties": "away-from-zero" },
  "byGesture": {
    "drop": { "x": { "grid": { "spacing": 1 }, "direction": "floor" }, "reference": "center" }
  }
}
```

**(5) 0.1 compatibility.** Absent `byGesture`, one rule for all gestures as in 0.1.

**(6) DID.** None.

### T5. How halves round

**(1) Needed by.** timeline: "A vertical drag snaps to the nearest row; halves round **away from zero** … DISL's `nearest` does not say how halves round" (`timeline.md:80`; `timeline.dis:164-166` states it in `doc`); gartner: "halves rounded away from zero, on both sides of the origin" (`gartner-hype-cycle-graph.md:74`).

**(2) Construct.** SnapRule common property `ties`: `"away-from-zero"` | `"toward-zero"` | `"up"` | `"down"` | `"even"`, applying when `direction` is `nearest`; default `"away-from-zero"` (the rounding of CEL `math.round`, so declared and CEL snapping agree). Also 12.4: `snap(v, step)` rounds halves away from zero; `snap(v, step, ties)` overload.

**(3) Schema.** `SnapRuleObject.properties.ties` enum.

**(4) Example (timeline).** `"y": { "grid": { "spacing": 1 }, "direction": "nearest", "ties": "away-from-zero" }`

**(5) 0.1 compatibility.** 0.1 left ties undefined; the default is a "Changes from 0.1" entry.

**(6) DID.** None.

### T6. Anchors bound to model attributes

**(1) Needed by.** gartner: "An influence end is not an anchor point of a node: it is a phase, an edge and a fraction … at `at` from 0 to 1 along that segment's stretch of the edge … a resize or a boundary drag moves the end proportionally. DISL's anchoring offers outline, centre, fixed points, sides or ports, none of which is bound to model attributes" (`gartner-hype-cycle-graph.md:105`); ends move by dragging (`:108`), default ends (`:109`), hidden when the phase is not drawn (`:111`); the `.dis` records it as `x-ghg-attachment` (`gartner-hype-cycle-graph.dis:603-607`) over attributes `fromPhase`, `fromEdge`, `fromAt`, `toPhase`, `toEdge`, `toAt` (`:240-246`). Phase parts are named `peak` and so on (`gartner-hype-cycle-graph.dis:351`). A trigger's end chooses among n, e, s by the target's direction and stores nothing (`gartner-hype-cycle-graph.md:121`), which 0.1 `fixed` points already express.

**(2) Construct.** EndAnchor (6.10) gains mode `"part"`:

| Property | Type | Description |
|---|---|---|
| `part` | Bindable string | Id of a ShapePart of the end node's shape (6.8), for example `{ "attribute": "toPhase" }`. |
| `side` | Bindable `"top"\|"right"\|"bottom"\|"left"` | The side of that part's box. |
| `at` | Bindable fraction | Position along that side, from its start (left or top). |
| `movable` | bool | The user may drag the end along the node's parts and sides; the drop writes the bound attributes. Default `true` when all three are attribute bindings. |
| `default` | `{part, side, at}` | Values written when a connect gesture does not determine them. |

Normative text: the end point is the point at `at` along `side` of the part's current box, so resizing the node or changing its parameters moves the end proportionally; a connect gesture writes the bound attributes of both ends in the same undo step as the relation; dragging an end writes them as one model edit, subject to constraints; if the named part is not drawn (its `when` is false) the edge **MUST NOT** be drawn but stays in the model.

**(3) Schema.** `EndAnchor.properties.mode` gains `"part"`; new properties `part` (BString), `side` (`anyOf enum, AttrBinding`), `at` (BNumber), `movable`, `default`.

**(4) Example (gartner).**

```json
"anchoring": {
  "source": { "mode": "part", "part": { "attribute": "fromPhase" }, "side": { "attribute": "fromEdge" }, "at": { "attribute": "fromAt" },
              "default": { "part": { "cel": "lastVisiblePhase(source)" }, "side": "bottom", "at": 0.5 } },
  "target": { "mode": "part", "part": { "attribute": "toPhase" }, "side": { "attribute": "toEdge" }, "at": { "attribute": "toAt" },
              "default": { "part": "peak", "side": "top", "at": 0.5 } }
}
```

For an influence from a trigger, a variant (`"when": "self.source.isA('Trigger')"`) switches the source to `{ "mode": "fixed", "points": [n, e, s] }`. This also lets the gartner `.dis` drop the `hideWhenAttachmentHidden` condition (`gartner-hype-cycle-graph.dis:596-601`).

**(5) 0.1 compatibility.** New mode only.

**(6) DID.** None: bound values live in the model; EdgeView `sourceAnchor`/`targetAnchor` are not written for `part` ends.

---

## Schema `$defs` impact, consolidated

New `$defs`: `ViewKind`, `Filter`, `LegendComputed`, `ChromeBand`, `Notice`, `EmptyMessage`, `Budget`, `BudgetWithhold`, `Stub`, `BezierSpec`, `BadgeLayout`, `AxisRange`, `RulerTicks`, `ContrastRequirement`, `TextMetric`, `TimeUnit`.

Changed `$defs` (additive properties or enum values):

| `$def` | Change |
|---|---|
| `Language.limits` | `budgets` |
| `Attribute` | `transient` also `"viewer"`; `writtenPrecision`, `newPrecision` |
| `RelationEnd` (object) | `optional` |
| `Viewpoint` | `variantOf`, `toggle` |
| `Axis` | `valueType` + `"yearMonth"`; `scale.unit` Bindable and `TimeUnit`; `ranges`; `endLabels` |
| `Ruler` | `levels[].minSpacingPx`, `levels[].step`, `ticks`, `boundaryFormats`, `attach`; unit via `TimeUnit` |
| `ZoomLevel`, `GridDisplay` | unit via `TimeUnit` |
| `SnapRuleObject` | `ties`; `calendar.unit` Bindable via `TimeUnit` |
| `Snapping` | `byGesture` |
| `Theme` | `contrast` |
| `Notation` | `textMetric` |
| `Position` (object) | `offset` Bindable |
| `NodeIcon`, `Badge`, `IconRef` | `flip`; `Badge.pack` |
| `NodeNotation`, `NodeVariant` | `badgeLayout` |
| `ContainerSpec` | `nesting` |
| `AnchorSpec`, `EndAnchor` | `sides`; `EndAnchor.mode` + `"part"` with `part`, `side`, `at`, `movable`, `default` |
| `LineSpec` | `bezier` |
| `EdgeNotation`, `EdgeVariant` | `stub` |
| `States` | `filteredOut` |
| `Canvas` | `title`, `header`, `notices`, `filters`, `empty`, `fit`, `margin`; `legend.from`, `legend.computed`, `legend.title`; `zoom.initial`, `zoom.fitPadding`, `zoom.fitWhen` |
| `Persistence.view` | `viewer`, `initial`, `revealExpands`; `store` items via `ViewKind` |
| `Action` | `view` branch |

New CEL contexts (12.3): `filter`, `legend`, `chrome`, `budget`. New CEL members and functions (12.2, 12.4): `diagram.drawn`, `filterValue`, `budget`, `self.findingSeverity()`, `self.problems()`, `axisRange`, `textWidth`, `textHeight`, `yearMonth` and its methods, `formatYearMonth`, `parseYearMonth`, `precisionOf`, `snap(v, step, ties)`; pinned semantics of `color().mix()` and `.alpha()`. Every viewer- or problem-dependent member is rejected in the deterministic contexts of 12.5.

## DID impact, consolidated

FR-005 applies to three items; DID gets a new version with them:

1. **N3** relation `target` optional when the relation type's target end is `optional`.
2. **T1** value representation of `yearMonth`: `"±YYYY-MM"`, at least four year digits.
3. **T3** `datetime` values in full-date form or local date-time form when `writtenPrecision: "preserve"` or `timezone: "floating"`; writers keep the form read.

Everything else in these four gaps is viewer state, chrome or view-time computation and never reaches DID. Worth stating in DID section 5: "View-data kinds a specification lists in `view.viewer` are never written" (defensive, since a 0.1 writer would only write `store` kinds anyway).

## Changes from 0.1 (candidate list)

None of these invalidates a 0.1 document; each defines behaviour 0.1 left open:

1. N7: the side a positive `curvature` bows to, and `curved` without bendpoints as one quadratic.
2. T5: snapping ties default to away from zero; `snap()` rounds halves away from zero.
3. N14: `color().mix()` and `.alpha()` semantics.
4. N12: rulers are attached to the view (`attach: "view"` is the default).
5. The drawing order and `diagram.drawn` (gap 9 preamble): relations with an undrawn end are not drawn.

## Left to plugins

- **Compact layout and row-packed layout** (gartner), banded layouts: gap 5, a later feature.
- **Semantic rendering of the phased banner's boundary handles writing model attributes**: gap 8 (FR-042), not here.
- **Viewport delivery**: runtime concern, out of scope (spec.md line 292).
- **Simulated-run banner** (databricks): uses V7 notices, but the simulation itself is FR-100.
- **Label that edits only part of a composite text** (gartner trigger `{name} · {when}`, `gartner-hype-cycle-graph.md:118`): label `parse` (0.1) is enough.
- **Loop-sweep marker placed on a node** (CLD, `causal-loop-diagram.md:145`): N8's mirrored icon covers the need; no marker-on-node construct is proposed.
- **A continuous "any whole number of years" tick step** (timeline): written out as a finite `ticks.steps` list; no open-ended step construct.
- **Diode** (N6): 0.1 custom shape.

## Feature identifiers (B.8)

New ids for `language.requires.features`: `view.viewer`, `canvas.filters`, `canvas.notices`, `canvas.chrome` (title, header, empty, legend from drawn), `canvas.stretch`, `viewpoint.variants`, `limits.budgets`, `anchor.part`, `anchor.sides`, `edge.stub`, `edge.bezierLoop`, `node.badgeLayout`, `axis.ranges`, `axis.yearMonth`, `ruler.adaptive`, `snap.byGesture`, `text.metric`. A runtime lacking one degrades per 15.2 (for example, no `canvas.filters`: nothing is hidden; no `limits.budgets`: fall back to the soft `maxElements` warning, which for W3C files means drawing everything, so those specifications should list `limits.budgets` as required).
