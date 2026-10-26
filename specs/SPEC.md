---
id: specs-archive
type: module-design
title: Spec Kit feature archive
status: draft
parent: architecture
references:
  - constitution
---

# Spec Kit feature archive

## Responsibility

Holds the GitHub Spec Kit features (spec, plan, tasks and contracts) through which every `etalii-adp` repository except `etalii.adp.ide.standalone` is changed. It is the organisation's record of *changes*. The durable state those changes produce lives in the language modules and the constitution. This folder's layout and history are described in [README.md](README.md).

## Boundary

- Features are `NNN-feature-name/`, numbered in one sequence for the organisation, with the repository in the name when the code lands in one repository. Features moved here on 2026-10-05 keep their old numbers under `<repository>/NNN-feature-name/`.
- A task whose code lands in another repository is ticked only once that repository's pull request is merged.
- A feature records *what* and *why*. Once it has shipped, its outcome must be reflected in the owning spec (the language document, the constitution or this graph), not only here.
- Each feature's specification is shown in the graph as a generated child of this node under `thinkrail/specs/` (`feature-NNN-name`), written by `python .github/scripts/thinkrail-specs.py`. The copy is a pointer for ThinkRail's specs pane; the feature folder stays the source.
- ADP is moving its planning to ThinkRail and this spec graph. Until that move is complete, this archive stays authoritative for the work it holds, and the graph does not duplicate it. The standalone host's spec-workflow (`host-standalone`) is likewise kept, not disregarded (goal `adp`). *(How a running feature hands its outcome to the graph is unconfirmed.)*
