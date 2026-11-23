# Quickstart: checking the Value Stream Map definition

Run from the root of `etalii.adp`, after `pip install -r .github/scripts/requirements-atd.txt`.

1. **The definition and its fixtures**: `python .github/scripts/validate-examples.py`. Expect `ok` for `value-stream-map.dis`, `value-stream-map.fbl`, both examples and both fixture folders, and no new failure.
2. **The tool description**: with the desktop host built (`cargo build --release --no-default-features -p adp-atd-cli` in `etalii.adp.ide.desktop`), `atd check definitions/diagrams/value-stream-map.atd`. Expect no finding.
3. **The words**: `python .github/scripts/terminology-check.py --name etalii.adp` and `python .github/scripts/licence-check.py`. Expect 0 errors.
4. **The totals** (SC-002): for each example, compute lead time, process time, flow efficiency and hand-offs from the file by hand with the rules of [research.md](research.md) R4, and compare them with the table in `definitions/diagrams/value-stream-map.md`. They must be equal.
5. **A planted defect**: give a step in `restore-service.vsm` a `share:` and a `rework:` on one flow. Step 1 must fail on that flow; restore the file.
6. **An agent's file** (SC-003, for the host's specification): give an agent only `value-stream-map.md`, ask for a five-step stream with times, and run step 1 on its file.
