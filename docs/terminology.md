# ADP terminology

The words ADP uses for what it offers, and what each one means. This file is the single source of these definitions (spec [002, naming convention alignment](../specs/002-naming-convention-alignment/naming-convention-alignment.spec.md)); the Notion page "ADP terminology" and the site's terminology page repeat it and point here. A change to a definition is made here first, and the other two follow in the same change.

## Tools

ADP offers new ways to visualize, enter and interact with data, mostly text-based. Each of them is a **tool**, and every tool is of exactly one of three kinds.

| Kind | What it is | The test | Examples |
|---|---|---|---|
| **Diagram** | A visual arrangement of elements and the relations between them. | Are elements connected to each other? Then it is a diagram. | Mind map, Wardley map, C4 container diagram, causal loop diagram |
| **Designer** | A form-based visual layout. More than text input, and not a diagram, because nothing in it is connected. | Is it laid out visually, with nothing connected, and filled in rather than typed? Then it is a designer. | None yet |
| **Editor** | A way of working in which typing text is the core interaction. | Is typing text the main thing the user does? Then it is an editor. | Markdown editor, plain-text editor |

Apply the tests in the order editor, diagram, designer: a text format that is also drawn (a Mermaid file, for example) is a diagram when the user works in the drawing, and an editor when the user works in the text.

"Tool" replaces "designer" wherever all three kinds are meant: "ADP's tools", "the tool catalogue", "a tool type". "Designer" now means only the second kind.

## Specifying and defining tools

What may be said about a tool of one kind is fixed by that kind's **specification language**. A **definition** describes one tool type according to it.

| Kind | Specification language | Extension | Definition | Extension |
|---|---|---|---|---|
| Diagram | DISL, Diagram Specification Language | `.disl` | DIFL, a diagram definition | `.difl` |
| Designer | DESL, Designer Specification Language | `.desl` | DEFL, a designer definition | `.defl` |
| Editor | EDSL, Editor Specification Language | `.edsl` | EDFL, an editor definition | `.edfl` |

A `.disl`, `.desl` or `.edsl` file holds the language's own machine-readable specification, which definitions are checked against (today's `dedl.schema.json`); this reading is pending Peter's confirmation. A `.difl`, `.defl` or `.edfl` file is one definition.

DISL is the language that was called DEDL, the Diagram Editor Definition Language. DESL and EDSL are placeholders until a designer or an editor needs them.

## Related terms

- **Tool type**: one particular tool ADP offers, such as the Wardley map; by kind a *diagram type*, *designer type* or *editor type*. Identified by its **origin**, `<vendor>/<type>`, for example `wardley/map`.
- **Document**: one piece of content a user works on with a tool, such as one Wardley map. Where a host registers documents, its **registration file** (`.adp`) names the origin on its first line.
- **Module**: the code package in a host that implements one or more tool types of one kind: a *diagram module*, *designer module* or *editor module*.
- **Host**: an IDE that ADP's tools run in: standalone, IntelliJ, VS Code or Eclipse.
- **Canvas**: the surface a diagram or a designer is drawn on.
- **Author**: the person who writes a definition. (Not a "designer", which is a kind of tool.)
- **Display name**: the one name of a tool type, spelled and capitalised the same in every host, the catalogue, the site and Notion. It is a name, not a description: "Mind map", not "Mind map (radial/hierarchical, single central topic)".

## Retired uses

| Retired | Use instead |
|---|---|
| "designer" for any tool, or for all tools ("ADP designers", "the designer catalogue", "Designers" settings) | tool, tools, tool catalogue; or the kind, when only one kind is meant |
| "designer" for a person who writes a definition ("language designer") | author |
| "diagram" for any tool, or for all tools ("diagram type" for an editor, the "Diagrams" database) | tool; or the kind that applies |
| "editor" for the running diagram or designer ("diagram editor", "editor runtime", "a designer is an editor") | the kind (diagram, designer); host software that runs definitions is a *runtime* |
| DEDL, Diagram Editor Definition Language, `.dedl` | DISL for the language, DIFL (`.difl`) for a definition |
| "diagram, designer and text editors", "diagram and text designers" | diagrams, designers and editors; or tools |

## Exceptions

These keep their names:

- **Platform APIs**: IntelliJ's `FileEditor`, `FileEditorProvider`, `TextEditorWithPreview` and tool windows, VS Code's custom editors, Eclipse's editor extension points. An ADP tool is *shown in* a platform editor; it is not called one.
- **Third-party names**: product, standard and file-type names such as "draw.io diagram", "Mermaid class diagram", OMG Diagram Definition.
- **Other meanings**: a property-value or inline label control may be called an editor inside code that is clearly about controls.
- **History**: commits, merged and closed pull requests, published release notes, completed Spec Kit features and spec-workflow archives.
- **Old persisted identifiers**, only where they are still *read* for compatibility after being renamed (an old extension, settings key, schema `$id` or URL); they are never written again.
