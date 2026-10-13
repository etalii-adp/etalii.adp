# Rust as the tool language: replacing DISL and FBL with `.rs` files

A follow-up to [one-declarative-tool-language.md](one-declarative-tool-language.md) and [mindmap-capabilities-example.md](mindmap-capabilities-example.md). The question: could a tool be nothing but a set of `.rs` files that declare its metadata, model, definition format and FBL binding in declarative Rust constructs, implement its tool-specific logic as Rust hooks, and are compiled to one WebAssembly binary, with all Cargo plumbing hidden from the tool engineer?

Short answer: **yes, technically, and it removes most of the duplication across hosts.** The price is that the specification stops being data and the language stops being declarative. Both can be largely recovered with one rule: **Rust becomes the authoring language and the runtime, while a JSON description extracted from the same source remains the contract.** This is research only; nothing here is specified or decided.

---

## 1. What the idea changes

| | Today (DISL, FBL as JSON) | Rust as the tool language |
|---|---|---|
| A tool type is | A `.dis` or `.des` file, an `.fbl` file and a companion `.md` | A set of `.rs` files |
| Validated by | JSON Schema plus each host's loader (14.1 steps 1–10) | The Rust compiler and the macros of an `adp` crate |
| Expressions | CEL strings, interpreted in each host | Rust closures, compiled |
| Residue (layouts, parsers, analyses) | Plugins written per host, or nothing | Ordinary Rust in the same files |
| Interpreters per host | DISL, CEL and FBL in C#, Java and TypeScript (about 32k lines of FBL alone) | None: the runtime is one Rust crate, inside every tool's `.wasm` |
| What a host still does | Interpret, render, gestures, files, undo | Load the `.wasm`, render what it describes, map gestures, files, undo |

The largest gain is the last two rows. Every host currently re-implements the same semantics; with this idea there is **one implementation of DISL's and FBL's semantics, in Rust**, compiled into each tool. That is the "one runtime everywhere" pattern the prior art found in every multi-host success, applied to the logic rather than the view.

## 2. What it would look like

### 2.1 The tool engineer's files

```
mindmap/
  tool.rs          ← metadata, model, view, behaviour (declarative macros)
  binding.rs       ← the .mm binding (declarative, plus the reader where it can't be declared)
  layout.rs        ← the two-sided layout (plain Rust)
  naming.rs        ← sibling naming (plain Rust)
  fixtures/        ← example files with expected readings and edits
```

No `Cargo.toml`, no `lib.rs`, no build scripts: a build tool (say `adp build mindmap/`) generates the crate around these files, pins the `adp` crate version, and compiles to `wasm32-unknown-unknown`.

### 2.2 Metadata, model and definition format, declared

```rust
// mindmap/tool.rs
use adp::prelude::*;

tool! {
    origin: "freeplane/mindmap",
    kind: Diagram,
    version: "0.4.0",
    label: "Mind map",
    doc: "Ideas branching from one central topic, for thinking a subject through rather than specifying it.",
    persistence: binding::MM,              // checked at compile time: must be a Binding<Model>
}

#[derive(Element)]
#[doc = "A topic in the map."]
pub struct Node {
    #[attr(label = "Text", required)]       text: String,
    #[attr(label = "Notes", multiline)]     notes: Option<String>,
    #[attr(label = "Link", kind = Link)]    link: Option<String>,
    #[attr(read_only)]                      folded: bool,
    #[attr(host)]                           stored_id: Option<String>,
    #[children(ordered)]                    children: Children<Node>,
}

#[derive(Relation)]
#[derived(from = parent_child::<Node>())]  // drawn as edges, never stored
pub struct Branch;

constraint! {
    id: "centralTopicNamed", for: Node, severity: Warning,
    when: |n, d| d.is_root(n),
    rule: |n, _| !n.text.trim().is_empty(),
    message: "The central topic has no text.",
}
```

The compiler now does what DISL §14.1 does in every host: a misspelt attribute, a constraint on a type that does not exist, a binding for another model or an expression of the wrong type are compile errors, with the IDE's completion and navigation for free.

### 2.3 The FBL binding, declared

```rust
// mindmap/binding.rs
use adp::fbl::*;

pub const MM: Binding<Model> = binding! {
    claims: { extensions: [".mm"] },
    family: Xml,
    // Freeplane nests <node> elements and may hold HTML in <richcontent>,
    // which FBL's declared rules cannot read: this binding brings its own reader.
    reader: Custom(read_mm, plan_mm),
    template: |name| format!("<map version=\"freeplane 1.11.5\">\n<node TEXT=\"{}\" ID=\"ID_{}\"/>\n</map>\n",
                             xml_escape(name), short_id()),
};

fn read_mm(body: &Body) -> Reading<Model> { /* … */ }
fn plan_mm(body: &Body, last: &Reading<Model>, change: &Change) -> Result<Vec<Splice>, Refusal> { /* … */ }
```

For a format FBL can declare (the timeline's YAML, the knowledge designer's three formats), `reader` would be `Declared(rules![ … ])` and no function is written. The splice catalogue, history, drift, registration and routing are the `adp::fbl` crate's, written once.

### 2.4 Behaviour and hooks

```rust
operation! {
    id: "addSibling", label: "Add sibling", for: Node, key: "Enter",
    unavailable: |n, d| d.is_root(n).then_some("The central topic has no siblings."),
    run: |n, d, tx| {
        let names = d.siblings(n).map(|s| s.text.as_str());
        let added = tx.create::<Node>().after(n).text(naming::sibling_name(names));
        tx.edit_label(added, "text");
    },
}

intent! { drop_onto: (Node, Node) => |dragged, target, d, tx| {
    if d.is_root(dragged)               { return tx.refuse("The root node cannot be moved."); }
    if d.is_in_branch(target, dragged)  { return tx.refuse("A node cannot be moved into its own branch."); }
    tx.reparent(dragged, target).last();
}}

layout! { id: "mindmap", trigger: Always, run: layout::two_sided }
```

Note the shape of `run`: it receives a **read-only** view of the diagram and a transaction it can only add commands to (`create`, `reparent`, `refuse`, …). It cannot touch the model directly, the file, the screen or the host. That keeps the property that matters from DISL's behaviour layer (every edit is a command, one transaction, exact undo) even though the body is Rust.

### 2.5 What crosses into the host

The `.wasm` exports a handful of coarse-grained functions, the same for every tool:

| Export | Called when | Returns |
|---|---|---|
| `describe()` | Once, at load | The tool's description as JSON: metadata, types, forms, toolbox, operations, notation, intents (the DISL-shaped contract, section 3) |
| `open(body, registration)` | A file is opened | The model id map, findings |
| `scene(viewport, viewer_state, measured_sizes)` | After every transaction | The drawing: shapes, labels, edges, markers, in domain coordinates, with styles resolved |
| `invoke(intent or operation, args)` | A gesture or command | The splices to apply, or a refusal with its sentence |
| `undo()`, `redo()`, `external_change(body)` | As named | Splices, or a new reading |

The host keeps: rendering the scene with its own toolkit (Swing in IntelliJ, SVG in the web hosts), mapping its gestures to intents, measuring text, applying splices to the file and saving atomically, putting the step on its own undo stack, file dialogs and opening links. That is the same host contract as in the declarative formulation, now very thin.

## 3. The one rule that keeps it honest: the description stays data

If a tool is only a `.wasm`, nothing outside a running host can know what it is. Today the site's catalogue, the documentation generator, the examples validator, the terminology check, the Notion "Tools" database and any AI assistant read `.dis` files directly. All of that would break.

The fix is cheap: **the build also runs `describe()` and writes its output beside the `.wasm`** as `mindmap.tool.json`. That JSON has a published schema, and that schema is, in effect, today's DISL and FBL without the CEL: types, attributes, forms, toolbox, notation, operations, intents, bindings, plus the names of the Rust functions behind hooks and layouts. So:

- **DISL and FBL are not deleted; they change role.** They stop being what the tool engineer writes and become the *contract* every tool publishes and every host and tool reads. Their normative text shrinks to that contract plus the host protocol of section 2.5.
- **Rust is the front-end.** The tool engineer writes Rust; tools read the JSON; hosts load the `.wasm`.

## 4. Gains

| Gain | Why |
|---|---|
| **One implementation of all semantics** | DISL, CEL and FBL semantics live in one Rust crate. The three FBL implementations (about 32k lines) and three DISL interpreters collapse into one. Five hosts can no longer disagree on a splice or a constraint. |
| **The residue disappears** | Layouts, parsers (Turtle, SPARQL, Structurizr), cycle enumeration: just Rust beside the declarations. The companion `.md` files' "what DISL cannot say" sections shrink to host-contract items. |
| **The compiler is the validator** | Types, references, exhaustiveness and expressions are checked at compile time, with IDE support from rust-analyzer. No JSON Schema plus ten-step loader in every host. |
| **Speed** | Compiled closures instead of interpreted CEL; layouts at native speed in the browser, Node and .NET, and acceptable on the JVM with Chicory's ahead-of-time mode. |
| **Hosts become small and generic** | A loader, a renderer for one scene format, gesture mapping, file I/O and undo integration. A new host (Eclipse) is a renderer, not a re-implementation. |
| **Good fit for AI authoring** | Models write Rust well, and the compiler gives them precise, fast feedback. |

## 5. Costs and risks

| Cost | Why | Mitigation |
|---|---|---|
| **It is no longer declarative** | Hooks and closures are general-purpose code. Termination, determinism and least power are no longer guaranteed by the language, which was the explicit aim of the previous round. | Restrict the API (section 2.4: read-only view in, commands out); deny `HashMap` iteration, clocks and randomness with lints; a host-side fuel and memory budget; the description (section 3) keeps the declarative part inspectable. |
| **Tool engineers must write Rust** | Rust's learning curve is steep, especially for domain experts; JSON plus CEL is approachable. | Macros keep the common 90 % looking like data (sections 2.2, 2.3); code appears only where DISL needs plugins today. |
| **Compilation is a build step, not a host step** | The Notion add-on is a web page and cannot run `rustc`; IntelliJ, VS Code and Eclipse would have to ship or download a Rust toolchain (several hundred MB) to compile on a user's machine. | Compile in etalii.adp's CI and ship the `.wasm` plus its JSON, exactly as definitions are copied into each host today (nothing compiled or downloaded at run time). The "Cargo magic out of view" still holds: the tool engineer runs one command, or none, and CI does the rest. |
| **No live editing of a tool type** | VS Code loads `.dis` folders and the standalone host reads bundled definitions at run time; a JSON edit shows at once. A Rust edit needs a rebuild (seconds to a minute). | Acceptable for tool engineers; a watch mode in the build tool. |
| **The specification becomes an implementation** | A JSON language with a prose specification can be implemented by anyone, in any language. A Rust crate *is* one implementation; its behaviour is the standard. | Keep the contract of section 3 and the host protocol normative and specified in etalii.adp; the crate is the reference implementation, tested by the same fixtures. |
| **The wasm boundary sits on the rendering path** | Labels, styles and visibility are now computed inside the `.wasm`; calling across the boundary per element per frame would be slow. | Coarse-grained calls: one `scene()` per transaction returns the whole drawing; the host only renders and animates. |
| **Debugging spans two worlds** | A wrong drawing in IntelliJ may be a Rust bug or a renderer bug. | The scene is plain JSON: snapshot it in fixtures, so every host's renderer is tested against the same scene and every tool's logic against the same scene output. |
| **Binary size per tool** | Each `.wasm` contains the `adp` runtime crate; perhaps 1–3 MB per tool, times 30 tools. | Either accept it, or ship the runtime once and tools as small modules linked at load time (more complex). |
| **A big migration** | 31 definitions, four hosts' interpreters, the site's refresh procedures and the Notion add-on's `words.test.ts` rule all change. | Section 7: the JSON description lets the old and new co-exist. |
| **Toolchain dependency** | The project takes on Rust, `wasm32` targets, macro maintenance and the `adp` crate's API stability. | One owner; semantic versioning of the crate; the JSON contract buffers hosts from crate changes. |

## 6. Compared with the declarative formulation

| | Declarative language plus capability library | Rust as the tool language |
|---|---|---|
| What a tool engineer writes | JSON (or YAML) only | Rust, mostly macros, some functions |
| Where algorithms live | A shared, reviewed library of capabilities | In each tool, freely |
| Interpreters per host | One per host (or one shared logic core) | None; one runtime crate inside every `.wasm` |
| Declarativeness | Guaranteed by the language | By convention and API design |
| Safety | No tool code at all | Sandboxed tool code, with a budget |
| Analysable without running | Fully | Through the extracted JSON description |
| New host cost | An interpreter for the core and surfaces | A renderer for one scene format |
| Risk | The language grows without limit (complexity clock) | Tools grow into ad-hoc applications (inner-platform, in reverse) |

They are two points on one line. The declarative formulation keeps code *out of tools* and pays with interpreters in every host. The Rust formulation keeps code *out of hosts* and pays with code in every tool. Which is better depends on where ADP expects more growth: if more hosts than tools, Rust wins; if many tool engineers who are not programmers, the declarative language wins.

## 7. A middle path

The two can be combined so that the 90 % stays declarative and only the residue is Rust:

1. Tool types stay declarative (the JSON description of section 3, written by hand or generated).
2. The **runtime** is written once in Rust and compiled to WebAssembly: DISL, CEL and FBL semantics, producing scenes and splices. This alone removes the per-host interpreters.
3. Where a tool needs code, it adds `.rs` files, compiled into its own `.wasm` beside the runtime, under the restricted hook API.
4. Hosts implement only the host protocol of section 2.5.

Steps 2 and 4 are useful even if step 3 is never taken: they turn five interpreters into one, which is the largest cost in today's design.

## 8. Verdict for the thought experiment

The idea works and solves the multi-host problem more thoroughly than either earlier answer, because it moves *all* semantics into one implementation. Its real cost is that it reverses the direction the languages were built in (declarative, interpretable, implementable by others), and that tool engineers must write Rust. Keeping the extracted JSON description normative preserves most of what the declarative languages are for. The middle path (one Rust runtime, declarative tools, Rust only for the residue) captures most of the gain with least loss.
