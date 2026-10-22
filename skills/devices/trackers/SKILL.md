---
name: trackers
description: Use this guide when the customer wants to find or ring a phone, watch, wallet or laptop tracker, or check its battery.
metadata:
  title: Find and ring trackers, phones and watches
  guide-id: trackers
  capabilities: location-tracker location battery connectivity
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 22
---

# Find and ring trackers, phones and watches

Find the item with a focused name query. Types such as `TRACKER`, `MOBILE_PHONE`, `PHONE`, `WEARABLE` and `LAPTOP` all appear, and a `TRACKER` can be a phone. Inspect each candidate's routes and provider. Prefer the current route-backed Apple iCloud record for an Apple device, or the Tile record for a Tile tag, over old duplicates. Tile, Alexa and Find My records are not interchangeable. Ask which device if several remain.

The full workflows are in the Port OS task guides `portos://guides/find-phone` and `portos://guides/battery`, which the connected-home skill bundles as references. Follow them instead of repeating them here.

## What the interfaces offer

- `location-tracker` declares one command, `start-locator`, with an empty payload, and a `locator-signal` of `ON` or `OFF`. This is "ping" or "play a sound". Do not invent `play-sound` or any other message.
- `location` declares a `geolocation` coordinate. Read it with `forceDeviceAttributeQuery=true`. A stale coordinate is the last known position, and a missing one does not mean the item is lost.
- `battery` and `connectivity` answer "is it dead". Offline does not prove a flat battery, and an unavailable battery is unknown, not 0%.

Declared capabilities vary by provider and device. If a wallet or laptop declares no locator or location, say so instead of guessing.

## Confirmation and verification

Ringing is audible, so send `start-locator` once and only when the customer asks to ring. An accepted result means the locator was requested, not that it was heard. Do not retry on your own. Precise location is personal: share it only with the customer who asked, and keep coordinates out of logs.

Read [authorization rules](/docs/for-ai/guides/authorization-rules.md) and [async outcomes](/docs/for-ai/guides/using-the-api.md).
