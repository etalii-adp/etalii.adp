# Research: Naming Convention Alignment

**Feature**: [naming-convention-alignment.spec.md](naming-convention-alignment.spec.md) | **Plan**: [plan.md](plan.md) | **Evidence**: [inventory.md](inventory.md)

Each decision below resolves an open point of the plan. Decisions marked *(Peter)* were made by Peter on 2026-09-28; the others are defaults taken in this plan and can be overturned in review.

## R1. Umbrella term and the three kinds *(Peter)*

- **Decision**: "tool" for all three; diagram, designer, editor as defined in `docs/terminology.md`.
- **Rationale**: Peter's answer to FR-002.
- **Consequence for code**: an abstraction shared by all kinds is named `Tool…` (for example a tool registry, a tool panel, a tool catalogue); an abstraction for one kind keeps that kind's name (`Diagram…`, `Editor…`, `Designer…`). Where a platform already uses "tool" (IntelliJ tool windows, the toolbox of a diagram), the glossary exception applies and the ADP name gets a qualifier when both appear in one file (`ToolTab` vs `ToolWindow`).

## R2. Classification *(Peter)*

- **Decision**: every one of the 95 rows in the Notion database and every catalogue entry is a **diagram**; the markdown and plain-text editors are **editors**; there is no designer yet. The two IntelliJ tools (FreeMind mind map, draw.io) are diagrams.
- **Rationale**: Peter, 2026-09-28: "all of them are a diagram indeed".
- **Consequence**: FR-005's table is [contracts/classification.md](contracts/classification.md) and needs no further approval unless a new entry appears; designers exist only as placeholders (FR-009).

## R3. DEDL becomes DISL *(Peter, plus defaults)*

- **Decision (Peter)**: DEDL → DISL, Diagram Specification Language; definitions are DIFL (`.difl`); DESL/DEFL and EDSL/EDFL are the designer and editor counterparts.
- **Decision (default, confirmed as the working assumption by the coordinator on 2026-09-28 pending Peter)**: a `.disl` file is the language's machine-readable specification. Today's `specifications/dedl/dedl.schema.json` becomes `specifications/disl/disl.disl`, still JSON Schema 2020-12 in content.
- **Decision (default)**: the renamed persisted identifiers are:

| Today | After |
|---|---|
| folder `specifications/dedl/` | `specifications/disl/` |
| `DEDL-specification.md` | `DISL-specification.md` |
| `dedl.schema.json` | `disl.disl` |
| `$id` `https://etalii.net/adp/dedl/schema/0.1/dedl.schema.json` | `https://etalii.net/adp/disl/schema/0.1/disl.disl` |
| examples `erd.dedl`, `statemachine.dedl`, `timeline.dedl` | `erd.difl`, `statemachine.difl`, `timeline.difl` |
| example `timeline.document.json` | unchanged (a document, not a definition) |
| media type `application/vnd.dedl.definition+json` | `application/vnd.disl.definition+json` |
| media type `application/vnd.dedl.document+json` | `application/vnd.disl.document+json` |
| version key `"dedl": "0.1"` in a definition | `"disl": "0.1"` |
| version key `"dedlDocument": "0.1"` in a document | `"dislDocument": "0.1"` |
| export format `dedl-fragment` | `difl-fragment` |

- **Old forms still read (FR-011)**: DISL 0.x **MUST** let a runtime accept `.dedl`, the old `$id`, the old media types and the old version keys as deprecated aliases, and the site keeps serving the old schema address. DISL stays at version 0.1 because the constitution allows pre-1.0 changes and nothing about the constructs changes.
- **DESL and EDSL**: `specifications/desl/` and `specifications/edsl/`, each with a `<NAME>-specification.md` at status *Placeholder*, stating purpose and definition format and nothing normative yet; no schema or examples until a designer or editor needs one. This departs from constitution principle II (schema and examples required) and is recorded in the plan's complexity tracking.
- **Alternatives considered**: keeping `dedl.schema.json` as the file name and only renaming the folder (rejected: Peter asked for all of it); bumping DISL to 1.0 (rejected: nothing about the constructs is stable yet).

## R4. Persisted identifiers in the hosts

- **Decision**: rename them, write only the new form, and read the old form for at least the next major version (FR-011). Per repository:
  - **Standalone**: registration origins (`.adp` first line) contain no retired term except the diagram names themselves (`systems/causal-loop-diagram` names a diagram, which is correct), so origins stay. Editor ids `editor/<id>` stay: they already name the kind. Documents and bodies are untouched.
  - **IntelliJ**: the settings keys `offDesigners` → `offTools` and `designerSettings` → `toolSettings`; per-tool keys `<designerId>/<key>` keep their shape with the new ids; configurable ids `etalii.adp.settings.<designerId>` follow the new ids. The editor type ids become `etalii.adp.drawio` (unchanged) and `etalii.adp.freemind` (was `etalii.adp.freemind.editor`), one pattern. On load, `AdpSettings` reads the old keys and ids when the new ones are absent and writes the new ones. IntelliJ reopens files by editor type id; an unknown old id falls back to the default editor once, which is accepted and noted in the release notes.
  - **Site**: see R6.
- **Alternatives considered**: keeping persisted ids as exceptions (rejected by Peter, "Change all of it").

## R5. What stays: exceptions

- **Decision**: platform APIs (IntelliJ `FileEditor`, `FileEditorProvider`, `TextEditorWithPreview`, `editorNotificationProvider`, tool windows; VS Code `customEditors`/`viewType`; Eclipse editor extension points), third-party names ("draw.io diagram", Mermaid, PlantUML, OMG DD), controls (`EditorKind`, `InPlaceEditor`, `InlineLabelEditor`, property editors) and history, as listed in `docs/terminology.md`.
- **Rationale**: renaming them is impossible or would mislead.

## R6. Site, Notion and the pipelines move together

- **Decision**: the site part reads both the old and the new forms of every upstream name before the upstream parts rename them, and drops the old forms only in the final verification part. Concretely:
  - the catalogue procedure reads each host's `docs/tools.md`, falling back to `docs/diagrams.md`;
  - the reference procedure reads `specifications/disl/`, falling back to `specifications/dedl/`, and is renamed `refresh-disl` (the `dedl` procedure name stays accepted by `npm run refresh` and by `refresh.yml`'s `workflow_dispatch` and `source-changed` mapping until the final part);
  - `src/lib/catalogue/notion-api.ts` accepts the new Notion column names and the old ones.
- **URLs**: `/adp/designers/…` → `/adp/tools/…` and `/adp/dedl/…` → `/adp/disl/…`, each old address redirected through `src/data/redirects.ts`; the schema is served at both `/dedl/schema/0.1/dedl.schema.json` and `/disl/schema/0.1/disl.disl`. Nav labels "Tools" and "DISL reference".
- **Notion**: database "Diagrams" → "Tools"; host columns "Standalone Plugin Implementation", "IntelliJ Plugin Implementation", "VS Code Plugin Implementation", "Eclipse" → "Standalone", "IntelliJ", "VS Code", "Eclipse" (one pattern: the host's name); `Type` → "Kind"; the site's optional `Previous origin` column is created so renamed origins can redirect. The data source id does not change, so scripts keyed on it keep working. The Notion change is made by the site part, after its code accepts both names and before the next scheduled refresh.
- **Alternatives considered**: a freeze on the hourly refresh during the change (rejected: the dual reading is smaller and leaves nothing to forget).

## R7. Placeholders for designers

- **Decision**: wherever a diagram and an editor variant exist, add a designer variant marked as a placeholder:
  - etalii.adp: `definitions/designers/` beside `definitions/diagrams/` and `definitions/editors/`, each tracked through a `README.md` saying what belongs in it; `specifications/desl/`.
  - standalone: `src/designers/README.md` beside `src/diagrams/` and `src/editors/`; `docs/creating-a-designer-module.md` beside the diagram and editor module guides, stating that no designer exists yet and what the family will share; a designer family slot in the module discovery and the panel registry, empty.
  - IntelliJ: none today (it has no editor family either); its framework docs name the three kinds.
  - site: the `designer` kind already exists in the catalogue; the Tools overview offers a kind filter with Diagram, Designer and Editor.
  - Notion: the `Designer` option exists.

## R8. Verification: "operating as before"

- **Decision**: before any rename, the baseline part records per repository the test counts of every gate, a byte hash of every example and registration file, the site's sitemap, and a stored IntelliJ settings file. Each part proves against that baseline, and the final part proves it for all repositories together (FR-016, SC-001–SC-006).
- **Commands** (from each repository's `CLAUDE.md`): standalone `npm test`, `npm run typecheck`, `dotnet format style --verify-no-changes --severity info` and `dotnet test --solution EtAlii.Adp.slnx` (from `src/backend/`, with `MSBUILDDISABLENODEREUSE=1` and `DOTNET_CLI_USE_MSBUILD_SERVER=0`), judged by exit code; IntelliJ `./gradlew build` and `./gradlew integrationTest`; site `npm run build`, `npm test`, `npm run test:catalogue`, `npm run test:refresh`, `npm run check`; etalii.adp its CI example validation.

## R9. The terminology check (FR-017)

- **Decision**: one shared list of retired patterns and allowed exceptions, [contracts/terminology-check.md](contracts/terminology-check.md), kept in etalii.adp beside the glossary; each repository runs it in its existing CI workflow on pull requests. It reports file, line, the retired use and its replacement.
- **Alternatives considered**: a linter per language (rejected: the retired uses are words in names and prose, the same across languages).

## R10. Parallel delivery

- **Decision**: seven parts after a baseline, one per repository or area, each its own thread and pull request, with the glossary, classification and rename map as the shared contract; see [contracts/parts.md](contracts/parts.md). Parts that others read from (etalii.adp's DISL paths, the hosts' catalogue file) run after the site part has started reading both forms.
