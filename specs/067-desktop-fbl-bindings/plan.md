# Implementation Plan: Reading Through Declared Bindings on the Desktop

**Branch**: `features/067-desktop-fbl-bindings` (planning); the implementation's branches are named in *Delivery* | **Date**: 2026-10-31 | **Spec**: [desktop-fbl-bindings.spec.md](desktop-fbl-bindings.spec.md)

**Input**: the specification, with Peter's choices of 2026-10-30: declared FBL bindings over wrapped readers, and comparing only a description's own refusal reason (FR-011).

## Summary

The desktop host implements FBL through its current version, one pull request per version, with each fixture leaving the not-supported list as it passes. The C4, Databricks and Wardley map descriptions then move to their declared bindings, with the three layouts they need. Recorded gestures are rewritten in ATD's own steps, without changing what any step expects. Last, FBL gains what Turtle needs, and the four RDF descriptions move too, which settles T149. See [research.md](research.md).

## Technical Context

- **Language**: Rust (etalii.adp.ide.desktop), with etalii-lark 0.4.1 for grammars; the specifications and descriptions in etalii.adp.
- **What changes in etalii.adp.ide.desktop**: `crates/adp-fbl` (families, reading, planning, grammar), `crates/adp-conformance/tests` (`fixtures.rs`, `standalone.rs`), `crates/adp-atd-runtime/src/capabilities`, `modules/diagrams/{c4,databricks}` (calling the moved layouts), `crates/adp-atd-cli/src/record`, `crates/adp-atd-validate`.
- **What changes in etalii.adp**: `definitions/diagrams/c4-*`, `databricks-*`, `wardley-map*`, `w3c-*` bindings; re-recorded `conformance/`; `specifications/atd/` (§2.3); `specifications/fbl/` (Turtle's version, story 4).
- **What checks it**: the desktop's Build (`cargo fmt`, `clippy -D warnings`, `cargo test --workspace`, `sync-etalii-adp.py --check`, `atd record --check`, the WebAssembly validation) and etalii.adp's Build (`validate-examples.py`, `atd-grammar.py --check`, the `descriptions` job).
- **Measures**: the length of `NOT_SUPPORTED` (SC-001), and `atd validate`'s passing cases per description (SC-002, SC-003).
- **Constraints**: the same bytes as the standalone host for the same edit; no case's expected result changes; every existing parity golden stays green; the core does not depend on the UI toolkit.
- **Scale**: 56 fixtures, 10 and 4 descriptions, 137 and 89 cases.
- **Unknowns**: R7's id mapping and R9's overlap are checked while the work is done, with what happens otherwise stated there.

## Constitution Check

| Principle | How this feature meets it |
|---|---|
| I. One source of truth | Every FBL construct is already defined in etalii.adp, or is defined there first (story 4). The desktop only implements it. |
| II. Implementable from the document alone | Fixtures drive each version. Anything the desktop finds unstated goes back to etalii.adp as a change to FBL, not as behaviour of the port. |
| III. Precise normative language | ATD §2.3's new sentences and Turtle's constructs use RFC 2119 key words. |
| IV. Versioned specifications | Turtle's constructs are a minor version; every earlier document keeps its meaning. |
| V. Simplicity | No wrapper capability, no second reader. `reader.*` capabilities leave these descriptions. |
| VI. Warnings | The desktop's `clippy -D warnings` holds. |

| Desktop principle | How |
|---|---|
| I. Native platform | No new run-time dependency. |
| II. The text file is the source of truth | Same bytes as the standalone host; a several-file edit is one undo. |
| III. The core does not depend on the toolkit | All of it is below `adp-shell`. |
| IV. Test first | Each fixture fails before its construct is written, as it does today. |
| VI. No clippy warnings | Held by the Build. |

## Delivery

Each pull request is one branch in its own worktree, opened ready with auto-merge on.

| Pull request | Repository | Branch | Holds |
|---|---|---|---|
| A | desktop | `features/067-desktop-fbl-0.10` | Several-file replay, FBL 0.10 |
| B | desktop | `features/067-desktop-fbl-0.11` | FBL 0.11 |
| C | desktop | `features/067-desktop-fbl-0.12` | FBL 0.12 |
| D | desktop | `features/067-desktop-fbl-0.13` | FBL 0.13, and 0.14 if merged |
| E | desktop | `features/067-desktop-layouts` | The three layouts |
| F | desktop, then etalii.adp | `features/067-recorded-gestures` | Recorder and validator, §2.3, re-recorded cases, FR-011 |
| G | etalii.adp | `features/067-c4-bindings` | The C4 descriptions |
| H | etalii.adp | `features/067-databricks-bindings` | The Databricks descriptions |
| I | etalii.adp | `features/067-wardley-binding` | The Wardley map description |
| J | etalii.adp, then desktop | `features/067-fbl-turtle` | Turtle's FBL version and its port |
| K | etalii.adp | `features/067-rdf-bindings` | The four RDF descriptions, T149 |

A to D go in order. E and F are independent of them. G, H and I need A to F, and J needs D. A description's pull request vendors into the desktop afterwards, with the tests' lists of known differences updated in the same desktop pull request.

## Project Structure

```text
specs/067-desktop-fbl-bindings/
├── desktop-fbl-bindings.spec.md
├── plan.md
├── research.md
└── tasks.md
```

There is no data model or contract of its own: FBL's and ATD's documents are the contracts, and this feature changes ATD §2.3 and adds Turtle's FBL version.

## Complexity Tracking

None. The largest risk is scale rather than design: if a version's fixtures need more than the constructs in R3, the plan grows by a task, not a new approach.
