# Example coverage: construct map row, example, JSON path

Rows follow `specs/004-disl-0-2/contracts/constructs.md` (section | construct). Every path was resolved against the files in `specifications/disl/` by `cov.py` in this folder. "none" marks a row the construct map assigns to no example (a sentence, a restriction or a validator rule).

| Construct map row | Example | JSON path |
|---|---|---|
| 2 | `disl: "0.2"`, 0.2 `$schema` | `mindmap.dis` | `/disl` |
| 2 | `disl: "0.2"`, 0.2 `$schema` | `c4-container.dis` | `/disl` |
| 2 | `disl: "0.2"`, 0.2 `$schema` | `rdf-graph.dis` | `/disl` |
| 2 | `disl: "0.2"`, 0.2 `$schema` | `gartner-hype-cycle.dis` | `/disl` |
| 2 | `disl: "0.2"`, 0.2 `$schema` | `functional-decomposition.dis` | `/disl` |
| 2 | `disl: "0.2"`, 0.2 `$schema` | `causal-loop.dis` | `/disl` |
| 2 | `disl: "0.2"`, 0.2 `$schema` | `databricks-job.dis` | `/disl` |
| 2.3 | `Message` (context tool labels) | `mindmap.dis` | `/toolbox/contextTools/0/tools/4/label`, `/toolbox/contextTools/0/tools/5/label` |
| 2.3 | `Reason` (`editGate`) | `rdf-graph.dis` | `/behavior/editGate/0`, `/behavior/reasons/truncated` |
| 2.3 | LocalizedText may not use `cel` as a tag (a restriction) | none | - |
| 2.5 | failing derived `from`: one finding, the rest draws | `rdf-graph.dis` | `/constraints/builtIn/std.derivedFailed` |
| 2.5 | missing plugin function is an error unless it has a `fallback` | `rdf-graph.dis` | `/plugins/net.etalii.adp.w3c.turtle/celFunctions/1/fallback`, `/constraints/builtIn/std.pluginMissing` |
| 2.2 | reserved name `detail` (`std.unparseable` message) | `rdf-graph.dis` | `/constraints/builtIn/std.unparseable/message` |
| 3.2 | `language.origin` | `mindmap.dis` | `/language/origin` |
| 3.2 | `language.origin` | `c4-container.dis` | `/language/origin` |
| 3.2 | `language.origin` | `rdf-graph.dis` | `/language/origin` |
| 3.2 | `language.origin` | `gartner-hype-cycle.dis` | `/language/origin` |
| 3.2 | `language.origin` | `functional-decomposition.dis` | `/language/origin` |
| 3.2 | `language.origin` | `causal-loop.dis` | `/language/origin` |
| 3.2 | `language.origin` | `databricks-job.dis` | `/language/origin` |
| 3.2.1 | `limits.budgets` (cards by count, nodes by `{cel}`) | `rdf-graph.dis` | `/language/limits/budgets/cards`, `/language/limits/budgets/rdfNodes` |
| 3.2 | `maxElements` keeps its soft meaning | `rdf-graph.dis` | `/language/limits/maxElements` |
| 3.4 | `functions.<name>.recursion` (stand-in for w3c-owl) | `rdf-graph.dis` | `/functions/collectionText/recursion` |
| 3.5 | viewpoint `members` | `c4-container.dis` | `/viewpoints/container/members` |
| 3.5 | `variantOf`, `toggle` (compact) | `gartner-hype-cycle.dis` | `/viewpoints/compact/variantOf`, `/viewpoints/compact/toggle` |
| 6.1 | drawing order, `diagram.drawn` (legend from what is drawn) | `c4-container.dis` | `/notation/canvas/legend/from`, `/notation/canvas/header/rows/0/text` |
| 4.2 | primitive `yearMonth` | `gartner-hype-cycle.dis` | `/metamodel/types/Trend/attributes/start/type` |
| 4.2 | `writtenPrecision`, `newPrecision` (stand-in for timeline) | `gartner-hype-cycle.dis` | `/metamodel/types/Trigger/attributes/announcedAt/writtenPrecision`, `/metamodel/types/Trigger/attributes/announcedAt/newPrecision` |
| 4.3 | `transient: "viewer"` (simulated run state) | `databricks-job.dis` | `/metamodel/types/Task/attributes/simulated/transient` |
| 4.3 | attribute `readOnlyReasons`, `absentText`, `emptyText` | `c4-container.dis` | `/metamodel/types/Element/attributes/tags/readOnlyReasons`, `/metamodel/types/Element/attributes/tags/emptyText`, `/metamodel/types/NamedElement/attributes/description/absentText` |
| 4.3 | attribute `outOfRange` (boundaries clamp on drag) | `gartner-hype-cycle.dis` | `/metamodel/types/Trend/attributes/peakEnd/outOfRange` |
| 4.3 | `min`/`max` as `{cel}` (stand-in for timeline) | `gartner-hype-cycle.dis` | `/metamodel/types/Trend/attributes/peakEnd/min`, `/metamodel/types/Trigger/attributes/shippedAt/min` |
| 4.3 | `fixed` (height 48) | `functional-decomposition.dis` | `/metamodel/types/NamedElement/attributes/height/fixed` |
| 4.3 | `samePrecisionAs` (stand-in for timeline) | `gartner-hype-cycle.dis` | `/metamodel/types/Trigger/attributes/shippedAt/samePrecisionAs` |
| 4.5 | enum value `value` (`run-job`) | `databricks-job.dis` | `/metamodel/enums/TaskType/values/run_job/value`, `/metamodel/enums/TaskType/values/for_each/value` |
| 4.11 | node type `derived` (Resource cards from triples) | `rdf-graph.dis` | `/metamodel/types/Resource/derived` |
| 4.11 | `derived.key` and `group` | `rdf-graph.dis` | `/metamodel/types/Resource/derived/key` |
| 4.11 | `derived.key` and `group` | `c4-container.dis` | `/metamodel/relations/DrawnRelationship/derived/key` |
| 4.11 | `derived.parent`, `slot` (stand-in for sparql-query) | `rdf-graph.dis` | `/metamodel/types/Resource/derived/parent`, `/metamodel/types/Resource/derived/slot` |
| 4.11 | `derived.sources`, `reason`, `edits` (`delete` to `removeResource`) | `rdf-graph.dis` | `/metamodel/types/Resource/derived/sources`, `/metamodel/types/Resource/derived/reason`, `/metamodel/types/Resource/derived/edits/delete` |
| 4.11 | derived elements never stored or on undo; declaration order (text) | `rdf-graph.dis` | `/metamodel/doc`, `/metamodel/types/Band/doc` |
| 4.9 | relation `derived` object form (lifted and merged) | `c4-container.dis` | `/metamodel/relations/DrawnRelationship/derived` |
| 4.9 | 0.1 expression form of `derived` (no new example; kept) | `mindmap.dis` | `/metamodel/relations/Branch/derived` |
| 4.9 | `derived.owner` (stand-in for sparql-query) | `c4-container.dis` | `/metamodel/relations/DrawnRelationship/derived/owner` |
| 4.9 | `target.optional` (stand-in for ansible-structure, helm-chart) | `databricks-job.dis` | `/metamodel/relations/RunsOn/target/optional` |
| 4.9 | `acyclic` covers the type and its subtypes (abstract `Owns`) | `functional-decomposition.dis` | `/metamodel/relations/Owns/acyclic` |
| 5.3 | `axes.<a>.ranges` (stand-in for wardley-map) | `gartner-hype-cycle.dis` | `/coordinates/axes/time/ranges` |
| 5.3 | `endLabels` (stand-in for wardley-map) | `gartner-hype-cycle.dis` | `/coordinates/axes/time/endLabels` |
| 5.3 | axis `outOfRange` | `gartner-hype-cycle.dis` | `/coordinates/axes/time/outOfRange`, `/coordinates/axes/rows/outOfRange` |
| 5.5 | `valueType: "yearMonth"` | `gartner-hype-cycle.dis` | `/coordinates/axes/time/valueType` |
| 5.5 | units `decade`, `century`, `millennium` | `gartner-hype-cycle.dis` | `/coordinates/axes/time/ruler/levels/3/unit`, `/coordinates/axes/time/ruler/levels/5/unit`, `/metamodel/enums/TimeUnit/values/millennium` |
| 5.5 | `scale.unit` bound to an attribute | `gartner-hype-cycle.dis` | `/coordinates/axes/time/scale/unit` |
| 5.9 | `snapping.byGesture` (drop floors, move rounds) | `gartner-hype-cycle.dis` | `/coordinates/systems/hypeCycle/snapping/byGesture/drop` |
| 5.10 | snap rule `ties` | `gartner-hype-cycle.dis` | `/coordinates/systems/hypeCycle/snapping/x/ties` |
| 5.10 | calendar snap `unit` bound to an attribute | `gartner-hype-cycle.dis` | `/coordinates/systems/hypeCycle/snapping/x/calendar/unit` |
| 5.13 | ruler `levels[].minSpacingPx`, `levels[].step` | `gartner-hype-cycle.dis` | `/coordinates/axes/time/ruler/levels/0/minSpacingPx`, `/coordinates/axes/time/ruler/levels/6/step` |
| 5.13 | ruler `ticks`, `boundaryFormats`, `attach` (stand-in for timeline) | `gartner-hype-cycle.dis` | `/coordinates/axes/announced/ruler/ticks`, `/coordinates/axes/announced/ruler/boundaryFormats`, `/coordinates/axes/time/ruler/attach` |
| 6.2 | `theme.contrast` | `functional-decomposition.dis` | `/notation/theme/contrast/0` |
| 6.5 | `notation.textMetric` | `mindmap.dis` | `/notation/textMetric` |
| 6.6 | interaction state `filteredOut` | `gartner-hype-cycle.dis` | `/notation/nodes/Trend/states/filteredOut`, `/notation/canvas/filters/find/effect` |
| 6.6 | a badge with id `problem` replaces the default finding mark (stand-in for azure-devops-pipeline) | `databricks-job.dis` | `/notation/nodes/Task/badges/4` |
| 6.7 | built-in `superellipse` with `exponent` | `functional-decomposition.dis` | `/notation/nodes/UiElement/shape` |
| 6.8 | a custom shape shadows a built-in; the diode is a custom shape | `functional-decomposition.dis` | `/notation/shapes/diode` |
| 6.8 | handle `write`, `visible`, `refusals.move` (phase boundaries) | `gartner-hype-cycle.dis` | `/notation/shapes/phasedBanner/handles/0/write`, `/notation/shapes/phasedBanner/handles/0/visible`, `/notation/shapes/phasedBanner/handles/0/refusals/move` |
| 6.9 | `anchors.sides` | `mindmap.dis` | `/notation/nodes/Node/anchors/sides` |
| 6.9 | `container.nesting` | `mindmap.dis` | `/notation/nodes/Node/container/nesting` |
| 6.9 | `badgeLayout`, `badges[].pack` (stand-in for azure-devops-pipeline) | `databricks-job.dis` | `/notation/nodes/Task/badgeLayout`, `/notation/nodes/Task/badges/0/pack` |
| 6.9/6.14 | `flip` (loop arrow) | `causal-loop.dis` | `/notation/nodes/Loop/icon/flip` |
| 6.9/6.12 | bindable `position.offset` (stand-in for wardley-map) | `mindmap.dis` | `/notation/nodes/Node/labels/1/position/offset` |
| 6.9/6.10 | notation `refusals` (an edge cannot be moved) | `rdf-graph.dis` | `/notation/edges/Statement/refusals/move`, `/notation/nodes/Resource/refusals/reparent` |
| 6.10 | `edges.<R>.connect` (relations start at side anchors) | `rdf-graph.dis` | `/notation/edges/Statement/connect/from` |
| 6.10 | end anchor `sides` | `mindmap.dis` | `/notation/edges/Branch/anchoring/source/sides`, `/notation/edges/Branch/anchoring/target/sides` |
| 6.10 | end anchor `mode: "part"` with `part`, `side`, `at`, `movable`, `default` | `gartner-hype-cycle.dis` | `/notation/edges/Influence/anchoring/source`, `/notation/edges/Influence/anchoring/target/default` |
| 6.10 | `stub` (stand-in for ansible-structure, helm-chart) | `databricks-job.dis` | `/notation/edges/RunsOn/stub` |
| 6.10 | `line.bezier` (`reach`, `backward`, `maxReach`) | `databricks-job.dis` | `/notation/edges/Dependency/line/bezier` |
| 6.10 | positive `curvature` bows left; `curved` is one quadratic (text) | `causal-loop.dis` | `/notation/edges/CausalLink/line/curvature`, `/notation/edges/CausalLink/variants/0/line/curvature`, `/notation/edges/CausalLink/doc` |
| 6.13 | `canvas.title` | `c4-container.dis` | `/notation/canvas/title` |
| 6.13 | `canvas.header` (stand-in for sparql-query) | `c4-container.dis` | `/notation/canvas/header` |
| 6.13 | `canvas.notices` (truncation banner) | `rdf-graph.dis` | `/notation/canvas/notices/0` |
| 6.13.1 | `canvas.filters` (tag chips) | `gartner-hype-cycle.dis` | `/notation/canvas/filters/tags` |
| 6.13 | legend `from`, `computed`, `title` | `c4-container.dis` | `/notation/canvas/legend/from`, `/notation/canvas/legend/computed`, `/notation/canvas/legend/title` |
| 6.13 | `canvas.empty` | `causal-loop.dis` | `/notation/canvas/empty` |
| 6.13 | `canvas.fit`, `margin` (stand-in for wardley-map) | `gartner-hype-cycle.dis` | `/viewpoints/announcements/canvas/fit`, `/viewpoints/announcements/canvas/margin` |
| 6.13 | `zoom.initial`, `fitPadding`, `fitWhen` (stand-in for timeline) | `gartner-hype-cycle.dis` | `/notation/canvas/zoom` |
| 7 | `label` as a Message (Collapse or Expand; Remove (with n statements)) | `mindmap.dis` | `/behavior/operations/toggleFold/label` |
| 7 | `label` as a Message (Collapse or Expand; Remove (with n statements)) | `rdf-graph.dis` | `/behavior/operations/removeResource/label` |
| 7.2 | tool `mode: "drop"` and `drop` (onto a variable, refuse elsewhere; onto the parent kind) | `causal-loop.dis` | `/toolbox/groups/0/tools/1/drop` |
| 7.2 | tool `mode: "drop"` and `drop` (onto a variable, refuse elsewhere; onto the parent kind) | `c4-container.dis` | `/toolbox/groups/0/tools/2/drop` |
| 7.2 | `createSource`, `createTarget` as `{type, initial, size}` (stand-in for dependency-graph, timeline) | `databricks-job.dis` | `/toolbox/groups/0/tools/3/createTarget`, `/toolbox/groups/0/tools/3/createSource` |
| 7.2/7.3/9.3 | `unavailable: Reason[]` (Arrange diagram) | `causal-loop.dis` | `/behavior/operations/arrange/unavailable` |
| 7.3 | context tool `visible` | `mindmap.dis` | `/toolbox/contextTools/0/tools/1/visible` |
| 7.3 | context tool kinds `moveUp`, `moveDown` | `mindmap.dis` | `/toolbox/contextTools/0/tools/6/kind`, `/toolbox/contextTools/0/tools/7/kind` |
| 7.3 | `target: "pick"`, `candidates`, `candidateLabel`, `pickerTitle`, `emptyText` | `databricks-job.dis` | `/toolbox/contextMenus/0/tools/2` |
| 7.3 | `forEach`, `as`, `args`, `submenu` (Disconnect from 'X') | `databricks-job.dis` | `/toolbox/contextMenus/0/tools/3` |
| 7.3 | `contextMenus[].for: "diagram"` | `rdf-graph.dis` | `/toolbox/contextMenus/1` |
| 7.3 | `for: "connection"` and `runSingle` (Relate...) | `rdf-graph.dis` | `/toolbox/contextMenus/2` |
| 7.5 | form `submitLabel`, `cancelLabel`, `danger` (Rename dialog) | `rdf-graph.dis` | `/forms/renameDialog/submitLabel`, `/forms/renameDialog/cancelLabel`, `/forms/renameDialog/danger` |
| 7.5 | form item `initial` | `rdf-graph.dis` | `/forms/renameDialog/items/0/initial` |
| 7.5 | field validation `timing`; `message` as a Message (a month that does not parse) | `gartner-hype-cycle.dis` | `/forms/trend/items/1/validate/0` |
| 7.5 | form item `readOnlyReasons`, `absentText`, `emptyText`, `showAbsent` | `c4-container.dis` | `/forms/elementInspector/items/3/readOnlyReasons`, `/forms/elementInspector/items/2/absentText`, `/forms/elementInspector/items/1/emptyText`, `/forms/elementInspector/items/2/showAbsent` |
| 7.5 | form item kind `findings` | `functional-decomposition.dis` | `/forms/namedElement/items/1` |
| 8.1 | `builtIn.<id>.code`, `.message` (`std.multiplicity`, `std.acyclic`) | `functional-decomposition.dis` | `/constraints/builtIn/std.multiplicity/message`, `/constraints/builtIn/std.acyclic/code` |
| 8.2 | rule `code` (replaces `x-adp-ruleId` and ids in `label`/`tags`) | `databricks-job.dis` | `/constraints/rules/0/code` |
| 8.2 | rule `code` (replaces `x-adp-ruleId` and ids in `label`/`tags`) | `c4-container.dis` | `/constraints/rules/0/code` |
| 8.2 | rule `code` (replaces `x-adp-ruleId` and ids in `label`/`tags`) | `gartner-hype-cycle.dis` | `/constraints/rules/0/code` |
| 8.2 | rule `forEach` (one finding per unclaimed cycle) | `causal-loop.dis` | `/constraints/rules/2/forEach` |
| 8.2 | rule `location` and `subject` (prefix re-declarations) | `rdf-graph.dis` | `/constraints/rules/0/location`, `/constraints/rules/0/subject` |
| 8.2 | rule `over` (element not on any view) | `c4-container.dis` | `/constraints/rules/2/over`, `/constraints/rules/3/over` |
| 8.2 | rule `message` as a Message | `databricks-job.dis` | `/constraints/rules/0/message` |
| 8.4 | gesture kind `reorder` | `mindmap.dis` | `/constraints/rules/4/kind` |
| 8.4 | `create` gains `dropTarget`, `tool`; `placement` gains `gesture` | `c4-container.dis` | `/constraints/rules/6/message`, `/constraints/rules/6/when`, `/constraints/rules/7/when` |
| 8.4 | order of gesture checks: type, cardinality, cycle (text) | `functional-decomposition.dis` | `/constraints/doc` |
| 8.6 | `Finding` (elements, attribute, location, subject, view) | `databricks-job.dis` | `/constraints/rules/2` |
| 8.6 | `Finding` (elements, attribute, location, subject, view) | `findings.json` | `/findings` |
| 8.6 | `SourceLocation` (via `self.location()`) | `databricks-job.dis` | `/constraints/rules/1/location` |
| 8.6 | `SourceLocation` (via `self.location()`) | `findings.json` | `/findings/2/location` |
| 8.6 | `std.unparseable` replaces every other finding in its file (text) | `rdf-graph.dis` | `/constraints/builtIn/std.unparseable`, `/constraints/doc` |
| 8.6 | `std.unparseable` replaces every other finding in its file (text) | `findings.json` | `/findings/0` |
| 8.6 | normative order of findings (bound reached before unlabelled loop) | `causal-loop.dis` | `/constraints/doc`, `/constraints/rules/1/id` |
| 8.6 | headless validator output (`ValidatorOutput`) | `findings.json` | `/findings` |
| 8.7 | new built-ins (see the built-in table) | `rdf-graph.dis` | `/constraints/builtIn/std.derivedId` |
| 8.7 | new built-ins (see the built-in table) | `mindmap.dis` | `/constraints/builtIn/std.missingId` |
| 8.7 | `std.acyclic` over subtypes; `std.endpoints` silent on an optional target | `functional-decomposition.dis` | `/constraints/builtIn/std.acyclic/doc` |
| 8.7 | `std.acyclic` over subtypes; `std.endpoints` silent on an optional target | `databricks-job.dis` | `/metamodel/relations/RunsOn/derived/doc` |
| 8 | findings on derived elements borrow the first source's location (text) | `rdf-graph.dis` | `/constraints/doc` |
| 9.1 | `behavior.reasons`, `behavior.editGate` (truncation gate) | `rdf-graph.dis` | `/behavior/reasons`, `/behavior/editGate` |
| 9.1 | `behavior.messages` (does not apply to this selection) | `rdf-graph.dis` | `/behavior/messages/std.notApplicable` |
| 9.1 | `behavior.messages` (does not apply to this selection) | `mindmap.dis` | `/behavior/messages/std.atStart` |
| 9.2 | hooks never fire for derived elements (text) | `rdf-graph.dis` | `/behavior/doc` |
| 9.6 | `operations.<id>.simulate` (Run job, simulated) | `databricks-job.dis` | `/behavior/operations/simulateRun/simulate` |
| 9.4 | `create`, `reparent` gain `after`, `before` (Add sibling) | `mindmap.dis` | `/behavior/operations/addSibling/actions/0/create/after`, `/behavior/operations/promote/actions/0/reparent/after` |
| 9.4 | action `reorder` | `mindmap.dis` | `/behavior/operations/moveFirst/actions/0/reorder` |
| 9.4 | action `view` (toggle fold) | `mindmap.dis` | `/behavior/operations/toggleFold/actions/0/view` |
| 9.4 | action `view` (toggle fold) | `gartner-hype-cycle.dis` | `/behavior/operations/clearTagFilter/actions/0/view` |
| 9.4 | actions see earlier `forEach` iterations (`claimClosedLoops`) (text) | `causal-loop.dis` | `/behavior/hooks/0` |
| 9.4 | an `abort` message is the refusal (sentence only) | none | - |
| 9.5 | `confirm` as a Confirmation (branch or leaf; connection count) | `mindmap.dis` | `/behavior/deletion/Node/confirm` |
| 9.5 | `confirm` as a Confirmation (branch or leaf; connection count) | `functional-decomposition.dis` | `/behavior/deletion/NamedElement/confirm` |
| 11.5 | `persistence.ids` with `types.<T>` rules | `rdf-graph.dis` | `/persistence/ids/types` |
| 11.5 | `strategy: "derived"` (triple counter, singleton, `edge:<from>-><to>`, relation formula) | `rdf-graph.dis` | `/persistence/ids/types/Triple`, `/persistence/ids/types/Base` |
| 11.5 | `strategy: "derived"` (triple counter, singleton, `edge:<from>-><to>`, relation formula) | `databricks-job.dis` | `/persistence/ids/types/Dependency` |
| 11.5 | `strategy: "derived"` (triple counter, singleton, `edge:<from>-><to>`, relation formula) | `c4-container.dis` | `/persistence/ids/types/Relationship` |
| 11.5 | `strategy: "derived"` (triple counter, singleton, `edge:<from>-><to>`, relation formula) | `causal-loop.dis` | `/persistence/ids/types/CausalLink` |
| 11.5 | `strategy: "derived"`, IRIs (see example-gaps: on a derived type, shown by `derived.id`) | `rdf-graph.dis` | `/metamodel/types/Resource/derived/id` |
| 11.5 | `encoding` (`base64url`, `base36`) | `gartner-hype-cycle.dis` | `/persistence/ids/encoding` |
| 11.5 | `encoding` (`base64url`, `base36`) | `functional-decomposition.dis` | `/persistence/ids/encoding` |
| 11.5 | `natural` ids; `suffix` with `{n}` | `causal-loop.dis` | `/persistence/ids/strategy` |
| 11.5 | `natural` ids; `suffix` with `{n}` | `c4-container.dis` | `/persistence/ids/suffix` |
| 11.5 | `ephemeral` (bool or `{cel}`) and `reason` | `rdf-graph.dis` | `/persistence/ids/types/BlankNode` |
| 11.5 | `ephemeral` (bool or `{cel}`) and `reason` | `c4-container.dis` | `/persistence/ids/types/NamedElement/ephemeral` |
| 11.5 | `missing: "assign"` | `mindmap.dis` | `/persistence/ids/missing` |
| 11.5 | `compare: "ignore-case"` | `c4-container.dis` | `/persistence/ids/compare` |
| 11.5 | one id space; the first keeps a duplicated id (text) | `mindmap.dis` | `/constraints/builtIn/std.duplicateId/doc` |
| 11.5 | ids generated once per gesture (sentence only) | none | - |
| 11.5 | `prefix` not applied to `cel`/`derived`; `stable` unchanged (sentence only) | none | - |
| 11.6 | `persistence.view.viewer`, `initial`, `revealExpands` | `mindmap.dis` | `/persistence/view/viewer`, `/persistence/view/initial`, `/persistence/view/revealExpands` |
| 11.6 | nothing stored for an ephemeral id; a stored one is reported | `rdf-graph.dis` | `/constraints/builtIn/std.ephemeralViewData` |
| 12.1/12.5 | strings order by code point; stable sorts (loop signature) | `causal-loop.dis` | `/functions/signature` |
| 12.2 | a type name includes its subtypes | `functional-decomposition.dis` | `/forms/namedElement/items/0/items/3/value` |
| 12.2 | `ancestors()` lists the parent first (`liftTo`) | `c4-container.dis` | `/functions/liftTo` |
| 12.2 | `owner` is a member of every relation | `c4-container.dis` | `/notation/edges/DrawnRelationship/conditions/0/when` |
| 12.4 | `color(c).mix()` semantics (stand-in for ansible-structure, helm-chart) | `c4-container.dis` | `/notation/canvas/legend/computed/swatch/fill` |
| 12.5 | viewer-, finding- and budget-dependent members rejected in deterministic contexts (validator rule) | none | - |
| 13.1 | `celFunctions` `params` objects, `uses`, `deterministic`, `fallback` | `rdf-graph.dis` | `/plugins/net.etalii.adp.w3c.turtle/celFunctions/1` |
| 14.2/14.4 | derived elements and ids computed on load and per transaction (text) | `rdf-graph.dis` | `/metamodel/doc` |
| 15.2 | a missing plugin function degrades | `rdf-graph.dis` | `/plugins/net.etalii.adp.w3c.turtle/doc` |
| 15.2 | a runtime lacking a 0.2 feature id degrades (sentence only) | none | - |
| 16 | file-system facts confined to the subject's root (stand-in for wardley-map) | `mindmap.dis` | `/constraints/rules/1` |
| 18 | form item kind `problems` deprecated (alias; no example) | none | - |
| B.2 | default `exponent` 4 for `superellipse` | `functional-decomposition.dis` | `/notation/nodes/UiElement/shape/params/exponent` |
| B.5 | `decade`/`century`/`millennium`; LDML `u` on `yearMonth` axes | `gartner-hype-cycle.dis` | `/coordinates/axes/time/ruler/levels/4/format` |
| B.7 | default widget `month` for `yearMonth` | `gartner-hype-cycle.dis` | `/forms/trend/items/2` |
| B.8 | feature ids in `requires.features` | `rdf-graph.dis` | `/language/requires/features` |
| B.8 | feature ids in `requires.features` | `gartner-hype-cycle.dis` | `/language/requires/features` |
| CEL | context `identity` | `rdf-graph.dis` | `/persistence/ids/types/Triple/expression` |
| CEL | context `derive` | `rdf-graph.dis` | `/metamodel/types/Resource/derived/from` |
| CEL | context `deriveItem` | `rdf-graph.dis` | `/metamodel/types/Resource/derived/attributes/types` |
| CEL | context `filter` | `gartner-hype-cycle.dis` | `/notation/canvas/filters/tags/keep` |
| CEL | context `legend` | `c4-container.dis` | `/notation/canvas/legend/computed/key` |
| CEL | context `chrome` | `rdf-graph.dis` | `/notation/canvas/notices/0/text` |
| CEL | context `budget` | `rdf-graph.dis` | `/language/limits/budgets/cards/order` |
| CEL | context `connection` | `rdf-graph.dis` | `/toolbox/contextMenus/2/when` |
| CEL | context `handleWrite` | `gartner-hype-cycle.dis` | `/notation/shapes/phasedBanner/handles/0/write/0/set/peakEnd` |
| CEL | context `simulation` | `databricks-job.dis` | `/behavior/operations/simulateRun/simulate/next` |
| CEL | context `gesture:reorder` | `mindmap.dis` | `/constraints/rules/4/rule` |
| CEL | `constraint` gains `item`, `index`, `view`, `detail` | `causal-loop.dis` | `/constraints/rules/2/message` |
| CEL | `constraint` gains `item`, `index`, `view`, `detail` | `c4-container.dis` | `/constraints/rules/3/rule` |
| CEL | `constraint` gains `item`, `index`, `view`, `detail` | `rdf-graph.dis` | `/constraints/builtIn/std.unparseable/message` |
| CEL | `dropTarget`, `tool`, `gesture`, confirmation `count`, generated entries' `as` name | `c4-container.dis` | `/constraints/rules/6` |
| CEL | `dropTarget`, `tool`, `gesture`, confirmation `count`, generated entries' `as` name | `mindmap.dis` | `/behavior/deletion/Node/confirm/message` |
| CEL | `dropTarget`, `tool`, `gesture`, confirmation `count`, generated entries' `as` name | `databricks-job.dis` | `/toolbox/contextMenus/0/tools/3/label` |
| CEL | `e.positionIn(list)` | `databricks-job.dis` | `/constraints/rules/2/rule` |
| CEL | `e.positionIn(list)` | `rdf-graph.dis` | `/persistence/ids/types/Triple/expression` |
| CEL | `e.location()`, `e.location(attr)` | `c4-container.dis` | `/persistence/ids/types/Relationship/expression`, `/constraints/rules/5/location` |
| CEL | `e.location()`, `e.location(attr)` | `databricks-job.dis` | `/constraints/rules/1/location` |
| CEL | `diagram.file` | `rdf-graph.dis` | `/constraints/rules/0/location` |
| CEL | `diagram.views`, `view.members` | `c4-container.dis` | `/constraints/rules/2/rule`, `/constraints/rules/3/rule` |
| CEL | `diagram.cycles` | `causal-loop.dis` | `/constraints/rules/2/forEach` |
| CEL | `diagram.cycles` | `databricks-job.dis` | `/constraints/rules/3/forEach` |
| CEL | `diagram.cyclesTruncated` | `causal-loop.dis` | `/constraints/rules/1/rule` |
| CEL | `diagram.knots` (stand-in for w3c-owl, w3c-skos) | `causal-loop.dis` | `/constraints/rules/3/forEach` |
| CEL | `fs.exists`, `fs.isDirectory` (stand-in for wardley-map) | `mindmap.dis` | `/constraints/rules/1/rule` |
| CEL | `diagram.drawn` | `c4-container.dis` | `/notation/canvas/header/rows/0/text` |
| CEL | `e.drawn()` | `c4-container.dis` | `/notation/nodes/Container/tooltip` |
| CEL | `e.derived`, `e.sources` | `rdf-graph.dis` | `/notation/nodes/Resource/tooltip` |
| CEL | `filterValue(id)` | `gartner-hype-cycle.dis` | `/notation/canvas/notices/0/visible` |
| CEL | `budget(id)` | `rdf-graph.dis` | `/behavior/reasons/truncated/when` |
| CEL | `self.findingSeverity()`, `self.findings()` (stand-in for azure-devops-pipeline) | `databricks-job.dis` | `/notation/nodes/Task/badges/4/text`, `/notation/nodes/Task/badges/4/tooltip` |
| CEL | `axisRange` (stand-in for wardley-map) | `gartner-hype-cycle.dis` | `/notation/nodes/Trend/tooltip` |
| CEL | `textWidth`, `textHeight` | `mindmap.dis` | `/notation/nodes/Node/size/width`, `/notation/nodes/Node/size/height` |
| CEL | `yearMonth(y, m)`, `ym.year()`, `formatYearMonth` (`parseYearMonth` not used) | `gartner-hype-cycle.dis` | `/toolbox/groups/0/tools/0/initial/start`, `/notation/nodes/Trigger/labels/0/text`, `/notation/nodes/Trend/tooltip` |
| CEL | `precisionOf` (stand-in for timeline) | `gartner-hype-cycle.dis` | `/coordinates/systems/announcements/snapping/x` |
| CEL | `snap(v, step, ties)` | `gartner-hype-cycle.dis` | `/notation/shapes/phasedBanner/handles/0/snap` |
