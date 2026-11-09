---
author: Port OS Team
last modified: 2026, october, 23
title: Register an OAuth client with DCR or CIMD
description: Use this guide to register a public OAuth client with dynamic client registration or a client ID metadata document.
guide-id: oauth-client-registration
content-authorship: HUMAN_MIXED_WITH_AI
---

# Register an OAuth client with DCR or CIMD

Start with [discovery](/docs/for-ai/guides/oauth-discovery.md). DCR and CIMD identify a client; they do not sign in a user or grant device access. Both use the same PKCE consent and callback flow and the same token lifecycle as [website based auth](/docs/for-ai/guides/oauth-website-auth.md). Neither can use the device flow. Register by hand when you need a confidential client or the device flow.

## Dynamic client registration

Prefer CIMD where a client supports it. Port OS keeps DCR for clients that already use it.

POST application/json to the discovered registration_endpoint (https://auth.portoperatingsystem.com/oauth/register). Send one JSON document of at most 16 KiB:

```json
{
  "client_name": "My device assistant",
  "redirect_uris": ["https://your-client.example/oauth/callback"],
  "token_endpoint_auth_method": "none",
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "scope": "endpoint:read message:send"
}
```

The same request with curl:

```bash
curl -X POST https://auth.portoperatingsystem.com/oauth/register \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "My device assistant",
    "redirect_uris": ["https://your-client.example/oauth/callback"],
    "token_endpoint_auth_method": "none",
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "scope": "endpoint:read message:send"
  }'
```

Provide one to eight exact redirect_uris. Remote callbacks require HTTPS. Local clients may use exact HTTP callbacks on localhost or literal loopback IPs, such as http://127.0.0.1:8765/callback. All callbacks in a registration must be local or all must be remote; these sets cannot be mixed. No fragments or user information are permitted. Start the local callback listener before authorization. The website's OAuth client page enforces this same callback-set policy.

token_endpoint_auth_method must be none: dynamic registration creates public clients that rely on PKCE and never receive a client_secret. Any other value, including leaving it out, is refused with invalid_client_metadata. Grant types are authorization_code, optionally with refresh_token (both by default), and response_types is code. client_name is limited to 200 characters; a registration without one is named "Unverified OAuth client". software_statement is rejected with unapproved_software_statement.

Success is 201 with client_id, client_id_issued_at and accepted metadata. Supported DCR scopes are endpoint:read, endpoint:write, message:read, message:send, group:read, group:manage, subscription:read and subscription:write. A registration without scope gets all of them, so the client can request any at authorization, where the user's consent decides what the token gets. Request only the task's necessary scopes and check the returned scope. By default, scopes outside this list, such as flow, secret, principal and access-control scopes, are available only to clients you register by hand.

The registration fingerprint is SHA-256 of compact canonical JSON with sorted object keys and sorted redirect_uris, grant_types and response_types arrays, plus client_name, token_endpoint_auth_method and the normalized requested scope. The scope is split on spaces, deduplicated and sorted, so scope order does not matter. Defaults are applied before hashing. Array ordering does not create another client. A matching registration returns the original client ID, issue time, scopes and descriptive metadata, and never overwrites the existing client. A different scope is a different fingerprint, so it gets a new client ID; an existing client's scopes are never widened. Descriptive metadata such as software_id does not change the fingerprint. Fingerprinting is deduplication, not proof of callback ownership or vendor identity.

Default quotas are 1,000 new registrations per rolling day and 10,000 retained registrations. Reuse does not consume new-registration quota. A quota failure returns 429 with Retry-After. An operator can disable new registrations (503) without retiring existing grants. Read the [registration operation](/docs/for-ai/operations/registerDynamicOAuthClient.md) for exact request, response and error schemas.

## Client information metadata documents

A client uses the HTTPS URL of its metadata document as its client_id instead of posting a registration request. This is the client ID metadata document (CIMD) that the authorization server metadata advertises as client_id_metadata_document_supported. Any public HTTPS URL is accepted. It has no query, fragment or user information, and it cannot name localhost, a loopback or private address.

Publish a JSON document at that URL:

```json
{
  "client_id": "https://your-client.example/oauth/client.json",
  "client_name": "My device assistant",
  "redirect_uris": ["https://your-client.example/oauth/callback"],
  "token_endpoint_auth_method": "none"
}
```

The document must answer with HTTP 200, stay under 64 KiB, repeat the same URL as client_id, and include client_name and at least one redirect URI. Every redirect URI must be an exact HTTPS callback. token_endpoint_auth_method is none (the default, a public PKCE client) or private_key_jwt, which also needs token_endpoint_auth_signing_alg of RS256 or ES256 and an HTTPS, non-loopback jwks_uri. Other methods are refused.

Port OS retrieves and validates the document on every authorization attempt; redirects from the metadata fetch are refused. A CIMD client must send the resource parameter at authorization and at refresh ([website based auth](/docs/for-ai/guides/oauth-website-auth.md)). Its grant types are authorization_code and refresh_token. It can request endpoint:read, endpoint:write, message:send, group:read, group:manage, subscription:read and subscription:write; message:read is not granted to CIMD clients. Do not pretend another client's metadata URL belongs to you.

client_name, software_id, software_version and client_uri remain unverified claims. No trusted software-statement issuer is configured. A registration called Muse or Grok does not establish a verified vendor integration or gain additional permissions. Clients you register by hand keep their separately configured client authentication method.
