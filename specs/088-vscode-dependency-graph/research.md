# Research: The Dependency Graph in VS Code, as the Standalone One

What the plan rests on, found by reading VS Code `develop` at `3c17376`, standalone `develop` at `0047236` and etalii.adp `develop` at `0da9690`, and by the inventory's replay of the standalone transcript through VS Code's interpreter.

## R1. The unsupported-feature warning (A1)

- **Decision**: remove `persist.yaml` from `language.requires.features` of `definitions/diagrams/dependency-graph.dis` in etalii.adp.
- **Rationale**: DISL B.8's `persist.yaml` is DID stored as YAML. This definition persists through an FBL binding (`persistence.format: fbl`), which DISL 11.2 keeps apart from DID's settings, so nothing reads the feature. VS Code warns on any feature it does not list, and listing one it does not build would make `supportRecord.test.ts` claim something false. The timeline, Sankey and supply-chain definitions carry the same stale entry; they are not this feature's, and an issue is filed for them.
- **Alternatives**: list `persist.yaml` as supported in VS Code, which would be untrue for a DID document; drop the finding for FBL-persisted tool types, which hides the next wrong requirement too.

## R2. Reading order and the X row's text (A3, D1)

- **Decision**: a `ReadingLogic` for the origin `generic/dependencies`, beside `cld-reading`, with `reread` putting every `Node` entry before every `Dependency` entry, and `numberText` writing a number with at most four decimals (.NET's `0.####`, as standalone's `DslNumber.Format`).
- **Rationale**: the companion lists the reading order as gap 3, which no binding can state, and the X row's text is standalone module code (`DependencyGraphDefinition.cs`). `ReadingLogic` is VS Code's existing seat for both (`reread`, `numberText`). The companion's section 4 says the row shows the shortest text, which the code does not; an etalii.adp issue corrects the companion.
- **Alternatives**: a sort in the shared FBL reading, which would change every binding's order.

## R3. The dependency curve (B1, B2, B5)

- **Decision**: a new plugin kind `routing` in `pluginRegistry.ts`, called by the scene for an edge whose `line.routing.plugin` names it, with the plugin's `fallback.routing` (`bezier`) used when it is not carried; and the plugin `src/core/plugins/dependency-curve/` (`net.etalii.adp.generic.dependencyCurve`), ported from `DependencyGraphCanvas.tsx` and `dependencyGraphBindings.ts`: a horizontal bezier between the facing sides when the dependency's left edge lies right of the dependent's right edge, otherwise a forward loop out of the right side into the left side.
- **Rationale**: today the scene draws a routing plugin it does not know as a straight line and ignores the fallback, which is DISL 13.1's own rule to honour. The arrowhead's colour follows the line's (`context-stroke` in standalone), which VS Code's `arrowFilled` is to match.
- **Alternatives**: draw every `bezier` this way, which would change the hype cycle graph's and mind map's lines.

## R4. Colours in both themes (B4)

- **Decision**: the definition's `notation.theme.tokens` take the values standalone actually draws with, and gain `modes.dark`, as the causal loop diagram's did (etalii.adp #756): surface `#FFFFFF`/`#1E293B`, border `#E2E8F0`/`#334155`, text `#0F172A`/`#F1F5F9`, muted text `#64748B`/`#94A3B8` (standalone `src/client/src/index.css`, `:root` and `prefers-color-scheme: dark`). The edge label is 11 px (`canvas.css`, `.canvas-connection text`).
- **Rationale**: the definition's present values are `canvas.css`'s fallbacks, which standalone never shows, because its theme variables are always set. Peter ruled on 2026-11-22 that where the definition and standalone look different, the definition takes standalone's look. Standalone re-bundles the newer definition (`bash src/diagrams/tools/bundle-disl.sh dependency-graph <etalii.adp>`), which changes nothing it draws.
- **Alternatives**: VS Code's own theme colours, which would differ from standalone in both themes.

## R5. Findings (E1 – E3)

- **Decision**: the plugin `src/core/plugins/dependency-ends/` (`net.etalii.adp.generic.dependencyEnds`, CEL function `writtenEnd`), reading the binding's host attributes `writtenFrom` and `writtenTo`; `std.missingId` suppressed where a definition's own rule reports the same element with `self.id != ''` is replaced by what DISL 8.7 asks: the built-in is off when `constraints.builtIn` does not list it and a rule of the definition covers it. The finding order of the companion's section 3 is reading logic (`ReadingLogic.order`, a new optional member), because `constraints.order` cannot interleave two codes (gap 9).
- **Rationale**: without `writtenEnd` the fallback reads a null end as `''`, so no dangling finding is raised. VS Code raises `std.missingId` unasked; the transcript has the definition's rule.
- **Open**: whether `std.missingId` is on by default for a definition that does not list it is a question of DISL 8.7's wording; the task reads it first, and an issue goes to etalii.adp if the text is unclear.

## R6. Gestures (C1 – C7)

- **Decision**:
  - `connect.from` (DISL 6.10): the scene carries an edge type's anchor-to-end map; a connection drawn from an anchor mapped to `target` is requested with its ends swapped, in the core, so the webview stays tool-agnostic.
  - A release on empty canvas: the webview sends `connect` with `to` a point (a new optional `toPoint`) when the edge type's `connect.tool` has `createTarget` or `createSource`; the core runs that tool's create and the connect as one transaction.
  - The self-dependency and non-node refusals are the definition's `refusals` where it states them; where it does not, standalone's sentences are reading logic (the companion's section 5 lists them).
  - Tab and Enter: the canvas's key handler lets Tab through to an action whose shortcut is `Tab` only when a node is selected, so the focus order of the page is kept otherwise.
  - Adding with no point: an `ask` for `addNodeHere`'s label with the placement standalone uses (240 right of the selection, or 0, 0), offered in the Command Palette as **ADP: Add node**.
  - An empty file: the binding's "The file has no place to create elements in." is passed through where today a CEL error ("No such key: x") is shown.
  - A merge key: the binding's read-only check runs before a row's `validate`.
- **Rationale**: each is the definition's or the binding's statement, read where VS Code does not yet read it.

## R7. Typed values and their control (D2, D3)

- **Decision**: a row's `validate` receives the text that was typed, as DISL 9.3 says of `value` at commit, before the widget's conversion; VS Code's parity record says X and Row are edited as a line of text, as standalone does, and the `number` widget is read as that.
- **Rationale**: today `value` is a number for a `number` widget, so `value.trim()` throws and every value is refused.

## R8. The transcript test (FR-025)

- **Decision**: `fixtures/tools/dependency-graph/` holds standalone's transcript, its twelve fixtures and the 26 inline documents as files written from `DependencyGraphCorpus.cs`, and `test/core/tool/dependencyGraph.test.ts` replays it as `causalLoopDiagram.test.ts` does. The requests no gesture here makes are listed as differences with their reason: an action on an id the document does not hold, a node's operation on a dependency and the reverse, a made-up action id, the unparseable YAML message's wording.
- **Rationale**: the same shape as the causal loop diagram's, so a reader of one reads the other. The inventory's probe (in the project files, `dependency-graph-parity/`) already parses every step.

## R9. Delivery order

- **Decision**: the definition change (R1, R4) lands in etalii.adp first, then the standalone re-bundle, then VS Code copies the newer definition. VS Code then takes four pull requests: reading and findings, drawing, gestures and properties, the transcript test and documents.
- **Rationale**: VS Code's copy is checked against its record, so it can only follow etalii.adp.
