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
  last modified: 2026, october, 21
---

# Connect Google Nest

Link Google Nest to Port OS to read and control thermostats and to view cameras. You can link it two ways:

- **Your own Google Cloud client** (`customer-oauth`): you create a Google Cloud OAuth client and a Device Access project, and give Port OS the client ID, the client secret and the Device Access project ID. Available to any account. Live events are not available on this variant.
- **Port OS's client** (`portos-oauth`): Port OS uses its own OAuth client and Device Access project. This is available only to accounts that Port OS has granted access, and it includes live events.

The website flow saves first, then authorizes: you save your values as a draft connection, then choose Authorize. Nothing is connected until Google returns and Port OS completes the link.

## Your own Google Cloud client [#customer-oauth]

You need a personal Google account (a Google Workspace account cannot register for Device Access) that owns a Nest home with a supported thermostat, camera or doorbell. The work has two parts: an OAuth client in Google Cloud, then a Device Access project that links to it.

### 1. Copy the Redirect URI from Port OS

In Port OS, open **Add a device** and choose Google Nest. Under **How do you want to connect Google Nest?**, choose **Use my own app**. Copy the value under **Redirect URI to register in your Google Nest app** with **Copy redirect URI**. Keep this tab open; you return to it in step 12. The value is `https://auth.portoperatingsystem.com/plugins`; the screen is the source of truth.

### 2. Open Google Auth Platform

In the [Google Cloud console](https://console.cloud.google.com), select a project you own or create one, and enable the **Smart Device Management API** for it. Then open **Google Auth Platform** and click **Get started**.

[![Google Auth Platform overview with the Get started button](/guides/nest/01-auth-platform-get-started.webp)](/guides/nest/01-auth-platform-get-started.webp)

### 3. Name the app

Enter an app name, for example **Port OS Nest**, and choose a user support email from the list. Click **Next**.

[![The App Information step with the app name filled in and the user support email list](/guides/nest/02-app-information.webp)](/guides/nest/02-app-information.webp)

### 4. Choose External

Under **Audience**, choose **External**. The app starts in testing mode, which is all Port OS needs; you do not need to publish it.

[![The Audience step with External selected](/guides/nest/02b-audience-external.webp)](/guides/nest/02b-audience-external.webp)

### 5. Finish the consent screen

Enter a contact email, agree to the Google API Services user data policy, then click **Create**.

### 6. Add yourself as a test user

Open **Audience** and, under **Test users**, click **Add users**. Add the Google account that owns your Nest home. While the app is in testing mode, only test users can sign in.

[![The Audience page with the Add users button under Test users](/guides/nest/03-audience-test-users.webp)](/guides/nest/03-audience-test-users.webp)

### 7. Create the OAuth client

Open **Clients** and click **Create client**. Set **Application type** to **Web application** and enter a name. Under **Authorized redirect URIs**, click **Add URI** and paste the Redirect URI from step 1. Click **Create**.

[![The Create OAuth client ID form with Web application selected and the Port OS redirect URI entered](/guides/nest/04-oauth-client-web-redirect.webp)](/guides/nest/04-oauth-client-web-redirect.webp)

### 8. Copy the client ID and client secret

Google shows the new client ID and secret. Copy both now: the dialog does not show the secret again. You can add a new secret later from the client's page. Treat the secret like a password.

[![The OAuth client created dialog; the client ID is hidden in this example and the secret area is cropped out](/guides/nest/05-client-created-id.webp)](/guides/nest/05-client-created-id.webp)

### 9. Register for Device Access

Open the [Device Access console](https://console.nest.google.com/device-access) and sign in with the same Google account. Google charges a one-time US$5 registration fee per Google account, and you accept its terms, before you can create a project.

### 10. Create a Device Access project

Click **Create project**.

[![The Device Access console Your projects page with the Create project card](/guides/nest/06-device-access-projects.webp)](/guides/nest/06-device-access-projects.webp)

Enter a project name. Google shows this name on its consent screen. Click **Next**.

[![Step 1 of 3, the project name](/guides/nest/07-project-name.webp)](/guides/nest/07-project-name.webp)

Paste the OAuth client ID from step 8 and click **Next**. This links the client to the project, and each client ID can belong to one project only.

[![Step 2 of 3, the OAuth client ID field; the client ID is hidden in this example](/guides/nest/08-project-oauth-client-id.webp)](/guides/nest/08-project-oauth-client-id.webp)

Leave **Enable events** off and click **Create project**. Port OS does not use Nest events on this connection.

[![Step 3 of 3, Events, with Enable events off](/guides/nest/09-project-events-off.webp)](/guides/nest/09-project-events-off.webp)

### 11. Copy the Project ID

The project page shows a **Project ID**, a UUID. This is not your Google Cloud project ID. Copy it.

[![The project page with the Project ID under the project name; the ID is hidden in this example](/guides/nest/10-project-created.webp)](/guides/nest/10-project-created.webp)

### 12. Enter the values in Port OS

Back in Port OS, enter the client ID in **OAuth client ID**, the client secret in **OAuth client secret** and the Project ID in **Device Access project ID**. Click **Connect Google Nest**. Port OS stores the secret on the backend and never shows it again.

### 13. Approve access on Google

Google asks you to choose your Nest home and approve access to your devices. Sign in with a test user from step 6 and approve. Port OS then lists your devices and shows Nest as connected.

### What works on this variant

- Only thermostat reads and control work. Temperature sensors, motion, doorbell, camera event images and camera live video need Port OS's own client, so they are not available on this connection.
- No Pub/Sub topic or subscription is needed. Live events (motion, doorbell, camera event images and pushed temperature changes) are not available; Port OS shows events as unsupported for this connection rather than as an error. Read current state instead.
- Changing the OAuth client ID or the Device Access project ID requires deleting the connection and connecting again.

### Redirect URI

The Authorized redirect URI in Google Cloud must match the value the Port OS connect screen shows, character for character, including the scheme, host, path and any trailing slash. Google sends you back to the Port OS auth host, which relays the result to the website.

## Use Port OS's client [#portos-oauth]

If your account has been granted Port OS's Nest client, the connect screen offers a Port OS client option. You do not create a Google Cloud client or a Device Access project. Live events are included.

1. Open the Google Nest connect screen and choose the Port OS client option.
2. Choose Authorize and approve the requested access on Google.

If the option is missing, your account has not been granted access. Use your own Google Cloud client instead.

## Troubleshooting

- **Redirect mismatch (Google shows "redirect_uri_mismatch").** The Authorized redirect URI differs from the one Port OS shows. Copy it again from the connect screen and save the OAuth client in Google Cloud.
- **Invalid client (`invalid_client`).** The client ID or secret is wrong, or the secret was replaced. Re-enter both and save again before authorizing.
- **The device list fails after you approve.** The Device Access project ID is wrong, or the OAuth client is not linked to that project. Port OS requests the device list when it completes the link, so a wrong project ID fails the connection. Check the project ID and the linked client ID in the Device Access console, then delete the connection and connect again. An account with no devices connects with an empty list; that is not an error.
- **`AUTH_LINK_NOT_READY`.** The connection is still a draft that is missing required values: the client ID, the client secret or the Device Access project ID. Save all three, then authorize.
- **Stale callback.** An authorization that was started earlier, or opened twice, can return after it expired or was replaced. Close the tab and choose Authorize again. Changing the Device Access project or client ID on an existing connection means deleting the connection and connecting again; the previous attempt is not reused.
