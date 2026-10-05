<!--
Sync Impact Report
- Version: 1.3.0 → 1.4.0 (MINOR)
- Modified: Structure and Naming (`specs/` holds the Spec Kit features of every etalii-adp repository but standalone, and `.specify/memory/repositories/` the principles of each); Development Workflow (where a feature lives whichever repository its code lands in, how features moved here from other repositories are kept and continued, and that a plan checks the target repository's principles as well).
- Added or removed sections: none.
- Rationale for MINOR: materially expanded guidance on where features live, after every Spec Kit specification of etalii.adp.ide.intellij and etalii.adp.site, and the principles of those two and etalii.adp.ide.vscode, moved here (Peter, 2026-10-05); no principle removed or redefined.
- Templates: plan, spec and tasks templates unchanged; no follow-ups.
--># etalii.adp Constitution

ADP ("A Different Perspective") is a family of task-focused tools: diagrams, designers and editors. They serve (constructive) technology assessment, collaboration between humans and agents, and bringing clarity to textual data. ADP tools are hosted in several IDEs, each in its own repository (`etalii.adp.ide.standalone`, `etalii.adp.ide.intellij`, `etalii.adp.ide.vscode`, `etalii.adp.ide.eclipse`). This repository holds what those hosts share: the specifications of the formats and languages a tool is built from. It also holds the Spec Kit features through which every repository but standalone is changed. Its readers are the developers of the ADP hosts, who implement the specifications; tool engineers, who write specifications and definitions in these formats; and agents working in any ADP repository, who need one place to read what a format means. The words used here (tool, diagram, designer, editor, tool engineer, specification, definition, runtime) are defined in [docs/terminology.md](../../docs/terminology.md).

## Core Principles

### I. One Source of Truth

A specification in this repository is the single source of truth for its format. Every host MUST implement it rather than define its own variant. A need a host discovers MUST come back here as a change to the specification before hosts diverge on it.

Rationale: four hosts that each define a format are four formats.

### II. Implementable from the Document Alone

Every specification MUST deliver three things together:

- a normative document from which an implementer can build a conforming validator, generator or runtime;
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

Rationale: hosts and tool engineers must be able to tell whether their specifications and definitions still conform.

### V. Simplicity

A construct, format or dependency MUST be justified by a current tool's need, not an anticipated one. Prefer an existing standard (JSON Schema, CEL) over a new mechanism.

## Structure and Naming

- `specifications/<name>/` holds one specification: its document `<NAME>-specification.md`, its schema `<name>.schema.json`, and its examples beside them. DISL, the Diagram Specification Language, in `specifications/disl/` (`DISL-specification.md`, `disl.schema.json`, examples `*.dis`), is the model.
- Each kind of tool has one specification language and one definition language, and all six follow the model's pattern: DISL and DID (the Diagram Definition Language) for diagrams, DESL and DED for designers, EDSL and EDD for editors, in `specifications/disl/`, `did/`, `desl/`, `ded/`, `edsl/` and `edd/`. For each, `<name>` is the acronym in lowercase and is used alike for the folder, the schema, its `$id` (`https://etalii.net/adp/<name>/schema/<version>/<name>.schema.json`), the version key (`"<name>": "<version>"`) and the file extension (`.<name>`). A language without content yet is a placeholder document with status *Placeholder*, stating its purpose and extension and nothing normative.
- A language that serves every kind of tool rather than one kind sits beside the six under the same rules. The first is FBL, the Format Binding Language, in `specifications/fbl/` (`FBL-specification.md`, `fbl.schema.json`, `$id` `https://etalii.net/adp/fbl/schema/<version>/fbl.schema.json`, version key `"fbl"`, extension `.fbl`), which declares how a tool reads and writes a model that lives in another tool's file.
- `specs/` holds the Spec Kit features of every etalii-adp repository except `etalii.adp.ide.standalone`, which plans with spec-workflow in its own repository. A feature is `specs/<number>-<name>/`, numbered in one sequence for the organization. Features specified in another repository before they moved here (2026-10-05) are kept under `specs/<repository>/<number>-<name>/` with the numbers they had there.
- `.specify/memory/repositories/<repository>.md` holds the principles of each repository whose code a feature here can land in and that has principles of its own: `etalii.adp.ide.intellij`, `etalii.adp.ide.vscode` and `etalii.adp.site`.
- `docs/` holds documentation about the organization and its repositories rather than a format, such as `new-repository.md`.
- The organization is 'EtAlii' in prose and `etalii-adp` on GitHub; the product is 'ADP', 'A Different Perspective'.
- Every specification document, placeholders included, states the repository's licence as the last row of its header table: `` | Licence | [Apache License 2.0](https://github.com/etalii-adp/etalii.adp/blob/develop/LICENSE) (`Apache-2.0`) | ``. The repository keeps exactly one licence file of its own, `LICENSE` at its root, carrying the Apache License 2.0 and the line `Copyright © Peter Vrenken 2026`, and none beside it at the root or under `specifications/`.
- A specification folder is the format's short name in lowercase (`disl`); its document takes the name in capitals (`DISL-specification.md`). A file extension a specification defines is lowercase and short (`.dis`).
- A change that renames or moves a specification's files MUST update every reference to them in the same pull request.

## Development Workflow

- Work follows GitHub Spec Kit: constitution, specify, (clarify), plan, tasks, implement. Specifications of changes state *what* and *why*; plans state *how*. One Spec Kit feature per change to a specification.
- Each feature is developed on its own branch, `features/<number>-<name>`, in its own worktree. The one exception is `claude/<name>`, which Claude's cloud sessions are handed by their harness.
- A feature reaches `develop`, the integration branch, only through a pull request merged with a merge commit. Nothing is merged locally into `develop` or pushed to it directly. When the pull request is merged or closed, the branch is deleted locally and on `origin`, and the worktree removed.
- A feature is specified here whichever repository its code lands in. Its tasks name files with their repository as prefix (`etalii.adp.ide.intellij/core/...`), and each repository it touches gets its own branch, named as the feature's, and its own pull request; spec 001-ci-and-badges is the model. A feature kept under `specs/<repository>/` is continued with the companion's `--feature-dir` pointing at its folder.
- Every plan MUST include a Constitution Check against these principles; any deviation MUST be recorded with its justification in the plan's complexity-tracking section. A plan whose code lands in another repository MUST also check that repository's principles in `.specify/memory/repositories/`, where it has them.
- The Build workflow, `.github/workflows/build.yml`, runs on every pull request into `develop` and on every change to `develop`. It MUST at least validate every example against its schema, and its badge heads the readme (spec 001-ci-and-badges). It also checks the licence file and each specification's licence statement (spec 003-specification-licence).

## Governance

This constitution supersedes other practices in this repository. Amendments are made through `/speckit-constitution`, recorded in version control, and versioned semantically: MAJOR for removing or redefining a principle, MINOR for adding a principle or materially expanding guidance, PATCH for clarifications. Reviews of plans and changes MUST verify compliance with the principles above; runtime guidance for agents lives in `CLAUDE.md`.

**Version**: 1.4.0 | **Ratified**: 2026-09-26 | **Last Amended**: 2026-10-05
