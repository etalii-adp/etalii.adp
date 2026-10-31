# Contract: the flow page

## File

- Name: `FILENAME {yyyy-mm-dd hh.mm}.html`, beside the `.cld`. `FILENAME` is the file name without `.cld`, and the time is local, zero-padded, with a dot between hours and minutes. Example: `mental-health {2026-10-31 14.05}.html`.
- One file in UTF-8, with `<!doctype html>`, a `<title>` equal to the data's `title`, one `<style>` and one `<script>`, and no `src`, `href` or `url()` that leaves the file.
- The diagram's data is one JSON object, `FlowPageData` ([data-model.md](../data-model.md)), assigned to `const DATA` at a single marker in the template. Its keys are sorted, its numbers are written in their shortest form, and `<`, `>`, `&`, U+2028 and U+2029 are escaped as `\uXXXX`.
- The same `FlowPageData` gives the same bytes.

## Model (FR-011 to FR-016)

Fixed step `dt = 1/60` s of simulated time; per step:

1. An external variable's level moves towards its slider: `level += (slider − level) · min(1, 4·dt)`.
2. Each other variable *i*:
   - `u = Σ sign·w·level_src(t − travel) / Σ w`
   - `θ = ½ · (P − N) / (P + N)`, where `P` is the sum of the weights of its positive links and `N` that of its negative links
   - `target = σ(2·strength·(u − θ) + push)`
   - `level += (target − level) · dt / inertia`
3. Each link adds `density · w · level_src · dt` to an accumulator, and emits a dot for every whole unit. A dot travels `travel = 1.4 s` on a plain link and `1.4 · delayLength` s on a delayed link, and is removed on arrival, which counts towards the target's throughput.
4. `level_src(t − travel)` is read from a history of every level, kept for 40 s of simulated time.

Here `σ(z) = 1 / (1 + e^(−z))`. `w` is the link's current strength and `sign` its current polarity.

Loop gain: `Π over the loop's links of 2·strength·target·(1 − target)·w / Σ w_in(target)`. It is marked at or above 1.

Heatmap, smoothed over about a quarter of a second:
- Backlog: the dots in transit on a variable's incoming links ÷ the largest such count;
- Pressure: `min(1, 4·|target − level|)`;
- Throughput: the arrivals per second ÷ the largest;
- Level: the level itself.

Links show their source's level under Level, their target's heat under Pressure, and their dots in transit ÷ the largest otherwise.

## Controls (FR-017, FR-018)

| Control | Range | Starts at |
|---|---|---|
| a slider per external variable | 0 to 1 | its `start` |
| Simulation speed | 0.1 to 4 | `settings.speed` |
| Link strength | 0.5 to 8 | `settings.strength` |
| Length of a delay | 1 to 12 | `settings.delayLength` |
| Inertia of a variable | 0.2 to 5 s | `settings.inertia` |
| Dot density | 0.5 to 8 | `settings.density` |
| Heatmap | Backlog, Pressure, Throughput, Level | `settings.heatmap` |
| Selected variable: Outside push; Jump up, Jump down; In chart | -4 to 4 | its `push` |
| Selected link: Strength; Add or Remove delay; Flip polarity | 0 to 3 | its `weight` |
| Pause/Play, Reset, Fit | — | playing |

Reset sets every level back to its `start` and clears the dots and the chart. It keeps every control where the person set it.

Pan by dragging the background, zoom with the wheel or a pinch, and move a variable by dragging it. Hovering a variable shows its level, its target and its backlog. Hovering a link shows its ends, polarity, delay, note and dots in transit.

## Look

- Light and dark palettes under `prefers-color-scheme`. The dots are teal for positive and pink for negative in both. The heat scale runs from dark blue through purple and orange to yellow.
- At 820 px wide or less, the side panel stacks under the drawing, and nothing scrolls sideways.
- The header holds the title and the sentence "The numbers come from a simple model of this diagram's structure, not from measurements." (FR-021). Where `omitted > 0` it also says "N statements of the diagram are not shown."
