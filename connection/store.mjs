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
    UPDATE_CONNECTIONS_SUCCESS: 'connection/UPDATE_CONNECTIONS_SUCCESS',
    TRY_RECONNECTING_TO_HOST_REQUEST: 'connection/TRY_RECONNECTING_TO_HOST_REQUEST',
    SEND_GAME_STATUS_TO_CLIENT_REQUEST: 'connection/SEND_GAME_STATUS_TO_CLIENT_REQUEST',
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
    createUpdateConnectionsSuccess: (localPeerId, allPeerIds, hostPeerId) =>  ({type: actionTypes.UPDATE_CONNECTIONS_SUCCESS, payload: {localPeerId, allPeerIds, hostPeerId}}),
    createTryReconnectingToHostRequest: () => ({type: actionTypes.TRY_RECONNECTING_TO_HOST_REQUEST}),
    createSendGameStatusToClientRequest: (clientPeerId) => ({type: actionTypes.SEND_GAME_STATUS_TO_CLIENT_REQUEST, payload: clientPeerId})
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
 * @param {{localPeerId: string, allPeerIds: string[], hostPeerId: string}} payload
 * @private
 */
function _updateConnections(state, payload) {
    state.isConnectingInProgress = false;
    state.isConnectedToPeer = payload.allPeerIds.length > 0;
    state.isHost = state.isConnectedToPeer && (payload.localPeerId === payload.hostPeerId);
    state.remotePeerId = state.isConnectedToPeer ? payload.allPeerIds[0] : undefined;
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
        [actionTypes.UPDATE_CONNECTIONS_SUCCESS]: _updateConnections,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}