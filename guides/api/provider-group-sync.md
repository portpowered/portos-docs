---
author: Port OS Team
last modified: 2026, october, 25
title: Sync provider groups
description: Use this guide to choose provider synchronization policy, move group members and interpret partial outcomes before changing native provider groups.
guide-id: provider-group-sync
content-authorship: HUMAN_MIXED_WITH_AI
---

# Sync provider groups

For discovery and routine organization, start with [Manage groups and membership](/docs/for-ai/guides/managing-groups.md). Read this protocol before changing native provider groups.

Use `group_query` to discover groups and `group_manage` to organize them. Reading needs
`group:read`; changes need `group:manage` and the relevant resource permission. Copy full
IDs and preserve the account that returned them. Clarify ambiguous names before writes.
Native media groups and spatial cleaning targets differ; see
[vacuum guidance](/docs/for-ai/guides/vacuums.md).

## Change a room or its membership

1. Read the source and destination groups, their members and their current etags with
   `group_query`. Inspect nested membership and deduplicate endpoint IDs.
2. Use declared `group_manage` operations. Every reference to one group in the batch uses
   the same starting etag. Use `MOVE_MEMBER`, with `memberEndpointId`, `source` and
   `target` references, to move a member between groups; both groups must be authorized.
   An add cannot silently remove a member from an exclusive native group elsewhere.
3. Submit compatible intent. An add and remove of the same member in one group or
   conflicting renames return 400; operation order cannot resolve contradictory edits.
   `validateOnly: true` plans and authorizes without sending messages or saving changes.
4. Use a unique `idempotencyKey` for the intended change. After a lost or uncertain
   response, retry only the identical request with that same key. On an etag conflict,
   read current state and resolve the conflict before issuing a new change.

For a move, replace these example IDs and etags with the exact values returned by the
queries. Use the same source or target starting etag in any other reference to that group:

```json
{
  "idempotencyKey": "move-lamp-to-study",
  "operations": [{
    "requestId": "move-lamp",
    "operation": "MOVE_MEMBER",
    "memberEndpointId": "port1/principals/example/endpoints/lamp",
    "source": {
      "groupId": "port1/principals/example/endpoint-groups/living-room",
      "etag": "\"4\""
    },
    "target": {
      "groupId": "port1/principals/example/endpoint-groups/study",
      "etag": "\"2\""
    },
    "providerSync": "BEST_EFFORT"
  }]
}
```

Create, delete, add/remove members, move and rename default to `BEST_EFFORT` for
`providerSync`: supported provider changes run first and return confirming readback, then
Port OS saves the customer's intent. A failed provider action falls back locally.
`PORTOS_ONLY` sends no provider messages. `FAIL_ON_PROVIDER_ERROR` fails customer intent
when a required provider action fails, but received provider facts remain saved. Neither
mode rolls back an action already performed by a provider. `MERGE_INTO`, `SET_ENABLEMENT`
and `SET_GROUP_ROUTE_ENABLEMENT` accept only `PORTOS_ONLY`.

Inspect the envelope and each operation result. `COMMITTED` means the customer batch
saved; `PARTIALLY_SUCCEEDED` means it saved with a provider fallback; `FAILED` means
customer intent did not commit. Results are `APPLIED`, `PARTIALLY_APPLIED` or
`NOT_APPLIED`, with `providerDispatches` explaining native outcomes. A failed batch can
still have changed the provider: sent operations appear as `NOT_APPLIED` without a group
etag. Report that distinction and do not automatically repeat native writes.
`NOT_SUPPORTED`/`NOT_DECLARED` is not itself partial failure. `OUTSIDE_PRINCIPAL` means
no native change was attempted through another principal's account; authorized local
intent can still apply.

## Delete, disable or merge

Get explicit authorization for the exact groups and effects before `DELETE_GROUP` or
`MERGE_INTO`. Deleting a group may delete its native provider groups. Any route not
confirmed retired is disabled and orphaned; rediscovery cannot recreate the deleted
aggregate from that route. Disabling an aggregate with `SET_ENABLEMENT` preserves it.
Use `SET_GROUP_ROUTE_ENABLEMENT` to change one route's contribution locally; an attached
route requires its group's etag. Recover a retained orphan by explicitly re-enabling
its authorized route, then use `MOVE_MEMBER` when exclusive membership requires it.

Discovery can combine similarly normalized names within one principal, across providers
and accounts. Renaming an established group never automatically merges it. Use
`MERGE_INTO` for an intentional merge; it does not merge the vendors' native resources.

## Provider limits

Philips Hue supports native group creation, deletion, membership changes and rename.
Hue rooms have exclusive membership; zones do not. Roborock supports room rename only:
Port OS membership edits do not split, merge or delete robot map segments. Sonos native
group mutation is not implemented in this release. Declared support and returned
dispatch outcomes remain authoritative; a Port OS-only edit does not prove vendor state
changed. Use `control` for device actions, rather than group inventory changes.
