# M6: the YAML spike (T220)

Spec 025, task T220 (FR-081). Spike on `etalii.adp.ide.standalone` at `develop` `2ba1fab00`, on a local branch that is not pushed; T221 builds on its prototype. Date: 2026-10-19.

## Verdict: succeeds

A single pass over YamlDotNet's tokens builds the tree `YamlFamily` needs, with byte spans, and the same pass judges well-formedness. Across every YAML body the FBL test suite parses, it builds a tree identical to `YamlParser`'s in every field: 398 of 398 distinct bodies. The whole FBL suite passes with the token tree as `YamlFamily`'s only reader, 1957 of 1957 tests (`T220_USE_TOKEN=1`).

None of the differences found is structural. The token stream gives everything the tree needs. Every difference outside the test suite is one of two things: a place where `YamlParser` departs from YAML and the token tree reads the body as YAML says, or a host policy that T221 has to state either way. In the 53 yaml-test-suite bodies where the two readers disagree in value or in whether they read the body at all, I compared each reader against the suite's expected value. The token tree matches it in 47; `YamlParser` matches it in 3. Of the other 6: 3 have no JSON form to check against (4ABK, DFF7 and FRK4), and 3 are YamlDotNet or tag edge cases (5T43, L24T/01 and WZ62).

**What this means for T221.** T221 can replace `YamlParser` (553 lines), `FlowReader` (125 lines) and `WellFormed()` (about 25 lines in `YamlFamily`) with one reader of about 380 lines. Each body is scanned and parsed once. Every tree the current tests see stays the same. The change is not neutral on bodies outside the tests, though. T221 changes how some bodies read (listed under "Behaviour T221 changes"), and it should take those changes on purpose, with a test for each kind, rather than discover them later. It brings no speed gain (see "Cost").

## What the prototype reads

The prototype is `src/backend/EtAlii.Adp.Specification.Fbl/Files/Yaml/YamlTokenTree.cs`, 384 lines including comments and blank lines.

It uses **scanner tokens, recorded while YamlDotNet's `Parser` consumes them**. A small `IScanner` wrapper hands the `Scanner`'s tokens to `new Parser(IScanner)` and keeps each one. The parser judges the grammar as `WellFormed()` does today, and the tree is then built by a recursive walk over the kept tokens. I chose tokens over parser events for these reasons:

- **The `:` position.** The `Value` token marks where the colon is. An empty value is `Empty(colon + 1)`, and an entry's `Own` ends there. The parser's empty-scalar event is placed at the next token instead.
- **Explicit keys.** A `? ` key shows up as a `Key` token with nonzero width, so the host's refusal of explicit keys is easy to keep.
- **Flow-collection ends.** Flow end tokens give the bracket's position.

The parser is still needed, because the scanner alone does not check the grammar. Recording its input gives both in one pass.

Mapping marks to bytes is one array from character index to byte offset, built once per body. `Mark.Index` counts UTF-16 units, and counts `\r` in CRLF. Surrogate pairs are handled, and the BOM is skipped as `YamlFamily` skips it today.

The one span the tokens do not give directly is the end of a block scalar. YamlDotNet's token runs on over the trailing line breaks and blank lines. The prototype steps back over whitespace to the last content line and takes that line's `ContentEnd`. With no content, the span ends after the header's indicators, which is what `YamlParser` does. This matched on every body.

Flow collections are read from the tokens too: the typed, as-written and style readings, in one walk. This replaces `FlowReader`. Comments do not matter: the tree records none, and the scanner skips them.

## Bodies compared

The harness is `YamlTreeComparison.cs`. `YamlFamily.Parse()` runs both readers on every body and compares the results:

- every `TreeValue` field: Kind, Style, Span, Text, Typed, Flow, FlowText, FlowStyle, ViaAlias, Merged and Entries, all recursively;
- every `TreeEntry` field: Name, KeySpan, Own, Indent, Separator and Value;
- `Leaves`, as a sorted multiset;
- `Duplicates`;
- the `WellFormed()` verdict against the token pass's verdict.

Results were logged per body, with each body and, for the yaml-test-suite, each reader's CEL value kept beside the log.

**I checked that the harness catches differences.** I broke the token tree three ways: one sequence's `Indent` off by one, plain `Typed` left as a string, and one leaf dropped. Over the conformance tests these gave 124, 118 and 127 DIFF bodies respectively, against 0 before. A sabotage run is what shows that MATCH means something.

| Corpus | Distinct bodies | Identical tree | Both unreadable (same offset and message) | Both refuse (same error) | Differ |
| --- | --- | --- | --- | --- | --- |
| FBL test suite, every YAML body any test parses (conformance, RealFiles, Yaml, Reading and so on) | 398 | 395 | 3 | 0 | **0** |
| Every `*.yaml` and `*.yml` file in the eight `etalii-adp` repositories, `node_modules` and `bin` copies included; bodies already in the suite not counted again | 551 | 458 | 86 | 0 | 6 differ, 1 hangs the host |
| [yaml-test-suite](https://github.com/yaml/yaml-test-suite) (`data` branch, every `in.yaml`) | 401 | 210 | 91 | 24 | 46 differ, 17 refused differently, 13 hang the host |
| **All** | **1350** (by SHA-256) | **1063** | **180** | **24** | 83 |

**`WellFormed()` agreement.** On all 1350 bodies, the token pass refused exactly the bodies `WellFormed()` refuses, with the same offset and message. There were 180 refusals and no disagreement. This holds by construction: the same `Parser` runs, now over the recording scanner.

## The differences, grouped by cause

`YamlParser` here means the current reader. "Token" means the prototype. "Expected" means the yaml-test-suite's `in.json`, compared automatically on the CEL value of the root.

### 1. Content on the `---` line is skipped by `YamlParser` (19 bodies, yaml-test-suite only)

`YamlParser` treats the whole `--- ` line as the marker, so `--- |`, `--- >`, `--- "text"` and `--- text` lose their value. The root reads as `Empty`, or as a plain scalar made from the next lines. The token tree reads them as YAML says.

- Bodies: 27NA, 2G84/02, 2G84/03, 4Q9F, 6FWR, 6JQW, 6LVF, 753E, 93WF, 96L6, 9MQT/00, B3HG, FP8R, K54U, KSS4, L383, T26H, T5N4, W4TN.
- First difference, for example: `$.Style Empty/Literal at [0, 0)/[4, 7)`.
- Against the expected value: token is right in all 19; `YamlParser` is right in 2 (753E and 93WF, where only the span differs).
- **Fixable?** Nothing to fix in the token approach. This is a `YamlParser` bug.

### 2. Block scalar values (12 bodies, one of them a real file)

`YamlParser` builds a block scalar's value itself, in a simplified way. YamlDotNet's value follows the specification. The differences:

- **Clip chomping when the body has no final line break.** This is the one real file: `etalii.adp.ide.vscode/.github/workflows/build.yml`, at `$/jobs/terminology/steps/2/run.Text`. The difference is at position 231: `YamlParser` adds a `\n` that is not in the body.
- **Folded blank lines.** In 7T8X, TS54 and K527, `YamlParser`'s `FoldBlock` keeps one newline too many per run of blank lines.
- **Keep chomping and lines of spaces.** In JEF9/00, K858 and L24T/00, `|+` with only blank lines reads `""` instead of `"\n…"`, and a trailing line of spaces is lost.
- **Tabs in block content.** In 96NN/00, 96NN/01, R4YG and Y79Y/001, a tab as content is dropped.
- Against the expected value: token is right in 10 of the 11 yaml-test-suite cases, and on the real file it follows the specification's clip rule. The exception is L24T/01, a YamlDotNet edge case: a line of spaces is the last line, with no final break, and YamlDotNet gives `"x\n "` where the expected value is `"x\n \n"`.
- **Fixable?** Nothing to fix. Taking YamlDotNet's value is the improvement.

### 3. Double-quoted scalars with escaped line breaks or tabs (5 bodies, yaml-test-suite only)

In 565N, DE56/02, DE56/03, NP9H and Q8AD, `YamlScalars.DecodeDouble` folds before it unescapes. An escaped line break (`\` at the end of a line) keeps a leading space, and an escaped tab is trimmed away. Token is right in all 5.

**Fixable?** Nothing to fix.

### 4. Anchored or tagged keys (`&a key: v`, `!t key: v`, `*a : v`) (4 differ, plus refusals)

`YamlParser`'s `KeyAt` does not see a key behind `&`, `!` or `*`. It reads the whole line as one plain scalar, `"key: v"`, so a mapping becomes a scalar. That happens in 7BMT, U3XV, 7FWL and E76Z (`$/top1.Kind Scalar/Mapping`), and it makes `YamlParser` refuse 2SXE, 74H7, HMQ5 and ZH7C. Those four refusals are also counted in group 6. The prototype reads keys with properties, and reads alias keys by their target's text. Token is right in all 8.

**Fixable?** Already done in the prototype.

### 5. Flow collections (7 yaml-test-suite bodies, 5 real Helm templates)

The prototype reads flow members from the tokens. `FlowReader`'s character scan produces these differences:

- **Comments inside a multi-line flow collection.** In 6HB6 and 7TMG, `FlowReader` keeps the comment in the scalar. Token is right.
- **Explicit `?` keys and `:` inside a plain key** (`http://foo.com`). These are 4ABK, DFF7 and FRK4. The token reading is the YAML one. The suite has no JSON form for these to check against.
- **Tagged empty values.** In WZ62, `FlowReader` reads `!!str` as the text `"!!str"` and the token tree reads null. Both host readers ignore tags. YAML says `""`. Tags are a policy point, below.
- **`"key"::value`.** In 5T43, YamlDotNet scans `:value` as a second key. `FlowReader` happens to be right here. This is a YamlDotNet quirk. It is not fixable in the token approach short of special-casing, and the shape is negligible in practice.
- **A collection used as a key: Helm templates (`name: {{ .Release.Name }}`).** These are 5 real files: `src/diagrams/helm-chart/backend/EtAlii.Adp.Diagram.HelmChart.Tests/Fixtures/*/templates/*.yaml`, and their copy in `etalii.adp.ide.vscode/fixtures/fbl/real-files/…`. `FlowReader` names the key `"{ .Release.Name"`, with the closing brace missing. The token tree names it by its text as written, `"{ .Release.Name }"`. No FBL test reads this value, and the Helm module reads templates with its own reader.
  - **Fixable?** Either name is a choice. Copying `FlowReader`'s truncation exactly would be possible but pointless.

### 6. Empty keys (`: a`) and collection keys: refused differently (17 bodies, yaml-test-suite only)

- **Refused only by the token tree** (2JQS, NHX8, SM9W/01): the tree refuses an empty key, the same way `YamlParser` refuses explicit keys. `YamlParser` accepted these bodies and read them as a garbage plain scalar such as `": a : b"`.
- **Refused by both, with different messages and offsets** (6BFJ, FH7J, LX3P, NKF9, PW8X, Q9WF, S3PD): these are flow or collection keys and empty keys.
- **Refused only by `YamlParser`** (26DV, 2SXE, 74H7, AB8U, DK3J, HMQ5, ZH7C): these are valid YAML that `YamlParser`'s line rules reject, for example "This line does not continue the structure above it". Four of them are the property keys of group 4. The other three are `"key" : value` with a space before the colon (26DV), a plain scalar continued on a line that starts with `- ` (AB8U), and a zero-indented folded scalar with a `#` line (DK3J). The token tree reads all 7 to the expected value.
- **Fixable?** It is a policy choice. No test relies on any of `YamlParser`'s error messages (I searched the FBL tests for each one).

### 7. `FlowReader` never ends: a bug on `develop`, independent of T220 (14 bodies, one of them a real file)

`FlowReader` loops forever, growing a list until `OutOfMemoryException`, on a single key-value pair inside a flow sequence, and on some flow-mapping shapes. The real file is `src/node_modules/json-schema-traverse/.eslintrc.yml`, at `indent: [2, 2, SwitchCase: 1]`. The yaml-test-suite cases are 4FJ6, 87E4, 8UDB, 9MMW, CFD4, CN3R, CT4Q, EHF6, L9U5, LQZ7, QF4Y, SBG9 and X38W. All are well-formed, so the host hangs on a body YamlDotNet accepts.

I saw the `OutOfMemoryException` happen; then I added a no-progress guard to `FlowReader` on the spike branch so the corpus run could continue. The token tree reads all 14 bodies. A pair inside a sequence becomes a mapping with one member, as YAML says.

**Fixable?** T221 fixes it by removing `FlowReader`. If T221 does not land soon, this needs its own guard test and fix on `develop`, per the bugs rule.

## Behaviour T221 changes, to be taken on purpose

None of these appears in any body the current tests parse.

1. Block scalar and double-quoted values become YamlDotNet's, which match the specification (groups 2 and 3). This includes the real workflow file, which loses a trailing `\n` it never had.
2. Content on a `---` line is read (group 1).
3. Keys with an anchor, a tag or an alias are read; empty keys are refused (groups 4 and 6).
4. Flow members come from the tokens. Comments are no longer read as part of a scalar, and a collection key is named by its full text (group 5).
5. Unreadable messages for refused keys change wording and offset. No test checks them.
6. The endless loop in group 7 goes away.

## Cost

| | Lines |
| --- | --- |
| Prototype `YamlTokenTree.cs` | 384 (51 of them blank or comment) |
| Replaced: `YamlParser.cs` | 553 |
| Replaced: `FlowReader.cs` | 125 |
| Replaced: `WellFormed()` in `YamlFamily` | about 25 |
| Replaced, total | about 700 |

`YamlScalars` stays, for `Typed` and the writing side. `DecodeDouble`, `DecodeSingle` and `Fold` would no longer be called on the reading side.

**Speed.** I timed a Release build over 587 bodies that both readers read (769 KB, 25 measured rounds): 40.2 ms for `WellFormed()` plus `YamlParser`, and 40.5 ms for the token tree. YamlDotNet's parser alone takes 28.0 ms of either. So "parsed once" saves code and fixes reading bugs; it does not save time.

## Can a single pass also replace `WellFormed()`?

Yes. The token pass is `WellFormed()`: the same `Parser`, the same exceptions and the same offset mapping, including the `InvalidOperationException` case. It agreed on all 180 unreadable bodies. T221 can delete `WellFormed()` and take `Unreadable` from `YamlTokenTree.Scan()`.

## State of the spike

- The prototype (`YamlTokenTree.cs`), the comparison harness (`YamlTreeComparison.cs`), two driver tests that run only when `T220_CORPUS` or `T220_TIMING` is set, and `YamlFamily.Parse()` wired to the harness (with `T220_USE_TOKEN=1` making the token tree the only reader) are on a local spike branch of `etalii.adp.ide.standalone`, not pushed. T221 builds its reader from the prototype.
- Not done in the spike: the `dotnet format` gate on the spike files, and running test projects other than `EtAlii.Adp.Specification.Fbl.Tests` with the token tree as the only reader. T221 runs the backend integration tests and the diagram modules' tests that read YAML through FBL.
