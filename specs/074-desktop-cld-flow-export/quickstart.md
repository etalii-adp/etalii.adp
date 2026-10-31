# Quickstart: checking the flow page export

## Prerequisites

- The desktop host built from `develop` after D3 merged (`cargo run -p adp-shell --release`).
- The standalone host from `develop` after S merged.
- The mental health example from `etalii.adp.ide.standalone/src/examples/diagrams/causal-loop-diagram/mental-health/` (`.cld` and `.adp`) copied into a folder of your own.

## 1. The properties (User Story 8)

1. Open `mental-health.cld` in the desktop host and click the empty canvas. Expected: the property panel shows *Flow page* with Link strength 3, Delay length 5, Inertia 1.2, Simulation speed 1, Dot density 3 and Heatmap reading Backlog, and *Identity* with an empty Title.
2. Set the Title to `Mental health at work`, Link strength to 4, the Starting level of *Norm: don't make a fuss* to 0.8, and the Weight of *Emotion suppression → Exhaustion* to 1.5. Save. Expected: `git diff` shows a `title` line and a `flow strength=4` line after the header, ` start=0.8` on the norm's line and ` weight=1.5` on the link's line, and no other change.
3. Open the same file in the standalone host. Expected: the same four values in its property panel.
4. Set Link strength back to 3 and save. Expected: the `flow` line is gone.

## 2. The export (User Stories 1 to 7)

1. Press **Export flow page** on the ribbon. Expected: `mental-health {yyyy-mm-dd hh.mm}.html` appears beside the `.cld`, opens in your browser, and starts moving. The status bar names the file.
2. Check the page:
   - the title reads "Mental health at work";
   - the Link strength slider starts at 4 and the norm's slider at 80%;
   - the delayed links (dashed, with ‖) carry clusters of dots;
   - under Backlog, Exhaustion and Mental health dropout grow hottest within 20 s;
   - every heatmap reading recolours the drawing;
   - the eight loops are listed with live gains.
3. Turn off the network and reload the page. Expected: it runs the same.
4. Export again within the same minute. Expected: one file, replaced. Export a minute later. Expected: a second file, the first untouched.
5. Open a `.mm` mind map. Expected: the button is disabled and says why.

## 3. Automated

```bash
# etalii.adp
python .github/scripts/validate-examples.py
python .github/scripts/atd-grammar.py --check
# etalii.adp.ide.desktop
cargo fmt --all --check && cargo clippy --workspace --all-targets -- -D warnings && cargo test --workspace
node tools/flow-page-check/check.mjs   # the headless page check (R6)
python tools/sync-etalii-adp.py --check
```

## 4. The website (User Stories 9 and 10)

After W2 merges and `deploy` runs, open `https://etalii.net/adp/tools/systems/causal-loop-diagram/`. Expected: the flow page screenshot, and beside it the capability text of User Story 9 scenario 2.

On the same tool page, follow each example's flow page link. Expected: one link per example, each opening its flow page on its own and moving; the documentation's page of flow pages lists the same pages.
