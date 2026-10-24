---
id: site
type: module-design
title: ADP site (etalii.adp.site)
status: draft
parent: architecture
depends-on:
  - disl
  - did
  - desl
  - ded
  - fbl
  - atd
  - terminology
  - hosts
  - host-notion
references:
  - principles-site
---

# ADP site (`etalii.adp.site`)

ADP's front door and its published reference, at `https://etalii.net/adp/`. It is for visitors new to ADP, tool engineers and users. It is not a host: it presents the product, its hosts and its tools, and publishes the language reference. Its principles are `principles-site`. It is specified by `specs/etalii.adp.site/001` to `006` and `specs/032-site-desktop-host`.

## What it publishes

- **About** (`/adp/`): what ADP is, its focus areas, where ADP runs (one card per host), and the build status of every repository.
- **Documentation:**
  - terminology;
  - specification and definition;
  - the DISL overview;
  - a versioned reference for each language (`/adp/{disl,did,desl,ded,fbl,atd}/<version>/…`), with search, examples, schema pages, and the schema files served at their `$id`;
  - the tool catalogue (`/adp/tools/`, one page per `<vendor>/<type>`, behind one filter page);
  - research articles.
- **Notion add-ons** (`/adp-notion/`): built from `etalii.adp.ide.notion` into the same deployment, because a GitHub Pages deployment replaces the whole domain and this repository alone owns `etalii.net`. The root of the domain redirects to `/adp/`, and old addresses redirect to their new places.

## Shape

- **Stack:** Astro with Starlight, a static build (`base: /adp`) deployed to GitHub Pages.
- **Search:** a custom pagefind index.
- **Diagrams:** Mermaid rendered at build time.
- **Language:** English only.

## Subsystems

- **Navigation:** two parts and their sections drive the header, sidebar, breadcrumbs and footer. Every page has a description and a part.
- **Home and hosts:** the host cards, in a fixed order enforced at build time.
  - State is shown as text, not colour alone.
  - An *available* host requires a public https link, and a host with no link carries a note.
  - Every host has a source record (repository, path, commit, date, method, licence).
- **Tool catalogue:** assembled from the refreshed sources (the hosts' `docs/tools.md`, screenshots and host states), the Notion "Tools" snapshot, and site-owned files for publication, redirects, file formats and screenshot notes.
  - A tool has an install link if and only if its state is *available*.
  - Only publishable screenshots are emitted, each with alt text and a reason it matters.
  - Host states are written back to Notion only after merge, so Notion is never ahead of the site.
- **Language reference:** versioned snapshots of `etalii.adp`'s `specifications/<lang>/`, each with provenance, a version banner and reverse links. Moved addresses are checked to stay alive.
- **Refresh engine:** procedures (`refresh-screenshots`, `refresh-catalogue`, `refresh-hosts`, `refresh-all`) that each own `sources/<id>/` only and open an auto-merging pull request.
  - They run hourly, by hand, or on a `source-changed` dispatch from any host repository.
  - The language reference is refreshed by its own command, all-or-nothing, with the licence recorded.
- **Build status, stats and visitor counter:** GitHub badges and Shields.io statistics per repository, and a counter image. These are the only third-party loads, as spec 001 allows.

## Rules and decisions

- **Sourced, never retyped.** Content comes from its source with provenance, because hand copies drift. No tool page is written by hand, and screenshots are imported, never retaken. *(Terminology, the DISL overview and the research articles are still repeated by hand with a source link.)*
- **Truthful states per host.** The hosts do not move in step, and a false claim loses the reader.
- **Accessibility and privacy:** WCAG 2.2 AA, readable without scripts, usable at phone width, and no tracking beyond what a specification allows.
- **Static site only** (simplicity).
- **Specified in `etalii.adp`.** The repository has no Spec Kit setup of its own.

## Known drift

As of 2026-10-24:

- **The home page's host cards** come from a hand-written `src/data/hosts.yaml` (2026-09-26), not from the refreshed `sources/hosts/hosts.json`. They show standalone as "in progress, not public yet" despite its alpha releases, and VS Code as "planned" though it is in progress.
- **Desktop and Claude** appear only in the build-status table. Spec 032, which adds the desktop host card, is a draft.
- **The site's principles** still name four IDE hosts and predate DESL, DED, FBL and ATD.

`hosts` holds the current host list.

## Process

- **Delivery:** feature branches, merged by pull request with merge commits. The ruleset on `develop` requires the Build and refresh checks.
- **Build:** unit and catalogue tests, the build, reference, link and catalogue checks, and, on pull requests, page checks (accessibility, phone width, no-script, privacy) and the terminology check.
- **Deploy:** after a green build of `develop`, or when the Notion host asks for it.
