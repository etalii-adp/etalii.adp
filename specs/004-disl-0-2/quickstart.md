# Quickstart: proving DISL 0.2

How to check that the feature did what the spec asks. Run from the repository root.

## 1. Every example, fixture and definition validates

```bash
python .github/scripts/validate-examples.py
```

Expected: one line per file, all valid, exit code 0. This covers the three 0.1 examples, the legacy fixtures and the 23 definitions in `definitions/diagrams/` (SC-002), and the new 0.2 examples (SC-003). The Build workflow runs the same script on the pull request.

## 2. Nothing in 0.1 changed validity

Validate the files at `develop`'s head against the new schema and compare with their result against the 0.1 schema: the lists of valid files must be equal (FR-002). A 0.1 document names the 0.1 `$id` or version `"0.1"`, and the validator reads it against the 0.2 schema (research R2).

## 3. Each new construct has text, schema and example

For every row of [contracts/constructs.md](contracts/constructs.md): the named DISL section contains normative text for it, the named `$def` exists in `disl.schema.json` (or `did.schema.json`), and the named example uses it. A missing one fails SC-005.

## 4. Every gap item is accounted for

Walk [contracts/traceability.md](contracts/traceability.md) against the gaps summary: every item of gaps 4 and 6 to 13, and the derived-element items of gap 3, has a row whose outcome is a DISL 0.2 construct, a sentence, or a named owner with a reason (SC-001). Every `x-adp` key within these themes in the 23 definitions has a named replacement (SC-004).

## 5. Nothing is defined twice with FBL

Search `specifications/fbl/` (once feature 005 lands) for a location shape, id strategy, ephemeral marker or finding shape of its own; there should be none, only references to DISL (SC-006, [contracts/fbl-seam.md](contracts/fbl-seam.md)).

## 6. Negative checks

Make a scratch copy of one new example and break it (an ephemeral type with a stored view key in a DID example, a `Reason` referring to an undeclared reason, a budget without `max`); the validator must report each as invalid where the schema can express the rule. Rules the schema cannot express are stated as **MUST** in the document and listed in the construct map.
