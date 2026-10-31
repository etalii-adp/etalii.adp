# Data Model: Export a Causal Loop Diagram as an Animated Flow Page from the Desktop Host

## Flow properties (in the definition and the `.cld`)

### On the diagram (`metamodel.diagram.attributes`)

| Attribute | Label | Type | Range | Default | `.cld` |
|---|---|---|---|---|---|
| `title` | Title | string, no `"` or line break | — | none (the page uses the file name) | `title "<text>"` |
| `strength` | Link strength | number | 0.5 to 8 | 3 | `flow strength=<n>` |
| `delayLength` | Delay length | number | 1 to 12 | 5 | `flow delay=<n>` |
| `inertia` | Inertia | number, seconds | 0.2 to 5 | 1.2 | `flow inertia=<n>` |
| `speed` | Simulation speed | number | 0.1 to 4 | 1 | `flow speed=<n>` |
| `density` | Dot density | number | 0.5 to 8 | 3 | `flow density=<n>` |
| `heatmap` | Heatmap reading | enum `HeatmapReading`: `backlog`, `pressure`, `throughput`, `level` | — | `backlog` | `flow heatmap=<word>` |

All of them are in the property group `Flow page`, except Title, which is in `Identity`.

### On a variable (`Variable.attributes`)

| Attribute | Label | Type | Range | Default | `.cld` |
|---|---|---|---|---|---|
| `start` | Starting level | number | 0 to 1 | 0.5 | `start=<n>` in the variable's tail |
| `push` | Outside push | number | -4 to 4 | 0 | `push=<n>` in the variable's tail |

Both are in the group `Flow page`. A Starting level only affects a variable no link points to, as its description says (the maintainer, 2026-10-31): the page's Reset puts every other variable back at 0.5 (FR-036).

### On a link

`weight` is unchanged as an attribute. Its doc now says it is the link's starting strength in a flow page, limited there to 0 to 3, and that an absent weight starts at 1.

### Validation

- A value outside its range raises a finding on its line. The constraint's sentence is "`<Label>` is <value>; it must be between <min> and <max>." The page uses the nearest value in range (User Story 8 scenario 6).
- A `flow` line with an unknown key or a value that does not read is no `flow` statement: FBL cannot report one word, so the whole line is kept byte for byte and reported as unread, and none of its keys is read.
- A second `title` or `flow` statement is kept, and the last one wins for each key. Nothing reports the earlier one: neither language can state that, and the hosts add no finding of their own.
- A finding on the diagram has no line, since DISL gives a diagram-scoped rule none; a finding on a variable stands on its line.

## The page's data (embedded JSON, `contracts/flow-page.md`)

```text
FlowPageData
├── title: string                      # Title, else the file name without extension
├── source: string                     # the file name, for the footer
├── settings: { strength, delayLength, inertia, speed, density, heatmap }
├── variables: [ { id, label, x, y, start, push, external } ]   # model order
├── links: [ { from, to, sign: 1|-1, delayed: bool, weight, note } ]   # model order; links naming no variable left out
├── loops: [ { id, name, kind: "R"|"B", members: [variable id] } ]       # declared, else found cycles
└── omitted: int                        # statements left out of the page
```

- `x`, `y`: the canvas position at export, in diagram units.
- `external`: true when no link of the page points to the variable.
- `sign`: `1` for positive; `-1` for negative; a link of unstated polarity is `1` and listed in `omitted`.
- `weight`: the link's weight limited to 0 to 3, or 1 when it has none.

## The page's run-time state (not persisted)

| State | Starts at | Changed by |
|---|---|---|
| a variable's level | `start` | the model (FR-012), a jump, Reset |
| an external variable's slider | `start` | the person |
| a variable's push | `push` | the person |
| a link's strength, delay, sign | `weight`, `delayed`, `sign` | the person |
| the dynamics | `settings` | the person |
| the heatmap reading | `settings.heatmap` | the person |
| dots in transit | none | the model |
| the chart's series | the seven variables in the most loops | the person (add or remove the selected one) |

## The export's output

| Field | Value |
|---|---|
| folder | the `.cld`'s folder |
| name | `FILENAME {yyyy-mm-dd hh.mm}.html`, in local time, zero-padded |
| bytes | the template with the data inserted at one marker |
| replaced | only a file of the same name |
