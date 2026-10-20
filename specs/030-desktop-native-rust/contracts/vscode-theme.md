# Contract: The VS Code Theme

What FR-044, FR-045 and SC-010 are checked against.

## Source

- VS Code at one release tag, named in `crates/adp-theme/vscode/SOURCE.md` (for example `1.105.0`), MIT licence copied beside it.
- Colours: `extensions/theme-defaults/themes/dark_modern.json` and `light_modern.json`, with the files they include (`dark_plus.json`, `dark_vs.json`, `light_plus.json`, `light_vs.json`) resolved, extracted by `tools/extract-vscode-theme` into `crates/adp-theme/vscode/dark-modern.json` and `light-modern.json`.
- Sizes: `crates/adp-theme/vscode/sizes.md`, one row per value with its VS Code source file and line at that tag.
- Icons: the Codicons font at the version that VS Code tag ships.

## The values the workspace uses

| Role | VS Code colour ids (examples) | Sizes |
|---|---|---|
| Window and title bar | `titleBar.activeBackground`, `titleBar.activeForeground`, `titleBar.border` | title bar height |
| Activity bar and side bar (explorer, toolbox) | `sideBar.background`, `sideBar.border`, `sideBarSectionHeader.*`, `list.activeSelectionBackground`, `list.hoverBackground`, `list.focusOutline` | row height 22 px, indent 8 px, font 13 px |
| Tabs | `tab.activeBackground`, `tab.inactiveBackground`, `tab.border`, `tab.activeBorderTop`, `tab.unfocusedActiveForeground` | tab height 35 px |
| Panels (errors and warnings) | `panel.background`, `panel.border`, `panelTitle.activeBorder` | |
| Ribbon | `editorGroupHeader.tabsBackground`, `toolbar.hoverBackground`, `button.*` | |
| Status bar | `statusBar.background`, `statusBar.foreground`, `statusBar.border` | height 22 px |
| Menus and dialogs | `menu.*`, `quickInput.*`, `widget.shadow`, `input.*`, `dropdown.*`, `checkbox.*` | |
| Focus and borders | `focusBorder`, `contrastBorder` | focus outline 1 px, borders 1 px |
| Text component | `editor.background`, `editor.foreground`, `editor.selectionBackground`, `editorLineNumber.*`, `editorCursor.foreground`, token colours | font 14 px |
| Canvases and tables | `editor.background`, `editor.foreground`, `charts.*`, `list.*` | |

The sizes above are VS Code's defaults at planning time and are confirmed against `sizes.md` when the theme crate is built.

## Rules

- The shell reads every colour, stroke width, rounding, spacing and font size from the `Theme`; no literal colour or size appears elsewhere in the shell.
- A tool's own colours (phase colours, node fills) are defined per theme in its module and are checked by the ported contrast tests against the theme's background.
- `cargo test -p adp-theme` compares every value in the `Theme` structs with the extracted files and `sizes.md` (SC-010).
- The theme follows the system's light or dark setting while running (FR-042); a later feature may add a manual switch.
