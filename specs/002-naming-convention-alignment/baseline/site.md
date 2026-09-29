# Site baseline (T003)

Recorded 2026-09-29 for etalii.adp spec 002 (naming convention alignment), Part 0, before any rename.

- Repository: `etalii-adp/etalii.adp.site`
- Revision: `origin/develop` at `b5bb553` ("Merge pull request #53 from etalii-adp/refresh/screenshots"), in a detached worktree `C:\git\etalii.adp.site-baseline`, after `npm ci`
- Node.js v26.3.0, Windows 11

| Gate | Exit code | Count |
|---|---|---|
| `npm run build` | 0 | 35 pages built by Astro; 52 `index.html` files in `dist/` (34 in the sitemap, plus the domain root redirect and 17 retired spec 003 facet pages under `/adp/designers/focus/`, `/hosts/`, `/states/`, which are redirects) |
| `npm test` (vitest) | 0 | 71 tests in 7 files, 71 passed |
| `npm run test:catalogue` (node:test) | 0 | 50 tests, 50 passed |
| `npm run test:refresh` (node:test) | 0 | 119 tests, 119 passed |
| `npm run check` | 0 | `check:links` 13 links scanned, 0 broken; `check:catalogue` 46 pages, 0 failures; `check:pages` (Playwright) 369 passed |

Sitemap: `dist/adp/sitemap-index.xml` → `dist/adp/sitemap-0.xml`, 34 URLs, listed in [sitemap.txt](sitemap.txt).

## Earlier run on `2734098`

The same gates were first run on `2734098` ("Merge pull request #54 from etalii-adp/features/003-intellij-screenshots"), which `origin/develop` was when the baseline started; two refresh pull requests (#52 catalogue, #53 screenshots) merged while it ran, so the baseline above was taken again on `b5bb553`. On `2734098` every gate also exited 0 with the same test counts (71, 50, 119); the build had 34 pages, `check:catalogue` 45 pages and `check:pages` 359 passed; the sitemap had 33 URLs, lacking `https://etalii.net/adp/designers/jgraph/drawio/`, which refresh #52 added.
