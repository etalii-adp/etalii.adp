# Implementation Plan: The FBL library reads the grammar family

**Branch**: none of its own here: one `features/072-<task>` branch per task in `etalii.adp.ide.standalone`, each a pull request into its `develop` | **Date**: 2026-10-31 | **Spec**: [standalone-fbl-grammar-family.spec.md](standalone-fbl-grammar-family.spec.md)

**Input**: the specification above, as approved by Peter on 2026-10-31 with FBL 0.13's `split` slot added by the amendment of that day; read against standalone `develop` `cc0d5ae0a` and etalii.adp `develop` `1834a0a` (2026-10-31).

## Summary

`EtAlii.Adp.Specification.Fbl` gains a seventh family, `grammar`, beside its five folders under `Files/`. A binding's grammar is linted against ATD grammar notation and the regular expression subset as etalii.adp's own `atd-grammar.py --bindings` lints it, then built once per loaded binding by `EtAlii.Lark` as a strict LALR(1) parser with the contextual lexer, whose conflicts and terminal collisions are the binding's refusals. A body is parsed by that parser, whole or, with `recover`, unit by unit through `EtAlii.Lark`'s interactive parser, into a tree of nodes and tokens with byte spans; the family reads it, plans splices on it and reads every changed entry again before an edit is applied, through the engine every other family uses (`Rules/BodyReading.cs`, `Planning/EditPlanner.cs`). The amendment adds `split` with the three FBL 0.11 constructs its fixture needs: `escape`, `create` with `emit` and `after`, and the items of a `many` `{node}` slot. No module reads through the family; every existing transcript and fixture is held unchanged.

## Technical Context

**Language/Version**: C# on .NET 10 (`src/global.json` pins SDK 10.0.203, `rollForward: latestFeature`), the house style of `src/.editorconfig`, no local functions in new code.

**Primary Dependencies**: `EtAlii.Lark` 0.4.0 (NuGet, MIT, `net10.0`), added to `src/Directory.Packages.props` and referenced by the FBL library alone. Its surface was exercised before this plan was written (research R1): strict LALR(1) with the contextual lexer, conflicts and collisions raised as `GrammarException` and `LexException` naming kind, terminal and rules, several start symbols, container positions that include filtered tokens, `ParseInteractive` on a `TextSlice`, `Accepts`, `Choices`, `Copy`, `Lex` with every terminal, lexer callbacks for ignored tokens, `ImportPaths` loaders, and `ParseTable.States` for the bound. Nothing the family needs is missing, so Requirement 3.3 has nothing to report.

**Storage**: N/A. The library takes bytes and returns splices.

**Testing**: xUnit v3 on Microsoft.Testing.Platform in `EtAlii.Adp.Specification.Fbl.Tests`, the conformance runner `Conformance/ConformanceFixtures.Tests.cs` over the vendored corpus, and the four gates plus `inspect.sh`.

**Target Platform**: the standalone backend, Linux and Windows.

**Project Type**: library inside the standalone host's backend solution.

**Performance Goals**: one pass of the parser per read, linear in the body's tokens; one grammar build per loaded binding (FBL section 16). The Turtle grammar builds in under two seconds, most of it the strict check of terminal collisions, and reads a fixture in milliseconds (R1).

**Constraints**: byte-exact round trips; byte offsets in every span and splice, where `EtAlii.Lark` counts UTF-16 characters (R4); no table builder, lexer or parser of the library's own (Requirement 3.1); the bounds of Requirement 2.7 (R7).

**Scale/Scope**: eight pull requests into standalone, one per task; about 2,000 lines of library code and 1,500 of tests, by the size of the desktop host's family (`etalii.adp.ide.desktop/crates/adp-fbl/src/families/grammar.rs`, 1,381 lines, and its 619-line grammar module).

## Constitution Check

*Checked before research and again after the design below; both times nothing is violated.*

etalii.adp's constitution:

- **I. One Source of Truth.** The family is implemented as FBL 0.9 and 0.13 state it; where this work finds FBL unclear, it goes back to etalii.adp as a candidate change (Requirement 10.4), not as a host variant. The grammar notation lint is a port of etalii.adp's `atd-grammar.py` lint, so both hosts refuse the same grammars.
- **II. Implementable from the Document Alone.** No specification changes here; the vendored fixtures are the shared test.
- **III, IV.** No normative text is written here. The library states the FBL version it reads in full, 0.9 (Requirement 2.1).
- **V. Simplicity.** One dependency, the one Peter's rule of 2026-10-23 names. The FBL 0.11 constructs are taken only as far as the split fixture needs them (the amendment).
- **VI. No Rider warnings.** `inspect.sh` runs before every push and must report nothing.

Standalone's principles (`.specify/memory/repositories/etalii.adp.ide.standalone.md`):

- **I. Specified, not coded.** Library work that lets a definition express a format declaratively; no module code.
- **II. The file is the source of truth.** Every fixture's unchanged save plans no splice; every edit has its exact undo; the fixtures' bytes are kept by `.gitattributes` (`*.ttl`, `*.txt` and `*.lark` under the corpus, R10).
- **III. Four gates and a pull request.** Every task is one pull request whose four gates and `inspect.sh` exit zero, judged by captured exit codes, run in a fresh worktree.
- **IV. The documentation stays true.** The conformance readme changes in every task that vendors or supports something; `docs/architecture.md` and `docs/solution-structure.md` are read in the last task for a sentence the work made false (Requirement 10.1).

## Project Structure

### Documentation (this feature)

```text
specs/072-standalone-fbl-grammar-family/
├── standalone-fbl-grammar-family.spec.md
├── plan.md                # this file
├── research.md            # the decisions R1 to R12
├── data-model.md          # the types the family adds
├── quickstart.md          # how a reviewer sees it work
├── tasks.md               # the eight tasks and the coverage diff
└── implementation-logs/   # one log per merged task
```

No `contracts/`: the library's public surface changes by one enum member (`Family.Grammar`), one overload (`FblDocumentLoader.Load(byte[], string?)`) and one check (`FblBinding.CheckManyAttributes`); the contracts the family is held to are FBL's own fixtures.

### Source Code (etalii.adp.ide.standalone)

```text
src/Directory.Packages.props                                   # EtAlii.Lark 0.4.0
src/backend/EtAlii.Adp.Specification.Fbl/
├── EtAlii.Adp.Specification.Fbl.csproj                        # PackageReference EtAlii.Lark
├── Documents/
│   ├── FblDocumentLoader.cs                                   # FBL 0.9 in full; Load(bytes, folder)
│   ├── BindingReader.cs                                       # family "grammar"; body grammar, start, recover; {node}, match, escape, split, separator, create.after
│   ├── BindingChecker.cs                                      # Requirement 2.6 and 11.1's refusals
│   └── FblModelTypes.cs                                       # Family.Grammar, GrammarBody, SlotKind.Node, Escape, Create.After
├── Files/Grammar/
│   ├── GrammarNotation.cs                                     # ATD 4.1 and 3.5 lint (port of atd-grammar.py lint_text, regex_problems)
│   ├── GrammarBuild.cs                                        # EtAlii.Lark build, imports beside the document, bounds, refusals
│   ├── GrammarParser.cs                                       # whole or unit-by-unit parse, trivia, byte spans
│   ├── GrammarNode.cs                                         # a node or token of the tree, an Entry
│   ├── GrammarSelector.cs                                     # name, *, **, name[path='v'], .
│   ├── GrammarFamily.cs                                       # the FamilyReader: candidates, slots, CEL, writing, read-again
│   └── SplitItems.cs                                          # the cut and the difference a set writes (FBL 0.13)
└── Rules/BodyReading.cs                                       # the family's construction; a split slot read as many
src/backend/EtAlii.Adp.Specification.Fbl.Tests/
├── Conformance/                                               # vendored 0.9 and 0.13 files, readme
│   ├── ConformanceFixtures.Tests.cs                           # pending set emptied task by task
│   ├── w3c-turtle-grammar.fbl, w3c-turtle.lark
│   ├── fixtures/w3c-turtle-grammar/, w3c-turtle-grammar-partial/, grammar-split-slot/
│   └── refused/split-not-many.fbl, split-escape-collision.fbl
└── Grammar/                                                   # GrammarLoading, GrammarReading, GrammarRecovery, GrammarWriting, GrammarSplit .Tests.cs
.gitattributes                                                 # the new fixture inputs kept byte-exact
```

**Structure Decision**: the family sits beside the five under `Files/`, named for what it does, as `structure.md` asks; its namespace is `EtAlii.Adp.Specification.Fbl.Files.Grammar`, following `Files/Lines/`. Tests go in a `Grammar/` folder of the test project, beside `Yaml/`, `Xml/` and `Bullets/`.

## Design

### Loading (Requirements 2, 3, 8.1; tasks T002, T003)

1. `BindingReader` maps `"family": "grammar"` to `Family.Grammar`, and reads `body.grammar` (a string, or `{"file": "<name>.lark"}`), `body.start` (default `start`) and `body.recover` (`unit`, `sync`) into `GrammarBody`. A slot `{"node": "<selector>"}` is `SlotKind.Node`; `match`, `escape`, `split`, `separator` and `create.after` are read onto the slot and the attribute binding.
2. `FblDocumentLoader.Load(byte[] json, string? folder)` is the overload a path load calls with the document's folder; the existing `Load(byte[])` passes none, and a grammar file is then refused as not found.
3. `GrammarBuild.Build(GrammarBody, folder, pointer, problems)` runs, in order: the notation lint (`GrammarNotation`, R2), which also refuses an `%import` of anything but a `.lark` file beside the document; the size bound on the text and its imports (R7); `new Lark(text, options)` with `ParserKind.Lalr`, `LexerKind.Contextual`, `Strict = true`, `MaybePlaceholders = true`, `PropagatePositions = true`, `RegexOptions.ECMAScript` for ASCII `\d \w \s` (R3), `Start = [start, unit]` when `recover` is given, and an `IGrammarLoader` that serves only files beside the document (R5); then the bound on rules and states (R7) and the `recover` checks against the built grammar (unit is a rule, the start rule is `unit*`, each `sync` a terminal name or the text of an anonymous string terminal). A `GrammarException` or `LexException` from the build is a problem at `/body/grammar` naming the conflict as `EtAlii.Lark` words it (its kind, the terminal and the rules, R3). The built parser is kept on the binding's `GrammarBody`, so it is built once per loaded binding.
4. `BindingChecker` refuses what Requirement 2.6 and 11.1 list, each at its JSON Pointer.
5. `FblDocumentLoader` declares FBL 0.9; the 0.8 audit (R11) finds nothing further to implement.

### Reading (Requirement 4; task T004)

`GrammarParser` turns the body into `GrammarNode`s: the `Tree` and `Token` objects of `EtAlii.Lark` mapped once to nodes whose spans are byte offsets (R4), a node's own span the container span `EtAlii.Lark` propagates, which includes the tokens the tree leaves out. The ignored tokens are collected by lexer callbacks, deduplicated by offset, and a non-whitespace one is a comment (R6). `GrammarFamily : FamilyReader` gives the engine its entries (every node, in document order), its candidates (the nodes a rule's absolute `at` selects through `GrammarSelector`), its CEL value (`type`, `text`, `children`, an empty optional part as null), its leaves and trivia for the coverage invariant, and its slot reads: a `{node}` slot reads the text of the first node its relative selector reaches, narrowed by `match` to the group `value`. A line span is the entry's lines when only whitespace precedes it on its first line and only whitespace or a comment follows it on its last, extended upwards over the comment lines directly above it; the rest of the engine, ids, references and unbound text included, is shared.

A text that `match` does not match (Requirement 4.5) reads as absent: the attribute takes its `default`, the entry stays readable, and its bytes are kept (R8).

### Reading in part (Requirement 5; task T005)

Without `recover`, a parse failure makes the body unreadable at the failing token's offset. With it, `GrammarParser` reads unit by unit (R9): `ParseInteractive` on a `TextSlice` from the current offset with the unit as the start symbol, feeding tokens until one cannot be shifted; if a copy of the parser accepts `$END` there, the unit ends after its last token; otherwise reading stopped, and the text from the unit's first byte to the end of the first token of a `sync` terminal that ends after the stop, lexed by `Lark.Lex` with every terminal and a character no terminal matches passed, is skipped, kept unbound and reported once as `fbl.unparsed-text` at the stop's line and column with its length.

### Writing (Requirement 6; task T006)

`GrammarFamily` plans a set as a `replace-value` of the value's span, a number as `NewText` writes numbers; an add as one `insert-entry` of the rule's `emit` with its placeholders, each line feed written as the body's line ending and the new entry's indentation, placed as FBL section 6.3 *Where it goes* says, the container `insert.container` selects or the root; a removal as a `remove-entry` of the line span or of the own span; a reference by `rewrite-reference` of its value's span. `ReadsBack` applies the planned splices to a copy of the body, parses it again with the binding's parser and refuses a set whose entry does not read with the value set, and an add after which the body does not hold one more entry of the rule with the add's values (R12). The history's exact undo and redo are the engine's, unchanged.

### Several items in one node (Requirement 11; task T007)

`SplitItems.Cut` cuts a value at every occurrence of `split`, trims Unicode white space (`char.IsWhiteSpace` over runes, which is the `White_Space` property), drops empty pieces and gives each item its byte span; escapes are resolved per item after the cut. `GrammarFamily.ReadMany` reads a `many` slot as every node its selector reaches, each node one item or, with `split`, its pieces. A set of such an attribute writes the difference by the longest common subsequence, as `LinesFamily`'s word slots already do (`Files/Lines/LinesFamily.cs`), with FBL 6.3's splices for a changed, a new and a removed item, a node with no item, a slot that reaches no node (written by `create`) and a node whose every item goes. `create` with `emit` and `after` writes an absent part by one `insert-key` after the last token of the first present attribute of `after`. `FblBinding.CheckManyAttributes(Func<string, string, bool> many)` is the check against a tool type's attribute types that `refused/split-not-many.fbl` needs (Requirement 11.7); no host calls it yet, since no module reads through the family.

### What is not changed

No module, no transcript, no bundled definition, no `RealFiles/divergences.json`. The RDF module keeps `w3c-turtle.fbl` and its plugin. `EtAlii.Lark` is referenced by the FBL library only.

## Delivery order

T001 vendors and shows the gap; T002 and T003 load; T004 reads; T005 reads in part; T006 writes, after which both Turtle fixtures pass; T007 adds `split`; T008 closes the documentation, runs the coverage diff over the code and writes the delivery report. Each is one pull request into standalone's `develop`, merged before the next starts, and ticked in etalii.adp's `tasks.md` with its implementation log once merged.

## Complexity Tracking

No principle is violated, so nothing is tracked.
