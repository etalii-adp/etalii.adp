---
id: standalone-specification-runtimes
type: module-design
title: Specification runtimes
status: draft
parent: host-standalone
depends-on:
  - standalone-foundation
  - disl
  - fbl
---

# Specification runtimes

The standalone host's interpreters of `etalii.adp`'s languages: CEL, the shared loader plumbing, FBL and DISL. This is where approach 2 of `architecture` *Tool-type approaches* lives: a tool type's vendored definition and binding are read and acted on generically, and what they cannot express stays in its module as residue.

## Members

| Node | Project | References (production) |
|---|---|---|
| `standalone-cel` | `EtAlii.Adp.Specification.Cel` | — |
| `standalone-spec-json` | `EtAlii.Adp.Specification.Json` | — |
| `standalone-fbl` | `EtAlii.Adp.Specification.Fbl` | primitives, Cel, Json |
| `standalone-disl` | `EtAlii.Adp.Specification.Disl` | Cel, Fbl, Json |

## Boundary

- **Names no tool type.** The runtimes know the languages, never a particular definition.
- **Depends only on the foundation's primitives,** never on sessions, workspace services or the host.
- **Defines nothing of its own.** A need a runtime finds, or an output a language leaves undecided, goes to `etalii.adp` as a specification change, never into the runtime alone (`hosts`).
- **Ported elsewhere.** The IntelliJ and VS Code hosts ported this FBL library with byte parity, and the desktop host ported all four. A behaviour change here is a parity change for them.
- **Not here:** DESL and DED have no runtime project of their own. The surface models DESL names live in `standalone-designer`, and a designer type's module reads its own `.des` and DED envelope (`standalone-designer-modules`). There is no ATD runtime in this host.
