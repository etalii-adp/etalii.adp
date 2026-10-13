# Contract: the hand-off to the standalone host

What `etalii.adp.ide.standalone` builds and settles, and which success criteria only it can show. Nothing here is this repository's to change (R24). Every statement cites the functional requirement (FR) or success criterion (SC) of [the specification](../hierarchical-requirement-designer.spec.md), or the decision (R) of [research.md](../research.md), it comes from. R24 read the host at `f45a4d50c`.

## When and how

| Rule | Source |
|---|---|
| The designer is built first in the standalone host, and in no other host by this feature. | FR-063 |
| The host plans with spec-workflow in its own repository. Its specification of this designer is written there, from the merged definition, as step 7 of the delivery. | plan, Delivery |
| Nothing is built in that host until its open work, spec 025-standalone-code-structure among it, is done. Spec 025 moves the seams this designer plugs into: it joins the three tool-family routers, catalogs and factories. | Assumptions, R24 |
| No host changes in this feature's pull requests. | plan, Technical Context |

## What the host builds from

| Input | Where | Source |
|---|---|---|
| The definition | `definitions/designers/hierarchical-requirement.des`, `.fbl`, `.md`, `.schema.json`, `examples/web-shop.md`, `examples/web-shop.adp` | R18, FR-056 |
| The languages | DED 0.2, FBL 0.7, DESL 0.2: see [language-changes.md](language-changes.md) | FR-057 to FR-061 |
| The fixtures | `specifications/fbl/fixtures/bullets-read/`, `bullets-edits/`, `registration-blocks/`, `hierarchical-requirement-*/`. They are the contract a host's conformance run is held to. | plan, Technical Context |
| The names and the file | [tool-type.md](tool-type.md), [requirement-document.md](requirement-document.md) | |

The name users see is `Hierarchical Requirement Designer`, an item's number is `ITEM-000x`, a requirement's is `REQ-000x`, and `#` is what the person types in a description to open the lookup (Verbatim Constraints).

## What the host builds

| Area | What exists at `f45a4d50c` | What this designer needs | Source |
|---|---|---|---|
| A second shared surface | The designer family is the table from end to end: `IDesignerSession`, `designers.proto`, `useTableStream`, `TableSurface`. `declarativeDesignerModules.test.ts` refuses any element written in a module's client. | The `hierarchy` surface as core work: model, wire, client library. | R24, R14 |
| The tag components | They sit inside the table library, bound to the table model. | The same looks for tags, menus and lists outside the table. | R24, FR-021 |
| DESL | No DESL library: the host reads no `.des`. A developer writes the module from the definition, and `DefinitionConformance.Tests` compares vocabularies. | The module, written from `hierarchical-requirement.des`, with the `counter` strategy, `mentions`, `move` and `persistence.settings`. | R24, R16 |
| The `bullets` family | Readers under `Files\{Json,Lines,Xml,Yaml}`. | A `bullets` reader beside them. | R24, R9 |
| Declared blocks | `RegistrationDocument`, whose reader stops at an unknown block. | Reading and writing declared blocks, and keeping an undeclared one as section 8.1 says of trailing content. | R24, R12 |
| Drift before an edit | The host already refuses: "The file has changed since this edit was made, so it was not written." (`WritableDocumentLifecycle.cs`). | The check as FBL 0.7 section 7.2 states it. | R24, R11, FR-052 |
| The conformance corpus | Vendored: FBL 0.1 with selected additions. | The fixtures of FBL 0.7 named above. | R24 |

## What the host settles

Each is a question the definition does not answer, because it is the host's.

| Question | What is fixed | Source |
|---|---|---|
| Adding an existing `.md` as a designer document | `DesignerAddOptions.Plan` refuses when the body exists, and `DesignerFileRouter` claims no body by its content. User Story 1 opens a file an agent wrote, so both have to change. | R24, R4 |
| Two owners of `.md` already | The Markdown editor by extension and Agent Behavior Modelling by registration. A requirement document is recognised by its envelope, without a registration. | R24, R4 |
| Deleting the registration | The module guide says deleting either file removes the other. User Story 7's test deletes the registration and keeps the document. | R24, FR-005, SC-006 |
| Undo after an agent's write | FBL section 7.3 clears the history on every external change, so the person's undo stack ends with each write an agent makes. A person will notice. | R24, R11 |
| Which key adds an entry from a selected entry | A key, with no dialog. Which one is the host's. | FR-022, DESL section 8.1 |
| How focus is offered, how an item whose deeper levels do not fit is marked, and how the trail looks | The behaviour is fixed. Focus is the viewer's and is not stored. | FR-017, R14 |
| The wording of a refusal and of the choice between reloading and keeping | That the person is told and chooses. | FR-051, FR-052, FBL sections 7.2 and 7.3 |
| The icon that stands for several assessments | The definition names an icon for each kind. The one for several is the host's. | FR-033, FR-036, R25 |
| The first real subject | The maintainer's to name. It is not this repository's or the standalone host's own specifications. | Assumptions |

## Success criteria

The plan carries five criteria to the host's own specification, because each needs a person or an agent at work.

| Criterion | What the host has to show | Source |
|---|---|---|
| SC-001 | On one real requirement document, a person finds and judges the requirements of one part of the subject in less time in the designer than in the same file read as text. Both times are measured: the text's time is the baseline that does not exist today. | SC-001, plan |
| SC-002 | At least nine in ten changes an agent makes over the first four weeks of real use are read without a finding and without the person repairing the file by hand. | SC-002, plan |
| SC-009 | A requirement document of 100 items and 500 requirements opens within two seconds and shows an agent's change within two seconds. The size is a planning figure. | SC-009, Assumptions, plan |
| SC-010 | The maintainer keeps the requirements of one real subject outside this repository in a requirement document for four weeks and prefers it to the text. | SC-010, plan |
| SC-011 | A second person keeps the requirements of a real subject this way. It adds to success and is not a condition for it. | SC-011, plan |

The other criteria are stated in this repository, and the host shows them by its conformance run:

| Criterion | Stated here by | What is left to the host | Source |
|---|---|---|---|
| SC-003, SC-004 | The fixtures over the designer's binding, which state the exact bytes of every edit. | Planning the splices each fixture states. The validator cannot check that a host does. | plan, Technical Context, R20 |
| SC-005 | What reading reports for each fault, in the fixtures and by the validator on the examples. | The read-only page and the finding at one bullet, as a person sees them. | R8, R20, plan, Technical Context |
| SC-006 | The file holding every tag, category, state, reference and assessment, and the registration only what FR-004 lists. | Opening a document whose registration was deleted and created again. | FR-003, FR-005, R13 |
| SC-007 | The companion, and the validator on a file written from it alone. | The designer opening that file without a finding. | User Story 3, Independent Test and scenario 2 |
| SC-008 | The example validator and the defects planted by hand. | Nothing. | plan, Technical Context |

Anything a person sees, the layout and the gestures among it, is shown only in the host (plan, Technical Context).

## Conformance the host declares

| Class | Requirement | Source |
|---|---|---|
| FBL, Host (declared) | States the families it supports, `bullets` among them, and passes every fixture of those families. | FBL section 15.1 |
| DESL, Host | States the surface kinds it supports. A document of a kind it does not support opens read-only, if at all, with the reason. | DESL section 11 |
| DED, Host | Recognises a definition by its envelope, checks its version, and never changes an envelope. | DED sections 4 and 7 |

## Not part of this hand-off

| What | Source |
|---|---|
| Hosts other than standalone. Visual Studio Code and IntelliJ implement FBL 0.7 and DESL 0.2 when a feature brings this designer to them. | plan, What is not done here |
| Agent Behavior Modelling's move onto the `bullets` family. Hosts keep its plugin until a feature moves it. | R10, plan |
| Merging the edits of two writers, rich text in a description, references that leave the document. | Out of Scope |
