/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

// WebSocket URL for connecting to the Feishin server
const FEISHIN_WS_URL = 'ws://localhost:4333'; // Default URL, make this configurable

// WebSocket connection instance
let feishinWs = null;

// Current playback status, defaulting to 'PAUSED'
let currentPlaybackStatus = 'PAUSED';

// Stream Deck actions for controlling playback and settings
const playPauseAction = new Action('de.felitendo.feishin.playpause');
const nextAction = new Action('de.felitendo.feishin.next');
const previousAction = new Action('de.felitendo.feishin.previous');
const shuffleAction = new Action('de.felitendo.feishin.shuffle');
const repeatAction = new Action('de.felitendo.feishin.repeat');

/**
 * The first event fired when Stream Deck starts.
 * Initializes the connection to the Feishin server.
 */
$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
    console.log('Stream Deck connected!');
    connectToFeishin();
});

/**
 * Establishes a WebSocket connection to the Feishin server.
 * Handles connection events such as open, message, error, and close.
 */
function connectToFeishin() {
    feishinWs = new WebSocket(FEISHIN_WS_URL);

    // Event triggered when the WebSocket connection is successfully opened
    feishinWs.onopen = function() {
        console.log('Connected to Feishin');
        // Authenticate to Feishin Client
        authenticate('feishin', 'streamdeck');
    };

    // Event triggered when a message is received from the Feishin server
    feishinWs.onmessage = function(event) {
        const data = JSON.parse(event.data);
        handleFeishinMessage(data);
    };

    // Event triggered when an error occurs in the WebSocket connection
    feishinWs.onerror = function(error) {
        console.error('Feishin WebSocket Error:', error);
    };

    // Event triggered when the WebSocket connection is closed
    feishinWs.onclose = function() {
        console.log('Disconnected from Feishin');
        // Attempt to reconnect after a delay
        setTimeout(connectToFeishin, 5000);
    };
}

/**
 * Sends an authentication message to the Feishin server.
 * @param {string} username - The username for authentication.
 * @param {string} password - The password for authentication.
 */
function authenticate(username, password) {
    const auth = btoa(`${username}:${password}`); // Encode credentials in Base64
    feishinWs.send(JSON.stringify({
        event: 'authenticate',
        header: `Basic ${auth}`
    }));
}

/**
 * Handles incoming messages from the Feishin server.
 * Updates the Stream Deck buttons based on the message event type.
 * @param {Object} data - The message data received from the server.
 */
function handleFeishinMessage(data) {
    console.log('Received message from Feishin:', data);
    switch(data.event) {
        case 'state': // Update all buttons with the current playback state
            updateAllButtons(data.data);
            break;
        case 'playback': // Update the play/pause button
            updatePlayPauseButton(data.data);
            break;
        case 'shuffle': // Update the shuffle button
            updateShuffleButton(data.data);
            break;
        case 'repeat': // Update the repeat button
            updateRepeatButton(data.data);
            break;
    }
}
/**
 * Updates all buttons on the Stream Deck with the current playback state.
 * @param {Object} state - The current playback state from the Feishin server.
 */
function updateAllButtons(state) {
    updatePlayPauseButton(state.status);
    updateShuffleButton(state.shuffle);
    updateRepeatButton(state.repeat);
}

/**
 * Updates the play/pause button based on the playback status.
 * @param {string|boolean} status - The playback status ('playing', 'paused', or boolean).
 */
function updatePlayPauseButton(status) {
    console.log('Updating play/pause button with status:', status);
    if (typeof status === 'string') {
        currentPlaybackStatus = status.toUpperCase();
    } else if (typeof status === 'boolean') {
        currentPlaybackStatus = status ? 'PLAYING' : 'PAUSED';
    } else {
        console.error('Unexpected status type:', typeof status);
        return;
    }
    
    const isPlaying = currentPlaybackStatus === 'PLAYING';
    playPauseAction.setImage(isPlaying ? 'images/pause.png' : 'images/play.png');
    console.log('Updated play/pause button. Current status:', currentPlaybackStatus);
}

/**
 * Updates the shuffle button based on the shuffle state.
 * @param {boolean} shuffleState - The shuffle state (true for enabled, false for disabled).
 */
function updateShuffleButton(shuffleState) {
    shuffleAction.setImage(shuffleState ? 'images/shuffle_on.png' : 'images/shuffle_off.png');
}

/**
 * Updates the repeat button based on the repeat state.
 * @param {string} repeatState - The repeat state ('NONE', 'ALL', or 'ONE').
 */
function updateRepeatButton(repeatState) {
    switch(repeatState) {
        case 'NONE':
            repeatAction.setImage('images/repeat_off.png');
            break;
        case 'ALL':
            repeatAction.setImage('images/repeat_all.png');
            break;
        case 'ONE':
            repeatAction.setImage('images/repeat_one.png');
            break;
    }
}

/**
 * Handles the play/pause button press event.
 * Sends a play or pause command to the Feishin server and updates the button state.
 */
playPauseAction.onKeyUp(({ action, context, device, event, payload }) => {
    if (feishinWs && feishinWs.readyState === WebSocket.OPEN) {
        const command = currentPlaybackStatus === 'PLAYING' ? 'pause' : 'play';
        feishinWs.send(JSON.stringify({ event: command }));
        console.log('Sent command to Feishin:', command);
        
        // Temporarily update the button state
        updatePlayPauseButton(command === 'play' ? 'PLAYING' : 'PAUSED');
    }
});

/**
 * Handles the next button press event.
 * Sends a 'next' command to the Feishin server to skip to the next track.
 */
nextAction.onKeyUp(({ action, context, device, event, payload }) => {
    if (feishinWs && feishinWs.readyState === WebSocket.OPEN) {
        feishinWs.send(JSON.stringify({ event: 'next' }));
    }
});

/**
 * Handles the previous button press event.
 * Sends a 'previous' command to the Feishin server to go to the previous track.
 */
previousAction.onKeyUp(({ action, context, device, event, payload }) => {
    if (feishinWs && feishinWs.readyState === WebSocket.OPEN) {
        feishinWs.send(JSON.stringify({ event: 'previous' }));
    }
});

/**
 * Handles the shuffle button press event.
 * Sends a 'shuffle' command to the Feishin server to toggle shuffle mode.
 */
shuffleAction.onKeyUp(({ action, context, device, event, payload }) => {
    if (feishinWs && feishinWs.readyState === WebSocket.OPEN) {
        feishinWs.send(JSON.stringify({ event: 'shuffle' }));
    }
});

/**
 * Handles the repeat button press event.
 * Sends a 'repeat' command to the Feishin server to toggle repeat mode.
 */
repeatAction.onKeyUp(({ action, context, device, event, payload }) => {
    if (feishinWs && feishinWs.readyState === WebSocket.OPEN) {
        feishinWs.send(JSON.stringify({ event: 'repeat' }));
    }
});

// You can add more actions here as needed, such as volume control, etc.