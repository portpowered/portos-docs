---
author: Port OS Team
last modified: 2026, october, 9
title: Authentication and dynamic client registration
description: Use this guide for the complete walkthrough from discovery to token refresh when you connect a new REST client.
guide-id: authentication-and-dcr
content-authorship: HUMAN_MIXED_WITH_AI
include-guides:
  - oauth-discovery
  - oauth-client-registration
  - oauth-consent-and-callback
  - oauth-token-lifecycle
  - authorization-rules
---

# Authentication and dynamic client registration

All supported agents use the same OAuth components. REST and MCP select different protected resources; DCR and CIMD select different registration methods. Neither product branding nor registration grants device access.

Choose one reading path. This complete walkthrough already includes discovery, registration, consent, token lifecycle and authorization rules below; you do not need to fetch those component links again. If your connector already implements some steps, read only the missing components instead. Both paths use the same canonical instructions.

For REST, use the discovered issuer as the OAuth resource. For MCP, use the MCP protected-resource metadata. Keep that choice through authorization, exchange and refresh. If you chose the wrong transport, start a new authorization flow for the correct resource; refresh does not switch audiences.

Walkthrough steps (the linked components are also included below):

1. [Discover endpoints and choose REST or MCP](/docs/for-ai/guides/oauth-discovery.md).
2. [Register with DCR or supported CIMD](/docs/for-ai/guides/oauth-client-registration.md). Remote callbacks require HTTPS; local callback registrations contain only localhost/loopback callbacks. Repeated canonical fingerprints reuse the original public client without expanding scopes.
3. [Obtain user consent and validate the callback](/docs/for-ai/guides/oauth-consent-and-callback.md). PKCE S256 is required. Pause for the user to sign in and approve access.
4. [Exchange, refresh and revoke tokens](/docs/for-ai/guides/oauth-token-lifecycle.md). Keep the same canonical resource through authorization, exchange and refresh.
5. [Verify the connection](/docs/for-ai/guides/first-setup.md), then use [the REST quickstart](/docs/for-ai/guides/quickstart.md) or your client's MCP tools.

Read [authorization rules](/docs/for-ai/guides/authorization-rules.md) for scopes, principal/resource policies, sharing and denial diagnosis. Never ask for a Google password, paste credentials into chat, or approve the agent's own grant. Claimed client names such as Muse and Grok remain unverified.

