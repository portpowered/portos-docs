---
name: control-thermostats
description: "Use this guide when the customer wants to read or set a thermostat target, mode or temperature."
---

# Control thermostat settings

Discover the intended thermostat and its declared capabilities from [the directory](/docs/for-ai/capability-interfaces.md). Retrieve the exact setpoint/mode schema before sending. Preserve declared units, supported mode names and temperature bounds; never assume Celsius/Fahrenheit.

Use [authorized REST dispatch](/docs/for-ai/guides/quickstart.md). Read fresh mode/setpoint/temperature observations after the command. A committed target setting does not prove the room has reached that temperature. Report delayed or unavailable observations honestly and do not repeat relative adjustments after an unknown response.

