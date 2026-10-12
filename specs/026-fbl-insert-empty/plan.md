# Implementation Plan: An Insert Applies a Binding's Empty Rule

**Branch**: `features/026-fbl-insert-empty` | **Date**: 2026-10-12 | **Spec**: [fbl-insert-empty.spec.md](fbl-insert-empty.spec.md)

## Summary

FBL 0.6 says that a new entry's key for an attribute given its empty value is written or left out by that binding's `empty` rule, with a set's defaults. The change is to the FBL specification's prose and version, the schema's version enum, and a new fixture pair. No host changes here.

## Technical Context

- **What changes**: `specifications/fbl/FBL-specification.md` (0.5 to 0.6: sections 5.2, 6.2, 6.4, the header, the status paragraph and 2.7), `specifications/fbl/fbl.schema.json` (`"0.6"` in the `fbl` enum), and two new fixtures, `specifications/fbl/fixtures/insert-empty-yaml/` and `specifications/fbl/fixtures/insert-empty-json/`, each with a body and its binding.
- **What checks it**: `python .github/scripts/validate-examples.py` (schema validation of every `*.fbl`, replay of every fixture's splices and their inverses), `python .github/scripts/terminology-check.py --name etalii.adp`, `python .github/scripts/licence-check.py`. All three run in the Build workflow.
- **What the validator cannot check**: whether a host plans the stated splices. It replays them; each host's conformance run checks that it produces them, first `EtAlii.Adp.Specification.Fbl.Tests` in `etalii.adp.ide.standalone` under spec 025's T216.
- **Hosts**: no host is changed by this feature.

## Constitution Check

| Principle | How this feature meets it |
|---|---|
| I. One source of truth | Two hosts disagreed because FBL was silent; the answer comes back here before either changes (spec 025, FR-025). |
| II. Implementable from the document alone | One paragraph in section 6.2 decides every case, and a fixture pair states the splices for both families. |
| III. Precise normative language | The rule is stated with RFC 2119 key words in sections 5.2 and 6.2, and the refusal joins the list in 6.4. |
| IV. Versioned specifications | 0.6, a draft. Every valid 0.5 document stays valid; the status paragraph names the reading 0.5 left open. |
| V. Simplicity | No new option: the existing `empty` rule now covers insert too. |
| VI. No JetBrains Rider warnings in C# | No C# changes here. |

No violation to track.

## Decisions

1. **Reuse `empty`, add nothing.** The maintainer's ruling of 2026-10-12. A separate insert option was not asked for, and one binding meaning two things for an add and a set is the defect being fixed.
2. **An empty value is a value; an attribute not given is not.** Section 6.2's "a key the new entry has no value for is left out" stays, and now says which is which.
3. **A set's defaults, no new ones.** `keep` for strings, as section 5.2 says. For other types 5.2 names no default, and this feature does not add one; an insert does whatever a set does, so the two cannot drift apart again.
4. **The written form of a kept empty value is section 6.3's**, as for a set: an empty string is not plain-safe, so in YAML it is written `key: ""`, and an empty list is `[]` in both families. How YAML writes a kept null is not settled by 6.3, so the fixtures use strings only, and that question stays out of this feature.
5. **`emit` keeps its own rule.** Its optional segments already drop an empty placeholder, and lines, blocks and xml entries written with `emit` have no key to leave out.
6. **The fixture pair uses one small binding per family**, not the knowledge designer's, so that each add isolates one `empty` setting and the two fixtures differ only in their family.

## Project Structure

```text
specs/026-fbl-insert-empty/
├── fbl-insert-empty.spec.md
├── plan.md
└── tasks.md
specifications/fbl/
├── FBL-specification.md          (0.6)
├── fbl.schema.json
└── fixtures/
    ├── insert-empty-yaml/
    └── insert-empty-json/
```

## What is not done here

- The hosts. `etalii.adp.ide.standalone` corrects its YAML and JSON families in spec 025's T216 with these fixtures as the guard; Visual Studio Code and IntelliJ under specs 009 and 010.
- How YAML writes a kept null (section 6.3 does not say).
- A default for `empty` on non-string attributes. Section 5.2 names none; if one is wanted, it is a feature of its own.
