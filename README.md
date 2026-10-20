# Stream Deck for Feishin

[![Release](https://img.shields.io/github/v/release/joshuawowk/feishin_plugin_v2)](https://github.com/joshuawowk/feishin_plugin_v2/releases/latest)
[![License: GPL-3.0](https://img.shields.io/github/license/joshuawowk/feishin_plugin_v2)](LICENSE)

Control [Feishin](https://github.com/jeffvli/feishin) playback from an Elgato
Stream Deck — play/pause, skip, and volume, including **Stream Deck + dials**.

Rebuilt on the modern [`@elgato/streamdeck`](https://github.com/elgatosf/streamdeck)
Node SDK (SDKVersion 3, TypeScript). It talks to Feishin's built-in **Remote
Control** WebSocket server, so it works against either the Feishin desktop app
or a headless server-side audio host.

## Install

Requires Stream Deck software 7.1 or later on Windows 10+ or macOS 12+, and a
Feishin install with its **Remote Control** server enabled (see
[Connect to Feishin](#connect-to-feishin)). The two dial actions need a Stream Deck +.

1. Download `net.jwowk.feishin.streamDeckPlugin` from the
   [latest release](https://github.com/joshuawowk/feishin_plugin_v2/releases/latest).
2. Double-click the file. Stream Deck installs the plugin and adds a **Feishin**
   group to the action list.
3. Drag an action onto a key or dial and fill in the connection settings.

An Elgato Marketplace listing is planned; this section will link to it once it is live.

*Unofficial plugin. It is not affiliated with or endorsed by the Feishin project.*

## Actions

| Action | Controller | Behaviour |
| --- | --- | --- |
| Play / Pause | Key | Toggles playback (tracks state from the server) |
| Next | Key | Next track |
| Previous | Key | Previous track |
| Shuffle | Key | Toggles shuffle (two-state key) |
| Volume Up | Key | +`step`% |
| Volume Down | Key | −`step`% |
| Volume Dial | Dial | Rotate = volume, press/tap = play-pause, shows volume % |
| Transport Dial | Dial | Rotate = previous/next, press/tap = play-pause, shows track |

## Connect to Feishin

The connection is configured once (stored as **global** settings shared by every
Feishin button/dial). In any Feishin action's Property Inspector, set:

- **Host** — the Feishin host, e.g. `feishin-host.local` or `192.0.2.10`
- **Port** — `4333` (default)
- **Username / Password** — must match Feishin → Settings → Remote Control
- **Volume step** — percent change per key press / dial tick (default `5`)

On the Feishin side: Settings → Remote Control → enable the server and set the
same port + credentials.

## Build

Requires Node 24 and the Elgato CLI (`@elgato/cli`).

```bash
npm install
npm run build      # bundles to net.jwowk.feishin.sdPlugin/bin/plugin.js
npm run watch      # rebuild + restart the plugin on change
```

To install locally for development:

```bash
streamdeck link net.jwowk.feishin.sdPlugin
streamdeck restart net.jwowk.feishin
```

## Protocol

The wire protocol is implemented in `src/feishin-client.ts`. Client → server: `authenticate` (HTTP Basic header),
`play` / `pause` / `next` / `previous`, `volume` (absolute 0–100). Server →
client: `state`, `playback`, `volume`, `song`. A single shared WebSocket with
auto-reconnect backs all actions.

## License and attribution

GPL-3.0, see [LICENSE](LICENSE).

This plugin is derived from the
[Feishin Stream Deck plugin](https://github.com/FeloDeck/Feishin-Plugin) by
**Felitendo** (GitHub: FeloDeck), which is also GPL-3.0. That plugin was itself
started from Elgato's MIT-licensed
[streamdeck-plugin-template](https://github.com/elgatosf/streamdeck-plugin-template);
Elgato's copyright notice is kept in [NOTICE](NOTICE). This version was rebuilt on the
current `@elgato/streamdeck` SDK, with a configurable host, dials and shuffle, by
Josh Wowk. Feishin itself is a separate project at
[jeffvli/feishin](https://github.com/jeffvli/feishin).

Security issues: see [.github/SECURITY.md](.github/SECURITY.md).
