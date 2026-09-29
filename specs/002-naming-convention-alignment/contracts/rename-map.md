# Contract: Rename Map

What each part renames, old to new. It applies `docs/terminology.md` and [classification.md](classification.md); where a line here and the glossary disagree, the glossary wins and this file is corrected. A part that finds a name not listed applies the rules below and adds the line in its pull request.

## Rules

1. **Shared by all kinds → `Tool`.** A name for something that serves diagrams, designers and editors alike (a registry, a panel, a catalogue, a settings list, a session contract) uses "tool".
2. **One kind → that kind.** A name for something that serves one kind uses that kind: `Diagram…`, `Designer…`, `Editor…`. Diagram code that is correctly called "diagram" stays.
3. **Platform suffixes stay.** A class that implements a platform editor API may end in the platform's word (`…FileEditor`, `…EditorProvider`), with the ADP part of the name following rules 1 and 2.
4. **One display name per tool type**, from the Notion `Name` column after it is cleaned up (a name, not a description), used for titles, labels, tabs and headings in every host and on the site. Code identifiers derive from it: PascalCase for types (`MindMap`), kebab-case for folders and packages (`mind-map`), except where an origin already fixes the spelling (`freeplane/mindmap` stays, rule 7).
5. **Format versus tool.** A name for a third-party file format keeps the format's name (`FreeMind…`, `Drawio…`); a name for the tool built on it uses the tool's display name (`MindMap…`).
6. **Persisted identifiers** are renamed, the new form is written, and the old form is read for at least the next major version (FR-011, research R3 and R5).
7. **Origins stay.** `<vendor>/<type>` origins already name the tool type, not its kind, and are stored in every `.adp` file; they are not renamed by this feature. A later origin rename goes through Notion's `Previous origin` column so the site redirects.
8. **History stays** (FR-014). Completed specifications keep their folders and text. An open specification keeps its folder name, which is an identifier, and its text is updated.

## etalii.adp

| Old | New |
|---|---|
| DEDL, Diagram Editor Definition Language (the diagram language) | DISL, Diagram Specification Language, for what a tool engineer writes; DID, Diagram Definition Language, for what users' diagrams are stored as (research R3) |
| `specifications/dedl/DEDL-specification.md` | `specifications/disl/DISL-specification.md` and `specifications/did/DID-specification.md`, split by research R3's rule; `specifications/dedl/` removed (research R4) |
| `dedl.schema.json` `$defs/Definition` / `$defs/Document` | `disl.schema.json` `$defs/Specification` / `did.schema.json` `$defs/Definition` |
| examples `erd.dedl`, `statemachine.dedl`, `timeline.dedl` | `specifications/disl/erd.disl`, `statemachine.disl`, `timeline.disl`, content migrated |
| example `timeline.document.json` | `specifications/did/timeline.did`, content migrated |
| `$id`, media types, version keys, `dedl-fragment` | see research R3 |
| — | legacy fixtures in the DEDL 0.1 form, one per format, and an alias table in `.github/scripts/validate-examples.py`; the validator also picks up `*.disl` and `*.did` |
| "definition" (of a language), "document" (a stored diagram) in the DEDL text | "specification" (of a diagram type), "definition" (a stored diagram); "document" stays for the content a user works on |
| "Language designer(s)", "author(s)" | tool engineer(s) |
| "diagram editor", "editor runtime" (the running tool) | diagram; runtime |
| — | `specifications/desl/`, `specifications/ded/`, `specifications/edsl/`, `specifications/edd/`, each a placeholder `<NAME>-specification.md` |
| `definitions/diagrams/`, `definitions/editors/` (untracked, empty) | tracked with a `README.md` each, plus `definitions/designers/` |
| `docs/terminology.md` with DIFL/DEFL/EDFL (or DIDL/DEDL/EDDL), "author", the `.disl` reading "pending Peter's confirmation" | the revised spec's table, "tool engineer", what a specification file and a definition file hold (FR-006b); corrected in part 0 |
| constitution and `CLAUDE.md`: "diagram and text designers", "ADP designers", "a designer is built from", "authors of designers" | "tools: diagrams, designers and editors", "ADP tools", "a tool is built from", "tool engineers"; DEDL → DISL; `specifications/<name>/` structure example → `disl` |

## etalii.adp.ide.standalone

| Old | New |
|---|---|
| prose "specialized diagram, designer and editor experiences" (`readme.md`, `docs/architecture.md`, steering `product.md`) | "specialized tools: diagrams, designers and editors" |
| `docs/diagrams.md` "Diagram Types" (the catalogue, read by the site) | `docs/tools.md` "Tool types", with a Kind column; diagrams and editors listed |
| cross-kind plumbing in `EtAlii.Adp.Diagram` and diagram-named client files (editor sessions, discovery shared with editors, `DiagramPanel` hosting `editor/*`, `DiagramTabsPanel`, `diagramCanvases.ts` / `DiagramCanvasRegistration` / `canvasFor`, `DiagramService.SaveText`) | rule 1: `Tool…` (for example `ToolPanel`, `ToolTabsPanel`, `toolPanels.ts` / `ToolPanelRegistration` / `panelFor`, a text-save call on a tool-level or editor service) |
| diagram-only code (`EtAlii.Adp.Diagram.<Type>` modules, `src/diagrams/`, diagram canvases, "diagram type", "diagram module") | unchanged (rule 2) |
| — | `src/designers/README.md`, `docs/creating-a-designer-module.md`, an empty designer family in module discovery and the panel registry (research R7) |
| display names that are descriptions ("Mind map (radial/hierarchical, single central topic)", "Full UML set (see section 1)") and mixed capitals ("Wardley Map" / "Wardley map") | rule 4 |
| folder names that disagree with the display name (`helm-charts`, `azure-pipeline`, `causal-loop`, `dependency-graph`, `gartner-hypecycle-graph`) | rule 4, one kebab-case form per tool type; module assembly names follow |

## etalii.adp.ide.intellij

| Old | New |
|---|---|
| `AdpDesignerEditor` | `AdpToolFileEditor` |
| `DiagramDesigner`, `MindMapDesigner` | `DiagramFileEditor`, `MindMapFileEditor` |
| `AdpEditorProvider.createDesigner()`, `editorName()`, `designerInfo()` | `createTool()`, `toolName()`, `toolInfo()` |
| `DesignerInfo`, `DesignerOrigin`, `DesignersSection`, `DesignerState`, `DesignerPanel`, `DesignerDriver` | `ToolInfo`, `ToolOrigin`, `ToolsSection`, `ToolState`, `ToolPanel`, `ToolDriver` |
| `AdpDataKeys.ADP_DESIGNER` / `"etalii.adp.designer"` | `ADP_TOOL` / `"etalii.adp.tool"` (in memory only; rule 6 does not apply) |
| settings keys `offDesigners`, `designerSettings` | `offTools`, `toolSettings` (old keys read, rule 6) |
| editor type id `etalii.adp.freemind.editor` | `etalii.adp.freemind` (old id read in settings, rule 6) |
| names "draw.io Designer", tab "Designer", popup `etalii.adp.freemind.DesignerPopup` | "draw.io diagram", the tool's display name, `etalii.adp.freemind.MindMapPopup` |
| settings page "Designers", column headers, actions "…of the designer" | "Tools", "…of the diagram" |
| plug-in description "a family of specialized diagram, designer and text editors", "Each designer is an editor on the file's own text", "two designers" | "specialized tools: diagrams, designers and editors", "Each tool opens in an editor on the file's own text", "two diagrams" |
| "designer framework", "diagram designer framework", `docs/diagram-designer-guide.md` "Building a diagram designer" | "tool framework", "diagram framework", `docs/diagram-guide.md` "Building a diagram" |
| "Mind map" spelled five ways | display "Mind map"; `MindMap` in code; format classes stay `FreeMind…` (rule 5) |

## etalii.adp.site

| Old | New |
|---|---|
| `/adp/designers/…`, nav "Designers" | `/adp/tools/…`, nav "Tools"; every old address redirected, and the existing redirects into `/adp/designers/` repointed so no chain forms |
| `/adp/dedl/…`, nav "DEDL reference", schema at `/dedl/schema/0.1/dedl.schema.json` | `/adp/disl/…` "DISL reference" and `/adp/did/…` "DID reference"; every old `/adp/dedl/` address redirected to DISL (research R4); schemas at `/disl/schema/0.1/disl.schema.json` and `/did/schema/0.1/did.schema.json`, and the old combined schema still served at its old address |
| — | a "Specification & Definition" page in the documentation section, with the six-language table (research R7) |
| terminology page with DIFL/DEFL/EDFL (or DIDL/DEDL/EDDL) | the revised terms; corrected in part 0 |
| collection `designers`, components `DesignerCard`, `DesignerList`, `DesignerPage`, `RetiredDesigner` | `tools`, `ToolCard`, `ToolList`, `ToolPage`, `RetiredTool` |
| copy: "a family of specialized diagram, designer and text editors", "Browse the designers", "ADP gives each such task its own designer", "opens designers as real editors", "Diagram Editor Definition Language", "language designer" | "specialized tools: diagrams, designers and editors", "Browse the tools", "its own tool", "opens tools in real editors", "Diagram Specification Language" (or DID where the stored form is meant), "tool engineer" |
| procedures "Refresh the designer catalogue", `refresh-dedl.md`, procedure name `dedl` | "Refresh the tool catalogue", `refresh-disl.md` (covering DISL and DID), `disl` (old name accepted until part 7) |
| catalogue source `docs/diagrams.md` | `docs/tools.md`, falling back to `docs/diagrams.md` until part 7 |
| reference source `specifications/dedl/` | `specifications/disl/` and `specifications/did/`; falls back to `specifications/dedl/` while `specifications/disl/` is absent, until part 7 |
| `src/lib/catalogue/notion-api.ts` column names | new names, old names accepted until part 7 |
| open spec 003 text ("designer catalogue") | "tool catalogue"; folder name kept (rule 8) |

## Notion

| Old | New |
|---|---|
| database "Diagrams" | "Tools" |
| `Type` | `Kind` (options Diagram, Designer, Editor) |
| "Standalone Plugin Implementation", "IntelliJ Plugin Implementation", "VS Code Plugin Implementation", "Eclipse" | "Standalone", "IntelliJ", "VS Code", "Eclipse" |
| — | `Previous origin` (text), which the site already reads |
| `Name` values that are descriptions | display names (rule 4), the description moved to `Description` |
| page text "a dedicated designer" meaning the tool | "a dedicated tool", or the kind |

## etalii.adp.ide.vscode, etalii.adp.ide.eclipse, .github

| Old | New |
|---|---|
| `CLAUDE.md` "ADP designers for Visual Studio Code." / "…for Eclipse." | "ADP tools for Visual Studio Code." / "…for Eclipse." |
| profile README and repository description "specialized diagram and text designers" | "specialized tools: diagrams, designers and editors" |
