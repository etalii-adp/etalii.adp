# Contract: Published Tree

What `etalii.adp.ide.notion` publishes, and the command that writes it. The site's `deploy` workflow and the repository's own `Build` both code against this, and so does anyone who embeds an address in a Notion page. Decisions are in [research.md](../research.md) D4, D5 and D6.

## Command

```text
node scripts/build.mjs --out <dir>
```

| Rule | Requirement |
| --- | --- |
| Run from the root of a checkout of `etalii.adp.ide.notion`, with Node of the version in the site's `.nvmrc` and no `npm install` before it | Plan: no dependencies |
| `--out <dir>` is required; `<dir>` is created when missing, and nothing is written outside it | D4 |
| Exit code 0 when the whole tree is written; any other exit code means the tree MUST NOT be published | FR-013 |
| The revision is the output of `git rev-parse HEAD` in the checkout the script runs in, never a value passed in by the caller | FR-009, D4 |
| The add-ons are the folders directly under `addons/`; files there, such as `addons/README.md`, are no add-on | D4 |
| A folder under `addons/` whose name is not a valid `<id>`, or that would publish no `index.html`, fails the build | FR-010 |
| The same command, with the same result for the same revision, runs in `Build` on every pull request and in the site's `deploy` | D2, D4 |

## Tree

```text
<dir>/
├── index.html            # the add-on index
└── <id>/                 # one per add-on; none in this feature
    └── index.html
```

`<dir>` is served as `https://etalii.net/adp-notion`.

| Path in `<dir>` | Address | Content |
| --- | --- | --- |
| `index.html` | `https://etalii.net/adp-notion` | The add-on index |
| `<id>/index.html` | `https://etalii.net/adp-notion/<id>/` | One Notion add-on |

`<id>` is the id of the add-on's tool type, lowercase with dashes: it matches `^[a-z0-9]+(-[a-z0-9]+)*$`. It is the name of the add-on's folder under `addons/` and nothing else, so an add-on's address does not change when another is added or removed (FR-010). The name `index.html` at the top is taken by the index; no add-on has the id `index`.

What an add-on's folder holds beyond its `index.html`, and how it is built from a DISL specification and FBL bindings, is for the first add-on's feature.

## The add-on index

| Rule | Requirement |
| --- | --- |
| Lists every published add-on, each with a link to its address | FR-009 |
| With no add-on, says that none is available yet, in English | FR-009, US2 scenario 2 |
| Names the revision it was published from: the full 40-character commit id of `etalii.adp.ide.notion`, as text in the page | FR-009 |
| Names the repository as `etalii.adp.ide.notion` | Verbatim Constraints |
| Is generated on every build, never edited by hand | D4 |

Identifiers a check may rely on:

| Identifier | Element |
| --- | --- |
| `id="addons"` | The list of add-ons; it has one item per add-on and none when there is none |
| `id="no-addons"` | The sentence saying none is available yet; present only when the list is empty |
| `id="revision"` | The element whose text is the 40-character commit id |

## Every published page

| Rule | Requirement |
| --- | --- |
| Works under `/adp-notion`: links and resources within the tree are relative, and none points at the root of the domain or into `/adp` by an absolute path | FR-007, FR-012 |
| Is displayable as an embed: no `<meta http-equiv>` with `X-Frame-Options` or a `frame-ancestors` policy, and no script that leaves or refuses a frame | FR-014, D6 |
| Loads every resource over HTTPS | FR-008 |
| Claims no tool that is not published in the same tree | FR-007 |

## Check in `Build`

The `addons` job runs the command into a temporary folder and fails unless `index.html` exists there, contains the commit id of the checkout, and has one `<id>/index.html` for every folder under `addons/`.
