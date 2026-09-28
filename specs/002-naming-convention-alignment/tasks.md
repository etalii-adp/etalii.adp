---
description: "Tasks for spec 002, naming convention alignment"
---

# Tasks: Naming Convention Alignment

**Input**: [plan.md](plan.md), [naming-convention-alignment.spec.md](naming-convention-alignment.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: the spec requires proof that everything works as before (FR-012, FR-013, SC-002–SC-006), so each part ends with its verification tasks against the baseline of Phase 1.

**Organization**: phases follow the user stories; every task also names its part from [contracts/parts.md](contracts/parts.md) (`P0`–`P7`), which is the thread and pull request it belongs to. Paths are relative to `C:\git\`.

## Format: `[ID] [P?] [Story] [Part] Description`

- **[P]**: can run in parallel with other [P] tasks of the same phase (different repository or files)
- **[Story]**: US1–US6 from the spec; setup, foundational and final tasks carry none

---

## Phase 1: Setup — baseline (part 0)

**Purpose**: record what "operating as before" means before anything is renamed (research R8).

- [ ] T001 [P0] Record the standalone baseline: exit codes and test counts of `npm test`, `npm run typecheck`, `dotnet format style --verify-no-changes --severity info`, `dotnet test --solution EtAlii.Adp.slnx` on `develop`, into `etalii.adp/specs/002-naming-convention-alignment/baseline/standalone.md`
- [ ] T002 [P] [P0] Record the IntelliJ baseline: `./gradlew build` and `./gradlew integrationTest` counts, and one `adp.xml` settings file with tools turned off and per-tool settings, into `…/baseline/intellij.md` and `…/baseline/adp.xml`
- [ ] T003 [P] [P0] Record the site baseline: `npm run build`, `npm test`, `npm run test:catalogue`, `npm run test:refresh`, `npm run check` counts and the built sitemap URL list, into `…/baseline/site.md` and `…/baseline/sitemap.txt`
- [ ] T004 [P] [P0] Record SHA-256 hashes of every example document, definition and `.adp` registration file in etalii.adp, standalone and IntelliJ into `…/baseline/files.sha256`
- [ ] T005 [P0] Publish `etalii.adp/docs/terminology-check.json` (retired patterns, allowed paths and literals) per [contracts/terminology-check.md](contracts/terminology-check.md), and a runner script beside it
- [ ] T006 [P0] Run the check across all seven repositories and attach the findings per repository to `…/baseline/findings.md`, to size parts 2–6

**Checkpoint**: baseline merged into etalii.adp `develop`; Peter says go for the parallel parts.

---

## Phase 2: Foundational — the site reads both forms (part 1)

**Purpose**: let parts 2–6 rename upstream names in any order without breaking the hourly refresh (research R6). Blocks parts 2, 3 and 5.

- [ ] T007 [P1] Make the catalogue procedure read each host's `docs/tools.md` and fall back to `docs/diagrams.md`, in `etalii.adp.site/scripts/catalogue/` and `procedures/refresh-catalogue.md`
- [ ] T008 [P1] Make the reference procedure read `specifications/disl/` (`DISL-specification.md`, `disl.disl`, `*.difl`) and fall back to `specifications/dedl/`, in `etalii.adp.site/scripts/reference/`
- [ ] T009 [P1] Accept `disl` as a procedure name beside `dedl` in `etalii.adp.site/scripts/refresh/run.mjs` and in `.github/workflows/refresh.yml` (`workflow_dispatch` options and the `source-changed` mapping)
- [ ] T010 [P1] Accept the new Notion column and option names beside the old ones (`Kind`/`Type`, `Standalone`/`Standalone Plugin Implementation`, `IntelliJ`/…, `VS Code`/…, `Eclipse`) in `etalii.adp.site/src/lib/catalogue/notion-api.ts` and `scripts/catalogue/sync-notion.ts`, with tests for both
- [ ] T011 [P1] Prove it: refresh dry-run green against today's upstreams and against local branches carrying the new names; site gates equal to the T003 baseline

**Checkpoint**: part 1 merged; parts 2–6 start in parallel.

---

## Phase 3: User Story 1 — one written vocabulary (P1)

**Goal**: the vocabulary is the stated rule everywhere contributors look. The glossary, Notion page and site page exist already (PR 8, PR 44).

**Independent test**: compare the three glossary copies (quickstart § 7); the constitution and every `CLAUDE.md` point to the glossary.

- [ ] T012 [US1] [P2] Amend `etalii.adp/.specify/memory/constitution.md` through `/speckit-constitution`: "tools: diagrams, designers and editors", DEDL → DISL, `desl` and `edsl`, machine-readable specification naming (`<name>.<name>`), link to `docs/terminology.md`
- [ ] T013 [P] [US1] [P2] Update `etalii.adp/CLAUDE.md` and `README.md` (if present) to the vocabulary, pointing to `docs/terminology.md`
- [ ] T014 [P] [US1] [P3] Update `etalii.adp.ide.standalone/CLAUDE.md` to point to the glossary
- [ ] T015 [P] [US1] [P4] Update `etalii.adp.ide.intellij/CLAUDE.md` and its constitution ("One Framework, Many Designers" → tools) through its `/speckit-constitution`
- [ ] T016 [P] [US1] [P5] Update `etalii.adp.site/CLAUDE.md` ("specialized diagram, designer and text editors", "Adding or refining a designer") and its constitution through `/speckit-constitution`
- [ ] T017 [P] [US1] [P6] Update `etalii.adp.ide.vscode/CLAUDE.md` and `etalii.adp.ide.eclipse/CLAUDE.md` ("ADP tools for …")
- [ ] T018 [US1] [P0] Confirm with Peter what a `.disl` file holds (FR-006b) and update `docs/terminology.md`, the Notion page and `/adp/docs/terminology/` together if the answer differs from the default

---

## Phase 4: User Story 2 — every tool is the right kind, everywhere (P1)

**Goal**: every name follows the classification and the rename map.

**Independent test**: pick any tool and check every place it appears (spec US2); the terminology check finds nothing in the part's repository.

### etalii.adp (part 2)

- [ ] T019 [US2] [P2] Rename `specifications/dedl/` → `specifications/disl/`, `DEDL-specification.md` → `DISL-specification.md`, `dedl.schema.json` → `disl.disl`, examples `*.dedl` → `*.difl`, and every reference to them, in one commit
- [ ] T020 [US2] [P2] Rewrite the DISL document's title, abstract, glossary and prose: "Diagram Specification Language", "author" for "language designer", "diagram" / "runtime" for "diagram editor" / "editor runtime"; fix the `examples/…` paths to where the examples are
- [ ] T021 [US2] [P2] Apply research R3's identifier table in `disl.disl` and the examples (`$id`, media types, version keys, `difl-fragment`), and validate every example against `disl.disl`

### Standalone (part 3)

- [ ] T022 [P] [US2] [P3] Rename cross-kind plumbing to `Tool…` per rename map rule 1: `DiagramPanel`, `DiagramTabsPanel`, `diagramCanvases.ts` / `DiagramCanvasRegistration` / `canvasFor`, editor sessions and discovery shared with editors, `DiagramService.SaveText`, in `src/client/src/shell/` and `src/backend/`
- [ ] T023 [P] [US2] [P3] Rename `docs/diagrams.md` → `docs/tools.md` ("Tool types", Kind column, the two editors listed) and update every link to it
- [ ] T024 [P] [US2] [P3] Replace the product prose in `readme.md`, `docs/architecture.md` and `.spec-workflow/steering/product.md`
- [ ] T025 [US2] [P3] Apply rename map rule 4 to display names, folders and assemblies that disagree (`helm-charts`, `azure-pipeline`, `causal-loop`, `dependency-graph`, `gartner-hypecycle-graph`; descriptive titles; capitalisation)
- [ ] T026 [US2] [P3] Prove it: four gates exit 0 with counts ≥ T001; every file in T004 for standalone round-trips byte-identical

### IntelliJ (part 4)

- [ ] T027 [P] [US2] [P4] Rename classes, methods and ids per the rename map's IntelliJ table in `core/`, `freemind/`, `drawio/`, `testing/`
- [ ] T028 [P] [US2] [P4] Rename user-visible text in `src/main/resources/META-INF/plugin.xml` and the module XML files (description, names, tab, popups, action descriptions, settings page)
- [ ] T029 [P] [US2] [P4] Rename `docs/diagram-designer-guide.md` → `docs/diagram-guide.md`, the README layout text, and open spec texts (completed spec folders stay)
- [ ] T030 [US2] [P4] Prove it: `./gradlew build` and `integrationTest` green with counts ≥ T002

### Site (part 5)

- [ ] T031 [P] [US2] [P5] Move `src/pages/designers/` → `src/pages/tools/`, rename the `designers` collection and the `Designer*` components, set nav labels "Tools" and "DISL reference" in `src/data/sections.ts`
- [ ] T032 [P] [US2] [P5] Move `/adp/dedl/` pages to `/adp/disl/` and serve the schema at `/disl/schema/0.1/disl.disl` as well as at the old address
- [ ] T033 [P] [US2] [P5] Replace the copy (home page, docs index, `README.md`, `src/data/hosts.yaml`, procedures, spec 003 text)

### Small repositories (part 6)

- [ ] T034 [P] [US2] [P6] Update `etalii-adp/.github` `profile/README.md` and ask Peter before changing the repository description (an outward-facing setting)

---

## Phase 5: User Story 3 — everything keeps working as before (P1)

**Goal**: persisted identifiers are renamed, and every old form keeps working.

**Independent test**: quickstart §§ 3–5.

- [ ] T035 [US3] [P2] State in `DISL-specification.md` that a runtime **MUST** accept `.dedl`, the DEDL `$id`, media types and version keys as deprecated aliases in 0.x, and add one example written in the old form that stays valid
- [ ] T036 [US3] [P4] Read `offDesigners`, `designerSettings` and `etalii.adp.freemind.editor` when the new keys are absent and write only `offTools`, `toolSettings`, `etalii.adp.freemind`, in `core/.../AdpSettings.java`, with a test that restores `baseline/adp.xml`
- [ ] T037 [US3] [P5] Redirect every old address (`/designers/…`, `/dedl/…`, the facet redirects) to its new one in `src/data/redirects.ts`, and prove every URL of `baseline/sitemap.txt` serves or redirects
- [ ] T038 [US3] [P3] Confirm no persisted identifier in standalone carries a retired term beyond those the rename map keeps (origins, `editor/<id>`), and record the result in the part's pull request

---

## Phase 6: User Story 4 — designers have a place (P2)

**Goal**: a designer variant beside every diagram and editor variant (research R7).

**Independent test**: list every place with a diagram and an editor variant; each has a designer variant.

- [ ] T039 [P] [US4] [P2] Add `specifications/desl/DESL-specification.md` and `specifications/edsl/EDSL-specification.md` at status *Placeholder*, and `definitions/{diagrams,designers,editors}/README.md`
- [ ] T040 [P] [US4] [P3] Add `src/designers/README.md`, `docs/creating-a-designer-module.md`, and an empty designer family in module discovery and the panel registry
- [ ] T041 [P] [US4] [P5] Offer a kind filter (Diagram, Designer, Editor) on the Tools overview

---

## Phase 7: User Story 5 — Notion and the pipelines (P2)

**Goal**: Notion speaks the vocabulary and the pipelines keep running (research R6).

**Independent test**: quickstart § 6.

- [ ] T042 [US5] [P5] In Notion: rename the database to "Tools", `Type` → `Kind`, the host columns to "Standalone", "IntelliJ", "VS Code", "Eclipse", add `Previous origin`; clean `Name` values that are descriptions, moving the description to `Description`
- [ ] T043 [US5] [P5] Rename `procedures/refresh-dedl.md` → `refresh-disl.md`, "designer catalogue" → "tool catalogue" in procedures, generated pull request bodies and summaries, and `src/content/catalogue/README.md`
- [ ] T044 [US5] [P5] Prove it: catalogue refresh dry-run against the renamed Notion reports no gap; site gates ≥ T003

---

## Phase 8: User Story 6 — it stays consistent (P3)

**Goal**: a pull request that reintroduces a retired use is flagged.

**Independent test**: a test line using a retired term fails the check in each repository.

- [ ] T045 [P] [US6] [P7] Run `docs/terminology-check.json` in the CI workflow of etalii.adp, standalone, IntelliJ, site, vscode and eclipse on pull requests into `develop`
- [ ] T046 [US6] [P7] Seed one retired use per repository on a scratch branch and confirm each check fails and names the file, line and replacement

---

## Phase 9: Final pass (part 7)

- [ ] T047 [P7] Remove the site's fallbacks from part 1 (old catalogue file, `specifications/dedl/`, procedure name `dedl`, old Notion column names); persisted-identifier compatibility of T035–T037 stays
- [ ] T048 [P7] Run the terminology check across all repositories: no finding outside the allowed list (SC-001)
- [ ] T049 [P7] Run quickstart §§ 2–6 on every `develop` together and record the results against the baseline in `…/baseline/final.md` (SC-002–SC-006)
- [ ] T050 [P7] Mark spec 002 complete (`/speckit-companion-mark-complete`) and list any follow-up in the project thread

---

## Dependencies & execution order

- **Phase 1 (P0)** → **Phase 2 (P1)** → phases 3–8 by part, in parallel → **Phase 9 (P7)**.
- Within a part, tasks run top to bottom; its proof task comes last.
- Part 4 (IntelliJ) and part 6 depend only on part 0 and may start alongside part 1.
- US3 tasks sit inside the parts that own the identifiers; a part's pull request carries its US2, US3 and US4 tasks together, so no repository is ever half renamed.

## Parallel threads

```text
Thread "Site reads both forms"   → T007–T011
Thread "etalii.adp: DISL"        → T012, T013, T019–T021, T035, T039
Thread "Standalone"              → T014, T022–T026, T038, T040
Thread "IntelliJ"                → T015, T027–T030, T036
Thread "Site and Notion"         → T016, T031–T033, T037, T041–T044
Thread "Small repositories"      → T017, T034
This thread                      → T001–T006, T018, T045–T050
```

## Implementation strategy

1. MVP: parts 0 and 1, then part 2 (DISL) and part 5 (site and Notion), which carry what visitors see.
2. Parts 3 and 4 (the hosts) in parallel, each merged when its gates equal the baseline.
3. Part 6, then part 7 closes the feature.
