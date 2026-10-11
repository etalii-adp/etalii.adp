# Contract: a milestone review

A milestone review is the task that closes each milestone (FR-010). It is what the maintainer asked for: a point at which the work stops and asks which refactorings make sense now. It produces one file, `reviews/M<n>-review.md`, delivered by a pull request into `etalii.adp` on a branch `features/025-review-m<n>`. The next milestone's first task does not start before that pull request is merged.

An Architect writes the record; the developer who owns the feature supplies the measurements and reads it before it is sent.

## What a review does, in order

1. **Measure.** Run `etalii.adp.ide.standalone/.github/tools/analysis/measure.sh` on the merge commit of the milestone's last pull request, on a freshly created worktree. Keep `measurements.json` as `reviews/M<n>-measurements.json`.
2. **Compare.** Put the figures beside those of the previous record (the baseline, for M0): lines and files per project group; the clone scan's shared windows per role pair and its twenty largest clone families; the count of methods over 50 and over 80 code lines and the twenty longest; the project graph's edges added and removed, and every `InternalsVisibleTo`.
3. **Check the exit.** State for the milestone's exit condition and for each success criterion due at this milestone: met, with the figure; or not met, with which type or role did not fit as the report sketched, and the evidence. A criterion that is to be amended is amended in the specification in this same pull request, with this review named beside it.
4. **Answer the named candidates.** For each candidate listed below for this milestone, one of:
   - **Do now**: it serves a requirement of this feature. It becomes tasks, numbered after the last task in `tasks.md`, placed in the milestone where they belong.
   - **Follow-up feature**: it is worth doing and is outside this feature. It is written under *Follow-up features* in the record, with its evidence and a first estimate, so that `/speckit-specify` can start from it.
   - **No**: with the reason in one or two sentences.
5. **Look for what nobody named.** Read the clone scan's twenty largest families and the twenty longest methods *as they are now*. Anything there that no remaining task covers is a candidate, answered the same way. Then ask of the milestone just finished: what did it make cheap that was expensive before, and what did it make pointless?
6. **Re-read the conversions.** For every remaining task that falls under FR-012, read the state of that module's `*-disl-fbl` specification in `etalii.adp.ide.standalone` and mark the task *stands*, *reduced* (to what), or *overtaken* (struck).
7. **Re-read the register.** Every row of [behaviour-changes.md](../behaviour-changes.md) that the next milestone needs must be ruled; the ones that are not go to the maintainer as selections with this review.
8. **Update `tasks.md`.** Tick what is merged (FR-014). Add the new tasks. Strike, never delete and never tick, what was found unnecessary: `- [ ] ~~T123 …~~ struck by the M2 review: <reason>`.
9. **Ask.** Anything that needs the maintainer's ruling is put as a selection: the options, what each means and costs, the recommended one with its reason in its own text, and an "other".

## What a review does not do

- It does not start the next milestone's work.
- It does not add work that serves no requirement of this feature; that is a follow-up feature.
- It does not re-argue a decision point the maintainer has ruled, unless the measurements contradict what the ruling assumed, and then it says so and asks.

## The candidates already foreseeable

A review answers every one of its rows, even where the answer is "no".

| Review | Candidate | Why it may make sense then |
|---|---|---|
| M0 | Merge the two testing projects into one | If every module test project turns out to need the host harness, the split of research R6 buys nothing |
| M0 | A server-sent "subscribed" message in place of probing | If a stream has nothing harmless to provoke (research R7); it is a wire change, so it is asked, not done |
| M0 | Move the 5,300 lines of module flows out of the core test project now rather than in M8 | The harness they need exists after M0, and M1 will touch those modules |
| M0 | Run the suite twenty times as a scheduled workflow | To keep SC-002 true while the code moves |
| M1 | The entry type carries a `ParseOutcome` already | The store base has one failure field; M3 would otherwise change the entry again in every module |
| M1 | A `DocumentBasedDiagramModule` registration that wires store, reloader, session and resolver in one call | Once four modules register the same five things in the same order |
| M1 | Change the rollout order of M2 | The pilots show which modules are near the bases and which need the edge-case rule |
| M1 | The element mapper's `Diff` and `Same` (11 implementations, 6 identical at the 2026-09-15 reading) | The session base makes the mapper's contract visible |
| M2 | Generic action and property providers | Once FBL bindings and DISL definitions describe a module's edits, the provider frame may have nothing module-specific left in it |
| M2 | A shared model base for timeline and dependency-graph, or leave both to their conversions | FR-039 |
| M2 | `ServiceCollection.AddX.cs` derived from the module's types | If every module registers the same shapes |
| M2 | The commands themselves (`Rename…`, `Remove…`, `Move…`) as generic commands over an element id | The handler base may leave them identical |
| M2 | Which M3 tasks the rollout already made unnecessary | Some `LineOf`, `Scalar` and `Number` copies sit in classes M2 deletes |
| M3 | One cycle policy for all tools | A product decision: put as a selection with pictures of a cyclic graph under each policy |
| M3 | One watcher per project root for every consumer, the editors and the knowledge designer included | `ProjectFileEvents` exists |
| M3 | Module layouts that are now a few calls into the layout library, expressed as data | DISL already has an arrangement plugin for the timeline |
| M3 | The findings of every module as one `ParseOutcome` flow into the problems project | Four styles became one |
| M4 | Does the problems project still need the hierarchy project? | It needed the diagram project only for `IDiagramValidator`, and the router has moved |
| M4 | Move the gRPC services of the context, hierarchy, history and projects projects to the host project | So that a module references domain projects only and carries no hosting package |
| M4 | A `text` member on the workspace stream (report 4.4) | A wire change; the host project and the stream pump make its cost readable |
| M4 | Rename the wire message `Path` and retire the `IoPath` alias in 417 files (report 5.4) | A wire change with a mechanical follow-through |
| M4 | Remove the three legacy calls kept for tests (report 5.4) | The flow harness of M0 may no longer need them |
| M4 | Do the editor and designer projects still earn a project each? | Their discovery, catalog and factories became generic |
| M4 | A `ProjectRoot` on the wire boundary: validate once in an interceptor | Typed roots exist; eight call sites resolved the project by hand |
| M5 | The three retained stores collapse into the connection session | `ContextSelectionStore`, `HierarchyModelStore` and `HistoryStackStore` each kept their own idle eviction |
| M5 | Remove `IContextWatchHooks` | It existed only to break the cycle FR-064 removed |
| M5 | What is left of `ContextService` and `DiagramService.Open` | The longest core methods at the report's reading |
| M5 | Back-pressure to the client rather than dropping | The channels are bounded and the drops are counted |
| M6 | The order of the conversions, now that their libraries are settled | DP-2 |
| M6 | Is the hand-written XML parser still justified? | The report says yes; the JSON and YAML work may change the comparison |
| M6 | Does DISL need to reference FBL at all? | The bridge of FR-083 may be all that joins them |
| M6 | Typed DISL nodes generated from the schema in `etalii.adp` | Schema knowledge would then live in one place across hosts; this would be a feature here |
| M7 | Which module-internal tasks a conversion overtook | FR-012 |
| M7 | The budgeted graph builder for SPARQL as well | SPARQL already uses a nested builder |
| M7 | The longest methods that are left | The method-length count after M7 |
| M8 | Generate the catalog from `docs/tools.md` | DP-1 (b), if (a) was ruled |
| M8 | Per-module test helpers that are left | The clone scan over the test code |
| M9 | Everything recorded as a follow-up feature | It is listed once, in order of value, for the maintainer |

## The record

`reviews/M<n>-review.md` has these sections, in this order, and nothing is left out because it is empty: an empty section says "none".

```markdown
# M<n> review: <milestone name>

**Measured at**: `etalii.adp.ide.standalone` `<commit>`, <date> | **Previous record**: <link> | **Written by**: <role and number> | **Owner of the feature**: <role and number>

## In short
Three to six sentences: what the milestone removed, what did not fit, what the review adds and drops.

## Measurements
A table: the figure, the previous value, the value now, the target where a success criterion has one.

## Exit condition and success criteria
One row per criterion due at this milestone: met or not, the figure, the evidence.

## Named candidates
One row per candidate of this review: do now, follow-up feature or no; the evidence; the tasks added.

## New candidates
What the clone scan and the method-length count showed that nobody named; answered the same way.

## Tasks added, reduced and struck
Each with its number and its reason. Tasks under FR-012: stands, reduced or overtaken.

## Behaviour changes
Rows of the register ruled since the last review, and rows still open that the next milestone needs.

## Follow-up features
Each with a title, its evidence and a first estimate.

## Questions for the maintainer
Each as a selection.

## Ownership
Who owned the feature in this milestone, and who owns it in the next.
```
