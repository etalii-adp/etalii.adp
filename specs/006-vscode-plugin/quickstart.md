# Quickstart: proving the ADP plug-in for Visual Studio Code

How a reviewer checks the delivered feature, story by story. Prerequisites: Node.js 22 or later, git, the GitHub command line, Visual Studio Code 1.140 or later, Python 3.12 or later with `jsonschema` for step 8, and checkouts of `etalii.adp` and `etalii.adp.ide.vscode` at their `develop`. Commands are those of [contracts/dev-interface.md](contracts/dev-interface.md); on Linux without a display, prefix `npm test` with `xvfb-run -a`.

## 1. The plug-in can be downloaded and installed (user story 1, SC-001, SC-006, SC-007)

1. On GitHub, open the newest merged pull request of `etalii.adp.ide.vscode` and its Build run. Expected: the jobs `check`, `build`, `real-ide-tests` and `terminology` passed, and the run offers `etalii-adp-0.1.0.vsix` as a file, not inside an archive.
2. Open the Releases page. Expected: one pre-release, "Development build 0.1.0 (`<sha>`, `<date>`)", whose commit is the head of `develop`, with that one file.
3. Time this from the repository's front page: follow the readme to the development build, download it, and install it into a Visual Studio Code that has never had it.

   ```text
   code --install-extension etalii-adp-0.1.0.vsix
   ```

   Open `coal-technologies.ghg` from a copy of the examples. Expected: under 3 minutes; the Extensions view lists "ADP: A Different Perspective" by EtAlii; the file opens as a diagram.
4. Negative check: `gh run list --workflow build.yml --branch develop --status failure --limit 1` and, if there is one, see that the development build's commit is not that run's.

## 2. Every test passes from one command (user story 5, SC-002, SC-008)

```text
git clone https://github.com/etalii-adp/etalii.adp.ide.vscode && cd etalii.adp.ide.vscode
npm ci
npm test
```

Expected: the three levels run in that order and pass in under 10 minutes; the last lines name how many tests ran at each level and how many were skipped, with reasons. `reports/unit/junit.xml` and `reports/real-ide/junit.xml` exist.

Negative checks, one per level, each reverted afterwards (user story 5's independent test):

- In `src/frame/core/`, make a splice replace one line more than it should. Expected: a level 1 round-trip test fails and names the example and the line.
- In `src/diagrams/gartner-hype-cycle-graph/core/`, let a boundary land on its neighbour. Expected: a level 1 test ported from `GhgPhases.Tests.cs` fails.
- Remove one command from `package.json`. Expected: the level 1 manifest test fails, and with `npm run test:real-ide` the level 3 command test fails.

## 3. A hype cycle graph (user story 2)

In the installed plug-in, with a copy of `examples/gartner-hype-cycle-graph/`:

1. Open each of the nine graphs from the Explorer. Expected: each opens in the diagram within 2 seconds (SC-005), `technology-trends` included; "Reopen Editor With..." offers the text editor.
2. For `coal-technologies`, compare with the standalone screenshot and the definition: banners in four phase colours, triggers as circles with name and date, notes as boxes, influences meeting the edge at a right angle; then in a dark and a high-contrast theme.
3. Save without editing, then `git status` in the copy. Expected: nothing changed (SC-002).
4. Work through the hype cycle checks of the standalone `tests.md` (the browser pass, the five fixes, compact mode, triggers and notes: 33 checks). Expected: each passes, or is listed in `docs/parity.md`.
5. After any one edit, `git diff`. Expected: only the lines the definition names for that edit (SC-004). Undo once. Expected: no diff.
6. Shorten a trend below its phases. Expected: the sentence "A trend showing 4 phases must be at least 4 months long, one per phase." at the foot of the canvas, and no diff.
7. Open `fixtures/gartner-hype-cycle-graph/rule-boundary-order.ghg`. Expected: one warning in the Problems panel with the code `ghg.boundary-order`; choosing it shows the line.
8. Choose "ADP: Arrange Diagram". Expected: only `row:` lines change; one undo restores them; asking again gives "This graph is already arranged."

## 4. A behavior model (user story 3)

With a copy of `examples/agent-behavior-modelling/`:

1. Open `bug-fixer.md` from the Explorer. Expected: the text editor. Its context menu offers "Open as Behavior Model"; the readme's does not.
2. Open it as a behavior model. Expected: the tree, top-down, eleven kinds in their shapes and family colours.
3. Open `research-assistant.md` as a behavior model. Expected: one row hangs lower than the others, as its `.adp` says (`1.2: 360 160`). Open the same pair in the standalone IDE. Expected: the same row at the same height.
4. Drag a node past its sibling and lower it. Expected: the Markdown tab is dirty; after saving, `git diff` shows the node's lines moved with everything under them and the `.adp` created or changed; one undo puts both back.
5. Lower a row without passing a sibling, and save. Expected: the Markdown has no diff, the `.adp` has.
6. Choose "ADP: Arrange Diagram". Expected: the row returns to its computed height; after saving, the `.adp` has no `layout:` block and the Markdown no diff; one undo restores the block. On `bug-fixer`, which has nothing stored: "This behavior model is already arranged."
7. Set a node with two children to "Check" in ADP Properties. Expected: the field shows "\"Check\" holds no children, and this node has 2 children." and returns to its value.
8. "ADP: New Agent Behavior Model...". Expected: a file with the title, the "How to follow the behavior" legend and `- **Do in order:** Handle the request`.

## 5. The frame (user story 4)

With one diagram of each type open side by side:

1. Give each the focus in turn. Expected: ADP Toolbox and ADP Properties follow; with a text editor focused, each says there is nothing to show.
2. Open the text editor beside a diagram and edit in each. Expected: the other follows, and Ctrl+Z in either undoes the last edit made in either.
3. Change the colour theme. Expected: canvas, toolbox and properties change at once.
4. In Keyboard Shortcuts, search "ADP". Expected: every command of [contracts/package-manifest.md](contracts/package-manifest.md); rebind "Rename..." and see the new key work.
5. Make an edit, close Visual Studio Code without saving, and reopen. Expected: the edit is there, unsaved; for a dragged row of a behavior model, so is the row.
6. Mark a `.ghg` read-only on disk and open it. Expected: it is drawn and no gesture, menu entry or field edits.

## 6. Debugging in one step (user story 6, SC-009)

Time this from `git clone`: `npm ci`, open the folder in Visual Studio Code, press F5. Expected: a development window with `.debug/examples/` open. Set a breakpoint in `src/frame/core/splice.ts` and one in `src/frame/view/canvas.tsx`, open an example and rename a trend. Expected: both are hit, in the TypeScript source, within 10 minutes of the clone. Change a label in the source, reload the development window. Expected: the change shows. Check `git status`. Expected: `examples/` is untouched.

## 7. A third diagram type would be an addition (SC-011)

```text
npm run lint
git grep -n "gartner\|agent-behavior\|ghg\|abm" -- src/frame
```

Expected: the linter passes with the layer rule on, and the search finds nothing in `src/frame/`. The frame's tests include a diagram type that exists only in `tests/`, registered without a change to `src/frame/` or to either real type.

## 8. The definitions (user story 7, SC-010)

In `etalii.adp`:

```text
python .github/scripts/validate-examples.py
git grep -n "Arrange diagram" -- definitions/diagrams/gartner-hype-cycle-graph.* definitions/diagrams/agent-behavior-modelling.*
```

Expected: 0 invalid; the operation in both `.dis` files and a section in both companions, with the refusal sentences of [contracts/definitions-change.md](contracts/definitions-change.md); the hype cycle companion names commit `13b517b3`. In the VS Code repository, `docs/tools.md` has both rows and `docs/parity.md` a section per diagram type; compare the two hosts side by side on one example of each and find no difference that is in neither the definition nor the parity record (SC-003).
