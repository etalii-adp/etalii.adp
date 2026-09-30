# Example gaps: constructs the examples could not express as the construct map describes

Found while writing the seven DISL 0.2 examples and `findings.json` (T022, T031, T032, T040, T048, T057, T062, T065, T070, T075, T080). The schema was not changed. All 41 examples validate.

## Schema differs from the construct map or the research

1. **Handle `label` is LocalizedText, not a Message** (`$defs/Handle.properties.label`). Research 8.11's gartner example writes the boundary handle's label as `{cel}` ("Peak ends <month>"). `gartner-hype-cycle.dis` uses plain labels ("Peak ends") at `/notation/shapes/phasedBanner/handles/*/label`. schema-choices #37 already records this; widen Handle `label` to Message if the computed label is wanted.
2. **A declared notice cannot replace a built-in `budget:<id>` notice.** Construct map 6.13 says a built-in `budget:<id>` (or `unavailable`) notice is replaced when "the specification declares a notice with that id", but `Notice.id` is a SimpleId (`^[A-Za-z_][A-Za-z0-9_]*$`), so `budget:cards` cannot be declared. `rdf-graph.dis` works around it with `notice: false` on the budget and its own notice `truncation` (`/notation/canvas/notices/0`). Either allow `budget:<id>` in `Notice.id` or say the replacement is by `Budget.notice` only.

## Points the prose and schema leave open (the examples chose a reading)

3. **An `ids.types` rule on a derived node type.** The construct map puts IRI ids (11.5, `strategy: "derived"`) and derived Resource cards (4.11) both in `rdf-graph.dis`. For a derived type the id is `derived.id`, so an `ids.types.Resource` rule with its own `strategy` would state the id twice and could contradict it. The example shows the IRI id as `Resource.derived.id` (`'res:' + item[0]`) and uses `ids.types` for stored types only (Triple with a repeat counter, the Base singleton), except `ids.types.BlankNode`, which has no `strategy` and only `ephemeral` and `reason`, to mark the derived blank-node cards ephemeral (research B1: "stable unless marked unstable by the identity construct"). The schema accepts this; the prose should say which properties of an IdRule apply to a derived type (probably `ephemeral` and `reason` only) and that `derived.id` wins.
4. **One built-in `message` for findings and refusals.** `BuiltInSetting.message` is one Message, but construct map 8.1 says it binds `detail` for findings and `violation` for gesture refusals. A message written with `violation.relationType` (the FDG refusal wording, `functional-decomposition.dis` `/constraints/builtIn/std.multiplicity/message`) fails to evaluate when the same built-in reports a finding on a stored document, and falls back to the runtime text. Either give BuiltInSetting separate `message` and `refusal` (both Messages), or state that `violation` and `detail` are both bound (one of them empty) so a message can branch on them.
5. **`parseYearMonth(s) → int` has no failure value**, so it cannot validate typed input. The "not a date; write it as YYYY-MM" validation in `gartner-hype-cycle.dis` (`/forms/trend/items/1/validate/0`) uses a regular expression instead; `parseYearMonth` is not shown. Returning `optional(int)` would let validations use it.
6. **`detail.entry` of `std.unreadableEntry` has no stated shape** (prose choice 11 lists the key only). The examples use `detail.reason` only.

## Shown with a stand-in because the schema forbids the direct form (expected, not a gap)

7. **Ruler `levels` and `ticks` are mutually exclusive** (`not: {required: [levels, ticks]}`), as construct-map note 2 foresaw. `gartner-hype-cycle.dis` shows `levels` on the `time` axis and `ticks`/`boundaryFormats` on a second axis, `announced`, used by a stand-in `announcements` viewpoint.

## Construct map rows with no example use

8. 6.8 "a custom shape named like a built-in shadows it": `functional-decomposition.dis` now uses the built-in `superellipse` and shows the diode as a custom shape, so no shadowing is shown. Not a schema gap.
