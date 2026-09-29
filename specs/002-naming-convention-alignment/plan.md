# Implementation Plan: Naming Convention Alignment

**Branch**: `features/002-naming-convention-alignment` | **Date**: 2026-09-29 | **Spec**: [naming-convention-alignment.spec.md](naming-convention-alignment.spec.md)
**Input**: Feature specification from `specs/002-naming-convention-alignment/naming-convention-alignment.spec.md`, as last revised after Peter's review of 2026-09-28 (DISL and DID, tool engineer, DEDL retired).

## Summary

Apply one vocabulary to all seven repositories, Notion and the site pipelines, persisted identifiers included, without changing what anything does. Every tool is a diagram, a designer or an editor, and "tool" names all three. A tool engineer specifies a tool type in its kind's specification language (DISL, DESL, EDSL: `.disl`, `.desl`, `.edsl`), and what users create of that type is stored in its kind's definition language (DID, DED, EDD: `.did`, `.ded`, `.edd`).

The biggest single change is that today's DEDL splits in two: its definition format becomes DISL and its document format becomes DID (research R3). The acronym DEDL is retired, not reused: every old DEDL identifier is read or redirected as DISL or DID, and `/adp/dedl/` redirects to DISL (R4).

The glossary, its Notion page and its site page already exist but carry the first draft's terms, so part 0 corrects them before anything else. The site also gains a "Specification & Definition" page (R7).

The work is split into a baseline part, a compatibility part in the site, five parts that run in parallel (etalii.adp, standalone, IntelliJ, site and Notion, the small repositories) and a final verification part ([contracts/parts.md](contracts/parts.md)). The shared contract is the glossary, the [classification](contracts/classification.md) and the [rename map](contracts/rename-map.md). The proof is a [terminology check](contracts/terminology-check.md) plus each repository's own gates, measured against a recorded baseline ([quickstart.md](quickstart.md)).

## Technical Context

**Language/Version**: Markdown and JSON Schema 2020-12, checked by a Python 3.13 script in CI (etalii.adp); C# on .NET and TypeScript/React (standalone); Java with the IntelliJ Platform Gradle Plugin (IntelliJ); Astro/Starlight with TypeScript on Node.js 24 (site); Notion.
**Primary Dependencies**: none new.
**Storage**: files in the repositories; user documents and registration files (never rewritten by a host); IntelliJ `adp.xml` settings; the Notion database (data source id unchanged).
**Testing**: each repository's existing gates (research R10), a recorded baseline, legacy fixtures for every renamed format identifier, and the terminology check.
**Target Platform**: the four hosts and the site on GitHub Pages.
**Project Type**: a cross-repository rename across a specification repository, two IDE hosts with code, two without, a website with its pipelines, and a Notion database.
**Performance Goals**: none; behaviour and performance stay as they are.
**Constraints**: nothing user-stored needs converting by hand (FR-011, FR-012); no URL stops resolving (SC-004); the hourly refresh never fails because of a half-done rename (research R6); history is not rewritten (FR-014); third-party names are never changed (R8).
**Scale/Scope**: about 1,900 "designer", 2,300 "diagram" and 1,150 "editor" occurrences in IntelliJ code and docs, about 480 "designer" in the site, 63 diagram modules and 2 editor modules in standalone, 97 Notion rows (inventory.md); DEDL's 5,098-line specification and 9,600-line schema split into DISL and DID.

## Constitution Check

*GATE: checked before research and again after design.*

| Principle | Status | Note |
|---|---|---|
| I. One Source of Truth | Pass | The vocabulary has one source, `docs/terminology.md`, copied into Notion and the site in the same change (FR-003). DISL and DID are each the single source of their format; DID references DISL's shared primitives instead of copying them (R3). |
| II. Implementable from the Document Alone | Pass for DISL and DID; **deviation** for four placeholders | DISL and DID each keep a document, a schema and examples, split and renamed in one pull request. DESL, DED, EDSL and EDD start as placeholders with no schema and no examples; see Complexity Tracking. |
| III. Precise Normative Language | Pass | Schemas stay JSON Schema 2020-12, one per specification, named `<name>.schema.json` as the constitution requires (the first plan's `disl.disl` is dropped, R3). |
| IV. Versioned Specifications | Pass | DISL and DID start at 0.1, Working Draft, continuing DEDL 0.1; pre-1.0 renames are allowed and the old forms stay readable (FR-011). |
| V. Simplicity | Pass | No new construct in any language; placeholders exist because Peter asked for them (FR-009); placeholder languages get no site pages until they have content (R4). |
| Structure and Naming | Amended by part 2 | The section names DEDL as its model and "the authors of designers" as readers. Part 2 changes it through `/speckit-constitution` (FR-004): the model becomes `disl`, the six languages follow its pattern, and the readers become tool engineers. The rule itself (`specifications/<name>/`, `<NAME>-specification.md`, `<name>.schema.json`, short lowercase extensions) is unchanged and all six comply, each with its lowercase acronym as `<name>` and extension (R3). |
| Development Workflow | Pass | One Spec Kit feature; each part a pull request into `develop` with a merge commit. |

Re-check after design: unchanged. The spec has no NEEDS CLARIFICATION left: retiring DEDL instead of reusing it (R4) removed the only one, and with it the previous revision's complexity entry for the reused acronym.

## Project Structure

### Documentation (this feature)

```text
specs/002-naming-convention-alignment/
├── naming-convention-alignment.spec.md
├── inventory.md                 # evidence of today's usage
├── plan.md                      # this file
├── research.md                  # decisions R1–R12
├── data-model.md
├── quickstart.md                # how the result is proven
├── contracts/
│   ├── classification.md        # the kind of every tool (FR-005)
│   ├── rename-map.md            # old → new, per repository
│   ├── parts.md                 # the parallel parts, their order and proofs
│   └── terminology-check.md     # the check behind SC-001 and FR-017
├── checklists/requirements.md
└── tasks.md                     # /speckit-tasks
```

### Source code (the repositories touched)

```text
C:\git\etalii.adp                     # part 0: docs/terminology.md, docs/terminology-check.json; part 2: specifications/{disl,did,desl,ded,edsl,edd}/ (specifications/dedl/ removed), definitions/{diagrams,designers,editors}/, .github/scripts/validate-examples.py, constitution, CLAUDE.md
C:\git\etalii.adp.ide.standalone      # part 3: src/{diagrams,designers,editors}/, src/backend/, src/client/src/shell/, docs/tools.md, docs/creating-a-*-module.md
C:\git\etalii.adp.ide.intellij        # part 4: core/, freemind/, drawio/, testing/, src/main/resources/META-INF/plugin.xml, docs/
C:\git\etalii.adp.site                # part 0: terminology page; part 1, part 5: src/pages/tools/, src/pages/disl/, src/pages/did/, the "Specification & Definition" page, src/components/catalogue/, src/lib/catalogue/, src/data/{sections,redirects}.ts, scripts/, procedures/, .github/workflows/
C:\git\etalii.adp.ide.vscode          # part 6: CLAUDE.md
C:\git\etalii.adp.ide.eclipse         # part 6: CLAUDE.md
etalii-adp/.github (no local clone)   # part 6: profile/README.md, repository description
Notion "ADP terminology" page         # part 0
Notion "Diagrams" → "Tools"           # part 5
```

**Structure Decision**: no new repository; each part works inside the existing layout of its repository, in its own worktree placed as that repository's rules say (site worktrees beside the repository).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| DESL, DED, EDSL and EDD exist without a schema or examples (principle II) | Peter asked for designer and editor placeholders wherever diagrams have a place (FR-009), and for the six languages by name (FR-006a) | Leaving them out would contradict the decision; inventing constructs without a current designer or editor would break principle V. The placeholder documents say plainly that they hold nothing normative. |
| The site keeps reading old upstream names during parts 2–6 | Parts run in parallel and the hourly refresh must not fail in between (research R6) | A refresh freeze depends on someone remembering to lift it; the fallback is removed in part 7. |
| The validator carries an alias table and legacy fixtures in the old DEDL form | FR-011 requires old identifiers to keep being read, and principle II requires examples to be checked | Without fixtures the compatibility promise is unchecked; the table and fixtures go when DISL and DID drop the aliases at their next major version. |
