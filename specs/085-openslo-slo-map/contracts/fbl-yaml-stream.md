# Contract: FBL 0.22, the documents of a YAML stream

The language change of research R1, as FBL section 4.3 will state it.

- **`body.stream`** *(FBL 0.22)*, `yaml` family only: `"first"` (the default, as before 0.22) or `"documents"`.
- **With `"documents"`**, the root of the lossless reading is a sequence whose items are the stream's documents, in order. A document's own span runs from the first byte of its `---` line, or of the body for a first document without one, to the last byte before the next document's `---` line, or the end of the body. A comment or blank line before a `---` belongs to the document before it; a `...` end marker belongs to the document it ends.
- **Selectors** start at that sequence: `/*` is every document, `/0` the first, `/*/spec` the `spec` of each.
- **Insert at the root** writes the new document after the last one: a `---` line, then the document's text from its `emit`, each line ended as the body's lines are. A body whose only document has no `---` line keeps it so.
- **Remove of a document** removes its span, so the `---` line of the next document follows the document before it; removing the last document removes its `---` line too.
- **Markers** (12.2) are evaluated on the first document.
- **A binding without `stream`** reads and writes as in 0.21. Every valid 0.21 document is a valid 0.22 document with the same meaning.
- **Fixtures**: `yaml-stream-read` (three documents, one without a leading `---`, comments between them, an end marker) and `yaml-stream-edits` (a set in the second document, an insert at the root, a removal of the middle and of the last document), each with the bytes it writes.
- **Schema**: `$defs/Body` takes `stream`, an enum of the two values, allowed only with `family: "yaml"`.
