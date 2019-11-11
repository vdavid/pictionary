import PeerConnector from './PeerConnector.mjs';
import {actionTypes as connectionActions} from './store.mjs';
import {actionTypes as gameActions} from '../game/store.mjs';
import {actionTypes as chatActions} from '../chat/store.mjs';
import {actionTypes as drawingCanvasActions} from '../canvases/drawing-canvas-store.mjs';
import {actionTypes as guessingCanvasActions} from '../canvases/guessing-canvas-store.mjs';

export default function socketMiddleware(store) {
    function onStartedAcceptingConnections(localPeerId) {
        store.dispatch({type: connectionActions.STARTED_ACCEPTING_CONNECTIONS, payload: localPeerId});
    }

    function onStoppedAcceptingConnections() {
        store.dispatch({type: connectionActions.STOPPED_ACCEPTING_CONNECTIONS});
    }

    function onConnected(remotePeerId, isHost) {
        store.dispatch({type: connectionActions.CONNECTED, payload: {remotePeerId, isHost}});
        store.dispatch({type: gameActions.START_GAME});
    }

    function onDisconnected() {
        store.dispatch({type: connectionActions.CONNECTED, payload: undefined});
    }

    /**
     * @param {string} command
     * @param {Object} parameters
     */
    function onCommandReceived(command, parameters) {
        if (command === 'startRound') {
            store.dispatch({type: gameActions.START_ROUND, payload: parameters.whichPlayerDraws});
        } else if (command === 'phraseGuessedCorrectly') {
            store.dispatch({type: gameActions.PHRASE_GUESSED_CORRECTLY, payload: parameters.phrase});
            store.dispatch({type: chatActions.PHRASE_GUESSED_CORRECTLY, payload: {whoDrew: 'remote', phrase: parameters.phrase}});
        } else if (command === 'clearGuessingCanvas') {
            // TODO: Add system message to chat about canvas clearing
            store.dispatch({type: guessingCanvasActions.CLEARING_NEEDED});
        }
    }

    /**
     * @param {DrawnLine[] }drawnLines
     */
    function onDrawnLinesReceived(drawnLines) {
        store.dispatch({type: guessingCanvasActions.DRAWING_UPDATED, payload: drawnLines});
    }

    /**
     * @param {string} message
     */
    function onMessageReceived(message) {
        /** @type {State} */
        const state = store.getState();
        store.dispatch({type: chatActions.MESSAGE_RECEIVED, payload: message});

        if ((state.game.whichPlayerDraws === 'local') && (message.trim().toLowerCase().indexOf(state.game.activePhrase.toLowerCase()) > -1)) {
            store.dispatch({type: gameActions.PHRASE_GUESSED_CORRECTLY, payload: state.game.activePhrase});
            store.dispatch({type: chatActions.PHRASE_GUESSED_CORRECTLY, payload: {whoDrew: 'local', phrase: state.game.activePhrase}});
        }
    }

    const peerConnector = new PeerConnector({
        onStartedAcceptingConnections,
        onStoppedAcceptingConnections,
        onConnected,
        onDisconnected,
        onCommandReceived,
        onDrawnLinesReceived,
        onMessageReceived,
        debugLevel: window.location.href.startsWith('http://localhost') ? 2 : 1,
    });

    /**
     * @param {string} remotePeerId
     */
    function _connectToPeer(remotePeerId) {
        peerConnector.connect(remotePeerId);
    }

    /**
     * TODO: Never dispatched as it's not implemented yet
     */
    function _disconnectFromPeer() {
        peerConnector.disconnect();
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
            store.dispatch({type: chatActions.MESSAGE_SENT});
        } else {
            store.dispatch({type: chatActions.SENDING_FAILED});
        }
    }

    /**
     * @param {DrawnLine[]} newDrawnLines The lines drawn since the last action
     */
    function _drawingUpdated(newDrawnLines) {
        if (newDrawnLines.length) {
            peerConnector.sendNewLines(newDrawnLines);
            store.dispatch({type: drawingCanvasActions.NEW_LINES_PROCESSED, payload: newDrawnLines.length});
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
            store.dispatch({type: guessingCanvasActions.CLEARING_NEEDED});
        }
    }

    function _setActivePhrase() {
        store.dispatch({type: drawingCanvasActions.CLEARING_NEEDED});
    }

    function _notifyPeerToClearGuessingCanvas() {
        peerConnector.sendCommand('clearGuessingCanvas', {});
    }

    function _tryReconnectingToPeerServer() {
        peerConnector.createPeer();
    }

    /* Returns the handler that will be called for each action dispatched */
    return next => action => {
        const actionTypeToFunctionMap = {
            [connectionActions.CONNECT]: _connectToPeer, /* Peer (not host) side */
            [connectionActions.DISCONNECT]: _disconnectFromPeer,
            [chatActions.SEND_MESSAGE]: _sendChatMessage, /* Both sides */
            [drawingCanvasActions.DRAWING_UPDATED]: _drawingUpdated, /* Drawing side only */
            [gameActions.START_ROUND]: _sendStartSignalToPeerIfThisIsTheHost,
            [gameActions.PHRASE_GUESSED_CORRECTLY]: _sendPhraseGuessedCorrectlyCommandIfThisIsTheDrawingPlayer, /* Both sides */
            [gameActions.SET_ACTIVE_PHRASE]: _setActivePhrase, /* Drawing side only */
            [drawingCanvasActions.CLEARING_NEEDED]: _notifyPeerToClearGuessingCanvas, /* Drawing side only */
            [drawingCanvasActions.TRY_RECONNECTING_TO_PEER_SERVER]: _tryReconnectingToPeerServer,
        };

        if (actionTypeToFunctionMap[action.type]) {
            actionTypeToFunctionMap[action.type](action.payload);
        }

        return next(action);
    };
}