# Data Model: One Language for Every Tool Type

The entities of the specification's *Key Entities*, with their fields, relations and rules, as the plan builds them. Where an entity is a JSON document, its shape is a `$defs` entry of `specifications/atd/atd.schema.json` (one schema file for the specification, a `$defs` entry per top-level structure, as Principle III asks). Section numbers like "ATD §5" name the sections the ATD document is planned to have (contracts/grammar.md lists them).

## 1. ADP tool language (ATD)

| Field | Value |
|---|---|
| Folder | `specifications/atd/` |
| Document | `ATD-specification.md`, *ATD, the ADP Tool Language*, 0.1 Working Draft, header table ending in the `Licence` row |
| Grammar | `grammar/<version>/*.lark` for each released minor, `grammar/*.lark` for the current draft; `grammar/atd.flat.lark` generated |
| Schema | `atd.schema.json`, `$id` `https://etalii.net/adp/atd/schema/0.1/atd.schema.json`, `$defs`: `Tree` (and one entry per construct of the abstract tree), `Findings`, `Finding`, `Trace`, `ConformanceFixture`, `Drawing`, `Capability`, `ParseTables`, plus references to DISL's, DESL's and FBL's `$defs` for settings |
| Examples | `*.atd` beside the document: one per kind, one per binding family, one with script functions, one split over parts, one with a grammar binding |
| Worked examples of the other formats | `fixtures/mindmap/basic/` (a conformance case), `mindmap.trace.json` with its companion `mindmap.md`, `capabilities/layout.twoSidedTree/contract.json` (ATD §2.3 to §2.6) |
| Refused corpus | `refused/<name>.atd` with `refused/<name>.findings.json` (`$defs/Findings`) and a `README.md` in the shape of `specifications/fbl/refused/README.md` |
| Capabilities | `capabilities/<name>/contract.json` (`$defs/Capability`) and `capabilities/<name>/fixtures/` |
| Highlighting | `highlighting/atd.tmLanguage.json`, `highlighting/atd.sublime-syntax`, generated |
| Guide | `ATD-guide.md` (FR-104) |

**Rules**: the grammar builds as strict LALR(1) (FR-002); every example parses, checks without findings and its tree validates against `$defs/Tree`; every refused file yields exactly its expected findings; generated files equal what `atd-grammar.py` writes.

## 2. Grammar module

| Field | Meaning |
|---|---|
| `name` | `atd`, `core`, `cel`, `script`, `canvas`, `form`, `text`, `binding`, `notation` |
| `rules`, `terminals` | in ATD grammar notation (contracts/grammar.md) |
| `imports` | other modules of the same version |

**Relations**: `atd.lark` imports all others; `canvas`, `form`, `text` and `binding` import `core`; `core` and `script` import `cel`; `binding` imports `notation`. **Rules**: no cycle; the composition yields one start symbol `description`; every terminal is in the regex subset; every keyword reachable where a `name` is expected is listed in that position's `name` rule (FR-008).

## 3. Tool description

A tool type written in ATD.

| Field | Meaning | Rule |
|---|---|---|
| `files` | one root `.atd` and zero or more parts | root starts `atd <v>` then the tool construct; a part starts `atd <v>` then `part of <origin>` |
| `languageVersion` | from the header | known to the reader, else ATD0001 naming both versions |
| `kind` | `diagram`, `designer`, `editor` | decides admitted constructs (§5) |
| `origin` | `<vendor>/<type>` | equals the origin of the type's `.dis`/`.des` where one exists (FR-025) |
| `version` | the tool type's semver | |
| `label`, `doc` | display name and documentation, localized | the display name equals the existing one (FR-025) |
| `imports` | other parts by relative path | resolved within the description's folder; a cycle is ATD2003, reported once |
| `core` | model, constraints, operations, hooks, reasons, messages, ids, functions, limits | |
| `surface` | exactly one: canvas, form or text, by kind | |
| `bindings` | zero or more | |
| `requires` | capabilities with version ranges | each in the catalogue, else ATD2010 |
| `scripts` | script functions | |

**Location**: `definitions/diagrams/<name>.atd`, `definitions/designers/<name>.atd`, `definitions/editors/<name>.atd`, parts `<name>.<part>.atd` beside it.

**State in phase 1**: *written* (parses) → *checked* (no error findings) → *traced* (trace complete, SC-003) → *validated* (every conformance case passes in the desktop host and VS Code, SC-004). No host loads it as a tool (FR-031).

## 4. Abstract tree

The lowered form of a description that `atd tree` prints and `$defs/Tree` describes (FR-030). It is not an interchange form: nothing reads it back as a description.

- **Node**: `kind` (the construct, e.g. `elementType`, `attribute`, `notation.node`, `binding.element`, `script.fn`, `stmt.for`), `span` (`file`, `start`, `end` as UTF-8 byte offsets; `line`, `column` 1-based, columns in code points), `name` where the construct has one, `doc`, and the construct's fields.
- **Value** (FR-006): `{literal: string|number|bool}`, `{cel: string, ast: CelNode}`, `{attribute: QualifiedId}`, `{token: QualifiedId}`, `{param: SimpleId}`, `{settings: {key: Value}}`.
- **CelNode**: CEL's abstract syntax (ident, select, call, list, map, message, literal, comprehension for macros), with spans.
- The lossless syntax tree (every byte, with trivia) is internal to `adp-atd-syntax`; formatting and machine edits work on it, never on the abstract tree.

## 5. Kinds and what they admit

| Construct family | Diagram | Designer | Editor |
|---|---|---|---|
| Element types, attributes, enums, ids, containment | yes | yes | yes (tokens and outline entries are element types of the text) |
| Relation types, ports, derived relations | yes | no (ATD3001 at the construct) | no |
| Coordinates, placement, snapping, notation, themes, toolbox, context tools, layout | yes | no | no |
| Forms | yes (DISL §7) | yes (surface) | no |
| Tables, hierarchies, columns, cells, views, value types, conversions | no | yes | no |
| Text surface: token classes, folding, outline, completion sources, quick fixes on ranges, embedded previews | no | no | yes |
| Constraints and findings, operations, hooks, actions, reasons, messages, localized text, doc, origin, settings | yes | yes (no hooks, as DESL) | yes |
| Bindings (all families), registration | yes | yes | yes |
| Script functions, capabilities | yes | yes | yes |

The table is the ATD document's normative table; the checker reads it from one place (`adp-atd-check/src/kinds.rs`).

## 6. Script function

| Field | Meaning | Rule |
|---|---|---|
| `name` | SimpleId | unique among functions of the description; callable from CEL (FR-017) |
| `params` | `name: Type` | types are CEL types or the description's element types |
| `returns` | Type | every path returns or fails |
| `recursion` | optional bound | ≤ 64; absent means 64 |
| `body` | statements (R13) | every loop has `limit`; no forbidden function (FR-014); actions only if every caller is a gesture position (FR-016) |
| `pure` | derived | true when the body and its callees contain no action; required for expression positions |

**State during a call**: *running* → (*paused*, debugger) → *returned* | *failed* (a `fail`, a CEL error) | *stopped* (budget or recursion exceeded, or the debugger's stop). Anything but *returned* discards the transaction.

## 7. Capability

| Field | Meaning |
|---|---|
| `name` | QualifiedId, e.g. `layout.layeredWithBand`, `reader.turtle`, `analysis.elementaryCycles`; in the terms of its algorithm or format, never a tool type's (spec Q7) |
| `version` | semver; descriptions require a range |
| `extensionPoint` | `layout`, `routing`, `reader`, `analysis`, `arrange`, `render` |
| `input`, `args`, `output` | `$defs` references in `atd.schema.json` |
| `laws` | e.g. deterministic, pinned elements stay, reading never fails on content |
| `fallback` | another capability or none |
| `fixtures` | `capabilities/<name>/fixtures/*.json`, input and expected output |
| `status` | `provisional`, `standard`, `deprecated` |

**Relations**: required by descriptions (`requires`), provided by a host's registry. **Rule**: a description that requires a capability its host lacks still opens; gestures that need it are refused with ATD9010 naming it (spec edge case).

## 8. Conformance fixture

One case of one tool type: `definitions/<kind>s/conformance/<type>/<case>/conformance.json` (`$defs/ConformanceFixture`) and its input files.

| Field | Meaning |
|---|---|
| `tool` | origin |
| `description` | path of the root `.atd` |
| `inputs` | the body files and the `.adp` registration, kept byte for byte (`.gitattributes` `-text`) |
| `read` | the expected reading: elements, relations, attributes, findings (as `$defs/Finding` of FBL and DISL), unreadable parts |
| `drawing` | the expected scene after reading (`$defs/Drawing`) |
| `steps[]` | `select`, `action` (+ `args`), `property`, `move`, `create`, `connect`, `delete`, `undo`, `redo`, each with its expected `splices`, resulting bytes (`expect` or `expectFile`), findings, drawing, or `refused` with its reason |
| `provenance` | per part (`bytes`, `reading`, `findings`, `drawing`): host, repository, commit (the reference commit whose behaviour is recorded), `recordedWith` (for a recorded part, the commit `atd record` ran at), and the source file (a standalone golden or `atd record`) |

**Rules**: the bytes after each step equal the reference bytes exactly; a fixture changes only by re-recording, never by hand; `undo` returns the previous bytes exactly.

## 9. Drawing

The scene of one view, in `adp-scene`'s vocabulary: `elements[]` (`id`, `type`, `shape`, `bounds`, `label` with text and font token, `style` with fill, stroke and token names, `children`), `edges[]` (`id`, `type`, `source`, `target`, `route` points, markers, label), `chrome[]` (bands, notices, legends). Positions are in the canvas's domain units, rounded to 0.01. Two drawings are equal when their elements and edges are equal as sets keyed by `id`, and their ordered draw lists (z-order) are equal.

## 10. Trace

`definitions/<kind>s/<name>.trace.json` (`$defs/Trace`).

| Field | Meaning |
|---|---|
| `tool` | origin |
| `description` | root `.atd` |
| `companion` | `file` and `sections[]`, the headings whose `###` headings and top-level list items are items |
| `items[]` | `id` (`<section-slug>/<n>`), `text` (first line), `statedBy` (a construct path in the description, e.g. `notation.node Topic.label`, a script function, a binding rule, or a capability) or `hostConcern` with its `reason` from the ATD document's list (FR-022) |
| `hostCode[]` | `host`, `repository`, `commit` (the reference commit), `path`, `lines`, `behaviour` (one sentence), and either `statedBy` (the reference host's behaviour, which the description states) or `divergesFrom` (another host's different behaviour, not stated; names the `statedBy` of the reference behaviour, spec Q8) |

**Rules** (checked by `validate-examples.py` and `atd check --trace`): every companion item appears exactly once; every `statedBy` resolves in the description; every `hostConcern` reason is one of the ATD document's host concerns (rendering, gestures, text measurement, file dialogs, opening links, the host's undo stack).

## 11. Finding

`$defs/Finding`: `code` (`ATD<nnnn>`, research R19), `severity` (`error`, `warning`, `information`), `file`, `line`, `column`, `endLine`, `endColumn`, `message`, `related[]` (other locations), `fixes[]` (`title`, `edits[]` of `{file, start, end, text}` in byte offsets), `suggestions[]` (closest names). `$defs/Findings` is `{tool?, findings[]}` in a stable order: by file, then position, then code.

## 12. Language server

One core (`adp-atd-lsp`), three transports: in-process memory (desktop), stdio (IntelliJ, `atd-lsp` native), WebAssembly (VS Code). **State per workspace**: open documents (text and version), the descriptions they belong to (root and parts, resolved by headers and imports), the last checked result per description. A change to any file re-checks its description and publishes diagnostics for every file of it (story 5 scenario 3).

## 13. Debug session

| Field | Meaning |
|---|---|
| `gesture` | what started it (operation, hook event, binding read or write) |
| `breakpoints[]` | `file`, `line`, `condition` (CEL, optional), `verified` |
| `state` | `running`, `paused` (with the reason: breakpoint, step, entry), `finished`, `stopped` |
| `frames[]` | function or construct, file, line, `locals`, `arguments` |
| `elements[]` | the elements the gesture touches, with their current attribute values in the working copy |
| `transaction[]` | the commands collected so far, in order of application |
| `budget` | steps used and allowed, recursion depth |

**Transitions**: `running` → `paused` (breakpoint whose condition holds, or a step completing) → `running` (continue, step over, into, out) → `finished` (transaction committed to the working copy) | `stopped` (stop, or budget exceeded: the transaction is discarded, FR-072).

## 14. Parse tables

`$defs/ParseTables`: the normalized LALR(1) automaton used to compare `adp-atd-grammar` with Lark: terminals (name, pattern or string, priority), rules (lhs, rhs, the alias and filtering flags), states numbered in breadth-first order from the start state over symbols sorted by name, and per state its actions and gotos. `atd tables` prints it for a grammar; `atd-grammar.py --tables` prints Lark's; equal output is the cross-check of contracts/grammar.md.
