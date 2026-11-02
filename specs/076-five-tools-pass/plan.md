# Implementation Plan: Every Case Passes for Five More Tool Types

**Branch**: `features/076-five-tools-plan` (planning); the implementation's branches are named in *Delivery* | **Date**: 2026-11-02 | **Spec**: [five-tools-pass.spec.md](five-tools-pass.spec.md)

**Input**: the specification, and Peter's approval of plan and tasks on 2026-11-02. No implementation is approved by it.

## Summary

The diagnosis in [research.md](research.md) replaces the specification's first readings. Nearly every difference of the three diagrams is a gap of the desktop's runtime for descriptions, and each is small. A binding rule's `within` is dropped in lowering, which alone takes 55 of the behavior model's 172 differences (R2). One key refuses the causal loop diagram's whole notation (R7), and with its ring and its unreadable lines, 3 of its 4 cases pass (R8, R9). A time axis's origin and scale are not read, and change constraints and change hooks do not run on a property (R13, R14). Few are mistakes of a description (R5, R15), and three places, in two cases of one tool type, are language gaps for Peter (R21).

The two designers turn out to be closer than the specification supposed. A designer's description lowers onto the diagrams' runtime with 12 errors of two kinds, and once those are mapped its 12 cases run and give 217 differences, mostly repeats of a few causes (R17). So story 2 is a lowering, an id strategy, the registration's blocks and a few replay steps, not a second engine. Story 3 is the largest single piece of writing: a description of 55 operations and three formats, and a recorder for tables (R20).

## Technical Context

- **Language**: Rust in etalii.adp.ide.desktop; descriptions, contracts and specifications in etalii.adp. No grammar changes, so etalii-lark and etalii-lark-derive are not touched. No C# is written.
- **What changes in etalii.adp**: `definitions/diagrams/agent-behavior-modelling*.atd`, `causal-loop-diagram*.atd`, `gartner-hype-cycle-graph*.atd`, with their `.md` companions and traces; `specifications/atd/capabilities/layout.ring/`, ATD §13's catalogue, ATD §2.3 for a designer's findings; `definitions/designers/knowledge*.atd`, its trace and its cases; `definitions/designers/README.md`; `specifications/desl/` if Peter rules so on Q3; `hosts/desktop/specification-runtimes/`; spec 035's notes on T063, T064, T093, T121, T125 and T132.
- **What changes in etalii.adp.ide.desktop**: `crates/adp-atd-runtime/src/lowering/{fbl,mod}.rs`, a new `lowering/designer.rs`; `crates/adp-atd-runtime/src/tool.rs`; `crates/adp-atd-runtime/src/capabilities/{tidy_tree,ring,self_organising,rows}.rs`, moved from modules; `crates/adp-scene/src/notation/compile.rs`; `crates/adp-diagram/src/{document,session,module}.rs`; `crates/adp-disl/src/` for the counter strategy and the `kind: type` row; `crates/adp-fbl/src/planning/planner.rs` for a retype; `crates/adp-atd-validate/src/{lib,cases,parts}.rs` and `tests/` per tool type; `crates/adp-atd-cli/src/record/` for a table and for `layout.ring`; `crates/adp-atd-lsp/tests/wasm/validate.mjs`; `modules/diagrams/{agent-behavior-modelling,causal-loop-diagram,gartner-hype-cycle-graph}` calling the moved code; `parity/scripts/etalii/knowledge/`; `parity/inventory.md`; `vendor/etalii.adp/` through `tools/sync-etalii-adp.py` only.
- **What checks it**: the desktop's Build (`cargo fmt`, `clippy -D warnings`, `cargo test --workspace`, `sync-etalii-adp.py --check`, `atd record --check`, the WebAssembly validation) and etalii.adp's Build (`validate-examples.py`, `atd-grammar.py --check`, the `descriptions` job, which builds `atd` from the desktop branch of the same name when there is one, else from `develop`).
- **Measures**: `atd validate --json`'s differences per case, against R1's table; the lists in each tool type's test; `atd record --check`.
- **Constraints**: no case's expected result changes (FR-008); a person's document opens on today's module, with its tests and parity goldens unchanged (FR-010), so every session change is off for a hand-written module; the core does not depend on the UI toolkit; capability code is moved, not rewritten (spec 035, T125).
- **Scale**: 13 diagram cases, the longest of 33 steps, 12 designer cases with 114 steps in all, 3 parity scripts of 30 steps for the Knowledge designer and what its refusals add. Validation of these takes seconds.
- **Unknowns**: what remains in the behavior model and the hype cycle graph once R6 and R13 to R16 are in, since those cases cannot be seen further until they are. Such a difference is corrected in the description if it can be, and otherwise goes to Peter (FR-007). Peter's answers to Q1, Q2, Q3 and Q4 in R21. Implementation waits on his word.

## Constitution Check

*Checked after the research; nothing here needs a recorded deviation.*

| Principle | How this feature meets it |
|---|---|
| I. One source of truth | The contract `layout.ring`, every description and every statement of ATD §2.3 are in etalii.adp first. The desktop implements them and vendors them. |
| II. Implementable from the document alone | The runtime gaps are places where a document already says what to do, DISL §5.5, §8.7, §9.1, §10.2, §10.3 and FBL §6.4 among them. What the diagnosis finds unstated, Q3, goes to the language as a sentence with a fixture, if Peter so rules. |
| III. Precise normative language | Any new text uses RFC 2119 key words. |
| IV. Versioned specifications | No language version changes unless Peter rules so on Q1, Q2 or Q3, and then each is a minor version (FR-009). A capability is a row of the catalogue and a contract of its own version. |
| V. Simplicity | No second engine: a designer runs through what runs a diagram (R17). Capabilities are moved, and no drag, compact view or surface is built that no case needs. |
| VI. No Rider warnings | No C# is written. |

| Desktop principle | How |
|---|---|
| I. Native platform | No new run-time dependency. |
| II. The text file is the source of truth | Every write is an FBL splice. The cases hold every byte, and the parity goldens hold a person's tool. |
| III. One frame, many tools | All of it is below `adp-shell`. A tool's behaviour is what its description says, and a module stays what a person's document opens on. |
| IV. Test-first | Each tool type's test goes in first with today's differences listed, each correction takes names off the list, and the rest are seen failing in the same way. |
| V. Simplicity | No new crate. Modules call what moved, as C4's and Databricks' do. |
| VI. No clippy warnings | Held by the Build. |

## Delivery

Each pull request is one branch in its own worktree. A pull request in the desktop names this feature's folder and the etalii.adp commit its tasks came from. Tasks are ticked in etalii.adp only once their pull request has merged.

| Pull request | Story | Repository | Branch | Holds |
|---|---|---|---|---|
| A | 1 | etalii.adp | `features/076-abm-description` | The behavior model's corrections |
| B | 1 | desktop | `features/076-abm-description` | A vendored; lowering, tidy tree, ids, gestures, the test |
| C | 1 | etalii.adp | `features/076-cld-description` | `layout.ring` with its fixtures, the description naming it |
| D | 1 | desktop | `features/076-cld-description` | C vendored; variant, ring, unreadable lines, `arrange`, the test |
| E | 1 | etalii.adp | `features/076-hype-cycle-description` | The hype cycle graph's corrections |
| F | 1 | desktop | `features/076-hype-cycle-description` | E vendored; time axis, change rules, connect, drop, `rows`, the test |
| G | 2 | etalii.adp | `features/076-designer-validation` | ATD §2.3 on a designer's findings; DESL's sentence if Q3 so rules |
| H | 2 | desktop | `features/076-designer-validation` | G vendored; the lowering, the counter, the blocks, the replay, the test |
| I | 3 | desktop | `features/076-knowledge-recorder` | `atd record` for a table; the module's refusal and finding scripts |
| J | 3 | etalii.adp | `features/076-knowledge-description` | The description, trace, companion and cases |
| K | 3 | desktop | `features/076-knowledge-description` | J vendored, the test |
| L | all | etalii.adp | `features/076-five-tools-ticks` | Ticks and notes |

The landing flow is the one Peter named: etalii.adp first, then vendoring with `tools/sync-etalii-adp.py`, then the desktop's pull request. So A merges before B, C before D, and so on. A pair keeps one name, so that the etalii.adp `descriptions` job builds `atd` from the desktop branch while its pair is open.

Each story lands alone. A to F need nothing of G to K, and each of the pairs A-B, C-D and E-F can land in any order, apart from one shared change: R14's `DiagramModule` method goes in whichever of them first needs it. Story 2 needs no story 1 pair, though `within` in B must be there, because the designer's binding uses it: if H goes first it carries that one line. Story 3 needs story 2's H. Fixtures of `layout.ring` are recorded from D's branch for C's pull request (R22), so C opens once D's recorder works, and merges first.

This branch, `features/076-five-tools-plan`, holds only this folder and goes first. Peter's answers to Q1, Q2 and Q3 are needed before B and H can list or state what they ask, and before their tests can say which places stay listed.

## Project Structure

```text
specs/076-five-tools-pass/
├── five-tools-pass.spec.md
├── plan.md
├── research.md
└── tasks.md
```

There is no data model or contract of its own: DISL, DESL, FBL and ATD are the contracts, `layout.ring`'s contract is in its catalogue, and a case's shape is ATD §2.3's. There is no quickstart: `atd validate` on each root is the one command that shows the feature.

```text
etalii.adp/
├── definitions/diagrams/{agent-behavior-modelling,causal-loop-diagram,gartner-hype-cycle-graph}*.atd
├── definitions/designers/knowledge.atd, knowledge.yaml.atd, knowledge.json.atd, knowledge.xml.atd, knowledge.trace.json
├── definitions/designers/conformance/knowledge/
└── specifications/atd/capabilities/layout.ring/{contract.json, fixtures/}

etalii.adp.ide.desktop/crates/
├── adp-atd-runtime/src/capabilities/{tidy_tree,ring,self_organising,rows}.rs
├── adp-atd-runtime/src/lowering/designer.rs
├── adp-atd-validate/tests/{agent_behavior,causal_loop,hype_cycle,hierarchical_requirement,knowledge}.rs
└── adp-atd-cli/src/record/table.rs
```

## Complexity Tracking

None is a violation. The largest risks are these.

- **A person's tool changes by accident.** `set_property`, `addressed` and the connect path are shared with every hand-written module. R14's method keeps the change rules off for them, and `cargo test --workspace` with the parity goldens is what holds FR-010 in every desktop pull request.
- **The designer's mapping hides a difference between DESL and DISL.** R17 says what it risks, and T046 reports where the mapping has to say more than a name. Should the list grow long, a designer runtime of its own goes to Peter as its own specification.
- **What the first run cannot see.** The behavior model's 85 and the hype cycle graph's differences are counted past causes that hide what comes after. The plan grows by a task for each, not by a new approach.
