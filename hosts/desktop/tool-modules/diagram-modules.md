---
id: desktop-diagram-modules
type: submodule-design
title: "Diagram modules (residue)"
status: draft
parent: desktop-tool-modules
depends-on:
  - desktop-cel
  - desktop-context
  - desktop-core
  - desktop-diagram
  - desktop-disl
  - desktop-documents
  - desktop-fbl
  - desktop-history
  - desktop-layout
  - desktop-theme
references:
  - definitions
---
# Diagram modules (residue)

`modules/diagrams/<tool>/` (19 crates), part of `desktop-tool-modules`.

## Responsibility

One crate per diagram type the standalone host implements, each holding only the **residue**: what DISL and FBL cannot declare. Examples are causal-loop cycles and ring layout, Agent Behavior Modelling's Markdown plugin, Ansible's folder reading, and C4's Structurizr DSL reader and writer.

## Rules

- A module depends on core crates and the theme, never on the shell or egui.
- Where the standalone host's module still bypassed DISL, this host does too, and says why in the crate. C4's specifications do not yet load and name a binding the reference commit lacks. Azure DevOps keeps its own reader and writer because its binding exists only as a draft. Both modules open their documents themselves.
- Each crate's doc comment names the standalone module and commit it was ported from.
