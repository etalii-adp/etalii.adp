# Idea Intake: One host-agnostic language for a whole tool

- **Slug**: host-agnostic-tool-language
- **Created**: 2026-10-13
- **Source**: pasted text (project chat, 2026-10-12 and 2026-10-13)
- **Type**: exploration

## Idea (as captured)

The idea grew over one conversation. Every message from the maintainer is quoted below in order, verbatim.

The question it grew from, asked the day before (2026-10-12):

> How could the tool specific code be provided in one unified way across all hosts? Would typescript be a good fit there? How would that work technically?

The idea itself (2026-10-13, 21:26):

> No need for action, just a thought experiment:
>
> Again about making all data needed for the diagram/designer/editor host agnostic.
> Couldn't we not make a specific - new - language that is descriptive and describes all aspects of the tool? It could for the 'view' side use all primitives available in DISL/DEDL and EDSL, and accept nothing else, and for the persistence side it could use all primitives available from the FBL.
>
> The language itself would then facilitate all the tool logic, but in a way that can be interpreted in all different hosts.
>
> Do deep and thorough research on this, and provide a lot of details, pros/cons, but also an interpretation on how such a language could best be formulated.

Two additions, sent a minute later:

> addition: aim for the language to be declarative.

> also search online to see if there is not other work on the matters.

The follow-up questions, in the order asked:

> But we cannot run webassembly inside all hosts, can we?

> so in what language would we write the wasm then? and how would we define the methods so that they can be invoked?

> ok, so how would a tool plugin then look like? for example for the mindmap diagram tool?

The last variant of the idea (2026-10-13, 22:10):

> Can't we not completely replace DISL and FBL with one or more .rs files, which then:
>
> * Provide the metadata for the plugin
> * Provide the DID/DED/EDD, but then in declarative rust constructs that can be compiled and validated.
> * Provides the file binding using FBL, but in declarative rust constructs that can be validated.
> * Provides tool specific implementation by extending rust methods/event hooks.
> * One tool would just be a set of .rs files, that then by the host would be compiled into a webassembly binary. i.e. all cargo/crate/toml magique is outside of the view of the tool designer.

And the request that produced this note:

> create a spec kit idea with the details of this conversation.

"DEDL" in the idea is the retired name of what is now DISL and DID ([terminology](../../../docs/terminology.md), *History*). Read in context, "DISL/DEDL and EDSL" names the three specification languages, DISL, DESL and EDSL.

## Restated

A tool type would be described entirely in one host-agnostic form that every host (standalone, IntelliJ, VS Code, Eclipse, Notion) can run without code of its own for that tool. The conversation explored four shapes of that form, each refining the one before:

1. one new declarative language whose view side uses only DISL, DESL and EDSL primitives and whose persistence side uses only FBL primitives;
2. that language, with the logic it cannot express supplied as code compiled to WebAssembly and called the same way by every host;
3. a tool written entirely as Rust files, declarative where possible and with Rust hooks where not, compiled to one WebAssembly binary, replacing DISL and FBL as the files a tool engineer writes;
4. a middle way between 1 and 3: one runtime written once in Rust, declarative tool types, and Rust only for what the declarative part cannot express.

## Origin & Context

- **Raised by**: the maintainer (git user `vrenken`), in a project chat thread on 2026-10-13, building on a question from 2026-10-12.
- **Trigger**: the earlier question of how tool-specific code could be provided once for every host. Its answer (TypeScript plugins against a JSON contract, run in each host's JavaScript engine) left each tool free to carry code, and this idea asks whether a language could make that code unnecessary.

### What it relates to in this repository

Recorded for the later stages, not as a judgement of the idea:

- The specification languages: DISL (`specifications/disl/`, 7,056 lines, with eight layers from metamodel to persistence, CEL, and plugins in §13), DESL (`specifications/desl/`, 688 lines), and EDSL (`specifications/edsl/`, a placeholder). The definition languages: DID and DED (EDD is a placeholder). FBL (`specifications/fbl/`, 940 lines) serves every kind, and its §11 holds the persistence-plugin contract.
- The tool definitions in `definitions/`: one `.dis` or `.des` per tool, plus a companion `.md` holding what the language cannot express. There are 30 diagram types and one designer type.
- DISL §1.4, principle 1: "The common 90 % of diagram types must be expressible without code. The remaining 10 % is reached through named plugins."
- Spec `023-standalone-declarative-diagram-modules`, the earlier pass at making standalone's modules declarative.

## Conversation record

The thread's answers were written as three documents. They are kept beside this note, unchanged, as the record of what was explored:

- [notes/one-declarative-tool-language.md](notes/one-declarative-tool-language.md): the research on shape 1. It covers what the 31 companion files leave to code, prior art found online, pros and cons, and a proposed formulation (one core, one surface per kind, FBL as the only persistence, a capability library, a host contract). It also compares this shape with the TypeScript answer of 2026-10-12.
- [notes/mindmap-capabilities-example.md](notes/mindmap-capabilities-example.md): shape 2 worked through for the mind map. It shows capabilities written in Rust and compiled to WebAssembly, a JSON Schema contract per operation, and the loader each host needs.
- [notes/rust-as-the-tool-language.md](notes/rust-as-the-tool-language.md): shapes 3 and 4, with a sketch of the mind map as `.rs` files, its gains and costs, and the middle way.

Two answers given in the thread are not in those documents and are recorded here:

- **Whether WebAssembly runs in every host** (answered from knowledge of the runtimes, not tested in any repository). It runs natively in the browser, Node and VS Code's webview, so the Notion add-on, VS Code and standalone's client can use it directly. Standalone's .NET backend can run it through Wasmtime for .NET, and IntelliJ and Eclipse through Chicory (pure Java) or GraalWasm. Two limits apply: the Component Model's typed interfaces are not supported everywhere, and TypeScript compiles poorly to WebAssembly.
- **Which language to write it in, and how its methods are invoked**: Rust (or AssemblyScript). Each capability's operations would be defined in a `capability.json` with a JSON Schema for every input and output, with types generated from it for every host language. Each operation would be exported as a function that takes JSON and returns JSON, in the style of Extism. Modules would get no access to files, network, clock or randomness. Shared fixtures would run in every host's CI.

## First-Glance Unknowns

- [NEEDS CLARIFICATION: Which shape is the idea now? The four shapes differ in who may write code (nobody, the platform only, or every tool) and in whether a tool type stays readable as data.]
- [NEEDS CLARIFICATION: Is "declarative" a requirement on what a tool engineer writes, or on the whole system, runtime included? Shape 3 meets the first only by convention.]
- [NEEDS CLARIFICATION: Who are the tool engineers this is for (the maintainer, AI assistants, domain experts who do not program)? The answer decides between JSON and Rust as the authoring form.]
- [NEEDS CLARIFICATION: Do DISL, DESL, EDSL and FBL survive as normative specifications that others may implement, or does a reference implementation become the standard?]
- [NEEDS CLARIFICATION: Must every host render natively (IntelliJ's Swing canvas included), or may a host show a tool in a web view?]
- [NEEDS CLARIFICATION: Is this to replace the current direction (definitions interpreted by each host, with per-host plugins), or to sit beside it for new tools first?]
- [NEEDS CLARIFICATION: Does the stop order of 2026-10-11 still apply to this beyond assessment, that is, should anything past the assessment wait for an explicit go?]
