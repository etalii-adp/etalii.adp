# Tasks: Drag-and-Drop Centralization and Gesture Frame Cost

**Input**: [plan.md](plan.md), [standalone-drag-and-drop-centralization.spec.md](standalone-drag-and-drop-centralization.spec.md) and the spec-workflow [tasks.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs/drag-and-drop-centralization/tasks.md), whose task numbers are kept in brackets.
**Status**: every task is done; each was logged in the standalone implementation logs, copied to [implementation-logs/](implementation-logs/).

## Notes from the source

The source's Tasks Document, its preamble and the notes between its tasks, verbatim.

One worktree for the whole specification (`.claude/worktrees/dnd`, per CLAUDE.md's one-worktree-per-specification rule), one Developer owning it until every task is done. Each task lands only when the four gates — `npm test`, `npm run typecheck`, `dotnet format style --verify-no-changes --severity info`, `dotnet test` — exit zero, judged by exit codes captured before any pipe. Running the app for task 5 happens from the worktree on the implementing Developer's reserved ports, both port files reverted before merging.

**The scope is one discipline in one file.** The structural half of this specification was delivered by `diagram-library-adoption` and is recorded as such in the requirements; nothing here recreates it, and `noPrivateGestures.test.ts` holds module gesture code at zero throughout.

**Amendment, 2026-09-06.** Tasks 1–6 shipped at `058bb0ca` against Requirement 1.5's original three-kind enumeration. Developer 1's completion note surfaced that the survey's count was short — span resize and connection-adjust also write canvas-level state and read layout per pointer move, and both did when the survey was taken. Tasks 7 and 8 close the corrected boundary; a fresh worktree, same ownership rule.

## Phase 1: The gesture-frame discipline

- [x] **T001** [1] The gesture-frame scheduler · `src/client/src/canvas/library/gestureFrame.ts`, `src/client/src/canvas/library/gestureFrame.test.ts`
  - Source line: `- [x] 1. The gesture-frame scheduler`
  - Files: `src/client/src/canvas/library/gestureFrame.ts` (new), `src/client/src/canvas/library/gestureFrame.test.ts` (new)
  - The cached surface rect captured at gesture start; the `requestAnimationFrame` coalescer (latest deltas win, one applied frame per displayed frame, synchronous application when no frame provider exists so jsdom exercises the same write path); the live-write handles; `commit` and `revert`. No React dependency beyond types. Tested alone: N moves yield one applied frame; the last value wins; `revert` undoes every write; unmount cancels a pending frame.
  - _Requirements: 1.2, 1.3, 2.3_
  - Log: [task-1_2026-09-06T1544_7aefafa1.md](implementation-logs/task-1_2026-09-06T1544_7aefafa1.md)

- [x] **T002** [2] Reposition through the scheduler · `src/client/src/canvas/library/DiagramCanvas.tsx`
  - Source line: `- [x] 2. Reposition through the scheduler`
  - Files: `src/client/src/canvas/library/DiagramCanvas.tsx`
  - The `onDragMove` element case writes `transform` on the dragged `<g data-element-id>` group through the scheduler; the `dragOffset` state and the per-element `offset` prop are retired; the rect is read once at gesture start, retiring `unitsPerPixel`'s per-move `getBoundingClientRect` on this path; `onDragEnd` reverts the live writes and performs today's single state write and dispatch; `onDragAbandon` reverts and dispatches nothing. **Every existing module and library test passes unchanged — a test that must change is a finding, not a test to update.** The abandon test (dispatches nothing) is paired with the commit test (dispatches exactly once), because a negative-only assertion at a seam passes whether or not the positive path works.
  - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 2.3_
  - Log: [task-2_2026-09-06T1550_e0356c70.md](implementation-logs/task-2_2026-09-06T1550_e0356c70.md)

- [x] **T003** [3] Pan and connect preview through the scheduler · `src/client/src/canvas/library/DiagramCanvas.tsx`
  - Source line: `- [x] 3. Pan and connect preview through the scheduler`
  - Files: `src/client/src/canvas/library/DiagramCanvas.tsx`
  - The pan case writes the `<svg>` `viewBox` and the scrollbar thumb positions live, committing `setView` once at gesture end — the thumbs are in the write set because freezing them mid-pan would change what the user watches (Requirement 2.2's scope). The connect case writes the preview node's geometry; per-frame `elementAt` hit-testing stays, being computation rather than rendering. Same commit/abandon pairing and same pass-unchanged bar as task 2.
  - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3_
  - Log: [task-3_2026-09-06T1559_ef265571.md](implementation-logs/task-3_2026-09-06T1559_ef265571.md)

- [x] **T004** [4] The guard, keyed on the defect rather than on the fix · `src/client/src/canvas/library/dragCost.test.tsx`
  - Source line: `- [x] 4. The guard, keyed on the defect rather than on the fix`
  - Files: `src/client/src/canvas/library/dragCost.test.tsx` (new)
  - Two assertions, both mounted through a test definition whose shape component counts its own renders. **The deterministic one:** thirty pointer frames of reposition *and* of pan on a hundred-element model, asserting the non-gesture shapes rendered zero times during each gesture — pan included, because a guard that only drags would be satisfied by a pan regression, which is a detector keyed on the fix. **The required ratio:** the same gestures on a ten-element and a budget-sized model in one run, per-frame cost asserted as a ratio with its tolerance stated in the test, never an absolute millisecond budget. **Accepted only after failing:** restore the per-frame `setDragOffset` and `setView` paths and watch the count go non-zero and the ratio blow its tolerance; a ratio test that has never failed is asserting arithmetic. Two canaries, per the two shapes `processes.md` records: a population floor — the mounted model demonstrably drew its hundred elements — and a named-member presence — one known element id from the test model is asserted present in the rendered output before the gesture starts — so a zero-render verdict means the discipline held, not that the mount drew nothing or drew the wrong model.
  - _Requirements: 1.1, 1.5, 3.1, 3.2, 3.3_
  - Log: [task-4_2026-09-06T1603_59d99b2f.md](implementation-logs/task-4_2026-09-06T1603_59d99b2f.md)

- [x] **T005** [5] [US4] The measurements and the manual check · `src/client/src/canvas/library/DiagramCanvas.tsx`, `tests.md`
  - Source line: `- [x] 5. The measurements and the manual check`
  - Files: implementation log, `src/client/src/canvas/library/DiagramCanvas.tsx` (doc-comment), `tests.md`
  - Fresh before-and-after figures on the Wikidata, laureates, `owl-time` and Helm models — the before side measured on the pre-change commit in the worktree, never compared against the requirements' 2026-09-03 quote — plus a timeline drag at comparable element count in the same run, recorded beside the after figures so the user's "prefer the timeline drag" benchmark is answered with a number beside a number. All recorded in the implementation log and summarized in `DiagramCanvas`'s doc-comment beside the scheduler's reasoning. A `tests.md` entry for dragging the Wikidata and laureates examples in a real browser, run from the worktree on the implementing Developer's reserved ports, because jsdom measures work done rather than smoothness perceived.
  - _Requirements: 4.1, 4.2, 4.3_
  - Log: [task-5_2026-09-06T1611_dbe84b93.md](implementation-logs/task-5_2026-09-06T1611_dbe84b93.md)

- [x] **T006** [6] [US2] Gate and merge
  - Source line: `- [x] 6. Gate and merge`
  - All four gates exit zero on the merged tree in a per-agent scratch worktree, landed with `--ff-only` from the main checkout; any port change reverted before the merge; the coverage diff re-run against the finished code.
  - _Requirements: 2.1_
  - Log: [task-6_2026-09-06T1623_430252e2.md](implementation-logs/task-6_2026-09-06T1623_430252e2.md)

## Phase 2: The 2026-09-06 amendment

- [x] **T007** [7] Span resize and connection-adjust through the scheduler, and the guard widened to match · `src/client/src/canvas/library/DiagramCanvas.tsx`, `src/client/src/canvas/library/dragCost.test.tsx`
  - Source line: `- [x] 7. Span resize and connection-adjust through the scheduler, and the guard widened to match`
  - Files: `src/client/src/canvas/library/DiagramCanvas.tsx`, `src/client/src/canvas/library/dragCost.test.tsx`
  - The `resize` and `adjust` cases publish through a gesture cell each, on the reposition template: `setResizePreview` and the adjust-path state write retired to gesture end, no `unitsPerPixel` layout read per move, commit and abandon through the scheduler's existing paths. Every existing test passes unchanged, with the same pairing rule — the abandon case beside the commit case. The task-4 guard gains both kinds, so it exercises every kind the discipline covers; its widened assertions are seen to fail first by restoring the per-frame writes, exactly as the original two were.
  - _Requirements: 1.1, 1.3, 1.5, 2.1, 2.2, 2.3, 3.1, 3.3_
  - Log: [task-7_2026-09-06T2111_fa5580c9.md](implementation-logs/task-7_2026-09-06T2111_fa5580c9.md)

- [x] **T008** [8] [US2] Gate and merge the amendment
  - Source line: `- [x] 8. Gate and merge the amendment`
  - All four gates exit zero on the merged tree in a per-agent scratch worktree, landed with `--ff-only` from the main checkout; the coverage diff re-run against the finished code.
  - _Requirements: 2.1_
  - Log: [task-8_2026-09-06T2243_4fffd385.md](implementation-logs/task-8_2026-09-06T2243_4fffd385.md)

## Dependencies & Execution Order

- T001 (the scheduler) comes first; T002 (reposition) and T003 (pan and connect) build on it.
- T004 (the guard) follows T002 and T003, whose discipline it asserts; T005 (the measurements) measures the finished change against the commit before it.
- T006 gates and lands tasks 1 to 6.
- T007 (span resize and connection-adjust, the amendment) follows the landing of T006 in a fresh worktree, and T008 gates and lands it.
- The specification follows `selection-after-drag`, whose arbiter `DiagramCanvas` composes (requirements, "The survey, in three readings").

## Requirement coverage

The mechanical diff of every acceptance criterion against the task claims above:

| Criterion | Claimed by |
| --- | --- |
| 1.1 | 2, 3, 4, 7 |
| 1.2 | 1 |
| 1.3 | 1, 2, 7 |
| 1.4 | 2 |
| 1.5 | 3, 4, 7 |
| 2.1 | 2, 3, 6, 7, 8 |
| 2.2 | 2, 3, 7 |
| 2.3 | 1, 2, 3, 7 |
| 3.1 | 4, 7 |
| 3.2 | 4 |
| 3.3 | 4, 7 |
| 4.1 | 5 |
| 4.2 | 5 |
| 4.3 | 5 |

No criterion of the fourteen is unclaimed. Of the non-functional requirements, one is a *no task can claim it*: "no module gains gesture code" is held by the existing `noPrivateGestures.test.ts` rather than by any task here, which is exactly the delivered-elsewhere state the requirements record — the guard already runs, and these tasks only have to avoid breaking it, which gate runs prove. The diff runs again, against files and strings rather than task claims, when the implementation is finished.
