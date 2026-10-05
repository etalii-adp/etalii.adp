# etalii.adp

The specifications for ADP ("A Different Perspective"): the formats and languages that the ADP tools in the `etalii.adp.ide.*` repositories implement. Every tool is a diagram, a designer or an editor, and each kind has a specification language, in which a tool engineer specifies a tool type, and a definition language, in which the tools users create of that type are stored. The six live under `specifications/`: DISL, the Diagram Specification Language (`specifications/disl/`), and DID, the Diagram Definition Language (`specifications/did/`), have content; DESL and DED (designers) and EDSL and EDD (editors) are placeholders. Beside them, FBL, the Format Binding Language (`specifications/fbl/`), serves every kind: it declares how a tool reads and writes a model that lives in another tool's file (Structurizr DSL, YAML, `.mm` and so on), with byte-preserving splices, and defines the `.adp` registration.

The vocabulary (tool, diagram, designer, editor, tool engineer, specification, definition, runtime) is defined in [docs/terminology.md](docs/terminology.md). Use its words in every file, name and message, and change a definition there first.

## Creating a new repository

Every repository in the `etalii-adp` organization follows the rules in [docs/new-repository.md](docs/new-repository.md): its name, the `develop` default branch, pull-request-only delivery with merge commits, the GitHub settings, the files it starts with, and access for Claude. Work through that list whenever a repository is created, and update it in the same change that alters one of its rules.

## How work is done here: spec-driven development (GitHub Spec Kit)

Every change starts as a specification. Use the Spec Kit skills in `.claude/skills/` in order:

1. `/speckit-constitution` — project principles, in `.specify/memory/constitution.md`: what this repository is for, the formats a specification uses, and where its files live. Read it before any other step; plans are checked against it.
2. `/speckit-specify` — a feature spec under `specs/NNN-feature-name/`, on its own `features/NNN-feature-name` branch (the `git` extension creates it).
3. `/speckit-clarify` — optional, resolves `[NEEDS CLARIFICATION]` markers before planning.
4. `/speckit-plan` — technical plan, research, data model and contracts.
5. `/speckit-tasks` — ordered, testable tasks.
6. `/speckit-analyze` — optional cross-artifact consistency check.
7. `/speckit-implement` — execute the tasks.

The SpecKit Companion extension (`.specify/extensions/companion/`) records each run in the spec's `.spec-context.json`. `/speckit-companion-status` says where a spec stands and `/speckit-companion-resume specs/NNN-feature-name` continues it from its last completed step.

Specs say *what* and *why*; plans say *how*. Do not put implementation choices in a spec.

### Specifications for every repository live here

This repository holds the Spec Kit features of every `etalii-adp` repository, not only its own: a change to `etalii.adp.ide.intellij`, `etalii.adp.ide.vscode`, `etalii.adp.ide.eclipse`, `etalii.adp.site` or `.github` is specified here too, and those repositories have no Spec Kit setup of their own. `etalii.adp.ide.standalone` is the exception: it keeps planning with spec-workflow in its own `.spec-workflow/`.

- A new feature is `specs/NNN-feature-name/`, in the one sequence, whichever repository its code lands in; put the repository in the name when it is one (`007-intellij-settings-search`).
- Its `tasks.md` names files with their repository as prefix (`etalii.adp.ide.intellij/core/...`). The clones sit side by side (`C:\git\<repository>` locally, `/home/user/<repository>` in a cloud session), so the paths resolve from either. Each repository it touches gets a branch of the feature's name and its own pull request; spec 001-ci-and-badges is the model.
- A session started in another repository's folder finds no `.specify/`; start it here, or set `SPECIFY_INIT_DIR` to this repository.
- Plans check `.specify/memory/constitution.md` and, for code in another repository, that repository's principles in `.specify/memory/repositories/<repository>.md`.
- Features specified elsewhere before 2026-10-05 are kept under `specs/<repository>/NNN-feature-name/` with their old numbers; see [specs/README.md](specs/README.md). Continue one with the companion's `--feature-dir specs/<repository>/NNN-feature-name`.

## Branches and delivery

- `develop` is the integration branch.
- Feature work happens on its own branch named `features/<name>`, in its own worktree; Spec Kit names them `features/<number>-<name>` (its `branch_prefix` is set to `features`). The one exception is `claude/<name>`, which Claude's cloud sessions are handed by their harness.
- A feature branch is never merged locally into `develop`. When its work is done, push the branch from the worktree it was built in to `origin` and open a pull request into `develop`; nothing reaches `develop` except through a pull request. There is no branch protection, so this holds by convention alone: never push to `develop` directly.
- Pull requests are merged with a merge commit, never a squash or a rebase.
- When the pull request is merged or closed, delete the branch locally and on `origin`, and remove the worktree.

## Writing specifications

- Normative text uses the RFC 2119 and RFC 8174 key words in bold capitals, as the DISL specification does.
- Each specification lives in its own folder under `specifications/<name>/`, with its prose `<NAME>-specification.md`, its JSON Schema `<name>.schema.json` and its examples `*.<name>` side by side; `<name>` is the language's acronym in lowercase (`disl`, `did`, `desl`, `ded`, `edsl`, `edd`, `fbl`).
- `python .github/scripts/validate-examples.py` validates every `*.dis`, `*.did` and `*.fbl` example, the `.adp` registrations and round-trip fixtures under `specifications/fbl/`, the legacy fixtures under `specifications/*/legacy/` and the tool definitions under `definitions/` against their schemas; the Build workflow runs it on every pull request.
- Every specification document, placeholders included, ends its header table with the `Licence` row: `` | Licence | [Apache License 2.0](https://github.com/etalii-adp/etalii.adp/blob/develop/LICENSE) (`Apache-2.0`) | ``. `python .github/scripts/licence-check.py` checks that row in every `specifications/<name>/<NAME>-specification.md`, that `LICENSE` is still the Apache License 2.0 with the line `Copyright © Peter Vrenken 2026`, and that no second licence file sits at the root or under `specifications/`; the Build workflow runs it on every pull request.
- When writing markdown files do not split lines to ensure a maximum line length is honored.
