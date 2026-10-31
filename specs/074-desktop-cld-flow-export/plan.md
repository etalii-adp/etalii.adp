# Implementation Plan: Export a Causal Loop Diagram as an Animated Flow Page from the Desktop Host

**Branch**: the specification on `claude/project-thread-mevaun` in `etalii.adp`; the code on one `features/074-<part>` branch per pull request, in the four repositories below | **Date**: 2026-10-31 | **Spec**: [desktop-cld-flow-export.spec.md](desktop-cld-flow-export.spec.md)

**Input**: the feature specification as amended on 2026-10-31; the causal loop diagram's definition (`definitions/diagrams/causal-loop-diagram.*`, `specifications/fbl/causal-loop-diagram.fbl`) at `etalii.adp` `develop`; the desktop host at `develop` `54324c6`; the standalone host at `develop` `923ad60`; the hand-made prototype the maintainer accepted on 2026-10-30, kept in the project's shared files as `mental-health-cld/mental-health-cld-flows.html` and outside every repository.

## Summary

Three things are built, in this order, because each needs the one before it.

1. **The flow properties** (User Story 8, FR-025 to FR-031). The causal loop diagram's definition gains seven diagram attributes and two variable attributes. The `.cld` binding gains two statements, `title` and `flow`, and two words in a variable's tail, `start=` and `push=`. A link's existing `weight=` becomes its starting strength. The standalone host and the desktop host read and write the result, record the same bytes, and show the diagram's own properties in their property panels when nothing is selected.
2. **The export** (User Stories 1 to 7, FR-001 to FR-024). The desktop host's causal loop diagram module gains a flow-page generator. It takes the open diagram and writes one self-contained HTML file built from a template held in the module, with the diagram's data embedded as JSON. The ribbon gains an export command that the module offers through a new, tool-neutral hook. The page is written beside the `.cld` as `FILENAME {yyyy-mm-dd hh.mm}.html` and opened with the platform's own opener.
3. **The website** (User Story 9, FR-032 to FR-034). A screenshot of the mental health example's flow page goes into the standalone host's `docs/screenshots/`, because the site takes the causal loop diagram's pictures from there. Its capability text goes into the site's `screenshot-notes.json`, through the screenshots refresh procedure.

## Technical Context

**Language/Version**: Rust (desktop host, toolchain pinned by `rust-toolchain.toml`, edition 2024); C# on .NET 10 and TypeScript (standalone host); JSON (DISL, FBL), ATD text (spec 035); the flow page is HTML, CSS and JavaScript (ES2020) inside one file.

**Primary Dependencies**: the desktop host's own (`eframe`/`egui`, `serde_json`, `adp-disl`, `adp-diagram`, `adp-fbl`). No crate is added: opening the page uses the platform's opener through `std::process::Command` (R4). The flow page uses no library at all.

**Storage**: the `.cld` and its registration (`.adp`), which this feature changes only through the binding; the flow page beside the `.cld`.

**Testing**: `cargo test --workspace` (desktop), with the generator tested headless: the page's embedded data checked against the model, byte-identical output for the same input, and the escaping of markup. The page's behaviour is tested by a headless browser run in the desktop host's `Build` workflow (R6). Parity goldens for every flow-property edit are recorded from the standalone host (desktop Principle IV). In etalii.adp, `validate-examples.py` runs over the new fixtures and examples. In the standalone host, its four gates run.

**Target Platform**: the desktop host on Windows, macOS and Linux; the flow page in the current Chromium, Firefox and Safari, offline.

**Project Type**: a definition change (etalii.adp), a desktop application feature (etalii.adp.ide.desktop), a parity update (etalii.adp.ide.standalone) and a content refresh (etalii.adp.site).

**Performance Goals**: SC-001, under two seconds from the press to a moving page for 100 variables; SC-003, 30 frames a second or more for 200 variables and 600 links.

**Constraints**: the page fetches nothing (FR-009) and is byte-identical for the same input (FR-010). The export never changes the `.cld` or its registration (FR-003). A file without flow properties round-trips byte-identical (FR-029). The core crates never depend on egui (desktop Principle III).

**Scale/Scope**: one definition, one binding, two ATD files, about 6 new FBL fixtures; in the desktop host one generator module (about 300 lines of Rust and a 40 KB template), one module hook and one ribbon command, plus the property panel's diagram section; in the standalone host the definition copies, the diagram's property section and goldens; one screenshot.

## Constitution Check

*Gate: passed before research, and re-read after the design files were written.*

### The etalii.adp constitution (1.10.0)

| Principle | Assessment |
|---|---|
| I. One Source of Truth | Pass. The flow properties are stated once, in the definition, and every host takes them from there. The page reads the diagram the host holds and has no second copy of the definition. |
| II. Implementable from the Document Alone | Pass. [contracts/cld-flow-statements.md](contracts/cld-flow-statements.md) gives the statements byte for byte, and [contracts/flow-page.md](contracts/flow-page.md) gives the page's data and behaviour. |
| III. Precise Normative Language | Pass. The definition's new doc text uses the key words, as its neighbours do. |
| IV. Versioned Specifications | Pass. No language changes version. The definition's `language.version` takes a minor step, because the change adds attributes and statements and an older file stays valid. |
| V. Simplicity | Pass. Two statements and two words, no new FBL or DISL construct (R1, R2), and no new crate. |
| VI. No Rider warnings in C# | Pass. The standalone change keeps its gates. |

### The desktop host's principles (1.0.0)

| Principle | Assessment |
|---|---|
| I. Native Platform Citizenship | Pass, with a reading recorded. The host needs no browser to run or to export: the page is an output that the platform's opener hands to the person's own program (FR-024, R4). The button is exposed to AccessKit. |
| II. The Text File Is the Source of Truth | Pass. Flow-property edits are FBL splices with standalone goldens (T020 to T024), and the export writes nothing into the `.cld` or `.adp`. |
| III. One Frame, Many Tools | Pass. The ribbon learns of the export through a tool-neutral `DiagramModule::exports` hook (R3) and names no tool type. The diagram's property section is generic, for every tool type with diagram attributes. |
| IV. Test-First | Pass. Every task below writes its test first and sees it fail. |
| V. Simplicity | Pass. No crate is added; the template is one file held with `include_str!`. |
| VI. No Clippy Warnings | Pass by the `Build` workflow. |

### The standalone host's principles

Pass. The standalone host takes the definition's new copy and shows the diagram's properties. Its copies under `src/diagrams/causal-loop-diagram/definition/` and the backend's `causal-loop-diagram.fbl` change only by being synced.

## Project Structure

### Documentation (this feature)

```text
specs/074-desktop-cld-flow-export/
├── desktop-cld-flow-export.spec.md
├── plan.md               # this file
├── research.md           # R1–R8
├── data-model.md         # the flow properties and the page's data
├── quickstart.md         # how to check the feature end to end
├── contracts/
│   ├── cld-flow-statements.md   # the .cld statements, byte for byte
│   └── flow-page.md             # the page: its data, model, controls and name
├── checklists/requirements.md
└── tasks.md
```

### Source Code

```text
etalii.adp/
├── definitions/diagrams/causal-loop-diagram.dis        # metamodel.diagram attributes, Variable start/push, typeMap, doc
├── definitions/diagrams/causal-loop-diagram.md         # "simulates nothing" reworded; the flow properties
├── definitions/diagrams/causal-loop-diagram.atd        # the same in ATD (spec 039)
├── definitions/diagrams/causal-loop-diagram.cld.atd    # the binding's statements in ATD
├── definitions/diagrams/causal-loop-diagram.trace.json # regenerated as spec 035 says
├── specifications/fbl/causal-loop-diagram.fbl          # title and flow rules; start= and push=
└── specifications/fbl/fixtures/causal-loop-flow-*/     # read, edit, default-removal and unread fixtures

etalii.adp.ide.standalone/
├── src/diagrams/causal-loop-diagram/definition/        # synced .dis and .md
├── src/diagrams/causal-loop-diagram/backend/…/causal-loop-diagram.fbl   # synced
├── src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/causal-loop-diagram.fbl  # synced
├── the diagram's property section (R5)
└── docs/screenshots/causal-loop-flow-page.png + readme.md row

etalii.adp.ide.desktop/
├── vendor/etalii.adp/ + vendor/etalii.adp.lock          # synced by tools/sync-etalii-adp.py
├── crates/adp-diagram/src/module.rs                     # DiagramModule::exports, Export
├── crates/adp-shell/src/ribbon.rs, shell.rs             # Command::Export, the button, the status
├── crates/adp-shell/src/properties/mod.rs               # the diagram's section when nothing is selected
├── crates/adp-shell/src/platform_open.rs                # the platform's opener
├── modules/diagrams/causal-loop-diagram/src/flow_page.rs     # the generator
├── modules/diagrams/causal-loop-diagram/src/flow_page.html   # the template
├── modules/diagrams/causal-loop-diagram/tests/flow_page.rs   # generator tests
├── tools/flow-page-check/                                # headless browser check of a generated page (R6)
└── parity/inventory.md, scripts/, goldens/, walks.md     # the rows, scripts and walks of this feature

etalii.adp.site/
└── src/content/catalogue/screenshot-notes.json          # whyItMatters of the new screenshot, in the refresh PR
```

**Structure Decision**: the generator lives in the causal loop diagram's own module crate, because it knows that tool type's model and nothing else needs it. The shell gains only tool-neutral parts: the export hook, a ribbon command, the opener and the diagram property section.

## Pull requests

| # | Repository | Branch | Holds | After |
|---|---|---|---|---|
| A | etalii.adp | `features/074-cld-flow-properties` | definition, binding, ATD, fixtures, example | — |
| S | etalii.adp.ide.standalone | `features/074-cld-flow-properties` | synced copies, diagram property section, goldens recorded for the desktop host | A |
| D1 | etalii.adp.ide.desktop | `features/074-cld-flow-properties` | vendor sync, diagram property section, parity scripts and goldens | A, S |
| D2 | etalii.adp.ide.desktop | `features/074-flow-page-generator` | generator, template, its tests and headless check | D1 |
| D3 | etalii.adp.ide.desktop | `features/074-flow-page-export` | export hook, ribbon button, opener, status, inventory, walks | D2 |
| W1 | etalii.adp.ide.standalone | `features/074-flow-page-screenshot` | screenshot and its readme row | D3 |
| W2 | etalii.adp.site | `refresh/screenshots` | screenshots refresh, with the note's text | W1 |
| W3 | etalii.adp.site | `features/074-flow-pages-on-site` | the published flow pages, the documentation page listing them, the tool page's link (User Story 10) | D3, W2 |
| T | etalii.adp | `features/074-ticks` | ticks of the merged tasks, status Implemented | each merge, batched |

Every pull request enables auto-merge with a merge commit when it is opened. Its description links this folder and names the etalii.adp commit its tasks were taken from.

## Complexity Tracking

| Deviation | Why needed | Simpler alternative rejected because |
|---|---|---|
| A headless browser runs in the desktop host's CI (R6) | The page's behaviour (dots, delays, heat, controls) is JavaScript and cannot be tested by `cargo test` | Testing only the embedded JSON would leave every user story's animation unverified, and SC-003 unmeasured |
| The standalone host changes for a desktop-only export | The flow properties are in the definition by the maintainer's choice, and desktop Principle II needs standalone goldens for their edits | Desktop-only properties were offered and declined on 2026-10-31 |
