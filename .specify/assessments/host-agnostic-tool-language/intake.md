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

On 2026-10-14 the maintainer chose shape 3 (see *Clarifications*). The other three are kept here as the record of how the idea got there.

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

## Clarifications

Answers the maintainer gave to first-glance unknowns, in their own words.

- **Who are the tool engineers this is for (the maintainer, AI assistants, domain experts who do not program)?** (answered 2026-10-14)

  > My guess is that if we can create sufficient gravity towards the ADP concept, we will be able to create an ecosystem with both producers and consumers of diagram/designer/editor tools. In that case it would become a community effort for people to design, maintain and improve tools. Those people would probably be enthusiasts that also experience ADP related issues themselves and are technically skilled enough to translate their pain into a ADP definition that relieves it.

  So the tool engineers meant are, in the end, a community and not the maintainer alone: enthusiasts who meet the problems ADP addresses in their own work and are technically skilled enough to write a tool type that solves them. Tool engineers would then be both producers and consumers of tool types. The maintainer gives this as a guess, and as one that holds only if ADP gains enough following for such an ecosystem to form; the answer does not say who the tool engineers are until then. It names none of the three groups the question offered, and it does not itself choose between JSON and Rust as the authoring form: how much programming "technically skilled enough" asks of a tool engineer is left open. An ecosystem of producers and consumers is also what the follow-on idea [tool-marketplace](../tool-marketplace/intake.md) assumes.

- **Is "declarative" a requirement on what a tool engineer writes, or on the whole system, runtime included? Shape 3 meets the first only by convention.** (answered 2026-10-14)

  > No, declarative was a thought from before. Now we are at that a tool can be written in rust in an as high as possible level of abstraction. i.e. a tool should be very low in code and logic.

  So "declarative" is no longer a requirement, neither on what a tool engineer writes nor on the system as a whole: it belonged to an earlier stage of the idea, the addition of 2026-10-13 ("aim for the language to be declarative") included. What replaces it is a goal on the tool rather than on the language: a tool is written in Rust, at the highest level of abstraction that can be reached, so that a tool carries as little code and logic of its own as possible. The answer puts Rust as the authoring form, which leaves out shape 1 (a language with no code in it) and points to shapes 3 and 4. It does not say which of those two, nor how "as high as possible" and "very low in code" are to be measured or who provides the abstraction a tool is written against. Shape 1 and its research in [notes/one-declarative-tool-language.md](notes/one-declarative-tool-language.md) stay in this note as the record of where the idea started.

- **Do DISL, DESL, EDSL and FBL survive as normative specifications that others may implement, or does a reference implementation become the standard?** (answered 2026-10-14)

  > It is my hunch that the capabilities as provided by DISL, DESL, EDSL and FBL become available as part of a rust library in the form of types, methods, properties and events. In a tool implementation the rust initialization will most probably setup everything needed for the visualization interactions as well as for how the information needs to be stored. The way to get there could be to find a way to generate rust code from the current definitions, that then proxies from inside the WASM rust execution to host-specific logic.

  So, as a hunch, what DISL, DESL, EDSL and FBL can express would become a Rust library: its types, methods, properties and events would carry the capabilities the four languages now carry as specifications. A tool would set itself up in its Rust initialization, both for how it is shown and interacted with and for how its information is stored. The way there the maintainer suggests is to generate Rust code from the current definitions, and that generated code, running inside WebAssembly, would call out to logic each host provides. The answer leans toward a library becoming what a tool is written against, rather than the four languages remaining the documents a tool engineer reads, but it does not say outright whether the specifications are kept as normative text beside that library, retired, or turned into the library's documentation, nor whether anyone other than this project is expected to implement them. It also does not say whether "the current definitions" means the files in `definitions/` or the specification languages themselves, nor whether code generation is a one-time migration or a lasting step a tool engineer's files pass through. The "host-specific logic" it names is the host contract that the conversation record's answers on WebAssembly already assume.

- **Must every host render natively (IntelliJ's Swing canvas included), or may a host show a tool in a web view?** (answered 2026-10-14)

  > Native rendering is preferred. But if complexity becomes a problem a web view can be considered. However this needs to be evaluated on a per case basis.

  So native rendering is the default: a host draws a tool with its own toolkit, IntelliJ's Swing canvas included. A web view is not ruled out, but it is an exception, to be considered only where native rendering becomes too complex, and only after weighing that case on its own. The answer does not say what counts as "too complex", who decides, or whether a case is one tool in one host, one tool in every host, or one host for every tool; so it also leaves open whether a host may show some tools natively and others in a web view at the same time.

- **Does the stop order of 2026-10-11 still apply to this beyond assessment, that is, should anything past the assessment wait for an explicit go?** (answered 2026-10-14)

  > Yes, this implementation is too disruptive that it needs to be planned accordingly.

  So the stop order still applies: nothing past the assessment, a feature spec and its plan included, starts without an explicit go from the maintainer. The reason given is the size of the change: it would disrupt the current work enough that it has to be planned deliberately rather than taken up as it comes. The answer does not say what an explicit go would follow from (the assessment's decision stage, other work finishing first, or something else), nor what "planned accordingly" asks for beyond holding it until then, such as phasing it or sequencing it against the specs now in progress.

- **Is this to replace the current direction (tool types interpreted by each host, with per-host plugins), or to sit beside it for new tools first?** (answered 2026-10-14)

  > Yes, the moment that we have this stable and functional it will replace the current definitions methodology completely. Reason is that such rust based tool definitions can also be shared, which will have a very strong effect on the impact of the ADP tools.

  So it replaces the current direction rather than sitting beside it: once the new form is stable and functional, it takes the place of today's way of writing tool types (specification files interpreted by each host's runtime, with per-host plugins for what they cannot express) completely, and the two are not meant to be kept side by side for good. The answer ties the switch to that point, which leaves the current direction in use until it is reached. The reason given is sharing: tool types written in Rust can be shared, and the maintainer expects that to strengthen the impact of the ADP tools a great deal, the same producer-and-consumer ecosystem the answer on tool engineers and the follow-on idea [tool-marketplace](../tool-marketplace/intake.md) describe. The answer does not say what "stable and functional" means or who judges that it has been reached; whether new tool types may already be written in the new form before then; whether "completely" means the 31 tool types in `definitions/` are carried over (the answer on the specifications suggests generating Rust from the current definitions) or dropped; or what sharing a tool type written in Rust allows that sharing today's specification files, which are already files, does not.

- **Which shape is the idea now? The four shapes differ in who may write code (nobody, the platform only, or every tool) and in whether a tool type stays readable as data.** (answered 2026-10-14)

  > The final shape will be 3, full tool definition provided by a few rust code files. Even the meta-information will be provided using rust based mechanisms, where type safety and consistency will be vital aspects.

  So the idea is now shape 3: a tool type is defined in full by a few Rust files, compiled to one WebAssembly binary, and those files take the place of the `.dis`, `.des` and `.fbl` files a tool engineer writes today. "In full" covers the tool's metadata too, the first of the five points in the variant of 2026-10-13, 22:10: what a tool is called and how it is registered is also written in Rust, not in a separate manifest or data file. Type safety and consistency are given as vital, which makes the compiler the first check a tool type passes, where today that check is a JSON Schema and `validate-examples.py`. Of the two things the question set the shapes apart by, the answer settles the first: every tool may carry code. It does not settle the second outright, but a tool type defined in Rust code, metadata included, is not readable as data in the way a `.dis` file is, unless something reads it back out of the Rust or the binary. Shape 3 does not exclude the earlier hunch that the four specification languages become a Rust library: the library would be what a tool's few files are written against, and the abstraction "as high as possible" asks for. The answer does not say how few "a few" files are, or whether their number and roles (metadata, view, persistence, logic) are fixed for every tool type; what "consistency" is between (a tool's own files, a tool and the library, or a tool's behaviour across hosts); whether the type checks a tool type passes are the Rust compiler's alone or also checks the library adds; nor whether the runtime written once, shape 4's other half, is part of that library or left out.

## First-Glance Unknowns

None remain open: every unknown raised at intake has an answer under *Clarifications*. What those answers leave open is noted with each of them, for the later stages to take up.
