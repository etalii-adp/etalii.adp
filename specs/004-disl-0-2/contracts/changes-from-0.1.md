# Contract: the "Changes from 0.1" section

DISL 0.2 and DID 0.2 each gain a section "Changes from 0.1" (FR-002). It lists every place where 0.2 gives a meaning that 0.1 left open or ambiguous, with its reason. Everything not listed keeps its 0.1 meaning. No valid 0.1 document becomes invalid.

## DISL

| # | Change | 0.1 said | 0.2 says | Reason | Research |
|---|---|---|---|---|---|
| 1 | `{cel}` in a LocalizedText position | Read as a locale map with the language tag `cel`, so the CEL source is shown as text. | Every user-facing text position is a Message; an object with a `cel` key is CEL, and `cel` may not be a language tag. | Nine places in the definitions write `{cel}` meaning CEL; none means a locale called `cel`. | reasons-and-gestures.md, 7.0 |
| 2 | Order of gesture checks | Constraint order is significant, but not what it means for gestures. | Built-ins in the order endpoints, containment, multiplicity, acyclic, then declared rules in array order; the first refusal is shown. | FDG and OWL need a fixed first refusal. | reasons-and-gestures.md, 7.1 |
| 3 | Reserved words in menus and drops | Unstated. | `diagram` and `connection` are reserved in `contextMenus[].for`; `canvas` in a drop's `on`. | New keywords (empty-canvas and transient menus, drops). | reasons-and-gestures.md, 8.3, 8.8, 8.9 |
| 4 | Handles on `{attribute}`-bound shape parameters | Sections 2.5 and 6.8 disagree. | The handle writes the attribute. | Settles the contradiction the way gartner needs. | reasons-and-gestures.md, 8.11 |
| 5 | Order of findings | Unstated. | Reader findings, then built-ins, then declared rules in array order; within a rule, model order, then `forEach` order. | Findings are compared across hosts. | identity-and-findings.md, B.6 |
| 6 | "Problems" | The word for rule results. | "Findings"; `problems` in forms is a deprecated alias of `findings`; the validator's JSON keys are unchanged. | Many results are info or hints; FBL uses "finding". | identity-and-findings.md, B.0 |
| 7 | Natural id composition; `prefix` with `cel` | Unstated. | The composition is pinned; `prefix` does not apply to `cel`. | Hosts must derive the same id. | identity-and-findings.md, A.0, A.3 |
| 8 | Derived relation results | Extra keys and default ids unstated. | Extra keys are attribute values; the default id is defined. | Needed for merging and lifting. | derived-and-small.md, B2 |
| 9 | `ancestors()` order; relation `owner` | Unstated. | Nearest first; a relation's owner defaults to the nearest common ancestor of its ends. | C4 lifting and SPARQL scope ownership. | derived-and-small.md, B3, B4 |
| 10 | `forEach` in actions | Unstated whether iterations see each other. | Iterations run in order on the working state; the list is evaluated once. | CLD claims. | derived-and-small.md, E2 |
| 11 | String order | Unstated. | Unicode code point order; sorts are stable. | SKOS ordering must match across hosts. | derived-and-small.md, E3 |
| 12 | `acyclic` on an abstract relation type; `*OfType` | Unstated for subtypes. | Covers the union of the type and its subtypes; `*OfType` includes subtypes. | FDG. | derived-and-small.md, E5 |
| 13 | Arc bow side; `curved` without bendpoints | Unstated. | Positive curvature bows left of the direction of travel; one quadratic curve. | CLD arcs drew mirrored in two hosts. | view-scale-notation-time.md, N7 |
| 14 | Snap ties | Unstated. | Away from zero by default, as CEL `math.round`; `SnapRule.ties` overrides. | Timeline and gartner. | view-scale-notation-time.md, T5 |
| 15 | `color().mix()` and `.alpha()` | Named, not defined. | Defined (colour space, weights). | Ansible and Helm paints. | view-scale-notation-time.md, N14 |
| 16 | Rulers | Attachment unstated. | Attached to the view by default. | Gartner and timeline. | view-scale-notation-time.md, N12 |
| 17 | What is drawn | No single order. | Viewpoint membership, derived elements, viewer filters, budgets, `visible: false`, in that order, exposed as `diagram.drawn`; a relation with an undrawn end is not drawn. | Budgets, filters and legends must agree. | view-scale-notation-time.md, gap 9 preamble |

## DID

| # | Change | Reason |
|---|---|---|
| 1 | A reader loads records with missing or duplicate ids and reports them; the first in record order keeps a duplicated id. Writers still never write them. | Tolerant loading (FR-012). |
| 2 | A record that fails its schema for another reason is kept verbatim as unknown content and reported as `std.unreadableEntry`; an unparseable file gives `std.unparseable`. | Findings instead of refusals (FR-021, FR-024). |
| 3 | View keys and suppressions never name ephemeral ids; stored ones are ignored, reported and dropped on the next write. Suppressions may name a `subject` instead of an `element`. | Ephemeral ids (FR-011); findings on undrawn subjects (FR-020). |
| 4 | Records of derived types are never written; view keys and suppressions may name derived elements with stable ids; unresolved view keys are kept and ignored. | Derived elements (FR-090). |
| 5 | Enum values are stored in their `value` form; fixed attributes are never stored. | FR-100. |
| 6 | A relation's `target` may be absent when its target end is optional. | Stubs (FR-070). |
| 7 | `yearMonth` values are `±YYYY-MM`; `datetime` values keep their written form under `writtenPrecision: "preserve"` or `timezone: "floating"`. | Time (FR-080). |
