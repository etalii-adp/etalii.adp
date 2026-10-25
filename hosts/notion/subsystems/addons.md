---
id: notion-addons
type: submodule-design
title: "Add-ons and the published tree"
status: draft
parent: host-notion
depends-on:
  - notion-frame
  - site
  - disl
  - fbl
---
# Add-ons and the published tree

`addons/<id>/`, `scripts/`, part of `host-notion`.

## Responsibility

One folder per add-on: `index.html`, `addon.json`, and synced copies of the `.dis`, the `.fbl` and `PROVENANCE.md`. `scripts/build.mjs --out <dir>` bundles one `addon.js`/`addon.css`, copies them into every add-on folder and generates the index with the git revision. That one command is the whole contract with `etalii.adp.site`, which publishes the tree under `/adp-notion/`.

## Rules

- **A tool type becomes an add-on as a folder, with no code.** A tool type without an FBL binding cannot be one.
- The build refuses a folder that holds code or misses a required file, and `check-tree` refuses tool-type names or secrets in the bundle.
- Specifications and bindings are copied with provenance, never fetched live from upstream, so the same revision builds the same tree. The `.dis` is fetched at run time from the add-on's own folder.
- The index names the revision it was built from, so it is truthful about what exists (principle III).
