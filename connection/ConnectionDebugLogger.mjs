import {messageTypes} from './message-types.mjs';

export default class ConnectionDebugLogger {
    constructor(debugLevel) {
        this._debugLevel = debugLevel;
    }

    logIncomingMessage(peerId, type, payload) {
        if (this._debugLevel >= 3) {
            if (type === messageTypes.command) {
                console.log('Received from ' + peerId + ': command: ' + payload.command + ' with parameters: ' + payload.parameters);
            } else if (type === messageTypes.newLines) {
                console.log('Received from ' + peerId + ': ' + payload.length + ' new lines.');
            } else if (type === messageTypes.message) {
                console.log('Received from ' + peerId + ': message: ' + payload);
            } else if (type === messageTypes.gameState) {
                console.log('Received from ' + peerId + ' Game state: ' + JSON.stringify(payload));
            } else {
                console.log('Received from ' + peerId + ' ' + type + ': ' + JSON.stringify(payload));
            }
        }
    }

    logOutgoingMessage(peerId, type, payload) {
        if (this._debugLevel >= 3) {
            if (type === messageTypes.newLines) {
                console.log('Sent to ' + peerId + ': ' + length + ' new lines.');
            } else if (type === messageTypes.message) {
                console.log('Sent to ' + peerId + ': message: ' + payload);
            } else if (type === messageTypes.gameState) {
                console.log('Sent to ' + peerId + ': Game state: ' + JSON.stringify(payload));
            } else {
                console.log('Sent to ' + peerId + ': ' + type + ': ' + JSON.stringify(payload));
            }
        }

    }
}