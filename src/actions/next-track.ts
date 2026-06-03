import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

import { feishin } from "../feishin-client";

@action({ UUID: "net.jwowk.feishin.next" })
export class NextTrack extends SingletonAction {
	override onKeyDown(_ev: KeyDownEvent): void {
		feishin.next();
	}
}
