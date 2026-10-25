# Contract: the hierarchy surface between a module and the shell

The desktop host's form of the standalone host's `IHierarchySurfaceSession` and `HierarchySurfaceModel` at `a7fdf03` (`EtAlii.Adp.Sessions/IHierarchySurfaceSession.cs`, `EtAlii.Adp.Designer/HierarchySurfaceModel/`, `src/api/designers.proto`). It lives in `adp-desl::hierarchy` and knows no designer type: the operations, roles, labels and kinds are names read from the definition. The structs are those of [data-model.md](../data-model.md), "In `adp-desl::hierarchy`".

## The session

```text
trait HierarchySurfaceSession {
    fn model(&self) -> SurfaceModel;                     // the whole model as this connection first sees it
    fn gesture(&mut self, gesture: Gesture) -> Result<(), String>;
                                                         // Ok: accepted, shown at once, written behind;
                                                         // Err: refused before anything is written, with the sentence
    fn take_changes(&mut self) -> Vec<SurfaceChange>;    // drained by the shell each frame, as the table's are
    fn undo(&mut self) -> Result<(), String>;
    fn redo(&mut self) -> Result<(), String>;
    fn file_changed(&mut self, path: &Path);             // the watcher's news: read again, keep collapsed by number
}
```

- Every accepted gesture yields, in order, one `SurfaceChange::Model` with the whole new model and one `SurfaceChange::Outcome` for its `edit_id`. A gesture refused after it was accepted (drift found when writing) yields an `Outcome { written: false, error }` and a model as it was.
- The model carries no focus, narrowing, sort, selection or hover: those are the view's (data-model, "In the view").
- `toggleCollapsed` and the column-width operations write the registration outside the body's history only where the binding says so; every other operation is one step of undo.
- Undo past an outside change is refused with FBL section 7.3's sentence, which the view shows (029: FR-025).

## Gesture names and params

The `operation` is one of the definition's operations; `target_id` is a node's `id` (or empty for `addTopItem` and the list operations); `params` are the operation's declared params by name, as strings, as the standalone client sends them (`hierarchicalRequirementDefinition.ts`, `HierarchySurfaceGestureRequest.params`). The standalone host's `HierarchicalRequirementGestures` maps a gesture onto an operation; the desktop module ports it, so a gesture recorded from the standalone client replays unchanged (see [parity-scripts.md](parity-scripts.md)).

## What the view may assume

- `nodes` are in reading order; a node's `parent_id` names a node before it.
- `widths` hold only levels with a kept width.
- A node's `references` are ranges of its `description`; a note's are ranges of its `text`.
- A `read_only_reason` that is not empty means every gesture will be refused; the view offers none.
