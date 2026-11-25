# Implementation Plan: Links Between Tools in the Standalone Host

**Branch**: `claude/project-thread-2y63ay` (the cloud session's harness names it in every repository); the implementation's pull requests are named in *Delivery* | **Date**: 2026-11-25 | **Spec**: [standalone-links.spec.md](standalone-links.spec.md)

**Input**: the specification, approved by Peter on 2026-11-25 (decision card "Approve as written").

## Summary

The standalone host first learns to read what spec 089 added to the languages: DISL 0.12's `link` attribute type, `linkable`, `linked`, `persistence.documentId`, `lookup` and the 8-character `nanoid`, and FBL 17.2's document id with `{newid:document}`. With that, the timeline, dependency graph and mind map definitions are re-bundled and their served bindings take spec 089's change in the same pull request, which is what VS Code and the desktop host wait for (R0 to R4). The link's grammar and resolution go into the FBL library; a new core project keeps the workspace's index of documents, linkable elements and links per hierarchy root, from which links are resolved, findings given, cached names refreshed with the first edit, backlinks listed and the lookup searched (R1, R6). The canvas library treats a link generically, the lookup is one shell component on the existing interaction leg, and navigation rides the one workspace stream (R5). The mind map plugin reads and writes `adp-id` and `adp-link` (R7), and the knowledge designer moves its relations to links with its one-time conversion and a Notion-like picker (R8). VS Code then takes the served bindings, and the desktop host drops its copies (R9).

## Technical Context

- **Languages**: C# on .NET 10 (backend, modules), TypeScript with React (client), protobuf (`src/api`).
- **What changes in etalii.adp.ide.standalone**:
  - `src/backend/EtAlii.Adp.Specification.Disl/` (Loading, Model, Behavior): R2.
  - `src/backend/EtAlii.Adp.Specification.Fbl/` (Documents, Planning, Routing, a new `Links/`): R1, R3.
  - `src/backend/EtAlii.Adp.Links/` and `EtAlii.Adp.Links.Tests/` (new): the index, watching, resolution against it, backlinks, the lookup's search: R1.
  - `src/backend/EtAlii.Adp.Diagram.Modules/`, `EtAlii.Adp.Designer/`, `EtAlii.Adp.Context/`, `EtAlii.Adp.Workspace/`: pending load-time changes, the `lookup` interaction, "Open linked element", "Linked from (N)", the delete warning, the `reveal` stream member: R5, R6.
  - `src/api/`: the lookup's search call, the `lookup` interaction kind, the `reveal` member.
  - `src/client/src/canvas/library/disl/compileNotation.ts`, `src/client/src/shell/` (the lookup), `src/client/src/table/library/` (the relation picker): R5, R8.
  - `src/diagrams/{timeline,dependency-graph,mindmap}/definition/` re-bundled; their served `*.fbl` changed (R4); `src/diagrams/mindmap/backend/` plugin 0.2.0 (R7).
  - `src/designers/knowledge/definition/` re-bundled; its backend relations, conversion and picker (R8).
  - `docs/tools.md`, `docs/architecture.md`, `docs/solution-structure.md`, `docs/creating-a-diagram-module.md`, `docs/creating-a-designer-module.md`, `tests.md` where a check needs a running app.
- **What changes in etalii.adp.ide.vscode**: `definitions/timeline/timeline.fbl`, `definitions/dependency-graph/dependency-graph.fbl` and their `PROVENANCE.md` by `npm run sync-definitions`; `docs/disl-support.md`; `CHANGELOG.md` (Unreleased) and `README.md` where the timeline's and graph's sections gain linking.
- **What changes in etalii.adp.ide.desktop**: its two copied bindings removed, its timeline and dependency graph reading the bindings their definitions name (R9).
- **What changes in etalii.adp**: this plan, research and tasks; the ticks of this feature, of spec 089's T060 to T062 and of spec 091's T003.
- **Tests**: xUnit beside each backend change, vitest beside each client change, each written first and seen failing; the FBL conformance tests replay `specifications/fbl/fixtures/links-workspace/` (SC-003 to SC-005); the module tests open every existing example and fixture before and after (SC-001).
- **Checks**: the four gates (`npm test`, `npm run typecheck`, `dotnet format style --verify-no-changes --severity info`, `dotnet test`) in the worktree and on CI; `inspect.sh` on CI.
- **Constraints**: no core project names a tool type (architecture page, *How a diagram type plugs in*); no local functions in new C# (standalone `CLAUDE.md`); every edit one undoable command; an unchanged save byte-identical.
- **Unknowns**: none blocking. How far DESL 0.1 to 0.5 moves the knowledge designer is measured first in phase 6 (R0); whether the history needs a generic addition for R6 is tested first in phase 3.

## Constitution Check

*Checked after the research; nothing needs a recorded deviation.*

| etalii.adp principle | How this feature meets it |
|---|---|
| I. One source of truth | The link stays FBL 17's; definitions are re-bundled unchanged; the served bindings take spec 089's change and are then what VS Code and desktop copy. |
| II. Implementable from the document alone | Every behaviour is spec 089's, FBL 17's, DISL 4.12 and 9.4's, DESL 0.5's or a companion's. |
| III. Precise normative language | No normative text changes. |
| IV. Versioned specifications | The served bindings state the FBL version whose constructs they use. |
| V. Simplicity | One index, one lookup, one link treatment in the canvas library for every tool type. |
| VI. No Rider warnings in C# | `inspect.sh` on CI; no local functions. |

| Standalone principle | How |
|---|---|
| I. Specified, not coded | Links are read from the definitions; no core project names a tool type; what the modules keep (the mind map plugin's attributes, the knowledge relations) is code the companions already assign to them. |
| II. The file is the source of truth | Opening never writes (R6); an unchanged save is byte-identical (SC-001); every gesture is one undo step, the two-file knowledge steps included. |
| III. Four gates and a pull request | Every pull request below passes the four gates; each guard is seen to fail first. |
| IV. The documentation stays true | The architecture pages, the solution structure (a new project), the module walkthroughs and `docs/tools.md` change with the code that makes them false. |

## Delivery

Each pull request is one branch with auto-merge on (merge commit). A pull request outside etalii.adp names this feature's folder and the etalii.adp commit its tasks were taken from. Tasks are ticked in etalii.adp only once their pull request has merged, batched into tick pull requests.

| Pull request | Repository | Holds | Phase |
|---|---|---|---|
| A | etalii.adp | This plan, its research and tasks | |
| B | standalone | DISL 0.12 and FBL 17.2 read; the three diagram definitions re-bundled; their served bindings changed; the mind map plugin 0.2.0; linked elements drawn with their cached name (FR-001 to FR-006, US1) | 1, 2 |
| C | VS Code | The served bindings copied; timeline and dependency graph links recorded (FR-021) | 7 |
| D | desktop | The copied bindings removed (FR-022) | 7 |
| E | standalone | The link grammar and resolution, the index, findings, load-time validation, live names (FR-007 to FR-011, US4) | 3 |
| F | standalone | The lookup, navigation, "Linked from", the delete warning (FR-012 to FR-016, US2, US3) | 4 |
| G | standalone | The knowledge designer: re-bundle, links, conversion, picker, backlinks (FR-017 to FR-020, US5) | 5, 6 |
| H | standalone | The documents and the host tests' results (FR-023, FR-024, US6) | 8 |
| I | etalii.adp | The ticks, with spec 089's T060 to T062 and spec 091's T003 | 8 |

C and D follow B, and run beside E to G. The host tests (SC-002, SC-006 to SC-008, US6) run on the Mac mini once F and G have merged, the VS Code one once C has.

## Project Structure

```text
specs/092-standalone-links/
├── standalone-links.spec.md
├── plan.md
├── research.md
├── tasks.md
└── checklists/requirements.md
```

The contracts are spec 089's (`specs/089-cross-tool-links/contracts/`) and FBL 17; the wire additions are in `src/api` of the standalone host and are described in R5.

```text
etalii.adp.ide.standalone/src/
├── api/                                     lookup search, lookup interaction, reveal
├── backend/EtAlii.Adp.Specification.Disl/   link, linkable, linked, documentId, lookup, nanoid
├── backend/EtAlii.Adp.Specification.Fbl/    document.id, {newid:document}, Links/
├── backend/EtAlii.Adp.Links/                the index (new), with EtAlii.Adp.Links.Tests
├── backend/EtAlii.Adp.Diagram.Modules/, EtAlii.Adp.Designer/, EtAlii.Adp.Context/, EtAlii.Adp.Workspace/
├── client/src/canvas/library/disl/, client/src/shell/, client/src/table/library/
├── diagrams/{timeline,dependency-graph,mindmap}/   definition/, served *.fbl, mind map plugin
└── designers/knowledge/                     definition/, relations, picker
```

## Complexity Tracking

None is a violation. The risks are the size of pull request B, which is held to reading and drawing (no index, lookup or navigation), and the knowledge designer's step from DESL 0.1 to 0.5, measured before it is built; if it is larger than one pull request, phase 6 splits into the re-bundle and the links.
