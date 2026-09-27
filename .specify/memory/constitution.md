<!--
Sync Impact Report
- Version: 1.0.0 → 1.0.1 (PATCH)
- Modified: Development Workflow, the CI sentence now describes the Build workflow that exists (spec 001-ci-and-badges) instead of a future one; its obligation is unchanged.
- Added or removed sections: none.
- Templates: plan, spec and tasks templates unchanged; no follow-ups.
-->
# etalii.adp Constitution

ADP ("A Different Perspective") is a family of task-focused diagram and text designers: for (constructive) technology assessment, for collaboration between humans and agents, and for bringing clarity to textual data. The designers are hosted in several IDEs, each in its own repository (`etalii.adp.ide.standalone`, `etalii.adp.ide.intellij`, `etalii.adp.ide.vscode`, `etalii.adp.ide.eclipse`). This repository holds what those hosts share: the specifications of the formats and languages a designer is built from. Its readers are the developers of the ADP hosts, who implement the specifications; the authors of designers, who write definitions and documents in these formats; and agents working in any ADP repository, who need one place to read what a format means.

## Core Principles

### I. One Source of Truth

A specification in this repository is the single source of truth for its format. Every host MUST implement it rather than define its own variant. A need a host discovers MUST come back here as a change to the specification before hosts diverge on it.

Rationale: four hosts that each define a format are four formats.

### II. Implementable from the Document Alone

Every specification MUST deliver three things together:

- a normative document from which an implementer can build a conforming validator, generator or editor runtime;
- a machine-readable schema for every format the document defines;
- worked examples, each valid against that schema.

A change to one of the three MUST update the other two in the same pull request.

Rationale: a document without a schema is argued over, and a schema without examples is never checked.

### III. Precise Normative Language

- Prose is Markdown. Normative statements MUST use the RFC 2119 and RFC 8174 key words in bold capitals; informative sections are marked *(informative)*.
- Schemas are JSON Schema, draft 2020-12, one schema file per specification, with `$defs` for each top-level structure.
- Wherever a specification needs computed values or conditions, it MUST use CEL, the Common Expression Language (https://cel.dev), rather than inventing an expression syntax.
- Examples are documents in the specification's own format.

Rationale: implementers in four languages need to read the same obligation the same way.

### IV. Versioned Specifications

A specification states its version and status (for example *0.1, Working Draft*) at the top of its document. Constructs MAY change freely before 1.0. From 1.0 on, a change that invalidates existing documents MUST come with a new major version.

Rationale: hosts and authors must be able to tell whether their documents still conform.

### V. Simplicity

A construct, format or dependency MUST be justified by a current designer's need, not an anticipated one. Prefer an existing standard (JSON Schema, CEL) over a new mechanism.

## Structure and Naming

- `specifications/<name>/` holds one specification: its document `<NAME>-specification.md`, its schema `<name>.schema.json`, and its examples beside them. DEDL, the Diagram Editor Definition Language, in `specifications/dedl/`, is the model.
- `docs/` holds documentation about the organization and its repositories rather than a format, such as `new-repository.md`.
- The organization is 'EtAlii' in prose and `etalii-adp` on GitHub; the product is 'ADP', 'A Different Perspective'.
- A specification folder is the format's short name in lowercase (`dedl`); its document takes the name in capitals (`DEDL-specification.md`). A file extension a specification defines is lowercase and short (`.dedl`).
- A change that renames or moves a specification's files MUST update every reference to them in the same pull request.

## Development Workflow

- Work follows GitHub Spec Kit: constitution, specify, (clarify), plan, tasks, implement. Specifications of changes state *what* and *why*; plans state *how*. One Spec Kit feature per change to a specification.
- Each feature is developed on its own branch, `features/<number>-<name>`, in its own worktree. The one exception is `claude/<name>`, which Claude's cloud sessions are handed by their harness.
- A feature reaches `develop`, the integration branch, only through a pull request merged with a merge commit. Nothing is merged locally into `develop` or pushed to it directly. When the pull request is merged or closed, the branch is deleted locally and on `origin`, and the worktree removed.
- Every plan MUST include a Constitution Check against these principles; any deviation MUST be recorded with its justification in the plan's complexity-tracking section.
- The Build workflow, `.github/workflows/build.yml`, runs on every pull request into `develop` and on every change to `develop`. It MUST at least validate every example against its schema, and its badge heads the readme (spec 001-ci-and-badges).

## Governance

This constitution supersedes other practices in this repository. Amendments are made through `/speckit-constitution`, recorded in version control, and versioned semantically: MAJOR for removing or redefining a principle, MINOR for adding a principle or materially expanding guidance, PATCH for clarifications. Reviews of plans and changes MUST verify compliance with the principles above; runtime guidance for agents lives in `CLAUDE.md`.

**Version**: 1.0.1 | **Ratified**: 2026-09-26 | **Last Amended**: 2026-09-27
