# Research: The RDF Description Orders Its Cards Once per Reading

Each entry records what was measured or decided, for the plan to rest on. Everything was measured on 2026-11-09, on the 8-core Apple Silicon Mac of the 2026-11-05 measurement, in a release build of `atd` (`cargo build --release -p adp-atd-cli`) at etalii.adp.ide.desktop `8d837f5`, with its vendored etalii.adp `60db13c`, whose `w3c-rdf.atd` and `w3c-rdf.notation.atd` are those of etalii.adp `develop` at `2cea31e`. Each figure is one run. Other workers shared the machine; each figure says the load average where it mattered.

## R1. What dominates the reading

**How.** Each body as a scratch case with no step, beside the RDF description's cases in a copy of the vendored `definitions/` that is not committed, run with `atd validate --case`, under `/usr/bin/time -l`. The same copy, with the change of R2 applied, gives the after figures.

**The specification's first assumption holds.** The four runs below were made one after the other at a load average of about 2.3, wall time and user time within half a second of each other. With the order carried through `from` (R2) and nothing else changed, the reading of `business-economics` fell from 145.9 s to **8.2 s**, so about 94% of it was the order made again for each card: the layout's `sequence: (rdfCardOrder(self.id))` asks for each card's place, and each ask makes the list of every card term of the body again. Earlier runs of the same day, at load averages of 24 to 60, gave 83.3 s and 132.7 s before and 7.7 s after; the 2026-11-05 figures were measured with an older desktop and are not compared run for run.

| Reading, no step | 2026-11-05 | Before, 2026-11-09 | After, 2026-11-09 |
| --- | ---: | ---: | ---: |
| `stw/business-economics.ttl`, 17,683 triples, 1,367 cards | 74.6 s | 145.9 s | 8.2 s |
| `stw/geographic-names.ttl`, 5,083 triples, 467 cards | 17.8 s | 33.1 s | 3.7 s |

**On `business-economics` the order never ran to its end.** With a temporary line logging each card's `sequence` (not committed), every one of the layout's 4,101 evaluations of `rdfCardOrder` on `business-economics` failed: a single call makes some 17,683 calls of `cardTerms` and more of `isCell`, past ATD §12.6's step budget of 100,000. The layout sorts a node whose `sequence` fails as having none, so today every card there is laid out in the model's order, every resource before every blank node, and the 145.9 s are spent failing. After the change all 4,101 evaluations give a place. On `geographic-names` the old order runs to its end.

## R2. How a card carries its place

**Decision.** A function `rdfPlaced(terms, kind)` takes the body's card terms, as `cardTerms` gives them for every triple in order, and gives those of one kind (`iri` or `blank`) with the card's place appended as their fifth entry. It makes the order once: the distinct card ids in order of first naming (`groupBy(...).keys()`, as `rdfCardOrder` made it), then a grouping of their positions by id, which it reads once per term. `Resource` and `BlankNode` take their `from` from it, and their attribute `place` (on `Term`, `readonly`, default 0, as the SKOS description's `walkOrder`) from `item[4]`. The layout's `sequence` reads `self.place`, and `rdfCardOrder` goes, since nothing else calls it.

**Rationale.** It is FR-001's shape and the SKOS description's (spec 075, R11): a derived type's `from` carries the place. The order counts both kinds of card, so each type's `from` makes it over all the terms, once per type rather than once per card. A card's id is written out as `cardId` writes it, `'res:'` or `'blank:'` and the term, because a call is a step of ATD §12.6's budget: with `cardId` called twice per term, `Resource`'s `from` went over the reading's 100,000 steps on `business-economics` and no resource was derived.

**Alternatives considered.** Keeping `rdfCardOrder` and calling it once per card from the attributes: the same cost as today, moved. `indexOf` on the list of ids per term: linear in the cards per term, so the square again. Ordering the cards in the budget's `order` instead of the layout: the budget orders by `index` today, and FR-004 keeps it.

## R3. What the change keeps

- **The cases.** `atd validate` on the RDF description: 20 of 22 cases pass before and after, and the output of the two runs is the same but for the line number of the `broken` finding's rule, which moved with the new lines: `broken`'s parser sentence and `nobel-1903`'s steps 26 and 27, as `w3c.rs` lists them.
- **The places.** With the old function kept beside the new attribute in a copy, every card's `place` equalled `rdfCardOrder` of its id, on `simple`, `constructs`, `nobel-1903` and `geographic-names` (467 cards). The drawings of `geographic-names`, recorded before and after through a temporary line (not committed), are byte for byte the same.
- **Four cards of `business-economics` move.** On `business-economics`, where today's order fails (R1), the drawings of the 1,000 drawn cards differ in four: `descriptor/19210-1`, `18836-6`, `25743-1` and `19581-1`, in the untyped band, which now leaves their cells to the blank nodes the file names before them, as on every smaller body. Every card now stands where the description says, in the order the file first names it, and where it stood today only because the order failed. The specification's FR-002 and its first acceptance scenario say every card keeps the place it has today; read literally they would keep a failure's order, so this goes to Peter, with the recommendation that the places the description states are the ones kept, and FR-002 is read as the order the description states, which no case records otherwise.
- **The reading.** On `business-economics` both readings derive 1,209 resources and 158 blank nodes, the same elements in the same order with the same attributes, `place` added.
- **The budget.** It orders by `index`, which the change does not touch; both readings draw the same 1,000 cards, as the drawings above show.

## R4. SC-001's bound

**Decision.** SC-001 keeps its 15 seconds (Peter, 2026-11-09): the reading took 8.2 s, about half the bound, and 7.7 s at a load average of about 25. Nothing is revised. SC-002 holds as well: `geographic-names` took 3.7 s against 17.8 s on 2026-11-05 and 33.1 s before the change on the same day.

## R5. What the measurement found beside it

**The statement edges of both bodies are not derived, before and after.** With a temporary line printing why a derived type's `from` failed (not committed), both readings of both bodies report `Statement`: "`withRepeat`: The expression exceeded its evaluation budget." `withRepeat` counts, for each edge, the earlier edges with the same key by filtering every earlier edge, which is the square of the number of edges, and goes over `limits.celCost` on these bodies. So the RDF description draws the cards of `business-economics` and `geographic-names` but none of their statements, and spec 075's R13, and section 6 of `w3c-rdf.md`, which say that no expression goes over `limits.celCost` and no reading over its steps on either body, are wrong for this one, as they are for the order of R1. The same function is in the OWL, SHACL and SKOS descriptions, not measured here.

This feature does not change it: it is not the budget order, FR-006 keeps the limits, and making the edges appear changes what the two readings draw, which the specification rules out. SC-004's "no expression over `limits.celCost`" therefore holds for the cards and not for the statements, before and after alike. It goes to Peter, with the recommendation that a feature of its own gives `withRepeat` the shape of R2, a grouping of the edges' positions by key, in the four descriptions.
