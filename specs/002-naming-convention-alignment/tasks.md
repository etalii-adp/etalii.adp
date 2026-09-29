---
description: "Tasks for spec 002, naming convention alignment"
---

# Tasks: Naming Convention Alignment

**Input**: [plan.md](plan.md), [naming-convention-alignment.spec.md](naming-convention-alignment.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Prerequisites**: the spec as last revised on 2026-09-28 (DISL/DID, DESL/DED, EDSL/EDD, tool engineer, DEDL retired) and this plan approved by Peter.

**Tests**: the spec requires proof that everything works as before (FR-012, FR-013, SC-002–SC-006) and that old identifiers keep being read (FR-011), so each part ends with a proof task against the Phase 1 baseline, and every renamed format identifier gets a legacy fixture (data-model § Legacy fixture). No other tests are generated.

**Organization**: phases follow the user stories. Each task starts with the part from [contracts/parts.md](contracts/parts.md) it belongs to (`Part 0`–`Part 7`), which is the thread and pull request that carries it. Paths are relative to `C:\git\`; `etalii.adp/…/002/` stands for `etalii.adp/specs/002-naming-convention-alignment/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel with the other [P] tasks of the same phase (a different repository, or different files with no dependency on an unfinished task)
- **[Story]**: US1–US6 from the spec; setup, foundational and final tasks carry none

## Shared contract (read before any task)

- Vocabulary: `etalii.adp/docs/terminology.md` (after T008).
- Six languages, one pattern (data-model § Language): `<name>` is the lowercase acronym; folder `specifications/<name>/`, document `<NAME>-specification.md`, schema `<name>.schema.json`, `$id` `https://etalii.net/adp/<name>/schema/<version>/<name>.schema.json`, media type `application/vnd.<name>.<role>+json`, version key `"<name>": "<version>"`, extension `.<name>`.

| Kind | Specification language | Extension | Definition language | Extension |
|---|---|---|---|---|
| Diagram | DISL, Diagram Specification Language | `.disl` | DID, Diagram Definition Language | `.did` |
| Designer | DESL, Designer Specification Language | `.desl` | DED, Designer Definition Language | `.ded` |
| Editor | EDSL, Editor Specification Language | `.edsl` | EDD, Editor Definition Language | `.edd` |

- DEDL is retired and **MUST NOT** be given a new meaning; its old identifiers are read or redirected as DISL or DID (research R4). DIFL, DEFL, EDFL, DIDL, EDDL and `disl.disl` are earlier drafts' terms and appear nowhere.
- Third-party names are never changed, including the W3C's DID (research R8).

---

## Phase 1: Setup — baseline (Part 0)

**Purpose**: record what "operating as before" means before anything is renamed (research R10, data-model § Baseline).

- [x] T001 Part 0: record the standalone baseline on `develop`: exit codes and test counts of `npm test`, `npm run typecheck`, `dotnet format style --verify-no-changes --severity info` and `dotnet test --solution EtAlii.Adp.slnx` (run from `etalii.adp.ide.standalone/src/backend/` with `MSBUILDDISABLENODEREUSE=1` and `DOTNET_CLI_USE_MSBUILD_SERVER=0`), into `etalii.adp/…/002/baseline/standalone.md`
- [x] T002 [P] Part 0: record the IntelliJ baseline: test counts of `./gradlew build` and `./gradlew integrationTest` in `etalii.adp.ide.intellij/`, and one `adp.xml` saved from a sandbox IDE (`./gradlew runIde`) with at least one tool turned off, one per-tool setting, grid and zoom changed, into `etalii.adp/…/002/baseline/intellij.md` and `etalii.adp/…/002/baseline/adp.xml`
- [x] T003 [P] Part 0: record the site baseline: exit codes and test counts of `npm run build`, `npm test`, `npm run test:catalogue`, `npm run test:refresh` and `npm run check` in `etalii.adp.site/`, and every URL of the built sitemap, into `etalii.adp/…/002/baseline/site.md` and `etalii.adp/…/002/baseline/sitemap.txt`
- [x] T004 [P] Part 0: record the SHA-256 of every example, specification, document and `.adp` registration file in `etalii.adp/specifications/`, `etalii.adp.ide.standalone/src/examples/`, `etalii.adp.ide.standalone/src/fixtures/` and the IntelliJ test resources, into `etalii.adp/…/002/baseline/files.sha256`, and record the result of `python .github/scripts/validate-examples.py` in `etalii.adp/…/002/baseline/etalii.adp.md`
- [x] T005 Part 0: publish `etalii.adp/docs/terminology-check.json` with every retired pattern, allowed path glob and allowed literal of [contracts/terminology-check.md](contracts/terminology-check.md) ("Words are matched case-insensitively; acronyms are matched case-sensitively"), each pattern carrying its glossary entry and replacement
- [x] T006 Part 0: add the runner `etalii.adp/.github/scripts/terminology-check.py` that reads `docs/terminology-check.json`, scans a repository's current files, prints repository, file, line, matched text, glossary entry and replacement for each finding, and exits 0 when there is none and 1 otherwise
- [x] T007 Part 0: run T006 across all seven repositories (`etalii.adp`, `etalii.adp.ide.standalone`, `etalii.adp.ide.intellij`, `etalii.adp.ide.vscode`, `etalii.adp.ide.eclipse`, `etalii.adp.site`, a fresh clone of `etalii-adp/.github`) and write the findings per repository to `etalii.adp/…/002/baseline/findings.md`, to size parts 2–6

**Checkpoint**: the baseline is recorded; nothing is renamed yet.

---

## Phase 2: Foundational — the corrected vocabulary, and the site reads both forms (Parts 0 and 1)

**Purpose**: the shared contract every part reads (research R7), and a site that keeps refreshing whichever upstream renames first (research R6). ⚠️ Parts 2–6 start only when this phase has merged.

### The vocabulary in three places (Part 0; delivers the core of US1)

- [x] T008 Part 0: correct `etalii.adp/docs/terminology.md` to the revised spec: tool as umbrella; diagram, designer and editor each with its test (relations between elements; a form-based layout without relations; text as the core interaction); tool engineer (replacing "author" and "language designer"); the six-language table above; what a specification file (`.disl`, `.desl`, `.edsl`) and a definition file (`.did`, `.ded`, `.edd`) hold (FR-006b); type, document, module, host, canvas; every retired use with its replacement (DEDL, DIFL/DEFL/EDFL, DIDL/EDDL, "designer" as umbrella, "diagram editor", "editor runtime"); every allowed exception with its reason; one line recording that DEDL became DISL and DID; ADP's DID written with its full name on first use
- [x] T009 [P] Part 0: copy the corrected glossary to the Notion "ADP terminology" page, stating the same definitions and linking to `etalii.adp/docs/terminology.md` as its source
- [x] T010 [P] Part 0: copy the corrected glossary to `etalii.adp.site/src/content/docs/docs/terminology.mdx` (`/adp/docs/terminology/`), linking to `etalii.adp/docs/terminology.md` as its source, in a site pull request of its own
- [x] T011 Part 0: compare `docs/terminology.md`, the Notion page and `/adp/docs/terminology/` (quickstart § 7): same definitions, none names DIFL, DEFL, EDFL, DIDL, EDDL or DEDL as a current language or an "author" of a definition; get Peter's go for the parallel parts

### The site reads both forms (Part 1)

- [ ] T012 Part 1: make the catalogue procedure read each host's `docs/tools.md` and fall back to `docs/diagrams.md`, in `etalii.adp.site/src/lib/catalogue/sources.ts` (and wherever `scripts/catalogue/` names the file) and `etalii.adp.site/procedures/refresh-catalogue.md`, with a test for each form
- [ ] T013 Part 1: add `disl` and `did` entries to `etalii.adp.site/src/content/reference/languages.json` (`path` `specifications/disl` / `specifications/did`, `prose` `DISL-specification.md` / `DID-specification.md`, `schema` `disl.schema.json` / `did.schema.json`, `schemaAddress` `/disl/schema/{version}/{schema}` / `/did/schema/{version}/{schema}`) and make `etalii.adp.site/scripts/reference/refresh.ts` use them when `specifications/disl/` exists upstream and fall back to the `dedl` entry while it is absent
- [ ] T014 Part 1: add refresh fixtures for the new layout (`etalii.adp.site/scripts/refresh/fixtures/etalii.adp/specifications/disl/` and `…/did/` with `erd.disl` and `timeline.did`) beside the existing `…/dedl/` fixture, so `npm run test:refresh` covers both forms
- [ ] T015 Part 1: accept `disl` as a procedure name beside `dedl` in `etalii.adp.site/scripts/refresh/run.mjs`, `scripts/refresh/decide.mjs` and `.github/workflows/refresh.yml` (`workflow_dispatch` options and the `source-changed` mapping, which must also fire on `specifications/disl/**` and `specifications/did/**`), with tests in `run.test.mjs` and `decide.test.mjs`
- [ ] T016 Part 1: accept the new Notion names beside the old ones (`Kind`/`Type`; `Standalone`/`Standalone Plugin Implementation`; `IntelliJ`/`IntelliJ Plugin Implementation`; `VS Code`/`VS Code Plugin Implementation`; `Eclipse`) in `etalii.adp.site/src/lib/catalogue/notion-api.ts`, `scripts/catalogue/notion.ts` and `scripts/catalogue/sync-notion.ts`, with tests for both sets
- [ ] T017 Part 1: prove it: refresh dry-run green against today's upstreams and against local branches carrying `docs/tools.md` and `specifications/disl/` + `specifications/did/`; site gates exit 0 with counts ≥ T003

**Checkpoint**: parts 0 and 1 merged; parts 2–6 start in parallel threads.

---

## Phase 3: User Story 1 — one written vocabulary (Priority: P1) 🎯 MVP

**Goal**: the corrected vocabulary (T008–T011) is the stated rule everywhere contributors and visitors look, and the site explains specification and definition on a page of its own (research R7).

**Independent test**: quickstart § 7 and the table half of § 8: the three glossary copies agree; the constitution and every `CLAUDE.md` point to the glossary; the "Specification & Definition" page shows the six-language table identical to the glossary's.

- [ ] T018 [US1] Part 2: amend `etalii.adp/.specify/memory/constitution.md` through `/speckit-constitution` (FR-004): preamble "a family of task-focused tools: diagrams, designers and editors", "ADP tools", "a tool is built from", readers "tool engineers, who write specifications and definitions"; Structure and Naming model `disl` (`specifications/disl/`, `DISL-specification.md`, `disl.schema.json`, `.disl`) with the six languages following it; principle II "runtime" for "editor runtime"; principle V "a current tool's need"; a link to `docs/terminology.md`; MINOR version bump with its Sync Impact Report
- [ ] T019 [P] [US1] Part 2: update `etalii.adp/CLAUDE.md` and `etalii.adp/README.md` to the vocabulary: "DEDL, the Diagram Editor Definition Language, under `specifications/dedl/`" becomes the six languages under `specifications/`, "ADP designers" becomes "ADP tools", and both point to `docs/terminology.md`
- [ ] T020 [P] [US1] Part 3: update `etalii.adp.ide.standalone/CLAUDE.md` to the vocabulary and point it to `etalii.adp/docs/terminology.md`
- [ ] T021 [P] [US1] Part 4: update `etalii.adp.ide.intellij/CLAUDE.md` and amend its constitution ("One Framework, Many Designers" → tools) through its own `/speckit-constitution`, pointing to the glossary
- [ ] T022 [P] [US1] Part 5: update `etalii.adp.site/CLAUDE.md` ("specialized diagram, designer and text editors", "Adding or refining a designer") and amend its constitution through its own `/speckit-constitution`, pointing to the glossary
- [ ] T023 [P] [US1] Part 6: update `etalii.adp.ide.vscode/CLAUDE.md` and `etalii.adp.ide.eclipse/CLAUDE.md` ("ADP designers for …" → "ADP tools for …"), pointing to the glossary
- [ ] T024 [US1] Part 5: add the "Specification & Definition" page `etalii.adp.site/src/content/docs/docs/specification-and-definition.mdx` beside the terminology page: introduce tool, kind, type, tool engineer, specification language and definition language; show the table with the columns Kind, Specification language, Extension, Definition language, Extension copied from `docs/terminology.md`; link DISL to `/adp/disl/` and DID to `/adp/did/`, mark DESL, DED, EDSL and EDD as "content to come" with no link; link to `etalii.adp/docs/terminology.md` as the source; list it in `src/data/sections.ts`
- [ ] T025 [US1] Part 5: extend the site's page checks (`npm run check`) to compare the table on the "Specification & Definition" page and on the terminology page with the table in `etalii.adp/docs/terminology.md`, failing on any difference

**Checkpoint**: US1 is testable on its own: quickstart § 7 passes and the page shows the table.

---

## Phase 4: User Story 2 — every tool is the right kind, everywhere (Priority: P1)

**Goal**: every name follows [classification.md](contracts/classification.md) and [rename-map.md](contracts/rename-map.md); DEDL is split into DISL and DID (research R3).

**Independent test**: pick any tool and check every place it appears (spec US2); `terminology-check.py` finds nothing in the part's repository outside the allowed list.

### etalii.adp (Part 2)

- [ ] T026 [US2] Part 2: create `etalii.adp/specifications/disl/` and `etalii.adp/specifications/did/` with `git mv` so history follows: `specifications/dedl/DEDL-specification.md` → `specifications/disl/DISL-specification.md`, `dedl.schema.json` → `specifications/disl/disl.schema.json`, `erd.dedl`, `statemachine.dedl`, `timeline.dedl` → `specifications/disl/erd.disl`, `statemachine.disl`, `timeline.disl`, `timeline.document.json` → `specifications/did/timeline.did`; then remove `specifications/dedl/`
- [ ] T027 [US2] Part 2: split the DISL document by research R3's rule into `specifications/disl/DISL-specification.md` (what a tool engineer writes about a diagram type, including the persistence settings a type declares: formats, embedding, migrations) and a new `specifications/did/DID-specification.md` (the stored diagram: logical structure, identifiers, view data, canonical form, fragments, from today's section 11 "Layer 8 — Persistence"); DISL's persistence layer refers to DID for the structure it configures; each document states *0.1, Working Draft* at the top
- [ ] T028 [US2] Part 2: rewrite the terms in both documents per the rename map: title "DISL — Diagram Specification Language" / "DID — Diagram Definition Language" (DID written in full on first use); "definition" (of a language) → "specification" (of a diagram type); "document" as a stored file → DID "definition", keeping "document" for the content a user works on; "language designer(s)" and "author(s)" → "tool engineer(s)"; "diagram editor" → "diagram"; "editor runtime" → "runtime"; every `examples/…` path → where the examples now are
- [ ] T029 [US2] Part 2: split the schema: `specifications/disl/disl.schema.json` keeps `$defs/Definition` renamed `$defs/Specification` as root, `$id` `https://etalii.net/adp/disl/schema/0.1/disl.schema.json`; new `specifications/did/did.schema.json` takes `$defs/Document` renamed `$defs/Definition` as root, `$id` `https://etalii.net/adp/did/schema/0.1/did.schema.json`, and references DISL's shared primitives (`QualifiedId`, `SemVer`) by absolute `$id` instead of copying them
- [ ] T030 [US2] Part 2: apply research R3's identifier table in both schemas, both documents and every example: media types `application/vnd.disl.specification+json`, `application/vnd.did.definition+json`, `application/vnd.did.fragment+json`; version keys `"disl": "0.1"` and `"did": "0.1"`; export format `did-fragment`; DID's `language` reference (id, version, optional URI) pointing at the `.disl` file
- [ ] T031 [US2] Part 2: make `etalii.adp/.github/scripts/validate-examples.py` pick up `*.disl` (against `disl.schema.json` `$defs/Specification`) and `*.did` (against `did.schema.json` `$defs/Definition`), load every `*.schema.json` into one registry so DID's references to DISL resolve, and keep `.github/workflows/build.yml` running it; every example validates
- [ ] T032 [US2] Part 2: migrate every other file in etalii.adp whose content follows an ADP specification to the new identifiers (Peter: "if file content has the wrong naming and is based on one of our own specifications then the naming convention needs to be applied"), and list every migrated file with its old and new SHA-256 in the part's pull request (research R10)

### Standalone (Part 3)

- [ ] T033 [P] [US2] Part 3: rename cross-kind plumbing to `Tool…` per rename map rule 1: `DiagramPanel` → `ToolPanel`, `DiagramTabsPanel` → `ToolTabsPanel`, `diagramCanvases.ts` / `DiagramCanvasRegistration` / `canvasFor` → `toolPanels.ts` / `ToolPanelRegistration` / `panelFor`, editor sessions and discovery shared with editors, `DiagramService.SaveText` → a text-save call on a tool-level or editor service, in `etalii.adp.ide.standalone/src/client/src/shell/` and `etalii.adp.ide.standalone/src/backend/`; diagram-only code stays (rule 2)
- [ ] T034 [P] [US2] Part 3: rename `etalii.adp.ide.standalone/docs/diagrams.md` → `docs/tools.md` titled "Tool types", with a Kind column, listing the diagrams and the two editors (Markdown editor `editor/markdown`, Plain text editor `editor/plain`), and update every link to it
- [ ] T035 [P] [US2] Part 3: replace "specialized diagram, designer and editor experiences" with "specialized tools: diagrams, designers and editors" in `etalii.adp.ide.standalone/readme.md`, `docs/architecture.md` and `.spec-workflow/steering/product.md`, and any DEDL reference with DISL or DID
- [ ] T036 [US2] Part 3: apply rename map rule 4 in `etalii.adp.ide.standalone/src/diagrams/`: one display name per tool type (a name, not a description; "Wardley map" capitalisation), and one kebab-case folder per tool type for `helm-charts`, `azure-pipeline`, `causal-loop`, `dependency-graph`, `gartner-hypecycle-graph`, with module assembly names following; origins stay (rule 7)
- [ ] T037 [US2] Part 3: prove it: the four gates exit 0 with counts ≥ T001; every standalone file of T004 round-trips byte-identical; `terminology-check.py` finds nothing outside the allowed list

### IntelliJ (Part 4)

- [ ] T038 [P] [US2] Part 4: rename classes, methods and in-memory ids per the rename map's IntelliJ table in `etalii.adp.ide.intellij/core/`, `freemind/`, `drawio/` and `testing/`: `AdpDesignerEditor` → `AdpToolFileEditor`; `DiagramDesigner`, `MindMapDesigner` → `DiagramFileEditor`, `MindMapFileEditor`; `createDesigner()`, `editorName()`, `designerInfo()` → `createTool()`, `toolName()`, `toolInfo()`; `DesignerInfo`, `DesignerOrigin`, `DesignersSection`, `DesignerState`, `DesignerPanel`, `DesignerDriver` → `ToolInfo`, `ToolOrigin`, `ToolsSection`, `ToolState`, `ToolPanel`, `ToolDriver`; `AdpDataKeys.ADP_DESIGNER` / `"etalii.adp.designer"` → `ADP_TOOL` / `"etalii.adp.tool"`; "Mind map" spelled one way, `MindMap` in code, format classes stay `FreeMind…` (rule 5); platform API names stay
- [ ] T039 [P] [US2] Part 4: rename user-visible text in `etalii.adp.ide.intellij/src/main/resources/META-INF/plugin.xml` and the module XML files: description "specialized tools: diagrams, designers and editors", "Each tool opens in an editor on the file's own text", "two diagrams"; "draw.io Designer" → "draw.io diagram"; tab "Designer" → the tool's display name; popup `etalii.adp.freemind.DesignerPopup` → `etalii.adp.freemind.MindMapPopup`; settings page "Designers" → "Tools"; "…of the designer" → "…of the diagram"
- [ ] T040 [P] [US2] Part 4: rename `etalii.adp.ide.intellij/docs/diagram-designer-guide.md` → `docs/diagram-guide.md` ("Building a diagram"), "designer framework" → "tool framework", "diagram designer framework" → "diagram framework" in `README.md` and `docs/`, and update open spec texts under `specs/` (completed spec folders stay, FR-014)
- [ ] T041 [US2] Part 4: prove it: `./gradlew build` and `./gradlew integrationTest` green with counts ≥ T002; `terminology-check.py` finds nothing outside the allowed list

### Site (Part 5)

- [ ] T042 [P] [US2] Part 5: move `etalii.adp.site/src/pages/designers/` → `src/pages/tools/`, rename the `designers` collection to `tools` in `src/content.config.ts`, and `src/components/catalogue/DesignerCard.astro`, `DesignerList.astro`, `DesignerPage.astro`, `RetiredDesigner.astro` → `ToolCard.astro`, `ToolList.astro`, `ToolPage.astro`, `RetiredTool.astro`; nav label "Tools" in `src/data/sections.ts`
- [ ] T043 [P] [US2] Part 5: serve the DISL reference at `/adp/disl/…` ("DISL reference") and the DID reference at `/adp/did/…` ("DID reference") through `src/pages/[language]/` and `src/content/reference/languages.json`; schemas at `/disl/schema/0.1/disl.schema.json` and `/did/schema/0.1/did.schema.json`; nav labels in `src/data/sections.ts`
- [ ] T044 [P] [US2] Part 5: replace the copy in `etalii.adp.site/src/content/docs/index.mdx`, `src/content/docs/docs/index.mdx`, `README.md`, `src/data/hosts.yaml`, `procedures/` and open spec 003 text: "specialized tools: diagrams, designers and editors", "Browse the tools", "its own tool", "opens tools in real editors", "Diagram Specification Language" (or DID where the stored form is meant), "tool engineer"; spec folder names stay (rule 8)
- [ ] T045 [US2] Part 5: set each catalogue entry's kind from [classification.md](contracts/classification.md) (every entry `diagram`, the Markdown and Plain text editors `editor`) in the catalogue data under `etalii.adp.site/src/content/catalogue/`, and show the kind on each tool page

### Small repositories (Part 6)

- [ ] T046 [P] [US2] Part 6: update `profile/README.md` in `etalii-adp/.github` ("specialized diagram and text designers" → "specialized tools: diagrams, designers and editors"), and ask Peter before changing the repository description, an outward-facing setting

**Checkpoint**: US2 is testable per repository as each part merges.

---

## Phase 5: User Story 3 — everything keeps working as before (Priority: P1)

**Goal**: every persisted identifier is renamed, the new form is written, and every old form keeps being read or redirected (FR-011); ADP's own files are migrated once and round-trip from then on (FR-012).

**Independent test**: quickstart §§ 2–5: gates ≥ baseline, documents round-trip, every baseline URL serves or redirects, the baseline settings file is in effect.

- [ ] T047 [US3] Part 2: state in `etalii.adp/specifications/disl/DISL-specification.md` and `specifications/did/DID-specification.md` that a DISL 0.x or DID 0.x runtime **MUST** accept `.dedl`, the old `$id` `https://etalii.net/adp/dedl/schema/0.1/dedl.schema.json`, the old media types, the old version keys (`"dedl"`, `"dedlDocument"`) and `dedl-fragment` as deprecated aliases; in `disl.schema.json` and `did.schema.json` accept exactly one of the new or the old version key, the old one marked `deprecated`
- [ ] T048 [US3] Part 2: add legacy fixtures kept byte-for-byte as DEDL 0.1 wrote them, one per format (`etalii.adp/specifications/disl/legacy/erd.dedl` and `etalii.adp/specifications/did/legacy/timeline.document.json`, each noting the path of its migrated counterpart), and an alias table in `etalii.adp/.github/scripts/validate-examples.py` mapping the old `$id` and version keys to the new schemas; CI validates both fixtures through it
- [ ] T049 [US3] Part 4: in `etalii.adp.ide.intellij/core/src/main/java/etalii/adp/core/settings/AdpSettings.java`, read `offDesigners`, `designerSettings`, configurable ids `etalii.adp.settings.<old id>` and editor type id `etalii.adp.freemind.editor` when the new ones are absent, and write only `offTools`, `toolSettings` and `etalii.adp.freemind`; add a test to `core/src/test/java/etalii/adp/core/settings/AdpSettingsStateRoundTripTest.java` that restores `etalii.adp/…/002/baseline/adp.xml` and checks every setting applies and only new keys are written back; note the one-time fallback to the default editor in the release notes (research R5)
- [ ] T050 [US3] Part 5: redirect every old address permanently in `etalii.adp.site/src/data/redirects.ts`: `/adp/designers/…` → `/adp/tools/…`, every `/adp/dedl/…` → `/adp/disl/…`, and repoint the existing redirects into `/adp/designers/` (retired spec 003 facet pages) straight to `/adp/tools/…` so no chain forms; keep serving DEDL 0.1's combined schema unchanged at `/dedl/schema/0.1/dedl.schema.json`
- [ ] T051 [US3] Part 5: prove it: request every URL of `etalii.adp/…/002/baseline/sitemap.txt` against the built site: each serves the same page or redirects permanently in one hop; the three schema addresses of quickstart § 4 serve their schemas
- [ ] T052 [US3] Part 3: confirm no persisted identifier in standalone carries a retired term beyond those the rename map keeps (origins, `editor/<id>`), grep `etalii.adp.ide.standalone/src/examples/` and `src/fixtures/` for DEDL identifiers and migrate any found, and record the result and every migrated file in the part's pull request

**Checkpoint**: quickstart §§ 3–5 pass for every part merged so far.

---

## Phase 6: User Story 4 — designers have a place next to diagrams and editors (Priority: P2)

**Goal**: a designer variant beside every diagram and editor variant, marked as a placeholder (FR-009, research R9), and the four empty languages as placeholders (FR-006a).

**Independent test**: list every place with a diagram and an editor variant; each has a designer variant; `specifications/` lists `disl`, `did`, `desl`, `ded`, `edsl`, `edd` and no `dedl` (quickstart § 8).

- [ ] T053 [P] [US4] Part 2: add `etalii.adp/specifications/desl/DESL-specification.md`, `specifications/ded/DED-specification.md`, `specifications/edsl/EDSL-specification.md` and `specifications/edd/EDD-specification.md`, each at status *Placeholder*, stating its full name, its kind, its role (specification or definition), its extension (`.desl`, `.ded`, `.edsl`, `.edd`), its paired language, and that its content is to come, with nothing normative
- [ ] T054 [P] [US4] Part 2: add `etalii.adp/definitions/diagrams/README.md`, `definitions/designers/README.md` and `definitions/editors/README.md`, each saying what belongs in the folder (DISL specification files and DID definition files for diagrams; the DESL/DED and EDSL/EDD counterparts), so all three folders are tracked
- [ ] T055 [P] [US4] Part 3: add `etalii.adp.ide.standalone/src/designers/README.md`, `docs/creating-a-designer-module.md` (beside `creating-a-diagram-module.md` and `creating-an-editor-module.md`, stating that no designer exists yet and what the family will share), and an empty designer family in the module discovery in `src/backend/` and the panel registry `src/client/src/shell/toolPanels.ts`
- [ ] T056 [P] [US4] Part 5: offer a kind filter with Diagram, Designer and Editor on the Tools overview `etalii.adp.site/src/pages/tools/index.astro`
- [ ] T057 [P] [US4] Part 4: name the three kinds in the framework docs under `etalii.adp.ide.intellij/docs/` (no designer or editor family exists in IntelliJ, research R9)

**Checkpoint**: every diagram/editor place has its designer placeholder.

---

## Phase 7: User Story 5 — Notion and the pipelines speak the same language (Priority: P2)

**Goal**: Notion carries the vocabulary and the hourly refresh and post-merge sync keep running across the change (FR-010, research R6).

**Independent test**: quickstart § 6: catalogue refresh dry-run against the renamed database reports no missing column and no unclassified row, and its pull request text uses the vocabulary.

- [ ] T058 [US5] Part 5: in the Notion database (after T016 has merged and before the next scheduled refresh): rename "Diagrams" → "Tools"; `Type` → `Kind` with options Diagram, Designer and Editor; host columns → "Standalone", "IntelliJ", "VS Code", "Eclipse"; add `Previous origin` (text); keep the data source id
- [ ] T059 [US5] Part 5: in the Notion "Tools" database, add rows for the Markdown editor (`editor/markdown`) and the Plain text editor (`editor/plain`) with `Kind` Editor and the fields that apply to an editor, set `Kind` Diagram on every other row, and replace `Name` values that are descriptions with display names (rename map rule 4), moving the description to `Description`; page text "a dedicated designer" → "a dedicated tool"
- [ ] T060 [US5] Part 5: rename `etalii.adp.site/procedures/refresh-dedl.md` → `procedures/refresh-disl.md` (covering DISL and DID), procedure name `disl` in `procedures/README.md` and `procedures/refresh-all.md`; "designer catalogue" → "tool catalogue" in `procedures/refresh-catalogue.md`, the generated pull request bodies and summaries in `scripts/refresh/` and `scripts/catalogue/report.ts`, and `src/content/catalogue/README.md`
- [ ] T061 [US5] Part 5: prove it: `npm run refresh -- catalogue` in dry-run against the renamed Notion reports no gap and no unclassified row; the post-merge sync (`etalii.adp.site/.github/workflows/catalogue-sync.yml`) runs green; site gates exit 0 with counts ≥ T003; `terminology-check.py` finds nothing outside the allowed list

**Checkpoint**: Notion and the site agree; the refresh has run at least once on the renamed database.

---

## Phase 8: User Story 6 — it stays consistent (Priority: P3)

**Goal**: a pull request that reintroduces a retired use is flagged (FR-017).

**Independent test**: a scratch line using a retired term fails the check in each repository and names file, line and replacement.

- [ ] T062 [P] [US6] Part 7: run `etalii.adp/.github/scripts/terminology-check.py` against `docs/terminology-check.json` on pull requests into `develop` in the existing CI workflow of each repository: `etalii.adp/.github/workflows/build.yml`, and the build workflows of `etalii.adp.ide.standalone`, `etalii.adp.ide.intellij`, `etalii.adp.site`, `etalii.adp.ide.vscode`, `etalii.adp.ide.eclipse` and `etalii-adp/.github`, each fetching the list from etalii.adp `develop`
- [ ] T063 [US6] Part 7: on a scratch branch per repository, add one retired use (for example a class `…Designer` for a diagram, or `.difl`) and one allowed exception, and confirm the check fails on the first, naming file, line, glossary entry and replacement, and passes the second; delete the scratch branches

---

## Phase 9: Polish — final pass (Part 7)

**Purpose**: prove the whole feature on every `develop` together (FR-016).

- [ ] T064 Part 7: remove the site's part 1 fallbacks: `docs/diagrams.md` in `etalii.adp.site/src/lib/catalogue/sources.ts`, the `dedl` entry's upstream fallback in `scripts/reference/refresh.ts`, the procedure name `dedl` in `scripts/refresh/run.mjs`, `decide.mjs` and `.github/workflows/refresh.yml`, the old Notion column names in `src/lib/catalogue/notion-api.ts`, and the `…/dedl/` refresh fixture; persisted-identifier compatibility (T047–T050) stays
- [ ] T065 Part 7: run `etalii.adp/.github/scripts/terminology-check.py` across all seven repositories: no finding outside the allowed list (SC-001); check the site's served pages and Notion the same way
- [ ] T066 Part 7: run quickstart §§ 2–8 on every `develop` together and record the results against the baseline in `etalii.adp/…/002/baseline/final.md` (SC-002–SC-007), listing every migrated file of T032 and T052 with its migrated hash
- [ ] T067 Part 7: give a contributor new to ADP the glossary and ten sample entries, and record in `etalii.adp/…/002/baseline/final.md` that each is placed in the same kind as [classification.md](contracts/classification.md) (SC-008)
- [ ] T068 Part 7: mark spec 002 complete once Peter approves (`/speckit-companion-mark-complete`) and list any follow-up in the project thread

---

## Dependencies & execution order

- **Phase 1 (Part 0)** → **Phase 2 (Part 0 glossary, then Part 1)** → Phases 3–8 by part, in parallel → **Phase 9 (Part 7)**.
- Within Phase 2, T008 comes first; T009 and T010 copy it; T011 closes Part 0. Part 1 (T012–T017) needs Part 0's baseline and T008's names.
- Part 4 (IntelliJ) and Part 6 read nothing the site depends on and may start once Part 0 has merged, alongside Part 1.
- Parts 2, 3 and 5 start only after Part 1 has merged, because they rename what the site reads (`specifications/dedl/`, `docs/diagrams.md`, Notion columns).
- T058 (Notion rename) runs after T016 has merged and before the next hourly refresh.
- Within a part, tasks run top to bottom; its proof task comes last. A part's pull request carries its US1–US5 tasks together, so no repository is ever half renamed.
- US6 (T062–T063) runs after every part 2–6 has merged, so the check does not fail on work still in flight.

### Story dependencies

- **US1** needs Phase 2; its site page (T024) needs T043's DISL and DID addresses in the same Part 5 pull request.
- **US2** needs Phase 2; independent of US1 apart from the shared glossary.
- **US3** tasks live inside the part that owns each identifier and ship with that part's US2 tasks.
- **US4** needs US2's renames in the same repository (for example `toolPanels.ts` from T033 before T055).
- **US5** needs Part 1 (T016) merged.
- **US6** needs US2–US5 merged in every repository.

## Parallel threads

```text
This thread (Part 0, 7)       → T001–T011, T062–T068
Thread "Site reads both" (1)  → T012–T017
Thread "etalii.adp" (2)       → T018, T019, T026–T032, T047, T048, T053, T054
Thread "Standalone" (3)       → T020, T033–T037, T052, T055
Thread "IntelliJ" (4)         → T021, T038–T041, T049, T057
Thread "Site and Notion" (5)  → T022, T024, T025, T042–T045, T050, T051, T056, T058–T061
Thread "Small repos" (6)      → T023, T046
```

### Parallel examples

- Phase 1: T002, T003 and T004 at once, each in its own repository.
- Phase 2: T009 (Notion) and T010 (site) at once after T008.
- Phase 3: T019–T023 at once, one per repository.
- Phase 4: T033, T034 and T035 at once in standalone; T038, T039 and T040 at once in IntelliJ; T042, T043 and T044 at once in the site; all four parts at once.
- Phase 6: T053–T057 at once, one repository or folder each.

## Implementation strategy

1. **MVP**: Phase 1, Phase 2 and Phase 3 (US1): the baseline, the corrected vocabulary in three places, the site reading both forms, and the "Specification & Definition" page. Stop and check quickstart § 7.
2. **Visitors' view**: Part 2 (DISL and DID, placeholders, constitution) and Part 5 (site and Notion), each merged when its proof task passes.
3. **Hosts**: Parts 3 and 4 in parallel, each merged when its gates equal the baseline.
4. **Close**: Part 6, then Part 7 turns the terminology check on everywhere and proves SC-001–SC-008 together.
