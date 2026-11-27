# Implementation Plan: Designer Files That Open Without a Registration in the Standalone Host

**Branch**: `claude/project-thread-2y63ay` (the cloud session's harness names it in every repository) | **Date**: 2026-11-27 | **Spec**: [bare-designer-files.spec.md](bare-designer-files.spec.md)

**Input**: the specification, approved by Peter on 2026-11-27 (decision card "Approve as written").

## Summary

The standalone host already routes a body by its content, but only for one designer type, by a claim written for it. This feature makes that claim generic: any designer type names its bundled bindings, and the host routes by their `claims` and `marker` through the FBL library's own routing (FBL 12.3). Which files are read and how much of them is the second change. The router reads a file's first 64 KiB, cut at a line end, instead of its first line, so a root-key marker such as the knowledge designer's `designer: etalii/knowledge` is seen. It also evaluates a root key over a document that may be cut off. With that, a knowledge file with no registration opens as a table, appears in the hierarchy, and takes part in links and relations. The hierarchical requirement designer moves onto the same rule unchanged.

## Technical Context

- **Languages**: C# on .NET 10 (backend, modules); no client change is expected. A sentence for a file whose envelope names a type that is not installed goes through the existing problems path.
- **What changes in etalii.adp.ide.standalone**:
  - `src/backend/EtAlii.Adp.Specification.Fbl/Routing/`: `MarkerEvaluator`'s root key over a head that may be cut off (R2). Also a claim of several bindings: their extensions, names, match and refusal sentence (R1).
  - `src/backend/EtAlii.Adp.Designer/_Model/DesignerClaim.cs` and `DesignerDefinition.cs`: a claim made from bindings, in place of the hand-written fields (R1).
  - `src/backend/EtAlii.Adp.Hierarchy/`: `FirstLineCache` becomes a head cache (R2); `DesignerFileRouter` and `ToolRouter` offer several claimants (R6) and name an uninstalled type (R6).
  - `src/designers/knowledge/backend/EtAlii.Adp.Designer.Knowledge/Designer.cs` and `src/designers/hierarchical-requirement/backend/.../Designer.cs`: each names its bindings for its claim, and nothing else.
  - `src/designers/knowledge/backend/`: whatever R3 and R4 find the session, the link indexer or the relation targets need for a body with no registration.
  - `docs/creating-a-designer-module.md` (FR-007), `docs/architecture.md` if a sentence on routing is made false, `tests.md` (SC-003).
- **What changes in etalii.adp**: this plan, its research and tasks; then the ticks.
- **Tests**: xUnit beside each change, each written first and seen failing against the code it guards. They cover:
  - every knowledge example in YAML, JSON and XML opened with no registration, and its folder compared before and after (SC-001);
  - a copied file appearing in a watched hierarchy (SC-002);
  - the requirement designer's routing tests kept green;
  - every existing example and fixture routed as before (SC-005).
- **Checks**: the four gates (`npm test`, `npm run typecheck`, `dotnet format style --verify-no-changes --severity info`, `dotnet test`), with the full runs on the Mac mini (project rule of 2026-11-25), and `inspect.sh` before the push, since CI's inspection sees what `dotnet format` does not.
- **Constraints**: no core project names a tool type, an extension or a marker for routing (SC-004); no local functions in new C#; opening never writes (FR-002).
- **Unknowns**: whether a knowledge view setting writes a registration today (R3), and whether the link indexer and relation targets already take a bare file (R4); both are measured by a failing test first.

## Constitution Check

| etalii.adp principle | How this feature meets it |
|---|---|
| I. One source of truth | Routing reads the bindings' `claims`; nothing is copied into code. |
| II. Implementable from the document alone | FBL 12.1 to 12.3 and DED's envelope say all of it. |
| III. Precise normative language | No normative text changes. |
| IV. Versioned specifications | No definition changes. |
| V. Simplicity | One claim rule for any designer type, replacing one written for a single type. |
| VI. No Rider warnings in C# | `inspect.sh` before the push and on CI; no local functions. |

| Standalone principle | How |
|---|---|
| I. Specified, not coded | A designer type's routing comes from its binding; the requirement designer's hand-written claim goes. |
| II. The file is the source of truth | Opening writes nothing; a registration is written only as the binding says (FBL 8.4). |
| III. Four gates and a pull request | One pull request, the four gates, each guard seen to fail first. |
| IV. The documentation stays true | `creating-a-designer-module.md` says what a binding's marker does; `tests.md` holds the host test. |

## Project Structure

### Documentation (this feature)

```text
specs/093-standalone-bare-designer-files/
├── bare-designer-files.spec.md
├── plan.md
├── research.md
├── tasks.md
└── checklists/requirements.md
```

### Source code

The files named under *Technical Context*; no project is added.

## Delivery

| Pull request | Repository | Holds |
|---|---|---|
| A | etalii.adp | This plan, its research and tasks |
| B | standalone | The generic claim, the head cache and root-key reading, the knowledge and requirement designers on them, the documents (FR-001 to FR-007) |
| C | standalone | The host test's record in `tests.md`, and any fix it finds (SC-003) |
| D | etalii.adp | The ticks |

Each pull request has auto-merge on (merge commit). B and C name this feature's folder and the etalii.adp commit the tasks were taken from.

## Complexity Tracking

None.
