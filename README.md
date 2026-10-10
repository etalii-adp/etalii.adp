# etalii.adp

[![Build](https://github.com/etalii-adp/etalii.adp/actions/workflows/build.yml/badge.svg?branch=develop)](https://github.com/etalii-adp/etalii.adp/actions/workflows/build.yml?query=branch%3Adevelop)

The specifications of the formats and languages that the ADP tools implement. A tool engineer specifies a tool type in its kind's specification language, and the tools users create of that type are stored in its kind's definition language:

| Kind | Specification language | Extension | Definition language | Extension |
|---|---|---|---|---|
| Diagram | [DISL, Diagram Specification Language](specifications/disl/DISL-specification.md) | `.dis` | [DID, Diagram Definition Language](specifications/did/DID-specification.md) | `.did` |
| Designer | [DESL, Designer Specification Language](specifications/desl/DESL-specification.md) | `.des` | [DED, Designer Definition Language](specifications/ded/DED-specification.md) | `.ded` |
| Editor | [EDSL, Editor Specification Language](specifications/edsl/EDSL-specification.md) | `.eds` | [EDD, Editor Definition Language](specifications/edd/EDD-specification.md) | `.edd` |

When a tool's model lives in another tool's file, such as a Structurizr workspace, a Freeplane mind map or an Azure Pipelines YAML file, the tool's specification points at a binding in [FBL, the Format Binding Language](specifications/fbl/FBL-specification.md) (`.fbl`), which says how that file is read and how edits are written back into it without disturbing the rest.

DISL, DID and FBL have content; the other four are placeholders. [DISL at a glance](docs/disl-overview.md) shows DISL's main concepts and how they group together. [Agent activity diagram at a glance](docs/agent-activity-diagram.md) shows what the agent activity diagram, one of the tool definitions in [definitions/](definitions/), is for and how its parts fit together. Every `etalii-adp` repository but `etalii.adp.ide.standalone` is changed through a GitHub Spec Kit feature in [specs/](specs/README.md). The Build workflow validates every example against its schema. The words used here are defined in [docs/terminology.md](docs/terminology.md).

ADP, A Different Perspective, is a range of task-focused tools: diagrams, designers and editors. The site is at <https://etalii.net/adp/>.

## Licence

[Apache License 2.0](LICENSE).
