---
name: cloud-drives
description: Use this guide when the customer wants to list, find, read, upload, download, rename, move or delete files in a connected cloud drive, such as iCloud Drive, a family drive or iCloud Photos.
metadata:
  title: Browse and manage cloud drive files
  guide-id: cloud-drives
  capabilities: filesystem-provider
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 22
---

# Browse and manage cloud drive files

Drives are endpoints like any other device: find one with `endpoint_query` and send every file command through `control`, so no separate file tool is needed. Find the drive or Photos library with a focused name query, across every authorized account, before you say it is missing. Personal and shared Photos libraries are separate endpoints. A generic plugin catalog or an old unrouted `FILESYSTEM` record is not a usable route. Fetch the exact `filesystem-provider` schemas from [the directory](/docs/for-ai/capability-interfaces.md) and use only the commands the route declares: `list-folder`, `list-albums`, `download-file`, `upload-file`, `rename-file`, `move-file` and `delete-file`.

The full paging, upload and cleanup rules are in the Port OS task guide `portos://guides/files`, which the connected-home skill bundles as a reference. The short version:

- Send `list-folder` and `download-file` with `waitForResult=true`: they are replies, and a QUEUED result has no files yet.
- Browse with `list-folder` and follow `nextCursor` until the listing is complete. Keep the account, library and cursor together.
- The interface has no search command. To search, list the folder or album and filter the results yourself, and say how much you covered.
- Download by `fileId` and fetch the returned URI to inspect the real contents. Do not put signed URLs in summaries. The iCloud adapter limits Drive transfers to 10 MiB.
- There is no copy between filesystems. Over MCP a Drive download larger than about 192 KiB fails with `EVENT_PAYLOAD_TOO_LARGE` because of the 256 KiB MCP response limit, and nothing changes. Report that file as not transferred and skip retrying it over MCP.
- Upload the real bytes as base64 with the destination folder, name and MIME type. An existing name is rejected and the file is left untouched.

## Confirm before changes

Listing and downloading need no confirmation. Ask first for every upload, rename and move, and always for delete: name the file, the library and the destination. A cleanup suggestion is not permission to delete. Send each change once with `waitForResult=true`, then re-list to verify. Accepted control proves only dispatch, and a timeout leaves the outcome unknown, so inspect before you retry. Photos upload, rename and move are not supported.

Read [authorization rules](/docs/for-ai/guides/authorization-rules.md) and [async outcomes](/docs/for-ai/guides/using-the-api.md).
