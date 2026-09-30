# Contract: persistence plugins

What FBL's document states normatively about a persistence plugin (FR-080 to FR-083, research R11). Stated as data exchanged, never as an API in a host language, so each host binds it to its own plugin mechanism.

## Where a plugin sits

A plugin is a binding's `reader`: `{"plugin": "<name>", "version": "<SemVer range>", "args": {…}}`, declared in the DISL specification's `plugins` with `provides: ["persistenceFormat"]`. Everything else in the binding (claims, body, registration, template if given as bytes) is declared and handled by the host.

## Operations

| Operation | Receives | Delivers |
|---|---|---|
| `read` | the body's bytes (file) or its listing with the bytes of every file the binding's `files` rules select (folder); the binding's `args` | elements and relations with their type, id, attribute values, parent and slot; for each, the source spans (file, byte range) of the entry and of each writable value; findings with *source locations*; whether the body is unreadable as a whole |
| `plan` | the current bytes, the last `read` result, and one model change (add, set, remove, move in a container) | the splices that realise it, each `{operation, file, start, end, text}` named from FBL's catalogue; or a refusal with a reason |
| `template` | the new body's name and the binding's template parameters | the bytes of a new body; omitted when the binding gives `template.text` |
| `watch` (folder, optional) | the last `read` result | the paths the reading depends on; the host watches them with the binding's `settle` delay and calls `read` again |

## What the host does, and the plugin must not

- Apply splices to the bytes, write files atomically, keep undo and redo as inverse splices or snapshots, check drift, reload on external change (FBL processing model).
- Store and read view data in the registration; route files by the binding's claims; share one open body between readings.

## Obligations of the plugin

- `read` **MUST NOT** fail on content: problems are findings, and an unreadable body is reported as such (FR-032, FR-033).
- `read` and `plan` **MUST** be deterministic: the same bytes and change give the same result in every host's implementation of the plugin.
- Splices from `plan` **MUST** touch only the bytes the change concerns and **MUST** follow the text inference rules of FBL for new text.
- A read-only binding's plugin is never asked to `plan`.
- A plugin **MUST NOT** write files, keep its own undo, or store view data.

## Formats expected to stay plugins

Turtle and N-Triples projection (W3C ×4), SPARQL (read-only), MSBuild and solution evaluation (.NET, read-only), the Ansible and Helm folder readers (read-only), and the Azure Pipelines template expansion. A format FBL can declare **SHOULD** be bound instead (FR-083).
