---
author: Port OS Team
last modified: 2026, october, 20
title: How to react to device events
description: Use this guide when an application or agent needs to react when a device changes state.
guide-id: react-to-device-events
content-authorship: HUMAN_MIXED_WITH_AI
---

# How to react to device events

Subscribe to a device event, such as motion at the front door, so your AI or your application can react when it happens.

## What you need

- A Port OS account and a connected device that reports the event you want. A camera that detects motion is an example.
- An AI client connected with [MCP](https://portoperatingsystem.com/docs/how-to-use-mcp/), or an application that uses the [REST API](https://portoperatingsystem.com/api/).
- The `subscription:read` and `subscription:write` permissions. Approve them when your AI client asks to connect. A connection approved before these permissions existed must be approved again.

## Availability

Event subscriptions through MCP work only in ChatGPT today, and only for accounts on the waitlist. Other AI clients cannot create subscriptions yet. To join the waitlist, [request access](mailto:support@portoperatingsystem.com?subject=Event%20subscriptions%20waitlist). The REST API manages subscriptions regardless of your AI client.

## Subscribe through your AI

1. Ask your AI to watch for something. For example: "Tell me when someone comes to the front door."
2. Your AI finds the events your devices can report and creates a subscription. Port OS gives the subscription a name you can recognize.
3. When the event happens, Port OS tells your AI, and your AI reacts. For example, it checks the camera and notifies you.

Port OS verifies the connection with your AI before it turns a subscription on. A subscription does not expire unless you set an expiry.

## Manage subscriptions through your AI

These MCP tools list and change the subscriptions you already have:

| Tool | What it does |
| --- | --- |
| `subscription_list` | Lists your subscriptions with their IDs, names, source device, event and status. Pass `cursor` to read the next page. |
| `subscription_inspect` | Shows one subscription by its ID, including its filter and status. |
| `subscription_label_edit` | Renames one subscription. To change what is watched, create a new subscription and cancel the old one. |
| `subscription_cancel` | Stops one subscription by its ID. To watch again, create a new subscription. |

Always use the exact ID from `subscription_list`. A name or a device ID does not identify a subscription.

For example, to stop watching the front door, ask your AI: "Stop telling me about the front door." Your AI lists your subscriptions, picks the matching one, and cancels it by ID.

## Manage subscriptions with the REST API

Use these operations to manage subscriptions from your own application. Each one is documented in full in the [REST reference](https://portoperatingsystem.com/api/).

| Operation | Request | What it does |
| --- | --- | --- |
| `enumerateSubscriptions` | `GET /subscriptions` | Lists subscriptions, or reads one when you pass `id`. |
| `upsertSubscription` | `POST /subscriptions` | Creates or updates a subscription. A subscription has a `query` that selects events and a `target` that receives them. |
| `patchSubscription` | `PATCH` on the subscription | Renames a subscription. |
| `deleteSubscription` | `DELETE` on the subscription | Stops a subscription. |

A subscription can include a `context` filter. Each key is a path into the message, such as `header.namespace` or `header.name`, and each value is what the message must contain. A subscription fires only when every entry matches. Leave `context` out to receive every event.

Saving a subscription is eventually consistent. A saved subscription means Port OS registered it. It does not prove that your AI or application received an event. Read it back with `GET /subscriptions` and check that its `status` is `ACTIVE`.

## Subscription status

| Status | Meaning |
| --- | --- |
| `ACTIVE` | The subscription is watching. |
| `PAUSED` | The subscription is on hold. |
| `SUSPENDED` | Delivery is suspended. The reason code explains why. |
| `EXPIRED` | The subscription reached its expiry time. |
| `STOPPED` | You or the system cancelled the subscription. |

## Troubleshooting

- **Your AI cannot create a subscription.** Check that your AI client supports event subscriptions and that your account is on the waitlist.
- **A request returns 403 `insufficient_scope`.** The error names the missing permission. Reconnect your AI client and approve `subscription:read` and `subscription:write`.
- **A subscription stopped after you reconnected your AI.** Port OS stops subscriptions when you revoke the connection that created them. Create the subscription again.
- **You get no events.** Check that the subscription is `ACTIVE`, that the device is online, and that you can see the source device. See [authorization rules](/docs/for-ai/guides/authorization-rules.md).
