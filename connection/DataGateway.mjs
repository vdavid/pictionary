import {actionCreators as gameActionCreators} from '../game/store.mjs';
import {actionCreators as playerActionCreators} from '../player/store.mjs';
import {actionCreators as chatActionCreators} from '../chat/store.mjs';
import {actionCreators as guessingCanvasActionCreators} from '../canvases/guessing-canvas-store.mjs';

export default class DataGateway {
    /**
     * @param {{dispatch: function, getState: function(): State}} store
     * @param {ConnectionPool} connectionPool
     * @param {Object<string, function>} eventHandlers
     * @param {int} [debugLevel] 0 Prints no logs. 1 Prints only errors. 2 Prints errors and warnings. 3 Prints infos. 4 Verbose logging.
     *        Default is 0.
     */
    constructor(store, connectionPool, eventHandlers, debugLevel = 0) {
        this._store = store;
        this._connectionPool = connectionPool;
        this._eventHandlers = eventHandlers;
        this._debugLevel = debugLevel;
        this._messageTypes = {
            message: 'message',
            newLines: 'newLines',
            command: 'command',
            peerList: 'peerList',
            gameState: 'gameState',
            localPlayerData: 'localPlayerData',
            startRoundSignal: 'startRoundSignal',
            phraseFiguredOut: 'phraseFiguredOut',
            clearCanvasCommand: 'clearCanvasCommand',
        };
    }

    /**
     * @param {string} message
     */
    broadcastChatMessage(message) {this._sendToAllPeers(this._messageTypes.message, message);}

    /**
     * @param {DrawnLine[]} newLines
     */
    broadcastNewLines(newLines) {this._sendToAllPeers(this._messageTypes.newLines, newLines);}

    /**
     * @param {'local'|'remote'} whichPlayerDraws
     */
    broadcastStartRoundSignal(whichPlayerDraws) {this._sendToAllPeers(this._messageTypes.startRoundSignal, whichPlayerDraws);}

    /**
     * @param {string} phrase
     */
    broadcastPhraseFiguredOut(phrase) {this._sendToAllPeers(this._messageTypes.phraseFiguredOut, phrase);}

    broadcastClearCanvasCommand() {this._sendToAllPeers(this._messageTypes.clearCanvasCommand, null);}

    /**
     * @param {string[]} latestPeerIds
     */
    broadcastKnownPeerList(latestPeerIds) {this._sendToAllPeers(this._messageTypes.peerList, latestPeerIds);}

    /**
     * @param {string} recipientPeerId
     */
    sendGameStateToClient(recipientPeerId) {
        const state = this._store.getState();
        const peerIds = this._connectionPool.getAllConnectedPeerIds();
        peerIds.splice(peerIds.indexOf(recipientPeerId), 1);

        const gameState = {
            isGameStarted: state.game.isGameStarted,
            isRoundStarted: state.game.isRoundStarted,
            peerIds
        };

        if (this._debugLevel >= 3) {
            console.log('Sent game state to ' + recipientPeerId + ': ' + JSON.stringify(gameState));
        }
        this._connectionPool.getByPeerId(recipientPeerId).send({type: this._messageTypes.gameState, payload: gameState});
    }

    sendLocalPlayerDataToClient(recipientPeerId) {
        const state = this._store.getState();
        if (this._debugLevel >= 3) {
            console.log('Sent local player data to ' + recipientPeerId + ': ' + JSON.stringify(state.players.localPlayer));
        }
        this._connectionPool.getByPeerId(recipientPeerId).send({type: this._messageTypes.localPlayerData, payload: state.players.localPlayer});
    }

    /**
     * @param {DataConnection} connection
     * @param {{type: string, payload: *}} data
     * @private
     */
    handleConnectionDataReceived(connection, data) {
        /* Log */
        if (this._debugLevel >= 3) {
            if (data.type === this._messageTypes.command) {
                console.log('Received: command: ' + data.payload.command + ' with parameters: ' + data.payload.parameters);
            } else if (data.type === this._messageTypes.newLines) {
                console.log('Received: ' + data.payload.length + ' new lines.');
            } else if (data.type === this._messageTypes.message) {
                console.log('Received: message: ' + data.payload);
            } else if (data.type === this._messageTypes.peerList) {
                console.log('Received info: Peer IDs: ' + data.payload.join(', '));
            } else if (data.type === this._messageTypes.gameState) {
                console.log('Received info: Game state: ' + JSON.stringify(data.payload));
            } else {
                console.log('Received ' + data.type + ': ' + JSON.stringify(data.payload));
            }
        }

        if (data.type === this._messageTypes.startRoundSignal) {
            const whichPlayerDraws = data.payload;
            this._store.dispatch(gameActionCreators.createStartRoundRequest(whichPlayerDraws));

        } else if (data.type === this._messageTypes.phraseFiguredOut) {
            const phrase = data.payload;
            this._store.dispatch(gameActionCreators.createMarkPhaseGuessedRequest(phrase));
            this._store.dispatch(chatActionCreators.createSendPhraseGuessedRequest({whoDrew: 'remote', phrase}));

        } else if (data.type === this._messageTypes.clearCanvasCommand) {
            const state = this._store.getState();
            if (state.guessingCanvas.lineCount > 0) {
                this._store.dispatch(chatActionCreators.createNoteCanvasWasClearedRequest('remote'));
            }
            this._store.dispatch(guessingCanvasActionCreators.createClearRequest());

        } else if (data.type === this._messageTypes.newLines) {
            const newLines = data.payload;
            this._store.dispatch(guessingCanvasActionCreators.createUpdateCanvasRequest(newLines));

        } else if (data.type === this._messageTypes.message) {
            /** @type {State} */
            const state = this._store.getState();
            const message = data.payload;
            this._store.dispatch(chatActionCreators.createAddReceivedMessageRequest(message));

            if ((state.game.whichPlayerDraws === 'local') && (message.trim().toLowerCase().indexOf(state.game.activePhrase.toLowerCase()) > -1)) {
                this._store.dispatch(gameActionCreators.createMarkPhaseGuessedRequest(state.game.activePhrase));
                this._store.dispatch(chatActionCreators.createSendPhraseGuessedRequest({whoDrew: 'local', phrase: state.game.activePhrase}));
            }

        } else if (data.type === this._messageTypes.peerList) {
            this._eventHandlers.onPeerListReceived(data.payload);

        } else if (data.type === this._messageTypes.gameState) {
            this._eventHandlers.onGameStateReceived(data.payload);

        } else if (data.type === this._messageTypes.localPlayerData) {
            const player = data.payload;
            this._store.dispatch(playerActionCreators.createAddOrUpdateRemotePlayerRequest(player));

        } else if (this._debugLevel >= 2) {
            console.warn('Invalid data received from peer.');
            console.warn(data);
        }
    }

    /**
     * @param {string} type
     * @param {*} payload
     * @private
     */
    _sendToAllPeers(type, payload) {
        /* Log */
        if (this._debugLevel >= 3) {
            if (type === this._messageTypes.newLines) {
                console.log('Sent: ' + length + ' new lines.');
            } else if (type === this._messageTypes.message) {
                console.log('Sent: message: ' + payload);
            } else if (type === this._messageTypes.peerList) {
                console.log('Sent: peer IDs: ' + payload.join(', '));
            } else if (type === this._messageTypes.gameState) {
                console.log('Received info: Game state: ' + JSON.stringify(payload));
            } else {
                console.log('Sent: ' + type + ': ' + JSON.stringify(payload));
            }
        }

        // noinspection JSUnresolvedFunction
        this._connectionPool.getAllConnections().forEach(connection => connection.send({type, payload}));
    }
}