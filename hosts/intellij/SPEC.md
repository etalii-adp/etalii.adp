---
id: host-intellij
type: module-design
title: IntelliJ
status: draft
parent: hosts
depends-on:
  - fbl
  - atd
  - host-desktop
references:
  - host-standalone
  - disl
---

# IntelliJ

Repository: [`etalii.adp.ide.intellij`](https://github.com/etalii-adp/etalii.adp.ide.intellij)

One plug-in, id `etalii.adp`, that opens ADP tools in real editors in every IDE built on the IntelliJ Platform: IntelliJ IDEA, Rider, WebStorm, PyCharm, CLion, GoLand, PhpStorm and RubyMine, from 2026.2 (build 262). Its principles are `principles-intellij`. *(That file still calls the IntelliJ Platform "ADP's only host", which is stale: it predates the other hosts.)*

## State

In progress. Two hand-coded diagrams ship:

- FreeMind `.mm` mind maps (`freeplane/mindmap`);
- uncompressed draw.io files (`jgraph/drawio`).

Alongside them ship a shared diagram framework, the ADP Toolbox and ADP Properties tool windows, a settings page (Settings > Tools > ADP), `.atd` language support and a generic FBL library that no tool uses yet.

No tool type is interpreted from a specification yet. A placeholder for a bundled DISL specification (`ToolOrigin.BundledSpecification`) is exercised only by tests. The repository began as an Eclipse plug-in and moved wholly to the IntelliJ Platform, and a test keeps every trace of the earlier host out (`host-eclipse` is a separate, new repository).

## Shape

- **Language and UI:** Java 25, Swing. No JCEF and no Kotlin in shipped code.
- **Build:** Gradle with the IntelliJ Platform Gradle Plugin. Subprojects are composed into one plug-in, and `plugin.xml` includes a fragment per module.
- **Editors:** a tool's editor is a text editor with a visual preview over **one `Document`**, so the text and the visual view share content and undo. A visual change is one named `WriteCommandAction`, which is one undo step.
- **Dependencies:** only the platform's common modules, plus the optional LSP module. No third-party libraries are shipped (licence-checked), and there is no network access at run time.

## Subsystems

A format module depends only on `core`, never on another format module, and adding a format must not change `core`. `fbl` depends on nothing, and `atd` loads only where the platform's LSP module exists.

| Group | Nodes |
|---|---|
| Framework | `intellij-core` |
| Format modules | `intellij-freemind`, `intellij-drawio` |
| Specification libraries | `intellij-fbl` |
| ATD | `intellij-atd` |
| Tests | `intellij-testing` |

## How it consumes the specifications

- **Approach 1 today** (`architecture` *Tool-type approaches*): FreeMind and draw.io are hand-written definitions and mappings.
- **FBL:** a library ready for the first FBL-backed tool. Joining FBL's history to the platform undo, and reconciling mixed line endings with the platform `Document`, are known prerequisites for that.
- **DISL, DID, DESL, DED:** not consumed yet.
- **ATD:** language support comes only from the desktop host's server, so every host gets the same checker.
- **Where the specification decides:** where FBL leaves an output undecided, the fix goes into `specifications/fbl`, never into this host.

## Rules and decisions

- **Native citizenship (non-negotiable):** platform file types and editor providers, undo, Local History, modified state, save, reload, read-only handling, Structure view, keymap and themes.
- **Text is the source of truth:** opening and saving without edits leaves the file byte-identical. An edit changes only the text it concerns. A file the tool cannot read falls back to the text view with an explanation and is never silently rewritten. Saving does not strip trailing spaces from the tool's files.
- **Definition separate from mapping,** so that a second format costs a fraction of the first.
- **FBL ported, not shared:** there is no runtime dependency on another host.
- **Permissive example data only;** share-alike data is refused. FreeMind (GPL) is never a build dependency, and its compatibility test is opt-in.
- **Test-first,** round-trip tests against real published files, and zero compiler warnings.

## Process

Changed through Spec Kit features in this repository: `specs/etalii.adp.ide.intellij/001` to `006`, then `010`, `033` and `035`. CI builds, runs real-IDE tests, verifies the plug-in against all eight IDEs (IDEA and Rider on a pull request), keeps a rolling development pre-release, releases from `v<version>` tags on `develop`, and runs the terminology check.
