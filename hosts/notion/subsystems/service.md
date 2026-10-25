---
id: notion-service
type: submodule-design
title: "Service: the OAuth and API Worker"
status: draft
parent: host-notion
---
# Service: the OAuth and API Worker

`service/`, part of `host-notion`.

## Responsibility

A platform-free request handler, deployed as a Cloudflare Worker with one Durable Object. It holds a whitelist of 13 Notion API calls (anything else is refused) and the `/authorize`, `/callback`, `/grant` and `/refresh` endpoints. The same handler runs locally, optionally against an in-memory Notion.

## Rules

- Exists because the Notion API sends no CORS headers and OAuth needs a client secret.
- The only state it keeps is a grant in progress: at most 120 s, read once, keyed by the hash of the verifier, so the desktop app's OAuth window, which opens in the system browser, can complete (principle IV, v1.2.0).
- A Durable Object, not KV, because KV can answer "not there" for up to a minute after a write.
- Deployed only from `develop`, by the only CI jobs that read secrets.
