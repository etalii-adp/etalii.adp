# Research: Every Case Passes for Five More Tool Types

Measured on 2026-11-02, with `atd validate --json` in a release build of etalii.adp.ide.desktop at `81c1fdc`, which vendors etalii.adp at `55b62e1`. Each correction was tried as a temporary change in a throwaway worktree, in the order given, and `atd validate` was run again after each. Nothing of that was kept. Where a number comes from such a run it is called **measured**. Where it follows from reading the code or from a difference that repeats after an earlier one, it is called **inferred**. With every temporary change applied together, `cargo test --release -p adp-atd-validate -p adp-atd-runtime` stayed green, which includes the C4, Databricks, Wardley map and W3C lists, so none of the corrections below disturbs a description that already passes.

The kinds of cause are these. A **runtime gap** is something the language states and the desktop's runtime for descriptions does not do. A **description mistake** is a description that does not say what the module does, although it could. A **language gap** is a difference only a change of language could remove, and it goes to Peter. A **module quirk** is what a module does that nobody should copy, and it is listed by name only by his ruling.

## R1. What was measured

| Tool type | Cases | Passing today | Differences today, by case | After the corrections tried | Passing then |
|---|---|---|---|---|---|
| Agent behavior modelling | 5 | 0 | `empty-section` 7, `findings` 4, `no-behavior` 7, `refusals` 31, `research-assistant` 123: 172 | 85 | 1 (`findings`) |
| Causal loop diagram | 4 | 0 | `findings` 2, `on-call` 12, `reference` 24, `refusals` 8: 46 | 10, all in `on-call` | 3 |
| Gartner hype cycle graph | 4 | 1 (`not-yaml`) | `coal-technologies` 84, `findings` 1, `refusals` 33: 118 | not run to the end, see R13 to R16 | 1 |
| Hierarchical requirement designer | 12 | not runnable | not runnable | 217 through the diagrams' runtime, see R17 | 0 |
| Knowledge management designer | none | no description | no description | not tried, see R20 | none |

*Measured again on 2026-11-05 (T002)*, with the desktop at `81c1fdc` against both its vendored etalii.adp `55b62e1` and etalii.adp's develop at `ef04189`: every number of the three diagrams is as above, so neither the descriptions nor the runtime moved in between.

The specification's first readings hold in part. The agent behavior modelling cases read one element for the reason the specification gives only in its effect: the module and the description do not read a section differently, because the description's `within` never reaches the binding (R2). The causal loop diagram's refused variant is one misplaced word in the notation's compiler (R7), and its drawings then show a second cause, the ring (R8). The specification now says so.

## R2. Agent behavior modelling: `within` is not lowered

- **Cause, a runtime gap, measured.** `rule()` in `etalii.adp.ide.desktop/crates/adp-atd-runtime/src/lowering/fbl.rs` lowers `parent`, `id`, `source`, `target`, `attribute`, `insert`, `remove`, `when` and `setting`, and drops every other member. The parsed tree of `agent-behavior-modelling.abm.atd` has `{"kind": "within", "rules": [{"text": "behavior"}]}` in each rule. `bullets_candidates` in `crates/adp-fbl/src/families/bullets/mod.rs` reads a rule with no `within` as one that matches statements and not items. So the items of the section are not read at all, and the one prose line of a body reads as an implicit Do. That is the "one element" of the sample: `Every rule of the tool, once.` in `findings`, and nothing at all in `refusals`, whose body has no prose.
- **What it explains.** Lowering `within` took the five cases from 172 differences to 117, a drop of 55. Every reading then gives the module's tree, but for R5's `implicit`.
- **Decision.** Lower `within` in `rule()`, with a test in `crates/adp-atd-runtime/tests/lowering.rs` that compares the lowered rule with `specifications/fbl/behavior-tree.fbl`, as `tool.rs` does for the mind map. Sixteen description files hold the word, and the lists of C4 and W3C did not move (measured).

## R3. Agent behavior modelling: `tidyTree` is not run

- **Cause, a runtime gap, measured.** `RuntimeModule::of` in `crates/adp-atd-runtime/src/tool.rs` only understands an algorithm named `capability:`. This description says `algorithm: tidyTree`, a standard algorithm of DISL §10.3, so every node stands at (0, 0). `layout.tidyTree` has a contract and recorded fixtures, and the code is in `modules/diagrams/agent-behavior-modelling/src/layout.rs`, but it is not registered.
- **A second cause, measured.** `RuntimeModule::size` reads a node's `fixed` and its `min`, not `size.default`, which is how this notation says 200 by 60. Without the size the tree packs as if nodes had no width.
- **What it explains.** With the tree in place and the size read, 117 became 104, and the drawing of the reading equals the case in all five cases.
- **Decision.** Move `compute` and `pack` into `crates/adp-atd-runtime/src/capabilities/tidy_tree.rs`, with the module calling them there, and register `layout.tidyTree` once its fixtures pass (spec 035, T125's rule). `RuntimeModule` runs DISL's standard `tidyTree` through that code, with `spacing` as its gaps. `rows.stored` and `minGap` are DISL §10.3's and the contract says they are the tool's and not the capability's, so `RuntimeModule` applies them around it, from the registration's positions. What a drag writes (`drag`) is not in any of the five cases, so it is not built here.

## R4. Agent behavior modelling: an id the specification derives

- **Cause, a runtime gap, measured.** `DiagramDocument::addressed` in `crates/adp-diagram/src/document.rs` turns a derived id into the id the binding read it with for `Set`, `Remove`, `Move` and `Retype`, but not for the parent of an `Add` or the new parent of a `Move`. So `abm.add.check` under `1.1` is refused with "The model has no element or relation '1.1'.", and every step after it compares bytes that are one line short.
- **A second cause, measured.** A new node's id is computed when the file is read again, so what `editLabel` names, a stand-in of the validator's `StepIds`, no longer exists when `Replay::action` edits the label. That is the sample's `'Check:stands-in-1' has no label to edit`.
- **What it explains.** With both corrected, 104 became 88.
- **Decision.** Address the parents in `addressed`. Have the session hand back the id a created element reads as once the edit is written, so that `HostAction::EditLabel` names something that exists. The temporary change found the new id by comparing the ids before and after, which is enough to show the cause and is not what is built.

## R5. Agent behavior modelling: mistakes of the description

- **`implicit`, measured.** The case states `"implicit": "false"` on a Do with its keyword, and the rule `do` does not write it. `attribute implicit from value "false"` on that rule took 88 to 85 and makes `findings` pass.
- **`Rename…`, inferred.** Its menu entry names no label, so `label_id` takes the first, `keyword`, which is not editable, and gives `'keyword' cannot be edited here.`. The entry gets `args: { label: label }`, as `editLabel added { label: label }` already does in the operations.

## R6. Agent behavior modelling: what the other 85 differences come from

Of the 85, three are language gaps (R7). The other 82 start at these steps, and the rest of each case follows, because a step's bytes and drawing are compared whole.

| First seen | Cause | Kind |
|---|---|---|
| `refusals` steps 3 to 6, `research-assistant` steps 11, 29 | A `connect` step names `abm.connect.child`, the wire id of the operation `moveUnder`, which the derived relation's `edits.connect` runs. `Replay::connect` finds no relation of that name and asks for an action on the connection, and none is offered. `crates/adp-disl/src/behavior/operations.rs` can run it. | runtime gap, inferred |
| `refusals` step 7, `research-assistant` steps 4, 18 | The Kind row (`kind: type`). `shown.validate` refuses a value past the options before the row's `refusals` are read, and `form_commit::row` does not commit a retype. The planner then refuses every retype ("This file's binding cannot change an element's type"), although FBL §6.4 states one for a declared binding, in `bullets` as a `re-emit-line`. | runtime gap, read in the code |
| `research-assistant` steps 7, 8 | `session.rs` answers `'Move earlier' cannot be run here yet.`: the menu kinds `moveUp` and `moveDown` are derived but not run. | runtime gap, measured |
| `refusals` step 9, `research-assistant` step 20 | `n.view` gives `No such field: 'view'`, because `RuntimeModule::view_of` gives nothing when the description has no initial view. The pins live in the registration's `layout:` block (DISL §11.6). | runtime gap, measured |
| `research-assistant` steps 25 to 27 | A drop's `place: underNearestAbove` (DISL §9.1, parent placements) is loaded and never run, so a drop becomes a root and the refusal never comes. | runtime gap, measured |

- **Decision.** Each is corrected in the runtime, with the test first, in the pull request of this tool type. The session changes are made so that a hand-written module sees none of them (R14).
- **Not measured.** The binding's own comment lists eight places where it differs from the module, such as `Retry up to 1 time`. Neither those nor anything else can be seen until these are gone. What shows up then is corrected in the description if it can be, and otherwise goes to Peter (FR-007).

## R7. Causal loop diagram: the variant

- **Cause, a runtime gap, measured.** `bow_variant` in `crates/adp-scene/src/notation/compile.rs` refuses a variant with a key other than `when`, `doc` and `line`. ATD lowers `variant variant when self.flipped` with an `id`, which DISL allows, so `compileNotation` refuses the whole notation and no step of any case has a drawing.
- **What it explains.** Allowing `id` there gives every drawing. The count stays at 46, since each "none" becomes a difference of position (R8), but that is its own correction: every drawing difference in the four cases was this one sentence.

## R8. Causal loop diagram: the ring

- **Cause, a runtime gap, measured.** `algorithm: circular` with the options `adp.ring.*` is not run, so every variable stands at (0, 0). DISL does not define `circular`, and the companion's gap 5 says the seating order and radius are `CausalLoopLayout`'s. The code is `modules/diagrams/causal-loop-diagram/src/ring.rs`.
- **What it explains.** Together with R9, measured: 46 became 10, and `findings`, `reference` and `refusals` pass.
- **Decision.** A capability `layout.ring`, with a contract and a row in ATD §13's catalogue, its fixtures recorded from the module by `atd record --capability`, and the code moved to `crates/adp-atd-runtime/src/capabilities/ring.rs`. The description says `algorithm ring capability layout.ring`. It is how every other tool's computed layout is stated.
- **Alternative refused.** Reading `circular` and its `adp.ring.*` options in the runtime. The options are not DISL, so a runtime would be reading words only this description uses.

## R9. Causal loop diagram: unreadable lines

- **Cause, a runtime gap, measured.** The description's `builtin std.unreadableEntry { code, message: (unreadableSentence(detail.entry.text)) }` states the four sentences, and its rule `Unreadable` takes the statements. `CausalLoopModule::reader_findings` reports them today, and `RuntimeModule` has no such method. So the four findings of `findings` are missing, and they are the only other difference there.
- **Decision.** `RuntimeModule::reader_findings` gives each unreadable entry to the session as `std.unreadableEntry` with its line and its text, and the built-in's `message` words it, as DISL §8.7 states. No sentence is written in Rust.

## R10. Causal loop diagram: the plugin

- **Cause, a runtime gap, inferred from one run.** `call plugin arrange.selfOrganising(…)` becomes `HostAction::Plugin`, the capability is not registered, and the session has no extension point `arrange`. Fixtures exist for it. All 10 remaining differences are in `on-call`, at step 1 and step 7 and what follows from them: undo and redo at steps 2 and 3 have nothing to undo, and the drawings of steps 1 and 3 to 7 hold the old places. The temporary change called the module's code and reached it, and was refused only because the module asks the file system for the registration, which a case does not have.
- **Decision.** Move `self_organizing.rs` to `crates/adp-atd-runtime/src/capabilities/self_organising.rs`, registered once its fixtures pass, with a new trait for the `arrange` extension point (ATD §13.3). A `DiagramModule` method carries out `HostAction::Plugin`, and `RuntimeModule` writes the capability's `move` actions as `DiagramChange::Place`, one undo. The module's refusals that name the registration (`NO_REGISTRATION`) stay the module's. A case always has a registration, so none of them is seen.

## R11. What the causal loop diagram does not need

No language gap, and the companion's gaps 1, 2 and 3 did not show. `findings`, `reference` and `refusals` passed byte for byte once R7 to R9 were in, so the binding and its `Unreadable` rule already do what the module does.

## R12. Gartner hype cycle graph: what the differences are

Of 118 differences, 45 are drawings, 37 bytes, 30 findings and 6 refusals, and every step of a case has one. Four things stand in front of the rest.

## R13. Gartner: the time axis

- **Cause, a runtime gap, measured.** `scaled_placements` in `tool.rs` reads `axis.scale` as a number, and DISL §5.5 states a time axis's scale as `{unit, size}`, here `{unit: @unit, size: 4}`, with an `origin` of `1900-01`. So a date is drawn at its month index: 2008-01 is 24096, which is 2008 × 12, where the case has 5184, which is (2008 − 1900) × 12 × 4. That is the sample's 5184 against 24096.
- **Decision.** `ScaledAxis` takes a `yearMonth` axis's origin, its size and the months of its unit, the unit read through `@unit` from the diagram, in both directions, and writes a `yearMonth` value on a gesture. Measured: every trend's bounds then equal the case's, and the first difference of each drawing moves to a trigger (R16).
- **Inferred.** The sample's `ghg.dangling-reference` on `surface-mining` comes from a move at step 12 that writes a value that no longer reads as a month, so the trend stops being a trend. Its 22 findings in `coal-technologies` should go with this and R16.

## R14. Gartner: change constraints and change hooks do not run on a property

- **Cause, a runtime gap, measured.** `DiagramSession::set_property` calls `form_commit::row` and then `module.written`, and nothing else. `gestures::change` and `hooks::after_change` exist in `adp-disl`, and nothing calls them. A hand-written module does that work in `written` (`edits.rs` for this tool type). So `A trend needs a name.`, `A trend must stop after it starts…`, `rescaleBoundaries` (the sample's 1734-02 against 1730-01), `trimName`, `tagsOnce` and `noteText` never run for a description.
- **What it explains.** Calling `gestures::change` took `refusals` from 33 differences to 18. The sample's dates need the hooks. The temporary change did not get them right: `form_commit::row` hands back stored text, which a rule then compares with a month index, and it does not assign on the working element. So the values must go through `values::from_read`, and the working element must be assigned.
- **Decision, one to challenge.** `DiagramModule` gains a method saying that the session runs the description's change rules, `false` by default and `true` in `RuntimeModule`. Running them for every tool would double what a module's `written` already does and could change a person's bytes, which FR-010 forbids. The rest of a person's tool stays exactly as it is.

## R15. Gartner: drawing an influence

- **Refusals, a runtime gap, inferred.** Steps 5, 6 and 7 of `refusals` answer "The case gives no further id for this step." where the case has the sentences of `std.endpoints`' `refusal`. So `gestures::connect` lets them through and the id is asked for. The built-in's `refusal`, which is what the description states for a gesture, is to be read before an id is drawn.
- **The ends, a description mistake, measured.** `relation Influence` says nothing of a new influence's ends, so it is written with none and reports `ghg.bad-attachment`. The module's `edits.rs` writes the source's last visible phase, bottom, halfway, and the target's Peak, top, halfway; from a trigger, no from end. The description gets a `hook … on connect for Influence` that sets them, which `after_connect` already runs.

## R16. Gartner: a trigger, a drop and Arrange

- **A trigger's place, a runtime gap, measured.** The case has a trigger's bounds at (−4208, 72) and the runtime at (−4216, 48). `placement.y` is `{attribute, offset: 0.2857…}`, whose `offset` is not read, and `RuntimeModule::position` subtracts the anchor, where the case records the anchored point itself, as the module's `position` gives it. This holds the one difference of `findings`, so it should pass with it (inferred). `databricks_wardley.rs` holds the Wardley map while this changes.
- **A drop, a runtime gap, measured.** A drop at (6960, 2520) makes a trend at row 2520, since `RuntimeModule` has no `position_in`, and the module's turns a point into a date and a row with the description's snapping. It is needed by steps 16, 19 and 20 of `coal-technologies`.
- **Arrange, a runtime gap, measured.** `layout rowArrange` names DISL's standard `rows` (§10.2). `RuntimeModule::layout` answers only for a capability it lacks, and the code is the module's `arrangement.rs`. The bytes of step 33 differ by this alone. It moves as `tidyTree` does. `rowPacked` is the compact view's, and no step of the four cases shows that view, so it stays out.

## R17. The hierarchical requirement designer: what a runtime would have to do

`atd check` passes and `atd validate` stops at the kind in `validate_description`. `crates/adp-desl` is less than the specification's first reading supposed. It loads a DESL specification and holds the surfaces' models and the table's view engine, with no operation runner, no constraints and no CEL environment. The operations are in `modules/designers/hierarchical-requirement/src/operations/`, 1,600 lines by hand, and T063's "which runs it from its `.des`" holds only for the surface.

A designer's description has the same parts as a diagram's: a `model`, `operation`s of a nearly identical closed set of actions (DESL §8.2, DISL §9.4), `constraint`s, `persistence`, a binding. So the guard was lifted to see how far `diagram_tool` gets.

- **Measured.** It lowers. `DislLoader` gave 12 errors in two classes: `kind` and `detail` on `Assessment` are names DISL §2.2 reserves and DESL does not, and `document.elementsOfType` is DESL's name for `diagram.nodesOfType`. With a copy renamed, all 12 cases run through `DiagramSession` and give 217 differences: 83 bytes, 76 refusals, 46 findings and 12 readings, one per case. The items and requirements read with their ids, parents, titles and descriptions.
- **What stands in the way, read from those differences:**

| Difference | What it needs |
|---|---|
| `tag/customer`, `filter/…`, `column/…`, `assessment/…`: `nothing has the id` (29 steps) | The registration's blocks read as elements (FBL §8.4), with the description's derived ids. |
| `asks for more than one value` (12 steps) | `args` given to an operation with several parameters, through `execute_with_arguments` or the like. |
| `The case gives no further id` (8), the mark line `REQ-0012` against `REQ-0013` | The `counter` strategy of DESL §5.3.5, with `mark`, `placeholder`, `missing: assign` and `std.missingId`, which DISL's builder does not have. |
| `nothing is selected` (4) | A step without `select` runs on the document. |
| Reading `"tags": "customer"` against `["customer"]`, no `collapsed: false` | `parts::reading` keeps a `many` attribute a list and shows a stated default. |
| Findings `rule` against `code` | A designer's case states `code` (ATD §2.3 today says nothing of it, T167 recorded it). |
| `The runner knows no step {"outside":…}`; "The file changed while you were editing"; "web-shop.md was changed by another program" | The `outside` step of ATD §2.3 and the watcher's sentence, in the replay. |
| `line/44` for an entry written `REQ-NEW`, in all 12 cases | Question Q3 below. |

- **Decision, one to challenge.** A designer's description is lowered onto the diagrams' runtime for validation: `lowering::load_designer` maps DESL's names to DISL's, a reserved attribute under an internal name that the reading shows under its own, and `DiagramSession` runs it, with no notation and no drawing. Only the counter, the blocks and the several arguments are new. A person's designer stays on its module and `adp-desl` stays what the surfaces use, so nothing in the shell changes.
- **Alternative refused.** A designer runtime of its own in `adp-desl`: a model, a CEL environment, an action runner and constraints, some 3,000 lines beside `adp-disl`'s, which do the same. It would be closer to DESL as written, but there would be two runners to keep agreeing, against Principle V.
- **What that choice risks.** A difference between DESL and DISL's actions, such as `reorder`, `move`'s slot or `set` on the document, would be hidden by the mapping rather than shown. The 12 cases are what hold it, and T046 reports each place where the mapping had to say more than a name. If that list grows long the alternative is what is left, and it goes to Peter.

## R18. The hierarchical requirement designer: a sized view

Story 2 is two pull requests and about 1,500 lines of Rust: the lowering (about 300), the counter (about 300), the registration's blocks as elements (about 300), arguments and the replay's `outside` (about 200), tests. It needs little specification: ATD §2.3 on a designer's findings and the answer to Q3. Most of the 217 differences repeat, and 39 distinct operations run through a runner that already exists. That is measured for the first run and estimated from there.

## R19. Whether to split the two designers off

The specification's assumption is to split if a designer's surface needs much of its own specification. It does not: no case states a surface (a designer's case states no drawing, ATD §2.3), so the surface is not run at all, and DESL states the rest. The recommendation is that they **stay in this feature**, as stories that land after story 1 and independently of it, and Peter may stop after any story. What would change this is T046 going badly (R17), and then story 2 becomes its own specification.

## R20. The knowledge management designer

- **What exists.** `knowledge.des` (1,238 lines, 55 operations, a table surface), `knowledge.fbl` (935 lines, three bindings: yaml, json, xml), `knowledge.md`, `modules/designers/knowledge` (`edits.rs` alone is 2,413 lines), and three parity scripts `parity/scripts/etalii/knowledge/cities-{yaml,json,xml}.json` of 30 steps each, 24 of them `table` gestures.
- **The description.** Written from `knowledge.des` and `knowledge.fbl` as `hierarchical-requirement.atd` was, by the same hand method spec 035 used for 35 descriptions. ATD has `surface table` in its grammar and `reading-list.atd` is its fixture, so no language is needed.
- **`knowledge.parent-cycle`.** `knowledge.md` says DESL's expressions cannot recurse, and that the host does this. Spec 035's T064 says a script function does it, which ATD allows. So it is no language gap.
- **What the description cannot state and is the host's.** The view logic (how a filter, a sort and a grouping select rows) and the steps that write two files. A case reads the model's elements and not a surface, so the first is not compared. No script writes two files.
- **The recorder.** T167 left this out: "`atd record` does not record a table yet". `crates/adp-atd-cli/src/record/hierarchy.rs` is the pattern. A `table` gesture (`setCell`, …) must become a step naming the operation of `knowledge.md`'s table of gestures, with the module's `DesignerSession` as reference. Translating as spec 067's R7 did, the replay's expected bytes prove it.
- **Kinds of case.** The three scripts cover reading, writes and undo. FR-005 and story 3 ask for refusals and findings too. A script of refusals and a body with findings are added under `parity/scripts/etalii/knowledge/`, recorded from the module and checked for parity, as the other tools' refusal scripts are.
- **Size.** About 2,000 lines of ATD, 300 of Rust for the recorder, and whatever the first run shows. It rests on story 2, and table cells bring something story 2 has not met: nested `Cell` and `CellItem` elements and a relation to a row in another file, which the cases read as a plain id.

## R21. Questions for Peter

Nothing here is decided by this plan. The tasks that depend on them say so.

- **Q1. The `abm.no-behavior` finding.** The module says "This file has no Behavior heading…" at line 1, and "The Behavior section holds no list yet…" at the heading's line. A DISL rule sees the model and no heading, so the description has one sentence and no line. That differs at `read:findings` in `no-behavior` and `empty-section`, and only the language could state it. **Should these two be listed by name as a module quirk, or should FBL and DISL expose a section's heading to a rule?** Recommendation: list them. It is two places, and exposing headings is language for one sentence.
- **Q2. Where a first item goes in a section with prose.** FBL §6.3 puts it after the section's last line, and the module right under the heading, so `empty-section` differs in its bytes at step 1 and nowhere else. **Should this be listed by name, or should FBL gain an `insert.place` that means right after the heading?** Recommendation: list it. FBL's rule is defensible and a section that holds prose and no list is rare; a new `place` would be a minor version for one step of one case.
- **Q3. The id of an entry written with a placeholder.** All 12 hierarchical requirement cases read `REQ-NEW` as `line/44`, an id only the module gives, in the reading and in the finding. DESL §5.3.5 says such an element "has no usable id" and does not name it. **Should DESL state that a host names it `line/<line>`, as a minor version, or should `line/44` be listed in all 12 cases?** Recommendation: state it in DESL, as one sentence with a fixture. Twelve lists would say the same thing twelve times, and a host has to call it something.
- **Q4. Whether to split the two designers off.** See R19. Recommendation: no.

**Peter's answers, 2026-11-05.** Building is approved ("4a"): story 1 first, without asking between tasks, stopping only for a new language gap.

- **Q1: listed.** Peter did not rule, so the default this plan recommended was taken: `read:findings` of `no-behavior` and `empty-section` are listed by name as a module quirk. He can overrule it.
- **Q2: a new FBL `place`** (b). FBL gains it as a minor version with its fixtures, in etalii.adp first: FBL 0.19, since 0.18 is develop's latest on 2026-11-05. `empty-section`'s `1:bytes` is then not listed.
- **Q3: stated in DESL** (a), as one sentence with a fixture, as a minor version of DESL. `line/44` is then listed in no case.
- **Q4: no split.** Stories 2 and 3 follow story 1, as the plan orders them.

## R22. How this lands

- **Decision.** The order Peter asked for: etalii.adp first, then vendoring with `tools/sync-etalii-adp.py`, then the desktop's pull request, per tool type so that each is reviewed against its own test. The contract `layout.ring` and its fixtures are in etalii.adp first. Its fixtures are recorded with `atd record --capability` from the desktop branch that will vendor them, so that `recordedWith` names that branch's commit and `atd record --check` holds in that pull request.
- **Rationale.** T125's rule says a capability is registered only once its fixtures pass, and the description's `requires` needs the contract in the catalogue.

## R23. What this feature leaves alone

- **Spec 075.** None of these descriptions uses `groupBy`, and none of these cases is held back by time: the 13 cases take seconds. It is not assumed to have landed.
- **ATD §1 and §19, and `specifications/atd/ATD-guide.md`.** Another worker is writing them, and no task here touches them. ATD §2.3 and §13 change, and if a merge in §2.3 conflicts it is a text conflict only.
- **Grammars.** No grammar changes, so etalii-lark and etalii-lark-derive are not touched. If Q1 or Q2 went the other way a grammar still would not change. No C# is written.
- **Recorded results.** No expected result changes. New cases are recorded. The only case-adjacent writes are new capability fixtures and the Knowledge designer's new cases.
- **Other descriptions.** T132 stays open for what this does not cover. Its note in spec 035 is updated.
