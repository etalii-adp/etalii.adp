# Feature Specification: Format Binding

**Feature Branch**: `features/005-format-binding`
**Created**: 2026-09-30
**Status**: Draft
**Input**: "Specify a declarative, bidirectional binding from text formats (YAML, line grammars, Structurizr, .mm, etc.) to the DISL model, with splice-based minimal writes and matching undo. Cover themes 1 to 3 of the DISL gaps summary: byte-preserving round trip, the .adp registration and view sidecar, one model feeding several readings, folder subjects, plus a written plugin contract for formats that stay plugins (Turtle projection, MSBuild). Default: a new specification folder beside DISL, not a DISL section. A parallel session specifies DISL 0.2 declarative additions; align the boundary with it." (Peter, 2026-09-30, through the project's coordinator, following the "DISL gaps for working tools" thread, where Peter chose to run this track beside DISL 0.2.)

## Context

The DISL gaps summary (project file `disl-gaps/disl-gaps-summary.md`, 2026-09-30) read the 23 diagram specifications in `definitions/diagrams/` against DISL 0.1. Its headline: only the timeline can in principle run on a generic DISL runtime. The other 22 each declare a **required** persistence plugin, so by DISL section 13.1 a runtime without that plugin refuses to open them for editing. (Counted on `develop` at `e908a19`, the folder holds 25 definitions; 24 of them name a persistence plugin as their format, and only the timeline uses DISL's built-in `yaml`.) The `.dis` files describe metamodel, notation, toolbox, forms and rules well; what they cannot carry is where the model comes from and how it is written back.

That matters because ADP runs in four hosts written in four languages (the standalone host, IntelliJ, VS Code, Eclipse). A persistence plugin is code, so each of the 24 is written, tested and kept in step four times. "Defined, not coded" holds for these tools only if their persistence can be declared.

The two gaps this feature takes on, as the summary ranks them:

1. **Foreign model files, written by splices** (blocking, 23 of 23). Every tool reads a file that is not a DID definition: Structurizr DSL, Turtle, SPARQL, Azure Pipelines YAML, Databricks YAML and JSON, `.sln` and `.csproj`, Freeplane `.mm`, `.owm`, and ADP's own `.dgr`, `.fdg`, `.cld`, `.ghg` and timeline YAML. DISL's persistence layer (section 11) assumes a writer that regenerates the file canonically (DID section 6), which is exactly what these files must not suffer: they belong to other tools as much as to ADP, so an unchanged file must save byte for byte, and an edit must touch only the bytes it concerns.
2. **Where the model comes from, and where the view lives** (blocking, 20 of 23). An `.adp` registration names the model file and keeps positions for only the elements a user dragged; one Structurizr workspace feeds six C4 diagram types and one Turtle file feeds four W3C types through one store and one history; Ansible, Helm and .NET tools take a folder as their subject and watch it; a shared extension becomes a diagram only with an opt-in marker. DISL's `files.mode: split` and `view.store` only approximate this, and the rest lives in `x-adp` keys that no host is obliged to read.

Of the summary's third gap (elements derived from the model, not stored), this feature takes only the seam: which bound elements are written back and which are not. Derived nodes themselves belong to DISL 0.2.

### Boundary with DISL 0.2 (feature 004)

A parallel feature, `specs/004-disl-0-2`, adds declarative vocabulary to DISL. The two sessions agreed this split on 2026-09-30:

- **This feature**: reading and writing foreign files, splices and their undo, tolerant reading, read-only foreign models, new-document templates, the registration and view sidecar, one model feeding several readings, folder subjects, routing, and the written plugin contract. It also owns the one change to DISL's persistence section that lets a specification point at a binding.
- **DISL 0.2**: id strategies and ids that are unstable across edits, derived nodes and computed containment, findings (including their source location: file, line, column, length and an optional subject), refusal and read-only reasons, a flag for a fixed attribute that is not persisted, and the other degrading gaps. This feature references those constructs and does not define its own.
- **Neither**: layout algorithms (gap 5), which DISL 0.2 lists as a later feature.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A tool whose model is someone else's file runs without a plugin (Priority: P1)

A tool engineer writes a DISL specification for a tool whose model is a foreign text file, for example Azure Pipelines YAML or ADP's own timeline YAML. Instead of declaring a required persistence plugin, the specification points at a binding written in the new Format Binding Language (FBL). The binding says, declaratively and in both directions, which parts of the file are which elements, attributes and relations. Any conforming host opens such a file, shows it as a diagram, and saves edits back into the same file.

**Why this priority**: this is the gap that blocks 23 of 23 tools, and the one that makes a persistence plugin necessary in the first place. Without it nothing else in this feature has a model to work on.

**Independent Test**: take one existing definition that today requires a persistence plugin for a tree-shaped format (YAML or JSON), rewrite its persistence as an FBL binding, and open each of its example files: the diagram shows the same elements and relations the plugin's notes describe, and the specification no longer declares a required persistence plugin.

**Acceptance Scenarios**:

1. **Given** a DISL specification whose persistence names an FBL binding, **When** a conforming host opens a file of that format, **Then** the host builds the model from the binding alone, without any persistence plugin.
2. **Given** such a file opened and saved with no edits, **When** the saved bytes are compared to the original, **Then** they are identical, including comments, unknown keys, blank lines, indentation, key order, quoting, line endings, a byte-order mark and the presence or absence of a final newline.
3. **Given** a user adds, changes, renames or removes one element, **When** the file is saved, **Then** only the bytes of the named splices that edit implies have changed, and every other byte is where it was.
4. **Given** two conforming hosts and the same file, binding and edit, **When** each saves, **Then** they write identical bytes.

---

### User Story 2 - Every edit has an exact undo, and reading never fails (Priority: P1)

A user edits a diagram whose model is a foreign file, undoes and redoes, and sometimes opens a file that is half broken or was changed by another tool in the meantime. Undo restores the exact bytes; a file changed underneath the editor is never silently overwritten by an undo; and a file with bad entries still opens, with the bad entries reported rather than the whole file refused.

**Why this priority**: a splice writer without an exact undo, or a reader that refuses imperfect files, damages files that belong to other tools. This is part of making story 1 safe, so it shares its priority.

**Independent Test**: for each example file, apply every edit the tool offers, undo it, and compare the bytes to the original; then corrupt one entry and one whole body and open both.

**Acceptance Scenarios**:

1. **Given** any edit, **When** the user undoes it, **Then** the file's bytes are exactly those before the edit, and redo restores exactly those after it.
2. **Given** the file was changed on disk by another program after an edit, **When** the user undoes, **Then** the host refuses the undo with a reason instead of applying it to bytes it did not write, and offers to reload.
3. **Given** a file with an entry the binding cannot read, **When** it opens, **Then** every readable entry is in the model, the unreadable entry is reported as a finding at its place in the file, and the unreadable bytes are kept untouched on save.
4. **Given** a file whose body cannot be read at all, **When** it opens, **Then** the diagram opens empty and read-only with a single finding that says why, and the file is never written.

---

### User Story 3 - Positions live beside the model, not in it (Priority: P2)

A user drags a few elements of a diagram whose model is a foreign file. The foreign file does not change: the positions go into an `.adp` registration beside it, which names the model file, the reading it is shown in, and stores positions only for the elements the user actually moved. Everything else is laid out by the tool.

**Why this priority**: 20 of 23 tools need it, and it keeps other tools' files free of ADP's view data; but a tool that re-lays out on every open (story 1 alone) is already usable.

**Independent Test**: open a foreign file through a registration, drag two elements, save, and check that the foreign file is unchanged and the registration holds exactly two positions keyed by the elements' ids.

**Acceptance Scenarios**:

1. **Given** a registration that names a body file and a DISL language, **When** a host opens the registration, **Then** it opens the body file with that language's binding and applies the stored positions.
2. **Given** a user drags an element, **When** the diagram is saved, **Then** only the registration changes, and it gains a position for that element alone.
3. **Given** an element whose id is unstable across edits (as DISL 0.2 defines), **When** the user drags it, **Then** no position is stored for it and the user is told why.
4. **Given** a stored position for an element that no longer exists in the body, **When** the registration opens, **Then** the stale position is reported and dropped on the next save, not applied to another element.
5. **Given** a body file opened directly, without a registration, **When** the user first drags an element, **Then** the host creates the registration beside it, and the body file is still unchanged.

---

### User Story 4 - One model, several readings (Priority: P2)

A user has one Structurizr workspace open as a C4 container diagram and as a C4 context diagram at the same time, or one Turtle file as an RDF graph and as a SKOS hierarchy. An edit in one view appears at once in every other open view of the same file, and one undo history covers them all.

**Why this priority**: it is what ten of the 23 tools are built on (C4 ×6, W3C ×4), and without it two open views of one file overwrite each other.

**Independent Test**: open one workspace in two readings, rename an element in one, and check that the other shows the new name, that the file was written once, and that one undo in either view reverts it in both.

**Acceptance Scenarios**:

1. **Given** two readings of the same file open, **When** an edit is made in one, **Then** the other shows it without a reload, and the file is written by one splice, not once per view.
2. **Given** edits made in different readings of one file, **When** the user undoes, **Then** the most recent edit to the file is undone, whichever view it came from.
3. **Given** a registration per reading (for example one per C4 view), **When** positions are stored, **Then** each reading keeps its own positions and none of them is written into the shared file.
4. **Given** a file readable by several languages, **When** a host is asked which readings it offers, **Then** it lists every installed language whose binding claims the file.

---

### User Story 5 - A folder as the subject (Priority: P3)

A user opens an Ansible project, a Helm chart or a .NET solution folder as a diagram. The host recognises the folder by rules the specification declares, reads the files in it tolerantly, and keeps the diagram up to date while files in the folder change, without reopening.

**Why this priority**: three tools depend on it and they are read-only, so they gain less from declarative persistence than the editable ones.

**Independent Test**: open an example Helm chart folder, then add, change and delete a template file in it from outside the editor; the diagram follows each change after a short settling delay, and nothing in the folder is written.

**Acceptance Scenarios**:

1. **Given** a folder that matches a language's recognition rules, **When** a host lists what it can open, **Then** the folder is offered as that diagram; a folder that does not match is not.
2. **Given** a folder subject open, **When** files in it are added, changed, renamed or removed, **Then** after the settling delay the diagram shows the new state, keeping the positions of elements whose ids survived.
3. **Given** a burst of changes (a branch switch, a build), **When** they arrive, **Then** the host rereads once after the burst settles, not once per file.
4. **Given** a file in the folder that cannot be read, **When** the folder is read, **Then** the rest of the folder is still shown and the file is reported as a finding.

---

### User Story 6 - Formats that stay plugins keep a written contract (Priority: P3)

Some formats are too clever to declare: projecting Turtle triples into cards and rows, or evaluating MSBuild with its imports, wildcards and central package management. A host developer implements a persistence plugin for such a format against one written contract, the same in every host, instead of reverse-engineering what the other hosts' plugins do. The contract lets a plugin report findings, which the .NET notes say a plugin cannot do today.

**Why this priority**: it does not remove a plugin, but it turns 24 implicit contracts into one explicit one, and it is the fallback for anything FBL leaves out.

**Independent Test**: take the contract and an existing plugin's notes (for example the Turtle or .NET one), and check that every capability the notes rely on is a named part of the contract, and that the plugin's outputs (model, findings, splices, undo) are the same kinds FBL produces.

**Acceptance Scenarios**:

1. **Given** a specification that declares a persistence plugin, **When** a host loads it, **Then** the host knows from the contract alone what the plugin must deliver on read, on write, on undo and on external change.
2. **Given** a plugin that meets a problem in the file, **When** it reads, **Then** it reports a finding with a source location, and the host shows it like any other finding.
3. **Given** a plugin-backed file, **When** it takes part in a registration, several readings or a folder subject, **Then** it behaves as a bound file does: byte-preserving writes, exact undo, drift refusal.

---

### User Story 7 - The host knows which files are diagrams, and new ones start as real files (Priority: P3)

A user browses a repository in any host. A file with an extension only one tool claims is offered as that diagram; a file with a shared extension (a `.yaml`, a `.json`) is offered as a diagram only when it carries the opt-in marker a binding declares, and the host may suggest the marker when the content looks like it. When the user creates a new diagram of a foreign-file tool, the file it starts with is a valid file of that foreign format, not an ADP document.

**Why this priority**: the gaps summary calls it routing and puts it with gap 2; the tools work without it when files are opened explicitly.

**Independent Test**: open a folder with an Azure Pipelines YAML file, an unrelated YAML file and a marked timeline YAML file, and check what each host offers; then create a new diagram of each foreign-file tool and open the result in the foreign tool itself.

**Acceptance Scenarios**:

1. **Given** a file with a shared extension and no marker, **When** the host lists diagrams, **Then** the file is not claimed by any binding that requires a marker.
2. **Given** such a file whose content matches a binding's suggestion rule, **When** the user opens it, **Then** the host may suggest adding the marker, and adds it only when the user agrees, as a splice.
3. **Given** a new diagram created from a binding's template, **When** it is saved, **Then** its bytes are exactly the template's with the user's first edits spliced in, and the foreign tool reads it.

---

### Edge Cases

- A file whose line endings are mixed: splices use the ending of the line they are next to, and untouched lines keep theirs.
- A file with a byte-order mark, or without a final newline: both are kept as they were.
- An edit that makes a section empty: the binding says whether the section's key is removed or kept empty, and undo restores it exactly as it was.
- An edit that needs a section that does not exist yet: the binding says where the section is created, and undo removes it.
- A rename of an element whose name is used as a reference elsewhere in the file: every reference is rewritten in the same edit, and undo reverts them all at once.
- A JSON array or object edited at its first or last member: separators are added or removed so the file stays valid, with no other change.
- Two entries with the same id in one file: both are read, the duplicate is reported (DISL 0.2's finding), and edits address the entry by its place, not only its id.
- An element that the binding reads but cannot write (no write rule, or a derived node from DISL 0.2): it is shown, it is read-only with a reason, and saving never writes it.
- A file changed on disk while unsaved edits exist: the user is told, and chooses between reloading and keeping their version; a keep writes the whole of the editor's version, which is then one undo step.
- A registration whose body file is missing or moved: the registration opens with a finding naming the missing body, and nothing is written until the user points it at a file.
- A registration that names a language the host does not have: it opens read-only or is refused, as DISL does for a missing required plugin.
- A binding that claims a file another binding also claims without a marker: the host offers both readings (story 4) rather than choosing silently.
- A folder subject so large that watching it would be unreasonable: the host may fall back to reading on demand and says so.
- A read-only foreign model (SPARQL, Helm, Ansible, .NET): positions can be stored in the registration, and no gesture ever writes the model file.

## Requirements *(mandatory)*

### Functional Requirements

#### The specification and its place

- **FR-001**: The repository MUST gain a new specification, FBL, the Format Binding Language, in `specifications/fbl/` beside DISL, with its document `FBL-specification.md`, its JSON Schema `fbl.schema.json` and examples `*.fbl`, following the constitution's structure and naming rules, stating version 0.1 and status Working Draft.
- **FR-002**: The terminology (`docs/terminology.md`) MUST define the new words this feature relies on (at least binding, body, registration, reading, splice, folder subject) before the specification uses them, and CLAUDE.md, the readme and the constitution MUST list FBL beside the six languages it serves.
- **FR-003**: DISL's persistence layer MUST gain one way for a specification to name an FBL binding as the format of its stored model, and nothing else from this feature; a specification that does so MUST NOT need a persistence plugin.
- **FR-004**: A binding MUST be usable by the specifications of every tool kind (diagrams now, designers and editors later), not only DISL, because they share the problem.
- **FR-005**: The Build workflow's example check MUST validate every `*.fbl` example against the FBL schema, and every FBL example MUST be exercised by at least one round-trip fixture: an input file, the edits applied and the exact bytes expected after each edit and after each undo.

#### Binding a format (story 1)

- **FR-010**: FBL MUST be able to declare bindings for at least these format families: YAML and JSON documents; XML documents; line-oriented grammars (one record per line, optionally in sections or indented blocks); and brace-delimited block languages (such as the Structurizr DSL).
- **FR-011**: A binding MUST state, for each element kind, relation kind and attribute it binds, both how it is read from the file and how a change to it is written back; a binding that states only the read direction for something MUST make that thing read-only, with a reason the host can show.
- **FR-012**: A binding MUST state how each bound element gets its id, by naming one of the id strategies DISL 0.2 defines; it MUST NOT define id strategies of its own.
- **FR-013**: A binding MUST state which references between entries in the file (names, keys, paths) are relations or reference attributes in the model, so that a rename can rewrite them (FR-024).
- **FR-014**: A binding MUST be able to declare a foreign model read-only as a whole, in which case no gesture writes the model file.
- **FR-015**: Wherever a binding needs a computed value or condition, it MUST use CEL, as DISL does.
- **FR-016**: Content of the file that the binding does not bind (unknown keys, comments, lines no rule matches) MUST be preserved exactly and MUST NOT make reading fail.

#### Byte-preserving writes and splices (story 1)

- **FR-020**: Opening and saving a file with no edits MUST write the same bytes that were read.
- **FR-021**: Every model change MUST be written as one or more named splices: replacements of a byte range of the file whose extent the binding determines. Bytes outside the splices of an edit MUST NOT change.
- **FR-022**: FBL MUST name and define a fixed catalogue of splice operations that covers at least: replace a value in place keeping its quoting style; insert an entry after the last entry of its kind (or at a position the binding names); create a missing section or key on demand at a place the binding names; remove an entry together with its own comments and separators; remove a key when its value becomes empty, where the binding says so; rewrite every reference on rename; and add or remove list and object separators so that JSON stays valid.
- **FR-023**: New text a splice writes MUST follow the file's existing conventions as the binding observes them at the place of insertion: indentation, quoting, line ending, list style; where the file offers no evidence, the binding's declared defaults apply.
- **FR-024**: One user gesture MUST produce one edit, which MAY consist of several splices (for example a rename and its reference rewrites), applied and undone together.
- **FR-025**: For the same file, binding and edit, every conforming host MUST produce identical bytes.

#### Undo, drift and tolerant reading (story 2)

- **FR-030**: Every edit MUST have an exact inverse: undoing it restores the bytes before it, and redoing restores the bytes after it. A binding MAY declare that an operation is undone by restoring a snapshot of the whole document instead of an inverse splice.
- **FR-031**: Before applying an undo or redo, the host MUST check that the affected bytes are those the edit left behind; if the file drifted, it MUST refuse with a reason and offer to reload, and MUST NOT write.
- **FR-032**: Reading MUST NOT fail on the content of a file: every entry the binding cannot read MUST become a finding located in the file (using DISL 0.2's finding and source location), and the rest MUST be read.
- **FR-033**: A body that cannot be read at all (not well-formed at the top level, or undecodable) MUST open as an empty, read-only diagram with one finding that replaces all others, and MUST NOT be written.
- **FR-034**: A binding MUST provide its new-document template as the exact bytes of a valid file of the foreign format.

#### Registration and view sidecar (story 3)

- **FR-040**: FBL MUST define the `.adp` registration: a small file that names at least its body (the model file or folder, relative to itself), the language (the DISL specification and version) and the reading it is shown in, and holds the view data for that reading.
- **FR-041**: The registration MUST store positions and other per-element view data only for elements the user placed or changed explicitly; all other view data MUST be recomputed on open.
- **FR-042**: Stored view data MUST be keyed by element id; view data MUST NOT be stored for elements whose id DISL 0.2 marks unstable, and the host MUST say why when a user drags such an element.
- **FR-043**: View data for an id that no longer exists in the body MUST be reported and MUST be dropped on the next save; it MUST NOT be applied to another element.
- **FR-044**: The registration MUST itself be written with the byte-preserving and splice rules of this feature, so a user's hand edits and unknown keys in it survive.
- **FR-045**: Saving view changes MUST NOT write the body, and saving model changes MUST NOT write the registration, except where the user's edit concerns both (for example a rename that moves a stored position to the new id).
- **FR-046**: FBL MUST define how the registration forms used by today's definitions (the `body:`, `resource:`, `view:` and `language:` headers with a `layout:` block, and `{name}.layout.json` keyed by view) are read, so existing users' files keep working.

#### One model, several readings (story 4)

- **FR-050**: A host MUST hold one model, one edit history and one undo stack per body, shared by every open reading of that body, whatever language each reading uses.
- **FR-051**: An edit made in any reading MUST be applied to the body once and MUST become visible in every open reading of it.
- **FR-052**: Several languages MAY bind the same format; FBL MUST let a binding be shared by name, so that the C4 types share one Structurizr binding and the W3C types one Turtle binding, instead of each repeating it.
- **FR-053**: Each reading MUST keep its own view data in its own registration (or its own part of one), keyed by reading.

#### Folder subjects (story 5)

- **FR-060**: A binding MUST be able to take a folder as its body, recognised by declared file-system rules (files or folders that must, may or must not be present, matched by name patterns).
- **FR-061**: A folder binding MUST say which files in the folder it reads and with which (file-level) binding each, and MUST read every file tolerantly (FR-032).
- **FR-062**: While a folder subject is open, the host MUST watch it, MUST wait until changes have settled for a declared delay before rereading, and MUST apply the difference to open readings, keeping view data of elements whose ids survived.
- **FR-063**: A folder subject is read-only unless its binding declares writes for its files, in which case every write follows FR-020 to FR-031 per file.

#### Routing (story 7)

- **FR-070**: A binding MUST declare which files it claims: by extension, by name pattern, and optionally by an opt-in marker in the content.
- **FR-071**: A binding for a shared extension MUST require a marker, and a host MUST NOT claim a file with that extension without it; a binding MAY declare a suggestion rule under which the host proposes adding the marker, which is then added only with the user's consent, as a splice.
- **FR-072**: The routing that today's definitions keep in `x-adp` keys MUST be expressible in FBL, so those keys can be retired.

#### The persistence plugin contract (story 6)

- **FR-080**: FBL's document MUST include a normative contract for persistence plugins: what a plugin receives and must deliver on read, on write (splices), on undo, on external change and when watched, and what it may assume of the host.
- **FR-081**: The contract MUST let a plugin report findings with a source location, as bound files do.
- **FR-082**: A plugin-backed body MUST take part in registrations, several readings and folder subjects exactly as a bound body does, and MUST meet the byte-preservation, exact-undo and drift rules.
- **FR-083**: The contract MUST name the formats this repository expects to stay plugins and why (at least Turtle projection and MSBuild evaluation), and MUST state that a format expressible in FBL SHOULD be bound rather than implemented as a plugin.

#### Proof against the definitions

- **FR-090**: The FBL examples MUST include working bindings for at least one format of each family in FR-010, drawn from the existing definitions (for example the timeline YAML, an Azure Pipelines or Databricks YAML, Freeplane `.mm`, `.owm`, and the Structurizr DSL), each with round-trip fixtures.
- **FR-091**: The feature MUST record, for each of the 25 definitions in `definitions/diagrams/`, whether its persistence becomes an FBL binding, stays a plugin under the contract, or is out of reach and why. Rewriting the definitions themselves to use FBL is follow-up work, not part of this feature.

### Key Entities

- **Binding**: a declaration, in FBL, of how one format maps to a language's model in both directions: which files it claims, how elements, relations and attributes are read, which splices write them back, how ids are made, which parts are read-only, and the new-document template.
- **Body**: the file or folder that holds the model, owned by the foreign format; it is the model's only store.
- **Registration**: the `.adp` file beside a body that names the body, the language and the reading, and keeps the view data a user placed explicitly.
- **Reading**: one language's view of a body; several readings of one body share its model and history.
- **Splice**: a named, minimal replacement of a byte range in a body, with an exact inverse; one user edit is one or more splices.
- **Folder subject**: a body that is a folder, recognised by file-system rules, read file by file and watched.
- **Persistence plugin**: code that reads and writes a body for a format FBL cannot declare, bound by the written contract.
- **Finding** and **source location**, **id strategy**, **unstable id**, **derived node**: defined by DISL 0.2 and used here.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every FBL example validates against the FBL schema in the Build workflow, and every round-trip fixture passes: 100% of no-edit saves are byte-identical, and 100% of edit-then-undo sequences restore the original bytes.
- **SC-002**: For every splice operation in the catalogue there is at least one fixture, and in every fixture the bytes that change are only those inside the splices of the edit.
- **SC-003**: Of the 24 definitions that today declare a persistence plugin as their format, the record of FR-091 shows at least half able to replace it with an FBL binding, and every remaining one covered by the written plugin contract.
- **SC-004**: A host developer can implement a reader and writer for one bound format from the FBL document, schema and examples alone, and pass its fixtures, without reading any host's code (principle II).
- **SC-005**: Every registration and routing construct used in today's definitions (their `x-adp` keys and registration headers) has a named FBL equivalent.
- **SC-006**: The boundary with DISL 0.2 holds: FBL defines no id strategy, finding, source location or derived-node construct of its own, and every reference to one points at DISL.

## Assumptions

- The new language is a sibling of DISL, not a DISL section (Peter's default through the coordinator). It is named FBL, the Format Binding Language, with folder `specifications/fbl/` and extension `.fbl`, following the constitution's acronym rule; the name can change in review.
- A binding is referenced from a specification rather than embedded in it, so the C4 and W3C families can share one binding each; a specification MAY embed a small binding inline.
- DISL 0.2 (feature 004) defines findings, source locations, id strategies, unstable ids, derived nodes and the non-persisted-attribute flag. Until it merges, FBL refers to those constructs by name and its examples use them as 004 specifies; if 004 changes them, FBL follows.
- Text files are UTF-8, with or without a byte-order mark; other encodings are read as unreadable bodies (FR-033). This matches DISL 11.2.
- A host's file watching and debounce delays are host concerns; FBL declares the delay a folder binding wants, and hosts honour it as closely as their platform allows.
- Collaboration (DISL 11.10) over foreign files is out of scope; a bound body is edited by one host at a time, and changes from outside arrive as external changes (FR-031, FR-062).
- Structurizr DSL constructs beyond the model and views (`!script`, `!plugin`, `!include` of remote files) are read as unbound content and preserved, not evaluated.
- Rewriting the 25 definitions to use FBL, and implementing FBL in the hosts, are follow-up features in this repository and the host repositories.
