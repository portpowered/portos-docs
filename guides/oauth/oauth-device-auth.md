---
author: Port OS Team
last modified: 2026, october, 23
title: Device based auth via code based linking
description: Use this guide to sign in a device or CLI that has no browser with the device authorization grant, a DPoP proof and a short code the user approves on another screen.
guide-id: oauth-device-auth
content-authorship: HUMAN_MIXED_WITH_AI
---

# Device based auth via code based linking

Let a device, CLI or TV app with no easy browser call Port OS as a user. Your client asks Port OS for a short code. The user types the code on a Port OS web page from any other device and approves. Your client polls until the approval arrives, then receives tokens. You need a registered OAuth client that is allowed to use the device code grant first; see [Set up an OAuth client for Port OS](/docs/for-ai/guides/oauth-setup.md).

Every request in this flow carries a DPoP proof, and the tokens are bound to the key that signed it. Keep that key for as long as you keep the tokens.

## Connection details

| Setting | Value |
| --- | --- |
| Device authorization endpoint | https://auth.portoperatingsystem.com/auth/device-authorization |
| Token endpoint | https://auth.portoperatingsystem.com/auth/token |
| Grant type | `urn:ietf:params:oauth:grant-type:device_code` |
| Proof of possession | A `DPoP` header on every request |
| Code lifetime | 30 minutes (`expires_in` is 1800) |
| Polling interval | 5 seconds (`interval`) |

The client must have the device code grant registered. The OAuth clients page on the website creates authorization code clients only, so create a device client with the [create client operation](/docs/for-ai/operations/upsertOAuthClient.md) and put `urn:ietf:params:oauth:grant-type:device_code` in `grantTypes`. Anonymous dynamic registration clients cannot use this flow.

## 1. Create a DPoP key

Create an asymmetric key pair once and keep the private key on the device. Port OS accepts ES256, ES384, ES512, RS256, RS384, RS512 and EdDSA proofs. This guide uses ES256.

Each proof is a signed JWT whose header carries your public key as `jwk`. Its claims name the request:

| Claim | Value |
| --- | --- |
| `htm` | The HTTP method, such as `POST` |
| `htu` | The full request URL, without query or fragment |
| `iat` | The current time in seconds. It must be within 60 seconds of the server clock |
| `jti` | A new random value for every proof. A repeated `jti` is rejected |

```javascript
const b64u = (input) => {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};

const keys = await crypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
const jwk = await crypto.subtle.exportKey('jwk', keys.publicKey);

async function dpopProof(method, url) {
  const header = { typ: 'dpop+jwt', alg: 'ES256', jwk: { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y } };
  const claims = { htm: method, htu: url, iat: Math.floor(Date.now() / 1000), jti: crypto.randomUUID() };
  const signingInput = b64u(JSON.stringify(header)) + '.' + b64u(JSON.stringify(claims));
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, keys.privateKey, new TextEncoder().encode(signingInput));
  return signingInput + '.' + b64u(signature);
}
```

Build a new proof for every request. Never reuse one.

## 2. Ask for a device code

POST a form with your `client_id` and optionally a space-separated `scope`.

```bash
curl -X POST https://auth.portoperatingsystem.com/auth/device-authorization \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "DPoP: $DPOP_PROOF" \
  --data-urlencode "client_id=YOUR_CLIENT_ID" \
  --data-urlencode "scope=endpoint:read message:send"
```

```javascript
const deviceUrl = 'https://auth.portoperatingsystem.com/auth/device-authorization';
const deviceResponse = await fetch(deviceUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    DPoP: await dpopProof('POST', deviceUrl),
  },
  body: new URLSearchParams({
    client_id: 'YOUR_CLIENT_ID',
    scope: 'endpoint:read message:send',
  }),
});
const device = await deviceResponse.json();
```

The response:

```json
{
  "device_code": "DEVICE_CODE_KEEP_PRIVATE",
  "user_code": "ABCD-EFGH",
  "verification_uri": "https://verification.example/oauth/device/verify",
  "verification_uri_complete": "https://verification.example/oauth/device/verify?user_code=ABCD-EFGH",
  "expires_in": 1800,
  "interval": 5
}
```

Show the user the `user_code` and the verification address, or render `verification_uri_complete` as a QR code. Never show the `device_code`.

> Known issue: the service currently returns a `verification_uri` on a retired host instead of `portoperatingsystem.com`. The Port OS verification page is `/oauth/device/verify` on `portoperatingsystem.com`. Until the service is corrected, tell users to open https://portoperatingsystem.com/oauth/device/verify and type the code there.

## 3. The user approves

On the verification page the user signs in to Port OS, enters the code, reviews the permissions your client asked for and clicks **Allow**. They can uncheck permissions, so the grant may carry fewer scopes than you asked for.

## 4. Poll for the tokens

Until the user answers, poll the token endpoint no faster than `interval` seconds. Sign a new proof for each poll.

```bash
curl -X POST https://auth.portoperatingsystem.com/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "DPoP: $DPOP_PROOF" \
  --data-urlencode "grant_type=urn:ietf:params:oauth:grant-type:device_code" \
  --data-urlencode "device_code=DEVICE_CODE" \
  --data-urlencode "client_id=YOUR_CLIENT_ID"
```

```javascript
const tokenUrl = 'https://auth.portoperatingsystem.com/auth/token';
const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

let interval = device.interval;
const deadline = Date.now() + device.expires_in * 1000;
let tokens;
while (Date.now() < deadline) {
  await sleep(interval);
  const poll = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      DPoP: await dpopProof('POST', tokenUrl),
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      device_code: device.device_code,
      client_id: 'YOUR_CLIENT_ID',
    }),
  });
  const body = await poll.json();
  if (poll.ok) { tokens = body; break; }
  if (body.error === 'authorization_pending') continue;
  if (body.error === 'slow_down') { interval += 5; continue; }
  throw new Error('Device login stopped: ' + body.error); // access_denied or expired_token
}
```

When the user approves, the response carries the tokens:

```json
{
  "access_token": "ACCESS_TOKEN_STORE_PRIVATELY",
  "refresh_token": "REFRESH_TOKEN_STORE_PRIVATELY",
  "token_type": "DPoP",
  "expires_in": 86400,
  "scope": "endpoint:read message:send"
}
```

The access token lasts 24 hours and the refresh token 30 days. Both are bound to your DPoP key.

## 5. Call Port OS

Send the access token with the `DPoP` scheme and a fresh proof for the request, with the request's own method and URL.

```bash
curl https://api.portoperatingsystem.com/endpoints \
  -H "Authorization: DPoP ACCESS_TOKEN" \
  -H "DPoP: $DPOP_PROOF_FOR_THIS_REQUEST"
```

## 6. Refresh the tokens

Refresh with the same key. A proof from a different key is rejected.

```javascript
const refreshed = await fetch(tokenUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    DPoP: await dpopProof('POST', tokenUrl),
  },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: 'YOUR_CLIENT_ID',
  }),
});
const next = await refreshed.json(); // Replace the stored refresh token.
```

Refresh tokens rotate, so store the new `refresh_token`. When the refresh token expires or is revoked, run the whole flow again from step 2.

## How Port OS uses code-based linking

Code-based linking appears in Port OS in two directions.

- **A device signs in to Port OS.** The device asks Port OS for a code, as in this guide. The Port OS Android TV app is one such device. On first launch it creates a P-256 key in the Android Keystore and asks for a device code. It shows the user code and a QR code of `verification_uri_complete`, then polls for DPoP-bound tokens. With those tokens it registers itself as an Android TV installation in the user's account, sending its Firebase Cloud Messaging token, a stable device id, its name and its public key. The TV then appears as an endpoint. Commands reach it as push messages, and it signs every state report with the same key instead of sending a bearer token. Its Port OS tokens are bound to that key, so a copied token is useless without the TV. Read [Connect an Android TV](https://portoperatingsystem.com/docs/guides/devices/how-to-connect-android-tv/) for the user's side of this.
- **Port OS signs in to a provider.** Some providers link accounts the same way, with Port OS as the client. To connect Alexa, Port OS asks Amazon for a code, the website shows it, and the user enters it at `https://www.amazon.com/code` and approves. Port OS then exchanges Amazon's private code for the account's tokens and stores them on the Alexa connection. Your client does nothing here: the website runs the whole flow.

Either way, the device or service that needs access never sees the user's password. The user approves on a screen they trust, and can revoke the grant later without touching the device.

## If something goes wrong

| Problem | What to do |
| --- | --- |
| `authorization_pending` | The user has not answered yet. Keep polling at the interval. |
| `slow_down` | You polled too fast. Add 5 seconds to your interval. |
| `access_denied` | The user clicked Deny. Stop and tell them. |
| `expired_token` | The code expired after 30 minutes. Request a new one in step 2. |
| `invalid_client` or `unauthorized_client` | The client ID is wrong or the client does not have the device code grant. Create a device client as described above. |
| `invalid_dpop_proof` or a 400 about the proof | Check `htm` and `htu` match the request exactly, `iat` is within 60 seconds, `jti` is new, and the public key is in the header as `jwk`. |
| Refresh rejected | Sign the proof with the same key that was used to get the tokens. |

## References

1. [Set up an OAuth client for Port OS](/docs/for-ai/guides/oauth-setup.md)
2. [Website based auth via authorization code and PKCE](/docs/for-ai/guides/oauth-website-auth.md)
3. [Device authorization operation](/docs/for-ai/operations/deviceAuthorize.md)
4. [Token operation](/docs/for-ai/operations/generateToken.md)
5. [Create client operation](/docs/for-ai/operations/upsertOAuthClient.md)
