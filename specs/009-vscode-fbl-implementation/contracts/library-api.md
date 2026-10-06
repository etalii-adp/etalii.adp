# Contract: the FBL library's public surface

**Feature**: [vscode-fbl-implementation.spec.md](../vscode-fbl-implementation.spec.md) | **Research**: [R2](../research.md), [R9](../research.md), [R11](../research.md)

What `etalii.adp.ide.vscode/src/core/fbl/index.ts` exports, and so what `AdpApi.fbl` holds in the running plug-in. It is standalone's public API at `25fc7b4a` in TypeScript's idiom; a name here that has no counterpart there is marked *new*. Signatures are a contract for the tasks, not code to copy: a parameter may gain an optional member while the port is written, and nothing listed here may be dropped.

## Rules for the whole surface

- A body, a registration and an FBL document are `Uint8Array`. Offsets are UTF-8 byte offsets, including a byte-order mark.
- Every function is synchronous and has no effect outside its return value, except those that take an `FblFiles` or a writer.
- Nothing throws on the content of a body. A function throws only for a caller's mistake that standalone throws for: saving an unreadable or read-only body, resolving a reference to a binding that does not exist.
- Nothing here names a tool type, an origin or one of the example bindings (FR-001).
- Nothing here imports `vscode` or a browser global.

## Values

```ts
interface Span { start: number; end: number }

type SpliceOperation =
  | 'replace-value' | 'insert-key' | 'remove-key' | 'insert-entry' | 'remove-entry'
  | 'ensure-container' | 'remove-container' | 'rewrite-reference'
  | 're-emit-line' | 'open-block' | 'self-close';

interface FblSplice { operation: SpliceOperation; start: number; end: number; text: string }
interface Edit { splices: readonly FblSplice[]; snapshot?: boolean }

interface SourceLocation { file: string; line: number; column: number; length: number }
interface Finding { code: string; severity: 'error' | 'warning' | 'info'; message: string; location: SourceLocation }
interface LoadProblem { pointer: string; severity: 'error' | 'warning'; message: string }

type ModelChange =
  | { kind: 'save' }
  | { kind: 'add'; type: string; id?: string; attributes: Readonly<Record<string, unknown>>; parent?: string }
  | { kind: 'set'; id: string; attributes: Readonly<Record<string, unknown>> }
  | { kind: 'remove'; id: string }
  | { kind: 'place'; id: string; x: number; y: number }
  | { kind: 'identify'; key: string; id: string };

type PlanResult = { planned: Edit } | { refused: string };
type UndoResult = { done: readonly FblSplice[] } | { refused: string };
```

`applyEdit(bytes, edit): Uint8Array` and `inverseOf(bytes, edit): Edit` are exported for a caller that holds the bytes itself.

## Loading (FBL 14.1, steps 1, 2, 4, 5, 6)

```ts
loadDocument(json: Uint8Array, path?: string): { document?: FblDocument; problems: readonly LoadProblem[] }
loadDocumentAt(path: string, files: FblFiles): { document?: FblDocument; problems: readonly LoadProblem[] }
resolveReference(reference: string, referrer: string, files: FblFiles): FblBinding   // throws when it resolves to nothing
```

## Text (FBL 2.6)

```ts
class BodyText {
  constructor(bytes: Uint8Array)
  readonly bomLength: number
  readonly invalidOffset: number | undefined
  readonly lines: readonly TextLine[]          // { start, contentEnd, end, ending }
  readonly dominantEnding: '\r\n' | '\n' | '\r' | undefined
  position(offset: number): { line: number; column: number }
}
```

## Bodies (FBL 4 to 7)

```ts
interface FblOptions {
  fileName?: string
  maxBodyBytes?: number
  maxEntries?: number
  regexSteps?: number                                  // new: standalone has regexTimeout
  deriveId?: (request: IdRequest) => string | undefined
  registrationHeaders?: ReadonlyMap<string, string>
  resource?: string
  identities?: ReadonlyMap<string, string>
}

class OpenBody {
  static open(bytes: Uint8Array, binding: FblBinding, options?: FblOptions): OpenBody
  readonly bytes: Uint8Array
  readonly model: FblModel          // elements, findings, unreadable, views, resources, find(id), selectView(header)
  readonly isReadOnly: boolean
  readonly canUndo: boolean
  readonly canRedo: boolean
  plan(change: ModelChange): PlanResult
  change(change: ModelChange): PlanResult              // plans and applies
  apply(edit: Edit): void
  undo(current?: Uint8Array): UndoResult               // current: the bytes on disk, checked for drift
  redo(current?: Uint8Array): UndoResult
  reload(bytes: Uint8Array): void
  save(write: (bytes: Uint8Array) => void): void       // throws for an unreadable or read-only body
}
```

The two drift sentences are exported as `driftUndo` and `driftRedo`.

## Registrations (FBL 8)

```ts
class RegistrationDocument {
  static read(bytes: Uint8Array): RegistrationDocument
  readonly origin: string
  readonly headers: ReadonlyMap<string, string>
  readonly body: string | undefined
  readonly view: string | undefined
  readonly resource: string | undefined
  positions(): ReadonlyMap<string, { x: number; y: number }>
  identityMap(): ReadonlyMap<string, string>
  unknownHeaders(declared: readonly string[], fileName: string): readonly Finding[]
  staleEntries(ids: ReadonlySet<string>, fileName: string): readonly Finding[]
}

class OpenRegistration {                                 // history as OpenBody; accepts save, place, identify
  static open(bytes: Uint8Array): OpenRegistration
  readonly document: RegistrationDocument
  knownIds: ReadonlySet<string> | undefined
  knownKeys: ReadonlySet<string> | undefined
  isEphemeral: (id: string) => boolean
}

locateBody(registrationPath: string, registration: RegistrationDocument, binding: FblBinding,
           workspaceRoot: string, files: FblFiles): BodyLocation   // { path, exists, isFolder, refusal?, isMissing }

class LegacySidecar {
  static open(bytes: Uint8Array): LegacySidecar
  static pathFor(pattern: string, bodyPath: string): string
  readonly isUnreadable: boolean
  positions(view: string): ReadonlyMap<string, { x: number; y: number }>
  identities(): ReadonlyMap<string, string>
  planPlace(view: string, id: string, x: number, y: number): PlanResult
  planIdentify(key: string, id: string): PlanResult
}
```

## Routing and templates (FBL 10.1, 12, 13)

```ts
candidates(fileName: string, bytes: Uint8Array, bindings: readonly FblBinding[]): readonly FblBinding[]
suggests(binding: FblBinding, bytes: Uint8Array): boolean
readings(binding: FblBinding, bytes: Uint8Array): readonly string[]
bare(binding: FblBinding): string | undefined
suggestsReading(binding: FblBinding, origin: string, bytes: Uint8Array): boolean
markerMatches(marker: Marker, bytes: Uint8Array): boolean
globMatches(glob: string, path: string, ignoreCase: boolean): boolean

recogniseFolder(binding: FblBinding, folder: string, files: FblFiles, ignoreCase?: boolean): boolean
folderFiles(binding: FblBinding, folder: string, files: FblFiles, ignoreCase?: boolean): readonly FolderFile[]

produceTemplate(binding: FblBinding, origin: string, fileName: string,
                newId: (rule: string) => string, plugin?: PersistencePlugin): Uint8Array | undefined
replacePlaceholders(template: string, fileName: string, newId: (rule: string) => string): string
templateKey(baseName: string): string
```

## Plugins (FBL 11.1 to 11.3, the host's side)

```ts
interface PersistencePlugin {
  readonly id: string
  read(request: PluginReadRequest): PluginReadResult
  plan(request: PluginPlanRequest): PluginPlanResult
  template(request: PluginTemplateRequest): Uint8Array
  watch?(last: PluginReadResult): readonly string[]
}

class PluginBody {                                       // history, drift and save as OpenBody
  static open(bytes: Uint8Array, binding: FblBinding, plugin?: PersistencePlugin, fileName?: string): PluginBody
}
```

No plugin is part of the library.

## Files (*new*, research R9)

```ts
interface FblFiles {
  read(path: string): Uint8Array | undefined
  kind(path: string): 'file' | 'folder' | 'link' | undefined   // never follows a link
  list(folder: string): readonly string[]                      // entry names; ordinal order
  readonly ignoresCase: boolean
}

const nodeFiles: FblFiles    // node:fs and node:path
```

## In the plug-in

```ts
// src/extension/extension.ts
export interface AdpApi {
  readonly viewTypes: readonly string[];
  /** The plug-in's FBL implementation. No tool uses it yet (etalii.adp spec 009). */
  readonly fbl: typeof import('../core/fbl');
}
```

This member is the only reference to the library outside `src/core/fbl/` and the tests. `package.json` contributes nothing for it.
