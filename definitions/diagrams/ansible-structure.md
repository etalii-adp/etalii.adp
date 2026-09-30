# Ansible project structure

The companion to [`ansible-structure.dis`](ansible-structure.dis). The `.dis` holds everything DISL can say about this diagram type: its metamodel, notation, empty toolbox, read-only forms, its five rules and the plugin it depends on. This file holds everything else: the parts of the tool's behaviour that DISL 0.1 has no construct for, each tied to the code or source that shows it, and the choices made where the implementation and DISL do not line up one to one.

| | |
|---|---|
| Origin | `ansible/structure` |
| Kind | Diagram |
| State | ⚗️ Prototype (standalone) |
| Display name | Ansible project structure |
| Purpose | See how the playbooks, roles and inventories of an Ansible project include and depend on each other. |
| Why specialized | An Ansible project spreads its structure over many folders and includes; a graph shows the dependencies without touching Ansible's own files. |
| Implemented in | [etalii.adp.ide.standalone `src/diagrams/ansible-structure/`](https://github.com/etalii-adp/etAlii.adp.ide.standalone/tree/develop/src/diagrams/ansible-structure) |

Sources read for this document, all on `develop` as of 2026-09-30:

- The standalone module: `backend/EtAlii.Adp.Diagram.AnsibleStructure/` (reader, graph, layout, mapper, rule set, validator, session, property provider, source resolver), its tests and fixtures, `client/` (`AnsibleCanvas.tsx`, `ansible-structure.css`, `ansibleModel.ts`, `useAnsibleStream.ts`, `readme.md`) and `api/ansible-structure.proto`.
- The two archived spec-workflow specifications in the standalone history: `ansible-structure-diagram` (requirements 1 to 11) and `ansible-refinements` (requirements 1 to 7 and its design), removed from the tree in `ece03c36`. "Requirement N" below refers to `ansible-structure-diagram` unless it says `refinements`.
- Core: `src/backend/EtAlii.Adp.Hierarchy/RegistrationLayout.cs` (the `.adp` layout block).
- The standalone `docs/tools.md` catalogue row and the Notion "Tools" database row "Ansible project structure".
- This project's conversations: no thread was about this tool specifically. The rules that apply to it came from general decisions: positions of a diagram whose subject belongs to another tool go into the `.adp`, never into that tool's files, and a diagram type is defined once in etalii.adp and interpreted by each IDE.

## 1. What makes this type different

Every other diagram type reads a document. This one reads a **folder**, and it is **read-only with respect to that folder** (Requirement 1.1). Three consequences shape everything below:

1. **There is no diagram document.** The `.adp` registration is the whole of what ADP contributes. The model is derived from Ansible's files every time they change, so DISL's persistence layer (which describes how a drawn diagram is written as DID) has nothing to write. The `.dis` declares `persistence.format: "plugin:ansible-folder"` and a required plugin to say so; this file says what that plugin does.
2. **The only authored data is a node's position.** It is stored in the `layout:` block of the `.adp`, never inside the registered folder (refinements Requirements 1 and 2).
3. **Nothing is created, connected, renamed or deleted from the diagram.** The `.dis` expresses this as an empty toolbox, `deletable`/`connectable: false` notations, read-only attributes and five `prevent` gesture constraints (`noCreate`, `noDelete`, `noConnect`, `noChange`, `noReparent`). The standalone module expresses it by registering no document factory, no toolbox provider, no context action provider and no command handlers (`ServiceCollection.AddAnsibleStructure.cs`).

## 2. Registering a folder

- The type declares **no document extension**; its subject is the folder the `.adp` sits in (`Diagram.cs`, `DiagramSubject.Folder`). A DISL `language.fileExtension` is therefore absent on purpose.
- The user chooses **Add… → Ansible project structure** on a folder; the Add flow creates `<folder name>.adp` whose first line is `ansible/structure`. No other file is created (Requirement 2.2).
- ADP never infers that a folder is an Ansible project. No content sniffing: a `site.yml` in a folder means nothing until a registration says so (Requirement 2.3). None of the test fixtures carries an `.adp` for that reason (`Tests/Fixtures/readme.md`).
- The icon is `mdi-sitemap` (`Diagram.cs`); the `.dis` names it `mdi:sitemap`.

## 3. Reading the folder

All of this is `AnsibleProjectReader.cs` and `AnsibleYaml.cs`. It is the behaviour of the `ansible-folder` plugin's persistence and import extension points.

**Recognition is by Ansible's conventions, never by a list ADP invented** (Requirement 3.1). Anything not recognised is ignored without complaint (Requirement 1.3): a `Makefile`, `docs/`, scripts, and a YAML file whose top level is a mapping.

| What | Where it is looked for | How it is recognised |
|---|---|---|
| Playbook | `*.yml`/`*.yaml` directly in the folder, and in `playbooks/` | The file's top level is a non-empty list whose entries are all mappings. Anything else is not a playbook. |
| Play | Each list entry of a playbook that is not an `import_playbook:` entry | `name:` (may be empty), `hosts:` (may be empty), its line, and its directives. |
| `import_playbook` | A top-level list entry with an `import_playbook:` scalar | A sibling of the plays, not part of one. Its `when:` is kept. |
| Role | Every subfolder of `roles/` | Its name is the folder name. Hollow roles are included. |
| Role contents | `tasks/` (YAML files only), `handlers/`, `templates/`, `files/`, `defaults/`, `vars/` (all files), `meta/` and `library/` (existence only) | Counts of files directly in each folder; subfolders are not counted. |
| Role dependency | `roles/<name>/meta/main.yml` (or `main.yaml`), key `dependencies:` | Each entry is a bare name, or a mapping with `role:` or else `name:`. Its `when:` is kept. |
| Task directives | Every YAML file in a role's `tasks/`, and each play mapping | Keys `include_tasks`, `import_tasks`, `include_role`, `import_role`, in the short form and any fully-qualified form ending in `.<name>` (`ansible.builtin.include_tasks`). The value is a scalar, or a mapping with `file:` or else `name:`. |
| Inventory | Each subfolder of `inventories/`, then each of `inventory`, `inventory.yml`, `inventory.yaml`, `hosts`, `hosts.yml`, `hosts.yaml` at the folder root | An environment folder is named for the folder; a root inventory file for its file name. |
| Inventory groups | Files in the environment folder with extension `.yml`, `.yaml` or none, or named like a root inventory; or the root inventory file itself | YAML: every `<top>: children: <group>` key, plus any top-level key other than `all` that has `hosts:`. Not YAML (INI): `[group]` sections count one per host line; `[group:children]` adds its members' direct host counts, one level deep; `[group:vars]` is ignored; a range line such as `web[01:50]` counts as one. Host count in YAML is the number of keys under `hosts:`. |
| Variable folders | `group_vars/` and `host_vars/` in each environment folder; for a root inventory file, those at the folder root | File count directly inside. |
| Annotations | `ansible.cfg`, `requirements.yml`, `requirements.yaml` at the root, and `collections/requirements.yml` or `.yaml` | Recorded on the project, not drawn as boxes (Requirement 4.1). |

**Where the recognised forms of `roles:` come from.** A `roles:` entry is a scalar name, or a mapping with `role:` and an optional `when:` (fixture `infrastructure/dbservers.yml`). A play's own tasks may also carry `include_role`/`import_role`, which become role edges from the play.

**Determinism** (non-functional requirement): every directory listing is sorted ordinally before use, because filesystem order is not a promise. Subfolders that are reparse points (symlinks, junctions) are skipped so a link loop ends the walk. A folder that cannot be listed is skipped and logged.

**Tolerance** (Requirement 1.2):

- A file that does not parse is recorded as a failure with the parser's own message and its 1-based line, and costs only its own detail. The position prefix YamlDotNet puts in front of its message (`(Line: 7, Col: 3): `) is stripped because the line travels as a number.
- Each file is recorded at most once, compared case-insensitively.
- An empty YAML file is valid and simply holds nothing.
- An inventory that is not YAML is read as INI and is never a failure, since that is not the user's mistake.
- A registered folder that does not exist reads as an empty project, not as an error.
- Files are read shared (read, write and delete) through the one central reader, so reading never contends with the editor the user is fixing a file in.

**Nothing opens a file for writing.** There is no code path that could (Requirement 1.1). `ZeroWrites.Tests.cs` snapshots the fixture trees byte for byte and by modification time around open, render, select, validate and describe.

## 4. Deriving the diagram

`AnsibleGraph.cs`, a pure function from the read project to nodes and relations.

**Which boxes exist** (Requirement 4.1):

- Every playbook is a `Playbook`.
- A play is its own `Play` box **only when its playbook holds more than one play**. A single-play playbook stands for its play: it carries the play's `hosts` pattern, and its role and target relations start at the playbook. The `.dis` models this with `Playbook.hosts`, `playCount`, `firstPlayName` and `playLine`.
- An unnamed drawn play is labelled `play N`, 1-based.
- Every role folder is a `Role`, every inventory an `Inventory`, every `group_vars`/`host_vars` folder a `VariableFolder`.
- A task file is a `TaskFile` **only when something includes or imports it**, and it is drawn once however often it is included. The rest are only counted in the role's contents.
- There is no relation from a playbook to its plays, nor from an inventory to its variable folders. The layout places them; the `.dis` keeps those links as non-drawn references (`Play.playbook`, `VariableFolder.inventory`).

**The per-play colour index** (Requirement 6.3): every play gets the next index in declaration order across the whole project, including the plays of single-play playbooks, so two playbooks' plays never share one. Only drawn `Play` boxes carry it; a playbook box is never tinted. The wire carries an index, never a colour; the palette belongs to the stylesheet (`api/readme.md`, `client/readme.md`).

**How a relation's target resolves.** Every relation carries its declaration: directive, target as written, `when:` as written, declaring file and line (Requirement 10.6).

| Relation | Declared by | Resolved how | Target when not found |
|---|---|---|---|
| `UsesRole` | A play's `roles:`, a play's own `include_role`/`import_role`, or a role's tasks' `include_role`/`import_role` | Role folder by exact (ordinal) name | Missing |
| `ImportsPlaybook` | A playbook's `import_playbook` | A recognised playbook whose path, relative to the importing file's folder with `.` and `..` collapsed, equals the target, compared case-insensitively | Missing |
| `IncludesTasks` | A role's tasks' `include_tasks`/`import_tasks` | A task file of the same role, relative to the including file's folder, case-insensitive | Missing |
| `DependsOn` | A role's `meta/main.yml` `dependencies:` | Role folder by exact name | Missing |
| `Targets` | A play's `hosts:` | One relation to **every** inventory that defines a matching group; none when nothing matches | Never drawn; reported by `unmatchedHosts` instead |

- A target containing `{{` is a Jinja **expression**: shown as written, marked unresolvable, never guessed at and never reported (Requirement 3.4).
- `include_tasks`/`import_tasks` written directly in a **play's** tasks are read but not drawn: with no role to resolve against there is nothing to point at, and no problem is reported for them.
- `include_*` is **dynamic** (resolved during the run) and drawn dashed; `import_*`, `roles:` and `dependencies:` are static and solid (Requirement 5.4, the ansible-playbook-grapher convention).
- A `when:` is never evaluated (Requirement 5.7). A `when:` list is joined with ` and `.
- **No per-variable usage edges** (Requirement 5.8): variable folders are facts, which play reads which variable is an inference, and ansible-viz showed that the inference guesses.

**Host pattern matching** is a deliberate subset of Ansible's pattern language (`AnsibleGraph.Matches`). The pattern is split on `:` and `,` and each token trimmed. A token starting with `!` (exclusion) or `&` (intersection) never creates a relation, since drawing a line for an exclusion would say the opposite of the file. `all` and `*` match any inventory that defines at least one group. A token ending in `*` matches groups with that prefix. Any other token matches a group of exactly that name.

**Unresolved targets in the `.dis`.** The implementation keeps an unresolved relation as an edge with an empty target, and the canvas draws it as a stub element. DISL requires every relation to have a target, so the `.dis` gives each unresolved relation its own `UnresolvedTarget` node, drawn as the target's words at the end of a short stub. There is one such node per unresolved relation, with the relation's id.

**Identifiers** are stable across every edit that does not move the thing itself (refinements Requirement 3.2). They are what a selection and a stored position are keyed on.

| Element | Id |
|---|---|
| Playbook | `playbook:<path>` |
| Play | `play:<playbook path>#<0-based index>` |
| Role | `role:<name>` |
| Task file | `taskfile:<path>` |
| Inventory | `inventory:<path>` |
| Variable folder | `vars:<path>` |
| Relation other than `Targets` | `edge:<source id>\|<Kind>\|<target as written>` |
| `Targets` relation | `edge:<source id>\|Targets\|<hosts pattern>\|<inventory id>` |

`<Kind>` is the C# enum name (`UsesRole`, `ImportsPlaybook`, `IncludesTasks`, `DependsOn`, `Targets`). Paths are folder-relative with `/`. A relation's id uses the target as written, so a missing role's relation keeps its id when the role appears. A play's id is positional, so reordering plays moves stored positions with the index (refinements Requirement 3.3), and renaming a file forfeits its stored position (refinements Requirement 3.2). The `.dis` approximates these with `natural` ids, type prefixes and a widened id `pattern`; DISL has no way to state the relation id formulas.

## 5. Layout

`AnsibleLayout.cs` with `AnsibleMetrics.cs`. Pure and deterministic: the same tree gives the same picture for everyone (Requirement 6.1). This is the `ansible-folder` plugin's `layout` extension point; the `.dis` falls back to `layered`, right, which keeps the reading direction but not the columns or the band.

**Metrics** (canvas units, CSS pixels): font size 14, horizontal padding 12 each side, node height 32 (every node is one line), minimum width 72, rank gap 96, row gap 24, band gap 96. A node's width is `max(72, text width of its name + 24)`, with the text width from the shared `TextMetric`. The backend computes each box and sends its width and height; the client draws the box it is given rather than re-measuring, the lesson of wide mindmap nodes overlapping.

**Ranks**, left to right (Requirement 6.2):

1. Each playbook's rank is its longest path of `import_playbook` edges from a playbook nothing imports, so an entry playbook is rank 0 and a playbook always sits right of everything importing it. An import cycle terminates rather than recursing, because a half-written cycle must not hang the diagram.
2. A play sits one rank right of its playbook.
3. All roles share the rank after the deepest playbook or play.
4. All task files share the rank after that.

**Within a rank**, nodes stack top to bottom in graph declaration order (playbooks by path, then roles by folder name, then task files in the order they were first included), with the row gap between them. A rank is as wide as its widest node and **every node in it takes that width**. Ranks are separated by the rank gap.

**The band**: inventories and variable folders have no rank. They go in one row beneath the flow, starting at x 0 and a band gap below the bottom of the tallest rank, each at its own measured width with the rank gap between them, in declaration order (each inventory followed by its variable folders). A play's relation to an inventory therefore drops out of the execution story instead of lengthening it.

**Authored positions** (refinements Requirement 1): after the layout, every node that has a stored position takes it; every other node keeps its computed one (`RegistrationLayout.Apply`). Only the origin moves; a box keeps its computed size. A stored id the folder no longer produces is ignored on read and dropped on the next write. The `.dis` says `trigger: "onChange"`, `respect: "all"`; the exact meaning here is that the computed layout is recomputed from scratch on every change and stored positions are overlaid on it, so a node the user never moved can move when the folder changes.

## 6. Where positions are stored

`AnsibleSession.cs` and core `RegistrationLayout.cs`. This is the `ansible-folder` plugin's persistence of view data; DISL's `view.store: ["bounds"]` is the nearest statement, but only the top-left x and y are stored, never a size.

```
ansible/structure
layout:
  playbook:site.yml: 120 80
  role:common: 340 200
```

- The block follows the first line and any header lines. Each entry is indented and reads `<element id>: <x> <y>`, with the id taken up to the **last** `: ` so ids containing colons are safe. Numbers are invariant-culture, written with at most three decimals. Everything above the block is preserved byte for byte. A malformed line is ignored; a hand-mangled block never stops the diagram opening; a one-line registration has no positions and the first move creates the block (refinements Requirement 2).
- A drag of a node dispatches core's `SetRegistrationLayoutCommand`: one undo step that restores the previous entry, or its absence (refinements Requirement 1.3).
- The write is not echoed locally. The `.adp` lives inside the watched folder, so the change returns through the folder watcher and reaches every open view as ordinary deltas (refinements Requirement 2.5).
- Refusals, in the user's words:
  - an edge: "That element is not something this diagram can move." An edge follows its endpoints.
  - no project history: "This diagram is read-only."
  - opened without a registration: "This diagram was opened without a registration, so there is nowhere to store a position."
  - a reparenting move: "An Ansible structure diagram is drawn from the folder's own files, so nothing on it can be moved from here. Move a role by moving its folder."
- **Nothing inside the registered folder is ever written** (refinements Requirement 2.3).

## 7. Staying true as the folder changes

`AnsibleProjectStore.cs` and `AnsibleWatchedFolder.cs` (Requirement 3.5).

- One store per host holds one project per registered folder, shared by every open view of it and released when the last closes.
- A `FileSystemWatcher` covers the folder and all subfolders, on file name, directory name, last write and size changes, because editing a role's `meta/main.yml` changes the diagram without renaming anything. Every handler is guarded, since an exception on the watcher thread would end the process.
- A burst of changes settles for **400 ms** (restarting on each change), then the **whole folder is re-read**, and the new project replaces the old one.
- Each view compares what it had delivered with what it would deliver now and sends only the difference, as remove and add deltas. Nothing folds, so there are no group or ungroup deltas; nothing is edited, so an element only appears, disappears or is replaced.
- **Viewport culling**: a view receives the nodes its viewport intersects, plus exactly one hop of relation partners so every drawn relation has both ends, plus every relation whose ends are both delivered. An unresolved relation is delivered with its source.
- A selected node or relation is re-resolved after every change: a deleted role clears the selection; a renamed file changes its path.

## 8. Drawing

`client/AnsibleCanvas.tsx`, `client/ansible-structure.css` and the shared `@client/canvas/canvas.css`. The `.dis` notation is written to match; these are the points where it approximates.

- **Colours come from theme tokens**, light and dark. The implementation's per-play fill is `color-mix(in srgb, <hue> 18%, <raised surface>)`; DISL 0.1 colours are CSS Color 4 values, so the `.dis` writes the hue with `fillOpacity: 0.18` over the raised surface, which looks the same. The six hues and their dark-theme variants are the stylesheet's. The play index wraps modulo six.
- **Kind is never carried by colour alone** (DISL 6.15): playbook 2 px primary outline; play primary outline dashed 6 3; role rounded corners radius 10; task file surface fill dashed 2 2; inventory and variable folder surface fill and muted outline; hollow role dashed 4 4 at 60 % opacity.
- **Relations**: out of the source's right side at mid-height, into the target's left side at mid-height, on a horizontal forward bezier that loops round for the rare backward relation (`forwardBezierPath`). An open arrow at the target. Muted 1.5 px lines; dynamic dashed 5 4; `DependsOn` primary, dotted 1 4, round cap, 2 px; `Targets` 1 px at 55 % opacity. The label sits at the midpoint, 6 px above, and reads the directive, followed by ` when <condition>` when there is one; it is monospace 10 px.
- **Unresolved relations** are a stub: a 48 px line out of the source's right side at mid-height, in the warning colour, dashed 3 3, with `<target as written> (missing)` or `(expression)` left-aligned above it, 8 px in.
- Node labels are the name, truncated to the box, 13 px, never editable. The tooltip is `<Kind> <name>`, plus ` — hosts: <pattern>` when there is one.
- **Empty folder**: when nothing recognisable was found, the canvas shows "Nothing here is laid out the way Ansible expects, so there is nothing to draw. Playbooks at the folder root or under `playbooks/`, roles under `roles/`, inventories under `inventories/`." instead of an empty canvas.
- **Toolbox**: the panel is registered with the backend's empty answer so it says the type has no entries, rather than claiming no diagram is open (Requirement 7.3).
- Shared scrollbars and the shared canvas chrome, like the sibling canvases (refinements Requirements 4 and 6).
- The canvas is an `application` region labelled "Ansible project structure"; each node is a focusable `button` named by its tooltip.

## 9. Navigation and selection

- **Every node is a door** (Requirement 8.1). Double-click, or Enter or Space on the selected node, reveals the node's file or folder in the explorer: the playbook file (a play reveals its playbook), the role folder, the task file, the inventory folder or file, the variable folder. The `.dis` names this the `revealFile` operation implemented by the plugin; DISL has no reveal-a-file action, and an operation has one shortcut, so Space is only written here.
- A selected node or relation becomes the connection's context selection at the diagram-element scope, so the property grid, ribbon and menu answer for it (Requirement 8.2). A selection is only accepted inside its own diagram, the client's path is checked against the element's, and nothing nests.
- A selected **relation answers as its declaring file** (Requirement 8.3); its selection text is the directive followed by the target, for example `include_tasks: tls.yml`.
- `UnresolvedTarget` exists only in the `.dis`: the stub itself is the relation, so selecting the stub selects the relation.

## 10. The property grid

`AnsibleContextPropertyProvider.cs` (Requirement 10). The `.dis` forms show the same rows in the same groups; three things about them are not expressible.

- **Every row is read-only and carries a reason naming the file its value lives in**: "Defined in `<file>`; edit it in a text editor." For most rows the file is the node's own path; the Meta and Depends on rows of a role name `<role>/meta/main.yml`; a variable-folder row of an inventory names that folder; every relation row names its declaring file. DISL fields have `readOnly` but no per-field, per-element reason. The core property resolver refuses a write to a read-only row server-side, and the provider refuses anyway with "An Ansible structure diagram shows the folder as it is and changes nothing in it. Edit the file this value comes from in a text editor."
- **Absent rather than empty** (Requirement 10.7): a row with nothing to say is not contributed at all. The `.dis` uses `visible` expressions for this.
- **Row ids** are `ansible.<id>`: `name`, `path`, `plays`, `roles`, `imports`, `hosts`, `inventories` (labelled Reaches), `tasks`, `handlers`, `templates`, `files`, `defaults`, `vars`, `meta`, `hollow`, `dependencies`, `used-by`, `group.<name>`, `vars.<name>`, `declared-in`, `directive`, `target`, `condition`, `resolution`.

| Selection | Groups and rows |
|---|---|
| Playbook or play | Identity: Name, Path. Runs: Plays (the single play's name, else "1", or the count), Roles (targets as written of its outgoing `UsesRole`), Imports. Targets: Hosts, Reaches (inventory names). |
| Role | Identity: Name, Path. Contents: Task files, Handlers, Templates, Files, Defaults, Vars (only those above zero), Meta "yes", Hollow "yes - Ansible would find nothing to run here". Relationships: Depends on, Used by (the distinct declaring files of incoming `UsesRole`). |
| Inventory | Identity: Environment, Path. Groups: one row per group, "1 host" or "N hosts". Variables: one row per variable folder, "1 file" or "N files". |
| Variable folder | Identity: Name, Path. Variables: Files. |
| Task file | Identity: Name, Path. |
| Relation | Declaration: Declared in `<file>:<line>`, Directive, Target, When (only with a condition), Resolves to "nothing in this folder" or "an expression, so it is not knowable without running Ansible" (only when unresolved). |

## 11. Problems

`AnsibleRuleSet.cs` and `AnsibleValidator.cs` (Requirement 9). The `.dis` rules carry DISL-shaped ids, because a DISL constraint id is a simple identifier; the ids a runtime reports are in `x-adp-rule-id` and below.

| `.dis` rule | Reported id | Severity | Location |
|---|---|---|---|
| `roleMissing` | `ansible.role-missing` | error | The declaring file and line |
| `danglingImport` | `ansible.dangling-import` | error | The declaring file and line |
| `unmatchedHosts` | `ansible.unmatched-hosts` | warning | The playbook file and the play's line |
| `unreadableYaml` | `ansible.unreadable-yaml` | error | The unreadable file and the parser's line |
| `emptyRole` | `ansible.empty-role` | warning | The role folder |

- **A problem points at a file and line, not at an element.** DISL problems attach to elements, so the location, which is what makes the problems panel open the thing to fix, is only written here. The validator rebases each location from folder-relative to project-relative when the diagram's folder is not the project root.
- `unreadableYaml` reports **one problem per unreadable file**. A DISL diagram-scope rule reports once, so the `.dis` joins the messages; a runtime following this document reports them separately.
- `unmatchedHosts` is silent when the folder has no inventory at all, and for patterns whose every token is `all`, `*`, `localhost`, `127.0.0.1` or `::1`, compared case-insensitively. The message names the play by its `name:` when it has one, else "A play".
- An expression target is never reported (Requirement 3.4), and neither is an unconventional layout: a team that keeps playbooks in `plays/` gets an undrawn folder, not a problem (Requirement 9.4, fixture `unconventional/`).
- Validation reads the folder directly rather than through the shared store, so "Validate all" does not leave a watcher behind on a folder nobody has open.

## 12. Known gaps and quirks in the implementation

Found while writing this down; recorded so that a second implementation can choose to match or fix them deliberately.

- **`::1` is never implicit in practice.** The host pattern is split on `:` before the implicit check, so `hosts: ::1` becomes the token `1` and is reported as unmatched when inventories exist. The `.dis` function `isImplicitHosts` mirrors the split and leaves `::1` out.
- **A `Targets` relation carries a synthetic declaration**: directive `roles:`, the hosts pattern as target, an empty declaring file and the play's line. Its property grid therefore shows "Declared in `:<line>`" and "Directive `roles:`", and selecting it resolves to an empty path. Declaring the playbook file and a `hosts:` directive would be the honest fix; the `.dis` `Directive` enum has no `hosts` value yet, so a `Targets` relation there is only as honest as the implementation.
- Plays' own `include_tasks`/`import_tasks` are silently ignored, including when they name a file that does not exist.
- A single-play playbook is never tinted, although its play consumed a colour index.
- A root inventory file receives the folder root's `group_vars`/`host_vars`, and when several root inventory files exist, each of them gets the same variable folders, so the same folder is drawn more than once with one id.
- An inventory environment folder reads groups from every file with no extension, not only files named like an inventory.
- A role's `handlers`, `templates`, `files`, `defaults` and `vars` counts include every file, YAML or not; only `tasks` is filtered to YAML.

## 13. What DISL 0.1 could not express, in one list

For a reader deciding what a DISL runtime needs to grow to run this type without a plugin:

1. A **folder as the subject** of a diagram, read by rules rather than stored as DID, and a model that is derived rather than edited. DISL has `derived` attributes and relations, but not a derived model.
2. **File-system recognition and YAML/INI reading rules** (section 3).
3. **Relation resolution** against files and folders, including the three-valued resolution and path normalisation (section 4).
4. The **ranked layout with a band** (section 5).
5. **View data stored outside the diagram's own file**, in the `.adp` layout block (section 6).
6. **Live re-reading on file-system change** (section 7).
7. A relation **with no target**, drawn as a stub (modelled with `UnresolvedTarget`).
8. **Revealing a file** from a node (section 9).
9. **Per-row read-only reasons** in forms (section 10).
10. **Problems located at a file and line** rather than at an element, and one problem per item of a diagram-level list (section 11).
11. **Formula ids** for relations (section 4).
12. CSS `color-mix` in paints (section 8).
