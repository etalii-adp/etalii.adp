# Hosted: a mockup of an ADP solution IDE

An experiment, not a host. It is a clickable mockup of a hosted ADP in which a whole solution, from a small application to a platform, is designed and developed as one hierarchy. Nothing here is specified yet, and no service runs behind it: the pages ask a storage for everything they show, and the storage they use by default is one that lives in the page and starts from example data ("Atlas Platform", a platform for an energy utility).

The pages are written in TypeScript and built into `dist/`. With Node.js 22 or newer:

```
npm install
npm run check
npm start
```

`npm run check` writes the code of the storage contract, reads the example data from its YAML files, checks the types and builds the pages; `npm start` serves `dist/` at `http://localhost:8080/`. The pages are modules, which a browser loads from a server and not straight from disk. `npm test` runs the tests (see [Tests](#tests)).

## The pages

| Page | Folder | Shows |
|---|---|---|
| Start | `src/index.html`, `src/splash/` | The splash screen, with the way in to the login page and a link to the About page of the ADP site |
| Login | `src/login/` | Signing in to a workspace. An email with the password `42!` signs in. Single sign-on and a git provider can be tried as well: each asks, and answers that the workspace has not set it up, so neither leads further |
| Projects | `src/projects/` | The projects and assets (repositories that are linked into other projects) on this computer, and the New Project wizard. With the example data only Atlas Platform opens, and every project the wizard made |
| IDE | `src/ide/` | The solution IDE: Explorer, document area with tools and a canvas, Properties, Agent, Problems, Commit and Git |

The pages follow one another as they would in use: the start page leads to the login page, signing in leads to the projects, and opening Atlas Platform leads to the IDE. Signing out, the ADP mark on the login page, and the project and account menus of the IDE lead back.

## What the IDE page shows

- The layout follows the JetBrains New UI: a title bar with menus and the update and push widgets, tool-window stripes, three docks whose panels can be moved, and a status bar.
- Everything in a solution is one hierarchy, shown in the Explorer. The root is a git repository, and repositories from outside the project can be linked in at any level, each following a branch or a tag.
- Every item has an id that stays the same when the item is renamed or moved: a ShortGuid as the other ADP hosts make one, a UUID written as its 128-bit value in lowercase base 36, 25 characters long. It is in the Properties, the status bar and the item's `.adp` file.
- Every level has two views, Logical Structure and File System, set per level from its context menu (View As) or in the Properties, and kept in that level's `.adp` file, with personal overrides in `.user.adp`.
- A solution holds applications as well. The example has two under Applications, a C# console client and a Python project of the ingestion. The Logical Structure view shows their parts by name; the File System view shows the source files under the names they have on disk, with the project and language files beside them (`.csproj`, `pyproject.toml`, lock files), and with Show All Files what git ignores (`bin`, `obj`, `.venv`).
- The document area opens an item in its tool (a diagram, a designer or an editor) and switches to Canvas, an infinite plane with a card per child item that can be walked level by level, in step with the Explorer.
- The context menu adds, renames and deletes items, with what is offered depending on the item.
- The Agent tool window, in the right dock beside the Properties, holds a conversation about the project: a question, about the selected item unless that is switched off, and an answer that says what it read and names the items it is about, each of which opens with a click. The conversations that are over are listed by day, searched, opened again, renamed and deleted. The answers are composed by the storage from what it knows of the project (the hierarchy, validation, git and the runs); no model runs behind them.
- The IDE owns the keyboard and the mouse (`ide/browser.ts`): the browser's keyboard shortcuts, the back and forward buttons of a mouse and the browser's context menu do nothing on the IDE page, so each can be given a task of the IDE's own, on Windows and on a Mac. A text field keeps the clipboard, select all, undo, redo and moving by word. A browser keeps a few shortcuts to itself (a new tab or window, closing one, switching tabs, quitting); Chromium hands those over as well in full screen, which View, Full Screen and F11 enter.
- Icons per domain (`storage/backends/catalogue/icon-domains.ts`): besides the general categories, the icon picker offers the icons of 57 domains, from Academic and Agriculture to Water and wastewater and Weather, 555 icons in all, each drawn in the 16px stroke style of the icon set. The picker searches all of them, a domain's name included, and a list beside the search box shows one category or domain alone. A domain also offers the icons of other categories that belong to it, so an icon can be found under more than one name.

## The New Project wizard

New Project, on the projects page, opens a wizard of five steps. It asks what is being built, from a console application through a web application, a mobile app, a backend service and a distributed system up to a solution on a platform as a service; what it is built with (languages, web and mobile front ends, data, messaging, hosting, AI), where a larger solution is asked more; and what it needs beside its code (tests, a release pipeline, environments, documentation, sign-off procedures). Each kind of solution starts from what is usual for it.

The answers bring recipes: sets of elements that belong together, such as a service with an API, a web client, a database, a release pipeline. The fourth step lists the recipes that fit, all of them kept until one is put aside, beside the hierarchy they make: every recipe puts its elements in an area (Services, Web, Data, Platform, Delivery and so on), and a group two recipes share is made once. The last step asks for the name, the location and the branch.

The project that is made is a repository with one commit. It opens in the IDE with that hierarchy and with a brief of what the wizard was told as its first document; nothing else in it is written yet, and it is composed further in the Explorer as any project. The sizes, questions and recipes are in the catalogue of the storage (`storage/backends/catalogue/wizard.ts`), and the project is made by the storage, so the wizard works with every backend. The IDE page has no part in it.

## Where things are

The sources are under `src/`, and `dist/` is what `npm run build` makes of them; `dist/` is not in the repository. Whatever more than one page uses is in `src/common/`. Whatever one page uses is in that page's folder.

| Under `src/` | Holds |
|---|---|
| `common/css/` | `tokens.css` (colours, fonts and sizes, dark and light), `base.css` (page frame, buttons, inputs, icons), `popups.css` (menus, toasts, dialogs), `transitions.css` (moving between the pages) |
| `common/img/` | `adp-icon.svg`, the ADP mark: a copy, byte for byte, of the icon of the ADP site (`src/assets/brand/adp-icon.svg` in etalii.adp.site, commit `6266fbf`). It is not redrawn; a newer icon arrives as a newer copy |
| `common/` | `boot.ts` (theme and direction, before the first paint), `pages.ts` (the pages and which one this is), `prefs.ts` (the theme, font size and density that were chosen), `dom.ts`, `icons.ts` (the icon set, and the ADP mark placed on a page), `popups.ts`, `nav.ts` (going to another page), `page.ts` (what every page does when it starts), `reason.ts` (why the storage did not do something, in words), `away.ts` (what a page shows when the storage does not answer as it starts) |
| `splash/` | `shapes.ts` (the four pictures), `cloud.ts` (the point cloud), `splash.ts`, `splash.css` |
| `login/` | `login.ts`, `login.css` |
| `projects/` | `projects.ts`, `projects.css`, and the New Project wizard in `wizard.ts`, `wizard.css` |
| `ide/css/` | One style sheet per part: shell, explorer, document, tools, canvas, panels, git, agent |
| `ide/` | One module per part: `storage.ts` (the stores the page reads, and the one way it carries out a command), `types.ts`, `kinds.ts`, `model.ts`, `state.ts`, `repaint.ts`, `docks.ts`, `open.ts`, `explorer.ts`, `document-area.ts`, `canvas.ts`, `properties.ts`, `agent.ts`, `problems.ts`, `commit.ts`, `git.ts`, `titlebar.ts`, `severity.ts`, `browser.ts`, and `main.ts`, which starts the page |
| `ide/tools/` | One module per tool shown in the document area: flow, ontology, entity, schema, page, dashboard, form, check, document, code, contents, and what they share in `shared.ts` |
| `storage/` | Everything that is data, behind one boundary: see [The storage](#the-storage) |

Beside `src/` are `build.mjs` (the build), `checks.mjs` (what the build refuses), `buf.gen.yaml` (how the code of the contract is written), `tsconfig.json` (how the types are checked), `test/` and `package.json` with its lock file.

## How the scripts fit together

Every file is a TypeScript module that imports what it uses and exports what others use, so nothing is shared by being declared first. `build.mjs` has esbuild build the script of each page (`splash/splash.js`, `login/login.js`, `projects/projects.js`, `ide/main.js`) as a module, with what the pages have in common as chunks under `common/chunks/`: a browser loads the storage once for the login page, the projects and the IDE, and the start page, which needs none of it, loads none of it (the build fails if it would). `common/boot.js` is a script of its own that every page runs in its head before the first paint. Every other file under `src/` is copied to `dist/` as it is, except the storage, which has nothing a page loads as a file. TypeScript only checks the types (`strict`, with unused names refused); esbuild writes the scripts.

Three rules keep the modules of the IDE page apart:

- **No module imports in a circle.** A module in a circle can run before a module it reads from. The build reads the imports esbuild found and fails when there is a circle, naming it.
- **A part that changes the state asks for a repaint; it does not call the part that draws.** `ide/repaint.ts` knows the parts by name (`explorer`, `editor`, `properties`, `status`, `title`, `problems`, `commit`, `git`, `agent`), and `ide/main.ts` says which function draws which. That is how the Explorer can change what the document area shows, and the document area what the Explorer shows, without importing each other.
- **Only `ide/main.ts` touches the page when it is loaded.** What wires another part to the page is in a function (`mountExplorer`, `mountDocks`, `mountTitlebar` and so on) that `main.ts` calls, in an order that can be read there.

## The storage

Everything a page shows that is data comes from `src/storage/`, and everything a page changes goes there as a command: the hierarchy and its items, what each tool shows of an item, the views and layouts of a level, git, problems and runs, the history for Undo, the window's own state, the conversations with the agent, the projects and making a new one, the user, the catalogue of kinds and icons and of what the New Project wizard asks, and a person's settings. A page imports `storage/index.ts` (the stores), `storage/local.ts` (what is kept in this browser and read before the first paint) and `storage/ids.ts`, and nothing behind them.

| Under `src/storage/` | Holds |
|---|---|
| `contract/` | The contract, in Protocol Buffers: one file per store with its calls and messages, the envelope a call travels in, and what is kept of a project. `npm run generate` lints it and writes its TypeScript to `gen/`, which is not in the repository |
| `index.ts`, `views.ts`, `documents.ts` | What a page imports: `connect()`, the stores, the shapes a page reads (all of them read-only), and the documents of the tools |
| `stores/` | The eleven stores: catalogue, identity, projects, solution, levels, content, git, status, history, workbench, agent. A store holds one object per thing for as long as it exists and brings it up to date when the backend tells of a change, so a page keeps the objects it has |
| `link.ts` | What the stores share: one way to a backend, which changes this page caused itself, and when the page is waiting |
| `backend.ts` | What a store asks of a backend: `call`, `watch`, its state, and the two ways a call fails (`Refused` with words for the user, `Unreachable`) |
| `backends/` | The backends, and what they share |
| `backends/server/` | One object that answers every call of the contract from state in memory, with the history that Undo takes back. Every backend that lives in the page is built on it |
| `backends/example/` | The example data, as the seed such a backend starts from. Every example name, number and text is in the YAML files of this folder and nowhere else (see [The example data](#the-example-data)) |
| `backends/catalogue/` | The kinds of item, the names of the tools, the lists the tools offer a choice from, the icon library, and what the New Project wizard asks: the sizes of a solution, the questions and the recipes |
| `backends/wire/` | The wire: a call as an envelope of bytes over one connection, with the client a page uses and the service at the other end |

A backend is chosen by the address of a page, and the choice holds for the visit, from page to page:

| `?backend=` | Keeps the data |
|---|---|
| `memory` (the default) | In the page, starting from the example data on every page. Nothing is kept but the projects the wizard made, which last for the visit as they were made |
| `browser` | In this browser (IndexedDB), from page to page and from visit to visit. Two tabs hear of each other's changes; what a tab keeps of its own window is no change for the other, and a conversation with the agent reaches the other tab without touching what it can undo |
| `empty` | In the page, starting from one project that holds only its root, and the projects the wizard made in this visit |
| `slow`, `slow:1500`, `slow:offline`, `slow:read-only` | As `memory`, answering late, not at all, or only what is read: what the pages do while they wait and when the storage is away |
| `loopback` | As `memory`, with every call crossing the wire as bytes, to a service that runs in the same page |
| `hosted` with `&service=wss://…` | At a service behind a WebSocket. None is hosted; the tests run one on localhost |

A hosted service is reached with Protocol Buffers messages over one WebSocket, in an envelope of this contract's own (hello, request, response, cancel, event, ping, pong). A command carries an id; when its answer is lost it is sent again under the same id and is carried out once. What changes is told to every page as events, and the events a command caused arrive before its answer. A page that was cut off reads again what it missed when the connection is back.

`checks.mjs` holds the boundary, and the build runs it first and builds nothing when it finds something: a page that uses what a browser keeps or a way to a network itself (`localStorage`, `indexedDB`, `fetch`, `WebSocket` and the like), a page that imports past the three modules above, and a name of the example data anywhere but in the YAML files of the example backend, its own TypeScript included.

### The example data

The example data is written in YAML, one file per subject, in `src/storage/backends/example/`. Each file starts with a comment that says what is in it.

| File | Holds |
| --- | --- |
| `workspace.yaml` | The workspace and its user, the projects on this computer and which of them opens, and what a linked repository brings |
| `solution.yaml` | The hierarchy of the project that opens, from its root down, in the fields an item has in the contract |
| `git.yaml`, `status.yaml`, `workbench.yaml`, `agent.yaml` | What those stores start with: the log, the branches and what is not committed; what validation found; the window as it first opens; the conversations that are over |
| `flows.yaml`, `ontology.yaml`, `schemas.yaml`, `pages.yaml`, `dashboards.yaml`, `forms.yaml`, `checks.yaml`, `documents.yaml`, `code.yaml` | What the items hold, per tool, in the shape that tool reads (`storage/documents.ts`) |
| `files.yaml` | The text of the files beside the items, such as the sources of the two applications, and what each file is for |

Three rules make the files something to write by hand:

- An item is named by the name it has in `solution.yaml`, never by an id. Its id is made from its place in the hierarchy, so it is the same on every load.
- What an item holds is given by its name (`items`), for every other item of a kind (`kinds`), or for the rest (`otherwise`). A single value can be a choice as well: one for some items by name, another for the rest. It goes by the name the item started with, so renaming an item does not change what it holds.
- A text can have parts between `{{` and `}}` that are filled in when it is read, such as `{{name}}` for the item's name and `{{slug}}` for its name on disk. The comment at the top of a file says which.

`example.mjs`, which `npm run generate` runs, reads the files into one module (`backends/example/gen/data.ts`, not committed), and the type check holds that module against the shapes in `backends/example/shape.ts`: a field that is missing, misspelt or of the wrong type in a YAML file fails the type check, which names the field and the shape it is held against. `backends/example/index.ts` turns the data into the messages of the contract and has no example name of its own. The unit tests check what types cannot: that every name a file uses is the name of exactly one item.

## Tests

`npm test` runs both kinds; the pages have to be built first (`npm run check`).

- `npm run test:unit` (`test/unit/`, Node's own test runner): the backend in the page asked directly, the stores as a page uses them, the wire with messages lost and connections cut, every message and call of the contract as bytes and as JSON, the checks of the build, the example data as its YAML files have it, the conversations with the agent, and the New Project wizard: that its sizes, questions and recipes fit each other and the catalogue, and the project that is made of the answers.
- `npm run test:e2e` (`test/e2e/`, Playwright with Chromium): a walk of 189 steps through the login page, the projects and every part of the IDE, which has to work and has to show the same thing, step by step, with the storage in memory, in the browser, across the wire inside the page, and at a service behind a real WebSocket. Beside it: a reload and a second tab with the storage in the browser, where what one tab keeps of its own leaves the other's Undo alone, every kind of item opened with an empty storage, what the pages say with a storage that is slow, takes no changes, is away, or goes away and comes back, and that a document that arrives late leaves a name that is being typed alone; the Agent tool window with conversations that are over, questions and a reload; and the New Project wizard for every kind of solution, where the hierarchy the wizard shows has to be the one the IDE opens with.

`node test/e2e/record.mjs dist trace.json [backend]` writes what a walk saw, and `node test/e2e/diff.mjs a.json b.json` compares two of them.

## Moving between the pages

Every page shares one background, so nothing flashes, and a page turns a few degrees as it leaves or arrives. Going on (start, login, projects, IDE) turns one way and going back turns the other.

Where the browser runs a view transition between two documents, `transitions.css` asks for one and a link simply navigates. Elsewhere `nav.ts` turns the page out before it leaves, and the next page turns in once it is drawn. A page's script is marked `blocking="render"`, so a page is first painted complete. With reduced motion set, pages change without the turn.

The theme, font size and density chosen in the IDE's settings are kept in the browser's local storage (`storage/local.ts`) and applied on every page before the first paint.

## The splash screen

A cloud of points that is one picture from the front and another from the side. Each point keeps its height; its place from left to right is the picture in front, and its depth is the next picture. Turning the cloud a quarter brings the next picture to the front: lines of text, then a diagram, then a hierarchy, then a knowledge graph. Nothing is redrawn. The same points are looked at from somewhere else, which is what "a different perspective" says about text and visuals, about software development, and about what people and AI know of a solution.

The cloud turns by itself until it is turned by hand (the four buttons, a click, or the arrow keys), and moving the pointer rocks it, so the depth behind the flat picture shows. With reduced motion set, it changes picture without turning.

## What it is not

- Not a host: it runs no ADP tool and reads no specification or definition. The tools in the document area are drawings of what such tools could look like.
- Not a service: the storage contract and the wire are here, and no service that implements them is hosted.
- Not an agent: the Agent tool window answers from what the storage knows of the project. No language model is asked.
- Not a generator: the New Project wizard makes the hierarchy of a project, and writes none of its code.
- Not specified: there is no feature under `specs/` for it. A specification comes first if this is to become one.
- Not self-contained offline: the fonts (Inter and JetBrains Mono) come from Google Fonts, and the pages fall back to system fonts without a connection.
