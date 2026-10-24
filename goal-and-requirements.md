---
id: adp-specifications
type: goal-and-requirements
title: ADP specifications — goal and requirements
status: draft
references:
  - constitution
  - terminology
---

# ADP specifications — goal and requirements

## Goal

Be the single place where the formats and languages of ADP ("A Different Perspective") are defined, so that every ADP host implements the same format instead of its own variant. The principles behind this, and their rationale, live in the [constitution](.specify/memory/constitution.md) (`constitution`); the words used here are defined in [terminology](docs/terminology.md) (`terminology`).

## Problem

ADP tools (diagrams, designers and editors) run in several hosts, each in its own repository: standalone, desktop, IntelliJ, VS Code, Eclipse, Notion and Claude. If each host defined its formats itself, there would be one format per host. This repository holds what the hosts share, and is also where the organisation specifies its changes.

## Audience

- Developers of the ADP hosts, who implement the specifications.
- Tool engineers, who write specifications and definitions in these formats.
- Agents working in any ADP repository, who need one place to read what a format means.

## Capabilities

- **One specification language and one definition language per tool kind:** DISL and DID for diagrams, DESL and DED for designers, EDSL and EDD for editors. Each language ships a normative document, a JSON Schema and worked examples together.
- **Cross-kind languages:** FBL, the Format Binding Language, declares how a tool reads and writes a model that lives in another tool's file, with byte-preserving splices and the `.adp` registration. ATD, the ADP tool language, describes a tool type of any kind in text under one LALR(1) grammar.
- **Tool definition catalogue:** the concrete diagram and designer types ADP ships (`definitions/`), written in these languages and validated against them.
- **Machine checks:** every example, fixture and tool definition is validated against its schema on each pull request. The checks also build the ATD grammar, check the licence statement on every document and check the shared vocabulary.
- **Organisation-wide change specs:** the Spec Kit features for every `etalii-adp` repository except standalone (`specs/`).

## Non-goals

- Host code. Validators, generators and runtimes that implement these specifications live in the host repositories, not here.
- Planning for `etalii.adp.ide.standalone`. It keeps its own spec-workflow process.
- Constructs justified only by an anticipated need (constitution principle V).
- Normative content for EDSL and EDD while no editor needs it. Until then they stay placeholders.

## How this graph relates to Spec Kit

This graph is a thin map over the durable documents: what the repository is, how it is divided, and where each boundary runs. Changes are still specified and planned through GitHub Spec Kit (`specs/`) against the constitution. *(Agreed during setup; how the two stay in step as the project changes is unconfirmed.)*
