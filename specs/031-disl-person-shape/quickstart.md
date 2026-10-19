# Quickstart: Checking the Person Shape

How to tell that the change described in the [plan](plan.md) is done. Run from the repository root of the worktree.

## 1. The checks exit zero

```bash
python .github/scripts/validate-examples.py;            echo "validate=$?"
python .github/scripts/licence-check.py;                echo "licence=$?"
python .github/scripts/terminology-check.py --name etalii.adp; echo "terminology=$?"
```

Expected: all three `0`; the validator lists `specifications/disl/c4-container.dis` as `ok`, and the example count is unchanged.

## 2. The example uses the built-in

```bash
python - <<'E'
import json
d = json.load(open("specifications/disl/c4-container.dis", encoding="utf-8"))
print(d["disl"], d["notation"]["nodes"]["Person"]["shape"], "c4Person" in d["notation"].get("shapes", {}))
E
```

Expected: `0.4 person False`.

## 3. A planted fault is caught

Change `"shape": "person"` in the example to `"shape": { "type": "person", "params": 8 }` and run the validator: it must report the example invalid (`params` must be an object). Put it back. This shows the validator reads the changed node, not a cached copy.

## 4. A reading check against the contract

Read section 6.7 and Appendix B.2 alone, and answer, for bounds of 160 by 100 at the origin:

| Question | Expected answer | Contract |
|----------|-----------------|----------|
| Where is the head's centre, and what is its radius? | (80, −8), 10 | P2 |
| What is the body's corner radius by default, and for bounds of 12 by 40? | 8; 6 | P1, C4 |
| Which is painted on top where they overlap? | The body | P3 |
| Where does a relation arriving from straight above end? | On the body's top edge | P4 |
| Does a click at (80, −14) select the node? | Yes | P5 |
| Where is the label laid out? | In the body, minus padding | P6 |
| Does fitting the diagram to the view include y = −18? | Yes | P7 |
| Does `actor` change? | No | C1, Unchanged |

Every answer must be found in the text with its key word; an answer that has to be inferred from the C4 definitions or a host is a gap.

## 5. Nothing else moved

```bash
git diff --stat origin/develop -- specifications/ definitions/
```

Expected: only `specifications/disl/DISL-specification.md` and `specifications/disl/c4-container.dis`.
