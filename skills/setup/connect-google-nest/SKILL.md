---
name: connect-google-nest
description: Use this guide when the customer wants to link Google Nest to read thermostats and temperature sensors, or to view cameras.
metadata:
  title: Connect Google Nest
  guide-id: google-nest
  slug: google-nest
  capabilities: thermostat temperature-sensor camera
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 20
---

# Connect Google Nest

Link Google Nest to Port OS to read and control thermostats and to view cameras. You can link it two ways:

- **Your own Google Cloud client** (`customer-oauth`): you create a Google Cloud OAuth client and a Device Access project, and give Port OS the client ID, the client secret and the Device Access project ID. Available to any account. Live events are not available on this variant.
- **Port OS's client** (`portos-oauth`): Port OS uses its own OAuth client and Device Access project. This is available only to accounts that Port OS has granted access, and it includes live events.

The website flow saves first, then authorizes: you save your values as a draft connection, then choose Authorize. Nothing is connected until Google returns and Port OS completes the link.

## Your own Google Cloud client [#customer-oauth]

1. In the [Google Cloud console](https://console.cloud.google.com), create or select a project, then open APIs and Services, Credentials.
   <!-- screenshot: nest-gcp-credentials -->
2. Choose Create credentials, OAuth client ID, and set the application type to Web application.
   <!-- screenshot: nest-gcp-create-oauth-client -->
3. In Port OS, open the Google Nest connect screen and choose the option to use your own Google Cloud client. Copy the Redirect URI it shows.
   <!-- screenshot: nest-portos-connect-redirect -->
4. Paste that value into the OAuth client's Authorized redirect URIs and save. It must exactly match the value the connect screen shows.
   <!-- screenshot: nest-gcp-redirect-uri -->
5. Copy the OAuth client ID and client secret.
   <!-- screenshot: nest-gcp-client-credentials -->
6. In the [Device Access console](https://console.nest.google.com/device-access), create a project. Google charges a one-time US$5 registration fee for Device Access; see Google's Device Access console for current terms. When asked for an OAuth client ID, enter the client ID from step 5, which links the OAuth client to the project.
   <!-- screenshot: nest-device-access-create-project -->
7. Copy the Device Access project ID from the project page.
   <!-- screenshot: nest-device-access-project-id -->
8. In Port OS, paste the client ID, the client secret and the Device Access project ID, and choose Save. This creates a draft; the secret is stored on the backend and never shown again.
   <!-- screenshot: nest-portos-save-credentials -->
9. Choose Authorize. Google asks you to approve access to your Nest devices; approve it. Port OS then lists your devices and shows Nest as connected.
   <!-- screenshot: nest-consent -->

### What works on this variant

- Only thermostat reads and control work. Temperature sensors, motion, doorbell, camera event images and camera live video need Port OS's own client, so they are not available on this connection.
- No Pub/Sub topic or subscription is needed. Live events (motion, doorbell, camera event images and pushed temperature changes) are not available; Port OS shows events as unsupported for this connection rather than as an error. Read current state instead.
- Changing the OAuth client ID or the Device Access project ID requires deleting the connection and connecting again.

### Redirect URI

The Authorized redirect URI in Google Cloud must match the value the Port OS connect screen shows, character for character, including the scheme, host, path and any trailing slash. Google sends you back to the Port OS auth host, which relays the result to the website.

## Use Port OS's client [#portos-oauth]

If your account has been granted Port OS's Nest client, the connect screen offers a Port OS client option. You do not create a Google Cloud client or a Device Access project. Live events are included.

1. Open the Google Nest connect screen and choose the Port OS client option.
   <!-- screenshot: nest-portos-oauth-choice -->
2. Choose Authorize and approve the requested access on Google.
   <!-- screenshot: nest-portos-oauth-consent -->

If the option is missing, your account has not been granted access. Use your own Google Cloud client instead.

## Troubleshooting

- **Redirect mismatch (Google shows "redirect_uri_mismatch").** The Authorized redirect URI differs from the one Port OS shows. Copy it again from the connect screen and save the OAuth client in Google Cloud.
- **Invalid client (`invalid_client`).** The client ID or secret is wrong, or the secret was replaced. Re-enter both and save again before authorizing.
- **The device list fails after you approve.** The Device Access project ID is wrong, or the OAuth client is not linked to that project. Port OS requests the device list when it completes the link, so a wrong project ID fails the connection. Check the project ID and the linked client ID in the Device Access console, then delete the connection and connect again. An account with no devices connects with an empty list; that is not an error.
- **`AUTH_LINK_NOT_READY`.** The connection is still a draft that is missing required values: the client ID, the client secret or the Device Access project ID. Save all three, then authorize.
- **Stale callback.** An authorization that was started earlier, or opened twice, can return after it expired or was replaced. Close the tab and choose Authorize again. Changing the Device Access project or client ID on an existing connection means deleting the connection and connecting again; the previous attempt is not reused.
