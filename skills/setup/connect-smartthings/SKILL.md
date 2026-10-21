---
name: connect-smartthings
description: Use this guide when the customer wants to link SmartThings to read and control SmartThings devices, or to replace an old personal access token connection.
metadata:
  title: Connect SmartThings
  guide-id: smartthings
  slug: smartthings
  capabilities: power
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 21
---

# Connect SmartThings

Link SmartThings to Port OS to read and control your SmartThings devices. You can link it two ways:

- **Your own SmartThings app** (`customer-oauth`): you register an OAuth-In app with the SmartThings CLI and give Port OS its client ID and secret. Available to any account.
- **Port OS's registration** (`portos-oauth`): Port OS uses its own SmartThings app. This is available only to accounts that Port OS has granted access.

The website flow saves first, then authorizes: you save the client ID and secret as a draft connection, then choose Authorize. Nothing is connected until SmartThings returns and Port OS completes the link.

## Use your own SmartThings app [#customer-oauth]

You register an OAuth-In app with the SmartThings CLI, then give Port OS its client ID and client secret.

### 1. Install the SmartThings CLI

On macOS, run:

```bash
brew install smartthingscommunity/smartthings/smartthings
```

On Windows, download and run `smartthings.msi` from the latest release listed on the [SmartThings CLI page](https://developer.smartthings.com/docs/sdks/cli). On Linux, download the zipped binary from the latest release, extract it and put it on your path. Check the install:

```bash
smartthings --version
```

### 2. Copy the Redirect URI from Port OS

In Port OS, open **Add a device** and choose SmartThings. Under **How do you want to connect SmartThings?**, choose **Use my own app**. Copy the value under **Redirect URI to register in your SmartThings app** with **Copy redirect URI**. Keep this tab open; you return to it in step 6.

### 3. Create the app

Run:

```bash
smartthings apps:create
```

On the first command, the CLI opens a browser window. Sign in with your Samsung account and grant the CLI access. When asked for the app type, choose **OAuth-In App**.

### 4. Enter the Redirect URI and scopes

When the CLI asks for the redirect URI, paste the value from step 2. When it asks for scopes, select the four scopes listed under Required scopes.

### 5. Copy the client ID and client secret

The CLI prints the app's OAuth client ID and client secret. The secret is shown once, so copy both now. Treat the secret like a password.

### 6. Enter the credentials in Port OS

Back in Port OS, enter the client ID in **OAuth client ID** and the secret in **OAuth client secret**, then click **Connect SmartThings**. Port OS stores the secret on the backend and never shows it again.

### 7. Approve access on SmartThings

SmartThings asks you to sign in, choose a location and approve access. Approve it. Port OS then shows SmartThings as connected and lists your devices.

### Redirect URI

The redirect URI registered with the app must match the value the Port OS connect screen shows, character for character, including the scheme, host, path and any trailing slash. SmartThings sends you back to the Port OS auth host, which relays the result to the website.

### Required scopes

Select these scopes when you register the app:

- `r:devices:*`
- `w:devices:*`
- `x:devices:*`
- `r:locations:*`

## Use Port OS's registration [#portos-oauth]

If your account has been granted Port OS's SmartThings registration, the connect screen offers a Port OS registration option. You do not register an app or enter a client ID, secret or Redirect URI.

1. Open the SmartThings connect screen and choose the Port OS registration option.
2. Choose Authorize and approve the requested access on SmartThings.

If the option is missing, your account has not been granted access. Use your own SmartThings app instead.

## Personal access tokens

Personal access tokens (PATs) are no longer supported for SmartThings. An old SmartThings link that uses a personal access token stops working and must be deleted and connected again. Delete that link and connect SmartThings again with OAuth, either Port OS's app or your own. Revoke the old token in your SmartThings account when you no longer need it.

## Troubleshooting

- **Redirect mismatch.** The app's redirect URI differs from the one Port OS shows. Copy it again from the connect screen and update the app with the SmartThings CLI (`smartthings apps:oauth:update`).
- **Invalid client (`invalid_client`).** The client ID or secret is wrong, or the secret was regenerated. Re-enter both and save again before authorizing.
- **`AUTH_LINK_NOT_READY`.** The connection is still a draft that is missing required values, usually the client secret. Save both client ID and secret, then authorize.
- **Missing devices or permission errors.** The app was registered without all four scopes. Update the app's scopes, then delete the connection and connect again.
- **Connection stops working.** The connection used a personal access token. See Personal access tokens.
- **Stale callback.** An authorization that was started earlier, or opened twice, can return after it expired or was replaced. Close the tab and choose Authorize again.
