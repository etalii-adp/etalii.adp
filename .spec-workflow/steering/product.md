# Product

ADP ("A Different Perspective") is a family of task-focused diagram and text designers: for (constructive) technology assessment, for collaboration between humans and agents, and for bringing clarity to textual data. The designers are hosted in several IDEs, each in its own repository (`etalii.adp.ide.standalone`, `etalii.adp.ide.intellij`, `etalii.adp.ide.vscode`, `etalii.adp.ide.eclipse`).

This repository, `etalii.adp`, holds what those hosts share: the specifications of the formats and languages a designer is built from. A specification here is the single source of truth, so each host implements it rather than defining its own.

## What a specification delivers

- A normative document that an implementer can build a conforming validator, generator or editor runtime from.
- A machine-readable schema for every format the document defines.
- Worked examples that are valid against that schema.

## Current specifications

- **DEDL**, the Diagram Editor Definition Language (`specifications/dedl/`): a declarative definition of a diagram editor, from metamodel through notation, tools, constraints, behaviour, layout and persistence.

## Users

- Developers of the ADP hosts, who implement the specifications.
- Authors of diagram and text designers, who write definitions and documents in these formats.
- Agents working in any ADP repository, who need one place to read what a format means.
