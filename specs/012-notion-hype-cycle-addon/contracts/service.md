# Contract: Service

The one service beside the published pages: it completes Notion's grant of access and forwards the add-ons' calls to the Notion API. It comes in two implementations that answer the endpoints below alike, and they are built in this order. First, a simple service hosted locally, on the machine of whoever runs the add-on: an existing one is re-used where it meets this contract, and one is built otherwise. The add-ons are built and checked against it. Last, after everything else of this feature works against the local service, the Cloudflare Worker that serves the published pages. Every Notion add-on codes against the endpoints, whichever implementation answers them, and a maintainer against the Worker's secrets. Decisions are in [research.md](../research.md) D1 and D8; the risks of signing in from an embedded page are R3 and R4.

The Claude session the request points to for implementation details, `https://claude.ai/code/session_01UbhpjvoaQLqQRBnfW7Akbo`, could not be read. This contract was decided without it, on 2026-10-08.

## Address

The service has one base address, on Cloudflare and not under `https://etalii.net/adp-notion`: it publishes no page a Notion page embeds. The address exists once a maintainer has created the Cloudflare account. It is written in one place, `src/frame/config.ts` of `etalii.adp.ide.notion`, and in `docs/service.md` there; nothing else names it. `<service>` below stands for it.

The service is one handler that knows no platform: it takes a request and its configuration and answers a response. Two things run it. The Cloudflare Worker, `service/worker.ts`, is what is deployed. The local service, `node scripts/service.mjs`, runs it on `http://localhost:8787` for development and for the first pass in Notion, with the secrets read from the environment; with `--memory` it answers the Notion calls from an in-memory Notion and grants a token without Notion, so that an add-on can be seen working with no account anywhere. Nothing below differs between the two.

## Endpoints

| Method and path | Does |
| --- | --- |
| `GET <service>/authorize?state=<state>` | Redirects to Notion's grant of access |
| `GET <service>/callback?code=<code>&state=<state>` | Exchanges the code for a token and hands it to the page that asked |
| `POST <service>/refresh` | Exchanges a refresh token for a new access token and a new refresh token |
| `POST <service>/grant` | Hands a completed grant over to the page that started it, once |
| `OPTIONS <service>/notion/<path>` | Answers the browser's preflight |
| `GET`, `POST`, `PATCH` `<service>/notion/<path>` | Forwards the call to `https://api.notion.com/<path>` |
| Anything else | `404`, with no body that names a secret |

### `GET /authorize`

| Rule | Requirement |
| --- | --- |
| `state` is required: 32 to 128 characters of `A-Z`, `a-z`, `0-9`, `-` and `_`, made at random by the add-on for this one grant. Without it, `400` | D8 |
| Answers `302` to `https://api.notion.com/v1/oauth/authorize` with `client_id`, `response_type=code`, `owner=user`, `redirect_uri=<service>/callback` and the same `state` | FR-010 |
| The add-on opens it in a window of its own, never in the frame Notion gave it | Published tree: no page leaves a frame |
| The window is opened from the control `id="connect"`, in answer to the person's click: a browser blocks a window opened at any other moment. A page with no token kept shows `connect` and asks for none by itself | D8 |

### `GET /callback`

| Rule | Requirement |
| --- | --- |
| Exchanges `code` at `https://api.notion.com/v1/oauth/token`, with the client id and the client secret as the request's basic credentials. This is the only use of the secret | FR-010 |
| Answers one HTML page that posts a message to the window that opened it and closes itself. The message's target origin is `https://etalii.net` and no other | FR-010 |
| The message on success: `{ "source": "adp-notion", "state": "<state>", "token": "<access token>", "refresh": "<refresh token>", "workspace": "<workspace name>" }` | D8 |
| The message on failure or refusal: `{ "source": "adp-notion", "state": "<state>", "error": "<Notion's error code>" }` | FR-020 |
| The add-on takes a message only from the service's origin and only with the `state` it made; any other is dropped | FR-010 |
| The answer is never cached: `Cache-Control: no-store` | FR-010 |

### `POST /refresh`

Notion's answer to the exchange carries a `refresh_token` beside the `access_token`, and takes it back at the same token endpoint with `grant_type` `refresh_token` and the client's credentials (Notion's reference, "Refresh a token", read on 2026-10-08). Notion's documentation gives an access token no lifetime: a token is valid until Notion answers `401` to it.

| Rule | Requirement |
| --- | --- |
| The body is `{ "refresh": "<refresh token>" }`. The service sends it to `https://api.notion.com/v1/oauth/token` with `grant_type` `refresh_token` and the client id and secret as the request's basic credentials | FR-010 |
| The answer on success is `{ "token": "<access token>", "refresh": "<refresh token>" }`. Notion gives a new refresh token each time and the old one stops working, so the add-on replaces both | FR-010 |
| The answer on failure is Notion's status with `{ "error": "<Notion's error code>" }`; the add-on then removes what it kept and shows `connect` | FR-010 |
| It answers the origin of the `/notion/<path>` rules only, with the same preflight, and is never cached | FR-010 |

### `POST /grant`

A page in a web browser gets its token from the window it opened. A page in the Notion desktop app cannot: the app hands the grant to the system's browser, a window that has no way back to the page, and the app keeps its own storage. So the service hands a completed grant over, once, to the page that started it (the maintainer's decision of 2026-10-09, which replaces the rule that the service keeps no state).

| Rule | Requirement |
| --- | --- |
| The add-on makes a random `verifier`, 32 to 128 characters of `A-Z`, `a-z`, `0-9`, `-` and `_`, and gives as `state` its SHA-256 in base64url without padding. The verifier never appears in an address | FR-010 |
| `/callback` keeps what it would post to the window that opened it, the token or the error, under that `state`, for at most 120 seconds. Where no window opened it, its page stays open and says in one sentence that access is granted and the diagram opens by itself | FR-010 |
| `POST /grant` with the body `{ "verifier": "<verifier>" }` answers `200` and that object when a grant is kept under the verifier's SHA-256, and removes it, so it is read once. With none it answers `204` and no body. A verifier of another form is `400` | FR-010 |
| The state alone hands nothing over: it is the verifier that is asked for, and only the page that made it has it | FR-010 |
| The add-on asks every 2 seconds while a grant is in progress, for at most 5 minutes, and takes whichever comes first, the message of the window it opened or this answer. When the message comes first it asks once more, so that the kept copy is removed at once | FR-010 |
| It answers the origin of the `/notion/<path>` rules only, with the same preflight, and is never cached. Nothing of a grant is written to a log | FR-010 |
| On Cloudflare the grants are kept by a Durable Object, one per state, which removes its grant by an alarm after 120 seconds. The local service keeps them in memory | D8 |

### `/notion/<path>`

| Rule | Requirement |
| --- | --- |
| The add-on sends the person's token as `Authorization: Bearer <token>`. The service forwards it and adds `Notion-Version: 2026-03-11`. A call without the header is `401` and is not forwarded | FR-010 |
| The request's body and Notion's status, body and `Retry-After` are passed on unchanged | FR-020 |
| A call with a query string is not forwarded: the table names none. When Notion cannot be reached the answer is `502` with the code `bad_gateway` | FR-020 |
| Every answer of the service carries `Cache-Control: no-store` | FR-010 |
| Only the calls of the table below are forwarded; any other method or path is `403` and reaches Notion never | D8 |
| Answers carry `Access-Control-Allow-Origin: https://etalii.net` and `Vary: Origin`. A request from another origin gets no such header | FR-010 |
| The preflight allows the methods `GET`, `POST`, `PATCH` and the headers `Authorization` and `Content-Type`, with `Access-Control-Max-Age: 86400` | SC-004 |
| A local build of the add-on is served by a local run of the Worker, which allows the origin of its configuration; the deployed one allows `https://etalii.net` alone | FR-010 |

The calls the store makes, as the Notion API of that version names them:

| Method | Path | For |
| --- | --- | --- |
| `GET` | `v1/users/me` | Whether the token is still valid |
| `GET` | `v1/databases/<id>` | The database's data source |
| `GET` | `v1/data_sources/<id>` | The properties, for the states `unprepared` and `read-only` |
| `PATCH` | `v1/data_sources/<id>` | `prepare`: adding the missing properties |
| `POST` | `v1/data_sources/<id>/query` | Reading the rows, and asking for rows edited since the last read |
| `POST` | `v1/pages` | A new row |
| `PATCH` | `v1/pages/<id>` | A changed row, and a row moved to or from the trash |
| `POST` | `v1/search` | The databases a person's access reaches, for the selection of a store |
| `GET` | `v1/blocks/<id>/children` | The blocks of the page that holds a database and of the pages directly under it, to find the embed block |
| `PATCH` | `v1/blocks/<id>` | Setting the address of that embed block to name its store |

`<id>` is 32 hexadecimal digits, with or without dashes. A call the store comes to need is added here first.

Whether a person may write to a store decides between the states `ready` and `read-only` (FR-021). Where an answer of this table says so when the store is opened, the page is `read-only` from the opening. Where nothing says so before a write, the page is `ready` until Notion refuses a write with `403`; that write changes nothing, and the page is `read-only` from then on. Notion's documented answers name no right of the person on a database or a data source (read on 2026-10-08), so the second holds: nothing says so before a write.

## What the service keeps

| Rule | Requirement |
| --- | --- |
| One kind of state and no other: the grant in progress of `POST /grant`, kept for at most 120 seconds and removed when it is read. No cookie, no session, no account of who asked | D8, R4 |
| No document, ever. A token is kept only as that grant in progress, for at most 120 seconds, and is written to no log | FR-006, FR-010 |
| It reads no request body beyond passing it on | FR-006 |

## The token in the browser

| Rule | Requirement |
| --- | --- |
| The add-on keeps the token in the browser's local storage for the origin `https://etalii.net`, under the key `adp-notion.token`, as `{ "token": "...", "refresh": "...", "workspace": "..." }`, for as long as Notion takes the token | Plan: Storage |
| One grant serves every Notion add-on, the key being shared by them | FR-028 |
| No document, row or history is kept there | FR-006 |
| A token is asked for only when a call needs one and none is kept. A `401` from Notion is answered by one `POST /refresh`, and the call is made again with the new token; where Notion refuses the refresh, the key is removed and the page is in the state `connect`. A refresh that cannot reach the service or Notion keeps the key, and the status is `offline` | FR-010 |
| The page offers a control that removes the key, `id="disconnect"` | FR-010 |
| A page whose grant is completed in another window, as in the Notion desktop app, which hands the grant to the system's browser, gets its token through `POST /grant`. `id="open-in-tab"` is the link that opens the grant when no window opened by itself | Research R4 |

## Secrets and configuration

| Name | Where | What |
| --- | --- | --- |
| `NOTION_CLIENT_ID` | Secret of the Worker | The client id of the public Notion integration a maintainer registers |
| `NOTION_CLIENT_SECRET` | Secret of the Worker | Its client secret. It is in no repository, no page and no log |
| `ALLOWED_ORIGIN` | `service/wrangler.toml` | `https://etalii.net` |
| `CLOUDFLARE_API_TOKEN` | Actions secret of `etalii.adp.ide.notion`, its second beside `SITE_DEPLOY_TOKEN` | A token that may deploy this one Worker and nothing else |

A maintainer does three things once, before the Notion repository's pull request merges: registers the Notion integration as public, with the redirect address `<service>/callback` and the capabilities to read, update and insert content; creates the Cloudflare account and sets the Worker's two secrets; and sets `CLOUDFLARE_API_TOKEN`. An agent can do none of them.

## Deployment

| Rule | Requirement |
| --- | --- |
| `Build` in `etalii.adp.ide.notion` deploys the Worker with `wrangler deploy` on a push to `develop` only, after its other jobs pass | [Publication, spec 011](../../011-notion-repository/contracts/publication.md) |
| A pull request, from a fork or not, deploys nothing and sees no secret | Spec 001 FR-007 |
| A deployment that fails shows as a failed run of `Build` and leaves the previous Worker serving | Spec 011 FR-013 |
| The Worker and the pages are published by the same merge but not in one step: the add-on MUST work against the Worker of the merge before it | FR-020 |
| The Worker is the last thing this feature builds. Until then the service is the local one, `node scripts/service.mjs`, the same handler behind `http://localhost:8787` | The maintainer's instruction of 2026-10-08 |

## What an add-on can rely on

| Event | Result |
| --- | --- |
| The person grants access | The page has a token within the window's closing, and reads the store with that person's rights |
| The person refuses, or closes the window | The page stays in `connect`; nothing is kept |
| Notion answers `429` | The answer is passed on with its `Retry-After`; the add-on waits that long and tries again, and `data-status` stays `storing` |
| The service cannot be reached | `data-status` is `offline`; no edit is lost unseen, as [addon-address.md](addon-address.md) says |
| No published page holds a secret | Checked in `Build`, as [published-tree.md](published-tree.md) says (SC-010) |
