# etalii.adp

The specifications for ADP ("A Different Perspective"): the formats and languages that the ADP designers in the `etalii.adp.ide.*` repositories implement. The first is DEDL, the Diagram Editor Definition Language, under `specifications/dedl/`.

## Creating a new repository

Every repository in the `etalii-adp` organization follows the rules in [docs/new-repository.md](docs/new-repository.md): its name, the `develop` default branch, pull-request-only delivery with merge commits, the GitHub settings, the files it starts with, and access for Claude. Work through that list whenever a repository is created, and update it in the same change that alters one of its rules.

## How work is done here: spec-driven development (GitHub Spec Kit)

Every change starts as a specification. Use the Spec Kit skills in `.claude/skills/` in order:

1. `/speckit-constitution` — project principles, in `.specify/memory/constitution.md`. Read it before any other step; plans are checked against it.
2. `/speckit-specify` — a feature spec under `specs/NNN-feature-name/`, on its own `features/NNN-feature-name` branch (the `git` extension creates it).
3. `/speckit-clarify` — optional, resolves `[NEEDS CLARIFICATION]` markers before planning.
4. `/speckit-plan` — technical plan, research, data model and contracts.
5. `/speckit-tasks` — ordered, testable tasks.
6. `/speckit-analyze` — optional cross-artifact consistency check.
7. `/speckit-implement` — execute the tasks.

The SpecKit Companion extension (`.specify/extensions/companion/`) records each run in the spec's `.spec-context.json`. `/speckit-companion-status` says where a spec stands and `/speckit-companion-resume specs/NNN-feature-name` continues it from its last completed step.

Specs say *what* and *why*; plans say *how*. Do not put implementation choices in a spec.

Spec Kit sits beside spec-workflow (below) for now; both plan changes, and a change is planned in one of them, not both.

## Branches and delivery

- `develop` is the integration branch.
- Feature work happens on its own branch named `features/<name>`, in its own worktree; Spec Kit names them `features/<number>-<name>` (its `branch_prefix` is set to `features`). The one exception is `claude/<name>`, which Claude's cloud sessions are handed by their harness.
- A feature branch is never merged locally into `develop`. When its work is done, push the branch from the worktree it was built in to `origin` and open a pull request into `develop`; nothing reaches `develop` except through a pull request. There is no branch protection, so this holds by convention alone: never push to `develop` directly.
- Pull requests are merged with a merge commit, never a squash or a rebase.
- When the pull request is merged or closed, delete the branch locally and on `origin`, and remove the worktree.

## spec-workflow

Kept alongside Spec Kit for now.

Changes to the specifications are planned with the spec-workflow MCP server ([@pimzino/spec-workflow-mcp](https://github.com/Pimzino/spec-workflow-mcp)), registered for this repository in `.mcp.json`. It keeps its files in `.spec-workflow/`:

- `steering/` holds `product.md`, `tech.md` and `structure.md`, which say what this repository is for, which formats and tools a specification uses, and where its files live. Read them before writing a specification.
- `specs/<name>/` holds each change's `requirements.md`, `design.md` and `tasks.md`, written in that order and each approved before the next is started.
- `approvals/` holds the approval records the dashboard writes. Approval comes from the dashboard, never from a chat message.
- `templates/` holds the server's default templates, which it rewrites on each version; put overrides in `user-templates/` instead.

The dashboard runs with `npx -y @pimzino/spec-workflow-mcp@latest --dashboard` and reads `.spec-workflow/` from the checkout the server was started in. Specification documents follow the same branch and pull-request rules as everything else. Commit a spec-workflow document together with its approval files when it is approved.

On Windows, if Claude Code cannot start the server through `npx`, register it locally with `claude mcp add spec-workflow cmd.exe /c "npx -y @pimzino/spec-workflow-mcp@latest"` instead.

## Writing specifications

- Normative text uses the RFC 2119 and RFC 8174 key words in bold capitals, as the DEDL specification does.
- Each specification lives in its own folder under `specifications/`, with its prose, its JSON Schema and its examples side by side.
- When writing markdown files do not split lines to ensure a maximum line length is honored.
