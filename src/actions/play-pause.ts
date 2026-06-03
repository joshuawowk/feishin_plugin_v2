import {
	action,
	KeyDownEvent,
	SingletonAction,
	WillAppearEvent,
	WillDisappearEvent,
} from "@elgato/streamdeck";

import { feishin } from "../feishin-client";

@action({ UUID: "net.jwowk.feishin.playpause" })
export class PlayPause extends SingletonAction {
	private readonly unsub = new Map<string, () => void>();

	override onWillAppear(ev: WillAppearEvent): void {
		this.unsub.set(
			ev.action.id,
			feishin.subscribe(() => this.render(ev)),
		);
		this.render(ev);
	}

	override onWillDisappear(ev: WillDisappearEvent): void {
		this.unsub.get(ev.action.id)?.();
		this.unsub.delete(ev.action.id);
	}

	override onKeyDown(_ev: KeyDownEvent): void {
		feishin.togglePlayPause();
	}

	private render(ev: WillAppearEvent): void {
		if (!ev.action.isKey()) return;
		const playing = feishin.state.status === "playing";
		void ev.action.setTitle(playing ? "Pause" : "Play");
	}
}
