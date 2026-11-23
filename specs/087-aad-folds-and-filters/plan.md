# Implementation Plan: Folded Groups, the Archive Switch and Unknown Values in a Description

**Branch**: `features/087-aad-folds-and-filters` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: the specification, approved by Peter on 2026-11-23 ("Approve both" on the project's decision card for specs 083 and 087).

## Summary

DISL 0.11 adds two things a description can say: `self.view.groups`, a map from each group key of a node's grouped compartments to whether that group is folded, its stored state else its default (DISL 6.9, 12.2); and the standard message `std.notAValue`, the sentence a form row refuses a value that is no value of its enumeration with, `value` bound (DISL 7.5, 9.1). ATD §2.3 gains two mappings for a case recorded from a module, named in the description's wire-id block beside its chrome ids: `headings`, the module's fold and unfold gestures on a heading id `<element>#<key>`, and `filters`, the module's gestures on its view element that set a canvas filter. The agent activity description then states its module's card heights in `size.height`, names `collapse-group`, `expand-group`, `show-archived` and `hide-archived` and the view element `diagram view`, and words `std.notAValue`. The desktop host reads all of it, in its runtime and its validator.

## Technical Context

- **What changes in etalii.adp**: `specifications/disl/` (DISL 0.11: document, schema, a fixture for `self.view.groups` and one for `std.notAValue`), `specifications/atd/ATD-specification.md` (an amendment of §2.3 and §1.3's DISL version), and `definitions/diagrams/agent-activity-diagram*.atd` with its trace.
- **What changes in etalii.adp.ide.desktop**: `crates/adp-disl` (the member and the message), `crates/adp-atd-runtime` (a node's computed height under a force layout, `view.bind.groups` and `view.bind.filters` kept in the body), `crates/adp-atd-validate` (the heading and filter mappings), and the vendored etalii.adp.
- **What checks it**: etalii.adp's `validate-examples.py` and the Build's `descriptions` job; the desktop's `cargo test --workspace`, `atd validate` on every description natively and through WebAssembly, and `atd record --check`.
- **No FBL change**: `view.bind`'s groups and filters already have their binding types (FBL 0.4, the agent activity binding's `GroupState` and the root's `showArchived`).

## Research

- **R1, the member**: `self.view.groups` rather than a function, since `self.view` already holds a node's view data (`pinned`, `collapsed`) and a map reads as `self.view.groups['pending']`. A node with no grouped compartment has an empty map. Stored view data, not viewer state, so it is deterministic and allowed in the `placement` and `size` contexts where the view kind `groups` is in `view.store`.
- **R2, the size**: a notation's `size.height` expression is already evaluated by the desktop runtime; what changes is that a force layout places a node at that size and the drawing draws it there (FR-002).
- **R3, headings**: ATD §2.3 names the gestures by the wire-id block's `headings: { collapse: "<id>", expand: "<id>" }`; a step that selects `<element>#<key>` and runs one of them folds or unfolds that group as activating the heading does (DISL 6.9).
- **R4, filters**: the wire-id block's `elements: { diagram: "<id>" }` names the module's view element, and `filters: { "<gesture>": { "<filter>": <value> } }` what each gesture sets.
- **R5, the message**: `std.notAValue` is a standard message (DISL 9.1's `messages`) rather than a row setting, since the sentence is the tool's, not a row's.

## Constitution Check

Checked against `.specify/memory/constitution.md` on `develop` at `000c21c`.

| Principle | Assessment |
|---|---|
| I. One source of truth | PASS. The member and the message are DISL's; the mappings ATD's; the numbers the description's. |
| II. Implementable from the document alone | PASS. Each addition has a fixture, and the agent activity case is the worked use. |
| III. Precise normative language | PASS. RFC 2119 key words; CEL for the height. |
| IV. Versioned specifications | PASS. DISL 0.11 is a superset of 0.10; ATD 0.1's amendment keeps every case's meaning. |
| V. Simplicity | PASS. Each addition is the least that lets the description say what its module does. |
| VI. No JetBrains Rider warnings in C# | PASS. No C#. |

## Project Structure

```text
specs/087-aad-folds-and-filters/
├── spec.md, plan.md, tasks.md

etalii.adp/specifications/disl/      DISL-specification.md, disl.schema.json, fixtures/view-groups/, fixtures/not-a-value/
etalii.adp/specifications/atd/       ATD-specification.md
etalii.adp/definitions/diagrams/     agent-activity-diagram.atd, .notation.atd, .trace.json

etalii.adp.ide.desktop/crates/adp-disl/src/            the member, the message
etalii.adp.ide.desktop/crates/adp-atd-runtime/src/     sizes, view_bind.rs (groups, filters)
etalii.adp.ide.desktop/crates/adp-atd-validate/src/    headings, filters
etalii.adp.ide.desktop/crates/adp-atd-validate/tests/  agent_activity.rs
```

## Delivery

Three pull requests: etalii.adp (DISL 0.11, the ATD amendment, the description), then etalii.adp.ide.desktop on branch `features/087-aad-folds-and-filters` vendoring that merge, then the tasks ticked in etalii.adp once it merges.
