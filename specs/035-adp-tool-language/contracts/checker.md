# Contract: the `atd` command line

The `atd` binary built from `etalii.adp.ide.desktop/crates/adp-atd-cli`. The Build workflows of etalii.adp and the desktop host, the quickstart and agents (FR-091) use it. Research R8, R19, R20.

## Commands

| Command | Does | Output | Exit code |
|---|---|---|---|
| `atd check <path>…` | Checks every description whose root or part is in the paths (folders are searched for `*.atd`) | findings as text, one per line: `file:line:column: severity CODE: message` | 0 no error finding, 1 an error finding, 2 a usage or I/O error |
| `atd check --json <path>…` | Same | `$defs/Findings` as JSON on stdout | as above |
| `atd check --expect <findings.json> <file>` | Checks one file and compares with the expected findings (code, severity, line, column; message ignored) | the differences | 0 equal, 1 different |
| `atd check --corpus <dir>` | `--expect` for every `<name>.atd` with a `<name>.findings.json` beside it | a summary and the differences | 0 all equal |
| `atd check --trace <trace.json>` | Checks a trace against its description and companion (data-model.md §10) | findings | 0 / 1 |
| `atd fmt [--check] <path>…` | Rewrites files in the canonical layout; with `--check`, lists files that would change | the changed files | 0, or 1 with `--check` when one would change; a file that does not parse is left unchanged with a finding (spec edge case) |
| `atd tree <file>` | Prints the abstract tree | `$defs/Tree` as JSON | 0 / 1 |
| `atd tables [--grammar <file.lark>]` | Prints the normalized parse tables of the language, or of a grammar in ATD grammar notation | `$defs/ParseTables` | 0 / 1 (conflicts listed) |
| `atd validate <root.atd> [--case <name>]` | Runs the description's conformance cases (R17) on working copies | the differences, each at a construct | 0 all pass, 1 a difference |
| `atd record <origin> --cases <dir>` | Records a type's conformance cases from the desktop host's current module (R17) | writes `conformance.json` files | 0 / 1 |
| `atd new --kind <kind> --origin <vendor/type> --name <name> [--out <dir>]` | Writes a new description from the core's template; it checks clean (FR-060) | the file path | 0 / 1 |

Common options: `--spec-dir <dir>` (the `specifications/atd/` to read the grammar and schema from; default the one compiled in), `--version` (prints the tool's version and the ATD versions it reads).

## Guarantees

- `check`, `tree`, `fmt` and `tables` never write outside the files named, and `validate` and `record` write only to a temporary working directory and, for `record`, to `--cases`.
- The findings of `atd check` for a text equal the diagnostics the language servers publish for it (FR-054): both call `adp-atd-check` with the same input.
- `atd fmt` run twice changes nothing the second time (FR-032).
- The order of findings is stable: by file, position, code.

## Example

```text
$ atd check definitions/designers/knowledge.atd
definitions/designers/knowledge.atd:41:7: error ATD3001: A designer has no relation types; `relation Broader` is admitted in diagrams only.
definitions/designers/knowledge.atd:57:22: error ATD2001: No attribute `broder` in element type `Concept`. Did you mean `broader`?
```

```json
{"findings":[{"code":"ATD2001","severity":"error","file":"definitions/designers/knowledge.atd","line":57,"column":22,"endLine":57,"endColumn":28,"message":"No attribute `broder` in element type `Concept`.","suggestions":["broader"],"fixes":[{"title":"Change to `broader`","edits":[{"file":"definitions/designers/knowledge.atd","start":1873,"end":1879,"text":"broader"}]}]}]}
```
