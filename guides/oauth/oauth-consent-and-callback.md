---
author: Port OS Team
last modified: 2026, october, 9
title: Obtain user consent and validate the OAuth callback
description: Use this guide to send the customer to consent and to validate the callback before exchanging the code.
guide-id: oauth-consent-and-callback
content-authorship: HUMAN_MIXED_WITH_AI
---

# Obtain user consent and validate the OAuth callback

Use the endpoints and resource from [discovery](/docs/for-ai/guides/oauth-discovery.md) and the client ID and exact callback from [registration](/docs/for-ai/guides/oauth-client-registration.md). These steps are identical for DCR and CIMD, REST and MCP; the chosen resource is the transport-specific input.

`resource` is optional. Omitting it selects the canonical REST audience (the authorization-server issuer). For MCP, supply its discovered `/mcp` resource explicitly. Token exchange and refresh can omit `resource` and inherit the audience bound to the authorization code or refresh token. Explicit mismatches are rejected as `invalid_target`.

1. Start the callback handler the client controls. For a loopback callback, bind its listener locally before opening authorization.
2. Generate a cryptographically random PKCE verifier of 43–128 permitted characters. Compute code_challenge = BASE64URL(SHA256(verifier)), without padding. Generate a separate random state and retain both in this authorization attempt.
3. Open the discovered authorization_endpoint with the following query parameters. Percent-encode parameter values; do not append raw callback URLs or scopes into an unescaped query.

```text
client_id=<registered ID or supported CIMD metadata URL>
redirect_uri=<exact registered callback>
response_type=code
scope=<requested subset of the client's accepted scopes>
resource=<chosen canonical REST or MCP resource>
state=<random client state>
code_challenge=<S256 challenge>
code_challenge_method=S256
```

For REST, use the `resource = authorizationServer.issuer` value retained from discovery. Construct the URL rather than writing an alias into a template. This JavaScript fragment assumes `clientId`, `redirectUri` and `acceptedScope` come from your registration response and callback configuration:

```javascript
const base64url = bytes => btoa(String.fromCharCode(...bytes))
  .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
const challenge = base64url(new Uint8Array(await crypto.subtle.digest(
  'SHA-256', new TextEncoder().encode(verifier))));
const authorizationURL = new URL(authorizationServer.authorization_endpoint);
authorizationURL.search = new URLSearchParams({
  client_id: clientId, redirect_uri: redirectUri, response_type: 'code',
  scope: acceptedScope, resource, state,
  code_challenge: challenge, code_challenge_method: 'S256',
}).toString();
// Retain verifier, state and authorizationServer.issuer privately until callback validation.
// Open authorizationURL.href in the user's browser; wait for their consent.
```

The user signs in on Port OS and reviews the requested permissions. Pause for the user; an agent must not approve its own grant, request passwords or manufacture a production sign-in identity. Local functional tests substitute an existing signed fixture identity at this boundary without changing production sign-in.

After approval, the consent page navigates to a one-time Port OS continuation.
That endpoint returns HTTP 302 Found with the exact registered callback in
Location, carrying code, original state and iss. Denial uses the same 302 handoff
with access_denied instead of a code. The authenticated consent fetch returns
200 JSON only for the intermediate continuation; it must be followed by document
navigation, not another fetch. Continuations expire after two minutes and are
single-use. They require no login token and cannot be used to approve consent.

Reject a callback whose state or issuer does not match this attempt. Treat an
error callback as a denied or failed authorization, not a code. Codes and pending
consent expire after ten minutes and are single-use. Do not paste codes,
continuation references or credentials into shared chat or logs. Continue with
[code exchange and token lifecycle](/docs/for-ai/guides/oauth-token-lifecycle.md).

For hosted-client acceptance, preserve the browser network log and approve a
fresh request. Verify the document request to /oauth/authorization-response
returns 302, the next GET reaches the registered client callback, and the client
posts its code and original PKCE verifier to the discovered token endpoint.
Repeat with Deny and verify access_denied without a code. Backend functional and
website browser tests cover these boundaries against an isolated callback;
compatibility with a specific hosted client still requires that live trace.
