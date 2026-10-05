# Quickstart: validating the ADP plug-in for Visual Studio Code

How to see that the feature works, story by story. Commands run in a clone of `etalii.adp.ide.vscode` unless a step says otherwise. Contracts: [plugin-contributions](contracts/plugin-contributions.md), [frame](contracts/frame.md), [build-workflow](contracts/build-workflow.md).

## Prerequisites

Node 22 or later and Visual Studio Code 1.140 or later. Nothing else: the tests download the Visual Studio Code they run in.

## Build, test, package

```sh
npm ci
npm run check     # types and lint
npm test          # core, webview, and the plug-in in a real Visual Studio Code
npm run package   # writes etalii-adp-<version>.vsix
```

Expected: all three pass; `reports/` holds JUnit files; one `.vsix` is written.

## US1: download and install

1. Open a passing pull request's Build run and download `etalii-adp-<version>.vsix`.
2. In Visual Studio Code: Extensions, "...", Install from VSIX, pick the file.
3. The Extensions view lists "ADP: A Different Perspective".
4. After a merge into `develop`, the Releases page shows "Development build <version> (<sha>, <date>)" as a pre-release with that one file.

## US2: the hype cycle graph

Open `examples/gartner-hypecycle-graph/technology-trends/technology-trends.ghg` from a copy of the examples.

1. It opens in the diagram; "Open as Text" shows the YAML beside it.
2. Save without editing: `git diff` is empty.
3. Work through the standalone browser pass for this diagram (`tests.md` in `etalii.adp.ide.standalone`, "The Gartner hype cycle graph, in a browser"): the Phases slider's four stops, a boundary drag, an influence from a Plateau to a Peak, the tag filter, Compact.
4. Undo each step with Ctrl+Z; the file returns byte for byte.
5. Open `fixtures/gartner-hypecycle-graph/rule-phase-count.ghg`: the Problems panel lists `ghg.phase-count` with its line.
6. Right-click the background, "Arrange Diagram"; ask again and read the refusal.

## US3: a behavior model

Open `examples/agent-behavior-modelling/research-assistant/research-assistant.md`.

1. It opens as Markdown text. Right-click it in the Explorer: "Open as Agent Behavior Model".
2. The tree is drawn; the row the example's registration lowers is lower.
3. Drop a "Retry" on the canvas; drag a node past its sibling; press Alt+Down on a node; right-drag from a composite to a node.
4. After each, the Markdown shows only the moved list lines changed, and Ctrl+Z puts Markdown and registration back.
5. "Arrange Diagram" empties the registration's `layout:` block and leaves the Markdown alone.

## US4: the frame

With one document of each type open: switch tabs and watch ADP Properties follow; change the colour theme to a dark and a high-contrast one; rebind "ADP: Rename" in Keyboard Shortcuts; close Visual Studio Code with an unsaved edit and reopen it.

## US5: tests

Break a behaviour on purpose and see the matching level fail: make the hype cycle writer re-serialise a trend (core, round trip); remove a command from `package.json` (in Visual Studio Code).

## US6: debugging

1. Open the clone in Visual Studio Code and press F5 on "Run ADP".
2. A second window opens on `.debug/examples`.
3. Set a breakpoint in `src/core/gartner-hypecycle-graph/writer.ts` and one in `src/webview/canvas/`; rename a trend; both are hit.
4. Change a label in the source, run "Developer: Reload Window" in the second window, and see it.

## US7: definitions

In `etalii.adp`: `python .github/scripts/validate-examples.py` passes, and both `definitions/diagrams/*.md` companions have an "Arrange diagram" section. In the VS Code repository, `docs/tools.md` lists both diagram types and `docs/parity.md` has a section for each.
