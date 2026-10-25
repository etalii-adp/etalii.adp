---
id: vscode-extension
type: module-design
title: "Extension host"
status: draft
parent: host-vscode
depends-on:
  - vscode-core
  - vscode-definitions
---
# Extension host

`src/extension`, part of `host-vscode`. It uses the core's frame, tool and FBL library, and holds the ATD client (`vscode-atd-client`) as its one submodule.

## Responsibility

Opens files and applies edits. Activation reads the definitions once, registers one custom text editor per tool type plus the `.adp` editor, registers the views, watches `**/*.adp` and keeps findings in step with the text. It turns splices into **one `WorkspaceEdit`** of the document and its registration together. Opening picks the tool by extension and marker, and text tabs of shared-extension files are reopened in the tool. Findings go to the Problems panel. It also holds the commands, the Toolbox and Properties views, the project-link picker, and the webview HTML with its CSP.

## Rules

- May use `vscode`. Has no DOM, and never imports the webviews.
- The text document is the only model, and FBL's own history is not used, so the platform's undo, dirty state, save, revert and hot exit work unchanged.
- Registration-only changes get a separate layout undo stack, with commands bound only while such a step is next.
- Webview CSP: `default-src 'none'`, scripts by nonce only. Inline styles are allowed, a small deviation from `principles-vscode`.
