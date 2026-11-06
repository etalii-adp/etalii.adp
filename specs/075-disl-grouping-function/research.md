# Research: A DISL Function That Groups a List by Key

Each entry records what was measured or decided, for the plan to rest on. Everything was measured on 2026-11-02, on an 8-core Apple Silicon Mac with 16 GB of memory, against `etalii.adp.ide.desktop` at 81c1fdc and its vendored `etalii.adp`. Each figure is one run unless it says otherwise, while at most two other measuring runs shared the machine. What is inferred rather than measured says so.

## R1. What was measured

**How.** A release build of `atd` (`cargo build --release -p adp-atd-cli`, with line tables), in a scratch worktree that is not committed. Three instruments:

- **The plain binary**, under `/usr/bin/time -l`, for the time that counts, and under the macOS `sample` tool for 30 seconds at each of 60, 300 and 600 seconds.
- **Temporary timers** in `adp-cel`: every compiled expression, by its text, with its evaluations, its inclusive and self time, its cost and its failures, and a wall-clock mark at each step of the case. They add little to the total: 773 seconds against 789, the two runs side by side.
- **Smaller bodies**: the first eighth, quarter and half of `geographic-names.ttl`'s statements, and the whole of it and of `business-economics.ttl`, each as a scratch case with no steps, so that its time is one reading.

**The figure was right, and the cause is what the specification assumes.** `atd validate --case geographic-names` took **789 seconds in wall time (13.2 minutes)**, 732 of them user time, and 437 MB of memory. It ran to its end: 5,083 triples, read five times over the 17 steps, because most edits are refused when no card is derived (R2), with the findings computed after every step.

| Where the time goes, whole case | Seconds of 767.6 | Share | Evaluations |
|---|---:|---:|---:|
| `skosTyped`: filter all triples, keep one type's subjects, including its `typeTriple` and `cardId` calls | 653.2 | 85% | 80,944 |
| `repeatSuffix`, in each triple's id rule: filter all triples for the same three parts | 100.8 | 13% | 25,498 |
| Every other expression | 4.0 | 0.5% | |
| Everything outside CEL: reading the Turtle, ids, the scene, comparing the drawing | 9.6 | 1.3% | |

So **98% of the time is two functions filtering the whole list again**. The Turtle read is not separately significant: all that is outside CEL is 1.3%, and in the first reading it is under a second. `elementById`, which is a linear scan, comes to 1.3 seconds. The sampling profile agrees and adds what the filtering is made of: 55% of the samples are in allocating and freeing, 20% in looking up names and comparing strings, 13% in the evaluator itself, the same at 60, 300 and 600 seconds. This says a faster evaluator could shrink the constant, not the shape (R3).

`skosTyped` runs 80,944 times because a rule asks it once per candidate: the constraint `nonConceptTarget` asks it per triple and accounts for 525 of those seconds, 17 evaluations of it at 31 seconds each, and `skosDrawable` asks it four times per id. Each ask is a pass over all triples, so the work is **the number of triples times the number of asks, which itself grows with the triples**.

**How time grows with size, one reading.**

| Body | Triples | Today, in CEL | Today, whole run | Prototype, whole run |
|---|---:|---:|---:|---:|
| first eighth | 875 | 3.9 s | 5.4 s | 2.1 s |
| first quarter | 1,710 | 11.7 s | 12.5 s | 2.3 s |
| first half | 2,884 | 29.1 s | 28.2 s | 2.5 s |
| `geographic-names` | 5,083 | 74.7 s | 70.1 s | 3.3 s |
| `business-economics` | 17,683 | not run | not run | 12.4 s |

Today's figures understate the rules' full cost, since the derived types fail early (R2). With both budgets raised in the scratch build, so that today's rules run to their end and derive their cards, a reading took 10.7 seconds at 875 triples, 30.5 at 1,710 and 79.1 at 2,884: growth of about the power 1.7. At 5,083 triples that would be about 200 seconds (inferred, not run), and the prototype's 28 readings over the case then about an hour and a half (inferred). A whole run includes about 1.9 seconds of loading and checking the description before any reading.

**The other three descriptions, reading the same body.**

| Description | Whole run | What dominates |
|---|---:|---|
| `w3c-owl` | 162 s | Three per-IRI `exists` reads, 150 s; `repeatSuffix`, 20 s (inclusive times overlap) |
| `w3c-rdf` | 86 s | `isCell` per triple, 26 s self; `repeatSuffix`, 20 s; `distinct().indexOf(id)` per card, which goes over its cost 934 times of 934 |
| `w3c-shacl` | 23 s | `repeatSuffix`, 20 s of its 21 |

They are the same filtering with the same remedy. Their rewrite was not tried; that it gives the same gain is inferred.

## R2. What goes over, which the specification does not say

The specification and `w3c-rdf.md` speak of `limits.celCost`. What stops the card types today is another budget.

- **ATD's step budget (§12.6) stops every `from`.** All three node types fail with "`cardId` ran past the gesture's budget of 100000 steps." That is why the case derives no card, even on the first eighth of the body. A call of a description's function from a CEL expression is a script call, at about three steps, and the first `skosTyped` of a `from` alone makes more than the budget allows, one `cardId` per typed triple per ask. The cases that pass are small enough not to meet it.
- **`limits.celCost` is met once, by a declared cost.** `familyTruncated` goes over 1,000,000 with a cost of 52,437,934, because `distinct()` declares a cost of the square of its length, here 7,245 items. It fails on this body at every evaluation. `w3c-rdf`'s `order` does the same 934 times.
- **Per-expression budgets do not add up across functions on the desktop.** A function body's expression gets a budget of its own (`Frame::evaluate`), so the caller is charged for the call, not its work. That is why `limits.celCost` was not met by the filtering. DISL §2.5's limit is per expression, so this is not a defect, but it is why 13 minutes went by with no CEL budget overrun. This plan leaves it as it is.

The specification's sentence "no expression over its cost limit" (SC-002) is read here as covering both: no expression goes over `limits.celCost`, and no reading goes over the step budget. Neither limit is raised, as the specification says.

## R3. The name and signature

- **Decision**: a macro, `l.groupBy(x, key)`, with `x` bound to each item in `key`, as `sortBy`, `map` and `filter` are written. It gives a value of a new opaque kind, a *grouping*.
- **Rationale**: FR-001 asks for "a function that groups a list by a key expression", and a key expression that sees each item is a macro in CEL. `sortBy` in the lists extension (DISL §12.1) is the model for the name and the shape. It is one macro in the existing language, which is what "not a query language" asks.
- **The name's other use**: `groupBy` is already a setting of a compartment (DISL §6.9, an enum attribute's heading). One is a schema key and the other a CEL macro, and they cannot meet, so this seemed acceptable.
- **Alternatives considered**:
  - **A method on the diagram**, such as `diagram.triplesBy('Triple', ...)`, memoised as `knots` is. Refused: FR-001 groups a list, and the function would be no use on a list a description has already filtered.
  - **A faster evaluator with no language change.** Refused as the answer, kept as an option. The samples say allocating is 55%; if all of that went, 13 minutes would still be about 6 (inferred), and the step budget would still stop every `from`.
  - **Memoising a description's function by its arguments.** It would make `skosTyped` cheap with no change to the rules, but not `skosLabels(item, predicate)`, whose arguments differ per card, nor `repeatSuffix`, whose argument differs per triple. Each still filters the whole list.
  - **Raising the budgets.** Excluded by the specification, and it would give 13 minutes or more of evaluation for every case.

## R4. What a read of a group looks like

- **Decision**: `g.get(k)` gives the list of items with key `k`, in list order, and `[]` for a key that is absent. `g.keys()` gives the distinct keys in order of first appearance. A grouping has no other member. It is not a map and cannot be indexed, compared or stored in an attribute.

```cel
diagram.nodesOfType('Triple').groupBy(t, t.p).get('http://www.w3.org/2004/02/skos/core#broader')
xs.groupBy(x, x).keys()   // the distinct strings, in order, at a cost in the length of xs
```

- **Rationale**: FR-003 asks for an empty group on an absent key, where CEL's `m[k]` fails and `m[?k].orValue([])` is a mouthful in every rule. CEL's maps here have string keys only, and FR-002's order needs the keys listed anyway. `keys()` also gives the descriptions a linear `distinct` on strings, which R2 shows they need.
- **Alternatives considered**: a plain CEL map, refused for the reasons above; `g[k]`, refused because an index that never fails would differ from every other index in CEL.
- **What the prototype shows**: its ten keyed groupings all read this way, and each key is a short expression (R11). Where a rule needs two parts, it concatenates them: `t.s + '|' + t.p + '|' + t.o`.

## R5. Whether a grouping is kept, and for how long

This is the decision to challenge first. **A grouping kept only within one evaluation does not solve the problem.**

| Run, one reading | Keeps groupings | 875 triples | 1,710 triples | 5,083 triples |
|---|:--:|---:|---:|---:|
| The prototype | yes | 2.1 s | 2.3 s | 3.3 s |
| The same rules | no | 7.6 s | 21.5 s | 221.5 s |

The reason is structural. A card's attribute, a triple's id rule and a budget's `order` are each their own evaluation (DISL §4.11.5), so in `cel.bind` a grouping lives for one attribute of one card and is then made again. The work is then the same as today's filter: one pass per read. A description could carry groups through its `from` as part of each item, and that does help derived types, but not an id rule, which has no `from`, and `repeatSuffix` alone is 13% of today's time and all of SHACL's.

- **Decision**: a runtime **MAY** keep a grouping for as long as nothing it read has changed, the result **MUST** equal grouping again, and the cost is charged as if it had grouped again (R7). So it is an optimisation that §12.4 permits and the fixtures cannot see, as §4.11.5 already permits incremental recomputation and §12.4 asks for memoising graph traversals. On the desktop:
  - **A grouping is kept by the identity of its list and by the macro at that place in the expression.** `diagram.nodesOfType(t)` and `relationsOfType(t)` keep giving one list while their elements are the same, so a read in any later expression finds it. A list made afresh, such as one that came out of `filter`, is grouped anew, once per evaluation.
  - **It is kept only if its pass read nothing but its own item.** While a key is evaluated, the evaluator notes any read of a variable other than `x` and local bindings, of an element's `id` or a derived attribute, of another element, or a call of a description's function or a host object's method other than a stored attribute's read. If there was one, the result is not kept. Checking during the pass means a function cannot hide a read, and a key that reads the diagram stays correct, only slower.
  - **It is forgotten when a value changes**: where `forget_budgets` already fires for an element (`store`, retype, `set_parent`), a diagram attribute, and a relation's ends being resolved. A node added or removed changes the list's identity if it is of that list's type, and a new body is a new diagram. This is the specification's last edge case.
- **Rationale**: the prototype kept groupings by list and place, and 987,041 reads over the case found one where 112 made one. A derived card being added does not change the list of triples, so the groupings survive the derivation of the cards, which is what makes a reading linear.
- **Alternatives considered**:
  - **Normative memoisation with the first evaluation paying.** Refused: which expression goes over its budget would then depend on evaluation order, and differ between hosts.
  - **Declaring indexes in the description**, such as a memoised function or a named index. Refused by the specification ("not an index the author manages").
  - **Carrying groups through `from`.** Kept as a technique for the walk (R11), not enough alone, as above.
- **Inferred, not measured**: that the check made during the pass costs little. The prototype kept every grouping by list and place with no such check, and every key it used would pass it.

## R6. Free of side effects and deterministic

- **Decision**: yes to both, by this argument, and §12.4 says so.
  - **Side effects**: a kept grouping is not visible. No expression can tell whether it was kept: `get` gives a new list each time and a grouping has no identity CEL can compare. The state is the same kind as `diagram.cycles` and `knots`, "memoised until the diagram changes".
  - **Determinism**: group order and contents follow from list order, and §12.5 fixes the order of `diagram.nodes` and the lists like it. Keys are listed by first appearance, so the hash table a host uses is never seen. The macro is allowed in every deterministic context of §12.5. Cost does not depend on what was kept (R7), so what goes over a budget is the same on every host.

## R7. The cost model (FR-005)

**At run time.**

- **Decision**:
  - `groupBy` charges what one evaluation of the key costs, once per item. There is no further charge per item beyond the key's own steps.
  - `get` charges 1 plus the size of its group; `keys` charges 1 plus the number of keys.
  - **A kept grouping charges its stored cost again**, as if it had grouped. The cost is what the first pass spent, which the runtime stored. The memory then changes time and never a budget.
  - **Steps of ATD's budget**: a key that calls a description's function is charged its script steps each time, but such a key is never kept (R5), so the count is the same with or without a memory. An inline key costs no steps. So a description writes keys inline: the first prototype, with `cardId` in a key, ran over the step budget, and the second, inline, did not.
- **What the prototype saw**: it charged a kept grouping as above and a `get` as 1. At 5,083 triples the costliest function body that reads a group is charged 35,602 per evaluation, and at 17,683 triples 189,807, both within 1,000,000. The same charge in one expression once per item goes over, which is what the specification's edge case says should happen: "a grouping written inside a per-item expression costs one pass per item".

- **For the standalone host's plan**: on the desktop a description's function has a budget of its own for each expression (R2), so these charges do not add up across calls. A DISL function in a `.dis` shares its caller's budget (`evaluate_within(call.budget)`), where a rule that reads a group 30 times in one evaluation would go over at these sizes. Nothing in this feature runs that way, since the `.dis` files do not use the macro (R11), but the host that next implements it must decide.

**The validation-time estimate.**

- **Finding**: no host has one. DISL §2.5 says a runtime "SHOULD reject at validation time" an expression over its estimate, but `adp-disl`'s loader says that its CEL "is checked for names and arity, then evaluated dynamically under the cost limit", `adp-atd-check` has no cost finding, ATD §15 names no such code, and the standalone host's loader reads `celCost` as a limit only. So story 3's first scenario holds today, and its second, "as they are today", means no cost finding.
- **Decision**: DISL §12.4 states the rule for any estimator: `groupBy` estimates as `size(l)` evaluations of its key, and `get` as at most `size(l)`, a known bound for the group's size. T021 and T022 hold what `atd check` says. No estimator is written here (Constitution V): this feature does not need one, and writing one is a feature of its own. **This narrows story 3 in practice, and needs Peter's word (R12).**

## R8. Null keys and the kinds of key

- **Decision**: **a null key is a failing key.**
- **Rationale**: the specification leaves it open "only if the plan shows a description needs it". No description does. Stored attributes have defaults, so `t.language` is `''`, not null. Where the prototype's ten keyed groupings needed a "no key" bucket, they used `''`, which is a key like any other that nobody reads. So DISL states nothing extra for null, and a null from a missing value is reported, not silently grouped.
- **Numbers**: an int and a double of one value are one key, and the first one met is what `keys()` gives; 0.0 and -0.0 are one key; a NaN is a failing key, since it equals nothing. Comparison is exact, with no tolerance, although the desktop's `==` has one between an int and a double (`TOLERANCE` in `adp-cel`). A hash table cannot honour a tolerance and a tolerant key would not be transitive. DISL's `==` states no tolerance either, so this is a place where the desktop's `==` and this key can differ for an int and a double a millionth apart; the fixtures hold the exact rule.
- **List keys are refused** though §4.11.2's derived `key` takes them: the specification says "a key of another kind is a failing key", and concatenation served every use measured.
- **A failing key fails the grouping**, as any comprehension's failing body does, and the context handles it (FR-004, DISL §2.5). It is not per item: `&&` and `||` inside the key absorb a failure as they do anywhere.

## R9. Whether SC-002's 30 seconds is right

**No. The specification now says 60 seconds, with this note.**

| Run of `geographic-names` | Time |
|---|---:|
| Today, release | 789 s |
| The prototype, release, twice, with an index of ids that the plan does not ask for (about 4 s of `elementById` without it, inferred from the runs before and after) | 36.6 s, 36.0 s |
| The prototype, `cargo test --ignored` in the dev profile, with the workspace's optimised packages | 72.9 s |
| The prototype, through the WebAssembly module in Node | 40.2 s, with the same 18 differences as natively |

The prototype is 22 times faster than today, and the first reading takes about 1.5 seconds, but it does not reach 30 seconds. **What remains is no longer in the expressions**: 13.2 seconds of the case's 35.7 are in CEL, and the other 22.5 are outside it, in the planner, the writes, the scene and the comparing of 16 drawings of 900 KB each. One step, creating a concept (step 11), takes 10 seconds, of which 1.6 are in CEL. This feature has no reason to touch those, and doing so to reach a number chosen before the measurement would widen it.

The bound's purpose is that the Build runs the case on every pull request, and GitHub's runners are slower than this machine (factor not measured). 60 seconds leaves room for a runner and holds the case to a real improvement of over 13 times. The Build's step (T035) enforces it on the release build, with a larger limit if the runners prove it needs one, said in that pull request. `cargo test --workspace` then takes about 73 seconds longer on each operating system, which is the price of removing the `#[ignore]`.

A person's wait is another matter: reading and drawing the body takes about 1.4 seconds beyond loading the description, and `business-economics`, at 3.5 times the triples, about 10.5, of which CEL is 2.3.

## R10. Fixtures, and how they run on each host

- **Decision**: `specifications/disl/fixtures/grouping/*.json`, each one a list, a key expression, and the keys and groups expected, or that it fails, validated by a new `$defs/GroupingFixture`. A worked example `.dis` with a `.did` and findings shows §2.5's handling in a real context.
- **Rationale**: DISL has no expression fixtures today, only worked examples with findings. The specification's independent test asks for "each a list, a key and the groups expected", and the constitution's Principle II asks for a schema and examples together.
- **WebAssembly**: the fixtures are included at compile time in `adp-disl`'s test and run under `wasm-bindgen-test`, a development dependency, using the runner `wasm-bindgen-cli` already brings to the Build. `validate.mjs` then needs no new mode, and SC-001's "native and WebAssembly" is the same test on two targets.
- **Alternative considered**: a small tool type with conformance cases, so that `validate.mjs` would find it unchanged. Refused: it adds a tool type to `definitions/` for a test's sake.

## R11. What the descriptions change

The prototype changed `w3c-skos.atd` only, in the scratch worktree. It kept every rule's meaning and put a keyed group behind each whole-list read. The final form may differ; this is what the time above was measured with.

```text
fn bySubject(id)   -> triples.groupBy(t, (t.sKind == 'blank' ? 'blank:' : 'res:') + t.s).get(id)
fn repeatSuffix(e) -> ... triples.groupBy(u, u.s + '|' + u.p + '|' + u.o).get(e.s + '|' + e.p + '|' + e.o) ...
fn skosDrawable(id)-> triples.groupBy(t, t.p == RDF_TYPE && t.oKind == 'iri' && t.o in [four types] ? subject : '').get(id).size() > 0
fn skosMember(i,s) -> triples.groupBy(t, ... ? subject + ' ' + object : ...).get(i + ' ' + s).size() > 0
```

Three things beyond swapping a filter for a read were needed, each found by a measurement:

1. **Inline keys.** With `cardId` in a key, the step budget ran out at `from ConceptScheme`. Inline, it did not.
2. **One walk per `from`.** `order: skosOrder().indexOf(self.id)` runs the whole walk per term. It is not a filter, so a group does not help: `business-economics` took 60 seconds with it. Each derived type's `from` now carries `[id, place]`, and `order` reads an attribute; the same body then took 12.4 seconds and no result changed.
3. **No `distinct()` on long lists.** `.groupBy(x, x).keys()` is linear; `distinct()` declares its square and goes over on `business-economics`'s 1,150 terms. Elements cannot be keys, so where the subject and object groups of a term are merged, it takes the second without those the first has, then `sortBy(t, t.line)`.

**A risk in the last point**: `sortBy(t, t.line)` keeps a term's triples on one line with the subject's first, where the file might have the object's first. It affects only the order of a derived element's `sources` when two statements share a line. Every case passes with it, but none shows such a line, so T025 either adds a case or finds another order.

**The result on the existing cases**, with the fix in R12: all 24 other SKOS cases give what `w3c.rs` lists, and no expression fails. `conformance/` was not touched. Both bodies of SC-005 draw with no expression or derived type failing; whether the budget's notice on `business-economics`, with 1,151 terms against 1,000, reads as it should was not inspected.

**The `.dis` files stay.** The `.atd` descriptions are what the desktop reads; `w3c-*.dis` remain at their DISL version for the hosts that run JSON (spec 035, phase 1), and the standalone host follows under its own specification, as the specification assumes.

**Declaring it**: an `.atd` has no DISL version of its own: ATD says which it carries (§1.3), and lowering states it (`DISL` in `adp-atd-runtime`). So a description says `requires: { features: ["cel.groupBy"] }`, Appendix B.8's way of saying what a specification relies on. The desktop does not read `requires.features` today, and that is not this feature's to change; a host's refusal is DISL §15's "inform the user and MAY open read-only".

## R12. What running the case shows, and what goes to Peter

Nobody has seen this case run to its end, and it now shows two differences unrelated to speed.

1. **`Related` edges were drawn from the wrong end.** Today's description says "one edge per unordered pair, from the end whose id sorts first" and then sets `source: item[1]`. The case records the first end as the source, 123 edges in all. No smaller case has one. Changing the two lines removes all 246 reading differences and the drawing's differences at every step, with no other case changed. **The plan fixes the description (T028).** It is a correction, not a change to what the description means, but it does change what the description says; a reader should check that.
2. **Two steps are refused, and every later step's bytes follow from that.** Of the 299 differences first seen, 18 remain, all `bytes` or `refused`:
   - Step 1 sets the row `skos.label:prefLabel:en`, the module's own row, which Peter ruled a listed quirk on 2026-11-01 for `turtle-edits-skos` and which this specification repeats. It is refused here for the same reason.
   - **Step 2 is new.** It sets `skos.doc:definition` on a concept, and the description refuses it with "The model has no element or relation 'res:…/70002'." The definition is a derived attribute with no `edits` entry, so the planner looks for a stored element. The module writes a `skos:definition` triple. Peter's ruling does not cover this.
   - Steps 3 to 17 each differ only in the bytes, by the two edits not made. All readings, findings and drawings at every step match the case.

**What Peter ruled:**

- **(a)** Step 2: Peter ruled on 2026-11-02 that the description writes the definition (FR-012, T045, T046). Only the label row's refusal then stays listed, and the later steps' bytes differ by that one edit; the exact places are measured when T046 is done, and are fewer than the 18 above.
- **(b)** SC-002 goes from 30 to 60 seconds: Peter agreed on 2026-11-02 (R9).
- **(c)** Story 3 stays without an estimator, since no host has one (R7): Peter agreed on 2026-11-02.
- **(d)** SC-003 puts the case in the Build's WebAssembly validation, which then runs it twice, natively and through the module: about 76 seconds on this machine, and no more than that is added. This is for information.

## R13. The last measures (T042)

Measured on 2026-11-05, on the same 8-core Apple Silicon Mac as R1, in a release build of `atd` at the desktop's spec 075 B (#154), one run each, with the descriptions as merged in etalii.adp #717 (C) and #718 (E). Other builds shared the machine at times; each figure says the load where it mattered.

| Run | Before (R1) | After |
|---|---:|---:|
| `atd validate --case geographic-names`, the SKOS description | 789 s | 29.8 s (load average about 2), 25.6 s with the prototype's rules |
| The research prototype, measured beside it | | 40.3 s |
| `geographic-names`, the case's differences | 299, then 18 with R12's fix | 17: the label row's refusal at step 1 and the bytes of steps 1–14, 16 and 17 that follow from it |

One reading of each body, with no step, through each description:

| Description | `stw/geographic-names.ttl`, before | after | `stw/business-economics.ttl`, after |
|---|---:|---:|---:|
| `w3c-skos` | 70.1 s, no card derived | 2.6 s | 4.7 s |
| `w3c-rdf` | 52.1 s (86 s in R1) | 17.8 s | 74.6 s |
| `w3c-owl` | 155.8 s (162 s in R1) | 6.4 s | 38.5 s |
| `w3c-shacl` | 20.7 s (23 s in R1) | 2.3 s | 3.3 s |

No expression goes over `limits.celCost` and no reading over its steps on either body. On a GitHub runner, the Build's time-limited step took 50 s of wall time for the case (etalii.adp.ide.desktop#156), within SC-002's 60. The SKOS readings derive all 436 and 1,151 terms (the desktop's `the_stw_vocabularies_draw_within_the_budgets`). What still grows with the body is the RDF description's budget order, which makes the list of every card again for each card, and the OWL description's per-term reads that are no filter; neither goes over a limit.

Cases passing, before and after: RDF 20 of 22, OWL 21 of 23 and SHACL 22 of 23, unchanged, every result identical. SKOS 22 of 24 before, with `geographic-names` ignored; 22 of 25 after, `geographic-names` running and differing only as listed (SC-004).
