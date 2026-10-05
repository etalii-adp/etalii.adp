# Contract: the Build workflow of etalii.adp.ide.vscode

`.github/workflows/build.yml`, named `Build`. It keeps everything [spec 001's contract](../../001-ci-and-badges/contracts/build-workflow.md) gives every Build workflow and adds what follows. The model is `etalii.adp.ide.intellij`'s workflow as its spec 005 built it.

## Triggers

A pull request into `develop`, a push to `develop`, and a manual run. Concurrency per ref; a newer commit on a pull request cancels the older run.

## Jobs

| Job | Runs | Does | Permissions |
|---|---|---|---|
| `check` | always | the repository's file checks, as today | `contents: read` |
| `plugin` | after `check` | Node 22; `npm ci`; `npm run check` (types and lint); `xvfb-run npm test` (core, webview, and the plug-in in a real Visual Studio Code); `npm run package`; lists skipped tests with reasons in the job summary; keeps `reports/` on every run that was not cancelled; uploads `etalii-adp-<version>.vsix` unarchived, failing when it is missing | `contents: read` |
| `development-build` | on `develop`, after `check` and `plugin` passed | takes the `.vsix` the `plugin` job made and publishes it as the development build | `contents: write` |
| `terminology` | pull requests | as today | `contents: read` |

The step that looks for `package.json` and reports the job as skipped is removed once `package.json` exists.

## Downloads

- **From a run**: the artifact is the `.vsix` itself, named after the file, kept for the default retention. A run whose `plugin` job failed before packaging offers none.
- **Development build**: one pre-release on the Releases page under the tag `development`, titled `Development build <version> (<short sha>, <date>)`, with notes naming the commit, its subject, the date and the run that checked it. Its only asset is the newest `.vsix`. It is never marked latest.

## Development build rules

- Published only from `refs/heads/develop`, so never from a pull request or a fork.
- Moves only forward: when the existing tag is not behind the run's commit, the job leaves it and says so.
- Uploads the new asset, removes other assets, edits the title and notes, and moves the tag last, so a job that stopped half-way is not taken for published when re-run.
- A run whose `check` or `plugin` job failed does not reach this job, so the previous build stays.

## Not in this workflow

Versioned releases by a version mark, signing, and publishing to a marketplace.
