# Feature Specification: One Language for Every Tool Type

**Feature Branch**: in `etalii.adp`, `claude/project-thread-kykv1z` for this specification; in every repository the code lands in (`etalii.adp`, `etalii.adp.ide.desktop`, `etalii.adp.ide.vscode`, `etalii.adp.ide.intellij`), `features/035-adp-tool-language`, one pull request per repository as the plan cuts them

**Created**: 2026-10-22

**Status**: Draft, phase 1 of a transition (see *Phases*). This document is the specification only; the plan and the tasks follow after the maintainer approves it (Spec Kit process, 2026-10-12).

**Input**: The maintainer's request of 2026-10-22: "create a spec flow specification in the etalii.adp repo that starts working on the following: A shared LALR(1) grammar that supports all aspects from DISL/DESL/EDSL and FBL, [and] custom scripting as per this research. A description for each tool (files will get a .atd extension - ADP Tool Definition). Each Definition should includes all aspects of the tool, including the logic as currently encoded in the code that makes up the tool side in each of the hosts. Language servers (as per the language server protocol that facilitates VSCode and IntelliJ), and of course also one for the language server in rust (for the desktop host), for completion, coloring, go to definition, renaming, diagnostics, hovering with documentation, formatting, highlighting grammars. An editor in VS Code that allows for the creation/editing/modification of a .atd file. A debugger in the desktop host. Any other aspects from this document that make sense to add." "This research" and "this document" are the thought experiment *One tool grammar, plus a script for the logic* of the same day, kept in the project's shared folder as `lark-plus-scripting/one-tool-grammar.html`.

## Context

**What exists.** A tool engineer specifies a tool type today in up to three files, each in a language of its own written as JSON: a specification in its kind's specification language (DISL for a diagram, DESL for a designer; EDSL for an editor is a placeholder), a binding in FBL when the tool's model lives in another tool's file, and a companion `.md` that lists in prose what neither language can say. What the companion lists is written as code, once per host: the standalone host has 69 diagram modules, one designer and five editors, most of them hand-written; the VS Code host carries five tool-type plugins (`abm-arrange`, `abm-markdown`, `freeplane-mm`, `knowledge-views`, `mindmap-layout`); the IntelliJ host's FreeMind and draw.io tools are hand-written; the desktop host ports the standalone host's tools to Rust. Every host also re-implements the languages themselves (three DISL interpreters, three FBL implementations of together about 32,000 lines). `definitions/` in this repository holds 30 diagram types and 2 designer types.

This specification reads the hosts at these commits of their `develop`, the **reference commits**: `etalii.adp` `222dea4`, `etalii.adp.ide.standalone` `396c776`, `etalii.adp.ide.vscode` `97e403d`, `etalii.adp.ide.intellij` `255c57c`, and `etalii.adp.ide.desktop` at the commit its plan names when planning starts.

**What this feature adds.** The first phase of moving every tool type to one language, the **ADP tool language**, in which a tool type of any kind is described completely in one kind of file, `.atd`: its identity, its model, its view (canvas, form-based surface or text), its behaviour, its persistence, and the logic that today lives in host code, written in a small **script** that is part of the same language. The language is defined by one shared grammar that is LALR(1). Around it come the means to work in it: a checker, a conversion from and to today's languages, language servers for VS Code, IntelliJ and the desktop host, an editor for `.atd` files in VS Code, a runtime in the desktop host that runs a tool from its `.atd` alone, and a debugger for that runtime. In this phase the runtime exercises tool descriptions to validate and debug them; no host stops running a tool from its JSON files.

**Why.** The research of 2026-10-22 found that DISL is already a language that JSON only carries; that DESL and FBL repeat its foundations, so that FBL's introduction needs a table answering each concern twice; that most of what the companion files list is either a recurring construct or a small algorithm; and that the logic hosts write per tool type is the largest source of difference between hosts. One language with one grammar states each concept once, puts the logic beside the declarations it serves, can be checked as one unit, can be given one set of editing tools, and can be written by people and AI agents alike under a grammar that admits only valid text.

**What stays.** DISL, DID, DESL, DED, EDSL, EDD and FBL remain specifications of this repository, and every existing `.dis`, `.des` and `.fbl` keeps being read by every host. DID and DED remain the formats tools store their documents in. No host changes how it runs today's tool types because of this feature. The standalone host plans with spec-workflow in its own repository; its adoption of `.atd` is a feature there, not part of this one. The Notion add-on and the Eclipse host adopt it in features of their own.

**Words.** Those of [docs/terminology.md](../../docs/terminology.md): tool, tool type, diagram, designer, editor, tool engineer, specification, definition, binding, document, body, splice, reading, finding, host, runtime. A **tool description** is one `.atd` file, or a set of `.atd` files one of which is its root, that describes one tool type. The name "ADP Tool Definition" is the maintainer's; ADP's glossary reserves "definition" for the documents users create, which question Q4 below settles. The **script** is the part of the ADP tool language in which logic is written. A **capability** is a named algorithm the platform provides and a tool description calls, for work the script is not meant for (section *Where the logic goes*). **Parity** is the state in which a tool run from its `.atd` behaves as the same tool type does in the reference host, with the same bytes on disk.

## Phases

The maintainer ruled on 2026-10-22, answering Q1: "In the end it should be .adt only, however we need to have a transition period. For the first phase the idea is that we just define the tools in .adt, create the tooling infrastructure and make sure we can edit and validate them. This first phase will not transition the existing tools from their JSON representation to a .adt representation." (`.adt` is read as `.atd`, the extension of the request.)

- **End state.** The `.atd` text alone is normative. The JSON languages of tool types (DISL, DESL, EDSL and FBL documents) are retired as authored forms, and every host runs tools from `.atd`.
- **Phase 1, this feature.** The language and its grammar are specified; the tools in scope are described in `.atd`; the toolchain to write, edit, check, validate and debug tool descriptions is built, in the desktop host and in VS Code (Q3), with language support in IntelliJ. The `.dis`, `.des` and `.fbl` files stay the ones every host runs, unchanged, and are neither converted nor retired.
- **Later phases, features of their own.** Conversion of the existing JSON files, hosts running tools from `.atd`, retirement of the JSON languages as authored forms, and the adoption in the standalone host, the Notion add-on and the Eclipse host.

## Where the logic goes *(informative)*

The research sorted the residue that the companion files and the host code hold into four destinations, which this feature adopts:

| Residue | Examples | Destination |
|---|---|---|
| Recurring gaps | positions kept in the registration, findings at file and line, stubs for a missing end, layered layouts with a band, state-dependent labels, drop-onto tools, id schemes | constructs of the language |
| Formats with a context-free syntax | Turtle, SPARQL, Structurizr DSL, `.owm` | a grammar format family in the binding part of the language |
| Small algorithms | sibling naming, elementary-cycle enumeration with loop claiming, SKOS cycle breaking, C4 relationship elevation, parent-cycle checks | script functions |
| Heavy or numeric algorithms | Sankey relaxation, self-organising arrange, MSBuild import evaluation, the description-logic renderer | capabilities, named by the tool description and provided by the platform |

## Clarifications needed

Four questions were put to the maintainer, each with options. Q1, Q2 and Q3 are answered; the specification is written on the recommended option of Q4 and changes if another is chosen.

- **Q1, normative form (FR-030).** Answered 2026-10-22: `.atd` alone in the end, after a transition; phase 1 does not move existing tools off their JSON files (see *Phases*).
- **Q2, which tool types get a tool description (FR-020).** Answered 2026-10-22: every tool type with a specification in `definitions/` (30 diagrams, 2 designers) and every editor the hosts implement (plain text, Markdown, JSON, XML, YAML), with the hosts' code for those tool types as the source of their logic.
- **Q3, which hosts run tools from `.atd` in this feature (FR-040, FR-063).** Answered 2026-10-22: "Desktop host and VS Code, however it is not 'running tools' according to a .adt specification but in the first phase rather the toolchain for editing, validation." Both hosts get the toolchain to edit and validate tool descriptions; neither runs a person's tools from `.atd`.
- **Q4, the name of the file (Words).** Recommended: "ADP Tool Description", which keeps `.atd` and fits ADP's glossary, where a tool engineer writes a specification and users create definitions. Alternative: "ADP Tool Definition", with the glossary amended to give "definition" a second meaning.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Describe a tool type in one language and have it checked (Priority: P1)

A tool engineer writes a new tool type of any kind in one `.atd` file: its identity and kind, its element types and attributes, its notation or surface, its toolbox, forms, constraints and operations, its binding to the files it reads and writes, and the script functions its operations and hooks call. They run the checker and get every problem at its line and column, in ADP's words, with a fix where one is known.

**Why this priority**: the language and its checker are what every other story builds on, and they are of value alone: a tool type can be written, read and checked without any host.

**Independent Test**: write the examples of the language specification (one per kind, one per binding family, one with script functions), run the checker on them and on a corpus of deliberately broken variants, and compare its findings with the expected ones.

**Acceptance Scenarios**:

1. **Given** the grammar, **When** it is built in strict LALR(1) mode, **Then** it reports no shift/reduce, reduce/reduce or terminal conflict.
2. **Given** a tool description of each kind, **When** it is checked, **Then** a description that uses only the constructs its kind admits passes, and one that uses a construct of another kind (a designer that declares a relation, an editor that declares a canvas) is refused at that construct.
3. **Given** a description with a syntax error, **When** it is checked, **Then** the finding names the line and column, what was found and what was expected, in words a tool engineer recognises.
4. **Given** a description that names an element type, attribute, binding rule, script function or capability that does not exist, **When** it is checked, **Then** the finding is at the name and offers the closest existing names.
5. **Given** a description whose binding reads an attribute the model does not declare, **When** it is checked, **Then** the finding is reported once, at the binding, because model and binding are checked as one unit.

---

### User Story 2 - Every existing tool type has a complete tool description (Priority: P1)

A tool engineer opens the `.atd` of any tool type in scope and finds in it everything the tool type is: what its specification and binding say today, what its companion file lists in prose, and the logic each host writes in code for it. Nothing about the tool type is left to a host, apart from what the language names as a host's concern.

**Why this priority**: it is the evidence that the language is complete, and the input of every runtime that will run from `.atd`.

**Independent Test**: for each tool type in scope, compare the tool description with its specification, binding, companion file and host code at the reference commits, item by item, and run its conformance fixtures.

**Acceptance Scenarios**:

1. **Given** a tool type's `.dis`, `.des` or `.fbl`, **When** its tool description is complete, **Then** every construct of those files has its counterpart in the description, every CEL expression is carried verbatim, and the JSON files themselves are unchanged.
2. **Given** a tool type's companion file, **When** its tool description is complete, **Then** each item of the companion's "what the language cannot say" is either a construct, a script function, a binding rule or a named capability in the description, or is recorded as a host's concern with its reason.
3. **Given** a host's code for a tool type at its reference commit, **When** the tool description is complete, **Then** each behaviour that code implements and the tool type's specification does not (layouts, naming, refusals, menus, read-only reasons, derived data, file reading and writing) is traced to the part of the description that now states it.
4. **Given** the conformance fixtures recorded from the reference host for a tool type, **When** the tool is run from its `.atd`, **Then** its readings, findings, splices and drawings match the fixtures.

---

### User Story 3 - Write and edit tool descriptions with full language support in every IDE (Priority: P2)

A tool engineer edits an `.atd` in VS Code, in IntelliJ or in the desktop host and gets the same help in each: colouring, completion that knows the tool type's own names, go to definition, find references, renaming across all files of the description, diagnostics as they type, hover with the documentation of the construct and of the tool's own declarations, and formatting that keeps their comments.

**Why this priority**: the language replaces JSON, whose schemas already give completion in every editor; it must not be harder to write.

**Independent Test**: open the language specification's examples in each IDE and walk a fixed list of edits, each with its expected completion, diagnostic, hover, rename and formatting result.

**Acceptance Scenarios**:

1. **Given** the cursor where an attribute is expected in a binding rule, **When** completion is asked, **Then** it offers the attributes of the element type the rule produces, and nothing else.
2. **Given** an element type used in a notation, a binding rule and a script, **When** it is renamed, **Then** every use in every file of the description is renamed and nothing else changes.
3. **Given** an unsaved edit that breaks the syntax, **When** the tool engineer keeps typing, **Then** diagnostics, colouring and completion keep working in the rest of the file.
4. **Given** a description with comments, irregular spacing and long lines, **When** it is formatted twice, **Then** the second formatting changes nothing, and no comment is lost or moved to another construct.
5. **Given** the same file and the same edit, **When** it is checked in VS Code, in IntelliJ and in the desktop host, **Then** the three report the same diagnostics at the same places.

---

### User Story 4 - Validate a tool description by running it in the desktop host (Priority: P2)

A tool engineer opens a tool description in the desktop host's validation view, with one of the tool type's conformance documents. The desktop host runs the description on its own, beside the tool it runs today: it reads the document, draws it, offers the toolbox, forms, operations and refusals, and applies edits to a working copy. It reports where the description's readings, findings, splices or drawings differ from the fixtures recorded from the reference host. The tools a person uses in the desktop host keep running as they do today.

**Why this priority**: it is how a description is shown to be complete before any host depends on it, and it is what the debugger runs on.

**Independent Test**: run the conformance fixtures of every tool type in scope through the desktop host's validation, with a seeded difference in one description, and check that only the seeded difference is reported.

**Acceptance Scenarios**:

1. **Given** a tool type in scope, **When** its description is validated against its fixtures, **Then** every reading, finding and drawing matches, and the result of every fixture edit is byte-identical to the reference host's, or each difference is reported at the construct that causes it.
2. **Given** a tool description edited while it is open for validation, **When** it is saved, **Then** the desktop host checks it and, if it passes, validates again without a restart; if it fails, the findings are shown and the last result stays.
3. **Given** a script function that runs past its step budget, **When** it is called, **Then** the call stops, the gesture that called it is refused with a finding that names the function, and the working copy is unchanged.
4. **Given** a document a person has open in the desktop host, **When** a tool description of its type exists, **Then** the document keeps opening with the tool the desktop host runs today, and its file is never written by the validation.

---

### User Story 5 - Create and edit a tool description in VS Code (Priority: P2)

A tool engineer creates a new tool type in VS Code from a command that asks for its kind, its origin and its name, and gets a tool description that checks clean. They edit it with the language support of story 3 and check it from the editor.

**Why this priority**: VS Code is where most tool types are written today, and creating one should not start from copying another.

**Independent Test**: in a fresh VS Code window with only the extension installed, create one tool type of each kind, edit it, and check that the files pass the checker.

**Acceptance Scenarios**:

1. **Given** the command to create a tool type, **When** the tool engineer answers its questions, **Then** a new `.atd` is written into the chosen folder that checks without findings and opens in the editor.
2. **Given** an open `.atd`, **When** the tool engineer saves it or asks for a check, **Then** the findings of the checker appear in VS Code's problems list, each at its place.
3. **Given** an `.atd` that imports other `.atd` files, **When** one of them is edited, **Then** the findings of every file of the description are brought up to date.
4. **Given** a tool description with conformance fixtures, **When** the tool engineer asks to validate it, **Then** VS Code reports the same differences as the desktop host's validation, and no document of the person's workspace is opened or written by it.

---

### User Story 6 - Debug a tool's logic in the desktop host (Priority: P3)

A tool engineer whose operation does the wrong thing sets a breakpoint in a script function or an operation of the `.atd`, performs the gesture in the desktop host, and steps through the logic: they see the values of variables and of the elements involved, the commands the transaction has collected so far, and how much of the step budget is used. They can step over, into and out, continue, and stop the gesture without changing the document.

**Why this priority**: logic written in a new language needs a way to be understood when it misbehaves, but tools can be built and checked without it.

**Independent Test**: for a tool type whose operation calls a script function, set breakpoints, step through a fixed gesture, and compare the observed variables, collected commands and budget with the expected ones.

**Acceptance Scenarios**:

1. **Given** a breakpoint in a script function, **When** a gesture calls it, **Then** execution stops at that line and the desktop host shows its locals, its arguments and the call stack back to the operation or hook.
2. **Given** a paused operation, **When** the tool engineer stops it, **Then** the transaction is discarded and the document and its file are as they were before the gesture.
3. **Given** a conditional breakpoint written as a CEL expression, **When** the expression holds, **Then** execution stops; otherwise it continues.
4. **Given** a paused hook or operation, **When** the tool engineer inspects the transaction, **Then** they see each command collected so far in order, as it will be applied.

---

### User Story 7 - Read formats with a grammar declaratively (Priority: P3)

A tool engineer whose tool reads a format with a context-free syntax (Turtle, SPARQL, Structurizr DSL) writes that format's grammar in the same notation as the ADP tool language, inside the binding, and maps its parse-tree nodes to elements and relations as they map YAML or XML entries today. No persistence plugin is written.

**Why this priority**: it removes the largest group of persistence plugins, but the language is complete without it, since a capability can still read such a format.

**Independent Test**: bind Turtle with the grammar family, read and edit the W3C RDF tool's fixtures through it, and compare readings and splices with the fixtures of today's plugin.

**Acceptance Scenarios**:

1. **Given** a binding with a grammar, **When** a body is read, **Then** elements and relations are read from the parse tree, and text the binding does not map is kept byte for byte.
2. **Given** an edit to an element read through a grammar, **When** it is written, **Then** only the bytes of that element's splice change, and the edit undoes exactly.
3. **Given** a body that does not parse, **When** it is read, **Then** reading does not fail: the parts that parse are read and the rest is a finding at its line, as FBL requires of every family.

---

### User Story 8 - AI agents write valid tool descriptions (Priority: P3)

An AI agent asked to create or change a tool type is given the published grammar and the language's examples, produces an `.atd` that parses by construction, and corrects it from the checker's findings, which it reads as data.

**Why this priority**: collaboration between humans and agents is one of ADP's subjects and one of the ways it is built; the language should be at least as easy for an agent to write as today's JSON.

**Independent Test**: give an agent the grammar, two examples and the description of a new tool type, constrain its output to the grammar where the model service allows it, and count the rounds until the checker reports no findings.

**Acceptance Scenarios**:

1. **Given** the published grammar, **When** it is given to a model service that constrains generation to a context-free grammar, **Then** the service accepts it without change.
2. **Given** a description with findings, **When** the checker is run with machine-readable output, **Then** each finding carries its code, severity, file, line, column, message and suggested fix as data.

---

### Edge Cases

- A tool type is available both as an `.atd` and as `.dis`/`.des`/`.fbl`: in phase 1 every host runs it from the JSON files and ignores the `.atd` when loading tools.
- A word that is a keyword in one module (`label`, `create`, `default`) is used as a name in another: the grammar accepts it where a name is expected.
- A later version of the language adds a keyword that an existing description uses as a name: the existing description still checks under its declared version.
- A description declares a language version the reader does not know: it is refused with a finding naming both versions, never read as the nearest one.
- A script uses something the language forbids (a clock, randomness, a file, unordered iteration): it is refused at check time, not when it runs.
- A script function recurses past its bound or loops past its limit: the call stops with a finding, and nothing is applied.
- A tool description names a capability the running host does not provide: the tool still opens, the gestures that need the capability are refused with a reason, and a finding says which capability is missing.
- A description is split over several files that import each other in a cycle: the checker reports the cycle once.
- The same description is checked on hosts whose regular-expression engines differ: tokens are the same, because the grammar's terminals use only the portable subset the language specification defines.
- A formatter meets a file that does not parse: it changes nothing and says why.
- A rename meets a name that also occurs inside a CEL expression or a string: CEL uses are renamed, string contents are not.
- The debugger pauses inside a hook that runs as part of another operation's transaction: stopping discards the whole transaction.
- A grammar in a binding is ambiguous or not LALR(1): the binding is refused at check time with the conflict named.

## Requirements *(mandatory)*

### The language

- **FR-001**: The ADP tool language **MUST** be specified in this repository as a specification of its own, beside DISL, DESL, EDSL and FBL, with a normative document, a machine-readable grammar, a JSON Schema for its parsed tree and worked examples, as the constitution's Principle II requires.
- **FR-002**: The language **MUST** be defined by one grammar, written in Lark notation, that builds as LALR(1) in strict mode with no conflict of any kind. The grammar **MAY** be split into modules that compose into one table.
- **FR-003**: The grammar **MUST** cover every construct of DISL, DESL and FBL at their current versions, and the constructs an editor needs (the editors the hosts implement at the reference commits), so that every specification and binding in this repository can be written in it.
- **FR-004**: The grammar **MUST** state each concept that DISL and DESL both define (element types, attributes, ids, findings, constraints, operations, hooks, actions, localized text, documentation, origin, extension settings) once, in a core shared by every kind.
- **FR-005**: A tool description **MUST** declare its language version and its kind in its first construct, and a checker **MUST** admit only the constructs that kind allows.
- **FR-006**: Every value position **MUST** follow one rule: a bare word, number or quoted string is a literal; an expression is CEL; a reference to an attribute, a theme token or a parameter has its own marker. The four ways DISL embeds CEL today **MUST NOT** survive in the language.
- **FR-007**: Expressions **MUST** be CEL, as the constitution's Principle III requires. The grammar **MUST** contain CEL's expression syntax, so that expressions are parsed, coloured and checked as part of the description rather than as opaque text.
- **FR-008**: A word that spells a keyword **MUST** be usable as a name wherever the grammar expects a name.
- **FR-009**: The grammar's terminals **MUST** use only a portable subset of regular expressions that the language specification defines, so that every host tokenizes the same text the same way.
- **FR-010**: The language specification **MUST** define the static semantics the grammar cannot state: name resolution and namespaces, imports between files of one description, inheritance, the type check of every expression in its context, and the checks across model, surface and binding.
- **FR-011**: The open vocabulary of settings (strokes, fonts, layout options, persistence details, extension `x-` keys) **MUST** be written in one uniform `key: value` form and checked against the JSON Schema, not fixed in the grammar.
- **FR-012**: A tool description **MAY** be split over several `.atd` files, one of which is its root and imports the others.

### The script

- **FR-013**: The language **MUST** include a script for logic, whose expressions are CEL and which adds only local variables, conditionals, loops with an explicit limit, local lists and maps, functions with bounded recursion, and the action set of DISL and DESL as statements.
- **FR-014**: A script **MUST** be deterministic: no clock, randomness, file, network, environment or host access; iteration in a defined order; numbers with defined arithmetic and formatting. A checker **MUST** refuse a script that uses anything else.
- **FR-015**: Every script call **MUST** run under a step budget the language specification defines, and a call that exceeds it **MUST** stop with a finding and change nothing.
- **FR-016**: A script **MUST NOT** change a model except through the action set, inside the transaction of the gesture that called it, so that every change stays one command with an exact undo.
- **FR-017**: Script functions **MUST** be callable from every expression position, from operations, hooks, constraints, derived attributes, labels and binding rules.
- **FR-018**: The language **MUST** let a tool description name a capability, with its inputs and outputs, and the language specification **MUST** list the capabilities the platform provides, each with its contract and conformance fixtures.
- **FR-019**: The script **MUST NOT** be an embedded general-purpose language; the research's comparison of Lua, Starlark, JavaScript, Rhai and FBL is recorded in the plan's research as the reason.

### Tool descriptions

- **FR-020**: Every tool type in scope (Q2) **MUST** get a tool description in this repository, in `definitions/` beside its existing files, which stay as they are.
- **FR-021**: A tool description **MUST** contain everything its specification, binding and companion file state, and every behaviour the hosts implement in code for that tool type at the reference commits, as constructs, script functions, binding rules or named capabilities.
- **FR-022**: What a description leaves to a host **MUST** be only what the language specification lists as a host's concern (rendering, gestures, text measurement, file dialogs, opening links, the host's undo stack), and each such item in a companion file **MUST** be marked as such with its reason.
- **FR-023**: Each tool description **MUST** come with a trace that names, for each behaviour taken from host code, the host files it was read from at the reference commit and the part of the description that now states it.
- **FR-024**: Each tool type in scope **MUST** have conformance fixtures, recorded from the reference host, of its readings, findings, splices and drawings for a fixed set of documents and edits.
- **FR-025**: `docs/tools.md` in each host that lists the tool type, and the site's catalogue sources, **MUST NOT** need to change because a tool description exists; a tool description changes no tool type's display name or origin.

### Normative form and machine edits

- **FR-030**: The `.atd` text **MUST** be the normative form of a tool description (Q1). Its parsed tree **MUST** also be described by a JSON Schema, as the constitution's Principle II requires of every format; that tree is not an interchange form.
- **FR-031**: In phase 1 the `.dis`, `.des` and `.fbl` files **MUST** remain the ones every host runs, and this feature **MUST NOT** convert, rewrite or retire them.
- **FR-032**: There **MUST** be a formatter that writes an `.atd` in one canonical layout, keeps every comment with its construct, and is idempotent.
- **FR-033**: A change that edits an `.atd` by machine (a refresh procedure, an agent, a rename) **MUST** be possible as splices that leave the rest of the file byte for byte as it was.

### Validation runtime in the desktop host

- **FR-040**: The desktop host **MUST** be able to run every tool type in scope from its `.atd` alone, with no code of its own for any of them, in order to validate and debug the description; it **MUST NOT** replace the tools the desktop host runs today (Q1, Q3).
- **FR-041**: Validation **MUST** compare a description's readings, findings, splices and drawings with its conformance fixtures, every write byte for byte, and report each difference at the construct that causes it.
- **FR-042**: Validation **MUST** work on working copies only and **MUST NOT** write a person's files.
- **FR-044**: The desktop host **MUST** take up a changed tool description without a restart, keeping the last result of a description that checked clean when a new version fails.
- **FR-043**: The desktop host's runtime of the language (parser, checker, CEL, script, binding engine) **MUST** be usable as a library by the desktop host's language server, so that the two report the same findings.

### Language servers

- **FR-050**: Language servers following the Language Server Protocol **MUST** serve `.atd` files in VS Code, in IntelliJ and in the desktop host; the desktop host's is written in Rust.
- **FR-051**: Each language server **MUST** offer: semantic colouring, completion aware of the description's own names and of what each position admits, go to definition, find references, renaming across all files of a description, diagnostics while typing, hover with the documentation of the construct and of the tool's own declarations, document formatting, and an outline of the description.
- **FR-052**: Highlighting grammars for editors that colour by tokens **MUST** be generated from the language's grammar, and **MUST** be checked against the language's examples.
- **FR-053**: A language server **MUST** keep working on a file with syntax errors, recovering at the next construct.
- **FR-054**: For the same text, every language server **MUST** report the same diagnostics as the checker of FR-010.

### Editor in VS Code

- **FR-060**: The VS Code host **MUST** offer a command that creates a new tool description of a chosen kind, origin and name, which checks without findings.
- **FR-061**: The VS Code host **MUST** open `.atd` files with the language support of FR-051, and **MUST** show the checker's findings for every file of a description in its problems list.
- **FR-063**: The VS Code host **MUST** offer the same validation of a tool description against its conformance fixtures as the desktop host (FR-041), with the same results, on working copies only; it **MUST NOT** run a person's documents from `.atd` (Q3).

### Debugger in the desktop host

- **FR-070**: The desktop host **MUST** offer a debugger for the logic of a tool description: breakpoints in script functions, operations, hooks and binding rules; conditional breakpoints written in CEL; step over, into and out; continue; and stop.
- **FR-071**: While paused, the debugger **MUST** show the locals and arguments of each frame, the call stack back to the gesture, the elements involved, the commands the transaction has collected, and the step budget used.
- **FR-072**: Stopping a paused gesture **MUST** discard its transaction and leave the document and its file unchanged.

### The grammar family of FBL

- **FR-080**: The binding part of the language **MUST** admit a grammar family, in which a binding carries an LALR(1) grammar in the same notation and maps parse-tree nodes to elements, relations and attributes, with insert and remove templates for writing.
- **FR-081**: The grammar family **MUST** keep FBL's guarantees: reading never fails on content, unmapped text is kept byte for byte, every edit is a minimal splice with an exact undo, and two hosts write the same bytes.
- **FR-082**: The W3C RDF tool type's Turtle reading **MUST** be bound with the grammar family as the first instance, matching the fixtures of today's reader.

### Agents

- **FR-090**: The grammar **MUST** be published in a form that a model service constraining generation to a context-free grammar accepts.
- **FR-091**: The checker **MUST** offer machine-readable findings: code, severity, file, line, column, message and suggested fix.

### Conformance, versioning and documentation

- **FR-100**: The Build workflow of this repository **MUST** build the grammar in strict LALR(1) mode, check every `.atd` in the repository and every example of the language specification.
- **FR-101**: The language **MUST** be versioned as Principle IV requires; a reader **MUST** read a description with the grammar of its declared version.
- **FR-102**: Every published tool description **MUST** be checked with every new version of the grammar before that version is released.
- **FR-103**: `docs/terminology.md` **MUST** define the ADP tool language, tool description, script and capability before any other document uses them, in the same change that introduces them.
- **FR-104**: A guide for tool engineers **MUST** show how a tool type of each kind is written in the language, with the mind map, a designer and an editor as worked examples.

### Key Entities

- **ADP tool language**: the one language of every tool type, its grammar, its static semantics, its script and its JSON Schema, versioned as one specification.
- **Tool description**: one tool type written in the language, in one or more `.atd` files with one root; has a kind, an origin, a version and the language version it is written in.
- **Grammar module**: a part of the grammar (the core, one per kind's surface, the binding, the script) that composes into the one grammar.
- **Script function**: a named, typed, bounded unit of logic in a tool description.
- **Capability**: a named algorithm the platform provides, with a contract and fixtures, that a tool description calls.
- **Conformance fixture**: a document, a set of edits and the readings, findings, splices and drawings the reference host produced for them.
- **Trace**: for one tool description, the list of host behaviours it states, each with the host files it was read from.
- **Language server**: an implementation of the Language Server Protocol for `.atd`, one per IDE family, all reporting the checker's findings.
- **Debug session**: one paused or running gesture in the desktop host's validation, with its frames, its transaction and its budget.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The grammar builds with zero conflicts, and stays so on every pull request.
- **SC-002**: No `.dis`, `.des` or `.fbl` file in this repository, and no host's tool loading, is changed by this feature.
- **SC-003**: Every tool type in scope has a tool description that checks without findings, and 100 % of the items its companion file lists are traced to a part of the description or marked as a host's concern.
- **SC-004**: The validation in the desktop host and in VS Code runs every tool type in scope from its `.atd` with no tool-specific code, and 100 % of their conformance fixtures pass in both, every write byte-identical to the reference host's.
- **SC-005**: For a fixed walk of 30 edits per IDE, VS Code, IntelliJ and the desktop host give the expected completion, diagnostic, hover, rename and formatting result in 30 of 30, with identical diagnostics across the three.
- **SC-006**: Diagnostics appear within one second of a keystroke, and completion within half a second, on a tool description of 5,000 lines.
- **SC-007**: A tool engineer new to the language creates a working tool type of each kind in VS Code in under 30 minutes, following the guide of FR-104.
- **SC-008**: A tool engineer finds the cause of a seeded defect in a script function with the debugger in under 10 minutes, in three of three seeded defects.
- **SC-009**: Given the grammar and two examples, an agent produces a tool description for a new tool type that checks without findings within three rounds of findings, in at least four of five trials.
- **SC-010**: The W3C RDF tool type reads and writes its Turtle fixtures through the grammar family with no persistence plugin, all fixtures passing.

## Assumptions

- Q4 is answered as recommended until the maintainer chooses otherwise; each answer changes only the requirements it names.
- The desktop host (spec 030) is far enough to host a runtime of the language: it opens workspaces, runs the tools of the standalone host and has a canvas, forms and editors to draw what a description declares.
- "Custom scripting as per this research" means the research's recommendation: a bounded, deterministic script designed into the grammar, with CEL as its expressions, rather than an embedded language.
- Lark is used as the notation of the grammar and as the tool that checks it; no host depends on Lark at run time.
- EDSL and EDD are placeholders today; the editor module of the grammar is written from what the hosts' editors do, and EDSL's specification is written from it rather than separately.
- A tool description does not replace DID or DED: tools keep storing documents in them, reached through bindings.
- The standalone host, the Notion add-on and the Eclipse host adopt `.atd` in features of their own; this feature changes none of them, apart from the IntelliJ and VS Code hosts receiving language support, and VS Code the editor, which do not change how any tool runs there.
- Capabilities are written by the platform, not by tool engineers, and are added through this repository's specification process.
- The plan decides how the language servers are built, including whether VS Code and IntelliJ share one implementation; the requirement is only that they behave the same (FR-054).
- The research's other conclusions (one runtime written once for every host, the capability library as compiled code) are directions for later phases; this feature builds the runtime once, in the desktop host, for validation and debugging.
