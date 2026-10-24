---
id: adp
type: goal-and-requirements
title: ADP, A Different Perspective — goal and requirements
status: draft
references:
  - constitution
  - terminology
---

# ADP, A Different Perspective — goal and requirements

## Goal

Some things are understood better as a picture than as prose, and better as a picture made for that one task than as a general-purpose one. ADP is a family of **specialised tools** (diagrams, designers and editors), each tuned to one task. It is for every situation in which a specialised visualisation serves better than a general one or a textual description. ADP began with architecture, but architecture is not its scope. It targets, among others:

- **(Constructive) technology assessment**: structuring the actors, effects, scenarios and uncertainties of a technology under discussion.
- **Collaboration between humans and agents**: making plans, hand-offs, responsibilities and progress legible to both.
- **Bringing clarity to textual data**: giving long or dense text a shape that can be navigated, questioned and corrected.

The words used here (tool, diagram, designer, editor, tool engineer, specification, definition, host, runtime) are defined in [terminology](docs/terminology.md) (`terminology`).

## Problem

General-purpose drawing tools can draw any of these pictures, but they know nothing about what is drawn, so they help with none of it. ADP's tools also have to live where their users already work: several IDEs, a standalone workspace, Notion and Claude. Each of these hosts has its own platform, constraints and needs. If every host defined its tools itself, ADP would become one product per host. So ADP is not one application. It is one set of **specifications** and several **hosts** that interpret them.

## Audience

- People who reason about something that is clearer drawn than written: developers and architects, and equally analysts, assessors, researchers and teams coordinating with agents.
- Teams who want those drawings to travel with the work they describe, reviewed in the same pull requests and branched and merged with the same history.
- Tool engineers, who specify a tool type once and get it in every host that supports its kind.
- Developers of the hosts, who implement the specifications, and agents working in any ADP repository, who need one place to read what a format means.
- Small teams and individual contributors first: ADP must add value when dropped into a single repository, with no organisation-wide rollout.

## Principles

These come from the product steering of the standalone host ([product.md](https://github.com/etalii-adp/etalii.adp.ide.standalone/blob/develop/.spec-workflow/steering/product.md)) and hold for every host. The principles of the specifications themselves are in the [constitution](.specify/memory/constitution.md) (`constitution`).

- **Files are the source of truth.** What a tool shows lives in plain, diffable files beside the work it describes, under the same version control. A host never keeps a second copy of a model.
- **Specialised over generalised.** A tool earns its place by knowing its subject: its element types, what may connect to what, and what a well-formed picture looks like.
- **Don't reinvent the wheel.** Where a well-known notation, file format or convention exists, ADP embraces it, and a file stays openable by the tool that owns its format (FBL, `fbl`).
- **Specified, not coded.** Every tool type is described in a specification, and code is written only where a specification cannot express what is needed. The final form of a specification is one ADP tool language description (`.atd`, `atd`) per tool type. Until that transition is complete, several approaches are supported side by side (see `architecture`, *Tool-type approaches*).
- **Live where the user already works.** ADP comes to the user's IDE, workspace or conversation, rather than asking the user to come to ADP.
- **No host is the reference implementation.** Every host interprets the same specifications. A host's own technical shape is how *that* host works, not a standard the others follow.
- **Value from day one.** ADP is useful in a single repository, before any wider adoption decision.
- **AI as an accelerant, not the core.** ADP makes structure legible to humans and to the agents working beside them. It does not generate or own that structure itself.

## Capabilities

- **Specialised tools on files.** Users view and edit task-specific diagrams, designers and editors, each backed by plain, diffable files. Where a model already lives in another tool's file (Structurizr, YAML, Freeplane, a .NET solution), ADP reads and writes that file in place, with byte-preserving splices.
- **Linkage over illustration.** Elements can be linked to the artifacts they represent (code, documents, other diagrams), so a picture stays meaningful as its subject changes.
- **Specification-driven tool types.** A tool type is specified once in the languages of this repository and interpreted by every host that supports its kind, with host code only where the specification runs out:
  - DISL and DID for diagrams, DESL and DED for designers, EDSL and EDD for editors (placeholders);
  - FBL for models in other tools' files;
  - ATD as the one language every tool type moves to.

  Each language ships a normative document, a JSON Schema and worked examples together.
- **A catalogue of shipped tool types** (`definitions`), validated against the languages on every pull request (`ci-validators`).
- **Multiple hosts, each in its own repository.** Each host meets ADP's vision under its own platform's needs (see `hosts`):
  - standalone web workspace;
  - native desktop application;
  - IntelliJ Platform IDEs;
  - Visual Studio Code;
  - Eclipse;
  - Notion;
  - Claude.

  The public site presents the product, its catalogue and its hosts.
- **Live, pushed updates.** Changes to the underlying files, whether from ADP itself, another editor or version control, reach open views without refreshing, in every host whose platform allows it.
- **One place for every change.** Every repository except standalone is changed through a GitHub Spec Kit feature in this repository (`specs-archive`).

## Non-goals

- A general-purpose drawing tool: a tool that could draw anything is not the goal.
- A proprietary store for models. Files, or the host platform's own documents where the platform has no files, hold the model.
- A reference host whose internals the others must copy.
- Constructs, formats or dependencies justified only by an anticipated need (constitution principle V).
- Generating or owning the user's structure with AI.

## How this graph relates to the planning systems

This graph is the durable map: what ADP is, how it is divided, and where each boundary runs. ADP is moving its planning to ThinkRail and this graph. Until that move is complete, the existing systems stay authoritative for the work they hold:

- GitHub Spec Kit (`specs-archive`, with the constitution) for every repository except standalone;
- spec-workflow (`.spec-workflow/` in `etalii.adp.ide.standalone`) for the standalone host.

Neither is to be disregarded or duplicated here.
