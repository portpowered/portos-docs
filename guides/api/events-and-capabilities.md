---
author: Port OS Team
last modified: 2026, october, 20
title: Send commands to an endpoint and read its events
slug: how-to-use-events-capabilities-and-messages
description: Use this guide to understand events, capabilities and messages, and how a device state change reaches you.
guide-id: events-and-capabilities
content-authorship: HUMAN_MIXED_WITH_AI
---

# How to send commands to an endpoint and read its events

Find out what an endpoint can do, send it a supported command, and read what it reports back. You will use the same messages to control an endpoint and to learn when something happens to it.

## Messages

To control an endpoint, or to learn when something has happened to it, you handle messages.

You send a message to an endpoint to control it. You receive a message from an endpoint to learn what it observed or did.

## Capabilities

An endpoint tells you what it can do by declaring capabilities.

A capability defines a set of messages that an endpoint can send or receive.

A capability namespace such as `port1/systems/zero/capability-interfaces/power` tells you that the endpoint can support power controls. Read the [capability reference](https://portoperatingsystem.com/docs/reference/capabilities/) for the messages each capability defines.

To find out which messages an endpoint supports, look at the capabilities it declares. See the [API reference](https://portoperatingsystem.com/api/) for how to list an endpoint and its capabilities.

An endpoint can declare a subset of a capability's messages. A declared subset limits which commands are available, so do not assume that every message in a capability works on every endpoint. An omitted subset uses the versioned capability contract. An explicitly empty subset advertises no messages.

## Send a message

A message has a header identifying its capability namespace and message name, and a body that follows the message schema. For an endpoint that advertises power `turn-on`, the payload is:

```json
{
  "header": {
    "namespace": "port1/systems/zero/capability-interfaces/power",
    "name": "turn-on"
  },
  "body": {}
}
```

Use the [send-message operation](/docs/for-ai/operations/sendMessage.md) for the enclosing request and target format. Choose the full endpoint ID returned by discovery. Dispatch only a supported message to an endpoint you intend to operate.

## Read attributes and events

Attributes describe observations, such as the power capability's `power` attribute with a value of `ON` or `OFF`. They differ from command messages: accepting `turn-on` does not prove that the endpoint is on. Read the endpoint's reported attributes after dispatch when the connection supports observation.

Events communicate changes through the event transport supported by your client. An incoming command asks an endpoint to act; an outgoing capability message reports an event. Match namespace, version, name and schema when interpreting an event. See [MCP setup](/docs/for-ai/guides/connect-agent.md) and [the API guide](/docs/for-ai/guides/using-the-api.md) for client and transport details.

When a current power observation is unavailable, offer explicit On and Off commands that the endpoint supports rather than inventing a current state. This also applies when a connection normally reports state but a read fails. When power is known, use that observation for the toggle. Keep pending actions, command acceptance and confirmed observations separate; an accepted command with missing readback remains unconfirmed.

## Recover from missing data or failures

An empty attribute list does not mean the endpoint is off. A failed read leaves the state unknown. A timeout may follow a successful physical action: check observations before repeating a command, especially relative actions. For a permission error, check both OAuth scopes and the resource grant in [authorization rules](/docs/for-ai/guides/authorization-rules.md). If a command is absent, choose one the endpoint advertises or reconnect the provider when discovery is out of date.
