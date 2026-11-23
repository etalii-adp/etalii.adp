# Implementation Plan: Validating the Editors' Descriptions

**Branch**: `features/083-atd-editors-validation` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: the specification, approved by Peter on 2026-11-23 ("Approve both" on the project's decision card for specs 083 and 087).

## Summary

`atd validate` gains a second runner beside the diagrams': for an editor's description it opens each case's document with the description's `open` settings, reads the outline through its outline binding, runs each `check with <source>` through the source of that name that the host contributes, and compares the refusal, the outline and the findings with the case's. The desktop host's editors already hold the sources (`modules/editors/json`, `xml`, `yaml`, `markdown`); as the T125 ruling has modules contribute capabilities, each editor module contributes its checks as named check sources assembled by `adp_shell::capabilities()`, and the runner looks them up by name. No case changes and no source is added.

## Technical Context

- **What changes in etalii.adp.ide.desktop**: `crates/adp-atd-runtime/src/capabilities/` (a `CheckSource` extension point beside layouts, readers and renderers), `crates/adp-atd-validate/src/` (an `editor` runner: `cases.rs` stops refusing editors, a new `editor.rs`), `modules/editors/{json,xml,yaml}/src/` (each contributes its sources), `crates/adp-shell/src/lib.rs` (assembles them), `crates/adp-atd-lsp` (the WebAssembly `atd/validate` carries the same sources, FR-008), and a test per editor under `crates/adp-shell/tests/`.
- **What changes in etalii.adp**: nothing, unless validation shows a description to correct (SC-002); then the description, in its own pull request.
- **What checks it**: `cargo test --workspace`, `atd validate` on the five descriptions natively and through WebAssembly (the Build's `atd` job), `atd record --check`.
- **Article**: `cases.rs`'s message "A editor's" becomes "An editor's" through one helper for every kind (FR-009).

## Research

- **R1, where the sources live**: in the editor modules, contributed as capabilities (Peter's T125 ruling, 2026-11-21), not moved into the runtime; the runtime defines only the extension point and its result shape: findings with severity, line, column and message.
- **R2, settings**: a source receives its `check with` block as JSON and applies `breaks`, `duplicateKey`, `refused`, `largestCheckedCharacters` and `read` itself, since they are the source's settings (ATD §10.2).
- **R3, project reads**: a source that reads from the project (`read: project`) is handed the case's files as an in-memory file set, the same `Files` the diagrams' folder subjects use; nothing on disk is opened (FR-006, FR-007).
- **R4, the outline**: read through the binding's `family capability reader.markdown`, already registered (spec 035, T125).
- **R5, WebAssembly**: the sources are pure Rust over bytes, so the WebAssembly build links them as the native one does; libxml2-backed XSD and DTD checks are the exception to measure first, and if they cannot build for WebAssembly the native and WebAssembly results are compared on the cases that do not need them, the gap listed by name.

## Constitution Check

Checked against etalii.adp's `.specify/memory/constitution.md` and the desktop's repository principles (`.specify/memory/repositories/etalii.adp.ide.desktop.md`).

| Principle | Assessment |
|---|---|
| I. One source of truth | PASS. The cases stay the reference; the sources are the host's own editors'. |
| II. Implementable from the document alone | PASS. ATD §10 states the settings; the runner reads nothing else. |
| III. Precise normative language | PASS. No language change. |
| IV. Versioned specifications | PASS. No version changes. |
| V. Simplicity | PASS. One extension point, filled by the code that exists. |
| VI. No JetBrains Rider warnings in C# | PASS. No C#. |
| Desktop: no browser or listener at run time; tests first; no clippy warnings | PASS. Every task writes its test first. |

## Project Structure

```text
etalii.adp.ide.desktop/crates/adp-atd-runtime/src/capabilities/check_source.rs   (new)
etalii.adp.ide.desktop/crates/adp-atd-validate/src/editor.rs                     (new)
etalii.adp.ide.desktop/crates/adp-atd-validate/src/cases.rs
etalii.adp.ide.desktop/modules/editors/{json,xml,yaml}/src/capabilities.rs       (new)
etalii.adp.ide.desktop/crates/adp-shell/src/lib.rs
etalii.adp.ide.desktop/crates/adp-shell/tests/editors.rs                         (new)
```

## Delivery

One desktop pull request on `features/083-atd-editors-validation`, then the tasks ticked here; a second etalii.adp pull request only where a description is corrected.
