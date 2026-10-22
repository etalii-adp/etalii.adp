# Feature Specification: A Relation Type Inherits Its Flags

**Feature Branch**: `features/034-disl-relation-flag-inheritance`

**Created**: 2026-10-22

**Status**: Draft, clarified 2026-10-22

**Input**: The maintainer's ruling "Spec first" (2026-10-22) on DISL relation-flag inheritance. DISL 0.5 section 4.7 does not say whether a relation type's `directed`, `allowSelfLoops` and `allowParallel` (section 4.9) are inherited from its supertypes, and the hosts that interpret DISL read it differently. The known case: in `definitions/diagrams/azure-devops-pipeline.dis`, the abstract `Dependency` states `allowParallel: false` and its subtype `DependsOn` does not.

## Context

Section 4.7 says that "a type inherits all attributes, ports, containment rules and tags from its supertypes", and that notation, forms and constraints are looked up along the C3 linearisation of the supertype chain, the most specific declaration winning. Section 4.9 lists the three flags with their defaults (`directed` true, `allowSelfLoops` false, `allowParallel` true) and says of `acyclic` alone that a subtype of an acyclic type is acyclic. For the three flags nothing is said: a subtype that does not state one may have its supertype's value, or the default.

The difference only shows where a supertype states a value other than the default, and today's definitions do that in four places (`etalii.adp` at `develop`, all 40 `.dis` files read):

| Definition | Supertype states | Subtypes that do not restate it |
|---|---|---|
| `azure-devops-pipeline.dis` | `Dependency`: `allowParallel: false` | `DependsOn`, `DefaultOrder` |
| `wardley-map.dis` | `Link`: `allowParallel: false` | `Dependency`, `Flow` |

Every other inherited flag in them equals its default (`directed: true` under `FdgRelation` and `Dependency`, `allowSelfLoops: false` under `FdgRelation` and `Link`). No relation type names more than one supertype, and none restates a flag differently from its supertype.

The four interpreters of DISL read the same file four ways:

| Host | Where | What it does |
|---|---|---|
| `etalii.adp.ide.vscode` | `src/core/disl/metamodel.ts`, at `bf9ec24` | Inherits each flag from the nearest type along the C3 linearisation that states it, else the section 4.9 default. |
| `etalii.adp.ide.notion` | `src/disl/metamodel.ts`, at `4a0cdb4` | The same as Visual Studio Code: its interpreter has the same rule, line for line. |
| `etalii.adp.ide.standalone`, client | `src/client/src/canvas/library/disl/compileNotation.ts`, `INHERITED_RELATION_KEYS`, at `a28656e45` | Inherits `source`, `target`, `directed`, `allowSelfLoops`, `allowParallel` and `acyclic` from the nearest supertype that states it, along the chain of single `extends` names; a relation that names several supertypes inherits nothing. Unstated, `allowSelfLoops` is false. |
| `etalii.adp.ide.standalone`, backend | `src/backend/EtAlii.Adp.Specification.Disl/Loading/DislMetamodel.cs`, `DislType`, at `a28656e45` | Reads each flag from the type's own declaration only. Unstated, `allowParallel` and `directed` are true, and `allowSelfLoops` is **true** (`ConstraintEvaluator`, `GestureConstraintEvaluator`: `AllowSelfLoops ?? true`), against section 4.9's default. Ends are inherited; `acyclic` is inherited along the linearisation, as section 4.9 says. |

So in the standalone host a second `DependsOn` between the same stage and job is refused on the canvas (the client) and accepted, with no finding, by the backend that validates it; in Visual Studio Code and in Notion it is a finding. A Wardley map's backend in the standalone host also accepts a `Flow` from a component to itself, which every other reader refuses.

### What this feature is not

- **Not the backend's default for `allowSelfLoops`.** That a type which states nothing anywhere has loops allowed in the standalone backend contradicts section 4.9 as written; it is a host defect, corrected under that host's own work, and this feature only records it.
- **Not a relation type's ends.** Section 4.9 marks `source` and `target` **Required** and section 4.7 does not list them either, yet `DependsOn` states neither and every host inherits them. That is a neighbouring silence of the same section, and is left to a feature of its own unless the maintainer folds it in.
- **Not `acyclic`.** Section 4.9 already settles it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A subtype has the flags its supertype states (Priority: P1)

A tool engineer states a flag once, on an abstract relation type, and every relation type under it behaves the same way in every host, without restating it.

**Why this priority**: it is the whole of the gap. Today the same specification is two different tools depending on the host, and the tool engineer cannot tell which reading is right from the document.

**Independent Test**: a DISL example in which an abstract relation type states `allowParallel: false` and `allowSelfLoops: true`, and a concrete subtype states neither; a document with two such relations between the same pair gives a finding for the second, a loop gives none, and the example validates against the schema.

**Acceptance Scenarios**:

1. **Given** a supertype that states `allowParallel: false` and a subtype that does not state `allowParallel`, **When** a diagram holds two relations of the subtype between the same pair, **Then** every conforming host reads the subtype's `allowParallel` as false, inherited from the supertype, and reports the second one.
2. **Given** the same for `allowSelfLoops` and for `directed`, **When** a diagram holds a loop, or two relations in opposite directions, **Then** every conforming host reads the flag the same way.
3. **Given** a subtype that states the flag itself, **When** it is read, **Then** its own value is the one it has when it narrows the supertype's, and a value that widens it is a specification error.
4. **Given** a relation type that states the flag nowhere along its supertype chain, **When** it is read, **Then** it has section 4.9's default.
5. **Given** `azure-devops-pipeline.dis` and `wardley-map.dis` as they are, **When** they are read under the settled rule, **Then** what the rule makes of `DependsOn`, `DefaultOrder`, `Dependency` and `Flow` is stated in the feature's plan, and a definition whose meaning changes is corrected in the same pull request.

---

### User Story 2 - A host implementer can tell from the document alone (Priority: P2)

A host implementer reads sections 4.7 and 4.9 and knows, for each of the three flags, where a relation type's value comes from, including under several supertypes.

**Why this priority**: four interpreters were written from the same document and agree only by accident on the flags; principle II of the constitution asks for a document an implementer can build from alone.

**Independent Test**: a reader given sections 4.7 and 4.9 alone, and a relation type with two supertypes that state `allowParallel` differently, can say what the subtype's value is or that the specification is in error.

**Acceptance Scenarios**:

1. **Given** sections 4.7 and 4.9, **When** an implementer looks up a flag of a subtype that does not state it, **Then** the text says where the value comes from.
2. **Given** a relation type with several supertypes that state a flag differently and a subtype that does not restate it, **When** it is read, **Then** the text says that the specification is in error unless the subtype states the flag itself.

### Edge Cases

- **A flag stated on a supertype that is not abstract.** Inheritance does not depend on `abstract`; the rule is the same.
- **A derived relation type** (`DefaultOrder`) inherits as a stored one does; whether a flag means anything for a relation the tool computes is section 4.11's, not this feature's.
- **A flag stated with its default value on a supertype** (`directed: true`). It changes nothing whatever the rule; the examples should not be read as evidence for either rule.
- **A host that reads only own declarations today.** The standalone backend changes under that host's own work, with a test that fails against today's code first.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Section 4.7 **MUST** say that a relation type which does not state `directed`, `allowSelfLoops` or `allowParallel` inherits it from the nearest type along its C3 linearisation that states it, and has the section 4.9 default when none does, as notation, forms and constraints are looked up.
- **FR-002**: Section 4.7 or 4.9 **MUST** say that a subtype may state a flag only to narrow its supertype's: `allowSelfLoops` and `allowParallel` may go from true to false and not back, and `directed` **MUST NOT** differ from the supertype's; a subtype that widens a flag is a specification error.
- **FR-003**: The specification **MUST** say that a relation type with several supertypes whose effective values of a flag differ is a specification error unless it states the flag itself, as section 4.7 already says of conflicting inherited attributes.
- **FR-004**: Section 4.9's defaults **MUST** stay as they are: `directed` true, `allowSelfLoops` false, `allowParallel` true, for a type that has no value by FR-001.
- **FR-005**: `acyclic` **MUST** keep section 4.9's rule; the specification **MAY** restate it beside the three flags so that the four read as one list.
- **FR-006**: The DISL examples **MUST** include a relation type that inherits a flag whose value differs from its default, with a document whose findings show it, and the schema **MUST** still accept every existing example.
- **FR-007**: Every definition under `definitions/` and `specifications/disl/` whose meaning changes under the settled rule **MUST** be corrected in the same pull request, so that it states what its tool does; the four inherited `allowParallel: false` cases above are the ones to check.
- **FR-008**: The change **MUST** be a new DISL version, its status paragraph saying what it settles and whether every valid 0.5 specification keeps its meaning, and naming the reading that 0.5 left open.
- **FR-009**: No other specification language changes: DID stores relations as before, FBL binds them as before, and DESL has no relation types.

### Key Entities

- **Relation flag**: `directed`, `allowSelfLoops` or `allowParallel` of a relation type (section 4.9), a bool with a default.
- **Stated value**: a flag a relation type's own declaration gives.
- **Effective value**: the value a host uses for a relation type, from its stated value, its supertypes or the default, by the rule this feature settles.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For each of the three flags, a reader of sections 4.7 and 4.9 alone gives the same effective value for every relation type of `azure-devops-pipeline.dis` and `wardley-map.dis` as the specification's own answer.
- **SC-002**: The new example and its document validate with `python .github/scripts/validate-examples.py`, and every existing example still does.
- **SC-003**: Each host's difference from the settled rule is named, with its file, as a task for that host: the standalone backend at least, and any host the rules of FR-001 to FR-003 put in conflict.
- **SC-004**: A second `DependsOn` between the same pair is either a finding in every host or in none.

## Assumptions

- The maintainer's ruling of 2026-10-22 asks for the specification first; the hosts change afterwards, each under its own work: `etalii.adp.ide.standalone` with spec-workflow in its own repository, Visual Studio Code and Notion through features here.
- Section 4.7's "most specific declaration wins, along the C3 linearisation" for notation, forms and constraints is the model the rule follows where it inherits; this feature does not change how the linearisation is made.
- The standalone backend's `allowSelfLoops` default of true is a defect against section 4.9 as written, whatever this feature settles, and is reported to that host.
- A relation type's ends (`source`, `target`) are outside this feature, as *What this feature is not* says.

## Clarifications

### Session 2026-10-22

The maintainer answered the three questions on decision cards in the project chat.

- Q1: Where does a subtype's flag come from when it does not state it? → A, inherited: from the nearest type along the C3 linearisation that states it, else the section 4.9 default (FR-001).
- Q2: May a subtype state a flag that differs from its supertype's? → A, only to narrow it: `allowSelfLoops` and `allowParallel` from true to false and not back, `directed` never different (FR-002).
- Q3: What does a relation type with several supertypes that state a flag differently have? → A, a specification error unless the subtype states the flag itself (FR-003).
