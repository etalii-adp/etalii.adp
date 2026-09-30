# Quickstart: proving Format Binding

How a reviewer checks the delivered feature. Prerequisites: Python 3.12 or later with `jsonschema` (`python -m pip install jsonschema`), a checkout of `features/005-format-binding`.

## 1. Every example, registration and fixture is valid and consistent (SC-001, SC-002)

```text
python .github/scripts/validate-examples.py
```

Expected: an `ok` line for every `*.dis`, `*.did`, `*.fbl`, every `specifications/fbl/**/*.adp` and every `specifications/fbl/fixtures/*/fixture.json`, and a final line with 0 invalid. A fixture's `ok` line means its splices turn each document into the next and their inverses turn it back.

Negative check: change one byte of an expected document in any fixture, rerun, and see that fixture fail with the step and offset; revert.

## 2. Every splice operation has a fixture (SC-002)

```text
python -c "import json,glob;ops={s['operation'] for f in glob.glob('specifications/fbl/fixtures/*/fixture.json') for st in json.load(open(f,encoding='utf-8'))['steps'] for s in st['splices']};print(sorted(ops))"
```

Expected: all eleven operations of the catalogue (FBL section on splices).

## 3. The document stands alone (SC-004, principle II)

Read `specifications/fbl/FBL-specification.md` start to finish with only `fbl.schema.json` and the examples beside you, and check that each of the following is answered normatively: how each family's lossless reading assigns bytes to nodes; the formatting of new text; every splice operation and its inverse; undo, redo and drift; tolerant reading and the unreadable body; the registration; several readings; folder subjects; routing; the plugin contract.

## 4. DISL points at FBL and at nothing else (FR-003)

```text
git diff develop -- specifications/disl/
```

Expected: only the `format`/`binding` rows and paragraph of §11.2, one informative sentence in §11.1, one sentence each in §14.2 and §14.5, and the `Persistence` changes in `disl.schema.json` (contracts/disl-hook.md).

## 5. The boundary with DISL 0.2 holds (SC-006)

```text
grep -n -i "id strateg\|finding\|source location\|unstable\|derived node" specifications/fbl/FBL-specification.md
```

Expected: every hit refers to DISL (0.2) for the definition; none defines one.

## 6. The definitions are accounted for (FR-091, SC-003, SC-005)

Open `specs/005-format-binding/inventory.md` and the FBL document's informative section on today's definitions: all 25 definitions are listed with their outcome, at least 12 of the 24 plugin-backed ones become declared bindings, and every `x-adp` routing key and registration header found has an FBL equivalent.
