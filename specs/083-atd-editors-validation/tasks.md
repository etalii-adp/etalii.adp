# Tasks: Validating the Editors' Descriptions

**Input**: [plan.md](plan.md), [spec.md](spec.md)

**Tests**: written first and seen to fail, as the desktop's principles require.

## Format: `- [ ] **T###** [P?] [US#] Description · path`

- Every path starts with its repository; the clones sit side by side.

> **Ticking**: when the desktop pull request merges.

> **Merging**: every pull request turns on auto-merge with a merge commit when it is opened.

---

## Phase 1: Setup

- [ ] **T001** Cut `features/083-atd-editors-validation` from `origin/develop` in the desktop; note `atd validate`'s result for each editor description ("no runtime") as the baseline · etalii.adp.ide.desktop

## Phase 2: The extension point

- [ ] **T002** [US2] Test first, then add `CheckSource` to the capability registry: a source by name, given the document's text, the `check with` settings and the case's files, giving findings with severity, line, column and message · etalii.adp.ide.desktop/crates/adp-atd-runtime/src/capabilities/check_source.rs
- [ ] **T003** [US1] "An editor's": one article helper for every kind's message · etalii.adp.ide.desktop/crates/adp-atd-validate/src/cases.rs

## Phase 3: User Story 1, the runner (P1)

- [ ] **T004** [US1] Test first on `plain-text.atd`'s two cases, then write the editor runner: open with `open`'s settings (refusing above `largestBytes`, binary, other encodings), read the outline, run the checks, compare refusal, outline and findings · etalii.adp.ide.desktop/crates/adp-atd-validate/src/editor.rs
- [ ] **T005** [US1] `cases.rs` hands an editor's cases to the runner; `--json` reports them as a diagram's · etalii.adp.ide.desktop/crates/adp-atd-validate/src/cases.rs, lib.rs

## Phase 4: User Story 2, the sources (P1)

- [ ] **T006** [P] [US2] The JSON module contributes `json` and `schema`, the schema read from the case's files only · etalii.adp.ide.desktop/modules/editors/json/src/capabilities.rs
- [ ] **T007** [P] [US2] The XML module contributes `xml`, `encoding`, `xsd` and `dtd` (`when: noXsd`) · etalii.adp.ide.desktop/modules/editors/xml/src/capabilities.rs
- [ ] **T008** [P] [US2] The YAML module contributes `yaml`, each document checked in order · etalii.adp.ide.desktop/modules/editors/yaml/src/capabilities.rs
- [ ] **T009** [US2] `adp_shell::capabilities()` assembles them; a missing source is reported once per case (ATD §13.4) · etalii.adp.ide.desktop/crates/adp-shell/src/lib.rs

## Phase 5: User Story 3, the outline (P2)

- [ ] **T010** [US3] The Markdown editor's outline through `reader.markdown`; test on `guide-md` · etalii.adp.ide.desktop/crates/adp-atd-validate/src/editor.rs

## Phase 6: Polish

- [ ] **T011** A test per editor holding its cases to what is listed, each listed difference with its reason, the list held both ways · etalii.adp.ide.desktop/crates/adp-shell/tests/editors.rs
- [ ] **T012** The WebAssembly `atd/validate` gives the same results (SC-003); what libxml2 keeps out of it is listed by name · etalii.adp.ide.desktop/crates/adp-atd-lsp
- [ ] **T013** Show that validating an editor case opens no file and writes none (SC-004) · etalii.adp.ide.desktop/crates/adp-atd-validate/tests/
- [ ] **T014** Run fmt, clippy, the tests, `atd record --check`; open the pull request naming this folder and the etalii.adp commit; turn on auto-merge · etalii.adp.ide.desktop
- [ ] **T015** Tick T001 to T014 once T014's pull request merges · etalii.adp/specs/083-atd-editors-validation/tasks.md
