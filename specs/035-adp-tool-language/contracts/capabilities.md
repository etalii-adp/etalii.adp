# Contract: capabilities

How a capability is specified, and the first catalogue. Research R14; data-model.md §7.

## A capability's files

`specifications/atd/capabilities/<name>/contract.json` (`$defs/Capability`):

```json
{
  "name": "layout.layeredWithBand",
  "version": "1.0.0",
  "extensionPoint": "layout",
  "input": { "$ref": "../../atd.schema.json#/$defs/LayoutInput" },
  "args": {
    "direction": { "type": "enum", "values": ["right", "down", "left", "up"], "default": "down" },
    "band": { "type": "query", "doc": "The elements placed in a separate band." }
  },
  "output": { "$ref": "../../atd.schema.json#/$defs/LayoutResult" },
  "laws": ["deterministic", "pinnedStay"],
  "fallback": "layout.layered",
  "status": "provisional"
}
```

and `fixtures/<case>.json` with `input`, `args` and the expected `output`. A host's implementation passes every fixture before it registers the capability.

## Extension points

| Point | Input | Output | Called from |
|---|---|---|---|
| `layout` | nodes with sizes and pins, edges, the canvas's coordinates | positions in domain units | `layout { algorithm … capability … }` |
| `routing` | edge ends, obstacles | route points | an edge notation's `routing` |
| `reader` | a body's bytes | elements, relations, attributes, findings, splice anchors | a binding's `family capability <name>` (FBL's persistence plugin contract, §11) |
| `analysis` | a model or a part of it | derived elements or relations, findings | a derived element's `from`, a constraint |
| `arrange` | the selection and the model | model changes as actions | an operation |
| `render` | a value (for example a Markdown text, a description-logic expression) | text runs or a drawing | a label, a preview |

## The first catalogue

Taken from the specification's table *Where the logic goes* and from what the 36 tool types' host code does; settled while the descriptions are written (research R18), each entering with its contract and fixtures. The desktop host's implementation is the code that does it today, moved into `adp-atd-runtime`'s registry.

| Capability | Point | For | Code it comes from in the desktop host |
|---|---|---|---|
| `layout.sankey` (relaxation) | layout | Sankey | `modules/diagrams/sankey` |
| `arrange.selfOrganising` | arrange | agent behaviour modelling | `modules/diagrams/agent-behavior-modelling` (the VS Code host's `abm-arrange`) |
| `analysis.msbuildImports` | analysis | .NET dependency graph | `modules/diagrams/dotnet-dependency-graph` |
| `render.descriptionLogic` | render | W3C OWL | `modules/diagrams/rdf` |
| `reader.turtle` | reader | W3C RDF, OWL, SKOS, SHACL, until the grammar family replaces it for RDF (R15) | `modules/diagrams/rdf` |
| `reader.sparql` | reader | SPARQL query | `modules/diagrams/sparql` |
| `analysis.elementaryCycles` | analysis | causal loop diagram, only if the script's budget cannot hold it (R13) | `modules/diagrams/causal-loop-diagram` |
| `layout.mindmap` | layout | mind map | `modules/diagrams/mindmap/src/layout.rs` |
| `layout.tidyTree`, `layout.layered`, `layout.layeredWithBand`, `layout.force`, `layout.rowPacked` | layout | the types whose `.dis` names these algorithms | `crates/adp-layout` |
| the persistence readers of the Databricks, supply chain and Wardley map types (`format: plugin:*` today) | reader | those types | their modules |

Small algorithms (sibling naming, loop claiming, SKOS cycle breaking, C4 relationship elevation, parent-cycle checks) are script functions in the descriptions, not capabilities.
