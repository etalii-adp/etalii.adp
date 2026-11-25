# Research: The Timeline in VS Code, as the Standalone One

What the plan rests on, found by reading VS Code `develop` at `e82bc9d`, standalone `develop` at `9555565b` and etalii.adp `develop` at `3fb0884c`, and by the inventory's scratch copy of the definition into VS Code (spec, *Context*).

## R1. The unsupported-feature warning (A1)

- **Decision**: build `axis.time` (R4) and `snap.calendar` (R6) in VS Code and list them in `src/core/disl/support.ts`; drop the stale `persist.yaml` from `language.requires.features` of `definitions/diagrams/timeline.dis` in etalii.adp, closing the timeline's part of issue #788, and raise the definition's version to 1.2.1.
- **Rationale**: the timeline persists through its FBL binding (`persistence.format: fbl`), so nothing reads DID's `persist.yaml`, as spec 088's R1 found for the dependency graph. Listing it as supported in VS Code would make `supportRecord.test.ts` claim something false. The other two features are real constructs the definition uses, and FR-016 asks for them to be built for every diagram.
- **Note**: the change to `timeline.dis` touches a definition with ATD conformance fixtures; its pull request says so, so the ATD thread re-records `definitions/diagrams/conformance/timeline/` and `timeline.atd` if its check asks for it. Nothing the timeline draws or writes changes.
- **Alternatives**: list `persist.yaml` as supported; drop the finding for FBL-persisted tool types. Both hide the next wrong requirement.

## R2. Times as text (A2)

- **Decision**: in a diagram, a `datetime` or `date` attribute reaches CEL as the text the file writes; the conversion to a CEL timestamp in `src/core/disl/expressions.ts` stays for designers, where DESL 4.2 asks for it.
- **Rationale**: the definition's `timelineTimes` plugin states that DISL's CEL has no timestamps, and every function it declares takes a `string`. VS Code converts every `datetime` value to a timestamp, so `text.trim()` throws, and each element is reported with "could not be evaluated" (25 findings on `roadmap.tml`). The FBL YAML family already keeps a timestamp-looking scalar's text; only the expression layer turns it into a `Date`.
- **Alternatives**: convert back inside the plugin, which would leave the fallbacks failing for any host without it.

## R3. The time functions (A3)

- **Decision**: the plugin `src/core/plugins/timeline-times/` (`net.etalii.adp.generic.timelineTimes`, kind `celFunctions`), ported from standalone's `TimelineTimes.cs`, `TimelineInstants.cs` and `_Model/TimelineInstant.cs`: `readableTime`, `compareTimes`, `dateAfter`, `today`, `writtenEnd`, with .NET's reading of a time replaced by the formats those files accept (ISO 8601 date, date and time with or without seconds, years before 1000 as `0079-08-24`).
- **Rationale**: the plugin is named by the definition, so it is the definition's seat for this code (VS Code's rule, *A tool type is its definition*). Its test reads every time of the conformance fixtures and the four examples and compares the answers with standalone's `TimelineTimes.Tests`-style cases.
- **Open**: .NET's `DateTime.TryParse` accepts more than ISO 8601 under the invariant culture. What standalone accepts beyond the fixtures is listed in VS Code's `docs/parity.md` rather than imitated, unless a fixture or example holds it.

## R4. The time axis of days and its ruler (B1)

- **Decision**: `src/core/disl/coordinates.ts` reads a time axis of `valueType: datetime` (DISL 5.4) beside `yearMonth`: origin `1970-01-01T00:00:00Z`, `scale.unit: day`, `scale.size: 20`, no time zone. A value's position is its days since the origin, with a time of day as a fraction. The ruler's adaptive levels (`ruler.adaptive`, already supported for months) gain the units decade, year, month, week and day, ported from standalone's `client/timelineTicks.ts` and `TimelineRuler.tsx`, never finer than a day (FR-006).
- **Rationale**: a time axis of dates is a construct of DISL, so it lives in the shared interpreter and names no tool type (FR-016, SC-006). The standalone client fits the timeline's whole span into 1000 of its 1200 units at first sight; VS Code's fit to the window does the same job, and the difference in first zoom is recorded in `docs/parity.md` only if the side-by-side check shows one.
- **Alternatives**: a timeline-only canvas, as the standalone host has, which the spec rules out.

## R5. The diamond and the period bar (B2, B3)

- **Decision**: `diamond` joins `builtInShapes` in `src/core/disl/notation.ts` (DISL 6.3 lists it) and is drawn by `src/webview/diagram/scene.ts` as a polygon through the four mid-sides of its bounds. A period's bar is `placement.bound` with `x2` on the time axis, which VS Code supports for numbers and months; it is held to dates in a test.
- **Rationale**: the edge-end code already draws a diamond marker, but no node shape is a diamond. The colours and sizes are the definition's styles, checked against standalone in both themes in the side-by-side check (SC-001).

## R6. Calendar snapping (C1, C2)

- **Decision**: `src/core/scene/snapping.ts` reads `snap.calendar` (DISL 5.7): `x.calendar: { unit: day, align: nearest }` snaps a date-only value to the nearest day; a value written with a time of day is not snapped and keeps whole seconds, as the definition's note says; `size.x.calendar` does the same for a dragged edge. The written text keeps the value's precision: a date stays a date, a date and time a date and time.
- **Rationale**: the conformance fixtures' `move` and `create` steps record the bytes standalone writes, so the replay test (R9) holds this.

## R7. Gestures and Arrange diagram (C1 – C3)

- **Decision**:
  - The toolbox's `initial` values read `position.x` as the axis value at the drop, written as a date (`2025-04-27`); `dateAfter(position.x, 14)` gives the end. This is the scene's position in axis units, which VS Code passes to `initial` already for linear axes.
  - Moving a period moves `begin` and `end` by the same number of days; dragging an edge changes one of them and stops at the other (`placement.resizable.x`).
  - Arrange diagram is the layout plugin `src/core/plugins/timeline-row-arrange/` (`net.etalii.adp.generic.timelineRowArrange`), ported from `TimelineArrangement.cs`, writing only `row`, as one undo step. A moment's extent includes its label's width at 12 units, which the port takes as standalone's backend does (its own width estimate), so the core measures no text.
- **Rationale**: the arrangement is named by the definition as a plugin, and its rules (extents at first fit, clearance 12, related elements on nearby rows) are standalone module code.

## R8. Properties and findings (D1, E1)

- **Decision**: the form rows and constraints are the definition's; VS Code reads them as it does for the other tool types. What the `findings` fixture and the `property` steps of `roadmap` show beyond that (an order of findings, a refusal sentence) goes into a `ReadingLogic` for `generic/timeline` (`src/core/plugins/timeline-reading/`), as spec 088 did for the dependency graph, only where the replay shows it is needed.
- **Rationale**: the dependency graph needed reading logic for its order of findings; whether the timeline does is answered by the replay, not assumed.

## R9. The conformance replay (FR-017)

- **Decision**: `fixtures/tools/timeline/` holds a copy of `definitions/diagrams/conformance/timeline/` taken by `scripts/sync-definitions.mjs` with the definition, and `test/core/tool/timeline.test.ts` replays its three cases: the file after each step byte for byte, the findings after each step, and of each drawing the elements' types, shapes, labels and order, with bounds compared after the axis's scale. Requests no VS Code gesture makes are listed in `docs/parity.md` with their reason.
- **Rationale**: the fixtures are the record of standalone's behaviour (spec, *Assumptions*); a copy kept by the sync script cannot drift from etalii.adp unseen, because `sync-definitions -- --check` runs in the Build workflow.

## R10. Examples and the Marvel universe (F1, SC-004)

- **Decision**: `scripts/sync-examples.mjs` copies `example-1`, `example-2`, `marvel-universe` and `marvel-universe-overview` from standalone's `src/diagrams/timeline/examples/`, with readmes and registrations. `marvel-universe.tml` (428 events, 479 links) is opened in a unit test that reads and builds its scene within a time budget, and the three seconds of SC-004 are measured on the Mac mini.
- **Rationale**: the examples changed on 2026-11-25 (standalone #828, #829); the copy follows standalone's `develop` at the time of the pull request.

## R11. Delivery order

- **Decision**: the definition change (R1) lands in etalii.adp first, then standalone re-bundles it, then VS Code copies it. VS Code then takes four pull requests: reading and the time functions with the examples; the drawing; gestures and Arrange diagram; properties, findings, the conformance replay and the documents. The side-by-side check, the screenshot and the new-user attempt (SC-001, SC-004, SC-005) are a host test on the Mac mini.
- **Rationale**: VS Code's copy is checked against its record, so it follows etalii.adp; each VS Code pull request is reviewable on its own and leaves `develop` green.
