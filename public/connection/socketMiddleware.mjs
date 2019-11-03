import PeerConnector from "./PeerConnector.mjs";
import {actionTypes as connectionActions} from './store.mjs';
import {actionTypes as chatActions} from '../chat/store.mjs';

export default function socketMiddleware(store) {
    function onStartedAcceptingConnections(localPeerId) {
        store.dispatch({type: connectionActions.ACCEPTING_CONNECTIONS, payload: localPeerId});
    }

    function onStoppedAcceptingConnections() {
        store.dispatch({type: connectionActions.ACCEPTING_CONNECTIONS, payload: false});
    }

    function onConnected(remotePeerId) {
        store.dispatch({type: connectionActions.CONNECTED, payload: remotePeerId});
    }

    function onDisconnected() {
        store.dispatch({type: connectionActions.CONNECTED, payload: false});
    }

    function onMessageReceived(message) {
        store.dispatch({type: chatActions.MESSAGE_RECEIVED, payload: message});
    }

    const peerConnector = new PeerConnector({
        onStartedAcceptingConnections,
        onStoppedAcceptingConnections,
        onConnected,
        onDisconnected,
        onMessageReceived,
        debugLevel: 2,
    });

    /* Returns the handler that will be called for each action dispatched */
    return next => action => {
        /** @type {State} */
        const state = store.getState();

        if (action.type === connectionActions.CONNECT) {
            peerConnector.connect(action.payload);
        } else if (action.type === connectionActions.DISCONNECT) {
            peerConnector.disconnect();
        } else if (action.type === chatActions.SEND_MESSAGE) {
            if (state.connection.isConnectedToPeer) {
                peerConnector.sendMessage(action.payload);
                store.dispatch({type: chatActions.MESSAGE_SENT});
            } else {
                store.dispatch({type: chatActions.SENDING_FAILED});
            }
        }

        return next(action);
    };
}