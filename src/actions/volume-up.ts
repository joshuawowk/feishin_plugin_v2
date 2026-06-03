import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

import { feishin } from "../feishin-client";

@action({ UUID: "net.jwowk.feishin.volumeup" })
export class VolumeUp extends SingletonAction {
	override onKeyDown(_ev: KeyDownEvent): void {
		feishin.nudgeVolume(+1);
	}
}
