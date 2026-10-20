# Port OS docs

User guides and agent skills for [Port OS](https://portoperatingsystem.com), published as plain Markdown so that people and AI agents can read them without the website.

This repository is a release copy. The source of truth is the Port OS monorepo, and this tree is generated from it. A change made here is overwritten by the next release.

## Contents

| Path | What it holds |
| --- | --- |
| `guides/skills/general/` | Tasks that apply to any account: set up, sign in, devices, groups, permissions and troubleshooting |
| `guides/skills/devices/` | One guide per device family, such as lighting, cameras and thermostats |
| `guides/oauth/` | Implementer guides for the OAuth flow and scopes |
| `guides/connect-ai/` | Connecting an AI client to Port OS |
| `guides/api/` | Developer orientation, REST usage and events |
| `agent-skills/` | Installable agent skills (`<name>/SKILL.md`): `add-devices`, `connect-spotify`, `connected-home`, `control-media`, `control-thermostats`, `control-vacuums`, `first-setup`, `grant-endpoint-permissions`, `manage-devices`, `manage-groups`, `manage-simulators`, `read-cameras`, `setup`, `sign-in-and-connect-accounts`, `sign-in-with-access-key`, `troubleshoot-connections`, `turn-off-lights`, `verify-connection-light` |
| `scripts/validate.mjs` | Checks guide frontmatter and relative links |

Each guide starts with frontmatter: `title`, `guide-id`, `description` (when to use the guide), `content-authorship` (`HUMAN`, `AI` or `HUMAN_MIXED_WITH_AI`) and, for guides under `guides/skills/`, a `skill-id` and the `capabilities` they cover. The guides under `guides/skills/` are also published as agent skills in `agent-skills/<skill-id>/SKILL.md`. Links that start with `/docs/` point at pages on the website.

## Guides

| Guide | Group | Use it when |
| --- | --- | --- |
| [Sign in with a website access key](guides/skills/general/access-key-sign-in.md) | `skills/general` | Use this guide when someone needs to sign in to the website with an access key instead of Google, or to revoke one. |
| [Add devices through provider linking](guides/skills/general/adding-devices.md) | `skills/general` | Use this guide when the customer wants to add devices by linking a provider account such as Google, Alexa or Tuya. |
| [Authentication and dynamic client registration](guides/oauth/authentication-and-dcr.md) | `oauth` | Use this guide for the complete walkthrough from discovery to token refresh when you connect a new REST client. |
| [Set up access rules for Port OS](guides/oauth/authorization-rules.md) | `oauth` | Use this guide to choose scopes and understand which resource permissions a request needs. |
| [Read camera captures and streams](guides/skills/devices/cameras.md) | `skills/devices` | Use this guide when the customer wants a camera snapshot, a recording or a live stream. |
| [Connect any supported agent to Port OS](guides/connect-ai/connect-agent.md) | `connect-ai` | Use this guide to connect a supported AI agent to Port OS and to copy the setup prompt. |
| [Connect Grok to Port OS](guides/connect-ai/connect-grok.md) | `connect-ai` | Use this guide to connect Grok to Port OS, with the settings Grok needs. |
| [Connect Muse to Port OS](guides/connect-ai/connect-muse.md) | `connect-ai` | Use this guide to connect Muse to Port OS, with the settings Muse needs. |
| [Grant permissions to endpoints](guides/skills/general/endpoint-permissions.md) | `skills/general` | Use this guide when the customer wants to decide who or what may read or control a device. |
| [Send commands to an endpoint and read its events](guides/api/events-and-capabilities.md) | `api` | Use this guide to understand events, capabilities and messages, and how a device state change reaches you. |
| [First setup and connection verification](guides/skills/general/first-setup.md) | `skills/general` | Use this guide the first time a customer connects Port OS, to set up access and verify the connection end to end. |
| [How to turn off your lights](guides/skills/devices/lighting.md) | `skills/devices` | Use this guide to turn lights off or on, or to check whether lights are on. It covers finding the right lights, telling lights from switches and plugs, and fixing device data that causes confusion. |
| [Manage device names and availability](guides/skills/general/managing-devices.md) | `skills/general` | Use this guide when the customer wants to rename a device, change its availability or find it by name. |
| [Manage groups and membership](guides/skills/general/managing-groups.md) | `skills/general` | Use this guide when the customer wants to create a group, change its members or control devices by group. |
| [Manage simulator devices](guides/skills/general/managing-simulators.md) | `skills/general` | Use this guide when the customer wants to create a simulator device to test a capability without real hardware. |
| [Control media playback](guides/skills/devices/media.md) | `skills/devices` | Use this guide when the customer wants to play, pause or search audio, set the volume or launch content on a media device. |
| [Register an OAuth client with DCR or CIMD](guides/oauth/oauth-client-registration.md) | `oauth` | Use this guide to register a public OAuth client with dynamic client registration or a client ID metadata document. |
| [Obtain user consent and validate the OAuth callback](guides/oauth/oauth-consent-and-callback.md) | `oauth` | Use this guide to send the customer to consent and to validate the callback before exchanging the code. |
| [Discover the OAuth server and choose REST or MCP](guides/oauth/oauth-discovery.md) | `oauth` | Use this guide to discover the OAuth server for Port OS and choose between the REST API and MCP. |
| [Set up an OAuth client for Port OS](guides/oauth/oauth-setup.md) | `oauth` | Use this guide when you build an application that needs scoped access to a customer account through OAuth. |
| [Exchange, refresh and revoke scoped OAuth tokens](guides/oauth/oauth-token-lifecycle.md) | `oauth` | Use this guide to exchange an authorization code for tokens, refresh them and revoke them. |
| [Port OS concepts](guides/api/port-os-concepts.md) | `api` | Use this guide to learn the Port OS vocabulary: endpoints, capabilities, groups and permissions. |
| [Verify the connection and control one light](guides/skills/general/quickstart.md) | `skills/general` | Use this guide to confirm that a new connection works by reading and controlling one light. |
| [How to react to device events](guides/api/react-to-device-events.md) | `api` | Use this guide when an application or agent needs to react when a device changes state. |
| [Reading the Port OS documentation](guides/api/reading-the-docs.md) | `api` | Use this guide to learn how the Port OS documentation is organized and which page answers which question. |
| [Sign in and connect your accounts](guides/skills/general/sign-in-and-connect-accounts.md) | `skills/general` | Use this guide when a customer wants to sign in, connect device accounts and let their AI use them. |
| [Connect Spotify](guides/skills/devices/spotify.md) | `skills/devices` | Use this guide when the customer wants to link Spotify to search music, manage playlists or control Spotify Connect devices. |
| [Control thermostat settings](guides/skills/devices/thermostats.md) | `skills/devices` | Use this guide when the customer wants to read or set a thermostat target, mode or temperature. |
| [Recover from connection and device failures](guides/skills/general/troubleshooting.md) | `skills/general` | Use this guide when a connection, a device command or a provider link fails and the customer needs the cause and a fix. |
| [Using the REST API](guides/api/using-the-api.md) | `api` | Use this guide to call the Port OS REST API: base URL, authentication, requests and errors. |
| [Control vacuums and cleaning rooms](guides/skills/devices/vacuums.md) | `skills/devices` | Use this guide when the customer wants a robot vacuum to start, stop, return to the dock or clean particular rooms. |

## Contributing

Open an issue here to report a mistake or suggest a guide. Changes land in the monorepo source (`docs/user-guides/` and `docs/agent-skills/`), and a release script copies them into this repository. Do not send pull requests that edit the files in this repository, because the next release replaces them.

To check a copy of this tree, run `node scripts/validate.mjs`.

## License

See [LICENSE](LICENSE).
