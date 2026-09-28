# Contract: Terminology Check

The check that proves no retired use remains (FR-016, SC-001) and keeps it that way (FR-017). Part 0 publishes the list as `docs/terminology-check.json` in etalii.adp; every repository's CI reads that file, so one change to it applies everywhere.

## Input

- **Retired patterns**: case-insensitive regular expressions, each with the glossary entry it enforces and its replacement. Initial set:
  - `\bdesigners?\b` used for a tool or all tools. Because "designer" is also a valid kind, the check reports every match in the files listed as "tool-level" (readmes, product copy, catalogue and settings code) and in identifiers that combine it with a tool-level word (`DesignerEditor`, `offDesigners`, `/designers/`); a match that correctly means the designer kind is listed as allowed by path and line context.
  - `\bDEDL\b`, `\.dedl\b`, `dedl\.schema\.json`, `Diagram Editor Definition`.
  - `\b(language|definition) designers?\b`.
  - `\bdiagram editors?\b`, `\beditor runtime\b`.
  - `diagram, designer and (text )?editors?`, `diagram and text designers`.
- **Allowed**: path globs (history folders, vendored files, completed specifications), and literal allowances with a reason (platform API names, third-party names, old persisted identifiers read for compatibility).

## Output

For each finding: repository, file, line, the matched text, the glossary entry and the replacement. Exit code 0 when there is none, 1 otherwise.

## Where it runs

- Part 0 runs it once across all repositories to size the parts.
- Part 7 runs it across all repositories as SC-001.
- From part 7 on, each repository runs it on pull requests into `develop` in its existing workflow.
