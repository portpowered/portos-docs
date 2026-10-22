---
name: cloud-drives
description: Use this guide when the customer wants to list, find, read, upload, download, rename, move or delete files in iCloud Drive or iCloud Photos.
metadata:
  title: Browse and manage cloud drive files
  guide-id: cloud-drives
  capabilities: filesystem-provider
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 22
---

# Browse and manage cloud drive files

Find the drive or Photos library with a focused name query, across every authorized account, before you say it is missing. Personal and shared Photos libraries are separate endpoints. A generic plugin catalog or an old unrouted `FILESYSTEM` record is not a usable route. Fetch the exact `filesystem-provider` schemas from [the directory](/docs/for-ai/capability-interfaces.md) and use only the commands the route declares: `list-folder`, `list-albums`, `download-file`, `upload-file`, `rename-file`, `move-file` and `delete-file`.

The full paging, upload and cleanup rules are in the Port OS task guide `portos://guides/files`, which the connected-home skill bundles as a reference. The short version:

- Browse with `list-folder` and follow `nextCursor` until the listing is complete. Keep the account, library and cursor together.
- The interface has no search command. To search, list the folder or album and filter the results yourself, and say how much you covered.
- Download by `fileId` and fetch the returned URI to inspect the real contents. Do not put signed URLs in summaries. The iCloud adapter limits Drive transfers to 10 MiB.
- Upload the real bytes as base64 with the destination folder, name and MIME type. An existing name is rejected, not overwritten.

## Confirm before changes

Listing and downloading need no confirmation. Ask first for every upload, rename and move, and always for delete: name the file, the library and the destination. A cleanup suggestion is not permission to delete. Send each change once with `waitForResult=true`, then re-list to verify. Accepted control proves only dispatch, and a timeout leaves the outcome unknown, so inspect before you retry. Photos upload, rename and move are not supported.

Read [authorization rules](/docs/for-ai/guides/authorization-rules.md) and [async outcomes](/docs/for-ai/guides/using-the-api.md).
