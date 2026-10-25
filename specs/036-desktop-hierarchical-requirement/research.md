# Research: The Hierarchical Requirement Designer in the Desktop Host

Read on 2026-10-25: the desktop host at `develop` `ae9c69f`, the standalone host at `develop` `a7fdf03`, etalii.adp at `develop` `95fd4e3` (spec 036 merged on top).

## R1. The FBL work is a port of the standalone library's changes, not a fresh reading of FBL 0.7

**Decision**: port, file by file, what the standalone host's `EtAlii.Adp.Specification.Fbl` gained between spec 030's reference commit `8b6ccfc` and `a7fdf03` for the `bullets` family and the registration: `Files/Bullets/{Bullet,BulletsFamily,BulletsParser,Columns,Heading}.cs` into `adp-fbl/src/families/bullets.rs`; `Registration/{DeclaredBlockWriter,OpenRegistration,RegistrationCreation,RegistrationDocument}.cs` and `Documents/_Model/RegistrationBlockDeclaration.cs` into `adp-fbl/src/registration/`; the drift check of `History/{EditHistory,SplicedFile}.cs` and `Planning/EditPlanner.cs` into `adp-fbl/src/history/` and `planning/`. Each Rust file names the C# file it ports and the commit, as spec 030's ports do.

**Rationale**: desktop Principle II asks for the standalone host's bytes, and the standalone library is where those bytes are decided; the 29 fixtures are the check. The desktop host already has drift on undo and redo (`adp-fbl/src/history/mod.rs`, `DRIFT_UNDO`); drift before an edit (FBL 0.7 section 7.2) is the missing half.

**Alternatives considered**: implementing FBL 0.7 from the specification alone (rejected: two readings of one text are how hosts drift apart, and the fixtures do not cover every byte the goldens do); porting the standalone library's other changes since `8b6ccfc` (the JSON, YAML and XML parser rewrites, FBL 0.8's insert constants) (rejected: not this feature's; spec 035 and later features carry them).

## R2. The vendored etalii.adp is refreshed whole

**Decision**: the first pull request runs `python tools/sync-etalii-adp.py <commit>` with the etalii.adp `develop` commit of that day, which holds pull request 508. The whole `specifications/` and `definitions/` move together, as the tool and its `--check` require.

**Rationale**: one source of truth; the DESL schema the loader reads gains the `widths` role in the same commit as the definition that uses it, so copying the definition alone into the module would fail the loader.

**Risk**: the refresh also moves `sankey.dis`, `sparql-query.dis` and `wardley-map.dis`, which three desktop modules read, and adds the fixture `sankey-written-text`. The first pull request runs the whole suite. A failure that is loading or counting (a test that counts specifications, a new fixture whose family the desktop host does not read) is fixed there, the new fixture set aside in `NOT_SUPPORTED` with its reason. A failure that changes what another tool type does in the desktop host is not settled in this feature: implementation stops and the maintainer is asked, as a selection, whether to refresh to the oldest commit with pull request 508 (`f8ec747`, which moves sankey and SPARQL but not Wardley), adapt the module, or record the difference in the parity inventory.

## R3. A second reference commit, per script

**Decision**: the designer's scripts are recorded from the standalone host at `a7fdf03`, its reference commit for this feature, and every other script stays at `8b6ccfc`. The recorder takes the reference commit from a `reference` file beside a script folder (`parity/scripts/etalii/hierarchical-requirement/reference`), falling back to `8b6ccfc`, and refuses a worktree at another commit as it does now; `recorded.json` already carries `standaloneCommit`. The standalone worktree for it is `../standalone-a7fdf03`.

**Rationale**: the designer does not exist at `8b6ccfc`. Re-recording every golden at `a7fdf03` would move spec 030's parity, which is not this feature's.

**Alternatives considered**: a `--reference` option on the command line (rejected: a golden would then depend on how it was run, not on what is in the repository).

## R4. The surface's model and session in `adp-desl`, as the table's are

**Decision**: `adp-desl/src/hierarchy/` holds the standalone host's `HierarchySurfaceModel` and its members (`EtAlii.Adp.Designer/HierarchySurfaceModel/*.cs`, `designers.proto` messages `HierarchySurface*`) as plain Rust structs, and its `IHierarchySurfaceSession` as a trait `HierarchySurfaceSession`: `model()`, `gesture(edit_id, operation, target_id, params) -> Result<(), String>`, `take_changes()` (a new whole model, or an edit outcome), `undo()`, `redo()`. The whole model is re-sent on every change, as the standalone host's stream sends it.

**Rationale**: it is how the desktop host holds the table (`adp-desl/src/table/session.rs`, `DesignerSession` with `take_changes`), so the shell drains both the same way; and the standalone contract is already generic: a gesture is an operation name, a target and a map of params, the operations being the definition's. That keeps FR-012 (a later `hierarchy` designer needs no surface code).

**Alternatives considered**: a delta protocol (rejected, as spec 029's R8 rejected it: a document of 600 entries is re-mapped well inside SC-005); putting the surface model in the module (rejected: FR-012).

## R5. The module is the standalone module, ported

**Decision**: `modules/designers/hierarchical-requirement` (crate `adp-designer-hierarchical-requirement`) ports `src/designers/hierarchical-requirement/backend/EtAlii.Adp.Designer.HierarchicalRequirement` at `a7fdf03`: `_Model/*` into `model.rs`; `HierarchicalRequirementBody`, `HierarchicalRequirementDocuments`, `HierarchicalRequirementDocumentTemplate`, `HierarchicalRequirementVocabulary`, `HierarchicalRequirementDefinition`, `HierarchicalRequirementSurfaceMapper`, `HierarchicalRequirementSession` and `HierarchicalRequirementGestures` into one file each; `Operations/*.cs` into `operations/`; `Commands/*` onto `adp-history` as the Knowledge module does; `HierarchicalRequirementContextActionProvider` and `HierarchicalRequirementEntrySourceResolver` into `context_actions.rs` and `selection.rs`. Its tests port `EtAlii.Adp.Designer.HierarchicalRequirement.Tests` test for test, names in Rust's snake case, with the web shop example and the NIST SP 800-53 example under `tests/examples/` (the latter's `LICENSE.md` and readme vendored with it).

**Rationale**: as R1. The vocabulary test (`DefinitionConformance.Tests.cs`) holds the module to the vendored `.des`.

## R6. The envelope claim decides before the extension

**Decision**: the router asks a `shared` claim's marker before the extension's other owners: a `.md` whose line 1 is the DED envelope naming `etalii/hierarchical-requirement` opens in the designer, without a registration, ahead of the Markdown editor and Agent Behavior Modelling; any other `.md` opens as it does now. `adp-core`'s catalogue moves the designer from `unlisted` to `types`, with the standalone host's `docs/tools.md` row at `a7fdf03` (name, vendor, state) taken into the copy the catalogue reads. `adp-add` creates a document from the binding's template (FR-005 of 029) and accepts an existing requirement document unchanged (029: FR-003).

**Rationale**: as spec 029's R5 to R7 decided it in the standalone host; `adp-fbl/src/routing.rs` already evaluates markers (`marker_matches`), so the claim is data the router reads, not a special case of this designer.

## R7. Icons from one vendored font

**Decision**: the 37 Material Design Icons glyphs the standalone designer names (`mdi-plus`, `mdi-comment-multiple-outline`, `mdi-help-circle-outline`, `mdi-drag-vertical`, `mdi-chevron-right`, `mdi-delete-outline`, …, counted from `hierarchySurface/` and the module's client at `a7fdf03`) come from the `@mdi/font` version the standalone client pins (7.4.47), its font file subset to those glyphs and vendored under `adp-shell/assets/` with its licence file verbatim, registered with egui as an icon font family. The licence is read from the package's own `LICENSE` at acquisition; if it is not permissive, or is share-alike, the glyphs are painted with egui shapes as the table's few icons are, and the plan is amended.

**Rationale**: same shapes as the standalone host at no drawing code; a subset keeps the binary small; nothing is downloaded at run time (desktop Principle I).

**Alternatives considered**: an SVG renderer (rejected: a new crate dependency for 37 icons); painting every icon (the fallback).

## R8. The view mirrors the standalone library's components, in egui

**Decision**: `adp-shell/src/hierarchy/` ports `src/client/src/hierarchySurface/library` at `a7fdf03`, one Rust file per group of components (see plan, Project Structure), drawing with egui as `adp-shell/src/table/` does. Layout rules are ported as pure functions with their tests: `layout.ts` (levels that fit, column widths), `iconsLayout.ts` (row or column, from the box width and the first line's measured width), `useColumnWidths.ts` (drag, reset, keys), `filterQuery.ts` (the query language with `@`, `item:`, `sort:`), `reveal.ts` (what a reference shows). The sizes of `hierarchySurface.css` that the spec names (6px padding, 12px margins, 16px key step, 120 to 2000) are constants in `layout.rs`; its colours map onto VS Code's theme colours through `adp-theme`, as the table's do. The tag field, the option colours and the list editor reuse the table's widgets in `adp-shell/src/table/header.rs` (`OPTION_COLOURS`).

**Rationale**: the behaviour and the sizes are the standalone host's; the look is VS Code's (desktop FR-044).

**The title's hanging indent.** egui wraps a `LayoutJob` with one left edge. The first line is laid out with the handle, the collapse glyph and the number as leading sections at the box's 6px edge; the rest of the title, from the first line's break, is laid out again at the 12px edge with 6px less width (#705). The title field opened for typing is a one-line `TextEdit` placed after the number (#707).

## R9. Which client tests are ported

**Decision**: a client test is ported when it tests a rule (layout, completion, query, reveal, which icons, what a gesture sends, what is kept on refusal); it is replaced by an egui test against the recording painter (`adp-shell/src/canvas/recording.rs`) or the AccessKit tree when it tests what is drawn; a test of React mechanics (portals, hooks, batching) is not ported and its replacement is named in the task. The walks of `parity/walks.md` carry what only a person sees, in both themes, side by side with the standalone host at `a7fdf03`.

## R10. Performance

**Decision**: a bench in `benches/` opens the module's generated 100-item, 500-requirement document and the NIST example, and applies an outside change, each timed against SC-005's bounds (2 s, and 4 s for NIST), as the standalone host's `LargeDocument.Tests.cs` and `NistControls.Tests.cs` hold them; the test version runs in `cargo test` with the bounds, the bench prints the times.
