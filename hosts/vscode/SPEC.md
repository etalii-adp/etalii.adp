---
id: host-vscode
type: module-design
title: Visual Studio Code host (etalii.adp.ide.vscode)
status: draft
parent: hosts
depends-on:
  - disl
  - desl
  - ded
  - fbl
  - atd
  - definitions
  - host-desktop
references:
  - principles-vscode
  - host-standalone
  - host-notion
---

# Visual Studio Code host (`etalii.adp.ide.vscode`)

One VS Code extension (`adp`, shipped as a `.vsix`) for people who work in VS Code and want ADP's diagrams and designers on files kept in version control, files that agents often read too. Its principles are `principles-vscode`. It is specified by specs 006, 009, 027 and 035.

## State

In progress. Five prototype tool types are interpreted from their definitions:

| Tool type | Kind | Files |
|---|---|---|
| Gartner hype cycle graph | diagram | `.ghg` |
| Agent Behavior Modelling | diagram | `.md`, layout in an `.adp` beside it |
| Mind map | diagram | Freeplane `.mm` |
| Agent activity diagram | diagram | `.aad` |
| Knowledge | designer | `.yaml`, `.json`, `.xml`, `.ded` |

`.atd` files get language support and an editor. Not built:

- the editor kind;
- clipboard;
- the three diagrams that need their own persistence plugin instead of FBL (timeline, dependency graph, .NET dependency graph).

## Shape

- **Custom text editors.** One custom *text* editor per tool type, plus one for `*.adp` that opens its diagram. Why: the platform's undo, redo, dirty state, save, revert, hot exit and "Open With" all keep working unchanged.
- **Bundles and webviews.** Four esbuild bundles: the extension host, an ATD worker, and browser webviews for the canvas, the table, ADP Properties and the ADP Toolbox. The last two live in an "ADP" activity-bar container.
- **Shared extensions.** Tool types that share a file extension (Markdown, YAML, JSON, XML) are registered as an `option` and reopened in the tool when their marker matches, because a manifest selector can match only file names.

## Subsystems

Lint rules and a words test enforce the layering.

- **`src/core/`:** definitions, files, models, rules and edits. It must not import `vscode`, the extension or the webviews, and must not touch the DOM. Only two FBL files may use `node:*`.
  - **`frame`:** the single `ToolType` contract (claims, findings, view, toolbox, fields, actions, `edit`, `newDocument`) and the webview protocol.
    - `edit` returns an `EditOutcome`: applied with splices, refused with a sentence, confirm, or one of several follow-ups.
    - A request made on a stale document version is cancelled.
    - Everything is JSON-serialisable.
  - **`disl`:** a DISL interpreter (conformance class `standard`) for metamodel, expressions, coordinates, notation, layout, constraints, behaviour, toolbox, forms, persistence and viewpoints. It came from the Notion host and is now owned here. `support.ts` must match `docs/disl-support.md`.
  - **`desl`:** what DESL 0.1 adds: specification, the table surface and operations.
  - **`scene`:** a model turned into shapes, lines and labels with geometry.
  - **`tool`:** `toolTypeFrom` turns a vendored definition folder into a `ToolType`. Alongside it: table views, model changes (one gesture is one composed splice set, which is one undo step), claims, the plugin registry and registration layout.
  - **`fbl`:** a generic FBL library, *Host, declared*, for yaml, json, xml, lines and blocks; FBL 0.1–0.6 plus 0.8's insert `constant`.
    - It is a port of the standalone host's library and names no tool type or binding.
    - It is exposed as `AdpApi.fbl`.
    - The Notion host copies it from here and never edits it.
  - **`plugins/<id>`:** the **only** place where code for one tool type may live:
    - persistence for Freeplane `.mm` and Agent Behavior Modelling Markdown;
    - the mind map layout;
    - the Agent Behavior Modelling arrange action;
    - the project-link picker;
    - Knowledge's view logic. This is an exception: no definition names it, and etalii.adp issue 162 asks DESL to cover it.
- **`src/extension/`:** may use `vscode`, has no DOM and must not import the webviews. It opens files and applies edits: splices become **one `WorkspaceEdit`** of the document and its registration together. It also reports findings to the Problems panel, and holds the commands, the Toolbox and Properties views, the webview HTML with its CSP, and the ATD client and worker.
- **`src/webview/`:** thin renderers for the diagram (SVG), the table, properties and the toolbox. They must not import `vscode` or the extension, and may import only types and pure geometry from the core. They compute nothing specific to a tool type; during a drag they show a stand-in until the edit's scene comes back.

## How it consumes the specifications

- `definitions/<tool>/` holds byte-for-byte copies of `.dis`/`.des`, `.fbl` and companions from `origin/develop` of etalii.adp and the standalone host, with `PROVENANCE.md`.
- `npm run sync-definitions` refreshes the copies and generates the `package.json` entries for each tool type. Its `--check` runs in CI.
- Approach 2 of `architecture` *Tool-type approaches*: DISL 0.4, DESL 0.1 (table surface) and FBL are interpreted, and CEL is evaluated through cel-js.
  - A newer minor version opens with a warning, and a different major version is not loaded.
  - Unsupported constructs fall back to the nearest supported one, with a finding.
  - The full matrix is in `docs/disl-support.md`, held to the code by a test.
- There is no generic DID handling; the document is the domain file read through FBL.
- **ATD:** a TextMate grammar generated in etalii.adp, plus the desktop host's `atd-lsp` compiled to wasm. It runs on a worker thread with no child process or socket, and is fetched from the `atd-v0.1.0` release with a SHA-256 pin.

## Rules and decisions

- **The text document is the only model.** Every change is FBL splices applied as one `WorkspaceEdit`, so the platform's undo works and unrelated bytes are kept. FBL's own history is not used.
- **Registration-only changes** (row drags and Arrange in Agent Behavior Modelling) get their own layout undo stack, with commands bound only while such a step is next, because the body's undo has nothing to take back.
- **One frame, many tool types.** No tool-type names in generic folders. A plugin is the only escape, and any other exception needs a row in the support record.
- **Webviews are thin and the core is headless,** so the core is testable and shareable. The shared text metric (0.55 × font size per UTF-16 unit) gives every host the same boxes.
- **Webview CSP:** `default-src 'none'`, scripts by nonce only. Styles allow `'unsafe-inline'`, a small deviation from the principles.
- **No network at run time.** Vendored inputs are pinned and verified: definitions, examples, FBL fixtures and the ATD release.
- **The definition is the reference, and standalone is the worked example.** Disagreements are raised as etalii.adp issues and never settled here.

## Process

Changed through Spec Kit features in this repository. Tests run at three levels: vitest for the core and webviews, and `@vscode/test-electron` against the packaged extension. CI runs file checks, the plug-in job (sync check, lint, unit and VS Code tests, `.vsix` artifact), a development pre-release from `develop`, and the terminology check.
