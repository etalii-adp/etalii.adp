# Research: The ADP Plug-in for Visual Studio Code

Decisions R1 to R18, each with its rationale and the alternatives weighed. Three of them rest on platform behaviour that documentation does not settle; those are the spikes S1 to S3 at the end, each with the fallback it would trigger. One disagreement between a definition and the standalone host turned up while reading and is listed under Open points.

## What was read

| Source | State read | Note |
|---|---|---|
| `etalii.adp` | `develop` at `0259fdf` | both definitions, FBL section 8, the constitution |
| `etalii.adp.ide.standalone` | `origin/develop` at `13b517b3`, which holds pull requests 120 (`e7c20431`) and 122 (`c4ff2084`) | the local checkout is 22 commits behind and lacks both; everything was read from `origin/develop` |
| `etalii.adp.ide.intellij` | `origin/develop` at `fcfbabe` | the local checkout is 16 commits behind; read from `origin/develop` |
| `etalii.adp.ide.vscode` | `origin/develop` at `0ba2007` | the local checkout is 10 commits behind; no plug-in code, a constitution that is still the template |
| npm registry | 2026-10-05 | `@types/vscode` 1.140.0, `@vscode/vsce` 4.0.0 (Node 22 or later), `@vscode/test-electron` 3.1.0, `@vscode/test-cli` 0.0.15, `esbuild` 0.28.2, `vitest` 5.0.3, `typescript` 7.0.2, `eslint` 10.12.0, `jsdom` 30.1.2, `yaml` 2.9.1, `preact` 11.0.0, `@mdi/js` 7.4.47 |

What the standalone survey established, because several decisions lean on it:

- The standalone backend, in C#, owns everything that makes a diagram type what it is: reading, splicing, rules, layout, refusals, "Arrange diagram", the toolbox, the property rows and the context actions. For the hype cycle that is about 4,700 lines, for the behavior model about 3,100, with about 1,200 lines of shared helpers (`LineDocument`, `LineSplice`, `RowPacking`, `RegistrationLayout`, `TextMetric`).
- Its client modules are thin (about 1,050 and 640 lines) because they declare a definition for a shared SVG canvas library of more than 8,000 lines of React, which is tied to the shell's stream and context channel. No TypeScript there reads a `.ghg` or a behavior model.
- Tests: 134 backend and 73 client tests for the hype cycle, 50 and 17 for the behavior model. Fixture files exist for the hype cycle only (23 `.ghg` fixtures and `scale-fixture.json`); the behavior model's tests use inline strings and the four examples.
- `tests.md` records 33 browser checks for the hype cycle and none for the behavior model.

## R1. Where the work lands

**Decision.** The plan, research, contracts and tasks live in `etalii.adp/specs/006-vscode-plugin/`. The work is delivered as one pull request here and six into `etalii.adp.ide.vscode`, in this order:

| # | Repository | Content | Stories |
|---|---|---|---|
| A | `etalii.adp` | this plan; "Arrange diagram" in both definitions; the hype cycle companion re-read at standalone `13b517b3` | 7 |
| 0 | vscode | the constitution ratified ([contracts/vscode-constitution.md](contracts/vscode-constitution.md)), `CLAUDE.md` brought in line | FR-060 |
| 1 | vscode | an extension that activates and does nothing else, the three test levels with one test each, the debug configurations, the pipeline with the download and the development build, the readme, the vendored examples, fixtures and definitions | 1, 5, 6 |
| 2 | vscode | the frame: line documents and splices, the registration, the editor integration, the canvas, the ADP Toolbox, ADP Properties, findings, commands, themes; proven on a fake diagram type in the tests | 4 |
| 3 | vscode | the Gartner hype cycle graph | 2 |
| 4 | vscode | Agent Behavior Modelling | 3 |
| 5 | vscode, then `etalii.adp` | `docs/tools.md`, the parity record completed; then both companions name the VS Code host (FR-029) | 7 |

Each pull request into the VS Code repository arrives with its tests (FR-047). Pull requests 3 and 4 do not depend on each other and may be built side by side once 2 is merged.

**Rationale.** The spec's own assumption, and what specs 001 and 002 did. Pull request 1 is the smallest slice that proves the repository builds an extension and offers it (user story 1's independent test), and it gives every later pull request its checks. The frame goes in before the diagram types so that SC-011 is tested by construction: the two diagram types are the frame's first two clients, and a fake third one exists in the frame's tests from the start.

**Alternatives.** A plan per repository: rejected, the spec placed plan and tasks here. One pull request for the whole plug-in: rejected, it would be reviewed by nobody.

## R2. The two diagram types are implemented by hand (FR-008)

**Decision.** Each diagram type is a module written in TypeScript against the frame. No DISL runtime is built. Conformance to the definitions (FR-006) is held by three things: the standalone tests ported as this host's tests (R3), the vendored examples and fixtures (R13), and a conformance test per diagram type that reads the vendored `.dis` and compares what can be compared mechanically: the origin and language id, the toolbox groups, entries, icons and descriptions, the context menu labels and shortcuts, the form sections and field labels, the theme tokens per mode, the rule ids the `.dis` tags, and the layout constants.

**Rationale.** Both `.dis` files hand the hard parts to plugins the runtime would have to supply anyway: `ghgYaml`, `rowPacked`, `abmMarkdown`, `abmTreeLayout`, `abmReorder`. Their companions list, between them, some forty behaviours DISL 0.1 cannot state (snapping per gesture, boundary handles that write model attributes, attachment along a phase's edge, the tag filter, ids as places, pins in the registration, the drop under the nearest node with room). A runtime would draw neither diagram correctly without diagram-specific code for every one of those, and it would have to interpret CEL. The spec puts a runtime out of scope as a deliverable, and the constitution's fifth principle asks for a current need. The conformance test keeps the first principle honest: where the `.dis` states a fact, a test fails when the code says otherwise.

**Alternatives.** A DISL runtime with plugins: rejected as above; it is the right tool when the fortieth diagram type arrives, not the second. Generating code from the `.dis` at build time: rejected, the generated parts (toolbox, tokens) are a few dozen lines, and a test that compares is simpler than a generator that writes.

## R3. TypeScript throughout, three layers, the standalone logic ported with its tests

**Decision.** One language, TypeScript in strict mode, in three layers with a rule between them that the linter enforces:

- **core**: pure functions. No `vscode` import, no DOM. Per diagram type: reading, writing as splices, rules, scale or layout arithmetic, and `edit`, which turns an intent into splices, a refusal or a question. For the frame: the line document, the splice, the registration, row packing, the text metric.
- **host**: runs in the extension host and is the only layer that imports `vscode`. It owns the document, applies edits, publishes findings, registers commands and views.
- **view**: runs in webviews and is the only layer that touches the DOM. It draws, and turns gestures into intents.

Core is bundled into both the host and the view, so the view can snap, pack and preview while a gesture is in progress, and the host decides what is written.

The C# of the two standalone modules and their helpers is ported to core function by function, keeping names where TypeScript allows (`GhgPhases.BoundariesOf` becomes `boundariesOf` in `phases.ts`), and each ported file states its source file and commit in its header. The standalone tests are ported with it: they are the checklist that says the port is complete. The client's pure TypeScript that already exists is copied with the same header: `segments.ts`, `outline.ts`, `rowPackedLayout.ts`, `textMetrics.ts`, `abmDrag.ts`, and the id and scale parts of `ghgIds.ts` and `abmIds.ts`.

**Rationale.** A Visual Studio Code extension that needs nothing else installed (FR-001) cannot carry a .NET process, so the backend logic has to exist in a language the extension host runs. Porting rather than rewriting keeps the two hosts' behaviour traceable line to line, which is what "replicate" asks for, and both are Apache-2.0 under one copyright holder.

**Alternatives.** Running the standalone backend as a child process: rejected by FR-001 and by the size of a .NET runtime in a `.vsix`. Compiling the C# to WebAssembly: rejected, a .NET runtime in the webview or the host is megabytes and a second toolchain for two modules. Lifting the standalone canvas library whole: rejected, it is 8,000 lines bound to a gRPC stream and a shell this host does not have; its geometry is taken (above), its React component is not.

## R4. One custom text editor per diagram type

**Decision.** Each diagram type registers a `CustomTextEditorProvider`, with `supportsMultipleEditorsPerDocument` on, over Visual Studio Code's own `TextDocument`. The hype cycle's is the default editor for `*.ghg`; the behavior model's is an option for `*.md` (R8).

**Rationale.** A custom text editor shares the text editor's document, so one undo history, the dirty marker, save, save all, auto save, revert, the close prompt and hot exit are the platform's, not the plug-in's (FR-030 to FR-032). Two diagram tabs and a text tab on one file stay in step because they are three views of one document.

**Alternatives.** A `CustomEditorProvider` with its own document: rejected, the text editor on the same file would be a second working copy with its own undo and dirty state, which user story 4's fifth scenario forbids. A webview panel opened by a command: rejected, it is not an editor (no "Open With", no tab restore, no dirty state).

## R5. Every edit is an intent, decided in the host and applied as one `WorkspaceEdit`

**Decision.** The view never changes text. A gesture or a field edit ends as an **intent** (`ghg.setSpan` with an id and two months, `abm.arrange` with a place, a target index and a height), stamped with the document version it was computed from. The host:

1. drops the intent if the document has moved on since that version (the edge case of a text edit arriving during a drag);
2. calls the diagram type's `edit` with the current text and model, which answers with splices, a refusal sentence, or a question;
3. for a question, asks with a modal `showWarningMessage` and calls `edit` again with the answer (FR-035);
4. for splices, applies them as one `WorkspaceEdit`, which is one step of the document's undo;
5. for a refusal, changes nothing and sends the sentence back to where the user is working: a line at the foot of the canvas, as the standalone canvas has, or under the field in ADP Properties (FR-035, FR-040).

After any change to the document, whoever made it, the host reads the text again, publishes the findings and posts the new model to every view of that document. The view shows a gesture's end state until that model arrives, so there is no visible pause (SC-005).

Splices are computed against lines and applied as replacements of whole line ranges, as `LineSplice` does, so an edit changes only the lines it concerns (FR-010) and a new line takes its file's ending.

**Rationale.** One place decides, as the standalone backend does, and for the same reason: a request is not trusted to come from this canvas. Reading again after every change, instead of patching a model in step, makes the text editor, undo, redo and an external change all the same case (FR-016).

**Alternatives.** Applying edits in the view and syncing text: rejected, two authorities. Re-serialising the document: rejected by FR-009 and FR-010.

## R6. The registration: pending in the host, written on save, undone through the document's history

**Decision.** For a behavior model the host holds the registration's text in memory beside the document: read from the `.adp` when the model opens, changed by edits, written to disk when the Markdown is saved, dropped when it is reverted or closed unsaved. It is written by splices as FBL section 8 states, and created on the first placement.

Undo is the Markdown document's own. The host keeps an **edit log** per document: for each of its own edits, the text's hash before and after and the registration before and after. A change event that Visual Studio Code marks as an undo and that takes the text from an entry's "after" to its "before" restores that entry's registration; a redo does the reverse. An edit that changes the registration and not the Markdown (lowering a row without passing a sibling, "Arrange diagram") still needs a step in that history, so the host applies a **marker edit**: one line replaced by itself. The Markdown's bytes do not change, the document becomes dirty, which is true of the model as the user sees it, and saving writes the registration.

A pending registration survives a restart with the unsaved text it belongs to: it is kept in the extension's workspace state under the document's URI and the text's hash, and taken back only when the restored text has that hash.

**Rationale.** FR-024 and FR-026 ask for one step in Edit > Undo that puts the Markdown and the registration back together, and FR-031 asks that this be the editor's own history. Visual Studio Code offers an extension no way to add a step to a text document's history except by editing the text, and no way to undo two files as one without its "undo across all files?" question. The log ties the registration to the one history there is. Writing on save keeps the two files from disagreeing on disk after an unsaved reorder is thrown away.

**Alternatives.**
- The `.adp` as a second text document edited in the same `WorkspaceEdit`: rejected. Undoing such an edit asks the user whether to undo in both files, for every drag; and an edit to the `.adp` alone lands in a history the diagram's Undo does not reach.
- Writing the registration to disk at once, as the standalone host does, without undo: rejected by FR-024 and FR-026.
- An undo of the plug-in's own, with inverse splices: rejected by FR-031.

**Risk.** That a replacement of a line by itself is recorded as an undo step and reported with the reason "undo" when taken back is how the editor behaves today, not a documented promise. Spike S1 proves it in a real Visual Studio Code before anything is built on it, and the level 3 tests keep proving it.

## R7. Reading and writing the `.adp` as FBL defines it

**Decision.** The frame's `registration.ts` implements FBL section 8 for what these two diagram types use: the origin line after an optional byte-order mark, the headers `body` and `view` with unknown headers kept and reported, the `layout:` block with entries in ordinal order and numbers with at most three decimals, stale entries reported and removed at the next write, everything else kept byte for byte. It is tested against the registration examples under `specifications/fbl/registrations/` and the 13 standalone example registrations.

- The hype cycle keeps nothing in a registration. One beside a `.ghg` is read for its origin and body only and never written.
- A new registration is the origin line, then `body:` when the base names differ, then the block, with the body's dominant line ending (FBL 8.4).
- `*.adp` gets a custom text editor of its own, as the default: for one of the two origins it opens the diagram on the body and closes itself; for any other origin, or a body that does not exist, it says so and offers the text editor, and writes nothing (FR-014, the edge case of an unknown origin).

**Rationale.** FR-014, and the first principle: FBL is the source, so where the standalone writer and FBL differ in a detail (the standalone writer gives new lines CRLF; FBL gives them the file's own ending), this host follows FBL and both read each other's files, because reading is tolerant on both sides. The difference is entered in the parity record.

## R8. Opening: `.ghg` by default, Markdown by choice

**Decision.**

- `*.ghg`: custom editor priority `default`. The language `etalii.adp.gartner.hypecycle-graph` is contributed for `.ghg` so the text editor has a mode for it; it reuses the built-in YAML grammar.
- `*.md`: custom editor priority `option`, so the text editor stays the default and "Open With" lists "Agent Behavior Modelling". The command "ADP: Open as Behavior Model" does the same from the Command Palette, the editor title and the Explorer.
- The Explorer's context menu shows that command only for a Markdown file with a `Behavior` or `Behaviour` heading. A `when` clause cannot read a file, so the host keeps the context key `etalii.adp.behaviorFiles`, a list of such files' paths, and the menu item's clause is `resourcePath in etalii.adp.behaviorFiles`. The list is built by reading the workspace's Markdown files once, in the background, with the definition's own heading test (`SuggestsBody`), and kept by a file watcher. It stops at 2,000 Markdown files; beyond that the command stays reachable by the other three routes, and the parity record says so.
- New documents: "ADP: New Gartner Hype Cycle Graph..." and "ADP: New Agent Behavior Model...", in the Command Palette, the Explorer's context menu and File > New File. Each asks for a name, writes the content the definition gives a new document and opens it in its diagram (FR-015).

Identifiers follow FR-003: view types `etalii.adp.gartner.hypecycle-graph` and `etalii.adp.etalii.agent-behavior-modelling`, the language ids of the definitions with `net.` dropped.

**Alternatives.** Claiming `*.md` by default: rejected by FR-013. A file decoration or a CodeLens on the heading instead of the context menu: rejected, the spec names the context menu.

## R9. The canvas: SVG, drawn with Preact

**Decision.** The canvas is SVG in the webview's DOM, drawn by components written with Preact. The frame provides what FR-038 lists: pan and zoom, selection of one and several, in-place text editing over an element, dragging and resizing with a snap function the diagram type supplies, drawing a relation, handles, tooltips, a context menu, the refusal line, the ruler strip and the chrome slots (filter, legend, switches), and drawing only what is in view. A diagram type supplies a `scene` function from its model and view state to drawn elements, and the gestures each element takes.

Visual sameness with the standalone host is carried by the copied geometry (R3), the copied constants and the same theme tokens (R11), and checked by tests on the scene (the place, size, path and class of every element of every example) rather than on pixels.

**Rationale.** The standalone canvas is SVG and React, and SVG is what makes its geometry portable as it stands. Preact gives components and a JSX the copied files compile under at a few kilobytes, with nothing fetched at runtime. Scene tests are exact where screenshots are fuzzy, and they run without a display.

**Alternatives.** React: rejected, forty times the size for the same components. No library, plain DOM calls: rejected, the property grid and the canvas chrome are forms, and hand-written DOM diffing is the part of this plug-in least worth owning. Canvas 2D: rejected, it would need its own hit testing, text editing overlay and accessibility, and none of the standalone geometry would carry over. Screenshot comparison in the pipeline: rejected, font rendering differs per runner; the standalone screenshots are compared by a person once, in the quickstart.

## R10. The ADP Toolbox and ADP Properties are webview views

**Decision.** One view container, "ADP", in the activity bar, holding two webview views named "ADP Toolbox" and "ADP Properties", as the IntelliJ host names its tool windows. Visual Studio Code lets the user move either to the secondary side bar or the panel and remembers it. Both follow the diagram that has the focus, which the host knows from each editor's view state, and both show one sentence when none has (FR-041).

- **Toolbox.** The host sends the focused diagram type's groups and entries. An entry is added by dragging it onto the canvas, by Enter (it lands at the middle of what is in view, by the definition's drop rule for that point), or by the command "ADP: Add from Toolbox...", a quick pick. Icons are the definitions' Material Design Icons, taken as SVG paths from `@mdi/js` at build time, only the ones the two definitions name.
- **Properties.** The host computes the rows for the selection, as the standalone backend's property provider does: groups, and for each field its label, control, value, options and whether it is shown. The view renders seven controls, all built here: text, multi-line text, number, choice, slider with labelled stops, tag chips with suggestions, read-only. A change is an intent like any other; a refusal comes back to the field, which shows the sentence and returns to its value (FR-040).

Whether a drag can cross from one webview to another is spike S2. If it cannot, the same toolbox component is also mounted inside the diagram's editor as a strip that can be folded away, which FR-039 allows; the view stays for the keyboard and for looking things up.

**Rationale.** FR-039 asks for a view where the platform allows it. A tree view cannot be a property grid (no inputs), and the toolbox needs icons with descriptions and a drag source that carries an entry, so both are webviews sharing the frame's stylesheet.

**Alternatives.** Both inside the editor only: rejected, FR-039 prefers a view, and a view survives switching between diagrams. A tree view for the toolbox: workable for clicking, but its drag-and-drop API ends at other tree views and text editors, not webviews.

## R11. Findings, commands, shortcuts, themes, dialogs

**Decision.**

- **Findings** go to one `DiagnosticCollection` named "ADP", with the rule id as the code, the definition's severity (`error`, `warning`, `information`) and the entry's line range, so the Problems panel lists them and choosing one shows the line (FR-033). A `.ghg` has its findings whenever it is open, in either editor; a Markdown file only while it is open as a behavior model, so ordinary Markdown is not reported for having no `Behavior` section.
- **Commands** are contributed with the category "ADP". Those that act on the selection are enabled by context keys the host sets from the focused diagram (`etalii.adp.diagram` holds its origin, `etalii.adp.selection` the kind of what is selected, `etalii.adp.readOnly`). The canvas's own context menu is drawn by the frame and lists the definition's entries, each of which runs the same command.
- **Shortcuts** are `keybindings` contributions with the definitions' keys as defaults (F2, Delete, Alt+Up, Alt+Down), each with a `when` clause on the diagram's context key, so Keyboard Shortcuts lists and rebinds them (FR-034). The webview does not handle these keys itself; it lets them through to the workbench, except while a field is being edited in place.
- **Themes.** The frame's stylesheet uses Visual Studio Code's own CSS variables for everything that is frame (surfaces, text, borders, focus, inputs). Each diagram type's stylesheet defines the definition's tokens as CSS variables, keyed on the `vscode-light`, `vscode-dark`, `vscode-high-contrast` and `vscode-high-contrast-light` classes the workbench sets on the webview's body, so a theme change takes effect without a message (FR-036). Neither definition has high-contrast values: high-contrast dark takes the dark tokens and high-contrast light the light ones, and every outline takes the theme's contrast border. That is entered in the parity record, and the contrast tests the standalone host has for these tokens are ported.
- **Dialogs** are `showWarningMessage` with `modal` for confirmations, `showInputBox` and `showSaveDialog` for new documents, `showQuickPick` for the keyboard's toolbox.
- **Read-only** (FR-037): the host sets it when the file system is not writable, the file's permissions say read-only, or the body cannot be read at all; the model carries it to the view, which offers nothing that edits, and `edit` refuses regardless.
- **Restricted Mode** is declared supported; nothing the plug-in does runs workspace code.

## R12. Names, the version and the pipeline

**Decision.** `package.json` has `"name": "adp"`, `"publisher": "EtAlii"`, `"displayName": "ADP: A Different Perspective"`, `"version": "0.1.0"`, `"engines": { "vscode": "^1.140.0" }` and `"license": "Apache-2.0"`. The identifier is `EtAlii.adp`, which Visual Studio Code compares without regard to case, so it is `etalii.adp` wherever one is typed. The file is packaged as `etalii-adp-<version>.vsix` by passing the name to `vsce package --out`.

The pipeline is [contracts/ci-interface.md](contracts/ci-interface.md): the IntelliJ workflow's shape (its triggers, permissions, concurrency, step names, `archive: false` download, `development` tag moved forward by the `gh` command line) with `check` and `terminology` kept from spec 001 and 002. A development build carries the declared version unchanged, as IntelliJ's does, with the commit and date in the release's title and notes. Node.js 22 runs the workflow, the lowest release `vsce` 4 accepts. Only the Linux runner is used; byte-exact handling of CRLF is tested by fixtures marked `-text`, which do not depend on the runner's platform.

**Rationale.** FR-002, FR-053 to FR-057, and "the naming conventions as per the other implementations". `1.140` is the release current on the day of this plan, as the spec's assumption asks.

**Alternatives.** Publisher `etalii` in lowercase: rejected, the Extensions view would show it in lowercase where FR-002 asks for "EtAlii". A version with a run number or a `-dev` suffix: rejected, IntelliJ does not, and the marketplaces this plug-in will later be published to do not take pre-release suffixes. A matrix of three operating systems: rejected for now, it triples a run that has to stay within 15 minutes (SC-008) for no test that depends on the platform.

## R13. Tests at three levels, and what is vendored

**Decision.**

| Level | What | Tool | Display |
|---|---|---|---|
| 1 | core: formats, splices, rules, scale, layout, edits, the registration, the conformance tests of R2 | Vitest in Node | none |
| 2 | the frame's parts: the canvas, toolbox and property grid components against a fake bridge; the host's document session, edit log and message handling against a small fake of the `vscode` API | Vitest with jsdom | none |
| 3 | the packaged `.vsix` installed into a downloaded Visual Studio Code with an empty profile | `@vscode/test-electron`, Mocha | Xvfb on Linux |

Vendored into the VS Code repository, each folder with a `PROVENANCE.md` naming the source repository, path, commit and licence, and marked `-text` in `.gitattributes`:

- `examples/`: the nine graphs and four agents with their `.adp` files and readmes, from the standalone module folders (not the showcase copies, which are not held identical).
- `fixtures/gartner-hype-cycle-graph/`: the 23 `.ghg` fixtures and `scale-fixture.json`.
- `fixtures/cross-tier/`: `row-rounding.json`, `text-metric.json` and `element-types.json`, read unchanged (FR-044).
- `definitions/`: the two `.dis` files and their companions from `etalii.adp`.

Not vendored, each with its reason in the parity record: the cross-tier `example-models` fixtures, which are the standalone wire format in base64 and say nothing a host without that wire can check; `gesture-ids.json`, the grammar of a wire message this host does not send.

The behavior model has no fixture files in the standalone repository. Its round-trip and rule fixtures are written in the VS Code repository, under `fixtures/agent-behavior-modelling/`, from the inline strings of the standalone tests, one file per rule and per line-ending case, and their `PROVENANCE.md` says which test each came from. FR-043's "standalone rule fixtures" is met for the hype cycle as written and for the behavior model through these.

Level 3 acts on the canvas through the test seam of [contracts/dev-interface.md](contracts/dev-interface.md) and checks the file on disk, the document's text and dirty state, and the diagnostics after each step. It covers FR-045's list for each diagram type, and the three spikes' behaviours stay in it as regression tests.

Skipped tests are reported, never passed: both runners write JUnit XML, the summary script lists every skipped test with its reason, and the level 3 runner skips with a stated reason when it has no display or cannot download (FR-046).

**Rationale.** FR-042 to FR-047. Level 1 is where "replicates the standalone tool" is checked, level 3 is where "works in Visual Studio Code" is. Installing the `.vsix` rather than loading the working tree tests what a user downloads, including that the package holds everything it needs.

**Alternatives.** Playwright driving the Visual Studio Code window: rejected, slower and brittle across the webview's nested frames, for what the seam does in the same DOM. Mocha for all levels: rejected, levels 1 and 2 are most of the tests and Vitest runs and debugs them from the editor without a build step.

## R14. Building and debugging

**Decision.** esbuild writes two bundles, `dist/host.js` (CommonJS, Node, `vscode` external) and `dist/view.js` with `dist/view.css` (browser), with source maps that carry their sources; `tsc --noEmit` checks types beside it. The debug configurations and commands are [contracts/dev-interface.md](contracts/dev-interface.md). `debugWebviews` on the extension host configuration attaches the debugger to the webviews, so a breakpoint in a `.tsx` file binds (FR-049); spike S3 confirms it with the bundles as built.

Two details of this repository shape the setup:

- `check-files.py` parses every tracked `.json` file as strict JSON. `launch.json`, `tasks.json`, `extensions.json` and the `tsconfig` files are therefore written without comments or trailing commas. The script's one change is to skip the vendored `fixtures/` folder for JSON and YAML parsing and `examples/` and `definitions/` for links, since those are other repositories' files, some malformed on purpose.
- The watch task's problem matcher is written out in `tasks.json`, so the Problems panel shows build errors (FR-050) without a second extension being installed.

**Alternatives.** Webpack or Vite: rejected, esbuild does both targets in one script and well under a second. `tsc` alone: rejected, the webview needs a bundle.

## R15. Dependencies

**Decision.** Three at runtime, all bundled into the `.vsix`, none fetched: `yaml` (ISC) to read a `.ghg` with the line of every node, as the standalone parser uses YamlDotNet for reading only; `preact` (MIT); `@mdi/js` (Apache-2.0), of which only the named icons' paths reach the bundle. The behavior model's Markdown is read by a port of the standalone's own line reader, without a Markdown library. Writing never goes through a library in either format. A test fails when the bundle's licence list gains an entry that is not on an allow list, as IntelliJ's `verifyDependencyLicences` does.

**Rationale.** The fifth principle. Each of the three replaces something that would otherwise be written here: a YAML reader with positions, a view layer, and a set of icon drawings.

## R16. Large documents

**Decision.** The host reads the whole document on every change; the `technology-trends` example (200 trends, 4,194 lines) is the yardstick and has a test that reading it, checking its rules and building its scene stays under 100 ms. The view draws only elements that meet the viewport, except in Compact, which places every trend by all the others and so lays out the whole document, as the definition says. Model updates to a view are debounced to one per animation frame.

## R17. The definitions: "Arrange diagram" and the re-read

**Decision.** Pull request A changes the two definitions as [contracts/definitions-change.md](contracts/definitions-change.md) sets out: an `arrange` operation for the diagram in each `.dis`, modelled as the supply chain and causal loop definitions model theirs, a layout algorithm named as a plugin where DISL cannot state the rule, and a section in each companion with what the operation changes, what it leaves alone and its refusals verbatim. The hype cycle companion is re-read against standalone `13b517b3` and names that commit; the behavior model companion gains the commit it was read at, which it does not state today. Both `language.version` values rise by a minor step.

**Rationale.** FR-027 to FR-029, user story 7.

## R18. The VS Code repository's constitution

**Decision.** Pull request 0 ratifies the constitution proposed in [contracts/vscode-constitution.md](contracts/vscode-constitution.md), through `/speckit-constitution` in that repository: IntelliJ's five principles restated for Visual Studio Code, plus one that the definitions in `etalii.adp` are the reference. The plan's check against it is in `plan.md` and is repeated against the ratified text before pull request 1 is opened (FR-060).

## Spikes

Each is the first task of the pull request that depends on it, is kept as a level 3 test, and has a fallback decided now.

| | Question | Proof | If it fails |
|---|---|---|---|
| S1 | Does replacing a line by itself through a `WorkspaceEdit` add a step to the document's undo history, mark it dirty, and come back as a change with the reason "undo"? (R6) | a level 3 test: apply it, see `isDirty`, run `undo`, see the reason and the clean document | the registration becomes a second text document edited in the same `WorkspaceEdit`, and Visual Studio Code's question on undoing across two files is entered in the parity record against FR-031; the spec is taken back to `/speckit-clarify` before pull request 4 |
| S2 | Does a drag started in a webview view reach `dragover` and `drop` in a custom editor's webview with its data? (R10) | by hand on Windows, macOS and Linux, since synthetic events cannot show it; the result is recorded in the parity record | the toolbox is also mounted inside the diagram's editor, where the drag is within one document (FR-039's second clause) |
| S3 | Do breakpoints in `src/view/**` bind with `debugWebviews` and the bundles as built? (R14) | by hand, timed, as quickstart step 6 | the launch configuration gains a second, attached configuration for the webview and a compound that starts both; still one step for the contributor |

## Open points

- **O1. The behavior model's leaf colours disagree.** The definition (`color.abm.action` `#86e6d9`, `color.abm.other` `#ededed`; the companion: "Do teal, Ask the user and Delegate grey") and the standalone stylesheet (`--color-diagram-abm-action: #ededed`, `--color-diagram-abm-other: #86e6d9`: Do grey, Ask the user and Delegate teal) give the two colours to opposite kinds. By FR-007 this is settled in the definition, not in this host. Pull request A carries the correction once the owner says which side is right; until then this host follows the definition, as the first principle says, and the difference from the standalone host is entered in the parity record.
- **O2. Local checkouts are behind.** The standalone, IntelliJ and VS Code checkouts on this machine are 22, 16 and 10 commits behind their `origin/develop`. `npm run vendor` reads a named commit, not the working tree, so this affects no result here, but a task that copies by hand must pull first.
