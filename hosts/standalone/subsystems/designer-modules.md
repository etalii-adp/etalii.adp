---
id: standalone-designer-modules
type: submodule-design
title: "Designer modules"
status: draft
parent: host-standalone
depends-on:
  - standalone-designer
  - standalone-table-library
  - standalone-hierarchy-surface-library
  - desl
  - ded
  - fbl
---
# Designer modules

`src/designers/<type>/`, part of `host-standalone`.

## Responsibility

One folder per designer type, discovered as diagram modules are: Knowledge (table surface over YAML, JSON or XML) and Hierarchical Requirement (hierarchy surface over Markdown with a `<!-- ded: … designer: … -->` envelope). Each bundles its `.des`, its `.fbl` bindings and `provenance.json`.

## Rules

- A module opens one session per document, of the kind its surface names, and the session speaks a surface model that names no designer type.
- Module guards hold the definition to the code, for example that what is shown is what is written.
