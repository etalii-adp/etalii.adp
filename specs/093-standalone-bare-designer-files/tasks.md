# Tasks: Designer Files That Open Without a Registration in the Standalone Host

**Input**: [bare-designer-files.spec.md](bare-designer-files.spec.md), [plan.md](plan.md), [research.md](research.md)

**Tests**: written first and seen failing, as standalone principle III asks. Paths start with the repository they are in; `standalone` is `etalii.adp.ide.standalone`.

**Format**: `[ID] [P?] [Story] Description`. A task is ticked only once the pull request it landed in has merged.

## Phase 1: The routing reads enough of a file (pull request B)

- [ ] T001 [US1] Test first, then a root key evaluated over a head that may be cut off, in `standalone/src/backend/EtAlii.Adp.Specification.Fbl/Routing/MarkerEvaluator.cs`: a key before the cut is found in cut-off YAML and JSON, a key after it is not, and a whole document gives the answer it gave before (R2) [FR-001, SC-005]
- [ ] T002 [US1] Test first, then `FirstLineCache` made a head cache of the first 64 KiB cut at a line end, kept until the file's length or write time changes, in `standalone/src/backend/EtAlii.Adp.Hierarchy/` (R2) [FR-001]

## Phase 2: One claim for every designer type (pull request B)

- [ ] T003 [US3] Test first, then a designer claim made from a designer type's bundled bindings: extensions and names from their `claims`, the match by `Router.Candidates`, the refusal sentence from the matching marker, and `createOnFirstPlacement`, in `standalone/src/backend/EtAlii.Adp.Designer/_Model/` and `EtAlii.Adp.Specification.Fbl/Routing/BodyClaim.cs` (R1) [FR-003, SC-004]
- [ ] T004 [US3] The hierarchical requirement designer's `Designer.cs` names its binding for its claim in place of its extension and envelope; its routing tests stay green unchanged (R1) [FR-003, SC-005]
- [ ] T005 [US1] Test first, then the knowledge designer's `Designer.cs` naming its three bindings for its claim; every knowledge example in YAML, JSON and XML routes to it with no registration, and an ordinary YAML, JSON or XML file still routes to its editor (R1) [FR-001, US3]
- [ ] T006 [US1] Test first, then a knowledge table opened with no registration: what it shows, an edit and its undo byte for byte, and the folder unchanged after opening and closing; a view setting creates the registration only as the binding's `registration` says (R3) [FR-002, SC-001]

## Phase 3: The workspace sees it (pull request B)

- [ ] T007 [US2] Test first, then a bare knowledge file in a watched hierarchy: shown as a knowledge table when copied in, with no restart (R4) [FR-004, SC-002]
- [ ] T008 [US2] Test first, then a bare knowledge file held by the index of links, offered as a knowledge relation's target and by a lookup, its own relations and links resolving (R4) [FR-004]
- [ ] T009 [US3] Test first, then a file two designer types claim offered with both and opened in neither silently, and a file whose envelope names an origin no installed designer type has opened as text with a sentence naming it (R6) [FR-005, FR-006]
- [ ] T010 Every example and fixture the standalone host carries routed as before, recorded first and compared after [SC-005]
- [ ] T011 `standalone/docs/creating-a-designer-module.md`: a binding's marker is what lets a designer type's files open without a registration; `docs/architecture.md` where a routing sentence changed; run the four gates on the Mac mini and `inspect.sh`, open pull request B, turn auto-merge on [FR-007]

## Phase 4: Host test and ticks (pull requests C and D)

- [ ] T012 Host test of the standalone host on the Mac mini once B has merged: copy a knowledge file into a project, open it, relate another table to it, link a diagram element to one of its rows, with a new user's first steps timed and every hurdle recorded in `standalone/tests.md`; open pull request C, turn auto-merge on [SC-003, FR-007]
- [ ] T013 Trace every FR and SC to the files and strings that satisfy it, read two traces back to their artefacts, record it here, and tick this feature in one etalii.adp pull request D

## Coverage

Every functional requirement is claimed: FR-001 (T001, T002, T005), FR-002 (T006), FR-003 (T003, T004), FR-004 (T007, T008), FR-005 (T009), FR-006 (T009), FR-007 (T011, T012). Success criteria: SC-001 (T006), SC-002 (T007), SC-003 (T012), SC-004 (T003), SC-005 (T001, T004, T010).
