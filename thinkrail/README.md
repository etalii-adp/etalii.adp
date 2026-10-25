# ThinkRail's copy of the specifications

This folder copies this repository's specifications into ThinkRail's spec-graph format, so that they show in ThinkRail's specs pane and can be searched and walked with its spec tools. ThinkRail indexes a Markdown file only when its YAML frontmatter has an `id` and a `type`. The Spec Kit files have no frontmatter, so they are copied here with one added.

The copies are generated and are never edited by hand. The sources stay the truth: change the source, then run

```
python .github/scripts/thinkrail-specs.py
```

`python .github/scripts/thinkrail-specs.py --check` reports a copy that is out of date or whose source is gone.

| Source | Copy | ThinkRail type |
|---|---|---|
| `.specify/memory/constitution.md` | `constitution.md`, the root (`id: constitution`) | `goal-and-requirements` |
| `specifications/<name>/<NAME>-specification.md` | `specifications/<name>.md` (`id: spec-<name>`) | `module-design` |
| `specs/NNN-name/` (its `*.spec.md`) | `specs/NNN-name.md` (`id: feature-NNN-name`) | `task-spec` |
| `specs/<repository>/NNN-name/` (its spec file) | `specs/<repository>/NNN-name.md` (`id: intellij-…` or `site-…`) | `task-spec` |

- Every copy has the constitution as its `parent`.
- A feature also `references` each language that its folder name names (`disl`, `fbl`, `format-binding`, `adp-tool-language` and so on).
- A feature's `status` comes from its `.spec-context.json`: `completed` and `implemented` become `done`; `implementing`, `ready-to-implement` and `planned` become `active`; `specified` and `draft` become `draft`.
- A language whose prose is still a placeholder (EDSL, EDD) is `draft`; the other languages are `active`.
- Only a feature's specification is copied. Its plan, tasks, research and contracts stay in `specs/` and are linked from the copy, whose relative links are rewritten to point at the files beside the source.
