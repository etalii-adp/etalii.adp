# Quickstart: seeing the grammar family work

How a reviewer checks the delivery in `etalii.adp.ide.standalone`, once all eight tasks have merged. What each command proves is in [tasks.md](tasks.md); the design is in [plan.md](plan.md).

## Prerequisites

- A fresh worktree of standalone's `develop`, the .NET 10 SDK, and `npm ci` run once in its `src/`.
- `MSBUILDDISABLENODEREUSE=1` and `DOTNET_CLI_USE_MSBUILD_SERVER=0` set, as CLAUDE.md's *Running the backend tests* says.

## The fixtures

From `src/backend/`:

```bash
dotnet test --project EtAlii.Adp.Specification.Fbl.Tests -- --filter-method "*ConformanceFixturesTests*"
```

Expected: every fixture passes, `w3c-turtle-grammar`, `w3c-turtle-grammar-partial` and `grammar-split-slot` among them, and `TheGrammarFixturesAreRunLikeEveryOther` finds no fixture still held back.

## The family's own tests

```bash
dotnet test --project EtAlii.Adp.Specification.Fbl.Tests -- --filter-namespace "*.Grammar"
```

Expected: the loading refusals of Requirement 2 (each binding seen to load before its defect is planted), the conflict messages, the bounds, the tree and its spans, reading in part, writing and its read-again refusals, and the split cut.

## Nothing else changed

The four gates, from `src/`: `npm test`, `npm run typecheck`, and from `src/backend/` `dotnet format style --verify-no-changes --severity info` and `dotnet test --solution EtAlii.Adp.slnx`, each exit code captured. Then `bash .github/tools/inspect/inspect.sh` from the worktree root. All exit zero; no transcript or `RealFiles/divergences.json` changed (`git diff origin/develop --stat` names only the FBL library, its tests, `.gitattributes`, `src/Directory.Packages.props` and documentation).
