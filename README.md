# etalii.adp

[![Build](https://github.com/etalii-adp/etalii.adp/actions/workflows/build.yml/badge.svg?branch=develop)](https://github.com/etalii-adp/etalii.adp/actions/workflows/build.yml?query=branch%3Adevelop)

The specifications of the formats and languages that the ADP tools implement. A tool engineer specifies a tool type in its kind's specification language, and the tools users create of that type are stored in its kind's definition language:

| Kind | Specification language | Extension | Definition language | Extension |
|---|---|---|---|---|
| Diagram | [DISL, Diagram Specification Language](specifications/disl/DISL-specification.md) | `.disl` | [DID, Diagram Definition Language](specifications/did/DID-specification.md) | `.did` |
| Designer | [DESL, Designer Specification Language](specifications/desl/DESL-specification.md) | `.desl` | [DED, Designer Definition Language](specifications/ded/DED-specification.md) | `.ded` |
| Editor | [EDSL, Editor Specification Language](specifications/edsl/EDSL-specification.md) | `.edsl` | [EDD, Editor Definition Language](specifications/edd/EDD-specification.md) | `.edd` |

DISL and DID have content; the other four are placeholders. The Build workflow validates every example against its schema. The words used here are defined in [docs/terminology.md](docs/terminology.md).

ADP, A Different Perspective, is a range of task-focused tools: diagrams, designers and editors. The site is at <https://etalii.net/adp/>.

## Licence

[Apache License 2.0](LICENSE).
