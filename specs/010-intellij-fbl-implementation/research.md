# Research: A Generic FBL Implementation for IntelliJ

Read for this plan: `specifications/fbl/` at `30206ea`, standalone's FBL library and tests at `25fc7b4a`, and `etalii.adp.ide.intellij` at `e1b5f35` (its `origin/develop` is `6a976b9`, which differs by one line of `CLAUDE.md`). The spec has no open clarification markers.

## R1. Where the code lives

**Decision**: a new Gradle module `fbl`, package `etalii.adp.fbl`, added to `settings.gradle.kts` and composed into the plug-in with `pluginComposedModule(implementation(project(":fbl")))`. It has no descriptor fragment and no `xi:include`.

**Rationale**: composing it puts it in the zip (FR-002). Registering nothing keeps FR-004. A module of its own gives one command for its tests (SC-008).

**Alternatives considered**: a package inside `core`. Rejected, because `core` imports the platform and "knows no file format", and its tests would mix with platform tests.

## R2. Free of the platform

**Decision**: no file under `fbl/src/main` imports `com.intellij`, `java.awt`, `javax.swing`, `java.net` or `java.nio.channels`. `HostFreeTest` scans the import lines, as `freemind`'s `FormatPurityTest` and `NoNetworkAccessTest` do, in one test for this module.

**Rationale**: it is the repository's existing mechanism for FR-003, and the network half covers FR-002. The existing `NoNetworkAccessTest` copies name their modules, so `fbl` needs its own.

**Alternatives considered**: a plain `java-library` module without the platform plug-in. Rejected for now: the one platform test would need a second module, and the module template every other module uses already works.

## R3. Bytes, not characters

**Decision**: a body is a `byte[]` wrapped in `BodyText`, and every span and splice is a pair of byte offsets, start inclusive, end exclusive, with the byte-order mark counted. `core`'s `TextChange`, `TextChanges` and `core.xml` are not used.

**Rationale**: FBL's fixtures state byte offsets. The existing code counts UTF-16 characters over a decoded `String`, which cannot hold an invalid UTF-8 body and differs from bytes in 16 of the 108 maps.

**Alternatives considered**: a byte-to-character map over `core.xml`. Rejected: `TextChanges` imports the platform's `Document`, and the map cannot express invalid sequences.

## R4. Parsers

**Decision**: hand-written, span-preserving parsers for JSON, YAML, XML and lines, ported from standalone's `Files/`. The FBL document itself is read by the same JSON parser, which is how a duplicate key gets its location. No third-party library, at run time or compile time.

**Rationale**: see Complexity Tracking in the plan. Gson stays what it is today, a test-only helper from the platform's classpath, used to read `fixture.json`.

**Alternatives considered**: Jackson or SnakeYAML from the platform. Rejected: no spans, not guaranteed across products, and `verifyDependencyLicences` would need an entry for anything shipped.

## R5. Whether a YAML body is well-formed

**Decision**: the module's own YAML parser decides. A body it cannot parse at the top level is unreadable, with one finding, and is never saved. Standalone asks YamlDotNet instead, and also uses it to read the root key for a `rootKey` marker. Here the own parser does both.

**Rationale**: no YAML library may be shipped (R4). An unreadable body is the safe side: nothing is written.

**Alternatives considered**: SnakeYAML Engine from the platform. Rejected with R4.

**Open question for `etalii.adp`**: FBL does not say which YAML a host must accept, so two hosts can disagree on whether a body is readable. No fixture and no file of the corpus shows a difference today. Reported under FR-027.

## R6. Regular expressions and their time bound

**Decision**: `java.util.regex`, behind a port of standalone's subset validator, which rejects by the name of the construct and rewrites `\d`, `\w` and case-insensitivity to ASCII classes. The bound is a `CharSequence` wrapper whose `charAt` throws once a deadline has passed. The default is 250 ms, from `FblOptions`. A timeout is the warning `fbl.regex-timeout`, and the line reads as not matching.

**Rationale**: Java's regex has no timeout of its own. The wrapper needs no thread and no library, and the rewriting makes both hosts match the same characters.

**Alternatives considered**: running each match on a worker thread with a timed wait (a thread per match, and the match cannot be stopped); RE2/J (a new shipped dependency).

## R7. CEL

**Decision**: port standalone's compiler and evaluator. It covers what the bindings use: `has()`, member access, ternaries, `==`, `!=`, `&&`, `||`, list literals and `in`. Anything else is rejected at load by the name of the construct.

**Rationale**: FBL allows a subset, the baseline tests carry 24 expression rows that pin it, and no CEL library is bundled.

**Alternatives considered**: `cel-java`. Rejected: a shipped dependency with a protobuf runtime, for a subset this small.

## R8. Numbers in new text

**Decision**: `NumberText` writes a number in the form of ECMAScript's `Number.prototype.toString`, built from `Double.toString`, which is the shortest round-trip form since JDK 19, and re-shaped: no trailing `.0`, exponent form only where ECMAScript uses it. Fixed decimals (the registration's three-decimal form) use `BigDecimal` with `RoundingMode.HALF_UP`.

**Rationale**: it is what standalone writes, and `Double.toString` alone gives `640.0` and `1.0E21`. No baseline test targets this, so `NumberText` gets tests of its own with the values the fixtures and the legacy-layout test use.

**Alternatives considered**: `String.format`. Rejected: locale-sensitive and not shortest round-trip.

## R9. History and drift

**Decision**: as standalone. One base type, `SplicedFile`, for anything written by splices: body, registration, legacy sidecar and plugin body. After every edit the bytes are spliced and read again, and the model is never patched. Each history entry keeps the SHA-256 of the bytes before and after (`MessageDigest`). Undo and redo take the current bytes and refuse on a mismatch. An edit that plans no splices leaves no entry. Saving goes through a writer callback, and the module opens no file for writing itself.

**Rationale**: these are the behaviours the History tests and the fixtures pin.

## R10. Ids that DISL would derive

**Decision**: `FblOptions` carries an optional `deriveId` function, called for an entry whose rule stores no id. The tests supply `NaturalIds`, a port of standalone's, keyed by binding and rule. It lives under `src/test`.

**Rationale**: most fixture ids (`task:ingest`, `edge:ingest->quality_gate`, `link:population|births`) follow DISL, which stays out of this feature. Main code must name no binding (FR-001), so the derivations cannot live there.

## R11. Refusal sentences

**Decision**: a refused fixture step is compared by its reason string and by the bytes being unchanged. The refusal and drift sentences are standalone's, copied word for word, including "outside the workspace", although this host says "project".

**Rationale**: the baseline tests assert these strings, and FR-017 asks for the same expected results.

**Open question for `etalii.adp`**: FBL specifies none of the sentences. One fixture compares one (`The settings file has no "schema" to rewrite.`), which no binding contains. Either the fixture should compare the refusal alone, or FBL should list the sentences. Reported under FR-027.

## R12. The conformance corpus

**Decision**: `fbl/testdata/conformance/` holds the eight `.fbl` documents, `fixtures/` and `registrations/`, written with `git archive` from the `etalii.adp` commit on `develop` at the time of copying, so that no checkout converts them. Before the first file is added, `.gitattributes` gains `fbl/testdata/** -text`. A `README.md` beside them records the commit, the licence (Apache-2.0) and that the files are never edited there. `SHA256SUMS` lists every file, and `CorpusUnchangedTest` checks each one against it and fails when the folder is empty.

**Rationale**: the `.fbl` files are `text=auto` in `etalii.adp`, so a copy from a Windows working tree differs from the blob. The digest list is what notices a converted or edited copy (FR-015 and the edge case), and it names the file.

**Alternatives considered**: a `.LICENSE` sibling per file, the repository's convention for single examples. Rejected for about 30 files with one source and one licence. A git submodule: rejected, the spec leaves a shared package of fixtures out.

## R13. Running the fixtures

**Decision**: `ConformanceFixturesTest` ports standalone's three fixture tests: every step of every fixture, byte coverage of every input that is not a registration, and discovery failing on zero. A step's splices are compared first (operation, start, end, text), then the document. A fixture whose input ends in `.adp` runs against the registration with no body beside it.

**Notes for the tasks**: no fixture has a redo step and three list no reading, so redo and tolerant reading are proven by the History and Reading tests only. `expectFile`, a splice's `file` and `add.after` appear in no fixture, and the runner supports them as standalone's does.

## R14. The baseline and its inventory

**Decision**: `fbl/testdata/baseline/fbl-test-inventory.md` is a table of 86 rows: the baseline test (`File.Method`), its counterpart (`Class.method`) or `not applicable` with the reason. `BaselineCoverageTest` parses it, asserts 86 rows, and asserts that every named class and method exists. Counterparts keep standalone's method names in lower camel case, and its 117 theory rows become `@ParameterizedTest` rows with the same values.

**Rationale**: this is `InventoryCoverageTest`'s pattern, already in the repository, and it makes the correspondence of FR-017 readable and checked.

**Not applicable, as FR-018 expects**: the four registration tests that need standalone's C4 legacy sidecars, W3C reading suggestions, chart folders and Turtle files, and the three module parsers of the cross-check this host does not have (timeline, causal loop, C4). The legacy sidecar and the plugin contract themselves are still covered, by the Registration and Plugins counterparts.

## R15. The real-file corpus

**Decision**: two parts.

- The repository's own maps: all 108 `.mm` files under `freemind/testdata`, read through a second system property, `adp.freemind.testdata`. The recorded minimum is 108. The 7 under `examples/` carry licence files. The 101 under `reference/` are results of this repository's own scripted edits on those 7, and count because the spec says every `.mm` file.
- `fbl/testdata/real/`: the files standalone's `RealFileCorpus` selects at `25fc7b4a` for its five other declared bindings (timeline 15, causal loop 4, structurizr 16, databricks job 4, databricks pipeline 2), and every `.adp` beside them that names one of them. They are written with `git archive`, with their paths under `src/` kept. A `README.md` records the commit and the Apache-2.0 licence. The selection rules are standalone's, including the content rules for the two databricks bindings.

**Rationale**: the same files give the same inputs as the baseline's real-file tests. With the paths kept, this host's divergence record can be compared with standalone's entry by entry, and a difference between the two is a finding under FR-014.

**Alternatives considered**: one file per binding, the minimum FR-019 allows. Rejected: it would leave most of the baseline's real-file inputs behind for no saving in code.

**Checked at copy time**: no copied file contains the previous host's name, which `NoPreviousHostIntegrationTest` scans every tracked file for.

## R16. The divergence record

**Decision**: `fbl/testdata/divergences.json`, a list of `{property, binding, file, observed, reason}`, in standalone's shape and with its property names. A check fails on an unlisted disagreement, on a listed one whose observation changed, and on a listed one that no longer occurs.

**Expected content**: standalone records 42. The 5 for mindmap branches do not arise, because FR-020 compares node ids only. The other 37 are on files this plan copies, so they are expected here with the same observations. Each is entered only when this host's tests show it. The FR-027 issue lists them as already known from standalone and marks any that is new or missing.

## R17. The FreeMind cross-check

**Decision**: `FreeMindCrossCheckTest`, for each of the 108 maps: parse with `MindMapParser.parse(String)`, walk the tree from the root in document order collecting `MapNode.id()`, and compare with the ids of the elements the `node` rule of `mindmap.fbl#freeplane` reads, in order. A file the module's parser refuses but the binding reads, or the reverse, is a divergence of property `cross-check`.

**Rationale**: `MindMap.nodesByKey()` is unordered and its keys fall back to an index path for a missing or repeated `ID`, so the keys are not the ids. Every node in today's corpus has a unique `ID`, so the record is expected to start empty for this property.

## R18. The test in a headless IDE

**Decision**: two tests.

- `FblOnThePlatformTest` in `fbl`, a JUnit 4 `BasePlatformTestCase`: it loads `timeline.fbl`, reads the `timeline-edits` fixture's body from a file in the test project, saves it unchanged, makes the fixture's first edit and undoes it, comparing bytes each time. It runs in `:fbl:test` and so in the `build` job.
- `FblInPluginIntegrationTest` in `src/integrationTest`: it opens the built zip and asserts it holds `etalii/adp/fbl/` classes, as `NoPreviousHostIntegrationTest` inspects the zip. It starts no IDE.

**Rationale**: SC-006 asks for the network to be off. A Starter test downloads its IDE, so it cannot meet that, and with nothing registered it would need an entry point added to the plug-in only to be called. The in-process test proves the code runs on the platform's runtime and class loading. The zip test proves it ships. `HostFreeTest` proves it opens no connection.

**Alternatives considered**: a Starter and Driver test through `@Remote`. Rejected for the reasons above. If the review of this plan wants the fixture walked inside a real IDE from the installed zip, that is one more integration test and one static entry point, and SC-006's wording changes.

## R19. Limits

**Decision**: `FblOptions` carries standalone's defaults: 32 MiB for a body, 500,000 entries, 250 ms for a match, 64 KiB for a suggestion, 20 lines for a pattern marker. Paths resolve within a root the caller passes, and a link is refused through `Files.isSymbolicLink` and `toRealPath` containment. `LimitsTest` covers the size and entry limits, which no baseline test does.

**Notes for the tasks**: the two link tests create a symbolic link, which needs privilege on Windows. They use a JUnit assumption there and run on the Linux build job, and `skipped-tests.py` reports the skip. Path and glob matching ignore case on Windows and macOS only, as in standalone.

## R20. What the claim leaves out

**Decision**: the README states the claim as *Host, declared* for the five families, with two exceptions spelled out: section 9 (several readings sharing one open body) is not implemented, and the loader checks of section 14.1 that need DISL (a rule's `type` naming a type, no `fixed` attribute bound, a plugin declared by the specification) are not made.

**Open question for `etalii.adp`**: section 15.1 has no class for a host without DISL. Reported under FR-027.

## R21. Compiler warnings

**Decision**: `fbl/build.gradle.kts` adds `-Xlint:all` and `-Werror` to its `JavaCompile` tasks.

**Rationale**: FR-025 requires a build free of warnings, and no build script enforces it today. Turning it on for the other modules is not this feature's change.

## R22. Documentation

**Decision**: `README.md` gains a row for `fbl` in the layout table under "Build" and a short section with FR-026's four statements. `CLAUDE.md`'s "Modules:" line gains `fbl`, and `drawio`, which it omits today. `docs/tools.md` is not touched: no tool type is added.

## Reported to `etalii.adp` (FR-027)

One issue, filed before the pull request is merged, holding: R5 (which YAML is well-formed), R11 (refusal sentences), R20 (a class for a host without DISL), the `branch` rule of `mindmap.fbl` that can never match because `node` takes every entry first, and the divergence record with each entry marked as known from standalone or new.
