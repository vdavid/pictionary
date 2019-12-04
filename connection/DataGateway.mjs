import {actionCreators as gameActionCreators} from '../game/store.mjs';
import {actionCreators as chatActionCreators} from '../chat/store.mjs';
import {actionCreators as guessingCanvasActionCreators} from '../canvases/guessing-canvas-store.mjs';

/**
 * @typedef {Object} GameStateToSendToNewPeer
 * @property {boolean} isGameStarted
 * @property {boolean} isRoundStarting
 * @property {boolean} isRoundStarted
 * @property {boolean} isRoundSolved
 * @property {boolean} isRoundEnded // TODO: Remove this? Perhaps it's not needed
 * @property {string} drawerPeerId
 * @property {string[]} peerIds
 * @property {DrawnLine[]} drawnLinesInCurrentlyRunningTrial
 */

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
            roundSolved: 'roundSolved',
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
     * @param {string} nextDrawerPeerId
     */
    broadcastStartRoundSignal(nextDrawerPeerId) {this._sendToAllPeers(this._messageTypes.startRoundSignal, nextDrawerPeerId);}

    /**
     * @param {string} phrase
     * @param {string} solverPeerId
     */
    broadcastPhraseFiguredOut(phrase, solverPeerId) {this._sendToAllPeers(this._messageTypes.roundSolved, {phrase, solverPeerId});}

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

        const currentRound = state.game.gameLog.rounds[state.game.gameLog.rounds.length - 1];
        const currentTrial = currentRound.trials[currentRound.trials.length - 1];
        /** @type {GameStateToSendToNewPeer} */
        const gameState = {
            isGameStarted: state.game.isGameStarted,
            isRoundStarting: state.game.isRoundStarting,
            isRoundStarted: state.game.isRoundStarted,
            isRoundSolved: state.game.isRoundSolved,
            isRoundEnded: state.game.isRoundEnded,
            drawerPeerId: state.game.drawerPeerId,
            peerIds,
            drawnLinesInCurrentlyRunningTrial: (state.game.isRoundStarted && (currentTrial.trialResult === 'ongoing')) ? currentTrial.lines : [],
        };

        if (this._debugLevel >= 3) {
            console.log('Sent game state to ' + recipientPeerId + ': ' + JSON.stringify(gameState));
        }
        this._connectionPool.getByPeerId(recipientPeerId).send({type: this._messageTypes.gameState, payload: gameState});
    }

    sendLocalPlayerDataToClient(recipientPeerId) {
        const state = this._store.getState();
        if (this._debugLevel >= 3) {
            console.log('Sent local player data to ' + recipientPeerId + ': ' + JSON.stringify(state.game.localPlayer));
        }
        this._connectionPool.getByPeerId(recipientPeerId).send({type: this._messageTypes.localPlayerData, payload: state.game.localPlayer});
    }

    _isMessageACorrectGuess(message, phrase) {
        return (message.trim().toLowerCase().indexOf(phrase.toLowerCase()) > -1);
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
            const nextDrawerPeerId = data.payload;
            this._store.dispatch(gameActionCreators.createStartRoundRequest(nextDrawerPeerId));

        } else if (data.type === this._messageTypes.roundSolved) {
            const state = this._store.getState();
            const {phrase, solverPeerId} = data.payload;
            const solverPlayer = [state.game.localPlayer, state.game.remotePlayers].find(player => player.peerId === solverPeerId);
            if (!solverPlayer) {
                console.log('Problem.');
            }
            this._store.dispatch(gameActionCreators.createMarkRoundSolvedRequest(phrase, solverPeerId));
            this._store.dispatch(chatActionCreators.createSendRoundSolvedRequest(connection.peer, solverPeerId, solverPlayer.name, state.game.localPlayer.peerId, phrase));

        } else if (data.type === this._messageTypes.clearCanvasCommand) {
            const state = this._store.getState();
            if (state.guessingCanvas.lineCount > 0) {
                this._store.dispatch(chatActionCreators.createNoteCanvasWasClearedRequest(false));
                this._store.dispatch(gameActionCreators.createStartNewTrialAfterClearingRequest());
            }
            this._store.dispatch(guessingCanvasActionCreators.createClearRequest());

        } else if (data.type === this._messageTypes.newLines) {
            const newLines = data.payload;
            this._store.dispatch(guessingCanvasActionCreators.createUpdateCanvasRequest(newLines));
            this._store.dispatch(gameActionCreators.createSaveNewLinesRequest(newLines));

        } else if (data.type === this._messageTypes.message) {
            /** @type {State} */
            const state = this._store.getState();
            const isLocalPlayerDrawing = state.game.drawerPeerId === state.game.localPlayer.peerId;
            const messageText = data.payload;
            const senderPlayerName = state.game.remotePlayers.find(player => player.peerId === connection.peer).name;
            this._store.dispatch(chatActionCreators.createAddReceivedMessageRequest(senderPlayerName, messageText));
            this._store.dispatch(gameActionCreators.createAddNewGuessRequest({guesserPeerId: connection.peer, messageText, isCorrect: isLocalPlayerDrawing && this._isMessageACorrectGuess(messageText, state.game.activePhrase)}));

            if (isLocalPlayerDrawing && this._isMessageACorrectGuess(messageText, state.game.activePhrase)) {
                this._store.dispatch(gameActionCreators.createMarkRoundSolvedRequest(state.game.activePhrase, connection.peer));
                this._store.dispatch(chatActionCreators.createSendRoundSolvedRequest(state.game.localPlayer.peerId, connection.peer, senderPlayerName, state.game.localPlayer.peerId, state.game.activePhrase));
            }

        } else if (data.type === this._messageTypes.peerList) {
            this._eventHandlers.onPeerListReceived(data.payload);

        } else if (data.type === this._messageTypes.gameState) {
            const receivedGameState = data.payload;
            this._store.dispatch(gameActionCreators.createSetGameStateRequest(receivedGameState));
            if (receivedGameState.drawnLinesInCurrentlyRunningTrial.length) {
                this._store.dispatch(guessingCanvasActionCreators.createUpdateCanvasRequest(receivedGameState.drawnLinesInCurrentlyRunningTrial));
            }

            this._eventHandlers.onGameStateReceived(receivedGameState);

        } else if (data.type === this._messageTypes.localPlayerData) {
            const player = data.payload;
            this._store.dispatch(gameActionCreators.createAddOrUpdateRemotePlayerRequest(player));

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