# Implementation Plan: The Hierarchical Requirement Designer in the Desktop Host

**Branch**: `features/036-desktop-hierarchical-requirement` in `etalii.adp`; in `etalii.adp.ide.desktop`, one `features/036-<pull request>` branch per pull request | **Date**: 2026-10-25 | **Spec**: [desktop-hierarchical-requirement.spec.md](desktop-hierarchical-requirement.spec.md)

**Input**: the feature specification; the definition `definitions/designers/hierarchical-requirement.*` at `etalii.adp` `develop` (DESL 0.2 with the `widths` role and the `@` state prefix of pull request 508); the standalone host at its `develop` commit [`a7fdf03`](https://github.com/etalii-adp/etalii.adp.ide.standalone/tree/a7fdf039c204535e9fc3a14f456e6f5a36a685ce), which holds standalone pull requests 695, 696, 700, 702, 705 and 707; the desktop host at its `develop` commit `ae9c69f`.

**Scale note.** The standalone host's designer is about 3,000 lines of C# in its module, about 4,700 lines of TypeScript and CSS in its `hierarchySurface` library, and about 4,000 lines of FBL library changes since spec 030's reference commit, with 25 test files in the module and 12 beside the client library. In the desktop host it is a new FBL family, a new surface model in `adp-desl`, a new module crate, and a new view in `adp-shell`, in eleven pull requests. Two things to watch. Spec 035's work runs in the same repository on the maintainer's Mac and also touches `vendor/` and `adp-fbl`: each pull request here starts from a fresh `origin/develop` and never shares a branch with it. And `adp-shell/src/shell.rs` and `crates/adp-conformance/tests/standalone.rs` are touched by several pull requests here: never by two in work at once.

## Summary

The desktop host gains what the Hierarchical Requirement Designer rests on, then the designer, at parity with the standalone host at `a7fdf03`. `adp-fbl` learns the `bullets` family, declared registration blocks and the drift check before an edit, ported from the standalone host's `EtAlii.Adp.Specification.Fbl`, and the conformance run stops setting their 29 fixtures aside. `adp-core` lists the designer, and the shell opens a `.md` whose line 1 is the envelope in the designer, ahead of the Markdown editor and Agent Behavior Modelling. `adp-desl` gains the `hierarchy` surface's model and session contract, the standalone host's `HierarchySurfaceModel` and `IHierarchySurfaceSession` made host-neutral, as it holds the table's. A module crate, `modules/designers/hierarchical-requirement`, is the standalone module ported: the model, the body, every operation, the session. A view, `adp-shell/src/hierarchy/`, is the standalone `hierarchySurface` library drawn with egui in VS Code's colours and the maintainer's sizes. Parity is shown as spec 030 shows it: edit scripts recorded from the standalone host at `a7fdf03`, replayed byte for byte, inventory rows, and walks with screenshots beside the standalone host's.

## Technical Context

**Language/Version**: Rust at the toolchain `etalii.adp.ide.desktop/rust-toolchain.toml` pins, edition 2024. The parity recorder is C# on .NET 10, outside the Cargo workspace, as spec 030 left it.

**Primary Dependencies**: those the desktop host has: `eframe`/`egui` 0.37 with `wgpu` and AccessKit, `serde_json`, `notify`, `adp-cel`. One asset is added: the Material Design Icons glyphs the standalone host's designer uses (R7). No crate is added.

**Storage**: the requirement document (`.md`) and its optional registration (`.adp`) in the person's project folder, written only as the fixtures and the goldens state.

**Testing**: `cargo test --workspace`: unit tests in each crate, the module's tests ported from `EtAlii.Adp.Designer.HierarchicalRequirement.Tests`, the view's tests ported from the client library's Vitest tests where they test layout or behaviour (R9), the conformance run in `adp-conformance`, the parity replay in `adp-parity`. `cargo fmt --all --check`, `cargo clippy --workspace --all-targets -- -D warnings` and `python tools/sync-etalii-adp.py --check` on every pull request. Manual walks per user story in `parity/walks.md`, in both themes, beside the standalone host.

**Target Platform**: Windows, macOS and Linux, as the `Build` workflow runs. A new document is CRLF, as the binding's template is; an edit follows the file's own endings.

**Project Type**: desktop application (a Cargo workspace of core crates, modules and one shell crate).

**Performance Goals**: SC-005. A document of 100 items and 500 requirements opens within two seconds and shows an agent's change within two seconds; the NIST SP 800-53 example (2,616 entries) within four seconds, as the standalone host's guard holds it.

**Constraints**: opening never writes a file. Every byte written is the one a fixture or golden states. No `.des` interpreter: the module is written from the definition, as the Knowledge designer's was. The core crates never depend on egui (desktop Principle III).

**Scale/Scope**: one designer type; about 40 standalone source files to port, 37 test files to port or replace.

## Constitution Check

*Gate: passed before research, and re-read after the design files were written.*

### The etalii.adp constitution (1.9.0)

| Principle | Assessment |
|---|---|
| I. One source of truth | PASS. The desktop host implements FBL 0.7, DESL 0.2 and DED 0.2 as written and reads the vendored definition; the module is checked against it by a vocabulary test and the fixtures (R5). A difference from the standalone host is recorded in the parity inventory or raised in etalii.adp, never settled in the desktop host (spec, Out of Scope). |
| II. Implementable from the document alone | Not engaged: no specification document changes. |
| III. Precise normative language | Not engaged. |
| IV. Versioned specifications | PASS. The host states the FBL families and DESL surface kinds it supports and opens a later DED version read-only (029: FR-029 to FR-031). |
| V. Simplicity | PASS. No crate added, no `.des` interpreter, no delta protocol (R4), the table's tag and option-list widgets reused (R8), icons as one vendored font rather than a vector renderer (R7). |
| VI. No Rider warnings in C# | PASS. The only C# is the parity recorder's new replay file; it follows the recorder's existing `.csproj.DotSettings`. |
| Development Workflow | PASS. This folder reaches `develop` by pull request with a merge commit. Each desktop pull request names this folder and the `etalii.adp` commit its tasks came from; a task is ticked only when that pull request is merged. |

### The desktop host's principles (1.0.0)

| Principle | How this feature meets it |
|---|---|
| I. Native platform citizenship | Drawn with egui, nothing downloaded at run time; the icon font is vendored (R7). Every box, control, edge, list and field is an AccessKit node with role, name and state (FR-011, T055). Shortcuts use the platform's modifier. Colours are VS Code's; the maintainer's sizes stand where they are numbers (spec FR-008). |
| II. The text file is the source of truth | Every write is FBL splices or a declared-block write, as the fixtures state; opening writes nothing; the goldens recorded from the standalone host are the contract of every edit (FR-009, R3). |
| III. One frame, many tools | The surface's model and session live in `adp-desl`, its view in `adp-shell`, and nothing of the requirement designer in either (FR-012, R4); the module is one crate under `modules/designers/`. The router's envelope claim is generic (R6). |
| IV. Test-first, against real files and the standalone host | Every task writes its tests first and sees them fail; the module's tests are the standalone host's, ported; the fixtures and goldens are the standalone host's bytes. |
| V. Simplicity | No new crate dependency; each new crate (the module) has its reason here. |
| VI. No clippy warnings | `cargo clippy -- -D warnings` on every pull request. |

Re-checked after Phase 1: the contracts add no mechanism beyond those above.

## Project Structure

### Documentation (this feature)

```text
specs/036-desktop-hierarchical-requirement/
├── desktop-hierarchical-requirement.spec.md
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── hierarchy-surface.md   # the surface model and session between the module and the shell
│   └── parity-scripts.md      # the edit scripts and goldens of this designer
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (`etalii.adp.ide.desktop`)

```text
vendor/
├── etalii.adp/                      # refreshed to an etalii.adp commit with pull request 508 (R2)
└── etalii.adp.lock
crates/
├── adp-fbl/src/
│   ├── families/bullets/            # new: the bullets family, read and edit (R1)
│   ├── registration/blocks.rs       # new: declared registration blocks (FBL 0.7 section 8.1)
│   ├── registration/mod.rs          # the registration created by the first setting (section 8.4)
│   └── planning/                    # drift before an edit (section 7.2)
├── adp-conformance/tests/standalone.rs   # NOT_SUPPORTED loses the 29 fixtures
├── adp-core/src/catalogue.rs        # the designer listed; the envelope claim on .md (R6)
├── adp-add/src/lib.rs               # a new document from the template; an existing one added
├── adp-desl/src/hierarchy/          # new: the surface's model, gestures, outcomes and session (R4)
├── adp-shell/src/
│   ├── hierarchy/                   # new: the view (R8), one file per standalone component group
│   │   ├── mod.rs                   # the tab: HierarchyTab, page, trail, findings, conflict bar
│   │   ├── layout.rs                # levels that fit, column widths, box sizes, icon row or column
│   │   ├── box_view.rs              # one box: handle, collapse, number, title, labels, description, icons
│   │   ├── editing.rs               # add controls and keys, title and description fields, drag, delete
│   │   ├── notes.rs                 # the notes list
│   │   ├── labels.rs                # tag field, category badge, state dot, list editor
│   │   ├── references.rs            # the # lookup and reference boxes
│   │   ├── narrowing.rs             # the filter bar, its completion, sort, stored filters
│   │   └── tests.rs
│   ├── shell.rs                     # opens a requirement document as a HierarchyTab
│   ├── a11y.rs                      # the surface's accessibility nodes
│   └── assets/                      # the vendored icon font and its LICENSE (R7)
└── adp-parity/tests/parity.rs       # the designer's scripts
modules/designers/hierarchical-requirement/   # new crate adp-designer-hierarchical-requirement
├── Cargo.toml
├── src/                             # model, body, vocabulary, template, operations/, session, mapper, findings
└── tests/                           # ported from EtAlii.Adp.Designer.HierarchicalRequirement.Tests, and examples/
parity/
├── scripts/etalii/hierarchical-requirement/
├── fixtures/etalii/hierarchical-requirement/
├── goldens/etalii/hierarchical-requirement/   # recorded at a7fdf03 (R3)
├── recorder/Replay.Hierarchy.cs     # new: replays a script through HierarchySurface gestures
├── inventory.md                     # new rows P-071 onwards
└── walks.md                         # Story 1 to 7 walks of this feature
benches/                             # SC-005: open and outside-change timing
```

**Structure Decision**: the desktop host's existing split, as spec 030 set it: format and model work in core crates (`adp-fbl`, `adp-desl`, `adp-core`, `adp-add`), the designer type in one module crate, and all drawing in `adp-shell`, beside the table it mirrors.

## Pull requests

| PR | Content | Tasks |
|---|---|---|
| 1 | Vendor refresh, the recorder's per-script reference commit, the module crate | T001 to T004 |
| 2 | FBL: the bullets family | T005 to T008 |
| 3 | FBL: declared registration blocks, drift before an edit; the conformance run complete | T009 to T013, T019, T020 |
| 4 | `adp-desl::hierarchy`, the module's reading and session; the recorder's hierarchy replay | T014 to T018, T021 |
| 5 | Story 1: catalogue, envelope claim, the page of boxes (the MVP) | T022 to T030 |
| 6 | Story 2: two writers | T031 to T034 |
| 7 | Story 4: template, structure and text operations, editing in the view | T035 to T039 |
| 8 | Story 5: assessments and the notes list | T040 to T043 |
| 9 | Story 6: references, labels, filter, sort | T044 to T049 |
| 10 | Story 7: column widths and the walk of the maintainer's points | T050 to T054 |
| 11 | Accessibility, performance, context actions, inventory, walks | T055 to T060 |

## Complexity Tracking

| Item | Why needed | Simpler alternative rejected because |
|---|---|---|
| A second reference commit beside spec 030's `8b6ccfc` | This designer exists only after spec 029; its goldens must come from `a7fdf03` | Re-recording every golden at `a7fdf03` would make spec 030's parity a moving target and is not this feature's (R3) |
| A vendored icon font | 37 icons of the standalone host's designer; the desktop host so far paints its few icons by hand | Painting 37 icons by hand is more code than the font and drifts from the standalone host's shapes (R7) |
