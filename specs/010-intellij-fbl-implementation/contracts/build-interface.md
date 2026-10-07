# Contract: build and test interface

What a contributor and the Build workflow run, and the test classes that carry each requirement. All paths are in `etalii.adp.ide.intellij`.

## Commands

| Command | What it runs | Needs |
| --- | --- | --- |
| `./gradlew :fbl:test` | Every test of the module: the rule tests, the fixtures, the real files, the cross-check and `FblOnThePlatformTest` | No network, no running IDE started by the contributor |

`./gradlew :fbl:test` is the one command of SC-008. It takes no more than twice the time the repository's unit tests take today.

`FblInPluginIntegrationTest` runs with the repository's existing integration tests, from `src/integrationTest`, against the built zip.

## System properties

| Property | Meaning |
| --- | --- |
| `adp.freemind.testdata` | The folder `freemind/testdata`, from which the `fbl` tests read the repository's `.mm` maps |

## Build wiring

| File | Change |
| --- | --- |
| `.gitattributes` | `fbl/testdata/** -text` |
| `settings.gradle.kts` | `"fbl"` |
| `build.gradle.kts` | `pluginComposedModule(implementation(project(":fbl")))` |
| `fbl/build.gradle.kts` | Cloned from `freemind/build.gradle.kts`, with `testImplementation(project(":freemind"))` and `-Xlint:all -Werror` |
| `README.md` | A row for `fbl` in the layout table under "Build", and a section with FR-026's four statements |
| `CLAUDE.md` | The "Modules:" line gains `fbl` and `drawio` |

Nothing in `core`, `freemind` or `drawio` changes.

## Build workflow

The repository's Build workflow runs all of these tests on every pull request and on `develop`. A failing test fails the build, and so does a compiler warning in `fbl` (FR-025). The two tests that create a symbolic link use a JUnit assumption on Windows and run on the Linux build job. `skipped-tests.py` reports the skip.

## Test classes

Under `fbl/src/test/java/etalii/adp/fbl/` unless a path is given.

| Class | Proves | Requirement |
| --- | --- | --- |
| `conformance/ConformanceFixturesTest` | Every step of every fixture, splices first (operation, start, end, text) and then the document; byte coverage of every input that is not a registration; discovery fails on zero | FR-016, SC-001, SC-005 |
| `conformance/CorpusUnchangedTest` | Every copied file matches `SHA256SUMS` | FR-015 |
| `text/`, `document/`, `expression/`, `rule/`, `history/`, `registration/`, `routing/`, `plugin/`, `yaml/` | The 68 rule tests, one counterpart for each baseline test of those areas | FR-017 |
| `BaselineCoverageTest` | The inventory has 86 rows and every counterpart exists | FR-017, FR-018, SC-002 |
| `real/DeclaredBodiesTest` | The real-file properties over every file of the corpus | FR-019, SC-003 |
| `real/RegistrationsTest` | Every real `.adp` is parsed and saved unchanged | FR-021 |
| `real/FreeMindCrossCheckTest` | For each `.mm` map, the ids the `node` rule of `mindmap.fbl#freeplane` reads equal `MapNode.id()` collected from `MindMapParser.parse(String)` in document order | FR-020, SC-004 |
| `real/RealFileCorpus`, `real/Divergences` | Enumeration with recorded minimums, and the divergence record's three failures | FR-021, FR-022 |
| `platform/FblOnThePlatformTest` | JUnit 4, `BasePlatformTestCase`: loads `timeline.fbl`, reads the `timeline-edits` fixture's body, saves it unchanged, makes the fixture's first edit and undoes it, comparing bytes each time | FR-023, SC-006 |
| `HostFreeTest` | No forbidden import under `fbl/src/main` | FR-002, FR-003 |
| `LimitsTest` | The body size and entry count limits | FR-013 |
| `src/integrationTest/java/etalii/adp/it/FblInPluginIntegrationTest` | The built zip holds classes under `etalii/adp/fbl/` | FR-002, SC-006 |

Test support, no part of the library: `support/NaturalIds`, `support/Corpus`, `support/TemporaryFolder`, `support/FakePlugin`.

## The real-file properties

`DeclaredBodiesTest` checks these five for every file a declared binding claims (FR-019):

1. it reads;
2. a save without an edit writes the bytes read;
3. an attribute set changes only the bytes inside its splices, and its undo restores the file exactly;
4. a removal likewise;
5. an undo after the bytes changed from outside is refused, and nothing is written.

## Delivery

One pull request into `develop` of `etalii.adp.ide.intellij`, from `features/010-intellij-fbl-implementation`. Its description names `specs/010-intellij-fbl-implementation/` and the `etalii.adp` commit its tasks were taken from. Each layer is one commit of failing tests followed by one that makes them pass (FR-024). One issue against `etalii.adp` holds the open questions and the divergence record, filed before the pull request is merged (FR-027, SC-009).
