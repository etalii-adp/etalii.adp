# Research: A Generic FBL Implementation for Visual Studio Code

**Feature**: [vscode-fbl-implementation.spec.md](vscode-fbl-implementation.spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-06

What was read for this: FBL 0.1 ([FBL-specification.md](../../specifications/fbl/FBL-specification.md)) and its corpus at `etalii.adp` `develop` `30206ea`; standalone's FBL library and its tests at `etalii.adp.ide.standalone` `develop` `25fc7b4a`, every file in full; `etalii.adp.ide.vscode` at `develop` `f0f9cf1`. Nothing was built or run in either host, so counts and behaviour of standalone are as its code and records state them.

## Findings that shape the plan

- **The baseline has not moved.** Standalone's `develop` is still `25fc7b4a`, and its FBL test project still has 86 test methods: Bytes 6, Conformance 3, Expressions 5, History 5, Loading 9, Plugins 5, Reading 11, RealFiles 15, Registration 9, Routing 9, Templates 5, Yaml 4.
- **The unmerged YAML branch adds nothing to it.** `origin/features/quote-multiline-yaml` (`f939c782`) changes `EtAlii.Adp.Documents/LineSplice.cs` and adds tests to `EtAlii.Adp.Documents.Tests` and the hype cycle graph's tests. It touches no file of the FBL library or its test project. The specification's assumption that its tests "join the baseline when they reach `develop`" therefore does not apply: they test the hype cycle graph's own writer, which is spec 006's ground. The baseline stays at 86 whether or not that branch merges.
- **The corpus standalone copied is the corpus on `develop` here.** Every binding, fixture and registration in standalone's `Conformance/` folder (copied at `4590c56`) is byte for byte what `specifications/fbl/` holds at `30206ea`; only the specification document changed in between (its Licence row). This host copies at `30206ea` and tests the same bytes.
- **Standalone's library is self-contained and takes bytes.** About 8,500 lines of C#, one package dependency (YamlDotNet, for two decisions only), no file writes, `byte[]` in and out. Its YAML, JSON, XML, lines and blocks readers, its regular expression subset check and its CEL are all hand-written. That makes a module-by-module port practical.
- **The VS Code repository has a place for it and a way to test it.** `src/core` is kept free of Visual Studio Code and the browser by lint; `test/core/**/*.test.ts` runs under Vitest in Node; `activate` already returns an object "so tests can see what was registered", which the in-editor tests read; `fixtures/**` is already kept from line-ending conversion and skipped by the file check; the Build workflow already runs `npm run test:unit` and `npm run test:vscode`.
- **Everything in `src/core` today works on strings**, by line. The two diagrams' `Splice` is a line replacement and `registration.ts` rewrites the layout block of a string. FBL works on bytes with byte offsets. The two do not meet in this feature (FR-004).

## Decisions

### R1. A port of standalone's library, module by module, with FBL as the referee

**Decision**: write the implementation in TypeScript as a port of `EtAlii.Adp.Specification.Fbl` at `25fc7b4a`, in its module order (text; expressions; documents; rules and the family readers; planning and the family writers; history; registration; routing; plugins), and port its tests first as the checklist. Where the port's source and FBL disagree, FBL decides, the difference goes into the host's record (R15) and is reported (R16).

**Rationale**: SC-004 asks for standalone's splices, byte for byte, on every fixture step, and FBL section 6.3 leaves a host no freedom in new text. The shortest way to the same bytes is the same decisions in the same order. Spec 006 built this repository the same way. Writing from the document alone would test FBL's completeness better, but it is the fixtures that are FBL's test of that, and they run either way.

**Alternatives considered**: an implementation from the specification alone, compared with standalone afterwards: rejected, as it finds the same differences later and at a higher price. Compiling standalone's C# for Node (WebAssembly): rejected, as the plug-in must be one self-contained file of modest size and the repository has no .NET toolchain.

### R2. In `src/core/fbl/`, on bytes, beside and apart from the diagrams' text primitives

**Decision**: the library is `src/core/fbl/`, with `index.ts` as its only public surface. A body is a `Uint8Array`; every span and splice offset is a UTF-8 byte offset including a byte-order mark; text is decoded per span when needed and new text encoded when a splice is applied. Its types are its own (`FblSplice`, `Span`), and it imports nothing from `src/core/text`, `src/core/registration` or a diagram type. Nothing outside `src/core/fbl/` imports it except `src/extension/extension.ts` (R11).

**Rationale**: FR-001, FR-003 and FR-004; principle III of the VS Code repository (`src/core` knows no editor). `src/core/registration/registration.ts` already reads and writes the `.adp` layout block for Agent Behavior Modelling, on strings and by rewriting the block; replacing it with the FBL registration would change how an existing diagram writes, which FR-004 forbids. Two readers of one format is the price of that requirement until the diagram moves onto FBL.

**Alternatives considered**: growing the existing `Splice` and `LineDocument` into byte forms: rejected, it changes the diagrams. A separate npm package: rejected, no second consumer exists (principle V).

### R3. Regular expressions: the library's own bounded matcher for the common subset

**Decision**: one module parses an expression in FBL's common subset (section 2.5) into a small tree, rejecting each construct outside it by name, and matches it with a backtracking matcher that counts its steps and gives up at a budget (default 1,000,000 steps for one match attempt, an option of the host). Exceeding it is the finding `fbl.regex-timeout` on the statement and no match, as in standalone. The matcher reports the UTF-16 range of every named group, which the families turn into byte ranges. Its semantics are those standalone gets from .NET after its translation: `\d` and `\w` ASCII only, `.` anything but LF, leftmost-first alternation, lazy quantifiers; `caseInsensitive` folds ASCII letters only. A differential test runs every expression of the copied bindings over every line of the copied bodies through both this matcher and the platform's `RegExp` (with the `d` flag) and requires the same match and the same group ranges.

**Rationale**: FBL section 16 requires a host with a backtracking engine to bound a match or use a linear-time one. JavaScript's `RegExp` backtracks and cannot be interrupted from the thread it runs on, so FR-013 cannot be met with it. The loader must parse every expression anyway, to reject what is outside the subset by name (step 5 of section 14.1, and five baseline tests); the matcher over that tree is the smaller half, and a step budget is deterministic where a clock is not, so the test of the bound cannot be flaky. Standalone bounds by time (250 ms); the two bounds are the same safeguard and differ only for an expression near the limit.

**Alternatives considered**: `RegExp` unbounded: fails FR-013. `RegExp` in a worker thread that is killed on a timeout: makes every read asynchronous and costs a thread round trip per line. A linear-time engine as a dependency (`re2js`, or `re2` with a native binary): a third parser for the same syntax, a new bundled dependency to justify under principle V, and, for the native one, a binary per platform in the plug-in. Rejecting expressions that could backtrack badly at load: not a rule FBL has; it would refuse valid documents.

### R4. CEL: a port of standalone's subset, corrected to CEL where standalone strays

**Decision**: port `Cel.cs`: a tokenizer, a recursive-descent parser and a tree-walking evaluator with a budget of 100,000 steps, the variables of FBL section 2.4 by context, and the functions and macros standalone has (`has`, `all`, `exists`, `exists_one`, `filter`, `map`, `size`, `matches`, `startsWith`, `endsWith`, `contains`, `replace`, `lowerAscii`, `upperAscii`, `int`, `double`, `string`). Anything else fails to compile, at load. CEL `int` is a `bigint` and `double` a `number`, so the two stay apart as CEL requires. `matches` uses R3's matcher. Where standalone's evaluator differs from CEL (`size` of a string counted in grapheme clusters, `lowerAscii` and `upperAscii` changing non-ASCII letters, `int` and `double` compared with a tolerance), this host does what CEL defines and records the difference.

**Rationale**: the baseline has five tests on which expressions compile and what nine of them evaluate to; a general CEL library would accept expressions those tests require to be refused, and no CEL library is in the repository today. The corrections follow constitution principle I: FBL names CEL as the definition, so a host does not copy another host's slip.

**Alternatives considered**: a CEL package from npm: a new runtime dependency whose accepted language is not the baseline's. Copying standalone's deviations for the sake of sameness: no fixture or baseline test depends on them, and they contradict the language FBL names.

### R5. YAML: the library's own reader for spans, the bundled `yaml` package for two yes-or-no questions

**Decision**: port `YamlParser`, `FlowReader`, `YamlScalars` and `YamlFamily`: the spans FBL section 4.3 defines come from the library's own reader. The `yaml` package, which the plug-in already bundles, answers only what YamlDotNet answers in standalone: whether a body is well-formed YAML (with `uniqueKeys` off, since a repeated key is FBL's warning `fbl.duplicate-key`, not an error), and what a body's root keys are for a `rootKey` marker.

**Rationale**: spans decide bytes, so they must be the port's. Well-formedness is a judgement on the whole of YAML 1.2 that a 550-line reader should not make alone. No dependency is added.

**Consequence**: for a YAML body that is not well-formed, the offset and the wording of `std.unparseable` come from a different parser than standalone's and will differ. Tests assert the code, that it is the only finding and that the body is read-only, as the baseline does. The difference is reported (R16, Q3).

### R6. JSON: one strict reader of the library's own, for FBL documents and for bodies

**Decision**: a byte-level RFC 8259 reader that keeps every member in document order, the raw text of every number, the span of every node and the comma of every entry. The document loader uses it to find duplicate keys with their JSON Pointers (RFC 6901) and to keep the order of `attributes`, `map`, `byOrigin`, `readings` and `registration.headers`; the `json` family uses it for the lossless reading. It accepts exactly RFC 8259.

**Rationale**: `JSON.parse` cannot report a duplicate key, loses a number's text, and moves integer-like keys to the front, while FBL's `map` writes "the first key in document order". Standalone uses two readers (the platform's for documents, its own for bodies) because its platform's reader keeps order; one suffices here. Standalone's body reader accepts some number forms RFC 8259 does not; FBL section 4.4 says the body is a JSON text, so this host is strict and records the difference.

### R7. XML, lines and blocks: ported as they are

**Decision**: port `XmlFamily` (a tokenizer over bytes that keeps carriage returns, as section 4.5 requires) and `LinesFamily` (which serves `lines` and `blocks`). No XML parser is added.

**Rationale**: section 4.5 forbids the line-ending normalisation an XML parser performs, and both are small.

### R8. Numbers and times

**Decision**: `number: "shortest"` is `String(value)` for a double and the integer's digits for an integer, which is the form FBL names. `{decimals: n}` rounds the value's shortest decimal representation, halves away from zero, by digit arithmetic and not by `toFixed`, then drops trailing zeros and a trailing point; `-0` is written `0`. `time: "keep-precision"` parses ISO 8601 dates and date-times strictly and writes at most seven fraction digits, as standalone does.

**Rationale**: `toFixed` rounds the binary value, so `1.005` at two decimals gives `1.00`. Rounding the shortest decimal representation gives one answer in every language. Whether standalone's `Math.Round(value, n, AwayFromZero)` gives the same for every double is not certain; the registration fixture and the registration tests give the cases that matter today, and the question goes to FBL (R16, Q4).

### R9. Files and the digest: an interface, and Node's own modules in two places

**Decision**: the library reads bytes it is handed and returns bytes; it never writes a file. Three things look at a disk: resolving a binding reference from a path, finding a registration's body (section 8.2, with the workspace and link checks of section 16), and recognising and listing a folder subject (section 10). They take an `FblFiles` interface (read, exists, kind of entry without following links, list a folder). `src/core/fbl/files/nodeFiles.ts` implements it with `node:fs` and `node:path`. The history's digest is SHA-256 from `node:crypto`, in `src/core/fbl/history/digest.ts`. No other file under `src/core` imports a `node:` module, and a lint rule says so.

**Rationale**: `src/core` must not depend on Visual Studio Code or a browser (principle III); Node is neither, and the extension host is Node. An interface keeps the tests of path rules free to use a real temporary folder (as the baseline does) and lets a later feature hand in the workspace's own file access. A link is anything `lstat` reports as a symbolic link, which on Windows includes junctions, matching standalone's reparse-point check for the cases the tests make.

**Alternatives considered**: SHA-256 written out in TypeScript to keep `src/core` free of Node: sixty lines to avoid one import the platform provides (principle V). Comparing whole bodies instead of digests: keeps a copy of the body per edit.

### R10. What the library says is what standalone says

**Decision**: every sentence a user or a test can see (a refusal's reason, a finding's message, a load problem's message, the two drift sentences) is taken verbatim from standalone's source, in English, as constants in one module.

**Rationale**: fixtures compare a refusal's reason exactly; the divergence record compares what was observed exactly (R13); and section 7.2 gives the drift sentence. FBL does not list the others, which is reported (R16, Q5).

### R11. It reaches the plug-in through what `activate` returns

**Decision**: `AdpApi`, the object `activate` returns, gains one member, `fbl`, holding the library's public surface. Nothing else in `src/extension` or `src/webview` refers to the library. The in-editor test (R12) takes it from `vscode.extensions.getExtension('etalii.adp').activate()`.

**Rationale**: the plug-in's bundle holds only what is reachable from its entry point, so something must import the library or FR-002 is not met. FR-004 rules out a tool, an editor, a command and a setting; the returned object is none of them, already exists for tests, and is not a contribution in `package.json`. A test-only command under `ADP_TEST` would also bundle it, but would be a command and would pass bytes and results through a second calling convention.

### R12. Tests: Vitest beside the existing ones, one Mocha test in the editor, and a checked baseline list

**Decision**:

- Unit tests are `test/core/fbl/*.test.ts`, one file for each of standalone's twelve test files, run by the existing `core` project with no change to `vitest.config.mts`. Titles follow the repository's convention (a lower-case sentence), each being its baseline test's name spelled out: `ADuplicateKeyAnywhereIsRejectedAtItsPointer` is `it('a duplicate key anywhere is rejected at its pointer')`.
- `test/core/fbl/baseline.json` lists all 86 baseline tests, each with the file and title of its counterpart, or `notApplicable` with a reason. `baseline.test.ts` fails unless the list has exactly the 86 names of [contracts/test-baseline.md](contracts/test-baseline.md), every named title occurs in the named file, and the only test not applicable is the one FR-018 allows.
- Cases that come from data (a fixture, a real file, a registration) are `it.each`, with a guard test on the count, as the repository's round-trip tests are.
- Where standalone's tests reach internals (`BodyReading.Read`, `Unaccounted()`, `YamlScalars`), the tests here import the module directly; only `index.ts` is the library's public surface.
- The two tests that create a symbolic link skip, with the reason, on a system that refuses to create one. On the hosted runner they run.
- The in-editor test is `test/vscode/fbl.test.ts`: it takes `fbl` from the activated plug-in, loads `timeline.fbl`, reads the `timeline-edits` fixture's input, and walks its steps (a save, edits, undos), comparing the document after each. It reads the binding and the fixture from the workspace copy that `scripts/unpack-plugin.mjs` already makes of `fixtures/`.
- Test-first (FR-023) is kept per module: its tests are committed first, in a commit whose message names them as failing, then the module.

**Rationale**: FR-016, FR-017, FR-018, FR-022 and FR-023, with nothing new in the build. A list that a test checks makes SC-002 a fact of the build and not of a reviewer's patience.

### R13. The copied files: `fixtures/fbl/`, with a manifest of digests

**Decision**: a new script, `scripts/sync-fbl.mjs`, copies from git objects (never from a working tree, so no line ending is converted) and writes:

- `fixtures/fbl/conformance/`: the eight bindings, `fixtures/` and `registrations/` of `specifications/fbl/` at the recorded `etalii.adp` commit;
- `fixtures/fbl/real-files/`: files of `etalii.adp.ide.standalone` at the recorded commit, under their paths there (R14);
- `fixtures/fbl/manifest.json`: for each source its repository, commit and licence, and the SHA-256 of every copied file;
- `fixtures/fbl/PROVENANCE.md`: the same in prose, with the instruction to refresh by running the script and never by editing.

`corpus.test.ts` recomputes every digest and fails on a file that is missing, extra or changed, which is how a converted or edited copy is noticed. `fixtures/** -text` in `.gitattributes` already keeps Git from converting them; `PROVENANCE.md` and `manifest.json` are marked `text`.

**Rationale**: FR-015, and the edge case of a converted copy. The repository's existing `sync-examples.mjs` is written for one source and rewrites one provenance file; a second script is simpler than generalising it. `fixtures/` is already excluded from lint and from the file check, which matters because the corpus holds JSON with a byte-order mark and bodies that are malformed on purpose.

### R14. The real-file corpus: what standalone's real-file tests read, under the same paths

**Decision**: copy from standalone at `25fc7b4a`, from under `src/` and outside its `Conformance` folder, `node_modules`, `bin` and `obj`:

| What | Selected by | Files at `25fc7b4a` | Recorded minimum |
|---|---|---|---|
| Timeline bodies | `.tml` | 15 | 15 |
| Causal loop bodies | `.cld` | 4 | 4 |
| Mind map bodies | `.mm` | 5 | 5 |
| Structurizr bodies | `.dsl` | 16 | 16 |
| Databricks job bodies | `.yml` or `.yaml` containing `task_key` | 4 | 4 |
| Databricks pipeline bodies | `.json` containing `"libraries"` | at least 2, counted by the script | 2 |
| Registrations | `.adp` | 199 | 181 |
| Legacy sidecars | `*.layout.json`, `*.identities.json` | 4 and any | none |
| Helm chart folders | every file of a folder holding `Chart.yaml` | 13 folders | 13 |
| Turtle and N-Triples | `.ttl`, `.nt` | 33, about 2.6 MB | 33 |

They keep their relative paths, so the divergence record names files as standalone's does and the two records can be compared line by line. The minimums are standalone's. Together the copy is about 3 MB, most of it Turtle.

With these files, all seven tests on declared bodies and all seven on registrations have counterparts. Only `TheBindingReadsTheIdsTheModuleReads` does not apply: it compares a binding with standalone's own C# parsers for four diagram types, which this host does not have. That is one test of 86.

The tests also walk the repository itself (FR-019). At `f0f9cf1` no file there is claimed by a declared example binding; its `.adp` registrations under `examples/` join the registration tests.

The divergence record is `test/core/fbl/realFiles/divergences.json`, in standalone's shape (`property`, `binding`, `file`, `observed`, `reason`). It starts from standalone's 29 entries that are not cross-checks (24 on a registration's view, 2 on a registration's layout, 2 on a registration's resource, 1 unreadable body); each is observed again by this host's tests, which fail on an unlisted disagreement, on a listed one that no longer occurs, and on one that is observed differently. An entry that differs from standalone's is itself a finding to report (R16).

**Rationale**: FR-019 to FR-021 and User Story 3; the specification leaves the choice of files to the plan. Taking what standalone's tests read, by the same rules, keeps "the same checks" literal and leaves a single test not applicable.

**Alternatives considered**: one file for each declared binding: meets FR-019's minimum and leaves most of the registration tests not applicable. Leaving out the Turtle files: saves 2.6 MB and makes half of one test not applicable; it is one line of the script, and can be taken if the size is unwelcome.

**To check when copying**: some of these files came to standalone from elsewhere (Structurizr's examples, published vocabularies, chart templates). The script records standalone's licence for all of them; a notice standalone carries for any of them is copied with it and named in `PROVENANCE.md`.

### R15. What this host implements, and how it says so

**Decision**: the host claims FBL 0.1, *Host, declared*, for `yaml`, `json`, `xml`, `lines` and `blocks`, on the strength of the eight fixtures. It implements what the fixtures and the 86 baseline tests prove. What FBL requires and neither proves is not built in this feature; each such point is a row in `docs/fbl.md` under "Not implemented", with FBL's section. From standalone's code these are known today: moving an element to another parent (5.5); `insert.place` as `{before: key}` and `next-sibling` (6.2); `registration.createOnFirstPlacement` (8.4); removing `layout:` with its last entry other than by undo (8.3); the finding `fbl.missing-body`, where the library reports a missing body and leaves the finding to its caller (8.2); snapshot undo reported as one splice (7.1); `legacyIdentities` (8.7); a folder subject's rules reading its files (10.2), watching and settling (10.3), and one open body shared by several readings (9.1). `docs/fbl.md` also holds the differences from standalone that R4, R5, R6 and R8 introduce, and says that no tool uses the library yet (FR-025). The readme's layout table gains a row for `src/core/fbl` and for `fixtures/fbl`.

**Rationale**: FR-005 names the class standalone implements, and the specification's assumptions put watching and shared bodies outside. Building a behaviour that no fixture and no test of the other host pins down would have two hosts decide bytes separately, which FBL's fifth principle and FR-014 forbid; the right order is a fixture in `specifications/fbl/` first. Saying plainly what is missing is what keeps the claim honest.

### R16. Reporting back

**Decision**: before the pull request into the VS Code repository is merged, each of the following is an issue in `etalii-adp/etalii.adp` (or a comment on the issue that already covers it), and `docs/fbl.md` links them (FR-026, SC-008):

- every entry of the divergence record, grouped by cause. The causes known from standalone: a Structurizr view rule that takes the last quoted string as the view's key; `{` followed by a comment not opening a block (4.7); causal loop registrations that key positions by `variable:<name>`; no `registration.resource` capture in `databricks-pipeline.fbl`. Two more are known only from the cross-check this host cannot run, and are passed on as standalone states them: `mindmap.fbl`'s `branch` relation selecting entries its `node` rule always takes, and `structurizr.fbl` having no rules for components and deployment elements.
- the open questions below.

| | Question for FBL | Why it matters |
|---|---|---|
| Q1 | Which CEL functions and macros must a host support? Section 2.4 names CEL whole; standalone implements a subset and refuses the rest at load. | A document that loads in one host may be refused in another. |
| Q2 | Section 16 requires a finding when a match exceeds its bound, and section 7.4's table has no code for it. Standalone uses `fbl.regex-timeout`. Is a bound in steps, which is repeatable, to be preferred over one in time? | Two hosts report the same problem under different codes, or at different inputs. |
| Q3 | Where is `std.unparseable` located for a body that is not well-formed YAML? Each host's parser gives its own offset and wording. | Findings differ between hosts for the same bytes. |
| Q4 | Does `{decimals: n}` round the number's shortest decimal representation or its binary value? | `1.005` at two decimals is `1.01` or `1`. |
| Q5 | Which sentences are normative? A fixture compares a refusal's reason exactly, and FBL gives only the drift sentence. | A host cannot pass a `refused` step from the document alone. |
| Q6 | For `caseInsensitive`, standalone rewrites each letter to a class, which turns the range `[a-z]` into one that also admits `[`, `\`, `]`, `^`, `_` and a backtick. This host folds ASCII letters and nothing else. | Reported to standalone as a fault, and to FBL as a case a fixture should pin. |
| Q7 | Section 2.5 lists the escapes of the subset; standalone accepts whatever .NET compiles (`\b`, `\A`, class subtraction). This host accepts the listed subset only. | A document that loads in standalone may be refused here. |

Whether any copied binding is touched by Q6 or Q7 is checked in the first task that loads them all; a binding that is, is a blocker to raise before going on, not something to work around.

### R17. Delivery

**Decision**: one pull request into `etalii.adp` with this plan and the tasks, from `features/009-vscode-fbl-implementation`; one pull request into `etalii.adp.ide.vscode` from a branch of the same name, built in its own worktree, whose description names this folder and the `etalii.adp` commit the tasks were taken from. Its commits follow the user stories: the copied corpus and the skeleton; then, per module in port order, its tests and then its code, until the fixtures pass (User Story 1); the remaining baseline tests (User Story 2); the real files (User Story 3); the in-editor test, the lint rule, the documentation (User Story 4). A last pull request here ticks the tasks once the VS Code one is merged.

**Rationale**: `CLAUDE.md` gives each repository a feature touches one branch and one pull request, and a task is ticked only when its code is merged. The library is not usable in parts: no fixture passes until reading, planning and history all exist, so smaller pull requests would each leave `develop` with tests that cannot yet be written.

### R18. Measuring SC-007

**Decision**: the first task records how long `npm run test:unit` takes on the hosted runner before the feature (from the last Build run on `develop`), in `docs/fbl.md`. The last task compares. The step budgets of R3 and R4 keep the tests of the bounds short; the real-file tests read about 300 small files and the Turtle files only as bytes for routing.

**Rationale**: the specification bounds the unit tests at twice today's time, and today's time is recorded nowhere.

## Not researched, and why

- **JSON Schema validation of FBL documents** (section 14.1 step 3): outside the feature by the specification's assumption.
- **Reconciling Visual Studio Code's text document with a body's bytes** (mixed line endings, the editor's own undo): belongs to the feature that first connects a tool; noted in the plan's check of principle I.
