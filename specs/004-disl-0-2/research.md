# Research: DISL 0.2, the declarative additions

**Feature**: [disl-0-2.spec.md](disl-0-2.spec.md) | **Plan**: [plan.md](plan.md)

The per-gap research is in four files, each giving for every item of its gaps the definitions that need it (with `file:line`), the construct, its normative text, the schema impact, an example from a named definition, 0.1 compatibility and any DID change:

- [research/identity-and-findings.md](research/identity-and-findings.md): gap 4 (identity) and gap 6 (findings).
- [research/reasons-and-gestures.md](research/reasons-and-gestures.md): gap 7 (telling the user why) and gap 8 (gestures and menus).
- [research/view-scale-notation-time.md](research/view-scale-notation-time.md): gaps 9 to 12 (view state and chrome, budgets, notation, time).
- [research/derived-and-small.md](research/derived-and-small.md): derived elements from gap 3, and gap 13 (the small items).

This file records the decisions that cut across those files, settle where they disagreed, or fix the boundary with FBL. Where a decision here and a detail file differ, this file wins.

## R1. Extend 0.1 constructs; add few mechanisms

**Decision**: every item is first tried as an extension of an existing 0.1 construct (the `persistence.ids` settings, the constraint object, LocalizedText and `{cel}`, gesture constraints, tools and context tools, `canvas`, axes, snap rules, derived attributes and relations, `celFunctions`). New mechanisms are added only for four things 0.1 has no home for: derived node types (R8), per-viewer state (R10), hard budgets (R11) and simulated runs (R13).

**Rationale**: constitution principle V; hosts that implement 0.1 should be able to add 0.2 construct by construct.

**Alternatives considered**: a new "interaction" layer for reasons, gestures and menus; rejected because every item already has a 0.1 owner (research/reasons-and-gestures.md, section 0).

## R2. Versioning: 0.2 is a superset; one schema file

**Decision**: DISL and DID both move to 0.2, Working Draft. Each keeps one schema file, whose `$id` becomes `https://etalii.net/adp/<name>/schema/0.2/<name>.schema.json`. The version keys accept `"0.1"` and `"0.2"`. The validator reads a document naming the 0.1 `$id` against the 0.2 schema, as it already reads deprecated aliases, because every 0.1 document is valid 0.2 (FR-002). A "Changes from 0.1" section lists every place where 0.1 was silent or ambiguous and 0.2 now says what it means.

**Rationale**: constitution principles II and IV and the rule "one schema file per specification"; the 23 definitions and FBL's hook (landing in the 0.1 schema first) must keep validating without edits.

**Alternatives considered**: keeping a frozen 0.1 schema beside the 0.2 one (two schema files per specification, against principle III); breaking changes allowed before 1.0 (rejected by FR-002, because 23 definitions depend on 0.1).

## R3. "Problems" become "findings"

**Decision**: DISL 0.2 calls the result of evaluating a rule or reading a model a **finding**; section 8.6 is renamed, and `docs/terminology.md` gains the word. The form item kind `problems` stays as a deprecated alias of `findings`. The headless validator keeps its 0.1 JSON keys (`constraintId`, `severity`, `message`, `elementId`, `attribute`, `pointer`) and gains optional `code`, `elementIds`, `location`, `subject` and `view`. Hosts keep their platform's own "Problems" panel names.

**Rationale**: many results are `info` or `hint`, not problems; FBL, the notes and the spec already say "finding". Keeping the JSON keys keeps existing consumers working.

**Alternatives considered**: keeping "problem" (conflicts with FBL's wording); renaming the JSON keys (breaks 0.1 consumers for no gain).

## R4. The source location: defined once, in DISL, used by FBL

**Decision**: `$defs/SourceLocation` is `{file, line?, column?, length?}`: `file` is required; `line` and `column` are 1-based; `column` and `length` count Unicode code points. A finding carries a location, an undrawn `subject` string, or an element, or several. `file` is relative to the diagram's subject, as FBL defines the subject; which file is primary (for R5) is FBL's to say. Elements gain `self.location()`, which returns the location FBL's reader recorded, or `null`.

**Rationale**: agreed with the FBL session on 2026-09-30; FBL references this shape and defines none of its own (SC-006).

## R5. Findings: per item, parse failure, order, scope

**Decision**:

- A constraint gains `forEach` (a list expression, with `item` and `index` bound; `rule` then defaults to "every item is a finding"), `location`, `subject`, `code` and `over` (`"model"`, the 0.1 meaning and the default, or `"view"`).
- `code` replaces the 15 `x-adp-ruleId` keys and the rule ids kept in `label` or `tags`.
- A parse failure is the built-in `std.unparseable`; it replaces every other finding located in the same file, and when that file is the primary file no constraint runs.
- The order of findings becomes normative with no new property: reader findings, then built-ins, then declared rules in array order; within a rule, elements in model order and items in `forEach` order.
- New built-ins: `std.unparseable`, `std.unreadableEntry`, `std.missingId`, `std.duplicateId`, `std.mixedPrecision`, `std.ephemeralViewData`, `std.pluginMissing`.
- File-system facts are two functions, `fs.exists` and `fs.isDirectory`, returning an optional so a rule stays silent when the fact is unknown, and confined to the subject's root.

Details: research/identity-and-findings.md, part B.

## R6. Identity: one `derived` strategy, per-type rules, `ephemeral`

**Decision**:

- `persistence.ids` (section 11.5) gains a per-type map `types` and a strategy `derived`, whose CEL expression runs in a new `identity` context. Paths, IRIs, triple plus repeat counter, term forms, scope paths, relation formula ids and fixed singletons are examples of it, not separate strategies.
- ShortGuid is `uuid-v4` with `encoding` (`hex`, `base64url`, `base36`), because the definitions disagree on what a ShortGuid is.
- Unstable ids are marked `ephemeral` (a bool or a CEL condition, per type, with an optional refusal `reason` of R7's shape), because 0.1's `stable` already means something else. An element with an ephemeral id is never stored as view data, a suppression or an id reference; gestures that would store one are refused.
- Missing and duplicate ids load tolerantly (`ids.missing`: `assign` or `ephemeral`); the first element in reading order keeps a duplicated id; `compare: "ignore-case"` and `suffix` serve C4 and .NET.
- New CEL function `e.positionIn(list)` (reading-order position; used for repeat counters and for flagging only the second and later duplicates).

The spec's word "unstable" is the concept; `ephemeral` is its DISL name. Details: research/identity-and-findings.md, part A.

## R7. One text shape and one reason shape

**Decision**: `$defs/Message` is LocalizedText or `{cel}` and is accepted in every user-facing text position. `$defs/Reason` is a Message, a `{when, message}` pair, or a `{reason: id}` reference to `behavior.reasons`; it is used as ordered `Reason[]` lists, of which the first that applies is shown. It carries refusals (gesture constraints, per-kind `refusals` in notation, built-in constraint messages), read-only reasons (`readOnlyReasons`, with `absentText`, `emptyText`, `showAbsent`), unavailable entries (`unavailable`, `visible`), the diagram-wide `behavior.editGate`, and the ephemeral-id refusal of R6. `$defs/Confirmation` extends `confirm` (a plain Message stays valid with its 0.1 meaning) with `title`, `confirmLabel`, `cancelLabel`, `danger`, `when`, `count` and `threshold`; it asks only when `count >= threshold`.

Widening label positions to Message changes the reading of nine places in the definitions that already write `{cel}` where 0.1 only allows LocalizedText (0.1 must show them as a locale map with the tag `cel`); this goes in "Changes from 0.1". Details: research/reasons-and-gestures.md.

## R8. Derived elements: DISL computes, FBL reads

**Decision**: FBL produces stored elements, one per source entry, each with its source location and with or without a write rule. A DISL derived element is any element computed from other elements: grouping, merging, splitting, lifting, membership, or whose ends or parent are derived. A node type gains a `derived` object (`from`, `key`, `id`, `attributes`, `parent`, `slot`, `sources`, `reason`, `edits`) evaluated in new CEL contexts `derive` and `deriveItem` (`item`, `group`, `index`); a relation type's 0.1 `derived` expression keeps its meaning and gains an object form adding `source`, `target` and `owner`. Computed containment is `derived.parent` and `derived.slot`. A viewpoint gains `members` (C4 include and exclude lists with wildcards, via `matchesGlob`). Derived elements are computed on load and in the "recompute derived" step of every transaction, in declaration order, never written and never on undo; a finding on one borrows its first source's location; gestures on one are refused with `reason` unless `edits` maps them to an operation.

On that line, Azure template attribution and unresolved-template nodes, Databricks unknown kinds, and the whole-model reads of Ansible, Helm and .NET are FBL's. Details: research/derived-and-small.md, sections A and B.

## R9. Recursion, cycles and plugin functions in CEL

**Decision**:

- User functions may opt into bounded self-recursion: `recursion: {maxDepth, atMaxDepth}`.
- Cycle enumeration is built in: `diagram.cycles(relType, max)` returns elementary cycles in a defined canonical order, each in loop order; `diagram.cyclesTruncated(relType, max)` says whether `max` cut the list; `diagram.knots(relType)` returns strongly connected components. The detail files' `elementaryCycles` is this `cycles`.
- Plugin functions (`celFunctions`, 13.1) are called by bare name; a name clash is a specification error; declarations gain `uses`, `deterministic`, named `params` and `fallback`. When the plugin is absent the call uses its fallback, else follows the evaluation-error rules of 2.5, with one `std.pluginMissing` finding per missing plugin.

## R10. Viewer state and one drawing order

**Decision**: `persistence.view` gains `viewer` (view-data kinds that belong to one viewer, such as `collapsed`), `initial` and `revealExpands`; `transient` accepts `"viewer"`; a `view` action changes viewer state only. Viewer state is never persisted, never on undo, allowed in read-only mode, and not readable from the deterministic CEL contexts. What is drawn is decided in one order, exposed as `diagram.drawn`: viewpoint membership, then derived elements, then viewer filters, then budgets, then `visible: false`. Canvas chrome lives in `canvas` (6.13): `title`, `header`, `notices`, `filters`, `empty`, `fit: "stretch"`, `zoom.initial: "fit"`, and `legend.from: "drawn"`. Compact mode is a viewpoint with `variantOf`, shown as a toggle. Details: research/view-scale-notation-time.md, gap 9.

## R11. Hard budgets

**Decision**: `language.limits.budgets` holds one entry per budget: `measure` (types to count, or CEL), `max`, a truncation `order`, an optional `unit` (cut whole units), and `truncate`, `notice`, `withhold` (edits refused on a truncated view, with a Reason) and `finding`. Budget state is read with the CEL function `budget(id)`, not `diagram.*` members, because four W3C definitions already have attributes called `truncated`, `shown` and `total`. `maxElements` stays a soft warning. Viewport delivery stays out of DISL.

## R12. Notation and time: small additive properties

**Decision**: as tabled in research/view-scale-notation-time.md (N1 to N16, T1 to T6). Three need DID: an absent relation `target` when the target end is optional; the `yearMonth` value form (signed astronomical `±YYYY-MM`, because CEL timestamps cannot go before year 1); `datetime` values kept in their written form under `writtenPrecision: "preserve"`. Four items need no construct, only a sentence or an existing one: the diode (a 0.1 custom shape), colour mixing (pin `color().mix()`), the problem glyph (a badge driven by `self.findingSeverity()`), and the arc bow side (positive curvature bows left of the direction of travel).

## R13. The small items

**Decision**: a `simulate` body on operations, outside any transaction and never on undo (Databricks); `forEach` in actions runs sequentially on the working state and evaluates its list once (CLD); strings sort by Unicode code point, stably (SKOS); enum values gain `value`, their stored form (`run-job`), while CEL keeps the identifier; `acyclic` on an abstract relation type covers the union of its subtypes and the `*OfType` functions include subtypes (FDG); attributes gain `fixed`, a constant that is never persisted (FDG); `language.origin` (`<vendor>/<type>`) names a specification's origin, which FBL's registration refers to and which replaces `x-adp-origin`.

## R14. Examples: trimmed excerpts of real definitions

**Decision**: each construct is shown in a worked example beside the document (FR-003), as a trimmed excerpt of a named definition in `definitions/diagrams/` rather than an invented diagram: `mindmap.dis`, `c4-container.dis`, `rdf-graph.dis`, `gartner-hype-cycle.dis`, `functional-decomposition.dis`, `causal-loop.dis` and `databricks-job.dis` in `specifications/disl/`, plus one DID example exercising the DID 0.2 value forms. The existing three examples stay as they are and still validate. Migrating the full definitions is a follow-up feature (spec, Assumptions).

**Rationale**: the examples then prove, one by one, that the definitions' needs are met (SC-001, SC-004); keeping them excerpts keeps them readable.

## R15. What stays out

Layouts (gap 5), viewport delivery, term grammars and parsers, gartner's iterative clamp, refusals about the host (no registration, undo drift), menu entries from another reading of the same file, and sidecar-keyed ids are out of this feature. Each is named in the traceability table ([contracts/traceability.md](contracts/traceability.md)) with the owner: a later DISL feature, FBL, a plugin or a host.

## R16. Points the construct map left open

- **Validator output needs an example.** `$defs/Finding` and `$defs/ValidatorOutput` describe what a validator prints, so no `*.dis` exercises them. A `findings.json` example beside the document names `disl.schema.json#/$defs/ValidatorOutput` in `$schema`, which the validator already supports for `*.json` files, and shows a file-and-line finding, a parse-failure finding and a finding on an undrawn subject (SC-003, User Story 2).
- **`drawn()` is not readable in the `constraint` context.** It depends on viewer state, which deterministic contexts may not read (R10). A rule about what a view shows uses `over: "view"` and `view.members` instead.
- **`std.pluginMissing` defaults to `warning`**, because graceful degradation (15.2) keeps the diagram usable.
- **Rulers**: `ruler.ticks` (adaptive formats) is shown on the gartner excerpt and `ruler.levels` (multi-level) on a second ruler of the same excerpt's time axis; if the schema allows only one ruler per axis, `levels` moves to a timeline stand-in in `gartner-hype-cycle.dis`'s place.
- **Stand-ins**: about twenty constructs are needed only by definitions outside the seven excerpts (wardley-map, timeline, sparql-query, azure-devops-pipeline, ansible, helm, dotnet). They are shown in one of the seven excerpts and marked "stand-in for" in the construct map and the traceability table, rather than adding more example files.
