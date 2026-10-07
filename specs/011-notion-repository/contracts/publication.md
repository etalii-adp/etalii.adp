# Contract: Publication

How a merge into `develop` of `etalii.adp.ide.notion` comes to be served at `https://etalii.net/adp-notion`. Two workflows in two repositories keep it: `Build` in `etalii.adp.ide.notion` and `deploy` in `etalii.adp.site`. Decisions are in [research.md](../research.md) D2 and D3; the tree that is published is in [published-tree.md](published-tree.md).

## Addresses

| Address | Served from | Published by |
| --- | --- | --- |
| `https://etalii.net/adp` and below | `dist/adp` | `deploy` in `etalii.adp.site` |
| `https://etalii.net/adp-notion` and below | `dist/adp-notion` | the same run of `deploy`, from `etalii.adp.ide.notion` at `develop` |

GitHub Pages is the only hosting service, on the one Pages site of `etalii.adp.site`, over HTTPS (FR-008). `etalii.adp.ide.notion` has no Pages site of its own.

## `Build` in `etalii.adp.ide.notion`

`.github/workflows/build.yml` satisfies [the build-workflow contract of spec 001](../../001-ci-and-badges/contracts/build-workflow.md). Its jobs:

| Job | Runs on | Does |
| --- | --- | --- |
| `check` | every run | `python .github/scripts/check-files.py`: JSON and YAML parse, markdown links resolve |
| `addons` | every run, after `check` | `node scripts/build.mjs --out <dir>` and the check in [published-tree.md](published-tree.md) |
| `terminology` | pull requests | the terminology job of spec 002, copied from an existing repository's `build.yml` |
| `publish` | a push to `develop` only, after `check` and `addons` pass | starts the site's `deploy` |

```yaml
  publish:
    needs: [check, addons]
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Start the site's deployment
        env:
          GH_TOKEN: ${{ secrets.SITE_DEPLOY_TOKEN }}
        run: gh workflow run deploy.yml --repo etalii-adp/etalii.adp.site --ref develop
```

| Rule | Requirement |
| --- | --- |
| `publish` runs only on a push to `develop`; a pull request, from a fork or not, never runs it and never sees the secret | FR-011, spec 001 FR-007 |
| `publish` uploads nothing itself; it only starts `deploy` | FR-012 |
| A `publish` that fails shows as a failed run of `Build` and changes nothing that is served | FR-013 |
| No other job reads a secret | Spec 001 FR-007 |

## Secret

| Name | Where | What |
| --- | --- | --- |
| `SITE_DEPLOY_TOKEN` | Actions secret of `etalii.adp.ide.notion` | A fine-grained personal access token of the maintainer, limited to the repository `etalii.adp.site`, with the permission "Actions: read and write" and no other |

A maintainer creates it once, before the first pull request merges, and renews it before it expires. An expired token fails `publish` visibly; the next run of `deploy`, however it starts, still publishes the latest add-ons.

## `deploy` in `etalii.adp.site`

`.github/workflows/deploy.yml` keeps its triggers (a push to `develop`, and `workflow_dispatch`), its concurrency group `pages` without cancelling, and its single artifact `dist`. It gains, after the site is built into `dist/adp` and before the upload:

```yaml
      - name: Check out the Notion add-ons
        uses: actions/checkout@<current major>
        with:
          repository: etalii-adp/etalii.adp.ide.notion
          ref: develop
          path: <side folder>
      - name: Build the Notion add-ons
        working-directory: <side folder>
        run: node scripts/build.mjs --out "$GITHUB_WORKSPACE/dist/adp-notion"
      - name: Check the add-on index was built
        run: test -f dist/adp-notion/index.html
```

| Rule | Requirement |
| --- | --- |
| Every run of `deploy` builds both `dist/adp` and `dist/adp-notion` and uploads them as one artifact | FR-012 |
| The checkout takes `develop` of `etalii.adp.ide.notion` and needs no token, the repository being public | FR-011, D2 |
| The side folder lies outside `dist` and outside what the site's build reads | FR-012 |
| A step that fails stops the job before the upload, so the previous deployment stays served | FR-013 |
| Runs that arrive together are serialised by the group `pages`; none is cancelled, so the last to finish holds the latest state of both repositories | Edge case: both publish at nearly the same time |
| Nothing under `src/` of the site reads or names an add-on | Plan: Structure Decision |

## What a consumer can rely on

| Event | Result |
| --- | --- |
| A pull request is merged into `develop` of `etalii.adp.ide.notion` | `https://etalii.net/adp-notion` serves the merged content within 15 minutes, with no manual step (SC-003) |
| A pull request is merged into `develop` of `etalii.adp.site` | The site is republished, with the add-ons of the Notion repository's `develop` at that moment |
| A pull request is open and not merged, in either repository | Nothing that is served changes |
| A run of `Build` or `deploy` fails | The previously published version is served, and the run shows as failed on GitHub |
