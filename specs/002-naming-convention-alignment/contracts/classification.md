# Contract: Classification

The kind of every tool ADP offers or plans (FR-005). Peter decided the classification on 2026-09-28 ("all of them are a diagram indeed"; the markdown and plain-text editors are editors). A new tool is added here, with its kind and the rule applied, in the same change that adds it anywhere else.

## Rule applied

The tests of `docs/terminology.md`, in the order editor, diagram, designer.

## Editors

| Display name | Origin | Hosts | Rule |
|---|---|---|---|
| Markdown editor | `editor/markdown` | standalone | Typing text is the core interaction; the preview only renders it. |
| Plain text editor | `editor/plain` | standalone | Typing text is the core interaction. |

## Designers

None. Designers exist only as placeholders (FR-009, research R7).

## Diagrams

Every other tool: all rows of the Notion database with `Type` Diagram (95 on 2026-09-28, including "Dynamic System Visuals with AI"), every entry of the standalone catalogue `docs/diagrams.md`, and in IntelliJ the FreeMind mind map and the draw.io diagram. Rule: their content is elements and the relations between them.

Borderline cases looked at and kept as diagrams by Peter's decision: Zachman Framework matrix, Gartner hype cycle graph, Timeline diagram, Commit file and folder heatmap, Pipeline state visualization, Agent teaming agreement, Agentic development clarification.

## Not tools

Components a user works in that are not tools and are named for what they are: the settings pages (IntelliJ "ADP" settings, the standalone settings), the explorer, the toolbox, the properties panel, the errors and warnings panel.
