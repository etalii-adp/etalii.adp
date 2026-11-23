# Data Model: The Value Stream Map

The metamodel of `generic/value-stream-map`, as the DISL specification will state it. Keys in `code` are the YAML keys of [contracts/value-stream-document.md](contracts/value-stream-document.md).

## Diagram attributes

| Attribute | Type | Notes |
|---|---|---|
| `name` | string | The stream's name (`name:`). |
| `unit` | enum `minutes`, `hours`, `days` | The unit totals are shown in (`unit:`). Default `hours`. |
| `activities` | list of `{name, color?}` | The activity vocabulary (`activities:`), FR-003. |
| `practices` | list of `{name}` | The practice list (`practices:`), FR-003. |

## Node types

| Type | Attributes | Notes |
|---|---|---|
| `Trigger` | `id`, `name`, `state` | Exactly one per state; the start (a finding otherwise). |
| `Step` | `id`, `name`, `activity` (string), `practices` (string, many), `performer` (string), `processTime` (duration), `waitTime` (duration), `note` (text), `state`, `basedOn` (id, optional) | FR-002. `state` is read from the key its entry stands under (research R2). |
| `Outcome` | `id`, `name`, `state` | Exactly one per state; the end. |
| `Summary` | derived, one per state | Lead time, process time, flow efficiency, hand-offs (FR-004). |
| `Comparison` | derived, only when both states exist | Each figure for both states and the difference (FR-006). |

`state` is `current` or `future`.

## Relation types

| Type | Source → target | Attributes | Notes |
|---|---|---|---|
| `Flow` | Trigger or Step → Step or Outcome | `id` | Forward flow. Drawn as a hand-off when both ends are steps whose `performer` differs (research R5). |
| `Alternative` | Step → Step or Outcome | `share` (number, 0 < share ≤ 1) | Subtype of `Flow`. The shares leaving one step sum to 1 (a finding otherwise). |
| `Rework` | Step → an earlier Step | `rate` (number, 0 < rate < 1) | Back to a step that reaches its source by forward flows (a finding otherwise). |

Relations never cross states (a refusal at the connect gesture).

## Computed values

| Name | Context | Definition (research R4) |
|---|---|---|
| `visits(step)` | element | 1 for what the trigger reaches directly with share 1; otherwise Σ incoming `source.visits × share`, times 1 / (1 − rate) for each rework loop the step lies on. |
| `leadTime(state)` | diagram | Σ `visits × (processTime + waitTime)` over the state's steps. |
| `processTotal(state)` | diagram | Σ `visits × processTime`. |
| `flowEfficiency(state)` | diagram | `processTotal / leadTime`; absent when `leadTime` is zero. |
| `handoffs(state)` | diagram | Σ over hand-off flows of `source.visits`. |
| `longWait(step)` | element | Fewer than three steps of its state wait longer (research R9). |

## Findings

| Code | Severity | When |
|---|---|---|
| `vsm.empty-stream` | info | A state has no step. |
| `vsm.missing-trigger`, `vsm.missing-outcome`, `vsm.second-trigger`, `vsm.second-outcome` | warning | A state lacks, or doubles, its start or end. |
| `vsm.unconnected-step` | warning | A step no forward path reaches from the trigger; excluded from the totals. |
| `vsm.missing-wait`, `vsm.missing-process-time` | info | Counted as zero. |
| `vsm.shares` | warning | Alternatives leaving a step do not sum to 100 %. |
| `vsm.unmarked-cycle` | error | A cycle of forward flows; totals are not computed. |
| `vsm.rework-forward` | warning | A rework flow whose target does not precede its source. |
| `vsm.unknown-activity`, `vsm.unknown-practice` | info | A name not in the vocabulary; kept as written. |
| `vsm.too-many-steps` | warning | More than the budget of 64 steps in a state (research R10). |

## Operations

| Operation | Effect |
|---|---|
| `createFutureState` | Copies the current state into `future:` with `basedOn` (research R3); refused while a future state exists. |
| `showState` | Sets the kept filter to `current` or `future`. |
| `removeFutureState` | Removes `future:` after confirmation. |
