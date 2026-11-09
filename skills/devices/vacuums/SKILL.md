---
name: vacuums
description: Use this guide when the customer wants a robot vacuum to start, stop, return to the dock or clean particular rooms.
metadata:
  title: Control vacuums and cleaning rooms
  guide-id: vacuums
  capabilities: robotic-vacuum-cleaner cleaning-mode
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 25
---

# Control vacuums and cleaning rooms

Find the robot endpoint and inspect its robotic-vacuum-cleaner and related declarations in [the directory](/docs/for-ai/capability-interfaces.md). Provider support varies; names do not establish room cleaning, schedules or modes.

Use supported start/stop/mode schemas and discovered IDs. Room/zone cleaning targets the robot endpoint; groups are not automatically robot rooms. Clarify ambiguous mappings and check constraints. Send ordinary commands once with `waitForResult: false`, acknowledge accepted/pending and stop; no automatic polling, status read or card. Fresh-read for state questions, requested verification or uncertain-outcome diagnosis. Show `endpoint_show` when requested. Acceptance does not establish completed cleaning. When multiple rooms are supported, send them in one clean-room request in cleaning order. Robot status does not list target rooms: name the rooms sent rather than claiming to read them back.

## Show the map or pick rooms

- [ ] Show the robot's room picker with `endpoint_show`, `primary: house-map`. Never draw maps or floor plans from group geometry or query groups individually to build one.

## Select rooms on the website

- [ ] Select a map room to highlight it; select again to deselect, or use Clear for all selections. Selection sends no command.
- [ ] Select multiple rooms only with `supportsMultiRoomCleaning: true` in robotic-vacuum-cleaner configuration; otherwise select one. Only groups the robot can clean are selectable.
- [ ] Clean selected sends one `clean-room` to the robot with the selected `groupIds`. Read fresh state afterward.

## Start and end remote movement

- [ ] Drive with `start-session`, `move`, `stop-session` and `end-session` only. Several endpoints can look like the same vacuum (an Alexa or Dreame entry next to the native one); only a robot whose routes declare `remote-control` can be driven, so find it with the query `{"interfaces": {"has": "port1/systems/zero/capability-interfaces/remote-control"}}` and never drive another. Flow: `start-session` with `waitForResult: true` (it returns once the robot reports remote control and has stopped moving off its dock, up to 30 s, and fails with PROVIDER_TIMEOUT `remote_control_not_started` if it never does), read `spatial/pose` with forceDeviceAttributeQuery (a docked robot drives itself off its dock and ends facing away from it, so turning 180 degrees faces the dock again), `move` with `waitForResult: true` (SUCCEEDED means the robot has finished the motion and the reply carries the resulting pose; never send with false, you would get QUEUED), take a `snapshot/get-snapshot` with `responseFormat: BASE64` to verify, then `end-session` (SUCCEEDED means the robot accepts normal commands again; it stays where it stopped, so send `robotic-vacuum-cleaner/return-to-dock` afterwards to send it home). Live video is optional. A `move` sent outside a session fails with `remote_control_not_active`; send `start-session`.
- [ ] Send each `move` with the exact fields. `velocity` is m/s (-0.3 to 0.3, positive forward; use 0.2 or less), `omega` is rad/s (-0.8 to 0.8, positive turns left) and `duration` is ms, a multiple of `durationIncrement` (1000 for the Roborock) between `minDuration` and `maxDuration` (1000 to 5000); other values are rejected. Examples: 90 degrees left is `omega` 0.785 for 2000 ms, 180 degrees is `omega` 0.785 for 4000 ms, about 1 m forward is `velocity` 0.2 for 5000 ms; check with the reply's `distanceMetres` and `turnedDegrees`. Pose `heading` is degrees: 0 faces the map's positive x axis, 90 faces positive y, positive `omega` raises it, and the robot's front and camera face the heading. The pose's `containedInRoomGroupRouteId` names the room the robot is in; the charger is in the Laundry. The route's interface configuration reports the bounds as `minVelocity`, `maxVelocity`, `minOmega`, `maxOmega`, `minDuration`, `maxDuration` and `durationIncrement`; out-of-range moves are rejected.
- [ ] Read `remote-control/session` via forceDeviceAttributeQuery to know whether the robot is under remote control: ACTIVE means it accepts `move` now, INACTIVE means send `start-session` first. While it is ACTIVE the robot reports no `robotic-vacuum-cleaner/operational-state`, so a missing operational state during a session is expected and never means cleaning; an INACTIVE robot reports its usual state.
- [ ] Increase `seqNum` from 1 per session on every move; a repeated number is ignored. A SUCCEEDED `move` means the motion finished; its reply gives the resulting `pose`, `distanceMetres` (straight-line displacement) and `turnedDegrees` (signed, positive left), so no separate pose read is needed, and a partly blocked move still succeeds with the measured values. A `move` where the robot did not move (an obstacle, wall, dock, or a camera request just before) fails with `remote_control_move_not_carried_out`: resend or change direction. A session ends on its own after about 30 seconds without a move and the robot stays where it is: after any pause read `remote-control/session` and send `start-session` again when it is INACTIVE (a move to a lapsed session fails with `remote_control_not_active`).
- [ ] `stop-session` halts motion and keeps remote control; `end-session` leaves remote control. End the session after success, failure or cancellation, before docking.
- [ ] One-way controls use dispatch acceptance: REST `FIRE_FORGET`, MCP without `waitForResult`. Dispatch errors still surface, and a QUEUED FIRE_FORGET request can later turn FAILED (for example an auth error). Remote-control start-session and move are the exception: send them with REST `responseType` SYNC or MCP `waitForResult` true. Never await a nonexistent reply or automatically retry uncertain physical movement.
