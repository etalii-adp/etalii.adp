# Baseline of feature 025

The baseline is [baseline-measurements.json](baseline-measurements.json): the output of `etalii.adp.ide.standalone/.github/tools/analysis/measure.sh` for `etalii.adp.ide.standalone` at `1217e1d97`, the `develop` commit the work started from on 2026-10-12 (T009, FR-009).

The specification's success criteria quote the report, read at `fcb64c9`, and say that where the baseline differs a criterion is the same proportion of the baseline. This page works that out once, so that no milestone review has to. A criterion not listed here is either counted by reading rather than by a script, or its baseline figure matches the report's; it stands as written.

## Where the baseline differs from the report

| Criterion | Report | Baseline | Criterion against the baseline |
|---|---|---|---|
| SC-005, test code | 125k lines | 131,810 lines | At least 5,273 lines smaller (5,000 × 131,810 / 125,000) |
| SC-008, context-source-resolver role | 1,911 windows | 291 windows | Fewer than 31 shared windows |
| SC-008, session-factory role | 326 windows | 54 windows | Fewer than 9 |
| SC-008, property-provider role | 134 windows | 39 windows | Fewer than 15 |
| SC-008, document-store role | 115 windows | 98 windows | Fewer than 43 |
| SC-008, action-provider role | 99 windows | 80 windows | Fewer than 41 |
| SC-012, core references of the diagram abstractions | 8 | 9 (it also references `EtAlii.Adp.Backend`) | Unchanged: the criterion names the projects allowed, not a count |
| SC-013, projects without code | not counted | 1 (`EtAlii.Adp.Sessions`) | Unchanged: none |
| SC-013, core projects naming a tool module | not counted | 11 edges, from 3 projects | Unchanged: none |
| SC-023, methods over 50 code lines | 145 | 180 | At most 124 |
| SC-023, methods over 80 code lines | 40 | 45 | At most 22 |

Fractions are rounded towards the stricter figure.

## Why the counts differ

- **Clone windows.** The report's 1,911 resolver windows cannot be reproduced: its normalization is not written down. The script counts 291 windows over 2,960 file pairs. The proportions above inherit that uncertainty, so the M2 review weighs SC-008 by the trend from this baseline as well as by the threshold.
- **Methods.** The script counts local functions, constructors and accessors with block bodies as methods, which the report seems not to have done (inferred: the ten longest methods match within one line). That accounts for 180 against 145 and 45 against 40.
- **Test lines.** Test code grew between `fcb64c9` and `1217e1d97`; production code of the tool modules is 91,949 lines against the report's 92k, so SC-006 stands as written.

SC-014's seven containment implementations, SC-016's eight call sites and the other counts in brackets are counted by reading, not by the scripts, and are checked by the review of the milestone that is due to meet them.
