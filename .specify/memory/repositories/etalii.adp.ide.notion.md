<!--
Sync Impact Report
- Version: template → 1.0.0 (first ratification, 2026-10-07)
- Principles: I. One Source of Truth; II. Every Address under /adp-notion; III. Truthful About What Exists; IV. Simplicity.
- Sections: Terminology, Core Principles, Publication and Technology Constraints, Development Workflow, Governance.
- Written by etalii.adp spec 011-notion-repository (task T007, FR-007), in the shape of the principles of etalii.adp.ide.vscode 1.0.0 and etalii.adp.site 1.1.0.
- Templates: plan, spec and tasks templates unchanged; no follow-ups.
-->
> These are the principles of [`etalii.adp.ide.notion`](https://github.com/etalii-adp/etalii.adp.ide.notion), written here on 2026-10-07 by spec [011-notion-repository](../../../specs/011-notion-repository/notion-repository.spec.md): that repository has no Spec Kit setup of its own, and its features are specified in etalii.adp. A plan whose code lands in `etalii.adp.ide.notion` checks them beside [etalii.adp's own](../constitution.md). Amend them here, with a pull request into etalii.adp.

# etalii.adp.ide.notion Constitution

## Terminology

ADP's words are defined once, in the ADP glossary, `docs/terminology.md` in etalii.adp (https://github.com/etalii-adp/etalii.adp/blob/develop/docs/terminology.md). ADP offers **tools**, each of one kind: a **diagram**, a **designer** or an **editor**. Notion is a **host** and not an IDE host. A **Notion add-on** is a web page that shows one tool inside a Notion page; it is how a tool runs in the Notion host, and this repository builds and publishes the add-ons. "The Notion workspace" is the workspace that holds ADP's catalogue, not the host. Notion's own names, such as the embed block, keep their names: a Notion add-on is shown *in* an embed block.

## Core Principles

### I. One Source of Truth

The repository does not own what a tool is; etalii.adp does.

- A Notion add-on MUST take its tool type from a DISL specification and its file formats from FBL bindings in etalii.adp, and MUST NOT restate them.
- A difference between an add-on and its specification or binding MUST be raised as a change in etalii.adp, never settled in the add-on.
- One folder, `addons/<id>/`, is one add-on of one tool type, and `<id>` is the id of that tool type.

Rationale: five hosts that each define a tool are five tools. An add-on that restates a specification drifts from it, and nobody notices until two hosts disagree about the same file.

### II. Every Address under `/adp-notion`

- Every address the repository publishes MUST work under `https://etalii.net/adp-notion`, never under the root of the domain.
- Each add-on has one address, `/adp-notion/<id>/`, decided by the name of its folder alone. It MUST NOT change when another add-on is added or removed.
- A published page MUST NOT refuse to be shown inside a Notion page: every page under `/adp-notion`, the index included, MUST be displayable through Notion's embed block.

Rationale: an add-on's address is pasted into Notion pages the repository never sees. An address that moves, or a page that refuses to be framed, breaks every one of them without a failing build to show for it.

### III. Truthful About What Exists (NON-NEGOTIABLE)

- The repository, its `README.md` and its index MUST NOT claim a tool that is not published. Planned and in-progress work MAY be shown only when labelled as such.
- The index at `/adp-notion` MUST be generated from the add-on folders found, never written by hand, and MUST say so when there is none.
- The index MUST name the revision of `etalii.adp.ide.notion` it was built from.

Rationale: a reader who embeds an add-on on the strength of a claim that turns out false does not come back, and the site's host entry is sourced from this repository's `README.md`, so a false claim here is repeated there.

### IV. Simplicity

Start with the smallest repository that publishes an add-on, and grow it by specification. A dependency, a build step or a hosting service MUST be justified by a current requirement, not an anticipated one. Publication is by GitHub Pages only, through the deployment of `etalii.adp.site`.

Rationale: a small add-on that honours principles I to III beats a large one that does not.

## Publication and Technology Constraints

- What the repository publishes is served at `https://etalii.net/adp-notion`, over HTTPS, by GitHub Pages and by no other hosting service.
- The repository has no GitHub Pages site of its own. The `deploy` workflow of `etalii.adp.site` builds it and places the result beside the site, so that every deployment of `etalii.net` carries both `/adp` and `/adp-notion`.
- The contract between the two repositories is one command line, `node scripts/build.mjs --out <dir>`, which writes `index.html` and one folder per add-on. The site's workflow MUST NOT need to know what is inside.
- The same command MUST run in the Build workflow on every pull request, so that a tree that cannot be built is found before it is merged.
- A merge into `develop` MUST publish without a manual step. A pull request, also one from a fork, MUST publish nothing and MUST NOT see a secret.
- The repository is public and in English only.
- ADP is licensed under Apache-2.0. Third-party dependencies MUST be Apache-2.0-compatible.

## Development Workflow

- Work follows GitHub Spec Kit: constitution, specify, (clarify), plan, tasks, implement. Specifications state *what* and *why* and stay free of implementation choices; plans state *how*. The repository's features are specified in etalii.adp, under `specs/`.
- Each feature is developed on its own branch, `features/<number>-<name>`, in its own worktree. The one exception is `claude/<name>`, which Claude's cloud sessions are handed by their harness.
- A feature reaches `develop`, the integration branch, only through a pull request merged with a merge commit. A feature branch is never merged locally into `develop`, and nothing is pushed to `develop` directly. When the pull request is merged or closed, the branch is deleted locally and on `origin`, and the worktree removed.
- Every plan MUST include a Constitution Check against these principles; any deviation MUST be recorded with its justification in the plan's complexity-tracking section.
- A change is mergeable only when the Build workflow's checks pass.

## Governance

This constitution supersedes other practices in this repository. Amendments are made through `/speckit-constitution`, recorded in version control, and versioned semantically: MAJOR for removing or redefining a principle, MINOR for adding a principle or materially expanding guidance, PATCH for clarifications. Reviews of plans and changes MUST verify compliance with the principles above; runtime guidance for agents lives in `CLAUDE.md`.

**Version**: 1.0.0 | **Ratified**: 2026-10-07 | **Last Amended**: 2026-10-07
