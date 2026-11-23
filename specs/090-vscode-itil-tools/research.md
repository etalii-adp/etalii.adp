# Research: The Three Service Management Tools in VS Code

Each item is a decision the plan rests on, with what was checked. "VS Code" means `etalii.adp.ide.vscode` at `develop` `3c17376`; the inventory of the specification's Context was taken there, with the three definitions of etalii.adp `c031e08` copied into a scratch tree and opened through `toolTypeFrom`.

## R1 - Why the value stream map draws nothing (V1)

- **Decision**: CEL's `max()` and `min()` of a list of whole numbers return a whole number, `sum()` of whole numbers a whole number, and only a list holding a decimal number gives a decimal number. Fixed once in `src/core/disl/expressions.ts`, for every tool type.
- **Rationale**: `depth` ends in `….map(f, depth(…)).max() + 1`. VS Code registers `list.max(): double`, so the sum is `double + int`, which CEL refuses without an implicit conversion. DISL 12.2 gives `max`, `min` and `sum` the type of the list's items. Every placement that uses `depth` then fails, and the scene falls back to no position.
- **Alternatives**: change the definition to `double(depth(…))`. Rejected: the definition is right, and other definitions will meet the same thing.

## R2 - The graph members `reachable` and `inCycle` (V2)

- **Decision**: Add `Entity.reachable(string): list<dyn>`, `Entity.inCycle(string): bool`, `Entity.successors(string)`, `Entity.predecessors(string)`, `Entity.neighbors()` and `Entity.hasCycle(string)` as DISL 12.2's node-specific table defines them. Subtypes are included in a type name (DISL 2.7). Results are memoised per evaluation run (DISL 12.3, costs). `cycles` and `cyclesTruncated` already exist in `src/core/disl/cycles.ts`, and the new members reuse its walk.
- **Rationale**: the value stream map's `unconnectedStep`, `unmarkedCycle`, `reworkForward`, `inLoop` and `computable` need them. Every DISL definition with a state machine or a flow can use them.

## R3 - Ids and names the value stream map does not read (V3)

- **Decision**: First test the reading of `request-fulfilment.vsm` against `value-stream-map-read`'s stated elements, ids and attributes. Then fix what differs in the FBL library or in `src/core/disl/persistence.ts`, for every binding.
- **Rationale**: the definition derives ids (`ids` rules over the step's name and state) and binds `name`. The inventory saw `std.missingId` on every element and an empty name in `vsm.missing-wait`. The likely cause is that VS Code's FBL library knows FBL up to 0.8, and the value stream map's binding is FBL 0.21. The fixture shows which part is missing; no guess is built in.

## R4 - FBL up to 0.22 (S1, S2)

- **Decision**: Raise VS Code's FBL library (`src/core/fbl/`) from 0.8 to 0.22 only as far as the three bindings use it. That covers `body.stream: "documents"` in the `yaml` family (FBL 4.3, 6.2), the folder subject of FBL 10 for the SLO map's `folder` binding, and CEL `distinct` in the FBL expression environment. Each other construct of 0.9 to 0.22 stays "loads with a warning", as `docs/fbl.md` records today.
- **Rationale**: `src/core/fbl/` is the library the Notion add-ons copy (`sync-fbl.mjs` in `etalii.adp.ide.notion`). It must stay one library, so the new constructs go there, not into a reader beside it. The `grammar` family and the other 0.9 to 0.18 constructs are used by none of the three and are out of scope.
- **Alternatives**: a persistence plugin for OpenSLO. Rejected: FBL 11.1 says a declarable format **SHOULD** be bound, and the binding exists.

## R5 - DESL 0.4 and the `sections` surface (P1)

- **Decision**: Raise `src/core/desl/specification.ts` to read DESL 0.4. Add `interpretSections` beside `interpretTable` and `interpretHierarchy` in `src/core/desl/surface.ts`, and a `SectionsView` in `src/core/tool/sectionsView.ts`, served like `HierarchyView`. The webview gets one new surface in `src/webview/designer/sections/`: record parts as label and value rows, list parts as rows with their columns, groups, marks and figures, and the time strip as one horizontal axis with each row's time.
- **Rationale**: DESL 7.8 states the surface. The post-incident review is its first user, and the minimal example `specifications/desl/minimal-sections.des` is the second. A designer that declares `sections` gets the page with no code of its own (VS Code principle III).
- **DESL 0.3**: whatever 0.3 added that the review uses is read too, found by loading the review's specification and listing what VS Code reports as unread.

## R6 - `many` attributes, mentions and mapped values in the `bullets` family (P2, P3)

- **Decision**: Test the review's reading against `post-incident-review-read` first. Then add to the `bullets` family whatever it lacks among FBL 0.7's word slots of a `many` attribute, case-insensitive `map`, and constant `value` attributes. The etalii.adp validator's `BulletsModel` (spec 086) is the reference reading.
- **Rationale**: the inventory shows `evidence` and `entries` refused as "not a value of the type `string`", which means `many` is not honoured, and milestone kinds not read, which means `map` is not applied. Both are FBL 0.7, and the hierarchical requirement designer, which VS Code already reads, does not use them.

## R7 - What the fixtures can and cannot hold

- **Decision**: Copy each tool's read and edit fixtures from `specifications/fbl/fixtures/` unchanged into `fixtures/tools/<tool>/`, with a `PROVENANCE.md` of path, commit and SHA-256, as `definitions/` does. Hold them in one test per tool: elements, attributes, parents and findings of each read case, and the bytes after each edit step.
- **Rationale**: there is no standalone transcript. The fixtures are what spec 084 to 086 declared a host must do. A finding the fixture states with `x-element` and `x-severity` is held too, which closes spec 085's T028 in a host.

## R8 - Working beside spec 088

- **Decision**: Spec 088 (the dependency graph, another thread) changes `src/core/disl/` and `src/core/tool/` in VS Code at the same time. Each pull request here starts from `develop` after 088's latest merge and changes the smallest set of files it can. A conflict is resolved by merging `develop` into the branch, never by rewriting 088's code.
