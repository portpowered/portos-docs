---
name: cameras
description: Use this guide when the customer wants a camera snapshot, a recording or a live stream.
metadata:
  title: Read camera captures and streams
  guide-id: cameras
  capabilities: camera snapshot recordings rtsp-session
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 8
---

# Read camera captures and streams

Camera access requires both the operation scope and authorization for the selected camera/action. A light-control grant does not imply imagery access. Discover camera/snapshot capabilities from [the directory](/docs/for-ai/capability-interfaces.md) and use only declared message schemas.

Prefer an on-demand capture when the user asks for a current image. Validate the returned media URI, timeOfSample and URI expiry. An existing capture may be old even when its download URI is new. Confirm the media is actually retrievable before describing it as viewed. If expired or stale, request a new permitted capture or explain the limitation. Streams require the declared lifecycle/transport, not an invented snapshot API.

Read [authorization rules](/docs/for-ai/guides/authorization-rules.md) and [async outcomes](/docs/for-ai/guides/using-the-api.md).

