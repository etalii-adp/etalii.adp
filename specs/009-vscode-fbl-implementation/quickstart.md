# Quickstart: checking the FBL implementation in the VS Code repository

**Feature**: [vscode-fbl-implementation.spec.md](vscode-fbl-implementation.spec.md) | **Plan**: [plan.md](plan.md)

How to see, once the work is built, that each user story holds. The details of what is called and what is copied are in [contracts/library-api.md](contracts/library-api.md), [contracts/test-baseline.md](contracts/test-baseline.md) and [contracts/corpus.md](contracts/corpus.md).

## Before you start

- Node.js 22 or later and Git.
- The three clones side by side: `etalii.adp`, `etalii.adp.ide.standalone` and `etalii.adp.ide.vscode` (`C:\git\<repository>` locally, `/home/user/<repository>` in a cloud session).
- In `etalii.adp.ide.vscode`, the worktree of `features/009-vscode-fbl-implementation`. Every command below runs there; `npm ci` runs by itself when needed.
- For the in-editor test: a desktop, or `xvfb-run` on Linux. The first run downloads Visual Studio Code.

## 1. The fixtures pass (User Story 1)

```text
npx vitest run test/core/fbl/corpus.test.ts test/core/fbl/conformanceFixtures.test.ts
```

Expected: the corpus test passes (every copied file has its recorded digest); "the fixtures are found" passes with eight; "the fixture passes" and "every byte of the input belongs to the reading" pass once for each of the eight.

To see that the tests can fail: in `src/core/fbl/rules/familyReader.ts`, make `newlineAt` always return LF, and run again. `timeline-edits`, whose body has CRLF, fails on its first edit (its second step, after the save) with the expected and the planned splice shown, and so does `databricks-pipeline-json`, whose body has CRLF too. Undo the change.

To see that a converted copy is noticed: open `fixtures/fbl/conformance/fixtures/timeline-edits/roadmap.tml`, save it with LF endings, and run again. The corpus test names the file. Restore it with `git checkout`.

## 2. Every baseline check has its counterpart (User Story 2)

```text
npx vitest run test/core/fbl
```

Expected: every test passes; `baseline.test.ts` confirms 86 entries, 85 with a counterpart and one not applicable. The two tests that need a link make a junction on Windows, which needs no privilege, so they run there too; on a system that refuses to make a link they are reported as skipped with that reason and none as failed, and `node scripts/skipped-tests.mjs` lists them with it.

To read the correspondence: open `test/core/fbl/baseline.json` beside [contracts/test-baseline.md](contracts/test-baseline.md).

To see that the list is checked: change one title in `baseline.json` and run `baseline.test.ts`. It names the entry whose counterpart it cannot find.

## 3. The real files hold (User Story 3)

```text
npx vitest run test/core/fbl/realFiles
```

Expected: "the enumeration finds the files" passes for six bindings with at least 15, 4, 5, 16, 4 and 2 files; the five properties pass for every file; the registration tests pass over at least 181 registrations.

To see that a new file is picked up: copy any `.tml` of the corpus to `fixtures/fbl/real-files/src/extra.tml` and run again. The corpus test reports a file the manifest does not list, and the real-file tests include it. Delete it.

To see that the divergence record is enforced: remove one entry from `test/core/fbl/realFiles/divergences.json` and run again. The test of that file fails and prints what it observed. Restore the entry, change its `observed`, and it fails the other way.

## 4. It runs inside Visual Studio Code (User Story 4)

```text
npm run test:vscode
```

On Linux without a desktop: `xvfb-run --auto-servernum npm run test:vscode`.

Expected: the plug-in is packaged as `etalii-adp-<version>.vsix`, unpacked, and run in a Visual Studio Code with every other extension disabled. The suite "The plug-in's FBL implementation" passes, walking the `timeline-edits` fixture; every suite that was there before passes unchanged.

To see that the library is in the packaged file and needs nothing else: the test reaches it only through what the activated plug-in returns, and the plug-in under test is the unpacked `.vsix`, which holds `dist/`, the manifest and the readme and no `node_modules`.

## 5. Nothing else changed (SC-006, FR-004)

```text
npm test
git diff develop --stat -- src/extension src/webview package.json
```

Expected: `npm test` passes. The difference shows `src/extension/extension.ts` (the `fbl` member of what `activate` returns) and one script in `package.json`, and nothing under `src/webview` or `contributes`.

## 6. Refreshing the copies

```text
npm run sync-fbl -- ../etalii.adp ../etalii.adp.ide.standalone
npx vitest run test/core/fbl
```

Expected: the script prints the two commits and the number of files of each kind, and rewrites `fixtures/fbl/`. Both refs default to `origin/develop`, so this moves the copies to the newest commits: when no copied file changed there, only the two commits in `manifest.json` and `PROVENANCE.md` change. Then the tests say what the newer sources changed: a fixture that no longer passes, or a divergence that no longer occurs. To get the first copy again, give the two recorded commits of [contracts/corpus.md](contracts/corpus.md) as the third and fourth argument.

## 7. The time the unit tests take (SC-007)

Compare the duration of the "npm run test:unit" step of the pull request's Build run with the one recorded in `docs/fbl.md` from the last run on `develop` before the feature. Expected: at most twice as long.
