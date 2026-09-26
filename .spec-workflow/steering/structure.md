# Structure

## Folders

- `specifications/<name>/` holds one specification: its document `<NAME>-specification.md`, its schema `<name>.schema.json`, and its examples beside them. DEDL is the model: `specifications/dedl/`.
- `docs/` holds documentation about the organization and its repositories rather than a format, such as `new-repository.md`.
- `.spec-workflow/` holds the spec-workflow server's steering documents, specs, approvals and templates.

## Naming

- The organization is 'EtAlii' in prose and `etalii-adp` on GitHub; the product is 'ADP', 'A Different Perspective'.
- A specification folder is the format's short name in lowercase (`dedl`); its document takes the name in capitals (`DEDL-specification.md`).
- A file extension a specification defines is lowercase and short (`.dedl`).

## Changes

- One spec-workflow spec per change to a specification, named for the change in kebab case.
- A change that renames or moves a specification's files updates every reference to them in the same pull request.
