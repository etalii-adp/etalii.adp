# Contract: the frame

The seam between `core`, `extension` and `webview` (research R6). Entities are in [data-model.md](../data-model.md).

## What a diagram type supplies to the frame (`core`)

| Function | Gives |
|---|---|
| `read(bodyText, registrationText?)` | a `Model` with its `Finding`s; never throws |
| `view(model, viewOptions)` | the `ViewModel` to draw, culled to the viewport |
| `toolbox(model)` | the `ToolboxEntry` list |
| `forms(model, selection)` | the `Form` for ADP Properties |
| `actions(model, selection)` | the `Action` list for the context menu and shortcuts |
| `edit(model, request, viewOptions)` | an `EditOutcome`: splices, a refusal or a confirmation |
| `newDocument(name)` | the text of a new document |

A diagram type supplies nothing else to the extension. It registers itself by being listed once in the extension's list of diagram types.

## What a diagram type supplies to the canvas (`webview`)

A notation: for each element and relation type, a function from the view-model entry to SVG, the handles a selection shows, how a gesture on it becomes an `EditRequest`, and what is previewed while the gesture runs. Chrome the type needs beyond the canvas's own (the hype cycle's ruler, tag filter, legend and compact switch) is declared in the view model and drawn by the canvas.

## Messages between extension and webview

JSON, each `{ v: 1, type, ... }`.

| Direction | Type | Carries |
|---|---|---|
| extension to canvas | `view` | the `ViewModel`, toolbox, actions for the selection, `readOnly`, the document version it was computed from |
| extension to canvas | `outcome` | the answer to a request: `applied`, `refused` with its sentence, or `cancelled` |
| extension to canvas | `reveal` | an element id to select and bring into view |
| canvas to extension | `ready` | the canvas is loaded and wants a `view` |
| canvas to extension | `viewOptions` | filter, compact and viewport changed |
| canvas to extension | `selection` | the selected ids |
| canvas to extension | `edit` | an `EditRequest`, with the document version the gesture began on |
| extension to properties | `form` | the `Form` for the active diagram's selection, or `none` with the sentence to show |
| properties to extension | `setField` | field id and new value |
| extension to properties | `fieldOutcome` | `applied`, or `refused` with its sentence for that field |

Rules:

- The canvas never changes the model itself; it sends a request and draws the `view` that follows.
- An `edit` whose document version is older than the document's is answered `cancelled` (the edge case of a text edit arriving during a drag).
- A confirmation is asked by the extension with the platform's modal dialog, before any splice is applied.
- Every webview has a content security policy that allows only its own script and style, by nonce, and no remote source.

## Under test

With the environment variable `ADP_TEST` set, the extension also registers `etalii.adp.test.state` (returns the active diagram's last `view` and `form`) and `etalii.adp.test.edit` (submits an `EditRequest` as the canvas would). They are not contributed in `package.json` and not registered otherwise.
