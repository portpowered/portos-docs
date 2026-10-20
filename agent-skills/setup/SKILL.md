---
name: setup
description: Help connect the Port OS cloud plugin, sign in, authorize access and verify the customer's connected devices.
---

# Set up Port OS

Port OS runs in the cloud. Use the plugin's configured remote MCP connection;
do not install or start a local MCP server, ask for local filesystem access, or
download a runtime.

If the host requests authentication, let the customer complete Port OS sign-in
and consent in their browser. Use Google sign-in. Where the sign-in page offers
access keys, they can also paste a Website sign-in key created on their Tokens
page. Never request the key in chat,
put it in a URL or package, approve consent yourself, or ask for provider MFA.

Provider connections are managed on Port OS. A provider may require its own
sign-in and verification; plugin installation does not establish those links.

After the host confirms connection, use endpoint_query to list authorized
devices. An empty inventory means the account has no visible devices; do not
claim authentication failed. If the customer needs to link a provider, point
them to their Port OS account and its connection UI.

Do not issue a physical command as an installation test. If the customer asks
to test control, discover one explicitly selected device and its declared
capabilities, perform the requested action once, and read fresh observations.
Dispatch acceptance is not proof of physical completion.

If authorization expires or is revoked, use the host's normal reconnect flow.
Revoking a website key stops that key's sign-in/API use. An OAuth connection
already approved with it is a separate grant that the customer revokes
separately. Do not invent refresh tokens for website keys.
