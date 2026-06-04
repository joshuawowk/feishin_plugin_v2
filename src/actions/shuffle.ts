import {
	action,
	KeyDownEvent,
	SingletonAction,
	WillAppearEvent,
	WillDisappearEvent,
} from "@elgato/streamdeck";

import { feishin } from "../feishin-client";

/** Key: toggle shuffle on the connected Feishin host. State reflects on/off. */
@action({ UUID: "net.jwowk.feishin.shuffle" })
export class Shuffle extends SingletonAction {
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
		feishin.toggleShuffle();
	}

	private render(ev: WillAppearEvent): void {
		if (!ev.action.isKey()) return;
		// State 0 = shuffle off, State 1 = shuffle on (see manifest).
		void ev.action.setState(feishin.state.shuffle ? 1 : 0);
	}
}
