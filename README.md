# Feishin Stream Deck Plugin

Control [Feishin](https://github.com/jeffvli/feishin) playback from an Elgato
Stream Deck — play/pause, skip, and volume, including **Stream Deck + dials**.

Rebuilt on the modern [`@elgato/streamdeck`](https://github.com/elgatosf/streamdeck)
Node SDK (SDKVersion 3, TypeScript). It talks to Feishin's built-in **Remote
Control** WebSocket server, so it works against either the Feishin desktop app
or a headless server-side audio host.

## Actions

| Action | Controller | Behaviour |
| --- | --- | --- |
| Play / Pause | Key | Toggles playback (tracks state from the server) |
| Next | Key | Next track |
| Previous | Key | Previous track |
| Volume Up | Key | +`step`% |
| Volume Down | Key | −`step`% |
| Volume Dial | Dial | Rotate = volume, press/tap = play-pause, shows volume % |
| Transport Dial | Dial | Rotate = previous/next, press/tap = play-pause, shows track |

## Connect to Feishin

The connection is configured once (stored as **global** settings shared by every
Feishin button/dial). In any Feishin action's Property Inspector, set:

- **Host** — the Feishin host, e.g. `t630.local` or `192.168.0.160`
  *(the old build was hardcoded to `NUC-01`; it's now configurable)*
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

The wire protocol is documented in `feishin_server_message.jsonc` and implemented
in `src/feishin-client.ts`. Client → server: `authenticate` (HTTP Basic header),
`play` / `pause` / `next` / `previous`, `volume` (absolute 0–100). Server →
client: `state`, `playback`, `volume`, `song`. A single shared WebSocket with
auto-reconnect backs all actions.

## License

GPL-3.0. Originally derived from Felodeck's Feishin plugin; rebuilt by jwowk.
