# Research: The SLO Map over OpenSLO

Decisions taken while planning [openslo-slo-map.spec.md](openslo-slo-map.spec.md). Section numbers are those of DISL 0.9 and FBL 0.21. OpenSLO was read at its repository's commit `e0259752f252276485cfa2708dac2db00c2f3464` (2026-09-25): `website/docs/specification.md`, `website/docs/schema/v1/` and `examples/`.

## R1. FBL must bind every document of a YAML stream

- **Finding**: FBL 4.3 binds only the first document of a YAML stream ("any further document is unbound"). OpenSLO files commonly hold a Service, its SLIs and SLOs as several documents separated by `---`, and the specification's edge cases require both shapes.
- **Decision**: FBL 0.22 adds `body.stream: "documents"` to the `yaml` family. With it, the body's root is the sequence of the stream's documents: a selector's first segment selects documents (`/*` every document, `/*/spec/objectives/*` the objectives of each), each document's own span runs from its `---` line (or the start of the body) to the byte before the next `---`. An insert at the root writes a new document after the last one with a `---` line before it, and a removal removes a document with its separator line, keeping the separator of the documents around it. Comments and `...` end markers stay with the document they stand in. Without `stream`, the family reads as before, so every 0.21 binding keeps its meaning.
- **Rationale**: principle I: without it each host would bind the extra documents in code, or a persistence plugin would carry the reading. A plugin is not simpler: it puts the reading in host code, which FBL 11 discourages for a format FBL can state.
- **Alternatives**: one document per file only (refuses the most common OpenSLO layout); a plugin reader (above); the `grammar` family (YAML is not context-free in the sense that family needs).
- **Delivery**: its own pull request, with fixtures of its own, before the definition, so it can be reviewed and refused on its own.

## R2. Claiming a YAML file

- **Decision**: the binding claims `.yaml` and `.yml` as `shared`, with the marker `{rootKey: "apiVersion", value: "openslo/v1"}` (FBL 12.2). The marker is evaluated on the first document, which is enough for every file the OpenSLO repository ships and for every file the tool writes.
- **Rationale**: FR-003. A shared binding must have a marker, and an OpenSLO document's `apiVersion` is its mark.
- **Alternatives**: a `pattern` marker over the first 20 lines (catches a file whose first document is not OpenSLO, but also comments that mention it).

## R3. One element per OpenSLO object; inline objects are contained

- **Decision**: each document is one element of its `kind` (rules with `when: entry.kind == 'SLO'` and so on). An SLO's `spec.objectives[*]` are `Objective` elements contained in it. An inline `spec.indicator` is an `SLI` element contained in its SLO, with the derived flag `inline`, and an inline alert policy likewise. An element's id is its `metadata.name` within its kind's key space (FBL 5.3, `kind`), since OpenSLO names are unique per kind.
- **Rationale**: User Story 1. Containment lets the diagram draw an inline SLI as its own element joined to its SLO (scenario 3) while the binding writes it where it stands.
- **Alternatives**: flatten inline objects into attributes of their SLO (the picture would lose User Story 1's element).

## R4. References across files

- **Decision**: a bare file is read alone. A reference whose target is not in the file (`service`, `indicatorRef`, `alertPolicyRef`, a condition's or target's reference) ends at a derived placeholder node (DISL 4.11; a relation's end may resolve to one since DISL 0.8), drawn dashed and labelled *not in this file*. A registration whose body is a folder (`kind: "folder"`, FBL 9) reads every OpenSLO file of the folder through one file rule (`**/*.yaml`, `**/*.yml`, with the marker), and each element carries the file it came from, shown on it.
- **Rationale**: User Story 1, scenario 4 asks that references into other files are drawn and the elements from other files marked. A folder reading draws them in full; a bare file still draws the reference and says why its end is not there.
- **Alternatives**: read the folder whenever a file is opened (a host would read files the user did not open, which FBL 16 restricts).

## R5. Duration shorthand is parsed by a function

- **Decision**: OpenSLO writes windows and slice sizes as `duration-shorthand` (`5m`, `4w`, `1M`, `1Q`, `1Y`), not ISO 8601. The attribute is a `string` with the pattern `^[0-9]+[smhdwMQY]$`, and a DISL function `windowSeconds(s)` reads it with `matches`, `substring` and `int`. Calendar units have no fixed length; for them the budget is stated for the shortest window of the unit (28 days for `M`, 89 for `Q`, 365 for `Y`) and labelled *at least*. A bare number in `timeSliceWindow` is minutes, as OpenSLO says.
- **Rationale**: FR-004 asks for expressions a host evaluates. DISL's `duration` type is ISO 8601 and cannot read the shorthand.
- **Alternatives**: convert the file's durations to ISO 8601 on write (would rewrite bytes the user did not edit, FR-002).

## R6. What an SLO states

- **Decision**: each objective shows its target as a percentage (`target` × 100, or `targetPercent`), its window (`rolling` or `calendar-aligned`, with the duration), its budgeting method, and its error budget in the method's own terms: `Occurrences`, the share of events allowed to fail; `Timeslices`, the number of slices allowed to fail (`(1 − target) × window ÷ timeSliceWindow`, rounded down); `RatioTimeslices`, the average ratio allowed. Beside it, for every method, the equivalent time of complete failure (`(1 − target) × window`): 99.9 % over 28 days is 40 min 19 s.
- **Rationale**: User Story 1, scenario 2, and the specification's edge case on budgeting methods. The time equivalent is what a service level manager compares commitments by.
- **Alternatives**: the time equivalent only (wrong for occurrences).

## R7. One OpenSLO version

- **Decision**: the binding reads `openslo/v1`. A document with another `apiVersion` (for example `openslo.com/v2alpha`, the draft of `enhancements/v2alpha.md`) is kept as written and makes the file read-only with one finding naming the version.
- **Rationale**: the specification's assumption and edge case.

## R8. Layout in tiers

- **Decision**: the force layout in tiers (DISL 10.4): Service, then SLO, then Objective and SLI, then DataSource; AlertPolicy, AlertCondition and AlertNotificationTarget in a tier beside the SLOs.
- **Rationale**: the reading order of User Story 1 without positions stored in the user's YAML; positions a user pins are kept in a registration's layout block (FBL 8.3), never in the OpenSLO file.
- **Alternatives**: positions as annotations in the OpenSLO file (`metadata.annotations` with an `etalii.net/` prefix would be valid OpenSLO, but the files belong to their teams and their tools, and FR-008 forbids extending the format).

## R9. Fixtures are OpenSLO's own documents

- **Decision**: the read fixtures vendor the three files of `examples/` and the multi-object samples of `website/docs/specification.md` from the commit above, under `specifications/fbl/fixtures/openslo-slo-*/`, with OpenSLO's `LICENSE` copied verbatim as `LICENSE.md` and a `README.md` naming the repository, the commit and each file's source path, and saying what the corpus does not demonstrate: no folder of several files, no calendar-aligned window in `examples/`, and no RatioTimeslices objective with alerting. The licence was read from the repository's own `LICENSE` file at that commit: the Apache License 2.0, which is permissive and not share-alike.
- **Rationale**: FR-007 and the rule on vendored example data (standalone `CLAUDE.md`, *Vendored example data*).
- **Alternatives**: hand-written fixtures only (the rule asks for real published data).

## R10. OpenSLO's own validator

- **Decision**: SC-005 is checked with OpenSLO's command-line validator (`oslo validate`) on the files an agent writes from the companion; the companion names the command. It is not part of this repository's Build.
- **Rationale**: the check is OpenSLO's, and the Build should not depend on an outside tool's release.

## R11. Name and origin

- **Decision**: origin `openslo/slo`, language id `net.etalii.adp.openslo.slo`, display name *SLO map*, kind Diagram.
- **Rationale**: the specification's assumption, after the format's owner (`w3c/rdf`).

## R12. Tool description and conformance

- **Decision**: as spec 084's R12: the ATD description and trace are written and checked here; conformance cases come with the first host.
