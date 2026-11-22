# Implementation Plan: Export a Causal Loop Diagram's Flow Page from VS Code

**Branch**: `features/082-vscode-cld-flow-export` in `etalii.adp.ide.vscode` | **Date**: 2026-11-22 | **Spec**: [vscode-cld-flow-export.spec.md](vscode-cld-flow-export.spec.md)

**Input**: the specification, approved by Peter on 2026-11-22 (decision card "Approve, then build"), with his placement of the menu item the same day.

## Summary

VS Code's causal loop diagram gains spec 074's Export flow page. The page is the desktop host's: its template is copied unchanged and its generator ported, so the same diagram gives the same bytes (R1 to R3). The export is code for one tool type, carried by origin beside the reading logic, offered by the tool type as an action of the diagram's menu and answered by the extension, which writes the page beside the `.cld`, opens it and says where (R4, R6). One ADP command per export reaches it from the Command Palette, the Explorer, the editor tab and an ADP submenu in the editor title bar (R5).

## Technical Context

- **Language**: TypeScript 5, as the extension is.
- **What changes in `etalii.adp.ide.vscode`**:
  - `src/core/tool/pluginRegistry.ts`: `ExportLogic` by origin; `src/core/frame/toolType.ts`: the outcome `export`, `ToolType.exports` and `exported`; `src/core/tool/toolTypeFrom.ts`: the actions and the page.
  - `src/core/plugins/cld-flow-page/`: the generator, `template.ts` and `PROVENANCE.md`; registered in `src/core/plugins/index.ts`.
  - `scripts/sync-flow-page.mjs` and the Build workflow's check of it.
  - `src/extension/exports.ts` (new), `toolEditor.ts`, `commands.ts`, `extension.ts`; `package.json` (the command, the submenu, the menus).
  - `fixtures/tools/causal-loop-diagram/flow-pages/`: the desktop host's six pages and their provenance.
  - `docs/disl-support.md`, `docs/parity.md`, `docs/tools.md`, `README.md`.
- **Tests**: vitest, written first and seen failing: `test/core/plugins/cld-flow-page/flowPage.test.ts` (name, numbers, escaping, data, the six pages against the desktop host's), `test/core/tool/` for the action and the outcome, `test/extension/` for the manifest; `test/vscode/` for the command writing a page.
- **Checks**: `npm run check`, `npm run test:unit`, `npm run sync-definitions -- --check`, `node scripts/sync-flow-page.mjs --check`; `npm run test:vscode` in CI.
- **Constraints**: VS Code principles I to V; nothing under `src/core/disl/`, `scene/` or `tool/` names a tool type; no network.

## Constitution Check

| Principle | How |
|---|---|
| etalii.adp I. One source of truth | The page is the desktop host's template, copied with its provenance; no definition changes. |
| etalii.adp V. Simplicity | One plugin folder, one command per export, no dependency. |
| VS Code I. Native citizenship | Commands in category ADP, platform menus, notifications and `openExternal`; the export is no edit. |
| VS Code II. The text file is the source of truth | The export writes only the page; the document and its registration are untouched. |
| VS Code III. One frame, many tools | Exports are carried by origin; the frame, its menus and the ADP submenu name no tool type. |
| VS Code IV. Test-first | Each task's test is written first and seen failing. |
| VS Code V. Simplicity | No library: the page is a string with two markers filled. |

## Delivery

One pull request in `etalii.adp.ide.vscode` from `features/082-vscode-cld-flow-export`, with auto-merge on (merge commit), naming this folder and the etalii.adp commit of these tasks; then one tick pull request here.
