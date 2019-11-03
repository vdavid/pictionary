/**
 * @typedef {Object} ConnectionState
 * @property {boolean} isAcceptingConnections
 * @property {boolean} isConnectingInProgress
 * @property {boolean} isConnectedToPeer
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
 * @param {{type: string, payload: 'addMessage'|'saveTypedMessage'}} action
 * @return {ConnectionState}
 */
export function reducer(state, action) {
    /** @type {ConnectionState} */
    const newState = state ? {
        isAcceptingConnections: state.isAcceptingConnections,
        isConnectingInProgress: state.isConnectingInProgress,
        isConnectedToPeer: state.isConnectedToPeer,
        localPeerId: state.localPeerId,
        status: state.status,
    } : {
        isAcceptingConnections: false,
        isConnectingInProgress: false,
        isConnectedToPeer: false,
        localPeerId: null,
        status: 'Disconnected',
    };

    if (action.type === actionTypes.ACCEPTING_CONNECTIONS) {
        newState.isAcceptingConnections = !!action.payload;
        newState.localPeerId = action.payload || null;
        newState.status = 'Awaiting connection at "' + action.payload + '"...';
    } else if (action.type === actionTypes.CONNECT) {
        newState.isConnectingInProgress = true;
    } else if (action.type === actionTypes.CONNECTED) {
        newState.isConnectedToPeer = !!action.payload;
        newState.isConnectingInProgress = false;
        newState.status = action.payload
            ? 'Connected to ' + action.payload + '.'
            : 'Connection lost.';
    }

    return newState;
}