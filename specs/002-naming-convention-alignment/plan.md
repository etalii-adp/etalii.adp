# Implementation Plan: Naming Convention Alignment

**Branch**: `features/002-naming-convention-alignment` | **Date**: 2026-09-29 | **Spec**: [naming-convention-alignment.spec.md](naming-convention-alignment.spec.md)
**Input**: Feature specification from `specs/002-naming-convention-alignment/naming-convention-alignment.spec.md`, with Peter's decisions of 2026-09-28.

## Summary

Apply one vocabulary (every tool is a diagram, a designer or an editor; "tool" for all three; DISL, DESL and EDSL specify them and DID, DED and EDD define them) to all seven repositories, Notion and the site pipelines, persisted identifiers included, without changing what anything does. The vocabulary is already published (`docs/terminology.md`, the Notion "ADP terminology" page, `/adp/docs/terminology/`). The work is split into a baseline part, a compatibility part in the site, five parts that run in parallel (etalii.adp, standalone, IntelliJ, site and Notion, the small repositories) and a final verification part ([contracts/parts.md](contracts/parts.md)). The shared contract is the glossary, the [classification](contracts/classification.md) and the [rename map](contracts/rename-map.md); the proof is a [terminology check](contracts/terminology-check.md) plus each repository's own gates measured against a recorded baseline ([quickstart.md](quickstart.md)).

## Technical Context

**Language/Version**: Markdown and JSON Schema 2020-12 (etalii.adp); C# on .NET and TypeScript/React (standalone); Java with the IntelliJ Platform Gradle Plugin (IntelliJ); Astro/Starlight with TypeScript on Node.js 24 (site); Notion.
**Primary Dependencies**: none new.
**Storage**: files in the repositories; user documents and registration files (never rewritten); IntelliJ `adp.xml` settings; the Notion database (data source id unchanged).
**Testing**: each repository's existing gates (research R8), a recorded baseline, and the terminology check.
**Target Platform**: the four hosts and the site on GitHub Pages.
**Project Type**: a cross-repository rename across a specification repository, two IDE hosts with code, two without, a website with its pipelines, and a Notion database.
**Performance Goals**: none; behaviour and performance stay as they are.
**Constraints**: nothing user-stored needs converting by hand (FR-011, FR-012); no URL stops resolving (SC-004); the hourly refresh never fails because of a half-done rename (research R6); history is not rewritten (FR-014).
**Scale/Scope**: about 1,900 "designer", 2,300 "diagram" and 1,150 "editor" occurrences in IntelliJ code and docs, about 480 "designer" in the site, 63 diagram modules and 2 editor modules in standalone, 97 Notion rows (inventory.md).

## Constitution Check

*GATE: checked before research and again after design.*

| Principle | Status | Note |
|---|---|---|
| I. One Source of Truth | Pass | The vocabulary has one source, `docs/terminology.md`; DISL stays the single source of its format. |
| II. Implementable from the Document Alone | **Deviation** | DESL and EDSL start as placeholders with no schema and no examples; see Complexity Tracking. DISL keeps its document, machine-readable specification and examples together, renamed in one pull request. |
| III. Precise Normative Language | Pass, with amendment | The machine-readable specification stays JSON Schema 2020-12 but is named `disl.disl` (research R3), which the Structure and Naming section (`<name>.schema.json`) does not allow yet: part 2 amends the constitution through `/speckit-constitution` in the same pull request. |
| IV. Versioned Specifications | Pass | DISL stays 0.1, Working Draft; pre-1.0 renames are allowed, and the old forms stay readable (FR-011). |
| V. Simplicity | Pass | No new construct in any language; placeholders are there because Peter asked for them (FR-009). |
| Structure and Naming | Amended by part 2 | `dedl` example → `disl`; add `desl`, `edsl`; machine-readable specification naming. |
| Development Workflow | Pass | One Spec Kit feature; each part a pull request into `develop` with a merge commit. |

Re-check after design: unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/002-naming-convention-alignment/
├── naming-convention-alignment.spec.md
├── inventory.md                 # evidence of today's usage
├── plan.md                      # this file
├── research.md                  # decisions R1–R10
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
C:\git\etalii.adp                     # part 0, part 2: docs/terminology*.{md,json}, specifications/{disl,desl,edsl}/, definitions/{diagrams,designers,editors}/, constitution, CLAUDE.md
C:\git\etalii.adp.ide.standalone      # part 3: src/{diagrams,designers,editors}/, src/backend/, src/client/src/shell/, docs/tools.md, docs/creating-a-*-module.md
C:\git\etalii.adp.ide.intellij        # part 4: core/, freemind/, drawio/, testing/, src/main/resources/META-INF/plugin.xml, docs/
C:\git\etalii.adp.site                # part 1, part 5: src/pages/tools/, src/components/catalogue/, src/lib/catalogue/, src/data/{sections,redirects}.ts, scripts/, procedures/, .github/workflows/
C:\git\etalii.adp.ide.vscode          # part 6: CLAUDE.md
C:\git\etalii.adp.ide.eclipse         # part 6: CLAUDE.md
etalii-adp/.github (no local clone)   # part 6: profile/README.md, repository description
Notion "Diagrams" → "Tools"           # part 5
```

**Structure Decision**: no new repository; each part works inside the existing layout of its repository, in its own worktree placed as that repository's rules say (site worktrees beside the repository).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| DESL and EDSL exist without a schema or examples (principle II) | Peter asked for designer and editor placeholders wherever diagrams have a place (FR-009), and for the three languages by name | Leaving them out would contradict the decision; inventing constructs without a current designer or editor would break principle V. The placeholder documents say plainly that they hold nothing normative. |
| The site keeps reading old upstream names during parts 2–6 | Parts run in parallel and the hourly refresh must not fail in between (research R6) | A refresh freeze depends on someone remembering to lift it; the fallback is removed in part 7. |
