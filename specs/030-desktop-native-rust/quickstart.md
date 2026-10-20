# Quickstart: The Native Desktop Host

How a developer builds, checks and runs the desktop host once increment 1 has landed. Paths are in `etalii.adp.ide.desktop`.

## Build and run

```bash
rustup show
cargo run -p adp-shell --release
```

On Linux, install the system packages the Build workflow lists (Vulkan or GL, `libxkbcommon`, `libwayland`, `libxml2` headers for the build only).

## The checks every pull request runs

```bash
cargo fmt --all --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
cargo test -p adp-conformance
cargo test -p adp-parity
cargo test -p adp-theme
```

## Refresh the specifications from etalii.adp

```bash
tools/sync-etalii-adp <etalii.adp commit>
```

This rewrites `vendor/etalii.adp/` and `vendor/etalii.adp.lock`. Commit both together; CI fails when they disagree.

## Record goldens again

Only when the reference commit moves, with the .NET SDK and a clone of `etalii.adp.ide.standalone` at that commit beside this repository:

```bash
dotnet run --project parity/recorder -- --standalone ../etalii.adp.ide.standalone --scripts parity/scripts --out parity/goldens
```

## Walk a user story by hand

Open `parity/walks.md`, pick the story, and follow its steps on each platform in both themes, once with a screen reader for Story 1. Record the date, platform and result in the same file, and set the inventory rows the walk covers to `checked`.

## Check the look against VS Code

Open VS Code at the tag in `crates/adp-theme/vscode/SOURCE.md` with its default dark theme (Dark 2026 at `1.142.0`), beside the desktop host on the same workspace, and compare the explorer, tabs, panels, menus and status bar; then repeat with its default light theme. `cargo test -p adp-theme` has already compared every value.
