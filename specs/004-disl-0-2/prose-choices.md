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
