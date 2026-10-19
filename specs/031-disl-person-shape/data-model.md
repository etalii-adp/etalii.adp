# Data Model: A Built-in Person Shape in DISL

Phase 1 of the [plan](plan.md). The "data" of this feature is the shape's geometry. Every quantity is in canvas units, in the node's shape coordinates: the bounds are `(0, 0)` to `(w, h)`, y growing downwards (section 6.8's shape coordinate context).

## Shape reference

| Form | Meaning |
|------|---------|
| `"shape": "person"` | The built-in with its default. |
| `"shape": { "type": "person", "params": { "radius": r } }` | The built-in with corner radius `r`; `r` is Bindable (a number, a token, an attribute or `{ "cel": … }`). |
| A custom shape named `person` in `notation.shapes` | Shadows the built-in (section 6.8); unchanged. |

## Parameter

| Name | Type | Unit | Default (B.2) | Valid values | Effect |
|------|------|------|---------------|--------------|--------|
| `radius` | number | length | 8 | ≥ 0 | The body's corner radius. Effective radius `r' = min(radius, min(w, h) / 2)`. |

The head has no parameters.

## Parts

| Part | Geometry | Painted | Style |
|------|----------|---------|-------|
| Head | Circle, centre `(w / 2, −8)`, radius 10. Extends from y = −18 to y = 2. | First | The node's style: fill, stroke, states. |
| Body | Rounded rectangle `(0, 0, w, h)`, corner radius `r'`. | Second, over the head | The node's style. |

Where the two overlap (y from 0 to 2, and the stroke of the body's top edge), the body is in front.

## Derived regions

| Region | Definition | Used for |
|--------|------------|----------|
| Bounds | `(0, 0, w, h)` | Size, position, snapping, containment, layout: as for every shape. |
| Outline | The body's rounded rectangle | Edge anchoring (section 6.10). |
| Hit area | Body ∪ head | Pointing and selection; widened by `hitPaddingScreenPx` as for any outline. |
| Text area | The body minus the node style's `padding` | The main label. |
| Drawn extent | Bounds ∪ head, i.e. `(0, −18, w, h + 18)` when `w ≥ 20` | Fit to view, export: what must not be cut off. |

## Worked values

For bounds of 160 by 100 at the origin, with defaults: head centre `(80, −8)`, radius 10, top of the head at y = −18; body corner radius 8; drawn extent `(0, −18, 160, 118)`. For bounds of 12 by 40: head centre `(6, −8)`, radius 10 (wider than the body); body corner radius `min(8, 6) = 6`; drawn extent from x = −4 to x = 16.

## Validation rules

- `radius` below 0 is not a valid value.
- No finding is raised for a node narrower than the head (spec edge case).
- `actor` and every other built-in keep their meaning.
