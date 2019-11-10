import PeerConnector from "./PeerConnector.mjs";
import {actionTypes as gameActions} from '../game/store.mjs';
import {actionTypes as connectionActions} from './store.mjs';
import {actionTypes as chatActions} from '../chat/store.mjs';
import {actionTypes as drawingCanvasActions} from '../drawing-canvas/store.mjs';
import {actionTypes as guessingCanvasActions} from '../guessing-canvas/store.mjs';

export default function socketMiddleware(store) {
    function onStartedAcceptingConnections(localPeerId) {
        store.dispatch({type: connectionActions.ACCEPTING_CONNECTIONS, payload: localPeerId});
    }

    function onStoppedAcceptingConnections() {
        store.dispatch({type: connectionActions.ACCEPTING_CONNECTIONS, payload: false});
    }

    function onConnected(remotePeerId, isHost) {
        store.dispatch({type: connectionActions.CONNECTED, payload: {remotePeerId, isHost}});
        store.dispatch({type: gameActions.START_GAME});
    }

    function onDisconnected() {
        store.dispatch({type: connectionActions.CONNECTED, payload: false});
    }

    /**
     * @param {string} command
     * @param {Object} parameters
     */
    function onCommandReceived(command, parameters) {
        if (command === 'startRound') {
            store.dispatch({type: gameActions.START_ROUND, payload: parameters.startingPlayer});
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
        store.dispatch({type: chatActions.MESSAGE_RECEIVED, payload: message});
    }


    const peerConnector = new PeerConnector({
        onStartedAcceptingConnections,
        onStoppedAcceptingConnections,
        onConnected,
        onDisconnected,
        onCommandReceived,
        onDrawnLinesReceived,
        onMessageReceived,
        debugLevel: 3,
    });

    /* Returns the handler that will be called for each action dispatched */
    return next => action => {
        /** @type {State} */
        const state = store.getState();

        if (action.type === connectionActions.CONNECT) { /* Payload: {string} The remote peer ID */
            peerConnector.connect(action.payload);
        } else if (action.type === connectionActions.DISCONNECT) { /* TODO: Never dispatched as it's not implemented yet */
            peerConnector.disconnect();
        } else if (action.type === chatActions.SEND_MESSAGE) { /* Payload: {string} The chat message */
            if (state.connection.isConnectedToPeer) {
                peerConnector.sendMessage(action.payload);
                store.dispatch({type: chatActions.MESSAGE_SENT});
            } else {
                store.dispatch({type: chatActions.SENDING_FAILED});
            }
        } else if (action.type === drawingCanvasActions.DRAWING_UPDATED) { /* Payload: {DrawnLine[]} The new lines drawn since the last action */
            if (action.payload.length) {
                peerConnector.sendNewLines(action.payload);
                store.dispatch({type: drawingCanvasActions.NEW_LINES_PROCESSED, payload: action.payload.length});
            }
        } else if (action.type === gameActions.START_ROUND) { /* Payload: {'local' or 'remote'} */
            if (state.connection.isHost) {
                peerConnector.sendCommand('startRound', {startingPlayer: action.payload === 'local' ? 'remote' : 'local'});
            }
        }

        return next(action);
    };
}