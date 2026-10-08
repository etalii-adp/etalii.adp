# Research: The Gartner Hype Cycle Graph as a Notion Add-on

What the plan had to find out or choose, with what was found on 2026-10-08. Decisions D1 and D2 are the two clarifications of the specification, answered by the maintainer.

## What exists

- `etalii.adp/definitions/diagrams/gartner-hype-cycle-graph.dis`: 1434 lines, DISL `0.3`, conformance `standard`, twelve required features (`axis.yearMonth`, `ruler.adaptive`, `snap.byGesture`, `anchor.part`, `canvas.filters`, `viewpoint.variants`, `placement.bound`, `shape.custom`, `shape.composite`, `edge.bezier`, `label.parse`, `persistence.fbl`), 24 CEL functions, and a `persistence` section that names the FBL binding by a URL into `etalii.adp.ide.standalone`.
- The binding, `gartner-hype-cycle-graph.fbl#ghg`: FBL `0.1`, body `file` of family `yaml`, ten element rules, a template, and the unit and header marked read-only.
- No host interprets a DISL specification. The standalone and Visual Studio Code hosts state each diagram type by hand: a `DiagramDefinition` and a module of parser, writer, rules and view per type.
- The Visual Studio Code host has a complete FBL library in TypeScript, `src/core/fbl`, about 9000 lines, that names no tool type and imports neither Visual Studio Code nor a browser. It reads a body through a binding, plans each change as splices, and keeps a history with exact undo and drift refusal. It imports `yaml`, and `node:crypto` in one four-line file.
- `etalii.adp.ide.notion` at `origin/develop` holds a build script that copies `addons/<id>/` and writes the index, with no dependency and no test. The local clone is four commits behind.
- The other hosts ship nine examples, of 36 to 518 entries. `technology-trends` has 197 trends.
- In the Notion workspace, the page "Gartner Hypecycle Graph" holds the database "Gartner HypeCycle Graph - Data" (one title property `Name`, no rows) and the page "Diagram", which embeds the add-on index. A page "Root" beside it embeds the index too.

## Decisions

### D1. The add-on reaches Notion through a small service (FR-010)

**Decision**: the add-on stays a static page in an embed block. A service beside the pages completes Notion's sign-in and forwards the add-on's calls to the Notion API. The person looking at the page grants access once; the add-on then sends their token with every call.

**Rationale**: the maintainer's choice. The Notion API sends no CORS headers, so no browser page can call it, and Notion's sign-in ends in an exchange that needs a client secret. With the service, the only secret is that client secret, and it never reaches a page.

**Alternatives considered**: a Notion custom block (`@notionhq/custom-blocks`, deployed with `ntn workers`), which reads and writes data sources with the viewer's rights and brings Notion's theme. Not taken: it is in alpha, it needs a plan that includes Workers, and it is neither an embed block nor an address under `/adp-notion`. A token in the page: a published secret.

### D2. One row per element, properties only (FR-007)

**Decision**: a store holds one row per element the binding reads: each trend, trigger, note and influence, and one row for the unit when the graph has one. Each key of the binding is a property. No document text is kept.

**Rationale**: the maintainer's choice. A reader sorts, filters and edits the elements in Notion's own table.

**Consequence**: comments, the order of keys, keys the binding does not read and entries that are not a mapping are lost when a document is put in. SC-003 was reworded to compare what a host reads. The finding for a key the binding does not read cannot arise from a store.

### D3. The rows are the source of truth below the binding

**Decision**: below the binding, the rows of the store are the document. There is no stored document text and no second document. On opening, the store reads the rows through the binding with the FBL library; the body the library plans against is built in memory from the rows and is a reading of them, never a source. An edit is planned by the library as splices, and each splice is resolved to the rows and properties it lands on by the rule of [contracts/store.md](contracts/store.md): the splice's place gives the element rule and so the kind, the entry gives the row, the key gives the property. The store writes those rows and properties and no other. It does not read the rows back and compare them to find out what changed.

The body in memory is built by replaying the rows as insertions into the binding's template through the FBL library itself, in the order of the `Order` property, so the binding's keys, key order, styles and number formats decide every line. A rule whose `at` names one place and is read-only, as the unit's is, is written by the store as a single line, because the library refuses to. A reference is a Notion relation between two rows and reaches the binding as the stored id of the related row.

**Rationale**: FR-003 forbids changing the binding and FR-004 forbids a store that knows the hype cycle graph. This way the store needs no knowledge of YAML and no second description of the format: which rows exist, which properties they have and how a value is written all come from the binding, and every refusal, cascade and sentence of FBL keeps working. Writing exactly the rows a splice lands on keeps one edit to the writes it implies, which a comparison of every row cannot promise under Notion's rate limit.

**Alternatives considered**: mapping rows straight to the interpreter's model, with FBL left out. It would restate the binding's keys, defaults, cascades and refusals in the store. Writing the text with a YAML emitter of our own: a second writer beside FBL's. Reading every row back after an edit and writing the rows that differ, and a reference kept as text: the first design, given up in the maintainer's review of the data model on 2026-10-07.

### D4. The FBL library is copied from the Visual Studio Code host

**Decision**: `scripts/sync-fbl.mjs` copies `src/core/fbl` from `etalii.adp.ide.vscode` at a recorded commit into `src/fbl/`, byte for byte, with a `PROVENANCE.md` and a SHA-256 per file. It is never edited here; a correction goes to that repository. The add-on imports the modules it needs and not the library's index, which also exports file access for Node. esbuild replaces `node:crypto` with a small digest of our own.

**Rationale**: the library is general, tested against the shared fixtures, and has no dependency on its host. The organization already shares files between hosts this way (`sync-examples.mjs`, `sync-fbl.mjs` in the Visual Studio Code host). Writing FBL a third time would be three implementations to keep equal.

**Alternatives considered**: a git dependency on the Visual Studio Code repository. It installs a private extension's whole development toolchain. A published package: no registry is in use, and one library does not justify one. Writing a small reader for this binding only: against FR-004 and FR-028.

### D5. The DISL interpreter is new, and sized to this specification

**Decision**: `src/disl/` interprets a specification with one module per section. It supports the twelve features this specification requires and the constructs it uses, checks a specification's `requires.features` against that list on loading, and shows what is missing as a finding. `docs/disl-support.md` lists what is supported and what is not (FR-005).

**Rationale**: no host has an interpreter to reuse. Supporting all of DISL for a tool that uses a part of it is what principle V forbids. The check on loading is what keeps the add-on from claiming more.

**Alternatives considered**: stating the diagram by hand, as the other hosts do, and reusing the Visual Studio Code host's canvas. It is the shortest road and it fails FR-002, FR-004 and Story 1 scenario 6.

### D6. Specification and binding are copied into the add-on's folder

**Decision**: `scripts/sync-specifications.mjs` reads each add-on's `addon.json`, copies the `.dis` from `etalii.adp` and the binding from the repository its `persistence.binding` names, byte for byte, and records commits and SHA-256 sums in the folder's `PROVENANCE.md`. The page loads both files at run time by relative address. `Build` fails when a file differs from its record.

**Rationale**: the build must give the same tree for the same revision, so it cannot fetch from a moving branch. Loading the files at run time, not compiling them in, is what makes Story 1 scenario 6 true: a changed specification is a new copy and no change to code.

**Alternatives considered**: fetching from `raw.githubusercontent.com` in the browser: a third-party request on every page view, and a diagram that changes with no publication. Checking out two more repositories in the site's deployment: the site's workflow would have to know what is inside.

### D7. CEL comes from a library

**Decision**: `@marcbachmann/cel-js` (MIT) evaluates the expressions, with DISL's helper functions (`yearMonth`, `parseYearMonth`, `formatYearMonth`, `enumLabel`, `clamp`, `textWidth`, `isA`, `nodesOfType`, `outgoingOf`, `incomingOf`, `lower`, `flatten`, `distinct`) registered on it. The first task of the interpreter parses every expression of the specification with it. If it cannot take `cel.bind`, the optional syntax or the `math` functions, the fallback is an evaluator of our own in `src/disl/expressions.ts`, and this decision is updated before anything builds on it.

**Rationale**: the specification uses CEL well beyond the subset the FBL library's own evaluator takes, and that evaluator is a copy we do not edit. A parser for a published language is not something to write when a compatible library exists.

**Alternatives considered**: extending the copied evaluator: it would stop being a copy. `cel-js`: older and narrower.

### D8. The service is one Cloudflare Worker

**Decision**: `service/worker.ts` has three jobs: start Notion's sign-in, exchange the code for a token and hand it to the page that asked, and forward calls to `api.notion.com` with CORS headers for the origin `https://etalii.net`. It keeps no state and stores no token. It forwards only the calls the store makes. The token lives in the browser's storage for the add-on. `Build` deploys the Worker on a push to `develop`, with a Cloudflare token as the repository's second secret.

**Rationale**: a stateless forwarder is the smallest service that answers D1. Cloudflare's free plan covers it, and a Worker deploys from one file with no server to keep.

The service is written as a handler that knows no platform, and the Worker is a wrapper around it that is built last (the maintainer's instruction of 2026-10-08). Until then `node scripts/service.mjs` runs the same handler locally, and with `--memory` it stands in for Notion as well.

**Alternatives considered**: a Notion Worker: it needs a paid plan and has no documented way to answer a browser. Keeping tokens in the service behind a cookie: browsers block third-party cookies in an embedded page. A proxy that holds one workspace token: everybody would act with the same rights, against FR-010.

### D9. Undo is a command history of the add-on's own, stored as row writes (FR-026)

**Decision**: an embedded page has no part in Notion's own undo, so the add-on keeps its own history. It is command based and a shared part of its own, `src/history/`, after the standalone application's `EtAlii.Adp.History`: a command is plain data, exactly one handler per command type carries it out and reports the inverse command, a dispatcher finds the handler, and a history stack keeps each command with its inverse. An undo dispatches the inverse and a redo dispatches the command again; both are ordinary dispatches and are stored as row writes with the same checks as an edit. One gesture is one command. CTRL+Z and CTRL+Y work while the diagram has the focus, as do the macOS keys, and two buttons give the same without a keyboard. The history ends when the page is closed.

**Rationale**: the history then knows neither Notion nor the store nor a tool type, so another add-on uses it without change (FR-028), and it is the part the standalone host already has. The FBL library's own history undoes splices on a body; here the body is a reading of the rows, and what has to be undone is row writes, which the store's handlers know. A gesture that changes several attributes or entries is one command, so it is one step (FR-024).

**Alternatives considered**: the FBL library's history, one entry per gesture. It was the first design, given up in the maintainer's review of the data model on 2026-10-07.

### D10. Nothing is overwritten unseen (FR-022)

**Decision**: before the store writes, it asks the database for rows edited since its last read. If any were changed by somebody else, it writes nothing, tells the user, reads the database again and clears the history. It checks the same way when the page regains the focus. A write that fails leads to the same reload (FR-020).

**Rationale**: the Notion API has no conditional write, so a check just before writing is the closest available. The window between check and write stays open; it is listed as a known limit in `docs/disl-support.md`.

### D11. The add-on's id and address

**Decision**: the id is `gartner-hype-cycle-graph`, the name of the specification's file. The address is `https://etalii.net/adp-notion/gartner-hype-cycle-graph/?store=<database id>` (FR-009). Without `store`, the page says how to set a graph up.

**Rationale**: the language id has dots and the origin a slash, which the id pattern refuses. The file name is the one spelling `etalii.adp` itself uses.

The Notion repository's principle I says `<id>` is "the id of that tool type". That wording is amended with the other amendments of this feature to "the name of the tool type's specification file, without its extension" (plan, Complexity Tracking).

### D12. Shared parts live in `src/`, and the build compiles

**Decision**: `scripts/build.mjs` keeps its command line. It runs `scripts/ensure-dependencies.mjs` (`npm ci` when `node_modules` is missing or stale), bundles `src/frame/main.ts` and the styles once, and writes them into each add-on's folder in `<dir>` beside the folder's own files. The site's deployment changes nothing.

**Rationale**: FR-027 and FR-028. The contract with the site is the command line, and it holds.

### D13. Notion's look without Notion's stylesheet

**Decision**: `src/panels/notion.css` states Notion's type, colours, spacing, corners and focus ring as CSS custom properties, in a light and a dark set, taken from Notion's web client, each value recorded with its source and date in `docs/styling.md`; the pass beside Notion corrects them. The panels and the frame use only those properties. The appearance follows `prefers-color-scheme`, and `?theme=light` or `?theme=dark` in the embed address overrides it. `docs/styling.md` lists every departure (NFR-004).

**Rationale**: an embedded page cannot read the page around it, so it cannot see Notion's own appearance setting; the system setting is what it can tell (NFR-003 says "wherever it can tell"). The specification's theme tokens cover the diagram, not the panels.

### D14. Filling a store, and the examples (FR-007, FR-029)

**Decision**: `scripts/store.mjs put <database> <file>` and `take <database> <file>` move a document between a `.ghg` file and a store, with the same `src/store` code and a Notion token from the environment. `put` also adds the properties a database lacks. The add-on offers the same "prepare this database" step to a user who opens an unprepared one. The nine examples are synced from `examples/gartner-hypecycle-graph/` of `etalii.adp.ide.vscode` into `test/examples/` and put into nine stores with the script. Each Showcase entry is a page named after the example's display name, the heading of its `readme.md`, holding a database "<name> - Data" and a page "Diagram" with the embed.

The first graph's pages are renamed to the display name, "Gartner hype cycle graph" and "Gartner hype cycle graph - Data" (FR-030). FR-008's titles are how the request found them. The page "Root" is left as it is: it is not an example.

**Rationale**: 2000 rows cannot be typed, and the test of SC-003 is the same two commands.

### D15. Tests

**Decision**: vitest, as in the Visual Studio Code host. The store runs against an in-memory Notion that keeps rows and edit times. The nine examples and the shared fixtures are test documents. For SC-001, `scripts/sync-examples.mjs` also writes, for each example, the places the Visual Studio Code host computes (its `view.ts` at the recorded commit), and the interpreter must compute the same; what a place is and when two are equal is in [contracts/shared-parts.md](contracts/shared-parts.md). `test/words.test.ts` fails when a file under `src/` holds one of the specification's own type, attribute or rule names as a word of its own (FR-004); the same contract says what that is and which names are exempt. The panels are given the mind map's specification for SC-007.

## Risks

- **R1, SC-002.** A query returns 100 rows, so 50 trends with their influences load in two or three calls and fit the 3 seconds. `technology-trends`, 518 rows, needs six calls in sequence and will not. Replaying 518 rows through the library reads the text again after each; if that proves slow, the store batches a list into one insertion.
- **R2, SC-004.** Notion allows about three requests a second. An edit of one element is in the database well within 5 seconds. "Arrange diagram" on a large graph writes a row per moved element: about 70 seconds for 200 trends. The canvas shows the result at once and a status shows the writes in progress, but the 5 seconds do not hold for such an edit.
- **R3, FR-021.** A token reaches only what its person shared with the integration. Somebody who may read the database but may not share it sees the invitation to connect, not a read-only diagram. A read-only diagram is what a person gets whose grant allows reading only, or whose write Notion refuses.
- **R4.** Sign-in opens a window from inside an embedded page. If Notion's embed block forbids that in some client, the invitation offers a link that opens the add-on in its own tab, where sign-in works, after which the embed has the token only if the browser shares storage between the two; it may not. If neither gives the embed a token, the work stops there and the plan returns to D1: no story is built on a sign-in that does not work. So this is checked in the first manual pass, before Story 1, as soon as the session, the service and the frame exist, against the local service.

  **Found on 2026-10-09**: in a web browser the grant works from inside the embed block. In the Notion desktop app it does not: the app hands the grant to the system's browser, a window with no way back to the page. The maintainer chose that the service hands the grant over: it keeps a completed grant for at most 120 seconds, and the page asks for it with a verifier only it has (`POST /grant`). The service is therefore no longer without state, and the Notion repository's principles are amended.

## Differences to raise in `etalii.adp` (FR-003)

Found while reading, raised as issues, settled nowhere in the add-on:

- The `.dis` declares DISL `0.3` and points at the `0.2` schema.
- The binding lives in `etalii.adp.ide.standalone`, and the specification points at its `develop` branch.
- Four things the specification leaves unstated, which its companion document names: the property grid during a drag, a toolbox drop in the compact viewpoint, where an end on an unknown phase or edge is drawn, and the text of an influence end that names nothing. Until `etalii.adp` states them, the shared parts follow for each an interim rule that names no tool type and draws as the Visual Studio Code host does, and `docs/disl-support.md` lists the four as not taken from the specification.
- The unit and the header are "changed in the file itself", and a store has no file. In Notion the unit is changed in the database's own table.
