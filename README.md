# Port OS docs

Skills and guides for [Port OS](https://portoperatingsystem.com), published as plain Markdown so that people and AI agents can read them without the website.

This repository is a release copy. The source of truth is the Port OS monorepo, and this tree is generated from it. A change made here is overwritten by the next release.

## Contents

| Path | What it holds |
| --- | --- |
| `skills/setup/` | Getting started: first setup, signing in, adding devices and connecting providers |
| `skills/general/` | Tasks that apply to any account: devices, simulators, groups, permissions, troubleshooting and connected-home requests |
| `skills/devices/` | One skill per device family, such as lighting, cameras and thermostats |
| `guides/oauth/` | Implementer guides for the OAuth flow and scopes |
| `guides/connect-ai/` | Connecting an AI client to Port OS |
| `guides/api/` | Developer orientation, REST usage and events |
| `scripts/validate.mjs` | Checks skill and guide frontmatter and relative links |

Each `skills/<category>/<name>/SKILL.md` is an installable [Agent Skill](https://agentskills.io) and the source of a page on the website. Its frontmatter starts with `name` (the directory name) and `description` (when to use it). The guide fields live in a `metadata` map of strings: `title`, `guide-id`, optional `slug`, `capabilities` (space-separated capability names; required under `skills/devices/`), `content-authorship` (`HUMAN`, `AI` or `HUMAN_MIXED_WITH_AI`), `author` and `last modified`. To install a skill, copy its directory into your agent's skills directory.

Guides under `guides/` start with `title`, `guide-id` (the file name), `description` and `content-authorship`. Links that start with `/docs/` point at pages on the website.

## Skills

| Skill | Name | Use it when |
| --- | --- | --- |
| [Read camera captures and streams](skills/devices/cameras/SKILL.md) | `cameras` | Use this guide when the customer wants a camera snapshot, a recording or a live stream. |
| [How to turn off your lights](skills/devices/lighting/SKILL.md) | `lighting` | Use this guide to turn lights off or on, or to check whether lights are on. It covers finding the right lights, telling lights from switches and plugs, and fixing device data that causes confusion. |
| [Control media playback](skills/devices/media/SKILL.md) | `media` | Use this guide when the customer wants to play, pause or search audio, set the volume or launch content on a media device. |
| [Control thermostat settings](skills/devices/thermostats/SKILL.md) | `thermostats` | Use this guide when the customer wants to read or set a thermostat target, mode or temperature. |
| [Control vacuums and cleaning rooms](skills/devices/vacuums/SKILL.md) | `vacuums` | Use this guide when the customer wants a robot vacuum to start, stop, return to the dock or clean particular rooms. |
| [Connected home requests](skills/general/connected-home/SKILL.md) | `connected-home` | Use for connected-device requests such as turning off lights or a room switch, lowering the thermostat temperature, checking the temperature right now, vacuuming a room, playing or pausing music on Echo/Alexa, lowering speaker volume, looking at a kitchen camera, finding or pinging a phone, or checking whether a phone/watch is dead or needs charging. For a bare temperature question with no indoor/outdoor context, clarify which before assuming weather. Explicit weather forecasts or city temperatures do not require this workflow. |
| [Grant permissions to endpoints](skills/general/grant-endpoint-permissions/SKILL.md) | `grant-endpoint-permissions` | Use this guide when the customer wants to decide who or what may read or control a device. |
| [Manage device names and availability](skills/general/manage-devices/SKILL.md) | `manage-devices` | Use this guide when the customer wants to rename a device, change its availability or find it by name. |
| [Manage groups and membership](skills/general/manage-groups/SKILL.md) | `manage-groups` | Use this guide when the customer wants to create a group, change its members or control devices by group. |
| [Manage simulator devices](skills/general/manage-simulators/SKILL.md) | `manage-simulators` | Use this guide when the customer wants to create a simulator device to test a capability without real hardware. |
| [Recover from connection and device failures](skills/general/troubleshoot-connections/SKILL.md) | `troubleshoot-connections` | Use this guide when a connection, a device command or a provider link fails and the customer needs the cause and a fix. |
| [Add devices through provider linking](skills/setup/add-devices/SKILL.md) | `add-devices` | Use this guide when the customer wants to add devices by linking a provider account such as Google, Alexa or Tuya. |
| [Connect Google Nest](skills/setup/connect-google-nest/SKILL.md) | `connect-google-nest` | Use this guide when the customer wants to link Google Nest to read thermostats and temperature sensors, or to view cameras. |
| [Connect SmartThings](skills/setup/connect-smartthings/SKILL.md) | `connect-smartthings` | Use this guide when the customer wants to link SmartThings to read and control SmartThings devices, or to replace an old personal access token connection. |
| [Connect Spotify](skills/setup/connect-spotify/SKILL.md) | `connect-spotify` | Use this guide when the customer wants to link Spotify to search music, manage playlists or control Spotify Connect devices. |
| [First setup and connection verification](skills/setup/first-setup/SKILL.md) | `first-setup` | Use this guide the first time a customer connects Port OS, to set up access and verify the connection end to end. |
| [Sign in and connect your accounts](skills/setup/sign-in-and-connect-accounts/SKILL.md) | `sign-in-and-connect-accounts` | Use this guide when a customer wants to sign in, connect device accounts and let their AI use them. |
| [Sign in with a website access key](skills/setup/sign-in-with-access-key/SKILL.md) | `sign-in-with-access-key` | Use this guide when someone needs to sign in to the website with an access key instead of Google, or to revoke one. |
| [Verify the connection and control one light](skills/setup/verify-connection-light/SKILL.md) | `verify-connection-light` | Use this guide to confirm that a new connection works by reading and controlling one light. |

## Guides

| Guide | Guide ID | Use it when |
| --- | --- | --- |
| [Send commands to an endpoint and read its events](guides/api/events-and-capabilities.md) | `events-and-capabilities` | Use this guide to understand events, capabilities and messages, and how a device state change reaches you. |
| [Port OS concepts](guides/api/port-os-concepts.md) | `port-os-concepts` | Use this guide to learn the Port OS vocabulary: endpoints, capabilities, groups and permissions. |
| [How to react to device events](guides/api/react-to-device-events.md) | `react-to-device-events` | Use this guide when an application or agent needs to react when a device changes state. |
| [Reading the Port OS documentation](guides/api/reading-the-docs.md) | `reading-the-docs` | Use this guide to learn how the Port OS documentation is organized and which page answers which question. |
| [Using the REST API](guides/api/using-the-api.md) | `using-the-api` | Use this guide to call the Port OS REST API: base URL, authentication, requests and errors. |
| [Connect any supported agent to Port OS](guides/connect-ai/connect-agent.md) | `connect-agent` | Use this guide to connect a supported AI agent to Port OS and to copy the setup prompt. |
| [Connect Grok to Port OS](guides/connect-ai/connect-grok.md) | `connect-grok` | Use this guide to connect Grok to Port OS, with the settings Grok needs. |
| [Connect Muse to Port OS](guides/connect-ai/connect-muse.md) | `connect-muse` | Use this guide to connect Muse to Port OS, with the settings Muse needs. |
| [Authentication and dynamic client registration](guides/oauth/authentication-and-dcr.md) | `authentication-and-dcr` | Use this guide for the complete walkthrough from discovery to token refresh when you connect a new REST client. |
| [Set up access rules for Port OS](guides/oauth/authorization-rules.md) | `authorization-rules` | Use this guide to choose scopes and understand which resource permissions a request needs. |
| [Register an OAuth client with DCR or CIMD](guides/oauth/oauth-client-registration.md) | `oauth-client-registration` | Use this guide to register a public OAuth client with dynamic client registration or a client ID metadata document. |
| [Obtain user consent and validate the OAuth callback](guides/oauth/oauth-consent-and-callback.md) | `oauth-consent-and-callback` | Use this guide to send the customer to consent and to validate the callback before exchanging the code. |
| [Discover the OAuth server and choose REST or MCP](guides/oauth/oauth-discovery.md) | `oauth-discovery` | Use this guide to discover the OAuth server for Port OS and choose between the REST API and MCP. |
| [Set up an OAuth client for Port OS](guides/oauth/oauth-setup.md) | `oauth-setup` | Use this guide when you build an application that needs scoped access to a customer account through OAuth. |
| [Exchange, refresh and revoke scoped OAuth tokens](guides/oauth/oauth-token-lifecycle.md) | `oauth-token-lifecycle` | Use this guide to exchange an authorization code for tokens, refresh them and revoke them. |

## Contributing

Open an issue here to report a mistake or suggest a skill or guide. Changes land in the monorepo source (`docs/skills/` and `docs/user-guides/`), and a release script copies them into this repository. Do not send pull requests that edit the files in this repository, because the next release replaces them.

To check a copy of this tree, run `node scripts/validate.mjs`.

## License

See [LICENSE](LICENSE).
