# Contract: the copied definitions, their record and the command that copies them

**Feature**: [vscode-disl-fbl-tools.spec.md](../vscode-disl-fbl-tools.spec.md) | **Plan**: [plan.md](../plan.md) | **Research**: [R7](../research.md#r7-the-definitions-are-files-in-the-plug-in), [R15](../research.md#r15-tests-and-fixtures)

How a tool type's definition comes into the plug-in, how the copy is held to its source, and what adding or removing one takes (FR-001, FR-002, FR-005, FR-014, SC-005). Paths are in `etalii.adp.ide.vscode`. The shape follows `scripts/sync-fbl.mjs` here (spec 009, [contracts/corpus.md](../../009-vscode-fbl-implementation/contracts/corpus.md)) and `scripts/sync-specifications.mjs` in `etalii.adp.ide.notion`.

## Folders

```text
definitions/
├── gartner-hype-cycle-graph/
│   ├── gartner-hype-cycle-graph.dis
│   ├── gartner-hype-cycle-graph.fbl
│   ├── gartner-hype-cycle-graph.md
│   └── PROVENANCE.md
├── agent-behavior-modelling/
│   ├── agent-behavior-modelling.dis
│   ├── agent-behavior-modelling.fbl
│   ├── agent-behavior-modelling.md
│   └── PROVENANCE.md
├── mindmap/
│   ├── mindmap.dis
│   ├── mindmap.fbl
│   ├── mindmap.md
│   └── PROVENANCE.md
├── agent-activity-diagram/
│   ├── agent-activity-diagram.dis
│   ├── agent-activity-diagram.fbl
│   ├── agent-activity-diagram.md
│   └── PROVENANCE.md
└── knowledge/
    ├── knowledge.des
    ├── knowledge.fbl
    ├── knowledge.md
    └── PROVENANCE.md
```

- A folder is one tool type, named as its specification file is named without its extension.
- It holds the specification file (`.dis` or `.des`), the FBL binding and the companion `.md`, each unchanged, and `PROVENANCE.md`, which the script writes. Nothing else.
- Nothing under `definitions/` is edited in this repository. A correction goes to the repository the file came from and arrives with a newer copy.
- `.gitattributes` marks `definitions/**` as `-text`, so no line ending is converted.
- The folder ships in the package, and the extension reads it from its own install folder when it starts. Nothing is fetched at runtime.

## Where each file comes from

| Tool type | Specification, from `etalii.adp` | Binding | Binding's repository |
|---|---|---|---|
| Gartner hype cycle graph | `definitions/diagrams/gartner-hype-cycle-graph.dis` | `gartner-hype-cycle-graph.fbl#ghg` | `etalii.adp.ide.standalone` |
| Agent Behavior Modelling | `definitions/diagrams/agent-behavior-modelling.dis` | `agent-behavior-modelling.fbl#abm` | `etalii.adp.ide.standalone` |
| Mind map | `definitions/diagrams/mindmap.dis` | `mindmap.fbl#mindmap` | `etalii.adp.ide.standalone` |
| Agent activity diagram | `definitions/diagrams/agent-activity-diagram.dis` | `agent-activity-diagram.fbl#aad` | `etalii.adp` |
| Knowledge | `definitions/designers/knowledge.des` | `knowledge.fbl#yaml`, `knowledge.fbl#json`, `knowledge.fbl#xml` | `etalii.adp` |

The companion `.md` is the file of the specification's name beside it in `etalii.adp`.

The binding is the file the specification's `persistence.binding` (or each entry of `persistence.bindings`) points at:

- a relative reference is the file of that name beside the specification;
- a URL into `etalii.adp.ide.standalone` is that path in the sibling clone;
- a relative reference with no such file beside the specification (`agent-behavior-modelling.fbl#abm`, [research R14](../research.md#r14-what-is-raised-with-etaliiadp), item 3) is looked for by name in `etalii.adp.ide.standalone`, and the script says so when it copies.

At runtime a reference is resolved to the copied file of that name in the tool type's folder, whatever form it has in the specification.

## `PROVENANCE.md`

One per folder, written by the script, never by hand. It says the files are copied unchanged, names the two commands below, and holds one row per file:

| File | Repository | Path | Commit | SHA-256 |
|---|---|---|---|---|
| the file's name in the folder | `etalii.adp` or `etalii.adp.ide.standalone` | its path in that repository | the full commit it was read from | of the bytes copied, in lowercase hexadecimal |

The table is the record `--check` reads; its five columns and their order are fixed.

## `scripts/sync-definitions.mjs`

```text
node scripts/sync-definitions.mjs <path to etalii.adp> <path to etalii.adp.ide.standalone> [<etalii.adp ref>] [<standalone ref>]
node scripts/sync-definitions.mjs --check
npm run sync-definitions -- ../etalii.adp ../etalii.adp.ide.standalone
npm run sync-definitions -- --check
```

**Copying.**

- Both refs default to `origin/develop`. Each is resolved to a commit with `git rev-parse`, and that commit is what `PROVENANCE.md` records.
- Every file is read with `git show <commit>:<path>` as bytes and written as those bytes. The working trees of the two clones are never read.
- It refreshes every folder that exists under `definitions/`. A tool type is added by naming its specification's path in `etalii.adp` as a further argument, `--add definitions/diagrams/<name>.dis` or `--add definitions/designers/<name>.des`, and removed by deleting its folder and running the script.
- After copying it writes the manifest's contributions (below) and exits `0`. It exits `1`, having written nothing, when a file a specification names cannot be found.

**`--check`.**

- Reads no clone and writes nothing.
- Fails, exit `1`, naming every file concerned, when: a file under `definitions/` has a SHA-256 other than its `PROVENANCE.md` row's; a file is in a folder and not in its record, or in the record and not in the folder; or the contributions in `package.json` differ from what the copied definitions give.
- Exits `0` otherwise. The Build workflow runs it on every pull request (FR-002).

## The manifest's contributions

Visual Studio Code reads custom editors and commands from `package.json` only, so the script writes them from the copied definitions:

- `contributes.customEditors`: one entry per tool type and priority, as [tool-type.md](tool-type.md#custom-editors) states them;
- `contributes.commands`, and the `contributes.menus` entries that show them: `etalii.adp.new.<vendor>.<type>` and `etalii.adp.openAs.<vendor>.<type>`.

It owns the entries whose `viewType` or `command` carries a tool type's `<vendor>.<type>` and no other: `etalii.adp.registration` and the plug-in's own commands are left as they are. Entries are written in the order of the folders' names, so two runs on the same copies write the same file.

## Adding and removing a tool type

- **Adding** a tool type whose definition uses only what [the support record](support-record.md) lists is: run the script with `--add`, and commit `definitions/<tool>/` and `package.json`. No file under `src/` changes (FR-005).
- **Removing** one is: delete `definitions/<tool>/`, run the script, commit. The tool type is no longer offered, and nothing else changes (SC-005).

Two tests hold this: one adds `specifications/desl/minimal-table.des` with its binding to a temporary definitions folder and opens a document of it; the other removes a folder and finds the type gone.

## Examples and fixtures

`scripts/sync-examples.mjs` is extended to copy, in the same way and with their source recorded, what the standalone modules of the three new tool types publish (FR-014):

| Tool type | Copied from `etalii.adp.ide.standalone` |
|---|---|
| Mind map | its example `.mm` files; `Fixtures/architecture.mm` and `Parity/mindmap.transcript.json`, the record of what each edit of that map does |
| Agent activity diagram | its three example `.aad` files and their recorded places |
| Knowledge | `cities.yaml`, `cities.json`, `cities.xml`, `provinces.yaml` |

and from `etalii.adp`, the `knowledge-equivalence` fixture of `specifications/fbl/`, which `npm run sync-fbl` already refreshes with the other eighteen.
