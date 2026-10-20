# Data Model: The Native Desktop Host

**Feature**: [desktop-native-rust.spec.md](desktop-native-rust.spec.md) | **Plan**: [plan.md](plan.md)

The entities the core holds, their fields, rules and states. Names are the Rust types the plan expects; the fields are what each must carry, not a final signature. Every entity mirrors one in the standalone host at `8b6ccfc`, named in the last column of its heading line.

## Project (standalone: `EtAlii.Adp.Projects`)

| Field | Meaning |
|---|---|
| `id` | Stable id, generated when added. |
| `name` | The folder's name, editable. |
| `path` | Absolute path of the folder. |
| `added_at`, `opened_at` | Times, for the project list's order. |

Rules: a path is validated when added (exists, is a folder, readable) and again when opened; a missing folder is reported, never dropped (spec, Story 1 scenario 2). Stored in `projects.json` in the per-user state folder (R8).

## Workspace (standalone: `EtAlii.Adp.Hierarchy`)

The open project in a window: its hierarchy, its open documents, its history, its problems.

- **HierarchyNode**: `path`, `kind` (folder, file, registration), `children`, `registrations` (the `.adp` files nested under the file or folder they register, several allowed; a folder's is `folder/.adp`).
- Changes on disk arrive as `HierarchyChange { added | removed | renamed | modified }` and are applied in order.

## Document (standalone: `EtAlii.Adp.Documents`)

| Field | Meaning |
|---|---|
| `id` | Per window. |
| `origin` | `<vendor>/<type>` of its tool type. |
| `body` | The file or folder that holds the model. |
| `registration` | The `.adp` file, if any. |
| `reading` | The tool type's view of the body, from its binding. |
| `dirty` | Unsaved changes exist (editors only; diagrams and designers write through commands). |
| `findings` | Current findings of this document. |

States: `Opening → Open → (Changed outside → Reconciling → Open) → Closing`. A document whose tool type is missing opens as text with the reason (spec, Edge Cases); a specification of a later version opens refused, with the reason.

## Registration (FBL section 8)

Line 1: the origin. Then `body: <path>` and an optional `layout:` map of `id: x y`. Authored positions live here and never in a body another tool owns (FR-033). Unknown blocks are kept byte for byte.

## ToolType (standalone: `*DefinitionDiscovery`)

| Field | Meaning |
|---|---|
| `origin`, `display_name`, `vendor_group` | As in the standalone host's catalogue. |
| `kind` | Diagram, designer or editor. |
| `state` | Working, prototype, read-only or identity only. |
| `specification` | The `.dis` or `.des` file, if any. |
| `binding` | The `.fbl` file, if any, or the module's plugin. |
| `claims` | Extensions, globs and markers it opens. |
| `module` | The Rust module crate that carries its residue, if any. |

Loaded once at start from the vendored `definitions/` and the identity catalogue (R3). A tool type that fails to load is listed with its findings and opens nothing.

## Command and History (standalone: `EtAlii.Adp.History`)

- **Command**: `apply(&mut Model) -> Result<Splices, Refusal>` and its `inverse`. A **CompositeCommand** applies a list as one step (multi-select, property grid on several elements).
- **History**: one per project; `undo`, `redo`; a **barrier** entry is pushed when the body changes outside, and undo stops there with the standalone host's message (FR-016).

## Splice (FBL section 6.1)

`{ operation, range: start..end (bytes), text }`, one of the eleven operations. A command's result is an ordered list of splices applied to the body buffer, which keeps the byte order mark and the majority line ending.

## Context (standalone: `EtAlii.Adp.Context`)

- **Selection**: one per window, an ordered list of element references with a primary element; the chain the property grid shows.
- **Action**: `id` (as in the standalone host: `hierarchy.add`, `hierarchy.rename`, …), `label`, `group`, `shortcut`, `enabled`, `reason_if_disabled`. One list feeds the ribbon, the context menu and the keyboard (FR-015).
- **Prompt**: choice, file dialog, text input, confirmation, notice; answered or cancelled.
- **PropertyRow**: `group`, `label`, `editor` (line, text, toggle, choice, ordered slider), `value`, `read_only_reason`.

## Finding (standalone: `EtAlii.Adp.Problems`)

`severity` (error, warning, info, hint), `message`, `location` (element, source range in a file, or a subject not drawn), `source` (rule id). Cached per project in `problems/<project-id>.json`; revalidated at start (FR-019).

## Scene (shell input, new)

What the core gives the shell to draw a diagram: shapes, paths, labels, markers, in domain coordinates, with resolved theme roles, for the visible viewport only. One scene per transaction; the shell never asks for an element's look one by one.

## Theme (new; R9)

`name` (Dark Modern, Light Modern), `colors` (VS Code colour ids to RGBA), `sizes` (font sizes, row and tab heights, border and focus widths, radii), `source` (VS Code tag and file per value). Follows the system setting (FR-042).

## Parity inventory row (new; R10)

`id`, `capability` or `tool type`, `standalone source` (spec name, file or test), `increment` (1 to 6), `check` (test name or manual walk), `state` (planned, built, checked).
