# Contract: Terminology Check

The check that proves no retired use remains (FR-016, SC-001) and keeps it that way (FR-017). Part 0 publishes the list as `docs/terminology-check.json` in etalii.adp; every repository's CI reads that file, so one change to it applies everywhere.

## Input

- **Retired patterns**: regular expressions, each with the glossary entry it enforces and its replacement. Words are matched case-insensitively; acronyms are matched case-sensitively, so that the English word "did" and lowercase paths are not findings (research R3). Initial set:
  - `\bdesigners?\b` used for a tool or all tools. Because "designer" is also a valid kind, the check reports every match in the files listed as "tool-level" (readmes, product copy, catalogue and settings code) and in identifiers that combine it with a tool-level word (`DesignerEditor`, `offDesigners`, `/designers/`); a match that correctly means the designer kind is listed as allowed by path and line context.
  - DEDL, retired in every sense (research R4): `\bDEDL\b`, `Diagram Editor Definition`, `\.dedl\b`, `dedl\.schema\.json`, `dedlDocument`, `"dedl"\s*:`, `vnd\.dedl\.`, `dedl-fragment`, `/adp/dedl/`, `specifications/dedl/`.
  - The earlier plans' terms that the spec dropped: `\bDIFL\b`, `\bDEFL\b`, `\bEDFL\b`, `\.difl\b`, `\.defl\b`, `\.edfl\b`, `disl\.disl`, `\bDIDL\b`, `\bEDDL\b`, `\.didl\b`, `\.eddl\b`, `specifications/(didl|eddl)/`.
  - `\b(language|definition) designers?\b`, and `\bauthors?\b` in the six language documents and the glossary, where the person is a tool engineer.
  - `\bdiagram editors?\b`, `\beditor runtime\b`.
  - `diagram, designer and (text )?editors?`, `diagram and text designers`, `Browse the designers`.
- **Allowed**: path globs (history folders, vendored files, completed specifications, legacy fixtures), and literal allowances with a reason (platform API names, third-party names such as the W3C's DID, old persisted identifiers read for compatibility: the alias table in `validate-examples.py`, `src/data/redirects.ts`, the site's old schema address, the settings migration in IntelliJ's `AdpSettings`; and the glossary's one line recording that DEDL became DISL and DID).

## Output

For each finding: repository, file, line, the matched text, the glossary entry and the replacement. Exit code 0 when there is none, 1 otherwise.

## Where it runs

- Part 0 runs it once across all repositories to size the parts.
- Part 7 runs it across all repositories as SC-001.
- From part 7 on, each repository runs it on pull requests into `develop` in its existing workflow.
