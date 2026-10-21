---
name: vacuums
description: Use this guide when the customer wants a robot vacuum to start, stop, return to the dock or clean particular rooms.
metadata:
  title: Control vacuums and cleaning rooms
  guide-id: vacuums
  capabilities: robotic-vacuum-cleaner cleaning-mode
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 18
---

# Control vacuums and cleaning rooms

Find the robot endpoint and inspect its robotic-vacuum-cleaner and related capability declarations in [the directory](/docs/for-ai/capability-interfaces.md). Supported operations vary by provider; do not infer room cleaning, scheduling or modes from a device name.

Use supported start/stop/mode schemas and full IDs. Spatial cleaning targets the robot endpoint with its supported room/zone payload; an endpoint group is not automatically a robot room. Check constraints and [dispatch semantics](/docs/for-ai/guides/using-the-api.md). Query fresh status afterward; accepted work is not completed cleaning. Ask for clarification when room mappings are ambiguous.

## Select rooms on the website

- [ ] Select a room on the robot's map to highlight it. Select it again to deselect it, or use Clear to remove all selections. Selecting a room does not send a command.
- [ ] Select several rooms only when the robotic-vacuum-cleaner configuration advertises `supportsMultiRoomCleaning: true`; otherwise selection is limited to one room. Only groups the robot can clean are selectable.
- [ ] Use Clean selected to send one `clean-room` command to the robot with the `groupIds` of the selected rooms. Check fresh state afterward; request acceptance does not establish completed cleaning.

## Start and end remote movement

- [ ] Prefer `unary-move` for a bounded movement with working live camera feedback. Roborock owns start, native readiness, five-second startup settling, fresh readiness revalidation, ordered moves and session end.
- [ ] Keep movement duration in milliseconds and preserve its requested bound. Startup settling adds time before motion, not extra motion.
- [ ] Explicit `start-session` acknowledgement does not establish readiness. Advanced callers must verify healthy native manual mode, settle for five seconds and recheck before a `move`; a generic RUNNING state alone is insufficient. Use `unary-move` when those native checks are unavailable.
- [ ] Explicit `move` uses increasing `seqNum` values, beginning at 1 for a new session. `stop-session` stops movement; `end-session` exits manual mode. End an explicitly started session after success or failure, including cancellation, and before requesting docking.
- [ ] Send one-way remote controls with dispatch-acceptance intent (`FIRE_FORGET` in REST; omit MCP `waitForResult`). This still reports dispatch errors. Do not wait for a nonexistent reply or automatically retry an uncertain physical move.

