# Contract: the `fbl` library

The interface a later feature (the first tool connected to FBL) and this feature's own tests code against. All paths are in `etalii.adp.ide.intellij`. It names the types and what they promise. Member signatures are fixed by the tasks, ported from standalone's FBL library at `25fc7b4a`, and are not part of this contract.

## Module

| Item | Value |
| --- | --- |
| Gradle module | `fbl`, listed in `settings.gradle.kts` |
| Project path | `:fbl` |
| Root package | `etalii.adp.fbl` |
| Sources | `fbl/src/main/java/etalii/adp/fbl/` |
| Composed into the plug-in by | `pluginComposedModule(implementation(project(":fbl")))` in the root `build.gradle.kts` |
| Classes in the built zip | under `etalii/adp/fbl/` |
| Language | Java 25 |
| Run-time dependencies | none (`gradle/allowed-licences.properties` stays empty) |
| Compiler flags | `-Xlint:all` and `-Werror` on the module's `JavaCompile` tasks |

The module has no descriptor fragment and no `xi:include`. It registers no extension, action, service or setting (FR-004).

## What a caller may rely on

1. **Generic** (FR-001). Nothing under `fbl/src/main` names a tool type or an example binding. Ids that DISL would derive come from the caller, through `FblOptions`' optional `deriveId` function.
2. **Free of the platform** (FR-002, FR-003). No file under `fbl/src/main` imports `com.intellij`, `java.awt`, `javax.swing`, `java.net` or `java.nio.channels`.
3. **Bytes, not characters**. A body is a `byte[]` wrapped in `BodyText`. Every span and every splice is a pair of byte offsets, start inclusive, end exclusive, with the byte-order mark counted.
4. **Nothing is normalised**. A save without an edit gives the bytes that were read, including a byte-order mark, each line's own ending and a missing final newline (FR-008).
5. **Read again, never patched**. After every edit the bytes are spliced and read again.
6. **The module opens no file for writing**. Saving goes through a writer callback the caller supplies.
7. **Reading does not fail**. A body that cannot be read is unreadable with one finding, and is never saved (FBL section 7.5). This covers invalid UTF-8, a body that is not well-formed at its top level, and a body over a limit.
8. **Refusals write nothing**. A refused edit, undo or redo leaves the bytes unchanged and carries a reason.

## Packages and types

| Package | Types | Responsibility | FBL |
| --- | --- | --- | --- |
| `etalii.adp.fbl` | `Splice`, `Finding`, `FindingCodes`, `FblModel`, `FblOptions` | The values every layer shares | 6, 7.4 |
| `etalii.adp.fbl.text` | `BodyText`, `Span` | Byte-order mark, line endings, lines and columns, invalid UTF-8 with its offset | 2.6 |
| `etalii.adp.fbl.document` | `FblDocumentLoader`, the model records, `Problem` | Loading an FBL document, steps 1, 2, 4, 5 and 6 | 14.1 |
| `etalii.adp.fbl.expression` | `RegexSubset`, `BoundedRegex`, `Cel` | The regular expression and CEL subsets, and the match time bound | 16 |
| `etalii.adp.fbl.family.json`, `.family.yaml`, `.family.xml`, `.family.lines` | span-preserving parsers | The five families; `lines` also serves `blocks` | 4, 5 |
| `etalii.adp.fbl.rule` | `BodyReading`, `FamilyReader`, `TreeFamily`, `Selector` | Reading a body by rules into elements, relations, attribute values, source positions and findings | 4, 5, 7.4 |
| `etalii.adp.fbl.plan` | `EditPlanner`, `NewText`, `NumberText`, `ModelChange`, `PlanResult` | Planning an edit as splices, new text in the body's own conventions | 6 |
| `etalii.adp.fbl.history` | `SplicedFile`, `OpenBody`, `EditHistory` | Undo, redo, drift, reload and saving | 7.1, 7.2 |
| `etalii.adp.fbl.registration` | `RegistrationDocument`, `OpenRegistration`, `BodyLocator`, `LegacySidecar` | The `.adp` registration, its layout, identities and legacy sidecars | 8 |
| `etalii.adp.fbl.routing` | `Router`, `MarkerEvaluator`, `Glob`, `FolderSubject`, `TemplateWriter` | Which binding claims a file or folder; a new body from a template | 10.1, 12, 13 |
| `etalii.adp.fbl.plugin` | `PersistencePlugin`, `PluginBody` | The host's side of a plugin-read binding | 11.1 to 11.3 |

## Values

**`Splice`**: an operation name as FBL section 6 gives it, `start`, `end` and `text`, with an optional `file` when it is not the body. Two splices are equal when operation, start, end and text are equal, which is how a fixture step is compared.

**`Problem`** (loading): a location, a severity and a message. Every problem of a document is reported, not only the first, each at the location of its cause. A duplicate key, an unsupported major version of the `fbl` key, a name that resolves to nothing, a failed rule check, and a regular expression or CEL expression outside FBL's subsets are problems. The last two are rejected by the name of the construct.

**`Finding`** (reading): what FBL section 7.4 says, with a code from `FindingCodes`. One code is fixed by this contract:

| Code | Severity | When |
| --- | --- | --- |
| `fbl.regex-timeout` | warning | A match passed its time bound. The line reads as not matching. |

The other codes are standalone's, copied unchanged.

**`FblOptions`**: the limits of FBL section 16 and the `deriveId` function.

| Limit | Default |
| --- | --- |
| Body size | 32 MiB |
| Entries in a body | 500,000 |
| Time for one regular expression match | 250 ms |
| Size of a suggestion | 64 KiB |
| Lines a pattern marker looks at | 20 |

## Behaviour by type

**`FblDocumentLoader`**. The FBL document is read by the module's own JSON parser. Validation against the JSON Schema (FBL section 14.1 step 3) is not made, nor are the checks that need DISL: a rule's `type` naming a type, no `fixed` attribute bound, a plugin declared by the specification.

**`RegexSubset` and `BoundedRegex`**. `java.util.regex` behind the subset validator. `\d`, `\w` and case-insensitivity are rewritten to ASCII classes, so that every host matches the same characters.

**`Cel`**. Accepts `has()`, member access, ternaries, `==`, `!=`, `&&`, `||`, list literals and `in`. Anything else is a problem at load.

**`NumberText`**. A number is written in the form of ECMAScript's `Number.prototype.toString`: no trailing `.0`, exponent form only where ECMAScript uses it. Fixed decimals, as in the registration's three-decimal form, round `HALF_UP`.

**`SplicedFile`**. The one base type of anything written by splices: body, registration, legacy sidecar and plugin body. Each history entry keeps the SHA-256 of the bytes before and after. Undo and redo take the current bytes and refuse on a mismatch. An edit that plans no splices leaves no entry.

**`BodyLocator` and `Router`**. Paths resolve within a root the caller passes. A body outside that root, or reached through a symbolic link, is refused, neither read nor written. Path and glob matching ignore case on Windows and macOS only.

**`TemplateWriter`**. A template is never evaluated.

**`PluginBody`**. With no plugin, the body opens read-only with a finding that says why. With one, the splices it plans are applied, recorded and undone as any other. The module contains no plugin.

## Refusal sentences

The refusal and drift sentences are standalone's at `25fc7b4a`, copied word for word, including "outside the workspace" where this host would say "project". A caller may compare them, as the baseline tests and one fixture do (`The settings file has no "schema" to rewrite.`). FBL specifies none of them. That is an open question reported to `etalii.adp` under FR-027, and the sentences may change with its answer.

## What the claim is

*Host, declared* (FBL section 15.1) of FBL 0.1 for the families `yaml`, `json`, `xml`, `lines` and `blocks`, with two exceptions: section 9 (several readings sharing one open body) is not implemented, and the loader checks that need DISL are not made. Folder subjects are covered as far as recognition and file selection. Files are not watched.

## Not in this contract

- A tool, editor, action or setting that uses the library. No tool uses it yet.
- Joining FBL's history to the platform's undo manager, and reconciling a body's mixed line endings with the platform's document. Both belong to the feature that first connects a tool.
- `NaturalIds`, `Corpus`, `TemporaryFolder` and `FakePlugin`: they live under `fbl/src/test` and are no part of the library.
