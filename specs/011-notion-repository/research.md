# Research: A Notion Host Repository, Published at etalii.net/adp-notion

## What was found

- `etalii-adp/etalii-adp-ide-notion` is public and empty, with no branch. Squash and rebase merging are allowed, head branches are not deleted, the wiki is on, and its description says "addons". The name `etalii.adp.ide.notion` is free. The Claude GitHub app covers all repositories of the organization.
- `etalii.adp.site` is the only repository with GitHub Pages. Its Pages site has the domain `etalii.net`, is built by workflow, and enforces HTTPS. There is no `etalii-adp.github.io` repository.
- The site's `deploy` workflow runs on a push to `develop` and on manual dispatch, in the concurrency group `pages` without cancelling. It builds into `dist/adp`, copies `root/` and the 404 page into `dist`, and uploads `dist` as the one Pages artifact.
- Neither the site nor GitHub Pages sends `X-Frame-Options` or a `frame-ancestors` policy.
- No secret for acting across repositories exists. The site's `refresh` workflow is prepared for an app or a token (`REFRESH_APP_ID`, `REFRESH_TOKEN`) but none is set.
- The site's `hostIds` in `src/data/order.ts` is used for two things: the hosts shown on the home page (`hosts.yaml`, `HostList.astro`) and the hosts of the tool catalogue (the tool schema, `src/lib/catalogue/hosts.ts`, `src/data/redirects.ts`, the refresh procedures and their tests).
- The local clones of `etalii.adp.site`, `etalii-adp.github` and `etalii.adp.ide.eclipse` are behind `origin/develop`. Each worktree starts from a fetched `develop`.

## Decisions

### D1. The address is `/adp-notion`

**Decision**: follow the spec and its Verbatim Constraints: `https://etalii.net/adp-notion`.

**Rationale**: the spec was changed to it by the review comment of 2026-10-07 and states why: no address of the site can clash with one of an add-on. It is also the simpler of the two to build, since `/adp-notion` is a folder beside the site's Astro output and `/adp/notion` would lie inside it, under the site's page checks and its router.

**Alternatives considered**: `/adp/notion`, the wording of the original input. Rejected by the spec. The titles in `.spec-context.json` and `checklists/requirements.md` still carry the old spelling and are stale.

### D2. The site's `deploy` workflow publishes both

**Decision**: `deploy.yml` in `etalii.adp.site` checks out `etalii-adp/etalii.adp.ide.notion` at `develop` into a side folder, runs `node scripts/build.mjs --out <dist>/adp-notion` in it, checks that `dist/adp-notion/index.html` exists, and uploads `dist` as before.

**Rationale**: a Pages deployment replaces the whole domain. Only a deployment that contains both can keep both (FR-012). One workflow also gives one concurrency group, which serialises publications that arrive together, and one failure behaviour: a failed run uploads nothing and the previous version stays (FR-013). The checkout needs no token because the repository is public.

**Alternatives considered**:
- A Pages site in the Notion repository. It would be served at `etalii-adp.github.io/etalii.adp.ide.notion`, not on `etalii.net`.
- An organization site `etalii-adp.github.io` holding the domain. Each repository is then served under its own name, so neither `/adp` nor `/adp-notion` would exist.
- The Notion repository uploads a build artifact that the site downloads. It needs a token to read another repository's artifacts and a rule for which run is current; a checkout of `develop` needs neither.
- Committing the add-ons' output into the site repository. It puts another repository's product under the site's review and breaks "sourced, never retyped".

**Consequence**: the site's tests and checks run before every publication, so a failing site check holds back an add-on. Accepted: it is the same gate the site has, and a site deployment takes minutes, inside SC-003.

### D3. A merge in the Notion repository starts `deploy` by `workflow_dispatch`, with a token

**Decision**: `Build` in the Notion repository gets a `publish` job that runs only on a push to `develop`, after the other jobs pass, and runs `gh workflow run deploy.yml --repo etalii-adp/etalii.adp.site --ref develop` with the secret `SITE_DEPLOY_TOKEN`. The token is a fine-grained personal access token of the maintainer, limited to `etalii.adp.site` with "Actions: read and write".

**Rationale**: `deploy.yml` already accepts a manual dispatch, so the site needs no new trigger. The default workflow token cannot act on another repository. "Actions" is the narrowest permission that starts a workflow; `repository_dispatch` would need "Contents: write". The job follows the build-workflow contract of spec 001: it publishes only on `push` and no pull-request run sees the secret, so a fork can publish nothing.

**Alternatives considered**:
- A schedule on the site's `deploy`. No token, but it deploys all day for nothing and delays a publication by up to the interval.
- A GitHub App. Tokens that do not expire with a person, at the cost of creating and installing an app for one call. Worth revisiting when a second repository needs to act on another.

**Consequence**: creating the token and the secret is a maintainer's step, once. A fine-grained token expires, at most a year after it is made. When it does, the `publish` job fails visibly and nothing else breaks; the next site deployment still carries the latest add-ons.

### D4. The Notion repository owns a build script; the contract is its command line

**Decision**: `scripts/build.mjs`, Node with no dependencies. `node scripts/build.mjs --out <dir>` writes the published tree: `index.html` and one folder per folder under `addons/`. It lists the add-ons from the folders it finds and takes the revision from `git rev-parse HEAD` of its own checkout.

**Rationale**: the index names the revision of `etalii.adp.ide.notion` (FR-009), which only that repository's checkout knows; in the site's workflow `github.sha` is the site's. A generated index cannot fall out of step with the folders, and "none yet" is the empty list. Node is already set up in the site's deployment job and is what an add-on, a web page, will be built with. The same command runs in the Notion repository's `Build` on every pull request, so a broken build is found before it is merged.

**Alternatives considered**: a hand-written `index.html` copied as it is. It cannot name the revision and must be edited with every add-on. A Python script. The site's job would need Python set up for it.

### D5. One folder per add-on, named by its tool type

**Decision**: an add-on lives in `addons/<id>/` and is served at `https://etalii.net/adp-notion/<id>/`, where `<id>` is the id of its tool type, lowercase with dashes.

**Rationale**: the address depends on nothing but the add-on's own folder name, so adding or removing another does not change it (FR-010).

**Alternatives considered**: numbered or versioned addresses. Nothing asks for them.

### D6. Embedding needs no mechanism, only a rule and a check

**Decision**: nothing is added to make pages embeddable. The principles forbid a published page from refusing to be framed, and the quickstart embeds the index in a Notion page.

**Rationale**: GitHub Pages sends no header that forbids framing and allows none to be set, and Notion's embed block shows any HTTPS page that does not forbid it.

### D7. On the site, Notion is a listed host, not yet a catalogue host

**Decision**: `src/data/order.ts` gains `listedHostIds`, the four `hostIds` followed by `notion`. The hosts collection in `src/content.config.ts` and `HostList.astro` use it. `hosts.yaml` gains a `notion` entry with state `planned` and the note that no tool is available yet, sourced from the Notion repository's `README.md` at its merged commit. `hostIds` stays the four hosts of the catalogue.

**Rationale**: FR-015 asks that the site names the host and says it has no tool. Making Notion a fifth catalogue host would give every tool a Notion state, a redirect, a column in the Notion "Tools" data source, a refresh procedure and changed tests, for a host that has no tool. That belongs to the first add-on.

**Alternatives considered**: a sentence on the home page only. It leaves the list of hosts, which is the site's description of them, without Notion. Adding `notion` to `hostIds`. Rejected as above.

### D8. Two senses of "Notion" in the glossary

**Decision**: the glossary defines **Host** as "an environment that ADP's tools run in", lists Notion with the four, keeps "IDE host" for the four that are IDEs, and defines **Notion add-on** as a web page that shows one tool inside a Notion page. Where the glossary means the workspace that holds the catalogue, it says "the Notion workspace".

**Rationale**: FR-005. "IDE host" stays true wherever it is used today (the FBL specification, two tool definitions, the site's principle III), so none of those needs a change.

**Alternatives considered**: rewording every "IDE host" and every "four hosts". It would touch a specification and other repositories' principles for no change in meaning. The IntelliJ principles' "Single host" rule is about that plug-in's own platform and is left as it is.

### D9. What follows the glossary

**Decision**: the glossary's two mirrors follow in this feature: the Notion page "ADP terminology" is updated when the `etalii.adp` pull request merges, and the site's terminology pages through the site's own refresh, in the site's pull request if the refresh shows a difference. The constitution is amended through `/speckit-constitution`. The per-repository table in `specs/001-ci-and-badges/contracts/build-workflow.md` gains a row, since `docs/new-repository.md` sends every new repository to that contract; spec 001's `data-model.md` is history and is not changed.

### D10. Settings beyond the checklist

**Decision**: also turn the wiki off and correct the description to "add-ons", as `etalii.adp.ide.eclipse` has them. The job and artifact that the eclipse workflow calls `plugin` are named `addons` here.

**Rationale**: the description is the first text a visitor reads, and it should use the glossary's term.
