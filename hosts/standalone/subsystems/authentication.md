---
id: standalone-authentication
type: submodule-design
title: "Authentication"
status: draft
parent: host-standalone
depends-on:
  - standalone-primitives
  - standalone-sessions
---
# Authentication

`src/backend/EtAlii.Adp.Authentication`, part of `host-standalone`.

## Responsibility

The authenticator, the login call, and the list of calls that need no session. The interceptor in `standalone-sessions` asks it before it checks every other call.

## Rules

- Authentication sits on the gRPC calls themselves, not in a gateway in front of them.
- Host-only, so it may carry hosting packages.
- Released builds ship empty `LocalAuthenticator` credentials. Development uses the developer settings file.
