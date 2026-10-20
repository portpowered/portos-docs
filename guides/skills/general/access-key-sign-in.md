---
author: Port OS Team
last modified: 2026, october, 14
title: Sign in with a website access key
description: Use this guide when someone needs to sign in to the website with an access key instead of Google, or to revoke one.
skill-id: sign-in-with-access-key
guide-id: access-key-sign-in
content-authorship: HUMAN_MIXED_WITH_AI
---

# Sign in with a website access key

A website access key lets someone sign into your Port OS account without using
your Google account. It grants full account access, including approval of AI
connections. Create one only for someone you trust. For plugin review, use a
dedicated account with sample devices and no access to your household.

## Create a key

1. Sign in to Port OS with Google.
2. Open Tokens and select Create access key.
3. Choose Website sign-in, enter a name, and choose an expiry of one hour, one
   day or seven days.
4. Create the key and copy it. Port OS shows it only once.

Keep the key private. Send reviewer credentials through the platform's private
reviewer-access fields, never a public package, chat message, repository or URL.

## Sign in and connect an assistant

On the sign-in screen, expand Sign in with an access key and paste the key.
Port OS checks its signature, expiry and active record before signing you in.
If you arrived from an assistant's OAuth connection, remain on that consent
screen and review the requested permissions before approving.

The plugin connects to the Port OS cloud. It needs no local MCP server.
Provider sign-in and MFA still happen through the provider-linking flow.

API and automation keys cannot sign into the website or approve connections.
Website keys cannot create replacement keys or be refreshed into a new session.
When a key expires, sign in again with Google to create a replacement.

## Revoke access

Revoke the key on Tokens. Its subsequent website and API requests will fail.
OAuth connections already approved with it are separate grants: revoke those
connections separately through the existing connection/grant controls. Deleting
a key does not disconnect an assistant that was already authorized.

## Troubleshooting

If the form rejects a key, check that it is a Website sign-in key and has not
expired or been revoked. Check network connectivity. Use Google sign-in to
recover account access and create a new key. Do not paste a provider API key,
refresh token or private signing key into the form.

If creation says website sign-in keys are unavailable, the cloud service may
still be updating. The website rejects incompatible API keys and attempts to
revoke them. If it asks you to revoke a remaining key, do so on Tokens before
retrying after the service update.
