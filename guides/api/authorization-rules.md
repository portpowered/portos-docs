---
author: Port OS Team
last modified: 2026, october, 24
title: Set up access rules for Port OS
description: Use this guide to grant a person or an AI access to a device with an access control rule, and to understand how token scopes and access control rules decide whether a request is allowed.
guide-id: authorization-rules
content-authorship: HUMAN_MIXED_WITH_AI
---

# Set up access rules for Port OS

This guide explains how authorization works in Port OS. After you read this page, you will know how to set up an access control rule that grants a person or an AI permission to use a resource in Port OS.

Port OS uses two checks to decide whether an AI or a person can use a resource. A request must pass both.

1. Token scopes
2. Access control rules

## Token scopes

1. A token scope is a fixed value that names a kind of operation a token may perform. When you connect an AI or an application, you approve the scopes it receives, and the token can never do more than those scopes allow.
2. For example, `endpoint:read` lets the token view your authorized devices and their state. Port OS has a set of token scopes, one for each kind of work. See the scope list in the Authentication section of the [HTTP reference](https://portoperatingsystem.com/api/#authentication) for every scope and what it allows.

A scope is a ceiling, not a grant. A scope never shares a device, and owning a device does not override a token that lacks the scope. The scope check runs first, then the access control rules. MCP tools need the same scopes as the REST operation that does the same work.

## Access control rules

1. Access control rules grant permissions on resources, for example to let a person see the state of one of your devices. In this guide you grant Bob permission to see whether your lock is closed.
2. Allow and deny work one way. Port OS denies every request unless a rule allows it. The `effect` of every rule is `ALLOW`; there are no deny rules. To remove access, delete the rule.
3. A rule has four parts: the resource it applies to, the principal it grants access to, the action the principal may take, and conditions on the context of the request. The API names the principal `identity` and the action `operation`.
4. You own your devices, so you can already use them. Rules grant access to other people and AIs.
5. Manage rules as the signed-in owner. The rule operations are not part of the delegated device API, so a token that an AI received through OAuth cannot call them.

| Part | Field | Example |
| --- | --- | --- |
| Resource | `resource` | `port1/principals/example-owner/endpoints/example-lock` |
| Principal | `identity` | `port1/principals/example-bob` |
| Action | `operation` | `port1/systems/zero/operations/endpoint-read` |
| Context | `conditions` | `[]`, a list of up to four conditions |

Port OS identifies principals and resources with ids that start with `port1/`. A principal is `port1/principals/<principal id>`. An endpoint, which is how Port OS names a device, is `port1/principals/<owner's principal id>/endpoints/<endpoint id>`. Copy the full endpoint id from [Your Devices](https://portoperatingsystem.com/dashboard/); device names can repeat. The examples below use obvious placeholder ids: replace `example-owner`, `example-lock` and `example-bob` with real ones.

## Grant Bob read access to the lock

To let Bob see the lock, set the resource to the lock, the principal to Bob, and the action to `endpoint-read`. Reading an endpoint includes its state. Send this request as the signed-in owner with the [upsert access control rule](/docs/for-ai/operations/upsertAccessControlRule.md) operation, `POST /access-control-rules`:

```json
{
  "effect": "ALLOW",
  "operation": "port1/systems/zero/operations/endpoint-read",
  "resource": "port1/principals/example-owner/endpoints/example-lock",
  "identity": "port1/principals/example-bob"
}
```

The response carries the id of the rule and an `ETag` header. The id looks like `port1/principals/example-owner/access-control-rules/example-rule`. Keep it: you need it to delete the rule. After the rule exists, Bob can read the lock.

Bob can do nothing else with the lock. To let him lock and unlock it, grant `port1/systems/zero/operations/endpoints-message-send` the same way. A person who can read a lock cannot read your camera; each resource and action needs its own rule.

## Check that the rule works

Ask Port OS whether Bob is allowed, with the [evaluate access control rule](/docs/for-ai/operations/evaluateAccessControlRule.md) operation, `POST /access-control-rules/evaluate`. You can evaluate another principal's access on a resource when you may grant that access yourself. All four of `operation`, `requesterContext`, `resourceContext` and `entities` are required; `entities` may be empty.

```json
{
  "operation": "port1/systems/zero/operations/endpoint-read",
  "requesterContext": {
    "requesterId": "port1/principals/example-bob"
  },
  "resourceContext": {
    "resourceId": "port1/principals/example-owner/endpoints/example-lock"
  },
  "entities": []
}
```

The response is `{"result": "ALLOW"}` when a rule permits the request and `{"result": "DENY"}` when none does. You can also list your rules with [get access control rules](/docs/for-ai/operations/getAccessControlRules.md), `GET /access-control-rules`, and filter by `resource`, `identity` or `operation`. To remove the access, call [delete access control rule](/docs/for-ai/operations/deleteAccessControlRule.md) with the rule id as the path, for example `DELETE /port1/principals/example-owner/access-control-rules/example-rule`.

## Narrow a rule with conditions

Now make the rule harder to misuse. Conditions test the context of the request, and a rule applies only when every one of its conditions matches. Listing several conditions therefore combines them with AND; there is no OR. Each condition has a `key`, the only `comparator` `EQUALS`, and a `value`. A key may appear once per rule. The keys are:

| Key | Matches | Value |
| --- | --- | --- |
| `TARGET_OPERATION` | The action a rule being written would grant | An operation id, such as `port1/systems/zero/operations/endpoint-read` |
| `TARGET_IDENTITY_KIND` | Whether a rule being written names one principal or a pattern | `EXACT` or `WILDCARD` |
| `AUTH_VARIANT` | The authorization variant being used to link an account | A lowercase id, such as `customer-oauth` |
| `REGIONALIZATION` | The regionalization of the account being linked | A lowercase id, such as `global` |

Conditions are accepted on only three actions. `access-control-rule-write` and `access-control-rule-delete` take all four keys. `plugin-establish-link` takes `AUTH_VARIANT`, which it requires, and `REGIONALIZATION`. A rule for any other action, such as `endpoint-read`, is rejected with a 400 error if it carries a condition.

Conditions cannot test the time of the request, so a rule cannot expire by itself. To give Bob access for a few days, create the rule now and delete it when the time is up.

As an example, say first that Bob can read the lock, which is the rule you created above. Now you want a second step: let Bob share the lock, but only read access, and only with one named person at a time. Bob should not be able to give anyone the right to unlock it, and he should not be able to share it with everyone.

Sharing means writing a rule, so grant Bob `access-control-rule-write` on the lock. Add two conditions to limit which rules he may write. `TARGET_OPERATION` is `endpoint-read`, so Bob can create rules only for reading. `TARGET_IDENTITY_KIND` is `EXACT`, so every rule Bob creates must name one principal and never a pattern. Both conditions must match, so this is an AND:

```json
{
  "effect": "ALLOW",
  "operation": "port1/systems/zero/operations/access-control-rule-write",
  "resource": "port1/principals/example-owner/endpoints/example-lock",
  "identity": "port1/principals/example-bob",
  "conditions": [
    {
      "key": "TARGET_OPERATION",
      "comparator": "EQUALS",
      "value": "port1/systems/zero/operations/endpoint-read"
    },
    {
      "key": "TARGET_IDENTITY_KIND",
      "comparator": "EQUALS",
      "value": "EXACT"
    }
  ]
}
```

To check it, evaluate `access-control-rule-write` for Bob with an `operationContext` that describes the rule he wants to write. `{"targetOperation": "port1/systems/zero/operations/endpoint-read", "targetIdentityKind": "EXACT"}` returns `ALLOW`. Changing `targetIdentityKind` to `WILDCARD` returns `DENY`.

## When a request is denied

| What you see | What it means | What to do |
| --- | --- | --- |
| 401, or an expired or revoked token | The token is not valid | Sign in again, or renew the token |
| 403 `insufficient_scope` | The token lacks a scope, and the error names it | Ask the person to approve the scope. An MCP connection approved before a scope existed must be approved again |
| 403 or `DENY` on a device the token can otherwise see | A scope allows the operation but no rule does | The owner creates the rule for that resource and action |
| 400 saying rules support only the `ALLOW` effect | The request used `effect` `DENY` | Remove the rule instead |
| 400 about a condition | The action does not take conditions, or the key or value is invalid | Use a condition from the table above on a supported action |
| 412 `PRECONDITION_FAILED` | The `If-Match` etag is stale | Read the rule again and retry |

Never fix a denial by switching principals or by requesting unrestricted credentials. An authorized light does not imply camera access, and a generic power-capable plug is not automatically a light. For a group request, evaluate each selected target and report denied or unresolved members separately. Keep identifiers of resources the caller cannot see out of diagnostics. A provider sign-in failure that needs the account relinked is not an access rule denial; see [troubleshooting](/docs/for-ai/guides/troubleshooting.md).

For the exact request and response schemas, see the [operation pages](/docs/for-ai/operations/index.md) and the [machine-readable authorization metadata](/docs/references/authorization.yaml).
