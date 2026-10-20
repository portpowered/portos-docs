---
author: Port OS Team
last modified: 2026, october, 8
title: Register an OAuth client with DCR or CIMD
description: Use this guide to register a public OAuth client with dynamic client registration or a client ID metadata document.
guide-id: oauth-client-registration
content-authorship: HUMAN_MIXED_WITH_AI
---

# Register an OAuth client with DCR or CIMD

Start with [discovery](/docs/for-ai/guides/oauth-discovery.md). DCR and CIMD identify a client; they do not sign in a user or grant device access. Both use the same [PKCE consent and callback flow](/docs/for-ai/guides/oauth-consent-and-callback.md) and [token lifecycle](/docs/for-ai/guides/oauth-token-lifecycle.md).

## DCR: public clients

POST application/json to the discovered registration_endpoint:

```json
{"client_name":"My device assistant","redirect_uris":["https://your-client.example/oauth/callback"],"token_endpoint_auth_method":"none","grant_types":["authorization_code","refresh_token"],"response_types":["code"],"scope":"endpoint:read message:send"}
```

Use a callback the client controls. Remote callbacks require HTTPS. Local clients may use exact HTTP callbacks on localhost or literal loopback IPs, such as http://127.0.0.1:8765/callback. All callbacks in a registration must be local or all must be remote; these sets cannot be mixed. No fragments or user information are permitted. Start the local callback listener before authorization. The website's client-management interface enforces this same callback-set policy.

Success is 201 with client_id, client_id_issued_at and accepted metadata. Public clients get no client_secret. Supported DCR scopes are endpoint:read, endpoint:write, message:read, message:send, group:read, group:manage, subscription:read and subscription:write. The default is endpoint:read. Request only the task's necessary scopes and check the returned scope. Broader static-client scopes are outside this anonymous profile.

The registration fingerprint is SHA-256 of compact canonical JSON with sorted object keys and sorted redirect_uris, grant_types and response_types arrays, plus client_name and token_endpoint_auth_method. Defaults are applied before hashing. Array ordering does not create another client. A matching registration returns the original client ID, issue time, scopes and descriptive metadata. It never overwrites the existing client or expands scopes, even if scope or software_id differs in the new request. Fingerprinting is deduplication, not proof of callback ownership or vendor identity.

Default quotas are 1,000 new registrations per rolling day and 10,000 retained registrations. Reuse does not consume new-registration quota. A quota failure returns 429 with Retry-After. An operator can disable new registrations without retiring existing grants. Read the [registration operation](/docs/for-ai/operations/registerDynamicOAuthClient.md) for exact request, response and error schemas.

## CIMD: metadata clients

A CIMD client uses its HTTPS metadata URL as client_id instead of posting a DCR request. Any HTTPS metadata URL is accepted. Port OS retrieves and validates that client metadata on every authorization attempt, including its exact HTTPS callbacks and public PKCE profile. Loopback, private and link-local metadata hosts and redirects from the metadata fetch are refused. Do not pretend another client's metadata URL belongs to you.

Client_name, software_id, software_version and client_uri remain unverified claims. No trusted software-statement issuer is configured; software_statement is rejected. A registration called Muse or Grok does not establish a verified vendor integration or gain additional permissions. Static confidential clients retain their separately configured client authentication method.
