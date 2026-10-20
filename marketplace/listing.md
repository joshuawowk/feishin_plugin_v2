# Maker Console listing: Stream Deck for Feishin

Copy-paste kit for the Elgato Maker Console (https://maker.elgato.com). Values below were
drafted against the Elgato product guidelines (https://docs.elgato.com/guidelines/products)
as researched in October 2026; re-check the guidelines before submitting, because limits can change.

## Product name

Stream Deck for Feishin

(23 characters. "for Feishin" wording marks this as a third-party plugin that works with the
software; it does not use the word "Official" or any Feishin logo, and the plugin icon is a neutral
play/pause mark rather than the Feishin logo.)

## Tagline

Play, skip, shuffle and set the volume of Feishin from keys and Stream Deck + dials.

## Description

Control Feishin from your Stream Deck. Play or pause, skip to the next or previous track, toggle shuffle, and raise or lower the volume with plain keys, or use the two Stream Deck + dials: turn the Volume Dial to change volume and press it to play or pause, or turn the Transport Dial to skip tracks while it shows what is playing. The plugin talks to Feishin's built-in Remote Control server over a WebSocket, so it works with the Feishin desktop app or with a server-side Feishin host. Enter the host, port, username and password once, and every Feishin key and dial shares that connection, with automatic reconnect. You choose how many percent each volume key press or dial tick changes. Requires Stream Deck software 7.1 or later on Windows 10 or macOS 12 and newer, and a Feishin install with Remote Control enabled under Settings, Remote Control. This is an independent, unofficial plugin, not affiliated with or endorsed by the Feishin project. It is free software under the GPL-3.0 license, and the source is on GitHub.

(1027 characters; Maker Console asks for 250 to 1500.)

## Category

Music. The exact Maker Console category list was not verified when this kit was written, so pick
the closest music or media-playback category offered. (The in-app action group in the manifest is
named "Feishin".)

## Release notes

Version 2.1.0

- Rebuilt on the current Stream Deck SDK (SDK version 3, Node.js 24).
- Actions: Play / Pause, Next, Previous, Shuffle (two-state key), Volume Up, Volume Down, Volume Dial, Transport Dial.
- Host, port, credentials and volume step are set once and shared by every Feishin action.
- Icons follow the Stream Deck icon specification; Volume Up, Volume Down and Volume Dial have their own glyphs.

## Requirements

- Stream Deck software 7.1 or later.
- Windows 10 or later, or macOS 12 or later.
- Feishin (desktop app or server-side host) with its Remote Control server enabled; the host must be reachable from the computer running Stream Deck.
- Stream Deck + for the two dial actions; the key actions work on any Stream Deck with keys.

## License

GPL-3.0, see `LICENSE` in the repository root. Source: https://github.com/joshuawowk/feishin_plugin_v2

This plugin is derived from the GPL-3.0 Feishin Stream Deck plugin by Felitendo
(https://github.com/FeloDeck/Feishin-Plugin), which itself started from Elgato's MIT-licensed
streamdeck-plugin-template. Attribution is in `README.md` and `NOTICE`.

## Submission notes

Risk accepted by the maintainer: Elgato's product guidelines say a maker must own the intellectual
property of what they submit, and the Maker Agreement (Organization Settings in Maker Console) was not
read while preparing this kit. This plugin is a GPL-3.0 derivative of another author's work, so the
maintainer does not hold sole rights to it. Submitting anyway can lead to:

- rejection at review, or removal after publication, if Elgato treats the GPL derivative as failing the ownership requirement;
- a conflict between Maker Agreement terms (licensing, redistribution or exclusivity) and GPL-3.0, whose terms cannot be narrowed for recipients;
- a complaint from the original author or from Elgato's template copyright holder if attribution is judged insufficient.

Steps already taken to reduce the risk: GPL-3.0 kept, the original author credited in the README, the
Elgato MIT notice preserved in `NOTICE`, no Feishin logo used, and unofficial positioning in the name
and on every gallery image. Not done: asking Felitendo for an acknowledgement, and reading the Maker
Agreement against GPL-3.0. Consider linking the source repository in the listing text so recipients
can obtain the corresponding source, as GPL-3.0 requires.

## Assets in this folder

| File | Size | Use |
| --- | --- | --- |
| `listing-icon-288.png` | 288x288 | Product icon |
| `gallery-01.png` | 1920x960 | Overview: product name, keys and the volume dial |
| `gallery-02.png` | 1920x960 | The two dial actions |
| `gallery-03.png` | 1920x960 | Connection to Feishin and the full action list |

The key images are the plugin's shipped key icons. The volume dial faces are CSS drawings that
follow `net.jwowk.feishin.sdPlugin/layouts/volume.json`, not screenshots from hardware.
`marketplace/src/` holds the HTML sources and `marketplace/build.sh` re-renders the gallery PNGs with
headless Chromium.

## Trademark note

"Feishin" is the name of a separate open-source project. This plugin is independent and unofficial.
