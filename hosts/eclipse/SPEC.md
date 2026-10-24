---
id: host-eclipse
type: module-design
title: Eclipse host (etalii.adp.ide.eclipse)
status: draft
parent: hosts
references:
  - host-intellij
  - atd
---

# Eclipse host (`etalii.adp.ide.eclipse`)

ADP's tools as an Eclipse plug-in, for people whose IDE is Eclipse. It is one of the IDE hosts beside standalone, desktop, IntelliJ and VS Code (`hosts`).

## State

The repository exists, with its `CLAUDE.md`, licence, README and Build workflow, and holds **no plug-in code**. The site and the catalogue show the host as *planned*. Once there is code, the Build workflow is to offer the plug-in's update site as a download from each run (README).

ADP's first IDE plug-in was written for Eclipse, in what is now `etalii.adp.ide.intellij`. That repository moved wholly to the IntelliJ Platform and keeps every trace of Eclipse out by a test. This repository starts anew and inherits none of that code.

## What is settled

- **Obligations:** everything `hosts` lists for every host, including interpreting rather than redefining the specifications, vendoring them with provenance, files as the source of truth through FBL splices, native citizenship, and no network or downloaded code at run time.
- **Tool types:** spec 035 names "the adoption in the standalone host, the Notion add-on and the Eclipse host" as a later phase of the move to ATD. The host is therefore expected to run tool types from their specifications rather than code them (approaches 2 and 3 of `architecture` *Tool-type approaches*). *(Inferred from spec 035; how the host will run them is not specified.)*
- **Process:** no Spec Kit setup of its own. Every change is a feature in this repository, and pull requests in the host name the feature folder and the etalii.adp commit. Delivery follows the organisation's rules.
- **No principles file yet.** `.specify/memory/repositories/etalii.adp.ide.eclipse.md` is created with the first feature whose code lands here. Eclipse's earlier constitution was the unfilled template and was not kept.

## Not yet specified

The Eclipse platform's own needs (editor framework, undo integration, UI toolkit, distribution through an update site), the stack, and the first tool types are open. They are decided by the first feature that targets this host, not here.
