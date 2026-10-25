---
id: standalone-client
type: module-design
title: Browser client
status: draft
parent: host-standalone
depends-on:
  - standalone-api
---

# Browser client

The React and TypeScript client that runs in the browser: the workspace shell and the shared libraries that draw every tool. Tool modules plug their client parts into these libraries rather than drawing surfaces of their own.

## Members

| Node | Folder | References |
|---|---|---|
| `standalone-canvas-library` | `src/client/src/canvas` | api |
| `standalone-table-library` | `src/client/src/table/library` | api |
| `standalone-hierarchy-surface-library` | `src/client/src/hierarchySurface/library` | api |
| `standalone-client-editors` | `src/client/src/editors` | api |
| `standalone-shell` | `src/client/src/shell`, `auth`, `pages` | api, the four libraries |

## Boundary

- **Never touches the filesystem.** It speaks only gRPC-Web through the contracts in `standalone-api`. Built with Vite, it is served by the host process as static files in production.
- **One stream per tab,** opened once in the shell and fanned out in process. One opener per kind of stream (`useDiagramStream`, `useTableStream`, `useHierarchySurfaceStream`).
- **Libraries own the interaction, modules declare.** Pan, zoom, drag, drop, selection, menus, scrollbars and inline editing belong to the libraries. Client guards forbid modules from keeping their own.
- **Names no tool type in the libraries.** Tool panels are found by globbing each module's `client/register.ts`.
- **Centralised styling** in theme tokens, with no inline styles. Heavy dependencies load through `import()`.
