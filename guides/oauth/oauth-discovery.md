---
author: Port OS Team
last modified: 2026, october, 9
title: Discover the OAuth server and choose REST or MCP
description: Use this guide to discover the OAuth server for Port OS and choose between the REST API and MCP.
guide-id: oauth-discovery
content-authorship: HUMAN_MIXED_WITH_AI
---

# Discover the OAuth server and choose REST or MCP

This discovery step is shared by every client. The API is https://api.portoperatingsystem.com and the authorization server is https://auth.portoperatingsystem.com. Fetch the API's /.well-known/oauth-authorization-server document anonymously. Read issuer, authorization_endpoint, token_endpoint, registration_endpoint, revocation_endpoint and scopes_supported. Use the returned auth endpoints exactly. The issuer and API resource have different origins; do not use the auth issuer as the API destination or token audience. Port OS exposes OAuth authorization-server metadata here; it does not advertise OpenID Connect discovery or issue OpenID Connect ID tokens.

| Interface | API destination | OAuth resource |
| --- | --- | --- |
| REST | https://api.portoperatingsystem.com plus the documented operation path | https://api.portoperatingsystem.com |
| MCP | https://api.portoperatingsystem.com/mcp, Streamable HTTP | The resource returned by /.well-known/oauth-protected-resource/mcp |

An MCP connector can start at https://api.portoperatingsystem.com/mcp and follow its WWW-Authenticate resource_metadata URL. Fetch that public metadata and the authorization server it names. MCP initialization alone does not prove that the account's devices are accessible. Never use a REST token on MCP or an MCP token on REST.

Choose the transport before authorizing. Omitting resource at authorization selects REST. Supply the discovered resource explicitly to select MCP. Code exchange and refresh may omit resource and inherit the grant audience; an explicit resource must stay unchanged. If a REST request fails because you authorized the MCP resource (or the reverse), obtain a new user authorization for the correct resource. Refresh cannot change the token's audience.

Choose one supported [client registration method](/docs/for-ai/guides/oauth-client-registration.md), then follow the same [consent and callback steps](/docs/for-ai/guides/oauth-consent-and-callback.md). If metadata omits registration_endpoint, new DCR registration is unavailable; do not guess a replacement endpoint or silently switch to another client's credentials.

See [scopes and resource rules](/docs/for-ai/guides/authorization-rules.md). Authorization-server scopes_supported describes server vocabulary; a particular client's accepted scopes can be narrower.

## Carry discovery values into every request

This JavaScript fragment initializes a REST connection. Keep `authorizationServer` and `resource` for the consent and token examples; the API base is the protected resource, independently of the discovered auth issuer.

```javascript
const apiBase = 'https://api.portoperatingsystem.com';
const response = await fetch(apiBase + '/.well-known/oauth-authorization-server');
if (!response.ok) throw new Error('OAuth discovery failed');
const authorizationServer = await response.json();
const resource = apiBase;
```

For MCP, assign `resource` from the protected-resource metadata's `resource` field instead. Keep the auth issuer separate from the API resource. A wrong `resource` can produce an `invalid_target` error callback even when client registration succeeded.
