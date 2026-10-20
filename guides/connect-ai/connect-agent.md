---
author: Port OS Team
last modified: 2026, october, 8
title: Connect any supported agent to Port OS
description: Use this guide to connect a supported AI agent to Port OS and to copy the setup prompt.
guide-id: connect-agent
content-authorship: HUMAN_MIXED_WITH_AI
---

# Connect any supported agent to Port OS

Use these common components for Muse, Grok, Claude, a custom REST agent or an MCP connector. The product name does not change the authorization protocol or permissions. Check your client's current capabilities before assuming it supports a particular registration method.

For a new REST connection, read the [complete authentication walkthrough](/docs/for-ai/guides/authentication-and-dcr.md), then the [REST quickstart](/docs/for-ai/guides/quickstart.md). The walkthrough includes the OAuth components in the table below; you can skip their separate files. For an existing connector, use the table to read only the component you need. This directory is a set of alternatives, not a checklist of required downloads.

Copy this prompt into a client that can retrieve public documents:

> Read https://portoperatingsystem.com/docs/for-ai/guides/connect-agent.md. Discover Port OS authentication, choose REST or MCP and a registration method supported by this client, and help me connect. Pause for me to sign in and approve the requested access, then list only devices I can access. Do not claim device control until its result is observed.

| Component | Input | Result |
| --- | --- | --- |
| [Discovery and transport](/docs/for-ai/guides/oauth-discovery.md) | Public API/MCP URL | The sign-in server address, its endpoints, and the REST and MCP resource URLs |
| [DCR or CIMD registration](/docs/for-ai/guides/oauth-client-registration.md) | Client-supported method and controlled callback | Client identity and accepted profile, without device access |
| [User consent and callback](/docs/for-ai/guides/oauth-consent-and-callback.md) | Client ID, callback, resource and least scopes | Validated one-use authorization code |
| [Token lifecycle](/docs/for-ai/guides/oauth-token-lifecycle.md) | Code and original PKCE verifier | Scoped access, refresh rotation and revocation |
| [Authorization rules](/docs/for-ai/guides/authorization-rules.md) | Token scopes and customer's permissions | Effective authority and an explanation of denials |
| [First setup](/docs/for-ai/guides/first-setup.md) | Authorized connection | Device discovery and one safe verification |

An MCP-capable client normally manages OAuth and secure token storage itself; supply the MCP URL and complete its consent flow. A REST agent needs an execution environment with HTTP requests, a real callback listener, cryptographic random generation and secure token storage. If the client cannot receive a callback or securely retain credentials, explain the missing capability instead of inventing a bypass.

Client-specific screens can provide UI settings or support notes and link to this table. They must not maintain their own copies of DCR, PKCE, scope, callback or revocation instructions. Actual client/version compatibility and vendor identity require separate validation; the shared guide makes no verified Muse/Grok claim.
