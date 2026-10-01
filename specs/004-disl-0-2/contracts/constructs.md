# Construct map: DISL 0.2

**Feature**: [../disl-0-2.spec.md](../disl-0-2.spec.md) | **Plan**: [../plan.md](../plan.md) | **Research**: [../research.md](../research.md)

Every construct DISL 0.2 adds or extends, grouped by the DISL section it lands in, in section order. Section numbers are those of DISL 0.1; a new section is marked as such. Property paths are written as they will appear in a specification (`<T>` is a type name, `<id>` a key the engineer chooses).

Columns:

- **New or extended**: *New* is a property, value or shape 0.1 does not have; *Extended* widens or adds to a 0.1 construct; *Text* is normative text only, with no schema change.
- **Schema $def**: the `$defs` entry in `disl.schema.json` that carries it; a new `$def` is in bold.
- **Shown in example**: the example in `specifications/disl/` that will exercise it (R14): `mindmap.dis`, `c4-container.dis`, `rdf-graph.dis`, `gartner-hype-cycle.dis`, `functional-decomposition.dis`, `causal-loop.dis`, `databricks-job.dis`, or the DID example (a new `*.did` in `specifications/did/`). Each example is an excerpt of the definition of the same name in `definitions/diagrams/`. Where none of those seven definitions needs the construct, the table names the example that will carry it and says, in brackets, which definitions the research cites as needing it ("stand-in for").
- **Research ref**: `file#section` in `research/`, or `research.md#R<n>` for a cross-cutting decision. Where research.md and a detail file differ, research.md wins (for example `diagram.cycles`, not `elementaryCycles`; `self.findingSeverity()`; "findings", not "problems").

## 2. Foundations (2.3, 2.5, 2.9)

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| `disl: "0.2"`; schema `$id` `https://etalii.net/adp/disl/schema/0.2/disl.schema.json`; the 0.1 `$id` read against the 0.2 schema | Extended | `Specification` (root `$id`) | FR-001, FR-002 | every new example | `research.md#R2` |
| `Message`: LocalizedText or `{cel}`, accepted in every user-facing text position | New | **`Message`** | FR-030 to FR-035 | `mindmap.dis` (context tool labels) | `reasons-and-gestures.md#7.0`, `research.md#R7` |
| `Reason`: a Message, `{when, message, id?, doc?}`, or `{reason: <id>}`; used as ordered `Reason[]` lists, first applicable wins | New | **`Reason`** | FR-030, FR-031, FR-032 | `rdf-graph.dis` (`editGate`) | `reasons-and-gestures.md#7.0`, `research.md#R7` |
| LocalizedText may not use `cel` as a language tag; an object with `cel` in a Message position is CEL | Extended (narrowed) | `LocalizedText` | FR-002 | none (a restriction; listed in Changes from 0.1) | `reasons-and-gestures.md#7.0` |
| 2.5 error table row: a failing derived `from` or item gives no element and one finding; the rest draws | Text | none | FR-090 | `rdf-graph.dis` | `derived-and-small.md#B9` |
| 2.5: a missing plugin function is an evaluation error unless it has a `fallback` | Text | none | FR-091 | `rdf-graph.dis` | `derived-and-small.md#D`, `research.md#R9` |
| 2.2 reserved names gain `detail` | Extended | none | FR-024 | `rdf-graph.dis` (`std.unparseable` message) | `identity-and-findings.md#B.11` |

## 3.2 Language

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| `language.origin` (`<vendor>/<type>`), which FBL's registration names | New | `Language` | FR-100, FR-004 | `rdf-graph.dis` (`w3c/rdf`) | `research.md#R13` |
| `language.limits.budgets.<id>`: `measure` (`{count: TypeRef[]}` or `{cel}`), `max`, `truncate`, `order`, `unit`, `notice`, `withhold` (`edits`, `reason`), `finding`, `doc` (new 3.2.1 Budgets) | New | `Language`, **`Budget`**, **`BudgetWithhold`** | FR-060 | `rdf-graph.dis` (two budgets: cards by count, nodes by `{cel}`) | `view-scale-notation-time.md#S1`, `research.md#R11` |
| `language.limits.maxElements` keeps its 0.1 soft meaning, independent of budgets | Text | `Language` | FR-060 | `rdf-graph.dis` | `view-scale-notation-time.md#S1` |

## 3.4 Functions

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| `functions.<name>.recursion`: `{maxDepth, atMaxDepth}`; bounded self-recursion, indirect recursion still an error | New | `Function` | FR-091 | `rdf-graph.dis` (stand-in for w3c-owl's expression text) | `derived-and-small.md#C1`, `research.md#R9` |

## 3.5 Viewpoints

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| `viewpoints.<name>.members` (Expression, `element` context; wildcards through `matchesGlob`) | New | `Viewpoint` | FR-090 | `c4-container.dis` | `derived-and-small.md#B7` |
| `viewpoints.<name>.variantOf`, `viewpoints.<name>.toggle` (`label`, `icon`, `position`) | New | `Viewpoint` | FR-051 | `gartner-hype-cycle.dis` (compact) | `view-scale-notation-time.md#V8` |
| The drawing order (viewpoint membership, derived elements, viewer filters, budgets, `visible: false`), exposed as `diagram.drawn`; a relation is drawn only when both ends are, or as a stub | Text | none | FR-050, FR-051, FR-060 | `c4-container.dis` (legend from what is drawn) | `view-scale-notation-time.md#gap-9`, `research.md#R10` |

## 4.2 Primitive types

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| Primitive `yearMonth`: JSON `"±YYYY-MM"` (astronomical years), CEL `int` month index; facets `min`, `max` | New | none (prose and built-in type table) | FR-080 | `gartner-hype-cycle.dis`, DID example | `view-scale-notation-time.md#T1` |
| `datetime` facets `writtenPrecision` (`preserve`, `date`, `minute`, `second`, `millisecond`) and `newPrecision` | New | `Attribute` | FR-080 | `gartner-hype-cycle.dis` (stand-in for timeline), DID example | `view-scale-notation-time.md#T3` |

## 4.3 Attributes

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| `transient: "viewer"`: held per viewer, never persisted, never on undo, settable in read-only mode | Extended | `Attribute` | FR-050 | `databricks-job.dis` (the simulated run state) | `view-scale-notation-time.md#V2`, `derived-and-small.md#E1` |
| `readOnlyReasons: Reason[]`, `absentText`, `emptyText` | New | `Attribute` | FR-031 | `c4-container.dis` (Tags, Kind, Identifier rows) | `reasons-and-gestures.md#7.2` |
| `outOfRange`: `{drag: clamp or refuse, typed: refuse or clamp, message}` | New | `Attribute`, **`OutOfRange`** | FR-041 | `gartner-hype-cycle.dis` (boundaries clamp on drag) | `reasons-and-gestures.md#8.10` |
| `min`, `max` accept `{cel}` (`element` context) | Extended | `Attribute` | FR-041 | `gartner-hype-cycle.dis` (stand-in for timeline's end bounded by begin) | `reasons-and-gestures.md#8.10` |
| `fixed`: a constant, read-only, never persisted; allowed as narrowing in a subtype (4.7) | New | `Attribute` | FR-100 | `functional-decomposition.dis` (`height` 48) | `derived-and-small.md#E6` |
| `samePrecisionAs: <attribute>`, which drives `std.mixedPrecision` | New | `Attribute` | FR-024 | `gartner-hype-cycle.dis` (stand-in for timeline) | `identity-and-findings.md#B.9` |

## 4.5 Enumerations

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| `enums.<E>.values.<key>.value`: the stored form (`run-job`); CEL keeps the key | New | `EnumValue` | FR-100 | `databricks-job.dis`, DID example | `derived-and-small.md#E4`, `research.md#R13` |

## 4.6 Node types and new 4.11 Derived elements

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| `metamodel.types.<T>.derived`: `from`, `key`, `id`, `attributes`, `parent`, `slot`, `sources`, `reason`, `edits`, `doc` | New | `NodeType`, **`DerivedNode`** | FR-090 | `rdf-graph.dis` (Resource cards from triples) | `derived-and-small.md#B1`, `research.md#R8` |
| `derived.key` and the `group` variable: items with equal keys yield one element | New | `DerivedNode`, `DerivedRelation` | FR-090 | `rdf-graph.dis` (cards), `c4-container.dis` (merged lifted relationships) | `derived-and-small.md#B5` |
| `derived.parent`, `derived.slot`: computed containment | New | `DerivedNode` | FR-090 | `rdf-graph.dis` (stand-in for sparql-query's shallowest-scope placement) | `derived-and-small.md#B3` |
| `derived.sources`, `derived.reason` (a Reason), `derived.edits` (gesture to operation id) | New | `DerivedNode` | FR-090, FR-030 | `rdf-graph.dis` (`delete` to `removeResource`) | `derived-and-small.md#B6` |
| 4.11: derived elements are never instantiated, written or put on undo; declaration-order computation; a stored type may not extend a derived one; the boundary with FBL (informative) | Text | none | FR-090 | `rdf-graph.dis` | `derived-and-small.md#A`, `derived-and-small.md#B1`, `research.md#R8` |

## 4.9 Relation types

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| `metamodel.relations.<R>.derived` object form: `from`, `key`, `id`, `attributes`, `source`, `target`, `owner`, `sources`, `reason`, `edits`, `doc` | Extended | `RelationType`, **`DerivedRelation`** | FR-090 | `c4-container.dis` (relationships lifted and merged) | `derived-and-small.md#B2`, `derived-and-small.md#B8` |
| 0.1 expression form of `derived`: extra keys are attribute values; keys `id`, `sources`, `owner`; default id `<Type>:<source>-><target>` with `#2` for repeats | Extended (clarified) | `RelationType` | FR-002, FR-090 | none new (existing 0.1 definitions) | `derived-and-small.md#B2` |
| `derived.owner`: the element a derived relation belongs to | New | `DerivedRelation` | FR-090 | `c4-container.dis` (stand-in for sparql-query) | `derived-and-small.md#B4` |
| `metamodel.relations.<R>.target.optional`: a relation may have no target | New | `RelationEnd` | FR-070 | `databricks-job.dis` (stand-in for ansible-structure, helm-chart), DID example | `view-scale-notation-time.md#N3` |
| `acyclic` covers the type and all its subtypes; a subtype may not set `acyclic: false` | Text | none | FR-100 | `functional-decomposition.dis` (abstract `Owns`) | `derived-and-small.md#E5` |

## 5. Coordinates, placement and snapping (5.3, 5.5, 5.9, 5.10, 5.13)

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| 5.3 `axes.<a>.ranges[]`: `id`, `label`, `from`, `to`, `fill`, `style`, `separator`, `labelPosition` | New | `Axis`, **`AxisRange`** | FR-070 | `gartner-hype-cycle.dis` (stand-in for wardley-map) | `view-scale-notation-time.md#N11` |
| 5.3 `axes.<a>.endLabels`: `{min, max}` | New | `Axis` | FR-070 | `gartner-hype-cycle.dis` (stand-in for wardley-map) | `view-scale-notation-time.md#N11` |
| 5.3 `axes.<a>.outOfRange` | New | `Axis`, `OutOfRange` | FR-041 | `gartner-hype-cycle.dis` | `reasons-and-gestures.md#8.10` |
| 5.5 `valueType: "yearMonth"` (month-index domain; no timezone, calendar or collapse) | Extended | `Axis` | FR-080 | `gartner-hype-cycle.dis` | `view-scale-notation-time.md#T1` |
| 5.5 time units `decade`, `century`, `millennium`, wherever a unit is accepted | Extended | **`TimeUnit`** (refactored from the 0.1 enums) | FR-080 | `gartner-hype-cycle.dis` | `view-scale-notation-time.md#T1` |
| 5.5 `scale.unit` bound to a diagram attribute (`{attribute}`) | Extended | `Axis` | FR-080 | `gartner-hype-cycle.dis` | `view-scale-notation-time.md#T2` |
| 5.9 `snapping.byGesture`: `move`, `resize`, `drop`, `paste`, `handle` | New | `Snapping` | FR-080 | `gartner-hype-cycle.dis` (drop floors, move rounds) | `view-scale-notation-time.md#T4` |
| 5.10 snap rule `ties`: `away-from-zero` (default), `toward-zero`, `up`, `down`, `even` | New | `SnapRuleObject` | FR-080 | `gartner-hype-cycle.dis` | `view-scale-notation-time.md#T5` |
| 5.10 calendar snap `unit` bound to an attribute | Extended | `SnapRuleObject` | FR-080 | `gartner-hype-cycle.dis` | `view-scale-notation-time.md#T2` |
| 5.13 `ruler.levels[].minSpacingPx`, `ruler.levels[].step` | Extended | `Ruler` | FR-070 | `gartner-hype-cycle.dis` | `view-scale-notation-time.md#N12` |
| 5.13 `ruler.ticks` (`minSpacingPx`, `steps[]`), `ruler.boundaryFormats`, `ruler.attach` | New | `Ruler`, **`RulerTicks`** | FR-070 | `gartner-hype-cycle.dis` (stand-in for timeline; see note 2) | `view-scale-notation-time.md#N12` |

## 6. Notation (6.2 to 6.14)

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| 6.2 `notation.theme.contrast[]`: `foreground`, `background`, `minRatio`, `doc` | New | `Theme`, **`ContrastRequirement`** | FR-070 | `functional-decomposition.dis` | `view-scale-notation-time.md#N15` |
| 6.5 `notation.textMetric`: `"host"` or `{kind: "average", advance, count, lineHeight}` | New | `Notation`, **`TextMetric`** | FR-070 | `mindmap.dis` | `view-scale-notation-time.md#N16` |
| 6.6 interaction state `filteredOut` | New | `States` | FR-050 | `gartner-hype-cycle.dis` | `view-scale-notation-time.md#V3` |
| 6.6 a declared badge with id `finding` replaces the runtime's default finding mark | Text | none | FR-070 | `databricks-job.dis` (stand-in for azure-devops-pipeline) | `view-scale-notation-time.md#N10`, `research.md#R12` |
| 6.7 built-in shape `superellipse` with parameter `exponent` | New | none (shape names are strings; Appendix B.2) | FR-070 | `functional-decomposition.dis` | `view-scale-notation-time.md#N5` |
| 6.8 a custom shape named like a built-in shadows it; the diode is a custom shape | Text | none | FR-070 | `functional-decomposition.dis` | `view-scale-notation-time.md#N5`, `view-scale-notation-time.md#N6` |
| 6.8 `handles[].write` (Action[]), `handles[].visible`, `handles[].refusals.move`, `handles[].label` as a Message; a handle on an `{attribute}`-bound parameter writes the attribute | Extended | `Handle` | FR-042 | `gartner-hype-cycle.dis` (phase boundaries) | `reasons-and-gestures.md#8.11` |
| 6.9 `nodes.<T>.anchors.sides` | New | `AnchorSpec` | FR-070 | `mindmap.dis` | `view-scale-notation-time.md#N1` |
| 6.9 `nodes.<T>.container.nesting`: `inside` or `none` | New | `ContainerSpec` | FR-070 | `mindmap.dis` | `view-scale-notation-time.md#N2` |
| 6.9 `nodes.<T>.badgeLayout` (`start`, `offset`, `direction`, `spacing`) and `badges[].pack` | New | `NodeNotation`, `NodeVariant`, **`BadgeLayout`**, `Badge` | FR-070 | `databricks-job.dis` (stand-in for azure-devops-pipeline) | `view-scale-notation-time.md#N9` |
| 6.9 and 6.14 `flip` on `icon`, `badges[]` and the IconRef object form | New | `NodeIcon`, `Badge`, `IconRef` | FR-070 | `causal-loop.dis` (loop arrow) | `view-scale-notation-time.md#N8` |
| 6.9 and 6.12 `position.offset` bindable (`[dx, dy]`, `{attribute}`, `{cel}`) | Extended | `Position` | FR-070 | `mindmap.dis` (stand-in for wardley-map) | `view-scale-notation-time.md#N13` |
| 6.9 and 6.10 `nodes.<T>.refusals` and `edges.<R>.refusals`: `move`, `resize`, `reparent`, `delete`, `connect`, `reconnect`, `copy`, `editLabel` | New | `NodeNotation`, `EdgeNotation`, **`GestureRefusals`** | FR-030 | `rdf-graph.dis` (an edge cannot be moved) | `reasons-and-gestures.md#7.1` |
| 6.10 `edges.<R>.connect`: `from` (anchor id to `source` or `target`), `tool` | New | `EdgeNotation`, **`ConnectGesture`** | FR-040 | `rdf-graph.dis` (relations start at a card's side anchors) | `reasons-and-gestures.md#8.4` |
| 6.10 `edges.<R>.anchoring.source.sides`, `.target.sides` | New | `EndAnchor` | FR-070 | `mindmap.dis` | `view-scale-notation-time.md#N1` |
| 6.10 end anchor `mode: "part"` with `part`, `side`, `at`, `movable`, `default` | Extended | `EndAnchor` | FR-080 | `gartner-hype-cycle.dis` (influence ends) | `view-scale-notation-time.md#T6` |
| 6.10 `edges.<R>.stub`: `length`, `side`, `style`, `label` | New | `EdgeNotation`, `EdgeVariant`, **`Stub`** | FR-070 | `databricks-job.dis` (stand-in for ansible-structure, helm-chart) | `view-scale-notation-time.md#N3` |
| 6.10 `line.bezier`: `reach`, `backward` (`direct` or `loop`), `maxReach` | New | `LineSpec`, **`BezierSpec`** | FR-070 | `databricks-job.dis` | `view-scale-notation-time.md#N4` |
| 6.10 positive `curvature` bows left of the direction of travel; `curved` is one quadratic; `arc` sagitta | Text | none | FR-070 | `causal-loop.dis` | `view-scale-notation-time.md#N7`, `research.md#R12` |
| 6.13 `canvas.title` (a Label with `self` bound to the diagram) | New | `Canvas` (`Label`) | FR-051 | `c4-container.dis` | `view-scale-notation-time.md#V5` |
| 6.13 `canvas.header`: `rows`, `style`, `visible`, `doc` | New | `Canvas`, **`ChromeBand`** | FR-051 | `c4-container.dis` (stand-in for sparql-query) | `view-scale-notation-time.md#V6` |
| 6.13 `canvas.notices[]`: `id`, `text`, `severity`, `position`, `visible`, `actions`, `dismissible`, `style`, `doc`; built-in `budget:<id>` and `unavailable` notices, replaced by a declared notice with that id | New | `Canvas`, **`Notice`** | FR-051, FR-060 | `rdf-graph.dis` (truncation banner) | `view-scale-notation-time.md#V7` |
| 6.13 (new 6.13.1) `canvas.filters.<id>`: `label`, `control`, `appliesTo`, `options`, `default`, `match`, `keep`, `effect`, `position`, `doc` | New | `Canvas`, **`Filter`** | FR-050 | `gartner-hype-cycle.dis` (tag chips) | `view-scale-notation-time.md#V3` |
| 6.13 `canvas.legend.from` (`declared` or `drawn`), `canvas.legend.computed` (`key`, `label`, `swatch`, `order`), `canvas.legend.title` | Extended | `Canvas`, **`LegendComputed`** | FR-051 | `c4-container.dis` | `view-scale-notation-time.md#V4` |
| 6.13 `canvas.empty`: `text`, `when`, `style` | New | `Canvas`, **`EmptyMessage`** | FR-051 | `causal-loop.dis` | `view-scale-notation-time.md#V10` |
| 6.13 `canvas.fit` (`none` or `stretch`), `canvas.margin` | New | `Canvas` | FR-051 | `gartner-hype-cycle.dis` (stand-in for wardley-map) | `view-scale-notation-time.md#V9` |
| 6.13 `canvas.zoom.initial` (number or `"fit"`), `zoom.fitPadding`, `zoom.fitWhen` | Extended | `Canvas` | FR-051 | `gartner-hype-cycle.dis` (stand-in for timeline) | `view-scale-notation-time.md#V11` |

## 7. Toolbox, context tools and forms (7.2, 7.3, 7.5)

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| `label` as a Message on tools, context tools, operations, forms, form items and sections, evaluated per target | Extended | `Tool`, `ContextTool`, `Operation`, `Form`, `FormItem` | FR-034 | `mindmap.dis` (Collapse or Expand), `rdf-graph.dis` (Remove (with n statements)) | `reasons-and-gestures.md#7.5` |
| 7.2 tool `mode: "drop"` and `drop`: `targets[]` (a context tool plus `on`: TypeRef[] or `"canvas"`), `elsewhere` (`create`, `ignore`, `refuse`, `menu`), `refusal` | Extended | `Tool`, **`DropSpec`**, **`DropTarget`** | FR-040 | `causal-loop.dis` (drop onto a variable, refuse elsewhere), `c4-container.dis` (drop onto the parent kind) | `reasons-and-gestures.md#8.3` |
| 7.2 `createSource`, `createTarget` as `{type, initial, size}` | Extended | `Tool`, **`CreateEnd`** | FR-040 | `databricks-job.dis` (stand-in for dependency-graph, timeline) | `reasons-and-gestures.md#8.5` |
| `unavailable: Reason[]` on tools, context tools, operations and form buttons | New | `Tool`, `ContextTool`, `Operation`, `FormItem` | FR-032 | `causal-loop.dis` (Arrange diagram) | `reasons-and-gestures.md#7.3` |
| 7.3 context tool `visible` | New | `ContextTool` | FR-032 | `mindmap.dis` (not offered rather than disabled) | `reasons-and-gestures.md#7.3` |
| 7.3 context tool kinds `moveUp`, `moveDown` | Extended | `ContextTool` | FR-040 | `mindmap.dis` | `reasons-and-gestures.md#8.2` |
| 7.3 context tool `target` (`drag`, `pick`, `either`), `candidates`, `candidateLabel`, `pickerTitle`, `emptyText` | New | `ContextTool` | FR-040 | `databricks-job.dis` | `reasons-and-gestures.md#8.6` |
| 7.3 context tool `forEach`, `as`, `args`, `submenu` | New | `ContextTool` | FR-040 | `databricks-job.dis` (Disconnect from 'X') | `reasons-and-gestures.md#8.7` |
| 7.3 `toolbox.contextMenus[].for: "diagram"` (empty canvas, gated by `when`; entries see `position`) | Extended | `ContextToolSet` | FR-040 | `rdf-graph.dis` | `reasons-and-gestures.md#8.8` |
| 7.3 `toolbox.contextMenus[].for: "connection"` (pending connection) and `runSingle` | Extended | `ContextToolSet` | FR-040 | `rdf-graph.dis` (Relate...) | `reasons-and-gestures.md#8.9` |
| 7.5 `forms.<id>.submitLabel`, `cancelLabel`, `danger` | New | `Form` | FR-035 | `rdf-graph.dis` (Rename dialog) | `reasons-and-gestures.md#7.6` |
| 7.5 form item `initial` (pre-filled value) | New | `FormItem` | FR-035 | `rdf-graph.dis` | `reasons-and-gestures.md#7.6` |
| 7.5 field validation `timing` (`input` or `commit`); `message` as a Message | Extended | `FieldValidation` | FR-035 | `gartner-hype-cycle.dis` (a month that does not parse) | `reasons-and-gestures.md#7.6` |
| 7.5 form item `readOnlyReasons`, `absentText`, `emptyText`, `showAbsent` | New | `FormItem` | FR-031 | `c4-container.dis` | `reasons-and-gestures.md#7.2` |
| 7.5 form item kind `findings` (`problems` becomes a deprecated alias, section 18) | Extended | `FormItem` | FR-020 | `functional-decomposition.dis` | `identity-and-findings.md#B.0`, `research.md#R3` |

## 8. Constraints (8.1 to 8.7)

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| 8.1 `constraints.builtIn.<id>.code`, `.message` (with `detail`, for findings) and `.refusal` (with `violation`, for gesture refusals) | Extended | **`BuiltInSetting`** | FR-024, FR-030 | `functional-decomposition.dis` (`std.multiplicity`, `std.acyclic` refusals) | `identity-and-findings.md#B.11`, `reasons-and-gestures.md#7.1` |
| 8.2 `constraints.rules[].code` (replaces `x-adp-ruleId` and rule ids in `label` or `tags`) | New | `Constraint` | FR-004, FR-020 | `databricks-job.dis` | `identity-and-findings.md#B.1`, `identity-and-findings.md#B.11` |
| 8.2 `constraints.rules[].forEach` (`item`, `index` bound; `rule` optional; `enforcement: report` only) | New | `Constraint` | FR-022 | `causal-loop.dis` (one finding per unclaimed cycle) | `identity-and-findings.md#B.3`, `identity-and-findings.md#B.4` |
| 8.2 `constraints.rules[].location` (Expression to a SourceLocation) and `.subject` | New | `Constraint` | FR-020 | `rdf-graph.dis` (prefix re-declarations) | `identity-and-findings.md#B.1` |
| 8.2 `constraints.rules[].over`: `model` (default) or `view` | New | `Constraint` | FR-023 | `c4-container.dis` (element not on any view) | `identity-and-findings.md#B.7` |
| 8.2 `constraints.rules[].message` typed as a Message | Extended | `Constraint` | FR-030 | `databricks-job.dis` | `reasons-and-gestures.md#7.1` |
| 8.4 gesture constraint kind `reorder` (`self`, `parent`, `oldIndex`, `newIndex`, `siblings`) | New | `Constraint` | FR-040 | `mindmap.dis` | `reasons-and-gestures.md#8.2` |
| 8.4 `create` context gains `dropTarget` and `tool`; `placement` context gains `gesture` | Extended | none (CEL) | FR-030 | `c4-container.dis` (refusal naming the kind under the drop) | `reasons-and-gestures.md#7.1` |
| 8.4 order of gesture checks (switched-off gesture, edit gate, built-ins in a fixed order, declared constraints); a refusal about a selection binds `selection` | Text | none | FR-030 | `functional-decomposition.dis` (type, cardinality, cycle) | `reasons-and-gestures.md#7.1` |
| 8.6 renamed "Findings"; a finding carries a rule, severity, message and any of elements, attribute, location, subject, view | Extended | **`Finding`** | FR-020 | `databricks-job.dis`; the 8.6 validator-output excerpt (see note 1) | `identity-and-findings.md#B.1`, `research.md#R3`, `research.md#R5` |
| 8.6 `SourceLocation`: `file` (subject-relative), `line`, `column` (1-based), `length` (code points) | New | **`SourceLocation`** | FR-020 | `databricks-job.dis` (via `self.location()`); 8.6 excerpt | `identity-and-findings.md#B.1`, `research.md#R4` |
| 8.6 `std.unparseable` replaces every other finding located in its file; no constraint runs when that file is the primary file | Text | none | FR-021 | `rdf-graph.dis` | `identity-and-findings.md#B.2`, `research.md#R5` |
| 8.6 normative order of findings (reader, built-ins, declared rules in array order, model order, `forEach` order) | Text | none | FR-023 | `causal-loop.dis` (bound reached before unlabelled loop) | `identity-and-findings.md#B.6` |
| 8.6 headless validator output: the 0.1 keys plus `code`, `elementIds`, `location`, `subject`, `view` | Extended | **`ValidatorOutput`** | FR-026 | 8.6 validator-output excerpt (see note 1) | `identity-and-findings.md#B.10` |
| 8.7 new built-ins (see the built-in table below) | New | `BuiltInSetting` keys | FR-012, FR-021, FR-024, FR-090, FR-091 | see the built-in table | `identity-and-findings.md#B.9`, `derived-and-small.md#B9` |
| 8.7 `std.acyclic` over the type and its subtypes; `std.endpoints` silent on an `optional` target | Extended (clarified) | none | FR-100, FR-070 | `functional-decomposition.dis`, `databricks-job.dis` | `derived-and-small.md#E5`, `view-scale-notation-time.md#N3` |
| 8: findings on derived elements borrow the first source's location; no suppression of a derived element with an unstable id | Text | none | FR-090 | `rdf-graph.dis` | `derived-and-small.md#B6` |

## 9. Behavior (9.1 to 9.5, new 9.6)

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| `behavior.reasons.<id>` (`when`, `message`, `doc`) and `behavior.editGate: Reason[]` | New | `Behavior`, **`NamedReason`** | FR-030, FR-031, FR-032, FR-060 | `rdf-graph.dis` (truncation gate) | `reasons-and-gestures.md#7.0` |
| `behavior.messages`: `std.notApplicable`, `std.readOnly`, `std.atStart`, `std.atEnd` | New | `Behavior` | FR-030 | `rdf-graph.dis` (does not apply to this selection) | `reasons-and-gestures.md#7.1`, `reasons-and-gestures.md#8.2` |
| 9.2 hooks never fire for derived elements appearing, changing or disappearing | Text | none | FR-090 | `rdf-graph.dis` | `derived-and-small.md#B6` |
| 9.3 `operations.<id>.simulate` (new 9.6 Simulations): `for`, `state`, `initial`, `next`, `until`, `stepMs`, `maxSteps`, `notice` | New | `Operation`, **`Simulation`** | FR-100 | `databricks-job.dis` (Run job, simulated) | `derived-and-small.md#E1`, `research.md#R13` |
| 9.4 `create` and `reparent` actions gain `after`, `before` | Extended | `Action` | FR-040 | `mindmap.dis` (Add sibling) | `reasons-and-gestures.md#8.1` |
| 9.4 action `reorder` (`target` with `by`, `after` or `before`) | New | `Action` | FR-040 | `mindmap.dis` | `reasons-and-gestures.md#8.2` |
| 9.4 action `view` (`collapsed`, `filters`, `viewpoint`; `target`) | New | `Action` | FR-050 | `mindmap.dis` (toggle fold) | `view-scale-notation-time.md#V1` |
| 9.4 actions see earlier actions and earlier `forEach` iterations; a `forEach` list is evaluated once | Text | none | FR-100 | `causal-loop.dis` (`claimClosedLoops` hook) | `derived-and-small.md#E2`, `research.md#R13` |
| 9.4 an `abort` message is shown as the refusal, in the words given | Text | none | FR-030 | none (sentence) | `reasons-and-gestures.md#7.1` |
| 9.5 and 9.3 and 7.5 `confirm` as a Message or a Confirmation: `message`, `title`, `confirmLabel`, `cancelLabel`, `danger`, `count`, `threshold`, `when`, `doc` | Extended | **`Confirmation`**, `DeletionPolicy`, `Operation`, `FormItem` | FR-033 | `mindmap.dis` (branch or leaf), `functional-decomposition.dis` (connection count) | `reasons-and-gestures.md#7.4`, `research.md#R7` |

## 11.5 Identifiers

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| `persistence.ids` as an IdStrategy with `types.<T>` rules (nearest in the linearisation wins) | Extended | **`IdStrategy`**, **`IdRule`**, `Persistence` | FR-010 | `rdf-graph.dis` | `identity-and-findings.md#A.0`, `research.md#R6` |
| `strategy: "derived"` with `expression` in the `identity` context (paths, IRIs, triples with a repeat counter, term forms, scope paths, relation formula ids, singletons) | Extended | `IdRule` | FR-010 | `rdf-graph.dis` (IRIs, triple counter, `truncation` singleton), `databricks-job.dis` (`edge:<from>-><to>`) | `identity-and-findings.md#A.2` to `#A.8` |
| `encoding`: `hex`, `base64url`, `base36` (ShortGuid) | New | `IdRule` | FR-010 | `gartner-hype-cycle.dis` (`base64url`), `functional-decomposition.dis` (`base36`) | `identity-and-findings.md#A.1` |
| `natural` ids composed as prefix plus keys joined by `|`; `suffix` with `{n}` | Extended | `IdRule` | FR-010 | `causal-loop.dis` (natural), `c4-container.dis` (`suffix: "{n}"`) | `identity-and-findings.md#A.3` |
| `ephemeral` (bool or `{cel}`) and `reason` (a Reason) | New | `IdRule` | FR-011 | `rdf-graph.dis` (BlankNode), `c4-container.dis` (unnamed elements, `{cel}`) | `identity-and-findings.md#A.9`, `research.md#R6`, `research.md#R7` |
| `missing`: `assign` or `ephemeral` | New | `IdStrategy` | FR-012 | `mindmap.dis` (`assign`) | `identity-and-findings.md#A.10` |
| `compare`: `exact` or `ignore-case` | New | `IdStrategy` | FR-012 | `c4-container.dis` | `identity-and-findings.md#A.13` |
| One id space; the first element in reading order keeps a duplicated id; later ones are ephemeral | Text | none | FR-012 | `mindmap.dis` | `identity-and-findings.md#A.10` |
| Ids generated once per gesture; redo reuses them and refuses a duplicate | Text | none | FR-010 | none (sentence) | `identity-and-findings.md#A.12` |
| `prefix` does not apply to `cel` or `derived` results; `stable` keeps its 0.1 meaning | Text | none | FR-002 | none (sentence) | `identity-and-findings.md#A.0` |

## 11.6 View data and style overrides

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| `persistence.view.viewer` (ViewKind[]), `persistence.view.initial`, `persistence.view.revealExpands`; `store` items via ViewKind | Extended | `Persistence`, **`ViewKind`** | FR-050 | `mindmap.dis` (fold per viewer, seeded from `folded`) | `view-scale-notation-time.md#V1`, `research.md#R10` |
| No view data, style override, suppression or reference is stored for an ephemeral id; a stored one is ignored and reported | Text | none | FR-011 | `rdf-graph.dis` | `identity-and-findings.md#A.9` |

## 12. The CEL environment (12.1 to 12.5)

The new contexts and functions are in the CEL table below. This table lists what 12 gains as text.

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| 12.1 and 12.5: strings order by Unicode code point; `sort()` and `sortBy()` are stable | Text | none | FR-100 | `causal-loop.dis` (loop signature) | `derived-and-small.md#E3`, `research.md#R13` |
| 12.2: a type name in `nodesOfType`, `relationsOfType`, `reachable`, `inCycle`, `hasCycle`, `cycles` and the rest includes its subtypes | Text | none | FR-100 | `functional-decomposition.dis` | `derived-and-small.md#E5` |
| 12.2: `ancestors()` lists the parent first | Text | none | FR-090 | `c4-container.dis` (`liftTo`) | `derived-and-small.md#B3` |
| 12.2: `owner` is a member of every relation | Extended | none | FR-090 | `c4-container.dis` | `derived-and-small.md#B4` |
| 12.4: `color(c).mix(c2, f)` and `.alpha(f)` follow CSS Color 5 `color-mix(in srgb, ...)`; results serialise as `#RRGGBBAA` | Text | none | FR-070 | `c4-container.dis` (stand-in for ansible-structure, helm-chart) | `view-scale-notation-time.md#N14`, `research.md#R12` |
| 12.5: viewer-, finding- and budget-dependent members are rejected in the deterministic contexts; `fs.*` taken once per run, like `env.now` | Text | none | FR-025, FR-050 | none (validator rule) | `view-scale-notation-time.md#gap-9`, `identity-and-findings.md#B.8` |

## 13.1 Plugin declarations

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| `plugins.<id>.celFunctions[]`: called by bare name (a clash is a specification error); `params` as `{name, type, doc}`; `uses`; `deterministic`; `fallback` | Extended | `Plugin` | FR-091 | `rdf-graph.dis` (`rdfDisplayName`) | `derived-and-small.md#D`, `research.md#R9` |

## 14. Processing model (14.2, 14.4)

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| 14.2: compute derived elements after validation and migrations, before resolving view data; recompute derived ids on load | Text | none | FR-090, FR-010 | `rdf-graph.dis` | `derived-and-small.md#B9`, `identity-and-findings.md#A.0` |
| 14.4: the "recompute derived" step covers derived elements and derived ids, before invariants; incremental recomputation must equal a full one | Text | none | FR-090, FR-010 | `rdf-graph.dis` | `derived-and-small.md#B9`, `identity-and-findings.md#A.0` |

## 15.2 Graceful degradation, 16 Security and 18 Deprecated aliases

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| 15.2: a missing plugin function degrades through its `fallback`, else semantic uses report findings and visual uses fall back to defaults; one `std.pluginMissing` per plugin | Text | none | FR-091 | `rdf-graph.dis` | `derived-and-small.md#D` |
| 15.2: a runtime lacking a 0.2 feature id degrades (for example `limits.budgets` falls back to `maxElements`) | Text | none | FR-001 | none (sentence) | `view-scale-notation-time.md#feature-identifiers-b8` |
| 16: file-system facts are confined to the subject's root and reveal only existence and folderness | Text | none | FR-025 | `mindmap.dis` (stand-in for wardley-map) | `identity-and-findings.md#B.8` |
| 18: form item kind `problems` is a deprecated alias of `findings` | Extended | `FormItem` | FR-002 | none (alias) | `identity-and-findings.md#B.0` |

## Appendix B. Built-in catalogues

| Construct | New or extended | Schema $def | FR | Shown in example | Research ref |
|---|---|---|---|---|---|
| B.2 default `exponent` 4 for `superellipse` | Extended | none | FR-070 | `functional-decomposition.dis` | `view-scale-notation-time.md#N5` |
| B.5 units `decade`, `century`, `millennium`; LDML `u` is the signed astronomical year on `yearMonth` axes | Extended | none | FR-080 | `gartner-hype-cycle.dis` | `view-scale-notation-time.md#T1` |
| B.7 default widget `month` for `yearMonth` | Extended | none | FR-080 | `gartner-hype-cycle.dis` | `view-scale-notation-time.md#T1` |
| B.8 feature ids: `view.viewer`, `canvas.filters`, `canvas.notices`, `canvas.chrome`, `canvas.stretch`, `viewpoint.variants`, `limits.budgets`, `anchor.part`, `anchor.sides`, `edge.stub`, `edge.bezierLoop`, `node.badgeLayout`, `axis.ranges`, `axis.yearMonth`, `ruler.adaptive`, `snap.byGesture`, `text.metric` | Extended | none | FR-001 | `rdf-graph.dis` (`requires.features: ["limits.budgets"]`) | `view-scale-notation-time.md#feature-identifiers-b8` |

## New CEL contexts and functions

| Name | Kind | Section | Variables or signature | FR | Shown in example | Research ref |
|---|---|---|---|---|---|---|
| `identity` | Context | 12.3, 11.5 | `self`, `diagram`; no `env`; only ancestors' and ends' ids readable | FR-010 | `rdf-graph.dis` | `identity-and-findings.md#A.0` |
| `derive` | Context | 12.3, 4.11 | `diagram`, `env` | FR-090 | `rdf-graph.dis` | `derived-and-small.md#B1` |
| `deriveItem` | Context | 12.3, 4.11 | `item`, `group`, `index`, `diagram`, `env` | FR-090 | `rdf-graph.dis` | `derived-and-small.md#B1` |
| `filter` | Context | 12.3, 6.13.1 | `self`, `value`, `match`, `diagram`, `env` | FR-050 | `gartner-hype-cycle.dis` | `view-scale-notation-time.md#V3` |
| `legend` | Context | 12.3, 6.13 | `self`, `diagram`, `env` | FR-051 | `c4-container.dis` | `view-scale-notation-time.md#V4` |
| `chrome` | Context | 12.3, 6.13 | `diagram`, `env`, `budget(id)`, `diagram.drawn` | FR-051 | `rdf-graph.dis` | `view-scale-notation-time.md#V7` |
| `budget` | Context | 12.3, 3.2.1 | `self` (candidate), `index`, `diagram`, `env` | FR-060 | `rdf-graph.dis` | `view-scale-notation-time.md#S1` |
| `connection` | Context | 12.3, 7.3 | `source`, `target`, `sourceAnchor`, `position`, `diagram`, `env` | FR-040 | `rdf-graph.dis` | `reasons-and-gestures.md#8.9` |
| `handleWrite` | Context | 12.3, 6.8 | `self`, `diagram`, `env`, `p`, `w`, `h`, `value`, `yValue` | FR-042 | `gartner-hype-cycle.dis` | `reasons-and-gestures.md#8.11` |
| `simulation` | Context | 12.3, 9.6 | `self`, `state`, `step`, `p`, `diagram`, `env` | FR-100 | `databricks-job.dis` | `derived-and-small.md#E1` |
| `gesture:reorder` | Context | 12.3, 8.4 | `self`, `parent`, `oldIndex`, `newIndex`, `siblings`, `diagram`, `env` | FR-040 | `mindmap.dis` | `reasons-and-gestures.md#8.2` |
| `constraint` gains `item`, `index` (with `forEach`), `view` (with `over: "view"`), `detail` (built-in messages) | Context, extended | 12.3, 8.2 | as named | FR-022, FR-023, FR-024 | `causal-loop.dis`, `c4-container.dis` | `identity-and-findings.md#B.3`, `#B.7`, `#B.11` |
| `gesture:create` gains `dropTarget`, `tool`; `gesture:placement` gains `gesture`; `operation` gains `position`; built-in refusal messages gain `violation`; confirmations gain `count`; generated menu entries gain `item`, `index` or the `as` name | Contexts, extended | 12.3 | as named | FR-030, FR-033, FR-040 | `c4-container.dis`, `mindmap.dis`, `databricks-job.dis` | `reasons-and-gestures.md#9` |
| `e.positionIn(list) → int` | Function | 12.4 | position in reading order, compared by identity, or −1 | FR-010, FR-022 | `databricks-job.dis`, `rdf-graph.dis` | `identity-and-findings.md#A.0`, `#B.5` |
| `e.location() → optional(map)`, `e.location(attr)` | Member | 12.2 | the reader's SourceLocation, or none | FR-020 | `c4-container.dis`, `databricks-job.dis` | `identity-and-findings.md#B.1`, `research.md#R4` |
| `diagram.file → string` | Member | 12.2 | the model file, subject-relative | FR-020 | `rdf-graph.dis` | `identity-and-findings.md#B.3` |
| `diagram.views → list(View)`; `view.members` | Member | 12.2 | views of the model and their members | FR-023 | `c4-container.dis` | `identity-and-findings.md#B.7` |
| `diagram.cycles(relType, max) → list(list(Element))` | Function | 12.4 | elementary cycles, loop order, canonical order | FR-022, FR-091 | `causal-loop.dis` | `derived-and-small.md#C2`, `research.md#R9` |
| `diagram.cyclesTruncated(relType, max) → bool` | Function | 12.4 | whether `max` cut the list | FR-022, FR-091 | `causal-loop.dis` | `derived-and-small.md#C2` |
| `diagram.knots(relType) → list(list(Element))` | Function | 12.4 | strongly connected components | FR-022, FR-091 | `causal-loop.dis` (stand-in for w3c-owl, w3c-skos) | `identity-and-findings.md#B.4`, `research.md#R9` |
| `fs.exists(path)`, `fs.isDirectory(path) → optional(bool)` | Function | 12.4 (new "File-system facts") | `constraint` context only; confined to the subject's root | FR-025 | `mindmap.dis` (stand-in for wardley-map) | `identity-and-findings.md#B.8` |
| `diagram.drawn → list(Element)` | Member | 12.2 | elements drawn after the five drawing steps | FR-050, FR-051 | `c4-container.dis` | `view-scale-notation-time.md#gap-9` |
| `e.drawn() → bool` | Member | 12.2 | drawn under the current viewpoint (see note 3) | FR-090 | `c4-container.dis` | `derived-and-small.md#B7` |
| `e.derived → bool`, `e.sources → list(Element)` | Member | 12.2 | provenance of a derived element | FR-090 | `rdf-graph.dis` | `derived-and-small.md#B6` |
| `filterValue(id) → dyn` | Function | 12.4 | the viewer's filter value | FR-050 | `gartner-hype-cycle.dis` | `view-scale-notation-time.md#V7` |
| `budget(id) → map`, `budget() → map` | Function | 12.4 | `shown`, `total`, `truncated`, `withheld` | FR-060 | `rdf-graph.dis` | `view-scale-notation-time.md#S1`, `research.md#R11` |
| `self.findingSeverity() → string`, `self.findings() → list(map)` | Member | 12.2 | worst open finding; the findings on the element (the detail file's `problems()`, renamed per R3) | FR-070 | `databricks-job.dis` (stand-in for azure-devops-pipeline) | `view-scale-notation-time.md#N10`, `research.md#R3`, `research.md#R12` |
| `axisRange(axis, value) → string` | Function | 12.4 | id of the axis range holding `value` | FR-070 | `gartner-hype-cycle.dis` (stand-in for wardley-map) | `view-scale-notation-time.md#N11` |
| `textWidth(text, fontSize)`, `textHeight(lines, fontSize) → double` | Function | 12.4 | with the declared text metric | FR-070 | `mindmap.dis` | `view-scale-notation-time.md#N16` |
| `yearMonth(y, m)`, `ym.year()`, `ym.month()`, `formatYearMonth(i, pattern)`, `parseYearMonth(s)` (an optional, empty when `s` is not a month) | Function | 12.4 | month-index arithmetic and formatting | FR-080 | `gartner-hype-cycle.dis` | `view-scale-notation-time.md#T1` |
| `precisionOf(self, attr) → string` | Function | 12.4 | `date`, `minute`, `second`, `millisecond` or `""` | FR-080 | `gartner-hype-cycle.dis` (stand-in for timeline) | `view-scale-notation-time.md#T3` |
| `snap(v, step, ties)`; `snap(v, step)` rounds halves away from zero | Function | 12.4 | overload with a ties rule | FR-080 | `gartner-hype-cycle.dis` | `view-scale-notation-time.md#T5` |

## New built-in constraints (8.7)

| Id | Raised by | Default severity | FR | Research ref |
|---|---|---|---|---|
| `std.unparseable` | The reader (FBL or the DID loader), once per file that does not parse; replaces every other finding in that file | error (report) | FR-021 | `identity-and-findings.md#B.2`, `#B.9` |
| `std.unreadableEntry` | The reader, per entry that parses but cannot become an element; the entry is kept and not drawn | warning (report) | FR-024 | `identity-and-findings.md#B.9` |
| `std.missingId` | The reader or runtime, per element without a usable id, or whose derived id cannot be computed | warning (report) | FR-012, FR-024 | `identity-and-findings.md#A.10`, `#B.9` |
| `std.duplicateId` | The reader or runtime, per second and later element with an id already used (following `compare`) | warning (report) | FR-012, FR-024 | `identity-and-findings.md#A.10`, `#B.9` |
| `std.mixedPrecision` | The runtime, when attributes tied by `samePrecisionAs` hold values of different written precision | warning (report; prevent in forms) | FR-024 | `identity-and-findings.md#B.9` |
| `std.ephemeralViewData` | The runtime, when stored view data is keyed by an ephemeral id | info (report) | FR-011 | `identity-and-findings.md#B.9` |
| `std.pluginMissing` | The runtime, once per missing plugin whose functions are called | warning (report); the research leaves the severity open, to be fixed in 8.7 | FR-091 | `derived-and-small.md#D`, `research.md#R5` |
| `std.derivedFailed` | The runtime, per derived type whose `from` fails, or per type and error for failing items | warning (report) | FR-090 | `derived-and-small.md#B9` |
| `std.derivedId` | The runtime, when a derived id equals another derived or stored id; the later one is not drawn | warning (report) | FR-090 | `derived-and-small.md#B1`, `#B9` |
| `std.derivedEnds` | The runtime, once per relation type whose derived ends do not satisfy its `source` or `target` | warning (report) | FR-090 | `derived-and-small.md#B2`, `#B9` |

## DID 0.2 changes

- **Status and Appendix A**: `did: "0.2"`, schema `$id` `https://etalii.net/adp/did/schema/0.2/did.schema.json`, references to DISL 0.2; every valid 0.1 definition stays valid (FR-005; `identity-and-findings.md#Part-C`).
- **Section 3, logical structure**: suppressions become `{constraint, element?, subject?, reason, by, at}` with exactly one of `element` and `subject`, never naming an ephemeral id or a derived element with an unstable id (`identity-and-findings.md#Part-C`, `derived-and-small.md#F.2`).
- **Section 3**: a relation record may omit `target` when its type's target end is `optional` (`view-scale-notation-time.md#N3`).
- **Section 3**: records of derived types are never written; a reader treats one as unknown content (8.2) (`derived-and-small.md#B1`).
- **Section 3**: enum values are stored in their stored form (`value`); fixed attributes are never stored, and a stored one is ignored with a warning (`derived-and-small.md#E4`, `#E6`).
- **Section 3, value table**: `yearMonth` as `"±YYYY-MM"` with at least four year digits; `datetime` also as a full date or a local date-time, kept in the form read, under `writtenPrecision: "preserve"` or `timezone: "floating"` (`view-scale-notation-time.md#T1`, `#T3`).
- **Section 4, identifiers**: writers never write a missing or duplicate id; readers load them and report `std.missingId` and `std.duplicateId`; the first record keeps a duplicated id; `missing: "assign"` ids are written on the next save; ids compare per `compare`; derived ids are recomputed on load and references follow (`identity-and-findings.md#Part-C`).
- **Section 5, view data**: view keys never name ephemeral ids (a stored one is ignored, reported by `std.ephemeralViewData` and dropped on the next write); keys may name derived elements with stable ids, and a key that names no element is kept and ignored; `view.viewer` kinds are never written (`identity-and-findings.md#Part-C`, `derived-and-small.md#F.2`, `view-scale-notation-time.md#did-impact-consolidated`).
- **Section 8.1, loading**: a file that does not parse gives `std.unparseable`; a record that fails its schema for another reason is kept as unknown content and reported as `std.unreadableEntry`; derived elements are computed between steps 3 and 4; view keys are not "references resolvable"; step 5 reads "show findings" (`identity-and-findings.md#Part-C`, `derived-and-small.md#B1`).
- **Wording**: "constraint problems" becomes "findings" throughout (`research.md#R3`).

## Notes for the plan and tasks

1. `Finding` and `ValidatorOutput` describe the headless validator's output, not a `.dis` or `.did` file, so the examples validator does not check them. The 8.6 excerpt (a file-and-line finding, a parse-failure finding and a subject finding, from `databricks-job` and `rdf-graph`) needs its own check to meet SC-003, for example a `*.findings.json` fixture validated against `$defs/ValidatorOutput`.
2. `ruler.ticks` and `ruler.levels` are mutually exclusive, so one ruler cannot show both. The gartner excerpt shows `levels`; `ticks` needs a second axis (for example the compact viewpoint's) or a timeline excerpt, which R14 does not list because `timeline.dis` stays unchanged.
3. `e.drawn()` is listed for the `constraint` context (`derived-and-small.md#B7`), while `diagram.drawn` is rejected there (`view-scale-notation-time.md#gap-9`, determinism). The plan should keep one rule: constraints that need view membership use `over: "view"` and `view.members`, and `e.drawn()` is not available in `constraint`.
4. Stand-ins: about twenty constructs are carried by an example whose definition does not need them today (marked "stand-in for"). If the examples should prove need as well as expressibility (SC-004), wardley-map, timeline, sparql-query and azure-devops-pipeline excerpts would carry most of them.
