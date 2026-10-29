# Tasks: FBL 0.10, What the C4, Databricks and Wardley Map Conversions Wait On

**Input**: [fbl-conversion-gaps.spec.md](fbl-conversion-gaps.spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Approved**: the plan by the maintainer on 2026-10-29 (etalii.adp #615), with two rulings of that day: the feature is delivered in **three pull requests** (the plan's open question 1, its recommended option), and the FBL 0.9 `grammar` family of the standalone C# library is built by a **standalone spec-workflow specification of its own, `fbl-grammar-family`** (open question 2), written separately and not tasked here.

Every path carries its repository as prefix; every file these tasks change is in `etalii.adp/`. No task changes another repository: the hosts implement FBL 0.10 to 0.12 under their own specifications (the specification's *What this feature is not*, "Not the host work"; plan, *Host follow-ups*). A task may read `etalii.adp.ide.standalone` at `ad1a4680a` (the commit research read) to copy a fixture body or compare a binding draft; it writes nothing there.

**Delivery**, in the plan's merge order (plan, *Delivery*; research R1). Each pull request is one branch in its own worktree under `etalii.adp/.claude/worktrees/`, with `git config --worktree user.name "agent-<N>-066-fbl-conversion-gaps"` set when the worktree is made, merged into `develop` with a merge commit, and ticks its own tasks here:

| Pull request | Branch | FBL | Holds | Starts |
|---|---|---|---|---|
| A | `features/066-fbl-conversion-gaps-structurizr` | 0.10 | User Story 1 and the constructs User Stories 1 and 3 share (FR-001 to FR-013, FR-023's block written by an add, FR-024's `many` nodes, FR-030 to FR-037 for what it adds) | when this `tasks.md` is merged |
| B | `features/066-fbl-conversion-gaps-databricks` | 0.11 (0.10 if it merges before A) | User Story 2 (FR-014 to FR-022, FR-030 to FR-036 for what it adds) | when this `tasks.md` is merged; independent of A |
| C | `features/066-fbl-conversion-gaps-wardley` | 0.12 | User Story 3 (FR-023's next-line brace, FR-024 to FR-029, FR-030 to FR-036 for what it adds) | when A is merged |

Whichever of A and B merges second takes the next minor version and brings the status paragraph, the version lists and the schema's `fbl` enum up to date with the first (T073). The stories' "FBL 0.10" reads as "FBL 0.10 or later" (plan, open question 1).

**What the standalone conversions also wait on, and these tasks do not build**: c4-disl-fbl task 13 and wardley-map-disl-fbl task 11 need the FBL 0.9 `grammar` family itself in `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/`, on `EtAlii.Lark`, before any construct of pull requests A or C. That is the standalone specification `fbl-grammar-family`, the prerequisite of the standalone C4 and Wardley map conversions. Its grammar work, like all grammar work, is Lark LALR(1) through the EtAlii Lark packages (research R2), with no local functions in new C# code (the maintainer's rule of 2026-10-24).

**Checks**: every task is checked by the commands of [quickstart.md](quickstart.md), *Every pull request*, each exit code captured into a variable before any other command runs: `python .github/scripts/validate-examples.py`, `python .github/scripts/atd-grammar.py --check`, `python .github/scripts/terminology-check.py --name etalii.adp`, `python .github/scripts/licence-check.py`, `python .github/scripts/file-names-check.py`, and `python .github/scripts/thinkrail-specs.py` followed by `git diff --exit-code thinkrail/`. The Build workflow's `descriptions` job (the desktop host's `atd check` built from the pull request's `specifications/`) runs on the pull request; a check the container cannot run is named as not run and left to CI. A new fixture is accepted only after it has been seen to fail (quickstart, *Seen to fail, then restored*): one planted wrong `start` offset fails its step, for a `grammar` fixture one planted wrong value in `read` fails the reading check, and for a fixture with `expectFiles` one planted wrong byte fails that file (SC-003). A new refused binding is accepted only after the validator has been seen to fail when the binding is made to pass its check.

**Format**: `- [ ] T### [P] [US#] description with file path`. `[P]`: parallel with the other `[P]` tasks of its phase (a different file, no dependency on an unfinished task). `[US#]`: the user story the task serves. Requirement references are the specification's (FR-###, SC-###), the scenarios its acceptance scenarios (`US1 s5` is User Story 1's fifth).

---

# Pull request A: Structurizr DSL and the shared constructs, FBL 0.10

## Phase 1: Foundational, the version and what the checks need (A)

**Purpose**: FBL 0.10 exists, a fixture can state a file beside its input, and the repository's scripts can read and build what every later task of A and C adds.

**Blocks**: every other task of pull requests A and C.

- [ ] T001 Make the worktree `etalii.adp/.claude/worktrees/066-structurizr/` on `features/066-fbl-conversion-gaps-structurizr` from `origin/develop` at the merge of this `tasks.md`, set its `user.name` and read it back with `git config user.name`, and note that commit for the pull request's description (T051).
- [ ] T002 In `etalii.adp/specifications/fbl/FBL-specification.md`, make the header version 0.10 and its date the day of the change; list every version from `"0.1"` to `"0.10"` in section 2.1's table (which stops at `"0.8"` today) and in section 2.7; and make Appendix A say the schema accepts every version from `"0.1"` to `"0.10"`. The status paragraph is written by T046, once the constructs are (FR-030).
- [ ] T003 [P] Add `"0.10"` to `$defs/Document/properties/fbl` of `etalii.adp/specifications/fbl/fbl.schema.json`, and to that property's description what 0.10 adds, completed by T046 (FR-030).
- [ ] T004 Add a step's `expectFiles` (a map from a relative path to a string: the bytes, after the step, of each file beside the input that the step's splices name in `file`) to `$defs/Fixture` in `etalii.adp/specifications/fbl/fbl.schema.json`, and to section 15.3 of `etalii.adp/specifications/fbl/FBL-specification.md`, with the sentence that a splice's `file` names a file beside the input for these steps too (contracts/fixtures.md, *What a fixture gains*; research R19) (FR-010, FR-032).
- [ ] T005 In `etalii.adp/.github/scripts/validate-examples.py`, replay `expectFiles`: apply each step's splices whose `file` names a file beside the input to that file, compare the result with the step's bytes, and check that file's undo and redo as the input's are checked (`replay_fixture`). See it fail on one changed byte of an expected file in a scratch fixture, and update the module's docstring (FR-032, SC-003).
- [ ] T006 In `etalii.adp/.github/scripts/validate-examples.py`, add the **reading check** of research R20 for every fixture whose binding is of the `grammar` family: parse the input with Python Lark (`lark==1.3.1`, `requirements-atd.txt`) under the binding's grammar, inline or from its file, apply FBL 0.9's `recover`, select entries by the rules' `at`, read ids and attribute values through `{node}` slots with `match`, and compare the result with the fixture's `read` (elements, their types, parents and attributes, and findings by rule and line). It plans no edit; splices stay checked by replay. Later tasks extend it with each construct they add (T009, T013, T018, T022, T027, T031, T086). Run it over `w3c-turtle-grammar` and `w3c-turtle-grammar-partial`, which pass unchanged, and see it fail on one changed attribute value in a scratch copy of `w3c-turtle-grammar/fixture.json` (FR-031, FR-032, SC-003, SC-004).
- [ ] T007 In `etalii.adp/.github/scripts/atd-grammar.py` (`binding_grammars`, `mode_bindings`), read the `grammar` bindings of `specifications/fbl/refused/*.fbl` as a refused corpus (a document there must fail a check of `--bindings`, and the run fails when one passes) and build, in strict mode, the grammar of every `grammar` binding that a fixture folder under `specifications/fbl/fixtures/` carries, so that a fixture's own grammar (T014) is held to the same verdict as an example's. Update the module's docstring (research R20).

**Checkpoint**: version 0.10 validates, every existing example and fixture keeps its result, and the reading check reads the two Turtle fixtures.

---

## Phase 2: Foundational, the `grammar` constructs User Stories 1 and 3 share (A)

**Purpose**: what the Structurizr and the Wardley map bindings both use: comments that are kept, recovery inside blocks, a brace that is only a block where the grammar says, absent parts written and removed, several nodes for a `many` attribute, and a block written around a first child (spec, *Constructs that User Stories 1 and 3 share*; plan, R1).

**Blocks**: Phase 3, and pull request C.

- [ ] T008 In section 4.9 of `etalii.adp/specifications/fbl/FBL-specification.md` (*The tree*), replace the bullet on ignored tokens with research R5's rules 1, 2, 4 and 5 (contracts/grammar-family.md, *Comments*): a comment is an ignored token that holds a character other than whitespace; a leading comment is owned by the entry below it; a comment after a token on its line is a trailing comment of the innermost entry that holds that token (so `model { // the model` is the `model` entry's, not its first child's) and part of that entry's line span and of no value's span; a comment inside a value's span is part of the value's text, and a binding that reads such a value **SHOULD** take one token with `match`; every splice keeps a comment it does not remove, a part written where it was absent being written before a trailing comment. Say that a grammar states where a comment can start by its terminals alone, under ATD section 3.6's lexing (FR-001; US1 s1, s2; US3 s4; edge case 4).
- [ ] T009 Extend T006's reading check in `etalii.adp/.github/scripts/validate-examples.py` so that a comment is owned and kept out of every value as T008 states (FR-001).
- [ ] T010 [P] Add `recover.nested` (`{open, close}`) and `recover.unclosed` (a map from a terminal to a non-empty string) to `$defs/Recover` of `etalii.adp/specifications/fbl/fbl.schema.json`, as contracts/grammar-family.md gives them, admitted only in a binding whose `body.family` is `grammar`, with `nested` requiring `recover.unit` and `recover.sync` (data-model.md, *`$defs/Body` and `$defs/Recover`*) (FR-002, FR-004).
- [ ] T011 In section 4.9 of `etalii.adp/specifications/fbl/FBL-specification.md` (*Reading in part*), state research R6's six rules as a numbered continuation: boundaries after a block's `open` and each `sync` at its depth; a skip that ends at the first `sync` token after the stop or before the block's own `close`, reported once as `fbl.unparsed-text`; a block still open at the end of the body ends there, reported as `fbl.unclosed-block` at its `open`; a `close` that closes no block is skipped alone, unbound, as `fbl.unmatched-close`; an `unclosed` terminal's token that does not end with its text is `fbl.unclosed-comment` and still trivia; an add into a block reported `fbl.unclosed-block` is refused with the reason "The block is not closed, so nothing can be added to it." Say that without `nested` FBL 0.9's recovery stands, that a body which parses as a whole is read as without it, and that a statement that does not parse at the top level is read as in 0.9. Add the three codes, warnings, to section 7.4's table as contracts/grammar-family.md words them; section 7.5 keeps "never unreadable for its family" (FR-002, FR-004; US1 s7; US3 s3; edge cases 3, 9, 10).
- [ ] T012 In `etalii.adp/.github/scripts/atd-grammar.py`, check under `--bindings` that `recover.nested.open` and `.close` and every key of `recover.unclosed` name a terminal of the binding's grammar or the text of one of its anonymous string terminals, and that each terminal of `unclosed` is ignored (data-model.md, *Validation*). Add `etalii.adp/specifications/fbl/refused/grammar-recover-nested-unknown-terminal.fbl`, valid against the schema, whose `nested.close` names no terminal of its grammar, its `doc` naming the check; make `validate-examples.py`'s check of `refused/` accept a document that `atd-grammar.py --bindings` refuses. See both scripts fail when the binding names a real terminal, then restore it (FR-002).
- [ ] T013 Extend T006's reading check with T011's recovery inside blocks: the boundaries, the skips, the three findings at their lines, and the entries read after a skip (FR-002, FR-004).
- [ ] T014 [P] Add `etalii.adp/specifications/fbl/fixtures/grammar-comment-start/`, written here: `fixture.json`, a small binding and grammar of its own and an input, in which a `//` inside a URL token is no comment and a `//` after a token is one, both read by T006's check and the grammar built by T007 (contracts/fixtures.md, A) (FR-001's last sentence).
- [ ] T015 In section 4.9 of `etalii.adp/specifications/fbl/FBL-specification.md`, state that in the `grammar` family only what the grammar reads as a block opens one: a statement whose text ends in `{` and that the grammar reads as one token (a title, a note's text) opens nothing and keeps the `{` in its text, and recovery never treats that `{` as a block, a `{` inside a token being neither `open` nor `close`. No property is added (FR-003; US3 s2). Its fixture is `wardley-brace-ending` (T088).
- [ ] T016 [P] Add the third form of `create` to `$defs/AttributeBinding` of `etalii.adp/specifications/fbl/fbl.schema.json`, `{emit, after, pad}` as contracts/grammar-family.md gives it, admitted only in the `grammar` family (FR-006).
- [ ] T017 In `etalii.adp/specifications/fbl/FBL-specification.md`, replace section 4.9's sentence that the family "has no `insert-key` or `remove-key`" with research R7: the place rule (right after the last token of the first attribute of `after` that is present, so before a block and a trailing comment; refused when none is present), the padding rule (each absent attribute of `after` before it written with its own `emit` and the empty value, in the same splice; a part present, empty or not, is replaced and never padded again), the removal rule (`remove-key` of the part's span and the whitespace before it), and that clearing the last positional part removes it alone and leaves the empty parts before it; say that `absent` and `empty: "remove"` then apply as in the other families. Add the `grammar` form to section 5.2's `create` row, list `grammar` for `insert-key` and `remove-key` in section 6.1's table ("*(FBL 0.10)* absent part (grammar)"), and add to section 14.1 step 6 that `create.after` names attributes of the same rule. In `etalii.adp/.github/scripts/validate-examples.py`, make that check; add `etalii.adp/specifications/fbl/refused/grammar-create-after-unknown.fbl`, its `doc` naming the check, and see the validator fail when `after` names a real attribute, then restore it (FR-006; US1 s5; edge cases 7, 8).
- [ ] T018 In section 5.2 of `etalii.adp/specifications/fbl/FBL-specification.md`, extend the `{node}` row: for a `many` attribute the slot reads every node its selector reaches, in document order, each an item, and a set writes the difference as section 6.3 says for a word slot (`replace-value` of a changed item, `insert-key` by the slot's `create` of a new one, `remove-key` with one separator of a removed one); where a node stands twice for a single-valued slot the first is read and written (research R17) (FR-024). Extend T006's reading check to read `many` slots so.
- [ ] T019 [P] Let `opens` of `$defs/ElementRule` in `etalii.adp/specifications/fbl/fbl.schema.json` be a boolean or, in the `grammar` family only, `{open, close}`, as contracts/grammar-family.md gives it (FR-023).
- [ ] T020 In section 4.9 of `etalii.adp/specifications/fbl/FBL-specification.md`, state research R9: an add with `place: "last-child"` into an entry with no block writes `opens.open` after the entry's last token and before a trailing comment, the child, and the closing line indented like the entry, as `open-block`, `insert-entry` and `open-block`, its undo removing all of it; a line feed in `open` writes a line ending and the entry's indentation. List `grammar` for `open-block` in section 6.1's table (FR-023, FR-006).

**Checkpoint**: the shared constructs are stated, in the schema, checked by the scripts, and shown by `grammar-comment-start`; their Structurizr fixtures follow in Phase 3 and their Wardley map fixtures in pull request C.

---

## Phase 3: User Story 1, a Structurizr DSL workspace is read and written through a declared binding (Priority: P1) 🎯 MVP

**Goal**: `structurizr.fbl#workspace`, rewritten in the `grammar` family with `structurizr.lark` beside it, reads every workspace the C4 tool opens today and writes each edit as the fixtures state.

**Independent test**: the `structurizr-*` fixtures of contracts/fixtures.md replay and pass the reading check, and fail it with one planted wrong offset; `structurizr-open-block` passes with its input and expected bytes unchanged.

### The constructs of User Story 1

- [ ] T021 [US1] In section 4.9 of `etalii.adp/specifications/fbl/FBL-specification.md`, state research R5's rule 3 for a comment that spans lines: owned by rule 1 when it starts its line and by rule 2 when it follows a token, its owner's line span running to the end of its last line; nothing inside it is a token, statement, element or brace; a statement's content before or after it on its line is read as if it were not there; the removal or the move of its owner takes it with the owner's line span; and a block comment never closed is kept as trivia to the end of the body and reported under `recover.unclosed` (T011) rather than making the body unreadable (FR-004; US1 s3; edge cases 2, 3).
- [ ] T022 [US1] Add `escape` (`{with, quote}`, one character each) to the `{node}` form of `$defs/Slot` in `etalii.adp/specifications/fbl/fbl.schema.json`, admitted only in the `grammar` family; state research R8 in sections 4.9 and 5.2 of `etalii.adp/specifications/fbl/FBL-specification.md` (reading replaces `with`+`quote` by `quote` and `with`+`with` by `with` and keeps `with` before any other character, applied to `match`'s group `value`; writing escapes every `quote` and `with` of the value; the value's span unchanged) and change section 6.3's *grammar* bullet *A changed value* as contracts/grammar-family.md words it, the re-read check still refusing a value the escape cannot write. Extend T006's reading check to resolve escapes (FR-005; US1 s4; edge cases 5, 6).
- [ ] T023 [US1] Verify, before T034's fixture is committed, that the Structurizr CLI reads `\\` as one backslash (research R8), from the CLI run of `etalii.adp.ide.standalone/src/diagrams/c4/backend/EtAlii.Adp.Diagram.C4.Tests/` (`C4Interop.Tests.cs`) or the CLI itself, read-only. If it reads otherwise, record the difference in the C4 companions (T045) and put it to the maintainer as a selection before T022's construct is changed (FR-005).
- [ ] T024 [US1] In section 4.9 of `etalii.adp/specifications/fbl/FBL-specification.md`, state that a set, or a part written where it was absent (T017), on an entry that opens a block changes neither the block's opening nor any byte of the block (FR-007; US1 s6).
- [ ] T025 [US1] In `etalii.adp/specifications/fbl/fbl.schema.json`, admit `blocks` in a `grammar` binding (`$defs/Binding`); give `$defs/BlockRule` `at` (a Selector, `grammar` only, exactly one of `at` and `line`), `view` as a Slot in the `grammar` family (a `{node}` or `{value}` slot) beside the group name of `blocks`, and `origins` (an array of unique strings, at least one); and give `$defs/ElementRule` and `$defs/RelationRule` `selectedView` (a boolean) (data-model.md, *`$defs/Binding`*, *`$defs/BlockRule`*, *`$defs/ElementRule` and `$defs/RelationRule`*) (FR-008).
- [ ] T026 [US1] In `etalii.adp/specifications/fbl/FBL-specification.md`, add to section 4.9, after *Entries, values and selectors*, the four bullets of contracts/views-and-sidecars.md (*Views of a `grammar` binding*): a BlockRule of the family has `at` and no `line`, and with `view` its entries are views of the body; with `origins` it is a view for readings of those origins only; a rule with `selectedView: true` matches only entries inside the entry of the view the reading shows, and is unbound in every other view; every view stays an entry of the body, so a rule about the model sees all of them. Define `origins` in section 5.1 with one meaning for every rule that takes it (the readings it is read for, as origins of `claims.origins`; absent, every reading), naming BlockRule here; pull request B adds element and relation rules to the same definition (data-model.md). Point section 4.7's `view` at section 4.9 for the `grammar` family. Add to section 14.1 step 6 that `selectedView` stands only in a binding with a BlockRule that has `view`, and that the `origins` of a BlockRule are origins of `claims.origins` (FR-008, FR-014).
- [ ] T027 [US1] In `etalii.adp/.github/scripts/validate-examples.py`, make T026's two checks, and extend T006's reading check to read BlockRules with `at` and `view` and to read `selectedView` rules for the registration's view only. Add `etalii.adp/specifications/fbl/refused/grammar-selected-view-without-views.fbl` and `etalii.adp/specifications/fbl/refused/origins-not-claimed.fbl` (a BlockRule whose `origins` lists an origin the binding does not claim), each `doc` naming its check, and see the validator fail on each when it is made to pass, then restore it (FR-008).
- [ ] T028 [US1] Rewrite section 9.3 of `etalii.adp/specifications/fbl/FBL-specification.md` as contracts/views-and-sidecars.md gives it: views defined by a `grammar` binding beside those of section 4.7; without a `view` header, the first view in document order of the block rules whose `origins` include the reading's origin; which elements a view draws is the viewpoint's, and what FBL reads of the selected view is what the `selectedView` rules read inside it; and a registration whose `view` names no view of the body opens a reading with no view's content, reports **no finding**, and refuses a change of view data with "This view is not in the document, so its positions cannot be stored." writing nothing; FBL 0.9's rule that a `view` header over a binding that defines no views is kept and the reading shows the body stays (FR-009, FR-011; US1 s8, s10; edge case 12; Clarifications Q3).
- [ ] T029 [US1] Replace the `legacyLayout` bullet of section 8.7 of `etalii.adp/specifications/fbl/FBL-specification.md` with contracts/views-and-sidecars.md's text, for any family: keys matched ignoring the case of ASCII letters; of two keys of one view that match one id the first applies and the others are reported as `fbl.duplicate-key`; numbers written as section 6.3's `number: "shortest"`; a move a `replace-value` of `x` and `y`, a first placement an `insert-entry` laid out as the view's previous member with an `ensure-container` of a missing view object; stale entries of the view being written reported as `fbl.stale-view-data` and **pruned** at that write, other views untouched (research R15, which gives the reason for pruning) (FR-010; US1 s9; edge case 11).
- [ ] T030 [US1] Give `$defs/BlockRule` `insert` (an Insert, `grammar` only) in `etalii.adp/specifications/fbl/fbl.schema.json`, and state in section 4.9 of `etalii.adp/specifications/fbl/FBL-specification.md` that a BlockRule's insert adds one of its entries from its `emit`, at the place it states, planned and undone as an element's insert (section 6.2), producing no element and creating no registration (section 8.4 unchanged) (FR-012).
- [ ] T031 [US1] Add `gather` (an array of at least one Slot) to `$defs/AttributeBinding` of `etalii.adp/specifications/fbl/fbl.schema.json`, `grammar` only; state in section 4.9 or 5.2 of `etalii.adp/specifications/fbl/FBL-specification.md` that a read-only binding of a `many` attribute gathers its further `{node}` slots of the same entry after the first slot's values, in document order, leaving section 3.3 as it is; add the check to section 14.1 step 6 and to `etalii.adp/.github/scripts/validate-examples.py`; add `etalii.adp/specifications/fbl/refused/grammar-gather-writable.fbl`, and see the validator fail when its attribute is made `readOnly`, then restore it; extend T006's reading check to gather (FR-013).

### The grammar and the example binding

- [ ] T032 [US1] Write `etalii.adp/specifications/fbl/structurizr.lark` in ATD grammar notation as research R3 gives it: line ends as `_NL` tokens; `LINE_COMMENT`, `HASH_COMMENT` and a `BLOCK_COMMENT` with an optional closing, all ignored; positional arguments as one-token rules named by position (`name`, `description`, `technology`, `tags`) with `extra*`; quoted or bare arguments and keywords in any case; a block as `"{" _NL statement* "}"` after a statement; every element kind, `group`, `deploymentEnvironment`, the relationship forms, `!`-directives as one generic statement, the view kinds and the view statements. It builds in strict LALR(1) with no conflict and no terminal collision (`atd-grammar.py --check`), and reads every `.dsl` of `etalii.adp.ide.standalone/src/diagrams/c4/backend/EtAlii.Adp.Diagram.C4.Tests/Fixtures/` at `ad1a4680a`; a spelling it cannot read is recorded in the C4 companions as a gap with its fixture (T045), not answered by code (spec, Assumptions). See `--check` fail on a second `person` rule, then restore it (FR-033; quickstart, *For the grammars*).
- [ ] T033 [US1] Rewrite `etalii.adp/specifications/fbl/structurizr.fbl` in the `grammar` family as `"fbl": "0.10"`, `{"file": "structurizr.lark"}`, as contracts/examples-atd-companions.md gives it: its binding `workspace`, `claims` (`.dsl`, the six C4 origins), `registration` (`legacyLayout`, `createOnFirstPlacement`) and `template` kept; the block rules of every view kind with `origins` and `view`; the `selectedView` rules of the view statements (mapped `as: "diagram"` by the C4 definitions' `typeMap`, which do not change); the eight element kinds and the relationship forms; `opens`; `create` with `pad` on the positional arguments; `escape`; `gather` for tags; a BlockRule `insert` for a view; and `recover` with `nested` and `unclosed`. Write its tables with `python .github/scripts/atd-grammar.py --tables` to `etalii.adp/specifications/atd/grammar/tables/structurizr.workspace.tables.json` (research R18) (FR-008, FR-033, SC-002).

### The fixtures of User Story 1

Each under `etalii.adp/specifications/fbl/fixtures/`, binding `../../structurizr.fbl#workspace`, its input byte for byte as its source wrote it, its `doc` naming the source path in `etalii.adp.ide.standalone/src/diagrams/c4/backend/EtAlii.Adp.Diagram.C4.Tests/Fixtures/` and the commit, or saying it is written here; no licence file is added (contracts/fixtures.md, A; research R19). Each is seen to fail as *Checks* says before it is committed.

- [ ] T034 [P] [US1] Add `structurizr-escapes/` from `findings/escaped-quote.dsl`: `"Jo \"the user\""` reads `Jo "the user"`, `C:\temp` reads as written, a set to `Parity "name"` writes `"Parity \"name\""` and is not refused, and a set to a value holding a line break is refused and writes nothing (FR-005; US1 s4; edge cases 5, 6).
- [ ] T035 [P] [US1] Add `structurizr-comments/` from `comments-everywhere.dsl` and `structurizr-trailing-comments/` from `findings/trailing-comments.dsl`: `model { //` owned by `model`; `//` and `#` after a statement kept by a set that changes the value's bytes only; `"a // b"` and `"#1"` read as strings; a remove beside `/* block comment between elements */` taking the comment as section 4.9 states (a `remove-entry`) (FR-001, FR-004; US1 s1, s2, s3; edge case 1).
- [ ] T036 [P] [US1] Add `structurizr-block-comments/` from `findings/block-comments.dsl`: a three-line comment holding a declaration and a brace reads as nothing, the statement before `/* start` on its line is read, and the element next to the comment is removed with the comment as its owner's line span says (FR-004; US1 s3; edge case 2).
- [ ] T037 [P] [US1] Add `structurizr-absent-arguments/`, written here from the module's `C4AppendedArgument` cases: on `container "Web" // c` the technology set to `Java` is one `insert-key` of ` "" "Java"` before the comment, and its undo restores `container "Web" // c`; on `softwareSystem "S" {` a set and a written part leave the block's opening and bytes; on `container "Web" ""` the technology set replaces the empty argument and pads nothing; clearing the last positional argument leaves `""` before it (FR-006, FR-007; US1 s5, s6; edge cases 7, 8).
- [ ] T038 [P] [US1] Add `structurizr-recover-nested/`, its input `findings/unbalanced.dsl` with one statement in `model` that does not parse (the change named in `doc`), and `structurizr-recover-edges/`, written here: every element read, the siblings after the broken statement included; `fbl.unparsed-text` at its line; `fbl.unclosed-block` for each missing `}`; an add into the unclosed block refused with T011's reason and another edit planned; a stray `}` at the top level as `fbl.unmatched-close`; a `/*` never closed as `fbl.unclosed-comment` with nothing after it read; a top-level statement that does not parse read as FBL 0.9 reads it (FR-002, FR-004; US1 s7; edge cases 3, 9, 10).
- [ ] T039 [P] [US1] Add `structurizr-view-statements/` (`findings/view-statements.dsl` with a registration `view: containers` as its input) and `structurizr-view-without-key/` (`findings/view-without-key.dsl` with a registration whose `view` names no view): the document attributes are the container view's `include`, `exclude`, `title`, `autoLayout` and scope and no other view's statements reach them, while every view is read as an entry of the model; with no view named, no view's content, no finding, a `place` refused with nothing written, and the default keys of views written without one (FR-008, FR-009, FR-011; US1 s8, s10).
- [ ] T040 [P] [US1] Add `structurizr-legacy-layout/` from `findings/sidecar-keys.dsl` with its `.layout.json` and a registration: keys matched ignoring case, the first of two matching keys applied and the other reported as `fbl.duplicate-key`, a move writing `x` and `y` in the shortest form (`expectFiles`), the stale `gone` entry pruned at that write, and the `Unknown view` object untouched (FR-010; US1 s9; edge case 11).
- [ ] T041 [P] [US1] Add `structurizr-add-view/` and `structurizr-gathered-tags/`, written here: a BlockRule's insert adds a container view and its undo removes it; a declaration's tags and the `tags` statements of its block read as one list in document order, and a set of them refused as read-only (FR-012, FR-013).
- [ ] T042 [P] [US1] Add `structurizr-rename/` from `comments-everywhere.dsl`: renaming `web` rewrites every relationship that names it (`rewrite-reference`), keeping each line's comments, and its undo (FR-001, FR-032).
- [ ] T043 [US1] Confirm that `etalii.adp/specifications/fbl/fixtures/structurizr-open-block/` passes under the rewritten `structurizr.fbl` with `git diff --exit-code specifications/fbl/fixtures/structurizr-open-block/` empty, its `read` (`customer`, `shop`) now checked by the reading check, and its `open-block` and `insert-entry` splices those of T020 (FR-023, FR-031, SC-004).

### Where the binding is named

- [ ] T044 [US1] In section 17 of `etalii.adp/specifications/fbl/FBL-specification.md`, say that the six C4 types name `structurizr.fbl` *(grammar)*, and add `structurizr.lark` to Appendix A's list of examples beside `structurizr.fbl` (FR-033).
- [ ] T045 [US1] In the six C4 companions `etalii.adp/definitions/diagrams/c4-context.md`, `c4-container.md`, `c4-component.md`, `c4-deployment.md`, `c4-dynamic.md` and `c4-system-landscape.md`, record under *The gaps* gaps 1 to 8 as answered, each with the FBL 0.10 section and the fixture that answers it (as `databricks-*.md` records gap 3), their headings no longer naming "FBL 4.7 and 4.6"; say the format is bound in the `grammar` family by `structurizr.fbl`; keep gap 12 as unsupported on purpose and gaps 9 to 11 and 13 to 15 as DISL's, each saying why it is open; under *Stand-ins*, say that `AddC4ViewCommand` and the tags stand-in can go with FR-012 and FR-013; and record any spelling T032 could not read. Update each companion's `etalii.adp/definitions/diagrams/c4-*.trace.json` in the same change, so that every item of the traced sections is traced once with the companion's text (`check_trace` in `validate-examples.py`) (FR-034, SC-001, SC-006; research R23).

**Checkpoint**: User Story 1 is specified, exemplified and checked; the C4 conversion's tasks 13 to 17 can each name a section and a fixture for every gap they wait on (SC-001), once `fbl-grammar-family` has given the standalone library the 0.9 family.

---

## Phase 4: Closing pull request A

- [ ] T046 Write FBL 0.10's status paragraph in `etalii.adp/specifications/fbl/FBL-specification.md` (2026-10-xx, spec 066, for the C4 conversions): what it adds (comments owned and kept, recovery inside blocks, escapes, absent and positional parts, several nodes for a `many` attribute, a block written around a first child, views of a `grammar` binding with statements read for the selected view only, a view block that can be added, a read-only value gathered from two places, the legacy layout's matching, numbers and pruning, the fixture's `expectFiles`), that it extends the `grammar` family so that Structurizr DSL is bound in it, that a host binding Structurizr DSL or `.owm` through their declared bindings supports the family (section 15.1), and that every valid 0.9 document is a valid 0.10 document with the same meaning. Complete the schema's version description (T003) to match (FR-030, FR-037).
- [ ] T047 Rewrite the *Host — full* row of section 15.1 of `etalii.adp/specifications/fbl/FBL-specification.md` as contracts/grammar-family.md gives it: no host is required to support the `grammar` family, except that a host which reads or writes Structurizr DSL workspaces or `.owm` maps through their declared bindings (the six C4 tool types and the Wardley map) **MUST** support it with every construct of the version, say so, and pass its fixtures byte for byte with the same splices as every other host; and add to the section's last paragraph that a host which supports the family only at 0.9 treats a binding using a 0.10 construct of it as one whose family it does not support. In section 15.3, say that the fixtures together exercise every operation of section 6.1 for the `grammar` family's writes too, and confirm it: `replace-value`, `insert-key`, `remove-key`, `insert-entry`, `remove-entry`, `rewrite-reference` and `open-block` each appear in a `grammar` fixture (contracts/fixtures.md, *The operation coverage*). Read section 15.1 alone and say which hosts must support the family and what a host that does not does with a C4 workspace (FR-032, FR-037; US1 s11; edge case 20; SC-007).
- [ ] T048 In `etalii.adp/specifications/atd/ATD-specification.md`, carry pull request A's constructs (research R21; contracts/examples-atd-companions.md, *ATD*), with no change under `specifications/atd/grammar/` except T033's tables: sections 1.3 and 11 name FBL 0.10; section 11.9 gains a bullet per new setting (`recover`'s `nested` and `unclosed`, a slot's `escape`, an attribute binding's `create` with `after` and `pad` and its `gather`, a rule's `opens` as a settings map and `selectedView`, a block rule's `at`, `view`, `origins` and `insert` in `block <name> { … }`); Appendix C's section C.3 is retitled *FBL 0.10*, its count of properties updated, with one row per new schema property of A; section 18 gains the line "0.1, amendment of <date>, FBL 0.10 (spec 066): …", ending "Every description that checked before still checks, with the same meaning." (FR-035).
- [ ] T049 Confirm that no file under `etalii.adp/specifications/disl/`, `etalii.adp/specifications/desl/`, `etalii.adp/specifications/did/` or `etalii.adp/specifications/ded/` changed and that no C4 definition's `typeMap` changed (FR-036; research R22); that every example, registration and fixture that passed the validator before passes it unchanged, `w3c-turtle-grammar` and `w3c-turtle-grammar-partial` included, with `git diff --exit-code` over every existing fixture folder empty (FR-031, SC-004); and that every new fixture and refused binding was seen to fail as *Checks* says (SC-003). Run `python .github/scripts/thinkrail-specs.py` and every check, and record the exit codes in the pull request.
- [ ] T050 Read FBL 0.10 alone against User Story 1's eleven acceptance scenarios and say, for each, which bytes the host reads and writes (SC-005); compare `etalii.adp.ide.standalone/.spec-workflow/specs/c4-disl-fbl/requirements.md`'s binding draft (appendix, at `ad1a4680a`) with `structurizr.fbl`, naming for each property it marks as not FBL the 0.10 construct that states it (SC-002); and confirm that each of c4-disl-fbl tasks 13 to 17 can name a section and a fixture for every gap it waits on in the C4 companions (SC-001). Nothing of the standalone repository is changed.
- [ ] T051 Run the coverage diff over pull request A (every FR and SC it claims in *Coverage* against these tasks and the merged text, then two traces read back to their artefacts, asking whether the evidence is that criterion's); push the branch, open the pull request into `develop`, ready for review, its description linking `specs/066-fbl-conversion-gaps/` and naming the etalii.adp commit of T001; tick T001 to T051 here in it.

---

# Pull request B: the Databricks bundle file, FBL 0.11

## Phase 5: Foundational, the version and the fixture's template (B)

**Blocks**: every other task of pull request B.

- [ ] T052 Make the worktree `etalii.adp/.claude/worktrees/066-databricks/` on `features/066-fbl-conversion-gaps-databricks` from `origin/develop` at the merge of this `tasks.md`, set its `user.name` and read it back. It may be written side by side with pull request A.
- [ ] T053 Make `etalii.adp/specifications/fbl/FBL-specification.md` the next minor version after `develop`'s (0.11 after A, 0.10 if B merges first): the header, section 2.1's table and section 2.7, and Appendix A; add it to the `fbl` enum of `etalii.adp/specifications/fbl/fbl.schema.json` and its description. The status paragraph is T072's (FR-030).
- [ ] T054 Add a fixture's `template` (`{name, origin}`) to `$defs/Fixture` of `etalii.adp/specifications/fbl/fbl.schema.json` and to section 15.3 of `etalii.adp/specifications/fbl/FBL-specification.md` (contracts/fixtures.md, *What a fixture gains*); in `etalii.adp/.github/scripts/validate-examples.py`, write the binding's template for that name and origin with its placeholders replaced, compare it with the input byte for byte, and apply `read` and `steps` to it; see it fail on one changed byte of a template, and update the module's docstring (FR-022, FR-032).

---

## Phase 6: User Story 2, one Databricks bundle file is three editable readings (Priority: P2)

**Goal**: `databricks.fbl#configuration` serves the bundle, job and pipeline readings of one `databricks.yml`, each editable, each selecting its own resource, with the `yaml` family's writes that their edits need.

**Independent test**: the `databricks-*` fixtures of contracts/fixtures.md replay, three registrations over one body are each edited, and `dependency-graph-empty-flow-sequence` passes with its splices unchanged.

### The constructs of User Story 2

- [ ] T055 [US2] Add `origins` to `$defs/ElementRule` and `$defs/RelationRule` of `etalii.adp/specifications/fbl/fbl.schema.json` as contracts/readings-and-yaml.md gives it; in section 5.1 of `etalii.adp/specifications/fbl/FBL-specification.md`, add element and relation rules to the definition of `origins` that pull request A gives BlockRules (or, if B merges first, give that definition, naming every rule that takes it), with the sentence that the first rule in the binding's order whose `origins` admit the reading and whose `when` holds takes an entry, so an entry becomes at most one element **per reading**; extend section 14.1 step 6's `origins` check to these rules and make it in `etalii.adp/.github/scripts/validate-examples.py`, seeing it fail on a scratch binding whose rule names an unclaimed origin (FR-014; US2 s1).
- [ ] T056 [US2] Rewrite section 9.1 of `etalii.adp/specifications/fbl/FBL-specification.md` as contracts/readings-and-yaml.md gives it (one open body per path and binding, with one model per origin it is read for; every reading a view of it, an edit planned once and shown in every reading of every origin without a reload; undo of the body's latest edit from any reading; a registration's resource selection a view of its origin's model), and add to section 9.2 that readings of different origins through one binding are all editable, its read-only rule for a specification naming another binding kept (FR-015, FR-017; US2 s2, s3).
- [ ] T057 [US2] Give `$defs/RegistrationSettings/properties/resource` `byOrigin` beside `capture`, exactly one of them, as contracts/readings-and-yaml.md gives it, in `etalii.adp/specifications/fbl/fbl.schema.json`; state in section 8.2 of `etalii.adp/specifications/fbl/FBL-specification.md` that `resource` binds the capture `byOrigin` gives the reading's origin, that the default (the first entry in document order the capture matches) applies per origin, that an origin mapped to `null` or not listed selects none, and that a header naming a resource the body lacks opens the reading empty with a finding; check in `etalii.adp/.github/scripts/validate-examples.py` that `byOrigin`'s origins are claimed (FR-016; US2 s3; edge case 13).
- [ ] T058 [US2] In sections 4.3 and 6.2 of `etalii.adp/specifications/fbl/FBL-specification.md`, state research R13: an insert into an empty flow sequence (`tasks: []`) as a `replace-value` of the value and the whitespace before it by nothing and the `insert-entry` of a block sequence entry under the key, after any comment on its line; an insert into a one-line flow sequence as one `insert-entry` before `]` of `, ` and the item, a mapping item in flow form in `insert.keys` order; a removal from a one-line sequence as a `remove-entry` of the item and one separator (the one after it, or for the last item the one before it); an insert into a flow sequence over several lines, or into a flow mapping, refused with a reason; each with its exact inverse. Change the `doc` of `etalii.adp/specifications/fbl/fixtures/dependency-graph-empty-flow-sequence/fixture.json` to say FBL now states it, its input and splices unchanged (FR-018; US2 s4, s5; edge cases 14, 15).
- [ ] T059 [US2] Add `refusals` to `$defs/AttributeBinding` (`{empty, absent}`) and to `$defs/Insert` (`{when, container}`) of `etalii.adp/specifications/fbl/fbl.schema.json`, each a LocalizedText; list in section 6.4 of `etalii.adp/specifications/fbl/FBL-specification.md` the refusals a binding gives a sentence for, as `readOnly` gives one (section 3.4), the host's wording standing without one, and say in section 15.3 that a fixture's `refused` is that sentence where the binding gives one (FR-019; US2 s6).
- [ ] T060 [US2] In section 6.2's `keys` row of `etalii.adp/specifications/fbl/FBL-specification.md`, state contracts/readings-and-yaml.md's rule that an add writes an attribute bound with `child` under the levels of `child` in the new entry's one `insert-entry` (the outermost key at its place in `keys`, else after the entry's other keys and before its constants and `skeleton`; each deeper level one indentation step deeper) (FR-020; US2 s9).
- [ ] T061 [US2] Add `secondary` (a Slot) to `$defs/AttributeBinding` of `etalii.adp/specifications/fbl/fbl.schema.json`, with a `not` that refuses it beside `override`; state in section 5.2 of `etalii.adp/specifications/fbl/FBL-specification.md` that it is read only when the attribute's slot is absent, that writing the attribute writes its slot and removes the secondary (`remove-key`) in the same edit, and that when both are present the first is read and the secondary removed at the next write; say it differs from FBL 0.5's `fallback` (FR-021; US2 s7; edge case 16).
- [ ] T062 [US2] Add `{key:lower}` to section 13 of `etalii.adp/specifications/fbl/FBL-specification.md` (`{key}` with every ASCII letter in lower case, so `My_Job.yml` gives `my_job`) and to `$defs/Template`'s description in `etalii.adp/specifications/fbl/fbl.schema.json` (FR-022; US2 s8).

### The example binding

- [ ] T063 [US2] Add `etalii.adp/specifications/fbl/databricks.fbl`, binding `configuration`, `family: "json"` with `alsoRead: ["yaml"]`, for `databricks/bundle`, `databricks/job` and `databricks/pipeline`, written from the binding draft in the appendix of `etalii.adp.ide.standalone/.spec-workflow/specs/databricks-disl-fbl/requirements.md` (at `ad1a4680a`, read-only) in FBL 0.11's constructs: `origins` on its rules, `resource.byOrigin`, FBL 0.5's text reads, `secondary` for a pipeline's `schema` and `target`, `refusals` (the job's "The job has no tasks section to add into."), a library written as a nested mapping on add, and `template.byOrigin` with `{key:lower}`. Say in the `doc` of `etalii.adp/specifications/fbl/databricks-job.fbl` and `etalii.adp/specifications/fbl/databricks-pipeline.fbl`, whose rules do not change, that `databricks.fbl` is the binding the three readings share (research R18) (FR-033, SC-002).

### The fixtures of User Story 2

Each under `etalii.adp/specifications/fbl/fixtures/`, binding `../../databricks.fbl#configuration` (one level deeper in a subfolder), its body copied from `etalii.adp.ide.standalone/src/diagrams/databricks/` with its path and commit in `doc`, or written here (contracts/fixtures.md, B). Each is seen to fail as *Checks* says before it is committed.

- [ ] T064 [P] [US2] Add `databricks-readings/` with `databricks.yml` from `examples/lakehouse/databricks.yml` and the subfolders `bundle/`, `job/` and `pipeline/`, each a registration over it: the bundle reading's resources, the job's tasks and dependencies, the pipeline's own attributes and libraries, no element of a type the reading's metamodel lacks, and one edit in each, so each is editable (FR-014, FR-015, FR-016; US2 s1).
- [ ] T065 [P] [US2] Add `databricks-rename-shared/` over `lakehouse/databricks.yml` through the job reading: a task renamed with its `depends_on` references in one edit and its undo, and a step reading the edited body through the bundle reading with the new name (FR-015, FR-017; US2 s2).
- [ ] T066 [P] [US2] Add `databricks-resources/`, registrations over `Fixtures/two-jobs-two-pipelines.yml`: each job and pipeline registration selects its `resource:` header's resource, or the first of its kind without one; the bundle registration selects none; a header naming no resource opens empty with a finding (FR-016, FR-017; US2 s3; edge case 13).
- [ ] T067 [P] [US2] Add `databricks-flow-empty/` from `Fixtures/flow-collections.yml` and `databricks-flow-one-line/` from `Fixtures/flow-dependencies.yml`: a task added to `tasks: []`, read back with one task, its undo restoring `tasks: []` byte for byte; a dependency on `b` written `, {task_key: b}` inside `[{task_key: a}]`, its removal restoring the line; an insert into a flow sequence over several lines and one into a flow mapping (`{}`) refused (FR-018; US2 s4, s5; edge cases 14, 15).
- [ ] T068 [P] [US2] Add `databricks-refusals/` and `databricks-secondary/`, written here: "The job has no tasks section to add into." as the refusal of an insert without its container, and an `empty` refusal's sentence; `target` read as the schema when `schema` is absent, a set writing `schema` and removing `target`, and with both present `schema` read and `target` removed on write (FR-019, FR-021; US2 s6, s7; edge case 16).
- [ ] T069 [P] [US2] Add `databricks-library-add/`, a YAML pipeline from the corpus, and `databricks-template-key/` with `template: {name: "My_Job.yml", origin: "databricks/job"}`: a library added as `- notebook:` with `path:` below it, read back as the library added; the new document's key is `my_job` (FR-020, FR-022; US2 s8, s9).

### Where the binding is named

- [ ] T070 [US2] In section 17 of `etalii.adp/specifications/fbl/FBL-specification.md`, say that the three Databricks types name `databricks.fbl`, and that `databricks-job.fbl` and `databricks-pipeline.fbl` are the per-reading bindings of 0.1; add `databricks.fbl` to Appendix A's list of examples (FR-033).
- [ ] T071 [US2] In `etalii.adp/definitions/diagrams/databricks-bundle.md`, `databricks-job.md` and `databricks-pipeline.md`, record under *The gaps* gaps 1, 2, 4, 5, 6 (part 3) and 7 as answered, each with its FBL section and fixture, say the shared binding is `databricks.fbl`, and keep gaps 8 and 9 as DISL's, saying why; update `etalii.adp/definitions/diagrams/databricks-bundle.trace.json`, `databricks-job.trace.json` and `databricks-pipeline.trace.json` in the same change so that `check_trace` passes (FR-034, SC-001, SC-006).

**Checkpoint**: User Story 2 is specified, exemplified and checked; databricks-disl-fbl tasks 10 to 13 can each name a section and a fixture for the gaps they wait on (task 14 waits on the client's `simulate` player, outside this feature).

---

## Phase 7: Closing pull request B

- [ ] T072 Write the version's status paragraph in `etalii.adp/specifications/fbl/FBL-specification.md` (spec 066, for the Databricks conversion): one binding serving readings of different metamodels (`origins`, `resource.byOrigin`, one model per origin of one open body), inserts into YAML flow sequences, refusal sentences, a nested mapping written by an add, `secondary`, `{key:lower}` and the fixture's `template`; and that every valid document of the version before is valid in it with the same meaning. Complete the schema's version description to match (FR-030).
- [ ] T073 Merge `origin/develop` into the branch (no rebase, no force) and, if pull request A has merged, take the next minor version: bring the status paragraph, section 2.1's table, section 2.7, Appendix A and the `fbl` enum up to date with A's, and join T055's `origins` text in section 5.1 and its schema description to A's (T026), the two places the plan names (FR-030; plan, *Delivery*; data-model.md).
- [ ] T074 In `etalii.adp/specifications/atd/ATD-specification.md`, carry pull request B's constructs: sections 1.3 and 11 name the version; sections 11.3 and 11.6 add `origins` on a rule, `secondary`, `refusals` and `resource`'s `byOrigin`; Appendix C's section C.3 is retitled for the version with one row per new schema property of B (`origins` on ElementRule and RelationRule, `secondary`, both `refusals`, `byOrigin`, the fixture's `template` where C.3 lists fixtures) and its count updated; section 18 gains the version's amendment line (FR-035).
- [ ] T075 Confirm FR-036 (no DISL, DESL, DID or DED file changed; no `typeMap` gains a value, research R22), FR-031 and SC-004 (every earlier example, registration and fixture passes unchanged, `dependency-graph-empty-flow-sequence` with its splices unchanged and `databricks-job-dependencies` and `databricks-pipeline-json` unchanged under their bindings), and SC-003 (every new fixture seen to fail). Run `python .github/scripts/thinkrail-specs.py` and every check, recording the exit codes.
- [ ] T076 Read the version alone against User Story 2's nine acceptance scenarios and say which bytes the host reads and writes for each (SC-005); compare the databricks-disl-fbl appendix draft with `databricks.fbl`, naming the construct for each property it marks as not FBL, or recording the difference in the Databricks companions (FR-033, SC-002); confirm databricks-disl-fbl tasks 10 to 13 can name a section and a fixture for every gap they wait on (SC-001).
- [ ] T077 Run the coverage diff over pull request B as T051 does; push, open the pull request into `develop`, ready for review, its description linking `specs/066-fbl-conversion-gaps/` and naming the etalii.adp commit of T052; tick T052 to T077 here in it.

---

# Pull request C: the Wardley map, FBL 0.12

## Phase 8: Foundational, the version and the reading of items (C)

**Blocks**: every other task of pull request C. Starts once pull request A is merged.

- [ ] T078 Make the worktree `etalii.adp/.claude/worktrees/066-wardley/` on `features/066-fbl-conversion-gaps-wardley` from `origin/develop` after A's merge, set its `user.name` and read it back.
- [ ] T079 Make `etalii.adp/specifications/fbl/FBL-specification.md` the next minor version after `develop`'s (0.12 after A and B): the header, section 2.1's table, section 2.7 and Appendix A; add it to the `fbl` enum of `etalii.adp/specifications/fbl/fbl.schema.json` and its description. The status paragraph is T096's (FR-030).

---

## Phase 9: User Story 3, a Wardley map is read and written through a declared binding (Priority: P3)

**Goal**: `wardley-map.fbl#map`, with `wardley-map.lark` beside it, reads every map the tool opens today with the ids its identities file stores, and writes each edit as the fixtures state.

**Independent test**: the `wardley-*` fixtures of contracts/fixtures.md replay and pass the reading check, the identities of `examples/example 2/` are read for their elements, and each fixture fails with one planted wrong offset.

### The grammar and the constructs of User Story 3

- [ ] T080 [US3] Write `etalii.adp/specifications/fbl/wardley-map.lark` in ATD grammar notation as research R4 gives it: `_NL` as in `structurizr.lark`; `COMMENT` ignored, with a `URL` token that starts before the `//` of `https://` and is longer than the comment from there; free text (`title`, `note`, an annotation's text) to the line end, so `title A map {` opens nothing; `pipeline` with an optional line end before its `{` beside `pipeline_bare`; a component's trailer as `segment*`; an annotation's positions as repeated `position` nodes of two numbers. It builds in strict LALR(1) with no conflict and no terminal collision and reads every `.owm` of `etalii.adp.ide.standalone/src/diagrams/wardley-map/examples/example 2/` and `src/diagrams/wardley-map/backend/EtAlii.Adp.Diagram.WardleyMap.Tests/Fixtures/` at `ad1a4680a`; a spelling it cannot read is recorded in the companion as a gap (T095) (FR-033).
- [ ] T081 [US3] In section 4.9 of `etalii.adp/specifications/fbl/FBL-specification.md`, state that a grammar in which a block's opening brace may stand on the line after its statement reads both forms in one body, with the `.owm` grammar as its example, and that an add writes a new block in the form the binding declares (`opens` with `"\n{"` for the Wardley map, ` {` for Structurizr) (FR-023; US3 s1).
- [ ] T082 [US3] In section 4.9 of `etalii.adp/specifications/fbl/FBL-specification.md`, state that a slot may be bound to a segment the grammar reads in any order among the other segments of one group (`label [-30, 12]`, `( market )`, `url(name)`, `inertia`), each with its own span: a set replaces that segment alone, an absent segment is written by `create` at its place (T017), a cleared one is removed with one separator and nothing else, a `many` attribute reads every segment of its kind in written order and writes only the difference (T018), and where a segment stands twice the first is read and written (FR-024; US3 s5; edge case 17).
- [ ] T083 [US3] Add `items` (a map from an item attribute to a `{node}` Slot relative to each item node) and `separator` to the `{node}` form of `$defs/Slot` in `etalii.adp/specifications/fbl/fbl.schema.json`, `grammar` only; state research R17's second bullet in sections 5.2 and 6.3 of `etalii.adp/specifications/fbl/FBL-specification.md` (a list of structured values; one item's value a `replace-value` of its span; an item added by `insert-key` of `separator` and `create.emit` after the last item, removed by `remove-key` of the item and one separator, the one before it or for the first item the one after it); settle the item selector with T080's grammar, naming the two numbers as rules of the grammar unless the grammar cannot, and make contracts/grammar-family.md's example follow that choice; add to section 14.1 step 6 that `items` stands only on a `many` attribute's `{node}` slot, make the check in `etalii.adp/.github/scripts/validate-examples.py`, add `etalii.adp/specifications/fbl/refused/items-not-many.fbl` and see the validator fail when its attribute is made `many`, then restore it (FR-025; US3 s6).
- [ ] T084 [US3] Rewrite the `legacyIdentities` bullet of section 8.7 of `etalii.adp/specifications/fbl/FBL-specification.md` as contracts/views-and-sidecars.md gives it (a JSON array of `{id, kind, key}`, matched by a rule's `sidecar.kind` and natural key, read when the registration has no `identities:` block and written back while the file exists by json splices: a new entry an `insert-entry` after the last item laid out as it is, a moved key a `replace-value` of `key`, a pruned entry a `remove-entry` with one separator; an entry of an undeclared kind kept as written and reported as `fbl.stale-view-data`; FBL 0.9's object form named as never written), keeping the rule that a host **MUST NOT** create the file for a new document; describe `legacyIdentities` anew in `$defs/RegistrationSettings` of `etalii.adp/specifications/fbl/fbl.schema.json` (FR-026; US3 s7; edge case 18).
- [ ] T085 [US3] Add `kind` (a Name) and `ordinal` (a string holding `{n}` once) to `sidecar` in `$defs/IdBinding` of `etalii.adp/specifications/fbl/fbl.schema.json`; rewrite section 8.6 of `etalii.adp/specifications/fbl/FBL-specification.md` as contracts/views-and-sidecars.md gives it: entries keyed `<kind>:<natural key>` when the rule declares `kind`; without `ordinal` FBL 0.9's `std.duplicateId` rule stands, with it each later holder of one natural key, counted per kind in document order, is keyed with `ordinal` and its ordinal and has an id of its own, first stored with the next write of the body; when an attribute a natural key is computed from changes, the entry moves to the new key in the same edit and an undo moves it back; an id first stored for an element is written with the next write and is no step of the history (section 7.1) (FR-027, FR-028, FR-029; US3 s8, s9).
- [ ] T086 [US3] Extend T006's reading check in `etalii.adp/.github/scripts/validate-examples.py` to read `items` as T083 states, and identities by `sidecar.kind` and `ordinal` and from a legacy identities file as T084 and T085 state (FR-025, FR-026, FR-027, FR-028).

### The example binding

- [ ] T087 [US3] Add `etalii.adp/specifications/fbl/wardley-map.fbl`, binding `map`, `grammar` with `{"file": "wardley-map.lark"}`, as contracts/examples-atd-companions.md gives it: claims `.owm` and `wardley/map`; every statement kind the module reads; `opens` with `"\n{"`; the trailer's segments with `create`; annotation positions with `items`; `id.sidecar` with `kind` per rule and `ordinal` `"\u001f{n}\t"` (the form the module writes, research R16); `registration.legacyIdentities: "{base}.identities.json"`; `recover` with `nested`. Write its tables with `--tables` to `etalii.adp/specifications/atd/grammar/tables/wardley-map.map.tables.json` (FR-033, SC-002).

### The fixtures of User Story 3

Each under `etalii.adp/specifications/fbl/fixtures/`, binding `../../wardley-map.fbl#map` (one level deeper in a subfolder), its body copied from `etalii.adp.ide.standalone/src/diagrams/wardley-map/backend/EtAlii.Adp.Diagram.WardleyMap.Tests/Fixtures/` or `src/diagrams/wardley-map/examples/example 2/` with its path and commit in `doc` (contracts/fixtures.md, C). Each is seen to fail as *Checks* says before it is committed.

- [ ] T088 [P] [US3] Add `wardley-pipelines/` from `pipelines-both-forms.owm` and `wardley-brace-ending/` from `brace-ending-statements.owm`: a pipeline whose `{` is on the next line owns its block and its components are its children, a pipeline added with its brace on its own line and its undo removing all of it; `title A map {` opens nothing and keeps its `{`, and the braces balance (FR-003, FR-023; US3 s1, s2).
- [ ] T089 [P] [US3] Add `wardley-unclosed-pipeline/` from `unclosed-pipeline.owm`: the pipeline's children read, `fbl.unclosed-block`, an add into the pipeline refused, another edit planned (FR-002; US3 s3).
- [ ] T090 [P] [US3] Add `wardley-comments/` with the subfolders `comments-everywhere/` and `trailing-comments/` from the two files of those names: a coordinate change of `component Tea [0.2, 0.8] // hot` changes only the numbers and keeps the comment, and the `//` of `https://` in a `url(site)` statement is no comment (FR-001; US3 s4).
- [ ] T091 [P] [US3] Add `wardley-trailer/` from `lenient-trailer.owm` and `wardley-annotation-positions/` from `annotations-and-labels.owm`: `inertia`, `label [-30, 12]` and `( market )` read in any order, one set changing only its own bytes, a label written on `component Milk [0.3, 0.6]` at its declared place and cleared with one separator, a segment twice reading the first, and the decorators as one set with one added and one removed; the two positions of `annotation 1`, each of two numbers, one set alone, one added and one removed with its separator (FR-024, FR-025; US3 s5, s6; edge case 17).
- [ ] T092 [P] [US3] Add `wardley-legacy-identities/` from `example 2/annotations-and-labels.owm` with its `.identities.json` and `.adp`: every element has the stored id for its kind and key, no element gets a new id, and an entry of an undeclared kind is kept and reported (FR-026, FR-027; US3 s7; edge case 18).
- [ ] T093 [P] [US3] Add `wardley-duplicate-names/` with the subfolders `duplicate-names/` and `same-key-twice/`, and `wardley-rename-identity/` from `example 2/annotations-and-labels.owm` with its `.identities.json`: each holder of `Tea` has an id of its own, the later ones keyed with `ordinal`, the entry first written with the next write of the body (`expectFiles`); a rename moves the identity entry in the same edit (`expectFiles`), its undo moves it back, and a rename to a name another holder has is refused (FR-028, FR-029; US3 s8, s9; edge case 19).

### Where the binding is named

- [ ] T094 [US3] In section 17 of `etalii.adp/specifications/fbl/FBL-specification.md`, move the Wardley map to "A declared binding" naming `wardley-map.fbl`, and add `wardley-map.fbl` and `wardley-map.lark` to Appendix A's list of examples (FR-033).
- [ ] T095 [US3] In `etalii.adp/definitions/diagrams/wardley-map.md`, record under *Language gaps* gaps 1 to 8 as answered, each with its FBL section and fixture, say the format is bound in the `grammar` family by `wardley-map.fbl`, keep gaps 9 to 12 as DISL's, saying why, and record any spelling T080 could not read; update `etalii.adp/definitions/diagrams/wardley-map.trace.json` in the same change so that `check_trace` passes (FR-034, SC-001, SC-006).

**Checkpoint**: User Story 3 is specified, exemplified and checked; wardley-map-disl-fbl tasks 11 to 13 can each name a section and a fixture for every gap they wait on, once `fbl-grammar-family` has given the standalone library the 0.9 family.

---

## Phase 10: Closing pull request C, and the feature

- [ ] T096 Write the version's status paragraph in `etalii.adp/specifications/fbl/FBL-specification.md` (spec 066, for the Wardley map conversion): a next-line brace, trailer segments in any order and as sets, structured items, identity kinds, a stored id per holder of a repeated key, an identity entry that follows its key; that the `grammar` family now binds `.owm` as well, so both formats of section 15.1's requirement have a declared binding; that every valid document of the version before is valid with the same meaning except `legacyIdentities`, whose object form no binding, example or fixture used and no tool wrote (research R16). Complete the schema's version description (FR-030).
- [ ] T097 In `etalii.adp/specifications/atd/ATD-specification.md`, carry pull request C's constructs: sections 1.3 and 11 name the version; section 11.9 adds a slot's `items` and `separator`; section 11.6 adds `id { sidecar: { kind, ordinal } }` and `legacyIdentities`'s array; Appendix C's section C.3 retitled for the version with one row per new schema property of C and its count updated; section 18's amendment line (FR-035).
- [ ] T098 Confirm FR-036 (no DISL, DESL, DID or DED file changed), FR-031 and SC-004 (every earlier example, registration and fixture passes unchanged, A's and B's included), and SC-003 (every new fixture and `items-not-many.fbl` seen to fail). Run `python .github/scripts/thinkrail-specs.py` and every check, recording the exit codes.
- [ ] T099 Read the version alone against User Story 3's nine acceptance scenarios, so that with T050 and T076 each of the 29 is answered (SC-005); compare the wardley-map-disl-fbl appendix draft with `wardley-map.fbl` as T050 does (SC-002); confirm wardley-map-disl-fbl tasks 11 to 13 can name a section and a fixture for every gap they wait on, which with T050 and T076 covers the twelve waiting tasks (SC-001); and read section 15.1 again for the Wardley map (SC-007).
- [ ] T100 Run the coverage diff over the whole feature (every FR and SC of the specification against the requirement references of every task and the merged text of A, B and C, then two traces read back to their artefacts); push, open the pull request into `develop`, ready for review, its description linking `specs/066-fbl-conversion-gaps/` and naming the etalii.adp commit of T078; tick T078 to T100 here in it.

---

## Coverage

Every functional requirement and success criterion, and the tasks that claim it. A task's own text names what it shows; the closing tasks of each pull request (T051, T077, T100) re-run this table against the merged text and read two traces back.

| Requirement | Tasks | PR |
|---|---|---|
| FR-001 | T008, T009, T014, T035, T042, T090 | A, C |
| FR-002 | T010, T011, T012, T013, T038, T089 | A, C |
| FR-003 | T015, T088 | A, C |
| FR-004 | T010, T011, T013, T021, T035, T036, T038 | A |
| FR-005 | T022, T023, T034 | A |
| FR-006 | T016, T017, T020, T037 | A |
| FR-007 | T024, T037 | A |
| FR-008 | T025, T026, T027, T033, T039 | A |
| FR-009 | T028, T039 | A |
| FR-010 | T004, T029, T040 | A |
| FR-011 | T028, T039 | A |
| FR-012 | T030, T041, T045 | A |
| FR-013 | T031, T041, T045 | A |
| FR-014 | T026, T055, T064 | A, B |
| FR-015 | T056, T064, T065 | B |
| FR-016 | T057, T064, T066 | B |
| FR-017 | T056, T065, T066 | B |
| FR-018 | T058, T067 | B |
| FR-019 | T059, T068 | B |
| FR-020 | T060, T069 | B |
| FR-021 | T061, T068 | B |
| FR-022 | T054, T062, T069 | B |
| FR-023 | T019, T020, T043, T081, T088 | A, C |
| FR-024 | T018, T082, T091 | A, C |
| FR-025 | T083, T086, T091 | C |
| FR-026 | T084, T086, T092 | C |
| FR-027 | T085, T086, T092 | C |
| FR-028 | T085, T086, T093 | C |
| FR-029 | T085, T093 | C |
| FR-030 | T002, T003, T046, T053, T072, T073, T079, T096 | A, B, C |
| FR-031 | T006, T043, T049, T075, T098 | A, B, C |
| FR-032 | T004, T005, T006, T042, T047, T054, and every fixture task | A, B, C |
| FR-033 | T032, T033, T044, T063, T070, T076, T080, T087, T094 | A, B, C |
| FR-034 | T045, T071, T095 | A, B, C |
| FR-035 | T048, T074, T097 | A, B, C |
| FR-036 | T049, T075, T098 | A, B, C |
| FR-037 | T046, T047 | A |
| SC-001 | T045, T050, T071, T076, T095, T099 | A, B, C |
| SC-002 | T033, T050, T063, T076, T087, T099 | A, B, C |
| SC-003 | T005, T006, T049, T075, T098, and every fixture and refused-binding task | A, B, C |
| SC-004 | T006, T043, T049, T075, T098 | A, B, C |
| SC-005 | T050, T076, T099 | A, B, C |
| SC-006 | T045, T071, T095 | A, B, C |
| SC-007 | T047, T099 | A, C |

**Claimed by the document's shape rather than by one task**: the edge cases are claimed by the task that states or shows each, named in its text (edge cases 1 to 20, in the specification's order); the specification's *Gap to requirement* table maps every gap to the requirements above, so a gap is covered when its requirements are. The gaps FBL 0.9 already answers (Databricks gaps 3 and 6 in part, Wardley map gap 5 in the `lines` and `blocks` families) are no requirement and take no task. FR-036's permitted `typeMap` value is not used (research R22), so its only task is the check that nothing changed.

---

## Dependencies and execution order

### Pull requests

- **A** (Phases 1 to 4) starts when this `tasks.md` is merged.
- **B** (Phases 5 to 7) starts when this `tasks.md` is merged, side by side with A; it shares no file region with A except the version lists, the status paragraph, section 5.1's `origins` and ATD's C.3 heading, which T073 reconciles.
- **C** (Phases 8 to 10) starts when A is merged: it uses A's comments, recovery, absent parts, `many` nodes, `opens`, `expectFiles` and the reading check. It does not wait on B.

### Within pull request A

- T001 first; T002 and T003 together; T004 before T005; T006 before every task that extends the reading check; T007 before T012 and T014.
- Phase 2: T008 before T009; T010 and T011 before T012 and T013; T016 before T017; T019 before T020. T014 after T007 and T009.
- Phase 3: T021 to T031 in any order after Phase 2, except T025 before T026 before T027; T032 before T033; T033 before every fixture task (T034 to T042) and T043; T023 before T034 is committed; T044 and T045 after the fixtures they name.
- Phase 4: T046, T047 and T048 after Phase 3; T049 and T050 after them; T051 last.

### Within pull request B

- T052, then T053 and T054. T055 to T062 in any order; T063 after T055, T057, T059, T061 and T062; the fixture tasks (T064 to T069) after T063; T070 and T071 after them. T072 to T076, then T073 again if A merged meanwhile, then T077.

### Within pull request C

- T078, then T079. T080 (the grammar) first, since T083's item selector is settled with it; T081 to T085 in any order after it; T086 after T083 to T085; T087 after T080 to T086; the fixture tasks (T088 to T093) after T087; T094 and T095 after them; T096 to T099, then T100.

### Parallel opportunities

- The `[P]` schema tasks of Phase 2 (T010, T016, T019) beside their prose tasks' drafting.
- Every fixture task of a story is `[P]`: one folder each, once its binding exists (T034 to T042 after T033; T064 to T069 after T063; T088 to T093 after T087).
- Pull requests A and B as a whole, by two sessions in two worktrees.

## Parallel example: User Story 1

```text
After T033 (structurizr.fbl rewritten):
Task: "T034 structurizr-escapes/ from findings/escaped-quote.dsl"
Task: "T035 structurizr-comments/ and structurizr-trailing-comments/"
Task: "T037 structurizr-absent-arguments/"
Task: "T038 structurizr-recover-nested/ and structurizr-recover-edges/"
Task: "T040 structurizr-legacy-layout/ with expectFiles"
```

## Parallel example: User Story 2

```text
After T063 (databricks.fbl):
Task: "T064 databricks-readings/ bundle, job, pipeline"
Task: "T066 databricks-resources/"
Task: "T067 databricks-flow-empty/ and databricks-flow-one-line/"
Task: "T069 databricks-library-add/ and databricks-template-key/"
```

## Parallel example: User Story 3

```text
After T087 (wardley-map.fbl):
Task: "T088 wardley-pipelines/ and wardley-brace-ending/"
Task: "T091 wardley-trailer/ and wardley-annotation-positions/"
Task: "T092 wardley-legacy-identities/"
Task: "T093 wardley-duplicate-names/ and wardley-rename-identity/"
```

## Implementation strategy

- **MVP: pull request A.** It unblocks the most waiting tasks (c4-disl-fbl 13 to 17, six tool types) and delivers most of what the Wardley map needs. Stop after Phase 4 and validate with quickstart.md's *Pull request A*.
- **Incremental delivery**: B whenever it is ready, independent of A; C after A. Each pull request is a minor version, reviewable alone, with its document, schema, examples, fixtures, validator and ATD rows together (constitution II).
- **After each merge, outside this feature**: the standalone conversions vendor the merged fixtures and examples unchanged under their own process, after `fbl-grammar-family` for the C4 and Wardley map ones; the desktop host takes the constructs with its parity work (plan, *Host follow-ups*).

## Notes

- No task edits `etalii.adp.ide.standalone`, the spec 027 branch or spec 025's work; the waiting tasks' own documents change under that repository's process.
