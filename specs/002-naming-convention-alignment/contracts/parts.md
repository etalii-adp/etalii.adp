# Contract: Parts

How the work is divided over parallel threads (FR-015). Each part is one thread and one pull request into its repository's `develop`, built in its own worktree on `features/002-<part>` (in `etalii.adp`) or on that repository's own feature branch naming. Every part reads the glossary, [classification.md](classification.md), [rename-map.md](rename-map.md) and [terminology-check.md](terminology-check.md), and proves its result against the baseline of part 0.

## Order

```text
part 0 (baseline) ──► part 1 (site reads both) ──┬─► part 2 (etalii.adp)  ──┐
                                                 ├─► part 3 (standalone)  ──┤
                                                 ├─► part 4 (IntelliJ)    ──┼─► part 7 (final pass)
                                                 ├─► part 5 (site + Notion)─┤
                                                 └─► part 6 (small repos) ──┘
```

Parts 2 to 6 run in parallel. They depend only on part 1 having merged, because part 1 makes the site and its pipelines accept both the old and the new upstream names.

## Parts

| # | Part | Repository | Depends on | Others read from it | Proof |
|---|---|---|---|---|---|
| 0 | Baseline and terminology check | etalii.adp (this spec) | Peter approves this plan | every part | baseline recorded; `docs/terminology-check` list published |
| 1 | Site reads both forms | etalii.adp.site | 0 | parts 2, 3, 5 | refresh dry-run green against today's upstreams and against a branch with the new names |
| 2 | DISL, DESL, EDSL; constitution | etalii.adp | 1 | site reference procedure | examples valid; old `.dedl` and `$id` documented as read; CI green |
| 3 | Standalone | etalii.adp.ide.standalone | 1 | site catalogue procedure (`docs/tools.md`) | four gates green, test count ≥ baseline; every example and `.adp` file round-trips byte-identical |
| 4 | IntelliJ | etalii.adp.ide.intellij | 0 | — | `./gradlew build` and `integrationTest` green, count ≥ baseline; baseline settings file restored and in effect |
| 5 | Site and Notion | etalii.adp.site, Notion | 1 | — | build, tests, catalogue and refresh tests, page checks green; every baseline sitemap URL serves or redirects; Notion renamed and refresh dry-run reports no gap |
| 6 | Small repositories | etalii.adp.ide.vscode, etalii.adp.ide.eclipse, .github | 0 | — | texts aligned; their CI green |
| 7 | Final pass | all | 2–6 | — | SC-001 to SC-006 on every `develop` together; site drops its old-form fallbacks; terminology check turned on in every CI |

## Coordination

- A part that finds a name the rename map lacks adds it in its own pull request and tells this thread, which updates `rename-map.md` so the other parts see it.
- A part that must change something another part owns asks that part's thread instead of changing it.
- Threads open elsewhere when their part starts (for example catalogue work in the site) rebase onto the renamed `develop` before merging; the part's thread says so in theirs.
- Nothing merges into `develop` except through its pull request, merged with a merge commit.
