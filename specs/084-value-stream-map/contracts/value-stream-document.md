# Contract: The value stream document

The file a person, an agent and every host read and write. The binding `definitions/diagrams/value-stream-map.fbl` states it normatively; this page is the shape it is written to.

```yaml
name: Restore service
unit: hours
activities:
  - name: engage
  - name: deliver and support
  - name: design and transition
practices:
  - name: monitoring and event management
  - name: incident management
  - name: change enablement
current:
  trigger: { id: t1, name: Alert raised }
  steps:
    - id: s1
      name: Triage alert
      activity: deliver and support
      practices: [monitoring and event management]
      performer: operations
      processTime: PT10M
      waitTime: PT0M
    - id: s2
      name: Diagnose
      activity: deliver and support
      practices: [incident management]
      performer: service desk
      processTime: PT20M
      waitTime: PT1H
  outcome: { id: o1, name: Service restored }
  flows:
    - { from: t1, to: s1 }
    - { from: s1, to: s2 }
    - { from: s2, to: o1 }
    - { from: s2, to: s1, rework: 0.1 }
future:
  # the same shape; each copied element has basedOn: <id of the current element>
view:
  state: current
```

## Rules

- `name`, `current.trigger`, `current.steps`, `current.outcome` and `current.flows` are required; `future` and `view` are optional.
- A flow is `{from, to}`; with `share:` it is an alternative, with `rework:` it is rework. Both together are refused.
- Ids are unique across the file. A host gives a new element the next free id of its kind (`s7`, `f3`).
- Times are ISO 8601 durations without months or years (research R6).
- `view:` is written by the diagram only (DISL 11.6) and may be deleted without losing anything but the shown state.
- Keys the binding does not name are kept as written and listed as unbound.
