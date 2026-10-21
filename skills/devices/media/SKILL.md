---
name: media
description: Use this guide when the customer wants to play, pause or search audio, set the volume or launch content on a media device.
metadata:
  title: Control media playback
  guide-id: media
  capabilities: media-player media-playlist media-search speaker content-launcher
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 8
---

# Control media playback

Enumerate permitted media endpoints and inspect declared playback, volume and content-launcher capabilities in [the capability directory](/docs/for-ai/capability-interfaces.md). Select endpoint or native media group only when its declarations support the requested operation. Use [REST dispatch](/docs/for-ai/guides/quickstart.md) with the exact message/payload/version.

Absolute volume and relative volume changes have different retry behavior. Validate units/ranges. After dispatch, query fresh playback/volume observations. Accepted playback is not proof of audible output. On lost relative-command responses, recover the result/read back or report unknown; do not apply the increment twice.

