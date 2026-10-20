---
author: Port OS Team
last modified: 2026, october, 20
title: How to turn off your lights
description: Use this guide when the customer wants to turn lights off or on, or to check whether lights are on. It covers finding the right lights, telling lights from switches and plugs, and fixing device data that confuses customers.
skill-id: turn-off-lights
capabilities:
  - power
  - brightness
  - color
  - color-temperature
guide-id: lighting
content-authorship: HUMAN_MIXED_WITH_AI
---

# How to turn off your lights

1. Find your lights by listing your devices.
2. Check each device's capabilities and type.
3. Turn them off.

## Before you start: what does "all lights" mean?

"All lights", "the lights" and "lights" depend on the customer's habits. Common meanings:

1. Turn off every light the customer owns.
2. Turn off the lights in the room the customer is in.
3. Turn off every light in a group the customer named "all lights".
4. Turn off every light, switch and plug in one group, such as the main house, and leave the other groups alone.

Ask the customer what they mean the first time, and remember the answer. If you cannot ask, make a best effort: turn off every endpoint with the `LIGHT` type. This does not always work, because customers sometimes misjudge their own homes.

## Lights, switches and plugs

Start with authorized endpoint discovery and inspect each endpoint's capability declarations. A room name can be ambiguous, so select by full ID and group path, or ask the customer. A plug or switch that supports power is not automatically a light.

Sometimes "turn off the lights" means turning off a plug or switch that a lamp is connected to. When you search for an endpoint, check plugs and switches as well as lights, and confirm with the customer before you switch one off.

## Lights in someone else's home

The lights may belong to someone else who shared them with the customer, for example when the customer is house sitting or staying in a rented home. Shared endpoints are not included by default. Add an explicit owner, endpoint ID or group selector to include them.

## Fix confusing data

Fix the data so customers do not get confused. For example, change a plug that powers a lamp to the `LIGHT` type. If a device does not work, disable it so that it stops appearing in default results.

## Use MCP

Connect your AI client with the steps in [How to use MCP](https://portoperatingsystem.com/docs/how-to-use-mcp/). Then use these tools:

- `endpoint_query` lists devices. It returns each device's type, capabilities and message IDs. Call it without a `query` to load everything, or narrow it with a type filter such as `{"type": {"eq": "LIGHT"}}`. Pass the returned `nextToken` back until none is returned. Ask for `expand: ["power"]` to read power state, and add `forceDeviceAttributeQuery: true` to read it from the device instead of the cache.
- `group_query` lists groups, their parent path, child groups and members. Use it to resolve a room to a full group ID.
- `control` sends a command. Copy `id` and `message` from the query results, for example the `turn-off` message of the power capability, and send `payload: {}`.
- `endpoint_manage` repairs data. Its operations are `RENAME`, `SET_TYPE`, `SET_ENABLEMENT`, `MERGE_INTO` and `DELETE`. Copy the full endpoint ID from `endpoint_query`, and explain the effect to the customer before you merge or delete.
- `group_manage` creates, renames, merges and deletes groups, and changes their members.

Report which lights you selected, which commands were accepted, and which failed.

## Use the HTTP API

Authorize with a bearer token that has the endpoint and message permissions you need. See [authorization rules](/docs/for-ai/guides/authorization-rules.md).

### Find lights

For one bulb, read its power, brightness and color message schemas in [the capability directory](/docs/for-ai/capability-interfaces.md). Use the exact namespace, version, message name, units and constraints it returns. [The quickstart](/docs/for-ai/guides/quickstart.md) shows the generic message envelope.

For "all lights", call [endpointQuery](/docs/for-ai/operations/endpointQuery.md) with `endpoint:read` permission and filter by the `LIGHT` type:

```json
{
  "query": {
    "match": {"key": "type", "value": "LIGHT"}
  },
  "paginationContext": {"maxResults": 25}
}
```

Type-only queries return the caller's own endpoints. To include a shared endpoint, add an explicit owner or endpoint ID selector. A group selector can include shared members once `group:read` and group access checks pass.

For a room, first resolve its full group ID with [group discovery](/docs/for-ai/guides/managing-groups.md). Then add `{"match":{"key":"groupId","value":"<resolved-full-group-id>"}}` to the `and` list of the query. This also requires `group:read` and permission to read that group. A group filter returns the group's member endpoints. Resolve nested groups as needed and remove duplicate endpoint IDs. Reading a group does not grant control of its members.

Repeat the same query, page size and authenticated grant with `paginationContext.nextToken` from each response. Continue until the token is absent, including after an empty page. Disabled endpoints are excluded by default. Check each selected endpoint's declared capabilities, and drop targets that do not support power. Do not widen the selection to every plug or switch. Freeze the target list before you send commands, and report each result.

### Read state

To read live state, call [endpointQuery](/docs/for-ai/operations/endpointQuery.md) with `expand: ["interfaces.attributes"]` and `forceDeviceQuery: true`. The same options exist on `GET /endpoints`: send `id=<endpoint-id>`, `expand=interfaces.attributes` and `forceDeviceAttributeQuery=true`. Check each observation's sample time and any partial errors before you say a light changed.

A batch can partly succeed. Report selected, accepted, failed and unresolved targets separately. A lost response is not a reason to repeat a relative brightness change.

### Control lights

Send each command with [sendMessage](/docs/for-ai/operations/sendMessage.md): `POST /messages` with the target endpoint and a message that names the capability namespace, message name and version. To turn a light off:

```json
{
  "target": {
    "type": "ENDPOINT",
    "id": "<full-endpoint-id-from-discovery>"
  },
  "message": {
    "header": {
      "namespace": "port1/systems/zero/capability-interfaces/power",
      "name": "turn-off",
      "version": "1.0"
    },
    "body": {}
  }
}
```

An accepted command does not prove the light is off. Read the state again to confirm.
