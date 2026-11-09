---
author: Port OS Team
last modified: 2026, october, 23
title: Website based auth via authorization code and PKCE
description: Use this guide to sign a user in to Port OS from a website or app with the authorization code flow and PKCE, then exchange, use and refresh the tokens.
guide-id: oauth-website-auth
content-authorship: HUMAN_MIXED_WITH_AI
---

# Website based auth via authorization code and PKCE

Let your website or app call Port OS as a user. The user signs in on Port OS and approves the access your client asks for. Your client then trades a one-time code for tokens. You need a registered OAuth client first; see [Set up an OAuth client for Port OS](/docs/for-ai/guides/oauth-setup.md).

This is the flow ChatGPT, Claude and other web clients use. Port OS requires PKCE (S256) on every authorization code request. Never put a client secret in a browser or mobile app.

## Connection details

| Setting | Value |
| --- | --- |
| Discovery | https://api.portoperatingsystem.com/.well-known/oauth-authorization-server |
| Authorization endpoint | https://auth.portoperatingsystem.com/oauth/authorize |
| Token endpoint | https://auth.portoperatingsystem.com/auth/token |
| Revocation endpoint | https://auth.portoperatingsystem.com/auth/revoke |
| Grant types | authorization_code, refresh_token |
| PKCE | S256 only; `plain` is refused |
| REST resource | https://api.portoperatingsystem.com |
| MCP resource | https://api.portoperatingsystem.com/mcp |

Read the endpoints from discovery instead of copying them, and use the returned values exactly. The authorization server and the API are different origins: the token's audience is the resource, never the auth host.

## 1. Read the discovery document

```bash
curl https://api.portoperatingsystem.com/.well-known/oauth-authorization-server
```

The response lists the endpoints:

```json
{
  "issuer": "https://auth.portoperatingsystem.com",
  "authorization_endpoint": "https://auth.portoperatingsystem.com/oauth/authorize",
  "token_endpoint": "https://auth.portoperatingsystem.com/auth/token",
  "revocation_endpoint": "https://auth.portoperatingsystem.com/auth/revoke",
  "registration_endpoint": "https://auth.portoperatingsystem.com/oauth/register",
  "jwks_uri": "https://auth.portoperatingsystem.com/.well-known/jwks.json",
  "code_challenge_methods_supported": ["S256"],
  "client_id_metadata_document_supported": true,
  "authorization_response_iss_parameter_supported": true
}
```

The document also lists `scopes_supported`. The scopes a client can request are the scopes it was registered with.

## 2. Create the PKCE verifier and challenge

Generate a random verifier of 43 to 128 characters, then send its SHA-256 hash as the challenge. Also generate a random `state`. Keep the verifier and `state` privately until the callback.

```javascript
const base64url = (bytes) => btoa(String.fromCharCode(...bytes))
  .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');

const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
const challenge = base64url(new Uint8Array(await crypto.subtle.digest(
  'SHA-256', new TextEncoder().encode(verifier))));
```

In a shell:

```bash
verifier=$(openssl rand -base64 48 | tr -d '=+/\n' | cut -c1-64)
challenge=$(printf '%s' "$verifier" | openssl dgst -sha256 -binary | openssl base64 -A | tr '+/' '-_' | tr -d '=')
state=$(openssl rand -hex 16)
```

## 3. Send the user to Port OS

Start your callback listener first. Then open the authorization endpoint in the user's browser with these query parameters, percent-encoded:

| Parameter | Value |
| --- | --- |
| `client_id` | Your registered client ID, or your metadata document URL for a CIMD client |
| `redirect_uri` | One of your exact registered callbacks |
| `response_type` | `code` |
| `scope` | Space-separated scopes, a subset of the client's registered scopes |
| `state` | Your random state |
| `code_challenge` | The S256 challenge |
| `code_challenge_method` | `S256` |
| `resource` | `https://api.portoperatingsystem.com` for REST or `https://api.portoperatingsystem.com/mcp` for MCP. Optional (REST is the default) except for CIMD clients, which must send it |

```javascript
const authorizeUrl = new URL('https://auth.portoperatingsystem.com/oauth/authorize');
authorizeUrl.search = new URLSearchParams({
  client_id: 'YOUR_CLIENT_ID',
  redirect_uri: 'https://your-client.example/oauth/callback',
  response_type: 'code',
  scope: 'endpoint:read message:send',
  state,
  code_challenge: challenge,
  code_challenge_method: 'S256',
  resource: 'https://api.portoperatingsystem.com',
}).toString();
window.location.assign(authorizeUrl.href);
```

The user signs in with their Port OS account, reviews the permissions and clicks **Allow**. They can uncheck permissions, so the token may carry fewer scopes than you asked for. Check the `scope` in the token response. Your client cannot approve its own request.

## 4. Validate the callback

Port OS sends the browser to your exact callback:

```text
https://your-client.example/oauth/callback?code=CALLBACK_CODE&state=YOUR_STATE&iss=https%3A%2F%2Fauth.portoperatingsystem.com
```

Before you use the code, check that `state` equals the value you sent and that `iss` equals the discovery `issuer`. If the user clicks **Deny**, the callback carries `error=access_denied` and no `code`. A code is single use and expires after ten minutes.

## 5. Exchange the code for tokens

POST `application/x-www-form-urlencoded` to the token endpoint. Send the same `resource` as in step 3 and the original verifier.

```bash
curl -X POST https://auth.portoperatingsystem.com/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "client_id=YOUR_CLIENT_ID" \
  --data-urlencode "code=CALLBACK_CODE" \
  --data-urlencode "redirect_uri=https://your-client.example/oauth/callback" \
  --data-urlencode "code_verifier=$verifier" \
  --data-urlencode "resource=https://api.portoperatingsystem.com"
```

```javascript
const response = await fetch('https://auth.portoperatingsystem.com/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: 'YOUR_CLIENT_ID',
    code,
    redirect_uri: 'https://your-client.example/oauth/callback',
    code_verifier: verifier,
    resource: 'https://api.portoperatingsystem.com',
  }),
});
if (!response.ok) throw new Error('OAuth code exchange failed');
const tokens = await response.json(); // Store securely. Do not log tokens.
```

The response:

```json
{
  "access_token": "ACCESS_TOKEN_STORE_PRIVATELY",
  "refresh_token": "ROTATING_REFRESH_TOKEN_STORE_PRIVATELY",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "endpoint:read message:send"
}
```

A client registered as confidential, such as a Web Application, must also authenticate here and at refresh with exactly one method: add `client_secret` to the form body (`client_secret_post`), or send an `Authorization: Basic` header made from the client ID and secret (`client_secret_basic`). A public client (a Desktop Application, CLI, DCR or CIMD client) sends no secret and relies on PKCE.

## 6. Call Port OS

Send the access token as a bearer token to the resource you authorized. A REST token works on REST, and an MCP token works on the MCP server, never the reverse.

```bash
curl https://api.portoperatingsystem.com/endpoints \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Device names in the response confirm the connection. Compare them with [Your Devices](https://portoperatingsystem.com/dashboard/).

## 7. Refresh the tokens

Before the access token expires (`expires_in` seconds), POST a refresh request. Send the same `resource`. CIMD clients must send it.

```bash
curl -X POST https://auth.portoperatingsystem.com/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=refresh_token" \
  --data-urlencode "client_id=YOUR_CLIENT_ID" \
  --data-urlencode "refresh_token=ROTATING_REFRESH_TOKEN" \
  --data-urlencode "resource=https://api.portoperatingsystem.com"
```

```javascript
const refreshed = await fetch('https://auth.portoperatingsystem.com/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: 'YOUR_CLIENT_ID',
    refresh_token: tokens.refresh_token,
    resource: 'https://api.portoperatingsystem.com',
  }),
});
const next = await refreshed.json(); // Replace the stored refresh token with next.refresh_token.
```

The response has the same shape as step 5. Refresh tokens rotate: store the new `refresh_token` and stop using the previous one. A refresh can keep the same scopes or narrow them with `scope`; it cannot add any. A used, revoked or expired refresh token cannot be retried. Send the user through step 3 again.

To end a grant, POST `token=<refresh_token>&client_id=<client_id>` to the revocation endpoint. Deleting your stored copy is not server-side revocation.

## If something goes wrong

| Problem | What to do |
| --- | --- |
| `invalid_request` at authorization | Check that every parameter in step 3 is present, that `code_challenge_method` is `S256`, and that `redirect_uri` exactly matches a registered callback. |
| The callback has `error=access_denied` | The user clicked Deny. Ask again only after they agree. |
| `invalid_grant` on exchange | The code was used, expired, or the `code_verifier` or `redirect_uri` differs from the authorization request. Start again at step 2. |
| `invalid_client` | The client ID is unknown, or a confidential client sent no or wrong credentials. A public client must send no secret. |
| `invalid_target` | `resource` does not match the one used at authorization. Do not switch between REST and MCP; authorize the right resource. |
| `403 insufficient_scope` from the API | The grant lacks a scope. Ask the user to approve again with the scope included. |

## References

1. [Set up an OAuth client for Port OS](/docs/for-ai/guides/oauth-setup.md)
2. [Device based auth via code based linking](/docs/for-ai/guides/oauth-device-auth.md)
3. [Token operation](/docs/for-ai/operations/generateToken.md)
4. [Authorize operation](/docs/for-ai/operations/beginOAuthAuthorization.md)
5. [Revoke operation](/docs/for-ai/operations/revokeOAuthGrant.md)
6. [Access rules and scopes](/docs/for-ai/guides/authorization-rules.md)
