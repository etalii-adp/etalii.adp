# Schema choices made in disl.schema.json (feature 004, schema agent)

Names and details the construct map did not fix, with what was chosen. The schema was aligned with prose-choices.md after the P1 prose landed; disagreements with the prose are marked **Disagreement**.

## General

1. **Root `title`** changed from "DISL 0.1 — …" to "DISL 0.2 — Diagram Specification Language" (T002 had moved only `$id`).
2. **Description style**: every new property and `$def` ends with "See DISL 0.2, section N." (existing 0.1 descriptions keep "See section N."). Six 0.1 `$def` descriptions (Canvas, Plugin, Tool, ContextTool, Attribute, Behavior, Persistence) gained one sentence naming what 0.2 adds, placed before "See section".
3. **Existing `anyOf [LocalizedText, CelValue]` pairs** (constraint message, field validation message, quick-fix label, Label and Badge tooltips, …) were replaced by `$ref Message` (the same set of values).
4. **`cel` as a language tag is forbidden** in LocalizedText (`propertyNames: {pattern, not: {const: "cel"}}`); every file still validates, since the nine `{cel}` label uses are all in positions widened to Message (Tool, ContextTool and FormItem `label`).

## Foundational (Message, Reason, Confirmation, findings)

5. **Message positions widened** beyond the pairs: Tool, ContextTool, Operation, Form and FormItem `label`, FormItem `title` and `placeholder` (prose 2.3 lists the same). Metamodel labels, `doc`, Label `placeholder`, FormItem `prefix`/`suffix`/`unit`, compartment texts and Handle `label` stay LocalizedText.
6. **Reason** is `anyOf [Message, {when?, message, id?, doc?}, {reason}]`; `message` required in the object form; `id` is a SimpleId.
7. **Confirmation** placed after DeletionPolicy; `threshold` is an integer ≥ 0.
8. **Finding** is the JSON (headless-validator) form, an item of ValidatorOutput, with the 0.1 keys (`constraintId`, `severity`, `message`, `elementId`, `attribute`, `pointer`) plus `code`, `elementIds`, `location`, `subject`, `view`. Required: `constraintId`, `severity`, `message`. `constraintId` and `code` are QualifiedIds (built-in ids like `std.unparseable` and codes with hyphens fit). The runtime finding of prose 8.6 (`constraint`, `target`, `fixes`) has no `$def` of its own.
9. **ValidatorOutput** is `anyOf [Finding[], {$schema?, findings: Finding[]}]`. The object form is my addition: the examples validator reads `$schema` only from a JSON object, so an array-rooted `findings.json` cannot name `#/$defs/ValidatorOutput` (R16). **Disagreement** (mild): prose 8.6 says a validator writes "a JSON array", which stays valid; the object form exists only so a stored example can name its schema. Drop it if the example is checked another way.
10. **SourceLocation** uses `dependentRequired {column: [line], length: [column]}` and allows `x-` keys like every other object.
11. **Form item kind** `findings` inserted before `problems` in the enum; `problems` stays, described as the deprecated alias.

## US1 identity

12. **IdStrategy** repeats the IdRule properties (no `allOf`, because both use `additionalProperties: false`), with `prefix` a string or map only at the top level and `types`, `missing`, `compare` only at the top level.
13. **`expression` required when `strategy` is `cel` or `derived`** (if/then), as prose 11.5 says; every existing file validates with it.
14. **`ephemeral`** is `boolean` or Expression (bare string or `{cel}`), per prose and data-model; the construct map said `{cel}`.
15. **`types` keys** are QualifiedIds (TypeRefs).

## US2 findings

16. **Constraint**: `required: ["id"]` plus `anyOf [{required: [rule]}, {required: [forEach]}]`, and `if forEach then enforcement const "report"`. `code` placed after `id`; `over` and `forEach` before `when`; `location` and `subject` before `timing`.
17. **BuiltInSetting**: `severity`, `enabled`, `code`, `message`, `doc` (prose choice 9). `detail` and `violation` are CEL variables in `message`, not properties. The coordinator's message listed them as properties; I followed the prose.
18. **`samePrecisionAs`** is a SimpleId on Attribute.

## US3 reasons

19. **GestureRefusals** values are Reason[] (prose choice 26), with keys move, resize, reparent, delete, connect, reconnect, copy, editLabel, plus `doc`. Added to NodeVariant and EdgeVariant as well as NodeNotation and EdgeNotation, since variants carry notation properties.
20. **`behavior.messages`** keys are QualifiedIds (open set: `std.notApplicable`, `std.readOnly`, `std.atStart`, `std.atEnd`, and FBL's ids).
21. **`readOnlyReasons`, `unavailable`, `editGate`** are arrays of Reason. `showAbsent` is only on FormItem.
22. **FormItem `unavailable`** is on the item (meant for buttons), not restricted by kind.
23. **FieldValidation** had no `doc`, so `timing` was appended at the end.

## US4 derived

24. **DerivedNode** requires `from` and `id`; **DerivedRelation** requires `from`, `source` and `target`, and `id` is optional with the default `<Type>:<source.id>-><target.id>` (#2, #3 for repeats), carried over from the 0.1 expression form (research B2).
25. **`edits` keys** follow research B1: `^(delete|reparent|move|connect|rename|attribute:<SimpleId>)$`, values SimpleId.
26. **`slot`** in DerivedNode is an Expression (the research says Expression → string).
27. **Viewpoint `members`** is described as a bool per element in the `element` context (construct map and research B7). The data model's "Expression → list" was not followed.
28. **Function `recursion`** is `{maxDepth ≥ 1, atMaxDepth: CelSource}`, both required.
29. **Plugin `celFunctions.params`** items are `anyOf [string, {name, type, doc}]`.

## US5 gestures

30. **DropTarget** is a copy of ContextTool (after its 0.2 additions) plus required `on` (`TypeRef` or `"canvas"`, `minItems 1`). A later change to ContextTool must be copied into DropTarget by hand.
31. **DropSpec `refusal`** is a Reason (tasks T052), not only a Message.
32. **CreateEnd**: `type` (required), `initial` (object, keys SimpleId, values unconstrained literals or `{cel}`), `size` (Size), `doc`.
33. **ContextToolSet `for`** items are `anyOf [TypeRef, enum ["diagram", "connection"]]`.
34. **ConnectGesture**: `from` (map SimpleId → "source"|"target"), `tool` (SimpleId); only on EdgeNotation, not EdgeVariant.
35. **Action `reorder`** is an object `{target, by, after, before}`, none required.
36. **Attribute `min`/`max`** were already unconstrained (`true`); they now carry a description saying `{cel}` is accepted.
37. **Handle `refusals`** is `{move: Reason}`, a single Reason. Handle `label` stays LocalizedText. **Disagreement**: research 8.11's gartner example writes the handle label as `{cel}`, which the prose (2.3) does not list as a Message position. Widen it if that example is used.

## US6 view state and chrome

38. **ViewKind** is the 0.1 `store` enum plus `selection`, `filters`, `viewpoint`. `store` now references it.
39. **`persistence.view.initial`** is an object keyed by SimpleId, with unconstrained values.
40. **Action `view`** is `{collapsed, filters, viewpoint}`; the target is the Action's existing `target`.
41. **Notice `text`, EmptyMessage `text`, LegendComputed `label`, Filter `label`, toggle `label`** are Messages. The research wrote BString; a Message drops attribute and token bindings but covers locale maps and `{cel}`.
42. **Notice `actions`** items are `{label (Message), operation (SimpleId), args, doc}`, with label and operation required.
43. **LegendComputed `swatch`** is `{shape: ShapeRef, fill: Paint, stroke: Paint, icon: IconRef}`.
44. **Filter** requires `control` and `keep`; `default` is unconstrained; `options` is a CelValue.
45. **Viewpoint `variantOf`** is a SimpleId; `toggle` is `{label, icon, position, doc}`.

## US7 budgets

46. **`language.limits.budgets`** is a map id → Budget (construct map), not the data model's list with `id`.
47. **Budget** requires `measure` and `max`. `measure` is `anyOf [{count: TypeRef[] (minItems 1)}, CelValue]`. `notice` is `anyOf [bool, {text, severity, position}]`. `finding` is `{severity, message}` with message required.
48. **BudgetWithhold** is `{edits: "model"|"all"|"none", reason: Reason, doc}` (construct map), not the data model's `{gestures, reason}`.

## US8 notation

49. **TimeUnit** was created in US8, because ruler ticks need it; US9 refactored the other unit enums to it.
50. **Ruler**: `not: {required: [levels, ticks]}` makes `ticks` and `levels` mutually exclusive (research N12). `boundaryFormats` keys are TimeUnits.
51. **`flip`** is `anyOf [enum none|horizontal|vertical|both, Dynamic]`. IconRef's new branch is `{icon: IconRef (required), flip}`.
52. **BadgeLayout** `offset` is a two-number array; `badgeLayout` is on NodeNotation and NodeVariant.
53. **Stub** and **BezierSpec** are as researched; `stub` is on EdgeNotation and EdgeVariant.
54. **TextMetric** is `anyOf [const "host", {kind: const "average" (required), advance > 0 (required), count, lineHeight > 0}]`.
55. **ContrastRequirement** requires `foreground`, `background` and `minRatio ≥ 1`; `background` is one token or a non-empty list.
56. **AxisRange** requires `id`, `from` and `to`. `from` and `to` are unconstrained domain values.

## US9 time

57. **Bound units**: Axis `scale.unit` and the calendar snap rule's `unit` are `anyOf [TimeUnit, AttrBinding]`. ZoomLevel, GridDisplay and ruler levels use TimeUnit.
58. **EndAnchor `side`** is `anyOf [enum, Dynamic]` (so `{cel}` works too, not only `{attribute}`). `part` is a BString and `at` a BNumber. `default` is `{part, side, at}`.
59. **Snapping `byGesture`** is an object with `move`, `resize`, `drop`, `paste`, `handle`, each a Snapping.
60. **`writtenPrecision`** and **`newPrecision`** are placed before `calendar` on Attribute.

## US10 small items

61. **Simulation** requires `for`, `state`, `initial`, `next` and `until`. `for` is TypeRefs. `notice` is `{running: Message, finished: Message}`. **Note**: research E1's example writes `"'Simulated: job run'"`, which a Message reads as literal text with quotes; write it as a plain string or `{cel}`.
62. **Attribute `fixed`** is unconstrained (any JSON value), placed before `derived`.
63. **EnumValue `value`** is a string with `minLength 1`, placed first.
64. **`language.origin`** is placed before `label`, with the pattern `^[a-z0-9-]+/[a-z0-9-]+$`.
