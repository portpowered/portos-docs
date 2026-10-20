---
name: manage-groups
description: "Use this guide when the customer wants to create a group, change its members or control devices by group."
---

# Manage groups and membership

Use [group operation references](/docs/for-ai/operations/index.md), group:read for discovery and group:manage plus resource policy for changes. Copy full IDs. Names are labels and may not be unique.

Inspect nested membership, preserve relationship meaning and deduplicate targets. Rename, merge, add/remove members only through declared operations. Use documented idempotency and ETags/version checks. On concurrent edits, retrieve current state and resolve the conflict rather than overwrite it. Native media groups and spatial cleaning targets are different concepts; see [vacuum guidance](/docs/for-ai/guides/vacuums.md).

