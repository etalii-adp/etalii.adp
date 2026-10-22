# Contract: What the DISL Document Says About Relation Flags

The interface this feature exposes is the text of `specifications/disl/DISL-specification.md` and `specifications/disl/disl.schema.json`, which every host implements. This contract gives the substance each place must carry, in DISL 0.6 (research R1). The wording is the implementer's, as long as every obligation below can be found in it with its key word in bold capitals.

## C0. The version

As spec 031 opened 0.5 (its tasks T002 to T007):

- The header reads "Specification, version 0.6 (Draft)" and its `Date` row 2026-10-22.
- The status paragraph begins "This is a draft, version 0.6" and ends its account of the versions with a sentence saying that DISL 0.6 adds no construct and settles where a relation type's `directed`, `allowSelfLoops` and `allowParallel` come from (inherited along the C3 linearisation, else the section 4.9 default; a subtype may only narrow them; supertypes that differ are an error unless the subtype states the flag); that 0.5 left this open, and two readings were in use, inheritance and the type's own declaration only; and that every valid 0.5 specification that neither widens a flag nor inherits two different values of one is a valid 0.6 specification, with the meaning of the first reading, apart from the clarifications in [Changes from 0.5](#changes-from-05) (FR-008).
- The contents list `Changes from 0.5` after `Changes from 0.4`.
- Section 2.9's first bullet lists `"0.1"` to `"0.6"`. No superset bullet is added, as 0.4 and 0.5 added none.
- `disl.schema.json`: the `title` is "DISL 0.6 (draft) — Diagram Specification Language"; the `disl` property's description names 0.1 to 0.6, says a 0.6 runtime reads 0.1 to 0.5 specifications with their meaning, and points at DISL 0.6, section 2.9. The `$id` and the version key's `pattern` are unchanged.

## C1. Section 4.7, a bullet on relation flags

After the bullet on narrowing attributes, carrying:

- F1 (FR-001): a relation type that does not state `directed`, `allowSelfLoops` or `allowParallel` **MUST** be read with the value of the nearest type in its C3 linearisation that states it, and with the section 4.9 default when none does; this is the lookup notation, forms and constraints use.
- F2 (FR-002): a relation type **MAY** state a flag its supertypes have only to narrow it: `allowSelfLoops` and `allowParallel` from `true` to `false`; it **MUST NOT** state `true` where a direct supertype's value is `false`, and **MUST NOT** state a `directed` that differs from a direct supertype's. The supertype's value is its value by F1, the default included. A relation type that does is a specification error.
- F3 (FR-003): a relation type whose direct supertypes have different values of a flag by F1 is a specification error unless it states that flag itself, as for conflicting inherited attributes.
- An informative sentence: `abstract` and `derived` make no difference to the lookup; a supertype that states a flag with its default value changes nothing.

## C2. Section 4.9

- The rows for `directed`, `allowSelfLoops` and `allowParallel` keep "Default `true`" / "Default `false`" / "Default `true`" (FR-004) and add "Inherited (4.7)."
- The paragraph **Acyclic over subtypes** becomes **Flags over subtypes**: the three flags are inherited and only narrowed (4.7), and `acyclic` keeps its rule as written, a subtype of an acyclic type being acyclic, which **MUST NOT** be undone by `acyclic: false` (FR-005). The `Owns` example stays.
- One informative sentence after it: which relations `allowParallel` counts is unchanged; they are relations of the same type, so two subtypes of one type on one pair are not parallel to each other (research R4).

## C3. Section 14.1, step 6

"compute C3 linearisations; merge attributes, ports, containment; check narrowing rules (4.7)" names the relation flags among what is merged and checked.

## C4. Section 17 and *Changes from 0.5*

- Section 17's table gains a row for `service-calls.dis` with `service-calls.did` and `service-calls.findings.json`: relation flags inherited from an abstract relation type, and restated under two supertypes that differ (4.7, 4.9), with the `std.endpoints` findings they give (8.7).
- A section `## Changes from 0.5`, after *Changes from 0.4* and before the `---` that precedes section 18: an opening paragraph (DISL 0.6, draft, 2026-10-22, ruled by the maintainer with the answers to Q1 to Q3 of spec 034 on 2026-10-22 and "Approve, all hosts"; it adds no construct), and the table `| # | Change | 0.5 said | 0.6 says | Reason | Section |` with three rows:

  | # | Change | 0.5 said | 0.6 says | Reason | Section |
  |---|---|---|---|---|---|
  | 1 | A flag a relation type does not state | Nothing; read as inherited by some hosts and as the default by others. | Inherited along the C3 linearisation, else the 4.9 default. | One specification was two tools, depending on the host. | 4.7, 4.9 |
  | 2 | A flag a subtype states differently | Nothing. | Only narrowing; widening, or a different `directed`, is an error. | A subtype is accepted wherever its supertype is. | 4.7 |
  | 3 | Supertypes whose flags differ | Nothing. | An error unless the subtype states the flag. | As for conflicting inherited attributes. | 4.7 |

  and a closing sentence: DISL 0.6 needs no change to DID, DESL or FBL (FR-009); the specifications in [`refused/`](refused/README.md) show what a validator refuses.

## C5. `disl.schema.json`, `$defs/RelationType`

The descriptions of `directed`, `allowSelfLoops` and `allowParallel` state their default and that an unstated value is inherited (DISL 0.6, section 4.7); the description of `$defs/RelationType` says the same in its sentence on defaults. No keyword other than `description` and `title` changes: JSON Schema cannot compare a type with its supertypes (Appendix A.1).
