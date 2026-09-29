# Baseline: etalii.adp.ide.intellij on origin/develop

- Repository: `C:\git\etalii.adp.ide.intellij`
- Commit: `3cbe9f4e7c92219747fca74753425cbb31da4aef` (origin/develop, "Merge pull request #18 from etalii-adp/claude/project-thread-1zel34"), fetched 2026-09-29
- Worktree: `git worktree add --detach C:\git\etalii.adp.ide.intellij-baseline origin/develop` (the repo's CLAUDE.md does not say where worktrees go; existing ones sit beside the repo), removed afterwards
- Toolchain: Gradle 9.8.0 (wrapper), JDK 26.0.2.1 (Oracle), Windows 11, IntelliJ Platform IU-2026.2.3 test sandbox
- Modules (settings.gradle.kts): root (plug-in + `integrationTest`), `core`, `freemind`, `drawio`, `testing`

## Commands and exit codes

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `gradlew.bat build --console=plain` | 1 | Root `integrationTest` and `verifyPlugin` (8 IDEs: IU, WS, PY, CL, GO, PS, RM, RD) ran and passed; then `:core:test` failed (275 tests, 1 failed), which stopped the build before `drawio`/`freemind` tests ran. 22m 33s. |
| 2 | `gradlew.bat build --continue --console=plain` | 1 | `:core:test` 275/1 failed, `:drawio:test` 57/0, `:freemind:test` 465/1 failed/2 skipped; root tasks up to date. 3m 27s. |
| 3 | `gradlew.bat integrationTest --rerun --console=plain` | 0 | 16 tests, 0 failed, 2 skipped. 8m 46s. |
| 4 | `gradlew.bat :core:test --tests "*AdpEditorProviderTest" :freemind:test --tests "*AddNodeTest" --continue` | 0 | The two failing classes in isolation: core 12/0, freemind 8/0. |

## Test counts per module (from build/test-results XML: testcase / failure+error / skipped)

| Module | Task | Suites | Tests | Failed | Skipped |
|--------|------|--------|-------|--------|---------|
| core | test | 47 | 275 | 1 | 0 |
| drawio | test | 7 | 57 | 0 | 0 |
| freemind | test | 43 | 465 | 1 | 2 |
| testing | test | - | 0 (NO-SOURCE) | - | - |
| root | test | - | 0 (NO-SOURCE) | - | - |
| root | integrationTest | 6 | 16 | 0 | 2 |
| **Total** | | 103 | 813 | 2 | 4 |

Integration suites: EditUndoIntegrationTest 5 (1 skipped), IdeTestsHomeTest 1, NoPreviousHostIntegrationTest 3, OpenDrawioTest 1, OpenMapIntegrationTest 5 (1 skipped), SettingsPageIntegrationTest 1.

## Already failing / skipped on develop (not fixed)

- `core` `AdpEditorProviderTest > stateKeepsZoomAndSelection` failed in both full runs with `java.nio.file.FileSystemException: C:\Users\vrenk\AppData\Local\Temp\unitTest_stateKeepsZoomAndSelection_...: The process cannot access the file because it is being used by another process` (raised while the platform test fixture deletes its temp project dir). Passes when the class runs alone. Windows file-lock flake in fixture teardown, not an assertion failure.
- `freemind` `AddNodeTest > addChildIntoASelfClosingNode` failed in run 2 with the same temp-dir `FileSystemException`; passes in isolation. Same flake class. Expect `./gradlew build` to be red on Windows intermittently for this reason; compare per-test results, not just the exit code.
- Skipped by assumption: `FreeMindCompatibilityTest.freeMindReadsWhatTheDesignerSaved` (FREEMIND_HOME not set), `SaveLifecycleTest.localHistoryRecordsTheChange` (Local History records no revisions in the test IDE), and the two "IntelliJ IDEA with an Ultimate licence" integration cases (no licence in ADP_IDEA_LICENSE).
- Hygiene seen in passing: the integration run writes `allure-results/*.json` into the repo root, which is not git-ignored (91 such files are already tracked, the run adds more untracked ones); 12 files under `bin/`, `core/bin/`, `freemind/bin/` (IDE build output copies of plugin.xml etc.) are tracked.

## adp.xml

`adp.xml` in this folder is the stored application-level settings file for the plug-in's `@State(name = "AdpSettings", storages = @Storage("adp.xml"), category = SettingsCategory.PLUGINS)` component (`core/src/main/java/etalii/adp/core/settings/AdpSettings.java`, a `PersistentStateComponent<Element>` whose bean is `AdpSettings.State` with fields `offDesigners` (Set), `showGrid`, `snapToGrid`, `openingZoom` (strings), `designerSettings` (Map keyed `<designerId>/<key>`)).

Contents chosen:
- `offDesigners` = { `etalii.adp.drawio` } (draw.io designer off; the designer id is the editor type id, `DrawioEditorProvider.EDITOR_TYPE_ID`)
- `showGrid` = `true` (default `false`), `snapToGrid` = `false` (default `true`)
- `openingZoom` = `150` (default `100`)
- `designerSettings` = { `etalii.adp.sample.settings/direction` = `left` }. No shipped designer on develop declares a per-designer setting (`AdpEditorProvider.settings()` is empty for freemind and drawio), so the key comes from the only declaring designer in code, the test sample `SettingSampleProvider` (id `etalii.adp.sample.settings`, choice setting `direction`, default `right`). Stored settings of designers that are not installed are kept and written back, so the entry survives a load/save in a real IDE too.

How it was produced: written by hand in the platform's storage format (`<application><component name="AdpSettings">…</component></application>`), with the element order and shape taken from what `XmlSerializer.serialize(AdpSettings.State)` actually emits (declaration order: offDesigners, showGrid, snapToGrid, openingZoom, designerSettings; the serializer's root element is `State`, which the component store renames to `component name="AdpSettings"`). A first draft in alphabetical order was corrected after the serializer output showed declaration order.

How it was verified: a throwaway JUnit 5 test (`core/src/test/java/etalii/adp/core/settings/BaselineAdpXmlThrowawayTest.java`, modelled on `AdpSettingsStateRoundTripTest`, never committed, deleted with the worktree) loaded the file with `JDOMUtil`, passed the `component` element to `new AdpSettings().loadState(...)` and asserted: `isOff("etalii.adp.drawio")` true, freemind not off, `canvas()` equals `CanvasOptions(true, false, 1.5)`, `choice("etalii.adp.sample.settings", SettingSampleProvider.DIRECTION)` equals `left`; it then built the same values through the API (`setOff`, `setCanvas`, `setValue`) and asserted `JDOMUtil.write(getState())` is byte-identical to the file's component body (renamed to `State`, `name` attribute removed) and to the re-serialized loaded state. `gradlew.bat :core:test --tests "*BaselineAdpXmlThrowawayTest"`: 1 test, 0 failed, BUILD SUCCESSFUL.

## intellij.sha256

152 lines, `<sha256>  etalii.adp.ide.intellij/<path>`, sorted by path. Covers every tracked file under `*/src/*test*/resources/` (4 files: the three module test `META-INF/plugin.xml` and `src/integrationTest/resources/META-INF/services/org.junit.platform.launcher.LauncherSessionListener`) plus every tracked file under the module `testdata/` folders (`core/testdata`, `drawio/testdata`, `freemind/testdata`: 148 files), since that is where this repo keeps its test fixtures. Hashes are of the committed blob (`git cat-file blob HEAD:<path> | sha256sum`), i.e. LF line endings; the working tree has `core.autocrlf=true` and checks these out as CRLF, so hashing checked-out files on Windows gives different values.
