---
name: room-scenes
description: Save and recall a native provider room lighting scene, verify member states, and handle uncertain scene creation.
metadata:
  title: Save and recall room scenes
  guide-id: room-scenes
  capabilities: scene
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 31
---

# Save and recall room scenes

## Save and recall a room scene

Use `group_query` to select the logical room, inspect its declared scene messages, and request fresh `expand: ["scene"]` observations. Recall a scene through `control` with its declared `scene/activate` message, `{"sceneId":"<ID from available-scenes>"}` and group ID. Port OS selects a native provider for the complete group; resolve ambiguity first. A request that names only a scene does not name a group: read `available-scenes` on every group that declares `scene` to find the room that has it.

To save a new scene, set and verify the requested member light states first. On a group that declares `scene/create-scene`, send `{"name":"<scene name>"}` with `waitForResult: true`. This captures the current member lighting settings without activating them; it returns `scene-created` with `sceneId` and `name`. Hue names allow at most 32 characters and all members must be reachable with readable state. Read the group's scenes again to confirm creation, then use the returned ID to activate it.

After recall, fresh-read each affected light's power, brightness and supported color observations. A scene label or accepted command does not prove that every light changed. Preserve the requested room and scene. Inspect available scenes after an uncertain create instead of automatically retrying it.

Delete only when asked. Where declared, send `scene/delete-scene` with the exact available `sceneId` to its native room or zone and `waitForResult:true`. Confirm `scene-deleted` and fresh available scenes; inspect uncertainty before retrying.
