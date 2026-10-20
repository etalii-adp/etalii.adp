# Contract: Parity Inventory, Edit Scripts and Goldens

What FR-010, FR-032, SC-002 and SC-004 are checked against. All three live in `etalii.adp.ide.desktop/parity/`.

## The inventory: `parity/inventory.md`

One Markdown table, one row per capability or tool type of the standalone host at `8b6ccfc`:

| Column | Content |
|---|---|
| `Id` | `P-NNN`, never reused |
| `Capability` | What a person does, in the spec's words, or a tool type's display name |
| `Standalone source` | The spec-workflow specification (`.spec-workflow/specs/<name>` or an approval snapshot's name), else the file or test that defines it |
| `Increment` | 1 to 6, as the plan numbers them |
| `Check` | The test that proves it, or `walk: <story>/<step>` for a manual check recorded in `parity/walks.md` |
| `State` | `planned`, `built` or `checked` |

The first task fills it from the standalone host's catalogue (`docs/tools.md`), its shell components and the specifications listed in the plan. SC-002 holds when every row is `checked`. A difference found between the standalone host's behaviour and its specification is a row note, and the behaviour wins (spec, Assumptions).

## Edit scripts: `parity/scripts/<tool>/<name>.json`

```json
{
  "tool": "freeplane/mindmap",
  "fixture": "examples/mindmap/ideas.mm",
  "registration": "examples/mindmap/.adp",
  "steps": [
    { "select": ["ID_1"] },
    { "action": "diagram.add-child", "args": {} },
    { "property": { "row": "Text", "value": "New idea" } },
    { "move": { "refs": ["ID_7"], "dx": 40, "dy": 0 } },
    { "undo": 1 },
    { "redo": 1 },
    { "save": true }
  ]
}
```

At least 20 edits per tool type with a body that can change (SC-004); read-only tool types have open-and-save scripts only. A step names actions by the standalone host's action ids.

## Goldens: `parity/goldens/<tool>/<name>/`

The bytes of every file the script changed after its last step, as the standalone host wrote them, plus `recorded.json` with the standalone commit, the recorder version and the time. Byte-compared files are marked `-text` in `.gitattributes`.

## The recorder: `parity/recorder/`

A small .NET console program that starts the standalone host's backend at the reference commit in a temporary folder, signs in with the developer session, and replays a script through the gRPC API (`Select`, `ExecuteAction`, `SetProperty`, `MoveElement`, `SaveText`). It is the only .NET code in the repository, is not part of the desktop host's build or release, and runs only when goldens are recorded again, by hand or by a manual workflow.

## The check

`cargo test -p adp-parity` replays every script in the desktop core, headless, and compares every written file with its golden byte for byte. A mismatch prints the first differing offset and both lines.
