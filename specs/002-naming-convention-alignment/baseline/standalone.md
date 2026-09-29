# Baseline: etalii.adp.ide.standalone on origin/develop

Spec 002 "Naming convention alignment", T001 and part of T004. Recorded 2026-09-29, before anything is renamed.

- **Commit:** `762cc55e9b6da99fd46634a780fb58ec3ec67a33` ("Merge pull request #105 from etalii-adp/claude/project-thread-fskb5k"), committed 2026-09-28T20:59:24+02:00
- **Tree:** fresh detached worktree `.claude/worktrees/bl2` from `origin/develop` (after `git fetch origin develop`), removed afterwards
- **Machine:** Windows 11 Pro 10.0.26200, run locally (not CI)

## Fresh-tree preparation (not gates)

| Step | Command (dir) | Exit | Duration |
|---|---|---|---|
| Install | `npm ci` (`src/`) | 0 | - |
| Codegen | `npm run generate` (`src/client/`) | 0 | - |
| Build | `dotnet build EtAlii.Adp.slnx` (`src/backend/`) | 0 | 178 s; 0 warnings, 0 errors |

## The four gates

Each exit code was captured into a variable straight after the command. dotnet commands ran with `MSBUILDDISABLENODEREUSE=1` and `DOTNET_CLI_USE_MSBUILD_SERVER=0`. The gates ran one after another, not in parallel.

| Gate | Command (dir) | Exit | Counts | Duration |
|---|---|---|---|---|
| Backend tests | `dotnet test --solution EtAlii.Adp.slnx` (`src/backend/`) | **2** | total 8195, succeeded 8149, **failed 2**, skipped 44; 32 test assemblies; no "Zero tests ran" | 688 s wall (runner reported 10m 35s) |
| Backend style | `dotnet format style --verify-no-changes --severity info` (`src/backend/`) | 0 | no findings | 173 s |
| Client tests | `npm test` (`src/client/`) | **1** | files: 185 passed, 1 failed (186); tests: 1982 passed, **1 failed** (1983) | 159 s wall (vitest reported 53.4 s) |
| Client typecheck | `npm run typecheck` (`src/client/`) | 0 | `tsc --noEmit`, no errors | 64 s |

**Two of the four gates are red on develop before any change.**

### Backend failures (EtAlii.Adp.Backend.Tests, the only failing assembly; the other 31 passed)

1. `ShippedExampleModelsTests.EveryShippedExample_IsExportedAsTheModelItsCanvasReceives`: "These exported example models were stale and have been rewritten - commit them: module-causal-loop." (`Integration Tests/ShippedExampleModels.Tests.cs:118`).
   - **This reproduces every time.** A rerun on its own failed again and rewrote the file byte-for-byte the same way.
   - **The test changes a tracked file:** `src/fixtures/cross-tier/example-models/module-causal-loop.json`. It rewrites one base64 `deltas` entry (for `on-call/on-call.adp`). The changes look like last-bit floating-point differences in coordinates, plus one field that is left out (a value that became exactly 0).
   - The file last changed in `2ad7ff9b` (2026-09-27). This is either a regression on develop or a Windows vs Linux floating-point difference that CI (ubuntu) does not see. That is not established.
   - The file was restored with `git checkout` after each run. The hashes below are of the unmodified file.
2. `TimelineFlowTests.RemovingAConnectedElement_AsksWithTheCount_AndTheWholeRemovalIsOneUndo`: "plan.tml could not be written. The change is still here to try again." (`Integration Tests/TimelineFlow.Tests.cs:348`). **Passed when rerun on its own**, so it looks like a flake (a Windows file-write or lock race under load).

### Client failure

- `src/shell/panels/DiagramPanel.test.tsx` > "names the type it has no canvas for, rather than showing a blank surface": it could not find the text "No canvas can render vendor/unheard-of diagrams yet.", and the DOM was still showing the "Loading architecture.adp" placeholder.
- **The file passed 6/6 when rerun on its own**, and the same client tests passed inside `dotnet test` (EtAlii.Adp.Client.Tests). So it looks like a timing flake under load.

### Warnings worth noting

- The integration-test log contains expected ERR/WRN lines from tests that exercise failure paths (for example the HierarchyService watcher, and the ContextService "could not be written"). These are not failures.
- Node prints `ExperimentalWarning: localStorage is not available` during generate and test. This is harmless.

## Hashes (`standalone.sha256`)

- **790 files.** These are every tracked file (`git ls-files`) under `src/examples/` (667) and `src/fixtures/` (38), plus every tracked `*.adp` file anywhere (181 in total, of which 85 are outside those two folders). Duplicates were removed.
- Format: `<sha256>  etalii.adp.ide.standalone/<path>`.
- **The hashes are of working-tree bytes** in a fresh checkout under `.gitattributes` (`* text=auto eol=crlf`). Text files are therefore CRLF on disk, and LF in the index. Compare against a fresh checkout on Windows, not against blobs.
- The hashing overlapped the backend test run, which rewrites one fixture. So the whole list was re-verified against the clean tree afterwards with `sha256sum -c`: all 790 matched, exit 0.
