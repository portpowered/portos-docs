---
name: first-setup
description: Use this guide the first time a customer connects Port OS, to set up access and verify the connection end to end.
metadata:
  title: First setup and connection verification
  guide-id: first-setup
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 20
---

# First setup and connection verification

Use [the quickstart](/docs/for-ai/guides/quickstart.md). Check three stages separately: reachable metadata/API, a valid authenticated token, and access to the intended resources. A protocol connection alone is not device access.

Port OS runs in the cloud. Use the configured remote MCP connection. Do not install or start a local MCP server, ask for local filesystem access, or download a runtime.

Let the customer complete Port OS sign-in and consent in their browser. Never request an access key in chat or put one in a URL, approve consent yourself, or ask for provider MFA.

Enumerate first. An empty inventory means the account has no visible devices, not that authentication failed. It may need [provider linking](/docs/for-ai/guides/adding-devices.md) or a sharing grant. Do not issue a physical command as an installation test. If the customer asks to test control, select one safe test light and explain the intended command. Follow its exact schema. Read fresh state afterward; ask the user to confirm physically when no reliable observation exists. Dispatch acceptance is not proof of physical completion. Record no passwords or tokens in conversation.

If authorization expires, refresh within the original grant or ask the user to authorize again. Confirm grant revocation in account settings or the documented revocation endpoint. Revoking a website access key stops that key's sign-in and API use. An OAuth connection already approved with it is a separate grant that the customer revokes separately. See [troubleshooting](/docs/for-ai/guides/troubleshooting.md).

## Scopes for setup

Request scopes when you connect (the DCR `scope` field or the connector's scopes). A connection can hold only what the client requested and the user left checked at consent, so a connection made with too few scopes fails setup tasks later.

| Task | Scope |
| --- | --- |
| List and inspect devices | `endpoint:read` |
| List and inspect rooms and groups | `group:read` |
| Control a device (send a command) | `message:send` |
| Rename, enable/disable or delete a device (`endpoint_manage`) | `endpoint:write` |
| Create, edit or delete rooms and groups (`group_manage`) | `group:manage` |
| List event subscriptions / create or delete them | `subscription:read` / `subscription:write` |

For full setup request `endpoint:read endpoint:write message:send group:read group:manage`, and add `subscription:read subscription:write` when the customer wants event subscriptions. A registration that names no scope receives only `endpoint:read`.

On a 403 with `error="insufficient_scope"` (`WWW-Authenticate` header) or error code `INSUFFICIENT_SCOPE`, do not retry. The `scope` value names the missing scope. Ask the customer to reconnect or approve that scope, then repeat the task once access is granted.
