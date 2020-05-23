import {messageTypes} from './message-types.mjs';

export default class ConnectionDebugLogger {
    /**
     * @param {ConsoleLogger} logger
     */
    constructor({logger}) {
        this._logger = logger;
    }

    /**
     * @param {string} peerId
     * @param {string} type
     * @param {any} payload
     * @param {int} roundIndex
     */
    logIncomingMessage(peerId, type, payload, roundIndex) {
        if (type === messageTypes.command) {
            this._logger.debug('Received from ' + peerId + ': command: ' + payload.command + ' with parameters: ' + payload.parameters + ' (Round #' + roundIndex + ')');
        } else if (type === messageTypes.newLines) {
            this._logger.debug('Received from ' + peerId + ': ' + payload.length + ' new lines. (Round #' + roundIndex + ')');
        } else if (type === messageTypes.message) {
            this._logger.debug('Received from ' + peerId + ': message: ' + payload + ' (Round #' + roundIndex + ')');
        } else if (type === messageTypes.gameState) {
            this._logger.debug('Received from ' + peerId + ' Game state: ' + JSON.stringify(payload) + ' (Round #' + roundIndex + ')');
        } else {
            this._logger.debug('Received from ' + peerId + ' ' + type + ': ' + JSON.stringify(payload) + ' (Round #' + roundIndex + ')');
        }
    }

    /**
     * @param {string} peerId
     * @param {string} type
     * @param {any} payload
     * @param {int} roundIndex
     */
    logOutgoingMessage(peerId, type, payload, roundIndex) {
        if (type === messageTypes.newLines) {
            this._logger.debug('Sent to ' + peerId + ': ' + payload.length + ' new lines. (Round #' + roundIndex + ')');
        } else if (type === messageTypes.message) {
            this._logger.debug('Sent to ' + peerId + ': message: ' + payload + ' (Round #' + roundIndex + ')');
        } else if (type === messageTypes.gameState) {
            this._logger.debug('Sent to ' + peerId + ': Game state: ' + JSON.stringify(payload) + ' (Round #' + roundIndex + ')');
        } else {
            this._logger.debug('Sent to ' + peerId + ': ' + type + ': ' + JSON.stringify(payload) + ' (Round #' + roundIndex + ')');
        }
    }
}