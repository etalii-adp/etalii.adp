# Idea Intake: ADP tool marketplace

- **Slug**: tool-marketplace
- **Created**: 2026-10-13
- **Source**: pasted text (project chat, 2026-10-13)
- **Type**: new-capability

## Idea (as captured)

> also create a new idea that follows on this WASM/rust based tool definition: A ADP tool 'marketplace' website where people can provide links to their github projects where the individual rust tools live that then get picked up and compiled, and made available as discoverable and downloadable wasm packages.

## Restated

A website where anyone can register a link to a GitHub repository holding ADP tools written in Rust. The site fetches the tools, compiles each one to a WebAssembly package, and lists the packages so that people can find them and download them for use in an ADP host.

## Origin & Context

- **Raised by**: the maintainer (git user `vrenken`), in a project chat thread on 2026-10-13.
- **Trigger**: it follows directly from the idea [host-agnostic-tool-language](../host-agnostic-tool-language/intake.md). That idea's third shape writes a tool as a set of `.rs` files and compiles them to a single WebAssembly binary, with the Cargo plumbing kept out of the tool engineer's view. This idea asks where such tools come from and where people find them once tools are no longer bundled only by the ADP project itself.

### What it relates to in this repository and the organization

Recorded for the later stages, not as a judgement of the idea:

- **It depends on the earlier idea.** The marketplace assumes tools are Rust compiled to WebAssembly, which is the third or fourth shape of `host-agnostic-tool-language`, none of them decided. If that idea settles on the declarative shape instead, the packages would be specification files plus capability modules rather than whole-tool binaries.
- **Today's distribution model is the opposite.** Definitions are written in etalii.adp and copied, with their provenance, into each host plugin that can interpret them. Hosts do not load tools from user or project folders, and nothing is downloaded at run time. DISL §13.1 says runtimes "MUST NOT download and execute code automatically without user or administrator approval", and §16 says plugins "MUST be installed through an explicit trust decision".
- **The `<vendor>/<type>` origin tag** (`docs/terminology.md`, *Related terms*) already names a tool type's vendor, which is a natural namespace for tools published by others.
- **The tool catalogue already exists.** `etalii.adp.site` publishes a tool catalogue at etalii.net/adp, refreshed from the hosts' `docs/tools.md`, their screenshots and the Notion "Tools" database by written procedures (`procedures/refresh-catalogue.md`). It is a catalogue of ADP's own tools, with no submission, build or download step.
- **Builds run in CI today.** Every repository's Build workflow runs on GitHub-hosted runners.
- The thread's notes on WebAssembly per host, the JSON Schema contract and the Rust tool sketch are in `../host-agnostic-tool-language/notes/`.

## First-Glance Unknowns

- [NEEDS CLARIFICATION: Is the marketplace for whole tools (the Rust-only shape) or for capabilities that declarative tools use (the capability-library shape), or both?]
- [NEEDS CLARIFICATION: Who may publish: anyone with a GitHub account, or reviewed or invited publishers only?]
- [NEEDS CLARIFICATION: Is a published tool trusted by being listed, or does each user or host still make a trust decision (signatures, publisher verification, a review before listing)? This bears on DISL §13.1 and §16.]
- [NEEDS CLARIFICATION: How does a downloaded package reach a host: a manual download a user installs, an in-host browser for the marketplace, or both? Does it change the rule that hosts load no tools from user folders?]
- [NEEDS CLARIFICATION: Which hosts must be able to install marketplace tools, and must every package run in every host?]
- [NEEDS CLARIFICATION: What triggers a build (registration, every push, release tags only), and who pays for and runs the builds?]
- [NEEDS CLARIFICATION: What a listing shows (description, kind, screenshots, versions, licence, conformance results against the shared fixtures), and whether it reuses the existing tool catalogue on etalii.adp.site or is a separate site.]
- [NEEDS CLARIFICATION: Licence rules for listed tools: any licence, permissive only, or none required? The standalone repository already refuses share-alike licences for the example data it vendors.]
- [NEEDS CLARIFICATION: Versioning and compatibility: how a package declares which runtime and host contract versions it needs, and what happens when the runtime moves on.]
- [NEEDS CLARIFICATION: Naming: who owns a `<vendor>` in the origin tag, and how clashes between publishers are resolved.]
