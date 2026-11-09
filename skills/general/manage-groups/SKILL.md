---
name: manage-groups
description: Use this guide when the customer wants to create a group, change its members or control devices by group.
metadata:
  title: Manage groups and membership
  guide-id: managing-groups
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 25
---

# Manage groups and membership

Read with `group_query` (`group:read`); change with `group_manage` (`group:manage`
plus resource permission). Keep full IDs and account; clarify ambiguous names.

1. Inspect nested membership, preserve relationships and deduplicate endpoints.
2. Use declared rename, merge and membership operations, current etags and documented
   idempotency. After conflicts, reread and resolve; never overwrite.
3. Before any `group_manage` change, read
   [Provider synchronization and outcomes](/docs/for-ai/guides/provider-group-sync.md)
   including its move example. If it cannot be opened, these rules are enough to proceed:
   create, delete, member changes, move and rename default to `providerSync: BEST_EFFORT`;
   `MERGE_INTO`, `SET_ENABLEMENT` and `SET_GROUP_ROUTE_ENABLEMENT` accept only
   `PORTOS_ONLY`; every reference to a group uses its current etag; and a batch is saved
   when it is `COMMITTED` or `PARTIALLY_SUCCEEDED`. Confirm the exact groups before
   `DELETE_GROUP` or `MERGE_INTO`.

Native media groups and spatial cleaning targets differ; see
[vacuum guidance](/docs/for-ai/guides/vacuums.md).
