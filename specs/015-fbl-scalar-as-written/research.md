# Research: FBL Reads a Scalar as Written

Each decision of the plan, with what it rests on and what was set aside.

## R1. A text attribute reads the written text without being asked

**Decision**: without `read`, a slot bound to an attribute whose type is a string reads the scalar's written text; a slot bound to any other type reads the typed value.

**Why**: FBL 0.4 said what CEL sees of a scalar (section 4.1.4) and that a value which "does not convert to the attribute's type" makes its entry unreadable (section 7.4). It did not say what a string attribute reads from `yes`. Every tool that owns a hand-edited YAML file takes the text. The timeline's module says so in its own code: its model is built from its own reader "because FBL's YAML reading types a plain scalar (`1.0`, `null`, `yes`) while a timeline keeps every value as the text it was written with". A default that needs `read: "text"` on every label of every binding would be forgotten once, and the file would open with a label changed.

**Set aside**: text only on request. It keeps 0.4's silence as 0.4's behaviour, at the cost above. And typed everywhere, with the specification language declaring the exception: that moves an FBL reading rule into DISL and DESL.

## R2. An id and a reference are written text

**Decision**: always, with or without `read`.

**Why**: `dependency-graph-disl-fbl` (finding B1) found that the standalone library builds an id from the typed value, so `id: 007` becomes `7` and a relation written `007` no longer names it. An id is a name.

## R3. `text` and `style` in CEL

**Decision**: two variables shaped like `entry`.

**Why**: a rule's `when` tells entries apart by content. `entry` keeps its meaning, so no 0.4 expression changes. `has(entry.end)` already tells a key with no value from an absent key, because the key is in the map with the value null; section 4.1.4 now says so. `style` is what the spec's FR-004 asks for ("whether it was quoted") without a new function.

**Set aside**: a function `written(entry.label)`. A CEL value does not know where it came from.

## R4. `fallback` and its finding

**Decision**: `fallback: {value, report}` on an attribute binding; the finding `fbl.unconverted-value`, a warning, at the value, with `attribute` and `text` in its detail; `report: false` switches it off.

**Why**: the dependency graph, Sankey, supply chain and Databricks tools read an unconvertible number as zero today and draw the element, most of them without a finding. Under 0.4 the entry is unreadable and the element is gone: for a Databricks bundle with `num_workers: ${var.workers}`, a cluster. `report: false` lets a conversion keep today's findings exactly and adopt the new one later, on purpose.

**How a tool words its own finding**: it binds a second, read-only attribute to the same key with `read: "text"`, as bindings already bind `storedId` beside an id, and its rule reads that attribute. No new construct, and nothing for DISL or DESL to add.

## R5. A quoted number

**Decision**: `quoted: "convert"`, opt-in.

**Why**: Sankey reads `value: "12"` as twelve; the timeline reads `row: "3"` as three. YAML says a quoted scalar is a string, and for a file another tool owns that is the right reading, so it is not the default.

## R6. Writing a text attribute

**Decision**: section 6.3's plain-safe test is unchanged for it; `style: "plain"` on the attribute writes plain wherever the syntax allows.

**Why**: the text `yes`, written plain, reads back as `yes` through the binding and as a boolean in every other YAML reader. For a Databricks or Azure DevOps file that would change what the owning tool reads. A format ADP owns outright can ask for plain.

## R7. A fixture's `attributes`

**Decision**: an element of a fixture's `read` may carry `attributes`; a string is a text, any other JSON value is typed; attributes not named are not compared.

**Why**: a fixture could say which elements a reading yields and not what any of them holds, so this feature could not have been stated as a fixture at all.

**Limit**: the repository's validator replays splices and cannot check a `read`. That stays the hosts' conformance run. It was seen to fail on a planted wrong offset in the new fixture, and cannot be made to fail on a planted wrong attribute value.

## R8. The timeline binding

**Decision**: `begin` and `end` are read as text although the definition types them as date-times; `row` converts a quoted number and falls back to 0 without a finding.

**Why**: it is what `TimelineParser` does today: it keeps a time's text and reports one it cannot read in the tool's own words, and reads a row that is no integer as 0.
