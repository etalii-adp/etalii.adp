# Hosted: a mockup of an ADP solution IDE

An experiment, not a host. It is a clickable mockup of a hosted ADP in which a whole solution, from a small application to a platform, is designed and developed as one hierarchy. Nothing here is specified yet, nothing is connected to a server, and every name and number is example data ("Atlas Platform", a platform for an energy utility).

Open `index.html` in a browser. There is no build step and no server is needed.

## The pages

| Page | Folder | Shows |
|---|---|---|
| Start | `index.html`, `splash/` | The splash screen, with the way in to the login page |
| Login | `login/` | Signing in to a workspace. Any input signs in |
| Projects | `projects/` | The projects and reusable repositories on this computer. Only Atlas Platform opens |
| IDE | `ide/` | The solution IDE: Explorer, document area with tools and a canvas, Properties, Problems, Commit and Git |

The pager at the top of every page jumps between them.

## What the IDE page shows

- The layout follows the JetBrains New UI: a title bar with menus and the update and push widgets, tool-window stripes, three docks whose panels can be moved, and a status bar.
- Everything in a solution is one hierarchy, shown in the Explorer. The root is a git repository, and repositories from outside the project can be linked in at any level, each following a branch or a tag.
- Every level has two views, Logical Structure and File System, set per level and kept in that level's `.adp` file, with personal overrides in `.user.adp`.
- The document area opens an item in its tool (a diagram, a designer or an editor) and switches to Canvas, an infinite plane with a card per child item that can be walked level by level, in step with the Explorer.
- The context menu adds, renames and deletes items, with what is offered depending on the item.

## Where things are

Whatever more than one page uses is in `common/`. Whatever one page uses is in that page's folder.

| Folder | Holds |
|---|---|
| `common/css/` | `tokens.css` (colours, fonts and sizes, dark and light), `base.css` (page frame, buttons, inputs, icons), `popups.css` (menus, toasts, dialogs), `transitions.css` (moving between the pages) |
| `common/js/` | `boot.js` (theme and direction, before the first paint), `dom.js`, `icons.js` (the icon set and the ADP mark), `popups.js`, `nav.js` (going to another page), `mockup.js` (the pager and the "not built yet" notes) |
| `splash/` | `shapes.js` (the four pictures), `cloud.js` (the point cloud), `splash.js`, `splash.css` |
| `login/` | `login.js`, `login.css` |
| `projects/` | `projects.js`, `projects.css`, and the example projects in `data/` |
| `ide/css/` | One style sheet per part: shell, explorer, document, tools, canvas, panels, git |
| `ide/js/` | One script per part: kinds, model, state, docks, documents, explorer, canvas, properties, problems, commit, git, titlebar, and `main.js`, which starts the page |
| `ide/js/tools/` | One script per tool shown in the document area: flow, ontology, entity, schema, page, dashboard, form, check, document, code, contents |
| `ide/data/` | The example data, one file per subject: the solution, problems, flows, ontology, schemas, pages, dashboards, forms, checks, documents, code, changes, commits |

## How the scripts fit together

The scripts are plain scripts, not modules, so a page also opens straight from disk. Each page's `index.html` lists its scripts in the order they load, and a script uses what the scripts before it declared. The names a script declares at its top level are therefore shared by the scripts after it; `ide/js/main.js` comes last and draws the page.

Data is kept apart from the code that draws it: a file under `data/` only declares example data, and the script that shows it is the one of the same subject under `js/`.

## Moving between the pages

Every page shares one background, so nothing flashes, and a page turns a few degrees as it leaves or arrives. Going on (start, login, projects, IDE) turns one way and going back turns the other. The ADP mark is on every page and travels from its old place to its new one.

Where the browser runs a view transition between two documents, `transitions.css` asks for one and a link simply navigates. Elsewhere `nav.js` turns the page out before it leaves, and the next page turns in once it is drawn. Scripts are marked `blocking="render"`, so a page is first painted complete. With reduced motion set, pages change without the turn.

The theme, font size and density chosen in the IDE's settings are kept in the browser's local storage and applied on every page before the first paint.

## The splash screen

A cloud of points that is one picture from the front and another from the side. Each point keeps its height; its place from left to right is the picture in front, and its depth is the next picture. Turning the cloud a quarter brings the next picture to the front: lines of text, then a diagram, then a hierarchy, then a knowledge graph. Nothing is redrawn. The same points are looked at from somewhere else, which is what "a different perspective" says about text and visuals, about software development, and about what people and AI know of a solution.

The cloud turns by itself until it is turned by hand (the four buttons, a click, or the arrow keys), and moving the pointer rocks it, so the depth behind the flat picture shows. With reduced motion set, it changes picture without turning.

## What it is not

- Not a host: it runs no ADP tool and reads no specification or definition. The tools in the document area are drawings of what such tools could look like.
- Not specified: there is no feature under `specs/` for it. A specification comes first if this is to become one.
- Not self-contained offline: the fonts (Inter and JetBrains Mono) come from Google Fonts, and the pages fall back to system fonts without a connection.
