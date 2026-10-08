# Contract: Published Tree

What `etalii.adp.ide.notion` publishes once it holds an add-on, and the command that writes it. It replaces [the contract of that name of spec 011](../../011-notion-repository/contracts/published-tree.md), which left an add-on's folder to "the first add-on's feature"; what that contract says and this one does not change still holds. The site's `deploy` workflow and the repository's own `Build` both code against this. Decisions are in [research.md](../research.md) D4, D6, D11 and D12.

## Command

```text
node scripts/build.mjs --out <dir>
```

| Rule | Requirement |
| --- | --- |
| The command line is unchanged, so the site's `deploy` workflow changes nothing | D12 |
| Run from the root of a checkout of `etalii.adp.ide.notion`, with Node of the version in the site's `.nvmrc`. No `npm install` is needed before it: the script runs `scripts/ensure-dependencies.mjs`, which runs `npm ci` when `node_modules` is missing or older than `package-lock.json` | D12; replaces "no `npm install` before it" |
| `--out <dir>` is required; `<dir>` is created when missing, and nothing is written outside it and `node_modules` | Spec 011 D4 |
| Exit code 0 when the whole tree is written; any other exit code means the tree MUST NOT be published | Spec 011 FR-013 |
| The revision is the output of `git rev-parse HEAD` in the checkout the script runs in | Spec 011 FR-009 |
| The add-ons are the folders directly under `addons/`. Shared code is in `src/` and is no add-on | Plan: Structure Decision |
| A folder under `addons/` whose name is not a valid `<id>`, that has no `index.html` or no `addon.json`, or whose copied files differ from their record, fails the build | FR-003, D6 |
| The build fetches nothing but what `npm ci` installs from `package-lock.json`: no specification, binding or library is read from another repository or a branch while it runs | D6 |
| The same command, with the same result for the same revision, runs in `Build` on every pull request and in the site's `deploy` | Spec 011 D2 |

## Tree

```text
<dir>/
├── index.html                          # the add-on index
└── gartner-hype-cycle-graph/           # one folder per add-on
    ├── index.html                      # the add-on's page
    ├── addon.json                      # names the two files below
    ├── gartner-hype-cycle-graph.dis    # the DISL specification, a copy
    ├── gartner-hype-cycle-graph.fbl    # the FBL binding, a copy
    ├── PROVENANCE.md                   # where the copies came from
    ├── addon.js                        # the shared parts, compiled
    └── addon.css                       # their styles
```

`<dir>` is served as `https://etalii.net/adp-notion`.

| Path in `<dir>` | Address | Content | From |
| --- | --- | --- | --- |
| `index.html` | `https://etalii.net/adp-notion` | The add-on index | Generated |
| `<id>/index.html` | `https://etalii.net/adp-notion/<id>/` | One Notion add-on | `addons/<id>/` |
| `<id>/addon.json`, `<id>/*.dis`, `<id>/*.fbl`, `<id>/PROVENANCE.md` | below `<id>/` | What is particular to the add-on | `addons/<id>/`, copied as they are |
| `<id>/addon.js`, `<id>/addon.css` | below `<id>/` | The FBL library, the interpreter, the history, the store, the canvas, the panels and the frame | `src/`, compiled once and written into every add-on's folder |

`<id>` is the name of the tool type's specification file without its extension (research D11). It matches `^[a-z0-9]+(-[a-z0-9]+)*$` and is not `index`. For this feature it is `gartner-hype-cycle-graph`. A file in `addons/<id>/` named `addon.js` or `addon.css` fails the build: those two names are the build's.

## An add-on's folder

`addons/<id>/addon.json`:

```json
{
  "specification": "gartner-hype-cycle-graph.dis",
  "source": "definitions/diagrams/gartner-hype-cycle-graph.dis",
  "binding": "gartner-hype-cycle-graph.fbl"
}
```

| Key | Value |
| --- | --- |
| `specification` | The file in this folder that is the DISL specification. The page loads it by this relative address when it opens |
| `source` | The path of that specification in `etalii.adp`, which `scripts/sync-specifications.mjs` copies from |
| `binding` | The file in this folder that is the FBL document the specification's `persistence.binding` names. Which of its bindings is used is the fragment of `persistence.binding`, here `ghg` |

| Rule | Requirement |
| --- | --- |
| The two copies are byte for byte what their repositories hold at the commits `PROVENANCE.md` records, and are never edited here | FR-003, SC-008 |
| `PROVENANCE.md` records, for each copy, its repository, its path, the commit and its SHA-256 | D6 |
| The page takes the tool type from the two files at run time; nothing of them is compiled into `addon.js` | FR-002, US1 scenario 6 |
| `addon.js` and `addon.css` are the same bytes in every add-on's folder of one build | FR-027, FR-028 |
| `index.html` refers to `addon.js`, `addon.css` and `addon.json` by relative address and holds no script or style of its own beyond that | FR-028, NFR-005 |

## The add-on index

Unchanged from spec 011: it lists every published add-on with a link to its address, names the revision as the full 40-character commit id, names the repository as `etalii.adp.ide.notion`, and is generated on every build.

| Identifier | Element |
| --- | --- |
| `id="addons"` | The list of add-ons, one item per add-on. Each item links to `<id>/` and shows the `language.label` of the add-on's specification, here `Gartner hype cycle graph` |
| `id="no-addons"` | The sentence saying none is available yet; absent once an add-on is published |
| `id="revision"` | The element whose text is the 40-character commit id |

An item's link is the add-on's folder without a `store`, which shows the state `setup` of [addon-address.md](addon-address.md): how to set a graph up.

## Every published page

| Rule | Requirement |
| --- | --- |
| Works under `/adp-notion`: links and resources within the tree are relative | Spec 011 FR-007 |
| Is displayable as an embed: no `X-Frame-Options`, no `frame-ancestors` policy, and no script that leaves or refuses a frame | Spec 011 FR-014 |
| Loads every resource over HTTPS, and from its own folder only: no font, script, style or image from another host | Spec 011 FR-008 |
| Calls no other host than the service of [service.md](service.md) | FR-010 |
| Holds no secret: no client secret, no token, no key | FR-010, SC-010 |
| Claims no tool that is not published in the same tree, and says what the add-on does not support only by pointing at `docs/disl-support.md` in the repository | FR-005, FR-031 |

## Check in `Build`

The `addons` job runs the command into a temporary folder and fails unless:

- `index.html` exists there, contains the commit id of the checkout, and has one `<id>/index.html` for every folder under `addons/`;
- every `<id>/` holds `addon.json`, the two files it names, `PROVENANCE.md`, `addon.js` and `addon.css`;
- each copied file has the SHA-256 its `PROVENANCE.md` records, and so has every file under `src/fbl/` against `src/fbl/PROVENANCE.md`;
- no `addon.js` holds a name the words test of [shared-parts.md](shared-parts.md) collects from the specifications and bindings under `addons/`, the exempt names apart, so that nothing of them is compiled in;
- no file of the tree holds the text of a secret the workflow knows, nor a string that reads as a Notion token or a client secret.

A `test` job beside it runs `npm test`, which includes the words test of [shared-parts.md](shared-parts.md).
