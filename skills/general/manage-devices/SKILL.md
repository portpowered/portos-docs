---
name: manage-devices
description: Use this guide when the customer wants to rename a device, change its availability or find it by name.
metadata:
  title: Manage device names and availability
  guide-id: managing-devices
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 8
---

# Manage device names and availability

Select the exact endpoint and read [its management operation](/docs/for-ai/operations/index.md). Rename, enable/disable, delete or synchronize only where the published operation and device/provider support it. Use endpoint:write plus the required resource rule; control scope alone is insufficient.

Do not disable or delete a device merely because it is confusing or unavailable. Explain the effect and follow the user's intent. Apply documented ETag/version preconditions, inspect conflicts and preserve newer edits. If a response says the edit committed with cleanup pending, read back state before retrying. See [groups](/docs/for-ai/guides/managing-groups.md) and [troubleshooting](/docs/for-ai/guides/troubleshooting.md).

