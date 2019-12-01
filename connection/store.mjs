/**
 * @typedef {Object} ConnectionState
 * @property {boolean} isAcceptingConnections
 * @property {boolean} isConnectingInProgress
 * @property {boolean} isConnectedToPeer
 * @property {boolean} isHost
 * @property {string|undefined} localPeerId Only if listening.
 * @property {string|undefined} remotePeerId Only if connected.
 */

export const actionTypes = {
    START_ACCEPTING_CONNECTIONS_SUCCESS: 'connection/START_ACCEPTING_CONNECTIONS_SUCCESS',
    STOP_ACCEPTING_CONNECTIONS_SUCCESS: 'connection/STOP_ACCEPTING_CONNECTIONS_SUCCESS',
    CONNECT_TO_HOST_REQUEST: 'connection/CONNECT_TO_HOST_REQUEST',
    CONNECT_TO_HOST_FAILURE: 'connection/CONNECT_TO_HOST_FAILURE',
    CONNECT_TO_PEER_SUCCESS: 'connection/CONNECT_TO_PEER_SUCCESS',
    DISCONNECT_FROM_PEER_REQUEST: 'connection/DISCONNECT_FROM_PEER_REQUEST',
    DISCONNECT_FROM_PEER_SUCCESS: 'connection/DISCONNECT_FROM_PEER_SUCCESS',
    TRY_RECONNECTING_TO_HOST_REQUEST: 'connection/TRY_RECONNECTING_TO_HOST_REQUEST',
};

/**
 * @param {ConnectionState} state
 * @returns {ConnectionState}
 */
function _getStateCopy(state) {
    return state ? {
        isAcceptingConnections: state.isAcceptingConnections,
        isConnectingInProgress: state.isConnectingInProgress,
        isConnectedToPeer: state.isConnectedToPeer,
        isHost: state.isHost,
        localPeerId: state.localPeerId,
        remotePeerId: state.remotePeerId,
    } : {
        isAcceptingConnections: false,
        isConnectingInProgress: false,
        isConnectedToPeer: false,
        isHost: undefined,
        localPeerId: undefined,
        remotePeerId: undefined,
    };
}

export const actionCreators = {
    createStartAcceptingConnectionsSuccess: (localPeerId) => ({type: actionTypes.START_ACCEPTING_CONNECTIONS_SUCCESS, payload: localPeerId}),
    createStopAcceptingConnectionsSuccess: () => ({type: actionTypes.STOP_ACCEPTING_CONNECTIONS_SUCCESS}),
    createConnectToHostRequest: (hostId) => ({type: actionTypes.CONNECT_TO_HOST_REQUEST, payload: hostId}),
    createConnectToHostFailure: () => ({type: actionTypes.CONNECT_TO_HOST_FAILURE}),
    createConnectToPeerSuccess: (connectionData) => ({type: actionTypes.CONNECT_TO_PEER_SUCCESS, payload: connectionData}),
    createDisconnectFromPeerRequest: () => ({type: actionTypes.DISCONNECT_FROM_PEER_REQUEST}),
    createDisconnectFromPeerSuccess: () => ({type: actionTypes.DISCONNECT_FROM_PEER_SUCCESS}),
    createTryReconnectingToHostRequest: () => ({type: actionTypes.TRY_RECONNECTING_TO_HOST_REQUEST}),
};

/**
 * @param {ConnectionState} state
 * @param {string|undefined} localPeerId The local peer ID, or undefined if not accepting connections.
 * @private
 */
function _startedAcceptingConnections(state, localPeerId) {
    state.isAcceptingConnections = true;
    state.localPeerId = localPeerId;
}

/**
 * @param {ConnectionState} state
 * @param {string|undefined} localPeerId The local peer ID, or undefined if not accepting connections.
 * @private
 */
function _stoppedAcceptingConnections(state, localPeerId) {
    state.isAcceptingConnections = false;
    state.localPeerId = undefined;
}

/**
 * @param {ConnectionState} state
 * @param {string} payload The remote peer ID.
 * @private
 */
function _connectToHost(state, payload) {
    state.isConnectingInProgress = true;
}
/**
 * @param {ConnectionState} state
 * @param {string} payload The remote peer ID.
 * @private
 */
function _connectToHostFailed(state, payload) {
    state.isConnectingInProgress = false;
}

/**
 * @param {ConnectionState} state
 * @param {{newPeerId: string, isHost: boolean}|boolean} payload Data, or false if just disconnected.
 * @private
 */
function _connected(state, payload) {
    state.isConnectingInProgress = false;
    state.isConnectedToPeer = !!payload;
    state.isHost = payload ? payload.isHost : undefined;
    state.remotePeerId = payload ? payload.newPeerId : undefined;
}

/**
 * @param {ConnectionState} state
 * @private
 */
function _disconnected(state) {
    state.isConnectingInProgress = false;
    state.isConnectedToPeer = false;
    state.isHost = undefined;
    state.remotePeerId = undefined;
}

/**
 * @param {ConnectionState} state
 * @param {{type: string, payload: *}} action
 * @return {ConnectionState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.START_ACCEPTING_CONNECTIONS_SUCCESS]: _startedAcceptingConnections,
        [actionTypes.STOP_ACCEPTING_CONNECTIONS_SUCCESS]: _stoppedAcceptingConnections,
        [actionTypes.CONNECT_TO_HOST_REQUEST]: _connectToHost,
        [actionTypes.CONNECT_TO_HOST_FAILURE]: _connectToHostFailed,
        [actionTypes.CONNECT_TO_PEER_SUCCESS]: _connected,
        [actionTypes.DISCONNECT_FROM_PEER_SUCCESS]: _disconnected,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}