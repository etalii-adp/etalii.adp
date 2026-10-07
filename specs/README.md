# Feature specifications

Every change to an `etalii-adp` repository starts as a GitHub Spec Kit feature in this folder, whichever repository its code lands in. `etalii.adp.ide.standalone` is the one exception: it plans with spec-workflow, in its own `.spec-workflow/`.

- `NNN-feature-name/`: features specified here, in one sequence for the organization. New features go here, with the repository in the name when the code lands in one repository only.
- `<repository>/NNN-feature-name/`: features that were specified in another repository and moved here on 2026-10-05, kept with the numbers they had there, so that "spec 003" in that repository's code, commits and pull requests still finds its folder.
- Numbers 007 and 008 are not in use. `007-vscode-format-binding` and `008-intellij-format-binding` (merged 2026-10-05, pull requests 60 and 61) specified a generic FBL implementation for Visual Studio Code and for IntelliJ. Both were written anew as 009 and 010, which took their place, and the two folders were removed on 2026-10-07; they remain in the history at commit `0e5bbcf`.

| Folder | Moved from | At commit |
|---|---|---|
| [etalii.adp.ide.intellij/](etalii.adp.ide.intellij/README.md) | `etalii.adp.ide.intellij/specs/` | [`ef89ab1`](https://github.com/etalii-adp/etalii.adp.ide.intellij/tree/ef89ab15cb5fbb723790e31c51b6cd4088e81980/specs) |
| [etalii.adp.site/](etalii.adp.site/README.md) | `etalii.adp.site/specs/` | [`bc4efb3`](https://github.com/etalii-adp/etalii.adp.site/tree/bc4efb33dfa2ddd1d7167ebad78ebde752f9c3cc/specs) |

`etalii.adp.ide.vscode`'s only feature, 006-vscode-plugin, was already specified here; `etalii.adp.ide.eclipse` and `.github` had none. The principles of IntelliJ, VS Code and the site moved to [`.specify/memory/repositories/`](../.specify/memory/repositories/); Eclipse's constitution was still the unfilled template and was not kept.
