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

/** Stream Deck + dial: rotate = volume, press/tap = play-pause. Shows volume %. */
@action({ UUID: "net.jwowk.feishin.volumedial" })
export class VolumeDial extends SingletonAction {
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

	override onDialRotate(ev: DialRotateEvent): void {
		feishin.nudgeVolume(ev.payload.ticks);
	}

	override onDialDown(_ev: DialDownEvent): void {
		feishin.togglePlayPause();
	}

	override onTouchTap(_ev: TouchTapEvent): void {
		feishin.togglePlayPause();
	}

	private render(ev: WillAppearEvent | DialRotateEvent): void {
		if (!ev.action.isDial()) return;
		const v = feishin.state.volume;
		void ev.action.setFeedback({
			label: "Volume",
			value: `${v}%`,
			indicator: { value: v },
		});
	}
}
