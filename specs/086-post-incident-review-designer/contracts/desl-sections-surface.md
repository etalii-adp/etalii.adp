# Contract: DESL 0.4, the `sections` surface

The language change of research R7, as DESL section 7.8 will state it.

- **`surface.kind`** takes a third value, `"sections"`.
- **`parts`**: a list, in display order, of parts. Each has an `id`, a `title` (Message) and a `kind`, `record` or `list`.
- **A `record` part** names a `type` with exactly one element in the document (a finding when there are none or several) and the `fields` shown, each an attribute with an optional `label` and `widget` from the value types of 7.5.
- **A `list` part** names a `type` and the `fields` of its rows. `order` is an expression giving each row's sort key (default document order); the order shown never reorders the file. `group` is an expression giving a group key, shown as a sub-heading with the count of its rows. `add` names the operation that adds a row; absent, the part has no add gesture.
- **`timeStrip`** on a list part: `{ "at": attribute of type datetime, "highlight": Expression, "label": Expression }`. A read-only band above the list places each row with a value at its time on a shared axis spanning the rows' times, emphasises the rows for which `highlight` holds and labels them with `label`. Rows without a value are listed apart. Selecting a mark selects its row.
- **`figures`** on any part: a map of id to `{ "label": Message, "value": Expression, "absentText": Message }`, shown beside the part's title, in order; a value that is absent shows its `absentText`.
- **`marks`** on a list part: a map of id to `{ "when": Expression, "label": Message, "style": "info" | "warning" }`, a badge on each row for which `when` holds (used for unaddressed factors).
- **Mentions**: when a selected element's attribute with `mentions` (4.3) names elements of another part, those rows are highlighted.
- **Fixtures and examples**: `minimal-sections.des` with `minimal-sections.fbl` and a Markdown example, as DESL 0.2's `minimal-hierarchy` was delivered.
- **Schema**: `$defs/Surface` takes the `sections` kind and its properties.
- **Compatibility**: every valid 0.3 specification is a valid 0.4 specification with the same meaning.
