# Quickstart: The Hierarchical Requirement Designer in the Desktop Host

How to check this feature once it has landed. Paths are in `etalii.adp.ide.desktop` unless they say otherwise.

## The checks every pull request runs

```bash
cargo fmt --all --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
python tools/sync-etalii-adp.py --check
```

Narrower runs while working:

```bash
cargo test -p adp-fbl bullets                               # the bullets family
cargo test -p adp-conformance                               # every FBL fixture; none of the 29 set aside (SC-002)
cargo test -p adp-designer-hierarchical-requirement         # the module, ported from the standalone host's tests
cargo test -p adp-shell hierarchy                           # the view's rules and drawings
cargo test -p adp-parity hierarchical_requirement           # the scripts against the goldens (SC-003)
```

Expected: every test passes; `adp-conformance` lists no `bullets-*`, `behavior-tree-read`, `registration-blocks` or `hierarchical-requirement-*` fixture as not supported.

## Plant a defect

Change one byte of `vendor/etalii.adp/specifications/fbl/fixtures/hierarchical-requirement-edits/` 's expected result in a scratch copy and run `cargo test -p adp-conformance`: it fails at that step (SC-002). Put it back.

## Record the goldens

With the .NET 10 SDK and the standalone host at this feature's reference commit beside the repository:

```bash
git -C ../etalii.adp.ide.standalone worktree add --detach ../standalone-a7fdf03 a7fdf039c204535e9fc3a14f456e6f5a36a685ce
dotnet run --project parity/recorder -- parity/scripts/etalii/hierarchical-requirement
```

The recorder reads the commit from `parity/scripts/etalii/hierarchical-requirement/reference` and refuses a worktree at another commit ([contracts/parity-scripts.md](contracts/parity-scripts.md)).

## Walk a story by hand

Open a copy of `parity/fixtures/etalii/hierarchical-requirement/web-shop/` in the desktop host (`cargo run -p adp-shell --release -- <folder>`) and in the standalone host at `a7fdf03`, at the same window width, in light and then dark. Follow the story's scenarios in the [specification](desktop-hierarchical-requirement.spec.md); for Story 7 compare the eleven points side by side in screenshots, and measure REQ-0003's box height unselected, selected and while editing. Record the date, platform, result and screenshots in `parity/walks.md`, and set the inventory rows the walk covers to `checked`.

## Timing

```bash
cargo bench -p adp-shell --bench hierarchy
```

Prints the open and outside-change times of the 100-item, 500-requirement document (bound 2 s) and of the NIST SP 800-53 example (bound 4 s) (SC-005).
