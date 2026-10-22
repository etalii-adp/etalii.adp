# Research: An Insert Writes a Constant

Every decision below settles something the specification leaves to the plan. The code observations are at etalii.adp `75599e9`, etalii.adp.ide.standalone `30764d316`, etalii.adp.ide.vscode `bf9ec24`, etalii.adp.ide.intellij `a36a846` and etalii.adp.ide.notion `4a0cdb4`, all `origin/develop`.

## R1. The construct's name and shape

- **Decision**: `insert.constant`, a JSON object from a key to a scalar (a string, a number, a bool or null), with at least one member: `"constant": { "type": "ui-element" }`.
- **Rationale**: the name the functional decomposition graph's binding draft already uses, so the draft becomes FBL by deleting a sentence. An object cannot hold a key twice, so two constants for one key need no rule. FBL already relies on the member order of an object (section 6.3, xml: "then in the order of their binding").
- **Alternatives considered**: a list of `{key, value}` pairs (needs a duplicate rule and reads worse); an attribute binding with a fixed value (an attribute is the metamodel's, and the specification's Context explains why one is the wrong home).

## R2. Where a constant goes in the new entry (FR-003)

- **Decision**: a constant whose key `insert.keys` names is written at that place among the keys. Every other constant is written after the entry's other keys, in the member order of `constant`, and before `skeleton`. With no `keys`, the entry's keys are in the order section 6.2 already gives them, and the constants follow them the same way.
- **Rationale**: `keys` is how a binding orders a new entry; a constant is ordered by it like any other key. "After the keys, in declaration order" is the rule section 6.3 already states for xml attributes not named in `keys`, so a host has one rule to follow, not two.
- **Alternatives considered**: constants first (would put `type` before `id` in the `.fdg` draft unless `keys` names it, which is the case the draft does name); refusing a binding whose `keys` does not name every constant key (simplest, but the specification requires a stated place, FR-003, and a fixture of one, FR-011).

## R3. How a constant's value is written (FR-004)

- **Decision**: as section 6.3 writes a new value of its JSON type, with the binding's `text` defaults and no attribute binding: a string by the yaml scalar rules (plain when plain-safe, else `text.quote`) or as a json string; a number by `number: "shortest"`; `true`, `false` and `null` as such.
- **Rationale**: a constant has no attribute, so no `style`, `number` or `map` option applies, and the plain-safe test then makes `"1.0"` or `"yes"` read back as the same text (FBL 0.5, written text) in every reader.
- **Alternatives considered**: options on the constant itself (`style`, `number`); not needed by any tool, so left out (principle V).

## R4. Where a constant is allowed (FR-008, Q1)

- **Decision**: only on an insert of a binding whose body's family is `yaml` or `json`, and never beside `emit`. The schema refuses `constant` with `emit` on `$defs/Insert`, and refuses it on a binding whose `body.family` is another family by a condition on `$defs/Binding` (FR-008 asks the schema to refuse it); section 14.1, step 6 states the same rule in prose, for a host that does not run the schema.
- **Rationale**: `emit` already writes literal text in every family that uses it, json one-line items included; two ways to write one literal would need an order between them.

## R5. The collision check (FR-006)

- **Decision**: section 14.1, step 6 gains: a constant's key **MUST NOT** be the key of a `{key}` slot, without `child`, that the same rule writes: a writable attribute binding (not `readOnly`, not `value`, not `capture`), `id.from`, or a relation rule's `source` or `target`. A read-only attribute binding on the key is allowed and reads what the entry holds.
- **Rationale**: the one-place rule (section 3.3) is about where a written value goes; a constant and a writable slot on one key would be two writers of one place. The id and the ends are written by an insert too, so they collide the same way.
- **Alternatives considered**: letting the constant win over the attribute on insert (two places again, and a set would then rewrite the constant, against FR-005).

## R6. Reading (FR-009, Q2) and retype (FR-010, Q3)

- **Decision**: nothing changes in reading: `when` alone matches, and section 6.2 says so in one sentence. Section 6.4 says that a retype's add under the new rule writes that rule's constants, which is what "a `remove` and an `add`" already implies.
- **Rationale**: the clarifications of 2026-10-22.

## R7. A binding the validator refuses (FR-006, FR-011)

- **Decision**: a new folder, `specifications/fbl/refused/`, whose `*.fbl` documents are valid against the schema and **must fail** a check of section 14.1; the validator reports each as refused, with its reason, and fails when one of them passes. Its `README.md` says so, and each document's `doc` names the check it fails. The first is `insert-constant-collision.fbl`: a yaml binding whose rule has `constant: {"type": "task"}` and a writable attribute bound to `type`.
- **Rationale**: the validator exits 1 on any invalid example, so the repository has no place yet for a binding meant to be refused. A folder of them turns a sabotage that a reviewer must remember into a check that runs on every pull request, and a host's conformance run can load the same documents and expect a refusal.
- **Alternatives considered**: a refused binding inside a fixture (the fixture schema has refusals of edits only, not of loading); no committed example and a one-time sabotage run (satisfies the check, not FR-011's "the examples **MUST** include").

## R8. The fixtures (FR-011, SC-003)

- **Decision**: four folders, each with its own binding, as `insert-empty-*` do:
  - `insert-constant-yaml/`: a body with an `elements` list holding one `task` and one `note`; two rules over `/elements/*`, told apart by `when` on `entry.type`. `task` has `keys: ["id", "type", "name"]` and `constant: {"type": "task"}`; `note` has `keys: ["id", "text"]` and `constant: {"type": "note", "format": "1.0"}`, so that neither of its constants is named by `keys` and one is not plain-safe. Steps: add a task (`type` second), add a note (`type` then `format: "1.0"` after `text`), set the new task's name (the constant's bytes untouched), and the undo and redo of the first add.
  - `insert-constant-yaml-read/`: the body that the last step of `insert-constant-yaml/` expects, byte for byte, with a `read` naming every element with its type and attributes: each new entry is read by the rule that added it (FR-009).
  - `insert-constant-json/` and `insert-constant-json-read/`: the same in the json family, so that the new entries have the same keys in the same order.
- **Rationale**: FR-011 asks for both placements in both families and the refusal; FR-009 asks for the read-back; SC-003 asks that a planted wrong offset fails. A `-read` fixture is the read-back a fixture can state, since a fixture's `read` is of its input.

## R9. Which hosts change now

- **Observed**:
  - `etalii.adp.ide.standalone`: `EtAlii.Adp.Specification.Fbl` reads FBL 0.5 "in full" (`FblDocumentLoader.cs`, `new("FBL", 0, 5, ...)`) with parts of 0.6 and 0.7; a new entry's keys are made in one place for yaml and json, `FamilyReader.InsertValues`, which `YamlFamily.ItemLines` and the json family write; `InsertSettings` in `FblModelTypes.cs` holds `keys`, `emit` and `skeleton`. The functional decomposition graph conversion's task 9 (L6) plans to implement the constant there.
  - `etalii.adp.ide.vscode`: `src/core/fbl/` reads FBL 0.6 (`documentLoader.ts`, `supportedMinor = 6`); no tool of that host needs the constant, and the `.fdg` file is in its corpus only as a real file to read (`fixtures/fbl/real-files/`).
  - `etalii.adp.ide.notion`: `src/fbl/` is a byte-for-byte copy of Visual Studio Code's `src/core/fbl/` at `271a92c`, refreshed by `node scripts/sync-fbl.mjs`; its one add-on, the hype cycle, adds no entry chosen by a value.
  - `etalii.adp.ide.intellij`: `fbl/` (Java) reads FBL 0.x with its own `InsertSettings`; no tool of that host uses it yet (its `CLAUDE.md`: "used by no tool yet").
- **Decision**: this feature changes etalii.adp and the standalone library only. Visual Studio Code, IntelliJ and Notion are listed under *After this feature* in the tasks, to be done with the version they next catch up to. The standalone library implements the constant without raising the minor version it declares, since it does not read 0.6 and 0.7 in full.
- **Rationale**: principle V: a construct in a host is justified by that host's tool. The standalone tasks here replace L6 of the conversion's task 9, so the library work is planned once, with the fixtures that define it.
- **Alternatives considered**: every host now (three pull requests for no tool; Visual Studio Code and IntelliJ would implement an 0.8 construct while 0.7 is missing); etalii.adp only, as specs 015 and 026 did, leaving the library to the conversion's task 9 (keeps the conversion as planned, but plans the library work in a document that does not hold its fixtures). This is the plan's one fork; see the tasks' *Forks*.
