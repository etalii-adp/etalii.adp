# Tasks: Designer Files That Open Without a Registration in the Standalone Host

**Input**: [bare-designer-files.spec.md](bare-designer-files.spec.md), [plan.md](plan.md), [research.md](research.md)

**Tests**: written first and seen failing, as standalone principle III asks. Paths start with the repository they are in; `standalone` is `etalii.adp.ide.standalone`.

**Format**: `[ID] [P?] [Story] Description`. A task is ticked only once the pull request it landed in has merged.

## Phase 1: The routing reads enough of a file (pull request B)

- [x] T001 [US1] Test first, then a root key evaluated over a head that may be cut off, in `standalone/src/backend/EtAlii.Adp.Specification.Fbl/Routing/MarkerEvaluator.cs`: a key before the cut is found in cut-off YAML and JSON, a key after it is not, and a whole document gives the answer it gave before (R2) [FR-001, SC-005]
- [x] T002 [US1] Test first, then `FirstLineCache` made a head cache of the first 64 KiB cut at a line end, kept until the file's length or write time changes, in `standalone/src/backend/EtAlii.Adp.Hierarchy/` (R2) [FR-001]

## Phase 2: One claim for any designer type (pull request B)

- [x] T003 [US3] Test first, then a designer claim made from a designer type's bundled bindings: extensions and names from their `claims`, the match by `Router.Candidates`, the refusal sentence from the matching marker, and `createOnFirstPlacement`, in `standalone/src/backend/EtAlii.Adp.Designer/_Model/` and `EtAlii.Adp.Specification.Fbl/Routing/BodyClaim.cs` (R1) [FR-003, SC-004]
- [x] T004 [US3] The hierarchical requirement designer's `Designer.cs` names its binding for its claim in place of its extension and envelope; its routing tests stay green unchanged (R1) [FR-003, SC-005]
- [x] T005 [US1] Test first, then the knowledge designer's `Designer.cs` naming its three bindings for its claim; every knowledge example in YAML, JSON and XML routes to it with no registration, and an ordinary YAML, JSON or XML file still routes to its editor (R1) [FR-001, US3]
- [x] T006 [US1] Test first, then a knowledge table opened with no registration: what it shows, an edit and its undo byte for byte, and the folder unchanged after opening and closing; a view setting creates the registration only as the binding's `registration` says (R3) [FR-002, SC-001]

## Phase 3: The workspace sees it (pull request B)

- [x] T007 [US2] Test first, then a bare knowledge file in a watched hierarchy: shown as a knowledge table when copied in, with no restart (R4) [FR-004, SC-002]
- [x] T008 [US2] Test first, then a bare knowledge file held by the index of links, offered as a knowledge relation's target and by a lookup, its own relations and links resolving (R4) [FR-004]
- [x] T009 [US3] Test first, then a file two designer types claim offered with both and opened in neither silently, and a file whose envelope names an origin no installed designer type has opened as text with a sentence naming it (R6) [FR-005, FR-006]
- [x] T010 Every example and fixture the standalone host carries routed as before, recorded first and compared after [SC-005]
- [x] T011 `standalone/docs/creating-a-designer-module.md`: a binding's marker is what lets a designer type's files open without a registration; `docs/architecture.md` where a routing sentence changed; run the four gates on the Mac mini and `inspect.sh`, open pull request B, turn auto-merge on [FR-007]

## Phase 4: Host test and ticks (pull requests C and D)

- [x] T012 Host test of the standalone host on the Mac mini once B has merged: copy a knowledge file into a project, open it, relate another table to it, link a diagram element to one of its rows, with a new user's first steps timed and every hurdle recorded in `standalone/tests.md`; open pull request C, turn auto-merge on [SC-003, FR-007]
- [x] T013 Trace every FR and SC to the files and strings that satisfy it, read two traces back to their artefacts, record it here, and tick this feature in one etalii.adp pull request D

## Coverage

Every functional requirement is claimed: FR-001 (T001, T002, T005), FR-002 (T006), FR-003 (T003, T004), FR-004 (T007, T008), FR-005 (T009), FR-006 (T009), FR-007 (T011, T012). Success criteria: SC-001 (T006), SC-002 (T007), SC-003 (T012), SC-004 (T003), SC-005 (T001, T004, T010).

## Trace (T013)

Each requirement, traced to the files and strings in `etalii.adp.ide.standalone` at `develop` that satisfy it. The code arrived in standalone #849 (T001 to T011), #850, #853 and #855 (the host test and its two re-runs, T012), and #851, #852 and #854 (the hurdles the host test found).

| Requirement | Satisfied by |
| --- | --- |
| FR-001 | `src/backend/EtAlii.Adp.Designer/_Model/DesignerClaim.cs`, `new DesignerClaim(bindings)`, matched through `EtAlii.Adp.Specification.Fbl/Routing/BodyClaim.cs` and `Router.cs`; the head from `src/backend/EtAlii.Adp.Hierarchy/HeadCache.cs` and the root key over a cut-off head in `Routing/MarkerEvaluator.cs`. Tests `Takes_AFileByTheNamesAndExtensionsOfItsBindings` and `Matches_AFileByTheMarkerOfTheBindingThatTakesIt` (`DesignerClaim.Tests.cs`), `ARootKeyMarkerIsFoundBeforeTheCutOfAHeadThatIsCutOff` (`Routing.Tests.cs`), `TheHead_HoldsAKeyBeyondTheFirstLine` (`EnvelopeRouting.Tests.cs`), `AKnowledgeFileWithNoRegistration_IsTheKnowledgeDesignersDocument` (`KnowledgeDesigner.Tests.cs`) |
| FR-002 | `AKnowledgeFileWithNoRegistration_IsShown_Edited_AndUndone_AndOpeningItWritesNothing` (`KnowledgeDesigner.Tests.cs`), in YAML, JSON and XML; `CreatesRegistration_IsWhatTheBindingsRegistrationSays` (`DesignerClaim.Tests.cs`) |
| FR-003 | `src/designers/knowledge/backend/EtAlii.Adp.Designer.Knowledge/Designer.cs`, `new DesignerClaim(KnowledgeDefinition.Bindings)`, and the hierarchical requirement designer's `Designer.cs` naming its binding; its routing tests in `EnvelopeRouting.Tests.cs` unchanged and green |
| FR-004 | `AKnowledgeFileCopiedIntoARunningProject_IsShownAsAKnowledgeTable_WithoutARestart` (`KnowledgeDesigner.Tests.cs`), `TwoKnowledgeFilesWithNoRegistration_AreRelated_AndHeldByTheIndexOfLinks` (`KnowledgeContextActions.Tests.cs`); the explorer state from `ToolRouter.ClaimedByDesigner` through `EntryDiagramStates.Decide` (#852) |
| FR-005 | `src/backend/EtAlii.Adp.Hierarchy/DesignerFileRouter.cs`: "It is a document of more than one installed designer type by its own content: … and …. A registration beside it that names one of them decides which it opens in."; test `ABodyThatTwoDesignerTypesClaim_IsOpenedInNeither_AndTheRefusalNamesBoth` (`EnvelopeRouting.Tests.cs`) |
| FR-006 | `src/backend/EtAlii.Adp.Problems/ProjectValidator.cs`: "It names the designer type '…', which is not installed here, so it opens as text." under `CoreRuleIds.UnknownType`; tests `ABodyWhoseEnvelopeNamesATypeThatIsNotInstalled_OpensAsText_AndTheTypeIsNamed`, `ABodyWithNoEnvelope_OrOneOfAnInstalledType_NamesNoMissingType` (`EnvelopeRouting.Tests.cs`) and `ValidateAsync_AFileWhoseEnvelopeNamesADesignerTypeThatIsNotInstalled_IsSaidToNameIt` (`ProjectValidator.Tests.cs`) |
| FR-007 | `docs/creating-a-designer-module.md`: "**A binding's marker is what lets a designer type's files open without a registration.**"; `tests.md`, "Designer files open without a registration in the standalone host (etalii.adp spec 093, T012)" |
| SC-001 | as FR-002, over the knowledge examples in YAML, JSON and XML (`AKnowledgeFileWithNoRegistration_IsTheKnowledgeDesignersDocument` is a theory over every example) |
| SC-002 | `AKnowledgeFileCopiedIntoARunningProject_IsShownAsAKnowledgeTable_WithoutARestart` |
| SC-003 | `tests.md`, the T012 entry: the first run (#850) met eight hurdles, fixed in #851, #852 and #854; the second run (#853) found five of them gone, and the third run (#855), on `develop` with #854 merged, found the last three gone and met no hurdle. A new user got from page load to the first table in 34 s |
| SC-004 | `DesignerClaim.cs` takes bindings and nothing else; no host file under `src/backend/` names a designer type, extension or marker for routing (the two designer types name only their bindings in their own `Designer.cs`) |
| SC-005 | the routing census of standalone #849: all 2,120 example and fixture files under `src/` routed on `develop` and on the branch; the only differences are the 21 knowledge examples and fixtures that now open in the knowledge designer |

Two traces were read back to their artefacts. **FR-005**: the test writes one bare file that two installed designer types claim, asserts `ToolUnreadable` and that its reason contains both types' titles, and asserts that a registration of one beside a second copy routes it to that type; the sentence it reads is the one in `DesignerFileRouter.cs` above, built from `claimants`. **FR-006**: the test writes a file of an installed type, one whose envelope names `fixture/absent` and an ordinary YAML file, and asserts exactly one problem, against `plans.yaml`, of rule `UnknownType`, whose message contains `'fixture/absent'`; that is the sentence in `ProjectValidator.cs` above. Both are evidence of their own criterion and not of a neighbour's.

