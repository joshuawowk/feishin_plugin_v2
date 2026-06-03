import {
	action,
	DialDownEvent,
	DialRotateEvent,
	SingletonAction,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent,
} from "@elgato/streamdeck";

import { feishin } from "../feishin-client";

/**
 * Stream Deck + dial: rotate = previous/next track, press/tap = play-pause.
 * Shows the current track. Rotation is accumulated so one detent = one skip.
 */
@action({ UUID: "net.jwowk.feishin.transport" })
export class TransportDial extends SingletonAction {
	private readonly unsub = new Map<string, () => void>();
	private accumulated = 0;

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

	override onDialRotate(ev: DialRotateEvent): void {
		this.accumulated += ev.payload.ticks;
		while (this.accumulated >= 1) {
			feishin.next();
			this.accumulated -= 1;
		}
		while (this.accumulated <= -1) {
			feishin.previous();
			this.accumulated += 1;
		}
	}

	override onDialDown(_ev: DialDownEvent): void {
		feishin.togglePlayPause();
	}

	override onTouchTap(_ev: TouchTapEvent): void {
		feishin.togglePlayPause();
	}

	private render(ev: WillAppearEvent | DialRotateEvent): void {
		if (!ev.action.isDial()) return;
		const s = feishin.state;
		const title = s.status === "playing" ? "▶ Playing" : s.status === "paused" ? "⏸ Paused" : "Feishin";
		void ev.action.setFeedback({
			title,
			value: s.title || (s.connection === "connected" ? "—" : "Disconnected"),
		});
	}
}
