import {actionCreators as gameActionCreators} from '../game/store.mjs';
import {actionCreators as chatActionCreators} from '../chat/store.mjs';
import {actionCreators as guessingCanvasActionCreators} from '../canvases/guessing-canvas-store.mjs';

export default class DataGateway {
    /**
     * @param {{dispatch: function, getState(): State}} store
     * @param {ConnectionPool} connectionPool
     * @param {Object<string, function>} eventHandlers
     * @param {int} [debugLevel] 0 Prints no logs. 1 Prints only errors. 2 Prints errors and warnings. 3 Prints all logs.
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
        };

        this._onCommandReceived = this._onCommandReceived.bind(this);
        this._onMessageReceived = this._onMessageReceived.bind(this);
    }


    /**
     * @param {string} message
     */
    broadcastChatMessage(message) {
        if (this._debugLevel >= 2) {
            console.log('Sent: message: ' + message);
        }
        this._sendToAllPeers({type: this._messageTypes.message, payload: message});
    }

    /**
     * @param {DrawnLine[]} newLines
     */
    broadcastNewLines(newLines) {
        if (this._debugLevel >= 2) {
            console.log('Sent: ' + newLines.length + ' new lines.');
        }
        this._sendToAllPeers({type: this._messageTypes.newLines, payload: newLines});
    }

    /**
     * @param {string} command
     * @param {Object} parameters
     */
    broadcastCommand(command, parameters) {
        if (this._debugLevel >= 2) {
            console.log('Sent: command: ' + command + ' with parameters: ' + JSON.stringify(parameters));
        }
        this._sendToAllPeers({type: this._messageTypes.command, payload: {command, parameters}});
    }

    /**
     * @param {string[]} latestPeerIds
     */
    broadcastKnownPeerList(latestPeerIds) {
        if (this._debugLevel >= 2) {
            console.log('Sent: peer IDs: ' + latestPeerIds.join(', '));
        }
        this._sendToAllPeers({type: this._messageTypes.peerList, payload: latestPeerIds});
    }

    /**
     * @param {string} peerId
     * @param {{isGameStarted: boolean, isRoundStarted: boolean}} gameState
     */
    sendGameStateToClient(peerId, gameState) {
        const peerIds = this._connectionPool.getAllConnectedPeerIds();
        peerIds.splice(peerIds.indexOf(peerId), 1);

        // noinspection JSUnresolvedFunction
        this._connectionPool.getByPeerId(peerId).send({type: this._messageTypes.gameState, payload: {...gameState, peerIds}});
    }

    /**
     * @param {string} command
     * @param {Object} parameters
     */
    _onCommandReceived(command, parameters) {
        if (command === 'startRound') {
            this._store.dispatch(gameActionCreators.createStartRoundRequest(parameters.whichPlayerDraws));
        } else if (command === 'phraseGuessedCorrectly') {
            this._store.dispatch(gameActionCreators.createMarkPhaseGuessedRequest(parameters.phrase));
            this._store.dispatch(chatActionCreators.createSendPhraseGuessedRequest({whoDrew: 'remote', phrase: parameters.phrase}));
        } else if (command === 'clearGuessingCanvas') {
            // TODO: Add system message to chat about canvas clearing
            this._store.dispatch(guessingCanvasActionCreators.createClearRequest());
        }
    }

    /**
     * @param {string} message
     */
    _onMessageReceived(message) {
        /** @type {State} */
        const state = this._store.getState();
        this._store.dispatch(chatActionCreators.createAddReceivedMessageRequest(message));

        if ((state.game.whichPlayerDraws === 'local') && (message.trim().toLowerCase().indexOf(state.game.activePhrase.toLowerCase()) > -1)) {
            this._store.dispatch(gameActionCreators.createMarkPhaseGuessedRequest(state.game.activePhrase));
            this._store.dispatch(chatActionCreators.createSendPhraseGuessedRequest({whoDrew: 'local', phrase: state.game.activePhrase}));
        }
    }


    /**
     * @param {DataConnection} connection
     * @param {{type: string, payload: *}} data
     * @private
     */
    handleConnectionDataReceived(connection, data) {
        /* Log */
        if (this._debugLevel >= 2) {
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
            }
        }

        if (data.type === this._messageTypes.command) {
            this._onCommandReceived(data.payload.command, data.payload.parameters);
        } else if (data.type === this._messageTypes.newLines) {
            this._store.dispatch(guessingCanvasActionCreators.createUpdateCanvasRequest(data.payload))
        } else if (data.type === this._messageTypes.message) {
            this._onMessageReceived(data.payload);
        } else if (data.type === this._messageTypes.peerList) {
            this._eventHandlers.onPeerListReceived(data.payload);
        } else if (data.type === this._messageTypes.gameState) {
            this._eventHandlers.onGameStateReceived(data.payload);

        } else if (this._debugLevel >= 2) {
            console.warn('Invalid data received from peer.');
            console.warn(data);
        }
    }

    /**
     * @param {Object} payload
     * @private
     */
    _sendToAllPeers(payload) {
        // noinspection JSUnresolvedFunction
        this._connectionPool.getAllConnections().forEach(connection => connection.send(payload));
    }
}