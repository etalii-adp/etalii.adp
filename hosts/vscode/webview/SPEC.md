---
id: vscode-webviews
type: module-design
title: "Webviews"
status: draft
parent: host-vscode
depends-on:
  - vscode-core
---
# Webviews

`src/webview/{diagram,table,properties,toolbox}`, part of `host-vscode`.

## Responsibility

Thin renderers: the diagram canvas (SVG with ruler, menu, inline editor and icons), the table, ADP Properties and the ADP Toolbox. They draw what they are sent.

## Rules

- They never import `vscode` or the extension, and from the core only types (from `frame`, `scene` and the table view) plus pure geometry.
- They compute nothing specific to a tool type. During a drag they show a stand-in, and the result is applied when the edit's scene comes back.
- Labels are HTML in `foreignObject`.
