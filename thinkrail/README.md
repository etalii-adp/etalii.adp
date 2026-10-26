# ThinkRail's copy of the specifications

This folder copies the Spec Kit feature specifications into ThinkRail's spec-graph format, so that they show in ThinkRail's specs pane and can be searched and walked with its spec tools. ThinkRail indexes a Markdown file only when its YAML frontmatter has an `id` and a `type`. The feature specifications have no frontmatter, so they are copied here with one added. The constitution and the language specifications carry their own frontmatter and are nodes of the spec graph where they are (`constitution`, and `disl-specification` and so on under each language node), so they are not copied.

The copies are generated and are never edited by hand. The sources stay the truth: change the source, then run

```
python .github/scripts/thinkrail-specs.py
```

`python .github/scripts/thinkrail-specs.py --check` reports a copy that is out of date or whose source is gone.

| Source | Copy | ThinkRail type |
|---|---|---|
| `specs/NNN-name/` (its `*.spec.md`) | `specs/NNN-name.md` (`id: feature-NNN-name`) | `task-spec` |
| `specs/<repository>/NNN-name/` (its spec file) | `specs/<repository>/NNN-name.md` (`id: intellij-…` or `site-…`) | `task-spec` |

- Every copy has the feature archive (`specs-archive`, in [`specs/SPEC.md`](../specs/SPEC.md)) as its `parent`.
- A feature also `references` the language node of each language that its folder name names (`disl`, `fbl`, `format-binding`, `adp-tool-language` and so on).
- A feature's `status` comes from its `.spec-context.json`: `completed` and `implemented` become `done`; `implementing`, `ready-to-implement` and `planned` become `active`; `specified` and `draft` become `draft`.
- The script refuses a copy whose id is already used by a node of the spec graph, or whose `parent` or `references` name no node.
- Only a feature's specification is copied. Its plan, tasks, research and contracts stay in `specs/` and are linked from the copy, whose relative links are rewritten to point at the files beside the source.
