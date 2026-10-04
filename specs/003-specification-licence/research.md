# Research: Specification Licence

Decisions for the plan, each with what was found in the repository and in `etalii.adp.site` on 2026-10-04 (`etalii.adp` at `3396177`, `etalii.adp.site` at `a95c954`).

## R1. What has changed since the feature was specified

**Found**:

- `LICENSE` already carries `Copyright © Peter Vrenken 2026`, in the appendix of the Apache text where the template line `Copyright [yyyy] [name of copyright owner]` stood (commit `f0e3874`, 2026-09-30). GitHub still identifies the file as `Apache-2.0` (`GET /repos/etalii-adp/etalii.adp/license?ref=develop`).
- The site has published DISL 0.1 and DID 0.1. Their `source.json` records `"licence": "Apache-2.0"` and `"copyright": "Copyright © Peter Vrenken 2026"`. The refresh's `copyrightOf` takes the first line starting with `Copyright ` that has no `[…]` placeholder.
- Feature 005 added a seventh specification document, `specifications/fbl/FBL-specification.md`. Its header has no licence row.
- A second tracked file named `LICENSE` exists: `.specify/extensions/companion/LICENSE`, the MIT licence of the vendored SpecKit Companion extension.

**Decision**: FR-001 and FR-002 are met on `develop` already; this feature changes nothing in `LICENSE` and only verifies and guards it. The feature covers every specification document the naming rule finds, seven today. The spec is updated to say so (it named six).

**Rationale**: FR-005 already finds documents by the naming rule, so FBL is checked whether or not the spec lists it; listing it keeps spec and check in agreement.

**Alternatives considered**: leaving FBL to a later feature, rejected because the check would then fail on `develop` or need an exception list, which FR-005 forbids.

## R2. The form of the licence statement

**Decision**: one row, the last in the header table of each specification document:

```markdown
| Licence | [Apache License 2.0](https://github.com/etalii-adp/etalii.adp/blob/develop/LICENSE) (`Apache-2.0`) |
```

The label is `Licence`, as the readme spells it. The link is the absolute address of the repository's licence file on `develop`.

**Rationale**: User Story 2 has the reader open the document on GitHub, in a copy, or on the site. A relative link (`../../LICENSE`) works only on GitHub: a copy has no `LICENSE` two folders up, and the site publishes a language's folder, not the repository root. The header table is where version, schema and extension already stand, and the site makes it the cover of the first section, which gives scenario 3 of User Story 2 without a change to the site.

**Alternatives considered**:

- A relative link, as the other header links are. Rejected for the reason above.
- A link to `https://www.apache.org/licenses/LICENSE-2.0`. Rejected: FR-003 asks for the repository's licence file, which also carries the copyright notice.
- A sentence under the table, or an SPDX comment (`<!-- SPDX-License-Identifier: Apache-2.0 -->`). Rejected: a comment is invisible to the reader FR-003 serves, and a sentence is harder to check than a table row.

## R3. Version and date of the documents

**Decision**: adding the row changes no version and no `Date` row. DISL and DID stay 0.2, FBL stays 0.1, the placeholders stay without a version.

**Rationale**: principle IV versions the constructs of a language; the licence row changes no construct, schema or example, so principle II's "all three together" has nothing to update in the schemas and examples.

## R4. How the Build workflow checks the statements (FR-005)

**Decision**: a new script, `.github/scripts/licence-check.py`, standard library only, run by a new `licence` job in `.github/workflows/build.yml` on pull requests and on pushes to `develop`. It finds every `specifications/<name>/<NAME>-specification.md` where `<NAME>` is `<name>` in capitals, reads the first table of the document, and requires a row labelled `Licence` whose value names `Apache License 2.0`, gives the SPDX id `Apache-2.0` in code form, and links the address of R2. Its contract, with every failure message, is [contracts/licence-check.md](contracts/licence-check.md).

A folder under `specifications/` with no document of that name fails too, so a new language cannot escape the check by misnaming its document. `legacy/` folders hold no specification document by the naming rule and are not looked at.

**Rationale**: a script beside `validate-examples.py` and `terminology-check.py` follows what the repository already does; a job of its own keeps the failure legible in the pull request's checks. The repository's licence is a constant in the script, because R5 pins the licence text to Apache-2.0 anyway.

**Alternatives considered**: folding the check into `validate-examples.py`, rejected because that script is about schemas and its failure line counts examples; a Markdown linter with a custom rule, rejected under principle V as a new dependency for one rule.

## R5. How the Build workflow checks the licence file (FR-006)

**Decision**: the same script checks, without the network:

1. `LICENSE` exists at the root.
2. Its text from the first line up to and including `END OF TERMS AND CONDITIONS`, with runs of whitespace collapsed, has the SHA-256 the script pins for the Apache License 2.0. Only the appendix after that line may differ.
3. The file has exactly one line that begins with `Copyright ` and has no `[…]` placeholder, and it reads `Copyright © Peter Vrenken 2026` (FR-002, the line the site records).
4. No other licence file sits where it could be taken for the repository's or a specification's: no tracked file besides `LICENSE` whose name starts with `LICENSE`, `LICENCE`, `COPYING` or `UNLICENSE` (any case) at the root or anywhere under `specifications/`.

**Rationale**: GitHub identifies a licence by comparing the root licence file with known texts. A pull request cannot ask GitHub what it will say after the merge, and a check that needs the network fails for reasons that are not the contributor's. Pinning the terms is stricter than GitHub's comparison, so whatever passes the check GitHub identifies. GitHub's own answer is still read once after the merge (SC-003, quickstart).

**Second licence file**: the spec said "exactly one licence file". The vendored extension's `.specify/extensions/companion/LICENSE` is the licence of third-party material, must stay with it, and GitHub's identification looks only at the root. The check therefore guards the root and `specifications/`, and the spec's wording is tightened to that.

**Alternatives considered**: calling the GitHub licence API from the job, rejected for the reasons above; comparing the whole file byte for byte with a stored copy, rejected because it duplicates 200 lines to guard one.

## R6. Where the rule is recorded (FR-007)

**Decision**: amend the constitution through `/speckit-constitution`, version 1.2.0 → 1.3.0 (MINOR):

- Structure and Naming gains: a specification document states the repository's licence in its header table, placeholders included; the repository has one licence file, at its root.
- Development Workflow, the Build bullet, gains: the workflow also checks each specification's licence statement and the licence file.

`CLAUDE.md` ("Writing specifications") and `docs/new-repository.md` (the `LICENSE` bullet: the copyright line is filled in, not left as the template) follow in the same pull request.

**Rationale**: Structure and Naming is where the constitution sets out what a specification's files are; a new principle would overstate a one-line rule.

## R7. What is deliberately left alone

- `LICENSE` itself (R1).
- DISL's `license` attribute (DISL-specification.md, the specification's metadata table): it is the licence a tool engineer gives a tool specification, not the licence of the DISL document.
- Schemas, examples and `legacy/` material (spec, Assumptions).
- `etalii.adp.site` (FR-008): the refresh, its texts and its language list are not changed. FBL and the placeholders are not listed by the site; stating their licence only prepares them.

## R8. How the outcomes are proven

| Outcome | Proof |
|---|---|
| SC-001 | `licence-check.py` passes and prints one `ok` line per document, seven in all |
| SC-002 | `npm run reference:refresh -- disl --dry-run` and `-- did --dry-run` in `etalii.adp.site` after the merge report `Licence: Apache-2.0`; the copyright is read from the same GitHub answer the refresh reads |
| SC-003 | `gh api "repos/etalii-adp/etalii.adp/license?ref=develop"` gives `Apache-2.0` |
| SC-004 | three faults made in a working copy and reverted, each failing the script with its cause; the script is all the job runs |
| SC-005 | the Build workflow on this feature's pull request |
