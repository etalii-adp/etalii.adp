# Contract: the ATD language server

One server core, `etalii.adp.ide.desktop/crates/adp-atd-lsp`, behind three transports. Research R9, R10, R12, R22.

## Transports and artifacts

| Host | Artifact | How it runs | Where it comes from |
|---|---|---|---|
| Desktop | linked into `adp-desktop` | worker thread, `lsp-server` memory connection | the workspace |
| VS Code | `atd-lsp.wasm` and its `wasm-bindgen` glue | Node worker thread in the extension host; `vscode-languageclient` over in-process message transports | release `atd-v<version>` of etalii.adp.ide.desktop, pinned in `etalii.adp.ide.vscode/vendor/atd-lsp.lock` (version, file names, SHA-256), fetched by `npm run fetch-atd-lsp` at build time; `.vscodeignore` ships it |
| IntelliJ | `atd-lsp` for windows-x64, macos-arm64, linux-x64 | the platform LSP API (`LspServerSupportProvider`, `ProjectWideLspServerDescriptor`), stdio | the same release, pinned in `etalii.adp.ide.intellij/atd-lsp.lock`, fetched by a Gradle task at build time and packed into the plug-in's `bin/` |

No artifact is downloaded at run time in any host.

## Server capabilities (FR-051)

| LSP | What it does for `.atd` |
|---|---|
| `textDocument/publishDiagnostics` | the checker's findings for every file of the description, on open, change (debounced to 150 ms) and save; code and fixes carried in `data` |
| `textDocument/semanticTokens/full` and `/range` | token types: `keyword`, `type` (element types), `property` (attributes), `function` (script functions, CEL functions), `variable`, `parameter`, `string`, `number`, `comment`, `operator`, `namespace` (origins, imports), `enumMember`, `macro` (capabilities); modifiers `declaration`, `readonly`, `documentation` |
| `textDocument/completion` | from the parser state at the cursor: the keywords the grammar admits there and the kind allows, and the names of the right namespace (story 3 scenario 1: in a binding rule's attribute position, the attributes of the element type it produces); CEL members after `.` by the type of the receiver |
| `textDocument/definition`, `textDocument/references` | across all files of the description; CEL identifiers that resolve to the description's names included |
| `textDocument/prepareRename`, `textDocument/rename` | a `WorkspaceEdit` over all files of the description; uses in CEL renamed, string contents not (spec edge case); the edit is a set of splices (FR-033) |
| `textDocument/hover` | the construct's documentation from the ATD document's Appendix B entry, and the declaration's `///` documentation and type |
| `textDocument/formatting` | the canonical layout as one edit; none when the file does not parse |
| `textDocument/documentSymbol` | the outline: tool, model, element types, surface, bindings, functions |
| `textDocument/codeAction` | the findings' fixes as quick fixes |
| `textDocument/documentHighlight` | the uses of the name under the cursor in the file |
| `textDocument/foldingRange` | blocks and comments |

## Custom requests

| Method | Params | Result |
|---|---|---|
| `atd/newDescription` | `{kind, origin, name}` | `{text}`: the template, which checks clean |
| `atd/check` | `{uri}` (any file of a description) | `$defs/Findings` of the whole description |
| `atd/validate` | `{root: uri, cases: [{name, files: {path: base64}}]}` | `{cases: [{name, passed, differences: [{step, part, expected, actual, at: {uri, range}}]}]}` |
| `atd/tree` | `{uri}` | `$defs/Tree` |

## Behaviour

- A file with syntax errors keeps every capability above in the parts that parse (FR-053).
- The same text gives the same diagnostics in every host (FR-054); the core's test drives the 30-edit walk of SC-005 and asserts the results, and each IDE's tests drive the walk through the IDE's own API.
- Performance (SC-006): on a 5,000-line description, diagnostics within 1 s of a keystroke and completion within 0.5 s, measured in the core's benchmark (native) and in VS Code's test (WebAssembly); the parse is incremental per file and the check per description.
