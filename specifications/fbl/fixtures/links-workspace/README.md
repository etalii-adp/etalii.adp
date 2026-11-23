# Links between documents: a fixture workspace

This folder is one workspace in the sense of FBL section 17.3. `conformance.json` lists every link its documents hold, what resolving it yields (a target and an element, or a finding) and its text after the consuming document's load-time validation (17.4); `validate-examples.py` reads the documents, builds the index, resolves each link and compares.

What it holds: two knowledge files, one of them under the name the other had, a timeline that links into every other document and into itself, a mind map whose nodes link to the timelines, the dependency graphs and the knowledge file, a dependency graph and a copy of it under another name, a timeline and a copy of it under the same name in another folder, and a timeline made before documents had ids.

What it does not demonstrate:

- The knowledge file's conversion from relations by path to links, which its definition states (spec 089, phase 7) and which is added here then.
- A link held by a knowledge relation cell, for the same reason.
- How a host draws a linked element, the lookup, backlinks shown on an element, or a Freeplane round trip: those are a host's (spec 089, *What the checks cannot see*).
- Several workspace roots, or a link that would leave the workspace: resolution here reads only this folder.

The validator reads each format with a reader of its own, enough to find document ids, element ids, their names and links: the timeline's and dependency graph's top-level `id` and `elements`, the knowledge file's envelope `id` and rows named by their title property, and the mind map's `adp-id` and `adp-link` node attributes. The bindings that read those files for a host are the tool types' own.
