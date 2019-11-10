/**
 * @typedef {Object} ConnectionState
 * @property {boolean} isAcceptingConnections
 * @property {boolean} isConnectingInProgress
 * @property {boolean} isConnectedToPeer
 * @property {boolean} isHost
 * @property {string|null} localPeerId
 * @property {string} status
 */

export const actionTypes = {
    ACCEPTING_CONNECTIONS: 'connection/acceptingConnections',
    CONNECT: 'connection/connect',
    CONNECTED: 'connection/connected',
    DISCONNECT: 'connection/disconnect',
};

/**
 * @param {ConnectionState} state
 * @param {{type: string, payload: *}} action
 * @return {ConnectionState}
 */
export function reducer(state, action) {
    /** @type {ConnectionState} */
    const newState = state ? {
        isAcceptingConnections: state.isAcceptingConnections,
        isConnectingInProgress: state.isConnectingInProgress,
        isConnectedToPeer: state.isConnectedToPeer,
        isHost: state.isHost,
        localPeerId: state.localPeerId,
        status: state.status,
    } : {
        isAcceptingConnections: false,
        isConnectingInProgress: false,
        isConnectedToPeer: false,
        isHost: undefined,
        localPeerId: null,
        status: 'Disconnected',
    };

    if (action.type === actionTypes.ACCEPTING_CONNECTIONS) { /* Payload: {string|false} The local peer ID, or false if not accepting connections. */
        newState.isAcceptingConnections = !!action.payload;
        newState.localPeerId = action.payload || null;
        newState.status = 'Awaiting connection at "' + action.payload + '"...';
    } else if (action.type === actionTypes.CONNECT) { /* Payload: {string} The remote peer ID */
        newState.isConnectingInProgress = true;
    } else if (action.type === actionTypes.CONNECTED) { /* Payload: {{remotePeerId: string, isHost: boolean}|false} Data, or false if just disconnected. */
        newState.isConnectingInProgress = false;
        newState.isConnectedToPeer = !!action.payload;
        newState.isHost = action.payload ? action.payload.isHost : undefined;
        newState.status = action.payload ? 'I\'m ' + state.localPeerId
            + ', connected to ' + action.payload.remotePeerId + '.' : 'Connection lost.';
    }

    return newState;
}