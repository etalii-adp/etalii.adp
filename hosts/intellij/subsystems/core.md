---
id: intellij-core
type: submodule-design
title: "Core: the tool framework"
status: draft
parent: host-intellij
---
# Core: the tool framework

`core/` (package `etalii.adp.core`), part of `host-intellij`.

## Responsibility

The format-agnostic tool framework:

- **Editors:** `AdpToolFileEditor` (a tool's editor over the platform `Document`) and `AdpEditorProvider`, which composes it with the text editor as a text editor with preview.
- **Diagram framework:** `DiagramDefinition` (element and connection types, toolbox, sectors, rules, layout; validated once in `build()`), `DiagramMapping` (read, add, remove, setBounds: each returns range-exact, non-overlapping text changes against the text it read), `DiagramFileEditor` (read, then layout, route and diff), and the Swing `DiagramCanvas`.
- **`DiagramFeature` extension point:** editing, properties and navigation each register from their own fragment.
- **Support:** a range-preserving XML scanner, settings, and the problem panel and read-only banner.

## Rules

- **Core knows no file format.** Adding a format must not change it.
- The editor keeps no copy of the content. It re-parses the `Document` after every change, and each visual change is one named `WriteCommandAction`, which is one undo step.
- Text and visual views share one `Document`, so they share content and undo.
- Providers are `DumbAware`, extension points are dynamic, and saving does not strip trailing spaces from tool files.
