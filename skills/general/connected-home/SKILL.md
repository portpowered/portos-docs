---
name: connected-home
description: Use for connected-device requests such as turning off lights or a room switch, lowering the thermostat temperature, checking the temperature right now, vacuuming a room, playing or pausing music on Echo/Alexa, lowering speaker volume, looking at a kitchen camera, finding or pinging a phone, or checking whether a phone/watch is dead or needs charging, locks and doorbells, the fridge or oven, air quality and door/motion sensors, finding a wallet or laptop tracker, iCloud Drive files, and reminders or calendars. For a bare temperature question with no indoor/outdoor context, clarify which before assuming weather. Explicit weather forecasts or city temperatures do not require this workflow.
metadata:
  title: Connected home requests
  guide-id: skill-connected-home
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, november, 2
---

# Connected home requests

Resolve the customer's intended home task and use the existing Port OS connection.
Do this workflow in the current chat without delegation.

Copy returned resource references unchanged. MCP accepts compact IDs such as
`me/ep/<base64url UUID>`, `0/ep/<base64url UUID>` and full IDs.
Capability messages default to `power/turn-off`: system zero and the messages
path are assumed. Retain `@version` only when discovery includes it; ambiguous
versions require an explicit choice.
`me` binds to the current authenticated principal; preserve the account with
each reference. Do not encode, reconstruct or shorten IDs yourself.

For an ambiguous "what's the temperature right now?", clarify indoors or outside
before requesting a city/ZIP. Indoors, discover a thermostat/temperature sensor and
read ambient temperature, never its setpoint. Respect explicit outdoor/weather intent.

Window-covering lift is percent open: position 0 and `liftPercent100thsValue` 0 are
fully closed, 100 and 10000 fully open. Open a blind to 10000 and close it to 0.

Read the task guide index at `references/index.md` and the relevant bundled reference:
temperature, lighting, cameras, rooms, media, battery, find-phone, files or reminders.
These same guides are published on the website and at portos://guides/{topic}.
If references are unavailable and the client exposes resources/read, read portos://guides/index.
Tools-only clients use control's music, queue and scene recipes. Other payloads require the matching guide; never assume resources/read or guess fields.
Follow their capability, payload, verification and operation limits; never invent
commands from product names.

Each device family also has its own Port OS skill. When the Port OS plugin is
installed, use the matching skill alongside this one; otherwise read its guide at
`https://portoperatingsystem.com/docs/for-ai/guides/{guide-id}.md`. The skills are
lighting, thermostats, vacuums (rooms and the house map), media, screens (show
text, images, timers and lists on a TV), cameras,
security (locks, doorbells, security panels), kitchen (refrigerators, ovens,
cooktops, pet feeders), sensors (air quality, humidity, contact, motion,
purifiers), trackers (phone, watch, wallet and laptop trackers), cloud-drives
(iCloud Drive and Photos) and reminders-and-calendars. For accounts,
use add-devices, manage-devices, manage-groups, manage-simulators,
grant-endpoint-permissions and troubleshoot-connections. Unlocking a door,
disarming a panel, oven heat and deleting files need the customer's
confirmation first.

Choose authorized connections by host-listed account labels. Before denying a
missing device, check relevant authorized connections. Preserve the returning account
with each endpoint, route and item ID; clarify multiple matches before writing.
Discovery never justifies creating connections or expanding permissions.

Treat simulated devices like any other device. Before reporting absence, check the
other relevant authorized accounts. If the customer explicitly names an account,
keep that scope. If several devices still match, identify them by account and name;
clarify the target before a write. Never move a `me` reference between accounts.

For phone/watch battery, charging or Find My, inspect every matching candidate's
routes. Choose a concrete authorized Apple iCloud endpoint for Apple Find My.
A name, Alexa proxy, generic plugin or old unrouted record cannot establish that scope. If one
match lacks data, check other route-backed candidates before denying an iCloud
reading. Discovery never authorizes deleting or merging old records.

Read current state with declared endpoint_query expansions and
forceDeviceAttributeQuery:true. Report STALE as last known state with sampledAt,
never live or unknown; it cannot substantiate safety claims such as locked/off. Errored, missing, invalid or
PROVIDER_NO_STATE readings mean unknown. PROVIDER_NO_STATE means the provider
replied without an attribute value; this does not establish offline state: send the requested command once
and report unconfirmed. Only UNREACHABLE or ENDPOINT_UNREACHABLE (423) means offline
and rejected. Inspect snapshot pixels before describing a scene.
Prefer one control call for a resolved action: a compact query for a whole-home
selection or the logical group for a room. Reuse established scope and declarations;
discover missing context only. Ordinary response-less writes use waitForResult:false.
Report accepted/pending and stop; do not automatically poll or reread state.
Wait for requested data such as snapshots, SDP, searches and queue contents.
Fresh-read when the user asks for state/verification, a relative action needs a
current value, or an uncertain result needs diagnosis. Acceptance never proves a
physical outcome; never automatically repeat state changes.

Before room changes, read the rooms reference and
[group workflow](/docs/for-ai/guides/managing-groups.md). Use current group IDs and
starting etags; MOVE_MEMBER needs both group references. BEST_EFFORT can change
providers before local intent: inspect partial results and providerDispatches.
Deletion disables unretired routes, preventing rediscovery from restoring the group.

Use endpoint_show when the user requests a card, map or device controls. It is
not an automatic follow-up to a command. A single exact endpointId opens the
device; a multi-device query opens a name list. Never draw a replacement card.

For RTC cameras without on-demand snapshots, prefer the embedded endpoint_show
live-view control. Showing a panel proves neither started video nor inspection.
Report inability to operate or inspect it. A separate website may use another
account; its missing-device result does not prove absence from the MCP account.

Explain results and needed clarification in plain customer language. Do not
explain that an internal skill requires a question.

Respect scopes: reads need `endpoint:read`/`group:read`, control `message:send`,
`endpoint_manage` `endpoint:write`, and `group_manage` `group:manage`. On
`insufficient_scope` (403), never retry; request reconnection or approval of the named
scope. See first-setup's "Scopes for setup".
