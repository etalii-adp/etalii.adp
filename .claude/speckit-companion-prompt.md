<!-- speckit-companion:context-update -->
This command's body carries the full `.spec-context.json` capture & timing protocol — schema, status lifecycle, self-close, and per-task journaling. Follow it. This preamble adds only the dispatch context the body can't know:

1. Pre-step seed: the start stamp the body describes, for c:\git\etalii.adp\specs\011-notion-repository/.spec-context.json, carries this DISPATCH TIME — pass it as `--at "2026-10-07T15:36:55.871Z"` on that one call. Do NOT run `date -u` for it and never hand-write the entry; a start already recorded makes the call a no-op.

Leave currentStep on "plan". This command is single-step — the user clicks the next-phase button (or the extension dispatches a fresh /speckit.<next> command) to advance; that path appends the next start-entry. Writing a start-entry for the next step here is a lie that makes the viewer render a phantom "Generating <next>…" indefinitely.
<!-- /speckit-companion:context-update -->

/speckit-companion-plan c:\git\etalii.adp\specs\011-notion-repository