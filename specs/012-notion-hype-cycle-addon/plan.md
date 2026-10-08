# Implementation Plan: The Gartner Hype Cycle Graph as a Notion Add-on

**Branch**: `features/012-notion-hype-cycle-addon` | **Date**: 2026-10-08 | **Spec**: [notion-hype-cycle-addon.spec.md](notion-hype-cycle-addon.spec.md)

**Scale note**: this change spans three repositories (`etalii.adp`, `etalii.adp.ide.notion`, `etalii.adp.site`), about 110 files, a hosted service that is new to the organization, and ten sets of pages in the Notion workspace. Nearly all of the code is new: no host has a DISL interpreter yet, so the one written here is the first, and it is the bulk of the work. Watch three things. The interpreter stays free of the hype cycle graph's own words, which a test enforces. The service needs two steps only a maintainer can do: registering the Notion integration and creating the Cloudflare account. And four requirements are at risk, two of them only with the largest example; [research.md](research.md) R1 to R4 name them.

## Summary

The Gartner hype cycle graph becomes the first Notion add-on, at `https://etalii.net/adp-notion/gartner-hype-cycle-graph/`. A Notion page shows it in an embed block whose address names the database that is the graph's store.

The add-on is a static page built from six shared parts that name no tool type: a DISL interpreter, the FBL library, a command history, a store that keeps a document as rows of a Notion database, a canvas, and two panels (toolbox and property grid) styled as Notion's own. The add-on's folder holds only what is particular to it: a page, and a copy of its DISL specification and FBL binding taken unchanged from their repositories by a script.

The FBL library is not written again. It is the Visual Studio Code host's `src/core/fbl`, copied unchanged with its source recorded, as that host already copies its examples. It gives the reading and the edits as splices. The store reads the rows of a database through the binding and resolves each splice of an edit to the rows and properties it lands on, so the binding stays the one description of the format, and one edit becomes exactly the row writes it implies. Undo and redo are a command history of the add-on's own, a shared part after the standalone application's `EtAlii.Adp.History`.

A page in an embed block cannot call the Notion API: the API refuses browsers, and a token in the page would be a published secret. So the feature adds one small service, a Cloudflare Worker, that completes Notion's sign-in and forwards the add-on's calls with the token of the person looking at the page. This amends the Notion repository's principle that publication is by GitHub Pages only.

The repository gains a compile step and its first dependencies: TypeScript, esbuild and vitest, as in the Visual Studio Code host, and a CEL library for the DISL expressions. The command the site's deployment runs stays `node scripts/build.mjs --out <dir>`; the script installs what it needs itself.

## Technical Context

**Language/Version**: TypeScript 5.9 compiled for browsers by esbuild; Node 24 for the build, the scripts and the tests (the version in the site's `.nvmrc`); the service is TypeScript on Cloudflare Workers.
**Primary Dependencies**: `typescript`, `esbuild`, `vitest`, `jsdom` (development); `yaml`, which the copied FBL library imports; `@marcbachmann/cel-js` for CEL (research D7); `wrangler` to deploy the service. No user-interface framework: plain DOM and SVG, as the Visual Studio Code host's webviews.
**Storage**: a Notion database per graph, through the Notion API version `2026-03-11`. The person's access token is kept in the browser's storage for the add-on's origin; no document is.
**Testing**: vitest for the interpreter, the store against an in-memory Notion, the history, and the panels in jsdom; the nine examples and the shared fixtures as test documents; a words test for FR-004; the build script's own check in `Build`; a manual pass in a Notion page for what only Notion shows (embedding, sign-in, both appearances, keyboard focus).
**Target Platform**: desktop browsers showing a Notion page; the page is read-only usable on a phone.
**Performance Goals**: SC-002 (50 trends in 3 seconds) and SC-004 (canvas in 100 milliseconds, database in 5 seconds).
**Constraints**: Notion allows about three requests a second per integration and 100 rows per query; no secret in a published page; every address under `/adp-notion`; no page may refuse to be framed.
**Scale/Scope**: nine examples of 36 to 518 rows; about 60 source files and 30 test files in the Notion repository.

## Constitution Check

*Gate before Phase 0, re-checked after Phase 1.*

`etalii.adp` constitution 1.6.0:

| Principle | Assessment |
| --- | --- |
| I. One Source of Truth | PASS. The add-on interprets the DISL specification and the FBL binding and changes neither (FR-003). Where the specification leaves something unstated, the feature raises an issue in `etalii.adp` and lists it in the add-on's support document. |
| II. Implementable from the Document Alone | PASS. No specification, schema or example is touched. |
| III. Precise Normative Language | PASS. The amended principles keep the RFC 2119 key words. |
| IV. Versioned Specifications | PASS. No specification version changes. The `.dis` says `0.3` and points at the `0.2` schema; that is raised as an issue, not corrected here. |
| V. Simplicity | PASS. The interpreter supports what this specification uses and lists the rest. The FBL library is reused, not rewritten. |
| VI. No JetBrains Rider Warnings in C# | PASS. No C# is written. |
| Structure and Naming | PASS. The glossary gains "store" before any file uses it. |
| Development Workflow | PASS. One feature here, one branch and pull request per repository, merge commits. |

`etalii.adp.ide.notion` principles 1.0.0:

| Principle | Assessment |
| --- | --- |
| I. One Source of Truth | PASS after amendment. The add-on's folder holds copies of its specification and binding, taken byte for byte by `scripts/sync-specifications.mjs` with the commit and a SHA-256 recorded, and `Build` fails when a copy differs from its record. A copy that cannot be edited is not a restatement. The principle says bindings are "in etalii.adp"; this one is in `etalii.adp.ide.standalone`, so the wording becomes "the binding its specification names". The add-on's id is the name of its specification's file, `gartner-hype-cycle-graph`, where the principle says "the id of that tool type": a deviation, recorded in Complexity Tracking and removed by the same amendment. |
| II. Every Address under `/adp-notion` | PASS. The add-on is `/adp-notion/gartner-hype-cycle-graph/`, its resources are relative, and no page refuses a frame. The service has an address of its own, which is not a published page. |
| III. Truthful About What Exists | PASS. The index stays generated. `README.md`, `CLAUDE.md` and `addons/README.md` say what is published, and the support document lists what the add-on does not do. |
| IV. Simplicity | Justified violation, removed by amendment. See Complexity Tracking. |
| Publication and Technology Constraints | PASS after amendment: the service is named beside GitHub Pages, and "no `npm install` before it" becomes "the script installs what it needs". A pull request still publishes nothing and sees no secret. |

`etalii.adp.site` principles 1.2.0:

| Principle | Assessment |
| --- | --- |
| II. Sourced, Never Retyped | PASS. The Notion host entry and the tool's availability are refreshed from the Notion repository's `README.md` by the site's written procedure, with the revision recorded. |
| III. Truthful About What Exists | PASS. The site says the tool is available in Notion only after the add-on's pull request is merged and deployed. |
| VI. Simplicity | PASS. The deployment workflow does not change: it runs the same command. |
| Hosting and Content Constraints | PASS. Nothing under `src/` reads a Notion add-on. |

Re-check after Phase 1: unchanged. The design adds no dependency, service or file kind beyond those named here.

## Complexity Tracking

| Violation | Why needed | Simpler alternative rejected |
| --- | --- | --- |
| Notion principle IV: "Publication is by GitHub Pages only", and no hosting service without a current requirement | FR-010 and FR-018: the add-on must read and write a Notion database with the rights of the person looking at the page. The Notion API answers no browser, and completing Notion's sign-in needs a client secret that cannot be in a page. | A token in the page: a published secret, against FR-010. A read-only add-on fed from a file: fails Stories 2 and 3. A Notion custom block: decided against on 2026-10-08, because it is in alpha and leaves `/adp-notion`. |
| Notion constraint "no `npm install`", and principle IV on dependencies and build steps | FR-027 and FR-028 need parts shared by every add-on, and the FBL library is TypeScript with one dependency. | Hand-written JavaScript modules copied into each add-on's folder: no types, no tests, and a second copy per add-on. |
| Notion principle I: "`<id>` is the id of that tool type" | A tool type is identified by its origin, `gartner/hypecycle-graph`, and its language id, `net.etalii.adp.gartner.hypecycle-graph`; neither is a valid `<id>` (research D11). The id is the name of the specification's file without its extension, the one spelling `etalii.adp` itself uses, and the wording of the principle becomes that. | `gartner-hypecycle-graph`, the origin with a dash: a second spelling beside the file's, and a folder that no longer says which file it copies. |

The principles of `etalii.adp.ide.notion` go to 1.1.0 (MINOR) through `/speckit-constitution`, in the `etalii.adp` pull request of this feature.

## Project Structure

### Documentation (this feature)

```text
specs/012-notion-hype-cycle-addon/
├── notion-hype-cycle-addon.spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   ├── addon-address.md      # the embed address and what the page shows
│   ├── store.md              # the database: properties, kinds, order
│   ├── service.md            # the service's endpoints
│   ├── published-tree.md     # replaces spec 011's contract of that name
│   └── shared-parts.md       # what a second add-on codes against
└── tasks.md                  # written by the tasks step
```

### Source Code

```text
etalii.adp/
├── docs/terminology.md                                  # gains "store"
├── definitions/diagrams/gartner-hype-cycle-graph.md     # its Notion row section; the .dis is untouched
├── .specify/memory/repositories/etalii.adp.ide.notion.md  # 1.0.0 to 1.1.0
└── specs/011-notion-repository/contracts/published-tree.md  # a line pointing at its successor

etalii.adp.ide.notion/
├── package.json, package-lock.json, tsconfig.json, vitest.config.mts, eslint.config.mjs
├── addons/
│   ├── README.md
│   └── gartner-hype-cycle-graph/
│       ├── index.html
│       ├── addon.json                  # names the specification and binding files
│       ├── gartner-hype-cycle-graph.dis    # copied, never edited
│       ├── gartner-hype-cycle-graph.fbl    # copied, never edited
│       └── PROVENANCE.md
├── src/
│   ├── fbl/            # copied from etalii.adp.ide.vscode src/core/fbl, with PROVENANCE.md
│   ├── disl/           # the interpreter, one module per section of a specification
│   │   ├── specification.ts, expressions.ts, metamodel.ts, coordinates.ts, notation.ts
│   │   ├── toolbox.ts, forms.ts, constraints.ts, behavior.ts, layout.ts, viewpoints.ts
│   │   ├── persistence.ts              # typeMap: binding elements to the metamodel
│   │   └── support.ts                  # the features it supports, checked against requires
│   ├── history/        # command.ts, dispatcher.ts, historyStack.ts: undo and redo for any document
│   ├── store/
│   │   ├── rows.ts                     # rows to document text and back, through the binding
│   │   ├── schema.ts                   # the properties a binding asks of a database
│   │   ├── notion.ts                   # the calls, queued under Notion's rate limit
│   │   ├── session.ts                  # sign-in and the token
│   │   ├── document.ts                 # open, edit, undo, redo, failed writes
│   │   ├── writes.ts, drift.ts         # a splice to its row writes; rows changed by somebody else
│   │   └── handlers.ts                 # the commands of an open document
│   ├── canvas/         # SVG drawing and gestures from the interpreted notation
│   ├── panels/         # toolbox.ts, propertyGrid.ts, controls.ts, panels.css, notion.css
│   ├── shims/          # node-crypto.ts, which esbuild puts in the place of node:crypto
│   └── frame/          # main.ts, page.ts, config.ts, and parts/: one module per story's wiring
├── service/
│   ├── handler.ts                      # the service, knowing no platform
│   ├── worker.ts, wrangler.toml        # the Cloudflare Worker around it, built last
│   └── README.md
├── scripts/
│   ├── build.mjs                       # gains the compile step
│   ├── ensure-dependencies.mjs
│   ├── sync-specifications.mjs, sync-fbl.mjs, sync-examples.mjs
│   ├── service.mjs                     # the local service: the same handler on http://localhost:8787
│   └── store.mjs                       # put a .ghg into a database, take one out
├── test/               # mirrors src/, plus examples/, fixtures/ and words.test.ts
├── docs/
│   ├── disl-support.md                 # FR-005
│   ├── styling.md                      # NFR-004
│   ├── set-up-a-graph.md               # SC-009
│   └── service.md
├── .github/workflows/build.yml         # gains the test job and the service's deployment
└── README.md, CLAUDE.md

etalii.adp.site/
├── src/data/hosts.yaml                 # the notion entry, refreshed by procedure
└── the tool catalogue's source record for Notion
```

The Notion workspace is no repository: the Showcase gains one entry per example, and the "Tools" database a state for the Notion host.

**Structure Decision**: shared code lives in `src/` and is compiled into each add-on's folder at build time, because every folder directly under `addons/` is published as an add-on and a shared folder there would be listed as one. An add-on's folder holds what is particular to it and nothing else, so a second add-on is a folder with a page, an `addon.json` and its copied specification. The build bundles `src/frame/main.ts` together with every module directly under `src/frame/parts/`, so that each story's wiring of the frame is a file of its own.

## Delivery

Each repository gets a branch `features/012-notion-hype-cycle-addon` and its own pull request, in this order:

1. `etalii.adp`: the glossary's "store", the amended Notion principles, this feature's folder. It merges first, because the others cite it.
2. `etalii.adp.ide.notion`: everything under Source Code for that repository. Before it merges, a maintainer registers the Notion integration and creates the Cloudflare account and its two secrets ([contracts/service.md](contracts/service.md)). The Worker is built and deployed last: until then the service is the local one, `node scripts/service.mjs`, which also serves the first pass in Notion, made before any story is built (research R4).
3. The Notion workspace: the first graph, then the eight other examples, filled with `scripts/store.mjs`. This needs the add-on published.
4. `etalii.adp.site`: the host entry and the catalogue, once the add-on is live, so that nothing is claimed early.
5. `etalii.adp` again: the ticked tasks, the record of the delivery, and the Notion row section of `definitions/diagrams/gartner-hype-cycle-graph.md`.

A task whose code lands in another repository is ticked only when that repository's pull request is merged.
