# Test baseline: standalone's FBL tests

The 86 tests of `EtAlii.Adp.Specification.Fbl.Tests` in [`etalii.adp.ide.standalone`](https://github.com/etalii-adp/etalii.adp.ide.standalone/tree/develop/src/backend/EtAlii.Adp.Specification.Fbl.Tests), read at `develop` commit `25fc7b4a` on 2026-10-05. They arrived with standalone pull request 112. This is the minimum the specification's FR-020 asks of this host: each test below has a counterpart here, or is listed in the host's repository as not applicable with its reason (FR-021).

A test's name states what it checks. **Cases** is how many times it runs: once, once for each row of inputs written in the test, or once for each item of a set found at run time (a fixture, a real file, a registration file). Standalone's run counts about 1,200 cases, most of them from its real files.

The inputs and expected results of each test are in the test's source at the commit above; a counterpart uses the same ones.

### `Bytes/BodyText.Tests.cs`

| Test | Cases |
|---|---|
| `AColumnCountsCodePointsNotBytesOrUtf16Units` | 1 |
| `TheByteOrderMarkBelongsToNoColumn` | 1 |
| `CrlfLfAndALoneCrEachEndALine` | 1 |
| `ABodyOfOnlyALoneCrIsOneEmptyLineEndedByCr` | 1 |
| `CrlfWinsATieAndALoneCrCountsAsNeither` | 4 |
| `AnInvalidUtf8SequenceIsFoundWithItsOffset` | 1 |

### `Conformance/ConformanceFixtures.Tests.cs`

| Test | Cases |
|---|---|
| `TheFixturesAreFound` | 1 |
| `TheFixturePasses` | one per fixture |
| `EveryByteOfTheInputBelongsToTheReading` | one per fixture |

### `Expressions/Expressions.Tests.cs`

| Test | Cases |
|---|---|
| `AConstructOutsideTheSubsetIsRejectedByName` | 9 |
| `AnExpressionInTheSubsetIsAccepted` | 3 |
| `DigitsAndWordCharactersAreAsciiOnly` | 1 |
| `ACelExpressionEvaluatesOnAnEntry` | 9 |
| `AnExpressionOutsideTheSubsetFailsToCompile` | 3 |

### `History/History.Tests.cs`

| Test | Cases |
|---|---|
| `ASnapshotUndoEqualsAnInverseSpliceUndo` | 1 |
| `RedoRepeatsTheEditAndIsRefusedOnDrift` | 1 |
| `AReloadClearsTheHistory` | 1 |
| `ASaveHandsTheHostsWriterTheEditedBytes` | 1 |
| `AnUnreadableBodyIsNeverSaved` | 1 |

### `Loading/Loading.Tests.cs`

| Test | Cases |
|---|---|
| `AValidDocumentLoadsWithoutAProblem` | 1 |
| `ADuplicateKeyAnywhereIsRejectedAtItsPointer` | 1 |
| `AnotherMajorVersionIsRefused` | 2 |
| `ANewerMinorVersionLoadsWithAWarning` | 1 |
| `ANameThatDoesNotResolveIsRejectedAtItsPointer` | 6 |
| `AStepSixCheckIsApplied` | 5 |
| `ASharedClaimWithAMarkerIsAccepted` | 1 |
| `EveryProblemIsReportedRatherThanTheFirst` | 1 |
| `AReferenceResolvesAgainstTheReferringDocument` | 1 |

### `Plugins/PluginBody.Tests.cs`

| Test | Cases |
|---|---|
| `AMissingPluginOpensTheBodyReadOnlyWithAFinding` | 1 |
| `APluginWithAnotherIdCountsAsMissing` | 1 |
| `ThePluginsSplicesAreAppliedRecordedAndUndone` | 1 |
| `APluginsRefusalWritesNothing` | 1 |
| `AReadOnlyBindingsPluginIsNeverAskedToPlan` | 1 |

### `Reading/Reading.Tests.cs`

| Test | Cases |
|---|---|
| `TheFirstRuleInBindingOrderTakesAnEntryAndAnEntryBecomesOneElement` | 1 |
| `AnEntryWithoutAnIdIsAddressedByItsPlaceAndMarkedNotStored` | 1 |
| `ASidecarIdIsTakenFromTheRegistrationsIdentities` | 1 |
| `TheSecondOfTwoEqualIdsIsReportedAndNotStored` | 1 |
| `AMissingHeaderMarkIsReportedAndTheBodyIsStillRead` | 1 |
| `ARequiredHeaderThatIsMissingMakesTheBodyUnreadableWithOneFinding` | 1 |
| `AnEntryARuleMatchesButCannotReadIsReportedAndKept` | 1 |
| `AStatementNoRuleReadsIsReportedWhenTheBindingAsksForIt` | 1 |
| `PlanningIsDeterministic` | 1 |
| `AnUnknownRegistrationHeaderIsKeptAndReported` | 1 |
| `AStaleLayoutEntryIsReportedAndRemovedAtTheNextWrite` | 1 |

### `RealFiles/DeclaredBodies.Tests.cs`

| Test | Cases |
|---|---|
| `TheEnumerationFindsTheFiles` | one per declared binding |
| `TheFileReads` | one per binding and real file |
| `ASaveWithoutAnEditWritesTheBytesThatWereRead` | one per binding and real file |
| `AnEditChangesOnlyItsSplicesAndItsUndoRestoresTheFile` | one per binding and real file |
| `ARemovalChangesOnlyItsSplicesAndItsUndoRestoresTheFile` | one per binding and real file |
| `AnUndoAfterTheFileChangedIsRefused` | one per binding and real file |
| `EveryListedDivergenceNamesAFileOfTheSuite` | 1 |

### `RealFiles/ModuleCrossCheck.Tests.cs`

| Test | Cases |
|---|---|
| `TheBindingReadsTheIdsTheModuleReads` | one per binding and real file |

### `RealFiles/Registrations.Tests.cs`

| Test | Cases |
|---|---|
| `TheEnumerationFindsTheRegistrations` | 1 |
| `TheRegistrationParsesAndSavesUnchanged` | one per registration file |
| `ADeclaredBindingsRegistrationOpensItsBody` | one per registration file |
| `AW3CReadingsSuggestMatchesItsBody` | one per registration file |
| `AC4RegistrationReadsItsLegacyLayout` | one per registration file |
| `TheC4LegacyLayoutsArePositionedThroughTheirRegistrations` | 1 |
| `EveryChartFolderIsRecognisedAndEveryTurtleFileRoutesToTheTurtleBinding` | 1 |

### `Registration/Registration.Tests.cs`

| Test | Cases |
|---|---|
| `TheBodyIsTheSiblingWithTheRegistrationsBaseName` | 1 |
| `AMissingBodyOpensAsMissing` | 1 |
| `ABodyOutsideTheWorkspaceIsRefused` | 2 |
| `ABodyReachedThroughALinkIsRefused` | 1 |
| `AnIdentityIsStoredInOrderAfterTheLayout` | 1 |
| `ALegacyLayoutIsReadForItsViewIgnoringCase` | 1 |
| `ALegacyLayoutIsWrittenBySplicesAndUndone` | 1 |
| `LegacyIdentitiesAreReadAndWritten` | 1 |
| `TheSidecarPathIsBesideTheBodyWithItsBaseName` | 1 |

### `Routing/Routing.Tests.cs`

| Test | Cases |
|---|---|
| `APatternMarkerLooksAtItsFirstLines` | 4 |
| `ARootKeyMarkerReadsYamlAndJsonWithoutABinding` | 4 |
| `AFirstLineMarkerIsMatchedAfterAByteOrderMark` | 1 |
| `ARegistrationOnlyBindingIsNeverACandidate` | 1 |
| `AnExtensionIsMatchedIgnoringCase` | 1 |
| `SeveralCandidatesAreAllReturned` | 1 |
| `AReadingWhoseSuggestMatchesIsOfferedFirst` | 1 |
| `AGlobMatchesAsFblDefinesIt` | 9 |
| `AFolderIsRecognisedAndItsFilesSelectedWithoutFollowingLinks` | 1 |

### `Routing/Templates.Tests.cs`

| Test | Cases |
|---|---|
| `EveryDeclaredTemplateReadsBackWithoutAWarning` | one per declared template |
| `ATemplateByOriginWinsOverTheBindingsText` | 1 |
| `TheKeyPlaceholderIsSanitisedExactly` | 6 |
| `OnlyTheFourPlaceholdersAreReplaced` | 1 |
| `APluginWithoutTemplateTextIsAskedForOne` | 1 |

### `Yaml/YamlScalars.Tests.cs`

| Test | Cases |
|---|---|
| `APlainSafeStringIsWrittenPlain` | 47 |
| `ADateIsPlainSafeWhenTheAttributeIsADate` | 2 |
| `ADoubleQuotedStringEscapesBackslashQuoteAndControlCharacters` | 2 |
| `ASingleQuotedStringDoublesItsQuotes` | 1 |
