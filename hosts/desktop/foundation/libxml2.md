---
id: desktop-libxml2
type: submodule-design
title: "libxml2 for XML schema checks"
status: draft
parent: desktop-foundation
---
# libxml2 for XML schema checks

`crates/adp-libxml2`, part of `desktop-foundation`.

## Responsibility

libxml2 2.15.4, statically compiled with `cc`, for the XML editor's XSD and DTD validation. It is the one C library of the host, because no complete pure-Rust XSD validator exists (plan, complexity tracking).

## Rules

- The only crate that allows `unsafe`.
- Every file libxml2 asks for goes through a project-scoped resolver. A reference that leaves the project or names a web address is refused, and the refusal recorded.
- Carries one ADP change (marked "ADP" in `xmlschemas.c`): a facet error names its datatype, as the standalone host's findings do.
