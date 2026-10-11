# Behaviour-change register

This is the register of FR-002. A refactoring keeps behaviour; joining copies that have drifted cannot always, because one of them has to win. Every such place is entered here **before** the change merges, with its guard and its ruling. An entry without a ruling blocks its task.

**A ruling is asked as a selection**: the options, what each means for the tools affected, the recommended one with its reason, and an "other". The developer sends it in that shape to whoever relays to the maintainer. A ruling is recorded here with its date, and the commit that applies it names it.

**Status** is one of: *open* (no ruling yet), *ruled* (with the date and the choice), *applied* (with the standalone pull request), *not a change* (the guard showed both copies behave alike, with the evidence).

## Known before the work starts

| # | Where | Today | If joined as the report advises | Recommended | Guard | Status |
|---|---|---|---|---|---|---|
| B-01 | Number shown by the functional-decomposition-graph property provider (report 3, *Number formatting*) | The provider formats with `"0.##"`; the module's other `Number` and every other module use `"0.####"`, so the provider rounds a value with three decimals where the rest of the module does not | One `DslNumber.Format` with `"0.####"` | Join on `"0.####"` if the task confirms the two-decimal form is drift and not a display choice; otherwise the provider keeps a named display format of its own | A property-row test for a value with three decimals | open |
| B-02 | `\r` inside a short string in SPARQL (report 2, *sparql and rdf*) | The RDF tokenizer rejects it; the SPARQL tokenizer accepts it | One terminal scanner. The SPARQL 1.1 grammar excludes `\r` from a short string literal, as Turtle does | Reject in both, as the grammar says; a query that held one becomes a reported problem | A tokenizer test with a carriage return in a short string, for each language | open |
| B-03 | Layering of a graph with a cycle (report 3, *Graph layering*) | Three rules in six layouts | **Not joined.** Each tool passes the `CyclePolicy` it has today (FR-045) | Keep per tool. Agreeing on one is a product decision, put to the M3 review | Each tool's layout fixtures, unchanged | not a change (by design) |
| B-04 | Comments in a Wardley map line (report 3, *Lexing*) | `WithoutComment` is not quote-aware: `//` inside a quoted name starts a comment | A `LineLexer` with Wardley's comment policy. A quote-aware policy would change how such a line reads | Keep Wardley's rule as its policy. Whether the rule is itself a defect is asked separately, with a fixture showing a quoted `//` | A parser test for a quoted name holding `//` | open |
| B-05 | Line ending chosen when a file has as many LF as CRLF line ends, in the three private line documents (report 3, *Line document*) | Not yet read for wardley-map, c4 and causal-loop-diagram. The azure-devops-pipeline copy differed here | The core line document decides | Core's behaviour wins. Ruled for the azure-devops-pipeline copy on 2026-09-15 (`backend-centralization`); the same ruling is assumed to cover these three, and asked if a guard shows a difference | A round-trip test on a file with equal counts, per module, and the existing byte round-trip fixtures | open |
| B-06 | Scratch-file detection in problem maintenance (report 3, *Scratch-file detection*) | `ProblemMaintenance` does not treat the `~RF` backup name as transient; the hierarchy model does | One `IsTransient`: problems are no longer recorded for such a file | Join. A problem reported on another program's backup file is noise | A test that such a file yields no problem | open |
| B-07 | Entry name validation (report 4.6) | `EntryNameRules` and `RenameEntryCommandHandler` apply different rules with different messages | One validator. Some name is accepted or refused differently on create or on rename, and one message changes | Decided when the two rule sets are laid side by side in the task; the stricter rule wins unless it refuses a name that exists in a shipped example | A table test of names against both operations | open |
| B-08 | The `major.minor` version check of the DISL and FBL loaders (report 6.5) | Two checks "with different strictness" | One check | Decided against what each specification says about its version key; a definition one loader accepts and the other would refuse is a finding for this repository (principle I) | Loader tests for a missing, a malformed and a newer version | open |
| B-09 | Computed or empty values on insert in the JSON and YAML families (D9) | The two families disagree | One `InsertValues` | What the FBL specification says; if it is silent, a feature here first (FR-025) | A conformance-style fixture for each family | open |
| B-10 | Path comparison on a case-sensitive file system (D6) | All seven containment checks ignore case, so on Linux a path that differs from the root only in case is accepted as inside it | The operating system's comparison | This is the correction of D6, not a choice. Entered because it changes what is accepted on Linux | Guards on the Linux runner and on Windows | ruled (it is D6) |
| B-11 | A symbolic link that leaves the project root (D6) | `ProjectTextFile.TryResolve` follows it; two of the seven checks refuse it | All refuse | The correction of D6 | A guard that opens, saves and opens a table through such a link | ruled (it is D6) |

## Found during the work

Add a row here, with the next number, before going on with the task that found it.

| # | Where | Today | If joined | Recommended | Guard | Status |
|---|---|---|---|---|---|---|
