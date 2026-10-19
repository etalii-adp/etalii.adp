# Specification Quality Checklist: A Built-in Person Shape in DISL

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-19
**Feature**: [disl-person-shape.spec.md](../disl-person-shape.spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Items marked incomplete require spec updates before `/speckit-clarify` or `/speckit-plan`
- **Both markers resolved** in the clarification session of 2026-10-19 (see the spec's Clarifications): Q1 (FR-003) "Corner only", the shape's one parameter is the body's corner radius `radius`, default 8, and the head is fixed; Q2 (FR-004) "Body, head clicks", relations attach to the body only and a click on the head selects the node.
- **Geometry is not implementation.** The lengths 8, 10 and 8 and the painting order are the shape's definition in DISL's own terms (bounds, outline, text area), as section 6.7 states every built-in. No host, library or drawing technique is named as a requirement; the standalone files appear only under Scope as consumers.
- **The schema.** `disl.schema.json` does not enumerate built-in shape names today (`$defs/ShapeRef` accepts any string), so FR-008 is conditional: it requires `person` wherever the schema names shapes and no change where it accepts any name.
- **The version** that carries the addition is left to the plan (Assumptions); FR-010 holds for either.
