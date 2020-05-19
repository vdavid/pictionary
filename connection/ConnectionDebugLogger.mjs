import {messageTypes} from './message-types.mjs';

export default class ConnectionDebugLogger {
    /**
     * @param {ConsoleLogger} logger
     */
    constructor({logger}) {
        this._logger = logger;
    }

    logIncomingMessage(peerId, type, payload) {
        if (type === messageTypes.command) {
            this._logger.debug('Received from ' + peerId + ': command: ' + payload.command + ' with parameters: ' + payload.parameters);
        } else if (type === messageTypes.newLines) {
            this._logger.debug('Received from ' + peerId + ': ' + payload.length + ' new lines.');
        } else if (type === messageTypes.message) {
            this._logger.debug('Received from ' + peerId + ': message: ' + payload);
        } else if (type === messageTypes.gameState) {
            this._logger.debug('Received from ' + peerId + ' Game state: ' + JSON.stringify(payload));
        } else {
            this._logger.debug('Received from ' + peerId + ' ' + type + ': ' + JSON.stringify(payload));
        }
    }

    logOutgoingMessage(peerId, type, payload) {
        if (type === messageTypes.newLines) {
            this._logger.debug('Sent to ' + peerId + ': ' + payload.length + ' new lines.');
        } else if (type === messageTypes.message) {
            this._logger.debug('Sent to ' + peerId + ': message: ' + payload);
        } else if (type === messageTypes.gameState) {
            this._logger.debug('Sent to ' + peerId + ': Game state: ' + JSON.stringify(payload));
        } else {
            this._logger.debug('Sent to ' + peerId + ': ' + type + ': ' + JSON.stringify(payload));
        }
    }
}