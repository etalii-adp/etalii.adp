# Tasks: DISL 0.2, the declarative additions

**Input**: design documents in `specs/004-disl-0-2/`: [disl-0-2.spec.md](disl-0-2.spec.md), [plan.md](plan.md), [research.md](research.md) (R1 to R16, which win over the detail files), [research/](research/), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md).

**Tests**: the spec asks for no test code. Every story is checked by the examples validator (`python .github/scripts/validate-examples.py`) and by walking its rows of [contracts/constructs.md](contracts/constructs.md) and [contracts/traceability.md](contracts/traceability.md).

**How each construct task is done**: for the construct named, (1) write the normative text in the DISL section the construct map names, with RFC 2119 key words in bold capitals, following the research file and decision it cites; (2) add or extend the `$def` in `specifications/disl/disl.schema.json` (or `did.schema.json`) with `description`s like the existing ones; (3) use it in the example the construct map names; (4) run the validator. Markdown lines are never wrapped.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task).
- **[Story]**: US1 to US10, the user stories of the spec.
- Paths: `DISL` = `specifications/disl/DISL-specification.md`, `DISL-S` = `specifications/disl/disl.schema.json`, `DID` = `specifications/did/DID-specification.md`, `DID-S` = `specifications/did/did.schema.json`, `CM` = `specs/004-disl-0-2/contracts/constructs.md`.

---

## Phase 1: Setup

**Purpose**: move both languages to 0.2 without changing what any 0.1 document means, and create the example files the stories fill.

- [x] T001 Record the baseline: run `python .github/scripts/validate-examples.py` on the branch head and save the list of files and results to `specs/004-disl-0-2/baseline.txt` (quickstart step 2).
- [x] T002 Move DISL to 0.2 in DISL-S: `$id` becomes `https://etalii.net/adp/disl/schema/0.2/disl.schema.json`, the version key accepts `"0.1"` and `"0.2"`, and any `$ref` to DID follows DID's new `$id` (research R2).
- [x] T003 [P] Move DID to 0.2 in DID-S: `$id` becomes `https://etalii.net/adp/did/schema/0.2/did.schema.json`, `did` accepts `"0.1"` and `"0.2"`, and its references to DISL use the 0.2 `$id` (R2).
- [x] T004 Update `.github/scripts/validate-examples.py`: `DISL` and `DID` point at the 0.2 `$id`s, and a document whose `$schema` names the 0.1 `$id` is read against the 0.2 schema without being flagged as a deprecated alias (R2); update its docstring. Depends on T002 and T003.
- [x] T005 Update the header, "Status of this document" and date of DISL to *0.2, Working Draft*, and add an empty section "Changes from 0.1" before section 18 (FR-001, FR-002).
- [x] T006 [P] Update the header and status of DID to *0.2, Working Draft*, and add an empty section "Changes from 0.1".
- [x] T007 [P] Create the seven example skeletons in `specifications/disl/`: `mindmap.dis`, `c4-container.dis`, `rdf-graph.dis`, `gartner-hype-cycle.dis`, `functional-decomposition.dis`, `causal-loop.dis`, `databricks-job.dis`, each a trimmed, valid excerpt of the same-named definition in `definitions/diagrams/` (for `rdf-graph` use `w3c-rdf.dis`, for `gartner-hype-cycle` use `gartner-hype-cycle-graph.dis`, for `functional-decomposition` use `functional-decomposition-graph.dis`, for `causal-loop` use `causal-loop-diagram.dis`) with `"disl": "0.2"`, keeping its language, core metamodel and notation and dropping everything the stories will add (R14).
- [x] T008 Run the validator: every file in `baseline.txt` has the same result, and the seven skeletons are valid (SC-002). Depends on T001 to T007.

---

## Phase 2: Foundational

**Purpose**: the shared shapes every story uses: Message, Reason, Confirmation (R7), SourceLocation and findings (R3, R4), and the drawing order (R10). No story starts before this phase is done.

- [x] T009 Add `$defs/Message` (LocalizedText or `{cel}`) to DISL-S and define it in DISL 2.3; state that `cel` is not a language tag and that every user-facing text position accepts a Message; widen the text positions listed in CM section 2 to Message (research/reasons-and-gestures.md 7.0).
- [x] T010 Add `$defs/Reason` ("a Message; or `{when, message}`; or `{reason: id}` referring to `behavior.reasons`", used as ordered `Reason[]`, first that applies is shown) and `behavior.reasons` to DISL-S; define both in DISL 2.3 and 9.1 (R7).
- [x] T011 Add `$defs/Confirmation` (`{message, title?, confirmLabel?, cancelLabel?, danger?, when?, count?, threshold?}`, "asks only when `when` holds and `count >= threshold`; `threshold` defaults to 0") to DISL-S and define it in DISL 9.5; every 0.1 `confirm` position accepts a Message or a Confirmation, and a plain Message keeps its 0.1 meaning (FR-033).
- [x] T012 Rename problems to findings in DISL 8.6 and throughout DISL prose; keep form item kind `problems` as a deprecated alias of `findings` in DISL-S and in DISL 18 (R3).
- [x] T013 [P] Add "finding" to `docs/terminology.md`, defined as the result of evaluating a rule or reading a model, with its severity and location (R3; CLAUDE.md: change the definition there first).
- [x] T014 Add `$defs/SourceLocation` (`{file, line?, column?, length?}`; "`line` and `column` are 1-based; `column` and `length` count Unicode code points; `file` is relative to the diagram's subject, `/`-separated") and `$defs/Finding` to DISL-S, and define them in DISL 8.6, citing FBL for the subject, the primary file and reading order ([contracts/fbl-seam.md](contracts/fbl-seam.md)).
- [x] T015 Define the drawing order in DISL 6.1 or 14: viewpoint membership, derived elements, viewer filters, budgets, `visible: false`, exposed as `diagram.drawn`; a relation with an undrawn end is not drawn (R10). Add `diagram.drawn` to DISL 12.2 and state that it is not readable in the `constraint` context (R16).
- [x] T016 Run the validator; no result in `baseline.txt` changes.

**Checkpoint**: shared shapes in place; the stories can proceed.

---

## Phase 3: User Story 1 - Identity a tool engineer can declare (P1) 🎯 MVP

**Goal**: ids declared per type, including ShortGuid, `derived` ids and `ephemeral` ids; tolerant loading of missing and duplicate ids (FR-010 to FR-012).

**Independent test**: the dependency graph's ShortGuid, the .NET paths, the RDF IRIs and blank nodes and the C4 relationship ids are expressed in the examples and validate; DISL says what happens when a position is stored for an ephemeral id (spec, User Story 1).

- [x] T017 [US1] Extend `persistence.ids` in DISL 11.5 and DISL-S with `types` (map TypeRef → IdRule), strategy `derived` with `expression` in a new `identity` CEL context, `encoding` (`hex`, `base64url`, `base36`) for `uuid-v4`, `compare` (`exact`, `ignore-case`) and `suffix`; add `$defs/IdRule` (research/identity-and-findings.md A.0 to A.8, A.13; R6).
- [x] T018 [US1] Add `ephemeral` (bool or Expression) and `reason` (Reason) to IdRule; write in DISL 11.5 that an element with an ephemeral id **MUST NOT** be stored as view data, a suppression or a reference, and that gestures that would store one are refused with `reason` (A.9).
- [x] T019 [US1] Add `ids.missing` (`assign`, `ephemeral`) and the tolerant-loading rules to DISL 11.5 and 14.2: the first element in reading order keeps a duplicated id; later ones are treated as ephemeral (A.10).
- [x] T020 [US1] Add the `identity` context to DISL 12.3 and `e.positionIn(list)` to DISL 12.4 (A.5).
- [x] T021 [US1] Add built-ins `std.missingId`, `std.duplicateId` (flags only the second and later) and `std.ephemeralViewData` to DISL 8.7 (B.9).
- [x] T022 [US1] Show the id constructs in the examples named by CM section 11.5: ShortGuid with `base36` in `functional-decomposition.dis`, IRI and ephemeral blank nodes in `rdf-graph.dis`, relation formula ids and `compare: "ignore-case"` in `c4-container.dis`, path ids in the stand-in the CM names.
- [x] T023 [US1] Write DID 0.2 section 4 changes in DID (tolerant reader, writers never write missing or duplicate ids, derived ids recomputed on load) and section 5 (view keys never name ephemeral ids; stored ones are ignored, reported and dropped) (identity-and-findings.md part C, items 2 and 3).
- [x] T024 [US1] Run the validator and walk the US1 rows of `contracts/traceability.md` (gap 4).

---

## Phase 4: User Story 2 - Findings that point at the file (P1)

**Goal**: findings at a file and line or on an undrawn subject, parse failure, per-item and per-cycle findings, order, scope, built-in rules, validator output (FR-020 to FR-026).

**Independent test**: the CLD cycle rule, the C4 whole-model rules and the SKOS duplicate-label rule validate; `findings.json` validates against `$defs/ValidatorOutput` (spec, User Story 2; R16).

- [x] T025 [US2] Extend the constraint object in DISL 8.2 and DISL-S with `code`, `forEach` (binds `item`, `index`; `rule` becomes optional and defaults to "every item is a finding"), `location`, `subject` and `over` (`model`, the default and the 0.1 meaning, or `view`) (B.1, B.3, B.7).
- [x] T026 [US2] Write the parse-failure rule (`std.unparseable` replaces every other finding located in the same file; on the primary file no constraint runs; a folder subject has no primary file) and the normative order of findings in DISL 8.6 (B.2, B.6; fbl-seam.md).
- [x] T027 [US2] Add `diagram.cycles(relType, max)` (elementary cycles in canonical order, each in loop order), `diagram.cyclesTruncated(relType, max)` and `diagram.knots(relType)` to DISL 12.4 (R9).
- [x] T028 [US2] Add `fs.exists` and `fs.isDirectory` to DISL 12.4, returning an optional, confined to the subject's root, and state in DISL 16 that they read nothing else (B.8).
- [x] T029 [US2] Add built-ins `std.unparseable`, `std.unreadableEntry` and `std.mixedPrecision` to DISL 8.7 with default severities, and `code` and `message` (Message) to `constraints.builtIn` (B.9, B.11).
- [x] T030 [US2] Add `$defs/ValidatorOutput` to DISL-S (0.1 keys plus optional `code`, `elementIds`, `location`, `subject`, `view`) and update the headless-validator paragraph of DISL 8.6 (B.10).
- [x] T031 [P] [US2] Create `specifications/disl/findings.json` naming `disl.schema.json#/$defs/ValidatorOutput` in `$schema`, with a file-and-line finding, a parse-failure finding and a finding on an undrawn subject (R16).
- [x] T032 [US2] Show the constructs in the examples CM section 8 names: per-cycle findings with `forEach` and `diagram.cycles` in `causal-loop.dis`, `over` and whole-model rules in `c4-container.dis`, a `subject` finding in `rdf-graph.dis`, `code` replacing `x-adp-ruleId` in each.
- [x] T033 [US2] Write DID 0.2 section 3 (suppressions `[{constraint, element?, subject?, reason, by, at}]`, exactly one of `element` and `subject`) in DID and DID-S, and section 8.1 loading (`std.unparseable`, `std.unreadableEntry` for records kept as unknown content) (identity-and-findings.md part C, items 4 and 5).
- [x] T034 [US2] Run the validator and walk the gap 6 rows of `contracts/traceability.md`.

---

## Phase 5: User Story 3 - The tool says why (P1)

**Goal**: refusal sentences, read-only reasons, unavailable entries, confirmations, stateful labels, dialogs (FR-030 to FR-035).

**Independent test**: the FDG branch or leaf delete confirmation, the SHACL "Remove shape (with 5 statements)" label and the .NET read-only reasons validate (spec, User Story 3).

- [x] T035 [US3] Write the order of gesture checks (built-ins endpoints, containment, multiplicity, acyclic, then declared rules; the first refusal is shown) in DISL 8.4, and add `message` with a `violation` map to `constraints.builtIn` (reasons-and-gestures.md 7.1).
- [x] T036 [US3] Add per-kind `refusals` (Reason[]) to node and edge notation in DISL 6.9, 6.10 and DISL-S, and the diagram-wide `behavior.editGate` (Reason[]) in DISL 9.1 (7.1).
- [x] T037 [US3] Add `readOnlyReasons` (Reason[], in priority order field, attribute, then gate), `absentText`, `emptyText` and `showAbsent` to attributes (DISL 4.3) and form fields (DISL 7.5) (7.2).
- [x] T038 [US3] Add `unavailable` (Reason[]) to tools, context tools, operations and buttons, and `visible` to context tools, in DISL 7.2, 7.3, 9.3; an entry that runs an operation inherits the operation's reasons (7.3).
- [x] T039 [US3] Widen menu, tool and context tool labels to Message in DISL 7 (7.5), and add `Form.submitLabel`, `cancelLabel`, `danger`, `FormItem.initial` and `FieldValidation.timing` in DISL 7.5 (7.6).
- [x] T040 [US3] Show the constructs in the examples CM sections 7 to 9 name: branch or leaf confirmation with `count` and `threshold` in `functional-decomposition.dis`, a counted label and an unavailable entry in `rdf-graph.dis`, read-only reasons with a `{reason}` reference in the stand-in the CM names.
- [x] T041 [US3] Run the validator and walk the gap 7 rows of `contracts/traceability.md`.

---

## Phase 6: User Story 4 - Elements computed from the model (P2)

**Goal**: derived nodes and edges, computed containment, view membership, recursion, cycles, plugin functions in CEL (FR-090, FR-091).

**Independent test**: C4 view membership and relationship lifting, and the RDF badge from `rdf:type`, validate; DISL forbids writing a derived node (spec, User Story 4).

- [x] T042 [US4] Add a new section DISL 4.11 "Derived elements" with the FBL boundary (informative) and the `derived` object on node types (`from`, `key`, `id`, `attributes`, `parent`, `slot`, `sources`, `reason`, `edits`) with `$defs/DerivedNode` in DISL-S (research/derived-and-small.md A, B1, B3, B5, B6).
- [x] T043 [US4] Add the object form of relation `derived` (`source`, `target`, `owner` plus the DerivedNode members) in DISL 4.9 and DISL-S; the 0.1 expression form keeps its meaning; define extra keys in 0.1 result maps (B2, B4).
- [x] T044 [US4] Add the `derive` and `deriveItem` contexts to DISL 12.3, `Element.sources`, `derived` and `owner` to DISL 12.2, and the recompute rules (on load and in every transaction, in declaration order, never written, never on undo, a failure gives one finding) to DISL 14.2 and 14.4 (B9).
- [x] T045 [US4] Add `members` to viewpoints in DISL 3.5 and DISL-S, with `matchesGlob` in DISL 12.4, and define `ancestors()` as nearest first (B7, B8).
- [x] T046 [US4] Add `recursion: {maxDepth, atMaxDepth}` to functions in DISL 3.4 and DISL-S (C1).
- [x] T047 [US4] Extend `celFunctions` in DISL 13.1 and DISL-S with bare-name calls, the clash rule, `uses`, `deterministic`, `params` and `fallback`; add `std.pluginMissing` (default `warning`, R16) to DISL 8.7 and its behaviour to DISL 15.2 (D).
- [x] T048 [US4] Show the constructs in the examples: derived cards, rows and badges in `rdf-graph.dis`; view `members` and lifted, merged relationships in `c4-container.dis`; bounded recursion in the stand-in the CM names.
- [x] T049 [US4] Write DID 0.2 changes for derived elements in DID (records of derived types are never written and are read as unknown content; view keys and suppressions may name derived elements with stable ids; unresolved view keys are kept and ignored; derived elements computed before view data is resolved) (derived-and-small.md F.2 items 1 to 4).
- [x] T050 [US4] Run the validator and walk the gap 3 rows of `contracts/traceability.md`.

---

## Phase 7: User Story 5 - Gestures and menus (P2)

**Goal**: positional create, drops, direction by anchor, node plus edge, pickers, reorder, per-item entries, empty-canvas and transient menus, clamp or refuse, handles writing attributes (FR-040 to FR-042).

**Independent test**: the mindmap's "insert sibling after", the gartner phase-boundary handles and the dependency graph's "connect to existing" picker validate (spec, User Story 5).

- [x] T051 [US5] Add `after` and `before` to the `create` and `reparent` actions, a `reorder` action and the `reorder` gesture kind in DISL 9.4, 8.4 and DISL-S; add context tool kinds `moveUp` and `moveDown` in DISL 7.3 (8.1, 8.2).
- [x] T052 [US5] Add Tool `mode: "drop"` with a `drop` table (entries are context tools with `on`: types or `"canvas"`; otherwise `create`, `ignore`, `refuse` with a Reason, or `menu`) and `dropTarget` in the `create` gesture context, in DISL 7.2, 8.4 and DISL-S (8.3).
- [x] T053 [US5] Add `EdgeNotation.connect` (each anchor to the end it starts) in DISL 6.10, and `{type, initial}` for `createSource` and `createTarget` in DISL 7.3 (8.4, 8.5).
- [x] T054 [US5] Add context tool `target: "pick"` with `candidates`, and `forEach`, `as`, `args`, `submenu` in DISL 7.3; add `for: ["diagram"]` with `position` and `for: ["connection"]` with `source`, `target`, `runSingle` to context menus (8.6 to 8.9).
- [x] T055 [US5] Add `outOfRange {drag, typed, message}` to attributes and axes in DISL 4.3 and 5.3 ("the bound wins over snapping") (8.10).
- [x] T056 [US5] Add `write` (Action[]) and `visible` to handles in DISL 6.8, and state that a handle on an `{attribute}`-bound parameter writes the attribute (8.11).
- [x] T057 [US5] Show the constructs in the examples: positional create and reorder in `mindmap.dis`, phase-boundary handles in `gartner-hype-cycle.dis`, drops in `databricks-job.dis`, the picker in the stand-in the CM names.
- [x] T058 [US5] Run the validator and walk the gap 8 rows of `contracts/traceability.md`.

---

## Phase 8: User Story 6 - View state and canvas chrome (P2)

**Goal**: per-viewer state off undo and out of the file; computed legend and title, header, notices, filters, empty message, stretch, initial fit, compact mode (FR-050, FR-051).

**Independent test**: the mindmap's fold state, the C4 tag-chip filter and legend and the causal loop diagram's empty-canvas message validate (spec, User Story 6).

- [x] T059 [US6] Add `viewer`, `initial` and `revealExpands` to `persistence.view` in DISL 11.6, `transient: "viewer"` in DISL 4.3, and the `view` action in DISL 9.4; write that viewer state is never persisted, never on undo, allowed in read-only mode and not readable from deterministic contexts (research/view-scale-notation-time.md V1, V2; R10).
- [x] T060 [US6] Add `title`, `header`, `notices` (with buttons, and built-in `truncated` and `unavailable`), `filters`, `empty`, `fit` and `zoom.initial` to `canvas` in DISL 6.13 and DISL-S, and `legend.from: "drawn"` with computed entries (V3 to V7, V9 to V11).
- [x] T061 [US6] Add `variantOf` and `toggle` to viewpoints in DISL 3.5 (V8).
- [x] T062 [US6] Show the constructs in the examples: fold in `mindmap.dis`, filters, legend and title in `c4-container.dis`, the empty message in `causal-loop.dis`, compact mode in `gartner-hype-cycle.dis`.
- [x] T063 [US6] Run the validator and walk the gap 9 rows of `contracts/traceability.md`.

---

## Phase 9: User Story 7 - Hard budgets (P2)

**Goal**: one or more hard budgets with truncation order and withheld edits (FR-060).

**Independent test**: the RDF graph's two budgets and truncation order validate (spec, User Story 7).

- [x] T064 [US7] Add `language.limits.budgets[]` (`{id, measure, max, order, unit?, truncate?, notice?, withhold?: {gestures, reason}, finding?}`) to DISL 3.2 and DISL-S, the `budget(id)` function (returning `{shown, total, truncated}`) to DISL 12.4, and state that `maxElements` keeps its 0.1 meaning (S1; R11).
- [x] T065 [US7] Show two budgets in `rdf-graph.dis` and run the validator; walk the gap 10 rows of `contracts/traceability.md`.

---

## Phase 10: User Story 8 - Notation details (P3)

**Goal**: the notation items N1 to N16 (FR-070).

**Independent test**: the Wardley axis bands, the FDG diode and the CLD arc bow validate or are stated (spec, User Story 8).

- [x] T066 [US8] Add `sides` to anchors (DISL 6.9, 6.10), `container.nesting: "none"` (6.9), optional relation target ends and `EdgeNotation.stub` (4.9, 6.10), and `LineSpec.bezier {reach, backward}` (6.10) (N1 to N4).
- [x] T067 [US8] Add the `superellipse` built-in shape (6.7, B.2), `flip` on icons and badges (6.9, 6.14), `badgeLayout` and `Badge.pack` (6.9), and `self.findingSeverity()` (12.2) (N5, N8 to N10).
- [x] T068 [US8] Add axis `ranges` and `endLabels` (5.3), ruler `ticks`, `minSpacingPx` and `boundaryFormats` (5.13), and a bindable label `offset` (6.12) (N11 to N13).
- [x] T069 [US8] Pin `color().mix()` and `.alpha()` (12.4), add `theme.contrast` (6.2, 6.15), `notation.textMetric` and `textWidth()` (6.5, 12.4), and write the arc bow sentence (6.10) (N7, N14 to N16).
- [x] T070 [US8] Show the constructs in the examples CM section 6 names (anchors and nesting in `mindmap.dis`, superellipse and contrast in `functional-decomposition.dis`, flip and bow in `causal-loop.dis`, stubs and badge packing in `databricks-job.dis`, axis bands on `gartner-hype-cycle.dis` as a stand-in for wardley-map).
- [x] T071 [US8] Write the DID change for an absent relation `target` when the target end is optional (DID and DID-S), run the validator and walk the gap 11 rows of `contracts/traceability.md`.

---

## Phase 11: User Story 9 - Time and coordinates (P3)

**Goal**: coarser units, years before 1, month precision, written precision, per-gesture snapping, half rounding, anchors bound to attributes (FR-080).

**Independent test**: the timeline's decade ticks and month-precision dates, and the gartner influence anchors, validate (spec, User Story 9).

- [x] T072 [US9] Add the primitive `yearMonth` ("signed astronomical `±YYYY-MM`, at least four year digits", a month index in CEL) to DISL 4.2 and 12.2, axis `valueType: "yearMonth"` and units `decade`, `century`, `millennium` via `$defs/TimeUnit` to DISL 5.5 and B.5, and a bindable `scale.unit` (T1, T2).
- [x] T073 [US9] Add `writtenPrecision: "preserve"` to attributes (4.2) with `precisionOf()` (12.4), `Snapping.byGesture` (5.9) and `SnapRule.ties` (`away-from-zero` default, `even`, `down`, `up`) (5.10) (T3 to T5).
- [x] T074 [US9] Add EndAnchor `mode: "part"` with bound `part`, `side` and `at` to DISL 6.10 (T6).
- [x] T075 [US9] Show the constructs in `gartner-hype-cycle.dis` (and the timeline stand-ins the CM names); write the DID value forms for `yearMonth` and written-precision `datetime` in DID and DID-S; create `specifications/did/time-values.did` exercising them.
- [x] T076 [US9] Run the validator and walk the gap 12 rows of `contracts/traceability.md`.

---

## Phase 12: User Story 10 - The smaller 0.2 items (P3)

**Goal**: simulated runs, `forEach` semantics, string order, enum stored values, `acyclic` on abstract types, fixed attributes, `language.origin` (FR-100).

**Independent test**: the Databricks run simulation, the CLD hook and the FDG `acyclic` and fixed attribute validate (spec, User Story 10).

- [x] T077 [US10] Add a new section DISL 9.6 with `simulate` on operations (`for`, `state`, `initial`, `next`, `until`, `stepMs`, `notice`; outside any transaction, never on undo) and its `$def` (E1).
- [x] T078 [US10] Write the `forEach` semantics (9.4), string order and stable sorts (12.1, 12.5), and `acyclic` covering subtypes with `*OfType` including subtypes (4.9, 8.7, 12.2) (E2, E3, E5).
- [x] T079 [US10] Add `value` to enum values (4.5), `fixed` to attributes (4.3, 4.7), and `language.origin` (pattern `^[a-z0-9-]+/[a-z0-9-]+$`, replacing `x-adp-origin`) to DISL 3.2 and DISL-S (E4, E6; R13).
- [x] T080 [US10] Show the constructs: `simulate` and enum `value` (`run-job`) in `databricks-job.dis`, the `forEach` hook in `causal-loop.dis`, `acyclic` on an abstract type and `fixed` in `functional-decomposition.dis`, `language.origin` in every new example.
- [x] T081 [US10] Write the DID changes for enum stored values and fixed attributes in DID, run the validator and walk the gap 13 rows of `contracts/traceability.md`.

---

## Phase 13: Polish and cross-cutting

- [x] T082 Fill the "Changes from 0.1" sections of DISL and DID from [contracts/changes-from-0.1.md](contracts/changes-from-0.1.md).
- [x] T083 Update the DISL table of contents, Appendix A (`$defs` by layer), Appendix B (catalogues: built-ins, shapes, time units, feature identifiers), Appendix C (glossary: finding, derived element, ephemeral id, viewer state, budget) and Appendix D.2 (remove answered open questions, add layouts as the next).
- [x] T084 [P] Update `specifications/disl/README` material or DISL 17.5 so the new examples are listed with what each shows, and `README.md` if it lists the examples.
- [x] T085 Run quickstart steps 1 to 3 and 6: full validator run, 0.1 results unchanged against `baseline.txt`, every CM row has text, `$def` and example; delete `baseline.txt` afterwards.
- [x] T086 Walk quickstart step 4: every row of `contracts/traceability.md` is met, including the `x-adp` and plugin rows (SC-001, SC-004); record any row that could not be met in the traceability table.
- [x] T087 Check the terminology of every changed file against `docs/terminology.md` (finding, tool engineer, specification, definition), and that no text names a host, IDE or language (SC-005).


**Completion notes** (final pass, 2026-09-30): every task is done. Where the result differs from a task's wording, the research or a recorded choice decided it:

- T001, T008, T016, T085: `baseline.txt` was recorded (32 files, all valid) and then kept out of the repository (commit ab815a9), because it names retired identifiers. The final run validates 41 files, all valid: the 32 of the baseline unchanged, plus the seven excerpts, `findings.json` and `time-values.did`.
- T037: `showAbsent` is on form fields only (prose choice 28). T053: `createSource` and `createTarget` are written in 7.2, where the Tool properties are (prose choice 57). T060: the built-in truncation notice is `budget:<id>`, not `truncated` (R11, 6.13), and a declared notice with that id replaces it (prose choice 69). T064: `limits.budgets` is a map keyed by budget id rather than an array with `id`, and `withhold` is `{edits, reason}` (research R11, `$defs/Budget`).
- T084: `README.md` lists no examples, so only DISL section 17 changed (prose choice 75). T086: every row of `contracts/traceability.md` with outcome "DISL 0.2 construct" or "Sentence" is met in the section it names; eight section numbers were corrected (prose choice 78), and no row is unmet. T087: the terminology check passes; the finding badge id became `finding` (prose choice 77).

---

## Dependencies and execution order

- Phase 1 then Phase 2 block everything.
- US1 (identity) before US2 (findings), because `std.duplicateId` and `positionIn` are defined in US1; US3 depends only on Phase 2.
- US4 (derived) after US1 and US2 (derived ids, findings on derived elements).
- US5 to US10 depend only on Phase 2, except US7 (budgets) on the drawing order (T015) and US9's `std.mixedPrecision` wording (T029) on `precisionOf` (T073); write T029 to refer forward.
- Phase 13 after all stories.

## Parallel opportunities

The DISL document, the DISL schema, the DID files, the examples and `docs/terminology.md` are different files. Within a story, the schema `$def` and the example can be written in parallel with the prose once the construct's shape is fixed in [data-model.md](data-model.md). Across stories, US3, US5, US6, US8, US9 and US10 touch mostly different DISL sections and can be drafted in parallel and merged into DISL one story at a time.

## Implementation strategy

- **MVP**: Phases 1 and 2 plus US1 to US3, the three P1 stories and the FBL seam (ids and findings). That alone lets FBL cite real sections and removes the most repeated items from the notes.
- Then P2 (US4 to US7), then P3 (US8 to US10), each ending with a validator run so the branch stays green.
- One pull request (#42) carries the whole feature, merged with a merge commit when every phase is done.
