---
name: cameras
description: Use this guide when the customer wants a camera snapshot, a recording or a live stream.
metadata:
  title: Read camera captures and streams
  guide-id: cameras
  capabilities: camera snapshot recordings rtsp-session
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, november, 2
---

# Read camera captures and streams

Camera access requires operation scope and authorization for the selected camera/action. Light-control permission grants no imagery access. Inspect declared camera/snapshot schemas in [the directory](/docs/for-ai/capability-interfaces.md).

Select the permitted view; clarify ambiguity. Inspect captured pixels and timeOfSample. Verify movement with a new snapshot.

For current imagery, send get-snapshot with responseFormat BASE64 (inline) or URL (short-lived link). If hosting is unavailable, use BASE64. Check timeOfSample and URL expiresAt; a new link can contain an old capture. Verify retrieval before claiming to have viewed it. Recapture expired/stale images or explain the limitation. Streams use their declared lifecycle/transport.

Ring `camera/step-ptz` requires the caller's active RTC `sessionId` and a `direction` from `supportedPtzStepDirections`: LEFT/RIGHT/UP/DOWN. It moves one bounded step. Inspect uncertain movement before retrying. Absolute positions and zoom are unsupported.

That session exists only after `rtc-session/initiate-session-with-offer` carries a WebRTC SDP offer containing every ICE candidate, which needs a WebRTC stack. An MCP tool client has none, and the website live viewer needs an interactive sign-in it cannot complete. Without a session, step-ptz returns PRECONDITION_REQUIRED (428). Then stop: tell the customer plainly that moving this camera needs the Port OS website live viewer, and do not chase a sign-in page or retry. `supportsPTZ` and `supportedPtzStepDirections` describe the camera hardware only; they do not mean this client can move it.

Read [authorization rules](/docs/for-ai/guides/authorization-rules.md) and [async outcomes](/docs/for-ai/guides/using-the-api.md).
