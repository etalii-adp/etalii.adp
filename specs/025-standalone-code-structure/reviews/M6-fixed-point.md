# The fixed point of M6

Task T208 (FR-085; SC-021). M6 restructures the specification projects; the FBL conformance fixtures and the DISL suite are what it is measured against, so they stay as they are while it runs. This record names them as they stood when M6 started, so that the M6 review can show they were not changed.

## Where M6 starts

`etalii.adp.ide.standalone` `develop` at `621be6f18be95070cf62f899fcd2f4ddd2cf578a` (2026-10-19, the merge of pull request 511, the last task of the M5 review). Built in a freshly created worktree at that commit, the three test projects of the specification projects pass in full:

| Project | Tests | Failed | Skipped |
|---|---|---|---|
| `EtAlii.Adp.Specification.Fbl.Tests` | 1803 | 0 | 0 |
| `EtAlii.Adp.Specification.Disl.Tests` | 493 | 0 | 0 |
| `EtAlii.Adp.Specification.Cel.Tests` | 269 | 0 | 0 |

## What does not change

1. **The FBL conformance fixtures**: the 67 files vendored under `src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/` from `etalii.adp`, listed below with their git blob ids. That is every file there except `readme.md` and the five `*.Tests.cs` runners, which are this repository's code.
2. **The DISL suite's fixtures**: the four files under `src/backend/EtAlii.Adp.Specification.Disl.Tests/Definitions/` and the two module definitions the suite embeds, with their provenance, listed below.
3. **The DISL suite's expected results**: what an assertion of `EtAlii.Adp.Specification.Disl.Tests` expects, a diagnostic's text included. A test may change how it reaches the library, such as the name of a type it reads or the call that loads a specification, and the M6 pull request that changes it says so. It may not change what it expects.

An M6 task that finds it must change one of these stops and reports it. What a library and a specification disagree on goes back to `etalii.adp` as a feature of its own (FR-085, FR-025). The runners may change: T216 makes `ConformanceFixtures.Tests.cs` run the `insert-empty-*` pair as plain fixtures, and the pair's expected results stay as they are.

Copying the corpus again from `etalii.adp` is not an M6 task. When a conversion's own pull request does that while M6 runs, as C4 task 13 and Databricks task 10 may, the M6 review names that pull request beside the files it changed, and M6's pull requests take `develop` as it then is.

## How the M6 review checks it

```
git diff --stat 621be6f18 <the merge commit of M6's last pull request> -- \
  src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance \
  src/backend/EtAlii.Adp.Specification.Disl.Tests \
  src/diagrams/gartner-hype-cycle-graph/definition \
  src/diagrams/agent-behavior-modelling/definition
```

Every changed fixture is attributed to a pull request that is not an M6 task's. Every changed file of the DISL suite is read for a changed expected value. The three test projects pass in full on that commit.

## The DISL suite's fixtures

| File | Blob |
|---|---|
| `src/backend/EtAlii.Adp.Specification.Disl.Tests/Definitions/narrow-reading.dis` | `51302313c1` |
| `src/backend/EtAlii.Adp.Specification.Disl.Tests/Definitions/narrow-reading.provenance.json` | `4d84909fc6` |
| `src/backend/EtAlii.Adp.Specification.Disl.Tests/Definitions/wide-reading.dis` | `5ca47bd7b1` |
| `src/backend/EtAlii.Adp.Specification.Disl.Tests/Definitions/wide-reading.provenance.json` | `fae07550c8` |
| `src/diagrams/agent-behavior-modelling/definition/agent-behavior-modelling.dis` | `930a4b709e` |
| `src/diagrams/agent-behavior-modelling/definition/provenance.json` | `ce8f51c21c` |
| `src/diagrams/gartner-hype-cycle-graph/definition/gartner-hype-cycle-graph.dis` | `cdad26fd4b` |
| `src/diagrams/gartner-hype-cycle-graph/definition/provenance.json` | `08492ded1c` |

## The FBL conformance fixtures

Paths are relative to `src/backend/EtAlii.Adp.Specification.Fbl.Tests/Conformance/`.

<details>
<summary>67 files</summary>

| File | Blob |
|---|---|
| `LICENSE.md` | `98e38907c5` |
| `agent-activity-diagram.fbl` | `04e5f48690` |
| `causal-loop-diagram.fbl` | `4685658569` |
| `databricks-job.fbl` | `e0430391c2` |
| `databricks-pipeline.fbl` | `fb767d939b` |
| `dependency-graph.fbl` | `4ef294138f` |
| `etalii.adp/definitions/designers/examples/cities.json` | `619ce94746` |
| `etalii.adp/definitions/designers/examples/cities.xml` | `5f61b15997` |
| `etalii.adp/definitions/designers/examples/cities.yaml` | `c4aeb7782d` |
| `etalii.adp/definitions/designers/knowledge.des` | `6a75725adb` |
| `etalii.adp/definitions/designers/knowledge.fbl` | `f26f0fef8d` |
| `etalii.adp/definitions/diagrams/timeline.dis` | `99d981d388` |
| `etalii.adp/specifications/fbl/fixtures/knowledge-equivalence/json/fixture.json` | `96cdd8c63e` |
| `etalii.adp/specifications/fbl/fixtures/knowledge-equivalence/xml/fixture.json` | `698917be30` |
| `etalii.adp/specifications/fbl/fixtures/knowledge-equivalence/yaml/fixture.json` | `c2080f96f5` |
| `etalii.adp/specifications/fbl/fixtures/knowledge-json/cities.json` | `2d1528ef43` |
| `etalii.adp/specifications/fbl/fixtures/knowledge-json/fixture.json` | `ee9db11bde` |
| `etalii.adp/specifications/fbl/fixtures/knowledge-kept/cities.yaml` | `e7e7e4fc8f` |
| `etalii.adp/specifications/fbl/fixtures/knowledge-kept/fixture.json` | `1145ea0a39` |
| `etalii.adp/specifications/fbl/fixtures/knowledge-xml/cities.xml` | `7906f77896` |
| `etalii.adp/specifications/fbl/fixtures/knowledge-xml/fixture.json` | `05105bb112` |
| `etalii.adp/specifications/fbl/fixtures/knowledge-yaml/cities.yaml` | `515ff419c7` |
| `etalii.adp/specifications/fbl/fixtures/knowledge-yaml/fixture.json` | `65480030e8` |
| `fixtures/agent-activity-edits/fixture.json` | `6d0de6e222` |
| `fixtures/agent-activity-edits/one-day.aad` | `55c26a6454` |
| `fixtures/agent-activity-new/fixture.json` | `2f3195ede4` |
| `fixtures/agent-activity-new/new.aad` | `f608337479` |
| `fixtures/agent-activity-read/fixture.json` | `aef8d4346f` |
| `fixtures/agent-activity-read/one-day.aad` | `55c26a6454` |
| `fixtures/causal-loop-rename/fixture.json` | `e5432bbb8b` |
| `fixtures/causal-loop-rename/growth.cld` | `33ff287c75` |
| `fixtures/databricks-job-dependencies/fixture.json` | `063dd91733` |
| `fixtures/databricks-job-dependencies/nightly_ingest.yml` | `96aaf6e9c2` |
| `fixtures/databricks-pipeline-json/fixture.json` | `efc3b84505` |
| `fixtures/databricks-pipeline-json/sales.json` | `a950e0f01d` |
| `fixtures/dependency-graph-empty-flow-sequence/fixture.json` | `9086f07b3e` |
| `fixtures/dependency-graph-empty-flow-sequence/graph.dgr` | `c2215b34e8` |
| `fixtures/insert-empty-json/cards.fbl` | `b9b8ec63b5` |
| `fixtures/insert-empty-json/deck.json` | `b5e64cae34` |
| `fixtures/insert-empty-json/fixture.json` | `9bd070be72` |
| `fixtures/insert-empty-yaml/cards.fbl` | `4e0be28384` |
| `fixtures/insert-empty-yaml/deck.yaml` | `057d922eb9` |
| `fixtures/insert-empty-yaml/fixture.json` | `263bf24a92` |
| `fixtures/mindmap-nodes/fixture.json` | `37e67213a4` |
| `fixtures/mindmap-nodes/plan.mm` | `98c516d805` |
| `fixtures/registration-layout/fixture.json` | `81466fab23` |
| `fixtures/registration-layout/roadmap.adp` | `bc809875dc` |
| `fixtures/structurizr-open-block/fixture.json` | `5832fc893e` |
| `fixtures/structurizr-open-block/shop.dsl` | `d14f504c59` |
| `fixtures/timeline-bom-lf/fixture.json` | `35d270da97` |
| `fixtures/timeline-bom-lf/odd.tml` | `184424a017` |
| `fixtures/timeline-edits/fixture.json` | `43c38341c4` |
| `fixtures/timeline-edits/roadmap.tml` | `c813da3d00` |
| `fixtures/timeline-written-text/fixture.json` | `09cbed4e9d` |
| `fixtures/timeline-written-text/written.tml` | `485e6bb061` |
| `helm-chart.fbl` | `5e74c1674f` |
| `mindmap.fbl` | `d1565cd32a` |
| `registrations/chart.adp` | `8cca31161b` |
| `registrations/growth.adp` | `6beb8dbe73` |
| `registrations/nightly-ingest.adp` | `53b346eae5` |
| `registrations/roadmap.adp` | `92f240d4f4` |
| `registrations/shop-containers.adp` | `aa8e93d70d` |
| `registrations/vocabulary.adp` | `225dfcf659` |
| `structurizr.fbl` | `3776c8e0da` |
| `timeline.fbl` | `9de77c233c` |
| `w3c-turtle.fbl` | `8236022b7b` |
| `work-board.fbl` | `34c9816c66` |

</details>
