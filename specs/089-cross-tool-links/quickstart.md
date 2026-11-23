# Quickstart: Validating Links Between Tools

Run from the repository root of etalii.adp, with the clones side by side.

1. `pip install -r .github/scripts/requirements-atd.txt`
2. `python .github/scripts/validate-examples.py`: validates the changed schemas and examples, parses every link in `definitions/examples/links/` and `specifications/fbl/fixtures/links-workspace/` against [link-form.md](contracts/link-form.md), and replays resolution over the fixture.
3. `python .github/scripts/atd-grammar.py --check`: the grammar with the new members builds as strict LALR(1) and its generated files match.

Expected outcomes, each a row of `fixtures/links-workspace/conformance.json`:

| Case | Expected |
|---|---|
| A link to a renamed and moved knowledge file | resolved by id; `document-name` rewritten after load (SC-002) |
| A link to a copied dependency graph (same id, different name) | resolved by name |
| A link to a copy with the same id and name in another folder | `link.ambiguous-document` with both paths (SC-003) |
| A link to a deleted row | `link.broken-element` |
| `k3f9x2ma@provinces.yaml` | `link.malformed`, kept as written |
| A link with a stale cached name | name rewritten after load |
| The old-form `cities.yaml` | converted; the set of (row, related row) pairs equals the original's (SC-004) |
| A knowledge file without an id | gets an 8-character `0-9a-z` id at load |

What only a host shows (the lookup, the picker, badges, navigation, "Linked from", Freeplane round trip) is checked in each host's specification (SC-001, SC-005, SC-006).
