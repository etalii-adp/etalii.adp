# Implementation Plan: A Generic FBL Implementation for IntelliJ

**Branch**: `features/010-intellij-fbl-implementation` | **Date**: 2026-10-06 | **Spec**: [intellij-fbl-implementation.spec.md](intellij-fbl-implementation.spec.md)

**Scale note**: this is a port of a whole library, not a change to one. It adds one Gradle module of roughly 45 source files and 25 test files to `etalii.adp.ide.intellij`, about 190 copied corpus files, and touches five existing files there. Nothing in `core`, `freemind` or `drawio` changes. Watch three things: every offset is a byte offset (the repository's existing code counts characters), the corpus must be protected from line-ending conversion before it is added, and the parsers are written by hand, so the places where they could disagree with standalone are listed in [research.md](research.md) and reported back.

## Summary

`etalii.adp.ide.intellij` gains a module `fbl`: a library that takes bytes and an FBL document and gives back a reading, splices and a history, with no import from the platform. It is a port of standalone's FBL library at `25fc7b4a`, layer by layer, in Java 25 with no third-party dependency. It is composed into the plug-in and registered nowhere.

Its tests are the eight fixtures FBL publishes, a counterpart for each of standalone's 86 tests with the same inputs, the real-file properties over the repository's 108 `.mm` maps and 41 files copied from standalone, a comparison of node ids with the FreeMind module's parser, and one test on the headless platform. An inventory table maps every baseline test to its counterpart, and a test fails when a row names a method that does not exist.

Standalone's baseline was read again on 2026-10-06: `origin/develop` is still `25fc7b4a` and still holds 86 tests, so the eight YAML tests on its unmerged branch are not part of this plan.

## Where the work lands

| Repository | Branch | What |
| --- | --- | --- |
| `etalii.adp` | `features/010-intellij-fbl-implementation` | This plan and its tasks. No change to `specifications/fbl/`. |
| `etalii.adp.ide.intellij` | `features/010-intellij-fbl-implementation`, in its own worktree, from `origin/develop` (`6a976b9` today) | The module, its tests, the corpus and the documentation. One pull request into `develop`, naming this folder and the `etalii.adp` commit the tasks were taken from. |

Open questions and divergences go to `etalii.adp` as one issue (FR-027), filed before the pull request is merged.

## Project Structure

All paths are in `etalii.adp.ide.intellij`.

```text
.gitattributes                      # + fbl/testdata/** -text, added before any corpus file
settings.gradle.kts                 # + "fbl"
build.gradle.kts                    # + pluginComposedModule(implementation(project(":fbl")))
README.md                           # + what the module is, what it claims, where the corpus comes from
CLAUDE.md                           # Modules line: + fbl (and the missing drawio)
src/integrationTest/java/etalii/adp/it/
  FblInPluginIntegrationTest.java   # the built zip holds the fbl classes

fbl/
  build.gradle.kts                  # cloned from freemind/build.gradle.kts; testImplementation(project(":freemind"))
  src/main/java/etalii/adp/fbl/
    Splice.java  Finding.java  FindingCodes.java  FblModel.java  FblOptions.java
    text/          BodyText, Span
    document/      FblDocumentLoader, the model records, Problem
    expression/    RegexSubset, BoundedRegex, Cel
    family/json/   family/yaml/   family/xml/   family/lines/     # span-preserving parsers; lines also serves blocks
    rule/          BodyReading, FamilyReader, TreeFamily, Selector
    plan/          EditPlanner, NewText, NumberText, ModelChange, PlanResult
    history/       SplicedFile, OpenBody, EditHistory
    registration/  RegistrationDocument, OpenRegistration, BodyLocator, LegacySidecar
    routing/       Router, MarkerEvaluator, Glob, FolderSubject, TemplateWriter
    plugin/        PersistencePlugin, PluginBody
  src/test/java/etalii/adp/fbl/
    text/ document/ expression/ rule/ history/ registration/ routing/ plugin/ yaml/   # the 68 rule tests
    conformance/   ConformanceFixturesTest, CorpusUnchangedTest
    real/          DeclaredBodiesTest, RegistrationsTest, FreeMindCrossCheckTest, RealFileCorpus, Divergences
    platform/      FblOnThePlatformTest          # JUnit 4, BasePlatformTestCase
    support/       NaturalIds, Corpus, TemporaryFolder, FakePlugin
    HostFreeTest.java  BaselineCoverageTest.java  LimitsTest.java
  testdata/
    conformance/   *.fbl, fixtures/, registrations/, README.md, SHA256SUMS      # from etalii.adp, unchanged
    real/          src/...  (standalone's paths kept), README.md                # from standalone, unchanged
    baseline/      fbl-test-inventory.md
    divergences.json
```

**Structure Decision**: one new module beside `core`, shared infrastructure in the sense of principle III and not a format module, with every byte of it free of the platform so that `./gradlew :fbl:test` is the one command of SC-008. The cross-check reaches FreeMind's parser through a test-only dependency on `:freemind`. Nothing existing is edited beyond the five files named above.

## How it is built

The layers are ported bottom-up, each with its tests written and seen failing first (FR-024): body text, the JSON parser and the document loader, expressions, the four family parsers, reading, planning, history, registration, routing and templates, plugins. The fixtures and the real files come last, because they need all of it. Each layer is one commit of failing tests followed by one that makes them pass, so the history shows the order.

The decisions that shape the code are in [research.md](research.md). The four that a reviewer should look at first:

1. **Bytes, not characters.** The module has its own byte-level body and scanners. `core`'s XML scanner and `TextChange` count UTF-16 characters and import the platform, so they are not reused.
2. **No library.** JSON, YAML, XML and CEL are parsed by hand-written code, as in standalone. A bundled library gives no byte spans and no duplicate-key locations, and would tie the module to the platform's jars.
3. **The headless IDE test is in-process.** `FblOnThePlatformTest` walks one fixture on the headless platform inside `:fbl:test`, and a second test checks that the built zip holds the classes. A Starter test that drives a downloaded IDE was rejected: it cannot run with the network off, which SC-006 asks for.
4. **The real-file corpus is standalone's own.** The 41 files its five other declared bindings take, with the registrations that name them, copied with their paths kept. The divergence records of the two hosts can then be compared line by line.

## Constitution Check

Checked before research and again after the design. Both passes give the same result.

**`etalii.adp`** ([constitution.md](../../.specify/memory/constitution.md))

| Principle | Assessment |
| --- | --- |
| I. One Source of Truth | PASS. The module implements FBL 0.1 as published. Where FBL does not decide the bytes, the question is filed here and not settled in the host (FR-014, FR-027). |
| II. Implementable from the Document Alone | PASS, and tested by this feature: every place the document was not enough is reported. No specification file changes. |
| III. Precise Normative Language | PASS. No normative text is written. |
| IV. Versioned Specifications | PASS. The corpus is copied at a recorded commit and the loader checks the `fbl` version key. |
| V. Simplicity | PASS. One module, no dependency, no construct added to FBL. |

**`etalii.adp.ide.intellij`** ([etalii.adp.ide.intellij.md](../../.specify/memory/repositories/etalii.adp.ide.intellij.md))

| Principle | Assessment |
| --- | --- |
| I. Native IntelliJ Platform Citizenship | PASS. Nothing is registered and nothing a user sees changes (FR-004). FBL's own history is not yet joined to the platform's undo manager. The feature that first connects a tool must do that, and the README says so. |
| II. The Text File Is the Source of Truth | PASS. Byte-identical saves and edits confined to their splices are what the fixtures and the real-file tests assert. |
| III. One Framework, Many Tools | PASS with one recorded edge: `fbl` is shared infrastructure, and its tests depend on `:freemind`. See Complexity Tracking. |
| IV. Test-First, Against Real Files | PASS. Tests precede behaviour, real files carry a recorded permissive licence, and one test runs on the headless platform. Editor registration and platform undo have nothing to cover yet. |
| V. Simplicity | Justified deviation: hand-written parsers where the platform bundles libraries. See Complexity Tracking. |
| Platform and Technology Constraints | PASS. Java 25, common platform modules only, no runtime dependency (`gradle/allowed-licences.properties` stays empty), no network, Apache-2.0 sources for everything copied. |
| Quality: no compiler warnings | PASS. `fbl/build.gradle.kts` sets `-Xlint:all -Werror` for the module, since nothing in the repository enforces it today. |

## Complexity Tracking

| Violation | Why needed | Simpler alternative rejected |
| --- | --- | --- |
| Hand-written JSON, YAML and XML parsers and a CEL evaluator, where the platform bundles Gson, Jackson and SnakeYAML (principle V) | Splices need the byte span of every key, value and gap. Loading must report a duplicate key at its location. The module must run without the platform on its classpath (FR-003). | Bundled libraries: they give no byte spans, are not guaranteed in every product, and no bundled library offers CEL. |
| A second XML scanner beside `core`'s `XmlScanner` | `core`'s counts characters and its package imports the platform. 16 of the 108 maps hold non-ASCII text, so the two offsets differ in real files. FR-004 forbids changing the modules that use it. | Reusing `core`'s scanner through a byte-to-character map: it still could not represent an invalid UTF-8 body or a byte-order mark. |
| `fbl`'s tests depend on `:freemind` | FR-020 compares the binding with the FreeMind module's own parser, so one test classpath needs both. | Putting the test in `freemind`: it would edit a format module's build and split the divergence record over two modules. |
