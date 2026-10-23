# Contract: conformance fixtures and traces

The files that show a tool description complete (story 2) and correct (story 4). Research R16 to R18; data-model.md §8 to §10. Their normative definitions are ATD §2.3 to §2.6, each with a worked example beside the document.

## Layout in etalii.adp

```text
definitions/
├── diagrams/
│   ├── mindmap.dis                    (unchanged, FR-031)
│   ├── mindmap.md                     (unchanged; its gap section is read by the trace)
│   ├── mindmap.atd                    (new, the root)
│   ├── mindmap.notation.atd           (new, a part)
│   ├── mindmap.trace.json             (new)
│   └── conformance/mindmap/<case>/
│       ├── conformance.json
│       └── <input files, byte for byte>
├── designers/  (the same for knowledge and hierarchical-requirement)
└── editors/
    ├── plain-text.atd, markdown.atd, json.atd, xml.atd, yaml.atd
    ├── <name>.trace.json
    └── conformance/<name>/<case>/…
```

## `conformance.json`

```json
{
  "tool": "freeplane/mindmap",
  "description": "../../../mindmap.atd",
  "inputs": { "body": "plan.mm", "registration": "plan.adp" },
  "read": {
    "elements": [{ "id": "ID_1", "type": "Topic", "attributes": { "text": "Plan", "folded": false } }],
    "relations": [],
    "findings": []
  },
  "drawing": { "$ref": "drawing.read.json" },
  "steps": [
    { "action": "addSibling", "select": ["ID_2"],
      "splices": [{ "operation": "insert-entry", "start": 412, "end": 412, "text": "<node TEXT=\"Topic\" ID=\"ID_3\"/>\n" }],
      "expectFile": "after-1.mm", "findings": [], "drawing": { "$ref": "drawing.1.json" } },
    { "undo": true, "expectFile": "plan.mm" }
  ],
  "provenance": {
    "bytes": { "host": "standalone", "repository": "etalii.adp.ide.standalone", "commit": "396c776", "source": "etalii.adp.ide.desktop/parity/goldens/freeplane/mindmap/add-sibling/" },
    "reading": { "host": "desktop", "repository": "etalii.adp.ide.desktop", "commit": "fe5feec", "recordedWith": "<the commit atd record ran at>", "source": "atd record" },
    "drawing": { "host": "desktop", "repository": "etalii.adp.ide.desktop", "commit": "fe5feec", "recordedWith": "<the commit atd record ran at>", "source": "atd record" }
  }
}
```

Generated ids are recorded as the reference host generated them, as `recorded.json` does today; the runtime is given the recorded ids in order so that bytes can be equal. `commit` is the reference commit whose behaviour is recorded; `recordedWith` is the commit of the desktop host that `atd record` ran at, and `atd record --check` in the desktop host's Build keeps the two in step.

## Validation result

A difference names the step, the part (`bytes`, `splices`, `reading`, `findings`, `drawing`, `refused`), the expected and actual values (for bytes, the first differing line), and the construct of the description that produced the value (the binding rule for bytes and readings, the notation for drawings, the constraint for findings, the operation or script function for steps). Story 4's independent test seeds one difference and expects exactly one reported.

## `<name>.trace.json`

```json
{
  "tool": "freeplane/mindmap",
  "description": "mindmap.atd",
  "companion": { "file": "mindmap.md", "sections": ["13. What DISL still lacks for this type", "11. Known gaps"] },
  "items": [
    { "id": "13-what-disl-still-lacks-for-this-type/1", "text": "Sibling naming: a new topic takes the first free name.", "statedBy": "fn siblingName" },
    { "id": "13-what-disl-still-lacks-for-this-type/2", "text": "Positions kept in the registration.", "statedBy": "binding freeplane.registration.layout" },
    { "id": "11-known-gaps/1", "text": "Inline images are drawn by the host.", "hostConcern": "rendering", "reason": "Pixels of an embedded image are the host's to draw; the description states where the image goes." }
  ],
  "hostCode": [
    { "host": "desktop", "repository": "etalii.adp.ide.desktop", "commit": "fe5feec", "path": "modules/diagrams/mindmap/src/actions.rs", "lines": "12-58", "behaviour": "A new topic is named Topic, Topic 2, … by the first free number among its siblings.", "statedBy": "fn siblingName" }
  ]
}
```

The items, paths and lines above are illustrative; the real ones come from reading the files at the reference commits.

## Checks

- `validate-examples.py`: every `conformance.json` and `*.trace.json` valid against `atd.schema.json`; every input file present; every companion item in its trace exactly once; each `hostConcern` one of the ATD document's list.
- `atd check --trace`: every `statedBy` resolves in the description.
- `atd validate`: every case passes in the desktop host; the WebAssembly module VS Code ships gives the same result for every case in the desktop host's Build, and VS Code's *Validate Tool Description* gives the same result (it runs that module).
