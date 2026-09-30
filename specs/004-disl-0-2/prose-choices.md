# Prose choices made in DISL-specification.md (feature 004, prose agent)

Names and details the construct map did not fix, with what was chosen and why.

1. **"Changes from 0.1" section number**: an unnumbered `## Changes from 0.1` between section 17 and section 18, listed in the table of contents as an unnumbered bullet (anchor `#changes-from-01`). Why: tasks, the construct map and the research all cite "DISL 18" for deprecated aliases; numbering the new section 18 would renumber them.
2. **2.3 title**: renamed "Localized text, messages and reasons" (Message and Reason are defined there, T009 and T010). The TOC lists top-level sections only, so no TOC change.
3. **Which positions are Message (2.3)**: listed explicitly. Metamodel labels (language, types, attributes, enums, enum values) and `doc` objects stay LocalizedText, because they have no CEL context. Form `prefix`, `suffix`, `unit` adornments and compartment `title`/`emptyText` were left LocalizedText (not in the construct map). The schema agent should match: `Attribute.label` stays LocalizedText.
4. **Reason form table (2.3)**: the `{when, message, id?, doc?}` form keeps `id` and `doc` as in the construct map row; `when` absent means "always applies".
5. **`behavior.reasons.<id>.when` context**: evaluated in the context of the position that refers to it (so one reason can be reused from several positions). `behavior.editGate` context: `element` with `self` bound to the diagram.
6. **`behavior.messages` contexts**: `std.notApplicable` in the `operation` context plus `operationId`; `std.readOnly` in `element` on the diagram; `std.atStart`, `std.atEnd` listed (their use is US5).
7. **`language.origin` (3.2)**: successive versions of one tool type keep the same origin; `x-adp-origin` stays valid, **SHOULD NOT** be written beside `origin`, and `origin` wins when both are present.
8. **Drawing order placed in 6.1** ("What is drawn") rather than 3.5 or 14; `diagram.drawn` is in model order and `[]` in headless contexts (12.2); 12.5 now forbids viewer-dependent members in deterministic contexts and adds `identity` to them.
9. **BuiltInSetting (8.1)**: properties `severity`, `enabled`, `code`, `message`, `doc` (added `doc`).
10. **`violation` keys per built-in (8.4)**: `std.endpoints` {relationType, end}; `std.containment` {parentType, childType, slot}; `std.multiplicity` {min, max, count, relationType or type, end}; `std.acyclic` {relationType, cycle}; `std.axisBounds` {axis, min, max}; `std.facets` {attribute, facet, limit}. The research fixed only some of these (multiplicity, acyclic, endpoints, axisBounds); containment and facets keys are my choice, and `end` was added to endpoints.
11. **`detail` keys per new built-in (8.7)**: `std.unparseable` {reason}; `std.unreadableEntry` {reason, entry}; `std.missingId` {reason: "absent" | "empty" | "pattern" | "derived"}; `std.duplicateId` {id, first}; `std.mixedPrecision` {attribute, other, precision, otherPrecision}; `std.ephemeralViewData` {key}. The research fixed only unparseable, unreadableEntry and duplicateId; the rest are mine. 0.1 built-ins bind keys naming what failed (stated generally, not per built-in).
12. **8.4 gesture contexts**: added `dropTarget` and `tool` to `create`, and `gesture` (`move`, `resize`, `reparent`) to `placement` now (construct map 8.4 row), although T052 (US5) also names `dropTarget`.
13. **Order of gesture checks**: the edit gate applies only to gestures that change the model; built-ins in the order endpoints, containment, multiplicity, acyclic, axisBounds, facets (research 7.1, which extends the changes-from-0.1 list's four).
14. **Finding shape (8.6)**: runtime properties `constraint`, `code`, `severity`, `message`, `target`, `attribute`, `location`, `subject`, `view`, `fixes`; "at least one of `target`, `location`, `subject`", where `target` is the diagram for a diagram-scope rule. Validator output maps `constraint` to `constraintId` and `target` to `elementId`/`elementIds`.
15. **Subject of a DID-stored diagram (8.6)**: the DID definition file itself, so it is the primary file. Not stated in fbl-seam.md, which covers FBL-read subjects.
16. **Hosts rebasing locations (8.6)**: a host **MAY** rebase `file` for display but **MUST NOT** write a rebased path into a finding it passes on.
17. **Suppression by subject (8.6)**: stated in DISL as well as DID; suppressions keyed by `id`, never `code`; never an ephemeral id.
18. **Validator output example (8.6)**: a third, subject-only finding uses constraint id `nonConceptTarget` (invented id for skos.nonconcept-target).
19. **IdRule `reason` (11.5)**: a single Reason (not Reason[]), context `element` with `self` the ephemeral element.
20. **`stable` with `derived` (11.5)**: instead of a different default (research A.0 said default `false` for derived), `stable` "has no effect on `derived` ids". Same effect, no default that differs by strategy.
21. **`prefix` map only at the top level** (11.5 table).
22. **Ephemeral stored types in DID (11.5.3)**: research A.0 said a validator MUST reject a DID-stored specification that declares a stored type's ids ephemeral; I softened it to SHOULD NOT / validator SHOULD warn, because the new examples (for example `rdf-graph.dis` BlankNode) may not declare FBL persistence and would otherwise be non-conforming.
23. **Identity expression reading a forbidden id**: a validator MUST reject one that *visibly* does (static), and a runtime reports runtime failures as `std.missingId`.
24. **14.2 loading order**: four numbered steps (read and report ids, assign or make ephemeral, compute derived ids, resolve view data dropping ephemeral keys). 14.4 gained one paragraph on recomputing derived ids and redo.
25. **`compare: "exact"`**: stated as code-point comparison, as in 0.1.
26. **GestureRefusals values (6.9, 6.10)**: Reason[] per gesture (tasks T036 say Reason[]; the research drafted a single Message). Examples use one-item arrays.
27. **ToolGroup labels, compartment texts, Tool `unavailable` context**: Tool `label` and `unavailable` use the `element` context with `self` bound to the diagram (0.1 said "Context `diagram`" for `enabled`/`visible`, which is not a named context in 12.3).
28. **Attribute `showAbsent`**: only on form fields (7.5), not on attributes, following the construct map rather than T037's wording.
29. **Attribute `samePrecisionAs` (4.3)**: added, because `std.mixedPrecision` (T029) needs it (construct map 4.3 row); no task names it explicitly.
30. **Form `danger` default** `false`; `submitLabel`/`cancelLabel` defaults are the runtime's "OK"/"Cancel".
31. **FieldValidation `timing`**: `"input"` (default) or `"commit"`; `severity` default `"error"` stated.
32. **Confirmation (9.5)**: defined once under 9.5 Deletion with a table, contexts per position, and the rule that one deletion asks at most once (first element in selection order whose confirmation asks).
33. **`abort` sentence** added to the 9.4 action table (construct map 9.4 text row).
34. **Section 18**: column header "DISL 0.1" renamed "Current form" so the new `problems` → `findings` row fits; writers of 0.2 specifications SHOULD write `findings`.
35. **Left unchanged**: section 17.1's `{ "kind": "problems" }` and `statemachine.dis`, which still use the deprecated alias (valid); the "Norway problem" in 11.2; specification validators (14.1, 1.2) now say "errors and warnings", not findings, because findings are results of rules and readers over a model.
36. **Appendix A**: the `$id` sentence moved to 0.2 and notes that the 0.1 address is read against the 0.2 schema (the rest of Appendix A is T083's).
37. **2.1 and 3.1 examples** now declare `"disl": "0.2"` (and the 0.2 `$schema`).
38. **Reserved names (2.2)** gained `detail` (construct map section 2).

## P2 and P3

Choices made while writing US4 to US10, the "Changes from 0.1" table and the appendices (T042 to T083).

39. **`derived` and `sources` members (12.2)**: not added to the reserved names of 2.2, because a 0.1 specification may have an attribute called `derived` (the 6.10 example reads `self.derived`); an attribute of that name shadows the member for its type, and a derived type **MUST NOT** declare either name (4.11.2).
40. **Moving derived nodes**: a derived node with a stable, non-ephemeral id may be moved and resized as view data (4.11.4), since DID lets view keys name derived elements. So "a derived" was dropped from the `move` key of GestureRefusals in 6.9 (written by the P1 agent); model-changing gestures on derived elements are refused with `derived.reason` unless `edits` maps them.
41. **Order of gesture checks (8.4)**: the derived element's `reason` and the ephemeral id's `reason` come in step 1, after the notation's refusal; the edits withheld by a budget come in step 2, after the edit gate.
42. **Budget `finding` (3.2.1)**: judged on the measure without viewer filters (after drawing steps 1 and 2), because findings never depend on a viewer; everything else about a budget applies after filters.
43. **Budget notice default text**: stated as naming `budget('<id>').shown` and `.total`; the example uses a CEL text, since a plain string with `{shown}` would be a literal.
44. **`detail` keys of the new built-ins (8.7)**: `std.pluginMissing` {plugin, functions}; `std.derivedFailed` {type, reason, property, count}; `std.derivedId` {id, first, type}, targeting `first` with the undrawn one named by `subject`; `std.derivedEnds` {type, end, count}. None were fixed by the research.
45. **Relation `owner` default**: the nearest common ancestor of the ends, or the diagram (research B4 and the schema). contracts/changes-from-0.1.md row 9 says "its source's parent"; the Changes from 0.1 table follows B4 instead.
46. **0.1 derived-relation maps with other keys (4.9)**: a key that is neither `source`, `target`, `id`, `sources`, `owner` nor an attribute is a specification error where statically known, and ignored otherwise.
47. **`matchesGlob` (12.4)**: pinned as `*` any run (including none), `?` one character, whole-string match, case-sensitive.
48. **`e.drawn()` (12.2)**: added as an Element member but, with `findingSeverity()`, `findings()`, `filterValue()`, `budget()` and host-metric `textWidth()`, rejected in the deterministic contexts of 12.5 (research note 3). `derive`, `deriveItem` and `budget` were added to those contexts; `budget` may read what viewer filters leave.
49. **`ViewData.selected`**: added (viewer state), because the gartner handle example in 6.8 reads `self.view.selected`.
50. **Handle on a `{cel}`-bound parameter without `write` (6.8)**: behaves as in 0.1 and a validator SHOULD warn, rather than not being offered, so no 0.1 handle changes meaning. Handle `refusals` is `{move: Reason}` and handle `label` stays LocalizedText, as the schema has them.
51. **Simulation (9.6)**: `until` is evaluated once per step with `self` bound to the diagram; `step` counts from 1; the `state` attribute may be `transient: true` or `"viewer"`; a simulation is offered in read-only mode. The notice example uses plain strings (schema choice 61).
52. **Viewpoint variants (3.5)**: a variant **MUST NOT** itself have variants.
53. **Enum stored forms (4.5)**: an unknown stored form of a non-extensible enum is reported by `std.facets`.
54. **`fixed` in a subtype (4.7)**: narrowing to `fixed` drops the inherited `default`.
55. **Ties `even` (5.10)**: the allowed value that is an even multiple of the step from the rule's offset.
56. **`yearMonth` axes (5.5)**: units finer than `month` and the LDML `y` letter are rejected by validators.
57. **`createSource`/`createTarget` as CreateEnd**: written in 7.2 (they are Tool properties), though T053 names 7.3. The timeline example uses `position.x.startOf('day')` (12.4) rather than the research's undefined `startOfDay()`.
58. **DropSpec `elsewhere`** default `create` (the schema's), so a tool without targets behaves as in 0.1.
59. **Chrome (6.13)**: title, header, notices, filter controls, toggles, outside legends and the empty message are defined once as "chrome" (not elements, not zoomed). The built-in `unavailable` notice is raised by a parse failure of the primary file only.
60. **Transactions (14.4)**: viewer-state changes and simulation steps are stated not to be transactions.
61. **Graceful degradation (15.2)**: one sentence per 0.2 feature group; a specification whose budgets gate edits SHOULD require `limits.budgets`.
62. **Changes from 0.1**: the contract's "Research" column became "Section" (research files are feature artefacts, not part of the specification); row 2 names the full order of 8.4 (notation refusals, edit gate, six built-ins, declared rules); a sentence says that optional additions are not listed.
63. **Appendix B.9**: a new "Built-in constraints" table (T083 names built-ins among the catalogues; B had no such section), in the order of 8.7 with a "Since" column.
64. **Appendix A**: new `$defs` are in bold in the A.2 table and counted (170, 35 new).
65. **Appendix D.2**: renamed "Open questions"; question 3 marked answered (9.6), 7 and 8 partly answered, and 9 (layouts) added as the next open question.
66. **Table of contents**: unchanged, since it lists top-level sections only and 0.2 added only subsections (3.2.1, 4.11, 6.13.1, 9.6, 13.1.1, B.9).
67. **B.7**: `yearMonth` gets the widget `month`, which was also added to the widget list of 7.5.

## Final pass

Decisions taken in the final consistency pass (T084, T086, T087), including the six gaps the examples found (formerly `example-gaps.md`, now removed). Each was applied to the prose, the schema and the examples together.

68. **Handle `label` is a Message** (gap 1; supersedes choice 50 and schema choice 37 on the label). 2.3 lists handle labels among the Message positions; 6.8 gives `label` the `handle` context, where `p` holds the parameter values under the pointer while dragging; 12.3 lists `label` under `handle`. `gartner-hype-cycle.dis` now labels each boundary handle with the month it would set ("Peak ends Jun 2009"), as research 8.11 wrote it.
69. **A declared notice replaces a built-in one by its id** (gap 2). `Notice.id` accepts a simple identifier or `budget:<id>`; a declared notice with the id `budget:<id>` or `unavailable` replaces the built-in one, is shown only while the built-in would be, and its own `visible` narrows that further; it replaces the notice whatever that budget's `notice` says (6.13, 3.2.1). No `replaces` property was added: the id form was already what 6.13 said. `rdf-graph.dis` drops its `notice: false` workaround and declares `budget:cards`.
70. **Id rules on derived types** (gap 3). 11.5.2: the id of a derived node or derived relation is its `derived.id` (or the relation default of 4.11.3), never the id rule's; a `types` rule for such a type contributes only `ephemeral` and `reason`, its other properties are ignored, and a validator SHOULD warn when they are set. `rdf-graph.dis` already followed this reading, so it did not change.
71. **Built-in refusals are a separate property** (gap 4). BuiltInSetting gains `refusal` (a Message in the gesture context plus `violation`); `message` is only the findings' text (constraint context plus `detail`). Without `refusal` a refusal is worded by the runtime, never taken from `message`, so a message written for one never fails in the other. Chosen over binding both maps because a tool engineer then never branches on which one is empty. Updated in 2.3, 8.1 (table, example), 8.4, 8.7 intro, 12.3, D.2 and the schema; `functional-decomposition.dis` moves its two refusal texts to `refusal`.
72. **`parseYearMonth(s)` returns `optional(int)`** (gap 5), `optional.none()` for a string not in the `±YYYY-MM` form or with a month outside 1–12 (12.4). `gartner-hype-cycle.dis` validates typed months with `parseYearMonth(string(value)).hasValue()` instead of a regular expression.
73. **`detail.entry` of `std.unreadableEntry`** (gap 6) is a map: `text`, the entry's source text as written, and `path`, a JSON Pointer to the entry in the file's parsed tree, or `''` when the format has no tree (8.7). DID 8.1 names the pointer it reports as `detail.entry.path`. `gartner-hype-cycle.dis` shows it in its message.
74. **Cross-check fixes** (prose against schema): the object form `{ "$schema", "findings" }` of `$defs/ValidatorOutput`, which `findings.json` uses, is now stated in 8.6; `lastIndexOf`, which `rdf-graph.dis` uses, is listed with the strings extension in 12.1. Every other property of the tables of the sections changed for 0.2 matches the schema in name, type and allowed values; the remaining differences are 0.1 properties described outside a table (for example AnchorSpec `mode: "port"`, DataType facets) and were left as they are.
75. **Section 17 lists the examples beside the document** (T084): a table in the section's introduction names the three complete examples, the seven 0.2 excerpts, `findings.json` and `../did/time-values.did`, with what each shows. `README.md` does not list examples, so it did not change.
76. **17.1 and `statemachine.dis` use `findings`** (supersedes choice 35 for them): the form item kind `problems` became `findings`, and both now declare `"disl": "0.2"` and the 0.2 `$schema`, since `findings` is a 0.2 kind. `timeline.dis` and `erd.dis` still declare 0.1.
77. **The finding badge id is `finding`**, not `problem` (6.6, `databricks-job.dis`), so the word the document uses for results of rules is the only one (T087). The id is new in 0.2, so nothing depends on the old spelling.
78. **Traceability section numbers** (T086): rows that cited 4.9 for the object form of derived relations (`key`, `owner`, lifting) now cite 4.11.3, the read-only reason order cites 4.3, the singleton-id example is `base` (the excerpt has no `truncation` element), and the IRI row names `derived.id` for derived types.
