---
author: Port OS Team
last modified: 2026, october, 9
title: Verify the connection and control one light
description: Use this guide to confirm that a new connection works by reading and controlling one light.
skill-id: verify-connection-light
guide-id: quickstart
content-authorship: HUMAN_MIXED_WITH_AI
---

# Verify the connection and control one light

First complete [OAuth setup](/docs/for-ai/guides/authentication-and-dcr.md). Keep the discovered API issuer and credentials in client configuration.

1. GET /endpoints?owner=~caller&maxResults=25 with Authorization: Bearer <access_token>. Collection requests default to enabled endpoints owned by the caller; `owner=~caller` makes that scope explicit. POST /endpoint-query with `{}` has the same owner-scoped default. Type and capability filters stay within the caller's endpoints; an explicit owner, endpoint ID, or authorized group selector can include readable shared endpoints. Read [enumerateEndpoints](/docs/for-ai/operations/enumerateEndpoints.md) and [endpointQuery](/docs/for-ai/operations/endpointQuery.md) for pagination and request fields. Follow continuation metadata until enumeration is complete. An empty list means valid access with no visible devices; guide the user to [add devices](/docs/for-ai/guides/adding-devices.md).
2. Select one light by full endpoint ID and group/room context. If the target is ambiguous, ask the user before acting.
3. Inspect its declared capability namespace and version. A light declaring power 1.0 uses the [power guide](/docs/for-ai/capability-interfaces/power/1.0.md) and [turn-on payload schema](/docs/references/capability-interfaces/power/1.0/messages/turn-on.yaml). For other versions or capabilities, follow [the capability directory](/docs/for-ai/capability-interfaces.md).
4. With the user's intended action, POST /messages with Authorization: Bearer <access_token> and Content-Type: application/json. Send the request object below as the JSON body, without a surrounding `body` field or a JSON string. Read [sendMessage](/docs/for-ai/operations/sendMessage.md) and its linked request schema. Use the endpoint ID and message version you discovered, not the illustrative ID below.

```json
{"target":{"type":"ENDPOINT","id":"port1/principals/example/endpoints/example-light"},"message":{"header":{"namespace":"port1/systems/zero/capability-interfaces/power","name":"turn-on","version":"1.0"},"body":{}}}
```

HTTP 200 acknowledges acceptance. An asynchronous request can return `{"messageId":""}` without a `message`; the empty ID is valid and does not provide a durable receipt or retry deduplication. When a unary response message is present, `messageId` identifies that response. Neither response proves physical state. After a lost response, treat the outcome as unknown and inspect state before deciding whether another action is safe.

Do not cut JSON with head -c. GET /endpoints?id=<URL-encoded-endpoint-id>&expand=interfaces.attributes&forceDeviceAttributeQuery=true to request permitted device-backed state. Inspect attributes and partial errors. Check sampledAt against the command time and the capability version. sampledAt is the source-reported time, not the fetch time; an absent timestamp means freshness is unknown. Use [enumerateEndpoints and its linked components](/docs/for-ai/operations/enumerateEndpoints.md) for exact response shapes. Report returned device state separately from dispatch acceptance. Stale/unavailable state means unknown, and user confirmation may be necessary for a physical device.

For first setup, test one explicitly selected safe light. Do not turn off all homes as a connectivity check. See [lighting](/docs/for-ai/guides/lighting.md), [first setup](/docs/for-ai/guides/first-setup.md) and [authorization rules](/docs/for-ai/guides/authorization-rules.md).
