---
id: vscode-plugins
type: submodule-design
title: "Plugins: per-tool-type code"
status: draft
parent: vscode-core
depends-on:
  - vscode-frame
---
# Plugins: per-tool-type code

`src/core/plugins/<id>`, part of `vscode-core`.

## Responsibility

The **only** place where code for one tool type may live:

- persistence for Freeplane `.mm` and for Agent Behavior Modelling Markdown;
- the mind map layout;
- the Agent Behavior Modelling arrange action;
- the project-link picker;
- Knowledge's view logic.

## Rules

- Every plugin is registered in `plugins/index.ts` and named by the definition that uses it.
- `knowledge-views` is the exception: no definition names it, it is registered by origin, and etalii.adp issue 162 asks DESL to cover it.
