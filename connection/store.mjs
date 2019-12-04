/**
 * @typedef {Object} ConnectionState
 * @property {boolean} isAcceptingConnections
 * @property {boolean} isConnectingToHost
 * @property {{peerId: string}[]} aliveConnections
 * @property {boolean} isConnectedToAnyPeers
 * @property {string|undefined} localPeerId Only if listening.
 * @property {string|undefined} hostPeerId Only if connected.
 */

export const actionTypes = {
    START_ACCEPTING_CONNECTIONS_SUCCESS: 'connection/START_ACCEPTING_CONNECTIONS_SUCCESS',
    STOP_ACCEPTING_CONNECTIONS_SUCCESS: 'connection/STOP_ACCEPTING_CONNECTIONS_SUCCESS',
    CONNECT_TO_HOST_REQUEST: 'connection/CONNECT_TO_HOST_REQUEST',
    CONNECT_TO_HOST_FAILURE: 'connection/CONNECT_TO_HOST_FAILURE',
    UPDATE_CONNECTIONS_SUCCESS: 'connection/UPDATE_CONNECTIONS_SUCCESS',
    TRY_RECONNECTING_TO_HOST_REQUEST: 'connection/TRY_RECONNECTING_TO_HOST_REQUEST',
};

/**
 * @param {ConnectionState} state
 * @returns {ConnectionState}
 */
function _getStateCopy(state) {
    return state ? {
        isAcceptingConnections: state.isAcceptingConnections,
        isConnectingToHost: state.isConnectingToHost,
        aliveConnections: state.aliveConnections,
        isConnectedToAnyPeers: state.isConnectedToAnyPeers,
        localPeerId: state.localPeerId,
        hostPeerId: state.hostPeerId,
    } : {
        isAcceptingConnections: false,
        isConnectingToHost: false,
        aliveConnections: [],
        isConnectedToAnyPeers: false,
        localPeerId: undefined,
        hostPeerId: undefined,
    };
}

export const actionCreators = {
    createStartAcceptingConnectionsSuccess: (localPeerId) => ({type: actionTypes.START_ACCEPTING_CONNECTIONS_SUCCESS, payload: localPeerId}),
    createStopAcceptingConnectionsSuccess: () => ({type: actionTypes.STOP_ACCEPTING_CONNECTIONS_SUCCESS}),
    createConnectToHostRequest: (hostId) => ({type: actionTypes.CONNECT_TO_HOST_REQUEST, payload: hostId}),
    createConnectToHostFailure: () => ({type: actionTypes.CONNECT_TO_HOST_FAILURE}),
    createUpdateConnectionsSuccess: (localPeerId, allPeerIds, hostPeerId) =>  ({type: actionTypes.UPDATE_CONNECTIONS_SUCCESS, payload: {localPeerId, allPeerIds, hostPeerId}}),
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
    state.isConnectingToHost = true;
}
/**
 * @param {ConnectionState} state
 * @param {string} payload The remote peer ID.
 * @private
 */
function _connectToHostFailed(state, payload) {
    state.isConnectingToHost = false;
}

/**
 * @param {ConnectionState} state
 * @param {{localPeerId: string, allPeerIds: string[], hostPeerId: string}} payload
 * @private
 */
function _updateConnections(state, payload) {
    state.isConnectingToHost = false;
    state.aliveConnections = payload.allPeerIds.map(peerId => ({peerId}));
    state.isConnectedToAnyPeers = payload.allPeerIds.length > 0;
    state.localPeerId = payload.localPeerId || undefined;
    state.hostPeerId = payload.hostPeerId || undefined;
}

/**
 * @param {ConnectionState} state
 * @param {{type: string, payload: *, error: boolean?, meta: *?}} action
 * @return {ConnectionState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.START_ACCEPTING_CONNECTIONS_SUCCESS]: _startedAcceptingConnections,
        [actionTypes.STOP_ACCEPTING_CONNECTIONS_SUCCESS]: _stoppedAcceptingConnections,
        [actionTypes.CONNECT_TO_HOST_REQUEST]: _connectToHost,
        [actionTypes.CONNECT_TO_HOST_FAILURE]: _connectToHostFailed,
        [actionTypes.UPDATE_CONNECTIONS_SUCCESS]: _updateConnections,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}