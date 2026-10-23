# Contract: the ATD document and its grammar

What `specifications/atd/` must contain for tasks to be complete, and the rules the grammar meets. Research R2 to R7, R11, R12.

## The document's sections

`ATD-specification.md`, 0.1 Working Draft, header table ending in the `Licence` row (licence-check.py):

1. Introduction (*informative*): purpose, the phases of the transition, relation to DISL, DESL, EDSL, FBL, DID and DED.
2. Conformance: the classes *description* (a file or set of files), *checker*, *language server*, *runtime*; RFC 2119 and RFC 8174 key words.
3. Lexical structure: UTF-8, line endings, comments (`//` to the end of the line, `/* */` not nested, `///` documentation comments attached to the next construct), the terminal classes, the regex subset (FBL §2.5 without anchors, named groups or lazy quantifiers), the lexing rule (contextual, longest match, priority, string over pattern), soft keywords.
4. ATD grammar notation: the subset of Lark notation, its meaning (rules, terminals, `?`, `_`, operators, aliases, `%ignore`, `%import`), and how a tree is shaped from it. Normative, because bindings use it too (section 11).
5. Files and descriptions: the header `atd <major>.<minor>`, root and parts, imports, the description's folder, version selection, unknown versions.
6. Values: literals, `( CEL )`, `@attribute`, `$token`, `#param`, settings maps; how each of DISL's four embeddings is written.
7. The core: identity and origin, localized text and documentation, element types and attributes, data types and enums, ids and id strategies, containment, constraints and findings, operations, hooks, actions, reasons and messages, limits, settings; each with the DISL or DESL section it carries.
8. The canvas surface (diagrams): coordinates, placement, snapping, notation and themes, toolbox and context tools, forms, layout; with DISL §5 to §7 and §10.
9. The form surface (designers): tables and hierarchies, columns, cells, views, value types, conversions; with DESL §7.
10. The text surface (editors): token classes, folding, outline, completion sources, quick fixes on ranges, embedded previews; written from the five editors the hosts implement.
11. Bindings: FBL's constructs one to one (families, rules, slots, attribute bindings, inserts, removes, registration), and the grammar family (FBL 0.9).
12. The script: functions, statements, the action set as statements, determinism, the budget, recursion, purity.
13. Capabilities: requiring and calling, the host's absence of one, the catalogue (with its contracts in `capabilities/`).
14. Static semantics: namespaces and name resolution, imports and cycles, inheritance (C3, as DISL), kind admission (the table of data-model.md §5), CEL contexts and type checking per position, settings against the schema, cross-checks of model, surface and binding (an attribute a binding reads that the model does not declare is one finding, at the binding).
15. Findings: codes, severities, positions, fixes; the machine-readable form.
16. Canonical layout: indentation, line breaks, spacing, ordering kept as written, comment attachment, idempotence (FR-032); machine edits as splices (FR-033).
17. The host's concerns: rendering, gestures (as intents), text measurement, file dialogs, opening links, the host's undo stack; what a description may not state about them.
18. Versioning: the version key, what a minor may change while 0.x, the kept grammars per minor, FR-102's re-check.
19. Complete examples (*informative*), with the files beside the document.
Changes, Appendix A (the schema's `$defs`), Appendix B (keywords by module), Appendix C (the mapping table DISL/DESL/FBL property → ATD construct, which story 2 scenario 1 is checked against).

## The grammar notation subset

| Admitted | Not admitted |
|---|---|
| `rule: a b \| c`, `TERMINAL: "x" \| /re/` | templates `_rule{x}` |
| `?rule`, `_rule`, `_TERMINAL` | rule priorities `rule.2` |
| `x?`, `x*`, `x+`, `[x]`, `( … )` | `%declare`, `%override`, `%extend` |
| `-> alias` | `%import common.*` and any import from outside the language's modules (or, in a binding, the binding's own files) |
| terminal priority `TERMINAL.2` | regex flags `/x/i` (a binding asks for case-insensitivity with a setting) |
| `%ignore TERMINAL` | terminals outside the regex subset |
| `%import .module (names)` | lookaround, backreferences, anchors |

## Rules the grammar meets

1. `Lark(open("grammar/atd.lark"), parser="lalr", lexer="contextual", strict=True, start="description")` builds; with `interegular` installed no two terminals collide (SC-001).
2. `atd-grammar.py --lint` finds no construct outside the subsets above.
3. Every keyword that a description might use as a name is admitted by the `name` rule where names are expected (FR-008); Appendix B lists them, and a test parses each keyword as a name in each name position.
4. `atd-grammar.py --flatten` writes `grammar/atd.flat.lark`; `llguidance` accepts it as a Lark grammar (FR-090).
5. `atd-grammar.py --tables` prints `$defs/ParseTables` for Lark's automaton; the desktop host's `atd tables` prints the same for its own; the two are byte-equal for the language's grammar and for every grammar in a binding example (cross-check run in the desktop host's CI).
6. `atd-grammar.py --highlighting` writes `highlighting/atd.tmLanguage.json` and `highlighting/atd.sublime-syntax`.
7. `atd-grammar.py --check` runs 1 to 6 and fails when a generated file in the repository differs from what it would write.

## Version layout

```text
specifications/atd/grammar/
├── atd.lark core.lark cel.lark script.lark canvas.lark form.lark text.lark binding.lark notation.lark   (current draft)
├── atd.flat.lark                                                                                        (generated)
└── 0.1/                                                                                                 (added when 0.1 is released: a frozen copy)
```
