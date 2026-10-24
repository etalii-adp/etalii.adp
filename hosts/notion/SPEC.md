---
id: host-notion
type: module-design
title: Notion host (etalii.adp.ide.notion)
status: draft
parent: hosts
depends-on:
  - disl
  - fbl
  - host-vscode
references:
  - principles-notion
  - host-standalone
  - site
---

# Notion host (`etalii.adp.ide.notion`)

ADP's diagrams inside Notion. A **Notion add-on** is a static web page shown in a Notion embed block, one page per tool type, at `https://etalii.net/adp-notion/<id>/?store=<database id>`. One published add-on serves any number of graphs, each stored in a Notion database. Its principles are `principles-notion`: one source of truth, stable embeddable addresses, truthfulness about what exists, and simplicity. It is specified by specs 011 and 012.

## State

In progress. One add-on, the Gartner hype cycle graph, covers viewing, editing, the toolbox, the property grid, undo and redo, and database preparation, in the browser and the Notion desktop app. Without `store`, the page offers a database chooser, prepares the database and patches its own embed block's address. Any further DISL diagram with an FBL binding is meant to become an add-on as a folder, with no code. Only diagrams are supported: no designers, editors, DESL/DED, DID or ATD.

## Shape

- **Pages:** TypeScript bundled into one `addon.js`/`addon.css`, copied into every add-on folder, with a generated `index.html` that names the git revision. They are published through `etalii.adp.site`'s GitHub Pages deployment (`site`), because a Pages deployment replaces the whole domain. One build command is the entire contract with the site.
- **Service:** a Cloudflare Worker with one Durable Object. It holds a whitelist of 13 Notion API calls (anything else is refused) and the OAuth endpoints.
  - **Why it exists:** the Notion API sends no CORS headers, and OAuth needs a client secret.
  - **Why a Durable Object:** KV can answer "not there" for up to a minute after a write.
  - **The only state it keeps** is the grant in progress (at most 120 s, read once), so the desktop app's OAuth window, which opens in the system browser, can complete.
- **Rejected:** Notion custom blocks, because they are alpha, need a paid plan and are not an embed under `/adp-notion`.

## Subsystems

Strict layering, checked by a test: **fbl → disl → history → store → canvas → panels → frame**. A part imports only parts above it.

- **`src/fbl/`:** a byte-for-byte copy of the VS Code host's FBL library (`host-vscode`), refreshed by a sync script. It is never edited and not linted; a shim replaces `node:crypto`.
- **`src/disl/`:** a DISL interpreter sized to this host, one module per specification section, with CEL through cel-js plus the DISL helpers. Supported features are listed in `support.ts`, and anything unsupported is a finding.
- **`src/history/`:** commands, a dispatcher and a history stack, modelled on the standalone host's. Every edit, undo and redo goes through it, and one gesture is one command. Why its own: an embed has no part in Notion's undo.
- **`src/store/`:** the open document of a Notion database: schema, rows ↔ FBL body, splices → row writes, a drift check, hidden internal properties, embed discovery, and the session. Only the session and API modules know the service or the token.
- **`src/canvas/`, `src/panels/`:** scene, shapes, gestures, snapping and in-place editing; toolbox, property grid, menu and controls. `notion.css` holds the only literal colours, as light and dark `--notion-*` tokens. Appearance follows `prefers-color-scheme` or `?theme=`, because the embed cannot read Notion's theme.
- **`src/frame/`:** page states and the wiring of each part. `config.ts` is the only place that names the service address.
- **`service/`:** a platform-free request handler, also run locally (optionally against an in-memory Notion).
- **`addons/<id>/`:** `index.html`, `addon.json` and synced copies of the `.dis`, the `.fbl` and `PROVENANCE.md`.

## How it consumes the specifications

- Approach 2 of `architecture` *Tool-type approaches*, with **no host code per tool type**. What a tool type needs is added to the shared parts for every add-on.
- The `.dis` is fetched at run time by relative URL from the add-on's folder, so a new copy changes the diagram without a code change.
- **The binding** comes from the standalone host, at the commit in `PROVENANCE.md`. The `.dis` names it by a raw `develop` URL (etalii.adp issue 92).
- **Four interim rules** cover behaviour the specification leaves unstated (issue 93). They are implemented without naming a tool type.
- **Copied with provenance, never fetched live from upstream,** so the same revision always builds the same tree.

## Where the model lives, and what that costs

**The rows are the document.** This is the one host where the model is not a file: one row per element, each binding key a property, with no document text stored. The FBL body is rebuilt in memory by replaying the rows into the binding's template. Edits are planned as FBL splices, and each splice maps to a row write.

- **Lost in transfer:** comments, key order, unknown keys and dangling references. Round trips are compared by what hosts read, not by bytes (issue 94).
- **Notion limits:** 2,000 characters per text item, short comma-free select options, about 3 requests per second and 100 rows per query.
  - A store over about 250 rows misses the 3-second open target.
  - Arranging 200 elements takes about 70 s.
- **No conditional write.** A drift check runs before every write and on focus, with edit times only to the minute, so a race window remains.
- **Platform gaps:** internal properties are hidden only in the views that exist when the database is prepared. The embed block is not found inside columns or toggles. Read-only state shows only after Notion refuses a write.

## Rules

- **No tool-type names in `src/`.** A test takes every name from the add-ons' specifications and bindings, and the build checks the bundled `addon.js` the same way.
- **The build refuses an add-on folder** that holds code or misses a required file.
- **Tests never call Notion.** They run against an in-memory Notion. Embedding, the grant of access and both appearances are checked by hand.
- **The service and publish jobs** run only on `develop` and are the only jobs that read secrets.

## Process

Changed through Spec Kit features in this repository. CI runs file checks, tests with lint and typecheck, an add-on build with the three sync checks, the terminology check, and, on `develop`, the Worker deployment and the site deployment.
