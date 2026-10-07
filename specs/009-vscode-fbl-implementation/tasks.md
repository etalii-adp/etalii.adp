# Tasks: A Generic FBL Implementation for Visual Studio Code

**Input**: [plan.md](plan.md), [vscode-fbl-implementation.spec.md](vscode-fbl-implementation.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/library-api.md](contracts/library-api.md), [contracts/test-baseline.md](contracts/test-baseline.md), [contracts/corpus.md](contracts/corpus.md), [quickstart.md](quickstart.md)

**Tests**: requested. FR-023 requires every test to be written before the behaviour it covers and seen to fail first, so every phase lists its tests before its code. A test task is done when its file is committed, in a commit whose message names the tests as failing, and the failure was seen.

**Organization**: by user story. The library is not usable in parts (research R17), so the reading half is Phase 2 and blocks every story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: the user story of the specification a task serves (US1 to US4)

## Path conventions

- Every path starts with its repository. The clones sit side by side (`C:\git\<repository>` locally, `/home/user/<repository>` in a cloud session).
- All code lands in `etalii.adp.ide.vscode`, on the branch `features/009-vscode-fbl-implementation`, in its own worktree, in one pull request (pull request 1 of the plan).
- **The source** is `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/` at commit `25fc7b4a`, and **the source's tests** are `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/` at the same commit. Read both with `git -C ../etalii.adp.ide.standalone show 25fc7b4a:<path>`, never from the working tree, which may be on another commit.
- **FBL** is `etalii.adp/specifications/fbl/FBL-specification.md`. Where the source and FBL disagree, FBL decides, and the difference is added to `etalii.adp.ide.vscode/docs/fbl.md` (research R1).
- Every sentence a user or a test can see is taken verbatim from the source and kept in `etalii.adp.ide.vscode/src/core/fbl/messages.ts` (research R10). Every port task adds its sentences there.
- Nothing under `etalii.adp.ide.vscode/src/core/fbl/` imports `vscode`, a browser global, `src/core/text`, `src/core/registration` or a diagram type, or names a tool type, an origin or a binding of the corpus (FR-001, research R2).

> **Ticking**: a task whose code lands in `etalii.adp.ide.vscode` is ticked here only after pull request 1 is merged (T074), never when the code is written or pushed. The tasks of `etalii.adp` itself (T001, T072, T074) are ticked when done.

---

## Phase 1: Setup (the corpus and the skeleton)

**Purpose**: plan step 1. The copied files, the two lists a test checks, the lint rules and the measurement SC-007 needs.

- [X] T001 In `etalii.adp`, commit `etalii.adp/specs/009-vscode-fbl-implementation/` (specification, plan, research, data model, contracts, quickstart, this file) on `features/009-vscode-fbl-implementation`, push it and open pull request A into `develop`, merged with a merge commit
- [X] T002 In `etalii.adp.ide.vscode`, create the worktree `etalii.adp.ide.vscode/.claude/worktrees/009-vscode-fbl-implementation` on a new branch `features/009-vscode-fbl-implementation` from `origin/develop` (`f0f9cf1` or later); run `npm ci` and `npm test` there and confirm they pass before anything changes
- [X] T003 [P] Create `etalii.adp.ide.vscode/docs/fbl.md` with the headings of contracts/corpus.md, "Documentation that changes" (what the library is; class and families; where the copies come from; not implemented; differences from standalone; open questions and divergences; duration of the unit tests), and record under the last one how long the "npm run test:unit" step took in the last Build run on `develop` before this branch, with the run's link (research R18)
- [X] T004 [P] Create `etalii.adp.ide.vscode/test/core/fbl/realFiles/corpus.ts` with the recorded minimums of contracts/corpus.md as data: `timeline` 15, `causal-loop` 4, `mindmap` 5, `structurizr` 16, `databricks-job` 4, `databricks-pipeline` 2, registrations 181, chart folders 13, Turtle 33, each with its binding reference and file selection. If `sync-fbl.mjs` cannot import a `.ts` file under Node 22 without a flag, keep the numbers in `etalii.adp.ide.vscode/test/core/fbl/realFiles/minimums.json` and have `corpus.ts` and the script both read it, so they are written once
- [X] T005 Write `etalii.adp.ide.vscode/scripts/sync-fbl.mjs` as contracts/corpus.md, "`scripts/sync-fbl.mjs`" says: two clone paths and two optional refs defaulting to `origin/develop`; every file read with `git show <commit>:<path>` as bytes and never from a working tree; `conformance/` and `real-files/` emptied first; the selection rules for real files, leaving out any path with a segment `Conformance`, `node_modules`, `bin` or `obj`; a count printed for each kind and a failure below its minimum (T004); `manifest.json` (data-model.md, "Manifest") and `PROVENANCE.md` written last. Add the script `sync-fbl` to `etalii.adp.ide.vscode/package.json` and nothing else there
- [X] T006 [P] Add `fixtures/fbl/PROVENANCE.md text` and `fixtures/fbl/manifest.json text` to `etalii.adp.ide.vscode/.gitattributes`, below the existing `fixtures/** -text`
- [X] T007 Run `npm run sync-fbl -- ../etalii.adp ../etalii.adp.ide.standalone 30206eaf29bc33b4af9aa0ecddc88584d24b9499 25fc7b4af7a99989d23d75d1af9d844303243b9d` and commit `etalii.adp.ide.vscode/fixtures/fbl/` (eight bindings, eight fixtures, six registrations; about 300 real files). Check each real file's origin: a third-party notice standalone carries for any of them is copied with it and named in `etalii.adp.ide.vscode/fixtures/fbl/PROVENANCE.md` (research R14)
- [X] T008 [P] Add two rules to `etalii.adp.ide.vscode/eslint.config.mjs`: for `src/core/**`, no import of a `node:` module except in `src/core/fbl/files/nodeFiles.ts` and `src/core/fbl/history/digest.ts`; for everything but `src/core/fbl/**`, `src/extension/extension.ts` and `test/**`, no import of `**/core/fbl/**`
- [X] T009 [P] Create the test support in `etalii.adp.ide.vscode/test/core/fbl/support/`: the bytes of a file under `fixtures/fbl/`, a temporary folder removed after the test, the ids the fixtures name (port `Support/NaturalIds.cs` of the source's tests), the repository's root (port `Support/Repository.cs`), and a helper that creates a symbolic link or returns the reason the system refused, for `it.skip` with that reason
- [X] T010 Write `etalii.adp.ide.vscode/test/core/fbl/corpus.test.ts`: for every source of `fixtures/fbl/manifest.json`, "every file under a source's folder is listed and has the listed digest; nothing listed is missing". See it fail on a copy saved with other line endings, then restore the copy
- [X] T011 Write `etalii.adp.ide.vscode/test/core/fbl/baseline.json` with the 86 entries of contracts/test-baseline.md in the shape of data-model.md, "Test baseline" (`source`, `test`, and `file` with `title`, or `notApplicable` with the reason), and `etalii.adp.ide.vscode/test/core/fbl/baseline.test.ts`, which fails unless the list has "exactly the 86 names", "each entry has a counterpart or a reason, never both", "a counterpart's title occurs in its file", and `RealFiles/ModuleCrossCheck.Tests.cs` `TheBindingReadsTheIdsTheModuleReads` is the only entry not applicable. It stays failing until Phase 4 ends, which is its test-first failure

**Checkpoint**: `corpus.test.ts` passes; `baseline.test.ts` fails for want of counterparts; `npm run check` passes.

---

## Phase 2: Foundational (reading)

**Purpose**: plan step 2. Text, expressions, loading an FBL document, the family readers and the rule engine. Every user story reads a body, so nothing starts before this.

### Tests (first, seen failing)

- [X] T012 [P] Write `etalii.adp.ide.vscode/test/core/fbl/bodyText.test.ts`: the 6 counterparts of `Bytes/BodyText.Tests.cs` with the titles and case counts of contracts/test-baseline.md (`CrlfWinsATieAndALoneCrCountsAsNeither` is an `it.each` of 4)
- [X] T013 [P] Write `etalii.adp.ide.vscode/test/core/fbl/expressions.test.ts`: the 5 counterparts of `Expressions/Expressions.Tests.cs` with the source's tables (9, 3, 1, 9 and 3 cases)
- [X] T014 [P] Write `etalii.adp.ide.vscode/test/core/fbl/loading.test.ts`: the 9 counterparts of `Loading/Loading.Tests.cs` (2, 6 and 5 cases where the contract says so), and one more test, "every copied binding loads", an `it.each` over `fixtures/fbl/conformance/*.fbl` that expects no problem of severity `error`
- [X] T015 [P] Write `etalii.adp.ide.vscode/test/core/fbl/reading.test.ts` with the 8 counterparts of `Reading/Reading.Tests.cs` that need reading only: every title of the contract's table except "planning is deterministic", "an unknown registration header is kept and reported" and "a stale layout entry is reported and removed at the next write" (added in T034 and T046)
- [X] T016 [P] Write `etalii.adp.ide.vscode/test/core/fbl/regexDifferential.test.ts`: every regular expression of the eight copied bindings, over every line of every body under `fixtures/fbl/conformance/fixtures/` and `fixtures/fbl/real-files/`, gives the same match and the same group ranges through the library's matcher and through the platform's `RegExp` with the `d` flag (research R3); a guard asserts that expressions and lines were found

### Implementation

- [X] T017 [P] Create the values of contracts/library-api.md, "Values", in `etalii.adp.ide.vscode/src/core/fbl/span.ts`, `splice.ts` (with `applyEdit` and `inverseOf`), `finding.ts` and `model.ts`, porting `Span.cs`, `Splice.cs`, `Finding.cs` and `FblModel.cs` of the source, and start `etalii.adp.ide.vscode/src/core/fbl/messages.ts`. Offsets are UTF-8 byte offsets including a byte-order mark; "splices of one edit do not overlap, and those at one offset apply in listed order"
- [X] T018 Port `Text/BodyText.cs` to `etalii.adp.ide.vscode/src/core/fbl/text/bodyText.ts`: `bomLength` "3 when the file starts with a byte-order mark, else 0"; `invalidOffset` "the byte offset of the first invalid UTF-8 sequence, or none"; `dominantEnding` "the ending of most lines; CRLF on a tie with LF; a lone CR counts as neither; none when no line has one"; "a column counts code points and the byte-order mark belongs to none". T012 passes
- [X] T019 Port the parsing half of `Expressions/RegexSubset.cs` to `etalii.adp.ide.vscode/src/core/fbl/expressions/regexSubset.ts`: an expression in the common subset of FBL section 2.5 becomes a small tree, and each construct outside it is rejected by name. Accept the listed subset only, not what .NET compiles (research R16, Q7)
- [X] T020 Write `etalii.adp.ide.vscode/src/core/fbl/expressions/regexMatcher.ts`: a backtracking matcher over T019's tree that counts steps and gives up at a budget (default 1,000,000 for one match attempt), reports the UTF-16 range of every named group, and has the semantics of research R3: `\d` and `\w` ASCII only, `.` anything but LF, leftmost-first alternation, lazy quantifiers, `caseInsensitive` folding ASCII letters and nothing else (Q6). Exceeding the budget is no match and the finding `fbl.regex-timeout`
- [X] T021 Port `Expressions/Cel.cs` to `etalii.adp.ide.vscode/src/core/fbl/expressions/cel.ts`: tokenizer, recursive-descent parser and evaluator with a budget of 100,000 steps, the variables of FBL section 2.4 by context, and exactly the functions and macros of research R4; anything else fails to compile. `int` is a `bigint` and `double` a `number`; `matches` uses T020. Where the source strays from CEL (`size` of a string, `lowerAscii` and `upperAscii` on non-ASCII letters, `int` compared with `double`), do what CEL defines and add the difference to `etalii.adp.ide.vscode/docs/fbl.md`. T013 passes
- [X] T022 [P] Write `etalii.adp.ide.vscode/src/core/fbl/documents/jsonReader.ts`: a byte-level reader that accepts exactly RFC 8259 and keeps every member in document order, the raw text of every number, the span of every node, the comma of every entry and the JSON Pointer (RFC 6901) of every node (research R6)
- [X] T023 [P] Create `etalii.adp.ide.vscode/src/core/fbl/files/fblFiles.ts` (the `FblFiles` interface of contracts/library-api.md: `read`, `kind` that never follows a link, `list` in ordinal order, `ignoresCase`) and `etalii.adp.ide.vscode/src/core/fbl/files/nodeFiles.ts` (its implementation on `node:fs` and `node:path`; a link is anything `lstat` reports as a symbolic link)
- [X] T024 Port `Documents/FblModelTypes.cs` to `etalii.adp.ide.vscode/src/core/fbl/documents/types.ts`: the loaded document as typed values, with `attributes`, `map`, `byOrigin`, `readings` and `registration.headers` kept in document order
- [X] T025 Port `Documents/FblDocumentLoader.cs` to `etalii.adp.ide.vscode/src/core/fbl/documents/documentLoader.ts`: `loadDocument`, `loadDocumentAt` and `resolveReference` (FBL 14.1, steps 1, 2, 4, 5, 6), on T022. "A duplicate key is the only problem reported when one is found; another major version is refused at `/fbl`; a newer minor version loads with one warning; every other problem of steps 4 to 6 of section 14.1 is reported, not only the first." A load problem is `{pointer, severity, message}`. T014 passes
- [X] T026 Gate (plan, "Delivery"; research R16): run "every copied binding loads" and T016. If a copied binding does not load with the subset of T019 and the CEL of T021, or is touched by Q6 or Q7, stop and raise it in `etalii-adp/etalii.adp` before going on; do not edit the binding under `etalii.adp.ide.vscode/fixtures/fbl/conformance/` and do not widen the subset
- [X] T027 Port `Rules/FamilyReader.cs`, `Rules/Selector.cs` and `Rules/TreeFamily.cs` to `etalii.adp.ide.vscode/src/core/fbl/rules/familyReader.ts`, `selector.ts` and `treeFamily.ts`: entries, leaves and trivia, such that "every byte of a readable body belongs to a node or to trivia"
- [X] T028 [P] Port the reading half of `Files/Yaml/YamlParser.cs`, `FlowReader.cs` and `YamlFamily.cs` to `etalii.adp.ide.vscode/src/core/fbl/families/yaml/yamlParser.ts`, `flowReader.ts` and `yamlFamily.ts`: the spans of FBL section 4.3 come from this reader; the bundled `yaml` package answers only whether a body is well-formed (`uniqueKeys` off) and what its root keys are (research R5)
- [X] T029 [P] Port the reading half of `Files/Json/JsonFamily.cs` to `etalii.adp.ide.vscode/src/core/fbl/families/json/jsonFamily.ts`, on T022; the body is a JSON text by RFC 8259 and nothing more (research R6)
- [X] T030 [P] Port the reading half of `Files/Xml/XmlFamily.cs` and its `_Model/` to `etalii.adp.ide.vscode/src/core/fbl/families/xml/xmlFamily.ts`: a tokenizer over bytes that keeps carriage returns (FBL 4.5)
- [X] T031 [P] Port the reading half of `Files/Lines/LinesFamily.cs` to `etalii.adp.ide.vscode/src/core/fbl/families/lines/linesFamily.ts`, for `lines` and `blocks`
- [X] T032 Port `Rules/BodyReading.cs` to `etalii.adp.ide.vscode/src/core/fbl/rules/bodyReading.ts`, with the options and limits of data-model.md (`fileName` default `body`, `maxBodyBytes` 32 MiB, `maxEntries` 500,000, `regexSteps` 1,000,000, `deriveId`, `registrationHeaders`, `resource`, `identities`). "An entry becomes at most one element or relation, taken by the first rule in binding order whose `when` holds; an entry a rule matches and cannot read is `std.unreadableEntry` and its bytes are kept; a second equal id is `std.duplicateId` and not stored; an entry without an id is addressed by its place, `<rule>@<line>`, unless the caller derives one; a relation with an end that names nothing is `fbl.dangling-reference` and is not created." An unreadable body is the one finding `std.unparseable` that replaces all others. T015 passes

**Checkpoint**: T012 to T016 pass; every copied binding loads; `npm run check` passes.

---

## Phase 3: User Story 1 - Loading and saving are proven by the shared fixtures (Priority: P1) 🎯 MVP

**Goal**: plan step 3. Every edit is planned as FBL's splices, applied, recorded and undone, for a body and for a registration, so that the eight fixtures pass.

**Independent Test**: `npx vitest run test/core/fbl/corpus.test.ts test/core/fbl/conformanceFixtures.test.ts` passes with eight fixtures; writing LF where the body has CRLF makes `timeline-edits` fail (quickstart.md, section 1).

### Tests for User Story 1 (first, seen failing)

- [X] T033 [US1] Write `etalii.adp.ide.vscode/test/core/fbl/conformanceFixtures.test.ts`, porting `Conformance/ConformanceFixtures.Tests.cs`: "the fixtures are found" (eight, and failing on none), and `it.each` over the fixtures for "the fixture passes" (the `read` it lists, then every step's splices with operation, offsets and text, its document, its undo or redo, or its `refused` reason) and "every byte of the input belongs to the reading". A fixture whose input is an `.adp` is opened as a registration, any other as a body with the ids of T009
- [X] T034 [P] [US1] Add "planning is deterministic" to `etalii.adp.ide.vscode/test/core/fbl/reading.test.ts`
- [X] T035 [P] [US1] Write `etalii.adp.ide.vscode/test/core/fbl/yamlScalars.test.ts`: the 4 counterparts of `Yaml/YamlScalars.Tests.cs` with the source's tables (47, 2, 2 and 1 cases)
- [X] T036 [P] [US1] Write `etalii.adp.ide.vscode/test/core/fbl/history.test.ts`: the 5 counterparts of `History/History.Tests.cs`

### Implementation for User Story 1

- [X] T037 [US1] Port `Planning/_Model/` and `Planning/Plan.cs` to `etalii.adp.ide.vscode/src/core/fbl/planning/modelChange.ts` and `plan.ts`: a model change is one of `save`; `add {type, id?, attributes, parent?}`; `set {id, attributes}`; `remove {id}`; `place {id, x, y}`; `identify {key, id}`; a plan result is `planned` with an edit or `refused` with a reason
- [X] T038 [P] [US1] Port `Files/Yaml/YamlScalars.cs` to `etalii.adp.ide.vscode/src/core/fbl/families/yaml/yamlScalars.ts`. T035 passes
- [X] T039 [US1] Port `Planning/NewText.cs` to `etalii.adp.ide.vscode/src/core/fbl/planning/newText.ts`: new text follows the body's own conventions (FBL 6.3); `number: "shortest"` is `String(value)` for a double and the digits for an integer; `{decimals: n}` rounds the shortest decimal representation, halves away from zero, by digit arithmetic and not by `toFixed`, then drops trailing zeros and a trailing point, and `-0` is written `0`; `time: "keep-precision"` writes at most seven fraction digits (research R8)
- [X] T040 [US1] Port `Planning/EditPlanner.cs` to `etalii.adp.ide.vscode/src/core/fbl/planning/editPlanner.ts`: "a save plans no splice; a change that cannot be planned is refused whole and writes nothing; the same body, binding and change give the same splices". T034 passes
- [X] T041 [P] [US1] Port the writing half of `Files/Yaml/YamlFamily.cs` into `etalii.adp.ide.vscode/src/core/fbl/families/yaml/yamlFamily.ts`
- [X] T042 [P] [US1] Port the writing half of `Files/Json/JsonFamily.cs` into `etalii.adp.ide.vscode/src/core/fbl/families/json/jsonFamily.ts`
- [X] T043 [P] [US1] Port the writing half of `Files/Xml/XmlFamily.cs` into `etalii.adp.ide.vscode/src/core/fbl/families/xml/xmlFamily.ts` (`self-close` and `open-block` included)
- [X] T044 [P] [US1] Port the writing half of `Files/Lines/LinesFamily.cs` into `etalii.adp.ide.vscode/src/core/fbl/families/lines/linesFamily.ts` (`re-emit-line` and `open-block` included)
- [X] T045 [US1] Create `etalii.adp.ide.vscode/src/core/fbl/history/digest.ts` (SHA-256 from `node:crypto`) and port `History/SplicedFile.cs` and `History/EditHistory.cs` to `etalii.adp.ide.vscode/src/core/fbl/history/splicedFile.ts` and `editHistory.ts`: an entry holds the edit's splices, the bytes each replaced (or the whole body before it, for a snapshot) and the SHA-256 of the body before and after; `undo` applies the inverse splices only "when the bytes given (or held) have the entry's digest after the edit", "otherwise refuse with the drift sentence and write nothing"; `redo` "the same against the digest before the edit"
- [X] T046 [US1] Port `History/OpenBody.cs` to `etalii.adp.ide.vscode/src/core/fbl/history/openBody.ts`, as `OpenBody` of contracts/library-api.md, with the states readable, read-only ("every change is refused with the reason") and unreadable ("an empty model with one finding; never saved"); `change` plans, applies, records, clears the redo stack and reads again; `reload` replaces the bytes, reads again and clears both stacks; `save` throws for an unreadable or read-only body. T036 passes. Then add to `etalii.adp.ide.vscode/test/core/fbl/reading.test.ts` the two remaining counterparts, "an unknown registration header is kept and reported" and "a stale layout entry is reported and removed at the next write", and see them fail
- [X] T047 [US1] Port `Registration/RegistrationDocument.cs` and `Registration/OpenRegistration.cs` to `etalii.adp.ide.vscode/src/core/fbl/registration/registrationDocument.ts` and `openRegistration.ts`: origin, headers in order, the `layout` and `identities` blocks with the span of every entry, and what follows them kept as it is. "Layout entries are in the byte order of their ids, with numbers at three decimals at most; a header neither FBL nor the binding declares is kept and reported; a layout entry for an id the caller does not know is stale, reported, and removed with the next write; an ephemeral id is never stored." The two tests added in T046 pass
- [X] T048 [US1] Create `etalii.adp.ide.vscode/src/core/fbl/index.ts` with what exists so far of contracts/library-api.md (values, loading, text, bodies, `driftUndo` and `driftRedo`, `RegistrationDocument`, `OpenRegistration`, `FblFiles`, `nodeFiles`), then run T033 until all eight fixtures pass; a splice that differs from a fixture's is a fault of the port, to be found in the source, never a reason to change a fixture (SC-004)

**Checkpoint**: SC-001. All eight fixtures pass, and `reading.test.ts`, `yamlScalars.test.ts` and `history.test.ts` pass with them.

---

## Phase 4: User Story 2 - Every check standalone has, this host has (Priority: P1)

**Goal**: plan step 4. The rest of the baseline: finding a registration's body, legacy sidecars, routing, folder recognition, templates and the host's side of a plugin.

**Independent Test**: `npx vitest run test/core/fbl` passes, and `baseline.test.ts` confirms 86 entries, 85 with a counterpart and one not applicable (quickstart.md, section 2).

### Tests for User Story 2 (first, seen failing)

- [X] T049 [P] [US2] Write `etalii.adp.ide.vscode/test/core/fbl/registration.test.ts`: the 9 counterparts of `Registration/Registration.Tests.cs` ("a body outside the workspace is refused" has 2 cases; "a body reached through a link is refused" skips with its reason where the system refuses a link, by T009's helper)
- [X] T050 [P] [US2] Write `etalii.adp.ide.vscode/test/core/fbl/routing.test.ts`: the 9 counterparts of `Routing/Routing.Tests.cs` with the source's tables (4, 4 and 9 cases; "a folder is recognised and its files selected without following links" skips with its reason where the system refuses a link)
- [X] T051 [P] [US2] Write `etalii.adp.ide.vscode/test/core/fbl/templates.test.ts`: the 5 counterparts of `Routing/Templates.Tests.cs` ("every declared template reads back without a warning" is an `it.each` over the templates the copied bindings declare, with a guard on their count; "the key placeholder is sanitised exactly" has 6 cases)
- [X] T052 [P] [US2] Write `etalii.adp.ide.vscode/test/core/fbl/pluginBody.test.ts`: the 5 counterparts of `Plugins/PluginBody.Tests.cs`, with a persistence plugin for tests in `etalii.adp.ide.vscode/test/core/fbl/support/` that stands in for a real one

### Implementation for User Story 2

- [X] T053 [P] [US2] Port `Registration/BodyLocator.cs` to `etalii.adp.ide.vscode/src/core/fbl/registration/bodyLocator.ts`: a body location is `{path, exists, isFolder, refusal?}` with `isMissing`, found as FBL 8.2 says; "refused when the path is absolute, leaves the workspace, or passes through a link"
- [X] T054 [P] [US2] Port `Registration/LegacySidecar.cs` to `etalii.adp.ide.vscode/src/core/fbl/registration/legacySidecar.ts`: "a JSON file read and written by json splices: positions by view, matched ignoring case, or identities". T049 passes with T053
- [X] T055 [P] [US2] Port `Routing/Glob.cs` and `Routing/MarkerEvaluator.cs` to `etalii.adp.ide.vscode/src/core/fbl/routing/glob.ts` and `markerEvaluator.ts`: a marker looks at 20 lines unless it says otherwise, a first-line marker is matched after a byte-order mark, and a `rootKey` marker reads YAML and JSON without a binding
- [X] T056 [US2] Port `Routing/Router.cs` and `Routing/FolderSubject.cs` to `etalii.adp.ide.vscode/src/core/fbl/routing/router.ts` and `folderSubject.ts`: `candidates`, `suggests` (the first 64 KiB), `readings`, `bare`, `suggestsReading`; a folder subject "is recognised by its `all`, `any` and `none` globs and lists its files in ordinal order of their relative paths, never through a link". T050 passes
- [X] T057 [P] [US2] Port `Plugins/IPersistencePlugin.cs`, `Plugins/_Model/` and `Plugins/PluginBody.cs` to `etalii.adp.ide.vscode/src/core/fbl/plugins/persistencePlugin.ts` and `pluginBody.ts`: the bytes, history, drift check and save are the library's; "without the plugin the binding names, it is read-only with the one finding `std.pluginMissing`"; a read-only binding's plugin is never asked to plan. T052 passes
- [X] T058 [US2] Port `Routing/TemplateWriter.cs` to `etalii.adp.ide.vscode/src/core/fbl/routing/templateWriter.ts`: `produceTemplate`, `replacePlaceholders` and `templateKey`; a template is "a binding's text for an origin with the four placeholders replaced and nothing else", never evaluated, and a plugin without template text is asked for one. T051 passes
- [X] T059 [US2] Complete `etalii.adp.ide.vscode/src/core/fbl/index.ts` to the whole of contracts/library-api.md (`locateBody`, `LegacySidecar`, routing and templates, `PersistencePlugin`, `PluginBody`); nothing listed there may be missing
- [X] T060 [US2] Run `npx vitest run test/core/fbl` in `etalii.adp.ide.vscode`: every test passes and `etalii.adp.ide.vscode/test/core/fbl/baseline.test.ts` passes for the first time. Check that the reason of a skipped link test appears in the list `etalii.adp.ide.vscode/scripts/skipped-tests.mjs` prints, and change that script if it does not (FR-023, FR-024)

**Checkpoint**: 78 of the 86 baseline tests have a passing counterpart (all but the real-file tests); the fixtures of Phase 3 still pass.

---

## Phase 5: User Story 3 - The bindings are tried on real files (Priority: P2)

**Goal**: plan step 5. The five properties over every real file a declared binding claims, the registration tests, and the divergence record observed again.

**Independent Test**: `npx vitest run test/core/fbl/realFiles` passes with at least 15, 4, 5, 16, 4 and 2 files for the six bindings and at least 181 registrations; a `.tml` copied to `fixtures/fbl/real-files/src/extra.tml` is picked up without a change to the tests (quickstart.md, section 3).

### Tests for User Story 3 (first, seen failing)

- [X] T061 [US3] Extend `etalii.adp.ide.vscode/test/core/fbl/realFiles/corpus.ts`, porting `RealFiles/RealFileCorpus.cs`: the enumeration of `fixtures/fbl/real-files/` and, with the same rules, the rest of the repository (leaving out `node_modules`, `dist`, `out`, `reports`, `.vscode-test`, `.debug` and `fixtures/fbl/conformance`). The minimums apply to the copied files alone
- [X] T062 [P] [US3] Create `etalii.adp.ide.vscode/test/core/fbl/realFiles/divergences.json` in the shape `{doc, divergences: [{property, binding, file, observed, reason}]}` from the 29 entries of the source's tests' `RealFiles/divergences.json` that are not cross-checks (24 on a registration's view, 2 on its layout, 2 on its resource, 1 unreadable body), and `etalii.adp.ide.vscode/test/core/fbl/realFiles/divergences.ts`, porting `RealFiles/Divergences.cs`: "a disagreement that is not listed fails its test; a listed one that no longer occurs, or is observed differently, fails; every entry has a reason and names a file of the corpus". `property` is one of `unreadable`, `edit`, `remove`, `registration-body`, `registration-view`, `registration-resource`, `registration-layout`, `reading-suggest`
- [X] T063 [P] [US3] Write `etalii.adp.ide.vscode/test/core/fbl/realFiles/declaredBodies.test.ts`: the 7 counterparts of `RealFiles/DeclaredBodies.Tests.cs`, each property an `it.each` over binding and real file with a guard on the count
- [X] T064 [P] [US3] Write `etalii.adp.ide.vscode/test/core/fbl/realFiles/registrations.test.ts`: the 7 counterparts of `RealFiles/Registrations.Tests.cs`; a registration a test does not concern is left out of its cases and not passed by returning early (contracts/test-baseline.md)

### Implementation for User Story 3

- [X] T065 [US3] Run T063 and T064 and settle every failure in `etalii.adp.ide.vscode`: a fault of the port is fixed under `src/core/fbl/` with a unit test that pins it; a disagreement between a copied binding and a real file is recorded in `test/core/fbl/realFiles/divergences.json` with what was observed and why. No binding is edited, no file skipped and no assertion weakened (FR-021). An entry that differs from standalone's is noted in `docs/fbl.md` for T071

**Checkpoint**: SC-002 and SC-003. All 85 counterparts pass and every disagreement is in the record.

---

## Phase 6: User Story 4 - It runs inside Visual Studio Code (Priority: P3)

**Goal**: plan step 6. The library is in the packaged plug-in, reachable at one place, and proven there by one test.

**Independent Test**: `npm run test:vscode` passes with the suite "The plug-in's FBL implementation" in a Visual Studio Code with every other extension disabled, and every earlier suite passes unchanged (quickstart.md, sections 4 and 5).

### Tests for User Story 4 (first, seen failing)

- [X] T066 [P] [US4] Write `etalii.adp.ide.vscode/test/vscode/fbl.test.ts`, a Mocha suite "The plug-in's FBL implementation": take `fbl` from `vscode.extensions.getExtension('etalii.adp').activate()`, load `timeline.fbl` and the `timeline-edits` fixture from the workspace copy of `fixtures/` that `scripts/unpack-plugin.mjs` makes, and walk the fixture's steps (a save, edits, undos), comparing the document after each. It fails while `fbl` is undefined
- [X] T067 [P] [US4] Write `etalii.adp.ide.vscode/test/core/fbl/generic.test.ts`: no file under `src/core/fbl/` names an origin, a tool type or a binding of the corpus (the names are read from `fixtures/fbl/conformance/`), and none imports `vscode`, `src/core/text`, `src/core/registration` or a diagram type (FR-001); fix whatever it finds

### Implementation for User Story 4

- [X] T068 [US4] In `etalii.adp.ide.vscode/src/extension/extension.ts`, give `AdpApi` the member `readonly fbl: typeof import('../core/fbl')` with the comment of contracts/library-api.md, and return the library from `activate`. Nothing else in `src/extension` or `src/webview` refers to the library, and nothing under `contributes` in `package.json` changes (FR-004). `etalii.adp.ide.vscode/test/vscode/identity.test.ts` compares `api.viewTypes` only and stays as it is. T066 passes
- [X] T069 [P] [US4] Update `etalii.adp.ide.vscode/README.md`: "Where it stands" says the plug-in carries an FBL implementation no tool uses yet, and the layout table gains `src/core/fbl` and `fixtures/fbl`, the latter with both sources; the licence line is unchanged
- [X] T070 [P] [US4] Complete `etalii.adp.ide.vscode/docs/fbl.md` (FR-025): what the library is and that no tool uses it; FBL 0.1, *Host, declared*, for `yaml`, `json`, `xml`, `lines` and `blocks`; both sources with their commits; "Not implemented", one row for each point of research R15 with FBL's section; the differences from standalone of research R3, R4, R5, R6 and R8 with their reasons

**Checkpoint**: SC-005 and SC-006. The in-editor test passes against the unpacked `.vsix`, and `git diff develop --stat -- src/extension src/webview package.json` shows `extension.ts` and the one script only.

---

## Phase 7: Polish, reporting back and delivery

**Purpose**: FR-026, SC-007 and SC-008, and the three pull requests of the plan.

- [X] T071 File in `etalii-adp/etalii.adp` one issue for each cause among the divergences of `etalii.adp.ide.vscode/test/core/fbl/realFiles/divergences.json` (and the two causes known only from the cross-check, as standalone states them) and one for each open question Q1 to Q7 of research R16, or comment on the issue that already covers it; link every one from `etalii.adp.ide.vscode/docs/fbl.md` (FR-026). This is done before pull request 1 is merged (SC-008)
- [X] T072 Walk [quickstart.md](quickstart.md), sections 1 to 6, in the worktree, including the three deliberate faults (LF for CRLF, a converted copy, a changed title in `baseline.json`), and correct `etalii.adp/specs/009-vscode-fbl-implementation/quickstart.md` where a step does not hold as written
- [X] T073 Push `features/009-vscode-fbl-implementation` of `etalii.adp.ide.vscode` and open pull request 1 into `develop`. Its description names `specs/009-vscode-fbl-implementation/` in `etalii.adp` and the `etalii.adp` commit these tasks were taken from, and links every issue of T071. Its Build run shows `npm run check`, `npm run test:unit` and `npm run test:vscode` passing, an empty skipped-tests list, and a "npm run test:unit" step at most twice as long as T003 recorded; write the measured duration into `etalii.adp.ide.vscode/docs/fbl.md` (SC-007). `git diff develop -- package.json` shows only the `sync-fbl` script
- [X] T074 After pull request 1 is merged with a merge commit: delete its branch locally and on `origin` and remove its worktree; then tick T002 to T073 in `etalii.adp/specs/009-vscode-fbl-implementation/tasks.md` on a branch of `etalii.adp`, with the links to the issues filed, and open pull request B into `develop`

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: T002 first in the VS Code repository; T001 is independent of it. T005 needs T004; T007 needs T005 and T006; T010 and T011 need T007 and T009.
- **Phase 2 (Foundational)**: needs Phase 1. Blocks every user story.
- **Phase 3 (US1)**: needs Phase 2.
- **Phase 4 (US2)**: needs Phase 3: the registration, routing, template and plugin modules stand on `OpenBody`, the history and `RegistrationDocument`.
- **Phase 5 (US3)**: needs Phases 3 and 4 (bodies, registrations, legacy sidecars, routing and folder recognition are all exercised).
- **Phase 6 (US4)**: needs Phase 3 only for T066 and T068; T070 needs Phase 5 for the differences found.
- **Phase 7**: needs every story.

### Story dependencies

The stories are steps of one port and not independent slices: US1 is the smallest result that proves anything (no fixture passes before reading, planning and history all exist), US2 and US3 each add proof on top of it, and US4 could follow US1 directly. All of it ships in one pull request (research R17).

### Within a phase

- The tests of a phase are committed before its code and seen failing (FR-023).
- T017 before every other port task. T019, then T020, then T021. T022 before T025 and T029. T024 before T025. T025 before T026. T027 before T028 to T031; those before T032.
- T037 before T039 and T040; T040 before T041 to T044; those before T045; then T046, T047, T048.
- T053 and T054 before T049 passes; T055 before T056; T057 before T058.
- T061 and T062 before T063 and T064; those before T065.

### Parallel opportunities

- Phase 1: T003, T004, T006, T008 and T009 touch different files.
- Phase 2: the five test files T012 to T016 together; T017, T022 and T023 together; the four family readers T028 to T031 together.
- Phase 3: T034, T035 and T036 together; the four family writers T041 to T044 together, each in its own family's file.
- Phase 4: the four test files T049 to T052 together; T053, T054, T055 and T057 together.
- Phase 5: T062, T063 and T064 together.
- Phase 6: T066 and T067 together; T069 and T070 together.

## Parallel example: Phase 2

```text
# The tests of the reading half, each its own file:
T012 test/core/fbl/bodyText.test.ts
T013 test/core/fbl/expressions.test.ts
T014 test/core/fbl/loading.test.ts
T015 test/core/fbl/reading.test.ts
T016 test/core/fbl/regexDifferential.test.ts

# The four family readers, once T027 is done:
T028 src/core/fbl/families/yaml/
T029 src/core/fbl/families/json/jsonFamily.ts
T030 src/core/fbl/families/xml/xmlFamily.ts
T031 src/core/fbl/families/lines/linesFamily.ts
```

## Parallel example: User Story 1

```text
# Tests:
T034 reading.test.ts ("planning is deterministic")
T035 yamlScalars.test.ts
T036 history.test.ts

# The four family writers, once T040 is done:
T041 yaml   T042 json   T043 xml   T044 lines
```

## Implementation strategy

### MVP first (User Story 1)

1. Phase 1: the corpus is copied and checked.
2. Phase 2: every copied binding loads and reads. T026 is the gate: a binding the subset refuses is raised before more is built.
3. Phase 3: the eight fixtures pass. **Stop and validate** with quickstart.md, section 1. This alone is an implementation proven on eight end-to-end paths.

### Incremental delivery

Each later phase is one commit group of the same branch: Phase 4 makes `baseline.test.ts` pass, Phase 5 adds the real files, Phase 6 puts it in the plug-in. The branch is pushed and its pull request opened only in Phase 7, because the Build must be green and the issues filed first.

### Three pull requests

| Pull request | Opened by | Into | Carries |
|---|---|---|---|
| A | T001 | `etalii.adp` `develop` | the specification, the plan, these tasks |
| 1 | T073 | `etalii.adp.ide.vscode` `develop` | T002 to T070 |
| B | T074 | `etalii.adp` `develop` | the tasks ticked, the issues linked |

## Notes

- Tasks T019 to T021, T025, T032, T040 and T047 are the large ones; each is one module of the source with its tests already written.
- A splice that differs from a fixture's, or a sentence that differs from the source's, is a fault of the port. A fixture, a copied binding and a file under `etalii.adp.ide.vscode/fixtures/fbl/` are never edited.
- What FBL requires and neither a fixture nor the baseline proves is not built (research R15); it is a row in `docs/fbl.md`, not a task here.
- Where FBL does not decide, nothing is decided in the host: the question is filed (T071).

## Issues filed (T026, T071)

In [etalii-adp/etalii.adp](https://github.com/etalii-adp/etalii.adp/issues), each linked from `etalii.adp.ide.vscode/docs/fbl.md`:

| | What | Issue |
|---|---|---|
| Q1 | Which CEL functions and macros a host must support | #71 |
| Q2 | The finding code and the measure of a regular expression's bound | #72 |
| Q3 | Where `std.unparseable` is located for yaml that is not well-formed | #73 |
| Q4 | What `{decimals: n}` rounds | #74 |
| Q5 | Which sentences are normative | #75 |
| Q6 | `caseInsensitive` and a range in a class; touches `structurizr.fbl` (raised at the gate T026) | #64 |
| Q7 | Whether the escapes of section 2.5 are a closed list | #76 |
| Divergence | `structurizr.fbl`'s view rule reads a description as the key (24 entries) | #65 |
| Divergence | FBL 4.7: a comment after `{` leaves the block unopened (1 entry) | #66 |
| Divergence | Causal loop registrations key positions by `variable:<name>` (2 entries) | #67 |
| Divergence | `databricks-pipeline.fbl` has no `registration.resource` capture (2 entries) | #68 |
| Cross-check, as standalone states it | `mindmap.fbl`'s branch relation is never read | #69 |
| Cross-check, as standalone states it | `structurizr.fbl` has no rules for components and deployment elements | #70 |
