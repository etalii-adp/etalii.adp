---
id: ci-validators
type: module-design
title: Build workflow and validators
status: draft
parent: architecture
depends-on:
  - disl
  - did
  - desl
  - ded
  - fbl
  - atd
  - definitions
  - terminology
---

# Build workflow and validators

## Responsibility

Enforce on every pull request into `develop`, and on every change to `develop`, what the constitution requires of a specification (principle II and "Structure and Naming"). The `Build` workflow (`workflows/build.yml`, spec 001) runs these scripts:

- `validate-examples.py`: validates every example, legacy fixture, FBL registration and round-trip fixture, tool definition, designer example document and ATD artefact (findings, traces, conformance fixtures, capability contracts) against its schema.
- `atd-grammar.py --check`: builds the ATD grammar as strict LALR(1), lints it, runs the keyword probe and compares the generated files.
- `licence-check.py`: checks the Apache-2.0 `LICENSE` and the `Licence` row of every specification document (spec 003).
- `terminology-check.py`: checks for retired vocabulary against `docs/terminology-check.json` (spec 002).
- The `descriptions` job: checks every tool description with the desktop host's `atd`, built from the branch of the same name when there is one (spec 035).

## Boundary

- Validators check. They never define a format: a rule they enforce must be stated in the owning specification or in the constitution.
- The scripts find files by the constitution's naming rules. Renaming or moving a specification's files means updating them in the same pull request.
- The only external dependency is the `descriptions` job's checkout of `etalii.adp.ide.desktop`.
