# Research: Reading Through Declared Bindings on the Desktop

Each entry records a decision the plan rests on. The FBL constructs themselves are decided in [spec 066's research](../066-fbl-conversion-gaps/research.md), and this document does not repeat them.

## R1. Which FBL version the desktop implements

- **Decision**: FBL 0.14 if spec 066's pull request E (`features/066-fbl-yaml-new-key`, etalii.adp #631) has merged when story 1 starts, else 0.13, then 0.14 as its own pull request.
- **Rationale**: FR-001 names the version current when this plan is written, and 0.14 is already open. Implementing in version order keeps each pull request's fixtures a clear gate.
- **Alternatives considered**: stopping at 0.12, refused because the C4 descriptions' tags need 0.13.

## R2. How the desktop's fixture runs grow

- **Decision**: two runs change. `crates/adp-conformance/tests/fixtures.rs` replays splices per file with `expectFiles`, and `tests/standalone.rs` removes each fixture from `NOT_SUPPORTED` in the pull request that makes it pass.
- **Rationale**: the list is the running measure of SC-001. A fixture leaves it only when it passes, so a version's pull request cannot claim more than it runs.
- **Starting point, 2026-10-30**: 61 names on the list. 5 predate spec 066 and stay, with their reasons. Of the 56 added, `grammar-comment-start` already passes once moved.

## R3. What each FBL version asks of `adp-fbl`

Sorted by the first failure each fixture gave on the desktop on 2026-10-30:

The versions here follow the order of delivery; FBL itself marks the first row 0.11 and the second 0.10, as spec 066's pull requests merged in that order.

| Version | Failure seen | Construct (spec 066 research) |
|---|---|---|
| 0.10 | `std.duplicateId`, `fbl.unmatched-close` absent, text with its escapes, absent values refused, `grammar-remove-part` splices | comments (R5), nested recovery (R6), absent parts (R7), escapes (R8), block written around a first child (R9), views (R10), gathered values (R11), legacy layout (R15) |
| 0.11 | ids not derived, every rule read in every reading, flow-sequence inserts refused, refusal sentences | `origins` (R12), flow sequences (R13), refusals, nested mappings, secondary slots and lowercased keys (R14), `resource` by origin |
| 0.12 | ids missing, several-file edits refused | identities (R16), repeated nodes (R17) |
| 0.13 | one tag where two are read | several items in one argument (R25) |

- **Decision**: one desktop pull request per FBL version, in that order. Each file-spanning edit goes through one transaction and one undo, as FBL states.

## R4. A registration changed by a binding's splice

- **Decision**: lift the refusal "A registration is changed only by placing elements, storing ids and writing settings" only for what FBL 0.10 and 0.12 state: a legacy layout, view statements and identities.
- **Rationale**: 13 fixtures stop there. The rule stays for every other change, since it protects the registration.

## R5. Which layouts come with story 2

- **Decision**: move `layout.rankedBoundaries`, `layout.layeredColumns` and `layout.bands` into `adp-atd-runtime/src/capabilities/`, with each module calling them there, registered once their fixtures pass (spec 035, T125's rule).
- **Rationale**: FR-004. Their fixtures exist: 115, 14 and 7. T125 stays open for the other layouts.

## R6. How a binding enters a description

- **Decision**: rewrite each description's binding part in ATD from the example binding in `specifications/fbl/`, using ATD's constructs from spec 066 (`family grammar`, `grammar from`), with `requires capability reader.*` removed.
- **Rationale**: FR-003. `structurizr.fbl`, `databricks*.fbl` and `wardley-map.fbl` are tested against the same fixtures. The lowered binding stays comparable to them, as `tool.rs` already does for the mind map.
- **Open point**: one Structurizr binding serves six descriptions. The six parts stay separate files today, so each is rewritten and a test holds them equal.

## R7. How gestures are recorded

Across the vendored cases on 2026-10-30: 390 `action` steps, 142 `move`, 140 `property`, 113 `undo`, 61 `redo`, and no `create`, `connect` or `delete` step at all. Among the action steps' targets:

| Target | Steps | Written as |
|---|---|---|
| an element's id | 142 | `action` with `select` (the element is the selection) |
| no target | 91 | unchanged |
| `new:x,y` | 74 | `create` with `type` and `at`, the type taken from the action's toolbox entry |
| `rel:a->b`, including `rel:a->new:x,y` | 46 | `connect` naming both ends; a new end is a `create` in the same step |
| `task:`, `library:`, `res:`, `edge:`, `variable:`, `loop:`, `target:` | 36 | `select` the element whose id it names; where the module's id is not the description's, the case's own reading gives the mapping |

- **Decision**: translate in `atd record` from the parity script's meaning, and let the replay's expected bytes prove it: `atd record --check` must stay green against the module, and each step's expected results may not change (FR-006). What cannot be translated is named (FR-007) and listed in the feature's tasks.
- **Rationale**: the parity scripts stay as they are, so standalone parity is untouched. `crates/adp-parity/src/lib.rs` already understands these strings and is where their meaning lives.
- **Open point**: `select` by a module's id assumes the description's ids equal the module's. Story 2's readings will show where they don't, and those become differences in the description.

## R8. Comparing a refusal (FR-011)

- **Decision**: `adp-atd-validate` compares a refusal's reason exactly unless the case's is one of the "not offered" sentences. ATD §2.3 lists them as a closed set: "Unknown action 'x'.", "'x' does not apply to this selection.", "'x' cannot be edited on this selection." and "That action is not available for this item." Peter widened it on 2026-11-01: any reason given for refusing that step counts as that sentence, a description's own included, since both tools refuse it.
- **Rationale**: a closed set can't hide a real wording difference between two reasons a tool wrote, and a step one tool refuses and the other makes stays a difference.

## R9. What Turtle needs of FBL (story 4)

- **Decision**: a new FBL minor version after 0.14, specified with fixtures in etalii.adp first, for the four constructs of FR-008: a selector that reaches up from a triple to its statement's subject, a value expanded through the document's prefix directives, a stable ordinal for a blank node, and an unescaped literal slot. Bound on `w3c-turtle.lark`, which exists.
- **Rationale**: T149's attempt on 2026-10-27 stopped on exactly these. Story 1's constructs may cover part of them (escapes, R8 of spec 066), so the version's first task checks that before adding anything.
- **Alternatives considered**: keeping `reader.turtle`, refused by Peter's choice of 2026-10-30.
- **What FBL through 0.14 answers (T035, 2026-10-31)**, checked against `FBL-specification.md` at 0.14 and the reader's contract:

| FR-008's construct | FBL through 0.14 | So FBL 0.15 adds |
|---|---|---|
| Reaching a statement's subject from a triple inside it | Not answered. A `{node}` selector goes down only; `{parent: a}` reads a slot of an enclosing entry a rule matched, and no type of the model stands for a statement, nor could a rule match the forms a subject takes in one slot. | `..` and `+` in a slot's selector, and `or`, further slots of which the first present is read, for the forms of a term. The name of a node (`name`) says which form was met. |
| Expanding a prefix | Not answered: no slot reads another part of the body. A `map` is fixed text. | `body.prefixes`, a slot's `expand`, and writing a term back through the file's own declarations. |
| Stable blank-node ordinals | Not answered. `{value: cel}` sees one entry, and `sidecar` ids are stored, which a blank node's must not be. | `body.ordinals`, a slot's `ordinal`. |
| Unescaping a literal | In part. 0.11's `escape` resolves `\\"` and `\\\\` and keeps every other sequence; `match` can read one quoting form per group. Turtle's `\\n`, `\\t`, `\\uXXXX` and the rewriting of `'x'` and long strings as `"x"` are not answered. | `sequences`, `unicode`, `writes` and `requote` on `escape`. |

Reading the triples in the reader's order, inner constructs first, also needs `body.order: closed`, because a card's place follows the order the file first names it through the triples (T037). A collection's `rdf:first` and `rdf:rest` need no construct: each member's `object` is one entry and its only child another, and `+` reaches the next.

- **What 0.15 does not answer, and is not in FR-008 (T035)**: writing a triple as the reader's contract says. An add that continues its subject's statement with `;` (replacing the terminator), a removal that takes its separator, the whole statement when it is the last, and a part of a `;` or `,` list shared with other triples are gaps 1, 3 and 4 of `w3c-rdf.md`, and no splice of a declared binding states them. The descriptions write a new triple as a statement of its own and refuse a removal, and the steps that differ are listed by name in the desktop's tests, for Peter's ruling (spec 067, scenario 5 of story 4).
- **What FBL 0.16 adds, by Peter's ruling of 2026-11-01**: an insert's `continues`, the operation `replace-separator`, and a remove's `parts` and `whole` state what 0.15 left open. Three things follow from them and are stated with them: a run of removals is planned bottom-up (FBL §6.4), as `RdfWriter` removes a resource; two entries of a rule on one line have places of their own (FBL §5.3), since a removal and a set must name one of them; and a removal that would not read back is refused. The whole statement goes without a comment above it, unlike a removed entry's line span (FBL §4.9), because the module keeps that comment and the cases are the reference.
