---
name: lighting
description: Control lights, lamp switches/plugs and room scenes; power, targets, disambiguation, failures, brightness, color, scenes and timing.
metadata:
  title: Control lights
  guide-id: lighting
  capabilities: power brightness color color-temperature scene
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, november, 5
---

# Control lights

1. Reuse established lighting scope and declarations; discover only missing context.
2. Send one command to the widest target that matches the request: a whole-home query, a room group, then a single light.
3. Send with `waitForResult: false`, say "Okay" and stop.

Connect your AI client with the steps in [How to use MCP](https://portoperatingsystem.com/docs/how-to-use-mcp/). The tools:

- `endpoint_query` returns device types, capabilities and message IDs. Narrow `query`, for example `{"type":{"eq":"LIGHT"}}`, or omit it for all permitted devices. Follow every nextToken. Use `expand:["power"]` for observations and `forceDeviceAttributeQuery:true` for a provider refresh.
- `group_query` lists groups, their parent path, child groups and members.
- `control` sends one declared message with a unique `idempotencyKey` to exactly one target: a device or group `id` from discovery, or a `query` with the same field-first filter as `endpoint_query`.
- `endpoint_show` shows a device's card, only when the user asks for a card or controls. Never draw your own card.
- `endpoint_manage` (`RENAME`, `SET_TYPE`, `SET_ENABLEMENT`, `MERGE_INTO`, `DELETE`) and `group_manage` repair names, types and groups. Use them only for a requested change. A simulator endpoint can merge only into a target without a simulator route; merging two simulator endpoints returns 409 CONFLICT, so disable or delete the duplicate instead.

## 1. Power

Turn lights on and off with the declared power `turn-on` and `turn-off` messages and `payload: {}`. Brightness 0 is a different command from power off, and a brightness or color command can leave a light off, so never claim a light turned on from its brightness or color. `reboot` restarts a device; send it only when asked.

## 2. Group, individual and query targets

Pick the widest target that covers the request, because one command is faster and more reliable than many:

| Request | Target |
| --- | --- |
| Every light in the home | One `control.query`, for example `{"type":{"in":["LIGHT","SWITCH","PLUG"]}}` when every SWITCH and PLUG is named for a lamp; otherwise LIGHT plus the lamp-named switches and plugs, by name or ID |
| A room or zone | The room's group `id` from `group_query` by name, such as `{"name":{"like":"living room"}}`; never filter by role, because a group the user made counts as a room too |
| One named light | The device `id` from `endpoint_query`, or a query on its exact name, such as `{"name":{"eq":"Porch light"}}`, which avoids copying IDs by hand |
| "The lamp" or "lamp on" | The device that is a lamp. When types do not settle it, use the name, room or anything else known, such as a floor plug named "Corner lamp"; when no detail picks one device, ask which |

Never copy a list of IDs, loop over single lights, or send a group command plus leftovers when one query or group covers the request. Resolve a room through `group_query` and inspect its members; matching names misses lights, and a group-only search misses ungrouped lights. A name such as "Everywhere" does not prove coverage. Native capabilities and `membershipComplete` do not prove coverage either.

Port OS picks the delivery for the complete target, including a provider's native group when it covers every member, and freezes the matching devices once. A query adds no implicit exclusions, so exclude provider SELF and catalog records, appliances and duplicate copies of a device in the query itself. A duplicate is one device reported twice, for example by two providers. Lights that only share a name, or sit in different rooms, are separate devices, so a whole-home request includes each of them. Simulated devices count like any other device.

## 3. Lights, plugs and switches

Brands report lamps as LIGHT, SWITCH or PLUG. Power support alone does not make a plug or switch a light: a plug can run a fan or a router.

- Nothing marks a plug or switch as lighting. Include one when its type, name or room indicates a lamp, or the user said so earlier; a plug or switch named for an appliance is not a light.
- A device named for a fan or appliance is not a light, even when it reports LIGHT. Read names before a whole-home query and leave such devices out of it by ID or name.
- When no group or device has the room or name the user said, say so and ask. Never substitute a different room, such as Bedroom for Twin bedroom. When the request names several rooms and only some exist, act on those that exist and say which were not found.
- When "the lights" could mean this room, the whole home or a device or group named "The lights", use the best reading from context: the room the client says the user is in, a recent request, or the only match.
- Ask one short question when the readings would change different devices and context does not settle it. Then remember the answer for the rest of the conversation, and, if the user agrees, save it: label a lamp plug `LIGHT` with `endpoint_manage SET_TYPE`, or put lights in a group, so later requests need no question.
- Lights shared from someone else's home are excluded by default. Include them only with an explicit owner, endpoint ID or group selector.
- When asked to clean up confusing data, label lamp plugs `LIGHT` or disable broken devices so they leave default results.

## 4. Failures

People asking for lights want a quick answer.

- **A command to many lights:** when it is accepted, say "Okay", even if some lights did not take it. List per-light results only when the user asks, or when nothing was accepted. Keep the results, so you can say which lights failed and why when asked.
- **A command to one light:** when it fails, say why in plain words from the error. For example, `UNREACHABLE` or `ENDPOINT_UNREACHABLE` (423) means the light is offline even if old readings say otherwise, and a permission error means the connection needs access.
- **Unknown state:** missing readings do not mean off. `PROVIDER_NO_STATE` means unknown: send the command once, and report it as unconfirmed if a requested check fails.
- **Unclear outcomes:** after an ambiguous transport failure, including HTTP 404 or a timeout, never repeat `control` on your own; even the same key can dispatch again without a receipt. Read a known receipt with `GET /message-requests/{id}` or fresh state first. An authorized retry keeps the key and exact arguments, including wait mode. Never repeat a relative change such as `adjust-brightness` after an unclear result.

## 5. Brightness

`set-brightness` takes `{"brightness": <0 to 100>}` in percent. `adjust-brightness` takes `{"brightnessDelta": <-100 to 100>}` percentage points and works only where the device declares it separately. Use the adjust message for "a bit brighter" or "dimmer" when declared; otherwise read the current brightness with `expand` and set a value below it to dim or above it to brighten. For several lights, pick one value below the lowest reading (or above the highest) and send one command to all of them; a light whose reading you have is never unknown. A light that is off cannot dim, so when every light is off, say so instead of sending a command. Some lights do not respond below a minimum brightness; if a low setting fails, suggest a slightly higher value or turning it off.

## 6. Color temperature and color

- **Kelvin:** `set-color-temperature` takes `{"colorTemperatureInKelvin": <1000 to 10000>}`, only where the device declares Kelvin control. Rough guide: warm white 2000, soft white 2500, white 4000, daylight 5500, cool white 7000.
- **Relative white:** `set-relative-color-temperature` takes `{"percent": <0 to 100>}`, from warmest to coolest within the device's own range, for example Tuya whites. Relative values do not map to Kelvin without calibration.
- **Steps:** `increase-color-temperature` and `decrease-color-temperature` move one step cooler or warmer with `{}`.
- **Color:** `set-color` takes `{"color":{"hue":<0 to 360>,"saturation":<0 to 100>,"brightness":<0 to 100>}}`. Hue is in degrees: 0 red, 120 green, 240 blue. Saturation 0 is white.

Each manufacturer maps these values to its own LEDs, so a hue that should be yellow can look green on some bulbs. Send the requested values, describe only the state you observed, and if the user says the color looks wrong, adjust the hue for that light rather than repeating the same value.

## 7. Scenes

A scene is a saved set of member light settings (power, brightness and color) that a provider stores for one room or zone. Scenes belong to the room or zone group route that declares the `scene` capability. Today Philips Hue rooms and zones declare it; other providers may declare none, so inspect declarations instead of assuming.

**Find scenes.** Resolve the room with `group_query` and request `expand:["scene"]` with `forceDeviceAttributeQuery:true`. `available-scenes` lists each scene's `id` and `name` in provider order; `active-scene` gives the `sceneId` in effect, or omits it when none is. Match the user's words ("movie", "relax", "bright") to a listed name; when several names fit or none does, list the choices instead of guessing. A scene with the same name in another room, zone or provider is a different scene with a different ID. When the user names only a scene ("turn on the cooking scene"), the scene name is not a group name: list the groups that declare `scene` and read each one's `available-scenes` before saying it does not exist.

**Recall a scene.** Send the declared `scene/activate` message with `{"sceneId":"<id from available-scenes>"}` to the same logical group that listed it. Keep the selected group ID; Port OS resolves the native provider route. Activation is fire-and-forget: report it as accepted, and fresh-read members only when asked to verify. Recall can turn lights on and change color, so it is a lighting change like any other.

**Save a scene.** First check that the room's group lists `scene/create-scene` in its messages; if it does not, change nothing and say saving is unsupported. "A scene like this" means the lights as they are now, so save without changing them. Only when the user describes a different look, set the member lights to it first and verify them with a fresh read. Then send `scene/create-scene` with `{"name":"<scene name>"}` and `waitForResult:true`. It snapshots the current member settings without changing them and returns `scene-created` with `sceneId` and `name`. Hue limits names to 32 characters and needs every member reachable with readable state. Read `available-scenes` again to confirm, and use the returned ID for later recalls. If the group does not declare `create-scene`, say that saving is unsupported; never save a local label and call it a scene.

**Change a scene.** There is no update message. To change a scene, set the lights, create a new scene, and delete the old one only when the user asks. Never delete existing scenes to make room.

**Delete a scene.** Only on request. Send the declared `scene/delete-scene` with the exact `sceneId` to its room or zone with `waitForResult:true`, confirm `scene-deleted`, and read `available-scenes` again.

**Leave a scene.** Send `scene/deactivate` only when the group declares it. Otherwise set the lights directly, for example power/turn-off for "end the scene".

**Rooms with mixed brands.** A native scene covers only that provider's members. Lights from other brands in the same Port OS room keep their state. Say which lights the scene covered, and set the others with ordinary power, brightness and color commands if the user wants the whole room to match.

**Effects.** Color loops, candle flicker and similar effects need declared messages. Port OS declares no effect capability today, so do not simulate an effect with repeated commands; say it is not supported.

**Uncertain outcomes.** A timeout or transport error after create, delete or activate does not prove failure. Read `available-scenes` and `active-scene` before any other write, and never retry automatically or switch to another room.

Read [Save and recall room scenes](/docs/for-ai/guides/room-scenes.md) for the same workflow on its own.


## 8. Timing and the user's perspective

The user is in the room and sees the lights change, so a fast "Okay" matters more than a verified report.

- Use `waitForResult: false` for power, brightness and color writes. Report accepted or pending and stop. Do not poll, fresh-read or open cards after an ordinary command.
- Use `waitForResult: true` only when the user needs a reply from the device, such as saving a scene.
- Fresh-read state only when the user asks whether lights are on or asks you to check. Use the declared expansions with `forceDeviceAttributeQuery: true`, and describe only what you observed. QUEUED and IN_PROGRESS requests can have empty result lists.
- Reuse what this conversation already knows (rooms, groups, which plugs are lamps) instead of discovering it again.
- One command for a room also makes its lights change together. Separate commands make them change one by one, and each adds a round trip.
- Read-only questions need `endpoint_query`; `control` is only for changes.

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

Send each command with [upsertMessageRequest](/docs/for-ai/operations/upsertMessageRequest.md): `POST /message-requests` with a unique `Idempotency-Key` for this intended command, with the target endpoint and a message that names the capability namespace, message name and version. To turn a light off:

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

Inspect the returned request's `id`, `status`, `results` and `errors`. `FIRE_FORGET` can return `QUEUED` before any provider call. Use `responseType: "SYNC"` to wait for final delivery outcomes, or poll `GET /message-requests/{id}`. A provider response, when present, is in `results[i].message`. Pending deliveries appear in neither list. Delivery success does not prove the light is off; read the state again to confirm.

A request can target `{"query": <the shared Query AST>}` instead of type/id. Port OS freezes authorized recipients once; zero or more than 100 returns 400. The same key and arguments attach to an existing request despite inventory changes; without a receipt, POST can dispatch anew. Inspect receipts or state instead of automatic retries. Never use a new key to repeat uncertain relative brightness. `TIMED_OUT` means unknown outcome.
