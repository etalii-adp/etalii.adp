# Contract: Core and Shell

How the shell (the window) and the core (everything else) talk inside the one process. It replaces the standalone host's gRPC-Web contract (`src/api/*.proto` at `8b6ccfc`) one for one: every unary call becomes a method, and the one `WorkspaceService.Watch` stream per tab becomes one event channel per window.

## Calls from the shell into the core

The core exposes one `Workspace` handle per window. Each method returns at once with a result or a refusal; work that takes longer runs on a core thread and reports through events.

| Standalone call | Desktop method | Result |
|---|---|---|
| `AddProject`, `ListProjects`, `RemoveProject` | `projects().add(path)`, `list()`, `remove(id)` | `Project` or a refusal with its reason |
| `Select` | `select(refs, mode)` | the new selection |
| `ExecuteAction` | `execute(action_id, args)` | `Done`, `Refused(reason)` or `Prompt(prompt)` |
| `ProposeInput`, `SubmitInteraction`, `CancelInteraction` | `answer(prompt_id, value)`, `cancel(prompt_id)` | as `execute` |
| `DescribeProperties`, `SetProperty` | `properties()`, `set_property(row, value)` | rows; `Done` or `Refused` |
| `OpenDiagram`, `CloseDiagram`, `UpdateView` | `open(path, tool)`, `close(doc)`, `set_viewport(doc, rect, zoom)` | document id; scene arrives as an event |
| `MoveElement` | `move_elements(doc, refs, delta)` | `Done` or `Refused` |
| `DescribeToolbox` | `toolbox(doc)` | toolbox groups and items |
| `SaveText` | `save_text(doc, text)` | `Done` or `Refused` |
| `Analyze`, `Complete` | `analyze(doc)`, `complete(doc, position)` | findings; completions |
| `OpenTable`, `CloseTable`, `SetTableWindow`, `SetTableView`, `Edit` | `open_table(..)`, `close_table(..)`, `set_table_window(doc, rows)`, `set_table_view(doc, view)`, `edit_cell(..)` | as `execute` |
| (Ctrl+Z, Ctrl+Y) | `undo()`, `redo()` | `Done` or `Refused(reason)` |

## Events from the core to the shell

One channel per window, in order, never dropped. The shell drains it once per frame and asks for a repaint when it receives one.

| Event | Carries |
|---|---|
| `ContextChanged` | selection, actions with their enabled state, the property rows |
| `HierarchyChanged` | the list of `HierarchyChange` |
| `SceneChanged` | a document's scene for its current viewport (whole, not a delta) |
| `TableWindowChanged` | the rows of a table's current window |
| `DocumentChanged` | a document's state: dirty, reconciling, reloaded, refused |
| `FindingsChanged` | a document's or the project's findings |
| `PromptRequested` | a prompt the shell must show |
| `Notice` | a message to show, with its severity |

## Rules

- The core never calls into the shell, and holds no type from the toolkit; the shell never changes the model except through these methods.
- Every change of a model is a command on the history (data model); the shell never writes a file.
- A refusal always carries one sentence a person can read, as the standalone host's `CommandResult` does.
- Everything in this contract is exercised headless by the core's tests; the shell's tests cover drawing and input only.
