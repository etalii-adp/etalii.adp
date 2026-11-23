# Contract: The review document

The Markdown file a person, an agent and every host read and write. The binding `definitions/designers/post-incident-review.fbl` states it normatively; this page is the shape it is written to.

```markdown
<!-- ded: 0.2 designer: etalii/post-incident-review -->
<!-- last: E-0008 F-0003 A-0001 -->
# Checkout latency, 3 November 2026

## How to read this file

(the legend for agents: every line form below, the numbering rule, and that no line names a person's fault)

## Summary

- Time zone: Europe/Berlin
- Checkout requests slowed to over 8 seconds after a configuration change to the payment gateway's connection pool.

## Impact

- Affected: customers checking out on the web shop
- Effect: 38 % of checkouts abandoned
- Duration: 57 minutes, from start to mitigated

## Timeline

- E-0001 2026-11-03T09:58+01:00 trigger: Connection pool size lowered in a configuration change. by:agent [change](https://example.org/changes/481)
- E-0002 2026-11-03T10:05+01:00 start: p95 latency of checkout passes 2 s. by:agent
- E-0003 2026-11-03T10:12+01:00 detection: Latency alert fired. by:agent
- E-0004 2026-11-03T10:20+01:00 engagement: On-call engineer acknowledged. by:person
- E-0005 2026-11-03T10:41+01:00 mitigation start: Configuration change rolled back. by:person
- E-0006 2026-11-03T11:02+01:00 mitigated: Latency back under 1 s. by:agent
- E-0007 2026-11-03T11:30+01:00 resolved: Incident closed. by:person

## Contributing factors

- F-0001 category:change state:accepted by:agent Configuration changes skip the canary stage. [E-0001]
- F-0002 category:detection state:proposed by:agent The alert threshold is above the customer-visible delay. [E-0002] [E-0003]
- F-0003 category:people state:rejected by:agent Engineer unfamiliar with the gateway.
  Rejected: the review records conditions, not people.

## Actions

- [ ] A-0001 Run configuration changes through the canary stage. owner:@platform due:2026-12-01 addresses:[F-0001]

## Categories

- change
- detection
- capacity
- dependency
- people
```

## Rules

- Line 1 is the envelope and line 2 the last numbers; both are written by the designer and left alone by agents.
- An agent writes a new entry, factor or action with `E-NEW`, `F-NEW` or `A-NEW`; the designer numbers it with its next write. A number is never reused.
- A time is RFC 3339 with its offset or `Z`, the seconds optional (`2026-11-03T10:12+01:00`), kept as written; the review's time zone only says how it is shown (Peter's choice of 2026-11-23 on a decision card).
- The milestone kinds are `trigger`, `start`, `detection`, `engagement`, `mitigation start`, `mitigated` and `resolved`. A line without a kind before the colon is an ordinary entry.
- `by:agent` or `by:person` is required on entries and factors; a missing author is a finding.
- A factor's `category:` names an item of `## Categories`; the list is the user's.
- Lines indented under an item are its detail.
- Text the binding cannot follow is kept as written with a finding.
