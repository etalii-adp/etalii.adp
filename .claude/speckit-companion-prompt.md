<!-- speckit-companion:context-update -->
Before and after this step runs, update c:\git\etalii.adp\specs\002-naming-convention-alignment/.spec-context.json. Schema:

```jsonschema
{
  "type": "object",
  "required": ["workflow", "specName", "currentStep", "status", "history"],
  "additionalProperties": true,
  "properties": {
    "workflow":    { "type": "string" },
    "specName":    { "type": "string" },
    "branch":      { "type": "string" },
    "selectedAt":  { "type": "string", "format": "date-time" },
    "currentStep": { "enum": ["specify","clarify","plan","tasks","analyze","implement"] },
    "status":      { "enum": ["draft","specifying","specified","planning","planned","tasking","ready-to-implement","implementing","implemented","completed","archived"] },
    "history": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["step","substep","kind","by","at"],
        "properties": {
          "step":    { "$ref": "#/properties/currentStep" },
          "substep": { "type": ["string","null"] },
          "kind":    { "enum": ["start","complete"] },
          "by":      { "enum": ["extension","user","cli","ai","derive"] },
          "at":      { "type": "string", "format": "date-time" }
        }
      }
    }
  }
}
```

Invariants beyond JSON Schema:
- `history` is APPEND-ONLY. Never reorder, never delete, never edit prior entries.
- The last `history[]` entry's `step` MUST equal `currentStep`. If you change
  `currentStep`, append a matching history entry in the SAME write. `currentStep`
  ahead of `history` is an invalid state — the viewer reads it as a fake
  "Generating <step>…" indefinitely.
- `status` MUST match the lifecycle stage of `currentStep` (see the status table
  below).
- Do NOT write `stepHistory` or `transitions` — both are deprecated. `stepHistory`
  is derived in-memory by the viewer; `transitions` was renamed to `history`.

Canonical statuses: draft → specifying → specified → planning → planned → tasking → ready-to-implement → implementing → implemented → completed.
When starting a step: set status to the in-progress form (specifying, planning, tasking, implementing).
When completing a step: set status to the completed form (specified, planned, ready-to-implement, implemented).

IMPORTANT — the implement step completes at "implemented", NOT "completed".
"completed" is the user's final approval gate (their Mark-Completed click in the
viewer) — the AI never writes "completed". The implement step itself is closed by
the extension's tasks.md watcher, which sets "implemented" once every task is
checked; you do not flip the implement status or write its completion entry yourself.

1. Pre-step: set currentStep = "tasks" and the matching in-progress status. Append a history entry { step: "tasks", substep: null, kind: "start", by: "extension", at: "2026-09-28T23:56:13.464Z" }. Use the DISPATCH TIME for this start entry — it was sent by the extension.
1.5. When advancing from a previous step: flip the previous step's status to its completed form before writing the new step.

Canonical substeps for tasks: generate. For each substep boundary append a SINGLE finish entry { step, substep: "<name>", kind: "complete", by: "ai", at } the moment it ends (fresh `date -u`) — one per substep, never two sharing a timestamp, never a separate start. The delta between finishes is each substep's duration.

CAPTURE THE REASONING (best-effort: if python3 is unavailable, skip silently — never block the step; the writer de-dupes, so re-runs are safe):
- `python3 "c:\Users\vrenk\.vscode\extensions\alfredoperez.speckit-companion-0.33.0\speckit-extension\scripts\write-context.py" --feature-dir "c:\git\etalii.adp\specs\002-naming-convention-alignment" --coverage-req FR-NNN --tasks "T001,T004"` per requirement (which tasks cover it).
- `python3 "c:\Users\vrenk\.vscode\extensions\alfredoperez.speckit-companion-0.33.0\speckit-extension\scripts\write-context.py" --feature-dir "c:\git\etalii.adp\specs\002-naming-convention-alignment" --step tasks --step-summary '{"summary": "<task count + shape>"}'`.

╔══════════════════════════════════════════════════════════════════╗
║  MANDATORY FINAL WRITE — DO THIS BEFORE YOUR TURN ENDS          ║
╚══════════════════════════════════════════════════════════════════╝
Run this script to close tasks — it appends the step's "complete" entry AND flips status to "ready-to-implement" in one atomic, forward-only write:
    python3 "c:\Users\vrenk\.vscode\extensions\alfredoperez.speckit-companion-0.33.0\speckit-extension\scripts\write-context.py" --feature-dir "c:\git\etalii.adp\specs\002-naming-convention-alignment" --step tasks --advance --by ai
Never hand-author the JSON or hand-flip the status — the script stamps the real clock and writes atomically.
Then print "Done creating tasks" as the final terminal line.

Skipping the script leaves the badge stuck on the in-progress form and the step timer running; skipping the final line hides the completion from the activity log.

Leave currentStep on "tasks". This command is single-step — the user clicks the next-phase button (or the extension dispatches a fresh /speckit.<next> command) to advance; that path appends the next start-entry. Writing a start-entry for the next step here is a lie that makes the viewer render a phantom "Generating <next>…" indefinitely.

DISPATCH TIME (UTC): 2026-09-28T23:56:13.464Z
TIMESTAMPS: For the start entry already written by the extension, the DISPATCH TIME above was used. For any additional entries you append, run
    date -u +"%Y-%m-%dT%H:%M:%SZ"
and paste the output. Never type a timestamp by hand.

AUTHORSHIP: `by: "extension"` = entries the extension writes; `by: "ai"` = entries you append.
TASK SUMMARIES (implement only): append task_summaries.<TaskID> = { status, did, files, concerns }.
status is "DONE" or "DONE_WITH_CONCERNS"; did is one sentence; files is string[]; concerns is string[].
Omit concerns when empty — never write "None"/"N/A". The viewer reads these.

Skip step_summaries.<step>.tests_passing, .files_planned, .checkpoints — unconsumed.

Invariants: preserve unknown fields; history is append-only.
<!-- /speckit-companion:context-update -->

/speckit-tasks c:\git\etalii.adp\specs\002-naming-convention-alignment