# Research: The Post-Incident Review Designer

Decisions taken while planning [post-incident-review-designer.spec.md](post-incident-review-designer.spec.md). Section numbers are those of DESL 0.3, DED 0.2 and FBL 0.21.

## R1. The review is a Markdown file read through the `bullets` family

- **Decision**: a review is a plain `.md` file with the DED 0.2 envelope on line 1 (`<!-- ded: 0.2 designer: etalii/post-incident-review -->`), claimed `shared` with the envelope as its marker, as the Hierarchical Requirement Designer's documents are (FR-006). Its parts are list items under fixed headings, read through FBL's `bullets` family (4.8): `## Summary`, `## Impact`, `## Timeline`, `## Contributing factors`, `## Actions` and `## Categories`. A legend for agents stands under `## How to read this file` and is not bound.
- **Rationale**: the family exists since FBL 0.7 for exactly this (nested items under named headings, continuation lines, word slots, byte-preserving splices), and the envelope already makes a shared `.md` safe to claim. An agent and a reader without a tool both see an ordinary review.
- **Alternatives**: YAML front matter for the structured parts (the review would no longer read as a review); a table for the actions (R6).

## R2. Numbers by counter

- **Decision**: timeline entries, factors and actions carry numbers from DESL's `counter` id strategy (5.3.5): `E-0001`, `F-0001`, `A-0001`, with `E-NEW`, `F-NEW` and `A-NEW` as the placeholder an agent writes, numbered by the designer's next write. The last numbers stand on line 2, as the requirement document's do.
- **Rationale**: factors and actions refer to entries and to each other (FR-004, FR-005), so they need stable names an agent can write before the designer has seen them. The construct exists.
- **Alternatives**: positional references (break when an entry is inserted).

## R3. A timeline entry is one line

- **Decision**: `- E-0003 2026-11-03 10:12 detection: Latency alert fired for checkout. by:agent [log](https://…)`. The time is `YYYY-MM-DD HH:MM` in the review's zone, the kind a word before the colon (one of the seven milestones, or none for an ordinary entry), `by:agent` or `by:person` the author, and links at the end are evidence. The review's zone is an item under `## Summary` (`- Time zone: Europe/Berlin`); an entry may end its time with an offset (`10:12+01:00`), which is kept as written and converted for display (the specification's edge cases).
- **Rationale**: FR-002 in one line an agent can append; word slots and patterns of the `bullets` family read it (FBL 4.6, 4.8).
- **Alternatives**: one sub-bullet per field (heavier to write and read).

## R4. Intervals are DESL expressions

- **Decision**: time to detect (start → detection), to engage (detection → engagement), to mitigate (detection → mitigated) and to resolve (start → resolved) are computed by DESL functions (3.3) over the entries whose kind is the milestone, using `datetime` arithmetic in CEL. An interval whose milestone is missing is absent, with a finding naming the milestone; a second entry claiming a milestone has a finding and is ignored by the intervals.
- **Rationale**: FR-003; the worked examples state them by hand (SC-002).

## R5. Factors carry a state and an author

- **Decision**: `- F-0002 category:deployment state:proposed by:agent Canary stage skipped for config changes. [E-0002] [E-0004]`. The state is `proposed`, `accepted` or `rejected`; a rejected factor stays in the file (User Story 2, scenario 3). Tags are `#name`. References to entries are `[E-…]` mentions (DESL 4.3, `mentions`).
- **Rationale**: FR-004 and User Story 2. The words follow the requirement document's (`category:`, `state:`, `#tag`), so an agent that knows one knows the other.

## R6. Actions are a task list, not a table

- **Decision**: `- [ ] A-0001 Add a canary stage for configuration changes. owner:@platform due:2026-12-01 addresses:[F-0002]`, with `[x]` for done. A factor that no action with a state other than rejected addresses is marked (FR-005).
- **Rationale**: the `bullets` family reads list items; a Markdown table would need a second family in one binding, which FBL does not allow. A task list is what Markdown review templates commonly use for actions, and it reads as one without a tool.
- **Amendment**: User Story 1, scenario 4 said the plain-text review shows "a table of actions". The maintainer chose to amend it to a task list on 2026-11-23 ("Apply both").

## R7. DESL needs a page of sections

- **Finding**: DESL 0.3 has two surfaces, a `table` (rows × columns × cells, as the Knowledge designer) and a `hierarchy` (boxes in boxes). Neither shows a review: a summary as a form, a timeline in time order with its intervals, factor cards and an action list on one page.
- **Decision**: DESL 0.4 adds the surface kind `sections`: one page of titled **parts**, in order, each either a **record** (the fields of one element, such as the summary) or a **list** (the elements of one type, each a row of named fields, with an optional `order` expression and `group` expression). A list part may declare a **time strip**: a read-only band above it that places each row at its `datetime` field and emphasises rows a `highlight` expression selects (the milestones). A part may show **figures**, named expressions shown beside its title (the intervals). Selection is shared across parts, and a field whose value mentions an element highlights it in its part (User Story 1, scenario 3).
- **Rationale**: principle I: without it the layout of every part would be each host's. It is the smallest surface that holds the review, and it is generic: nothing in it names an incident. A time strip is drawn and not edited, so the tool stays a designer (nothing connected).
- **Alternatives**: open the review in the Timeline diagram as a second reading (the Timeline diagram's specification names its own binding, and FBL 9 opens a body read through two bindings read-only); a diagram type instead of a designer (the specification names a designer, and the review is a form).

## R8. The folder overview is a small second designer type

- **Decision**: User Story 5 is a second origin, `etalii/post-incident-review-overview`, reading a folder (FBL 9, `kind: "folder"`, file rule `*.md` with the envelope as marker) through the same binding's rules, and showing one `sections` page: a list part of factors grouped by category with a count per group, each row naming its review. It is delivered last, in a pull request of its own, and is the first part to cut (the specification's assumption).
- **Rationale**: a reading of a folder is a tool type of its own in FBL (an origin per reading); sharing the binding keeps the review's format stated once.
- **Alternatives**: a cross-file query inside the review designer (DESL 5.4 changes two documents but does not read a folder).

## R9. Blameless by construction

- **Decision**: no element type has an attribute for a person's fault or responsibility for the incident; an action's `owner` names who carries the action, not who caused anything. The companion's first section states the blameless intent and why (FR-009).

## R10. Name and origin

- **Decision**: origin `etalii/post-incident-review`, base name `post-incident-review` in `definitions/designers/`, display name *Post-incident review designer*, kind Designer.

## R11. Tool description and conformance

- **Decision**: as spec 084's R12: the ATD description (`post-incident-review.atd` with its `.markdown.atd` part) and trace here; conformance cases with the first host.

## R12. Worked examples

- **Decision**: `examples/checkout-latency.md`, an agent-drafted review (eight entries, three proposed factors, no actions), and `examples/certificate-expiry.md`, a complete review (accepted and rejected factors, four actions, one unaddressed factor), each with its intervals worked by hand in the companion. Both are invented and say so.
- **Rationale**: FR-012.
