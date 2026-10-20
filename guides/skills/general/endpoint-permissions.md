---
author: Port OS Team
last modified: 2026, october, 16
title: Grant permissions to endpoints
description: Use this guide when the customer wants to decide who or what may read or control a device.
skill-id: grant-endpoint-permissions
guide-id: endpoint-permissions
content-authorship: HUMAN_MIXED_WITH_AI
---

# Grant permissions to endpoints

Give a user or agent access to a selected device. You must own the endpoint or have permission to manage its access.

## Choose the resource and principal

1. Open [Your Devices](https://portoperatingsystem.com/dashboard/) and select the endpoint.
2. Copy its full endpoint ID. Device names can repeat.
3. Identify the principal that needs access. A principal is the user or agent identity that Port OS checks when it receives a request.

## Grant the required actions

Read the existing rules with [Get access control rules](/docs/for-ai/operations/getAccessControlRules.md). Use [Upsert an access control rule](/docs/for-ai/operations/upsertAccessControlRule.md) to grant the selected principal only the actions it needs on the full endpoint ID. Follow the operation's policy schema and action identifiers; do not use a display name as a resource ID. For example, allow endpoint discovery for reading, and message sending for control. See [Access rules](/docs/for-ai/guides/authorization-rules.md) for policy evaluation and required OAuth scopes.

## Check and remove access

Test with the receiving account or agent. Confirm it can use the intended endpoint. Remove the grant when access is no longer needed.

A scope error requires a new OAuth approval with the required scope. A resource denial requires the owner to change the resource grant. Adding a scope alone does not share a device.
