# Research: The FBL library reads the grammar family

Phase 0 of [plan.md](plan.md). Each decision names what was chosen, why, and what else was weighed. The `EtAlii.Lark` findings were measured on 2026-10-31 with the 0.4.0 package from NuGet in a scratch console project, against `w3c-turtle.lark`, the grammar of `fixtures/grammar-split-slot/labels.fbl` and grammars written to conflict.

## R1. `EtAlii.Lark` has every surface the family needs

- **Decision**: build, lex and parse through `EtAlii.Lark` 0.4.0 alone; nothing is reported under Requirement 3.3.
- **Rationale**: measured, each surface does what the family needs:
  - `new Lark(text, new LarkOptions { Parser = Lalr, Lexer = Contextual, Strict = true, ... })` builds the Turtle grammar with no problem in under two seconds (63 rules, 84 states); a shift/reduce conflict raises `GrammarException` "Shift/Reduce conflict for terminal PLUS. [strict-mode] * <e : e PLUS e>", a reduce/reduce one "Reduce/Reduce collision in Terminal('$END') between the following rules: - <a : X> - <b : X>", and two terminals one state accepts that match the same text raise `LexException` "Collision between Terminals A and B. Example of a string matched by both: 'a'". Each names its kind, the terminal and the rules, which is what Requirement 2.5 asks a problem to say.
  - `Start = ["turtle_doc", "statement"]` builds one automaton with both start symbols, so a unit can be parsed on its own.
  - `PropagatePositions` gives each tree's `Meta.ContainerStartPos` and `ContainerEndPos`, which include the tokens the tree filters out: a `triples_statement` spans `102-171`, its closing `.` included.
  - `ParseInteractive(TextSlice, start)`, `IterParse`, `FeedToken`, `FeedEof`, `Accepts`, `Choices` and `Copy` give the unit-by-unit reading; an `UnexpectedTokenException` or `UnexpectedCharactersException` carries the interactive parser at the point of failure.
  - `Lark.Lex(TextSlice, dontIgnore)` lexes with every terminal, which is what skipping to a synchronising token needs (FBL section 4.9, *Reading in part*, step 2).
  - `LarkOptions.LexerCallbacks` is called for every token of a terminal, the ignored ones included, which gives the comments.
  - `ImportPaths` takes `IGrammarLoader`s, so an `%import` can be served from the document's folder and nowhere else; a missing file raises `FileNotFoundException` "Cannot find grammar 'other.lark' in the import paths".
  - `ParseInteractive("", start).ParserState.ParseConf.ParseTable.States` gives the automaton's states for the bound of Requirement 2.7, and `Lark.Rules` the rules after expansion; the parsing front end itself is internal to the package, which the family does not need.
- **Alternatives considered**: a table builder or a contextual lexer of the library's own, which Requirement 3.1 forbids; `EtAlii.Lark`'s source generator, which needs the grammar at compile time while a binding carries it at run time.

## R2. ATD grammar notation is checked by a port of etalii.adp's lint

- **Decision**: `GrammarNotation` ports `lint_text` and `regex_problems` of etalii.adp's `.github/scripts/atd-grammar.py`, which `--bindings` runs on every binding's grammar: it refuses string and regular expression flags, `%` directives other than `%import` and `%ignore`, an `%import` that is not `.name (` of a file beside the document, keep-all-tokens rules, rule priorities, templates, ranges and `~`, and every terminal outside ATD section 3.5's subset (anchors, `.` outside a class, groups other than `(…)` and `(?:…)`, backreferences, escapes other than `\d \D \s \S \w \W \t \n \r \\` and punctuation, lazy and possessive quantifiers). It runs before the build, on the binding's text and on every imported file.
- **Rationale**: the two hosts then refuse the same grammars by the same rules, and the refusal names the construct, line by line. Lark's own grammar loader accepts the whole of Lark's language, so its success says nothing about the subset.
- **Alternatives considered**: parsing the grammar with `notation.lark`, which is a module of ATD's grammar and needs `core`'s terminals; `atd.flat.lark` with `grammar_text` as the start symbol builds in about a second and does read both grammars, but it lets `"a"i` through as a string followed by a rule named `i`, so the lint is needed anyway, and the lint alone is what etalii.adp runs. Inspecting `Lark.Rules` after the build sees priorities and flags but not ranges, `%extend` or `%override`.

## R3. The parser's options

- **Decision**: `ParserKind.Lalr`, `LexerKind.Contextual`, `Strict = true`, `MaybePlaceholders = true`, `PropagatePositions = true`, `KeepAllTokens = false`, `RegexOptions = RegexOptions.ECMAScript | RegexOptions.CultureInvariant`, `Start` the start rule and, with `recover`, the unit.
- **Rationale**: these are the options of `build_binding` in `atd-grammar.py` (`parser="lalr", lexer="contextual", strict=True, maybe_placeholders=True, g_regex_flags=re.ASCII`), so the tree and the verdict are the ones etalii.adp checks the fixtures with. `ECMAScript` gives .NET's `\d \w \s` their ASCII classes, which ATD section 3.5 says they mean. The contextual lexer is ATD section 3.6's rule: candidates are the state's terminals and the ignored ones; longest match, then priority, then a string over a pattern, which is Lark's own ordering of terminals.
- **Alternatives considered**: the basic lexer, which is not ATD's rule; `MaybePlaceholders = false`, which would drop the empty optional child ATD section 4.5 keeps.

## R4. Spans are byte offsets, mapped once

- **Decision**: the body is decoded to a string once, with a table from each UTF-16 position to its UTF-8 byte offset (the BOM's length added), and every token and node position `EtAlii.Lark` gives is mapped through it when the tree is built.
- **Rationale**: every span and splice in FBL is in bytes, and `BodyText` works in bytes; `EtAlii.Lark` counts UTF-16 characters. One table built per read is linear, and every later use is a lookup.
- **Alternatives considered**: mapping on demand, which repeats the walk; lexing bytes, which `EtAlii.Lark` does not do.

## R5. Imports are served from the document's folder only

- **Decision**: a loader implementing `IGrammarLoader` answers an import only for a name that is a file `<name>.lark` directly in the document's folder, and `LarkOptions.ImportPaths` holds only it, so Lark's standard library (`common`, `unicode`, `python`) is never reached; the lint has refused anything else already.
- **Rationale**: FBL section 4.9 admits imports from beside the document and from nowhere else, and a grammar is data (FBL section 16).
- **Alternatives considered**: `FileSystemGrammarLoader` with the folder as its root, which would also serve subfolders.

## R6. Trivia and comments

- **Decision**: a lexer callback on every ignored terminal records the token by its offset (a dictionary, since a token is lexed again when a unit is parsed after a failed lookahead); a token with a character other than whitespace is a comment. An entry's line span is its first line to its last, when only whitespace stands before it and only whitespace or comments after it, extended upwards over the lines above it that hold only a comment, up to a blank line.
- **Rationale**: FBL sections 4.1.1 and 4.9 (as 0.9 states it): an ignored token holding a non-whitespace character is a comment, the leading comment of the entry below it, and the trailing comment of an entry's last line is in its line span. `w3c-turtle-grammar` removes `ex:alice` with `# People` above it and `ex:bob` keeps its trailing `# kept`.
- **Alternatives considered**: FBL 0.11's fuller ownership rules (a trailing comment of the innermost entry, comments across lines), which are out of scope and agree with this one for every fixture here.

## R7. The bounds

- **Decision**: a grammar's text, with its imports, of at most 256 KiB; at most 4,096 rules after expansion; at most 32,768 states of the automaton; each refusal at `/body/grammar` saying which bound was exceeded and by how much.
- **Rationale**: FBL section 16 asks for bounds that hold whoever wrote the binding. The largest grammars etalii.adp publishes are `structurizr.lark` (8,526 bytes) and `wardley-map.lark` (8,409 bytes) for bindings, and ATD's own flattened grammar (25,357 bytes), which builds into 994 rules and 1,645 states (`structurizr.lark` 354 rules, `wardley-map.lark` 116, `w3c-turtle.lark` 63 rules and 84 states); every one is admitted with a factor of ten or more to spare. The text bound is checked before anything is built, so a huge grammar costs nothing.
- **Alternatives considered**: a time bound on the build, which is less reproducible than a count.

## R8. A text that `match` does not match

- **Decision**: the slot is read-only and absent, with the reason "'<text>' does not match the slot's match.": the attribute takes its `default`, the entry stays readable, and a set of it is refused, so its bytes are kept.
- **Rationale**: Requirement 4.5 asks for a reading that keeps the entry's bytes and reading tolerant (FBL section 7.4), and the desktop host reads it so (`crates/adp-fbl/src/families/grammar.rs`, `read_node`), which its principle II needs this host to match. Requirement 10.4's report lists it as a candidate change for FBL.
- **Alternatives considered**: making the entry unreadable, which section 7.4 does not ask for content; reading the whole text, which would write outside what `match` keeps.

## R9. Reading unit by unit

- **Decision**: with `recover`, the body is always read unit by unit, the root a node of the start rule whose children are the units read; without it, the body is parsed whole. A unit is parsed by an interactive parser on a `TextSlice` from the current offset, after passing trivia; on an unexpected token or character, a copy of the parser fed `$END` decides whether the unit ended (FBL section 4.9, step 1) or reading stopped at the offending token or character (step 2).
- **Rationale**: FBL says a body that parses as a whole is read as the units it is made of, so reading unit by unit always gives the same tree for it (Requirement 5.4) with one code path, and a test compares the two readings of every fixture body that parses.
- **Alternatives considered**: parsing whole first and falling back, which reads a good body twice when it is not and gives two code paths whose trees must be shown equal anyway.

## R10. Vendoring and line endings

- **Decision**: copy the 0.9 files and the 0.13 split files from etalii.adp's `specifications/fbl/` at `1834a0a` (`develop`, 2026-10-31), which holds `88377a1`'s files unchanged and `grammar-split-slot` as spec 066's T107 wrote it; mark `*.ttl` and the conformance corpus's `*.lark` and `fixtures/grammar-split-slot/labels.txt` `-text` in `.gitattributes`, by extension where the repository has no other file of that extension and by path otherwise, as the conformance readme's earlier entries do.
- **Rationale**: Requirement 7.1 asks for the bytes as the source holds them; the fixtures' offsets are byte offsets. The readme's convention is one paragraph per vendoring, naming the commit.
- **Alternatives considered**: `88377a1` itself, which lacks the split files.

## R11. FBL 0.8 holds nothing the library lacks

- **Decision**: declaring 0.9 needs no 0.8 work beyond what is there.
- **Rationale**: FBL's status paragraph says 0.8 adds an insert's `constant` and nothing else, which the library implements (`Documents/BindingChecker.cs`, `FblModelTypes.cs`, the four `insert-constant-*` fixtures and `refused/insert-constant-collision.fbl` vendored and passing). T003 reads the 0.8 sections of the specification again against the code and records the result in its implementation log, and the tests that expect the newer-version warning on a 0.8 document change to expect none (Requirement 9.3).
- **Alternatives considered**: none; Requirement 2.2 asks for the audit, not for work it does not find.

## R12. Reading back before an edit

- **Decision**: `GrammarFamily.ReadsBack` applies the planned splices to a copy of the body's bytes, parses it with the binding's parser as a read does, and compares the changed entry, found at its offset shifted by the splices before it, with the values set; an add is checked by counting the rule's entries and finding one with the add's values. A failure refuses the edit with "The new <attribute> would not read back from the <title> text." and writes nothing.
- **Rationale**: FBL sections 4.9 and 6.4; the planner already calls `ReadsBack` for every family (`Rules/FamilyReader.cs`, `Write`), and a refusal there keeps the body unchanged. The fixture's sentence is the host's own, which the runner does not compare (`ConformanceFixtures.Tests.cs`).
- **Alternatives considered**: checking the new value against the terminal's pattern, which misses a value that lexes but changes the tree.
