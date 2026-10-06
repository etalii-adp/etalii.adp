# Contract: the test baseline and its counterparts

**Feature**: [vscode-fbl-implementation.spec.md](../vscode-fbl-implementation.spec.md) | **Research**: [R12](../research.md), [R14](../research.md)

The 86 tests of `EtAlii.Adp.Specification.Fbl.Tests` in [`etalii.adp.ide.standalone`](https://github.com/etalii-adp/etalii.adp.ide.standalone/tree/25fc7b4af7a99989d23d75d1af9d844303243b9d/src/backend/EtAlii.Adp.Specification.Fbl.Tests) at `develop` commit `25fc7b4a`, read again on 2026-10-06, each with the counterpart this host writes (FR-017) or the reason it does not apply (FR-018). It replaces the list spec 007 kept.

## Rules

- A counterpart checks the same behaviour with the inputs and expected results of the baseline test's source at the commit above. Where that source uses a table of cases, the counterpart uses the same table.
- **Cases** is how often the baseline test runs: once, once for each row written in the test, or once for each item found at run time. A counterpart with rows or items is an `it.each`.
- A counterpart's title is the baseline test's name spelled out as a lower-case sentence. The titles below are the contract; a title may be reworded for grammar only if `baseline.json` changes with it.
- `etalii.adp.ide.vscode/test/core/fbl/baseline.json` holds this list as data, and `baseline.test.ts` fails unless it has exactly these 86 names, every title occurs in its file, and the one test marked not applicable below is the only one.
- Where a baseline test passes by returning early for an item it does not concern (a registration of another origin), the counterpart leaves that item out of its cases instead, so nothing is reported as passed that checked nothing.
- The two tests marked † create a symbolic link. On a system that refuses to create one they are reported as skipped with that reason; the hosted runner runs them.
- Three expected results follow this host's decisions and not standalone's behaviour, each recorded in `docs/fbl.md`: the offset and wording of `std.unparseable` for YAML that is not well-formed (research R5); `{decimals}` rounding at exact halves, should a case show a difference (R8); a regular expression's bound, given in steps (R3).

## Tests beyond the baseline

| Test file | Checks | For |
|---|---|---|
| `baseline.test.ts` | The list above is complete and every counterpart exists. | SC-002 |
| `corpus.test.ts` | Every copied file has the digest the manifest records; none is missing or extra. | FR-015 |
| `regexDifferential.test.ts` | The library's matcher and the platform's agree on every expression and line of the corpus. | research R3 |
| `generic.test.ts` | No file under `src/core/fbl/` names an origin, a tool type or a binding of the corpus. | FR-001 |
| `test/vscode/fbl.test.ts` | The packaged plug-in walks the `timeline-edits` fixture in a real Visual Studio Code. | FR-022 |

## The 86

### `Bytes/BodyText.Tests.cs` → `test/core/fbl/bodyText.test.ts`

| Baseline test | Cases | Counterpart title |
|---|---|---|
| `AColumnCountsCodePointsNotBytesOrUtf16Units` | 1 | a column counts code points not bytes or UTF-16 units |
| `TheByteOrderMarkBelongsToNoColumn` | 1 | the byte order mark belongs to no column |
| `CrlfLfAndALoneCrEachEndALine` | 1 | CRLF LF and a lone CR each end a line |
| `ABodyOfOnlyALoneCrIsOneEmptyLineEndedByCr` | 1 | a body of only a lone CR is one empty line ended by CR |
| `CrlfWinsATieAndALoneCrCountsAsNeither` | 4 | CRLF wins a tie and a lone CR counts as neither |
| `AnInvalidUtf8SequenceIsFoundWithItsOffset` | 1 | an invalid UTF-8 sequence is found with its offset |

### `Conformance/ConformanceFixtures.Tests.cs` → `test/core/fbl/conformanceFixtures.test.ts`

| Baseline test | Cases | Counterpart title |
|---|---|---|
| `TheFixturesAreFound` | 1 | the fixtures are found |
| `TheFixturePasses` | one per fixture | the fixture passes |
| `EveryByteOfTheInputBelongsToTheReading` | one per fixture | every byte of the input belongs to the reading |

### `Expressions/Expressions.Tests.cs` → `test/core/fbl/expressions.test.ts`

| Baseline test | Cases | Counterpart title |
|---|---|---|
| `AConstructOutsideTheSubsetIsRejectedByName` | 9 | a construct outside the subset is rejected by name |
| `AnExpressionInTheSubsetIsAccepted` | 3 | an expression in the subset is accepted |
| `DigitsAndWordCharactersAreAsciiOnly` | 1 | digits and word characters are ASCII only |
| `ACelExpressionEvaluatesOnAnEntry` | 9 | a CEL expression evaluates on an entry |
| `AnExpressionOutsideTheSubsetFailsToCompile` | 3 | an expression outside the subset fails to compile |

### `History/History.Tests.cs` → `test/core/fbl/history.test.ts`

| Baseline test | Cases | Counterpart title |
|---|---|---|
| `ASnapshotUndoEqualsAnInverseSpliceUndo` | 1 | a snapshot undo equals an inverse splice undo |
| `RedoRepeatsTheEditAndIsRefusedOnDrift` | 1 | redo repeats the edit and is refused on drift |
| `AReloadClearsTheHistory` | 1 | a reload clears the history |
| `ASaveHandsTheHostsWriterTheEditedBytes` | 1 | a save hands the hosts writer the edited bytes |
| `AnUnreadableBodyIsNeverSaved` | 1 | an unreadable body is never saved |

### `Loading/Loading.Tests.cs` → `test/core/fbl/loading.test.ts`

| Baseline test | Cases | Counterpart title |
|---|---|---|
| `AValidDocumentLoadsWithoutAProblem` | 1 | a valid document loads without a problem |
| `ADuplicateKeyAnywhereIsRejectedAtItsPointer` | 1 | a duplicate key anywhere is rejected at its pointer |
| `AnotherMajorVersionIsRefused` | 2 | another major version is refused |
| `ANewerMinorVersionLoadsWithAWarning` | 1 | a newer minor version loads with a warning |
| `ANameThatDoesNotResolveIsRejectedAtItsPointer` | 6 | a name that does not resolve is rejected at its pointer |
| `AStepSixCheckIsApplied` | 5 | a step six check is applied |
| `ASharedClaimWithAMarkerIsAccepted` | 1 | a shared claim with a marker is accepted |
| `EveryProblemIsReportedRatherThanTheFirst` | 1 | every problem is reported rather than the first |
| `AReferenceResolvesAgainstTheReferringDocument` | 1 | a reference resolves against the referring document |

### `Plugins/PluginBody.Tests.cs` → `test/core/fbl/pluginBody.test.ts`

| Baseline test | Cases | Counterpart title |
|---|---|---|
| `AMissingPluginOpensTheBodyReadOnlyWithAFinding` | 1 | a missing plugin opens the body read only with a finding |
| `APluginWithAnotherIdCountsAsMissing` | 1 | a plugin with another id counts as missing |
| `ThePluginsSplicesAreAppliedRecordedAndUndone` | 1 | the plugins splices are applied recorded and undone |
| `APluginsRefusalWritesNothing` | 1 | a plugins refusal writes nothing |
| `AReadOnlyBindingsPluginIsNeverAskedToPlan` | 1 | a read only bindings plugin is never asked to plan |

### `Reading/Reading.Tests.cs` → `test/core/fbl/reading.test.ts`

| Baseline test | Cases | Counterpart title |
|---|---|---|
| `TheFirstRuleInBindingOrderTakesAnEntryAndAnEntryBecomesOneElement` | 1 | the first rule in binding order takes an entry and an entry becomes one element |
| `AnEntryWithoutAnIdIsAddressedByItsPlaceAndMarkedNotStored` | 1 | an entry without an id is addressed by its place and marked not stored |
| `ASidecarIdIsTakenFromTheRegistrationsIdentities` | 1 | a sidecar id is taken from the registrations identities |
| `TheSecondOfTwoEqualIdsIsReportedAndNotStored` | 1 | the second of two equal ids is reported and not stored |
| `AMissingHeaderMarkIsReportedAndTheBodyIsStillRead` | 1 | a missing header mark is reported and the body is still read |
| `ARequiredHeaderThatIsMissingMakesTheBodyUnreadableWithOneFinding` | 1 | a required header that is missing makes the body unreadable with one finding |
| `AnEntryARuleMatchesButCannotReadIsReportedAndKept` | 1 | an entry a rule matches but cannot read is reported and kept |
| `AStatementNoRuleReadsIsReportedWhenTheBindingAsksForIt` | 1 | a statement no rule reads is reported when the binding asks for it |
| `PlanningIsDeterministic` | 1 | planning is deterministic |
| `AnUnknownRegistrationHeaderIsKeptAndReported` | 1 | an unknown registration header is kept and reported |
| `AStaleLayoutEntryIsReportedAndRemovedAtTheNextWrite` | 1 | a stale layout entry is reported and removed at the next write |

### `RealFiles/DeclaredBodies.Tests.cs` → `test/core/fbl/realFiles/declaredBodies.test.ts`

| Baseline test | Cases | Counterpart title |
|---|---|---|
| `TheEnumerationFindsTheFiles` | one per declared binding | the enumeration finds the files |
| `TheFileReads` | one per binding and real file | the file reads |
| `ASaveWithoutAnEditWritesTheBytesThatWereRead` | one per binding and real file | a save without an edit writes the bytes that were read |
| `AnEditChangesOnlyItsSplicesAndItsUndoRestoresTheFile` | one per binding and real file | an edit changes only its splices and its undo restores the file |
| `ARemovalChangesOnlyItsSplicesAndItsUndoRestoresTheFile` | one per binding and real file | a removal changes only its splices and its undo restores the file |
| `AnUndoAfterTheFileChangedIsRefused` | one per binding and real file | an undo after the file changed is refused |
| `EveryListedDivergenceNamesAFileOfTheSuite` | 1 | every listed divergence names a file of the suite |

### `RealFiles/ModuleCrossCheck.Tests.cs` → not applicable

| Baseline test | Cases | Reason |
|---|---|---|
| `TheBindingReadsTheIdsTheModuleReads` | one per binding and real file | It compares what a binding reads with what standalone's own C# parsers for the timeline, the causal loop diagram, C4 and the mind map read. This host has no such parsers: its two diagrams are the hype cycle graph and Agent Behavior Modelling, and neither has an example binding. |

### `RealFiles/Registrations.Tests.cs` → `test/core/fbl/realFiles/registrations.test.ts`

| Baseline test | Cases | Counterpart title |
|---|---|---|
| `TheEnumerationFindsTheRegistrations` | 1 | the enumeration finds the registrations |
| `TheRegistrationParsesAndSavesUnchanged` | one per registration file | the registration parses and saves unchanged |
| `ADeclaredBindingsRegistrationOpensItsBody` | one per registration file | a declared bindings registration opens its body |
| `AW3CReadingsSuggestMatchesItsBody` | one per registration file | a W3C readings suggest matches its body |
| `AC4RegistrationReadsItsLegacyLayout` | one per registration file | a C4 registration reads its legacy layout |
| `TheC4LegacyLayoutsArePositionedThroughTheirRegistrations` | 1 | the C4 legacy layouts are positioned through their registrations |
| `EveryChartFolderIsRecognisedAndEveryTurtleFileRoutesToTheTurtleBinding` | 1 | every chart folder is recognised and every turtle file routes to the turtle binding |

### `Registration/Registration.Tests.cs` → `test/core/fbl/registration.test.ts`

| Baseline test | Cases | Counterpart title |
|---|---|---|
| `TheBodyIsTheSiblingWithTheRegistrationsBaseName` | 1 | the body is the sibling with the registrations base name |
| `AMissingBodyOpensAsMissing` | 1 | a missing body opens as missing |
| `ABodyOutsideTheWorkspaceIsRefused` | 2 | a body outside the workspace is refused |
| `ABodyReachedThroughALinkIsRefused` | 1 | a body reached through a link is refused † |
| `AnIdentityIsStoredInOrderAfterTheLayout` | 1 | an identity is stored in order after the layout |
| `ALegacyLayoutIsReadForItsViewIgnoringCase` | 1 | a legacy layout is read for its view ignoring case |
| `ALegacyLayoutIsWrittenBySplicesAndUndone` | 1 | a legacy layout is written by splices and undone |
| `LegacyIdentitiesAreReadAndWritten` | 1 | legacy identities are read and written |
| `TheSidecarPathIsBesideTheBodyWithItsBaseName` | 1 | the sidecar path is beside the body with its base name |

### `Routing/Routing.Tests.cs` → `test/core/fbl/routing.test.ts`

| Baseline test | Cases | Counterpart title |
|---|---|---|
| `APatternMarkerLooksAtItsFirstLines` | 4 | a pattern marker looks at its first lines |
| `ARootKeyMarkerReadsYamlAndJsonWithoutABinding` | 4 | a root key marker reads YAML and JSON without a binding |
| `AFirstLineMarkerIsMatchedAfterAByteOrderMark` | 1 | a first line marker is matched after a byte order mark |
| `ARegistrationOnlyBindingIsNeverACandidate` | 1 | a registration only binding is never a candidate |
| `AnExtensionIsMatchedIgnoringCase` | 1 | an extension is matched ignoring case |
| `SeveralCandidatesAreAllReturned` | 1 | several candidates are all returned |
| `AReadingWhoseSuggestMatchesIsOfferedFirst` | 1 | a reading whose suggest matches is offered first |
| `AGlobMatchesAsFblDefinesIt` | 9 | a glob matches as FBL defines it |
| `AFolderIsRecognisedAndItsFilesSelectedWithoutFollowingLinks` | 1 | a folder is recognised and its files selected without following links † |

### `Routing/Templates.Tests.cs` → `test/core/fbl/templates.test.ts`

| Baseline test | Cases | Counterpart title |
|---|---|---|
| `EveryDeclaredTemplateReadsBackWithoutAWarning` | one per declared template | every declared template reads back without a warning |
| `ATemplateByOriginWinsOverTheBindingsText` | 1 | a template by origin wins over the bindings text |
| `TheKeyPlaceholderIsSanitisedExactly` | 6 | the key placeholder is sanitised exactly |
| `OnlyTheFourPlaceholdersAreReplaced` | 1 | only the four placeholders are replaced |
| `APluginWithoutTemplateTextIsAskedForOne` | 1 | a plugin without template text is asked for one |

### `Yaml/YamlScalars.Tests.cs` → `test/core/fbl/yamlScalars.test.ts`

| Baseline test | Cases | Counterpart title |
|---|---|---|
| `APlainSafeStringIsWrittenPlain` | 47 | a plain safe string is written plain |
| `ADateIsPlainSafeWhenTheAttributeIsADate` | 2 | a date is plain safe when the attribute is a date |
| `ADoubleQuotedStringEscapesBackslashQuoteAndControlCharacters` | 2 | a double quoted string escapes backslash quote and control characters |
| `ASingleQuotedStringDoublesItsQuotes` | 1 | a single quoted string doubles its quotes |
