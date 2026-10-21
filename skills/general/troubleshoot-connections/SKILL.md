---
name: troubleshoot-connections
description: Use this guide when a connection, a device command or a provider link fails and the customer needs the cause and a fix.
metadata:
  title: Recover from connection and device failures
  guide-id: troubleshooting
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 8
---

# Recover from connection and device failures

First identify the failure boundary: documentation retrieval, registration, user authorization, token validation, scope, resource policy, payload, provider link or device observation.

| Symptom | Next step |
| --- | --- |
| Guide returns a login page/app shell | Use the raw Markdown link from the guide index; report the broken link to support |
| DCR invalid metadata | Correct callback, auth method, supported grants/scopes; do not invent a secret |
| Callback state/issuer mismatch | Stop; discard the response and restart authorization securely |
| Token expired | Refresh with the same client/resource or ask for renewed user consent |
| Scope/policy denied | Read [authorization rules](/docs/for-ai/guides/authorization-rules.md); user/owner must approve access |
| Empty inventory | Valid connection can have no devices; check linking/sharing without guessing IDs |
| Invalid payload | Retrieve the exact capability version/schema and correct the request |
| Provider credential expired | Ask the user to relink the provider account |
| Stale/unavailable state | Report timestamp and uncertainty; do not claim physical completion |
| Lost command response | Recover existing receipt/readback; retry only under documented replay guarantees |
| Committed cleanup pending | Read the committed state/result before any retry |

See [API behavior](/docs/for-ai/guides/using-the-api.md). Never include tokens, provider secrets or another user's private resources in diagnostics.

