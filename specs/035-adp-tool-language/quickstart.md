# Quickstart: validating One Language for Every Tool Type

Runnable checks that show the feature works, stage by stage (research R24). Each step names what it proves. The clones sit side by side (`C:\git\<repository>` locally, `/home/user/<repository>` in a cloud session); commands run from the repository named.

## Prerequisites

- Python 3.13 with `pip install -r .github/scripts/requirements-atd.txt jsonschema pyyaml` (in etalii.adp).
- Rust stable with clippy and rustfmt, and the `wasm32-unknown-unknown` target with `wasm-bindgen-cli` for the VS Code artifact (in etalii.adp.ide.desktop).
- Node 22 and npm (etalii.adp.ide.vscode); Java 25 and the Gradle wrapper (etalii.adp.ide.intellij).

## 1. The grammar is strict LALR(1) and publishable (story 1 scenario 1, FR-002, FR-009, FR-090, SC-001)

In etalii.adp:

```text
python .github/scripts/atd-grammar.py --check
```

Expect: no conflict, no terminal collision, no construct outside the notation or regex subsets, `atd.flat.lark` accepted by LLGuidance, the generated files unchanged. Then add a rule that makes the grammar ambiguous (for example a second `name` alternative for `attribute`) and run it again: it fails, naming the conflict and the two rules.

## 2. Every example checks, every refused file is refused as stated (story 1, FR-100)

In etalii.adp.ide.desktop, against the etalii.adp checkout beside it:

```text
cargo run -p adp-atd-cli -- --spec-dir ../etalii.adp/specifications/atd check ../etalii.adp/specifications/atd
cargo run -p adp-atd-cli -- --spec-dir ../etalii.adp/specifications/atd check --corpus ../etalii.adp/specifications/atd/refused
```

Expect: exit 0 for both; the second reports every refused file with exactly its expected findings, among them a designer declaring a relation (ATD3001, at the relation), a syntax error with what was found and what was expected (ATD1xxx), an unknown attribute with its closest names (ATD2001), a binding reading an undeclared attribute reported once at the binding (ATD6xxx), an unknown version naming both versions (ATD0001), a cycle of imports reported once (ATD2003), a script with a clock call refused at check time (ATD7xxx), and a binding grammar that is not LALR(1) (ATD8xxx).

Then, in etalii.adp, `python .github/scripts/validate-examples.py` validates every printed tree (`atd tree`) against `atd.schema.json`, every trace and every conformance fixture.

## 3. The tables agree with Lark (FR-002, contracts/grammar.md rule 5)

In etalii.adp.ide.desktop: `cargo test -p adp-atd-grammar --test lark_crosscheck`. Expect: the normalized tables of the language and of every binding grammar in the examples equal Lark's.

## 4. Language support behaves the same in the three IDEs (story 3, FR-051 to FR-054, SC-005, SC-006)

- Core: `cargo test -p adp-atd-lsp --test walk` runs the 30-edit walk (completion, diagnostics, hover, rename, formatting at fixed positions of the examples) and `cargo bench -p adp-atd-lsp` reports diagnostics under 1 s and completion under 0.5 s on the 5,000-line benchmark description.
- VS Code: `npm run fetch-atd-lsp && npm run check && npm run test:unit && npm run test:vscode`; the VS Code tests open the examples in the packaged plug-in and run the same walk; the TextMate test checks every example's tokens against the lexer's classes (FR-052).
- IntelliJ: `./gradlew build integrationTest`; the integration test runs the walk in a real IDE with the LSP module. In an IDE without it, the plug-in loads and `.atd` opens as text.
- Desktop: open `specifications/atd/mindmap.atd` in the desktop host; type an error in a block, keep typing elsewhere: colouring, completion and diagnostics keep working (FR-053). Format twice: the second changes nothing, comments stay with their constructs (FR-032).

Expect: the same diagnostics at the same places in all three for the walk's file (scenario 5).

## 5. Create a tool type in VS Code (story 5, FR-060, FR-061, SC-007)

In a fresh VS Code window with only the plug-in: *ADP: New Tool Description*, choose `designer`, origin `example/reading-list`, name `reading-list`, a folder. Expect: `reading-list.atd` opens, the Problems panel is empty. Add an `import` of a second file with an error: both files' findings appear (story 5 scenario 3). For SC-007, a tool engineer new to the language follows `ATD-guide.md` and makes one working tool type of each kind in under 30 minutes; record the times in the feature's measurement note.

## 6. Every tool type in scope is described and traced (story 2, FR-020 to FR-023, SC-002, SC-003)

In etalii.adp: `python .github/scripts/validate-examples.py` passes, which includes the trace checks; `atd check definitions` reports no finding; `git diff <base> -- '*.dis' '*.des' '*.fbl'` over the feature's pull requests is empty (SC-002). Expect 36 descriptions (29 diagram, 2 designer, 5 editor types) and 36 traces, each covering every item of its companion's gap sections.

## 7. Validation in the desktop host and in VS Code (story 4, story 5 scenario 4, FR-040 to FR-044, FR-063, SC-004)

- `cargo run -p adp-atd-cli -- validate ../etalii.adp/definitions/diagrams/mindmap.atd`, then for every description. Expect: every case passes, every write byte-identical.
- Seed a difference (change a binding rule's attribute name in a copy of the description) and validate: exactly one difference, at that rule.
- In the desktop host, open the mind map's description in the validation view with a case; edit and save the description: the result refreshes without a restart; save a broken version: its findings show and the last result stays (FR-044). Make a script loop exceed its budget: the gesture is refused with a finding naming the function, the working copy unchanged.
- Open a person's `.mm` file in the desktop host while the description exists: it opens with today's tool, and its file is not written by validation (scenario 4).
- In VS Code, *ADP: Validate Tool Description* on the same description: the same differences (none, then the seeded one).

## 8. The grammar family reads and writes Turtle (story 7, FR-080 to FR-082, SC-010)

`cargo run -p adp-atd-cli -- validate ../etalii.adp/definitions/diagrams/w3c-rdf.atd`. Expect: every Turtle case passes with no persistence plugin: unmapped text kept byte for byte, each edit a minimal splice with an exact undo, a body that does not parse read in part with a finding at its line.

## 9. Debug a seeded defect (story 6, FR-070 to FR-072, SC-008)

In the desktop host's validation view, with the seeded defects of contracts/debugger.md: set a breakpoint in the script function, run the case's gesture, inspect locals, the call stack, the transaction and the budget; step over, into and out; set a CEL condition that holds only on the faulty iteration; stop: the working copy is as before. A tool engineer finds each defect's cause in under 10 minutes.

## 10. An agent writes a valid description (story 8, FR-090, FR-091, SC-009)

Give an agent `grammar/atd.flat.lark`, two examples and the description of a new tool type; where the model service constrains output to a Lark grammar, pass the flattened grammar. Feed back `atd check --json` findings. Expect: no findings within three rounds in at least four of five trials; record the trials in the feature's measurement note.
