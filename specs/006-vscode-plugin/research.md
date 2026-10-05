# Research: The ADP Plug-in for Visual Studio Code

Decisions the plan rests on. Each says what was chosen, why, and what was set aside.

## R1. Which Visual Studio Code

- **Decision**: `engines.vscode` is `^1.140.0`, the stable release on the planning date (2026-10-05). The in-Visual-Studio-Code tests run against that release and against the newest stable.
- **Rationale**: the spec's assumption is "the release current when the plan is made". Custom text editors, webview views, diagnostics and multi-file undo are all long stable, so nothing newer is needed.
- **Alternatives considered**: an older floor for reach, set aside because nothing asks for it and each older release is one more to test.

## R2. How a diagram is an editor

- **Decision**: every diagram is a **custom text editor** on the file's own text document. An edit is a workspace edit made of the splices `core` computed, applied to that document; the diagram re-reads the document's text after every change, whoever made it. `.ghg` is registered as the default editor; Markdown is registered as an option, never the default, with a command and an Explorer context-menu entry enabled by a context key the extension sets for Markdown files that have a Behavior heading. A `.adp` registration is registered with a default editor that reads its origin and body and opens the body in that diagram, then closes itself.
- **Rationale**: this is the platform's mechanism for exactly FR-030 to FR-032: one document shared with the text editor, one undo history, the modified state, save, auto save, revert and restoring unsaved changes, all without code of ours. It is the equivalent of IntelliJ's constitution principle I.
- **The two-file undo**: a behavior model's drag changes the Markdown and the registration. Both changes go into one workspace edit; Visual Studio Code groups a multi-file workspace edit as one undo element across the files. The registration is therefore opened as a text document in the background and saved whenever the Markdown is saved, so it is never left modified alone. A registration that does not exist yet is created by the same workspace edit. The in-Visual-Studio-Code tests cover undo of a drag (T058). If the platform asks the user to confirm an undo across files, that prompt is recorded in the parity record rather than suppressed.
- **Alternatives considered**: a custom editor with its own document model and edit stack, set aside because it reimplements save, revert, backup and the text view; writing the registration directly to disk outside the undo history, set aside because FR-024 asks for one step that puts both files back.

## R3. A runtime for `.dis`, or by hand

- **Decision**: by hand. The two diagram types are TypeScript modules in `core` and `webview`, written against the definitions and checked against the standalone examples and fixtures. The `.dis` files are not read at runtime.
- **Rationale**: both companions list what DISL 0.1 cannot express for these tools, and it is most of what makes them these tools: splicing writers, a model kept in prose, ids that are places in a tree, pins in a registration, attachment to a phase, per-gesture snapping. A runtime would cover the easy half and need a plugin for the rest, which is the hand-written module again plus a runtime. The standalone host made the same choice. Constitution, principle V.
- **What is kept for a later runtime**: `core/frame` describes a diagram type's toolbox, forms, actions and rules as data, in the shape the `.dis` gives them, so a later feature can produce that data from a `.dis` instead of from code without changing the frame.
- **Alternatives considered**: a DISL runtime first (out of scope in the spec); sharing the standalone backend by bundling .NET, set aside because FR-001 forbids needing anything else installed and a self-contained backend per platform multiplies the download and the build.

## R4. What draws the canvas

- **Decision**: SVG, built by our own small canvas in `webview/canvas`, with no UI framework. Notation per diagram type is a set of pure functions from the view model to SVG. The property grid and the toolbox are plain DOM. Styling is CSS that maps the definitions' theme tokens to custom properties, with one value set per theme kind (light, dark, high contrast, high contrast light), switched by the `vscode-*` class the platform puts on the webview body.
- **Rationale**: the two tools draw tens to hundreds of elements, which SVG handles, and SVG gives text, hit testing and theming for free. Pure functions are testable in jsdom without a browser. The standalone canvas library is React and 12,000 lines serving sixty modules; these two tools use a fraction of it, and FR-005 asks for a frame that a third tool extends, not for that library.
- **Alternatives considered**: vendoring the standalone canvas library, set aside for its size, its React dependency and because two copies would drift; an HTML canvas, set aside because text, hit testing and accessibility would be ours to write; a UI framework for the property grid, set aside under principle V for seven control types.

## R5. Where the toolbox and the property grid live

- **Decision**: **ADP Properties** is a webview view in an "ADP" view container, which the user can move like any view. **ADP Toolbox** is docked inside each diagram's editor, as a strip beside the canvas that can be collapsed.
- **Rationale**: FR-039 asks for a view "where the platform lets it do this, and inside the diagram's editor otherwise". Dragging from the toolbox onto the canvas is the tool's main way of adding, and Visual Studio Code does not deliver a drag between two separate webviews, so a toolbox in its own view could only add from the keyboard. The property grid needs no drag, and as a view it stays put while editors change. Both follow the focused diagram (FR-041): the extension tells the properties view which diagram is active and relays the selection.
- **Alternatives considered**: both as views, set aside because of the drag; both inside the editor, set aside because a property grid inside every editor tab repeats itself and takes canvas width; a native tree view for properties, set aside because it has no slider, chips or multi-line text.

## R6. The seam between the three layers

- **Decision**: `core` exposes, per diagram type, a `DiagramType`: `read(text, registration)` to a model with findings; `view(model, options)` to a view model of drawable elements; `toolbox()`, `forms(selection)`, `actions(selection)`; and `edit(model, request)`, which returns either the splices to apply (to the body, the registration or both) or a refusal sentence, or a confirmation to ask first. The extension and the webview exchange only the view model, selection, edit requests and their outcomes, as JSON messages, versioned. See [contracts/frame.md](contracts/frame.md).
- **Rationale**: all logic that the definitions state lives in one layer that tests reach without Visual Studio Code or a browser (FR-042), and the webview holds only drawing and gestures. It mirrors the standalone split of backend and client, which the companions already describe gestures in terms of.
- **Alternatives considered**: logic in the webview, set aside because the document lives in the extension host and every edit would cross twice.

## R7. Findings

- **Decision**: one diagnostic collection, "ADP", set per document from the model's findings whenever the text changes, while a diagram is open on it, and for every `.ghg` in the workspace that is open as text. Severity maps one to one (error, warning, information, hint); the code is the rule id (`ghg.phase-count`); the range is the entry's line.
- **Rationale**: FR-033. Diagnostics for an open document are what the Problems panel shows for every other language.
- **Alternatives considered**: scanning every Markdown file in the workspace for behavior findings, set aside because Markdown is shared and a file is a behavior model only when the user opens it as one.

## R8. Tests

- **Decision**: Vitest for `core` and `webview` (jsdom); `@vscode/test-cli` running Mocha suites inside a downloaded Visual Studio Code for the packaged plug-in. `npm test` runs lint, type check, both Vitest projects and the in-Visual-Studio-Code suite. Reports are JUnit XML under `reports/`; a small script lists skipped tests and reasons in the job summary, as IntelliJ's does. In the real-Visual-Studio-Code suite the webview is reached through a test-only command that returns the canvas's current view model and accepts a scripted gesture, exported only when the extension runs under test.
- **Rationale**: Vitest runs TypeScript directly and fast, which keeps SC-008. `@vscode/test-cli` is the platform's own runner and downloads the editor itself, so a fresh clone needs only Node.
- **What is compared with the standalone host**: every example and fixture round-trips byte for byte; each rule fixture yields the rule its name says; `scale-fixture.json` is read unchanged. The standalone cross-tier `example-models` are protobuf streams of that host's wire format and are not used.
- **Alternatives considered**: Playwright against the webview alone, set aside as a fourth level until a visual regression asks for it.

## R9. Debugging

- **Decision**: `.vscode/launch.json` has "Run ADP" (extension host, `debugWebviews` on, opening `.debug/examples`), "Debug core and webview tests" (Vitest) and "Debug tests in Visual Studio Code". The pre-launch task runs esbuild in watch mode with source maps and a TypeScript watch for errors, and refreshes `.debug/examples` from `examples/`. `.debug/` is ignored by Git.
- **Rationale**: FR-048 to FR-052. `debugWebviews` lets breakpoints in webview source bind through source maps, so both halves debug from one session.
- **Alternatives considered**: the webview developer tools only, set aside because breakpoints would be in a second window and lost on reload.

## R10. Packaging and names

- **Decision**: `name` `adp`, `publisher` `etalii`, so the identifier is `etalii.adp`; `displayName` "ADP: A Different Perspective"; packaged with `vsce package --out etalii-adp-<version>.vsix`; version `0.1.0` in `package.json`. View types are `etalii.adp.gartner.hypecycle-graph` and `etalii.adp.etalii.agent-behavior-modelling`; commands are `etalii.adp.<verb>` with category "ADP". The publisher id is not registered on a marketplace; installing from a file does not need it to be.
- **Rationale**: FR-002 to FR-004; the names are IntelliJ's with the platform's file type.
- **Alternatives considered**: `etalii-adp` as the publisher, set aside because the identifier would no longer equal IntelliJ's.

## R11. The pipeline

- **Decision**: the existing `plugin` job of `build.yml` is filled in rather than replaced: Node 22, `npm ci`, `npm run check`, the tests under `xvfb-run`, `npm run package`, the test reports kept on every run, and the `.vsix` uploaded unarchived. A `development-build` job, copied from IntelliJ's and adapted to `.vsix`, runs on `develop` after `check` and `plugin`, and alone holds `contents: write`. The `check` and `terminology` jobs stay as they are.
- **Rationale**: FR-053 to FR-057, spec 001's contract, and IntelliJ's spec 005 as built. See [contracts/build-workflow.md](contracts/build-workflow.md).
- **Alternatives considered**: a release job for version marks, out of scope in the spec.

## R12. "Arrange diagram" in the definitions

- **Decision**: each `.dis` gains an `arrange` operation for the diagram, as `causal-loop-diagram.dis` already has one; each companion gains a section stating the algorithm and refusals from standalone pull request 122. Hype cycle: rows only, interval partitioning with labels included, fewest rows, rows of linked items preferred, then whole-row swaps while that shortens links; refuses when nothing changes. Behavior model: the computed tidy tree is the arrangement, so arranging forgets the registration's `layout:` block; refuses without a registration ("This behavior model was opened without a registration, so it has no dragged positions to forget.") and with nothing to forget ("This behavior model is already arranged.").
- **Rationale**: FR-027. The sentences are read from standalone `develop` at `13b517b3`.
- **Open point for the definitions task**: the hype cycle's refusal sentence and the exact tie-breaks of its row packing are read from `GhgArrangement.cs` when that task is done, and the VS Code host follows what the companion then says.

## R13. Risks

- **Size.** The reference is about 8,500 lines of module code. The delivery order puts a usable, read-only hype cycle graph after pull request 3, so every later one adds to something that can be looked at.
- **Text measurement.** Label widths decide a row packing and an ellipsis. The standalone host publishes `text-metric.json` for agreement between its tiers; the webview measures with the same rule and the core uses the same approximation, checked against that fixture.
- **Undo across files** (R2) is the least certain platform behaviour and is tested early, in pull request 6's first task.
