# Contract: the test data under `fbl/testdata/`

The files the tests read, their shapes, and the rules that keep them honest. All paths are in `etalii.adp.ide.intellij`.

## Protection from line-ending conversion

`.gitattributes` gains this line before the first corpus file is added:

```text
fbl/testdata/** -text
```

Copied files are written with `git archive` from the source commit, never from a working tree.

## Layout

```text
fbl/testdata/
  conformance/   *.fbl, fixtures/, registrations/, README.md, SHA256SUMS
  real/          src/..., README.md
  baseline/      fbl-test-inventory.md
  divergences.json
```

## `conformance/`: the conformance corpus

| Item | Rule |
| --- | --- |
| Content | The eight `.fbl` documents, `fixtures/` and `registrations/` of `specifications/fbl/` in `etalii.adp`, unchanged |
| Source | The `etalii.adp` commit on `develop` at the time of copying |
| `README.md` | Records that commit, the licence (Apache-2.0), and that the files are never edited there |
| `SHA256SUMS` | Lists every file of the folder with its SHA-256 |
| Guard | `CorpusUnchangedTest` checks each file against `SHA256SUMS`, names the file that differs, and fails when the folder is empty |

A fixture is what FBL section 15.3 defines: an input body, the reading it yields, and steps. Its steps are read from `fixture.json`. The runner supports `expectFile`, a splice's `file` and `add.after`, although no fixture uses them today. A fixture whose input ends in `.adp` runs against the registration with no body beside it.

## `real/`: the real-file corpus

| Part | Where | Recorded minimum |
| --- | --- | --- |
| The repository's own maps | every `.mm` file under `freemind/testdata` | 108 |
| timeline | `fbl/testdata/real/src/...` | 15 |
| causal loop | `fbl/testdata/real/src/...` | 4 |
| structurizr | `fbl/testdata/real/src/...` | 16 |
| databricks job | `fbl/testdata/real/src/...` | 4 |
| databricks pipeline | `fbl/testdata/real/src/...` | 2 |
| Registrations | every `.adp` beside one of the 41 copied files that names it | recorded at copy time |

The 41 copied files are those standalone's `RealFileCorpus` selects at `25fc7b4a`, with their paths under `src/` kept. `README.md` records the commit and the Apache-2.0 licence. A file whose licence is share-alike or unknown is refused. No copied file contains the previous host's name.

Each enumeration asserts its recorded minimum (FR-021). A `.mm` file added to the repository's maps is picked up without a change to the tests.

## `baseline/fbl-test-inventory.md`

A Markdown table of exactly 86 rows, one for each test of standalone's FBL test project at `25fc7b4a`.

| Column | Content |
| --- | --- |
| Baseline test | `File.Method` |
| Counterpart | `Class.method`, or `not applicable` |
| Reason | Filled when the counterpart is `not applicable` |

Counterparts keep standalone's method names in lower camel case. Its 117 theory rows become `@ParameterizedTest` rows with the same values.

`BaselineCoverageTest` parses the table, asserts 86 rows, and asserts that every named class and method exists.

The only rows that may be `not applicable` (FR-018, SC-002):

- the four registration tests that need standalone's C4 legacy sidecars, W3C reading suggestions, chart folders and Turtle files;
- the three module parsers of the cross-check this host does not have: timeline, causal loop and C4.

## `divergences.json`: the divergence record

A JSON array. Each entry is an object with exactly these keys:

```json
{ "property": "", "binding": "", "file": "", "observed": "", "reason": "" }
```

| Key | Content |
| --- | --- |
| `property` | The property that disagrees, by standalone's property names, or `cross-check` |
| `binding` | The binding, as `mindmap.fbl#freeplane` |
| `file` | The file, by its path in the corpus |
| `observed` | What was observed |
| `reason` | Why it is accepted |

A check fails on an unlisted disagreement, on a listed one whose observation changed, and on a listed one that no longer occurs (FR-022). An entry is added only when this host's tests show the disagreement. A copied binding is never edited, a file never skipped and an assertion never weakened instead.

The shape and the paths are standalone's, so the two hosts' records can be compared entry by entry. A difference between them is a finding under FR-014 and goes to `etalii.adp` (FR-027).
