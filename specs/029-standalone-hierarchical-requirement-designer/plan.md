# Implementation Plan: The Hierarchical Requirement Designer in the Standalone Host

**Branch**: `features/029-standalone-hierarchical-requirement-designer` in `etalii.adp`; in `etalii.adp.ide.standalone`, one `features/029-<pull request>` branch per pull request | **Date**: 2026-10-15 | **Spec**: [standalone-hierarchical-requirement-designer.spec.md](standalone-hierarchical-requirement-designer.spec.md)

**Input**: the feature specification; the definition `definitions/designers/hierarchical-requirement.*` at `etalii.adp` `bfb0c27`; [spec 028's host handoff](../028-hierarchical-requirement-designer/contracts/host-handoff.md); the standalone host read at `develop` `b35336639`.

**Scale note.** About sixty files in `etalii.adp.ide.standalone`, in five areas: the FBL library and its conformance corpus, the core routing and add flow, the designer session contracts and wire, a new client library, and a new module with backend, client and tests. They land as eleven pull requests. Watch two things. Spec 025 is about half done and moves most of the core paths named here, so the first task reads the host again (R1). And three files are extended by several pull requests (`designers.proto`, the conformance harness, the hierarchy surface library): never by two pull requests in work at once.

## Summary

The host gains what the Hierarchical Requirement Designer rests on, then the designer itself. The FBL library learns the `bullets` family, declared registration blocks and drift before an edit, and its conformance run replays every FBL 0.7 fixture spec 028 added. The host recognises a requirement document by its envelope on line 1, ahead of the Markdown editor and Agent Behavior Modelling, and opens it with or without a registration. A shared `hierarchy` surface, its own session contract, wire messages and client library, draws the page of boxes. The module `src/designers/hierarchical-requirement/` is written by hand from the definition, as the Knowledge designer's was, and supplies the model, the operations and the declarations the surface reads. Nothing is built until spec 025 is done and the maintainer gives the word.

## Technical Context

**Language/Version**: C# on the .NET SDK that `etalii.adp.ide.standalone/src/global.json` pins; TypeScript with React 18, built by Vite.

**Primary Dependencies**: those the host has: ASP.NET Core and gRPC over grpc-web, System.Text.Json, CEL, Serilog; `@mdi/font` and CodeMirror 6 on the client. No package is added.

**Storage**: the requirement document (`.md`) and its optional registration (`.adp`) in the user's project folder, written only as the fixtures state.

**Testing**: xUnit v3 in the module's and the library's test projects; the conformance run in `EtAlii.Adp.Specification.Fbl.Tests`; Vitest beside the client code; a browser check per user story in `standalone:tests.md`, in both themes. The four gates and `inspect.sh` on every pull request.

**Target Platform**: Windows for development, Linux on the runner. Line endings matter: a new document is CRLF, an edit follows the file's own endings.

**Performance Goals**: SC-003. A document of 100 items and 500 requirements opens within two seconds and shows an agent's change within two seconds.

**Constraints**: opening never writes a file. Every byte written is the one a fixture states. No `.des` interpreter. One server stream: the surface is a `WorkspaceMessage` member.

## Constitution Check

*Gate: passed before research, and re-read after the design files were written.*

### The etalii.adp constitution (1.6.0)

| Principle | Assessment |
|---|---|
| I. One source of truth | PASS. The host implements FBL 0.7, DESL 0.2 and DED 0.2 as written, and the module is checked against the vendored definition by its vocabulary test and the fixtures. What the work finds wrong in a language or the definition comes back here as a feature of its own (spec, Out of Scope). Where spec 029 disagreed with the definition, the spec is amended (R16). |
| II. Implementable from the document alone | Not engaged: no specification document, schema or example changes. The corpus copies are kept unchanged. |
| III. Precise normative language | Not engaged. |
| IV. Versioned specifications | PASS. The host states the versions it reads (the FBL `LanguageVersion` at minor 7) and opens a later DED version read-only (FR-031). |
| V. Simplicity | PASS. No package, no `.des` interpreter, no delta protocol (R8), no keyboard help screen (R10), the table's tag components reused in place (R9), no consent flow for a file without an envelope (R5). The one new contract, `IHierarchySurfaceSession`, has its consumer in the same pull request. |
| VI. No JetBrains Rider warnings in C# | PASS. Every pull request runs `inspect.sh`; a new project gets its `.csproj.DotSettings`. |
| Structure and Naming: `specs/` holds every repository's features except standalone's | **Deviation**, recorded under Complexity Tracking. |
| Development Workflow | PASS. This folder reaches `develop` by pull request with a merge commit. Each standalone pull request names this folder and the `etalii.adp` commit its tasks came from, and a task is ticked only when that pull request is merged. |

### The standalone repository's principles

Its `CLAUDE.md` and `.spec-workflow/steering/` at `b35336639`. It has no file under `.specify/memory/repositories/`.

| Rule there | How this feature meets it |
|---|---|
| Vocabulary: *tool* for what serves every kind, *designer* for the form-based kind | The router's marker claim is a tool concern (`ToolRouter`). The session contracts and the surface are designer concerns. |
| Core never depends on a module (`DesignerModuleIsolation.Tests`) | The surface library and contract know no designer type. The module supplies its declarations. |
| Implementation order: model, persistence, wire, client UI, then the rest | Pull requests 1 to 4, then 5, then 6 to 11 (R2). |
| Every state change is a command through `IHistoryStack`; a refusal is a `CommandResult` | Every gesture is a command; the refusals of R10 and R11 are results. Folding and creating the registration are outside the history, as the binding says. |
| Selection through `IContextSourceResolver`; actions and shortcuts as data | The add keys are context actions with a `ContextShortcutDefinition` (R10). |
| One entity per file, no nested types, POCOs in `_Model/` | Followed in every new project and folder. |
| A module is `src/designers/<x>/{definition,backend,client,examples}`, with `provenance.json` | The module copies Knowledge's layout. |
| Byte-compared files are `-text` | One new line for the vendored companion (R15). |
| Vendored data under a permissive licence with `LICENSE.md` beside it | The examples are this organization's own, Apache-2.0. |
| `docs/tools.md`, `docs/creating-a-designer-module.md`, `docs/architecture.md`, `docs/solution-structure.md`, `ArchitecturePages.Tests` change with the code | Named in each task that makes one false. `creating-a-designer-module.md` is already stale ("No designer exists yet") and is corrected in pull request 4. |
| A guard for a defect is seen to fail first | The planted defect of User Story 3, and every refusal test, runs against the code without the change first. |
| Every question to the user is a selection | The one ruling this plan could need, on R5, is asked as a selection if a reviewer challenges it. |
| One Developer owns a specification until every task is done | Stated in [quickstart.md](quickstart.md). |

## Decisions

Each is argued in [research.md](research.md).

1. **Plan now, read the host again before building** (R1).
2. **Eleven pull requests**, in the host's implementation order, one per story after the foundations (R2).
3. **The envelope claims a `.md` through FBL marker routing**, ahead of every registration (R3).
4. **A designer document may have no registration**; it is created with the first setting, outside the history (R4).
5. **Adding an existing file**: accepted with the envelope, refused without it, never changed (R5).
6. **A later DED version** opens read-only; the supported surface kinds are stated in `docs/tools.md` (R6).
7. **The surface is named "hierarchy surface" in full** (R7).
8. **A second session contract, and the whole model on every change** (R8).
9. **The table's tag components, reused in place** (R9).
10. **What the host settles**: `Ctrl+Enter` and `Ctrl+Shift+Enter`, `mdi-comment-multiple-outline`, the focus control, the mark, the trail and the wording (R10).
11. **Unsaved edits are the text being typed**; keeping it re-plans one value (R11).
12. **Drift before an edit is shared**, in the FBL library (R12).
13. **The corpus in etalii.adp's layout, with a recursing runner** (R14).
14. **The spec is amended where the definition disagrees** (R16).
15. **SC-001, SC-002, SC-004 and SC-005 are observed and recorded here** (R18).

## Project Structure

### Documentation (this feature)

```text
specs/029-standalone-hierarchical-requirement-designer/
├── standalone-hierarchical-requirement-designer.spec.md
├── plan.md                         this file
├── research.md                     the decisions, argued
├── data-model.md                   the host's types: what each holds, where it lives
├── quickstart.md                   taking a task to a merged standalone pull request
├── contracts/
│   ├── hierarchy-surface.md        the session contract, the wire messages, the client library's props
│   ├── routing-and-adding.md       the marker claim, the optional registration, add and delete
│   └── pull-request.md             what every standalone pull request of this feature holds
├── checklists/requirements.md
├── measurements.md                 SC-001, SC-002, SC-004, SC-005, written after pull request 11
└── tasks.md
```

### Source Code (`etalii.adp.ide.standalone`)

Paths are at spec 025's homes where it names one (R1). The first task corrects them against the host as it is then.

```text
etalii.adp.ide.standalone/
├── .gitattributes                                     one line for the companion (R15)
├── docs/                                              tools.md, creating-a-designer-module.md, architecture.md, solution-structure.md
├── tests.md                                           a browser check per user story
├── src/api/
│   ├── designers.proto                                HierarchySurface* messages (PR 5)
│   └── workspace.proto                                the hierarchy_surface member (PR 5)
├── src/backend/
│   ├── EtAlii.Adp.Specification.Fbl/
│   │   ├── Documents/FblModelTypes.cs, FblDocumentLoader.cs    Family.Bullets, FBL minor 7, registration.blocks (PR 1, 2)
│   │   ├── Rules/BodyReading.cs                                the bullets reader chosen (PR 1)
│   │   ├── Files/Bullets/                                      new: the reader and writer (PR 1)
│   │   ├── History/OpenBody.cs, SplicedFile.cs                 drift before an edit, the shared sentence (PR 1)
│   │   └── Registration/RegistrationDocument.cs, OpenRegistration.cs   declared blocks, createOnFirstPlacement (PR 2)
│   ├── EtAlii.Adp.Specification.Fbl.Tests/Conformance/
│   │   ├── etalii.adp/                                         the copied fixtures and definition (PR 1, 2, 4)
│   │   ├── ConformanceFixtures.Tests.cs, readme.md             recursion, the new edit forms, the copy log
│   │   └── HierarchicalRequirementFixtures.Tests.cs            new (PR 4)
│   ├── EtAlii.Adp.Hierarchy/                                   ToolRouter: the marker claim; DesignerAddOptions; DeleteEntryCommandHandler (PR 3)
│   ├── EtAlii.Adp.Sessions/                                    IDesignerSessionFactory: the registration optional (PR 3); IDesignerSession split; IHierarchySurfaceSession (PR 5)
│   ├── EtAlii.Adp.Designer/
│   │   └── HierarchySurfaceModel/                              new: the read model the wire carries (PR 5)
│   └── EtAlii.Adp.Workspace/DesignerService*.cs                the surface's calls and stream member (PR 5)
├── src/client/src/
│   ├── designers/useHierarchySurfaceStream.ts                  new: the stream hook, beside useTableStream (PR 5)
│   ├── hierarchySurface/library/                               new: page, boxes, trail, collapse, icons, lookup, filter bar (PR 5 to 11)
│   └── table/library/declarativeDesignerModules.test.ts        KNOWN_MODULE_CLIENTS = 2 (PR 5)
└── src/designers/hierarchical-requirement/                     new
    ├── definition/                                             .des, .fbl, .md, provenance.json
    ├── backend/EtAlii.Adp.Designer.HierarchicalRequirement/    Designer.cs, the body, the session, the operations (PR 4 onwards)
    ├── backend/EtAlii.Adp.Designer.HierarchicalRequirement.Tests/
    ├── client/                                                 register.ts, the panel, the declarations (PR 5)
    └── examples/                                               web-shop.md, web-shop.adp, LICENSE.md, readme.md
```

**Structure Decision**: one new module, one new client library folder and one new reader folder, each in the place its siblings sit. No new project in core: the surface's model goes beside `TableModel/` in the designer project, and its contract beside the table's.

## Delivery

One standalone pull request at a time, each cut from `develop` after the one before it is merged, each with the four gates and the inspection green. The table is R2's.

| PR | Branch | Closes | Requirements |
|---|---|---|---|
| 1 | `features/029-fbl-bullets` | | FR-024 (library), FR-029 (part) |
| 2 | `features/029-fbl-registration-blocks` | | FR-028, FR-029 |
| 3 | `features/029-envelope-routing` | | FR-002, FR-003, FR-004 |
| 4 | `features/029-hierarchical-requirement-model` | US3 | FR-026, FR-027, FR-029, FR-031, SC-006 |
| 5 | `features/029-hierarchy-surface` | US1 | FR-001, FR-006 to FR-011, FR-030, FR-032, SC-007, SC-009 |
| 6 | `features/029-two-writers` | US2 | FR-022 to FR-025, SC-003 |
| 7 | `features/029-shaping` | US4 | FR-005, FR-012 to FR-014 |
| 8 | `features/029-assessments` | US5 | FR-015, FR-016 |
| 9 | `features/029-references` | US6 | FR-017, FR-018 |
| 10 | `features/029-tags` | US7 | FR-011 (tags), FR-004 (deleting the registration), SC-008 |
| 11 | `features/029-narrowing` | US8 | FR-019 to FR-021 |

After pull request 11, `measurements.md` is written here as the observations come in (R18).

## Complexity Tracking

| Deviation | Why it is needed | Simpler alternative rejected |
|---|---|---|
| A standalone feature specified and planned here, against *Structure and Naming* | The maintainer asked for it on 2026-10-14, as for spec 025 (spec, Input). | A spec-workflow specification in standalone's `.spec-workflow/`. The convention's text is left unchanged, as spec 025 ruled. |
| A plan written before the host it lands in is settled | The definition is merged and its open questions are the host's; the spec asks for a re-read before building, which the first task does (R1). | Planning after spec 025: the decisions would wait for weeks while none of them depends on where a type lives. |

## What is not done here

- No line of `etalii.adp.ide.standalone` is changed by this folder's pull request.
- Hosts other than standalone, changes to a language or the definition, Agent Behavior Modelling on the `bullets` family, a `.des` interpreter, merging two writers' edits (spec, Out of Scope).
- A keyboard help screen and a delta protocol for the surface (R8, R10).
