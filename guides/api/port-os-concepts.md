---
author: Port OS Team
last modified: 2026, october, 8
title: Port OS concepts
description: "Use this guide to learn the Port OS vocabulary: endpoints, capabilities, groups and permissions."
guide-id: port-os-concepts
content-authorship: HUMAN_MIXED_WITH_AI
---

# Port OS concepts

A principal is an account identity governed by authorization rules. An endpoint is the stable device abstraction you query and address by full ID. Plugin routes provide ways to reach device functionality; multiple routes can contribute to one endpoint. A capability declares supported messages and observations with a namespace and version. A message combines that capability header with a schema-valid body.

Endpoints belong to groups; groups may be nested. Group/room names help selection but are not unique identity. Use full IDs and context. Deduplicate nested membership. Sharing expands only the resources/actions explicitly granted to the current principal.

The normal flow is discovery → capability schema → authorized message → observation. The [API guide](/docs/for-ai/guides/using-the-api.md) explains transport, and [the capability directory](/docs/for-ai/capability-interfaces.md) supplies contracts. Public guides describe supported devices; retired hosted task/filesystem features are outside this setup.

