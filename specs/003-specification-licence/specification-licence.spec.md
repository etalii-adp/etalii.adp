# Feature Specification: Specification Licence

**Feature Branch**: `features/003-specification-licence`
**Created**: 2026-09-29
**Status**: Draft
**Input**: "Every ADP language specification (DISL, DID, DESL, DED, EDSL, EDD) states its licence, Apache-2.0 like the rest of the project, in a form the etalii.adp.site refresh recognises, so the site can publish versions. The site currently shows: 'No version of DISL has been published on this site yet. The site publishes a version once its source states a licence and the refresh brings it in.'" (Peter, 2026-09-29, through the project's coordinator.)

## Context

The etalii.adp.site reference publishes a version of a language only when the refresh can say under which licence the source is published, and its build refuses a published version without one (etalii.adp.site spec 002, FR-015 and research D14). The site's "Not published yet" text names a missing licence as the reason a language is not published.

How the refresh recognises a licence today, as read in `etalii.adp.site` at `bcef800`:

- The reference refresh (`scripts/reference/refresh.ts`) asks GitHub for the licence of the **whole source repository** at the revision it publishes. It accepts any licence GitHub identifies with an SPDX id, and refuses the source when GitHub finds none or answers `NOASSERTION`.
- It also takes the first line of that licence file that starts with `Copyright` as the copyright holder, and the provenance block on every reference page shows it after the licence. When there is no such line, the page shows the licence alone.
- Nothing in a specification document, schema or example is read for the licence.

What that finds in this repository today:

- Spec 001 added the Apache License 2.0 as `LICENSE` at the root on 2026-09-27, and GitHub identifies it as `Apache-2.0` on `develop`.
- A dry run of the site's refresh at `9f13b8b` passes for DISL and for DID, each reporting `Licence: Apache-2.0`. The licence therefore no longer blocks their first publish; what remains on the site's side is running the refresh and merging its pull request in `etalii.adp.site`.
- `LICENSE` is the unmodified Apache text, so it has no `Copyright` line and the site records no copyright holder.
- None of the six specification documents says under which licence it is published. A reader who has only the document, or the page the site builds from it, learns the licence only from the site's provenance block or from the repository.
- DESL, DED, EDSL and EDD are placeholders with no version and no schema, and the site does not list them yet. DEDL is retired in favour of DISL and DID (spec 002) and the site does not publish it.

So this feature does not unblock the site by itself; the licence the refresh needs is already there. It makes the licence something each specification states, keeps the repository in the form the refresh recognises, adds the copyright holder the site shows beside it, and makes sure none of this silently regresses.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The site can publish every version with its licence and copyright (Priority: P1)

A maintainer of etalii.adp.site runs the refresh for a published language (today DISL and DID) at any revision of `develop`. The refresh recognises the licence as Apache-2.0 and records who holds the copyright, and every page the site builds from that version shows both in its provenance.

**Why this priority**: publishing on the site is the purpose Peter gave. The licence must stay recognisable at every revision the site may publish, and the copyright holder is the one part of the provenance that is missing today.

**Independent Test**: after the change is merged, run the site's refresh as a dry run for DISL and for DID against `develop`; each reports `Apache-2.0` and records the copyright notice `© Peter Vrenken 2026`.

**Acceptance Scenarios**:

1. **Given** the change is merged into `develop`, **When** the site's refresh runs for DISL or DID, **Then** it reports the licence as `Apache-2.0` and records the copyright holder, and does not refuse the source for want of a licence.
2. **Given** a reference page built from that snapshot, **When** a reader looks at its provenance, **Then** it shows Apache-2.0 and the copyright holder.
3. **Given** GitHub's identification of the repository licence, **When** it is read after the change, **Then** it is still `Apache-2.0`, not `NOASSERTION` or another licence.

---

### User Story 2 - A reader of a specification sees its licence in the document (Priority: P2)

A host developer or tool engineer opens any of the six specification documents, on GitHub, in a copy, or on the site, and finds at the top, beside its version and status, that the specification is published under the Apache License 2.0, with a link to the licence text.

**Why this priority**: the documents are the source of truth (principle I) and travel on their own; the licence should travel with them. It is second because the site's provenance already shows the licence.

**Independent Test**: open each of the six documents and find the licence in its header table, naming Apache-2.0 and linking the repository's `LICENSE`.

**Acceptance Scenarios**:

1. **Given** any of the six specification documents, **When** a reader looks at its header, **Then** it states the licence as the Apache License 2.0 with its SPDX id `Apache-2.0` and links the licence text.
2. **Given** a placeholder (DESL, DED, EDSL, EDD), **When** a reader looks at its header, **Then** it states the same licence, so the licence is in place before the language gains content.
3. **Given** the site publishes the first section of DISL or DID, **When** a reader looks at its cover, **Then** the licence statement from the header appears there as part of the document.

---

### User Story 3 - A missing or wrong licence statement is caught before it reaches `develop` (Priority: P3)

A contributor adds a new specification, or edits a header, and leaves the licence out or names another. The Build workflow on their pull request fails and says which document is wrong.

**Why this priority**: it keeps stories 1 and 2 true over time, but nothing is broken until a new language is added.

**Independent Test**: on a scratch branch, remove the licence line from one specification document, and separately change the root licence file so GitHub no longer identifies it; the check fails for each and names the cause.

**Acceptance Scenarios**:

1. **Given** a pull request in which a specification document has no licence statement, **When** the Build workflow runs, **Then** it fails and names the document.
2. **Given** a pull request in which a document names a licence other than the repository's, **When** the Build workflow runs, **Then** it fails and names the document and both licences.
3. **Given** a pull request that adds a new specification folder, **When** its document states the licence, **Then** the check passes without any per-language configuration.

### Edge Cases

- The copyright notice must not stop GitHub identifying the licence file as Apache-2.0; if the chosen form would do that, the licence is lost for the site, which is worse than a missing copyright holder.
- Retired material (DEDL files kept under `legacy/`) is not a published specification; it is covered by the repository licence and needs no statement of its own.
- Schemas and examples are published by the site beside the prose. They are covered by the repository licence and the provenance of the version they belong to; they do not state it themselves (see Assumptions).
- A second licence file, or one in a specification folder, could make GitHub's identification ambiguous; the repository keeps exactly one licence.
- A future decision to license a specification differently from the repository would have to change this rule; until then every specification states the repository's licence.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository **MUST** keep exactly one licence file, at its root, that GitHub identifies as `Apache-2.0`, on `develop` and at every revision merged into it. This is the form the site's refresh recognises.
- **FR-002**: The repository **MUST** state its copyright notice, `© Peter Vrenken 2026` (the © being U+00A9 COPYRIGHT SIGN), in a form the site's refresh records as the copyright, without changing GitHub's identification of the licence (FR-001). The site's provenance **MUST** then show that notice beside the licence.
- **FR-003**: Each of the six specification documents (DISL, DID, DESL, DED, EDSL, EDD) **MUST** state in its header table that it is published under the Apache License 2.0, give the SPDX id `Apache-2.0`, and link the repository's licence file. Placeholders **MUST** state it too.
- **FR-004**: The licence each document states **MUST** be the licence of the repository (FR-001).
- **FR-005**: The Build workflow **MUST** fail a pull request in which a specification document under `specifications/` lacks the statement of FR-003 or names a licence other than the repository's, and **MUST** name the document. It **MUST** find the documents by the naming rule of the constitution, so a new language needs no configuration.
- **FR-006**: The Build workflow **MUST** fail when the repository's licence file is no longer identified as Apache-2.0, or when a second licence file exists.
- **FR-007**: The rule that every specification states the repository's licence **MUST** be recorded where the constitution sets out the shape of a specification, so new languages and placeholders follow it.
- **FR-008**: The site's texts about this (the "Not published yet" message and the refresh's refusal) are owned by etalii.adp.site; this feature **MUST NOT** depend on changing them, and **MUST** leave the site able to publish DISL and DID by running its refresh unchanged.

### Key Entities

- **Repository licence**: the single licence file at the root, the Apache License 2.0, as GitHub identifies it. The site reads it; everything else refers to it.
- **Copyright notice**: `© Peter Vrenken 2026`, stated once for the repository and shown by the site beside the licence.
- **Licence statement**: the row in a specification document's header table naming the licence, its SPDX id and a link to the repository licence.
- **Specification document**: `specifications/<name>/<NAME>-specification.md`, one per language, as the constitution names it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 6 of 6 specification documents state Apache-2.0 in their header, and each links a licence file that exists.
- **SC-002**: A dry run of the site's refresh for each language the site publishes (DISL, DID) against `develop` after the merge reports `Apache-2.0` and the copyright notice `© Peter Vrenken 2026`, with no refusal.
- **SC-003**: GitHub identifies the repository licence as `Apache-2.0` after the merge.
- **SC-004**: Each failure in User Story 3 is caught by the Build workflow on its pull request: 3 of 3 deliberate faults (missing statement, wrong licence, unidentifiable licence file) fail it, each naming its cause.
- **SC-005**: The Build workflow passes on the pull request that delivers this feature.

## Assumptions

- **Licence**: Apache-2.0 for every specification, as for the rest of the project; no specification is licensed differently.
- **Copyright notice**: `© Peter Vrenken 2026`, as Peter gave it on 2026-09-29. The site's refresh records only a line that begins with the word `Copyright`, so the licence file carries it as `Copyright © Peter Vrenken 2026` and the site shows it that way. Recording the bare `© Peter Vrenken 2026` would need a change to the refresh in etalii.adp.site, which FR-008 keeps out of this feature.
- **Recognised form**: "a form the refresh recognises" means what the site reads today: GitHub's identification of the repository's licence file, and a `Copyright` line in it. If the site later reads the licence from each document, the statement of FR-003 is the obvious source, but that change belongs to etalii.adp.site.
- **Scope**: this feature changes `etalii.adp` only. Running the site's refresh for DISL and DID and merging the result is etalii.adp.site's procedure and follows independently; it no longer waits on this feature.
- **Schemas and examples**: they keep being covered by the repository licence and the site's provenance. Adding a licence to each schema file or example is out of scope; a schema read on its own, at its `$id`, names its source repository through the site.
- **Placeholders**: DESL, DED, EDSL and EDD are not published by the site until they have a version and a schema and the site lists them; stating their licence now only makes sure they have it when that happens.
- **Legacy**: retired DEDL material under `legacy/` folders is not a specification document and is not checked.
