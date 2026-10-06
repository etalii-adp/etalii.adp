# Contract: the copied files, the script that copies them, and the checks of the build

**Feature**: [vscode-fbl-implementation.spec.md](../vscode-fbl-implementation.spec.md) | **Research**: [R9](../research.md), [R13](../research.md), [R14](../research.md), [R15](../research.md)

Paths are in `etalii.adp.ide.vscode`.

## Folders

```text
fixtures/fbl/
├── PROVENANCE.md          # written by the script; prose
├── manifest.json          # written by the script; data-model.md, "Manifest"
├── conformance/           # from etalii.adp, specifications/fbl/
│   ├── *.fbl              # the eight example bindings
│   ├── fixtures/<name>/   # fixture.json and its input body, eight of them
│   └── registrations/     # six .adp files
└── real-files/            # from etalii.adp.ide.standalone, under the paths they have there
    └── src/...
```

Nothing under `fixtures/fbl/` is edited by hand. A difference from the source is taken up by running the script at a newer commit.

## `scripts/sync-fbl.mjs`

```text
node scripts/sync-fbl.mjs <path to etalii.adp> <path to etalii.adp.ide.standalone> [<etalii.adp ref>] [<standalone ref>]
npm run sync-fbl -- ../etalii.adp ../etalii.adp.ide.standalone
```

- Both refs default to `origin/develop`. Each is resolved to a commit with `git rev-parse`, and that commit is what the manifest and `PROVENANCE.md` record.
- Every file is read with `git show <commit>:<path>` as bytes and written as those bytes. The working trees of the two clones are never read.
- `conformance/` is every `*.fbl` of `specifications/fbl/`, and everything under its `fixtures/` and `registrations/`. The specification document and the schema are not copied.
- `real-files/` is, from standalone's `src/`, leaving out any path with a segment `Conformance`, `node_modules`, `bin` or `obj`:
  - every `.tml`, `.cld`, `.mm`, `.dsl`, `.adp`, `.ttl` and `.nt` file, the extension matched ignoring case;
  - every `.yml` and `.yaml` file whose content contains `task_key`, and every `.json` file whose content contains `"libraries"`;
  - every `*.layout.json` and `*.identities.json`;
  - every file of a folder that holds a `Chart.yaml`, with its subfolders.
- Both folders are emptied before they are written, so a file that left the source leaves the copy.
- The script prints, for each kind above, how many files it copied, and fails when a kind has fewer than its recorded minimum (data below), so that a moved folder in standalone is noticed when copying and not as a silently smaller test run.
- It writes `manifest.json` and `PROVENANCE.md` last. `PROVENANCE.md` names both repositories, both commits, the licence of each (Apache-2.0), any third-party notice copied with the real files, and how to refresh.

Recorded commits for the first copy: `etalii.adp` `30206eaf29bc33b4af9aa0ecddc88584d24b9499`; `etalii.adp.ide.standalone` `25fc7b4af7a99989d23d75d1af9d844303243b9d`.

## Recorded minimums

In `test/core/fbl/realFiles/corpus.ts`, used by the script and by the tests (FR-020, acceptance scenario 3.1):

| Key | Binding | Files selected | Minimum |
|---|---|---|---|
| `timeline` | `timeline.fbl#timeline` | `.tml` | 15 |
| `causal-loop` | `causal-loop-diagram.fbl#cld` | `.cld` | 4 |
| `mindmap` | `mindmap.fbl#freeplane` | `.mm` | 5 |
| `structurizr` | `structurizr.fbl#workspace` | `.dsl` | 16 |
| `databricks-job` | `databricks-job.fbl#job` | `.yml`, `.yaml` containing `task_key` | 4 |
| `databricks-pipeline` | `databricks-pipeline.fbl#settings` | `.json` containing `"libraries"` | 2 |
| registrations | | `.adp` | 181 |
| chart folders | `helm-chart.fbl` | folders holding `Chart.yaml` | 13 |
| Turtle | `w3c-turtle.fbl#turtle` | `.ttl`, `.nt` | 33 |

The tests enumerate `fixtures/fbl/real-files/` and, with the same rules, the rest of the repository (leaving out `node_modules`, `dist`, `out`, `reports`, `.vscode-test`, `.debug` and `fixtures/fbl/conformance`). A file found in the repository itself counts beside the copied ones; the minimums apply to the copied ones alone.

## Repository settings that change

| File | Change |
|---|---|
| `.gitattributes` | `fixtures/** -text` already covers the copies. Added: `fixtures/fbl/PROVENANCE.md text` and `fixtures/fbl/manifest.json text`. |
| `eslint.config.mjs` | For `src/core/**`: no import of a `node:` module, except in `src/core/fbl/files/nodeFiles.ts` and `src/core/fbl/history/digest.ts`. For everything but `src/core/fbl/**`, `src/extension/extension.ts` and `test/**`: no import of `**/core/fbl/**`. |
| `package.json` | A script `sync-fbl`. No dependency is added, and nothing under `contributes` changes. |
| `scripts/unpack-plugin.mjs` | None: it already copies `fixtures/` into the in-editor tests' workspace. |
| `vitest.config.mts`, `.vscode-test.mjs`, `.vscodeignore` | None. |
| `.github/workflows/build.yml` | None: `npm run test:unit` and `npm run test:vscode` already run on every pull request and on `develop`, a failing test already fails the job, and `scripts/skipped-tests.mjs` already lists what was skipped (FR-024). The task that adds the two link tests checks that their reason appears in that list, and changes the script if it does not. |
| `.github/scripts/check-files.py` | None: it already leaves `fixtures/` alone, which the corpus needs (a body with a byte-order mark, bodies malformed on purpose). |

## Documentation that changes

| File | Change |
|---|---|
| `docs/fbl.md` (new) | What the library is and that no tool uses it yet; the class and families it claims (FBL 0.1, *Host, declared*, all five); where the two copies come from; what is not implemented, by FBL section; where it differs from standalone, with the reason; the open questions and divergences with the issue each was filed as; the unit tests' duration before and after (FR-025, FR-026, SC-007). |
| `README.md` | "Where it stands" says the plug-in carries an FBL implementation no tool uses yet; the layout table gains `src/core/fbl` and `fixtures/fbl`, the latter with both sources. The licence line is unchanged, as no library is added. |
| `docs/parity.md` | None. It records differences of a tool from its definition, and no tool changes. |

## What the pull request must show

- `npm run check`, `npm run test:unit` and `npm run test:vscode` pass on the hosted runner.
- The existing tests are unchanged except `test/vscode/identity.test.ts`, should it compare the whole of what `activate` returns (SC-006).
- The skipped-tests list of the run is empty.
- `git diff develop -- package.json` shows only the `sync-fbl` script.
- The description names `specs/009-vscode-fbl-implementation/` in `etalii.adp` and the `etalii.adp` commit its tasks were taken from, and links every issue filed under FR-026.
