# Quickstart: checking the SLO map definition

Run from the root of `etalii.adp`, after `pip install -r .github/scripts/requirements-atd.txt`.

1. **FBL 0.22**: `python .github/scripts/validate-examples.py`. Expect `ok` for `yaml-stream-read` and `yaml-stream-edits`, and every earlier fixture unchanged.
2. **The definition**: the same command. Expect `ok` for `openslo-slo.dis`, `openslo-slo.fbl` and the three `openslo-slo-*` fixture folders.
3. **Byte-identical round trip** (SC-002): each `openslo-slo-read` case states that writing without an edit leaves the input unchanged; the replay checks it.
4. **The tool description**: `atd check definitions/diagrams/openslo-slo.atd` with the desktop host's `atd` built. Expect no finding.
5. **The budgets** (SC-003): for each objective in the fixtures, compute the time equivalent and the method's own budget by hand with research R5 and R6, and compare with the table in `definitions/diagrams/openslo-slo.md`. For 99.9 % over a rolling 28 days the time equivalent is 40 min 19 s.
6. **The licence**: `python .github/scripts/licence-check.py` passes, and `specifications/fbl/fixtures/openslo-slo-read/LICENSE.md` is byte-identical to OpenSLO's `LICENSE` at the recorded commit.
7. **A planted defect**: remove the `---` line before the second document of a `yaml-stream-read` input; step 1 must fail on the case that expects three documents. Restore it.
8. **An agent's file** (SC-005, for the host's specification): give an agent only `openslo-slo.md`, ask for a Service with one SLO and one SLI, run `oslo validate` on it and step 2's reading.
