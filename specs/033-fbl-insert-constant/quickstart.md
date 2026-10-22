# Quickstart: checking An Insert Writes a Constant

## In etalii.adp

From the repository root, with Python 3 and `jsonschema` installed:

```bash
python .github/scripts/validate-examples.py; e1=$?
python .github/scripts/terminology-check.py --name etalii.adp; e2=$?
python .github/scripts/licence-check.py; e3=$?
echo "$e1 $e2 $e3"
```

Expected: `0 0 0`, the four `insert-constant-*` fixtures listed as valid and `refused/insert-constant-collision.fbl` listed as refused with its reason.

Seen to fail, then restored:

1. Change one `start` offset in `fixtures/insert-constant-yaml/fixture.json` by one: the validator fails on that step (SC-003).
2. Make the colliding attribute in `refused/insert-constant-collision.fbl` read-only: the validator fails, because a document under `refused/` is accepted (FR-006).
3. Add `"emit"` beside `"constant"` in one fixture's binding: the schema refuses it.

`cmp fixtures/insert-constant-yaml-read/board.yaml <(the expect of the last step of fixtures/insert-constant-yaml/fixture.json)` shows the read-back body is the written one (FR-009); the task that writes the fixtures runs this comparison.

## In etalii.adp.ide.standalone

In the worktree of `features/033-fbl-insert-constant`, from `src/backend/`, with `MSBUILDDISABLENODEREUSE=1` and `DOTNET_CLI_USE_MSBUILD_SERVER=0`:

```bash
dotnet test --solution EtAlii.Adp.slnx; e=$?; echo $e
```

Expected `0`, with `InsertConstant` tests and the vendored `insert-constant-*` fixtures among those run; each new test was seen to fail before the library change. The other three gates of that repository's `CLAUDE.md` exit zero too, and `bash .github/tools/inspect/inspect.sh` reports no finding.
