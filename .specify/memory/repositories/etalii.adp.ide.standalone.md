---
id: principles-standalone
type: architecture-design
title: Principles
status: draft
parent: host-standalone
---
<!--
Sync Impact Report
- Version: none → 1.0.0 (first ratification)
- Written on 2026-10-31, when etalii.adp.ide.standalone stopped planning with spec-workflow and its unfinished specifications moved here as specs/068-standalone-* to specs/073-standalone-*.
- The principles are not restated from scratch: they are the steering documents that spec-workflow kept in .spec-workflow/steering/, which moved to docs/steering/ in that repository the same day, and its CLAUDE.md. This file names them and the rules a plan is checked against.
- Templates: plan, spec and tasks templates unchanged; no follow-ups.
-->
> These are the principles of [`etalii.adp.ide.standalone`](https://github.com/etalii-adp/etalii.adp.ide.standalone), written here on 2026-10-31: that repository has no Spec Kit setup of its own, and its features are specified in etalii.adp since it stopped using spec-workflow. A plan whose code lands in `etalii.adp.ide.standalone` checks them beside [etalii.adp's own](../constitution.md). Amend them here, with a pull request into etalii.adp; amend the documents they name in that repository, with a pull request there.

# Principles

## Terminology

ADP's words are defined once, in the ADP glossary, [`docs/terminology.md`](../../../docs/terminology.md). ADP offers **tools**, each of one kind: a **diagram**, a **designer** or an **editor**. This repository is the **standalone host**: an ASP.NET Core backend and a React client in one process, talking gRPC, with one module per tool type under `src/diagrams/`, `src/designers/` and `src/editors/`.

## Where the principles are written

The standalone host's principles are its steering documents and its working rules, in that repository, and a plan is checked against them by name:

- [`docs/steering/product.md`](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/develop/docs/steering/product.md): what ADP is for, and the mantra every tool follows: files are the source of truth, specialized over generalized, specified rather than coded, and value from day one in a single repository.
- [`docs/steering/tech.md`](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/develop/docs/steering/tech.md): the stacks, the gRPC call shapes, how a diagram type is specified and declared, testing and quality, and the decision log.
- [`docs/steering/structure.md`](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/develop/docs/steering/structure.md): the folders, naming, module boundaries and code organization.
- [`docs/steering/processes.md`](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/develop/docs/steering/processes.md) and [`docs/steering/roles.md`](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/develop/docs/steering/roles.md): how work is done there, and by whom.
- [`CLAUDE.md`](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/develop/CLAUDE.md): the working rules, which win where a steering document disagrees.

## Rules a plan is checked against

### I. Specified, not coded

A tool type is read from its definition in etalii.adp (DISL, DESL or EDSL, with its FBL binding), bundled into its module; code is written only where a definition cannot express what the tool needs, and each such part names the gap or host concern that keeps it.

### II. The file is the source of truth

Opening and saving a document without edits MUST leave it byte-identical, and every edit MUST be one undoable command. A module whose round trip is byte-compared marks its fixtures `-text` in `.gitattributes`.

### III. Four gates and a pull request

Every change reaches `develop` through a pull request from a `features/<name>` (or `claude/<name>`) branch whose four gates exit zero: `npm test`, `npm run typecheck`, `dotnet format style --verify-no-changes --severity info` and `dotnet test`. A bug found leaves a guard behind that was seen to fail for the right reason.

### IV. The documentation stays true

A change that makes a sentence of `docs/architecture.md`, `docs/solution-structure.md`, a module walkthrough or `docs/tools.md` false updates it in the same change.

## Specifications

Features for this repository are `specs/NNN-standalone-<name>/` in etalii.adp. A task is ticked there once its pull request into standalone's `develop` is merged. A small amendment (a word, a sentence, a count, an ordering, or the reading of an ambiguous criterion) is asked of Peter as a selection and applied by the specification's owner, its commit naming the ruling and its date; anything larger goes back through his approval.

**Version**: 1.0.0 | **Ratified**: 2026-10-31 | **Last Amended**: 2026-10-31
