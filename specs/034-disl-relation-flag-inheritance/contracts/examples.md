# Contract: The Example, Its Document and the Refused Specifications

## E1. `specifications/disl/service-calls.dis`

A DISL 0.6 specification (`"disl": "0.6"`, `$schema` the 0.2 address as every 0.5 example names), language `org.example.service-calls`, version `1.0.0`, with the metamodel of data-model.md *Worked values*: `Service` (a key attribute `name`), `Call` (abstract, `allowParallel: false`, `allowSelfLoops: true`, ends `Service` to `Service`), `SyncCall` and `AsyncCall` (`extends: "Call"`, no flag, no ends), `Observation` (abstract, no flag, ends `Service` to `Service`), `TracedCall` (`extends: ["SyncCall", "Observation"]`, `allowParallel: false`, `allowSelfLoops: false`). Each relation type's `doc` says where its flags come from. Notation and toolbox are the least that makes it a usable tool (a box per service, a line per call, dashed for `AsyncCall`); no construct of 0.2 to 0.5 beyond what that needs. LF, as every example beside it.

## E2. `specifications/disl/service-calls.did`

A DID 0.1 definition (`$schema` the DID 0.1 address, as `../did/timeline.did`) of `org.example.service-calls` `1.0.0`:

| Record | Type | Source | Target |
|---|---|---|---|
| `checkout`, `payments`, `ledger` | `Service` | | |
| `call-1` | `SyncCall` | `checkout` | `payments` |
| `call-2` | `SyncCall` | `checkout` | `payments` |
| `call-3` | `AsyncCall` | `checkout` | `payments` |
| `call-4` | `SyncCall` | `ledger` | `ledger` |
| `call-5` | `TracedCall` | `payments` | `payments` |

## E3. `specifications/disl/service-calls.findings.json`

The object form of `$defs/ValidatorOutput` (`$schema` `https://etalii.net/adp/disl/schema/0.2/disl.schema.json#/$defs/ValidatorOutput`), with exactly these findings in this order (8.6, reading order):

| # | `constraintId` | `severity` | `elementId` | `pointer` | Why |
|---|---|---|---|---|---|
| 1 | `std.endpoints` | `error` | `call-2` | `/relations/1` | the second `SyncCall` on one pair: `allowParallel` false, inherited from `Call` |
| 2 | `std.endpoints` | `error` | `call-5` | `/relations/4` | a `TracedCall` loop: `allowSelfLoops` false, stated |

`message` is the runtime's wording (8.7); the file carries the words "A SyncCall already connects these two elements." and "A TracedCall cannot connect an element to itself." `call-3` (another type) and `call-4` (a loop `Call` allows) give none.

## E4. `specifications/disl/refused/`

`README.md` in the shape of `../../fbl/refused/README.md`: what the folder is, that each document is valid against `disl.schema.json` and must be refused by a check of section 14.1 step 6 that the schema cannot make, that it fails that check only, and a table of the documents. Each document is a minimal DISL 0.6 specification (one node type, the relation types it needs, no notation beyond what the schema requires) whose root `doc` names the check:

| Document | Relation types | Refused by |
|---|---|---|
| `relation-flag-widened.dis` | `Link` (`allowParallel: false`), `Strong` extends `Link`, `allowParallel: true` | 4.7, F2: `allowParallel` widened |
| `relation-flag-directed.dis` | `Link` (no flag), `Mutual` extends `Link`, `directed: false` | 4.7, F2: `directed` differs from the supertype's default `true` |
| `relation-flag-conflict.dis` | `Loop` (`allowSelfLoops: true`), `Plain` (no flag), `Both` extends `["Loop", "Plain"]`, no flag | 4.7, F3: `allowSelfLoops` `true` from `Loop`, `false` from `Plain` |

## E5. The validator

`python .github/scripts/validate-examples.py`:

- checks F2 and F3 (and the C3 order they need) on every `*.dis` that validates, reporting each problem as `at /metamodel/relations/<T>...: ...` like the other DISL checks;
- reads `specifications/disl/refused/*.dis` as it reads `specifications/fbl/refused/*.fbl`: `ok ... (refused, ...)` with its first problem when a check refuses it; `FAIL` when it is accepted or the schema refuses it;
- leaves every existing example's result unchanged, and still exits 0.

Hosts load E1 and expect the effective values of data-model.md, load E4 and expect each refused with its flag named, and, where a host evaluates `std.endpoints` over a model, build E2's model and expect E3's two findings in E3's order.
