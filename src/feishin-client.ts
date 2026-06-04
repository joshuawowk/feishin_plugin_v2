import streamDeck from "@elgato/streamdeck";

/**
 * Connection settings, stored as Stream Deck *global* settings so every action
 * shares one connection. Set once in any action's Property Inspector.
 */
export type GlobalSettings = {
	host?: string;
	port?: string;
	username?: string;
	password?: string;
	/** Volume step (in %) for the up/down keys and dial ticks. */
	volumeStep?: string;
};

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

/** The subset of Feishin playback state we track for button/dial feedback. */
export type FeishinState = {
	connection: ConnectionStatus;
	status: "playing" | "paused" | "unknown";
	volume: number; // 0-100
	shuffle: boolean;
	title: string;
	artist: string;
};

const DEFAULT_PORT = "4333";
const DEFAULT_VOLUME_STEP = 5;
const RECONNECT_MS = 4000;

/**
 * A single shared WebSocket connection to a Feishin Remote Control server.
 *
 * Protocol (see the feishin repo, src/main/features/core/remote/index.ts and
 * src/shared/types/remote-types.ts):
 *   client -> { event: "authenticate", header: "Basic base64(user:pass)" }
 *   client -> { event: "play" | "pause" | "next" | "previous" }
 *   client -> { event: "volume", volume: 0..100 }
 *   server -> { event: "state",    data: { status, volume, song, ... } }   (on connect)
 *   server -> { event: "playback", data: "playing" | "paused" }
 *   server -> { event: "volume",   data: 0..100 }
 *   server -> { event: "song",     data: { name, artistName, ... } | null }
 *
 * Note there is no "toggle": we send "play" or "pause" based on tracked status.
 */
class FeishinClient {
	private ws?: WebSocket;
	private settings: GlobalSettings = {};
	private reconnectTimer?: NodeJS.Timeout;
	private readonly listeners = new Set<() => void>();

	readonly state: FeishinState = {
		connection: "disconnected",
		status: "unknown",
		volume: 0,
		shuffle: false,
		title: "",
		artist: "",
	};

	/** Apply (possibly new) connection settings and (re)connect if they changed. */
	configure(settings: GlobalSettings): void {
		const changed =
			settings.host !== this.settings.host ||
			settings.port !== this.settings.port ||
			settings.username !== this.settings.username ||
			settings.password !== this.settings.password;
		this.settings = settings;
		if (changed || this.ws === undefined) {
			this.reconnect();
		}
	}

	get volumeStep(): number {
		const n = Number(this.settings.volumeStep);
		return Number.isFinite(n) && n > 0 ? n : DEFAULT_VOLUME_STEP;
	}

	subscribe(fn: () => void): () => void {
		this.listeners.add(fn);
		return () => this.listeners.delete(fn);
	}

	private notify(): void {
		for (const fn of this.listeners) {
			try {
				fn();
			} catch (err) {
				streamDeck.logger.error("listener error", err);
			}
		}
	}

	private setConnection(status: ConnectionStatus): void {
		if (this.state.connection !== status) {
			this.state.connection = status;
			this.notify();
		}
	}

	private url(): string | undefined {
		const host = (this.settings.host ?? "").trim();
		if (!host) return undefined;
		const port = (this.settings.port ?? "").trim() || DEFAULT_PORT;
		return `ws://${host}:${port}/`;
	}

	private reconnect(): void {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = undefined;
		}
		this.teardown();
		this.connect();
	}

	private teardown(): void {
		if (this.ws) {
			try {
				this.ws.onopen = this.ws.onclose = this.ws.onerror = this.ws.onmessage = null;
				this.ws.close();
			} catch {
				/* ignore */
			}
			this.ws = undefined;
		}
	}

	private scheduleReconnect(): void {
		if (this.reconnectTimer) return;
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = undefined;
			this.connect();
		}, RECONNECT_MS);
	}

	private connect(): void {
		const url = this.url();
		if (!url) {
			this.setConnection("disconnected");
			return;
		}

		this.setConnection("connecting");
		let ws: WebSocket;
		try {
			ws = new WebSocket(url);
		} catch (err) {
			streamDeck.logger.error("WebSocket construct failed", err);
			this.setConnection("error");
			this.scheduleReconnect();
			return;
		}
		this.ws = ws;

		ws.onopen = () => {
			const user = this.settings.username ?? "";
			const pass = this.settings.password ?? "";
			const header = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
			ws.send(JSON.stringify({ event: "authenticate", header }));
			this.setConnection("connected");
			streamDeck.logger.info(`Connected to Feishin at ${url}`);
		};

		ws.onmessage = (ev: MessageEvent) => this.onMessage(ev);

		ws.onerror = (ev) => {
			streamDeck.logger.warn("Feishin WebSocket error", ev);
			this.setConnection("error");
		};

		ws.onclose = () => {
			if (this.ws === ws) {
				this.ws = undefined;
				this.setConnection("disconnected");
				this.scheduleReconnect();
			}
		};
	}

	private onMessage(ev: MessageEvent): void {
		let msg: { event?: string; data?: unknown };
		try {
			msg = JSON.parse(typeof ev.data === "string" ? ev.data : String(ev.data));
		} catch {
			return;
		}

		switch (msg.event) {
			case "state": {
				const d = (msg.data ?? {}) as {
					status?: string;
					volume?: number;
					shuffle?: boolean;
					song?: { name?: string; artistName?: string } | null;
				};
				if (typeof d.volume === "number") this.state.volume = d.volume;
				if (typeof d.shuffle === "boolean") this.state.shuffle = d.shuffle;
				this.state.status = normalizeStatus(d.status);
				this.applySong(d.song);
				this.notify();
				break;
			}
			case "playback": {
				this.state.status = normalizeStatus(msg.data as string);
				this.notify();
				break;
			}
			case "volume": {
				if (typeof msg.data === "number") {
					this.state.volume = clampVolume(msg.data);
					this.notify();
				}
				break;
			}
			case "shuffle": {
				if (typeof msg.data === "boolean") {
					this.state.shuffle = msg.data;
					this.notify();
				}
				break;
			}
			case "song": {
				this.applySong(msg.data as { name?: string; artistName?: string } | null);
				this.notify();
				break;
			}
			default:
				break; // position / favorite / proxy etc. — not needed for controls
		}
	}

	private applySong(song?: { name?: string; artistName?: string } | null): void {
		this.state.title = song?.name ?? "";
		this.state.artist = song?.artistName ?? "";
	}

	private send(payload: Record<string, unknown>): void {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(payload));
		} else {
			streamDeck.logger.warn("Not connected to Feishin; command dropped", payload);
			// Nudge a reconnect so the next press has a chance to work.
			if (!this.reconnectTimer) this.reconnect();
		}
	}

	// --- Commands -------------------------------------------------------------

	play(): void {
		this.send({ event: "play" });
	}

	pause(): void {
		this.send({ event: "pause" });
	}

	togglePlayPause(): void {
		// Optimistic local flip so the button feels responsive; the server
		// broadcast will correct it if needed.
		if (this.state.status === "playing") {
			this.pause();
			this.state.status = "paused";
		} else {
			this.play();
			this.state.status = "playing";
		}
		this.notify();
	}

	next(): void {
		this.send({ event: "next" });
	}

	previous(): void {
		this.send({ event: "previous" });
	}

	toggleShuffle(): void {
		// The Feishin "shuffle" event is a toggle; flip optimistically and let
		// the server broadcast correct us.
		this.send({ event: "shuffle" });
		this.state.shuffle = !this.state.shuffle;
		this.notify();
	}

	setVolume(volume: number): void {
		const v = clampVolume(volume);
		this.state.volume = v;
		this.send({ event: "volume", volume: v });
		this.notify();
	}

	nudgeVolume(deltaSteps: number): void {
		this.setVolume(this.state.volume + deltaSteps * this.volumeStep);
	}
}

function normalizeStatus(status?: string): FeishinState["status"] {
	if (status === "playing" || status === "paused") return status;
	return "unknown";
}

function clampVolume(v: number): number {
	return Math.max(0, Math.min(100, Math.round(v)));
}

/** Shared singleton used by all actions. */
export const feishin = new FeishinClient();
