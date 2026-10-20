<!--
Sync Impact Report
- Version: template → 1.0.0 (first ratification)
- Principles: I. Native Platform Citizenship; II. The Text File Is the Source of Truth; III. One Frame, Many Tools; IV. Test-First, Against Real Files and the Standalone Host; V. Simplicity; VI. No Clippy Warnings.
- Modelled on etalii.adp.ide.vscode's principles 1.0.0, as etalii.adp spec 030-desktop-native-rust asks (research R13, task T005).
- Templates: plan, spec and tasks templates unchanged; no follow-ups.
-->
> These are the principles of [`etalii.adp.ide.desktop`](https://github.com/etalii-adp/etalii.adp.ide.desktop), written here on 2026-10-20 by spec [030-desktop-native-rust](../../../specs/030-desktop-native-rust/desktop-native-rust.spec.md): that repository has no Spec Kit setup of its own, and its features are specified in etalii.adp. A plan whose code lands in `etalii.adp.ide.desktop` checks them beside [etalii.adp's own](../constitution.md). Amend them here, with a pull request into etalii.adp.

# etalii.adp.ide.desktop Constitution

## Terminology

ADP's words are defined once, in the ADP glossary, `docs/terminology.md` in etalii.adp (https://github.com/etalii-adp/etalii.adp/blob/develop/docs/terminology.md). ADP offers **tools**, each of one kind: a **diagram**, a **designer** or an **editor**. This repository is the **desktop host**: the standalone host's tools and workspace as one native application.

## Core Principles

### I. Native Platform Citizenship (NON-NEGOTIABLE)

The desktop host MUST be one native application that needs nothing else installed, and MUST use the platform's own mechanism wherever the platform provides one:

- It MUST NOT need a .NET runtime, a JavaScript runtime, a browser, an embedded web view or a network listener, and MUST NOT download code at run time.
- File dialogs MUST be the platform's; shortcuts MUST use the platform's modifier key; the light or dark theme MUST follow the system setting.
- Every interactive element MUST be exposed to the platform's accessibility interface with its role, name and state.
- The look MUST be VS Code's default themes, value for value, as spec 030 FR-044 states; no colour or size appears in the shell outside the theme.

Rationale: a native host is wanted because a browser and a server are two programs too many for a tool that works on one's own files.

### II. The Text File Is the Source of Truth

- Opening and saving a file without edits MUST leave it byte-identical.
- Every write to a body MUST be FBL splices; content, comments, ordering and formatting outside them MUST be kept byte for byte.
- For the same edit on the same file, the desktop host MUST write the same bytes as the standalone host.
- A file the host cannot fully interpret MUST still open, with a clear explanation, and never be silently rewritten or refused.

Rationale: these files live in version control and are shared with other tools, other hosts and agents. A host whose saves differ from another's turns every shared repository into noise.

### III. One Frame, Many Tools

- The core (everything that knows files, models, rules and edits) MUST NOT depend on the UI toolkit or on the platform; only the shell crate does.
- A tool type's behaviour MUST be what its definition in etalii.adp states, loaded from the vendored `definitions/`; a difference is recorded in `parity/inventory.md` or raised as a change there, never settled here.
- Adding a tool type MUST NOT require changing the frame or another tool type: it is one crate under `modules/`.

Rationale: six hosts that each define a tool are six tools.

### IV. Test-First, Against Real Files and the Standalone Host

- Tests MUST be written before the behaviour they cover, and MUST be seen failing first.
- Every format MUST pass the FBL fixtures and examples vendored from etalii.adp, and every tool type with a body MUST have edit scripts whose results equal the goldens recorded from the standalone host.
- A test that cannot run MUST be reported as skipped with its reason, never as passed.

Rationale: parity is shown, not claimed.

### V. Simplicity

Features, abstractions and dependencies MUST be justified by a current requirement, not an anticipated one. A crate is added only with its reason recorded in the plan that needs it.

### VI. No Clippy Warnings

The Rust counterpart of etalii.adp's Principle VI: `cargo clippy --workspace --all-targets -- -D warnings` MUST pass. A lint that does not fit MAY be allowed only in the workspace's lint table, with a note stating why, never at the place it occurs merely to silence it.

## Development Workflow

- `develop` is the integration branch; work happens on `features/<name>` branches and reaches `develop` only through a pull request merged with a merge commit.
- Each pull request names its feature's folder in etalii.adp and the etalii.adp commit its tasks came from; a task is ticked there only when the pull request is merged.
- The `Build` workflow runs fmt, clippy and the tests on Windows, macOS and Linux, and the terminology check, on every pull request.

## Governance

These principles are amended in etalii.adp, with a pull request, and versioned semantically as the constitution is.

**Version**: 1.0.0 | **Ratified**: 2026-10-20 | **Last Amended**: 2026-10-20
