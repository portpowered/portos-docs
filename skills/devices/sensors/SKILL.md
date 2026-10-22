---
name: sensors
description: Use this guide when the customer asks about air quality, an air purifier, humidity, whether a door or window is open, or whether a motion sensor has seen movement.
metadata:
  title: Read air quality, humidity, contact and motion sensors
  guide-id: sensors
  capabilities: air-quality-sensor temperature-sensor humidity-sensor contact-sensor motion-sensor fan-control
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 22
---

# Read air quality, humidity, contact and motion sensors

Many endpoints declare sensing next to their main job, so search by the reading you need as well as the product name. Candidates include `AIR_QUALITY_MONITOR`, `AIR_PURIFIER`, `CONTACT_SENSOR`, `MOTION_SENSOR`, `HUMIDITY_SENSOR` and `TEMPERATURE_SENSOR`. Check every authorized account before you say a sensor is missing. Fetch the exact interface from [the directory](/docs/for-ai/capability-interfaces.md) before you rely on it. Sensor interfaces also cover concentrations such as carbon dioxide, PM2.5 and formaldehyde.

Query the exact endpoint and expand only the declared sensor capabilities with `forceDeviceAttributeQuery=true`. Only an available reading is a reading. A missing, stale or unavailable value is unknown, not zero, closed or clear. Report the unit and any timestamp the endpoint supplies. `air-quality-sensor` reports an `air-quality-index` value together with the standard it uses, so give both, and do not compare readings from different standards. Send `get-air-quality` only when the route declares it.

A motion or contact sensor reports the last state it sent. "No motion" does not prove that nobody is home, and an unreachable sensor does not mean a closed door. For indoor temperature use a `temperature-sensor` reading, not a thermostat setpoint; see the [thermostat guide](/docs/for-ai/guides/thermostats.md).

## Air purifiers

A purifier may declare power and `fan-control` as well as air quality. Use only the commands it declares and read the fan setting afterward. Turning a purifier on or off is low risk and needs no extra confirmation when the customer asked. Accepted control proves dispatch only, so verify with a fresh observation and do not repeat a relative change. No Dyson plugin exists, so a Dyson purifier is available only through another connected provider.

Sensors are read-only. Do not promise alerts or automations unless a declared scheduling operation creates a verifiable job.
