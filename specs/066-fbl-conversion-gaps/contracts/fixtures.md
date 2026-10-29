# Contract: the fixtures, the refused bindings, and what a fixture can state

All under `specifications/fbl/`. Each fixture folder holds its `fixture.json` (`$defs/Fixture`, section 15.3) and its input, byte for byte as the source wrote it (`specifications/fbl/fixtures/** -text` already). A body copied from etalii.adp.ide.standalone names, in the fixture's `doc`, its path there and the commit it was copied at; none brings a licence file (Assumptions; `licence-check.py`). Each new fixture is seen to fail `validate-examples.py` with one planted wrong offset before it is committed (SC-003), and every grammar fixture's `read` is also checked by the reading check of research R20. Research: R19, R20.

## What a fixture gains

Two constructs of this feature write or produce something one input file cannot show, so `$defs/Fixture` gains two optional properties, in the pull request whose construct needs them:

| Property | Shape | Meaning | PR |
|---|---|---|---|
| step `expectFiles` | map relative path → string | The bytes, after the step, of each file beside the input that the step's splices name in their `file` (a legacy layout, a legacy identities file). A splice without `file` is the input's. The validator replays each file's splices against it, undo and redo included. | A |
| `template` | `{name, origin}` | The input is the new document the binding's template gives for a file of that name and that reading (section 13): the validator writes the template with its placeholders replaced and compares it with the input byte for byte; `read` and `steps` then apply to it as to any input. | B |

`$defs/Splice` already has `file` (folder subjects); section 15.3 says it names a file beside the input for these steps too.

## Pull request A: Structurizr DSL and the shared constructs

Binding `../../structurizr.fbl#workspace` unless the row names another. Sources are under `src/diagrams/c4/backend/EtAlii.Adp.Diagram.C4.Tests/Fixtures/` of the standalone host.

| Folder | Input, and its source | Shows | Requirements, scenarios |
|---|---|---|---|
| `structurizr-open-block/` | unchanged | Passes under the rewritten binding with input, splices and expected bytes unchanged | FR-023, FR-031, SC-004 |
| `structurizr-comments/` | `comments-everywhere.dsl` | The elements read; `model { //` owned by `model`; a set on a line with a trailing comment changes the value's bytes only; a remove beside `/* block comment between elements */` takes the comment as section 4.9 states | FR-001, FR-004; US1 s1, s2, s3 |
| `structurizr-trailing-comments/` | `findings/trailing-comments.dsl` | `//` and `#` after a statement, `"a // b"` and `"#1"` as strings, each set keeping its comment | FR-001; s2; edge case 1 |
| `structurizr-block-comments/` | `findings/block-comments.dsl` | A three-line comment holding a declaration and a brace reads as nothing; the statement before `/* start` on its line is read; removing the element next to it | FR-004; s3; edge case 2 |
| `structurizr-escapes/` | `findings/escaped-quote.dsl` | `"Jo \"the user\""` reads `Jo "the user"`; `C:\temp` reads as written; a set to `Parity "name"` writes `"Parity \"name\""`; a set to a value with a line break is refused | FR-005; s4; edge cases 5, 6 |
| `structurizr-absent-arguments/` | written here, from `C4AppendedArgument` cases | `container "Web" // c` set technology: ` "" "Java"` before the comment, and its undo; on `softwareSystem "S" {` a set and a written part leave the block's bytes; `container "Web" ""` set technology replaces the empty argument; clearing the last positional argument leaves `""` before it | FR-006, FR-007; s5, s6; edge cases 7, 8 |
| `structurizr-recover-nested/` | `findings/unbalanced.dsl`, with one statement in `model` that does not parse (derived; the change is named in `doc`) | Every element read, the siblings after the broken statement included; `fbl.unparsed-text` at its line; `fbl.unclosed-block` for each missing `}`; an add into the unclosed block refused | FR-002; s7 |
| `structurizr-recover-edges/` | written here | A stray `}` at the top level (`fbl.unmatched-close`), a `/*` never closed (`fbl.unclosed-comment`, nothing after it read), and a top-level statement that does not parse (0.9's recovery, unchanged) | FR-002, FR-004; edge cases 3, 9, 10 |
| `structurizr-view-statements/` | `findings/view-statements.dsl` with a registration `view: containers` (input: the `.adp`) | The document attributes are the container view's `include`, `exclude`, `title`, `autoLayout` and scope; another view's statements reach nothing | FR-008, FR-009; s8 |
| `structurizr-view-without-key/` | `findings/view-without-key.dsl` with a registration whose `view` names no view | No element of a view's content, no finding; a `place` refused and nothing written; the default keys of views written without one | FR-011, FR-008; s10 |
| `structurizr-legacy-layout/` | `findings/sidecar-keys.dsl`, its `.layout.json`, and a registration | Keys matched ignoring case; the first of two matching keys applies and the other is reported; a move writes `x` and `y` in the shortest form (`expectFiles`); the stale `gone` entry pruned at that write; `Unknown view` untouched | FR-010; s9; edge case 11 |
| `structurizr-add-view/` | written here | A BlockRule's insert adds a view block, and its undo | FR-012 |
| `structurizr-rename/` | `comments-everywhere.dsl` | Renaming `web` rewrites every relationship that names it (`rewrite-reference`), keeping each line's comments, and its undo | FR-001, section 15.3's coverage |
| `structurizr-gathered-tags/` | written here | A declaration's tags and the `tags` statements of its block read as one list, in document order; a set refused as read-only | FR-013 |
| `grammar-comment-start/` | written here, with a binding and a small grammar of its own | A `//` inside a URL token is not a comment; one after a token is | FR-001's last sentence |
| `w3c-turtle-grammar/`, `w3c-turtle-grammar-partial/` | unchanged | Pass unchanged | FR-031 |

## Pull request B: the Databricks bundle file

Binding `../../databricks.fbl#configuration` (or one level deeper in subfolders). Sources are under `src/diagrams/databricks/` of the standalone host.

| Folder | Input, and its source | Shows | Requirements, scenarios |
|---|---|---|---|
| `databricks-readings/bundle/`, `job/`, `pipeline/` | a registration each, over `databricks-readings/databricks.yml` from `examples/lakehouse/databricks.yml` | The bundle reading's resources, the job's tasks and dependencies, the pipeline's own attributes and libraries, no element of a type the reading's metamodel lacks; an edit in each, so each is editable | FR-014, FR-015, FR-016; s1 |
| `databricks-rename-shared/` | `lakehouse/databricks.yml` through the job reading | A task renamed with its `depends_on` references in one edit, and its undo; the bundle reading's fixture of the edited body reads the new name | FR-015, FR-017; s2 |
| `databricks-resources/` | registrations over `Fixtures/two-jobs-two-pipelines.yml` | Each job and pipeline registration selects its `resource:` header, or the first of its kind without one; the bundle selects none; a header naming no resource opens empty with a finding | FR-016, FR-017; s3; edge case 13 |
| `databricks-flow-empty/` | `Fixtures/flow-collections.yml` | A task added to `tasks: []`, read back with one task, and its undo to `tasks: []` byte for byte | FR-018; s4 |
| `databricks-flow-one-line/` | `Fixtures/flow-dependencies.yml` | A dependency on `b` written `, {task_key: b}` inside `[{task_key: a}]`; removing it restores the line; an insert into a flow sequence over several lines refused | FR-018; s5; edge cases 14, 15 |
| `databricks-refusals/` | written here | "The job has no tasks section to add into." as the refusal of an insert without a container; an `empty` refusal's sentence | FR-019; s6 |
| `databricks-library-add/` | a YAML pipeline from the corpus | A library added as `- notebook:` with `path:` below it, read back as added | FR-020; s9 |
| `databricks-secondary/` | written here | `target` read as the schema when `schema` is absent; a set writes `schema` and removes `target`; both present: `schema` read, `target` removed on write | FR-021; s7; edge case 16 |
| `databricks-template-key/` | `template: {name: "My_Job.yml", origin: "databricks/job"}` | The new document's key is `my_job` | FR-022; s8 |
| `dependency-graph-empty-flow-sequence/` | unchanged input and splices | Its `doc` says FBL now states the opening of an empty flow sequence | FR-018 |

## Pull request C: the Wardley map

Binding `../../wardley-map.fbl#map`. Sources are under `src/diagrams/wardley-map/backend/EtAlii.Adp.Diagram.WardleyMap.Tests/Fixtures/` and `src/diagrams/wardley-map/examples/example 2/` of the standalone host.

| Folder | Input, and its source | Shows | Requirements, scenarios |
|---|---|---|---|
| `wardley-pipelines/` | `pipelines-both-forms.owm` | A pipeline whose `{` is on the next line owns its block; a pipeline added with its brace on its own line, and its undo removing all of it | FR-023; US3 s1 |
| `wardley-brace-ending/` | `brace-ending-statements.owm` | `title A map {` opens nothing and keeps its `{`; the braces balance | FR-003; s2 |
| `wardley-unclosed-pipeline/` | `unclosed-pipeline.owm` | The pipeline's children read, `fbl.unclosed-block`, an add into the pipeline refused, another edit planned | FR-002; s3 |
| `wardley-comments/` | `comments-everywhere.owm` and `trailing-comments.owm` (two subfolders) | A coordinate change keeps `// hot`; the `//` of `https://` is not a comment | FR-001; s4 |
| `wardley-trailer/` | `lenient-trailer.owm` | `inertia`, `label [-30, 12]` and `( market )` read in any order; one set changes only its own bytes; a label written on `component Milk [0.3, 0.6]` and cleared with one separator; a segment twice reads the first; the decorators as one set, an added and a removed one | FR-024; s5; edge case 17 |
| `wardley-annotation-positions/` | `annotations-and-labels.owm` | Two positions of `annotation 1`, each of two numbers; one item set alone; one added and one removed with its separator | FR-025; s6 |
| `wardley-legacy-identities/` | `example 2/annotations-and-labels.owm` with its `.identities.json` and `.adp` | Every element has the stored id for its kind and key; no new id; an entry of an undeclared kind kept and reported | FR-026, FR-027; s7; edge case 18 |
| `wardley-duplicate-names/` | `duplicate-names.owm` and `same-key-twice.owm` (two subfolders) | Each holder of `Tea` has an id of its own, the later ones keyed with `ordinal`; the entry first written with the next write of the body (`expectFiles`) | FR-028; s8 |
| `wardley-rename-identity/` | `example 2/annotations-and-labels.owm` with its `.identities.json` | A rename moves the identity entry in the same edit (`expectFiles`), and the undo moves it back; a rename to a name another holder has is refused | FR-029; s9; edge case 19 |

## The refused bindings

Under `refused/`, each valid against the schema and refused by a check of section 14.1 that the schema cannot make, its `doc` naming the check (data-model.md, *Validation*): `grammar-gather-writable.fbl` (A), `grammar-selected-view-without-views.fbl` (A), `grammar-create-after-unknown.fbl` (A), `grammar-recover-nested-unknown-terminal.fbl` (A, refused by `atd-grammar.py --bindings`), `origins-not-claimed.fbl` (A or B), `items-not-many.fbl` (C).

## The operation coverage

Section 15.3's "together the fixtures exercise every operation of section 6.1" holds for the `grammar` family's writes too once pull request A is merged: `replace-value`, `insert-key`, `remove-key`, `insert-entry`, `remove-entry`, `rewrite-reference` and `open-block` each appear in a `grammar` fixture. The desktop host's `every_operation_of_the_catalogue_is_exercised_by_the_fixtures` reads the same corpus.
