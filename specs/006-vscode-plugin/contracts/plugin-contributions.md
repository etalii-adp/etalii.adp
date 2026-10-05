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

All in category "ADP". Shortcuts apply when a diagram's canvas has the focus (`activeCustomEditorId` is one of ours) and are the definitions' defaults.

| Command | Title | Default shortcut | Where else |
|---|---|---|---|
| `etalii.adp.newGartnerHypecycleGraph` | New Gartner Hype Cycle Graph | | Explorer context menu, File > New File |
| `etalii.adp.newAgentBehaviorModel` | New Agent Behavior Model | | Explorer context menu, File > New File |
| `etalii.adp.openAsAgentBehaviorModel` | Open as Agent Behavior Model | | Explorer context menu and editor title for Markdown with a Behavior heading |
| `etalii.adp.openAsText` | Open as Text | | editor title of a diagram |
| `etalii.adp.arrangeDiagram` | Arrange Diagram | | canvas background context menu |
| `etalii.adp.rename` | Rename | F2 | canvas context menu |
| `etalii.adp.remove` | Remove | Delete | canvas context menu |
| `etalii.adp.evenPhases` | Even Phases | | canvas context menu on a trend |
| `etalii.adp.moveEarlier` | Move Earlier | Alt+Up | canvas context menu on a behavior node |
| `etalii.adp.moveLater` | Move Later | Alt+Down | canvas context menu on a behavior node |
| `etalii.adp.toggleCompact` | Toggle Compact | | hype cycle graph |
| `etalii.adp.focusProperties` | Focus on ADP Properties | | |

Undo, redo, save and revert are the platform's own commands and are not contributed.

## Diagnostics

One collection, source "ADP", code the rule id.

## Activation

On opening one of the custom editors, on the `ghg` language, and on any of the commands. The plug-in does nothing at start-up otherwise.
