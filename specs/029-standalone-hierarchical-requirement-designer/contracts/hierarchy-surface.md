# Contract: the hierarchy surface

What the standalone host exposes for DESL's `hierarchy` surface (DESL section 7.7): the backend session contract a designer module implements, the wire messages between backend and client, and the client library a module's client mounts. A designer type of the `hierarchy` kind is served by these, whichever designer it is (FR-032), and the Hierarchical Requirement Designer is their first consumer. Every statement cites the spec's requirement (FR), the plan's decision (R, in [research.md](../research.md)) or the definition it comes from. The paths are those of R1: spec 025's homes where it names one, otherwise standalone `develop` `b35336639`; the first task corrects them.

## Names

| Identifier | Value | Source |
|---|---|---|
| The name users see | `Hierarchical Requirement Designer` | Verbatim Constraints, FR-001 |
| The designer type's origin | `etalii/hierarchical-requirement` | the binding's `claims.origins` |
| An item's number | `ITEM-000x` | Verbatim Constraints |
| A requirement's number | `REQ-000x` | Verbatim Constraints |
| What opens the lookup in a description | `#` | Verbatim Constraints, FR-017 |
| The surface's prefix | `HierarchySurface` in C# and proto, `hierarchySurface` in TypeScript folders and identifiers; never a bare `Hierarchy`, which is the explorer tree's (`EtAlii.Adp.Hierarchy`, `hierarchy.proto`) | R7 |

The surface carries DESL's words, not the designer's: a **level** is the type the surface's `levels` names (here `Item`), an **entry** the type its `entries` names (here `Requirement`), a **label** an attribute its `labels` names (here `tags`, `category`, `state`), a **note** the type its `notes` names (here `Assessment`). Core knows none of the designer's own names (standalone's `DesignerModuleIsolation.Tests`).

## The backend session contract

`IDesignerSession` keeps what the sessions of both surface kinds share. Its table members move to `ITableDesignerSession`, unchanged, and `IHierarchySurfaceSession` is new beside it, in the project spec 025 T266 gives the session contracts (`EtAlii.Adp.Sessions`) (R8).

```csharp
/// What the sessions of both surface kinds share.
public interface IDesignerSession : IAsyncDisposable;

/// The table's session: Baseline, Changed, SetWindow, SetActiveView and Edit, as IDesignerSession has them today.
public interface ITableDesignerSession : IDesignerSession { /* moved unchanged */ }

/// One open hierarchy surface on one connection.
public interface IHierarchySurfaceSession : IDesignerSession
{
    /// The whole read model as it stands now.
    HierarchySurfaceModel Model();

    /// Raised with the whole model after every change, own or from outside, and with the outcome of each accepted gesture.
    /// A handler must not block.
    event EventHandler<HierarchySurfaceChangedEventArgs>? Changed;

    /// Takes one gesture. Returns "" when it is accepted, or the sentence saying why it is refused, in which case nothing changed.
    string Gesture(ShortGuid editId, HierarchySurfaceGesture gesture);
}
```

| Rule | Source |
|---|---|
| A session is per connection and ends with its stream, as a table session does. | R8 |
| `HierarchySurfaceModel` and its parts are POCOs in `EtAlii.Adp.Designer/HierarchySurfaceModel/`, one type per file, beside `TableModel/`. | plan, Structure Decision |
| Every gesture that changes a file is a command through `IHistoryStack`; a refusal is a `CommandResult`. `toggleCollapsed` and the creation of the registration are outside the history. | R4, standalone's principles |
| Opening never writes a file. The session watches the body and the registration through `WatchedFile`, skips its own writes, ignores identical bytes and raises the whole model again. | R13, plan, Constraints |
| `IDesignerSessionFactory.Open(ShortGuid watchId, ProjectRoot root, string? registrationPath, string bodyPath)`: the registration is optional; the routing of [routing-and-adding.md](routing-and-adding.md) supplies it when one exists. | R4, FR-004 |

## The wire

`designers.proto` gains three unary calls on `DesignerService`, and `workspace.proto` one member of `WorkspaceMessage`. The surface's content arrives on the tab's one stream, `WorkspaceService.Watch`; there is never a second stream (R8, plan, Constraints).

```proto
service DesignerService {
  // ... the table's calls, unchanged ...

  // Starts a hierarchy surface stream on the connection's Watch: the whole model, then the whole model again after every change.
  rpc OpenHierarchySurface(OpenHierarchySurfaceRequest) returns (OpenHierarchySurfaceResponse);

  // Ends one hierarchy surface stream. Closing a stream that is already gone is not an error.
  rpc CloseHierarchySurface(CloseHierarchySurfaceRequest) returns (CloseHierarchySurfaceResponse);

  // One gesture of the person. Answered when the gesture is accepted or refused; the outcome of an accepted one follows on the stream.
  rpc HierarchySurfaceGesture(HierarchySurfaceGestureRequest) returns (HierarchySurfaceGestureResponse);
}

message OpenHierarchySurfaceRequest {
  ShortGuid project_id = 1;
  ShortGuid watch_id = 2;
  ShortGuid stream_id = 3;  // client-generated, unique on the connection among all its streams
  Path path = 4;            // project-relative path of the document's body or of its registration
}
message OpenHierarchySurfaceResponse {}

message CloseHierarchySurfaceRequest {
  ShortGuid watch_id = 1;
  ShortGuid stream_id = 2;
}
message CloseHierarchySurfaceResponse {}

message HierarchySurfaceGestureRequest {
  ShortGuid watch_id = 1;
  ShortGuid stream_id = 2;
  ShortGuid edit_id = 3;            // client-generated; the outcome names it
  string operation = 4;             // the operation's name in the specification, e.g. "addItemBelow"; or "renumberDuplicate"
  string target_id = 5;             // what the operation is for; empty for an operation "for" the document
  map<string, string> params = 6;   // the operation's params by their names in the specification, in their written form
}
message HierarchySurfaceGestureResponse {
  string error = 1;  // empty when accepted; otherwise the sentence the client shows, and nothing changed
}

message HierarchySurfaceStreamMessage {
  ShortGuid stream_id = 1;
  oneof event {
    HierarchySurfaceModel model = 2;
    HierarchySurfaceEditOutcome outcome = 3;
    HierarchySurfaceStreamEnded ended = 4;  // the backend ended the stream itself; the client re-opens
  }
}
message HierarchySurfaceStreamEnded {}

message HierarchySurfaceModel {
  string title = 1;                                   // as TableBaseline.title
  string read_only_reason = 2;                        // non-empty when nothing can be edited, saying why
  string cause = 3;                                   // "open", "edit" or "outside": what this model follows
  repeated HierarchySurfaceNode nodes = 4;            // every level and entry, in the file's order
  repeated HierarchySurfaceOptionList option_lists = 5;
  repeated HierarchySurfaceFilter filters = 6;        // the stored filters, in their order
  repeated HierarchySurfaceNote notes = 7;            // every note, open and resolved, in the file's order
  repeated HierarchySurfaceFinding findings = 8;      // all of them, filters notwithstanding
}

message HierarchySurfaceNode {
  string id = 1;              // see "Ids" below
  string number = 2;          // as written: "ITEM-0004", "REQ-NEW", "REQ-12"
  string role = 3;            // "level" or "entry"
  string type = 4;            // the specification's type: "Item", "Requirement"
  string parent_id = 5;       // empty at the top level
  string title = 6;
  string description = 7;     // its lines joined by LF, the indentation taken off
  repeated HierarchySurfaceLabelValues labels = 8;
  repeated HierarchySurfaceReference references = 9;
  bool collapsed = 10;
}

message HierarchySurfaceLabelValues {
  string label = 1;            // "tags", "category", "state"
  repeated string values = 2;  // the member names as the node carries them, in the order of its line
}

message HierarchySurfaceReference {
  int32 start = 1;             // offset in the description, in UTF-16 code units
  int32 length = 2;            // of the bracketed number, brackets included
  string target_id = 3;        // empty when it names no node
}

message HierarchySurfaceOptionList {
  string label = 1;                              // "tags", "category", "state"
  repeated HierarchySurfaceOption options = 2;   // stored members in their order, then implicit ones
}

message HierarchySurfaceOption {
  string id = 1;        // "tag/<name>", "category/<name>", "state/<name>", the name in lower case
  string name = 2;
  string colour = 3;    // one of the ten: default, gray, brown, orange, yellow, green, blue, purple, pink, red
  bool implicit = 4;    // carried by a node, not held by the list
}

message HierarchySurfaceFilter {
  string id = 1;        // "filter/<name>"
  string name = 2;
  string query = 3;     // words in DESL section 7.7.3's notation
}

message HierarchySurfaceNote {
  string id = 1;        // "assessment/<n>", valid for this model only
  string kind = 2;      // "Question", "Remark", "Warning" or "Idea"
  string about = 3;     // the number as written
  string about_id = 4;  // the node it names; empty when it names none
  string text = 5;
  string detail = 6;
  bool resolved = 7;
  repeated HierarchySurfaceReference references = 8;  // offsets in text, then in detail after one LF
}

message HierarchySurfaceFinding {
  string code = 1;      // e.g. "std.duplicateId", "std.mentions", "fbl.unknown-block"
  string severity = 2;  // "error", "warning" or "info"
  string message = 3;
  string node_id = 4;   // the node it stands at, when it stands at one
  int32 line = 5;       // 1-based line of the body, or of the registration for a registration finding
}

message HierarchySurfaceEditOutcome {
  ShortGuid edit_id = 1;
  bool written = 2;
  string error = 3;     // why, when it was not written
}
```

```proto
message WorkspaceMessage {
  oneof message {
    // ... hierarchy = 1, context = 2, diagram = 3, table = 4, unchanged ...
    // One event of a hierarchy surface stream DesignerService.OpenHierarchySurface started on this connection.
    HierarchySurfaceStreamMessage hierarchy_surface = 5;
  }
}
```

### Ids

| What | Id | Source |
|---|---|---|
| A level or entry with a usable number | Its number as written: `ITEM-0004`, `REQ-0031`, `REQ-12` | companion, Numbers |
| A level or entry without one (`ITEM-NEW`, `REQ-NEW`, a later duplicate) | `line/<n>`, the 1-based line of its bullet, valid for this model only | R14 (the stand-in for derived ids) |
| A member of a label's list | `tag/<name>`, `category/<name>`, `state/<name>`, the name in lower case | `hierarchical-requirement.des`, `persistence.ids` |
| A stored filter | `filter/<name>` | same |
| A note | `assessment/<n>`, its place among the assessments, valid for this model only | same; R13 |

A gesture names a target by the id of the model it was made in. When the file has changed since, the gesture is refused (see Refusals).

### Gestures

`operation` is the name of an operation of `hierarchical-requirement.des`, and `params` its params by name. The module maps it to its operation; core passes it through and knows none (FR-026, R8).

| Gesture | `operation` | `target_id` | `params` |
|---|---|---|---|
| The control at the end of the page; the first item of an empty document | `addTopItem` | empty | |
| The control at the end of an item's content | `addRequirement`, `addItem` | the item | |
| `Ctrl+Enter` on a selected item; on a selected requirement | `addItemBelow`; `addRequirementBelow` | the selected entry | |
| `Ctrl+Shift+Enter` on a selected item | `addRequirement` | the item | |
| Committing a title; a description, a picked reference included | `setTitle`; `setDescription` | the entry | `title`; `description` |
| Dropping an item; a requirement | `moveItem`; `moveRequirement` | the dragged entry | `item` (the new parent, empty for the top level), `after` (the sibling it follows, empty for first) |
| Delete, confirmed by the client first when the entry holds anything or a reference or an assessment names it (FR-014) | `deleteEntry` | the entry | |
| The control to the left of a title | `toggleCollapsed` | the entry | |
| A tag field, then Enter; the cross on a tag | `addTag`; `removeTag` | the entry | `name` |
| A tag list's rename, colour, drag, delete | `renameTag`, `recolourTag`, `moveTag`, `deleteTag` | `tag/<name>` | `name`; `colour`; `after` (an option id, empty for first) |
| Picking or clearing a category; a state | `setCategory`, `clearCategory`; `setState`, `clearState` | the requirement | `category`; `state` |
| A category list's add, rename, colour, drag, delete; the same for states | `addCategory`, `renameCategory`, `recolourCategory`, `moveCategory`, `deleteCategory`; `addState`, `renameState`, `recolourState`, `moveState`, `deleteState` | empty for an add, else `category/<name>` or `state/<name>` | `name`, `colour`; `name`; `colour`; `after` |
| The assessment icon's list: add, change, resolve, remove | `addAssessment`, `changeAssessment`, `resolveAssessment`, `removeAssessment` | the entry for an add, else `assessment/<n>` | `kind`, `text`; `kind`, `text`, `detail` |
| Storing the applied filter; renaming or removing a stored one | `storeFilter`, `renameFilter`, `removeFilter` | empty for a store, else `filter/<name>` | `name`, `query`; `name` |
| Giving a duplicate a new number, from its finding | `renumberDuplicate` | the duplicate's `line/<n>` | |

Never sent, because they never write a file (FR-008, FR-018 to FR-020, R8): narrowing, sorting, focusing on an item, selecting a reference box, opening the `#` lookup. The client does each from the model it holds.

### Refusals and messages

| When | What the person sees | Source |
|---|---|---|
| A gesture planned against a file whose bytes have changed since they were read (FBL section 7.2) | The outcome's `error`: "The file changed while you were editing, so this change was not written. The page now shows the file as it is." The shared sentence of the FBL library replaces Knowledge's module-local one. | R10, R12, FR-024 |
| A model with `cause` `"outside"` while a title or description field is open | A bar over the page: "This file was changed outside the designer." with "Show the file" and "Keep my text". "Keep my text" commits as a new `setTitle` or `setDescription`, refused when the entry's number is gone. | R10, R11, FR-023 |
| Undo past a change from outside | The history stack's existing `CommandResult.Outdated` message, unchanged. | R10, R12, FR-025 |
| A later DED version, a file that cannot be read at all, a surface kind the build lacks | `read_only_reason` non-empty, with the one finding; or the existing unsupported placeholder (`PanelPlaceholder.tsx`) for a kind the build lacks | R6, FR-027, FR-030, FR-031 |

## The client library

`src/client/src/hierarchySurface/library/` draws the page; it knows no designer type. A module's client mounts it with a declaration, as the Knowledge designer's client mounts the table with `knowledgeDefinition.ts` (R9).

| Identifier | What it is | Source |
|---|---|---|
| `useHierarchySurfaceStream` | Opens and closes the stream, holds the latest `HierarchySurfaceModel`, sends gestures, tracks their outcomes. Beside `useTableStream`. | R8 |
| `HierarchySurface` | The page: trail, boxes, collapse controls, labels, note icons, the `#` lookup, the filter bar. | FR-006 to FR-021 |
| `HierarchySurfaceProps` | `model: HierarchySurfaceModel`; `definition: HierarchySurfaceDefinition`; `onGesture(operation, targetId, params)`; `selectedNode?: string`; `onSelectNode?(id)`; `pendingEdits?: number`. Focus, narrowing, sorting and the open lookup are the component's own state. | R8 |
| `HierarchySurfaceDefinition` | The module's declaration: the levels' and entries' types and their labels, each label's `prefix` and whether it holds one value or many, each note kind's icon, the icon for several notes, and which `operation` each gesture of the table above sends. | DESL section 7.7, R9 |
| `hierarchicalRequirementDefinition.ts` | The module's declaration, in `src/designers/hierarchical-requirement/client/`, beside its `register.ts` and its panel. `KNOWN_MODULE_CLIENTS` goes to `2` in `declarativeDesignerModules.test.ts`. | R9 |
| Reused in place | `OptionTag`, `SearchList`, `OptionsEditor`; `usePointerGesture` for the drag; the shape of `NestedRowToggle` and `NewRow`. | R9 |

What the Hierarchical Requirement Designer declares:

| Declaration | Value | Source |
|---|---|---|
| Levels, entries | `Item`, `Requirement`, each with `title` and `description` | `.des`, `surface` |
| Labels | `tags` with prefix `#`, many, on `Item` and `Requirement`; `category` with prefix `category:`, one, on `Requirement`; `state` with prefix `state:`, one, on `Requirement` | `.des`, `surface.labels` |
| Note icons | `Question` `mdi-help-circle-outline`, `Remark` `mdi-comment-text-outline`, `Warning` `mdi-alert-outline`, `Idea` `mdi-lightbulb-outline` | `.des`, `AssessmentKind` |
| The icon for several open notes | `mdi-comment-multiple-outline` | R10 |
| The mark of an item whose levels do not fit | `mdi-chevron-double-right` at the box's right edge, the number of hidden levels in its tooltip | R10 |
| Focus | A focus control in the header of every item box, and pressing the mark | R10 |
| The trail | One row above the page: the document's title, then each item above the focused one by number and title, each a link that focuses it | R10 |

## The keys

Two context actions with a `ContextShortcutDefinition`, so the ribbon and the menus show them; that is the host's help (FR-012, R10).

| Shortcut | `ContextShortcutDefinition` | On | Sends |
|---|---|---|---|
| `Ctrl+Enter` | `("Enter", Ctrl: true)` | a selected item or requirement | `addItemBelow` or `addRequirementBelow`: a new entry of the same kind directly below it, its title selected for typing |
| `Ctrl+Shift+Enter` | `("Enter", Ctrl: true, Shift: true)` | a selected item | `addRequirement`: a requirement in it, where that operation places one, its title selected for typing |
