# Research: Format Binding

The evidence for these decisions is the persistence of the 25 diagram specifications in `definitions/diagrams/` and their companion notes, surveyed on 2026-09-30 and recorded per definition in [inventory.md](inventory.md), plus DISL section 11 and 13 as they stand on `develop` at `e908a19`.

## R1. A sibling language, named FBL

- **Decision**: a new specification, FBL, the Format Binding Language, in `specifications/fbl/` with `FBL-specification.md`, `fbl.schema.json` and `*.fbl` examples; version key `"fbl": "0.1"`; `$id` `https://etalii.net/adp/fbl/schema/0.1/fbl.schema.json`. FBL documents are JSON, like DISL specifications.
- **Rationale**: Peter's default was a folder beside DISL. A binding is shared by several specifications (six C4 types, four W3C types), so it cannot live inside one of them; and designers and editors will need the same thing (FR-004). JSON keeps one parser and one validator for all specification-side documents.
- **Alternatives considered**: a DISL section (rejected: DISL is per tool type, a binding is per format); YAML documents (rejected: DISL is JSON, and a second serialization for tool engineers buys nothing); the name "TBL, Text Binding Language" (rejected: folder subjects are not text, and "format" is the word the gaps summary and DISL 11.2 use).
- **Constitution impact**: the Structure and Naming section lists the six tool languages and nothing beside them. FBL is a cross-cutting language, so the section gains one sentence for it; a MINOR amendment through `/speckit-constitution` (materially expanded guidance), done in this feature.

## R2. The seam with DISL: one property, `persistence.binding`

- **Decision**: DISL's `persistence.format` gains the value `"fbl"`, and `persistence` gains `binding`: a URI reference to an FBL binding (`<uri>#<name>` when a file holds several). When `format` is `"fbl"`, DISL's own writer settings (`files`, `indent`, `newline`, `ordering`, `omitDefaults`, `precision`, `canonical`) do not apply, because the body is not a DID definition; `ids`, `view`, `migrations` and `collaboration` keep their meaning where the binding does not say otherwise.
- **Rationale**: FR-003 allows exactly one hook. A reference rather than an inline binding lets families share one binding (FR-052).
- **Alternatives considered**: `format: "plugin:…"` with a standard plugin (rejected: it hides a declarative thing behind the plugin mechanism and keeps the "required plugin" refusal of DISL 13.1); an inline binding only (rejected by FR-052). A small inline binding is still allowed: `binding` MAY be an FBL object instead of a reference.
- **DISL 0.2**: feature 004 may move DISL to 0.2; the hook lands in whichever DISL version is current when this feature merges. Agreed with the 004 session: this feature owns the §11 hook and nothing else in §11 except what 004 needs for identifiers (§11.5).

## R3. One architecture: claims, body, reader, rules

- **Decision**: every binding has the same four parts. **Claims** say which files it takes (routing, R10). **Body** says whether the model is one file or a folder (R9). **Reader** is either `declared` (the rules of one of five format families) or a persistence plugin under the written contract (R11). **Rules** map the file's structure to elements, relations and attributes, and say how each is written back. Registration, several readings, templates, undo and drift are host behaviour defined once by FBL, identical whichever reader is used.
- **Rationale**: the survey shows that even the formats that must stay plugins (Turtle, MSBuild, SPARQL, the Ansible and Helm folder readers) need the same claims, registration, template, undo and drift behaviour as the declarable ones. Putting the plugin *inside* the binding, at the reader, turns 24 implicit contracts into one and gives plugins registration and several readings for free (FR-082).
- **Alternatives considered**: plugins outside FBL entirely (rejected: every plugin would re-implement registration and undo, which is what happens today).

## R4. Five format families, each with a lossless reading

- **Decision**: FBL 0.1 defines five families: `yaml` (YAML 1.2, block style writable, flow collections replaced whole), `json` (RFC 8259), `xml` (XML 1.0, no DTD processing), `lines` (one statement per line, matched by regular expressions) and `blocks` (lines plus `{`/`}` nesting, for the Structurizr DSL and similar). For each, FBL defines normatively a **lossless reading**: a tree of nodes in which every byte of the file belongs to exactly one node or to the trivia (whitespace, comments) owned by one, with the span of every node. Rules and splices are defined against that tree, never against an implementation's parser.
- **Rationale**: byte-preservation (FR-020) and identical output across hosts (FR-025) are only testable if the unit a splice replaces is defined by the specification. The families are exactly the ones the survey found: YAML/JSON trees (databricks ×3, azure, timeline, dgr, fdg, ghg), XML (mindmap, `.slnx`), line grammars (cld, owm, `.sln`), and one block DSL (Structurizr).
- **Alternatives considered**: a general grammar formalism (PEG, tree-sitter) bound by rules (rejected by principle V: no current tool needs more than five shapes, and a grammar language would have to be implemented four times too); YAML via a round-tripping library's behaviour (rejected: libraries differ, and FR-025 needs one answer).

## R5. Rules are direct mappings; CEL only decides

- **Decision**: a writable attribute is bound to exactly one place in the file (a key, an XML attribute, a regular expression group, a child's text) and is written back there. CEL (principle III) is used for conditions (`when`), read-only computed values and ids (per DISL 0.2's `cel` strategy), never for a value that must be written back. Anything bound only through CEL is read-only, with a reason (FR-011).
- **Rationale**: a CEL expression cannot be inverted, so allowing it on the write path would make write-back undefined.
- **Alternatives considered**: paired read/write expressions (rejected: two expressions that must be each other's inverse cannot be checked, and the survey found no write that needs one).

## R6. Regular expressions: RE2's common subset with `(?<name>…)` groups

- **Decision**: `lines` and `blocks` rules use regular expressions in the subset of RE2 syntax that .NET, Java, JavaScript and RE2 (hence CEL's `matches`) read alike: no backreferences, no lookaround, named groups written `(?<name>…)`. A rule's written value spans are its named groups.
- **Rationale**: four host languages must match the same bytes. RE2 is already the regex dialect of CEL, which the constitution mandates.
- **Alternatives considered**: a bespoke token grammar (rejected by principle V).

## R7. A fixed splice catalogue with defined formatting of new text

- **Decision**: eleven named splice operations (data-model.md, "Splice operation") cover every write the survey found. New text follows the file's conventions observed at the insertion point, by fixed inference rules (indentation of the previous sibling, else of the parent plus the binding's default; line ending of the adjacent line, else the file's dominant one, else the binding's default; YAML scalar style of the value replaced, else plain when safe, else double-quoted; numbers in their shortest round-trip form unless the attribute declares a format; written precision of a replaced time kept).
- **Rationale**: FR-022, FR-023 and FR-025. Each rule is taken from a working plugin (the dgr quoting rule, the azure newline rule, the timeline precision rule, the databricks JSON comma surgery).
- **Alternatives considered**: canonical re-emission of the whole entry (rejected: it rewrites bytes the user did not touch). One exception is kept deliberately: a `lines` rule whose changed attribute has no group in the current line re-emits that line from the rule's `emit` template, as the causal-loop plugin does.

## R8. Undo is inverse splices; drift is a whole-document comparison

- **Decision**: an edit is recorded as its splices with the bytes they replaced and the digest of the document after the edit. Undo applies the inverse splices, redo the splices, each only when the document is byte-identical to the one the edit left; otherwise the host refuses with the reason "the file has changed since", offers to reload, and writes nothing. A binding MAY mark an operation `undo: "snapshot"`, which records the whole document instead. After an external change is reloaded, the history of that body is cleared.
- **Rationale**: FR-030, FR-031. A whole-document comparison is simpler and stricter than comparing affected ranges, and every plugin in the survey already refuses on any drift ("…changed too much since then…").
- **Alternatives considered**: range-local drift checks (rejected: harder to specify identically in four hosts, and it lets an undo land in a file whose meaning changed elsewhere).

## R9. Folder subjects: recognition, file rules, a settle delay

- **Decision**: `body.kind: "folder"` with `recognise` (patterns that must, may or must not be present), `files` (glob patterns, each read by a file-level binding or by the plugin reader), `ignore`, and `settle` (milliseconds, default 400, the Ansible and Helm value). Folder subjects are read-only unless a file rule declares writes. Reparse points (links) are not followed.
- **Rationale**: FR-060 to FR-063; the survey shows recognition is declarable for all three folder tools, while relation resolution in Ansible and Helm and MSBuild evaluation in .NET need code, which is why FBL lets a folder use the plugin reader.

## R10. Routing: claims with shared extensions and markers

- **Decision**: `claims` lists `extensions`, `names`, whether the extension is `shared`, a `marker` (a root key, a first-line prefix, or a regular expression over the first lines) required when shared, `suggest` (substrings that make the host propose the marker, or propose the reading when the body is claimed through a registration only), and `registrationOnly` (never claim a bare file). Two bindings that both claim a bare file are both offered (spec edge case).
- **Rationale**: FR-070 to FR-072; these are exactly the `x-adp` routing keys found (`claimsBareFiles`, `sharedExtension`, `suggestWhenBodyContains`, `documentExtensions`, `subject: folder`).

## R11. The plugin contract is data-in, data-out; the host owns the bytes

- **Decision**: a persistence plugin implements four operations, stated language-neutrally: `read` (bytes or a folder listing → elements, relations, attribute values, the source span of each, and findings), `plan` (a model change → splices, or a refusal with a reason), `template` (parameters → bytes) and optionally `watch` (the paths it depends on). The host, not the plugin, applies splices, keeps undo, checks drift, stores view data and routes. A plugin reports findings with DISL 0.2's source location.
- **Rationale**: FR-080 to FR-082. Keeping bytes, undo and drift in the host makes every plugin-backed body behave like a bound one and means these rules are implemented once per host, not once per plugin per host. The .NET notes' complaint (a plugin cannot report problems) is answered by `read` returning findings.
- **Expected plugins** (FR-083): Turtle/N-Triples projection (W3C ×4), SPARQL, MSBuild and solution evaluation (.NET), the Ansible and Helm folder readers, and the Azure Pipelines template expansion.

## R12. The registration keeps its line form

- **Decision**: FBL adopts the `.adp` registration as the survey found it: line 1 is the language id (or an alias the binding lists); then header lines `key: value` (`body`, `view`, `resource`, plus headers a binding declares, such as SKOS's `language`); then an optional `layout:` block of `  <id>: <x> <y>` lines, sorted by id, numbers in `0.###` form, removed when empty. The id is everything before the last `: `. The registration is written by the same splice rules as a body. The logical content of a registration is also described by `$defs/Registration` in `fbl.schema.json`, and the example validator parses `*.adp` examples into it.
- **Rationale**: FR-040 to FR-046 and SC-005: existing users' registrations keep working unchanged. Principle II needs a schema for every format the document defines; the line form cannot be a JSON document, so the schema describes its parsed form.
- **Legacy forms read**: the C4 `{base}.layout.json` (view key → id → `{x, y}`) is read, and written back where it was read from; the Wardley `{name}.identities.json` is read as the id sidecar of DISL 0.2's name-keyed strategy. Neither is created for a new diagram.
- **Alternatives considered**: a JSON registration (rejected: breaks every existing `.adp`); the 8-line header limit of today's readers (dropped: the header region ends at the first line that is not a header, which is simpler and reads every existing file the same).

## R13. Several readings share a body key and one binding

- **Decision**: a host keys an open model by the body's canonical path and the binding's name. Every reading of the same body MUST use the same binding; a language whose binding differs from the one a body is already open with opens it read-only, with a reason. One undo stack per body.
- **Rationale**: FR-050 to FR-053. The C4 and W3C families already share one plugin each; FBL makes the sharing explicit through the binding reference.

## R14. Proof: fixtures checked for consistency in CI

- **Decision**: round-trip fixtures live in `specifications/fbl/fixtures/<name>/`: the input file, and a `fixture.json` (validated against `$defs/Fixture`) listing each edit as the model change, the splices it must produce (byte ranges and new text), and the expected document after each edit and after each undo. The example validator checks every fixture's schema and its self-consistency: applying the recorded splices to the input gives the expected bytes, and applying their inverses gives the input again. Hosts run the same fixtures against their implementations.
- **Rationale**: FR-005, SC-001, SC-002. A reference engine in this repository is not justified yet (principle V); consistency checking catches wrong fixtures, and the fixtures are what make the hosts agree.
- **Alternatives considered**: a Python reference implementation of FBL (deferred: a later feature once the language settles).

## R15. What the definitions become

- **Decision**: [inventory.md](inventory.md) records, per definition, whether it becomes a declared binding (15 of the 24 plugin-backed ones, plus the timeline, which has no plugin: C4 ×6, databricks ×3, causal-loop, dependency graph, functional decomposition, hype cycle, mindmap, Wardley), a folder or file binding with a plugin reader (8: W3C ×4, SPARQL, .NET, Ansible, Helm), or a declared binding with a plugin reader for part (Azure: its template expansion). Rewriting the definitions is follow-up work.
- **Rationale**: FR-091, SC-003 (at least half: 15 of 24).
