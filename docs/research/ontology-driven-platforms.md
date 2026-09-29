# The ontology as the application

How ontology-driven data-fusion platforms work, and the view of software development they share. A survey of some forty platforms from defence, intelligence, policing, open-source investigation and enterprise decision intelligence, organised into a common architecture and seven propositions about how applications are built on them.

## Contents

1. [The common denominator](#the-common-denominator)
2. [One architecture in seven layers](#one-architecture-in-seven-layers)
3. [The model is the program](#the-model-is-the-program)
4. [Actions make the model operational](#actions-make-the-model-operational)
5. [One model, three authoring media](#one-model-three-authoring-media)
6. [Code only at named extension points](#code-only-at-named-extension-points)
7. [Data, model and applications change together](#data-model-and-applications-change-together)
8. [Governance and provenance are properties of the model](#governance-and-provenance-are-properties-of-the-model)
9. [The model grounds the agents](#the-model-grounds-the-agents)
10. [Critiques and limits](#critiques-and-limits)
11. [Implications for ADP](#implications-for-adp)

## The common denominator

The platforms examined here are marketed under different names: data fusion, intelligence analysis, decision intelligence, digital twin, operating system for data, semantic layer. What groups them is not a market segment but a design decision. Each places a typed model of the world at its centre (object types, link types and their properties, increasingly also the actions allowed on them), binds heterogeneous sources to that model, and derives everything else from it: the analyst's views, the operational applications, the programming interfaces, the access rules and the grounding of AI agents. This study calls the category **ontology-driven data-fusion platforms**, or ontology-driven platforms for short. "Ontology" is used in the vendors' sense of a typed, executable domain model, not in the stricter sense of description logic.

The surveyed platforms fall into five groups.

- **Defence and command and control.** Palantir Gotham, Foundry, AIP and the Maven Smart System; Anduril Lattice; Helsing Altra; Scale AI Donovan; Vannevar Labs; Primer; Systematic SitaWare; Airbus Fortion; Artemis.IA of the French armed forces. Their world model is a common operational picture of entities that expire, move and can be tasked.
  [Palantir Ontology overview](https://www.palantir.com/docs/foundry/ontology/overview) · [Anduril developer reference](https://developer.anduril.com/reference/overview/overview) · [Helsing Altra](https://helsing.ai/altra) · [CSIS on Maven Smart System](https://www.csis.org/analysis/what-maven-smart-system-and-what-does-it-do) · [Airbus Fortion](https://www.defence-solutions.airbus.com/en/solutions/intelligence/fortion-massive-intelligence)
- **European sovereign platforms.** ChapsVision ArgonOS, assembled from some thirty acquisitions (interception, geolocation, translation, text analytics, enterprise search), chosen by the French DGSI in 2026 and by the German BfV as a replacement for Palantir; DataWalk; Cognyte NEXYTE; Yoonite. Their shared argument is sovereignty: air-gapped deployment and a vendor under European jurisdiction.
  [ChapsVision ArgonOS](https://www.chapsvision.com/en-us/platform/argonos/) · [The Next Web on the DGSI](https://thenextweb.com/news/frances-intelligence-service-is-dropping-palantir-for-a-homegrown-rival) · [heise on the BfV](https://www.heise.de/en/news/Digital-Sovereignty-BfV-Buys-European-Palantir-Alternative-11293717.html) · [heise on European alternatives](https://www.heise.de/en/background/Palantir-under-pressure-European-alternatives-come-into-focus-10646928.html)
- **Investigation and open-source intelligence.** i2 Analyst's Notebook and iBase, Maltego, Siren, Linkurious, Cellebrite Pathfinder, Voyager Labs, Babel Street, Dataminr, Recorded Future, Blackdot Videris, ShadowDragon, Penlink, Semantic Visions. Their world model is the entity-link-property chart that link analysis has used since the 1990s, now fed by device extractions, the open and dark web and location data.
  [i2 on link analysis](https://i2group.com/articles/what-is-link-analysis-and-link-visualization) · [Maltego transforms SDK](https://github.com/MaltegoTech/maltego-transforms) · [Siren data model](https://docs.siren.io/siren-platform-user-guide/14.5/siren-investigate/data-model.html) · [Cellebrite Pathfinder](https://cellebrite.com/en/products/pathfinder/)
- **Enterprise decision intelligence.** Quantexa, C3 AI, SAS Visual Investigator, NICE Actimize, Hawk AI, o9, Kinaxis, Dataiku, Splunk and Elastic security analytics. Their world model is a customer, counterparty, asset or identity, resolved from many records and scored in context.
  [Quantexa entity resolution](https://www.quantexa.com/platform/entity-resolution-software/) · [C3 AI Type System](https://c3.ai/what-is-enterprise-ai/it-for-enterprise-ai/c3-ai-type-system/) · [SAS Visual Investigator](https://www.sas.com/en_us/software/intelligence-analytics-visual-investigator.html) · [Splunk risk-based alerting](https://help.splunk.com/en/splunk-enterprise-security-7/risk-based-alerting/7.3/introduction/how-risk-based-alerting-works-in-splunk-enterprise-security)
- **Semantic layers and graph engines.** Microsoft Fabric IQ ontology, Snowflake semantic views, Databricks metric views, dbt MetricFlow, Cube, AtScale SML, SAP's knowledge graph, Neo4j, Stardog, TigerGraph and Senzing. These are the building blocks, and the direction of travel: the large data platforms are adding the same typed model to the warehouse itself.
  [Fabric IQ ontology](https://learn.microsoft.com/en-us/fabric/iq/ontology/overview) · [Snowflake CREATE SEMANTIC VIEW](https://docs.snowflake.com/en/sql-reference/sql/create-semantic-view) · [dbt semantic models](https://docs.getdbt.com/docs/build/semantic-models) · [Senzing](https://senzing.com/how-entity-resolution-works-with-senzing/)

## One architecture in seven layers

Across all five groups the same layers recur, whatever the vendor calls them.

1. **Connect.** Hundreds of connectors (ArgonOS claims 200 to 300, Siren more than 200), batch, streaming and change-data-capture ingestion, and virtual tables that leave data where it lives. Agents run inside the customer's network. Data is typed "at the point of entry".
2. **Model.** A declared schema of object types, link types and properties, bound to the ingested datasets. Palantir calls it the Ontology, C3 the Type System, Anduril the entity model, i2 the iBase schema, Siren the data model, Microsoft the ontology item.
3. **Resolve.** Entity resolution merges many records or detections into one real-world entity, with explainable match reasons. Senzing's "principle-based" matching, Quantexa's incremental matching and Babel Street's cross-lingual name matching are variations of the classic pipeline of blocking, comparison, classification and clustering.
4. **Explore.** A fixed set of analyst views over the model: the link chart or graph, the map or common operational picture, the timeline and histogram, the object table and the object profile, and dashboards. The trio of graph, map and timeline appears in nearly every product.
5. **Act.** Actions, tasks and rules write back to the model and to operational systems, from editing a case to tasking a sensor. Alerts are saved queries that feed a case queue.
6. **Govern.** Classification markings, role-, attribute- and purpose-based access control, and audit logs of every interaction, enforced on the model's objects rather than on files.
7. **Augment.** Language models and agents that query and propose changes through the model, with human review.

What varies between vendors is the domain vocabulary, the deployment context and the degree of openness, not the layers. A police deployment such as Hessendata links police databases, phone extractions and cell-tower data; a bank's deployment of Quantexa links accounts, companies and transactions; the architecture is the same.

[Palantir Data Connection](https://www.palantir.com/docs/foundry/data-connection/core-concepts) · [Senzing principle-based matching](https://senzing.com/principle-based-matching/) · [Survey of entity resolution](https://arxiv.org/pdf/1905.06167) · [police-it.net on Hessendata](https://police-it.net/hessendata-polizeidatenbanken-soziale-medien) · [Quantexa graph analytics](https://www.quantexa.com/platform/graph-analytics/)

*Proposition 1*

## The model is the program

On these platforms, building an application starts with declaring a typed domain model, and the platform derives storage, joins, interfaces and generic views from it. Hand-written code shrinks to what the model cannot express.

- **Palantir Foundry.** Object types are declared in Ontology Manager with typed properties, a primary key and backing datasets; link types connect them. Object Explorer, maps, graphs and the application builders all read the same types, so a new object type is immediately searchable, chartable and mappable.
  [Create an object type](https://www.palantir.com/docs/foundry/object-link-types/create-object-type) · [Create a link type](https://www.palantir.com/docs/foundry/object-link-types/create-link-type) · [Object Explorer](https://www.palantir.com/docs/foundry/object-explorer/explore-charts)
- **C3 AI.** A Type is declared in a `.c3typ` file: `entity` makes it persistable, `extends` and `mixes` compose it, and fields become columns. Method bodies live in separate JavaScript or Python files. The company describes its approach as model-driven architecture: platform-independent models translated into platform-specific implementations.
  [C3 AI type keywords](https://docs.c3.ai/docs/platform/8.10/topic/type-keywords) · [C3 AI on model-driven architecture](https://c3.ai/glossary/artificial-intelligence/model-driven-architecture/) · [NCSA guide to C3 Types](https://wiki.ncsa.illinois.edu/display/C3aiDTI/DTI+Guide:+C3+Types)
- **Siren and i2.** In Siren an entity table points at indices and relations are declared on a tab; the graph browser draws exactly those relations. In iBase Designer a builder defines entity and link types with fields, and "semantic types" map them onto Analyst's Notebook charts.
  [Siren entity tables](https://docs.siren.io/siren-platform-user-guide/15.2/siren-investigate/c_entity-tables-eids.html) · [iBase: designing a database](https://docs.i2group.com/ibase/10.1.0/designing_a_database.html) · [iBase semantic types](https://docs.i2group.com/ibase/10.0.0/setting_up_semantic_types.html)
- **Semantic layers.** dbt semantic models declare entities, measures and dimensions in YAML, and MetricFlow builds "the semantic graph with models as nodes and entities as edges" to write the joins itself. Snowflake declares tables, relationships, facts, dimensions and metrics in one `CREATE SEMANTIC VIEW` statement.
  [About MetricFlow](https://docs.getdbt.com/docs/build/about-metricflow) · [Snowflake semantic views](https://docs.snowflake.com/en/sql-reference/sql/create-semantic-view)

This is model-driven engineering and low-code development returning under a new name. The literature has described low-code platforms as applying the principles of model-driven engineering (abstraction, metamodelling, automation), and has named their weakness: the generation step is fixed and proprietary, which hinders interoperability.

[Low-code and model-driven engineering, two sides of the same coin](https://link.springer.com/article/10.1007/s10270-021-00970-2)

> **ADP angle.** ADP makes the same move one level up. A tool type is specified in DISL and interpreted by a core plug-in in each IDE, with code added only where the specification cannot cover something. The platforms show that the move works at scale, and that its value depends on the specification being open.

*Proposition 2*

## Actions make the model operational

The model describes not only what exists but what may be done. Palantir divides its ontology into a semantic part (objects, properties, links) and a kinetic part (actions, functions, dynamic security). This turns an analytic model into an operational one: the same object that is analysed is also edited, approved and acted upon.

- **Palantir action types.** An action type is "a set of changes or edits to objects, property values, and links that a user can take at once". It is built from declarative rules (create, modify, delete), typed parameters and submission criteria, and may trigger side effects. Edits are merged into a write-back dataset, so the platform is read-write.
  [Action types overview](https://www.palantir.com/docs/foundry/action-types/overview) · [Action type rules](https://www.palantir.com/docs/foundry/action-types/rules) · [Object backend](https://www.palantir.com/docs/foundry/object-backend/overview)
- **Anduril Lattice.** Three interfaces: Entities model "anything in the world that is of significance to an operator", Tasks send commands to agents, Objects store binary data. Entities carry provenance and an expiry time. Tasking is the write-back path, and it ends at a physical effector.
  [Lattice overview](https://developer.anduril.com/reference/overview/overview) · [Entities guide](https://developer.anduril.com/guides/entities/overview)
- **Fabric IQ and enterprise suites.** Rules and constraints in Microsoft's ontology "trigger actions, alerts, workflows, and updates". SAS Visual Investigator and NICE Actimize route alerts into cases with queues, tasks and audit trails. Reverse ETL is the same idea for the data warehouse: "closing the loop between analytics and execution".
  [Acuvate on Fabric IQ](https://acuvate.com/blog/microsoft-fabric-iq-ontology-enterprise-ai/) · [SAS Visual Investigator features](https://www.sas.com/en_ae/software/intelligence-analytics-visual-investigator/features-list.html) · [Fivetran on reverse ETL](https://www.fivetran.com/blog/what-is-reverse-etl)

> **ADP angle.** A diagram type can declare, next to its element and relation types, the operations a person may perform on them and the conditions under which they are allowed. A decision, a review or an assessment then becomes something the tool enforces, not only draws.

*Proposition 3*

## One model, three authoring media

Builders work on the same model through three media: graphs, forms and text. Each platform offers at least two, and the better ones keep them in sync.

| Platform | Graph | Form | Text |
|---|---|---|---|
| Palantir Foundry | Pipeline Builder, lineage, Vertex | Ontology Manager, Workshop, AIP Logic | Code Repositories, Functions, OSDK applications |
| C3 AI | | | `.c3typ` types, method files |
| i2 | Analyst's Notebook charts | iBase Designer, Schema Designer | connector services in TypeScript |
| Maltego | the investigation graph | Entity Management | transforms in Python |
| Quantexa | networks | parameterised scoring | `.qentity` and `.qmodel` files, Graph Scripting DSL |
| Cube | | Visual Modeler | YAML, JavaScript or Python |
| Fabric IQ | relationship canvas | entity and binding forms | |

Palantir documents the choice between its visual Pipeline Builder and its code-first Code Repositories as a trade-off, not a hierarchy. Cube states that its visual modeller and its YAML files "stay in sync", and gives a new reason for keeping a text form: language-model agents "can read, propose, and edit the model through normal git workflows". The analysts' own output (link charts, timelines, maps) is a fourth medium, and it is a diagram too.

[Pipeline Builder and Code Repositories](https://www.palantir.com/docs/foundry/building-pipelines/considerations-pb-cr) · [Workshop widgets](https://www.palantir.com/docs/foundry/workshop/concepts-widgets) · [Cube data modeling](https://cube.dev/product/data-modeling) · [Quantexa community on scoring](https://community.quantexa.com/discussions/getting-started/scoring-concepts-network-generation--design/33708)

> **ADP angle.** This is ADP's split into diagrams, designers and editors, observed in the wild. A tool type that offers a diagram and an editor over one definition, kept in sync, matches what the most mature platforms converge on.

*Proposition 4*

## Code only at named extension points

Where code is still written, it is written against interfaces generated from the model and plugged in at points the platform names. The platforms separate a large declared part from a small coded part.

- **Palantir OSDK.** Developer Console generates TypeScript, Python and Java clients, or an OpenAPI specification, containing only the object types, action types and functions a builder selects, with a token scoped to exactly those. Functions in TypeScript or Python express validation, derived values and side effects.
  [Ontology SDK overview](https://www.palantir.com/docs/foundry/ontology-sdk/overview) · [osdk-ts](https://github.com/palantir/osdk-ts)
- **i2 Connect.** The builder designs a schema in Schema Designer, declares services and their parameters, creates forms for user input, defines seeds (the chart items a service starts from), and only then writes the data fetching in TypeScript.
  [analyze-connect-node-sdk](https://github.com/i2group/analyze-connect-node-sdk) · [i2 connector schema](https://i2group.github.io/analyze-connect/content/schemas/connector-schema.html)
- **Maltego.** A transform is a Python function registered with a decorator whose type hints declare its input and output entity types, for example a DNS name to an IPv4 address. Entity types, transforms and server settings travel as `.mtz` configuration bundles.
  [maltego-transforms](https://github.com/MaltegoTech/maltego-transforms) · [MISP-maltego](https://github.com/MISP/MISP-maltego)
- **No-code claims.** Cognyte's "Dynamic Data Modeling" lets users "add new sources and define suitable data models… without coding"; DataWalk's Universe Viewer is one interface for modelling and visual querying; ArgonOS offers connectors as "low-code or pro-code".
  [Cognyte NEXYTE data fusion](https://www.cognyte.com/nexyte/data-fusion/) · [DataWalk querying](https://datawalk.com/product/querying/) · [ChapsVision ArgonOS](https://www.chapsvision.com/platform/argonos/)

> **ADP angle.** A DISL specification can name its extension points in the same way: a typed hook with declared inputs and outputs, which an IDE plug-in implements. Generating the hook's signature from the specification keeps the coded part small and checkable.

*Proposition 5*

## Data, model and applications change together

Version control extends past source code to the data, the model and the applications, and releases are packages of all of them.

- **Branching.** Foundry branching covers transforms, functions, Pipeline Builder, the ontology and Workshop applications, and Palantir recommends "the same branch name across all repositories within the product".
  [Foundry branching](https://www.palantir.com/docs/foundry/foundry-branching/supported-functionality) · [Branching release process](https://www.palantir.com/docs/foundry/building-pipelines/branching-release-process)
- **Packaging.** Foundry DevOps and Marketplace package "data-backed workflows" (ontology types, applications, functions, models, pipelines) as products that other environments install. Maltego's `.mtz` bundles and i2's import specifications are smaller versions of the same idea.
  [Foundry DevOps](https://www.palantir.com/docs/foundry/foundry-devops/overview) · [Marketplace ontology types](https://www.palantir.com/docs/foundry/object-link-types/marketplace-ontology-types)
- **Delivery.** Palantir Apollo delivers into cloud, on-premises, air-gapped and classified networks and edge devices by a pull model: agents in each environment fetch, verify and apply signed, declarative releases according to policy.
  [Palantir blog on Apollo](https://blog.palantir.com/palantir-apollo-powering-saas-where-no-saas-has-gone-before-7be3e565c379)

> **ADP angle.** Keeping specifications and definitions as text files in git, as ADP does, already gives branching and review. What the platforms add is a package that carries a model together with the tools built on it, which is what a DISL specification copied into each IDE plug-in amounts to.

*Proposition 6*

## Governance and provenance are properties of the model

Access, classification and origin are attached to the model's objects and propagate automatically, rather than being configured per application.

- **Propagating markings.** Palantir markings are mandatory access labels that propagate along lineage: a derived dataset inherits the markings of its inputs. Purpose-based access control records not only who may see data but why.
  [Markings](https://www.palantir.com/docs/foundry/security/markings) · [Purpose-based access controls](https://blog.palantir.com/purpose-based-access-controls-at-palantir-f419faa400b3) · [NIST SP 800-162](https://csrc.nist.gov/pubs/sp/800/162/upd2/final)
- **Provenance on every datum.** Lattice entities carry the publishing integration and the source update time; Primer keeps character-level source spans for every extracted entity; Senzing answers "why" and "why not" for every match; Elastic retains the inputs of every risk score.
  [Primer technology](https://primer.ai/technology) · [Senzing on explainable entity resolution](https://senzing.com/why-you-need-explainable-entity-resolution/) · [Elastic entity risk scoring](https://www.elastic.co/docs/solutions/security/advanced-entity-analytics/entity-risk-scoring) · [OpenLineage specification](https://github.com/OpenLineage/OpenLineage/blob/main/spec/OpenLineage.md)
- **Audit.** i2 iBase configures audit levels per database and logs every requested action; Palantir records "all user and administrator interactions".
  [iBase auditing](https://docs.i2group.com/ibase/10.1.2/configuring_auditing.html) · [Palantir audit log categories](https://www.palantir.com/docs/foundry/security/audit-log-categories)

> **ADP angle.** Provenance and confidence belong in the definition language, not in each tool. An element that records where a claim came from, and a relation that records who asserted it, serve technology assessment and human–agent collaboration alike.

*Proposition 7*

## The model grounds the agents

Language models are bound to the governed model instead of to raw data. The model supplies the vocabulary, the permissions and the allowed actions; the agent's output is a proposed change to the model, often staged for human review.

- **Palantir AIP.** AIP Logic builds language-model functions whose outputs can be ontology edits, applied automatically or staged for review; agents built in Agent Studio are published as functions and evaluated before use. Permissions are enforced at the ontology, so the model sees only what the user may see.
  [AIP Logic](https://www.palantir.com/docs/foundry/logic/overview) · [Agents as functions](https://www.palantir.com/docs/foundry/agent-studio/agents-as-functions) · [AIP overview](https://www.palantir.com/docs/foundry/aip/overview)
- **Warehouses and knowledge graphs.** Snowflake Cortex Analyst reads the semantic view, not the tables; Microsoft positions its ontology as the "source of business meaning" for its agents and for MCP clients; SAP's Joule grounds answers in its knowledge graph with SPARQL.
  [Cortex Analyst](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst) · [Fabric IQ agent integration](https://learn.microsoft.com/en-us/fabric/iq/ontology/concepts-agent-integration) · [SAP HANA Cloud knowledge graph](https://developers.sap.com/concepts/sap-hana-cloud-knowledge-graph/)
- **Sovereign platforms.** ChapsVision's Sinequa describes the ontology as "a living, business-owned knowledge graph" that agents traverse to answer questions and take governed actions.
  [Sinequa on ontology and agentic AI](https://www.sinequa.com/resources/blog/the-power-of-ontology-to-unlock-agentic-ai/)

> **ADP angle.** A diagram with a declared type system is a natural contract between a person and an agent: the agent proposes elements and relations of known types, and the person reviews a structured change instead of a transcript.

## Critiques and limits

The same design choices that make these platforms effective attract four lines of criticism.

- **Lock-in.** Once workflows, mappings, security rules and actions are modelled inside a platform, replacing it means rebuilding years of semantic engineering. Foundry's types are not OWL or RDF and cannot be exported as such. Forward-deployed engineers, who build a customer's ontology on site, deepen the dependency.
  [Pangeanic on the ontology moat](https://blog.pangeanic.com/why-palantirs-ontologies-are-its-deepest-and-dangerous-moat) · [Forbes on forward-deployed engineering](https://www.forbes.com/sites/stevebanker/2026/07/10/palantir-and-forward-deployed-engineering-what-should-we-believe/)
- **"It is just data modelling."** One critic maps object type to table, property to column, link to foreign key and action to stored procedure, and argues that the novelty lies in the delivery model rather than the technology.
  [Vonng, "Ontology bullshit"](https://vonng.com/en/db/ontology-bullshit/)
- **Surveillance and opacity.** Fusion compounds errors and hides their origin. Germany's Federal Constitutional Court ruled in February 2023 that the Hesse and Hamburg provisions for automated police data analysis were unconstitutional, allowing data mining with self-learning algorithms only under "extraordinarily restrictive conditions". Several OSINT vendors have faced litigation over fake-account scraping and warrantless location data.
  [BVerfG, 1 BvR 1547/19](https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/EN/2023/02/rs20230216_1bvr154719en.html) · [Brennan Center on AI policing](https://www.brennancenter.org/our-work/research-reports/dangers-unregulated-ai-policing) · [Citizen Lab on Webloc](https://citizenlab.ca/research/analysis-of-penlinks-ad-based-geolocation-surveillance-tech/)
- **Sovereignty.** A semantic layer controlled by a foreign vendor weakens a state's control over its own data, which is the stated reason for the French and German moves to ArgonOS.
  [heise on the BfV](https://www.heise.de/en/news/Digital-Sovereignty-BfV-Buys-European-Palantir-Alternative-11293717.html)

The counter-movement is towards open model formats: the Open Semantic Interchange initiative of Snowflake, dbt Labs, Salesforce and others; AtScale's Apache-licensed SML; Databricks contributing metric views to Apache Spark; and Stardog's reliance on W3C standards.

[Prologika on OSI](https://prologika.com/osi/) · [AtScale SML](https://www.atscale.com/blog/introduction-to-sml-a-standard-semantic-modeling-language/)

> **ADP angle.** ADP's specifications are open, versioned and host-independent. That is precisely the property the critics find missing in proprietary ontologies, and the strongest reason for ADP to keep its definition languages as the primary artefact.

## Implications for ADP

The platforms suggest a family of tools that ADP could specify. Each is listed with its kind and the platform feature it generalises.

| Tool | Kind | Generalises |
|---|---|---|
| Ontology diagram: object types, link types, cardinality, bindings | Diagram | Ontology Manager, iBase Designer, Fabric IQ, Schema Designer |
| Action type designer: parameters, rules, submission criteria, side effects | Designer | Palantir action types, Fabric IQ rules |
| Pipeline and lineage diagram: sources, transforms, datasets, markings | Diagram | Pipeline Builder, Dataiku Flow, OpenLineage |
| Link chart over typed entities, with expansion and provenance | Diagram | Analyst's Notebook, Maltego, Siren graph browser |
| Timeline of events with sources and confidence | Diagram | i2 timelines, Pathfinder |
| Entity profile with resolved records and match reasons | Designer | Senzing why and why-not, Quantexa |
| Application layout: widgets bound to object sets and actions | Designer | Workshop, Slate |
| Alert and scoring rule editor | Editor | Quantexa scoring DSL, Splunk risk rules, Linkurious alerts |
| Semantic model editor, in text, kept in sync with the ontology diagram | Editor | dbt, Cube, AtScale SML, `.c3typ` |
| Access and purpose matrix per type | Designer | markings, purpose-based access |
| Agent proposal review: proposed edits staged against the model | Diagram | AIP Logic staged edits |

The deeper implication concerns ADP itself. These platforms show a mature form of what ADP intends: a declared model interpreted by a runtime, with a graph, a form and a text medium over the same definition, and code only at named extension points. They also show where that form fails, namely when the model is proprietary. ADP's opportunity is to offer the model-first way of building tools with an open specification language, for domains beyond intelligence and finance: technology assessment, human–agent collaboration and the structuring of text.

<small>Method: web searches on 29 September 2026 across five groups of vendors and the underlying concepts (ontology, entity resolution, lineage, access control, model-driven engineering). The research environment could not open most vendor, court and news pages, so almost all descriptions come from search-engine excerpts of the linked pages; three GitHub repositories (maltego-transforms, analyze-connect-node-sdk, MISP-maltego) were read in full. Vendor figures and performance claims are the vendors' own and unverified, and published revenue and staff figures for ChapsVision conflict between sources.</small>
