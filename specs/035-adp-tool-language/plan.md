# Implementation Plan: One Language for Every Tool Type

**Branch**: `features/035-adp-tool-language-plan` (planning); the implementation's branches are named `features/035-adp-tool-language` in each repository it touches, with a suffix for a later stage in a repository that has more than one (research R24) | **Date**: 2026-10-23 | **Spec**: [adp-tool-language.spec.md](adp-tool-language.spec.md)

**Input**: the specification, merged with its four clarifications at `3ef1872` (pull request #450), planned at the maintainer's request of 2026-10-23 (`/speckit-plan`).

## Summary

ATD, the ADP tool language, becomes a specification of this repository in `specifications/atd/`: one grammar in a stated subset of Lark notation, in modules (core, CEL, script, canvas, form, text, binding, notation) that build one strict LALR(1) table; soft keywords under a contextual lexer; one rule for values (literal, `( CEL )`, `@attribute`, `$token`, `#param`); settings as `key: value` checked against the schemas DISL, DESL and FBL already have; a bounded, deterministic script with CEL expressions and the action set as statements; capabilities with contracts and fixtures; and a JSON Schema of the parsed tree (research R2 to R7, R13, R14). The language is implemented once, in Rust, as crates of the desktop host: parser, checker, formatter, script, runtime, validation, language server and the `atd` command line (R8, R9). The same language server core runs in process in the desktop host, as WebAssembly in VS Code, and as a native binary under IntelliJ's platform LSP API (R10). The desktop host's validation runtime lowers a checked description onto the engines it already has (`adp-disl`, `adp-desl`, `adp-fbl`, `adp-scene`, `adp-diagram`) and replays conformance fixtures whose bytes come from the standalone host's goldens and whose readings and drawings are recorded from the desktop host (R16, R17); a debugger works on that runtime (R21). VS Code gets the `.atd` language, a command to create a tool description, and the same validation through the same core (R22). 36 tool descriptions (29 diagram, 2 designer, 5 editor types) are written with traces to their companions and host code (R1, R18). FBL 0.9 gains a grammar family, first used for the W3C RDF type's Turtle (R15). No `.dis`, `.des` or `.fbl` changes, and no host loads a tool from `.atd` (FR-031).

## Technical Context

- **What changes in etalii.adp**: `docs/terminology.md` (six terms, R23); `.specify/memory/constitution.md` (1.8.0, R23); new `specifications/atd/` (document, `grammar/`, `atd.schema.json`, examples, `refused/`, `capabilities/`, `highlighting/`, `ATD-guide.md`); `specifications/fbl/FBL-specification.md` and `fbl.schema.json` (0.9, the grammar family); `specifications/edsl/EDSL-specification.md` (the placeholder points at ATD's text surface); `definitions/{diagrams,designers,editors}/*.atd`, `*.trace.json`, `conformance/`; `.github/scripts/atd-grammar.py`, `requirements-atd.txt`, `validate-examples.py` (trees, traces, fixtures), `.github/workflows/build.yml` (jobs `grammar` and `descriptions`), `.gitattributes` (fixture inputs `-text`). Python 3.13; `lark`, `interegular`, `llguidance`, `jsonschema`, `pyyaml`.
- **What changes in etalii.adp.ide.desktop**: new crates `adp-atd-grammar`, `adp-atd-syntax`, `adp-atd-check`, `adp-atd-format`, `adp-atd-script`, `adp-atd-runtime`, `adp-atd-validate`, `adp-atd-lsp`, `adp-atd-cli` (R9); generic extension points in `adp-disl`, `adp-desl`, `adp-fbl` and `adp-diagram` for script functions and capabilities (R16); the capability registry filled from module code (R14); `adp-shell`: an LSP client for `.atd` in the text editor, the validation view, hot reload, the debugger panel, and a recording painter for `atd record` (R10, R17, R21); `vendor/etalii.adp/` through `tools/sync-etalii-adp.py`; `.github/workflows/build.yml` (the WebAssembly build, the `atd-v<version>` release of `atd`, `atd-lsp` and `atd-lsp.wasm`, a `cargo deny` licence check over the shipped crates); `parity/inventory.md` rows for validation and the debugger. Rust stable, edition 2024; new dependencies `etalii-lark`, `etalii-lark-derive`, `lsp-types`, `lsp-server`, `wasm-bindgen` (R9; `etalii-lark` by the amendment of 2026-10-24). Gates: `cargo fmt --all --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test --workspace`, `python tools/sync-etalii-adp.py --check`.
- **What changes in etalii.adp.ide.vscode**: `package.json` (language `atd`, grammar, three commands, `vscode-languageclient`), `language/atd.language-configuration.json`, `syntaxes/atd.tmLanguage.json` (vendored, with provenance), `src/extension/atd/` (client, worker, commands), `vendor/atd-lsp.lock` and `scripts/fetch-atd-lsp.mjs`, `test/vscode/atd.test.ts`, a unit test for the TextMate grammar against the vendored examples, `docs/` entry. TypeScript, esbuild, vitest, `@vscode/test-electron`. Gates: `npm run check`, `npm run test:unit`, `npm run test:vscode`.
- **What changes in etalii.adp.ide.intellij**: a new module `atd` (file type, `LspServerSupportProvider`, the binary's launch), its `plugin.xml` fragment behind `<depends optional="true" config-file="adp-atd.xml">com.intellij.modules.lsp</depends>`, `atd-lsp.lock` and a Gradle task that fetches and packs the binaries, an integration test of the walk. Java 25, IntelliJ Platform 2026.2.3. Gates: `./gradlew build`, `integrationTest`, `verifyPlugin`, `verifyDependencyLicences`.
- **Not changed**: etalii.adp.ide.standalone, etalii.adp.ide.notion, etalii.adp.ide.eclipse, etalii.adp.site; every `.dis`, `.des`, `.fbl`, `.did`, `.ded`; every host's tool loading (SC-002).
- **Performance goals**: diagnostics within 1 s of a keystroke and completion within 0.5 s on a 5,000-line description (SC-006), in every transport.
- **Scale**: 9 grammar modules, about 250 keywords; 36 descriptions; 13 diagram modules and one designer module whose hand-written behaviour moves into descriptions, scripts and capabilities (R16).
- **Unknowns**: none; every choice is in [research.md](research.md). The research document the specification cites is not in a repository and is taken as the specification summarises it (R1).

## Constitution Check

| Principle | How this feature meets it |
|---|---|
| I. One source of truth | ATD is specified here first; every host's language support is one implementation, so no host defines a variant (R8). Settings reuse DISL's, DESL's and FBL's `$defs`, terminals reuse FBL's regex subset, and the grammar family is FBL's (FBL 0.9), not ATD's alone (R4, R7, R15). |
| II. Implementable from the document alone | `ATD-specification.md`, the grammar, `atd.schema.json` and the examples come in one pull request; the refused corpus with its expected findings is the contract any checker must meet, so the single Rust implementation is not the specification (R8). A grammar beside the schema is new; constitution 1.8.0 names its place (R23). |
| III. Precise normative language | RFC 2119 key words in bold capitals; informative sections marked; one schema file with `$defs` per structure; every expression is CEL, parsed as part of the grammar (R6). |
| IV. Versioned specifications | ATD 0.1 Working Draft; the version is the first construct; each released minor's grammar is kept and every description re-checked before a new one is released (R5); FBL goes to 0.9 for the family. |
| V. Simplicity | Each construct comes from a current tool type (the 36 in scope); each new dependency has its reason (R9, R10, R11); no DAP wire protocol (R21), no second checker (R8), no grammar per kind (R3). |
| VI. No Rider warnings in C# | No C# changes. |

Repositories with principles of their own:

| Repository | Principle | How the tasks meet it |
|---|---|---|
| `etalii.adp.ide.desktop` | I. Native, nothing else installed, no network listener, accessibility, VS Code's themes | The language server runs in process over a memory connection; the validation view and debugger use the theme and expose every control to accessibility; nothing is downloaded at run time. |
| | II. The text file is the source of truth | Validation works on working copies and never writes a person's files (FR-042); formatting and machine edits are splices (FR-033). |
| | III. One frame, many tools; a tool type's behaviour is its definition's | The `atd` crates depend on no toolkit; the runtime has no tool-specific code (FR-040); capabilities are generic and named by contract. A tool type's catalogue entry and module are untouched (FR-031). |
| | IV. Test-first, against real files and the standalone host | Conformance bytes are the standalone host's goldens; each crate's tests come first and fail first; the cross-check against Lark and the 30-edit walk are tests. |
| | V. Simplicity; VI. no clippy warnings | Each crate's reason is in R9; clippy is a gate of every task. |
| `etalii.adp.ide.vscode` | I. Native VS Code citizenship | `.atd` opens in VS Code's own text editor; findings are diagnostics; commands under "ADP" in the palette; the platform's dialogs. |
| | Constraints: one universal `.vsix`, nothing else installed, no network at run time, Apache-compatible dependencies | The language server is WebAssembly inside the `.vsix`, fetched at build time and pinned by SHA-256; `vscode-languageclient` is MIT (R10). |
| | III. `src/core` does not depend on VS Code; IV. tests in a real VS Code | The client lives in `src/extension/atd/`; `src/core` is untouched; the walk runs against the packaged plug-in. |
| `etalii.adp.ide.intellij` | I. Native platform citizenship; constraints: only the platform's common modules, Apache-compatible dependencies, no network at run time | The platform's own LSP API, through an optional dependency (complexity tracking); no new JVM library; the binaries are ours and fetched at build time. |
| | IV. Test-first, headless IDE tests | The walk runs as an integration test in a real IDE. |

`etalii.adp.ide.standalone` is not changed; its goldens, already vendored in the desktop host, are read, not re-recorded (R17).

Re-checked after Phase 1: the contracts add no host mechanism beyond those above; the data model's schema entries live in the one `atd.schema.json`.

## Project Structure

### Documentation (this feature)

```text
specs/035-adp-tool-language/
├── adp-tool-language.spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── grammar.md
│   ├── language-sketch.md
│   ├── checker.md
│   ├── language-server.md
│   ├── conformance.md
│   ├── capabilities.md
│   └── debugger.md
├── checklists/requirements.md
└── tasks.md                (next step)
```

### Source code

```text
etalii.adp/
├── docs/terminology.md
├── .specify/memory/constitution.md
├── specifications/atd/
│   ├── ATD-specification.md, ATD-guide.md
│   ├── atd.schema.json
│   ├── grammar/{atd,core,cel,script,canvas,form,text,binding,notation}.lark, atd.flat.lark
│   ├── highlighting/{atd.tmLanguage.json, atd.sublime-syntax}
│   ├── *.atd                               (examples)
│   ├── refused/{README.md, *.atd, *.findings.json}
│   └── capabilities/<name>/{contract.json, fixtures/}
├── specifications/fbl/                     (0.9: the grammar family)
├── specifications/edsl/EDSL-specification.md
├── definitions/{diagrams,designers,editors}/
│   ├── <name>.atd, <name>.<part>.atd, <name>.trace.json
│   └── conformance/<name>/<case>/
└── .github/{scripts/atd-grammar.py, scripts/requirements-atd.txt, scripts/validate-examples.py, workflows/build.yml}

etalii.adp.ide.desktop/
├── crates/adp-atd-{grammar,syntax,check,format,script,runtime,validate,lsp,cli}/
├── crates/adp-{disl,desl,fbl,diagram}/     (generic extension points)
├── crates/adp-shell/src/{atd_client.rs, validation/, debugger/, canvas/recording.rs}
├── vendor/etalii.adp/, vendor/etalii.adp.lock
├── deny.toml
└── .github/workflows/build.yml

etalii.adp.ide.vscode/
├── package.json, language/atd.language-configuration.json, syntaxes/atd.tmLanguage.json
├── src/extension/atd/{client.ts, worker.ts, commands.ts}
├── vendor/atd-lsp.lock, scripts/fetch-atd-lsp.mjs
└── test/{vscode/atd.test.ts, extension/atd-textmate.test.ts}

etalii.adp.ide.intellij/
├── atd/src/main/java/etalii/adp/atd/{AtdFileType.java, AtdLspServerSupportProvider.java, AtdServerBinary.java}
├── atd/src/main/resources/META-INF/adp-atd.xml
├── atd-lsp.lock
└── src/integrationTest/.../AtdLanguageIntegrationTest.java
```

**Structure decision**: the language is this repository's (Principle I), its one implementation is the desktop host's because that host is Rust and already has the engines (R8), and the other IDEs take that implementation as an artifact rather than as code (R10). The descriptions and their fixtures live beside the files they describe, so every host validates against one set (R17, R18).

## Delivery

In the order of research R24; each pull request names `specs/035-adp-tool-language/` here and the etalii.adp commit its tasks came from, and its tasks are ticked here only once it is merged.

1. etalii.adp: glossary, constitution 1.8.0, ATD 0.1 (document, grammar, schema, examples, refused corpus, generated files, the formats of conformance fixtures, traces and capability contracts with a worked example of each), the `grammar` job.
2. etalii.adp.ide.desktop: the toolchain crates, the cross-check with Lark, the shell's `.atd` language support, the `atd-v0.1.0` release with `atd`, `atd-lsp` and `atd-lsp.wasm`.
3. etalii.adp: the `descriptions` job.
4. etalii.adp.ide.vscode and etalii.adp.ide.intellij, in parallel: language support from `atd-v0.1.0`.
5. etalii.adp.ide.desktop: script, runtime, validation, capabilities, `atd record`, the validation view, hot reload, the debugger.
6. etalii.adp: the descriptions in batches (mind map; the five other DISL-driven types; the two designer types; the five editor types; the hand-written types by module), each with fixtures, traces and capability contracts; a construct a batch adds gets its checker support in an etalii.adp.ide.desktop pull request of the same branch name, merged first; etalii.adp.ide.vscode: *Validate Tool Description* after the first batch.
7. etalii.adp and etalii.adp.ide.desktop: the grammar family (FBL 0.9's text, schema and `.fbl` example together, Principle II) and the W3C RDF Turtle binding.
8. etalii.adp: the guide and the measured outcomes (SC-006 to SC-009).

## Complexity Tracking

| Deviation | Why needed | Simpler alternative rejected because |
|---|---|---|
| IntelliJ: an optional dependency on `com.intellij.modules.lsp`, beyond "only the platform's common modules" | FR-050 asks for a language server in IntelliJ, and the platform's LSP API is the platform's own mechanism for one; as an optional dependency the plug-in still installs and runs in every IDE, and only `.atd` support is absent where the module is (open-source IntelliJ IDEA builds, Android Studio) | LSP4IJ is EPL-2.0, rejected by the host's licence check, and a second plug-in to install; a hand-written PSI implementation in Java is a second checker (FR-054) |
| IntelliJ: bundled native binaries, the first process the plug-in starts | the platform's LSP API launches a server process; one implementation (R8) | running the WebAssembly build on Chicory adds a JVM dependency the platform does not bundle and risks SC-006 |
| VS Code: a WebAssembly module in the `.vsix`, where WebAssembly was refused before | one implementation of the checker (FR-054) in a universal package with nothing else installed | per-platform native binaries break "one `.vsix`" and cannot be tested by the Linux-only CI; a TypeScript port is a second checker |
| etalii.adp's Build builds a Rust binary from another repository | FR-100 asks this repository to check every `.atd`, and only the Rust checker checks the full static semantics | a pinned released binary would block every language change on a desktop release; a Python checker is a second implementation |
