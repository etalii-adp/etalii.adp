# Feature specifications

Every change to an `etalii-adp` repository starts as a GitHub Spec Kit feature in this folder, whichever repository its code lands in. `etalii.adp.ide.standalone` is the one exception: it plans with spec-workflow, in its own `.spec-workflow/`.

- `NNN-feature-name/`: features specified here, in one sequence for the organization. New features go here, with the repository in the name when the code lands in one repository only.
- `<repository>/NNN-feature-name/`: features that were specified in another repository and moved here on 2026-10-05, kept with the numbers they had there, so that "spec 003" in that repository's code, commits and pull requests still finds its folder.
- `016-standalone-*` to `024-standalone-*`: the nine finished spec-workflow specifications that `etalii.adp.ide.standalone` had archived under `.spec-workflow/archive/specs/`, migrated into Spec Kit's shape on 2026-10-10 and numbered in the order they were specified (2026-09-03 to 2026-09-23). They are history, not work: every task is ticked and each `.spec-context.json` says `completed`. Their text is the source's, rearranged into Spec Kit's sections; their implementation logs are copied verbatim into `implementation-logs/`. The archive left standalone in its commit `6e77d96`; its last state is [`9a64600`](https://github.com/etalii-adp/etalii.adp.ide.standalone/tree/9a64600930029e93edf256858e2efb24d19bfafe/.spec-workflow/archive/specs).
- Numbers 007 and 008 are not in use. `007-vscode-format-binding` and `008-intellij-format-binding` (merged 2026-10-05, pull requests 60 and 61) specified a generic FBL implementation for Visual Studio Code and for IntelliJ. Both were written anew as 009 and 010, which took their place, and the two folders were removed on 2026-10-07; they remain in the history at commit `0e5bbcf`.

| Folder | Moved from | At commit |
|---|---|---|
| [etalii.adp.ide.intellij/](etalii.adp.ide.intellij/README.md) | `etalii.adp.ide.intellij/specs/` | [`ef89ab1`](https://github.com/etalii-adp/etalii.adp.ide.intellij/tree/ef89ab15cb5fbb723790e31c51b6cd4088e81980/specs) |
| [etalii.adp.site/](etalii.adp.site/README.md) | `etalii.adp.site/specs/` | [`bc4efb3`](https://github.com/etalii-adp/etalii.adp.site/tree/bc4efb33dfa2ddd1d7167ebad78ebde752f9c3cc/specs) |

`etalii.adp.ide.vscode`'s only feature, 006-vscode-plugin, was already specified here; `etalii.adp.ide.eclipse` and `.github` had none. The principles of IntelliJ, VS Code and the site moved to [`.specify/memory/repositories/`](../.specify/memory/repositories/); Eclipse's constitution was still the unfilled template and was not kept.
