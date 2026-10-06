# Implementation Plan: A Generic FBL Implementation for Visual Studio Code

**Branch**: `features/009-vscode-fbl-implementation` | **Date**: 2026-10-06 | **Spec**: [vscode-fbl-implementation.spec.md](vscode-fbl-implementation.spec.md)

**Input**: Feature specification from `specs/009-vscode-fbl-implementation/vscode-fbl-implementation.spec.md`

## Summary

`etalii.adp.ide.vscode` gets a generic implementation of FBL 0.1: a library that takes an FBL document and a body as bytes, reads the body into elements, relations and findings, plans every change as FBL's splices, keeps a history with exact undo and drift refusal, reads and writes the `.adp` registration, routes files, produces templates and does the host's side of the plugin contract. It claims *Host, declared* for all five families.

It is written in TypeScript in `src/core/fbl/`, as a port of standalone's library at `25fc7b4a`, module by module, with that library's 86 tests ported first as the checklist and FBL as the referee where the two differ (research R1, R2). It adds no dependency: the regular expression subset gets a matcher of the library's own with a step budget, because the platform's cannot be bounded (R3); CEL is the ported subset (R4); spans come from the library's own YAML, JSON, XML and line readers, and the `yaml` package the plug-in already bundles answers only whether a body is well-formed (R5 to R7).

The tests copy FBL's bindings, fixtures and registrations from `specifications/fbl/`, and the real files standalone's tests read, into `fixtures/fbl/` with a manifest of digests that a test checks (R13, R14). Every baseline test has a counterpart, listed in a file a test checks; one test of the 86 does not apply (R12). One test runs in a real Visual Studio Code against the packaged plug-in, reaching the library through what `activate` returns, which is also the only thing that connects it to the plug-in (R11). What FBL requires and neither a fixture nor the baseline proves is not built here and is listed, with the open questions, for `etalii.adp` (R15, R16).

## Technical Context

**Language/Version**: TypeScript 5.9, strict, as the repository has it; Node.js 22 or later. No change to `tsconfig.json`.

**Primary Dependencies**: none added. Used at runtime: the `yaml` 2 package, already bundled, for two decisions (R5); Node's `node:fs`, `node:path` and `node:crypto`, in two files only (R9). Built and tested with what the repository has: esbuild, ESLint, Vitest 5, `@vscode/test-cli` with Mocha, `@vscode/vsce`.

**Storage**: none of its own. The library takes bytes and returns bytes; a caller's writer saves. The tests read `fixtures/fbl/`.

**Testing**: Vitest in Node for everything but one test (`test/core/fbl/`, run by the existing `core` project); one Mocha suite in a real Visual Studio Code against the unpacked `.vsix` (`test/vscode/fbl.test.ts`). Test-first per module (FR-023).

**Target Platform**: the extension host of desktop Visual Studio Code 1.140 or later, on Windows, macOS and Linux. The Build workflow runs on GitHub's hosted Linux runner.

**Project Type**: a library inside a Visual Studio Code extension, with no user interface.

**Performance Goals**: every test that needs no editor runs with one command in at most twice the time the unit tests take today (SC-007, R18). A regular expression match is bounded at 1,000,000 steps and a CEL evaluation at 100,000.

**Constraints**: a save without an edit writes the bytes read; an edit changes only the bytes of its splices; the splices of every fixture step are standalone's, byte for byte (SC-004); no network, nothing beyond the plug-in file (FR-002); nothing under `src/core/fbl/` names a tool type or an example binding (FR-001); no tool, editor, command or setting refers to the library, and the two diagrams are untouched (FR-004); bodies up to 32 MiB and 500,000 entries.

**Scale/Scope**: about 8,500 lines of C# to port, in 13 modules; 86 baseline tests, 85 with counterparts; 8 fixtures, 8 bindings and 6 registrations copied from here; about 300 real files (3 MB) copied from standalone; 26 functional requirements; 2 repositories, 3 pull requests.

## Constitution Check

*GATE: checked before research and again after design.*

### This repository (`etalii.adp`, constitution 1.4.0)

| Principle | Status | Note |
|---|---|---|
| I. One Source of Truth | Pass | The host implements FBL as written and defines no variant. Where standalone's code and FBL differ, FBL is followed and the difference recorded (R4, R6, R8). Where FBL does not decide, nothing is decided in the host: the question is filed here (R16, FR-014, FR-026), and what no fixture pins down is not built (R15). |
| II. Implementable from the Document Alone | Pass | Nothing under `specifications/` changes. The feature is the second test of this principle for FBL, and R16 lists seven places where the document alone was not enough. |
| III. Precise Normative Language | Pass | No specification text is written. |
| IV. Versioned Specifications | Pass | FBL stays 0.1. The host states the version and the commit of the corpus it was tested against. |
| V. Simplicity | Pass | No dependency, no new format, no new mechanism in this repository. |
| Structure and Naming | Pass | Files are added under `specs/009-vscode-fbl-implementation/` only. |
| Development Workflow | Pass | One feature here; the code in `etalii.adp.ide.vscode` on a branch of the feature's name with its own pull request; tasks will prefix files with their repository and are ticked after that pull request is merged. |

### The VS Code repository (`.specify/memory/repositories/etalii.adp.ide.vscode.md`, 1.0.0)

| Principle | Status | Note |
|---|---|---|
| I. Native Visual Studio Code Citizenship | Pass, with a note for the next feature | Nothing a user sees changes: no editor, command, finding or setting is added. The library keeps a history of its own, as FBL section 7 requires of a host. Principle I requires every user-visible change to be an edit of the file's text document, with the platform's undo. The feature that first connects a tool to the library must reconcile the two (and the editor's one line ending per file with FBL's bytes); this plan leaves the library's history unconnected so that choice stays open. |
| II. The Text File Is the Source of Truth | Pass | It is the library's subject: bytes read are bytes saved, an edit changes only its splices, unbound content is kept, an unreadable body opens with a finding and is never written. The fixtures and the real-file tests prove each. |
| III. One Frame, Many Tools | Pass | The library is in `src/core`, depends on neither Visual Studio Code nor a browser, and names no tool type; lint and a test keep it so. No tool type and no part of the frame changes. |
| IV. Test-First, Against Real Files | Pass | Each module's tests are committed before it and seen failing. The shared fixtures are copied unchanged with their source and digests recorded. One test runs the packaged plug-in in a real Visual Studio Code. The two tests that need a symbolic link skip with their reason where the system refuses one. |
| V. Simplicity | Pass, with three entries in Complexity Tracking | No dependency is added. The matcher, the CEL evaluator and the use of Node's modules in `src/core` are each more than the obvious and are justified below. |
| Platform and Technology Constraints | Pass | One `.vsix`, no network, nothing else installed; the build stays headless through `npm`; no third-party code is added. The copied files are Apache-2.0, as both source repositories are; a third-party notice found on a real file is copied with it (R14). |

**Re-check after design**: unchanged. The design added the `fbl` member of what `activate` returns, which is not a contribution and is already how the in-editor tests see the plug-in; two lint rules; and no dependency.

## Project Structure

### Documentation (this feature)

```text
specs/009-vscode-fbl-implementation/
├── vscode-fbl-implementation.spec.md
├── plan.md                    # this file
├── research.md                # decisions R1 to R18, questions Q1 to Q7
├── data-model.md              # what the library and the tests hold
├── quickstart.md              # how to see each user story hold
├── contracts/
│   ├── library-api.md         # what src/core/fbl/index.ts exports
│   ├── test-baseline.md       # the 86 baseline tests and their counterparts
│   └── corpus.md              # the copied files, the script, the settings and documents that change
├── checklists/requirements.md
└── tasks.md                   # /speckit-tasks
```

### Source (`etalii.adp.ide.vscode`)

```text
src/core/fbl/
├── index.ts                   # the public surface (contracts/library-api.md)
├── span.ts  splice.ts  finding.ts  model.ts  messages.ts
├── text/bodyText.ts           # byte-order mark, UTF-8 validity, lines, endings, positions
├── expressions/
│   ├── regexSubset.ts         # parses the common subset; rejects the rest by name
│   ├── regexMatcher.ts        # the bounded matcher
│   └── cel.ts                 # tokenizer, parser, evaluator
├── documents/
│   ├── jsonReader.ts          # strict RFC 8259 over bytes: order, raw numbers, spans, pointers
│   ├── documentLoader.ts      # FBL 14.1, steps 1, 2, 4, 5, 6
│   └── types.ts               # the loaded document
├── rules/
│   ├── familyReader.ts        # entries, leaves, trivia, the write half's shape
│   ├── selector.ts  treeFamily.ts
│   └── bodyReading.ts         # the rule engine
├── families/
│   ├── yaml/                  # yamlParser, flowReader, yamlScalars, yamlFamily
│   ├── json/jsonFamily.ts
│   ├── xml/xmlFamily.ts
│   └── lines/linesFamily.ts   # lines and blocks
├── planning/                  # modelChange, plan, editPlanner, newText
├── history/                   # editHistory, splicedFile, openBody, digest (node:crypto)
├── registration/              # registrationDocument, openRegistration, bodyLocator, legacySidecar
├── routing/                   # glob, markerEvaluator, router, folderSubject, templateWriter
├── plugins/                   # persistencePlugin, pluginBody
└── files/                     # fblFiles (the interface), nodeFiles (node:fs, node:path)

src/extension/extension.ts     # AdpApi gains `fbl`; nothing else changes

test/core/fbl/
├── bodyText.test.ts  conformanceFixtures.test.ts  expressions.test.ts  history.test.ts
├── loading.test.ts  pluginBody.test.ts  reading.test.ts  registration.test.ts
├── routing.test.ts  templates.test.ts  yamlScalars.test.ts
├── realFiles/
│   ├── declaredBodies.test.ts  registrations.test.ts
│   ├── corpus.ts              # the enumeration and its minimums
│   └── divergences.json  divergences.ts
├── baseline.json  baseline.test.ts
├── corpus.test.ts  regexDifferential.test.ts  generic.test.ts
└── support/                   # bytes of a file, a temporary folder, the ids the fixtures name, a plugin for tests
test/vscode/fbl.test.ts        # the one in-editor test

fixtures/fbl/                  # copied; contracts/corpus.md
├── PROVENANCE.md  manifest.json
├── conformance/
└── real-files/

scripts/sync-fbl.mjs           # writes fixtures/fbl/
docs/fbl.md                    # FR-025, FR-026
README.md  eslint.config.mjs  .gitattributes  package.json   # contracts/corpus.md
```

**Structure Decision**: one folder under `src/core`, laid out as standalone's library is, so that a module and its source can be read side by side; one test file for each of standalone's test files, so that the baseline list is a plain table; the copies under the repository's existing `fixtures/`, which Git, the linter and the file check already treat as bytes not to touch. The library is reachable from the rest of the plug-in at one place, `AdpApi.fbl`, and a lint rule keeps it at one.

## Delivery

| Pull request | Into | Carries | Proves |
|---|---|---|---|
| A | `etalii.adp` `develop` | the specification, this plan, the tasks | nothing yet |
| 1 | `etalii.adp.ide.vscode` `develop` | everything under "Source" above | User Stories 1 to 4; SC-001 to SC-007 |
| B | `etalii.adp` `develop` | the tasks ticked, after pull request 1 is merged; links to the issues filed | SC-008 |

Pull request 1 is one branch, `features/009-vscode-fbl-implementation`, in its own worktree, with its commits in this order. Each step's tests are committed before its code and seen failing.

1. **Corpus and skeleton**: `sync-fbl.mjs`, `fixtures/fbl/`, `corpus.test.ts`, `baseline.json` with `baseline.test.ts`, the lint rules, the unit tests' duration today recorded.
2. **Reading**: text; the regular expression subset and matcher with the differential test; CEL; the JSON reader and the document loader; the family readers; the rule engine. After it, every copied binding loads and every fixture's `read` holds.
3. **Writing**: new text; the planner and the family writers; history. After it, the eight fixtures pass (User Story 1).
4. **The rest of the baseline**: registration, legacy sidecars, routing, folder recognition, templates, the plugin body, and what is left of the twelve test files (User Story 2).
5. **Real files**: the enumeration, the five properties, the registration tests, the divergence record observed again (User Story 3).
6. **In the plug-in**: `AdpApi.fbl`, `test/vscode/fbl.test.ts`, `generic.test.ts`, `docs/fbl.md`, the readme; the issues filed (User Story 4).

Step 2 opens with a check that settles a risk early: every copied binding must load with the subset of R3 and the CEL of R4. A binding that does not is raised here before the work goes on (R16).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| A regular expression matcher of the library's own (R3) | FBL section 16 and FR-013 require a match to be bounded, and section 2.5 requires `\d` and `\w` to be ASCII and constructs outside the subset to be rejected by name | The platform's `RegExp` cannot be bounded or interrupted on its own thread; a worker makes every read asynchronous; a linear-time engine is a new bundled dependency and a third parser of the same syntax |
| A CEL evaluator of the library's own (R4) | FBL's conditions and computed values are CEL, and five baseline tests fix which expressions compile | No CEL library is in the repository; one from npm is a new runtime dependency that accepts a different language than the baseline's |
| `node:` modules in two files of `src/core` (R9) | Finding a registration's body must check links and the workspace on a disk; the history needs a digest | An interface with its Node implementation outside `src/core` would put half the library's tests behind the extension layer; SHA-256 written out avoids one import the platform has |
| A history of the library's own, beside the editor's | FBL section 7 requires it of a host, and the fixtures test it step by step | Leaving it out fails five baseline tests and every fixture with an undo; how it meets the editor's undo is for the feature that connects a tool |
| A second reader of the `.adp` registration, beside `src/core/registration` | FBL section 8 by splices on bytes, for any binding | Replacing the existing one changes how Agent Behavior Modelling writes its registration, which FR-004 forbids in this feature |
| The plan is in one repository and the code in another | The constitution places every feature here | It is the rule, recorded because the template asks |
