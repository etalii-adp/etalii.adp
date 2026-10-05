# Contract: what the plug-in contributes to Visual Studio Code

The user-visible surface the plug-in declares in `package.json` (FR-002 to FR-004, FR-012 to FR-015, FR-030, FR-034, FR-039). A level 1 test reads the manifest and checks it against this table and against the two vendored definitions (labels and shortcuts); a level 3 test checks that every command below is registered once the plug-in is active.

## Identity

| Field | Value |
|---|---|
| `name`, `publisher` | `adp`, `EtAlii` (identifier `etalii.adp`, compared without regard to case) |
| `displayName` | `ADP: A Different Perspective` |
| `version` | `0.1.0` |
| `engines.vscode` | `^1.140.0` |
| `license` | `Apache-2.0` |
| `main` | `./dist/host.js` |
| `categories` | `Visualization`, `Other` |
| `capabilities` | `untrustedWorkspaces.supported: true` |
| `activationEvents` | none declared: the contributions below activate it |
| Installable file | `etalii-adp-<version>.vsix` |

## Languages

| Id | Extensions | Note |
|---|---|---|
| `etalii.adp.gartner.hypecycle-graph` | `.ghg` | alias "Gartner hype cycle graph"; the YAML grammar and language configuration, so the text editor colours and folds it |
| `etalii.adp.registration` | `.adp` | alias "ADP registration"; plain text |

Markdown keeps the language Visual Studio Code gives it.

## Custom editors

| View type | Display name | Selector | Priority |
|---|---|---|---|
| `etalii.adp.gartner.hypecycle-graph` | Gartner hype cycle graph | `*.ghg` | `default` |
| `etalii.adp.etalii.agent-behavior-modelling` | Agent Behavior Modelling | `*.md` | `option` |
| `etalii.adp.registration` | ADP | `*.adp` | `default` |

## Views

One view container in the activity bar, id `etalii-adp`, title "ADP", with two webview views:

| Id | Name |
|---|---|
| `etalii.adp.toolbox` | ADP Toolbox |
| `etalii.adp.properties` | ADP Properties |

## Commands

All have the category `ADP`. "Diagram" in the last column means the command is enabled while a diagram of that type has the focus and is not read-only, and where a selection is named, while that is selected.

| Command id | Title | Default key | Enabled |
|---|---|---|---|
| `etalii.adp.newHypeCycleGraph` | New Gartner Hype Cycle Graph... | | always |
| `etalii.adp.newBehaviorModel` | New Agent Behavior Model... | | always |
| `etalii.adp.openAsBehaviorModel` | Open as Behavior Model | | a Markdown file |
| `etalii.adp.openAsText` | Open in Text Editor | | any diagram |
| `etalii.adp.openTextBeside` | Open Text Editor to the Side | | any diagram |
| `etalii.adp.addFromToolbox` | Add from Toolbox... | | any diagram |
| `etalii.adp.arrange` | Arrange Diagram | | any diagram |
| `etalii.adp.rename` | Rename... | F2 | a trend, a trigger or a behavior node; for a note the title is "Edit text..." in the canvas's menu |
| `etalii.adp.remove` | Remove | Delete | any selection |
| `etalii.adp.zoomIn`, `zoomOut`, `zoomToFit`, `zoomActualSize` | Zoom In, Zoom Out, Zoom to Fit, Actual Size | Ctrl+=, Ctrl+-, Ctrl+9, Ctrl+0 (Cmd on macOS) | any diagram |
| `etalii.adp.selectAll` | Select All | Ctrl+A | any diagram |
| `etalii.adp.gartner.hypecycle-graph.evenPhases` | Even Phases | | a trend with a stored boundary |
| `etalii.adp.gartner.hypecycle-graph.toggleCompact` | Toggle Compact | | hype cycle graph |
| `etalii.adp.etalii.agent-behavior-modelling.moveEarlier` | Move Earlier | Alt+Up | a behavior node that is not first |
| `etalii.adp.etalii.agent-behavior-modelling.moveLater` | Move Later | Alt+Down | a behavior node that is not last |
| `etalii.adp.etalii.agent-behavior-modelling.editNotes` | Edit Notes... | | a behavior node |

Every key is a `keybindings` contribution whose `when` clause names the diagram's context key, so it is listed and can be changed in Keyboard Shortcuts and is inactive elsewhere. The zoom and select-all keys are active only while the canvas has the focus.

## Context keys

| Key | Value |
|---|---|
| `etalii.adp.diagram` | the origin of the diagram that has the focus, or unset |
| `etalii.adp.readOnly` | whether that diagram is read-only |
| `etalii.adp.selection` | the kind of the selection (`trend`, `trigger`, `note`, `influence`, `node`, `several`), or unset |
| `etalii.adp.can.<action>` | whether an action with a condition of its own is offered now (`evenPhases`, `moveEarlier`, `moveLater`) |
| `etalii.adp.behaviorFiles` | the paths of the workspace's Markdown files that have a `Behavior` or `Behaviour` heading |

## Menus

| Menu | Entries | When |
|---|---|---|
| `explorer/context` | Open as Behavior Model | `resourceExtname == .md && resourcePath in etalii.adp.behaviorFiles` |
| `explorer/context` | New Gartner Hype Cycle Graph..., New Agent Behavior Model... | a folder |
| `file/newFile` | the same two | always |
| `editor/title` | Open in Text Editor, Open Text Editor to the Side | a diagram has the focus |
| `editor/title` | Open as Behavior Model | a Markdown text editor whose file is in `etalii.adp.behaviorFiles` |
| `commandPalette` | every command above; those that need a diagram are hidden without one | |

The canvas's own context menu is drawn by the frame from the diagram type's actions and is not a manifest contribution; each of its entries runs one of the commands above, so the two cannot differ.

## Not contributed

No settings (spec, Out of Scope), no status bar item, no tree view, no walkthrough, no telemetry, and no dependency on another extension.
