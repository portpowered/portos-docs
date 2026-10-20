---
name: connect-spotify
description: "Use this guide when the customer wants to link Spotify to search music, manage playlists or control Spotify Connect devices."
---

# Connect Spotify

Link Spotify to Port OS to search music, manage playlists and control Spotify Connect devices. You can link it two ways:

- **Your own Spotify app** (`customer-oauth`): you create an app in the Spotify developer dashboard and give Port OS its client ID and secret. Available to any account, subject to Spotify's development-mode limits (see Quota and development mode).
- **Port OS's registration** (`portos-oauth`): Port OS uses its own Spotify app. This is available only to accounts that Port OS has granted access.

The website flow saves first, then authorizes: you save the client ID and secret as a draft connection, then choose Authorize. Nothing is connected until Spotify returns and Port OS completes the link.

## Use your own Spotify app [#customer-oauth]

1. Sign in to the [Spotify developer dashboard](https://developer.spotify.com/dashboard) and choose Create app.
   <!-- screenshot: spotify-dashboard-create-app -->
2. Give the app a name and description. For APIs used, select Web API.
   <!-- screenshot: spotify-dashboard-app-details -->
3. In Port OS, open the Spotify connect screen and choose Use my own Spotify app. Copy the Redirect URI it shows.
   <!-- screenshot: spotify-portos-connect-redirect -->
4. Paste that value into the app's Redirect URIs in the dashboard and save.
   <!-- screenshot: spotify-dashboard-redirect-uri -->
5. Open the app's settings in the dashboard and copy the client ID and the client secret.
   <!-- screenshot: spotify-dashboard-credentials -->
6. In Port OS, paste the client ID and client secret and choose Save. This creates a draft; the secret is stored on the backend and never shown again.
   <!-- screenshot: spotify-portos-save-credentials -->
7. Choose Authorize. Spotify asks you to approve the requested access; approve it. Port OS then shows Spotify as connected.
   <!-- screenshot: spotify-consent -->

### Redirect URI

The Redirect URI in the Spotify dashboard must match the value the Port OS connect screen shows, character for character, including the scheme, host, path and any trailing slash. Spotify sends you back to the Port OS auth host, which relays the result to the website. Use the value the screen shows, not one copied from elsewhere.

### Required scopes

Port OS requests these scopes. You do not configure scopes in the dashboard; approve them on the Spotify consent screen.

- `user-read-playback-state`
- `app-remote-control`
- `user-modify-playback-state`
- `playlist-read-private`
- `playlist-read-collaborative`
- `playlist-modify-private`
- `playlist-modify-public`
- `user-library-modify`

### Quota and development mode

New Spotify apps start in development mode. Under Spotify's July 2026 update, only users on the app's allowlist can sign in until Spotify grants the app extended quota. Add every Spotify account you want to connect to the allowlist in the dashboard (User Management). Quota limits are counted by Spotify, not Port OS; see Spotify's [quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes) and the [July 2026 Web API quota update](https://developer.spotify.com/blog/2026-07-23-web-api-quota-updates) for current limits.

## Use Port OS's registration [#portos-oauth]

If your account has been granted Port OS's Spotify registration, the connect screen offers Use Port OS's Spotify app. You do not create a dashboard app or enter a client ID, secret or Redirect URI.

1. Open the Spotify connect screen and choose Use Port OS's Spotify app.
   <!-- screenshot: spotify-portos-oauth-choice -->
2. Choose Authorize and approve the requested access on Spotify.
   <!-- screenshot: spotify-portos-oauth-consent -->

If the option is missing, your account has not been granted access. Use your own Spotify app instead.

## Troubleshooting

- **Redirect mismatch (Spotify shows "INVALID_CLIENT: Invalid redirect URI").** The dashboard Redirect URI differs from the one Port OS shows. Copy it again from the connect screen and save the dashboard app.
- **Invalid client (`invalid_client`).** The client ID or secret is wrong, or the secret was regenerated. Re-enter both from the dashboard and save again before authorizing.
- **`AUTH_LINK_NOT_READY`.** The connection is still a draft that is missing required values, usually the client secret. Save both client ID and secret, then authorize.
- **Spotify refuses sign-in for your account.** The app is in development mode and your Spotify account is not on its allowlist. See Quota and development mode.
- **Stale callback.** An authorization that was started earlier, or opened twice, can return to Port OS after it expired or was replaced. Close the tab and choose Authorize again to start a fresh attempt; the previous one is not reused.
