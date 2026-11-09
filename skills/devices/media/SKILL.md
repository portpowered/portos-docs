---
name: media
description: Search and play music or videos, manage live queues or saved playlists, pause, seek, adjust volume, and control a TV (play YouTube or Spotify, see what is on, take a screenshot, open apps, press remote keys).
metadata:
  title: Control media playback
  guide-id: media
  capabilities: media-player media-queue media-playlist media-search speaker content-launcher application-launcher keypad-input touch-input snapshot
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, november, 2
---

# Control media playback

Inspect authorized media endpoint/group declarations in [the capability directory](/docs/for-ai/capability-interfaces.md). Use MCP `control` with the returned target/message and declared payload, or [REST dispatch](/docs/for-ai/guides/quickstart.md) with message/version. Port OS selects routes. Search/library/queue reads need `waitForResult:true` or REST `responseType:"SYNC"` for correlated results. Copy media IDs unchanged: MCP accepts `m/spotify/audio/track/<id>` or full URIs. Keep signed URLs, native/session IDs and queueVersion exact.

Validate units/ranges. Ordinary playback/volume uses waitForResult:false; acknowledge acceptance and stop, except on a TV: after play-media or launch-application, confirm once as in [Control a TV](#control-a-tv) step 4, because an app can stop on a profile picker and report nothing. Fresh-read only for requested verification, relative actions needing current values, or uncertain outcomes. Acceptance does not prove audible playback. Recover lost relative-command results or report unknown; never repeat the increment.

now-playing.active identifies provider content even while paused; playback-state identifies transport. Spotify cannot describe Sonos-native sessions.

play-uri takes {"uri":"HTTPS_AUDIO_URL"} without transcoding. Match route source kinds/formats: Sonos clips require MP3/WAV; streaming paths differ. play-audio takes {"audio":{"data":"BASE64_BYTES","mimeType":"audio/wav"}} within supportedAudioMimeTypes and duration limits; never relabel bytes. play-video takes {"video":{"data":"BASE64_BYTES","mimeType":"video/mp4"},"loop":true} within supportedVideoMimeTypes (loop defaults false); only routes declaring that list play files. show-images takes {"images":[{"data":"BASE64_BYTES","mimeType":"image/jpeg"},...],"title":"Beach week","secondsPerImage":8,"loop":false}: 1 to 30 screen-sized images within supportedImageMimeTypes as a slideshow that next, previous and pause control; add-images {"images":[...],"position":3} and remove-images {"positions":[2]} change it, and now-playing queuePosition and queueLength confirm it. Clip acceptance means scheduled; event-only clip-status cannot be forced into a live reading.

For TV apps, inspect content-launcher/search-and-play as well as application-launcher. Use declared schemas, keys and app IDs; see [Control a TV](#control-a-tv).

Use declared customer-group controls; Port OS selects native or effective-member delivery. Do not reconstruct recipients from provider groups or emulate native queue/session writes per member.

Read fresh source/destination playback before `media-player/transfer-playback`
with `{}`. It moves only the connected provider account's session. Sonos-native
and Spotify Connect can own different sessions playing Spotify tracks; match
provider/account and media using returned identifiers. An already-active Spotify destination
conflicts because nothing moved. A receipt alone never verifies a handoff.

For an authorized manual handoff, check destination `play-media` and `seek` first.
Capture fresh source media ID/position, play that ID on the destination, then seek
with `{"positionMilliseconds":<captured milliseconds>}` (convert seconds × 1000).
Verify fresh destination media, position and transport before pausing the source.
Explain missing media identity/seek and queue loss; never silently restart and
call it a complete transfer.

## Control a TV

A TV (type TELEVISION) carries its own recipe in the endpoint description; read it first. Its messages, `supportedKeys` and `supportedMediaResources` say exactly what it can do.

1. **See what is on.** `endpoint_query` with the TV's `endpointId`, `expand: ["media-player"]` and `forceDeviceAttributeQuery: true`. `playbackState` is PLAYING, PAUSED or STOPPED; `nowPlaying` names the app (`appId`), the title, `provider` and `positionMs`. `appId` `com.google.android.apps.mediashell` means someone is casting to the TV: transport, seek and app launches act on their session, so ask before taking it over.
2. **Find something to play.** The TV has no search of its own, so search the connected library: `media-search/search-media` on the YouTube or Spotify endpoint with `{"query":"<what was asked>","maxResults":5}` and `waitForResult: true`. Copy a returned `mediaId` exactly. Check it against the TV's `supportedMediaResources` (for example YouTube video, channel and playlist; Spotify track, album, artist, playlist, show and episode).
3. **Play it.** `media-player/play-media` on the TV with `{"mediaId":"<returned ID>"}`. The TV opens the provider's app on that media. A YouTube playlist made with the library's `media-playlist/create-playlist` plays the same way, with its returned `m/youtube/video/playlist/<id>`.
4. **Confirm it, every time.** Other commands are only acknowledged, but after `play-media` or `launch-application` check once before saying it plays: SUCCEEDED means the TV received the command, and the app can still stop on a profile picker without reporting anything. Read now-playing again as in step 1, or send `snapshot/get-snapshot` with `{"responseFormat":"BASE64"}` and `waitForResult: true` and look at the screen. Without `responseFormat` the snapshot is a signed URL you cannot view. YouTube can stop on its "Who's watching?" screen: tell the person, and send `keypad-input/send-key` `{"keyCode":"SELECT"}` rather than repeating `play-media`, take another snapshot, and when the picker is still there and the TV declares `touch-input`, tap the profile.
5. **Transport.** `play`, `pause`, `next`, `previous` and `stop` with `{}` act on whichever app holds the media session. `seek` `{"positionMilliseconds":90000}` jumps to a position; `skip-forward` and `skip-backward` `{"deltaPositionMilliseconds":10000}` move from the current one (the distance is required); `start-over` `{}` goes back to the beginning. Seeking works only when the playing app allows it, so read `positionMs` afterwards.
6. **Volume.** `speaker/set-volume` `{"volume":20}` (0 to 100), `speaker/adjust-volume` `{"volumeDelta":-5}` after reading the current `volume`, and `speaker/set-mute` `{"mute":true}`.
7. **Open an app.** Read the `application-list` attribute (`expand: ["application-launcher"]`, `forceDeviceAttributeQuery: true`). It lists Android package names only, so match the name asked for: Netflix `com.netflix.ninja`, YouTube `com.google.android.youtube.tv`, Spotify `com.spotify.tv.android`, Disney+ `com.disney.disneyplus`, Prime Video `com.amazon.amazonvideo.livingroom`, Hulu `com.hulu.livingroomplus`. Send `application-launcher/launch-application` `{"catalogVendorId":0,"applicationId":"<package>"}` and confirm with a snapshot; a package the TV cannot open fails only on the TV.
8. **Move around the screen.** `keypad-input/send-key` takes only the keys in the route's `supportedKeys` (for example UP, DOWN, LEFT, RIGHT, SELECT, BACK, HOME, PLAY, PAUSE); a key outside them is refused. `touch-input/tap` takes `{"x":0.5,"y":0.5}` as fractions of the screen width and height; take a snapshot first to find the point and another to see the result.

9. **Show information instead of video.** To put text, images, a timer or a list on the TV (a recipe step, product cards, a shopping list), use the `screens` skill; do not play media for it. Launching an app or playing media covers a surface that is on screen, so `show-surface` again afterwards, or `close-surface` when the person is done.

Errors: TARGET_UNSUPPORTED on `play-media` means the TV cannot play that media's provider or kind, and the message lists what it can; MESSAGE_UNSUPPORTED means the TV does not declare that message at all. Neither sent anything. Never repeat an accepted command to "make sure"; read the state instead.

## Build a live music queue

For recommendations, build a live queue unless asked to save it. Use existing named playlists when requested. Queues belong to player sessions; saved playlists to libraries.

1. Select the unambiguous logical speaker/native group and inspect messages/configuration. Single-track `play-media` implies no queue/playlist support. Physical speakers stay singleton logical players; grouped playback uses an authorized native group. Similar names prove no identity; never fan queue writes out to members. Resolve typed target ambiguity before another control.
2. Search the connected Spotify library with `media-search/search-media`, for example `{"query":"lo fi","type":"track"}`. Collect playable track IDs from results, optionally refining the search or traversing `get-media` children. Copy returned IDs verbatim; never invent an ID or submit a search phrase as one.
3. Check items against `media-queue` `supportedMediaResources`/`maxItemsPerPlay`. Send one `media-queue/play-queue` with `{"mediaIds":["<returned track ID>","<returned track ID>"]}`. This may interrupt playback. `queueVersion` applies only to append, never play-queue. Repeated play-media cannot simulate a queue.
4. Acknowledge acceptance and stop. For requested contents/verification, fresh-read playback/now-playing and call `media-queue/get-queue` with `{}` on the same target. `queue-contents` separates `currentMediaId` from upcoming `mediaIds`; `complete:false` means a limited window, even if empty. Missing items are not proven absent.

Failed search proves no playback change or connection-wide failure. Preserve playback, report the error and fresh-read for state claims. Never invent IDs. `search-media` uses lowercase `"type":"track"`, even if configuration lists `TRACK`.

Spotify may retain manually queued items when starting a new selection, and does not guarantee ordering across Player API operations. Do not promise that play-queue clears an old queue. Play-queue can explicitly activate the selected Connect target; get-queue and add-to-queue require it already active and never transfer playback.

Tools-only clients use control's queue recipe; never assume resources/read or guess missing schemas.

## Add music and manage the queue

For “add more like this,” inspect fresh playback and the queue, search for appropriate tracks, and send `media-queue/add-to-queue` with `{"mediaId":"<returned track ID>"}` once per desired track on the same route. Append does not restart playback. Send requests sequentially and inspect the observed queue before reporting the addition confirmed; Spotify does not guarantee ordering across separate writes. Preserve intentional repeats, and avoid adding duplicates unless requested.

On native Sonos, `requiresQueueVersion:true` requires get-queue before each append. Copy its exact revision: `{"mediaId":"<returned track ID>","queueVersion":"<returned revision>"}`. On conflict, inspect and reconsider; never replay. Sonos returns complete hosted upcoming contents with repeat occurrence IDs and refreshes without play/reload. Failed refresh can leave an append committed, without proving the player fetched/played it. Queues hold up to 1,000 items and expire 24 hours after creation; append extends no expiry. External-controller queues, radio and legacy single-track grants are not managed queues. Explain missing/changed sessions and obtain intent before replacement. Spotify has no conditional revision; omit queueVersion.

Errors/timeouts can leave writes applied but unconfirmed. Never automatically repeat queue/relative controls; read back and report uncertainty. Removal, reorder, clear, shuffle and play-next require declarations. Background replenishment needs an explicit request and supported scheduling.

## Save or edit a playlist

Only when the customer asks to save a reusable collection, use the library route's declared `media-playlist` messages: `create-playlist`, `list-playlists`, `get-playlist`, `add-to-playlist`, `remove-from-playlist`, `rename-playlist` or `unfollow-playlist`. Playlist mutations return `playlist-mutation-result`; read back contents to verify. `applied:false` can mean a playlist was created but initial tracks were not confirmed, so inspect before another write. Unfollow removes it from the account library and does not permanently delete it.

Verify the active queue after playlist edits. For Sonos saved playlists, use declared `list-playlists`, then `play-playlist` with its exact `playlistId` on the native group or singleton speaker. This inserts and starts the playlist, preserving the shared queue. Else use `play-media` only for an advertised playlist resource kind. On track-only routes, fetch playlist children and send playable track IDs within queue bounds. Missing declarations, restricted Connect devices or missing permissions require explanation; never redirect playback.
