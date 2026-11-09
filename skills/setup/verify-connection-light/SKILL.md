---
name: verify-connection-light
description: Use this guide to confirm that a new connection works by reading and controlling one light.
metadata:
  title: Verify the connection and control one light
  guide-id: quickstart
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 25
---

# Verify the connection and control one light

First complete [OAuth setup](/docs/for-ai/guides/authentication-and-dcr.md). Keep the discovered API issuer and credentials in client configuration.

1. GET /endpoints?owner=~caller&maxResults=25 with Authorization: Bearer <access_token>. `maxResults` is 1-100 (a larger value is rejected); page with `nextToken`. Collection requests default to enabled endpoints owned by the caller; `owner=~caller` makes that scope explicit. POST /endpoint-query with `{}` has the same owner-scoped default. Type and capability filters stay within the caller's endpoints; an explicit owner, endpoint ID, or authorized group selector can include readable shared endpoints. Read [listEndpoints](/docs/for-ai/operations/listEndpoints.md) and [endpointQuery](/docs/for-ai/operations/endpointQuery.md) for pagination and request fields. Follow continuation metadata until enumeration is complete. An empty list means valid access with no visible devices; guide the user to [add devices](/docs/for-ai/guides/adding-devices.md).
2. Select one light by full endpoint ID and group/room context. If the target is ambiguous, ask the user before acting.
3. Inspect its declared capability namespace and version. A light declaring power 1.0 uses the [power guide](/docs/for-ai/capability-interfaces/power/1.0.md) and [turn-on payload schema](/docs/references/capability-interfaces/power/1.0/messages/turn-on.yaml). For other versions or capabilities, follow [the capability directory](/docs/for-ai/capability-interfaces.md).
4. With the user's intended action, POST /message-requests with Authorization: Bearer <access_token>, Content-Type: application/json and a unique Idempotency-Key for this intended command. Send the request object below as the JSON body, without a surrounding `body` field or a JSON string. Read [upsertMessageRequest](/docs/for-ai/operations/upsertMessageRequest.md) and its linked request schema. Use the endpoint ID and message version you discovered, not the illustrative ID below.

```json
{"target":{"type":"ENDPOINT","id":"port1/principals/example/endpoints/example-light"},"message":{"header":{"namespace":"port1/systems/zero/capability-interfaces/power","name":"turn-on","version":"1.0"},"body":{}}}
```

For a command that returns a result, such as a media search, set `responseType` to `SYNC` so the response carries the correlated result. `responseType` is a top-level field beside `target` and `message`, never inside `message.body`. Each message body accepts only the fields declared for that message (`search-media` takes `query`, `type`, `album`, `artist`, `year`, `maxResults` and `nextToken`; it has no `provider`).

```json
{"target":{"type":"ENDPOINT","id":"port1/principals/example/endpoints/example-music-library"},"message":{"header":{"namespace":"port1/systems/zero/capability-interfaces/media-search","name":"search-media","version":"1.0"},"body":{"query":"miles davis kind of blue"}},"responseType":"SYNC"}
```

HTTP 200 means the durable request was created. Keep its `id` and inspect `status`: `QUEUED`, `IN_PROGRESS`, `SUCCEEDED`, `PARTIALLY_SUCCEEDED` or `FAILED`. `results` contains successful deliveries with their target and route; `errors` contains failures with the same context. A correlated provider response appears at `results[i].message`, never as a singular top-level message. Pending deliveries appear in neither list. The resource exposes its deadline; the default is 30 seconds.

After a lost response, repeat the identical request with the same Idempotency-Key, or read `GET /message-requests/{id}`. These attach to the existing resource and do not resend an attempted command. A different payload with the same key returns 422. `TIMED_OUT` means the external outcome is unknown, so inspect state before considering a new command. A successful delivery alone does not prove physical state.

Do not cut JSON with head -c. GET /endpoints?id=<URL-encoded-endpoint-id>&expand=interfaces.attributes&forceDeviceAttributeQuery=true to request permitted device-backed state. Inspect attributes and partial errors. Check sampledAt against the command time and the capability version. sampledAt is the source-reported time, not the fetch time; an absent timestamp means freshness is unknown. Use [listEndpoints and its linked components](/docs/for-ai/operations/listEndpoints.md) for exact response shapes. Report returned device state separately from dispatch acceptance. Stale/unavailable state means unknown, and user confirmation may be necessary for a physical device.

For first setup, test one explicitly selected safe light. Do not turn off all homes as a connectivity check. See [lighting](/docs/for-ai/guides/lighting.md), [first setup](/docs/for-ai/guides/first-setup.md) and [authorization rules](/docs/for-ai/guides/authorization-rules.md).
