# Implementation Plan: The Tools on DISL and FBL in Visual Studio Code

**Branch**: `features/027-vscode-disl-fbl-tools` | **Date**: 2026-10-12 | **Spec**: [vscode-disl-fbl-tools.spec.md](vscode-disl-fbl-tools.spec.md)

**Input**: Feature specification from `specs/027-vscode-disl-fbl-tools/vscode-disl-fbl-tools.spec.md`

## Summary

The Visual Studio Code plug-in learns to read a tool type from its definition. It gets a DISL interpreter in `src/core/disl/`, seeded from the Notion add-ons' interpreter (research R1), and one generic implementation of the frame's existing `DiagramType` contract that turns a definition, its FBL binding and its plugins into a diagram type (R2). The definitions are copied unchanged from `etalii.adp` with their provenance and checked on every pull request (R6).

On that, in order: the mind map, with its `.mm` reader and layout plugins (R3); the agent activity diagram, which brings DISL 0.4 (R4); the Knowledge designer, which brings a DESL interpreter, a second contract for designers and a table surface (R5); and last the hype cycle graph and Agent Behavior Modelling, moved from their hand-coded modules onto their definitions (R9). Each is one pull request into `etalii.adp.ide.vscode` (R10).

## Technical Context

**Language/Version**: TypeScript 5.9, strict, Node.js 22 or later, as the repository has it.

**Primary Dependencies**: adds `@marcbachmann/cel-js` 8 (MIT), which the Notion interpreter evaluates CEL with. Keeps `yaml` 2, esbuild, ESLint, Vitest, `@vscode/test-cli`, `@vscode/vsce`.

**Storage**: the document's text in Visual Studio Code's text document, and the `.adp` registration beside it, as today.

**Testing**: Vitest for `src/core` and the webview (`test/core/`, `test/webview/`); Mocha in a real Visual Studio Code against the packaged plug-in (`test/vscode/`). The examples and fixtures of each tool type are copied from standalone by the existing `scripts/sync-examples.mjs`.

**Target Platform**: desktop Visual Studio Code 1.140 or later.

**Project Type**: a Visual Studio Code extension with webviews.

**Performance Goals**: an example opens and an edit is drawn within what the hand-coded types take today on the same machine, within a factor of two.

**Constraints**: byte-identical save without an edit; an edit changes only its splices; no network; nothing under `src/core/disl/`, `src/core/desl/` or `src/core/disl-tool/` names a tool type (a test reads them for the names in every copied definition, as Notion's `test/words.test.ts` does).

**Scale/Scope**: 5 tool types, 3 of them new to this host; about 4,900 lines of interpreter taken in, DISL 0.4 and a first DESL interpreter added; 5 plugins (3 for the mind map, 2 for Agent Behavior Modelling).

## Constitution Check

### This repository (`etalii.adp`)

| Principle | Status | Note |
|---|---|---|
| I. One Source of Truth | Pass | The definitions are copied unchanged and read; a difference is raised here (FR-018). |
| II. Implementable from the Document Alone | Pass | The feature is the test of it for DISL 0.4 and DESL 0.1; where a document is not enough, the question is filed here. |
| III. Precise Normative Language | Pass | No specification text is written. |
| IV. Versioned Specifications | Pass | The support record names the DISL and DESL versions read. |
| V. Simplicity | Pass | One interpreter reused, one generic type. |

### The VS Code repository (1.0.0)

| Principle | Status | Note |
|---|---|---|
| I. Native Visual Studio Code Citizenship | Pass | Custom editors, the text document's undo, Problems, Quick Open for links, `vscode.open` for `open`, platform dialogs. |
| II. The Text File Is the Source of Truth | Pass | FBL splices on the document's text; mixed line endings as recorded in `docs/parity.md` (R7). |
| III. One Frame, Many Tools | Pass | One generic type for every DISL tool, one for DESL; the core depends on neither Visual Studio Code nor a browser. "A tool type's behaviour MUST be what its definition states" is now true by construction. |
| IV. Test-First, Against Real Files | Pass | Every tool type is tested against its standalone examples and fixtures, copied with provenance; each new type has in-editor tests. |
| V. Simplicity | Pass, one entry below | |

## Project Structure

### Documentation (this feature)

```text
specs/027-vscode-disl-fbl-tools/
├── vscode-disl-fbl-tools.spec.md
├── plan.md
├── research.md
├── tasks.md
└── checklists/requirements.md
```

### Source Code (`etalii.adp.ide.vscode`)

```text
definitions/<tool>/          # copied .dis/.des, .fbl, .md, with PROVENANCE.md (R6)
scripts/sync-definitions.mjs # copy and --check
src/core/disl/               # the DISL interpreter, seeded from Notion (R1), ORIGIN.md
src/core/desl/               # the DESL interpreter (R5)
src/core/disl-tool/          # diagramTypeFrom: a definition as a DiagramType (R2)
src/core/desl-tool/          # designerTypeFrom: a definition as a DesignerType (R5)
src/core/plugins/<id>/       # freeplane-mm, mindmap-layout, abm-markdown, abm-arrange
src/core/frame/designerType.ts
src/extension/               # registration of the new types, Quick Open link picker, open
src/webview/diagram/         # shapes, anchors and icons the definitions need, once for all
src/webview/table/           # the designer's table surface
docs/disl-support.md         # the support record (FR-004)
docs/parity.md, docs/tools.md
test/core/disl/, test/core/disl-tool/, test/core/desl/, test/core/plugins/, test/webview/table/, test/vscode/
```

## Complexity Tracking

| Item | Why needed | Simpler alternative rejected because |
|---|---|---|
| A second frame contract, `DesignerType` | A table has rows, columns and views, not boxes and relations | Forcing a table through `DiagramType` would make every field of its view model mean something else for one type |
