# Feature Specification: Naming Convention Alignment

**Feature Branch**: `features/002-naming-convention-alignment`
**Created**: 2026-09-28
**Status**: Draft
**Input**: "Create a new spec kit specification on etalii.adp called "Naming convention alignment". It is about aligning the names related to designers, diagrams, editors and related aspects consistently across all repo's, all code, all functionalities, all documentation, all data sources (notion) and pipelines. It should be covered everywhere, except of course in the history. […] Diagrams: i.e. the visual ones with elements and relations. Designers: Form based visual layouts. […] Editors: Primarily when text based access is the core interaction principle. […] where we have placeholders for diagrams/editors there should also be a placeholder added for designers. […] All of those still persist as how it was before. Write the definitions down on a notion page and also express it on a web page in the document part of the portal. This is a huge change and should be done by multiple threads working in parallel, with them coordinating and testing until the whole code base and web site is consistent and tested as operating as before." (Peter, 2026-09-28; full text in the project thread.)

## Context

ADP offers new ways to visualize, enter and interact with data, mostly text-based. Peter distinguishes three kinds of them:

- a **diagram** is visual and made of elements and the relations between them;
- a **designer** is a form-based visual layout: more than text input, less than a diagram, because nothing in it is connected;
- an **editor** is text-based: typing text is the core interaction, as in markdown.

Today the three words are used for other things, and differently in every place. [inventory.md](inventory.md) records the evidence; in short:

- "Diagram" names the whole standalone host (`EtAlii.Adp.Diagram.*`, "diagram type", "diagram module") and the Notion database, which holds every kind of entry.
- "Editor" is the text-editor family in the standalone host, the running tool in the DEDL specification ("Diagram Editor Definition Language", "editor runtime"), a platform concept in the IDE hosts, and a property-value control. The site mixes these uses too ("a family of specialized diagram, designer and text editors", "opens designers as real editors", DEDL expanded as "Diagram Editor Definition Language"), and the alignment applies to it as much as to the code.
- The copy contradicts itself: "diagram and text designers" in some places, "diagram, designer and text editors" in others.
- Placeholders exist for diagrams and editors (`src/diagrams/` and `src/editors/` in the standalone host, `definitions/diagrams/` and `definitions/editors/` here, "creating a diagram module" and "creating an editor module" guides) but never for designers.
- Within one kind the names drift too: a type's folder, assembly, origin, title and label disagree ("helm-charts" vs `helm/chart`, "Wardley Map" vs "Wardley map", five spellings of "mind map").

This feature fixes one vocabulary, writes it down in the three places people read it, and applies it to every repository, every piece of code, every user-visible text, every document, the Notion data and the pipelines that move data between them, while everything keeps working as it did: existing documents open, settings survive, links resolve.

## Decisions

Peter decided on 2026-09-28, reviewing the first draft:

- The umbrella word for "a diagram, a designer or an editor" is **tool**.
- DEDL becomes DISL, the Diagram Specification Language. It was meant for diagrams only, and it is not a definition language but a specification language: in it a tool engineer specifies how one diagram type (say type A) functions and looks. The diagrams of type A that users then create are stored according to a definition language, DID. There is one specification language and one definition language per kind:

| Kind | Specification language | Extension | Definition language | Extension |
|---|---|---|---|---|
| Diagram | DISL, Diagram Specification Language | `.disl` | DID, Diagram Definition Language | `.did` |
| Designer | DESL, Designer Specification Language | `.desl` | DED, Designer Definition Language | `.ded` |
| Editor | EDSL, Editor Specification Language | `.edsl` | EDD, Editor Definition Language | `.edd` |

- The definitions are documented in Notion, in markdown and on the site.
- Every Notion row today is indeed a diagram. The kind column offers Diagram, Designer and Editor, and the markdown and plain-text editors get rows of their own.
- Persisted identifiers are renamed too ("Change all of it"); keeping them working is how the rename is done, not a reason to leave the old name in place.

Roles used below: a **user** works with ADP in one of its hosts and creates diagrams, designers and editors of the types it offers; a **tool engineer** specifies how a tool type functions and looks, in its kind's specification language; a **contributor** (person or agent) changes an ADP repository; a **visitor** reads the site, the organization profile or Notion; **Peter** owns the product and decides the classification.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One written vocabulary (Priority: P1)

A contributor who is about to name a new class, write a page or add a Notion row looks up the ADP vocabulary and finds, in one place, what a diagram, a designer and an editor are, what the umbrella for all three is called, and the terms around them (type, definition, document, module, host, canvas). A visitor finds the same definitions on a Notion page and on a page in the documentation part of the site, and they say the same thing.

**Why this priority**: every other story applies this vocabulary; without it there is nothing to be consistent with.

**Independent Test**: read the glossary in `etalii.adp`, the Notion page and the site page side by side; every term has one definition, the three agree, and the three kinds can be told apart by the test each definition gives.

**Acceptance Scenarios**:

1. **Given** the glossary, **When** a contributor reads the definition of diagram, designer and editor, **Then** each definition gives a test (relations between elements; a form-based layout without relations; text as the core interaction) that places any entry in exactly one kind.
2. **Given** the Notion page and the site page, **When** either is compared with the glossary in `etalii.adp`, **Then** it states the same terms with the same meaning and points to the glossary as its source.
3. **Given** a term the glossary retires (for example "designer" as the umbrella), **When** it is looked up, **Then** the glossary names the term that replaces it.

---

### User Story 2 - Every entry is the right kind, everywhere (Priority: P1)

Peter reviews a classification of every catalogue entry and every host component as a diagram, a designer or an editor. Once it is agreed, each entry is called by its kind wherever it appears: in each host's code and UI, in the catalogue, on its site page, in Notion and in the documentation. The markdown and plain-text editors are editors, not diagrams, and the mind map is a diagram, not a designer.

**Why this priority**: it is the substance of the ask: "These three aspects should be correctly applied. Everywhere."

**Independent Test**: pick any entry, find every place it appears across the repositories, the site and Notion, and check that each place uses the kind the classification gives it.

**Acceptance Scenarios**:

1. **Given** the agreed classification, **When** an entry classified as a diagram is looked up in a host, the catalogue, the site and Notion, **Then** each calls it a diagram and none calls it a designer or an editor.
2. **Given** the markdown and plain-text editors, **When** they are looked up in the standalone host, the site and Notion, **Then** each calls them editors, and they appear in Notion and the catalogue as entries of kind editor.
3. **Given** a user-visible text that names the umbrella ("Browse the designers", the "Designers" settings page, "a family of specialized diagram, designer and text editors"), **When** the feature lands, **Then** it uses the umbrella term from the glossary ("Browse the tools", the "Tools" settings page), or the kind when only one kind is meant.
4. **Given** the specification that was DEDL, **When** it is read, **Then** it is DISL, the Diagram Specification Language, the person who writes in it is a tool engineer and no longer a designer, a diagram type specified in it is a `.disl` file, and the diagrams users create of that type are stored as DID (`.did`) files.

---

### User Story 3 - Everything keeps working as before (Priority: P1)

A user updates to a version with the new names and carries on: every document they had opens and saves exactly as before, their settings (turned-off entries, per-entry settings, zoom and grid) are kept, bookmarked site links still land on the right page, and the site's refresh and Notion sync still run.

**Why this priority**: "All of those still persist as how it was before" and "tested as operating as before". A rename that loses a user's work or settings is a regression, not an alignment.

**Independent Test**: before and after the change, open every example document in every host, compare what is written back, reload the settings of a host that has them, follow every old site URL, and run each repository's own checks and the site's refresh in dry-run mode.

**Acceptance Scenarios**:

1. **Given** any existing document or registration file, **When** it is opened and saved unchanged after the rename, **Then** it opens and is written back byte-identical.
2. **Given** a host's stored settings from before the rename, **When** the host starts after it, **Then** every setting still applies, under whichever name it is now stored.
3. **Given** any URL the site served before, **When** it is requested after, **Then** it serves the same page or redirects permanently to its new address.
4. **Given** a file extension, schema `$id`, media type, origin or other identifier that documents, settings or external tools persist, **When** the vocabulary renames it, **Then** the new identifier is used from then on and the old one keeps being read (and, for a URL, redirected), so no stored data needs converting by hand.
5. **Given** each repository's build, tests and checks, **When** they run on the renamed code, **Then** they pass with no fewer tests than before.

---

### User Story 4 - Designers have a place next to diagrams and editors (Priority: P2)

A contributor who wants to build the first designer finds a place prepared for it wherever diagrams and editors have one: a folder for designer modules next to the diagram and editor module folders, a guide next to the "creating a diagram module" and "creating an editor module" guides, a definitions folder next to `definitions/diagrams/` and `definitions/editors/`, a `Designer` kind in Notion and the catalogue, and a slot in each host that shows diagrams and editors.

**Why this priority**: asked for explicitly, but it adds structure rather than fixing a name, and nothing breaks without it.

**Independent Test**: list every place that has a diagram and an editor variant and check that a designer variant exists beside each, even if empty.

**Acceptance Scenarios**:

1. **Given** a place in any repository with a diagram and an editor variant (a folder, a guide, a registry, a menu, a filter, a Notion option), **When** the feature lands, **Then** it has a designer variant too, marked as a placeholder where nothing fills it yet.
2. **Given** an empty placeholder folder, **When** the repository is cloned, **Then** the folder exists (it carries a file saying what belongs in it).

---

### User Story 5 - Notion and the pipelines speak the same language (Priority: P2)

Peter opens the Notion database that lists what ADP offers and sees each row's kind (diagram, designer or editor), host columns named in one pattern, and a database named for all three kinds rather than "Diagrams". The site's hourly refresh and the post-merge Notion sync keep reading and writing it without a gap or a missing column, and their procedures, pull requests and summaries use the same words.

**Why this priority**: Notion is named in the ask as a data source; the pipelines are what keeps it and the site in step, so they must move together.

**Independent Test**: run the catalogue refresh in dry-run mode against Notion after the change; it reports no missing column and no unclassified row, and its pull request text uses the vocabulary.

**Acceptance Scenarios**:

1. **Given** the Notion database, **When** it is read after the change, **Then** every row has exactly one kind, the kinds offered are Diagram, Designer and Editor, and the four host columns follow one naming pattern.
2. **Given** the site's refresh and sync pipelines, **When** they run after the change, **Then** they read and write the renamed columns and options without reporting a gap, and a row renamed or re-kinded keeps its site page or redirects to it.
3. **Given** the refresh procedures and their generated pull requests and summaries, **When** they are read, **Then** they use the vocabulary.

---

### User Story 6 - It stays consistent (Priority: P3)

A contributor opens a pull request that reintroduces a retired use of a term, for example a new class named `…Designer` for a diagram. The repository's checks point it out, naming the file, the term and the glossary entry.

**Why this priority**: without it the alignment decays with the next feature; but the alignment itself is complete without it.

**Independent Test**: in each repository, add a line using a retired term outside the allowed exceptions and see the check fail and name it.

**Acceptance Scenarios**:

1. **Given** a pull request that adds a retired term outside the allowed exceptions, **When** the repository's checks run, **Then** they report the file, the line and the glossary entry.
2. **Given** a platform-mandated or historical use listed as an exception, **When** the checks run, **Then** they do not report it.

---

### Edge Cases

- **Platform-mandated names.** IntelliJ's `FileEditor`, `FileEditorProvider` and `TextEditorWithPreview`, VS Code's custom editors and Eclipse's editor extension points use "editor" for any document tab. These API names stay as the platforms define them; ADP's own names around them follow the vocabulary (a diagram is *shown in* a platform editor, it is not called one).
- **Other meanings of the words.** "Editor" as a property-value or inline label control, "view" as a viewport, a C4 view or an open tab, "diagram" in third-party names (OMG Diagram Definition, "draw.io diagram", "Mermaid class diagram"). The glossary says which of these are kept and under what name; third-party product and standard names are never changed.
- **An entry that fits two kinds**, for example a matrix that could be read as a form or a hype cycle curve whose items carry no relations. The classification records the rule applied and the reason; Peter decides borderline entries.
- **An entry that is one kind in one host and another in a second host.** The kind belongs to the entry, not the host; all hosts use the same kind.
- **Persisted identifiers that contain a retired term**, such as the IntelliJ ids `etalii.adp.freemind.editor` and `offDesigners`, `.adp` origins, the `.dedl` extension, the DEDL schema `$id`, media types and version keys, and site URLs under `/adp/designers/` and `/adp/dedl/`. They are renamed, and the old form is still read or redirected (FR-011).
- **The retired acronym DEDL.** Today DEDL is the diagram language that becomes DISL; the Designer Definition Language is DED, so the acronym DEDL is not reused. Old DEDL identifiers (`.dedl`, the schema `$id`, `/adp/dedl/`) lead to DISL, and DED uses its own (`.ded`).
- **History.** Commits, merged and closed pull requests, release notes of published releases, completed Spec Kit features and spec-workflow archives (implementation logs, approval snapshots) are records of what was, and are not rewritten.
- **Work in flight.** Branches and threads open while this lands (the catalogue focus-area filtering and IntelliJ screenshot threads, for example) are rebased onto the new names before they merge.
- **The repositories without code** (`etalii.adp.ide.vscode`, `etalii.adp.ide.eclipse`) only need their texts aligned now; the vocabulary applies to their code when it arrives.

## Requirements *(mandatory)*

### Functional Requirements

**Vocabulary**

- **FR-001**: A glossary **MUST** exist in `etalii.adp` as the single source of the ADP vocabulary. It **MUST** define diagram, designer and editor with a test that places any entry in exactly one kind, the umbrella term for all three, and the related terms named under Key Entities, and it **MUST** list every retired use with its replacement and every allowed exception with its reason.
- **FR-002**: The umbrella term for "a diagram, designer or editor" **MUST** be **tool**, used everywhere the three are meant together and replacing "designer" in that role. Where a platform already uses "tool" for something else (IntelliJ's tool windows, a toolbox), the glossary **MUST** say which is meant.
- **FR-003**: The glossary **MUST** be published as a Notion page and as a page in the documentation part of the site, each stating the same definitions and linking to the glossary in `etalii.adp` as the source. A change to the glossary **MUST** update both in the same change.
- **FR-004**: The constitution of `etalii.adp` and the `CLAUDE.md` of every repository **MUST** use the vocabulary and point to the glossary; the constitution change goes through `/speckit-constitution`.

**Classification**

- **FR-005**: Every catalogue entry, every Notion row and every host component that a user works in (including the markdown and plain-text editors and the settings pages) **MUST** be classified as a diagram, a designer or an editor, in one table that records the rule applied to each, and Peter **MUST** approve the table before any code is renamed.
- **FR-006**: DEDL **MUST** become DISL, the Diagram Specification Language: its specification, schema, examples, identifiers (folder, file names, schema `$id`, media types, version keys, export format names) and every reference to it. A diagram type specified in it **MUST** be a `.disl` file, and the diagrams users create of that type **MUST** be stored according to DID, the Diagram Definition Language (`.did`). It **MUST** call the person who writes in it a tool engineer, never a designer.
- **FR-006a**: DESL, the Designer Specification Language, and EDSL, the Editor Specification Language, **MUST** exist beside DISL, and DID, DED (Designer Definition Language, `.ded`) and EDD (Editor Definition Language, `.edd`) beside each other, as placeholder specifications where they have no content yet, each stating its purpose, its extension and that its content is to come. The six **MUST** follow one naming pattern for folders, documents, schemas and extensions.
- **FR-006b**: The glossary **MUST** state what a specification file holds (`.disl`, `.desl`, `.edsl`: one tool type as a tool engineer specifies how it functions and looks) and what a definition file holds (`.did`, `.ded`, `.edd`: one diagram, designer or editor a user created of such a type).

**Applying the vocabulary**

- **FR-007**: Every repository in the `etalii-adp` organization (`etalii.adp`, `etalii.adp.ide.standalone`, `etalii.adp.ide.intellij`, `etalii.adp.ide.vscode`, `etalii.adp.ide.eclipse`, `etalii.adp.site`, `.github`) **MUST** use the vocabulary in its code identifiers (projects, assemblies, packages, namespaces, folders, files, types, members), user-visible text (menus, labels, titles, messages, settings pages, tooltips), documentation, specifications of work not yet completed, tests and build and pipeline definitions, apart from the exceptions the glossary lists.
- **FR-008**: Each entry **MUST** have one display name, spelled and capitalised the same in every host, the catalogue, the site and Notion, and its code identifiers **MUST** derive from that name in one pattern per language. A display name **MUST** be a name, not a description.
- **FR-009**: Where a host or repository has a place for diagrams and a place for editors (module folders, guides, definition folders, registries, menus, catalogue kinds and filters, Notion options), it **MUST** have a place for designers beside them, marked as a placeholder while empty.
- **FR-010**: The Notion database **MUST** carry a kind for every row with the options Diagram, Designer and Editor, **MUST** hold rows for the markdown and plain-text editors with the fields that apply to an editor filled in, **MUST** name its host columns in one pattern, and **MUST** be named for all three kinds. The site's refresh and sync pipelines, their procedures and their generated texts **MUST** be changed in the same step as Notion so that no run fails or reports a gap in between.

**Preserving behaviour**

- **FR-011**: A persisted identifier (file extension, registration origin, schema `$id`, media type, version key, settings key or id, public URL, Notion column or option) that carries a retired term **MUST** be renamed like any other name. From the change on, the new form **MUST** be what is written, and the old form **MUST** keep being read, or for a URL keep redirecting permanently, for at least the next major version of the host concerned. Only identifiers that no one outside ADP can have stored (internal ids that never leave memory, for example) may be renamed without this.
- **FR-012**: After the change, every existing document and every example in every repository **MUST** open in every host that opened it before, and **MUST** be written back byte-identical when saved unchanged.
- **FR-013**: After the change, every repository's build, tests and checks **MUST** pass with at least as many tests as before, and the site **MUST** build, pass its checks and serve every URL it served before.
- **FR-014**: History **MUST NOT** be rewritten: commits, merged or closed pull requests, published release notes, completed Spec Kit features and spec-workflow archives stay as they are.

**Delivery**

- **FR-015**: The work **MUST** be divisible into parts that separate threads carry out in parallel, one repository or area per part, with the approved glossary and classification table as their shared contract; each part **MUST** be delivered as its own pull request into that repository's `develop`, and a part that changes something another part reads (an origin, a URL, a Notion column, the catalogue file) **MUST** name the parts that depend on it.
- **FR-016**: Before the feature is closed, one pass across all repositories, the site and Notion **MUST** confirm that no retired use remains outside the listed exceptions and that the checks of FR-012 and FR-013 hold on every repository's `develop` together.
- **FR-017**: Each repository **SHOULD** check on its pull requests that no retired use is reintroduced outside the listed exceptions.

### Key Entities

- **Diagram**: a visual arrangement of elements and the relations between them (a mind map, a Wardley map, a C4 container diagram).
- **Designer**: a form-based visual layout; more than text input, with nothing in it connected.
- **Editor**: a way of working in which typing text is the core interaction (markdown, plain text).
- **Tool**: what a diagram, a designer and an editor all are; replaces "designer" in that role (FR-002).
- **Tool engineer**: the person who specifies how a tool type functions and looks, in its kind's specification language.
- **Specification language**: the language in which a tool engineer specifies a tool type of one kind: DISL for diagrams, DESL for designers, EDSL for editors (`.disl`, `.desl`, `.edsl`).
- **Definition language**: the structure in which the tools users create of a type are stored: DID for diagrams, DED for designers, EDD for editors (`.did`, `.ded`, `.edd`).
- **Type**: one particular diagram, designer or editor that ADP offers, such as the Wardley map; identified by its origin (`<vendor>/<type>`) and called "<kind> type" (diagram type, designer type, editor type).
- **Document**: one piece of content a user works on in a type, with its registration file (`.adp`) where the host uses one.
- **Module**: the code package in a host that implements one or more types of one kind (diagram module, designer module, editor module).
- **Host**: an IDE that ADP runs in (standalone, IntelliJ, VS Code, Eclipse).
- **Canvas**: the surface a diagram or designer is drawn on.
- **Classification table**: the approved list of every type and component with its kind and the reason (FR-005).
- **Exception**: a use of a term that stays as it is (platform API, third-party name, persisted identifier, history), with its reason.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A search of every repository's current files, the site's pages and Notion for the retired uses listed in the glossary finds none outside the listed exceptions.
- **SC-002**: 100% of the example documents and registration files in all repositories open in each host that opened them before, and are written back byte-identical when saved unchanged.
- **SC-003**: Every repository's build, tests and checks pass on `develop` after the last part merges, with a test count no lower than before the feature started.
- **SC-004**: 100% of the URLs in the site's sitemap before the change return the same page or a permanent redirect to it afterwards.
- **SC-005**: Settings stored by a host before the change are all still in effect after it, checked by restoring a settings file saved before the change.
- **SC-006**: The catalogue refresh and the Notion sync complete against the renamed Notion database with no missing-column or unclassified-row report.
- **SC-007**: Every one of the entries in the catalogue, Notion and the hosts appears in the classification table with a kind, and each appears under the same display name and kind in every place it is shown.
- **SC-008**: A contributor new to ADP, given the glossary, places ten sample entries in the same kind as the classification table.

## Assumptions

- "All of those still persist as how it was before" is read as: what users have stored (documents, registration files, settings) and what others link to (URLs, schema ids) keeps working unchanged, and every feature behaves as it did. It is not read as keeping the old names visible.
- "Everywhere except the history" covers the current files of every branch that will be merged, Notion's current content and the site as served; history is as listed in FR-014.
- All seven repositories of the organization are in scope, including `.github` (the organization profile), which feature 001 left out.
- No entry is expected to be a designer today; the classification may confirm that, in which case designers exist only as placeholders (FR-009).
- The standalone host's term "diagram type" and its `DiagramOrigin` are kept for diagrams; editors and designers get the matching "editor type" and "designer type" rather than sharing the diagram names.
- Platform APIs, third-party product and standard names, and vendored files are exceptions by nature.
- The parts of FR-015 are planned and assigned in `/speckit-plan` and `/speckit-tasks`, after Peter approves this specification; the plan decides the order in which persisted identifiers, Notion and the pipelines move.
- Spec documents in this repository reach `develop` through a pull request, as `CLAUDE.md` requires today.
