# Research: The Causal Loop Diagram in VS Code, as the Standalone One

Measured on VS Code `develop` at `5fe49cd`, standalone at `6da7f5a`, etalii.adp at `2ef4c05`, by copying the definition into VS Code and opening the standalone examples through its interpreter (the inventory of 2026-11-22).

## R1. Natural ids and relation ends by key

- **Decision**: Read `ids.strategy: natural` in `src/core/disl/persistence.ts`: an element's id is the type's `prefix` and its key attributes joined by `|` (DISL 11.5.1), computed again after every transaction as `derived` ids are. A relation's ends, read through the `typeMap`'s reference attributes, are resolved against the key of the type they may name.
- **Rationale**: Today every element is `<type>@<line>` and every link reports that its ends name no variable, so nothing of a causal loop diagram can be drawn. The registration and the transcript key everything by these ids.
- **Alternatives considered**: A persistence plugin for the causal loop diagram that assigns ids: rejected, since the strategy is DISL's and serves any definition keyed by name.

## R2. The ring a file opens on

- **Decision**: Add `circular` to the built-in layouts, reading the `adp.ring.*` options (`order: link-walk`, `start: top`, `direction: clockwise`, `separation`) as standalone's `CausalLoopLayout` computes them, with the radius from the widest node and the count. Run it under `trigger: onLoadIfMissing` for nodes with no kept position.
- **Rationale**: DISL names `circular` without an order or a radius (companion gap 5); the definition states them as options so that a host can follow the standalone host, which is what FR-007 asks.
- **Alternatives considered**: A layout plugin named by the definition: the definition names `circular`, not a plugin, so a plugin would not be called.

## R3. Positions in the registration

- **Decision**: The stored kind `bounds` (DISL 11.6) is kept in the registration's `layout:` block as the point of each element its placement anchor names, the centre of a variable's pill (the definition's `placement.anchor: "center"`, as the standalone host stores it), through the block `registrationLayout.ts` already writes for pins. A move, an add at a point and Arrange write it in the same edit as any body change.
- **Rationale**: The four authored examples keep their arrangement there; VS Code reads that block today only for `pinned`.

## R4. CEL functions, and functions a plugin provides

- **Decision**: Add to `src/core/disl/expressions.ts` the functions of DISL 12.4 the definition calls that are missing: `avg()` on a list, `lists.range(n)`, `diagram.cycles(type, max)` and `diagram.cyclesTruncated(type, max)` in DISL's order; enable `cel.bind`, which `@marcbachmann/cel-js` has. Add a plugin kind `functions` to `pluginRegistry.ts` for a plugin whose `provides` holds `celFunctions` (DISL 13.1): its handlers are registered under the names it declares; where it is not carried, a function that names it fails and the definition's own fallback (`diagram.cycles`) is used, as the definition's `feedbackCycles` does.
- **Rationale**: Four rules and the loop's placement fail to evaluate today; the definition's `feedbackCycles` already chooses between the plugin and DISL's function.

## R5. The drawing

- **Decision**: In the scene and the webview: `routing: curved` as a quadratic curve whose control point is `curvature` times the chord from the midpoint, to the left of travel for a positive value; edge `variants` with their own `line`; edge `labels` at `at` along the path, on `side` at `distance`, horizontal; `midMarkers` of type `bar` with `visible`; `selfLoop` of shape `arc` on its `side`; a computed stroke width; a node `icon` with `position`, `size`, `color` and `flip`; the canvas's `empty` text under its `when`.
- **Rationale**: The disl-support record lists each as not drawn; each is DISL, and none names a tool type.

## R6. The self-organizing layout (Arrange diagram)

- **Decision**: Port standalone's `SelfOrganizingLayout` (Meyer's self-organizing graphs, every random choice a function of the document and the iteration) to a layout plugin `cld-layout` with id `net.etalii.adp.systems.cld`, with its numbers (2000 iterations, 200 separation rounds, budget 1000). Positions are compared with the standalone host's to the three decimals the registration writes.
- **Rationale**: The definition names the plugin and leaves the algorithm to it.
- **Risk**: .NET and V8 may differ in the last bit of `Math.Sin`, `Cos` or `Sqrt`; if positions differ after rounding, the difference is recorded in `docs/parity.md` with the largest distance measured.

## R7. Operation dialogs

- **Decision**: An operation whose form (`forms.<operation>`) asks for parameters opens it as VS Code input boxes, one per field, with the field's `initial`, its `validate` sentences as the box's validation, and the form's title; Escape cancels and changes nothing. The webview asks the extension, which asks the core to check each value.
- **Rationale**: VS Code principle I (platform dialogs); the three forms the causal loop diagram uses have one text field each.
- **Alternatives considered**: A dialog drawn in the webview, as the Hierarchical Requirement Designer's: rejected for a single field, where the platform's input box is what a VS Code user expects.

## R8. The diagram's own form and parsed rows

- **Decision**: With nothing selected, ADP Properties shows the diagram's form (DISL 7.5, `for: diagram`). A row's `parse` (`accepts`, `write` with `set` and `unset` under `when`, `refusal`) is held for every row, and `form.parse`, `form.rowId` and `label.editText` are added to the supported features.
- **Rationale**: The flow properties are the diagram's; today its form is not shown and a row's `parse` is not held.

## R9. The wavy underline

- **Decision**: A label with `decoration: underline` is drawn with an underline; the causal loop diagram's reading logic (R10) asks that a loop's be drawn wavy, as the owner ruled for the standalone host on 2026-10-14. The webview draws a wavy line as a path under the text, in its colour and as wide as its measured text.
- **Rationale**: DISL states only `underline` (companion gap 4), so the wavy form is the tool type's, carried by its own code.

## R10. What the binding cannot read

- **Decision**: A logic carried by origin (`systems/causal-loop-diagram`), like `knowledge-views`, not named by the definition: it rereads a link's note as `CausalLoopNote` does (bare word, last of two), gives the four unreadable-line sentences of `CausalLoopUnreadable`, writes a weight with an exponent in .NET's form, and asks for the wavy underline. Listed under "Code for one tool type" in `docs/disl-support.md`.
- **Rationale**: Companion gaps 1, 2 and 4 and the number difference; the companion says each is kept as code by the standalone host.

## R11. The measure of "identical"

- **Decision**: Copy standalone's `causal-loop.transcript.json` and the 11 fixtures it reads into `fixtures/tools/causal-loop-diagram/`, and hold the tool type to it as `test/core/tool/mindmap.test.ts` holds the mind map: toolbox, menus, rows, findings, payloads by the definition's `x-cld` wire ids, and every edit's bytes.
- **Rationale**: SC-002; the transcript records what the standalone host does, so a difference shows as a failing test.

## R12. Tooltips

- **Decision**: Drawn as the definition states, the one deliberate difference from the standalone host (Peter, 2026-11-22), recorded in `docs/parity.md`.
