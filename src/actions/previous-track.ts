import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

import { feishin } from "../feishin-client";

@action({ UUID: "net.jwowk.feishin.previous" })
export class PreviousTrack extends SingletonAction {
	override onKeyDown(_ev: KeyDownEvent): void {
		feishin.previous();
	}
}
