import PeerConnector from './PeerConnector.mjs';
import {actionTypes as connectionActions, actionCreators as connectionActionCreators} from './store.mjs';
import {actionTypes as gameActions, actionCreators as gameActionCreators} from '../game/store.mjs';
import {actionTypes as chatActions, actionCreators as chatActionCreators} from '../chat/store.mjs';
import {actionTypes as drawingCanvasActions, actionCreators as drawingCanvasActionCreators} from '../canvases/drawing-canvas-store.mjs';
import {actionCreators as guessingCanvasActionCreators} from '../canvases/guessing-canvas-store.mjs';

export default function socketMiddleware(store) {
    /**
     * @param {string} command
     * @param {Object} parameters
     */
    function onCommandReceived(command, parameters) {
        if (command === 'startRound') {
            store.dispatch(gameActionCreators.createStartRoundRequest(parameters.whichPlayerDraws));
        } else if (command === 'phraseGuessedCorrectly') {
            store.dispatch(gameActionCreators.createMarkPhaseGuessedRequest(parameters.phrase));
            store.dispatch(chatActionCreators.createSendPhraseGuessedRequest({whoDrew: 'remote', phrase: parameters.phrase}));
        } else if (command === 'clearGuessingCanvas') {
            // TODO: Add system message to chat about canvas clearing
            store.dispatch(guessingCanvasActionCreators.createClearRequest());
        }
    }

    /**
     * @param {string} message
     */
    function onMessageReceived(message) {
        /** @type {State} */
        const state = store.getState();
        store.dispatch(chatActionCreators.createAddReceivedMessageRequest(message));

        if ((state.game.whichPlayerDraws === 'local') && (message.trim().toLowerCase().indexOf(state.game.activePhrase.toLowerCase()) > -1)) {
            store.dispatch(gameActionCreators.createMarkPhaseGuessedRequest(state.game.activePhrase));
            store.dispatch(chatActionCreators.createSendPhraseGuessedRequest({whoDrew: 'local', phrase: state.game.activePhrase}));
        }
    }

    const peerConnector = new PeerConnector({
        onStartedAcceptingConnections: localPeerId => store.dispatch(connectionActionCreators.createStartAcceptingConnectionsSuccess(localPeerId)),
        onStoppedAcceptingConnections: () => store.dispatch(connectionActionCreators.createStopAcceptingConnectionsSuccess()),
        onConnected: (allConnections, newConnection, isHost) => {
            // noinspection JSUnresolvedVariable
            store.dispatch(connectionActionCreators.createConnectToPeerSuccess({newPeerId: newConnection.peer, isHost}));
            store.dispatch(gameActionCreators.createStartGameRequest());
        },
        onDisconnected: () => store.dispatch(connectionActionCreators.createDisconnectFromPeerSuccess()),
        onCommandReceived,
        onDrawnLinesReceived: drawnLines => store.dispatch(guessingCanvasActionCreators.createUpdateCanvasRequest(drawnLines)),
        onMessageReceived,
        debugLevel: window.location.href.startsWith('http://localhost') ? 2 : 1,
    });

    /**
     * @param {string} hostPeerId
     */
    function _connectToHost(hostPeerId) {
        try {
            peerConnector.connectToHost(hostPeerId);
        } catch (error) {
            store.dispatch(connectionActionCreators.createConnectToHostFailure());
            return false;
        }
    }

    /**
     * TODO: Never dispatched as it's not implemented yet
     */
    function _disconnectFromAllPeers() {
        peerConnector.disconnectFromAllPeers();
    }

    /**
     * @param {string} message
     */
    function _sendChatMessage(message) {
        const state = store.getState();
        if (state.connection.isConnectedToPeer) {
            if (state.game.whichPlayerDraws !== 'local' || (message.toLowerCase() !== state.game.activePhrase)) {
                peerConnector.sendMessage(message);
            } else {
                /* Silently just not sending the active phrase */
            }
            store.dispatch(chatActionCreators.createSendMessageSuccess());
        } else {
            store.dispatch(chatActionCreators.createSendMessageFailure());
        }
    }

    /**
     * @param {DrawnLine[]} newDrawnLines The lines drawn since the last action
     */
    function _drawingUpdated(newDrawnLines) {
        if (newDrawnLines.length) {
            peerConnector.sendNewLines(newDrawnLines);
            store.dispatch(drawingCanvasActionCreators.createSendNewLinesToGuessersSuccess(newDrawnLines.length));
        }
    }

    /**
     * @param {'local'|'remote'} whichPlayerDraws
     */
    function _sendStartSignalToPeerIfThisIsTheHost(whichPlayerDraws) {
        /** @type {State} */
        const state = store.getState();

        if (state.connection.isHost) {
            peerConnector.sendCommand('startRound', {whichPlayerDraws: ((whichPlayerDraws === 'local') ? 'remote' : 'local')});
        }
    }

    /**
     * @param {string} phrase
     */
    function _sendPhraseGuessedCorrectlyCommandIfThisIsTheDrawingPlayer(phrase) {
        /** @type {State} */
        const state = store.getState();

        if (state.game.whichPlayerDraws === 'local') {
            peerConnector.sendCommand('phraseGuessedCorrectly', {phrase});
        } else {
            store.dispatch(guessingCanvasActionCreators.createClearRequest());
        }
    }

    function _setActivePhrase() {
        store.dispatch(drawingCanvasActionCreators.createClearRequest());
    }

    function _notifyPeerToClearGuessingCanvas() {
        peerConnector.sendCommand('clearGuessingCanvas', {});
    }

    /**
     * @returns {boolean}
     * @private
     */
    function _tryReconnectingToPeerServer() {
        peerConnector.tryReconnectingToPeerServer();
    }

    /* Returns the handler that will be called for each action dispatched */
    return next => action => {
        /** @type {Object<string, function(*): boolean|void>} If they return ===false then next() won't be called */
        const actionTypeToFunctionMap = {
            [connectionActions.CONNECT_TO_HOST_REQUEST]: _connectToHost, /* Client side */
            [connectionActions.DISCONNECT_FROM_PEER_REQUEST]: _disconnectFromAllPeers,
            [chatActions.SEND_MESSAGE_REQUEST]: _sendChatMessage, /* Both sides */
            [drawingCanvasActions.SEND_NEW_LINES_TO_GUESSERS_REQUEST]: _drawingUpdated, /* Drawing side only */
            [gameActions.START_ROUND_REQUEST]: _sendStartSignalToPeerIfThisIsTheHost,
            [gameActions.MARK_PHASE_GUESSED_REQUEST]: _sendPhraseGuessedCorrectlyCommandIfThisIsTheDrawingPlayer, /* Both sides */
            [gameActions.SET_ACTIVE_PHRASE_REQUEST]: _setActivePhrase, /* Drawing side only */
            [drawingCanvasActions.CLEAR_REQUEST]: _notifyPeerToClearGuessingCanvas, /* Drawing side only */
            [connectionActions.TRY_RECONNECTING_TO_HOST_REQUEST]: _tryReconnectingToPeerServer,
        };

        const result = (actionTypeToFunctionMap[action.type]) ? actionTypeToFunctionMap[action.type](action.payload) : undefined;

        if (result !== false) {
            next(action);
        }
    };
}