# Contract: the example bindings, their grammars, ATD and the companions

Research: R3, R4, R18, R21, R23.

## The example bindings (FR-033, SC-002)

| File | Binding | Family | PR | Replaces or adds |
|---|---|---|---|---|
| `specifications/fbl/structurizr.fbl` | `workspace` | `grammar`, `{"file": "structurizr.lark"}` | A | Rewritten from the `blocks` family. Keeps its binding name, `claims` (`.dsl`, the six C4 origins), `registration` (`legacyLayout`, `createOnFirstPlacement`) and `template`. Gains the block rules of every view kind with `origins` and `view`, the `selectedView` rules of the view statements, the eight element kinds, the relationship forms, `opens`, `create` with `pad` on positional arguments, `escape`, `gather` for tags, and `recover` with `nested` and `unclosed`. |
| `specifications/fbl/structurizr.lark` | | | A | New: the grammar of research R3. |
| `specifications/fbl/databricks.fbl` | `configuration` | `json`, `alsoRead: ["yaml"]` | B | New: one binding for `databricks/bundle`, `databricks/job` and `databricks/pipeline`, from the conversion's appendix draft, with `origins`, `resource.byOrigin`, text reads (FBL 0.5's `read`), `secondary`, `refusals`, a nested library on add and `template.byOrigin` with `{key:lower}`. |
| `specifications/fbl/databricks-job.fbl`, `databricks-pipeline.fbl` | `job`, `settings` | | | Unchanged (their fixtures name them); their `doc` says `databricks.fbl` is the binding the three readings share. |
| `specifications/fbl/wardley-map.fbl` | `map` | `grammar`, `{"file": "wardley-map.lark"}` | C | New: claims `.owm` and `wardley/map`; every statement kind the module reads; `opens` with `"\n{"`; the trailer's segments with `create`; annotation positions with `items`; `id.sidecar` with `kind` and `ordinal`; `registration.legacyIdentities: "{base}.identities.json"`; `recover` with `nested`. |
| `specifications/fbl/wardley-map.lark` | | | C | New: the grammar of research R4. |

Each declares the `fbl` version of its pull request. `atd-grammar.py --check` builds each grammar in strict mode and compares `specifications/atd/grammar/tables/structurizr.workspace.tables.json` and `wardley-map.map.tables.json`, which `--tables` writes.

Section 17's table: the Wardley map moves to "A declared binding" naming `wardley-map.fbl`, the six C4 types name `structurizr.fbl` *(grammar)*, and the three Databricks types name `databricks.fbl`. Appendix A's list of examples adds the three new files and the two grammars.

## ATD (FR-035)

No change to `specifications/atd/grammar/`. In `ATD-specification.md`:

- section 1.3 and section 11's first sentence name the FBL version the pull request makes;
- section 11.9 adds a bullet for each new `grammar` setting: `recover`'s `nested` and `unclosed`, a slot's `escape` and `items`, an attribute binding's `create` with `after` and `pad` and its `gather`, a rule's `opens` as a settings map and `selectedView`, and a block rule's `at`, `view`, `origins` and `insert` as settings of `block <name> { … }`;
- section 11.3 and 11.6 add `origins`, `secondary`, `refusals`, `resource`'s `byOrigin` and `id { sidecar: { kind, ordinal } }`;
- Appendix C's section C.3 is retitled for the version, its count of properties updated, and one row added per new schema property, for example:

| JSON pointer | ATD | Section |
|---|---|---|
| `fbl.schema.json#/$defs/Recover/properties/nested` | the key `nested` in the value of `recover` (a settings map, §6.4) | §11.9 |
| `fbl.schema.json#/$defs/BlockRule/properties/at` | the setting `at` in the settings block of `block <name>` | §11.4, §11.9 |
| `fbl.schema.json#/$defs/ElementRule/properties/origins` | the setting `origins` of a rule (a list of strings) | §11.3 |

- section 18's version history gains an amendment line per pull request: "0.1, amendment of <date>, FBL 0.1x (spec 066): …", ending, as the 0.9 line does, "Every description that checked before still checks, with the same meaning."

## The companions (FR-034, SC-006)

| Companion | Changes | PR |
|---|---|---|
| `definitions/diagrams/c4-context.md`, `c4-container.md`, `c4-component.md`, `c4-deployment.md`, `c4-dynamic.md`, `c4-system-landscape.md` | *The gaps*: gaps 1 to 8 answered, each with the FBL section and the fixture; their headings no longer say "FBL 4.7 and 4.6"; the format is bound in the `grammar` family by `structurizr.fbl`; gap 12 stays, unsupported on purpose; *Stand-ins*: `AddC4ViewCommand` and the tags stand-in can go (FR-012, FR-013) | A |
| `definitions/diagrams/databricks-bundle.md`, `databricks-job.md`, `databricks-pipeline.md` | *The gaps*: gaps 1, 2, 4, 5, 6 (part 3) and 7 answered, with sections and fixtures; the shared binding is `databricks.fbl`; gaps 8 and 9 stay DISL's | B |
| `definitions/diagrams/wardley-map.md` | *Language gaps*: gaps 1 to 8 answered, with sections and fixtures; the format is bound in the `grammar` family by `wardley-map.fbl`; gaps 9 to 12 stay DISL's | C |

The standalone host's bundled copies follow when it bundles again from a commit that has them.
