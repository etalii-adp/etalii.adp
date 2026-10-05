# Contract: the constitution `etalii.adp.ide.vscode` ratifies first

`etalii.adp.ide.vscode/.specify/memory/constitution.md` is still the Spec Kit template. FR-060 asks that it be ratified before this feature's plan is checked against it. This page is the content pull request 0 puts to `/speckit-constitution` in that repository; the wording there may be tightened, the principles may not be dropped without coming back to this plan. It follows the IntelliJ host's constitution (version 2.2.0), restated for Visual Studio Code, with one principle added.

## Terminology

Every ADP tool is a diagram, a designer or an editor; the words mean what `docs/terminology.md` in `etalii.adp` says. Names of Visual Studio Code's own concepts keep theirs.

## Core principles

### I. The Definition Is the Reference

A tool type this host brings does what its definition in `etalii.adp` states, the specification and its companion together. A difference this host cannot avoid is recorded in `docs/parity.md` with its reason. A difference between a definition and another host is raised as a change to the definition in `etalii.adp`, never settled here.

*Rationale: the constitution of `etalii.adp`, principle I. Four hosts that each decide what a tool does are four tools.*

### II. Native Visual Studio Code Citizenship (NON-NEGOTIABLE)

Every tool opens in a real editor of Visual Studio Code and uses the platform's own mechanisms wherever one exists: custom editors and "Open With", the text document with its undo, modified state, save and hot exit, the Problems panel, commands with the Command Palette and Keyboard Shortcuts, views, themes, dialogs and notifications. The plug-in builds only what the platform lacks (a canvas, a toolbox, a property grid), and builds it once, for every tool.

### III. The Text File Is the Source of Truth

A file opened and saved without an edit is byte-identical. An edit changes only the lines it concerns; comments, blank lines, unknown keys, line endings and prose the tool does not understand survive. The tool and the text editor share one document and one undo history. A file the tool cannot interpret still opens, with an explanation, and is never written.

### IV. One Frame, Many Tools

What tools share is the frame; each tool type is a self-contained part that supplies only what is specific to it. Adding a tool type does not change the frame or another tool type, and no tool type depends on another. Logic that does not need Visual Studio Code or a browser is written so that it runs, and is tested, without either.

### V. Test-First, Against Real Files

A behaviour arrives with the test that covers it, written and seen failing first. Round-trip and rule tests run against real documents: the examples and fixtures the other hosts publish, vendored with their source and licence. What two hosts must agree on is tested against the fixtures they share. The packaged plug-in is tested in a real Visual Studio Code. A test that cannot run is reported as skipped with its reason, never as passed.

### VI. Simplicity

The smallest useful tool, grown by specification. No feature, abstraction or dependency without a current need.

## Platform and technology constraints

- One extension, for desktop Visual Studio Code; nothing else installed or running; no network access at runtime; no telemetry.
- TypeScript in strict mode; every dependency bundled, permissively licensed, and on the allow list a test checks.
- Apache-2.0.
- The build and every test run headlessly from one documented command.

## Development workflow

- Spec Kit: constitution, specify, (clarify), plan, tasks, implement. A feature that spans repositories has its specification, plan and tasks in `etalii.adp`.
- Branches `features/<number>-<name>`, or `claude/<name>` for Claude's cloud sessions, each in its own worktree; a pull request into `develop`, merged with a merge commit; nothing pushed to `develop` directly; the branch deleted and the worktree removed afterwards.
- The Build workflow checks every pull request and every change to `develop`. A change is mergeable only when it passes.
- Compiler and linter warnings are fixed, not silenced.

## Governance

As in the other repositories: amendments through `/speckit-constitution`, versioned semantically, with `CLAUDE.md` as the runtime guidance for agents. Ratified as version 1.0.0.

## What else pull request 0 changes

`CLAUDE.md` gains the sentence on merge commits that the organization's rules state (`docs/new-repository.md` here) and that it lacks today, and a pointer to this feature's folder in `etalii.adp` for the plan and tasks.
