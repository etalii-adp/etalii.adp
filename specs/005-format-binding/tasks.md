# Tasks: Format Binding

**Input**: design documents in `specs/005-format-binding/` (spec, plan, research, data-model, inventory, contracts, quickstart).
**Tests**: the spec asks for round-trip fixtures (FR-005, SC-001, SC-002); they are written in the story that introduces what they prove.

## Phase 1: Setup

- [x] T001 Create `specifications/fbl/` with `registrations/` and `fixtures/`, and mark `specifications/fbl/fixtures/** -text` in `.gitattributes` so fixture bytes (line endings, byte-order marks) are never converted
- [x] T002 Amend the constitution through `/speckit-constitution` in `.specify/memory/constitution.md`: Structure and Naming gains FBL as a cross-cutting language beside the six, same naming rules; version 1.1.1 → 1.2.0 (MINOR) with its Sync Impact Report (research R1)

## Phase 2: Foundational

- [x] T003 Define the new words (binding, body, reading, splice, folder subject; registration file extended) in `docs/terminology.md`, and list FBL in `README.md` and `CLAUDE.md`
- [x] T004 Write the skeleton of `specifications/fbl/FBL-specification.md`: header table (version 0.1, Working Draft, schema, expression language CEL, media type, `.fbl`, licence as the other documents state it), status, key words, table of contents, §1 introduction with the DISL 0.2 boundary and the relation to DISL §11 and §13
- [x] T005 Write `specifications/fbl/fbl.schema.json` (draft 2020-12, `$id` `https://etalii.net/adp/fbl/schema/0.1/fbl.schema.json`) with `$defs` `Document` (required `fbl` const `"0.1"`, `bindings` with at least one), `Binding`, `Claims`, `Marker`, `Body`, `FileRule`, `PluginReader`, `TextDefaults`, `Header`, `ElementRule`, `RelationRule`, `Slot`, `AttributeBinding`, `Insert`, `Template`, `RegistrationSettings`, `Registration`, `Fixture`, `Splice` (operation one of the eleven names), with DISL's `Doc`, `LocalizedText`, `Expression` and `TypeRef` referenced from `disl.schema.json`; *IdBinding* left open for DISL 0.2
- [x] T006 Extend `.github/scripts/validate-examples.py` per contracts/validator.md: `*.fbl` against `$defs/Document`; `specifications/fbl/**/*.adp` parsed from the line form into `$defs/Registration`; `fixtures/*/fixture.json` against `$defs/Fixture` plus the splice consistency check (byte offsets, forward and inverse)

**Checkpoint**: an empty-but-valid FBL document validates, and a hand-made fixture passes and fails as it should.

## Phase 3: User Story 1 - a tool runs from a binding (P1) 🎯 MVP

**Goal**: a declared binding reads a foreign file into the model and writes edits back by splices, byte-preserving.
**Independent test**: the timeline and databricks-job fixtures pass; their bindings validate.

- [x] T007 [US1] Write FBL §2 foundations (document, bindings, references `<uri>#<name>`, CEL contexts `entry`, `path`, the RE2-common regular expression subset with `(?<name>…)`) and §3 the binding (claims summary, body, reader, rules, direct-mapping principle R5) in `specifications/fbl/FBL-specification.md`
- [x] T008 [US1] Write FBL §4 the five families and their lossless readings (yaml, json, xml, lines, blocks: nodes, spans, trivia ownership, entry spans with their comments, selectors) in `specifications/fbl/FBL-specification.md`
- [x] T009 [US1] Write FBL §5 rules (ElementRule, RelationRule, Slot, AttributeBinding with `empty`, `number`, `time`, `style`, `reference`, `map`; containment by nearest enclosing rule; ids through DISL 0.2's id strategies) in `specifications/fbl/FBL-specification.md`
- [x] T010 [US1] Write FBL §6 writing: the eleven splice operations with their inverses, new-text inference (indentation, line endings, YAML scalar style and the plain-safe rule, numbers, kept time precision, JSON separators), one gesture one edit, determinism across hosts, in `specifications/fbl/FBL-specification.md`
- [x] T011 [P] [US1] Write `specifications/fbl/timeline.fbl` (yaml, `.tml`, header `timeline: 1`, Moment/Period by `has(entry.end)`, connections created on demand, `time: keep-precision`, template `timeline: 1\r\nelements: []\r\n`)
- [x] T012 [P] [US1] Write `specifications/fbl/databricks-job.fbl` (yaml, shared `.yml`, `registrationOnly`, `resource:` selects `resources.jobs.<key>`, tasks after last task, `depends_on` created and removed on demand, rename rewrites `task_key` references, snapshot undo)
- [x] T013 [P] [US1] Write `specifications/fbl/databricks-pipeline.fbl` (json with yaml also read, libraries array, comma surgery, key insertion refused in JSON)
- [x] T014 [P] [US1] Write `specifications/fbl/mindmap.fbl` (xml, `.mm`, recursive `node` containment, `TEXT`, notes child, `self-close`, template)
- [x] T015 [P] [US1] Write `specifications/fbl/causal-loop-diagram.fbl` (lines, `.cld`, variable/link/loop rules with `emit`, references rewritten on rename, cascade)
- [x] T016 [P] [US1] Write `specifications/fbl/structurizr.fbl` (blocks, `.dsl`, element declarations with `opens`, relationships `->` with unstable ids, `open-block`, views appended before `views` closes)
- [x] T017 [US1] Write fixtures in `specifications/fbl/fixtures/` covering `replace-value`, `insert-key`, `remove-key`, `insert-entry`, `remove-entry`, `ensure-container`, `remove-container`, `rewrite-reference`, `re-emit-line`, `open-block`, `self-close`, including a no-edit save, CRLF, a byte-order mark and a missing final newline

**Checkpoint**: MVP; the validator passes every example and fixture.

## Phase 4: User Story 2 - exact undo, tolerant reading (P1)

- [x] T018 [US2] Write FBL §7 history and reading problems: edits, undo and redo by inverse splices or snapshot, whole-document drift refusal and reload, external change clears history, tolerant reading, the unreadable body (empty, read-only, one finding), unbound content preserved, findings `fbl.*` with DISL 0.2's source location, in `specifications/fbl/FBL-specification.md`
- [x] T019 [P] [US2] Add undo steps to the fixtures of T017 in `specifications/fbl/fixtures/*/fixture.json`, and one fixture with an unreadable entry whose `read` expectation lists the finding

## Phase 5: User Story 3 - registration and view sidecar (P2)

- [x] T020 [US3] Write FBL §8 the registration: line form, origin, `body`, `view`, `resource`, declared headers, `layout:` block and its write rules, stale and unstable ids, creation on first drag, legacy `{base}.layout.json` and `{name}.identities.json`, in `specifications/fbl/FBL-specification.md`
- [x] T021 [P] [US3] Write registration examples `specifications/fbl/registrations/*.adp` (timeline, databricks job with `resource:`, C4 container with `view:`, SKOS with `language:`) and a fixture for the layout block (first drag creates `layout:`, undo removes it)

## Phase 6: User Story 4 - one model, several readings (P2)

- [x] T022 [US4] Write FBL §9 several readings: open body keyed by canonical path and binding, one history, edits visible in all readings, one binding per body, per-reading view data, in `specifications/fbl/FBL-specification.md`
- [x] T023 [P] [US4] Write `specifications/fbl/w3c-turtle.fbl` (plugin reader `net.etalii.adp.w3c.turtle`, `.ttl` claimed by RDF, `.nt`, OWL/SHACL/SKOS markers as `suggest`, SKOS `language` header, templates)

## Phase 7: User Story 5 - folder subjects (P3)

- [x] T024 [US5] Write FBL §10 folder subjects: recognition, file rules, ignore, links not followed, watching with settle, diffing into readings, read-only by default, in `specifications/fbl/FBL-specification.md`
- [x] T025 [P] [US5] Write `specifications/fbl/helm-chart.fbl` (folder recognised by `Chart.yaml`, plugin reader, read-only, settle 400)

## Phase 8: User Story 6 - plugin contract (P3)

- [x] T026 [US6] Write FBL §11 persistence plugins from contracts/plugin-contract.md (read, plan, template, watch; host obligations; plugin obligations; formats expected to stay plugins) in `specifications/fbl/FBL-specification.md`

## Phase 9: User Story 7 - routing and templates (P3)

- [x] T027 [US7] Write FBL §12 routing (claims, shared extensions, markers, suggestions, registration-only, two claimants) and §13 templates (bytes, parameters, the first save) in `specifications/fbl/FBL-specification.md`

## Phase 10: Polish

- [x] T028 Apply the DISL hook per contracts/disl-hook.md in `specifications/disl/DISL-specification.md` and `specifications/disl/disl.schema.json`
- [x] T029 Write FBL §14 processing model and §15 conformance, §16 security (no code execution, links, sizes), and informative §17 today's definitions (from inventory.md, with the `persistence` object the timeline would have) and Appendix A (the schema) in `specifications/fbl/FBL-specification.md`
- [x] T030 Run `python .github/scripts/validate-examples.py` and the quickstart checks; fix what fails
- [x] T031 Mark the tasks done, record completion with the companion, push `features/005-format-binding` and open the pull request into `develop`

## Dependencies

Setup → Foundational (T004–T006) → US1 → US2 (reuses US1 fixtures) → US3, US4, US5, US6, US7 in any order → Polish. Within US1, T011–T016 run in parallel after T007–T010; T017 after T011–T016.

## Implementation strategy

MVP is US1 with US2 (the P1 pair): a declared binding with exact undo. The P2 and P3 stories add sections and one example each. The DISL hook comes last so the parallel DISL 0.2 feature has settled §11 as far as possible.
