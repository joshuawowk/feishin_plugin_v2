import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

import { feishin } from "../feishin-client";

@action({ UUID: "net.jwowk.feishin.volumedown" })
export class VolumeDown extends SingletonAction {
	override onKeyDown(_ev: KeyDownEvent): void {
		feishin.nudgeVolume(-1);
	}
}
