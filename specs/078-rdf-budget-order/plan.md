# Implementation Plan: The RDF Description Orders Its Cards Once per Reading

**Branch**: `features/078-rdf-budget-order-plan` (planning); the implementation's branches are named in *Delivery* | **Date**: 2026-11-09 | **Spec**: [rdf-budget-order.spec.md](rdf-budget-order.spec.md)

**Input**: the specification, approved by Peter on 2026-11-09 with SC-001's 15 seconds kept as a first bound for this plan to confirm (*Clarifications*).

## Summary

The measurement of [research R1](research.md#r1-what-dominates-the-reading) holds the specification's first assumption: one reading of `business-economics` took 145.9 seconds, and about 94% of it was the layout asking `rdfCardOrder` for each card's place, each ask making the list of every card term again. With each card carrying its place through its derived type's `from` (R2), the same reading took 8.2 seconds, so SC-001's 15 seconds is confirmed, not revised (R4); `geographic-names` fell from 33.1 seconds to 3.7.

A function `rdfPlaced` makes the order once per derived type, over the card terms of both kinds, and appends each card's place to its items; `Resource` and `BlankNode` read it into an attribute `place`, and the layout's `sequence` reads that. Nothing else in the description changes.

The measurement found two things the specification did not know, and both go to Peter before the description merges. On `business-economics` the old order never ran to its end: each ask went over ATD's step budget, so the cards were laid out in the model's order, and four of the thousand drawn cards now move to where the description says they stand (R1, R3). And on both large bodies the `Statement` edges are not derived at all, before and after, because `withRepeat` goes over `limits.celCost` (R5), which is outside this feature.

## Technical Context

- **Language**: ATD and DISL 0.9's CEL in etalii.adp; Rust only in the desktop's tests. No grammar, schema, language or runtime change.
- **What changes in etalii.adp**: `definitions/diagrams/w3c-rdf.atd` (the attribute `place` on `Term`, the function `rdfPlaced`, both derived types' `from` and `place`, `rdfCardOrder` removed), `definitions/diagrams/w3c-rdf.notation.atd` (the layout's `sequence`), `definitions/diagrams/w3c-rdf.md` (section 6's measurement, FR-007). `w3c-rdf.trace.json` names no budget order, so it does not change, and `atd check --trace` holds it. `w3c-rdf.dis` is not this description and is not touched.
- **What changes in etalii.adp.ide.desktop**: `vendor/etalii.adp/` through `tools/sync-etalii-adp.py` only; a test in `crates/adp-atd-validate/tests/w3c.rs` that the RDF description's readings of the two STW bodies derive every card, each with its place.
- **What checks it**: the desktop's Build (`cargo fmt`, `clippy -D warnings`, `cargo test --workspace`, `sync-etalii-adp.py --check`, the WebAssembly validation of every description) and etalii.adp's Build (`validate-examples.py`, and the `descriptions` job's checks, built from desktop `develop`, which already accepts the change).
- **Measures**: `atd validate --case` of a scratch case with no step per body, in a release build (SC-001, SC-002); `w3c.rs`'s lists (SC-003); the readings' cards and places, and the drawings compared before and after (SC-004).
- **Constraints**: no case's expected result changes and none is recorded again; no limit is raised; no language construct is added; only the RDF description changes.
- **Scale**: 17,683 triples and 1,367 cards in `business-economics`, 5,083 triples and 467 cards in `geographic-names`, 22 cases.
- **Unknowns**: none in the design. R3's four cards and R5's statements wait on Peter's word, and neither changes what is built.

## Constitution Check

*Checked after the research; nothing here needs a recorded deviation.*

| Principle | How this feature meets it |
|---|---|
| I. One source of truth | The description changes in etalii.adp and is vendored into the desktop, never edited there. |
| II. Implementable from the document alone | The description states its order in itself: `rdfPlaced`'s comment says what a place is, as `rdfCardOrder`'s did. |
| III. Precise normative language | No normative text changes. |
| IV. Versioned specifications | No specification's version changes, and no case's result, so the description stays at 2.0.0. |
| V. Simplicity | One function and one attribute, the SKOS description's shape; `rdfCardOrder` goes. |
| VI. No Rider warnings | No C# is written. |

| Desktop principle | How |
|---|---|
| I. Native platform | No dependency changes. |
| II. The text file is the source of truth | No splice changes; the cases' bytes are held by `w3c.rs`. |
| III. One frame, many tools | Nothing in the frame changes. |
| IV. Test-first | The STW test is written first and seen failing against the vendored description as it stands. |
| V. Simplicity | No new crate, and no code outside a test. |
| VI. No clippy warnings | Held by the Build. |

## Delivery

Each pull request is one branch in its own worktree. A pull request in the desktop names this feature's folder and the etalii.adp commit its tasks came from. Tasks are ticked in etalii.adp only once their pull request has merged.

| Pull request | Repository | Branch | Holds |
|---|---|---|---|
| A | etalii.adp | `features/078-rdf-budget-order-plan` | The clarification, this plan, its research and tasks |
| B | etalii.adp | `features/078-rdf-card-places` | The RDF description's places, its companion's measurement |
| C | desktop | `features/078-rdf-card-places` | B vendored at its merge commit; the STW test |
| D | etalii.adp | `features/078-rdf-budget-order-ticks` | The ticks of tasks whose pull requests have merged |

A goes first. B is no language change, so desktop `develop`'s `atd` checks and validates it as it stands; still, before B merges, C's branch is run with B's description in its vendor, so that nothing merges that the desktop would not accept. C then vendors B's merge commit, and D follows C. B and C wait on Peter's word on R3 and R5.

## Project Structure

```text
specs/078-rdf-budget-order/
├── rdf-budget-order.spec.md
├── plan.md
├── research.md
└── tasks.md
```

There is no data model or contract of its own: a card and its place are the specification's Key Entities, and the description is the contract. There is no quickstart: R1's scratch case is the one command that shows the feature, and SC-001 states it.

```text
etalii.adp/definitions/diagrams/
├── w3c-rdf.atd             Term.place, rdfPlaced, Resource and BlankNode from
├── w3c-rdf.notation.atd    layout typeBands: sequence (self.place)
└── w3c-rdf.md              section 6, the measurement

etalii.adp.ide.desktop/
├── vendor/etalii.adp/      through tools/sync-etalii-adp.py
└── crates/adp-atd-validate/tests/w3c.rs
```

## Complexity Tracking

None is a violation. The risk is a card in another place, which FR-002 forbids: R3 holds every card's place equal to `rdfCardOrder`'s wherever that runs to its end, and the drawings of `geographic-names` equal; where it does not, on `business-economics`, the four cards that move are Peter's to rule on.
