# Implementation Plan: A DISL Function That Groups a List by Key

**Branch**: `features/075-disl-grouping-plan` (planning); the implementation's branches are named in *Delivery* | **Date**: 2026-11-02 | **Spec**: [disl-grouping-function.spec.md](disl-grouping-function.spec.md)

**Input**: the specification, and Peter's approval of plan and tasks on 2026-11-02. No implementation is approved by it.

## Summary

The measurement of [research R1](research.md#r1-what-was-measured) holds the specification's first assumption: 98% of the 13 minutes `geographic-names` takes today is the rules' repeated filtering of triples. DISL gains, as version 0.9, the macro `l.groupBy(x, key)`, which gives a value with `get(key)` and `keys()`. A hand prototype on the desktop host took the case from 789 seconds to 36, with every card derived and no budget overrun.

The prototype also shows three things the specification did not state, and the plan answers them. A grouping that is made again for each item gains nothing, so the runtime keeps a grouping while its list and the values it read are unchanged (R5), and charges its cost as if it had grouped again (R7), so a host with no such memory gets the same budgets. The overrun today is mostly ATD's step budget (§12.6), not `limits.celCost`, and `distinct()`'s declared cost also goes over on these bodies (R2). And once the case runs, it shows differences that nobody has seen, among them a mistake in the SKOS description's `Related` edges and a refused documentation row, which goes to Peter (R12). The specification's SC-002 changes from 30 to 60 seconds (R9).

## Technical Context

- **Language**: Rust in etalii.adp.ide.desktop; the specification, its schema, its fixtures and the descriptions in etalii.adp. No grammar changes, because a macro is a call in ATD's `cel.lark` (ATD §6.3), so etalii-lark and etalii-lark-derive are not touched. No C# is written: the standalone host follows under its own specification.
- **What changes in etalii.adp**: `specifications/disl/` (DISL 0.9: §2.9, §12.1, §12.4, §12.5, Appendix B.8, *Changes from 0.8*, the schema's title and version text, the `$defs` of a fixture, fixtures and a worked example), `specifications/atd/ATD-specification.md` (§1.3, §6.3, *Changes*), `.github/scripts/validate-examples.py`, `definitions/diagrams/w3c-{skos,rdf,owl,shacl}.atd` and their `.md` companions and traces, `hosts/desktop/specification-runtimes/disl.md`.
- **What changes in etalii.adp.ide.desktop**: `crates/adp-cel` (the macro, the grouping value, the memory of groupings, the charge), `crates/adp-disl` (offering the macro, keeping `nodesOfType` and `relationsOfType` lists while unchanged, forgetting groupings when a value changes), `crates/adp-atd-syntax/src/lower.rs` (`MACROS`), `crates/adp-atd-check/src/cel.rs` (`LIBRARY`, the inferred types), `crates/adp-atd-validate/tests/w3c.rs`, `crates/adp-atd-lsp/tests/wasm/validate.mjs`, `.github/workflows/build.yml`, `parity/inventory.md`, `vendor/etalii.adp/` through `tools/sync-etalii-adp.py` only.
- **What checks it**: the desktop's Build (`cargo fmt`, `clippy -D warnings`, `cargo test --workspace`, `sync-etalii-adp.py --check`, `atd record --check`, the WebAssembly validation) and etalii.adp's Build (`validate-examples.py`, `atd-grammar.py --check`, the `descriptions` job, which builds `atd` from the desktop branch of the same name when there is one, else from `develop`).
- **Measures**: the grouping fixtures' count of passes, native and WebAssembly (SC-001); `atd validate --case geographic-names`'s wall time in a release build (SC-002); `w3c.rs`'s lists and the cases passing per description (SC-003, SC-004).
- **Constraints**: no case's expected result changes; `limits.celCost` and the step budget stay as they are; the core does not depend on the UI toolkit; a description that does not use the function behaves as before.
- **Scale**: 5,083 triples and 436 terms in `geographic-names`, 17,683 triples and 1,151 terms in `business-economics`, 93 cases across the four descriptions.
- **Unknowns**: Peter's ruling on what is listed in R12, which changes one list in `w3c.rs`, not the design.

## Constitution Check

*Checked after the research; nothing here needs a recorded deviation.*

| Principle | How this feature meets it |
|---|---|
| I. One source of truth | The macro is defined in DISL first, with its fixtures, and the desktop only implements it. What the desktop's prototype found goes back as DISL's text (R5, R7). |
| II. Implementable from the document alone | §12.4 states the macro, its order, its failure and its cost; the fixtures and a worked example ship in the same pull request; `disl.schema.json` gains a fixture's `$defs` and the new version. |
| III. Precise normative language | The new text uses RFC 2119 key words, and the macro is CEL as Principle III asks: no new expression syntax. |
| IV. Versioned specifications | DISL 0.9 is a minor version: every valid 0.8 specification stays valid with the same meaning (FR-006), recorded in *Changes from 0.8*. |
| V. Simplicity | One macro and two methods. Keys may not be lists, since a concatenated string serves every use measured, and null is a failing key (R8). No estimator is written, since no host has one (R7). |
| VI. No Rider warnings | No C# is written. |

| Desktop principle | How |
|---|---|
| I. Native platform | No new run-time dependency. The WebAssembly fixture run uses a development dependency only (R10). |
| II. The text file is the source of truth | The feature does not touch splices: the bytes of every case stay what they are, which `w3c.rs` holds. |
| III. One frame, many tools | All of it is below `adp-shell`. A tool's behaviour stays what its description says. |
| IV. Test-first | The fixtures are written before the macro and seen failing; `w3c.rs`'s test for the case is switched on before the description has moved, and its failure recorded. |
| V. Simplicity | No new crate. |
| VI. No clippy warnings | Held by the Build. |

## Delivery

Each pull request is one branch in its own worktree. A pull request in the desktop names this feature's folder and the etalii.adp commit its tasks came from. Tasks are ticked in etalii.adp only once their pull request has merged.

| Pull request | Repository | Branch | Holds |
|---|---|---|---|
| A | etalii.adp | `features/075-disl-grouping-language` | DISL 0.9's text, schema, fixtures and worked example; ATD's sentences |
| B | desktop | `features/075-disl-grouping` | A vendored at its merge commit; the macro, the memory, the charge, native and WebAssembly fixture runs, ATD's check and lowering |
| C | etalii.adp | `features/075-skos-grouping` | The SKOS description on the macro, its companion and trace |
| D | desktop | `features/075-skos-grouping` | C vendored; `TOO_LONG`, the `#[ignore]` and the WebAssembly skip removed; SC-002's time-limited step; SC-005's test; the names of what still differs |
| E | etalii.adp | `features/075-rdf-grouping` | The RDF, OWL and SHACL descriptions on the macro; gap 6 closed in `w3c-rdf.md` |
| F | desktop | `features/075-rdf-grouping` | E vendored, each description's list held; the last measures recorded |
| G | etalii.adp | `features/075-disl-grouping-ticks` | The ticks of tasks whose pull requests have merged |

A merges first, then B, because a language lands in etalii.adp with its fixtures and is vendored from there. C needs B on the desktop's `develop`, because its `descriptions` job builds `atd` from there and `atd check` must know the macro; D then vendors C. D keeps the name of C because the two go together, so C's job builds from D's branch if D has been pushed, which is harmless once B has merged. E and F follow the same order and need D only so that the measuring is on one footing. This branch, `features/075-disl-grouping-plan`, holds only this folder and goes first.

## Project Structure

```text
specs/075-disl-grouping-function/
├── disl-grouping-function.spec.md
├── plan.md
├── research.md
└── tasks.md
```

There is no data model or contract of its own: a grouping's two values are in the specification's Key Entities, and DISL §12.4, with its fixtures, is the contract. There is no quickstart: `atd validate --case geographic-names` is the one command that shows the feature, and SC-002 states it.

```text
etalii.adp/specifications/disl/
├── DISL-specification.md            §12.4 and the rest of 0.9
├── disl.schema.json                 $defs/GroupingFixture
├── grouping-terms.dis, .did, .findings.json   the worked example
└── fixtures/grouping/*.json         one list, one key, the groups expected

etalii.adp.ide.desktop/crates/
├── adp-cel/src/{eval,function,group}.rs      the macro, the value, the memory
├── adp-disl/src/model/{diagram,element}.rs   lists kept while unchanged, groupings forgotten
├── adp-disl/tests/grouping_fixtures.rs       every fixture, native and WebAssembly
├── adp-atd-syntax/src/lower.rs, adp-atd-check/src/cel.rs
└── adp-atd-validate/tests/w3c.rs
```

## Complexity Tracking

None is a violation. The largest risk is in the memory of groupings: forgetting too little would give a stale group, which FR-006 forbids and the specification's last edge case names. R5 therefore keeps a grouping only when the key read nothing but its item's stored values, literals and library functions, the rule being checked as the pass runs, and T016 and T017 test it by editing a value and by reading another element in a key.
