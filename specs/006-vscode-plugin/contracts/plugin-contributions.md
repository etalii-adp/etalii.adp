# Contract: what the plug-in contributes

What `package.json` of `etalii.adp.ide.vscode` declares. Names follow research R10.

## Identity

| Field | Value |
|---|---|
| `name` | `adp` |
| `publisher` | `etalii` |
| `displayName` | ADP: A Different Perspective |
| `version` | `0.1.0` |
| `engines.vscode` | `^1.140.0` |
| `license` | Apache-2.0 |
| `categories` | Visualization, Other |
| `capabilities.untrustedWorkspaces` | supported |
| Packaged file | `etalii-adp-<version>.vsix` |

## Custom editors

| View type | Display name | Files | Priority |
|---|---|---|---|
| `etalii.adp.gartner.hypecycle-graph` | Gartner hype cycle graph | `*.ghg` | default |
| `etalii.adp.etalii.agent-behavior-modelling` | Agent Behavior Modelling | `*.md` | option |
| `etalii.adp.registration` | ADP registration | `*.adp` | default |

## Languages

`ghg` for `*.ghg`, with YAML's comment and bracket configuration, so the text editor treats it sensibly and diagnostics have a language to attach to.

## Views

A view container "ADP" in the activity bar, holding the webview view `etalii.adp.properties`, named "ADP Properties". The ADP Toolbox is part of each diagram's editor (research R5).

## Commands

All in category "ADP". Shortcuts apply when a diagram's canvas has the focus (`activeCustomEditorId` is one of ours, no text box in it is being typed in, and no view has the focus) and are the definitions' defaults. A command that acts on the selection runs the action the diagram type offers for it, found by its shortcut or label, so it means the same in every diagram type.

| Command | Title | Default shortcut | Where else |
|---|---|---|---|
| `etalii.adp.new.gartner.hypecycle-graph` | New Gartner Hype Cycle Graph | | File > New File |
| `etalii.adp.new.etalii.agent-behavior-modelling` | New Agent Behavior Model | | File > New File |
| `etalii.adp.openAs.etalii.agent-behavior-modelling` | Open as Agent Behavior Model | | Explorer context menu and editor title for Markdown with a Behavior heading; Command Palette for any Markdown |
| `etalii.adp.openAsText` | Open as Text | | editor title of a diagram |
| `etalii.adp.arrangeDiagram` | Arrange Diagram | | canvas context menu |
| `etalii.adp.rename` | Rename | F2 | canvas context menu |
| `etalii.adp.remove` | Remove | Delete | canvas context menu |
| `etalii.adp.evenPhases` | Even Phases | | canvas context menu on a trend |
| `etalii.adp.moveEarlier` | Move Earlier | Alt+Up | canvas context menu on a behavior node |
| `etalii.adp.moveLater` | Move Later | Alt+Down | canvas context menu on a behavior node |
| `etalii.adp.toggleCompact` | Toggle Compact | | hype cycle graph |
| `etalii.adp.focusProperties` | Focus on ADP Properties | | |

A "New" and an "Open as" command is named after its diagram type's origin, as its view type is, so a third type adds its own without a new naming rule. Undo, redo, save and revert are the platform's own commands and are not contributed.
## Diagnostics

One collection, source "ADP", code the rule id.

## Activation

On opening one of the custom editors, on the `ghg` language, on any of the commands, and once Visual Studio Code has finished starting. The last is what lets the Explorer offer "Open as Agent Behavior Model" for the Markdown files that have a Behavior heading: whether a file has one is in its text, which a menu's condition cannot read, so the plug-in reads the workspace's Markdown files (up to 2,000 of at most 512 KB) and keeps the context key `etalii.adp.suggested` up to date. It does nothing else at start-up.
