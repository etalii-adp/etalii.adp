# Inventory: how "diagram", "designer" and "editor" are used today

**Feature**: [naming-convention-alignment.spec.md](naming-convention-alignment.spec.md)
**Taken**: 2026-09-28, from the local clones under `C:\git` (each on its checked-out branch), the `etalii-adp/.github` repository on GitHub and the Notion "Diagrams" database.

This is the evidence the specification is based on. It records what exists; it decides nothing. Counts are approximate grep counts over tracked files and exclude history.

## Summary

| Where | "designer" means | "diagram" means | "editor" means |
|---|---|---|---|
| `etalii.adp` constitution, `CLAUDE.md` | the product family, any tool ADP offers ("diagram and text designers") | — | — |
| `etalii.adp` DEDL specification | a person who writes a definition ("Language designer") | a kind of diagram or one document | the running tool ("diagram editor", "editor runtime"), and part of the language name "Diagram **Editor** Definition Language" |
| `etalii.adp.ide.standalone` | prose only, never in code (18 hits) | the dominant code term: `EtAlii.Adp.Diagram.*`, `src/diagrams/`, "diagram type", "diagram module" | the text-editor family: `EtAlii.Adp.Editor.*`, `src/editors/` (markdown, plain); also the inline label control |
| `etalii.adp.ide.intellij` | the running visual tool: `AdpDesignerEditor`, `DiagramDesigner`, `MindMapDesigner`, "Designers" settings page, `offDesigners` | the model and framework: `DiagramDefinition`, `Diagram`, `DiagramCanvas` | the IntelliJ platform concept (`FileEditor`, `FileEditorProvider`), and property-value controls (`EditorKind`) |
| `etalii.adp.ide.vscode`, `etalii.adp.ide.eclipse` | "ADP designers for …" in `CLAUDE.md`; no code yet | — | — |
| `etalii.adp.site` | every catalogue entry (`/adp/designers/…`, `DesignerPage`, "Browse the designers"); 482 hits | the Notion source ("Diagrams") and the host catalogue file `docs/diagrams.md` ("Diagram Types") | — ; but a `kind` enum `'diagram' \| 'designer' \| 'editor'` already exists |
| `etalii-adp/.github` profile | "specialized diagram and text designers" | — | — |
| Notion "Diagrams" database | a `Type` option, used by no row | the database name, and `Type` of 94 of 95 rows | — |

The product copy alternates between two readings: designer as the umbrella ("diagram and text designers": constitution, `README.md`s, profile, `CLAUDE.md`s) and designer as a peer of the other two ("diagram, designer and text editors" / "diagram, designer and editor experiences": site home page, IntelliJ `plugin.xml`, standalone `readme.md` and `docs/architecture.md`). Nothing defines the three against each other.

## etalii.adp (specifications)

- Language name "DEDL — Diagram Editor Definition Language": `specifications/dedl/DEDL-specification.md:1`, `:53`; `dedl.schema.json:4` (title); `CLAUDE.md:3`; constitution `:52`.
- Persisted identifiers: schema `$id` `https://etalii.net/adp/dedl/schema/0.1/dedl.schema.json`; media types `application/vnd.dedl.definition+json` and `application/vnd.dedl.document+json`; version keys `"dedl"` and `"dedlDocument"`; extension `.dedl`; export format `dedl-fragment`.
- Glossary (spec `:5039`–`5072`): Definition "describing a diagram language and its editor"; Document "a diagram created with a definition"; Runtime "software that loads a definition and provides an editor"; Viewpoint "a kind of diagram over the model".
- "Language designer(s)" is a person (spec `:72`, `:89`, `:107`).
- "Canvas" 81 times, and a `Canvas` schema definition.
- `definitions/diagrams/` and `definitions/editors/` exist locally but are empty and untracked: placeholders for diagrams and editors with no counterpart for designers.
- The spec's examples are referenced as `examples/<name>.dedl`, but the files sit directly in `specifications/dedl/`.
- `media/icons/1-branch-to-diagram - 3.png` and `- 4.png`.

## etalii.adp.ide.standalone

- Assemblies and folders: `EtAlii.Adp.Diagram` and 63 modules `EtAlii.Adp.Diagram.<Type>` under `src/diagrams/<kebab-type>/`; `EtAlii.Adp.Editor`, `EtAlii.Adp.Editor.Markdown`, `EtAlii.Adp.Editor.Plain` under `src/editors/`. No `src/designers/`.
- Documentation: `docs/diagrams.md` (the catalogue, "Diagram Types", read by the site), `docs/creating-a-diagram-module.md`, `docs/creating-an-editor-module.md` ("the second plugin family"). No designer counterpart.
- Identity: `DiagramOrigin` `<vendor>/<type>` (390 hits) doubling as a MIME type; editors use `editor/<id>` in the same slot. 181 `.adp` registration files name an origin on their first line.
- Two unrelated `DiagramDefinition` types: a C# record in `EtAlii.Adp.Documents` (type metadata) and a TypeScript interface in `src/client/src/canvas/library/definition/` (shapes, connections, toolbox).
- Editor plumbing in diagram-named places: `EditorSessionAdapter` in `EtAlii.Adp.Diagram`, `DiagramService.SaveText`, text-editor panels registered through `DiagramCanvasRegistration` / `diagramCanvases.ts`, `DiagramPanel` hosting `editor/*`.
- UI strings: "Add diagram", "No diagram types are available.", "Open as text", "Open with…", "No editors are available."; property ids `editor.encoding`, `editor.line-endings`, `editor.size`, `editor.line-count`.
- Name drift between folder, assembly, origin and title: `dependency-graph` / `generic/dependencies`; `helm-charts` / `helm/chart`; `azure-pipeline` / `azure-devops/pipeline` / "Azure Pipelines"; `causal-loop` / `systems/causal-loop-diagram`; `gartner-hypecycle-graph` / spec `gartner-hype-cycle-graph`. Title and label capitalisation differ ("Wardley Map" / "Wardley map", "RDF Graph" / "RDF graph"). "Mind map" is spelled Mindmap, mindmap, Mind map, mind-map.
- Some titles are descriptions, not names ("Mind map (radial/hierarchical, single central topic)", "Full UML set (see section 1)").

## etalii.adp.ide.intellij

- Plug-in description: "a family of specialized diagram, designer and text editors"; "Each designer is an editor on the file's own text"; "This plug-in brings two designers".
- Classes: `AdpDesignerEditor` (implements `FileEditor`, tab name "Designer"), `DiagramDesigner`, `MindMapDesigner`; providers `AdpEditorProvider`, `DiagramEditorProvider`, `DrawioEditorProvider`, `MindMapEditorProvider` with `createDesigner()`; `AdpDataKeys.ADP_DESIGNER` ("etalii.adp.designer").
- Settings: "Designers" section; stored keys `offDesigners`, `designerSettings`, `<designerId>/<key>`; configurable ids `etalii.adp.settings.<designerId>`. The designer ids are the editor type ids `etalii.adp.drawio` and `etalii.adp.freemind.editor`, so they are persisted.
- Platform-mandated names: `fileEditorProvider`, `FileEditor`, `FileEditorPolicy`, `TextEditorWithPreview`, `editorNotificationProvider`, "File types and default editors".
- Inconsistent per-type names: "draw.io Designer" vs "FreeMind Mind Map"; tab "Designer" vs "Mind Map"; popups `DiagramPopup` "Diagram" vs `DesignerPopup` "Mind Map"; FreeMind* vs MindMap* classes.
- Framework named "designer framework", "diagram framework" and "diagram designer framework"; `docs/diagram-designer-guide.md`; spec folders `001-freemind-mindmap-designer`, `003-diagram-designer-framework`, contracts `designer-framework.md`, `designer-settings-api.md`.

## etalii.adp.ide.vscode and etalii.adp.ide.eclipse

Only `CLAUDE.md`: "ADP designers for Visual Studio Code." and "ADP designers for Eclipse." No code. The VS Code platform will impose `customEditors` / `viewType`, and Eclipse its editor extension points.

## etalii.adp.site

- URLs and navigation: `/adp/designers/`, `/adp/designers/<vendor>/<type>/`, filter redirects `/designers/focus|hosts|states/…`; nav label "Designers"; `/adp/dedl/…`, with the schema served at the `$id` path.
- Code: content collection `designers`; components `DesignerCard`, `DesignerList`, `DesignerPage`, `RetiredDesigner`; spec folder `specs/003-designer-catalogue`; `kind` enum `'diagram' | 'designer' | 'editor'` (`src/content.config.ts:157`, `src/lib/catalogue/types.ts:111`).
- Copy: home page "a family of specialized diagram, designer and text editors", "Browse the designers", "ADP gives each such task its own designer"; `README.md` "specialized diagram and text designers"; `hosts.yaml` "opens designers as real editors"; docs index expands DEDL as "Diagram Editor Definition Language".
- Pipelines: `refresh.yml` (hourly; procedures dedl, screenshots, catalogue, hosts) and `catalogue-sync.yml` (writes host columns back to Notion after merge). `procedures/refresh-catalogue.md` "Refresh the designer catalogue" reads each host's `docs/diagrams.md`. `scripts/catalogue/notion.ts` and `sync-notion.ts` name the "Diagrams" data source. `src/lib/catalogue/notion-api.ts` maps the Notion columns, including an optional `Previous origin` column that the Notion database does not have.
- Screenshots: `markdown-editor.png` among the diagram screenshots.

## etalii-adp/.github

`profile/README.md`: heading "A Different Perspective - ADP", copy "a range of specialized diagram and text designers", a build table of six repositories. The repository description uses the same phrase. No workflows.

## Notion

- Database "Diagrams" (`collection://3e7be2fd-05b6-8079-932d-000bfa0609af`), 95 rows. `Type` has the options `Diagram` and `Designer`; 94 rows are `Diagram`, one ("Dynamic System Visuals with AI") has none. There is no `Editor` option, and the markdown and plain-text editors have no row.
- Host columns are named inconsistently: "Standalone Plugin Implementation", "IntelliJ Plugin Implementation", "VS Code Plugin Implementation" and "Eclipse".
- `Origin` holds the `<vendor>/<type>` identity the site and the standalone host key on. Page bodies speak of "a dedicated designer" ("Why specialized") and "the diagram" interchangeably.
- No page defines the terms.

## Candidates for the designer kind

No current entry is obviously form-based. Entries whose content has no connections and that the classification must look at: Zachman Framework matrix, Gartner hype cycle graph, Timeline diagram, Commit file and folder heatmap, Pipeline state visualization, Agent teaming agreement, Agentic development clarification, Dynamic system visuals with AI, the IntelliJ and standalone settings pages (not catalogue entries).
