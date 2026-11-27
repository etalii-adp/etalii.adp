# Hosted: a mockup of an ADP solution IDE

An experiment, not a host. It is a clickable mockup of a hosted ADP in which a whole solution, from a small application to a platform, is designed and developed as one hierarchy. Nothing here is specified yet, nothing is connected to a server, and every name and number is example data ("Atlas Platform", a platform for an energy utility).

The pages are written in TypeScript and built into `dist/`. With Node.js 22 or newer:

```
npm install
npm run build
```

Then open `dist/index.html` in a browser. No server is needed: a built page opens straight from disk. `npm run typecheck` checks the types without building, and `npm run check` does both.

## The pages

| Page | Folder | Shows |
|---|---|---|
| Start | `src/index.html`, `src/splash/` | The splash screen, with the way in to the login page and a link to the About page of the ADP site |
| Login | `src/login/` | Signing in to a workspace. An email with the password `42!` signs in. Single sign-on and a git provider can be tried as well: each asks, and answers that the workspace has not set it up, so neither leads further |
| Projects | `src/projects/` | The projects and assets (repositories that are linked into other projects) on this computer. Only Atlas Platform opens |
| IDE | `src/ide/` | The solution IDE: Explorer, document area with tools and a canvas, Properties, Problems, Commit and Git |

The pages follow one another as they would in use: the start page leads to the login page, signing in leads to the projects, and opening Atlas Platform leads to the IDE. Signing out, the ADP mark on the login page, and the project and account menus of the IDE lead back.

## What the IDE page shows

- The layout follows the JetBrains New UI: a title bar with menus and the update and push widgets, tool-window stripes, three docks whose panels can be moved, and a status bar.
- Everything in a solution is one hierarchy, shown in the Explorer. The root is a git repository, and repositories from outside the project can be linked in at any level, each following a branch or a tag.
- Every item has an id that stays the same when the item is renamed or moved: a ShortGuid as the other ADP hosts make one, a UUID written as its 128-bit value in lowercase base 36, 25 characters long. It is in the Properties, the status bar and the item's `.adp` file.
- Every level has two views, Logical Structure and File System, set per level from its context menu (View As) or in the Properties, and kept in that level's `.adp` file, with personal overrides in `.user.adp`.
- A solution holds applications as well. The example has two under Applications, a C# console client and a Python project of the ingestion. The Logical Structure view shows their parts by name; the File System view shows the source files under the names they have on disk, with the project and language files beside them (`.csproj`, `pyproject.toml`, lock files), and with Show All Files what git ignores (`bin`, `obj`, `.venv`).
- The document area opens an item in its tool (a diagram, a designer or an editor) and switches to Canvas, an infinite plane with a card per child item that can be walked level by level, in step with the Explorer.
- The context menu adds, renames and deletes items, with what is offered depending on the item.

## Where things are

The sources are under `src/`, and `dist/` is what `npm run build` makes of them; `dist/` is not in the repository. Whatever more than one page uses is in `src/common/`. Whatever one page uses is in that page's folder.

| Under `src/` | Holds |
|---|---|
| `common/css/` | `tokens.css` (colours, fonts and sizes, dark and light), `base.css` (page frame, buttons, inputs, icons), `popups.css` (menus, toasts, dialogs), `transitions.css` (moving between the pages) |
| `common/img/` | `adp-icon.svg`, the ADP mark: a copy, byte for byte, of the icon of the ADP site (`src/assets/brand/adp-icon.svg` in etalii.adp.site, commit `6266fbf`). It is not redrawn; a newer icon arrives as a newer copy |
| `common/` | `boot.ts` (theme and direction, before the first paint), `pages.ts` (the pages and which one this is), `prefs.ts` (the theme, font size and density that were chosen), `dom.ts`, `icons.ts` (the icon set, and the ADP mark placed on a page), `popups.ts`, `nav.ts` (going to another page), `page.ts` (what every page does when it starts) |
| `splash/` | `shapes.ts` (the four pictures), `cloud.ts` (the point cloud), `splash.ts`, `splash.css` |
| `login/` | `login.ts`, `login.css` |
| `projects/` | `projects.ts`, `projects.css`, and the example projects in `data/` |
| `ide/css/` | One style sheet per part: shell, explorer, document, tools, canvas, panels, git |
| `ide/` | One module per part: `types.ts`, `kinds.ts`, `model.ts`, `state.ts`, `repaint.ts`, `docks.ts`, `open.ts`, `explorer.ts`, `document-area.ts`, `canvas.ts`, `properties.ts`, `problems.ts`, `commit.ts`, `git.ts`, `titlebar.ts`, `severity.ts`, `icon-library.ts`, and `main.ts`, which starts the page |
| `ide/tools/` | One module per tool shown in the document area: flow, ontology, entity, schema, page, dashboard, form, check, document, code, contents, and what they share in `shared.ts` |
| `ide/data/` | The example data, one file per subject: the solution, problems, flows, ontology, schemas, pages, dashboards, forms, checks, documents, code, applications, changes, commits |

Beside `src/` are `build.mjs` (the build), `tsconfig.json` (how the types are checked) and `package.json` with its lock file (the two tools the build needs: TypeScript and esbuild).

## How the scripts fit together

Every file is a TypeScript module that imports what it uses and exports what others use, so nothing is shared by being declared first. `build.mjs` has esbuild bundle one script per page (`splash/splash.js`, `login/login.js`, `projects/projects.js`, `ide/main.js`) and `common/boot.js`, which every page runs in its head before the first paint. It copies every other file under `src/` to `dist/` as it is. TypeScript only checks the types (`strict`, with unused names refused); esbuild writes the scripts.

Data is kept apart from the code that draws it: a file under `data/` only holds example data and its types, and the module that shows it is the one of the same subject beside it.

Three rules keep the modules of the IDE page apart:

- **No module imports in a circle.** A module in a circle can run before a module it reads from. The build reads the imports esbuild found and fails when there is a circle, naming it.
- **A part that changes the state asks for a repaint; it does not call the part that draws.** `ide/repaint.ts` knows the parts by name (`explorer`, `editor`, `properties`, `status`, `title`, `problems`, `commit`, `git`), and `ide/main.ts` says which function draws which. That is how the Explorer can change what the document area shows, and the document area what the Explorer shows, without importing each other.
- **Only `ide/main.ts` touches the page when it is loaded.** What wires another part to the page is in a function (`mountExplorer`, `mountDocks`, `mountTitlebar` and so on) that `main.ts` calls, in an order that can be read there.

## Moving between the pages

Every page shares one background, so nothing flashes, and a page turns a few degrees as it leaves or arrives. Going on (start, login, projects, IDE) turns one way and going back turns the other.

Where the browser runs a view transition between two documents, `transitions.css` asks for one and a link simply navigates. Elsewhere `nav.ts` turns the page out before it leaves, and the next page turns in once it is drawn. A page's script is marked `blocking="render"`, so a page is first painted complete. With reduced motion set, pages change without the turn.

The theme, font size and density chosen in the IDE's settings are kept in the browser's local storage and applied on every page before the first paint.

## The splash screen

A cloud of points that is one picture from the front and another from the side. Each point keeps its height; its place from left to right is the picture in front, and its depth is the next picture. Turning the cloud a quarter brings the next picture to the front: lines of text, then a diagram, then a hierarchy, then a knowledge graph. Nothing is redrawn. The same points are looked at from somewhere else, which is what "a different perspective" says about text and visuals, about software development, and about what people and AI know of a solution.

The cloud turns by itself until it is turned by hand (the four buttons, a click, or the arrow keys), and moving the pointer rocks it, so the depth behind the flat picture shows. With reduced motion set, it changes picture without turning.

## What it is not

- Not a host: it runs no ADP tool and reads no specification or definition. The tools in the document area are drawings of what such tools could look like.
- Not specified: there is no feature under `specs/` for it. A specification comes first if this is to become one.
- Not self-contained offline: the fonts (Inter and JetBrains Mono) come from Google Fonts, and the pages fall back to system fonts without a connection.
