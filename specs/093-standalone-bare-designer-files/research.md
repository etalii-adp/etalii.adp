# Research: Designer Files That Open Without a Registration in the Standalone Host

What the standalone host does today, read from `develop` at `7a3f906f8` and later, and the decisions the plan takes from it.

## R1. Routing by content already exists, for one designer type

- `src/backend/EtAlii.Adp.Hierarchy/ToolRouter.cs` asks `DesignerFileRouter.RouteByEnvelope` first, before diagrams and registrations. That routes a body to the designer type whose `DesignerDefinition.Claim` takes it, with the registration beside it when one names it.
- `DesignerClaim` (`src/backend/EtAlii.Adp.Designer/_Model/DesignerClaim.cs`) holds extensions, a `Matches(name, head)` function, an envelope sentence and whether the registration is created on first placement.
- Only the hierarchical requirement designer gives one. It writes its extension (`.md`) and its envelope in code, and answers `Matches` through `BodyClaim.Claims(binding, name, head)`, which is the FBL library's own routing (`Specification.Fbl/Routing/Router.Candidates`, FBL 12.3).
- The knowledge designer (`src/designers/knowledge/backend/EtAlii.Adp.Designer.Knowledge/Designer.cs`) gives no claim. So its bodies are its documents only through a registration (`DesignerFileRouter.Route`), and a bare one falls through to the YAML, JSON or XML editor.

**Decision**: one generic claim, made from a designer type's bundled bindings, takes the place of the hand-written one. A designer type names its bindings, and nothing else, for routing: extensions are the union of their `claims.extensions` and `names`, and `Matches` is `Router.Candidates` over all of them. The envelope sentence for a refusal is read from the matching binding's marker. The hierarchical requirement designer moves onto it, and its present claim's files keep routing the same way (its tests stay green). This meets FR-001, FR-003 and SC-004.

## R2. A root-key marker needs more than the first line

- `FirstLineCache` reads a file's first line, at most a few hundred bytes, which is enough for the requirement designer's `firstLine`-style envelope.
- The knowledge markers are `{rootKey: designer, value: etalii/knowledge}` for YAML and JSON, and a `pattern` on the first 20 lines for XML. In the knowledge examples, `designer:` is the second root key, after `ded: "0.1"`.
- `MarkerEvaluator.RootKey` loads the whole text with YamlDotNet's `YamlStream`, which fails on a cut-off JSON object and may fail on a cut-off YAML document.

**Decision**: the cache keeps a file's **head**, its first 64 KiB cut at the last line end (the window FBL 12.3 gives `suggest`), instead of its first line. It is kept per path until the file's length or last write time changes, as now.
- A root-key marker is evaluated over the head with YamlDotNet's event parser. It walks the root mapping's keys and stops at the key, at the end of the mapping, or at the first parse error. So a truncated document is still recognised by keys that come before the cut.
- A file whose marker key lies beyond the first 64 KiB is not claimed. That is recorded under the spec's edge case on large files.
- This changes `MarkerEvaluator` for every caller: a whole file that parses keeps the same answer, so diagram routing is unchanged (SC-005). Tests cover a key before and after the cut, and JSON and YAML that are cut off.

## R3. The knowledge session without a registration

`KnowledgeSessionFactory.Open(watchId, root, registrationPath, bodyPath)` already takes a nullable registration, and the knowledge binding says `registration.createOnFirstPlacement: false`. What a knowledge table keeps beside its body is to be measured in phase 2, because a view setting (a column width, a filter) may write a registration today. FR-002 is met if the first such setting creates the registration as FBL 8.4 says, and opening alone writes nothing.

## R4. The hierarchy, the index of links and the relation targets

- `DesignerService` (`src/backend/EtAlii.Adp.Workspace/DesignerService.cs:138`) already routes by envelope first, so the hierarchy follows once the claim exists.
- `KnowledgeLinkIndexer.Claims(path)` takes every `.yaml`, `.yml`, `.json` and `.xml` file and reads it. Whether it indexes a bare knowledge file is checked by a test in phase 3. A relation's targets (`KnowledgeContextActionProvider.IsKnowledgeFile`) and a peer list are read the same way.

## R5. A registration of another tool type beside a claimed body

FBL 12.3 says the registration decides when the user opens the registration. The standalone host already answers a registration of one tool type whose body another type's envelope claims with `ToolUnreadable` and a reason (`ToolRouter.ClaimedBody`, spec 029 R3, R4). The spec's edge case "a registration beside the file still decides its tool type" is read here for a registration **of the same designer type**, the common case, which keeps routing as it does. For a registration of another type, the host keeps spec 029's refusal with a sentence, which opens nothing silently. That reading is put to Peter as a small amendment, and the plan proceeds on it.

## R6. Tool types claimed twice, or not installed

`Router.Candidates` returns every binding that claims a file. With two designer types claiming one file, the host offers both, as it offers two diagram readings today (FR-005). A marker that names no installed type cannot be told from a file that carries no marker, because a marker is a binding's and only installed bindings are known. FR-006's sentence is given where the file's `designer:` root key (DED's envelope, DED section 2) names an origin no installed designer type has. This is read from the head by the same event parser, through the DED envelope rule that the designer core already holds for every type, with no tool type named.
