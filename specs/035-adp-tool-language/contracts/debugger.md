# Contract: the debugger in the desktop host

The interface between the script interpreter (`adp-atd-script`) and the shell's debugger panel, and what the panel shows. Research R21; data-model.md §13. The concepts are the Debug Adapter Protocol's; there is no wire protocol in phase 1.

## Interpreter side (Rust API, `adp-atd-script::debug`)

| Item | Meaning |
|---|---|
| `Breakpoint { file, line, condition: Option<CelSource> }` | set on a line of a script function, operation, hook or binding rule; `verified` once it maps to an executable statement |
| `DebugControl` | `continue`, `step_over`, `step_into`, `step_out`, `pause`, `stop` |
| `DebugEvent` | `Paused { reason: Breakpoint\|Step\|Entry, frame }`, `Continued`, `Finished { committed: bool }`, `Stopped { reason: User\|Budget\|Recursion }`, `Output { text }` (from `notify`) |
| `Frame { id, name, file, line, column }` | the call stack, innermost first, back to the gesture's operation or hook |
| `Scope { frame, kind: Locals\|Arguments\|Elements\|Transaction\|Budget }` | |
| `Variable { name, value, type, children }` | CEL values; elements expand to their attributes in the working copy; the transaction's commands in order of application |

A gesture under the debugger runs on a worker thread. A pause parks it on a channel; the shell stays responsive. A conditional breakpoint evaluates its CEL condition in the frame's scope, under the same determinism rules; a condition that fails to evaluate is reported once and treated as false.

## Panel (shell)

- In the validation view: a gutter for breakpoints in the `.atd` text, a toolbar (continue, step over, into, out, stop), and panes for the call stack, the scopes of the selected frame, the transaction, and the budget (steps used of allowed, recursion depth).
- Stop discards the transaction; the working copy and every file are as before the gesture (FR-072), including when the pause is inside a hook run by another operation's transaction (spec edge case: the whole transaction is discarded).
- Shortcuts use the platform's modifier key; every control is exposed to accessibility with its role, name and state (the desktop host's Principle I).

## Acceptance (story 6, SC-008)

Three seeded defects in the mind map's and the causal loop's script functions (a wrong comparison, an off-by-one limit, a missing `else`), with the expected stops, variables and transaction recorded in `etalii.adp.ide.desktop/crates/adp-atd-script/tests/debug/`; a tool engineer finds each cause in under 10 minutes (quickstart step 9).
