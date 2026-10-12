# Contract: the support record

**Feature**: [vscode-disl-fbl-tools.spec.md](../vscode-disl-fbl-tools.spec.md) | **Plan**: [plan.md](../plan.md) | **Research**: [R2](../research.md#r2-the-interpreter-is-taken-from-the-notion-add-ons), [R8](../research.md#r8-plugins), [R13](../research.md#r13-colours), [R14](../research.md#r14-what-is-raised-with-etaliiadp)

What `docs/disl-support.md` in `etalii.adp.ide.vscode` holds, and what keeps it true (FR-003, FR-004, FR-018, SC-006). Its model is `docs/disl-support.md` of `etalii.adp.ide.notion`, which the interpreter came from. A contributor reads it to know whether a definition will work in this host before copying it; a tool engineer reads it to know what this host does with a construct.

## Sections

The document has these sections, with these headings, in this order.

| Heading | Holds |
|---|---|
| `## Versions` | The versions this host reads: DISL, DESL and FBL, each as the highest minor version the interpreter and the library implement. A definition or binding of a newer minor version opens with one finding that says so |
| `## Conformance class and features` | The DISL conformance class the interpreter states, and one row per optional feature it supports: the feature's identifier as DISL names it, and what is built |
| `## What is read of each section` | One row per section of DISL and of DESL: what is read, and what is not read with what happens instead |
| `## Plugins` | One row per plugin carried as code: its id, what it provides, the folder it lives in, the definitions that name it. And what happens for a plugin that is named and not carried |
| `## Code for one tool type` | One row for every place where code specific to one tool type exists outside a plugin, with its reason (FR-003). The section says "None." when there is none |
| `## What this host decides` | Behaviour a definition leaves unstated and this host had to choose, each with the rule followed and where it is built. The rule for a theme mode a definition does not state ([research R13](../research.md#r13-colours)) is its first row |
| `## Differences from each definition` | One subsection per tool type, by display name: every difference between the tool type in this host and its definition, with its reason. A tool type without one says "None." |
| `## Differences raised and not settled here` | One row per issue in `etalii.adp`: its number, linked, and what it is about |

`docs/parity.md` stays the record of differences from the standalone modules, and `docs/fbl.md` of the FBL library; this document links both and repeats neither.

## The features

The list of optional features is the one of `src/core/disl/support.ts`:

```ts
/** The optional features of DISL this interpreter supports. */
export const supportedFeatures: readonly string[];
/** The conformance class this interpreter states. */
export const conformance: 'core' | 'standard' | 'full';
```

A feature is added to `supportedFeatures` by the change that builds it, never before, and to the table with it. The interpreter arrives with the twelve the Notion add-ons list: `axis.yearMonth`, `ruler.adaptive`, `snap.byGesture`, `anchor.part`, `canvas.filters`, `viewpoint.variants`, `placement.bound`, `shape.custom`, `shape.composite`, `edge.bezier`, `label.parse`, `persistence.fbl`.

A definition whose `language.requires` names a feature that is not in the list, or a higher conformance class, opens with one finding for each:

| Finding | Severity | When |
|---|---|---|
| `disl.unsupported-feature` | `warning` | `language.requires.features` names a feature not in `supportedFeatures` |
| `disl.unsupported-conformance` | `warning` | `language.requires.conformance` is a higher class than `conformance` |

## The plugins

The section's rows are those of the plugin registry ([tool-type.md](tool-type.md#plugins)):

| Plugin | Provides | Named by |
|---|---|---|
| `net.etalii.adp.freeplane.mm` | persistence | Mind map |
| `net.etalii.adp.freeplane.mindmapLayout` | layout | Mind map |
| `net.etalii.adp.ide.projectLinkPicker` | action | Mind map |
| `net.etalii.adp.etalii.abmMarkdown` | persistence | Agent Behavior Modelling |
| `net.etalii.adp.etalii.abmArrange` | action | Agent Behavior Modelling |

## What keeps it true

| Rule | Held by |
|---|---|
| Every entry of `supportedFeatures` is a row of the features table, and every row an entry | a test that reads both |
| Every plugin in the registry is a row of the plugins table, and every row a plugin | a test that reads both |
| Every tool type under `definitions/` has its subsection under "Differences from each definition" | a test that reads both |
| A change that builds a feature, carries a plugin or meets a difference changes this document in the same pull request | review; each of the six pull requests of the plan names what it added here |
| A difference between a definition and its standalone module, or a construct DISL, DESL or FBL could not state, is an issue in `etalii.adp` before the pull request that meets it is merged, and a row of the last section (FR-018, SC-006) | review, and the closing pull request, which checks the seven of [research R14](../research.md#r14-what-is-raised-with-etaliiadp) against the section |

## The tool list

`docs/tools.md` lists each tool type the plug-in offers with its kind, its display name and its origin (FR-017):

| Origin | Tool | Kind |
|---|---|---|
| `gartner/hypecycle-graph` | Gartner hype cycle graph | Diagram |
| `etalii/agent-behavior-modelling` | Agent Behavior Modelling | Diagram |
| `freeplane/mindmap` | Mind map | Diagram |
| `etalii/agent-activity-diagram` | Agent activity diagram | Diagram |
| `etalii/knowledge` | Knowledge | Designer |

A row's state moves in the pull request that delivers its story.
