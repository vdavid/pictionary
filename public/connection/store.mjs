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
    STARTED_ACCEPTING_CONNECTIONS: 'connection/startedAcceptingConnections',
    STOPPED_ACCEPTING_CONNECTIONS: 'connection/stoppedAcceptingConnections',
    CONNECT: 'connection/connect',
    CONNECTED: 'connection/connected',
    DISCONNECT: 'connection/disconnect',
};

/**
 * @param {ConnectionState} state
 * @returns {*}
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
function _connect(state, payload) {
    state.isConnectingInProgress = true;
}

/**
 * @param {ConnectionState} state
 * @param {{remotePeerId: string, isHost: boolean}|boolean} payload Data, or false if just disconnected.
 * @private
 */
function _connected(state, payload) {
    state.isConnectingInProgress = false;
    state.isConnectedToPeer = !!payload;
    state.isHost = payload ? payload.isHost : undefined;
    state.remotePeerId = payload ? payload.remotePeerId : undefined;
}

/**
 * @param {ConnectionState} state
 * @param {{type: string, payload: *}} action
 * @return {ConnectionState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.STARTED_ACCEPTING_CONNECTIONS]: _startedAcceptingConnections,
        [actionTypes.STOPPED_ACCEPTING_CONNECTIONS]: _stoppedAcceptingConnections,
        [actionTypes.CONNECT]: _connect,
        [actionTypes.CONNECTED]: _connected,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}