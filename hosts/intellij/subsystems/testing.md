---
id: intellij-testing
type: submodule-design
title: "Test kit and real-IDE tests"
status: draft
parent: host-intellij
depends-on:
  - intellij-core
---
# Test kit and real-IDE tests

`testing/`, `src/integrationTest/`, part of `host-intellij`.

## Responsibility

A test kit (`ToolDriver`, `DiagramDriver`, layout and drop helpers) and Starter/Driver integration tests against the built plug-in in real IDEs: open a map, open a draw.io file, edit and undo, the settings page, FBL in the plug-in, and ATD.

## Rules

- `NoPreviousHostIntegrationTest`: neither the files nor the plug-in may name the earlier Eclipse host. CI uses Zulu rather than Temurin, because Temurin's vendor string contains the word.
- Plug-in verification covers all eight IDEs (IDEA and Rider on a pull request).
