# Data Model: The Post-Incident Review Designer

The metamodel of `etalii/post-incident-review`, as the DESL specification will state it. Line forms are those of [contracts/review-document.md](contracts/review-document.md).

## Document attributes

| Attribute | Type | Notes |
|---|---|---|
| `title` | string | The `#` heading. |
| `lastEntry`, `lastFactor`, `lastAction` | string | The counters' marks on line 2 (research R2). |
| `timeZone` | string (IANA name) | From `- Time zone:` under `## Summary`. |

## Element types

| Type | Attributes | Notes |
|---|---|---|
| `Summary` | `text` (text) | The other items under `## Summary`, as one record. |
| `Impact` | `affected`, `effect`, `duration` (strings) | The items under `## Impact`, as one record. |
| `Entry` | `number` (`E-####`), `time` (datetime, `writtenPrecision: preserve`), `kind` (enum: `trigger`, `start`, `detection`, `engagement`, `mitigationStart`, `mitigated`, `resolved`, or absent), `text`, `author` (`agent`, `person`), `evidence` (uri, many), `detail` (text) | FR-002. |
| `Factor` | `number` (`F-####`), `category` (string), `state` (`proposed`, `accepted`, `rejected`), `author`, `text`, `tags` (many), `entries` (mentions of `Entry`, many), `evidence` (uri, many), `detail` (text) | FR-004. |
| `Action` | `number` (`A-####`), `done` (bool), `text`, `owner` (string), `due` (date), `addresses` (mentions of `Factor`, many) | FR-005. Its state is `done`, or open. |
| `Category` | `name` | The items under `## Categories`, FR-008. |

## Computed values (research R4)

| Name | Definition |
|---|---|
| `milestone(k)` | The one entry of kind `k`, absent when none. |
| `timeToDetect` | `milestone(detection).time − milestone(start).time`. |
| `timeToEngage` | `milestone(engagement).time − milestone(detection).time`. |
| `timeToMitigate` | `milestone(mitigated).time − milestone(detection).time`. |
| `timeToResolve` | `milestone(resolved).time − milestone(start).time`. |
| `unaddressed(f)` | `f.state == 'accepted'` and no action's `addresses` names `f`. |

## Surface (DESL 0.4 `sections`, research R7)

| Part | Kind | Shows |
|---|---|---|
| Summary | record | `Summary.text`, `timeZone`; figures: the four intervals. |
| Impact | record | `affected`, `effect`, `duration`. |
| Timeline | list of `Entry`, ordered by `time` | time, kind, text, author, evidence; a time strip at `time` highlighting milestones. |
| Contributing factors | list of `Factor`, grouped by `category` | number, state, author, text, entries; the mark *unaddressed*. |
| Actions | list of `Action` | done, text, owner, due, addresses; the mark *no owner or due date*. |
| Categories | list of `Category` | name. |

## Operations

| Operation | Effect |
|---|---|
| `addEntry`, `addFactor`, `addAction` | A new item at its section's end, numbered. |
| `acceptFactor`, `rejectFactor` | Set `state`; a rejected factor is kept (User Story 2). |
| `completeAction` | Set `done`. |

## Findings

| Code | Severity | When |
|---|---|---|
| `pir.no-time` | warning | An entry without a time; listed apart. |
| `pir.missing-milestone` | info | An interval's milestone is absent; names it. |
| `pir.second-milestone` | warning | A second entry of one milestone kind. |
| `pir.no-author` | info | An entry or factor without `by:`. |
| `pir.unknown-category` | info | A category not in `## Categories`; kept. |
| `pir.unknown-entry`, `pir.unknown-factor` | warning | A mention that names no element. |
| `pir.action-incomplete` | warning | An action without `owner:` or `due:`. |
| `pir.unaddressed` | info | An accepted factor no action addresses. |
| `pir.unread` | warning | A line the binding cannot follow; kept as written. |
