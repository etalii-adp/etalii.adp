---
id: standalone-canvas-library
type: submodule-design
title: "Canvas library (client)"
status: draft
parent: standalone-client
depends-on:
  - standalone-api
---
# Canvas library (client)

`src/client/src/canvas`, part of `standalone-client`.

## Responsibility

The shared SVG canvas every diagram draws on (`canvas/library/DiagramCanvas.tsx`). A module supplies a *definition* (element types, relations, shapes, segments, rulers, filters and layout modes), and the library owns pan, zoom, drag, connect, drop, selection, context menus, scrollbars and the inline label editor. `canvas/library/disl/compileNotation.ts` compiles DISL notation on the client.

## Rules

- SVG, not WebGL, Konva or PixiJS.
- Large diagrams are handled by drawing less: the client draws only what is visible and reports its viewport, so the backend can choose what to send.
- Modules are declarative. A module keeps no selection, gestures, label editors or scrollbars of its own, and never reaches into library shapes. Client guards enforce this: `declarativeModules`, `noModuleSelection`, `noPrivateGestures`, `noPrivateLabelEditors`, `noPrivateScrollbars`, `noModuleReachesLibraryShapes`, `themeTokens` and others.
- `useDiagramStream` is the only code that opens a diagram stream.
