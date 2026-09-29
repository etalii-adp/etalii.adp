# Research: Naming Convention Alignment

**Feature**: [naming-convention-alignment.spec.md](naming-convention-alignment.spec.md) | **Plan**: [plan.md](plan.md) | **Evidence**: [inventory.md](inventory.md)

Each decision below resolves an open point of the plan. Decisions marked *(Peter)* were made by Peter on 2026-09-28, in the first review or in the review comments on the spec; the others are defaults taken in this plan and can be overturned in review.

This revision follows the spec as last revised on 2026-09-28: the definition languages are DID, DED and EDD (`.did`, `.ded`, `.edd`), and the acronym DEDL is retired instead of reused. It replaces the first plan's DIFL/DEFL/EDFL reading and its `disl.disl` default, and the second revision's DIDL, DEDL (for designers) and EDDL, all of which the spec now overrules.

## R1. Umbrella term and the three kinds *(Peter)*

- **Decision**: "tool" for all three; diagram, designer, editor as defined in `docs/terminology.md`.
- **Rationale**: Peter's answer to FR-002; the review confirmed "Browse the tools" and a "Tools" settings page.
- **Consequence for code**: an abstraction shared by all kinds is named `Tool…` (a tool registry, a tool panel, a tool catalogue); an abstraction for one kind keeps that kind's name (`Diagram…`, `Editor…`, `Designer…`). Where a platform already uses "tool" (IntelliJ tool windows, the toolbox of a diagram), the glossary exception applies and the ADP name gets a qualifier when both appear in one file (`ToolTab` vs `ToolWindow`).
- **Alternatives considered**: none; decided by Peter.

## R2. Classification *(Peter)*

- **Decision**: every one of the 95 rows in the Notion database and every catalogue entry is a **diagram**; the markdown and plain-text editors are **editors**; there is no designer yet. The two IntelliJ tools (FreeMind mind map, draw.io) are diagrams.
- **Rationale**: Peter, 2026-09-28: "all of them are a diagram indeed".
- **Consequence**: FR-005's table is [contracts/classification.md](contracts/classification.md) and needs no further approval unless a new entry appears; designers exist only as placeholders (FR-009).

## R3. DEDL splits into DISL and DID *(Peter, plus defaults)*

What DEDL holds today is two formats in one specification: the **definition** a language author (now a tool engineer) writes (`$defs/Definition`, `*.dedl`) and the **document** an end user's diagram is stored as (`$defs/Document`, section 11 "Layer 8 — Persistence", `timeline.document.json`). Peter's decision names them apart: what a tool engineer writes about a diagram type is DISL; the diagrams users create of that type are stored as DID.

- **Decision (Peter)**: DEDL → DISL, the Diagram Specification Language (`.disl`); stored diagrams → DID, the Diagram Definition Language (`.did`). The person writing DISL is a **tool engineer**. Designers get DESL (`.desl`) and DED, the Designer Definition Language (`.ded`); editors get EDSL (`.edsl`) and EDD, the Editor Definition Language (`.edd`). Peter's last review comment renamed DIDL, DEDL and EDDL (and `.didl`, `.dedl`, `.eddl`) to DID, DED and EDD, so the acronym DEDL is retired (R4).
- **Decision (default)**: DEDL's specification splits into two specifications, `specifications/disl/` and `specifications/did/`, each with its own document, schema and examples, so all six follow the constitution's `specifications/<name>/` pattern (FR-006a). The split rule: what a tool engineer writes about a type stays in DISL, including the persistence layer's settings that a type declares (formats, embedding, migrations); what a stored diagram looks like moves to DID (the logical document structure, identifiers, view data, canonical form, fragments). DISL's persistence layer refers to DID for the structure it configures.
- **Decision (default)**: the terms inside the two documents follow the glossary. DEDL's "definition" (of a language) becomes a **specification** (of a diagram type) and its schema root `$defs/Definition` becomes `$defs/Specification`; DEDL's "document" as a stored file becomes a DID **definition**, root `$defs/Definition`. "Document" stays the glossary's word for the content a user works on in a host; its stored form, for a diagram, is a DID definition. "Language designer" becomes tool engineer; the running program is the runtime.
- **Decision (default)**: each language's `<name>` in the constitution's pattern is its acronym in lowercase, so folder, schema, `$id`, media type, version key and extension line up for all six: `disl`, `did`, `desl`, `ded`, `edsl`, `edd`, and every extension is `.<name>`.
- **Decision (default)**: DID's schema references DISL's shared primitives (`QualifiedId`, `SemVer`) by absolute `$id` rather than copying them (constitution principle I). The CI validator already loads every `*.schema.json` into one registry, so cross-schema references resolve against the same commit.
- **Renamed identifiers**:

| Today (DEDL 0.1) | After |
|---|---|
| folder `specifications/dedl/` | `specifications/disl/` and `specifications/did/`; `specifications/dedl/` is removed |
| `DEDL-specification.md` | `DISL-specification.md` and `DID-specification.md` |
| `dedl.schema.json`, `$defs/Definition` | `disl.schema.json`, `$defs/Specification` |
| `dedl.schema.json`, `$defs/Document` | `did.schema.json`, `$defs/Definition` |
| `$id` `https://etalii.net/adp/dedl/schema/0.1/dedl.schema.json` | `https://etalii.net/adp/disl/schema/0.1/disl.schema.json` and `https://etalii.net/adp/did/schema/0.1/did.schema.json` |
| examples `erd.dedl`, `statemachine.dedl`, `timeline.dedl` | `specifications/disl/erd.disl`, `statemachine.disl`, `timeline.disl` |
| example `timeline.document.json` | `specifications/did/timeline.did` |
| media type `application/vnd.dedl.definition+json` | `application/vnd.disl.specification+json` |
| media type `application/vnd.dedl.document+json` | `application/vnd.did.definition+json` |
| media type `application/vnd.dedl.fragment+json` | `application/vnd.did.fragment+json` |
| version key `"dedl": "0.1"` | `"disl": "0.1"` |
| version key `"dedlDocument": "0.1"` | `"did": "0.1"` |
| export format `dedl-fragment` | `did-fragment` |

- **Versions**: DISL and DID both start at 0.1, Working Draft, continuing DEDL 0.1: nothing about the constructs changes, and the constitution allows pre-1.0 renames.
- **Old forms still read (FR-011)**: DISL 0.x and DID 0.x **MUST** let a runtime accept `.dedl`, the old `$id`, the old media types and the old version keys as deprecated aliases. The schemas accept the old version key in place of the new one (exactly one of them, the old marked `deprecated`); the site keeps serving the old schema address. CI proves it with one legacy fixture per format, kept byte-for-byte as DEDL 0.1 wrote it, validated through an alias table in `.github/scripts/validate-examples.py` that maps the old `$id` to the new schemas.
- **Our own files are migrated** *(Peter, review comment)*: "We are still building and do not have users yet. If file content has the wrong naming and is based on one of our own specifications then the naming convention needs to be applied." The examples, and any other file in an ADP repository whose content follows an ADP specification, are rewritten to the new identifiers in their part. Only the legacy fixtures keep the old form, as the proof that it is still read.
- **A third-party DID**: the W3C's Decentralized Identifiers are also abbreviated DID. ADP's DID is written with its full name on first use in a text, as the glossary does, and the third-party name is not touched (R8). Acronym patterns in the terminology check are matched case-sensitively, so neither the English word "did" nor a `did` path is mistaken for a finding.
- **Alternatives considered**: keeping one specification for both formats with DID as a chapter of DISL (rejected: FR-006a asks the six to follow one pattern for folders, documents and schemas); naming the schema `disl.disl` so that a `.disl` file is the language's own specification (the first plan's default; rejected: the revised spec says a `.disl` file is one diagram type); bumping to 1.0 (rejected: nothing is stable yet).

## R4. DEDL is retired, and `/adp/dedl/` redirects to DISL *(Peter)*

The previous revision reused the acronym DEDL for the Designer Definition Language and asked where `/adp/dedl/` should then lead. Peter's last review comment named the definition languages DID, DED and EDD, and the spec now states that the acronym DEDL is not reused; its NEEDS CLARIFICATION is gone.

- **Decision**: DEDL is retired in every sense. `specifications/dedl/` is removed once its content has moved to `specifications/disl/` and `specifications/did/`; every old DEDL identifier (`.dedl`, the schema `$id`, the media types, the version keys, `dedl-fragment`, `/adp/dedl/…`) is read or redirected as DISL or DID (R3, R6) and never given a new meaning.
- **Decision (default)**: the placeholder languages (DESL, DED, EDSL, EDD) get no site pages of their own yet. They appear on the "Specification & Definition" page (R7) with their name, extension and "content to come"; the first feature that gives one of them content gives it its address, `/adp/<name>/`, following DISL and DID.
- **Rationale**: a placeholder has nothing to read, so it needs no address now (constitution principle V), and SC-004 is met by one redirect with no conflict.
- **Consequence for the terminology check**: every use of DEDL outside history, the legacy fixtures and the compatibility code is retired, and so are the previous revision's DIDL and EDDL and the extensions `.didl` and `.eddl` ([terminology-check.md](contracts/terminology-check.md)).
- **Alternatives considered**: none; decided by Peter. The previous revision's default (reuse `specifications/dedl/` for the designer placeholder) no longer applies.

## R5. Persisted identifiers in the hosts

- **Decision**: rename them, write only the new form, and read the old form for at least the next major version (FR-011). Per repository:
  - **Standalone**: registration origins (`.adp` first line) contain no retired term except the diagram names themselves (`systems/causal-loop-diagram` names a diagram, which is correct), so origins stay. Editor ids `editor/<id>` stay: they already name the kind. Documents and bodies are untouched.
  - **IntelliJ**: the settings keys `offDesigners` → `offTools` and `designerSettings` → `toolSettings`; per-tool keys `<designerId>/<key>` keep their shape with the new ids; configurable ids `etalii.adp.settings.<designerId>` follow the new ids. The editor type ids become `etalii.adp.drawio` (unchanged) and `etalii.adp.freemind` (was `etalii.adp.freemind.editor`), one pattern. On load, `AdpSettings` reads the old keys and ids when the new ones are absent and writes the new ones. IntelliJ reopens files by editor type id; an unknown old id falls back to the default editor once, which is accepted and noted in the release notes.
  - **etalii.adp**: see R3.
  - **Site**: see R6.
- **Alternatives considered**: keeping persisted ids as exceptions (rejected by Peter, "Change all of it").

## R6. Site, Notion and the pipelines move together

- **Decision**: the site part reads both the old and the new forms of every upstream name before the upstream parts rename them, and drops the old forms only in the final verification part. Concretely:
  - the catalogue procedure reads each host's `docs/tools.md`, falling back to `docs/diagrams.md`;
  - the reference procedure reads `specifications/disl/` and `specifications/did/`, falling back to `specifications/dedl/` while `specifications/disl/` is missing, and is renamed `refresh-disl` (the `dedl` procedure name stays accepted by `npm run refresh` and by `refresh.yml`'s `workflow_dispatch` and `source-changed` mapping until the final part);
  - `src/lib/catalogue/notion-api.ts` accepts the new Notion column names and the old ones.
- **URLs**: `/adp/designers/…` → `/adp/tools/…` and `/adp/dedl/…` → `/adp/disl/…`, each old address redirected through `src/data/redirects.ts`, including the redirects that already point into `/adp/designers/` (retired spec 003 facet pages), which are repointed so no chain forms. The DID reference is served at `/adp/did/…`. The schemas are served at `/disl/schema/0.1/disl.schema.json` and `/did/schema/0.1/did.schema.json`, and the old `/dedl/schema/0.1/dedl.schema.json` keeps serving DEDL 0.1's combined schema unchanged. Nav labels "Tools", "DISL reference", "DID reference".
- **Notion**: database "Diagrams" → "Tools"; host columns "Standalone Plugin Implementation", "IntelliJ Plugin Implementation", "VS Code Plugin Implementation", "Eclipse" → "Standalone", "IntelliJ", "VS Code", "Eclipse" (one pattern: the host's name); `Type` → "Kind"; the site's optional `Previous origin` column is created so renamed origins can redirect. The data source id does not change, so scripts keyed on it keep working. The Notion change is made by the site part, after its code accepts both names and before the next scheduled refresh.
- **Alternatives considered**: a freeze on the hourly refresh during the change (rejected: the dual reading is smaller and leaves nothing to forget).

## R7. The vocabulary in three places, and the "Specification & Definition" page *(Peter, review comment)*

- **Decision**: the glossary `docs/terminology.md`, the Notion "ADP terminology" page and the site page `/adp/docs/terminology/` already exist but carry the first draft's DIFL/DEFL/EDFL and "author" terms, or the previous revision's DIDL, DEDL and EDDL. Part 0 corrects all three to the revised spec before any other part starts, since every part reads them as its contract.
- **Decision (Peter)**: the site's documentation gets a "Specification & Definition" page that introduces the concepts (tool, kind, type, tool engineer, specification language, definition language) and shows the table with the columns Kind, Specification language, Extension, Definition language, Extension. It links to the DISL and DID references and marks the other four as to come.
- **Decision (default)**: the page lives in the site's documentation section beside the terminology page, and both link to `docs/terminology.md` as their source (FR-003). The table is written once in the glossary and copied into both pages in the same change; the site's page checks compare the table with the glossary's.
- **Alternatives considered**: folding the table into the terminology page (rejected: Peter asked for its own page).

## R8. What stays: exceptions

- **Decision**: platform APIs (IntelliJ `FileEditor`, `FileEditorProvider`, `TextEditorWithPreview`, `editorNotificationProvider`, tool windows; VS Code `customEditors`/`viewType`; Eclipse editor extension points), third-party names ("draw.io diagram", Mermaid, PlantUML, OMG Diagram Definition), controls (`EditorKind`, `InPlaceEditor`, `InlineLabelEditor`, property editors), history, and the legacy fixtures and compatibility code that read old identifiers, as listed in `docs/terminology.md`.
- **Rationale**: renaming them is impossible or would mislead. Peter: "Absolutely no third party naming can or should be changed."

## R9. Placeholders for designers, and for the four empty languages

- **Decision**: wherever a diagram and an editor variant exist, add a designer variant marked as a placeholder:
  - etalii.adp: `definitions/designers/` beside `definitions/diagrams/` and `definitions/editors/`, each tracked through a `README.md` saying what belongs in it; `specifications/desl/`, `specifications/ded/`, `specifications/edsl/`, `specifications/edd/`, each with a `<NAME>-specification.md` at status *Placeholder* stating its purpose, its extension and that its content is to come, and nothing normative.
  - standalone: `src/designers/README.md` beside `src/diagrams/` and `src/editors/`; `docs/creating-a-designer-module.md` beside the diagram and editor module guides, stating that no designer exists yet and what the family will share; a designer family slot in the module discovery and the panel registry, empty.
  - IntelliJ: none today (it has no editor family either); its framework docs name the three kinds.
  - site: the `designer` kind already exists in the catalogue; the Tools overview offers a kind filter with Diagram, Designer and Editor.
  - Notion: the `Designer` option exists.
- **Constitution**: the four placeholder specifications have no schema and no examples, a deviation from principle II recorded in the plan's complexity tracking.

## R10. Verification: "operating as before"

- **Decision**: before any rename, the baseline part records per repository the test counts of every gate, a SHA-256 of every example and registration file, the site's sitemap, and a stored IntelliJ settings file. Each part proves against that baseline, and the final part proves it for all repositories together (FR-016, SC-001–SC-006).
- **Migrated files** (R3): a file whose content a part rewrites on purpose is proven differently: its legacy copy still validates and opens (old form read), and the migrated file round-trips byte-identical from then on. The part's pull request lists every such file, so no other hash change goes unexplained.
- **Commands** (from each repository's `CLAUDE.md`): standalone `npm test`, `npm run typecheck`, `dotnet format style --verify-no-changes --severity info` and `dotnet test --solution EtAlii.Adp.slnx` (from `src/backend/`, with `MSBUILDDISABLENODEREUSE=1` and `DOTNET_CLI_USE_MSBUILD_SERVER=0`), judged by exit code; IntelliJ `./gradlew build` and `./gradlew integrationTest`; site `npm run build`, `npm test`, `npm run test:catalogue`, `npm run test:refresh`, `npm run check`; etalii.adp `python .github/scripts/validate-examples.py`.

## R11. The terminology check (FR-017)

- **Decision**: one shared list of retired patterns and allowed exceptions, [contracts/terminology-check.md](contracts/terminology-check.md), kept in etalii.adp beside the glossary; each repository runs it in its existing CI workflow on pull requests. It reports file, line, the retired use and its replacement.
- **Alternatives considered**: a linter per language (rejected: the retired uses are words in names and prose, the same across languages).

## R12. Parallel delivery

- **Decision**: seven parts after a baseline, one per repository or area, each its own thread and pull request, with the glossary, classification and rename map as the shared contract; see [contracts/parts.md](contracts/parts.md). Parts that others read from (etalii.adp's DISL and DID paths, the hosts' catalogue file) run after the site part has started reading both forms.
