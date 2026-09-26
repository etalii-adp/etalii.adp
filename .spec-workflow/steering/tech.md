# Technology

This repository holds documents and schemas, not a build. There is no code to compile or test yet.

## Formats a specification uses

- **Prose**: Markdown. Normative statements use the RFC 2119 and RFC 8174 key words in bold capitals; informative sections are marked *(informative)*.
- **Schemas**: JSON Schema, draft 2020-12, one schema file per specification, with `$defs` for each top-level structure.
- **Expressions**: CEL, the Common Expression Language (https://cel.dev), wherever a specification needs computed values or conditions.
- **Examples**: JSON documents in the specification's own format, each valid against its schema.

## Versioning

A specification states its version and status (for example *0.1, Working Draft*) at the top of its document. Constructs may change freely before 1.0; from 1.0 on, a change that invalidates existing documents needs a new major version.

## Tooling

- The spec-workflow MCP server plans changes here; see `CLAUDE.md`.
- No CI workflow yet. When one is added, it should at least validate every example against its schema, on pull requests into `develop`.
