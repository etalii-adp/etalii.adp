# Contract: building, testing and debugging `etalii.adp.ide.vscode`

What a contributor, or an agent working for one, can rely on in a clone of the repository (user stories 5 and 6, FR-042 to FR-052, FR-058). The readme's Build section states this table and nothing that contradicts it.

## Prerequisites

Node.js 22 or later with npm, git, and Visual Studio Code at the release `engines.vscode` names or later. Nothing else is installed by hand: the real-IDE tests download the Visual Studio Code they run in, into `.vscode-test/`.

## Commands

| Command | What it does | Used by |
|---|---|---|
| `npm ci` | installs the pinned dependencies | everyone, the workflow |
| `npm run build` | type-checks and writes the development bundles with source maps to `dist/` | the debug configuration, before it starts the watch |
| `npm run watch` | rebuilds both bundles on every change and type-checks beside it, reporting errors in the form the Problems panel reads | the debug configuration's background task (FR-050) |
| `npm run lint` | ESLint over `src/` and `tests/`, including the layer rule of [frame-api.md](frame-api.md) | `npm run check` |
| `npm run test:unit` | levels 1 and 2: Vitest, without Visual Studio Code and without a display; writes `reports/unit/` | `npm test`, the `build` job |
| `npm run package` | production bundles and `etalii-adp-<version>.vsix` at the repository root | `npm test`, the `build` job |
| `npm run test:real-ide [-- --vsix <file>]` | level 3: installs the given file, or the one at the repository root, into a downloaded Visual Studio Code with an empty profile and runs `tests/real-ide/`; writes `reports/real-ide/` | `npm test`, the `real-ide-tests` job |
| `npm run check` | `lint`, type check, `test:unit` and the production bundles | the `build` job |
| **`npm test`** | **the one documented command (FR-046): `check`, `package`, then `test:real-ide`** | contributors; the workflow runs the same three in its two jobs |
| `npm run examples` | refreshes `.debug/examples/` from `examples/` (FR-051) | the debug configuration's task |
| `npm run vendor -- --standalone <path> --adp <path>` | refreshes `examples/`, `fixtures/` and `definitions/` from checkouts of the two source repositories and rewrites each folder's `PROVENANCE.md` with the commits read | a contributor, when a definition or the standalone examples change |

On Linux without a display, `npm test` and `test:real-ide` are run under `xvfb-run -a`; the readme says so. Where a real-IDE test cannot run (no display and no `xvfb-run`, or the download is unreachable), it is reported as skipped with that reason and the command says how many were skipped (FR-046).

## Reports

`reports/unit/junit.xml` and `reports/real-ide/junit.xml` (JUnit XML, read by `.github/scripts/skipped-tests.py`) and an HTML report beside each. `reports/` and `.vscode-test/` are ignored by git.

## Debug configurations (`.vscode/launch.json`)

| Name | What starts | Requirement |
|---|---|---|
| **Run the plug-in** (the default, F5) | the tasks `examples` and `watch`, then a development Visual Studio Code with the plug-in loaded from the working tree, the folder `.debug/examples/` open, other extensions disabled, and `debugWebviews` on, so breakpoints bind in `src/frame/host/**` and `src/diagrams/*/host/**`, and in `src/frame/view/**` and `src/diagrams/*/view/**` alike | FR-048, FR-049, FR-051 |
| Debug this unit test file | Vitest on the file in the active editor, under the Node debugger | FR-052, levels 1 and 2 |
| Debug the real-IDE tests | a development Visual Studio Code with the plug-in from the working tree and `tests/real-ide/` as its tests; `ADP_TEST_GREP` narrows it to one test | FR-052, level 3 |

A code change takes effect with "Developer: Reload Window" in the development window; nothing is packaged or installed (FR-050). `.vscode/extensions.json` recommends the Vitest and Extension Test Runner extensions, which add run and debug marks beside each test; the three configurations above work without them.

`.vscode/launch.json`, `tasks.json` and `extensions.json`, and every `tsconfig*.json`, are written as plain JSON without comments, because `check-files.py` parses every tracked `.json` file (research R14).

## The example folder

`examples/gartner-hype-cycle-graph/` and `examples/agent-behavior-modelling/` hold the vendored standalone examples with their `.adp` registrations, byte for byte (`.gitattributes`: `-text`). `.debug/examples/` is a copy, ignored by git, replaced whenever the debug configuration starts; the tests read `examples/` only (FR-051).

## The test seam

Level 3 has to act on a canvas that lives in a webview, which a test in the extension host cannot reach. When, and only when, the environment variable `ADP_TEST` is `1` at activation, the plug-in registers one extra command, `etalii.adp.test.drive`, absent from `package.json` and so from the Command Palette. It takes the URI of an open diagram and a list of steps (pointer and keyboard events at canvas coordinates, a query for the drawn elements, a value typed into a field of ADP Properties, an entry of the ADP Toolbox dropped at a point) and returns what the webview reports after them. The events are dispatched inside the real webview, so a test's drag goes through the same code a user's does. The seam is the last section of [frame-api.md](frame-api.md).
