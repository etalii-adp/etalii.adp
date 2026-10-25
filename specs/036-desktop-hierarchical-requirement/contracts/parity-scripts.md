# Contract: the designer's edit scripts and goldens

An extension of spec 030's [parity contract](../../030-desktop-native-rust/contracts/parity.md) for a designer of the `hierarchy` kind.

## Where they are

- Scripts: `parity/scripts/etalii/hierarchical-requirement/<name>.json`, with a file `reference` in that folder holding the standalone commit they are recorded at, `a7fdf039c204535e9fc3a14f456e6f5a36a685ce` (research R3).
- Fixtures: `parity/fixtures/etalii/hierarchical-requirement/<name>/`, the web shop example (`web-shop.md`, `web-shop.adp`) and documents written for a script.
- Goldens: `parity/goldens/etalii/hierarchical-requirement/<name>/`, with `recorded.json` naming `standaloneCommit` `a7fdf03…`.

## A step

```json
{"hierarchy": {"operation": "setTitle", "target": "REQ-0003", "params": {"title": "Users sign in with a passkey."}}}
{"hierarchy": {"operation": "setColumnWidth", "target": "", "params": {"level": "1", "width": "316"}}}
{"undo": {}}
{"redo": {}}
{"outside": {"file": "web-shop.md", "replace": {"from": "REQ-0002 Users", "to": "REQ-0002 People"}}}
{"hierarchy": {"operation": "deleteEntry", "target": "ITEM-0002", "params": {}, "expect": "refused"}}
```

- `hierarchy` is one gesture as the standalone client sends it (`HierarchySurfaceGestureRequest`): the recorder sends it through `DesignerService` at the reference commit; the desktop replay passes it to the module's `HierarchySurfaceSession::gesture`.
- `undo` and `redo` are the project's history, as for a table.
- `outside` writes the file outside the host, as an agent would, then waits for the host to read it again; it is how drift (FBL section 7.2) and the end of the history (section 7.3) are recorded.
- `expect: "refused"` marks a step the standalone host refuses; the replay must refuse it too, with no byte written.

## The check

`cargo test -p adp-parity` replays each script as spec 030's check does, and compares every file of the golden's `changed` list byte for byte, the registration included. Numbers are not generated at random (they come from the counters on line 2), so no id mapping is needed.

## The scripts

At least one script per group of the companion's gestures table: structure (add, add below, move, delete with and without content), text (title, description with a `#` reference), tags (add, remove, rename, recolour, move, delete), category and state, assessments (add, change, resolve, remove), filters (store, rename, remove), columns (add, set, reset), collapse, the template (a new document), and the two writers (an outside change, a refused edit after drift, an undo past the change). Each script runs once on the web shop example in CRLF and the structure script once more on an LF copy.
