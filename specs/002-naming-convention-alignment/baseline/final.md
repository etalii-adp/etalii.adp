# Final pass: spec 002 against the baseline (T063–T067)

Collected 2026-09-29 on every repository's `origin/develop`, after all Part 0–6 pull requests merged. Files were read from fresh detached worktrees of `origin/develop`; test counts come from GitHub Actions logs. §1, §4 and §6 were run on the Part 7 branches, which add the terminology check and remove the site's Part 1 fallbacks; those sections say so.

| Repository | develop head | Subject |
|---|---|---|
| etalii.adp | `c2623d4` | Merge pull request #12 (features/002-part2-disl-did) |
| etalii.adp.ide.standalone | `ae45ff3` | Merge pull request #106 (features/naming-alignment) |
| etalii.adp.ide.intellij | `bacd6dd` | Merge pull request #21 (features/naming-alignment) |
| etalii.adp.ide.vscode | `41265ec` | Merge pull request #4 (features/naming-alignment) |
| etalii.adp.ide.eclipse | `841f834` | Merge pull request #4 (features/naming-alignment) |
| etalii.adp.site | `bcef800` | Merge pull request #57 (features/008-naming-alignment) |
| .github | `060b2cd` | Merge pull request #4 (features/naming-alignment) |

## 1. No retired use remains (SC-001, T065)

`python .github/scripts/terminology-check.py --repo <repo> --name <repo>` with this branch's `docs/terminology-check.json`, which adds the site's allowances for compatibility code, pinned fixtures and finished specs.

| Repository | Tree | Errors | For review |
|---|---|---|---|
| etalii.adp | `features/002-part7-final-pass` | 0 | 35 |
| etalii.adp.ide.standalone | `features/002-part7-final-pass` (one phrase in the open multi-select spec changed with Peter's approval) | 0 | 110 |
| etalii.adp.ide.intellij | develop `bacd6dd` + CI job | 0 | 15 |
| etalii.adp.ide.vscode | develop `41265ec` + CI job | 0 | 2 |
| etalii.adp.ide.eclipse | develop `841f834` + CI job | 0 | 2 |
| etalii.adp.site | `features/002-part7-final-pass` | 0 | 72 |
| .github | develop `060b2cd` + CI job | 0 | 1 |

Before Part 7 the site had about 360 findings and standalone one. The site's findings were either renamed (tests, comments and page text that described DISL and DID as DEDL) or allowed as compatibility: DEDL 0.1 stays registered in `languages.json` so its old addresses redirect and its schema keeps its address (T050), the pinned `dedl-aaef333` and `disl-c2623d4` reference fixtures, the `/adp/designers/` redirect tests, the finished specs 003, 005 and 006, and the verbatim `sources/catalogue/*/diagrams.md` copies, which go with the next catalogue refresh.

Notion: the "ADP terminology" page states the glossary's definitions, names `docs/terminology.md` as its source, and mentions DEDL, DIFL, DEFL, EDFL, DIDL, EDDL and "author" only as retired uses. The "Tools" data source has the columns Kind, Standalone, IntelliJ, VS Code and Eclipse (read 2026-09-29). The site's served pages were checked through their sources (`src/`), which the check covers.

### The check fails on a retired use (T063)

In each of the seven repositories a scratch file holding `class ErdDiagramDesigner {}`, `erd.difl` and the allowed `OMG Diagram Definition` and `FileEditor` was added (`git add -N`, then removed; no scratch branches were pushed). In every repository the check exited 1 with exactly two findings, each naming file, line, glossary entry and replacement, for example `t063-scratch.md:2: [draft-extensions] .difl -- earlier drafts' terms; use: .did, .ded, .edd; disl.schema.json`; the allowed line produced none. The CI job (T062) runs the same script on every pull request into `develop`: in etalii.adp with the pull request's own list, elsewhere with etalii.adp `develop`'s.

## 2. Every repository still passes, with no fewer tests (SC-003)

### Latest Build run on develop

| Repository | Run | Head SHA | = develop head? | Conclusion |
|---|---|---|---|---|
| etalii.adp | [36527080842](https://github.com/etalii-adp/etalii.adp/actions/runs/36527080842) | `c2623d4` | yes | success |
| etalii.adp.ide.standalone | [36527098739](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/36527098739) | `ae45ff3` | yes | **failure** (see below: runner error after all backend tests passed; same failure as the baseline commit's run) |
| etalii.adp.ide.intellij | [36527087084](https://github.com/etalii-adp/etalii.adp.ide.intellij/actions/runs/36527087084) | `bacd6dd` | yes | success (jobs `build` and `real-ide-tests`) |
| etalii.adp.ide.vscode | [36503045605](https://github.com/etalii-adp/etalii.adp.ide.vscode/actions/runs/36503045605) | `41265ec` | yes | success |
| etalii.adp.ide.eclipse | [36503065015](https://github.com/etalii-adp/etalii.adp.ide.eclipse/actions/runs/36503065015) | `841f834` | yes | success |
| etalii.adp.site | [36540646177](https://github.com/etalii-adp/etalii.adp.site/actions/runs/36540646177) (Build), [36540646189](https://github.com/etalii-adp/etalii.adp.site/actions/runs/36540646189) (refresh-checks) | `bcef800` | yes | success, success |
| .github | none | - | - | **no workflow on develop** (develop holds only `LICENSE` and `profile/README.md`); the only Build run is PR run [36568114056](https://github.com/etalii-adp/.github/actions/runs/36568114056) on `features/002-part7-final-pass` (`2439f96`), success, job `terminology` |

### etalii.adp.ide.standalone

The develop run failed in the step "Backend tests" with `##[error]Unable to process file command 'env' successfully. ##[error]Invalid format '082'` right after the test summary (total 8198, failed 0), so the steps Backend style gate, Client tests and Client typecheck were skipped. The baseline commit's own develop run ([36469075339](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/36469075339), `762cc55`) failed the same way (`Unable to process file command 'env'`, `Value cannot be null. (Parameter 'name')`) with 0 failed tests, so this is a pre-existing CI problem (something writes an invalid line to `$GITHUB_ENV` during `dotnet test`), not a regression of spec 002.

All four gates did run green on the pull request run [36509396971](https://github.com/etalii-adp/etalii.adp.ide.standalone/actions/runs/36509396971) at `8fd7efa`, the second parent of the develop merge `ae45ff3`; `git diff --quiet 8fd7efa ae45ff3` confirms the two trees are identical, so its counts are develop's.

| Gate | Baseline (local Windows, `762cc55`, baseline/standalone.md) | Baseline commit in CI (run 36469075339) | develop (CI) | Source |
|---|---|---|---|---|
| `dotnet test` | total 8195, succeeded 8149, failed 2, skipped 44 (exit 2) | total 8195, succeeded 8134, failed 0, skipped 61 | total 8198, succeeded 8137, failed 0, skipped 61 | run 36527098739 (develop) and run 36509396971 (same tree), identical |
| `dotnet format style` | exit 0 | skipped | success | run 36509396971 |
| `npm test` (vitest) | files 185 passed / 1 failed (186); tests 1982 passed / 1 failed (1983) | skipped | files 186 passed (186); tests 1983 passed (1983) | run 36509396971 |
| `npm run typecheck` | exit 0 | skipped | success (`tsc --noEmit`) | run 36509396971 |

No drop: backend total +3 against the baseline (8198 vs 8195). Skipped 61 vs 44 is a platform difference (Linux CI skips Windows-only file-holder tests), the CI run of the baseline commit also skips 61. Client counts equal the baseline and are now all green.

### etalii.adp.ide.intellij

The CI logs of Gradle do not print test counts (no per-test output, no summary), and the run keeps test reports only on failure (the only artifact is `etalii.adp.ide.intellij-plugin`). So counts cannot be read from CI. What the logs do show (run 36527087084):

- job `build`: `./gradlew build -x integrationTest` under xvfb, `:core:test`, `:drawio:test`, `:freemind:test` executed (not from cache), `:testing:test` and root `:test` NO-SOURCE, BUILD SUCCESSFUL in 11m 34s.
- job `real-ide-tests`: `./gradlew integrationTest`, BUILD SUCCESSFUL in 10m 40s.

Static count of test methods (`@Test`/`@ParameterizedTest`/`@RepeatedTest`/`@TestFactory` lines, `git grep`) as a proxy, baseline `3cbe9f4` vs develop `bacd6dd`:

| Module | Baseline tests run (baseline/intellij.md) | Annotated methods at baseline | Annotated methods on develop | Counts reported in PR #21 (local, "this branch") |
|---|---|---|---|---|
| core | 275 / 1 failed / 0 skipped | 269 | 272 | 278 / 1 / 0 |
| drawio | 57 / 0 / 0 | 46 | 46 | 57 / 0 / 0 |
| freemind | 465 / 1 / 2 | 223 | 223 | 465 / 0 / 2 |
| integrationTest | 16 / 0 / 2 | 9 | 9 | 16 / 0 / 2 |

No drop in the static count (core +3, the new settings tests); test classes renamed in part 4 (`Designer…Test` → `Tool…Test`, `DrawioDesignerTest` → `DrawioDiagramTest`, `DesignerSettingTest` deleted and `ToolSettingTest` added) are accounted for. The run-time counts on develop are only those in the IntelliJ PR #21 body (a local run on the branch), not independently verified from CI.

### etalii.adp.site

| Gate | Baseline (baseline/site.md, local; same numbers in CI run [36501466182](https://github.com/etalii-adp/etalii.adp.site/actions/runs/36501466182) at `b5bb553`) | develop (CI) | Source |
|---|---|---|---|
| `npm run build` | 35 pages | 37 pages | run 36540646177, job `check` |
| `npm test` (vitest) | 71 tests in 7 files, all passed | 80 tests in 8 files, all passed | run 36540646177 |
| `npm run test:catalogue` | 50 / 50 | 62 / 62 | run 36540646177 |
| `npm run test:refresh` | 119 / 119 | 146 / 146 | run 36540646189 |
| `npm run check`: `check:links` | 13 links, 0 broken | 15 links, 0 broken | run 36540646177 |
| `npm run check`: `check:catalogue` | 46 pages, 0 failures | **29 pages**, 0 failures | run 36540646177 |
| `npm run check`: `check:pages` (Playwright) | 369 passed | 389 passed | run 36540646177 |
| `check:reference` | not in baseline | 8 checks, 0 failures | run 36540646177 |
| job `reference-fixture` (build 129 pages, check 477 passed, versioning build 156 pages, `check:moved`) | not in baseline | success | run 36540646177 |

`check:catalogue` counts every `index.html` under the catalogue folder. At baseline that was `dist/adp/designers/` (29 live pages: the index and 28 tool pages, plus 17 retired spec-003 facet redirect pages = 46); on develop it is `dist/adp/tools/` (29 live pages; the old `/designers/` addresses are now redirect pages outside the counted folder). The same 29 live pages are checked, so this is not a loss of coverage, but the number is lower than the baseline and is explained here. Every other count is at or above the baseline.

Not a gate but seen: the scheduled `Refresh` workflow fails on develop (e.g. run [36544038039](https://github.com/etalii-adp/etalii.adp.site/actions/runs/36544038039)) with "Set REFRESH_APP_ID and REFRESH_APP_PRIVATE_KEY (or the stopgap REFRESH_TOKEN) as repository secrets"; it has failed the same way since before the baseline (runs on `b2a1db9`, 2026-09-28).

### etalii.adp

| Gate | Baseline (baseline/etalii.adp.md) | develop (CI run 36527080842) |
|---|---|---|
| `validate-examples.py` | exit 0, 4 examples, 0 invalid | success, 6 examples, 0 invalid: `specifications/disl/erd.disl`, `statemachine.disl`, `timeline.disl`, `specifications/did/timeline.did`, and the legacy fixtures `specifications/disl/legacy/erd.dedl` and `specifications/did/legacy/timeline.document.json` "read through" the DEDL 0.1 aliases (`.dedl`, the old `$schema`, version keys `dedl`/`dedlDocument`) |

### vscode, eclipse, .github

| Repository | Result | Source |
|---|---|---|
| etalii.adp.ide.vscode | job `check`: `check-files.py` "Checked 140 files, 0 problem(s)"; job `plugin`: "No plug-in code yet: nothing to build." | run 36503045605 |
| etalii.adp.ide.eclipse | same: 140 files, 0 problems; no plug-in code yet | run 36503065015 |
| .github | no workflow on develop, so no develop run; the PR run 36568114056 (terminology check) is green | - |

## 3. Documents round-trip (SC-002)

Method: the baseline hash lists compared against develop. etalii.adp and standalone hashes are of Windows working-tree bytes (baseline convention; standalone checks out CRLF via `.gitattributes`), recomputed in fresh worktrees; IntelliJ hashes are of committed blobs (baseline convention), recomputed with `git cat-file`. Renames were found with `git diff -M --name-status <baseline commit> HEAD` and by searching all tracked files on develop for the baseline hash.

| Repository | Baseline entries | Same path, same hash | Renamed, same hash | Migrated on purpose (listed in PR) | Changed, not listed | Missing |
|---|---|---|---|---|---|---|
| etalii.adp | 6 | 0 | 2 (as the legacy fixtures) | 4 (+2 documents rewritten by T027–T030) | 0 | 0 |
| etalii.adp.ide.standalone | 790 | 593 | 196 | 1 | 0 | 0 |
| etalii.adp.ide.intellij | 152 | 148 | 0 | 0 | **4** | 0 |
| **Total** | 948 | 741 | 198 | 5 (+2) | 4 | 0 |

### etalii.adp (baseline `90e163d`, file baseline/etalii.adp.sha256)

| Baseline path | Baseline SHA-256 | develop path | develop SHA-256 | Class | Legacy copy |
|---|---|---|---|---|---|
| `specifications/dedl/erd.dedl` | `2f5d434d82930fa57478a9a19c1cc681f63544f76e6b53e4e3030163ab9d32e0` | `specifications/disl/erd.disl` | `a6f53051c7660be67ca7d933fdcd8f618ed368a0571581461e78b27aa5702c57` | migrated (T032) | yes: `specifications/disl/legacy/erd.dedl`, hash equal to the baseline |
| `specifications/dedl/statemachine.dedl` | `ed4a1f3f92ff54193f5b61661ccf4911d6b2e5a3f804220ea0e4edcffce73f9d` | `specifications/disl/statemachine.disl` | `d57467ecac4a29b24caa9b5688f693391ad7d44344d9695afaec398d176f6522` | migrated (T032) | no (T048 keeps one legacy fixture per format) |
| `specifications/dedl/timeline.dedl` | `e249bb8a30b98590c91b1473b9d4a7b47ae31d18f8f61a54cdb15c4e79d14d99` | `specifications/disl/timeline.disl` | `3b2c6f1dcb3563bcc978f8293d24cbc7b51398f0d426d9165de80731edfae00c` | migrated (T032) | no (as above) |
| `specifications/dedl/timeline.document.json` | `5331c59af2d499a6fe012c9ef0cee8327cf110395334cf0a49815b247db66c29` | `specifications/did/timeline.did` | `d870e2b0476aad377f8668b53e110dab1d13cf7668afd540238f3dfab476c6d3` | migrated (T032) | yes: `specifications/did/legacy/timeline.document.json`, hash equal to the baseline |
| `specifications/dedl/DEDL-specification.md` | `7debf8698d63c5340aeec7c88dfbff33b104e484e16427110b4ca1c2abbd1e4c` | `specifications/disl/DISL-specification.md` (git R091) plus new `specifications/did/DID-specification.md` | `54b13088ae5e90da368094a7b02212524fdc004725ba4fdc202a893424a40070` (DISL), `1164814d3000cbcef9441e3bb23fe0bfe79bd35d5eedf7fb03aa0c1b4ac06921` (DID) | rewritten on purpose (T027/T028: split and renamed); a specification document, not an example | no |
| `specifications/dedl/dedl.schema.json` | `2480263446c511880c416c2eefebb98a2749721aafed49369a80ed0ba4c3dfe8` | `specifications/disl/disl.schema.json` (git R095) plus new `specifications/did/did.schema.json` | `9cc3c2d3120f569c152df91566185869c9124a00967e147620cc84d59135bed9` (DISL), `6d29babe3ce7c42c28dcedc6f564cb6f319769d2c6d77346153ae1f1cd12b78e` (DID) | rewritten on purpose (T029/T030) | no copy in etalii.adp (serving the old schema address is §4, site) |

The four migrated hashes are exactly those listed in etalii.adp PR #12 ("T032, migrated files"). CI (run 36527080842) validates both legacy fixtures through the alias table, which is the "legacy copy still opens" proof on the specification side.

### etalii.adp.ide.standalone (baseline `762cc55`, file baseline/standalone.sha256)

- 593 files byte-identical at the same path.
- 196 files byte-identical after moving with their module folder (git R100 each; T036's kebab-case folder renames): `src/diagrams/azure-pipeline` → `azure-devops-pipeline` (11), `causal-loop` → `causal-loop-diagram` (2), `gartner-hypecycle-graph` → `gartner-hype-cycle-graph` (9), `helm-charts` → `helm-chart` (3), and the same renames under `src/examples/diagrams/` (163) and eight `src/fixtures/cross-tier/example-models/{module,showcase}-*.json` files (8).
- 1 file migrated on purpose, listed in standalone PR #106:

| Path | Baseline SHA-256 | Migrated SHA-256 | Why | Legacy copy |
|---|---|---|---|---|
| `src/fixtures/cross-tier/element-types.json` | `358199a4feb5625fc5bf3b17deb9adb7a1b2f738e3a88a05850fc748cbacd5c9` | `70112202b6fcbfae7c40e79cbaae7fe9ff259fd3e59f5bbff40bdabd497b7faf` | a test fixture keyed by module folder; its four keys follow the folder renames (commit `230f028d`) | no (not a user document; nothing reads the old keys) |

T052 (PR #106): no DEDL identifier exists in `src/examples/` or `src/fixtures/`, so no example document was migrated.

### etalii.adp.ide.intellij (baseline `3cbe9f4`, file baseline/intellij.sha256)

- 148 files byte-identical (every `testdata/` file of core, drawio and freemind, and `src/integrationTest/resources/META-INF/services/org.junit.platform.launcher.LauncherSessionListener`).
- **4 files changed and not listed as migrated in PR #21** (the PR lists no migrated files). All four are test resources changed by the part 4 rename, not documents or registration files:

| Path | Baseline SHA-256 (blob) | develop SHA-256 (blob) | Change |
|---|---|---|---|
| `core/src/test/resources/META-INF/plugin.xml` | `c8229eaf2a36546590f9cd19a7c4250fc7ec5d13334c015fd9482164542d86bc` | `3875b98871edacaf04f5befeb2686f11a1c40664f1d7b96bdfcf26e0180aff1e` | `xi:include` of `adp-settings-designers.xml`/`adp-settings-designer-pages.xml` → `adp-settings-tools.xml`/`adp-settings-tool-pages.xml` (2 lines) |
| `drawio/src/test/resources/META-INF/plugin.xml` | `2a19366ed721db995d964706744f4b601167fb09072c29b7a54b9f50d00552af` | `d8f6097bcd01672c909926183d1187e604d8a49171227586204c0871a9954a8c` | same (2 lines) |
| `freemind/src/test/resources/META-INF/plugin.xml` | `1c12a5078b86ef60386f1bab05769d89e25c8dbd93587d4d0d797c09e2f385ec` | `35b1884ee2520ad8e83d06853ca6249e24ac32a8def857ed35e31793107e8552` | same (2 lines) |
| `freemind/testdata/reference/spec001-test-inventory.md` | `18c21f4d7a26be3c2a8c95c47f44eae080ca7c334aabad0e5820ef0f4c034477` | `2549caf9621e84b6e9c516cbad6e79c3c12f518e234e2f60bf01be718acb44b3` | a reference table of test names; the "new name" column follows the renamed test methods (6 rows) |

These are explainable renames, but under quickstart §3 they count as changed without being listed in the part's pull request; they are listed here as migrated on purpose.

## 4. Links still land (SC-004)

On the site's Part 7 branch: of the 34 URLs in `baseline/sitemap.txt`, 4 serve the same page and 30 redirect permanently in one hop to a URL of the new sitemap (`/adp/dedl/…` → `/adp/disl/…`, `/adp/designers/…` → `/adp/tools/…`); none is missing. The new sitemap has 36 URLs. `npm run check:moved`, built from the DEDL 0.1 fixture: 58 redirects and 1 schema file (`/dedl/schema/0.1/dedl.schema.json`), 0 failures. The DISL and DID schema addresses are checked by `check:reference` in the `reference-fixture` CI job.

## 5. Settings survive (SC-005)

- Test: `core/src/test/java/etalii/adp/core/settings/AdpSettingsStateRoundTripTest.java` on develop, method `theSettingsStoredBeforeTheRenameStillApply` (T049). It loads `/settings/baseline-adp.xml`, asserts draw.io off, freemind on, `CanvasOptions(true, false, 1.5)`, per-tool value `direction` = `left`, and that the written state holds `offTools`/`toolSettings` and neither `offDesigners` nor `designerSettings`. Sibling tests in the class cover the old mind map id (`theOldMindMapIdReadsAsTheNewOne`) and new-wins (`theNewNamesWinOverTheOld`). No `@Disabled` or assumption.
- **The test resource is not byte-identical to the baseline file.** `core/src/test/resources/settings/baseline-adp.xml` (blob SHA-256 `58cfb653a2db81c47f98ad8077fbd60ad8c1dd1bba67b58ecc9588fab3752567`) holds the same five options with the same values, but in alphabetical order (`designerSettings`, `offDesigners`, `openingZoom`, `showGrid`, `snapToGrid`), whereas `baseline/adp.xml` (blob SHA-256 `501a8b9d13a15f76bcdca22150d8baf6b00511a55feffae0645d6155a37ef33c`) is in the serializer's declaration order (`offDesigners`, `showGrid`, `snapToGrid`, `openingZoom`, `designerSettings`). baseline/intellij.md says the alphabetical draft was the one corrected. Options are read by name, so the result should not differ, but the test does not restore the baseline file byte for byte.
- CI: the test is in `:core:test`, which ran (not from cache) in job `build` of run [36527087084](https://github.com/etalii-adp/etalii.adp.ide.intellij/actions/runs/36527087084) and ended BUILD SUCCESSFUL, so it passed; the log does not name individual tests, so there is no per-test line to quote.
- The sandbox-IDE check of quickstart §5 (`./gradlew runIde`, restart, file holds only new keys) is manual and was not run here.

## 6. Notion and the pipelines (SC-006, T064)

The site's Part 1 fallbacks are removed on its Part 7 branch: the `dedl` procedure name (`names.mjs`, `run.mjs`, `plan.mjs`, `refresh.yml`), the DEDL layout of the DISL refresh and its `…/specifications/dedl/` fixture, the `SUCCESSORS` fallback of `reference:refresh`, and the old Notion column names in `notion-api.ts` and `sync-notion.ts`; the hosts facts are now `usableTools` and `toolsInProgress`. Kept: the `docs/diagrams.md` fallback of the catalogue readers, because the site's committed `sources/` locks and the latest standalone release (`v0.1.2071-alpha`) still name `docs/diagrams.md`; it can go after the next catalogue refresh and host releases. It went on 2026-10-01: the catalogue refresh moved every site lock to `docs/tools.md`, and the standalone's release `v0.1.2091-alpha` carries it, so the readers now take `docs/tools.md` only.

Site gates on that branch (local, fresh `npm ci`): build 0 (37 pages), vitest 78, `test:catalogue` 58, `test:refresh` 141, `check` 0 (389 pages), `refresh:verify` 0. Every drop against develop (80, 62, 146) is a removed test of a removed fallback; all stay above the baseline (71, 50, 119). The catalogue refresh dry-run against Notion was not run; the live data source was read and has every column the reader now requires.

## 7. One vocabulary in three places (User Story 1)

| Check | etalii.adp `docs/terminology.md` | site `src/content/docs/docs/terminology.mdx` |
|---|---|---|
| Same definitions | source | identical: everything from `## Tools` to the end matches line for line (`diff` after stripping CR: no difference); only the intro differs |
| Points to the markdown file as the source | says it is "the single source" and that the Notion page and the site pages repeat it and point here | "The source of these definitions is [`docs/terminology.md` in etalii.adp](https://github.com/etalii-adp/etalii.adp/blob/develop/docs/terminology.md); this page repeats it." |
| DIFL, DEFL, EDFL, DIDL, EDDL, DEDL as a current language | only in "History" and the "Retired uses" table | same |
| "author" of a definition | only as retired ("not an 'author'") | same |

The site's "Specification & Definition" page (`specification-and-definition.mdx`) also names `docs/terminology.md` as its source. The Notion "ADP terminology" page repeats the same definitions and points to `docs/terminology.md` (§1).

## 8. The six languages (FR-006, FR-006a, FR-006b)

`git ls-files specifications` on etalii.adp develop (`c2623d4`):

| Folder | `<NAME>-specification.md` | Schema | Examples | Status stated | Purpose and extension stated |
|---|---|---|---|---|---|
| `disl/` | `DISL-specification.md` | `disl.schema.json` (`$id` `https://etalii.net/adp/disl/schema/0.1/disl.schema.json`) | `erd.disl`, `statemachine.disl`, `timeline.disl`; legacy `legacy/erd.dedl` + README | "version 0.1 (Working Draft)" | yes |
| `did/` | `DID-specification.md` | `did.schema.json` (`$id` `https://etalii.net/adp/did/schema/0.1/did.schema.json`) | `timeline.did`; legacy `legacy/timeline.document.json` + README | "version 0.1 (Working Draft)" | yes |
| `desl/` | `DESL-specification.md` | none | none | "no version yet (Placeholder)" | yes: `## Purpose`, extension `.desl`, paired with DED |
| `ded/` | `DED-specification.md` | none | none | "no version yet (Placeholder)" | yes: `.ded`, paired with DESL |
| `edsl/` | `EDSL-specification.md` | none | none | "no version yet (Placeholder)" | yes: `.edsl`, paired with EDD |
| `edd/` | `EDD-specification.md` | none | none | "no version yet (Placeholder)" | yes: `.edd`, paired with EDSL |

No `specifications/dedl/` folder exists. `definitions/{diagrams,designers,editors}/README.md` are also tracked.

Site page "Specification & Definition" (`src/content/docs/docs/specification-and-definition.mdx` on site develop `bcef800`): the table has the columns Kind | Specification language | Extension | Definition language | Extension, identical to the glossary's table in `docs/terminology.md`, row for row; the only difference is that the DISL and DID cells link to `/adp/disl/` and `/adp/did/`.

## A newcomer places the tools (SC-008, T067)

No contributor new to ADP was available, so a fresh Claude agent given only `docs/terminology.md` stood in for one. It placed ten entries from [classification.md](../contracts/classification.md): Markdown editor and plain text editor as editors; Zachman Framework matrix, Gartner hype cycle graph, Timeline diagram, Pipeline state visualization, Agent teaming agreement and FreeMind mind map as diagrams; the properties panel as not a tool. **9 of 10 match.** It placed the commit file and folder heatmap as "not a tool", where Peter classified it as a diagram: the glossary does not say whether nesting (a folder containing files) counts as a relation between elements. That is an open question for the glossary, not changed here.

## Open points

1. Standalone's develop Build run is red (runner `$GITHUB_ENV` error after `dotnet test` passed, pre-existing since the baseline commit); the counts come from the green PR run on the identical tree.
2. IntelliJ test counts are not in the CI logs; only the PR #21 local counts and a static method count are available.
3. Site `check:catalogue` reports 29 pages vs 46 at baseline: same live pages, different folder counted.
4. IntelliJ: four test resources changed in part 4 without being listed as migrated.
5. `baseline-adp.xml` in the IntelliJ test resources differs byte-wise (element order) from `baseline/adp.xml`.
6. The `.github` repository has no CI workflow on develop yet; Part 7's pull request adds one.
7. The glossary does not say whether nesting counts as a relation (SC-008 above).
8. The site's `docs/diagrams.md` fallback stays until the next catalogue refresh and host releases (§6).
