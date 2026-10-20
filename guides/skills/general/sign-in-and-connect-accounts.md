---
author: Port OS Team
last modified: 2026, october, 20
title: Sign in and connect your accounts
description: Use this guide when a customer wants to sign in, connect device accounts and let their AI use them.
skill-id: sign-in-and-connect-accounts
guide-id: sign-in-and-connect-accounts
content-authorship: HUMAN_MIXED_WITH_AI
---

# Sign in and connect your accounts

Sign in to Port OS, connect your device accounts, and let your AI use them. You choose what each connection can do, and you can remove it later.

## Sign in to Port OS

1. Open [Port OS](https://portoperatingsystem.com/sign-in/) and choose Sign in with Google.
2. Approve the Google sign-in. Port OS opens your dashboard.

You do not need a separate Port OS password. If someone else needs temporary access, for example a reviewer, create a [website access key](https://portoperatingsystem.com/docs/user-guides/how-to-set-up-test-access-keys-for-port-os/) for them instead of sharing your account.

## Connect your device accounts

Port OS reaches your devices through the accounts you already have with their makers, such as your Spotify or smart home account.

1. Open the [plugin catalog](https://portoperatingsystem.com/plugins/) and choose your provider.
2. Choose Connect. Sign in on the provider's own page. Port OS never sees your provider password.
3. Approve the access the provider asks for.
4. Open [Your devices](https://portoperatingsystem.com/dashboard/) and check that your devices appear.

If a device is missing, reconnect the provider. Not every device supports every action, so check what your device can do before you rely on it.

## Let your AI use Port OS

1. Add Port OS to your AI client. See [How to use MCP](https://portoperatingsystem.com/docs/how-to-use-mcp/) or choose your client in the [connection guides](https://portoperatingsystem.com/connect-ai/).
2. Your AI client sends you to Port OS to sign in. Review the access it asks for.
3. Choose Allow to approve it, or Deny to cancel.

You can allow some access and refuse the rest. For example, let your AI list your devices without letting it control them. Port OS shows the app's name, but an app can choose any name. Approve only apps you started yourself.

## Remove a connection

- To remove a provider, open the [plugin catalog](https://portoperatingsystem.com/plugins/), choose the provider, and disconnect it.
- To stop an AI client or app, open [Tokens](https://portoperatingsystem.com/tokens/) and revoke its connection. Port OS then rejects its next request.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| Port OS asks you to sign in again | Your sign-in expired. Sign in again. |
| Your AI says access is denied | Reconnect it and allow the access it asked for. |
| A provider shows as disconnected | Reconnect it. Providers sometimes end a connection after a password change. |
| You do not recognize an app asking for access | Choose Deny. |

## For developers

Building your own app or client? See the OAuth guides for developers:

- [Set up an OAuth client](https://portoperatingsystem.com/docs/user-guides/how-to-set-up-an-oauth-client-for-port-os/)
- [Register a client with DCR or CIMD](https://portoperatingsystem.com/docs/user-guides/how-to-register-an-oauth-client/)
- [Scopes and authorization rules](https://portoperatingsystem.com/docs/user-guides/how-to-set-up-access-rules-for-port-os/)
