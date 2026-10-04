# Quickstart: proving Specification Licence

Run from the root of `etalii.adp` unless a step says otherwise. Contracts: [licence-check](contracts/licence-check.md), [licence-statement](contracts/licence-statement.md).

## Prerequisites

- Python 3.12 or later; `pip install jsonschema` for the examples check.
- `gh`, signed in, for the GitHub checks.
- A clone of `etalii.adp.site` with `npm install` done, for the refresh dry runs.

## 1. Every document states its licence (User Story 2, SC-001)

```bash
python .github/scripts/licence-check.py
```

Expected: `ok   LICENSE: Apache-2.0, Copyright © Peter Vrenken 2026`, one `ok` line for each of the seven specification documents, `7 specification document(s), 0 failure(s).`, exit code 0.

Open one working draft and one placeholder on GitHub and follow the `Licence` link: it opens the repository's `LICENSE`.

## 2. The check catches the faults (User Story 3, SC-004)

Make each fault in the working copy, run the check, see it fail with the cause, and `git restore` the file.

| Fault | Expected failure |
|---|---|
| Delete the `Licence` row from `specifications/desl/DESL-specification.md` | `FAIL specifications/desl/DESL-specification.md: no Licence row in its header table` |
| Change `` `Apache-2.0` `` to `` `MIT` `` in `specifications/did/DID-specification.md` | `FAIL specifications/did/DID-specification.md: states MIT, the repository's licence is Apache-2.0` |
| Delete a paragraph of the terms in `LICENSE` | `FAIL LICENSE: its terms are not the Apache License 2.0` |

Two more, beyond the three the spec counts:

| Change | Expected |
|---|---|
| Add and stage a copy of `LICENSE` as `specifications/disl/LICENSE` | `FAIL specifications/disl/LICENSE: a second licence file; …` |
| Add a folder `specifications/xyz/` with an `XYZ-specification.md` that has the row | passes, with an `ok` line for it and no other change (User Story 3, scenario 3) |

## 3. Nothing else broke (SC-005)

```bash
python .github/scripts/validate-examples.py
python .github/scripts/terminology-check.py --name etalii.adp
```

Expected: both exit 0. On the pull request, the Build workflow's `examples`, `terminology` and `licence` jobs pass.

## 4. GitHub still identifies the licence (User Story 1, SC-003)

Before the merge, for the branch; after it, for `develop`:

```bash
gh api "repos/etalii-adp/etalii.adp/license?ref=features/003-specification-licence" --jq .license.spdx_id
gh api "repos/etalii-adp/etalii.adp/license?ref=develop" --jq .license.spdx_id
```

Expected: `Apache-2.0` each time.

## 5. The site's refresh is unaffected (User Story 1, SC-002)

After the merge, in `etalii.adp.site`:

```bash
npm run reference:refresh -- disl --dry-run
npm run reference:refresh -- did --dry-run
```

Expected: each report has `Licence: Apache-2.0`, ends `Dry run: nothing written.`, and refuses nothing. The dry-run report does not print the copyright; it is the first `Copyright ` line of the file the refresh reads, so read it the same way:

```bash
gh api "repos/etalii-adp/etalii.adp/license?ref=develop" --jq .content | base64 -d | grep -m1 "^ *Copyright "
```

Expected: `Copyright © Peter Vrenken 2026`.

The prose the dry run reads still has the header table in the first section of DISL and of DID, now with the `Licence` row (User Story 2, scenario 3). Nothing is committed in `etalii.adp.site`.
