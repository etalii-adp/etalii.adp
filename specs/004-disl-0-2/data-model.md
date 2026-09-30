# Data model: DISL 0.2, the declarative additions

The entities of the spec, as the shapes DISL 0.2 and DID 0.2 define. Property lists are what the schema will hold; the normative text and full tables are in the research files named per entity. Every shape is a new or extended `$def` in `disl.schema.json` unless marked DID.

## Message and Reason (R7)

- **Message**: LocalizedText, or `{cel: Expression}` returning a string. Accepted in every user-facing text position (labels, messages, placeholders, titles, confirmations).
- **Reason**: a Message; or `{when: Expression, message: Message}`; or `{reason: id}` referring to `behavior.reasons`. Used as an ordered `Reason[]`; the first whose `when` holds (or that has none) is the one shown.
- **Confirmation**: a Message (the 0.1 form), or `{message, title?, confirmLabel?, cancelLabel?, danger?, when?, count?, threshold?}`. Asks only when `when` holds and `count >= threshold`; `threshold` defaults to 0, so it always asks unless raised.
- Validation: `cel` is not a valid language tag in LocalizedText; a `{reason}` reference must name a declared reason.
- Research: reasons-and-gestures.md, 7.0 to 7.6.

## Id rules (R6)

- **`persistence.ids`** (0.1: `strategy`, `prefix`, `expression`, `stable`, `pattern`) gains `types` (map TypeRef → IdRule), `encoding` (`hex`, `base64url`, `base36`, for `uuid-v4`), `missing` (`assign`, `ephemeral`), `compare` (`exact`, `ignore-case`), `suffix` (template for disambiguation, default `-{n}`).
- **IdRule**: `strategy` (0.1 values plus `derived`), `expression` (for `derived` and `cel`, context `identity`), `ephemeral` (bool or Expression), `reason` (Reason, shown when a gesture would store an ephemeral id), and the other `persistence.ids` properties, overriding the defaults per type.
- Rules: an ephemeral id **MUST NOT** be stored as view data, a suppression or a reference; the first element in reading order keeps a duplicated id; a derived id is recomputed on load and references follow.
- Research: identity-and-findings.md, part A.

## Finding and SourceLocation (R3 to R5)

- **SourceLocation**: `{file: string, line?: integer ≥ 1, column?: integer ≥ 1, length?: integer ≥ 0}`; columns and lengths in Unicode code points; `file` relative to the diagram's subject (FBL).
- **Finding** (0.1 problem): `{constraint, code?, severity, message, target?, attribute?, location?, subject?, view?, fixes?}`, where at least one of `target`, `location`, `subject` is present.
- **Constraint** (0.1) gains `code`, `forEach` (Expression → list; binds `item`, `index`), `location` (Expression → SourceLocation), `subject` (Expression → string), `over` (`model`, `view`). `rule` becomes optional when `forEach` is present.
- **Built-in settings** (`constraints.builtIn`) gain `code` and `message` (Message).
- **ValidatorOutput** (headless): the 0.1 array of `{constraintId, severity, message, elementId, attribute, pointer}` plus optional `code`, `elementIds`, `location`, `subject`, `view`.
- Research: identity-and-findings.md, part B.

## Derived element (R8)

- **DerivedNode** (`derived` on a node type): `{from: Expression → list, key?: Expression, id: Expression, attributes?: map name → Expression, parent?: Expression, slot?: string, sources?: Expression, reason?: Reason, edits?: map gesture → operation id}`; contexts `derive` and `deriveItem` (`item`, `group`, `index`).
- **DerivedRelation** (`derived` on a relation type): the 0.1 Expression, or the DerivedNode members plus `source`, `target`, `owner`.
- **Viewpoint** gains `members` (Expression → list of elements).
- Rules: computed on load and in every transaction's recompute step, in declaration order; never written; never on undo; a failure yields one finding and the rest still draws; every derived element has `sources` and `derived == true` in CEL.
- Research: derived-and-small.md, section B.

## Viewer state and chrome (R10)

- **`persistence.view`** gains `viewer` (list of view-data kinds held per viewer), `initial` (map kind → value or Expression), `revealExpands` (bool). **Attribute** `transient` accepts `"viewer"`. **Action** `view` sets viewer state.
- **Canvas** (6.13) gains `title` (Message), `header`, `notices[]` (`{id, when, message, severity, buttons[]}`, plus built-in `truncated` and `unavailable`), `filters[]`, `empty` (Message), `fit` (`none`, `stretch`), `zoom.initial` (`fit`, number); `legend` gains `from: "drawn"` and computed entries.
- **Viewpoint** gains `variantOf` and `toggle` (compact mode).
- Rules: viewer state is never persisted, never on undo, allowed in read-only mode, and not readable from deterministic contexts; the drawing order is fixed (R10).
- Research: view-scale-notation-time.md, gap 9.

## Budget (R11)

- **`language.limits.budgets[]`**: `{id, measure: TypeRef[] | Expression, max: integer, order: Expression, unit?: Expression, truncate?: bool, notice?: Message, withhold?: {gestures: string[], reason: Reason}, finding?: {severity, message}}`. CEL `budget(id)` returns `{shown, total, truncated}`.
- Research: view-scale-notation-time.md, S1.

## Time values (R12)

- **Primitive** `yearMonth`: signed astronomical `±YYYY-MM` (DID value form), held in CEL as a month index. Axis `valueType: "yearMonth"`. **TimeUnit** gains `decade`, `century`, `millennium`.
- **Attribute facet** `writtenPrecision: "preserve"`; CEL `precisionOf(value)`.
- **Snapping** gains `byGesture` (map gesture → snap rule id); **SnapRule** gains `ties` (`away-from-zero`, `even`, `down`, `up`).
- **EndAnchor** `mode: "part"` with bound `part`, `side`, `at`.
- DID: the `yearMonth` value form; `datetime` values kept in written form.
- Research: view-scale-notation-time.md, gap 12.

## Small items (R13)

- **Operation** `simulate`: `{for, state, initial, next, until, stepMs, notice}`.
- **Enum value** `value` (stored form). **Attribute** `fixed` (constant, never persisted). **Function** `recursion: {maxDepth, atMaxDepth}`. **Plugin CEL function** gains `uses`, `deterministic`, `params`, `fallback`. **Language** `origin` (pattern `^[a-z0-9-]+/[a-z0-9-]+$`).
- Research: derived-and-small.md, sections C to E.

## DID 0.2

The DID changes are listed in [contracts/changes-from-0.1.md](contracts/changes-from-0.1.md), DID table: tolerant reading, unreadable entries as unknown content, suppressions by `subject`, no ephemeral or derived records, enum `value` forms, optional relation targets, and time value forms.
