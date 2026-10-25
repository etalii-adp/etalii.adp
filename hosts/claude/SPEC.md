---
id: host-claude
type: module-design
title: Claude
status: draft
parent: hosts
references:
  - host-notion
---

# Claude

Repository: [`etalii.adp.ide.claude`](https://github.com/etalii-adp/etalii.adp.ide.claude)

ADP's tools inside Claude: a host in which ADP tools open **within a Claude conversation**, as the Notion host opens them within a Notion page (README). Like Notion, it is a host that is not an IDE. It serves the goal's focus on collaboration between humans and agents (`adp`): the structure an agent and a person work on together becomes a specialised tool both can read, in the place where they already talk. *(Inferred from the goal; unconfirmed.)*

## State

The repository exists, created on 2026-10-24 with its `CLAUDE.md`, licence, README and Build workflow, and holds **no code**. The README states that "what this repository builds is specified in etalii.adp before any is written". No feature has targeted it yet.

## What is settled

- **Obligations:** everything `hosts` lists for every host. *How* "files are the source of truth" holds inside a conversation, where the user's files may not be at hand, is open. Notion's answer, rows as the model with the cost recorded, is the precedent to weigh, not a decision.
- **Agents are readers, not owners.** ADP makes structure legible to people and agents. It does not generate or own that structure (goal principle *AI as an accelerant, not the core*).
- **Process:** no Spec Kit setup of its own. Every change is a feature in this repository. The constitution (1.9.0) names the host and its repository. Its principles file, `.specify/memory/repositories/etalii.adp.ide.claude.md`, is created with the first feature whose code lands here.

## Not yet specified

How a tool reaches a conversation, where its model lives, which tool kinds and tool types come first, and the platform's own limits. They are decided by the first feature that targets this host, not here.
