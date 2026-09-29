# Baseline: terminology check findings

Recorded 2026-09-29 with `.github/scripts/terminology-check.py --review` against `docs/terminology-check.json` (version 1), on each repository's `origin/develop`. "Errors" fail the check; "review" findings are the bare word "designer" (or "author" in the language documents), which a person judges because "designer" is also a valid kind. The check sees words, not structure: standalone's cross-kind code named `Diagram…` (rename map rule 1) is found by the part, not by this list.

| Repository | Errors | Review |
|---|---|---|
| etalii.adp | 128 | 18 |
| etalii.adp.ide.standalone | 11 | 23 |
| etalii.adp.ide.intellij | 654 | 1313 |
| etalii.adp.ide.vscode | 3 | 3 |
| etalii.adp.ide.eclipse | 3 | 3 |
| etalii.adp.site | 578 | 1132 |
| .github | 1 | 1 |

## Files with the most errors

### etalii.adp

```text
     82 specifications/dedl/DEDL-specification.md
      9 .specify/memory/constitution.md
      8 specifications/dedl/dedl.schema.json
      7 README.md
      6 CLAUDE.md
      4 .github/scripts/validate-examples.py
      3 specifications/dedl/timeline.document.json
      3 specifications/dedl/timeline.dedl
      3 specifications/dedl/statemachine.dedl
      3 specifications/dedl/erd.dedl
```

### etalii.adp.ide.standalone

```text
      6 .spec-workflow/steering/product.md
      3 readme.md
      1 docs/architecture.md
      1 .spec-workflow/specs/multi-select/requirements.md
```

### etalii.adp.ide.intellij

```text
     24 testing/src/main/java/etalii/adp/testing/DiagramDriver.java
     21 testing/src/main/java/etalii/adp/testing/DesignerDriver.java
     19 core/src/main/java/etalii/adp/core/settings/AdpSettings.java
     16 freemind/src/test/java/etalii/adp/freemind/ui/LayoutTest.java
     16 core/src/main/java/etalii/adp/core/AdpEditorProvider.java
     15 freemind/src/main/java/etalii/adp/freemind/ui/actions/MindMapAction.java
     14 core/src/test/java/etalii/adp/core/settings/AdpDesignersTest.java
     14 core/src/main/java/etalii/adp/core/actions/ZoomActions.java
     12 core/src/main/java/etalii/adp/core/AdpDesignerEditor.java
     11 freemind/src/test/java/etalii/adp/freemind/ui/RegistrationTest.java
      9 freemind/src/test/java/etalii/adp/freemind/ui/RenameTest.java
      9 core/src/main/java/etalii/adp/core/diagram/properties/InPlaceEditor.java
      9 core/src/main/java/etalii/adp/core/diagram/edit/DeleteAction.java
      8 specs/006-sandbox-ide-performance/sandbox-ide-performance.spec.md
      8 freemind/src/test/java/etalii/adp/freemind/ui/SaveLifecycleTest.java
      8 freemind/src/main/java/etalii/adp/freemind/ui/MindMapDesigner.java
      8 core/src/test/java/etalii/adp/core/AdpEditorProviderTest.java
      8 core/src/main/java/etalii/adp/core/diagram/toolbox/ToolboxPanel.java
      8 allure-results/fa3fae7c-27b8-4c53-87e5-974dcaf56710-result.json
      8 allure-results/70ffd48c-632c-409a-83d5-11596c0ddbac-result.json
      8 allure-results/6be5dfab-ad26-4669-8252-c80944a9f9ab-result.json
      8 allure-results/56132a4d-90b4-4a2e-a1f0-e60139b9ca8a-result.json
      7 freemind/testdata/reference/spec001-test-inventory.md
      7 freemind/src/test/java/etalii/adp/freemind/ui/ViewerInteractionTest.java
      7 freemind/src/test/java/etalii/adp/freemind/ui/UndoRedoTest.java
```

### etalii.adp.ide.vscode

```text
      2 README.md
      1 CLAUDE.md
```

### etalii.adp.ide.eclipse

```text
      2 README.md
      1 CLAUDE.md
```

### etalii.adp.site

```text
     82 tests/reference/fixtures/dedl-aaef333/dedl/0.1/source/DEDL-specification.md
     68 specs/003-designer-catalogue/tasks.md
     33 tests/catalogue.spec.ts
     29 tests/reference/refresh.test.ts
     23 specs/003-designer-catalogue/.spec-context.json
     21 scripts/refresh/procedures/dedl.test.mjs
     20 specs/003-designer-catalogue/spec.md
     17 scripts/refresh/lib/lock.test.mjs
     15 scripts/refresh/verify.test.mjs
     13 tests/unit/catalogue/check.test.ts
     13 specs/003-designer-catalogue/contracts/site-addresses.md
     12 scripts/refresh/lib/summary.test.mjs
     12 procedures/refresh-dedl.md
     11 src/content/catalogue/README.md
     10 procedures/refresh-catalogue.md
      9 tests/site.spec.ts
      9 specs/003-designer-catalogue/plan.md
      9 scripts/refresh/procedures/dedl.mjs
      9 CLAUDE.md
      8 tests/reference/fixtures/dedl-aaef333/dedl/0.1/source/dedl.schema.json
      7 tests/reference/visuals.test.ts
      7 src/pages/designers/[vendor]/[type].astro
      7 src/content/docs/index.mdx
      7 specs/003-designer-catalogue/quickstart.md
      6 src/content/reference/languages.json
```

### .github

```text
      1 profile/README.md
```
