import PeerConnector from './PeerConnector.mjs';
import {actionTypes as connectionActions, actionCreators as connectionActionCreators} from './store.mjs';
import {actionTypes as gameActions} from '../game/store.mjs';
import {actionTypes as chatActions, actionCreators as chatActionCreators} from '../chat/store.mjs';
import {actionTypes as drawingCanvasActions, actionCreators as drawingCanvasActionCreators} from '../canvases/drawing-canvas-store.mjs';
import {actionCreators as guessingCanvasActionCreators} from '../canvases/guessing-canvas-store.mjs';

export default function socketMiddleware(store) {
    const peerConnector = new PeerConnector(store, {
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
     * @param {string} message
     */
    function _sendChatMessage(message) {
        const state = store.getState();
        if (state.connection.isConnectedToAnyPeers) {
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

    /**
     * @param {string} clientPeerId
     * @private
     */
    function _sendGameStatusToClientRequest(clientPeerId) {
        /** @type {State} */
        const state = store.getState();
        peerConnector.sendGameStateToClient(clientPeerId, {
            isGameStarted: state.game.isGameStarted,
            isRoundStarted: state.game.isRoundStarted,
        });
    }

    /* Returns the handler that will be called for each action dispatched */
    return next => action => {
        /** @type {Object<string, function(*): boolean|void>} If they return ===false then next() won't be called */
        const actionTypeToFunctionMap = {
            [connectionActions.CONNECT_TO_HOST_REQUEST]: _connectToHost, /* Client side */
            [chatActions.SEND_MESSAGE_REQUEST]: _sendChatMessage, /* Both sides */
            [drawingCanvasActions.SEND_NEW_LINES_TO_GUESSERS_REQUEST]: _drawingUpdated, /* Drawing side only */
            [gameActions.START_ROUND_REQUEST]: _sendStartSignalToPeerIfThisIsTheHost,
            [gameActions.MARK_PHASE_GUESSED_REQUEST]: _sendPhraseGuessedCorrectlyCommandIfThisIsTheDrawingPlayer, /* Both sides */
            [gameActions.SET_ACTIVE_PHRASE_REQUEST]: _setActivePhrase, /* Drawing side only */
            [drawingCanvasActions.CLEAR_REQUEST]: _notifyPeerToClearGuessingCanvas, /* Drawing side only */
            [connectionActions.TRY_RECONNECTING_TO_HOST_REQUEST]: _tryReconnectingToPeerServer,
            [connectionActions.SEND_GAME_STATUS_TO_CLIENT_REQUEST]: _sendGameStatusToClientRequest,
        };

        const result = (actionTypeToFunctionMap[action.type]) ? actionTypeToFunctionMap[action.type](action.payload) : undefined;

        if (result !== false) {
            return next(action);
        }
    };
}