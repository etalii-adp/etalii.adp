# Data Model: The SLO Map over OpenSLO

The metamodel of `openslo/slo`. Attribute names follow OpenSLO's keys; the binding maps them through `persistence.typeMap` where DISL reserves a name (DISL 2.2).

## Common to every element

| Attribute | Source | Notes |
|---|---|---|
| `name` | `metadata.name` | The id within the kind (research R3). |
| `displayName` | `metadata.displayName` | Optional. |
| `labels`, `annotations` | `metadata.labels`, `metadata.annotations` | Read and kept; shown in the form, edited as text. |
| `file` | the file read | Derived; shown only in a folder reading (research R4). |

## Node types

| Type | Key attributes | Notes |
|---|---|---|
| `Service` | `description` | |
| `SLO` | `description`, `service` (reference), `indicatorRef` or contained `SLI`, `timeWindow` (`duration`, `isRolling`, `calendar.startTime`, `calendar.timeZone`), `budgetingMethod` (enum `Occurrences`, `Timeslices`, `RatioTimeslices`), `alertPolicies` (references or contained) | |
| `Objective` | `displayName`, `op` (enum `lt`, `lte`, `gt`, `gte`), `value`, `target` or `targetPercent`, `timeSliceTarget`, `timeSliceWindow`, `indicatorRef`, `compositeWeight` | Contained in its SLO. |
| `SLI` | `description`, `thresholdMetric` or `ratioMetric` (with `good`, `bad`, `total`, `counter`), each naming a `DataSource` or carrying an inline `metricSource` | Derived flag `inline` when contained. |
| `DataSource` | `type`, `connectionDetails` | |
| `AlertPolicy` | `description`, `alertWhenNoData`, `alertWhenResolved`, `alertWhenBreaching`, `conditions` (references or contained), `notificationTargets` (references or contained) | |
| `AlertCondition` | `description`, `severity`, `condition` (`kind`, `op`, `threshold`, `lookbackWindow`, `alertAfter`) | |
| `AlertNotificationTarget` | `target`, `description` | |
| `Missing` | derived placeholder for a reference not in the file | Dashed, *not in this file* (research R4). |
| `Unbound` | a document of a kind or version the diagram does not draw | Listed, kept as written. |

## Relation types

| Type | Source → target | From |
|---|---|---|
| `ofService` | SLO → Service | `spec.service` |
| `measures` | SLO or Objective → SLI | `indicatorRef`, or containment |
| `readsFrom` | SLI → DataSource | `metricSource.metricSourceRef` |
| `alertsWith` | SLO → AlertPolicy | `alertPolicies[*].alertPolicyRef`, or containment |
| `when` | AlertPolicy → AlertCondition | `conditions[*].conditionRef`, or containment |
| `notifies` | AlertPolicy → AlertNotificationTarget | `notificationTargets[*].targetRef`, or containment |

## Computed values (research R5, R6)

| Name | Definition |
|---|---|
| `windowSeconds(s)` | Seconds of a duration shorthand; calendar units at their shortest. |
| `targetShare(o)` | `o.target`, or `o.targetPercent / 100`. |
| `budgetTime(o)` | `(1 − targetShare(o)) × windowSeconds(slo.timeWindow.duration)`. |
| `budgetSlices(o)` | For Timeslices: `floor((1 − targetShare(o)) × window ÷ slice)`. |
| `budgetText(o)` | The sentence an SLO shows, by method. |

## Findings

| Code | Severity | When |
|---|---|---|
| `openslo.missing-reference` | error | A reference names no object of its kind in the reading. In a bare file: info, with the placeholder (research R4). |
| `openslo.no-alerting` | info | An SLO without an alert policy. |
| `openslo.target-range` | error | `target` outside [0, 1) or `targetPercent` outside [0, 100). |
| `openslo.target-twice` | error | Both `target` and `targetPercent`, or neither. |
| `openslo.indicator-twice` | error | Both `indicator` and `indicatorRef`, or neither, where one is required. |
| `openslo.window-count` | warning | `timeWindow` with more than one item. |
| `openslo.timeslice-fields` | error | A Timeslices objective without `timeSliceTarget` or `timeSliceWindow`. |
| `openslo.conflicting-windows` | warning | Two SLOs on one SLI whose windows differ. |
| `openslo.unknown-kind` | info | A document the diagram does not draw. |
| `openslo.version` | warning | An `apiVersion` other than `openslo/v1`; the file is read-only (research R7). |
| `openslo.name` | error | A name that is not an RFC 1123 label. |
