---
name: reminders-and-calendars
description: Use this guide when the customer asks about iCloud reminders, a shopping list, what is due or overdue, or calendar events.
metadata:
  title: Read and change reminders and calendars
  guide-id: reminders-and-calendars
  capabilities: reminders-provider calendar-provider
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 22
---

# Read and change reminders and calendars

Find reminders with a query for a reminders provider, such as iCloud, across every authorized account. Ignore generic plugin catalogs and old unrouted records. Fetch the exact schema from [the directory](/docs/for-ai/capability-interfaces.md) before you send, and use only the commands the route declares. Do not substitute a ChatGPT scheduled task for a named service.

## Reminders

The `reminders-provider` interface declares `list-reminders`, `create-reminder`, `update-reminder` and `delete-reminder`. Older iCloud routes may declare listing only. The Port OS task guide `portos://guides/reminders`, bundled with the connected-home skill, covers lists, due dates, time zones, pagination and read-back.

- Reading needs no confirmation. An empty result proves only that the queried selection is empty.
- Ask first before you delete, and before a bulk change. Creating or completing a single reminder the customer asked for needs no extra confirmation.
- Send each change once and re-list to verify. Accepted control proves dispatch only. A timeout leaves the outcome unknown, so inspect before you retry.

## Calendars

A `calendar-provider` interface exists, but it is a gap. It declares one message, `list-events`, with an empty request, and a response of events that carry only an ID, title, location, description and an all-day flag. The event schema has no start or end time, and the request has no date filter. No real calendar plugin implements it, only the simulators. If the customer has no calendar endpoint, say that calendar access is not available yet. Do not guess commands such as create-event, and do not read a date out of a title.

Read [authorization rules](/docs/for-ai/guides/authorization-rules.md) and [async outcomes](/docs/for-ai/guides/using-the-api.md).
