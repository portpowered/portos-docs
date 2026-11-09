---
author: Port OS Team
last modified: 2026, october, 23
title: Set up an OAuth client for Port OS
description: Use this guide when you build an application that needs scoped access to a customer account through OAuth.
guide-id: oauth-setup
content-authorship: HUMAN_MIXED_WITH_AI
include-guides:
  - oauth-discovery
  - oauth-client-registration
---

# Set up an OAuth client for Port OS

This guide explains how to register an OAuth client for Port OS so that you can make API calls.

Port OS supports three variants of client registration:

1. [manual registration](#manual-registration)
2. [dynamic client registration](/docs/for-ai/guides/oauth-client-registration.md#dynamic-client-registration)
3. [client information metadata documents](/docs/for-ai/guides/oauth-client-registration.md#client-information-metadata-documents)

After you've registered an OAuth client, you can then setup authorization via Port OS's supported authorization methods.

1. [Website based auth via authorization code and PKCE](/docs/for-ai/guides/oauth-website-auth.md)
2. [Device based auth via code based linking](/docs/for-ai/guides/oauth-device-auth.md)

## manual registration

to register a new oauth client go to the [oauth client registration page](https://portoperatingsystem.com/oauth-clients/)

you will need to configure the registration with the following:

1. permitted scopes
2. authorized callbacks

### Manual registration details

On the OAuth client page, choose Create client ID, enter a client name and pick an application type. A Web Application is a confidential client: it receives a client secret, shown once, and also lists its authorized JavaScript origins. A Desktop Application or CLI is a public client that uses PKCE and has no secret.

Authorized callbacks are the exact redirect URIs Port OS may send the user back to. Remote callbacks use HTTPS. HTTP is allowed only for localhost or loopback addresses, and local and remote callbacks cannot be mixed in one client. A callback cannot contain a fragment or user information. A Desktop Application or CLI starts with http://localhost.

Permitted scopes are the most this client can ever ask a user to approve. At authorization a request can name a subset, and the user can uncheck any of it. A client registered by hand can hold any published scope, including the flow, secret, principal and access-control scopes that dynamic registration and metadata documents cannot request. Grant only what the application needs. A client created on the page uses the authorization code grant; a client for the device flow is created through the [create OAuth client operation](/docs/for-ai/operations/upsertOAuthClient.md).
