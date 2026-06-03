import streamDeck from "@elgato/streamdeck";

import { NextTrack } from "./actions/next-track";
import { PlayPause } from "./actions/play-pause";
import { PreviousTrack } from "./actions/previous-track";
import { TransportDial } from "./actions/transport-dial";
import { VolumeDial } from "./actions/volume-dial";
import { VolumeDown } from "./actions/volume-down";
import { VolumeUp } from "./actions/volume-up";
import { feishin, GlobalSettings } from "./feishin-client";

streamDeck.logger.setLevel("info");

streamDeck.actions.registerAction(new PlayPause());
streamDeck.actions.registerAction(new NextTrack());
streamDeck.actions.registerAction(new PreviousTrack());
streamDeck.actions.registerAction(new VolumeUp());
streamDeck.actions.registerAction(new VolumeDown());
streamDeck.actions.registerAction(new VolumeDial());
streamDeck.actions.registerAction(new TransportDial());

// Connection settings live in *global* settings so all actions share one
// WebSocket. Configure on startup and whenever the Property Inspector saves.
streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((ev) => {
	feishin.configure(ev.settings);
});

streamDeck.connect().then(async () => {
	const settings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
	feishin.configure(settings);
});
