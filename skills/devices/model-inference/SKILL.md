---
name: model-inference
description: Use this guide when the customer wants to generate an image, speech, converted speech or music with an AI model such as fal.ai, or asks which models are available and what they cost.
metadata:
  title: Run AI generation jobs with cost awareness
  guide-id: model-inference
  capabilities: model-catalog image-generation speech-audio-generation speech-to-speech music-generation
  content-authorship: HUMAN_MIXED_WITH_AI
  author: Port OS Team
  last modified: 2026, october, 22
---

# Run AI generation jobs with cost awareness

Find the provider with a query for the generation capability, for example the fal.ai plugin. Fetch the exact interface from [the directory](/docs/for-ai/capability-interfaces.md) before you send. The fal.ai plugin declares `image-generation`, `speech-audio-generation`, `speech-to-speech`, `music-generation`, `embedding-generation` and `model-catalog`. No video generation interface exists, so say so instead of trying a workaround.

## Choose a model first

Send `query-models` on `model-catalog` with the `capabilityInterface` you need. Each entry gives the `model` ID to pass, its supported aspect ratios and resolutions, and prompting instructions. An unknown model is rejected, so never guess an ID. `generate-image` takes `model` and `prompt`, and optionally `aspectRatio`, `resolution` and `responseFormat`. Prefer `URL`, because `BASE64` fails above 10 MiB. Inspect the returned media before you describe it; the URL is short-lived.

## Cost and confirmation

Every run is billed to the customer's provider account. The interfaces and the catalog publish no price, balance or budget, so you cannot read or enforce a spend limit. Do not state a price as fact. Say that cost depends on the model and the resolution tier, and that higher tiers cost more.

Before any run, tell the customer the model, what you will generate, how many runs, and that it may cost money. Ask for confirmation. Always ask first for batches, retries, a higher resolution, or several models to compare. When the customer is exploring, start with one run on a suitable lower-cost model.

A run takes seconds to about two minutes. Send it once. Accepted control is not a finished result, and a timeout leaves the outcome unknown because the job may still be billed. Do not resend automatically; check the outcome and tell the customer what happened.

Read [authorization rules](/docs/for-ai/guides/authorization-rules.md) and [async outcomes](/docs/for-ai/guides/using-the-api.md).
