Edit c:\git\etalii.adp\specs\012-notion-hype-cycle-addon/contracts/service.md in place to apply ONLY these line-specific refinements.
DO NOT regenerate from any template.
DO NOT run any setup script (e.g. setup-spec.sh, setup-plan.sh, setup-tasks.sh).
DO NOT replace the file — make targeted edits only.

Refinements requested:
- Line 3 in section "Contract: Service": Do the cloufdlare implementation last. Build or re-use an existing, simple service that is locally hosted.
  > The one service beside the published pages: a Cloudflare Worker that completes Notion's grant of access and forwards the add-ons' calls to the Notion API. Every Notion add-on codes against its endpoints, and a maintainer against its secrets. Decisions are in [research.md](../research.md) D1 and D8; the risks of signing in from an embedded page are R3 and R4.