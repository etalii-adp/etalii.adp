# Tasks: A Generic FBL Implementation for IntelliJ

**Input**: [plan.md](plan.md), [intellij-fbl-implementation.spec.md](intellij-fbl-implementation.spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/library-api.md](contracts/library-api.md), [contracts/build-interface.md](contracts/build-interface.md), [contracts/test-data.md](contracts/test-data.md)

**Scale note**: 67 tasks over one new Gradle module of about 45 source files and 25 test files, about 190 copied corpus files and five existing files of `etalii.adp.ide.intellij`. Watch three things: every offset is a byte offset, the `-text` rule (T003) lands before any corpus file, and the family classes read and write in one file each, so the library has no usable half before Phase 3 ends.

**Tests**: requested. FR-024 requires every test to be written before the behaviour it covers and seen to fail first, so every phase lists its tests before its code. A test task is done when its file is committed in a commit whose message names the tests as failing, and the failure was seen. A test that names a type that does not exist yet fails by not compiling, and that counts: `./gradlew :fbl:compileTestJava` names the missing type. One test file that does not compile stops every test of the module, so a test file enters the source set directly before the layer that turns it green: a phase's test wave says what is written, its implementation order says when each file is committed.

**Organization**: by user story. The stories are steps of one port, not independent slices: each stands on the one before, and all of it ships in one pull request.

## Format: `- [ ] **T###** [P?] [US#] Description · path`

- **[P]**: independent of the other tasks of its wave (a different file, no unfinished dependency)
- **[US#]**: the user story of the specification the task serves

## Path conventions

- Every path starts with its repository. The clones sit side by side (`C:\git\<repository>` locally, `/home/user/<repository>` in a cloud session).
- All code lands in `etalii.adp.ide.intellij`, on the branch `features/010-intellij-fbl-implementation`, in its own worktree, in one pull request (pull request 1).
- **The source** is `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl/` at commit `25fc7b4a`, and **the source's tests** are `etalii.adp.ide.standalone/src/backend/EtAlii.Adp.Specification.Fbl.Tests/` at the same commit. Read both with `git -C ../etalii.adp.ide.standalone show 25fc7b4a:<path>`, never from the working tree.
- **FBL** is `etalii.adp/specifications/fbl/FBL-specification.md`. Where the source and FBL disagree, or FBL does not decide, nothing is settled in this host: the question goes into T065's issue.
- A counterpart test keeps the source's method name in lower camel case, and a theory becomes a `@ParameterizedTest` with the same rows (research R14).
- Refusal, drift and finding sentences are the source's, word for word (research R11).
- Nothing under `etalii.adp.ide.intellij/fbl/src/main` imports `com.intellij`, `java.awt`, `javax.swing`, `java.net` or `java.nio.channels`, or names a tool type or an example binding (FR-001, research R2).

> **Ticking**: a task whose code lands in `etalii.adp.ide.intellij` is ticked here only after pull request 1 is merged (T067), never when the code is written or pushed. The tasks of `etalii.adp` itself (T001, T065, T067) are ticked when done.

---

## Phase 1: Setup (the module and the conformance corpus)

**Purpose**: the worktree, the empty module, the copied corpus and the three guards that watch it.

**Wave 1 — independent (different repositories):**

- [x] **T001** [P] In `etalii.adp`, commit this feature's folder and nothing else from the working tree, on `features/010-intellij-fbl-implementation`, push it and open pull request A into `develop`, merged with a merge commit · etalii.adp/specs/010-intellij-fbl-implementation/
- [ ] **T002** [P] In `etalii.adp.ide.intellij`, create a worktree on a new branch `features/010-intellij-fbl-implementation` from `origin/develop` (`6a976b9` or later). Run `./gradlew build -x integrationTest` there, confirm it passes, and note how long the test tasks took: SC-008 is measured against it in T064 · etalii.adp.ide.intellij/.claude/worktrees/010-intellij-fbl-implementation

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2 — independent (different files):**

- [ ] **T003** [P] Add the line `fbl/testdata/** -text`, with a comment that the FBL corpus is compared byte for byte, and commit it before any corpus file exists · etalii.adp.ide.intellij/.gitattributes
- [ ] **T004** [P] Add `"fbl"` to the `include` of `etalii.adp.ide.intellij/settings.gradle.kts`, and create the module's build script, cloned from `freemind/build.gradle.kts`: no `implementation(project(":core"))`, `testImplementation(project(":freemind"))` added, `-Xlint:all` and `-Werror` on every `JavaCompile` task, and the system properties `adp.fbl.testdata` (the module's `testdata`) and `adp.freemind.testdata` (`freemind/testdata`), both declared as test inputs · etalii.adp.ide.intellij/fbl/build.gradle.kts

**⟶ Wait for Wave 2 to finish, then:**

**Wave 3 — independent (different files):**

- [ ] **T005** [P] Write the eight `.fbl` documents, `fixtures/` and `registrations/` of `specifications/fbl/` with `git -C ../etalii.adp archive <commit>`, from the commit `origin/develop` of `etalii.adp` is at, never from a working tree. Add `README.md` (that commit, Apache-2.0, never edited here) and `SHA256SUMS` (one line for every file). Check that no copied file holds the previous host's name, which `NoPreviousHostIntegrationTest` scans for · etalii.adp.ide.intellij/fbl/testdata/conformance/
- [ ] **T006** [P] Create the test support: `Corpus` (the bytes of a file under `adp.fbl.testdata`, and the listing of a folder) and `TemporaryFolder` (removed after the test, with a helper that creates a symbolic link or aborts the test through a JUnit assumption with the system's reason) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/support/Corpus.java, etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/support/TemporaryFolder.java

**⟶ Wait for Wave 3 to finish, then:**

**Wave 4 — independent (different files):**

- [ ] **T007** [P] Write `CorpusUnchangedTest`: every file under `conformance/` is listed in `SHA256SUMS` with its digest, nothing listed is missing, the failure names the file, and an empty folder fails. See it fail on a copy saved with CRLF, then restore the copy (FR-015) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/conformance/CorpusUnchangedTest.java
- [ ] **T008** [P] Write `HostFreeTest`, after `freemind`'s `FormatPurityTest` and `NoNetworkAccessTest`: no file under `fbl/src/main` has an import of the five forbidden packages, and none holds the stem of a copied `.fbl` file. It fails while it finds no source file, which is its first failure (FR-001, FR-002, FR-003) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/HostFreeTest.java
- [ ] **T009** [P] Write the inventory, a table of 86 rows (`File.Method` of the source's tests, the counterpart `Class.method` or `not applicable`, the reason), and `BaselineCoverageTest`, after `freemind`'s `InventoryCoverageTest`: 86 rows, every named class and method exists, and `not applicable` only on `Registrations.AW3CReadingsSuggestMatchesItsBody`, `AC4RegistrationReadsItsLegacyLayout`, `TheC4LegacyLayoutsArePositionedThroughTheirRegistrations` and `EveryChartFolderIsRecognisedAndEveryTurtleFileRoutesToTheTurtleBinding`. `ModuleCrossCheck.TheBindingReadsTheIdsTheModuleReads` maps to `FreeMindCrossCheckTest`, with the three parsers this host lacks named in its reason column. It stays failing until Phase 5 ends (FR-017, FR-018) · etalii.adp.ide.intellij/fbl/testdata/baseline/fbl-test-inventory.md, etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/BaselineCoverageTest.java

**Checkpoint**: `CorpusUnchangedTest` passes. `HostFreeTest` and `BaselineCoverageTest` fail for want of code, as intended. The plug-in's existing tests pass unchanged.

---

## Phase 2: Foundational (values, text, expressions, loading)

**Purpose**: the layers that stand alone and that everything else imports. No story starts before this.

### Tests (first, seen failing)

**Wave 1 — independent (different files):**

- [ ] **T010** [P] Write `BodyTextTest`: the 6 counterparts of `Bytes/BodyText.Tests.cs` (one theory of 4 rows) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/text/BodyTextTest.java
- [ ] **T011** [P] Write `ExpressionsTest`: the 5 counterparts of `Expressions/Expressions.Tests.cs` (four theories, 24 rows), and one test of this host's own: a pattern that backtracks without end on a hostile line gives no match and the finding `fbl.regex-timeout` within a match time of 50 ms (FR-013) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/expression/ExpressionsTest.java
- [ ] **T012** [P] Write `LoadingTest`: the 9 counterparts of `Loading/Loading.Tests.cs` (three theories, 13 rows), and one more test, every copied `.fbl` under `conformance/` loads with no problem of severity error, with a guard that eight were found · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/document/LoadingTest.java

### Implementation

**⟶ Wait for Wave 1 to finish, then:**

- [ ] **T013** Port `Span.cs`, `Splice.cs`, `Finding.cs` and `FblModel.cs` and the options type. Offsets are byte offsets, start inclusive, end exclusive, byte-order mark counted. Two splices are equal when operation, start, end and text are. `FblOptions` carries the five limits of data-model.md and the optional `deriveId` · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/Splice.java, Finding.java, FindingCodes.java, FblModel.java, FblOptions.java, text/Span.java

**⟶ Wait for T013 to finish, then:**

**Wave 2 — independent (different files):**

- [ ] **T014** [P] Port `Text/BodyText.cs` over a `byte[]`: byte-order mark, each line with its own ending, the dominant ending of FBL section 2.6, line and column from a byte offset and back, the offset of each invalid UTF-8 sequence. T010 passes · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/text/BodyText.java
- [ ] **T015** [P] Port `Expressions/RegexSubset.cs`: the subset validator rejects by the name of the construct and rewrites `\d`, `\w` and case-insensitivity to ASCII classes. `BoundedRegex` runs `java.util.regex` over a `CharSequence` whose `charAt` throws once the deadline of `FblOptions` has passed (research R6) · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/expression/RegexSubset.java, etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/expression/BoundedRegex.java
- [ ] **T016** [P] Write the span-preserving JSON parser the loader and the json family share, from the parsing part of `Files/Json/JsonFamily.cs`: members in document order, the raw text of every number, the byte span of every key, value and comma, and a duplicate key kept with its location (research R4) · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/family/json/JsonParser.java
- [ ] **T017** [P] Port `Documents/FblModelTypes.cs` as records, with every list in document order, and `Problem` (location, severity, message). Port `Routing/Glob.cs` with it, which the records and the loader use: matching ignores case on Windows and macOS only · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/document/, etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/routing/Glob.java

**⟶ Wait for Wave 2 to finish, then:**

- [ ] **T018** Port `Expressions/Cel.cs`: compiler and evaluator for `has()`, member access, ternaries, `==`, `!=`, `&&`, `||`, list literals and `in`. Anything else is rejected at load by the name of the construct (research R7). T011 passes · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/expression/Cel.java

**⟶ Wait for T018 to finish, then:**

- [ ] **T019** Port `Documents/FblDocumentLoader.cs` on T016: FBL section 14.1, steps 1, 2, 4, 5 and 6. A duplicate key, an unsupported major version, a name that resolves to nothing, a failed rule check and an expression outside the subsets are each a problem at the location of its cause, and every problem is reported. The checks that need DISL are not made (research R20). T012 passes · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/document/FblDocumentLoader.java

**⟶ Wait for T019 to finish, then:**

- [ ] **T020** Gate: if a copied binding does not load with the subsets of T015 and T018, stop and raise it in `etalii-adp/etalii.adp` before going on. Do not edit the binding and do not widen a subset (FR-014) · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/expression/

**Checkpoint**: T010 to T012 pass, every copied binding loads, and `HostFreeTest` passes for the first time.

---

## Phase 3: User Story 1 - Loading and saving are proven by the shared fixtures (Priority: P1) 🎯 MVP

**Goal**: a body is read by rules, every edit is planned as FBL's splices, applied, recorded and undone, for a body and for a registration, so that the eight fixtures pass.

**Independent Test**: `./gradlew :fbl:test --tests "*CorpusUnchangedTest" --tests "*ConformanceFixturesTest"` passes with eight fixtures, and writing LF where the body has CRLF makes at least one fail.

Files: `fbl/src/main/java/etalii/adp/fbl/` `rule/`, `plan/`, `family/yaml/`, `family/xml/`, `family/lines/`, `family/json/JsonFamily.java`, `history/`, `registration/RegistrationDocument.java`, `registration/OpenRegistration.java`.

### Tests

Owned test files: `rule/ReadingTest`, `yaml/YamlScalarsTest`, `plan/NumberTextTest`, `history/HistoryTest`, `LimitsTest`, `conformance/ConformanceFixturesTest`, `support/NaturalIds`.

**Wave 1 — independent (different files):**

- [ ] **T021** [P] [US1] Write `ReadingTest`: the 11 counterparts of `Reading/Reading.Tests.cs` · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/rule/ReadingTest.java
- [ ] **T022** [P] [US1] Write `YamlScalarsTest`: the 4 counterparts of `Yaml/YamlScalars.Tests.cs` (three theories, 51 rows) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/yaml/YamlScalarsTest.java
- [ ] **T023** [P] [US1] Write `NumberTextTest`, which no baseline test covers: the numbers the fixtures and the source's legacy-layout test write, a whole double without `.0`, `1e21` in exponent form and `1e20` not, `-0` as `0`, and three fixed decimals rounding a half up (research R8) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/plan/NumberTextTest.java
- [ ] **T024** [P] [US1] Write `HistoryTest`: the 5 counterparts of `History/History.Tests.cs` · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/history/HistoryTest.java
- [ ] **T025** [P] [US1] Write `LimitsTest`, which no baseline test covers: a body over the size limit and a body with more entries than the entry limit are each unreadable with one finding, read with small limits passed through `FblOptions` (FR-013) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/LimitsTest.java
- [ ] **T026** [P] [US1] Port `Support/NaturalIds.cs` as a `deriveId` function keyed by binding and rule. It lives under `src/test` because it names bindings (research R10) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/support/NaturalIds.java

**⟶ Wait for Wave 1 to finish, then:**

- [ ] **T027** [US1] Write `ConformanceFixturesTest`, porting `Conformance/ConformanceFixtures.Tests.cs`: the fixtures are found (eight, and none fails), every step of every fixture (the reading it lists, then the step's splices by operation, start, end and text, then its document, or its `refused` reason with the bytes unchanged), and every byte of an input that is not a registration belongs to the reading. A fixture whose input ends in `.adp` runs against the registration with no body beside it. The runner supports `expectFile`, a splice's `file` and `add.after` as the source's does (research R13). `fixture.json` is read with the platform's Gson, on the test classpath only (FR-016) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/conformance/ConformanceFixturesTest.java

### Implementation

**⟶ Wait for T027 to finish, then:**

- [ ] **T028** [US1] Port `Planning/_Model/` and `Planning/Plan.cs`: `ModelChange` (save, add, set, remove, place, identify), `PlanResult` (the splices or a refusal with its reason), `Plan` and `EmitPart` · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/plan/ModelChange.java, PlanResult.java, Plan.java, EmitPart.java

**⟶ Wait for T028 to finish, then:**

**Wave 2 — independent (different files):**

- [ ] **T029** [P] [US1] Port `Rules/FamilyReader.cs` and `Rules/Selector.cs`: entries, candidates, slots and trivia, such that every byte of a readable body belongs to an entry or to trivia · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/rule/FamilyReader.java, etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/rule/Selector.java
- [ ] **T030** [P] [US1] Port `Planning/NewText.cs`, with its number writing in `NumberText`: ECMAScript's `Number.prototype.toString` shaped from `Double.toString`, fixed decimals through `BigDecimal` and `RoundingMode.HALF_UP`. T023 passes · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/plan/NewText.java, etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/plan/NumberText.java
- [ ] **T031** [P] [US1] Port `Files/Yaml/YamlScalars.cs`. T022 passes · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/family/yaml/YamlScalars.java

**⟶ Wait for Wave 2 to finish, then:**

- [ ] **T032** [US1] Port `Rules/TreeFamily.cs`: the tree values and entries the yaml and json families share · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/rule/TreeFamily.java

**⟶ Wait for T032 to finish, then:**

**Wave 3 — independent (one family each, read and write):**

- [ ] **T033** [P] [US1] Port `Files/Yaml/YamlParser.cs`, `FlowReader.cs` and `YamlFamily.cs`. The module's own parser decides whether a body is well-formed: one it cannot parse at the top level is unreadable (research R5) · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/family/yaml/YamlParser.java, FlowReader.java, YamlFamily.java
- [ ] **T034** [P] [US1] Port the rest of `Files/Json/JsonFamily.cs` on T016's parser · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/family/json/JsonFamily.java
- [ ] **T035** [P] [US1] Port `Files/Xml/XmlFamily.cs` and its `_Model/`: a scanner over bytes that keeps carriage returns, with `self-close` and `open-block`. `core`'s `XmlScanner` is not used (research R3) · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/family/xml/
- [ ] **T036** [P] [US1] Port `Files/Lines/LinesFamily.cs`, for `lines` and `blocks`, with `re-emit-line` and `open-block` · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/family/lines/LinesFamily.java

**⟶ Wait for Wave 3 to finish, then:**

- [ ] **T037** [US1] Port `Rules/BodyReading.cs`: an entry becomes at most one element or relation, taken by the first rule in binding order; findings and never a failure for an entry without an id, two equal ids and a missing header; an unreadable body gives an empty model with one finding; the size and entry limits; `deriveId` for an entry whose rule stores no id. T025 passes · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/rule/BodyReading.java

**⟶ Wait for T037 to finish, then:**

- [ ] **T038** [US1] Port `Planning/EditPlanner.cs`: a save plans no splice, a change that cannot be planned is refused whole, and the same body, binding and change give the same splices · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/plan/EditPlanner.java

**⟶ Wait for T038 to finish, then:**

- [ ] **T039** [US1] Port `History/SplicedFile.cs`, `EditHistory.cs` and `OpenBody.cs`: bytes spliced and read again after every edit, an entry with the SHA-256 before and after, undo and redo refused on drift with nothing written, no entry for an edit without splices, saving through the writer callback, an unreadable body never saved (research R9). T024 passes · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/history/SplicedFile.java, EditHistory.java, OpenBody.java

**⟶ Wait for T039 to finish, then:**

- [ ] **T040** [US1] Port `Registration/RegistrationDocument.cs` and `OpenRegistration.cs`: origin, headers in order, the layout and identities blocks with the span of every entry, layout numbers at three decimals, an unknown header kept and reported, a stale layout entry reported and removed at the next write. T021 passes · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/registration/RegistrationDocument.java, etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/registration/OpenRegistration.java

**⟶ Wait for T040 to finish, then:**

- [ ] **T041** [US1] Run T027 until all eight fixtures pass. A splice that differs from a fixture's is a fault of the port, to be found in the source, never a reason to change a fixture. Then write LF where a body has CRLF, see a fixture fail, and take the fault out (SC-001, SC-005) · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/

**Checkpoint**: SC-001. All eight fixtures pass, with `ReadingTest`, `YamlScalarsTest`, `NumberTextTest`, `HistoryTest` and `LimitsTest`.

---

## Phase 4: User Story 2 - Every check standalone has, this host has (Priority: P1)

**Goal**: the rest of the baseline: finding a registration's body, legacy sidecars, routing, folder recognition, templates and the host's side of a plugin.

**Independent Test**: `./gradlew :fbl:test` passes but for `BaselineCoverageTest`, which now misses only the real-file counterparts of Phase 5.

Files: `fbl/src/main/java/etalii/adp/fbl/` `registration/BodyLocator.java`, `registration/LegacySidecar.java`, `routing/`, `plugin/`.

### Tests

Owned test files: `registration/RegistrationTest`, `routing/RoutingTest`, `routing/TemplatesTest`, `plugin/PluginBodyTest`, `support/FakePlugin`.

**Wave 1 — independent (different files):**

- [ ] **T042** [P] [US2] Write `RegistrationTest`: the 9 counterparts of `Registration/Registration.Tests.cs` (one theory of 2 rows). The test of a body reached through a link uses T006's assumption · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/registration/RegistrationTest.java
- [ ] **T043** [P] [US2] Write `RoutingTest`: the 9 counterparts of `Routing/Routing.Tests.cs` (three theories, 17 rows). The folder test that must not follow a link uses T006's assumption · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/routing/RoutingTest.java
- [ ] **T044** [P] [US2] Write `TemplatesTest`: the 5 counterparts of `Routing/Templates.Tests.cs` (one theory of 6 rows, one over every template the copied bindings declare, with a guard on their count) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/routing/TemplatesTest.java
- [ ] **T045** [P] [US2] Write `PluginBodyTest`, the 5 counterparts of `Plugins/PluginBody.Tests.cs`, and `FakePlugin`, which stands in for a persistence plugin · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/plugin/PluginBodyTest.java, etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/support/FakePlugin.java

### Implementation

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2 — independent (different files):**

- [ ] **T046** [P] [US2] Port `Registration/BodyLocator.cs`: the body found as FBL section 8.2 says, within a root the caller passes; refused when the path is absolute, leaves the root or passes through a link (`Files.isSymbolicLink` and `toRealPath` containment, research R19) · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/registration/BodyLocator.java
- [ ] **T047** [P] [US2] Port `Registration/LegacySidecar.cs`: a JSON file read and written by json splices, as a `SplicedFile` · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/registration/LegacySidecar.java
- [ ] **T048** [P] [US2] Port `Routing/MarkerEvaluator.cs`, on T017's `Glob`: a pattern marker looks at the lines `FblOptions` says, and a YAML `rootKey` marker is read by the module's own parser · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/routing/MarkerEvaluator.java
- [ ] **T049** [P] [US2] Port `Plugins/IPersistencePlugin.cs`, its `_Model/` and `Plugins/PluginBody.cs`: without its plugin a body opens read-only with a finding that says why; with one, its splices are applied, recorded and undone as any other. T045 passes · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/plugin/

**⟶ Wait for Wave 2 to finish, then:**

**Wave 3 — independent (different files):**

- [ ] **T050** [P] [US2] Port `Routing/Router.cs` and `Routing/FolderSubject.cs`: the candidate bindings of a file or folder in their order, and a folder subject's files selected without following a link. T042 and T043 pass · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/routing/Router.java, etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/routing/FolderSubject.java
- [ ] **T051** [P] [US2] Port `Routing/TemplateWriter.cs`: a binding's template with its placeholders replaced and nothing else, never evaluated. T044 passes · etalii.adp.ide.intellij/fbl/src/main/java/etalii/adp/fbl/routing/TemplateWriter.java

**Checkpoint**: the 68 rule tests and the 3 fixture tests have passing counterparts. On Windows the two link tests are skipped with their reason.

---

## Phase 5: User Story 3 - The bindings are tried on real files (Priority: P2)

**Goal**: the five properties over every real file a declared binding claims, the registration tests, the comparison with the FreeMind module's parser, and the divergence record.

**Independent Test**: `./gradlew :fbl:test --tests "etalii.adp.fbl.real.*"` passes with at least 108, 15, 4, 16, 4 and 2 files, and a `.mm` added under `freemind/testdata` is picked up without a change to the tests.

Files: `fbl/testdata/real/`, `fbl/testdata/divergences.json`.

### Tests

Owned test files: everything under `fbl/src/test/java/etalii/adp/fbl/real/`.

- [ ] **T052** [US3] Write, with `git -C ../etalii.adp.ide.standalone archive 25fc7b4a`, the files the source's `RealFiles/RealFileCorpus.cs` selects for timeline (15), causal loop (4), structurizr (16), databricks job (4) and databricks pipeline (2), and every `.adp` beside one of them that names it, with their paths under `src/` kept. Add `README.md` (the commit, Apache-2.0). Refuse a file whose licence is share-alike or unknown, and check that none holds the previous host's name (FR-019, research R15) · etalii.adp.ide.intellij/fbl/testdata/real/

**⟶ Wait for T052 to finish, then:**

**Wave 1 — independent (different files):**

- [ ] **T053** [P] [US3] Port `RealFiles/RealFileCorpus.cs`: the enumeration of `fbl/testdata/real/` by the source's selection rules, and of every `.mm` under `adp.freemind.testdata`, each with its recorded minimum (108, 15, 4, 16, 4, 2, and the registrations as counted in T052) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/real/RealFileCorpus.java
- [ ] **T054** [P] [US3] Port `RealFiles/Divergences.cs` and start the record as an empty array: an unlisted disagreement fails, a listed one observed differently fails, a listed one that no longer occurs fails, and every entry has a reason and names a file of the corpus (FR-022, research R16) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/real/Divergences.java, etalii.adp.ide.intellij/fbl/testdata/divergences.json

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2 — independent (different files):**

- [ ] **T055** [P] [US3] Write `DeclaredBodiesTest`: the 7 counterparts of `RealFiles/DeclaredBodies.Tests.cs`, the five properties of contracts/build-interface.md over binding and file, each with a guard on the count · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/real/DeclaredBodiesTest.java
- [ ] **T056** [P] [US3] Write `RegistrationsTest`: the counterparts of `TheEnumerationFindsTheRegistrations`, `TheRegistrationParsesAndSavesUnchanged` and `ADeclaredBindingsRegistrationOpensItsBody`. The other four of `RealFiles/Registrations.Tests.cs` are the inventory's `not applicable` rows (FR-021) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/real/RegistrationsTest.java
- [ ] **T057** [P] [US3] Write `FreeMindCrossCheckTest`: for each of the 108 maps, `MindMapParser.parse(String)` walked from the root in document order collecting `MapNode.id()`, compared with the ids the `node` rule of `mindmap.fbl#freeplane` reads, in order. A file one side refuses and the other reads is a divergence of property `cross-check`. Nothing in `freemind` changes (FR-020, research R17) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/real/FreeMindCrossCheckTest.java

### Implementation

**⟶ Wait for Wave 2 to finish, then:**

- [ ] **T058** [US3] Run T055 to T057 and settle every failure. A fault of the port is fixed under `fbl/src/main` and pinned by a test in `PortFaultsTest`. A disagreement between a copied binding and a real file is entered in `divergences.json` with what was observed and why, only when this host's tests show it. No binding is edited, no file skipped and no assertion weakened. An entry that differs from the source's `RealFiles/divergences.json`, or one of the source's that does not arise here, is noted for T065 · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/real/PortFaultsTest.java

**Checkpoint**: SC-002, SC-003 and SC-004. `./gradlew :fbl:test` passes whole, `BaselineCoverageTest` included: 82 counterparts and 4 rows not applicable.

---

## Phase 6: User Story 4 - It runs inside the IDE (Priority: P3)

**Goal**: the library is in the built plug-in and proven on the headless platform by one test.

**Independent Test**: `./gradlew --offline :fbl:test --tests "*FblOnThePlatformTest"` passes, and `./gradlew integrationTest --tests "*FblInPluginIntegrationTest"` finds the classes in the zip.

Files: `build.gradle.kts`.

### Tests

Owned test files: `fbl/.../platform/FblOnThePlatformTest`, `src/integrationTest/.../FblInPluginIntegrationTest`.

**Wave 1 — independent (different files):**

- [ ] **T059** [P] [US4] Write `FblOnThePlatformTest`, a JUnit 4 `BasePlatformTestCase`: load `timeline.fbl`, read the `timeline-edits` fixture's body from a file in the test project, save it unchanged, make the fixture's first edit and undo it, comparing bytes each time. It adds no behaviour, so see it fail by comparing against a wrong expected document once, then correct it (FR-023, research R18) · etalii.adp.ide.intellij/fbl/src/test/java/etalii/adp/fbl/platform/FblOnThePlatformTest.java
- [ ] **T060** [P] [US4] Write `FblInPluginIntegrationTest`, as `NoPreviousHostIntegrationTest` inspects the zip: the built zip holds classes under `etalii/adp/fbl/`. It starts no IDE, and fails until T061 (FR-002) · etalii.adp.ide.intellij/src/integrationTest/java/etalii/adp/it/FblInPluginIntegrationTest.java

### Implementation

**⟶ Wait for Wave 1 to finish, then:**

- [ ] **T061** [US4] Add `pluginComposedModule(implementation(project(":fbl")))` beside the three existing ones, and nothing else: no descriptor fragment, no `xi:include`, no entry in `gradle/allowed-licences.properties`. T060 passes, and `git diff origin/develop --stat -- core freemind drawio src/main` is empty (FR-004, SC-007) · etalii.adp.ide.intellij/build.gradle.kts

**Checkpoint**: SC-006. Both tests pass, and nothing a user can see or do has changed.

---

## Phase 7: Polish, reporting back and delivery

**Purpose**: FR-025 to FR-027, SC-007 to SC-009, and the pull requests.

**Wave 1 — independent (different files):**

- [ ] **T062** [P] Add a row for `fbl` to the layout table under "Build" and a short section saying: the plug-in carries a generic FBL implementation; it claims *Host, declared* of FBL 0.1 for `yaml`, `json`, `xml`, `lines` and `blocks`, without section 9 and without the loader checks that need DISL; both corpora with their commits; no tool uses it yet, and the tool that first does must join FBL's history to the platform's undo (FR-026, research R20, R22). Use the glossary's words: the Build workflow checks them · etalii.adp.ide.intellij/README.md
- [ ] **T063** [P] Add `fbl` and the missing `drawio` to the "Modules:" line · etalii.adp.ide.intellij/CLAUDE.md

**⟶ Wait for Wave 1 to finish, then:**

- [ ] **T064** Validate against the Success Criteria in the worktree: `./gradlew build -x integrationTest` and `./gradlew integrationTest --tests "*FblInPluginIntegrationTest"` pass with no compiler warning; `./gradlew --offline :fbl:test` passes; the test tasks take at most twice what T002 noted (SC-008); every test that existed before passes unchanged (SC-007); `python3 .github/scripts/skipped-tests.py` lists the two link tests and nothing else of `fbl` when run on Windows · etalii.adp.ide.intellij/fbl/

**⟶ Wait for T064 to finish, then:**

- [ ] **T065** File one issue in `etalii-adp/etalii.adp` before pull request 1 is merged: which YAML is well-formed (research R5), the refusal sentences (R11), a class for a host without DISL (R20), the `branch` rule of `mindmap.fbl` that can never match, and every entry of `divergences.json` marked as known from standalone or new, with the differences T058 noted (FR-027, SC-009) · etalii.adp/specs/010-intellij-fbl-implementation/tasks.md

**⟶ Wait for T065 to finish, then:**

- [ ] **T066** Push `features/010-intellij-fbl-implementation` of `etalii.adp.ide.intellij` and open pull request 1 into `develop`. Its description names `specs/010-intellij-fbl-implementation/` in `etalii.adp`, the `etalii.adp` commit these tasks were taken from, the two measured durations of T064, and T065's issue. Its Build run is green in both test jobs (FR-025) · etalii.adp.ide.intellij/

**⟶ Wait for T066 to finish, then:**

- [ ] **T067** After pull request 1 is merged with a merge commit: delete its branch locally and on `origin` and remove its worktree. Then tick T002 to T066 here, on a branch of `etalii.adp`, with the link to the issue, and open pull request B into `develop` · etalii.adp/specs/010-intellij-fbl-implementation/tasks.md

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: nothing before it. T003 is committed before T005.
- **Phase 2 (Foundational)**: needs Phase 1. Blocks every story.
- **Phase 3 (US1)**: needs Phase 2.
- **Phase 4 (US2)**: needs Phase 3. Body location, sidecars, routing, templates and plugins stand on `SplicedFile`, `OpenBody`, `BodyReading` and `RegistrationDocument`.
- **Phase 5 (US3)**: needs Phases 3 and 4.
- **Phase 6 (US4)**: needs Phase 3 only. It can run beside Phases 4 and 5: it owns `build.gradle.kts` and two test files nobody else touches.
- **Phase 7 (Polish)**: needs every story.

### Waves, phase by phase

- **Phase 1**: Wave 1 (T001, T002) → Wave 2 (T003, T004) → Wave 3 (T005, T006) → Wave 4 (T007, T008, T009).
- **Phase 2**: tests (T010, T011, T012) → T013 → Wave 2 (T014, T015, T016, T017) → T018 → T019 → T020.
- **Phase 3**: tests (T021 to T026) → T027 → T028 → Wave 2 (T029, T030, T031) → T032 → Wave 3, the four families (T033 to T036) → T037 → T038 → T039 → T040 → T041.
- **Phase 4**: tests (T042 to T045) → Wave 2 (T046 to T049) → Wave 3 (T050, T051).
- **Phase 5**: T052 → Wave 1 (T053, T054) → Wave 2 (T055, T056, T057) → T058.
- **Phase 6**: tests (T059, T060) → T061.
- **Phase 7**: Wave 1 (T062, T063) → T064 → T065 → T066 → T067.

### Commits

Each layer is one commit of failing tests followed by one that makes them pass (plan, "How it is built"). The tests of Phase 3 are written in one wave but go green layer by layer, in the order of its implementation waves.

### Three pull requests

| Pull request | Opened by | Into | Carries |
| --- | --- | --- | --- |
| A | T001 | `etalii.adp` `develop` | the specification, the plan, these tasks |
| 1 | T066 | `etalii.adp.ide.intellij` `develop` | T002 to T064 |
| B | T067 | `etalii.adp` `develop` | the tasks ticked, the issue linked |

## Notes

- The large tasks are T018, T019, T033, T035, T036, T037, T038 and T040. Each is one file or one family of the source with its tests already written.
- A fixture, a copied binding and a file under `etalii.adp.ide.intellij/fbl/testdata/conformance/` or `real/` are never edited. A newer FBL is taken up by copying the corpus again.
- The source's divergence record holds 42 entries: 13 cross-checks (5 mindmap, 8 structurizr) and 29 on registrations and one unreadable body. The 13 compare with module parsers and do not carry over: this host's one cross-check compares node ids with the FreeMind module. How many of the 29 arise depends on which registrations T052 copies. No count is a target (T058).
