# Tasks: Reading Through Declared Bindings on the Desktop

**Input**: [desktop-fbl-bindings.spec.md](desktop-fbl-bindings.spec.md), [plan.md](plan.md), [research.md](research.md)

**Approved**: the plan's generation by Peter on 2026-10-30 (a 👍 on the card asking for it).

Every path carries its repository as prefix. Tasks are ticked in etalii.adp once their pull request has merged, batched into one tick pull request.

**Checks**: before every desktop pull request, `cargo fmt --all --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test --workspace` and `python tools/sync-etalii-adp.py --check`. A failure stops the pull request.

**Format**: `- [ ] T### [P] [US#] description with file path`. `[P]`: parallel with the other `[P]` tasks of its phase.

---

## Phase 1: Setup

- [x] T001 Replay a fixture's splices per file with `expectFiles`, undo and redo included, in place of skipping it · etalii.adp.ide.desktop/crates/adp-conformance/tests/fixtures.rs
- [x] T002 Move `grammar-comment-start` off the not-supported list, which already passes (R2) · etalii.adp.ide.desktop/crates/adp-conformance/tests/standalone.rs

---

## Phase 2: User Story 1, FBL on the desktop (Priority: P1)

**Goal**: FR-001, FR-002, SC-001. **Independent test**: `NOT_SUPPORTED` holds only the 5 names that predate spec 066. In every task, a fixture leaves the list in the same pull request that makes it pass.

### The grammar constructs, marked FBL 0.11 in FBL (pull request A, [#133](https://github.com/etalii-adp/etalii.adp.ide.desktop/pull/133))

- [x] T003 [US1] Comments in the grammar family: owned, kept out of values, surviving every splice (`structurizr-comments`, `-block-comments`, `-trailing-comments`, `-rename`) · etalii.adp.ide.desktop/crates/adp-fbl/src/grammar/
- [x] T004 [US1] Escapes inside a quoted value, read and written (`structurizr-escapes`) · etalii.adp.ide.desktop/crates/adp-fbl/src/grammar/
- [x] T005 [US1] Reading in part inside blocks, with `recover.nested` and `recover.unclosed` and their findings (`structurizr-recover-edges`, `-recover-nested`) · etalii.adp.ide.desktop/crates/adp-fbl/src/grammar/
- [x] T006 [US1] A value written where its node is absent, and removed (`structurizr-absent-arguments`, `grammar-remove-part`) · etalii.adp.ide.desktop/crates/adp-fbl/src/families/grammar.rs
- [x] T007 [US1] A block written around a first child (`structurizr-open-block`, `structurizr-add-view`) · etalii.adp.ide.desktop/crates/adp-fbl/src/families/grammar.rs
- [x] T008 [US1] Views of a grammar binding, and a read-only value gathered from several places (`structurizr-view-statements`, `-view-without-key`, `-gathered-tags`) · etalii.adp.ide.desktop/crates/adp-fbl/src/
- [x] T009 [US1] The legacy layout, as a registration change (R4) (`structurizr-legacy-layout`) · etalii.adp.ide.desktop/crates/adp-fbl/src/registration/

### One binding, several readings, marked FBL 0.10 in FBL (pull request B, [#134](https://github.com/etalii-adp/etalii.adp.ide.desktop/pull/134))

- [x] T010 [US1] A rule's `origins` and `resource` by origin: one binding, several readings (`databricks-readings`, `-resources`, `-secondary`, `-rename-shared`) · etalii.adp.ide.desktop/crates/adp-fbl/src/rules/
- [x] T011 [US1] Inserts into YAML flow sequences, and their refusals (`databricks-flow-empty`, `-flow-one-line`, `-refusals`) · etalii.adp.ide.desktop/crates/adp-fbl/src/families/yaml/
- [x] T012 [US1] Nested mappings, a secondary slot, a lowercased key and a template's key (`databricks-library-add`, `-template-key`) · etalii.adp.ide.desktop/crates/adp-fbl/src/

### FBL 0.12 (pull request C, [#135](https://github.com/etalii-adp/etalii.adp.ide.desktop/pull/135))

- [x] T013 [US1] The Wardley grammar's reading: annotations, comments, pipelines, trailers, brace endings (`wardley-annotation-positions`, `-comments`, `-pipelines`, `-trailer`, `-brace-ending`, `-unclosed-pipeline`) · etalii.adp.ide.desktop/crates/adp-fbl/src/grammar/
- [x] T014 [US1] Identities: the legacy file, kinds, repeated keys, and a key that follows a rename in one edit with the body (`wardley-duplicate-names`, `-legacy-identities`, `-rename-identity`, `-strategy-identities`) · etalii.adp.ide.desktop/crates/adp-fbl/src/registration/

### FBL 0.13 and later (T015 in pull request C; pull request D)

- [x] T015 [US1] Several items in one argument (`grammar-split-slot`, `structurizr-split-tags`) · etalii.adp.ide.desktop/crates/adp-fbl/src/grammar/
- [x] T016 [US1] FBL 0.14's new mapping key when spec 066's pull request E has merged, with its fixtures vendored · etalii.adp.ide.desktop/crates/adp-fbl/src/families/yaml/
- [ ] T017 [US1] Run the desktop's standalone parity and confirm the same bytes on every fixture above (FR-001, SC-005) · etalii.adp.ide.desktop/crates/adp-conformance/tests/. Open: on 2026-10-31 the desktop matches the fixtures' bytes, but the standalone host vendors only 24 of them, so this waits on its spec 068 to 072.

**Checkpoint**: SC-001 holds.

---

## Phase 3: User Story 3, recorded gestures (Priority: P2)

**Goal**: FR-005 to FR-007, FR-011, SC-004. It comes before story 2 because story 2's cases need it. **Independent test**: no step carries a module's target string, and `atd record --check` passes.

- [x] T018 [US3] Record `new:x,y` targets as `create` steps, the type from the action's toolbox entry (R7) · etalii.adp.ide.desktop/crates/adp-atd-cli/src/record/mod.rs
- [x] T019 [US3] Record `rel:a->b` and `rel:a->new:x,y` as `connect` steps (R7) · etalii.adp.ide.desktop/crates/adp-atd-cli/src/record/mod.rs
- [x] T020 [US3] Record element targets and prefixed targets as `select`, naming what cannot be translated (FR-007) · etalii.adp.ide.desktop/crates/adp-atd-cli/src/record/mod.rs
- [x] T021 [US3] Replay `create`, `connect` and `delete` steps, reference host and runtime alike · etalii.adp.ide.desktop/crates/adp-atd-validate/src/lib.rs
- [x] T022 [US3] State the host's "not offered" sentences in §2.3 as a closed set (R8, FR-011) · etalii.adp/specifications/atd/ATD-specification.md
- [x] T023 [US3] Treat those sentences as one refusal, comparing every other reason exactly, with a test for each · etalii.adp.ide.desktop/crates/adp-atd-validate/src/lib.rs
- [x] T024 [US3] Record every affected case again; confirm by diff that only steps' gestures and `recordedWith` changed (FR-006) · etalii.adp/definitions/diagrams/conformance/
- [x] T025 [US3] Vendor the cases and update the tests' lists of known differences · etalii.adp.ide.desktop/vendor/etalii.adp/, etalii.adp.ide.desktop/crates/adp-atd-validate/tests/validate.rs

**Checkpoint**: SC-004 holds; every description's refused gestures are its own.

---

## Phase 4: User Story 2, descriptions on bindings (Priority: P1)

**Goal**: FR-003, FR-004, SC-002. **Independent test**: `atd validate` on the 10 descriptions, with no reader capability required.

- [x] T045 [US2] Open a description's documents with their reading's origin, resource and view, and over `OpenDocument` where a registration holds a legacy layout or identities; add section 9.1's one open body shared across registrations if a case needs it, a person's tool unchanged · etalii.adp.ide.desktop/crates/adp-diagram/src/
- [x] T026 [P] [US2] Move `layout.rankedBoundaries` into the capability registry, the C4 module calling it there, registered once its 115 fixtures pass · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/capabilities/, etalii.adp.ide.desktop/modules/diagrams/c4/src/
- [ ] T027 [P] [US2] Move `layout.layeredColumns` and `layout.bands` likewise (14 and 7 fixtures) · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/capabilities/, etalii.adp.ide.desktop/modules/diagrams/databricks/src/
- [x] T028 [US2] Rewrite the six C4 binding parts from `structurizr.fbl`, without the reader capability; a test holds the six equal (R6) · etalii.adp/definitions/diagrams/c4-*.structurizr.atd
- [x] T046 [US2] State FR-012's comparison in ATD §2.3 and §2.4 and the schema; have `atd record` say which cases come from a module that opens its own documents; compare them so in `adp-atd-validate`, a declared tool's cases staying exact; re-record and vendor · etalii.adp/specifications/atd/, etalii.adp.ide.desktop/crates/adp-atd-cli/src/record/, etalii.adp.ide.desktop/crates/adp-atd-validate/src/
- [x] T047 [US2] Implement `diagram.views` with every view's members, a reading keeping each view's statements as data (FR-013) · etalii.adp.ide.desktop/crates/adp-disl/src/, etalii.adp.ide.desktop/crates/adp-fbl/src/
- [x] T048 [US2] Correct `structurizr.fbl` with `place: end` and `empty: keep`, and remove them from the listed differences (FR-014) · etalii.adp/specifications/fbl/structurizr.fbl, etalii.adp.ide.desktop/crates/adp-atd-runtime/tests/tool.rs
- [x] T049 [US2] Drop `origins` from `structurizr.fbl`'s view blocks and state in FBL that `selectedView` also matches the entry of the view shown (FR-015) · etalii.adp/specifications/fbl/
- [x] T050 [US2] Add the written scope and the location to DISL's `View`, and state `c4.unknown-view-scope` and the line of `c4.empty-view` as rules of the C4 descriptions (FR-016) · etalii.adp/specifications/disl/, etalii.adp.ide.desktop/crates/adp-disl/, etalii.adp/definitions/diagrams/c4-*.atd
- [x] T029 [US2] Correct the C4 descriptions until their 115 cases pass, listing any module quirk by name · etalii.adp/definitions/diagrams/c4-*.atd
- [ ] T030 [US2] Rewrite the three Databricks binding parts from `databricks*.fbl`, without the reader capability · etalii.adp/definitions/diagrams/databricks-*.bundle.atd
- [ ] T031 [US2] Correct the Databricks descriptions until their 21 cases pass · etalii.adp/definitions/diagrams/databricks-*.atd
- [ ] T032 [US2] Make the Wardley map description lower, and rewrite its binding part from `wardley-map.fbl` · etalii.adp/definitions/diagrams/wardley-map*.atd
- [ ] T033 [US2] Correct the Wardley map description until its case passes · etalii.adp/definitions/diagrams/wardley-map*.atd
- [ ] T034 [US2] Vendor the descriptions; confirm a person's document still opens on today's tool (FR-010) · etalii.adp.ide.desktop/vendor/etalii.adp/, etalii.adp.ide.desktop/crates/adp-shell/src/shell.rs

**Checkpoint**: SC-002 holds.

---

## Phase 5: User Story 4, Turtle (Priority: P3)

**Goal**: FR-008, FR-009, SC-003. **Independent test**: `atd validate` on the four descriptions with no persistence plugin.

- [ ] T035 [US4] Check which of FR-008's constructs FBL through 0.14 already answers, and record it in research R9 · etalii.adp/specs/067-desktop-fbl-bindings/research.md
- [ ] T036 [US4] Write the FBL minor version for what remains: its text, schema, fixtures and ATD rows · etalii.adp/specifications/fbl/
- [ ] T037 [US4] Finish the Turtle binding on `w3c-turtle.lark`, every fixture of the version passing · etalii.adp/specifications/fbl/w3c-turtle-grammar.fbl
- [ ] T038 [US4] Implement the version on the desktop, its fixtures passing · etalii.adp.ide.desktop/crates/adp-fbl/src/
- [ ] T039 [US4] Bind the four descriptions' Turtle with the grammar family, without the reader capability · etalii.adp/definitions/diagrams/w3c-*.turtle.atd
- [ ] T040 [US4] Register their layouts (`layout.bandedGrid`, `.grid`, `.depthColumns`, `.layeredRegions`) with their fixtures · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/capabilities/
- [ ] T041 [US4] Add Turtle cases with inserts and removals recorded from the desktop's reader, update the trace, and correct the descriptions until their cases pass; this also does spec 035's T149 · etalii.adp/definitions/diagrams/w3c-*

**Checkpoint**: SC-003 holds.

---

## Phase 6: Polish

- [ ] T042 [P] Add the changes to the parity inventory · etalii.adp.ide.desktop/parity/inventory.md
- [ ] T043 [P] Confirm the native and WebAssembly validations agree on every changed description (SC-006) · etalii.adp.ide.desktop/crates/adp-atd-lsp/tests/wasm/validate.mjs
- [ ] T044 Tick spec 035's T125 and T149 where these tasks did them, and record what T121, T131 and T132 still wait on · etalii.adp/specs/035-adp-tool-language/tasks.md

---

## Dependencies

Phase 1, then pull requests A, B, C and D in order. Phase 3 and T026 to T027 are independent of them. T028 to T034 need A to D, T045 and Phase 3. Phase 5 needs Phase 2 and Phase 3.

**MVP**: Phases 1 to 4 for the C4 descriptions (T028, T029), which gives 115 cases on a declared binding.
