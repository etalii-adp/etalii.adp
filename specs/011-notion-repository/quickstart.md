# Quickstart: checking the Notion host repository and its address

Run these after the four pull requests are merged. Each step names the requirement it shows.

## The repository (Story 1)

1. `gh repo view etalii-adp/etalii.adp.ide.notion --json name,visibility,defaultBranchRef,mergeCommitAllowed,squashMergeAllowed,rebaseMergeAllowed,deleteBranchOnMerge` gives the name, `PUBLIC`, `develop`, and `true`, `false`, `false`, `true` (FR-001, FR-002).
2. `gh repo view etalii-adp/etalii-adp-ide-notion --json name` answers with `etalii.adp.ide.notion` (the old name redirects).
3. Walk `docs/new-repository.md` against the repository; every rule holds (SC-001).
4. Open a pull request into `develop` that changes one word of `README.md`. `Build` reports on it within 5 minutes, with the `terminology` job among its jobs, and no `publish` job ran (FR-003, FR-011, SC-002). Leave it open for the next part.

## The address (Story 2)

5. With that pull request still open, `https://etalii.net/adp-notion/` is unchanged (FR-011).
6. Merge it. The `publish` job of `Build` starts a `deploy` run in `etalii.adp.site`; within 15 minutes `https://etalii.net/adp-notion/` names the merge's revision and says no add-on is available yet (FR-009, SC-003).
7. `https://etalii.net/adp-notion` without the slash arrives at the same page, over HTTPS (FR-008).
8. `https://etalii.net/adp/` and three other pages of the site still answer as before (FR-012).
9. Start `deploy` in `etalii.adp.site` by hand. Afterwards the index still answers with the same revision (FR-012, SC-005).
10. In a Notion page, type `/embed` and paste `https://etalii.net/adp-notion/`. The index shows inside the page (FR-014, SC-004).

## Naming (Story 3)

11. `docs/terminology.md` lists Notion under **Host** and defines **Notion add-on** (FR-005).
12. The organization profile and the site's home page each show a row for `etalii.adp.ide.notion` with a passing badge (FR-004).
13. The site's home page lists Notion among the hosts as planned, with no tool (FR-015).
14. `CLAUDE.md` and `docs/new-repository.md` name the repository, and `.specify/memory/repositories/etalii.adp.ide.notion.md` exists (FR-006, FR-007).
