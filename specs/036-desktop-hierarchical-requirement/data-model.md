# Data Model: The Hierarchical Requirement Designer in the Desktop Host

The entities of spec 028 and spec 029 as the desktop host holds them. Each is the standalone host's record at `a7fdf03`, ported; the name of the C# type is given so a reader can compare.

## In the module (`adp-designer-hierarchical-requirement`)

### Document (`HierarchicalRequirementDocument`)

| Field | Type | Rule |
|---|---|---|
| `last_item`, `last_requirement` | `Option<String>` | The counter marks on line 2 (`ITEM-0007`), or none when the file has no mark. |
| `entries` | `Vec<Entry>` | Items and requirements in reading order. |
| `assessments` | `Vec<Assessment>` | In the order of the `## Assessments` section. |
| `tags`, `categories`, `states` | `Vec<Option>` | The registration's lists, with the implicit members the body uses and the lists do not name. |
| `filters` | `Vec<Filter>` | Stored filters from the registration. |
| `columns` | `Vec<Column>` | Column widths from the registration's `widths` block. |
| `findings` | `Vec<Finding>` | What reading reported, at a line, in the body or the registration. |
| `read_only_reason` | `String` | Empty when the document can be changed. |

### Entry (`RequirementEntry`, `Item`, `Requirement`)

| Field | Type | Rule |
|---|---|---|
| `id` | `String` | `ITEM-000x` or `REQ-000x`; `ITEM-NEW` and `REQ-NEW` read as placeholders with `std.missingId`. |
| `parent_id` | `Option<String>` | The item it stands in; none at the top. |
| `title`, `description` | `String` | |
| `tags` | `Vec<String>` | Members of the tag list. |
| `category`, `state` | `Option<String>` | A requirement's only. |
| `collapsed` | `bool` | From the registration's collapsed block, matched by number. |
| `line` | `usize` | The bullet's line, for findings. |
| `placeholder` | `bool` | |
| kind | `Item` or `Requirement` | An enum in Rust where C# has two records. |

### Assessment

`id`, `kind` (`Question`, `Remark`, `Warning`, `Idea`), `about` (an entry's number), `text`, `detail`, `resolved`, `line`.

### Option (`Tag`, `Category`, `State`)

`name`, `colour`. The colours are the table's ten option colours (`adp-shell/src/table/header.rs`, `OPTION_COLOURS`).

### Filter

`name`, `query`. The query language is the surface's (`narrowing.rs`): words for tags, `category:`, `@` for a state, `item:` with `*` and `?`, `sort:` with `number`, `title`, `category` or `state`.

### Column

`level` (the depth, from 1), `width` (pixels, 120 to 2000; a value outside is left out when read, and that column keeps the page's own width).

### Finding (`HierarchicalRequirementFinding`)

`code` (the companion's codes, `std.missingId` among them), `message`, `line`, `in_registration`.

## In `adp-desl::hierarchy` (the surface, host-neutral)

The standalone host's `HierarchySurfaceModel` and its members, the `designers.proto` messages `HierarchySurface*` at `a7fdf03`, field for field:

| Struct | Fields |
|---|---|
| `SurfaceModel` | `title`, `read_only_reason`, `cause`, `nodes`, `option_lists`, `filters`, `notes`, `findings`, `widths` |
| `SurfaceNode` | `id`, `number`, `role`, `type`, `parent_id`, `title`, `description`, `labels: Vec<LabelValues>`, `references: Vec<Reference>`, `collapsed` |
| `LabelValues` | `label`, `values` |
| `Reference` | `start`, `length` (in characters of the description), `target_id` |
| `OptionList` | `label`, `options: Vec<SurfaceOption>` |
| `SurfaceOption` | `id`, `name`, `colour`, `implicit` |
| `SurfaceFilter` | `id`, `name`, `query` |
| `ColumnWidth` | `id`, `level`, `width` |
| `Note` | `id`, `kind`, `about`, `about_id`, `text`, `detail`, `resolved`, `references` |
| `SurfaceFinding` | `code`, `severity`, `message`, `node_id`, `line` |
| `Gesture` | `edit_id`, `operation`, `target_id`, `params: BTreeMap<String, String>` |
| `EditOutcome` | `edit_id`, `written`, `error` |
| `SurfaceChange` | `Model(SurfaceModel)` or `Outcome(EditOutcome)` |

`role` is one of the surface's roles (`HierarchySurfaceRoles`: the item and the requirement roles the `.des` declares); `type` is the metamodel type. The operations a gesture names are the definition's 41 (`addTopItem` … `resetColumnWidth`).

## In the view (`adp-shell::hierarchy`), the person's state, never stored in a file

| State | Rule |
|---|---|
| Focus | The item at the page's left edge, or none. Not stored (029: FR-008). |
| Selection | One entry; the trail follows it and names items only. |
| Narrowing and sort | The query in the filter bar. A stored filter is a gesture. |
| Hover | Which box shows its hover controls. |
| Open field | The title field (one line, after the number) or the description field (as high as the description). |
| Drag | The entry dragged and where it would land. |
| Column drag | The level and the width shown while the edge is dragged; one gesture on release. |
| Icon layout | Per box: `Row` when the whole first line and every icon fit side by side, else `Column`; `Column` until measured. |

## State transitions

- **Open**: read body and registration → `Document` → `SurfaceModel`; nothing written.
- **Gesture**: drift check → operation's splices or declared-block write → read again → new `SurfaceModel` and an `EditOutcome { written: true }`; a refusal is `EditOutcome { written: false, error }` and the view puts back what it showed.
- **Outside change**: the watcher sees the file → read again → new `SurfaceModel`, collapsed state kept by number; with unsaved edits the conflict bar offers reload or keep; the history ends at the change (FBL section 7.3) and the first undo past it says so.
- **Registration deleted**: default colours, order and widths; the next setting creates it (FBL section 8.4), outside the history.
