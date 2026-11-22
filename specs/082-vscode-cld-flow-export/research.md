# Research: Export a Causal Loop Diagram's Flow Page from VS Code

## R1 - Where the page comes from

**Decision**: VS Code holds the desktop host's template, `modules/diagrams/causal-loop-diagram/src/flow_page.html` of `etalii.adp.ide.desktop`, as an unchanged copy: `scripts/sync-flow-page.mjs <desktop checkout> [ref]` writes it into `src/core/plugins/cld-flow-page/template.ts` as one string, with `PROVENANCE.md` beside it naming the repository, path, commit and SHA-256; `--check` holds the copy to the record, and the Build workflow runs it.

**Rationale**: FR-007 asks for the desktop host's bytes, so the template must be the desktop host's, not a second edit of spec 074's reference. A string module needs no loader in esbuild or vitest, and a check keeps it unedited (FR-014), as `sync-definitions` does for definitions.

**Alternatives**: the spec 074 reference page with the six FR-035 changes made again here (two places to keep in step); an `.html` file with a text loader (a loader in esbuild and another in vitest, for no gain).

## R2 - The generator

**Decision**: a port of the desktop host's `flow_page.rs` at its commit, function for function: the title and data markers, `DATA` as one line of JSON with keys `c`, `l`, `o`, `p`, `v` in that order, variables first of their name, links naming no variable left out, declared loops whose links close them, else the cycles `cldCycles` finds named R1, B1 … with the path of their labels, the seven variables in the most loops for the chart, values limited to their controls' ranges, and the desktop host's escaping of JSON text and HTML.

**Numbers**: Rust writes an `f64` with `Display`: the shortest digits that read back, never an exponent, `-0` kept. JavaScript's `String(n)` gives the same digits but an exponent from 1e21 and below 1e-6, and `0` for `-0`. The generator writes a number through a function that expands an exponent and keeps `-0`, held by tests against values Rust prints.

**Positions**: the centre of each variable's box in the scene VS Code draws with the editor's options, which is where the canvas shows it (registration, drag, Arrange diagram or ring). The desktop host reads the registration's points, else its ring; both name a variable's centre (FBL 0.20 `layoutPoint: anchor`).

## R3 - Parity with the desktop host

**Decision**: the desktop host's own example, `cargo run -p adp-diagram-causal-loop --example flow_page <cld> <out>`, writes the page of each of the six examples at the desktop commit the template came from. The six pages are kept in `fixtures/tools/causal-loop-diagram/flow-pages/` with a provenance record, and a test holds VS Code's page of each example, opened as VS Code opens it, to them byte for byte (SC-003). Where positions differ only because a host computes a ring, that is recorded and the comparison is made at the desktop host's positions as well.

## R4 - The export in the frame

**Decision**: an export is code for one tool type, carried by origin as the reading logic is (`docs/disl-support.md`, "Code for one tool type"): `ExportLogic` in `src/core/tool/pluginRegistry.ts`, with each export's id, label, page name and writer. The tool type offers each export of its origin as an action of the empty selection, `export:<id>`; `edit` answers it with an outcome `export`, and the extension asks the tool type for the page (`exported(source, id, options, moment)`), writes it, and opens it. Nothing under `src/core/disl/`, `scene/` or `tool/` names the causal loop diagram.

## R5 - The places in VS Code

**Decision**: one command per export, `etalii.adp.export.<id>` (here `etalii.adp.export.flowPage`, "Export Flow Page", category ADP), contributed in `package.json` and registered for every carried export, a test holding the two to each other. It is offered in the Command Palette, the Explorer's and the editor tab's right-click menus and the editor title's ADP submenu (`etalii.adp.menu`) when `resourceExtname in etalii.adp.export.<id>`, a context key the extension sets to the extensions of the tool types that offer the export. The command takes the resource it is invoked on: an open tool editor on it exports as that editor holds it; else the text document if open; else the file and its registration from disk.

**Why not a root menu**: VS Code's menu bar takes no menu from an extension in stable releases (`menuBar/*` is a proposed API). Peter chose the editor title submenu on 2026-11-22.

## R6 - Opening and saying where

**Decision**: the page is written with `workspace.fs.writeFile` beside the document, opened with `env.openExternal` on its file URI, and named in an information message with a "Reveal in Explorer" action (`revealInExplorer`). An untitled document gets the export disabled with spec's sentence; a failed write writes nothing and shows an error message with the reason.
