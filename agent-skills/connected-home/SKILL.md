---
name: connected-home
description: Use for connected-device requests such as turning off lights or a room switch, lowering the thermostat temperature, checking the temperature right now, vacuuming a room, playing or pausing music on Echo/Alexa, lowering speaker volume, looking at a kitchen camera, finding or pinging a phone, or checking whether a phone/watch is dead or needs charging. For a bare temperature question with no indoor/outdoor context, clarify which before assuming weather. Explicit weather forecasts or city temperatures do not require this workflow.
---

# Connected home requests

Resolve the customer's intended home task and use the existing Port OS connection.
Do this workflow in the current chat without delegation.

For "what's the temperature right now?" with no context distinguishing indoor
temperature from weather, ask whether the customer means indoors or outside.
Do not require a city/ZIP before resolving that distinction. For explicit indoor
requests, discover a thermostat/temperature sensor and read ambient temperature;
a setpoint is not a room measurement. Respect explicit outdoor/weather intent.

Read the task guide index at `references/index.md` and the relevant bundled reference:
temperature, lighting, cameras, rooms, media, battery, find-phone, files or reminders.
These are the same Markdown guides published on the website and exposed as MCP
resources at portos://guides/{topic}. When references are unavailable, read
portos://guides/index with resources/read. The guides explain capability selection,
documented payload fields, verification and operation limits; do not invent commands from product names.

Use host-listed account labels to choose the likely authorized home-device
connection. If discovery misses a device, check relevant authorized connections
before denying availability. Keep the returning account with every endpoint,
route and item ID. Ask which account/target before writing when several match.
Do not create connections or expand permissions just to resolve discovery.

For phone/watch battery, charging or Find My requests, inspect every matching
candidate's routes before choosing an exact endpoint. Prefer the concrete device
with an authorized Apple iCloud route for Apple Find My, rather than the first
matching name, an Alexa proxy, a generic plugin or an old unrouted record. If a
same-name record has unavailable data, continue to the relevant route-backed
candidate before claiming iCloud has no reading. Preserve old records; discovery
does not authorize deleting or merging them.

Use declared endpoint_query expansions with forceDeviceAttributeQuery:true for
current state. Missing, stale or unavailable readings mean current state is
unknown. Inspect camera snapshot pixels before describing a scene. Accepted
control alone does not confirm a physical outcome; verify fresh observations and
do not automatically repeat state changes.

For cameras that declare RTC streaming but no on-demand snapshot, prefer the
embedded endpoint_show panel's supported live-view control. Showing a panel does
not establish that video started or that you inspected it. If the host cannot
operate or inspect the embedded viewer, report that limitation. A separate
website may use a different signed-in account; its missing-device result does
not establish that the MCP account lacks the camera.

Explain results and needed clarification in plain customer language. Do not
explain that an internal skill requires a question.
