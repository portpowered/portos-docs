---
name: screens
description: Show things on a TV screen (a cooking timer, product cards with prices, a shopping list, a two-column summary), update them live, read back what is on screen, and close them. Use when asked to show, display, put up or pin information on the TV.
metadata:
  title: Show things on your TV
  guide-id: screens
  capabilities: generative-ui
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, november, 8
---

# Show things on your TV

A TV whose route declares the `generative-ui` interface can show one surface: a screen of text, images, rows, columns, cards and timers that you describe in A2UI v1.0. A route declares `generative-ui` and its `display` at route discovery, from what the TV registered. A TV that does not declare it has an old app or has not registered, or registered after the route was last discovered (rediscover the route to pick it up); say so, and offer the media skill's snapshot and slideshow instead. Inspect the route in [the capability directory](/docs/for-ai/capability-interfaces.md); use MCP `control` or [REST dispatch](/docs/for-ai/guides/quickstart.md).

Nothing on the surface can be clicked. It is for reading from a sofa.

## Before the first surface

1. Send `generative-ui/get-components` `{}` with `waitForResult:true` (REST `responseType:"SYNC"`). It answers from what the TV registered, even while the TV sleeps. Use only the components it lists, with the properties in each schema.
2. Read `display`: `widthDp` x `heightDp` is the layout size (960 x 540 on a 1080p TV), `safeAreaInsetDp` is the margin kept clear, and `viewingDistance` is `TEN_FOOT`. Design for that size: few elements, short lines, headings `#` or `##` for what must be read first, `caption` only for detail. Three or four items beat twelve. Overflow is clipped; nothing scrolls.
3. Pick the catalog: `https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json`, or `https://portoperatingsystem.com/a2ui/catalogs/tv/v1/catalog.json` when you use `Timer`.

## Show, update, read, close

- `show-surface` `{"surfaceId":"...","a2ui":[ ... ]}`: the first A2UI message is `createSurface` with `surfaceId`, `catalogId` and a flat `components` list that includes one component with `id` `root`. Containers name children by id (`children`, or `child` for one). Every message carries `"version":"1.0"` and the same `surfaceId`. It replaces whatever surface is on screen and brings the Port OS app forward.
- `update-surface` same shape without `createSurface`: `updateComponents` replaces components by `id`; `updateDataModel` sets a value. Send small changes, one call each, and wait for each call to return before the next so they apply in order.
- `get-surface` `{}` (or `{"surfaceId":"..."}`) with `waitForResult:true` returns the components, `sequence`, `visible` and `display`. Use it to confirm the last update is on screen; acceptance alone does not say so. `visible:false` means someone left the app; `show-surface` brings it back.
- `close-surface` `{"surfaceId":"..."}` returns the TV to its home screen.

Images are HTTPS URLs the TV fetches; never inline bytes. One call carries at most 512 KiB of A2UI, and the TV may declare less in `maxPayloadBytes`.

Errors: BAD_REQUEST names the component or property the TV does not render, and nothing was sent; fix it and retry. A conflict on `update-surface` means that surface is not the one on screen; send `show-surface`. PAYLOAD_TOO_LARGE has two causes, told apart by the provider code. A single call over the size limit has no provider code and its message gives the byte counts: split it or use smaller content. `ANDROID_TV_SURFACE_LOG_FULL` on an update means the surface's update log is full: send a fresh `show-surface` with the current state. SERVICE_UNAVAILABLE or PROVIDER_UNAVAILABLE means the screen service did not answer: tell the person, do not repeat. PROVIDER_TIMEOUT on `get-surface` means the TV did not answer in time (it may be off); say so rather than guessing. If the TV is asleep, the first message wakes it and it applies in order when it connects.

## Worked examples

The pasta timer uses the TV catalog because it needs `Timer`; the product cards and the shopping list use the basic catalog. Components are a flat list; ids are yours to choose.

**Cooking timer.**

```json
{"surfaceId":"pasta","a2ui":[{"version":"1.0","createSurface":{"surfaceId":"pasta","catalogId":"https://portoperatingsystem.com/a2ui/catalogs/tv/v1/catalog.json","components":[
 {"id":"root","component":"Column","align":"center","justify":"center","children":["title","timer"]},
 {"id":"title","component":"Text","text":"# Pasta"},
 {"id":"timer","component":"Timer","mode":"COUNTDOWN","label":"Boil","endsAt":"2026-11-08T19:42:00Z","doneText":"Drain it"}]}}]}
```

Compute `endsAt` from the current time plus the minutes asked; the TV ticks it, so no updates are needed. To add a second timer, `updateComponents` with the new `Timer` and a `root` that lists it.

**Product cards with images and prices.** One `Card` per product in a `Row`; keep to three cards.

```json
{"surfaceId":"picks","a2ui":[{"version":"1.0","createSurface":{"surfaceId":"picks","catalogId":"https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json","components":[
 {"id":"root","component":"Column","children":["head","cards"]},
 {"id":"head","component":"Text","text":"## Kettles under $60"},
 {"id":"cards","component":"Row","children":["a","b","c"]},
 {"id":"a","component":"Card","weight":1,"child":"a-body"},
 {"id":"a-body","component":"Column","align":"center","children":["a-img","a-name","a-price"]},
 {"id":"a-img","component":"Image","url":"https://example.com/kettle-a.jpg","variant":"mediumFeature","fit":"cover","description":"Kettle A"},
 {"id":"a-name","component":"Text","text":"### Kettle A"},
 {"id":"a-price","component":"Text","text":"$49","variant":"caption"}]}}]}
```

Repeat the `b` and `c` cards the same way; each id is unique.

**Shopping list.** A `List` of short `Text` lines. To tick an item off, `updateComponents` the one line with new text (for example a leading "Done:"); do not resend the list.

```json
{"surfaceId":"shopping","a2ui":[{"version":"1.0","createSurface":{"surfaceId":"shopping","catalogId":"https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json","components":[
 {"id":"root","component":"Column","children":["head","list"]},
 {"id":"head","component":"Text","text":"## Shopping"},
 {"id":"list","component":"List","children":["i1","i2","i3"]},
 {"id":"i1","component":"Text","text":"Milk"},
 {"id":"i2","component":"Text","text":"Eggs"},
 {"id":"i3","component":"Text","text":"Coffee"}]}}]}
```

**Left and right columns.** A `Row` whose children carry `weight`, so each takes half; a `Divider` between them with `axis` `vertical` is optional.

```json
{"id":"root","component":"Row","children":["left","right"]},
{"id":"left","component":"Column","weight":1,"children":["l-head","l-body"]},
{"id":"right","component":"Column","weight":1,"children":["r-head","r-body"]}
```

Put these in a `createSurface.components` list like the others; fill each side with `Text` and `Image` components.

## Switching with video

`play-media`, `launch-application` and the rest of the media skill open other apps over the surface. The surface stays held, `visible:false`, until you `show-surface` again or `close-surface`. Close a surface when the person is done with it.
