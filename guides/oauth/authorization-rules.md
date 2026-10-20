---
author: Port OS Team
last modified: 2026, october, 14
title: Scopes and authorization rules
description: Use this guide to choose scopes and understand which resource permissions a request needs.
guide-id: authorization-rules
content-authorship: HUMAN_MIXED_WITH_AI
---

# Scopes and authorization rules

Authentication establishes the principal and client. OAuth scopes bound the user's delegated authority; resource rules decide which selected resources and actions that principal may access. A scope is not an ownership or sharing grant.

For delegated REST grants, Port OS verifies token signature, expiry, issuer, REST audience, access-token type and active grant, then checks the operation's scope before existing service resource-policy evaluation. MCP tokens have a separate /mcp audience and cannot be reused on REST. A refresh token is never an API bearer credential.

| Task | Scope |
| --- | --- |
| Enumerate or query endpoints/routes | endpoint:read |
| Modify endpoints/routes | endpoint:write |
| Send a device message | message:send |
| Read groups and relationships | group:read |
| Manage group membership | group:manage |
| Read subscriptions | subscription:read |
| Create/update/delete subscriptions | subscription:write |

MCP uses the same scopes as the REST operation that does the same work. Listing, inspecting or discovering subscribable events (`subscription_list`, `subscription_inspect`, `events/list`) needs subscription:read. Subscribing, unsubscribing, cancelling or relabelling (`events/subscribe`, `events/unsubscribe`, `subscription_cancel`, `subscription_label_edit`) needs subscription:write. Subscribing to a device's events does not need endpoint:read; whether the principal may see the source endpoint is a resource rule. Task guides and capability reference documents need only a valid MCP token. A call without the needed scope gets 403 `insufficient_scope` naming the scope to request. An MCP connection approved before these scopes existed must be re-approved to get them; its existing event deliveries continue.

Other operations are outside the anonymous DCR device profile and fail closed. [Operation pages](/docs/for-ai/operations/index.md) expose exact credential alternatives and resource requirements. [Machine-readable authorization metadata](/docs/references/authorization.yaml) links the contract.

The existing resource engine converts principal, action, resource and entity data into Cedar requests. Default owner rules and applicable sharing/conditional rules are evaluated; only an Allow outcome admits access. The typed operation IDs come from Port OS's policy action catalog, not invented dotted action names. Owning an endpoint does not override a delegated token's missing scope.

A token with endpoint:read can enumerate permitted lights but cannot dispatch a command. Adding message:send permits dispatch only to endpoints that the signed-in principal's rules allow. An authorized light does not imply camera access. A generic power-capable plug is not automatically a light. For a group request, evaluate the selected targets and report denied or unresolved members separately.

An invalid/expired/revoked token needs renewed authentication. A scope denial requires the user to approve the needed scope. A resource denial requires the owner to grant the appropriate resource/action access. Never fix denial by switching principal, requesting unrestricted credentials or retrying blindly. Provider authentication failures can require account relinking; they are different from Port OS policy denial. Keep inaccessible resource identities out of diagnostics.

See [troubleshooting](/docs/for-ai/guides/troubleshooting.md).

