# Contract: the licence check

`.github/scripts/licence-check.py`, run by the `licence` job of the Build workflow and by hand.

## Invocation

```text
python .github/scripts/licence-check.py
```

No arguments, no network, standard library only. It reads the repository the script sits in (two folders up from the script), and `git ls-files` for the tracked file names.

## What it checks

In this order; it reports every failure, not only the first.

| # | Check | Requirement |
|---|---|---|
| 1 | `LICENSE` exists at the root | FR-001 |
| 2 | The terms of `LICENSE`, up to and including `END OF TERMS AND CONDITIONS`, whitespace collapsed, have the pinned SHA-256 of the Apache License 2.0 | FR-001, FR-006 |
| 3 | `LICENSE` has exactly one filled-in `Copyright ` line, `Copyright © Peter Vrenken 2026` | FR-002 |
| 4 | No other tracked file named `LICENSE*`, `LICENCE*`, `COPYING*` or `UNLICENSE*` (any case) at the root or under `specifications/` | FR-001, FR-006 |
| 5 | Every folder directly under `specifications/` holds `<NAME>-specification.md` | FR-005 |
| 6 | Each such document's header table has one `Licence` row naming `Apache License 2.0`, giving `` `Apache-2.0` `` and linking `https://github.com/etalii-adp/etalii.adp/blob/develop/LICENSE` | FR-003, FR-004, FR-005 |

## Output

One line per thing checked, the path relative to the repository root with forward slashes, then a summary line.

```text
ok   LICENSE: Apache-2.0, Copyright © Peter Vrenken 2026
ok   specifications/ded/DED-specification.md
…
7 specification document(s), 0 failure(s).
```

Failures, each naming its cause:

```text
FAIL LICENSE: missing
FAIL LICENSE: its terms are not the Apache License 2.0
FAIL LICENSE: expected one copyright line, 'Copyright © Peter Vrenken 2026', found <what was found>
FAIL <path>: a second licence file; the repository keeps one, LICENSE at its root
FAIL specifications/<name>: no <NAME>-specification.md
FAIL <document>: no Licence row in its header table
FAIL <document>: more than one Licence row in its header table
FAIL <document>: states <found>, the repository's licence is Apache-2.0
FAIL <document>: the Licence row does not name the Apache License 2.0
FAIL <document>: the Licence row does not link <address>
```

`<found>` is the SPDX id in code form the row gives, or `no SPDX id`.

## Exit code

`0` when nothing failed and at least one specification document was found; `1` otherwise.

## The job

```yaml
licence:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v7
    - uses: actions/setup-python@v7
      with:
        python-version: '3.13'
    - name: Check the licence file and every specification's licence statement
      run: python .github/scripts/licence-check.py
```

It runs on the same events as the `examples` job: pull requests into `develop`, pushes to `develop`, and by hand.
