# Quickstart: checking the Post-Incident Review Designer definition

Run from the root of `etalii.adp`, after `pip install -r .github/scripts/requirements-atd.txt`.

1. **DESL 0.4**: `python .github/scripts/validate-examples.py`. Expect `ok` for `minimal-sections.des`, its binding and its document, and every earlier example unchanged.
2. **The definition**: the same command. Expect `ok` for `post-incident-review.des`, `.fbl`, both examples and the `post-incident-review-*` fixtures.
3. **The tool description**: `atd check definitions/designers/post-incident-review.atd` with the desktop host's `atd` built. Expect no finding.
4. **The intervals** (SC-002): for each example, take the milestones from the file and compute the four intervals by hand; compare them with the table in `definitions/designers/post-incident-review.md`. In the contract's example the time to mitigate is 50 minutes (10:12 to 11:02).
5. **Plain Markdown** (SC-005, for the host's specification): render `examples/certificate-expiry.md` with any Markdown viewer and answer what happened, how long detection took and who owns each action.
6. **A planted defect**: give two entries of `checkout-latency.md` the kind `detection`; step 2 must report `pir.second-milestone` at the second where the fixture states it. Restore it.
7. **An agent's file** (SC-003, for the host's specification): give an agent only `post-incident-review.md`, ask for a review with eight entries and three proposed factors, and run step 2's reading on it.
