# Research: Export a Causal Loop Diagram as an Animated Flow Page from the Desktop Host

## R1. Where the diagram's own properties come from in the `.cld`

**Decision**: two new statements, each read as an entry of its own type and mapped onto the diagram by the definition's `typeMap` with `as: "diagram"`:

- `title "<text>"` sets the diagram's Title;
- `flow` followed by `key=value` words (`strength=`, `delay=`, `inertia=`, `speed=`, `density=`, `heatmap=`) sets the six dynamics properties.

The binding writes each statement after the header when it is first needed. It writes only the keys that differ from their defaults, and removes the statement once it holds none (FR-028). No host could write a diagram attribute when this was decided, so the plan's S and D1 add one generic write path: a form for the diagram committed by its row, and the attribute written to the entry its `typeMap` entry names it under, by the existing set, remove and add changes. `after-header` needs a binding `header`, which would raise a warning for a file without one (`no-header.cld`), so a new statement is an add with the position `{after}` of FBL section 11.2, naming the header or the title; FBL's prose said only what an index means for a declared binding, and now says what `{after}` means for an entry of another type. Neither adds a construct (FR-022). See [contracts/cld-flow-statements.md](contracts/cld-flow-statements.md).

**Rationale**: DISL 0.3 already maps a binding type onto the diagram (`typeMap … "as": "diagram"`). The hype cycle graph's `Unit` line and the supply chain's `Document` use it, so no language construct is added (FR-022). Words of the form `key=value` in a tail are the binding's existing way of writing a number, as `weight=` is.

**Alternatives considered**: putting the properties on the `causal-loop 1` header line. That was rejected because the header is read as an entry so that a missing or repeated header raises nothing, and words added to it would make an older host report the whole header as unread. A `#`-comment form was rejected because comments are never read. One statement per property was rejected because it would add six statement kinds for one concern.

## R2. Variable properties

**Decision**: two more words in a variable's tail, `start=<0..1>` and `push=<-4..4>`, read as the binding reads `weight=` on a link: a number written in its shortest form, removed when set back to the default.

**Rationale**: the variable rule already captures a tail (`(?<rest>.*)`), so an older host keeps such a line byte for byte. An older binding reads it as a variable whose rest is unread, which FR-029 accepts.

**Checked** (T001, the fixture `causal-loop-flow-older`): an older binding reads `variable a "A" start=0.7` with its rest unbound, so the line is kept and takes edits, and its rest is kept byte for byte. It is not reported, since FBL reports unmatched statements and not unbound words. FR-029's "reported as unread" therefore holds for the `title` and `flow` statements and not for these two words. The fallback statement is not needed. Regular expressions in FBL have no lookahead, so to keep `variable a start=0.7` from reading `start=0.7` as a label, the label and the two words read one tail group, and a bare label holds no `=`.

## R3. How the ribbon learns of an export without naming the tool type

**Decision**: `DiagramModule` gains `fn exports(&self) -> Vec<Export>`. An `Export` holds an id, a label (`Export flow page`), a hint, and a function from the open session to an `ExportOutput` (a file name and the bytes). The ribbon shows one button per export of the active tab's module. The shell writes the bytes beside the document, opens them, and reports in the status bar.

**Rationale**: desktop Principle III. The frame knows exports, not causal loop diagrams, so a later tool type adds one without touching the frame (FR-002).

**Alternatives considered**: an action in the selection's menu (`Run(id)`). That was rejected because it appears only with a selection and answers with model edits, not files.

## R4. Opening the page

**Decision**: `std::process::Command` with the platform's own opener: `explorer` on Windows (`cmd /C start "" <path>` where `explorer` cannot take the path), `open` on macOS and `xdg-open` on Linux. The host waits only for the opener to start. If the opener is missing or fails, the status says where the page is (FR-005, User Story 1 scenario 5).

**Rationale**: it is the platform's mechanism (desktop Principle I) and needs no crate (Principle V). The host never embeds or needs a browser (FR-024).

**Alternatives considered**: the `open` crate, which does the same thing with one more dependency.

## R5. Showing the diagram's properties when nothing is selected

**Decision**: in both hosts, an empty selection shows the diagram's own attributes (`metamodel.diagram`) under the diagram's name, with the same rows, groups and edits as an element's. In the desktop host this replaces "Select an element to see its properties." for a tool type that has diagram attributes, and keeps that sentence for one that has none. In the standalone host, T010 checks first whether the property grid already does this for a DISL diagram, as it does for the Wardley map's diagram element. If it does not, the same generic section is added there.

**Rationale**: the maintainer named the diagram itself as the place for the missing fields, so the properties must be reachable without selecting anything.

## R6. Testing the page

**Decision**: a small Node script under `tools/flow-page-check/` in the desktop host uses the Playwright already present on the hosted runners. It opens a generated page with the network blocked and asserts the following:
- nothing was requested;
- the counts of variables, links and loops;
- that dots appear on every link;
- that a delayed link holds more dots than a plain one from the same source;
- that every heatmap reading changes the colours;
- that every control changes the state it names;
- that a markup label shows as text;
- frame time on the 200-variable fixture (SC-003).

The `Build` workflow runs it on Linux after `cargo test`.

**Rationale**: the page is JavaScript, so only a browser can show it behaves. Desktop Principle I constrains the host at run time, not its CI.

## R7. The page's template and determinism

**Reference**: the prototype itself is kept byte for byte in [reference/mental-health-cld-flows.html](reference/mental-health-cld-flows.html) (the maintainer, 2026-10-31: "it needs to be the exact prototype page"). The template is that file; what may differ from it is the maintainer's to rule.

**Decision**: the page is the prototype, generalised. The mental health scenarios are removed. Every starting value is read from the embedded data (the flow properties, or defaults). The chart picks the seven variables in the most loops. The page holds a light and a dark palette under `prefers-color-scheme`. The diagram's data is embedded as one JSON object, written with sorted keys and numbers in their shortest form. Every string in it is escaped for HTML script content (`<` as `<`, `&` as `&`, and U+2028 and U+2029 escaped). Labels are written into the page only through `textContent` or the canvas's `fillText`. The template has no timestamp and no random seed, so the same input gives the same bytes (FR-010). Randomness is used only at run time, for the dots' scatter.

## R8. The screenshot's route to the website

**Decision**: the screenshot is committed in the standalone host's `docs/screenshots/` as `causal-loop-flow-page.png`. Its readme row says what it must show and that the page was exported from the desktop host. The capability description (User Story 9 scenario 2) is the screenshot's `whyItMatters` in `etalii.adp.site`'s `src/content/catalogue/screenshot-notes.json`, written in the screenshots refresh pull request.

**Rationale**: the site's tool page for `systems/causal-loop-diagram` takes its pictures from the hosts it lists. The desktop host is not among them and has no `docs/` folder, and the site's own rules forbid hand-written per-tool pages (FR-034).

**Alternatives considered**: making the desktop host a screenshot source of the site. That would need an amendment to site spec 003 and a catalogue in the desktop host, which is too large for one picture. It is left for a feature of its own.
