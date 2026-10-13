# The mind map as capabilities: a worked example

A companion to [one-declarative-tool-language.md](one-declarative-tool-language.md). It answers one question: how would the mind map tool's code look if it were written once, in Rust, compiled to WebAssembly and called by every host? This is a sketch only; nothing in it exists.

## 1. What the mind map needs code for today

These come from `definitions/diagrams/mindmap.dis` and `mindmap.md` in etalii.adp.

| Today | Where | Lines per host | In the formulation |
|---|---|---|---|
| `net.etalii.adp.freeplane.mm`: reads Freeplane `.mm` XML and plans edits as byte-preserving splices | Standalone C#, VS Code `src/core/plugins/freeplane-mm/` (reader 337 lines, planner 265), IntelliJ Java `freemind/` | about 600 in TypeScript | Capability `format.freeplane-mm` (persistence) |
| `net.etalii.adp.freeplane.mindmapLayout`: the two-sided tree layout, `mindmap.md` §4 | Standalone C# `MindmapLayout.Compute`, VS Code `mindmap-layout/` (138) | about 140 | Capability `layout.two-sided-tree` |
| Sibling naming, `mindmap.md` §7.2, stubbed in the `.dis` as `siblingName` returning `'Node'` | Standalone C# `SiblingNaming.cs` only | – | Capability `text.sibling-name` (a CEL function) |
| `net.etalii.adp.ide.projectLinkPicker`: choose a project file for a link | Host UI | – | **Not a capability.** It is a host service (`pickFile`) in the host contract, because it shows a host dialog. |

**The rule this table shows:** a capability is pure computation (data in, data out). Anything that shows UI or touches files is a host service, and stays out of WebAssembly.

The two-sided layout is also a candidate to become a *standard* DISL algorithm with parameters (a `tidyTree` with `sides`), which would remove it from WebAssembly altogether. It is kept here because it is the smallest complete example.

## 2. Where the code would live

In etalii.adp, beside the specifications, one folder per capability:

```
capabilities/
  layout.two-sided-tree/
    capability.json          ← the contract: operations and their JSON Schemas
    src/lib.rs               ← the implementation, Rust
    Cargo.toml
    fixtures/
      three-levels.input.json
      three-levels.expected.json
      folded-branch.input.json
      folded-branch.expected.json
  format.freeplane-mm/
    capability.json
    src/lib.rs  src/reader.rs  src/planner.rs
    fixtures/                ← real Freeplane and FreeMind files, with expected readings and splices
  text.sibling-name/
    capability.json
    src/lib.rs
    fixtures/
```

CI builds each into one `<name>.wasm`, records its SHA-256, and runs its fixtures. Hosts copy the `.wasm` in with a provenance record, the way definitions are copied today; nothing is downloaded at run time.

## 3. The contract: `capability.json`

```json
{
  "capability": "layout.two-sided-tree",
  "version": "1.0.0",
  "abi": "adp-json/1",
  "extensionPoint": "layout",
  "doc": "The conventional mind map: the central topic at the origin, first-level branches split right and left, each subtree a column centred on its parent. Collapsed branches take no space.",
  "operations": {
    "place": {
      "input":  { "$ref": "#/$defs/LayoutInput" },
      "output": { "$ref": "#/$defs/LayoutResult" },
      "doc": "Positions for every visible node."
    }
  },
  "args": {
    "horizontalGap": { "type": "number", "default": 50 },
    "verticalGap":   { "type": "number", "default": 8 },
    "sideAttribute": { "type": "string", "default": "position",
                       "doc": "The attribute whose value 'left' or 'right' pins a first-level branch to a side." }
  },
  "laws": ["deterministic", "pure"],
  "limits": { "fuel": 50000000, "memoryPages": 256 },
  "$defs": {
    "LayoutInput": {
      "type": "object",
      "required": ["nodes", "args"],
      "properties": {
        "nodes": { "type": "array", "items": {
          "type": "object", "required": ["id", "width", "height"],
          "properties": {
            "id": { "type": "string" }, "parent": { "type": "string" },
            "width": { "type": "number" }, "height": { "type": "number" },
            "collapsed": { "type": "boolean" }, "attributes": { "type": "object" } } } },
        "args": { "type": "object" }
      }
    },
    "LayoutResult": {
      "type": "object", "required": ["positions"],
      "properties": { "positions": { "type": "object",
        "additionalProperties": { "type": "object", "required": ["x", "y"],
          "properties": { "x": { "type": "number" }, "y": { "type": "number" } } } } }
    }
  }
}
```

The shared `$defs` that every layout uses (`LayoutInput`, `LayoutResult`) would come from one schema per extension point, so all layouts take the same input and any host can call any layout without knowing which one it is.

Note that sizes come *in*: the host measures text with its own fonts and passes width and height. The capability never measures text, because font metrics differ per host and would break determinism.

## 4. The implementation, in Rust

Types are generated from the schema (typify), never written by hand. The module's whole surface is one exported function per operation, each taking and returning JSON.

```rust
// capabilities/layout.two-sided-tree/src/lib.rs
use extism_pdk::*;
mod types;                       // generated from capability.json by typify
use types::{LayoutInput, LayoutResult, Point};

#[plugin_fn]
pub fn place(Json(input): Json<LayoutInput>) -> FnResult<Json<LayoutResult>> {
    let args = Args::from(&input.args);           // defaults from capability.json
    let tree = Tree::build(&input.nodes);         // parent links → children, document order kept
    let mut positions = std::collections::BTreeMap::new();   // ordered: same bytes every time

    let Some(root) = tree.root() else { return Ok(Json(LayoutResult { positions })) };
    positions.insert(root.id.clone(), Point { x: -root.width / 2.0, y: -root.height / 2.0 });

    // mindmap.md §4 step 3: pinned sides first, the rest alternate right, left, right …
    let (right, left) = split_sides(&tree, root, &args.side_attribute);
    place_column(&tree, &right, Side::Right, root, &args, &mut positions);
    place_column(&tree, &left,  Side::Left,  root, &args, &mut positions);

    Ok(Json(LayoutResult { positions }))
}
```

`place_column` and `split_sides` are ordinary Rust, ported once from `MindmapLayout.Compute`. There is no I/O, no clock and no randomness, so the same input gives the same output in every host. Floating-point results are rounded to a stated precision before they are returned, so hosts compare equal.

The persistence capability has the two operations FBL §11.2 already defines:

```rust
// capabilities/format.freeplane-mm/src/lib.rs
#[plugin_fn]
pub fn read(Json(input): Json<ReadInput>) -> FnResult<Json<Reading>> {
    // input.body: the file's bytes (base64). Output: elements with ids, parents, attributes,
    // the byte span of every entry and writable value, and findings. Never fails on content.
}

#[plugin_fn]
pub fn plan(Json(input): Json<PlanInput>) -> FnResult<Json<Plan>> {
    // input: current bytes, the last reading, one change (add, set, remove, move, retype).
    // Output: splices { operation, start, end, text }, or a refusal with its sentence.
    // The host applies them, keeps undo and saves; the capability never writes a file.
}
```

This is the part where writing it once pays most: the byte-exact rules of `mindmap.md` §3.6 (attribute order, mixed CRLF and LF, HTML in `richcontent`) are written and tested once, instead of in C#, Java and TypeScript.

## 5. How the mind map's specification uses them

The specification names capabilities and contains no code and no plugin declarations of its own:

```json
{
  "requires": {
    "capabilities": [
      "format.freeplane-mm@^1",
      "layout.two-sided-tree@^1",
      "text.sibling-name@^1"
    ]
  },
  "layout": {
    "default": "mindmap",
    "trigger": "always",
    "algorithms": {
      "mindmap": { "capability": "layout.two-sided-tree",
                   "args": { "horizontalGap": 50, "sideAttribute": "position" },
                   "fallback": "mrtree" }
    }
  },
  "behavior": {
    "operations": {
      "addSibling": {
        "label": "Add sibling", "for": ["Node"],
        "actions": [
          { "create": { "type": "'Node'", "parent": "self.parent", "after": "self",
                        "attributes": { "text": "siblingName(self.parent.children.map(c, c.text))" } },
            "as": "added" },
          { "editLabel": { "target": "added", "label": "text" } } ] }
    }
  },
  "persistence": { "format": "fbl", "binding": "mindmap.fbl#mindmap" }
}
```

`siblingName` is called like any CEL function; the validator type-checks it against `text.sibling-name`'s contract, and its declared fallback (`'Node'`, what the `.dis` does today) runs where the capability is missing.

## 6. What every host writes, once for all tools

Each host has one generic capability loader, the same few dozen lines whatever the tool:

```ts
// VS Code and Notion (the browser and Node run WebAssembly natively)
import createPlugin from "@extism/extism";

const layout = await createPlugin(wasmBytes, { useWasi: false });      // no host functions at all
const out = await layout.call("place", JSON.stringify({ nodes, args }));
const { positions } = out.json() as LayoutResult;                      // types generated from the same schema
```

```java
// IntelliJ and Eclipse: Extism's Java SDK on Chicory, pure Java, no native library
var plugin = Plugin.ofManifest(Manifest.ofWasms(ManifestWasm.fromBytes(wasmBytes)).build()).build();
LayoutResult result = json.readValue(plugin.call("place", json.writeValueAsBytes(input)), LayoutResult.class);
```

```csharp
// Standalone: the React client as in VS Code, or the .NET backend with Extism's .NET SDK
using var plugin = new Plugin(new Manifest(new ByteArrayWasmSource(wasmBytes, "layout")), [], withWasi: false);
var result = JsonSerializer.Deserialize<LayoutResult>(plugin.Call("place", JsonSerializer.Serialize(input)));
```

The loader enforces the `limits` from `capability.json`, and on an error or timeout it uses the declared fallback and reports the finding, as DISL's `std.pluginMissing` does today.

## 7. How conformance is proven

Each host's CI runs every fixture of every capability through its own loader against the same `.wasm`:

```
for each capability, for each fixtures/<case>.input.json:
  out = call(operation, input)
  assert canonical_json(out) == canonical_json(<case>.expected.json)
```

Because the `.wasm` file is identical everywhere, a failure points at the host's loader or marshalling, never at five diverging ports of the algorithm.

## 8. What changes compared with today

| | Today | With capabilities |
|---|---|---|
| `.mm` reader and planner | Three implementations (C#, Java, TypeScript) | One, in Rust |
| Two-sided layout | Two implementations, IntelliJ has its own variant | One |
| Sibling naming | Standalone only; other hosts get `'Node'` | Every host |
| Link picker | Host UI | Host service, unchanged |
| Mind map tool code in a host | Thousands of lines (standalone module), hundreds (VS Code plugins) | None: the host has the generic interpreter and the generic loader |

## 9. Caveats

- **Measurement stays in the host.** Text widths depend on fonts, so the host measures and the capability only arranges.
- **Rust is a new language for the project.** Capabilities are few and small, and the contract plus fixtures keep them reviewable, but someone has to own the toolchain.
- **Debugging crosses a boundary.** A failing fixture shows input and output, not a stack in the host's debugger; capabilities need their own native unit tests in Rust as well.
- **Performance on the JVM.** Chicory interprets unless its ahead-of-time mode is used; for a layout that runs on every change in a large map, that mode would be needed.
