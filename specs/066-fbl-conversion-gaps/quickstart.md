# Quickstart: checking FBL 0.10

What proves each pull request of the feature (research R1) works, from etalii.adp's root, with Python 3.13 and `pip install -r .github/scripts/requirements-atd.txt`.

## Every pull request

```bash
python .github/scripts/validate-examples.py; e1=$?
python .github/scripts/atd-grammar.py --check; e2=$?
python .github/scripts/terminology-check.py --name etalii.adp; e3=$?
python .github/scripts/licence-check.py; e4=$?
python .github/scripts/thinkrail-specs.py; git diff --exit-code thinkrail/; e5=$?
echo "$e1 $e2 $e3 $e4 $e5"
```

Expected: `0 0 0 0 0`. The validator lists the pull request's new fixtures as valid (their splices replayed, their undo and redo checked, and for a `grammar` fixture its `read` compared with what the reading check reads, research R20), every earlier fixture as valid unchanged (SC-004), and each new document of `refused/` as refused with its reason. `atd-grammar.py --check` builds `structurizr.lark` (A) or `wardley-map.lark` (C) in strict LALR(1) with no conflict and no terminal collision, and finds the committed tables of each equal to what it writes. The Build workflow's `descriptions` job checks every `.atd` with the desktop host's checker built from the pull request's `specifications/` (research R21).

## Seen to fail, then restored

For each new fixture, before it is committed (SC-003):

1. Change one `start` offset of one step by one: the validator fails on that step.
2. For a `grammar` fixture, change one expected attribute value in `read`: the reading check fails on that element.
3. For a fixture with `expectFiles`, change one byte of the expected sidecar: the validator fails on that file.

For each refused binding: make it pass its check (for `grammar-gather-writable.fbl`, mark the attribute `readOnly`): the validator fails, because a document under `refused/` is accepted.

For the grammars: add an alternative to `structurizr.lark` that makes a statement ambiguous (a second `person` rule): `atd-grammar.py --check` fails, naming the conflict's terminal and rules.

## Pull request A

- `structurizr-open-block` passes with `git diff --exit-code specifications/fbl/fixtures/structurizr-open-block/` empty, and its `read` is checked through the rewritten binding (FR-031).
- `w3c-turtle-grammar` and `w3c-turtle-grammar-partial` pass unchanged.
- The C4 companions name no gap of 1 to 8 as open (SC-006): `grep -n "^### [1-8]\." definitions/diagrams/c4-*.md` shows each heading marked answered.

## Pull request B

- `databricks-readings/*` pass: one body, three registrations, each with an edit.
- `databricks-template-key` passes: the template for `My_Job.yml` gives the key `my_job`.
- `dependency-graph-empty-flow-sequence` passes with its splices unchanged.

## Pull request C

- `wardley-legacy-identities` reads every id of `annotations-and-labels.identities.json` for its element, and no element gets a new id.
- Section 17 names `wardley-map.fbl` for the Wardley map.

## Pull request D (amendment of 2026-10-30)

- `structurizr-split-tags` reads `Extra` and `More` as two tags of the system `s`, and `structurizr-gathered-tags` reads `Last` and `Least`; removing `split` from `structurizr.fbl` makes both fail their reading check.
- `grammar-split-slot` replays every add, change and removal with its undo; removing `split` from `labels.fbl` makes its reading check fail.
- `split-not-many.fbl` and `split-escape-collision.fbl` are refused; without `split`, or with `split` `","`, each is accepted and the run fails.
- The C4 companions name gap 16 as answered: `grep -n "^| 16 " definitions/diagrams/c4-*.md` shows FBL 0.13 on each.

## In a host (not this feature's tasks)

A host that implements a construct vendors the merged fixtures unchanged and runs its conformance suite over them; each test is seen to fail before the library change (the standalone host's rule, and the desktop host's principle IV). For the standalone host that is c4-disl-fbl task 13, databricks-disl-fbl task 10 and wardley-map-disl-fbl task 11, with that repository's four gates and `inspect.sh` (constitution principle VI).
