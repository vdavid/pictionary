import {connectionListenerStatus} from './connection-listener-status.mjs';

/**
 * @typedef {Object} ConnectionStatus
 * @property {string} remotePeerId
 * @property {boolean} isIncoming
 * @property {boolean} isConfirmed
 * @property {boolean} isIntroSent
 * @property {boolean} isIntroReceived
 * @property {boolean} isThisTheConnectionToTheHost
 */
/**
 * @typedef {Object} ConnectionState
 * @property {string|undefined} localPeerId Only if listening.
 * @property {string} connectionListenerStatus One of the `connectionListenerStatus` constants.
 * @property {ConnectionStatus[]} connections
 * @property {string} hostPeerId Redundant data derived from `connections`.
 */

export const actionTypes = {
    START_ACCEPTING_CONNECTIONS_SUCCESS: 'connection/START_ACCEPTING_CONNECTIONS_SUCCESS',
    DISCONNECT_FROM_PEER_SERVER_SUCCESS: 'connection/DISCONNECT_FROM_PEER_SERVER_SUCCESS',
    UPDATE_STATUS: 'connection/UPDATE_STATUS',
    CONNECT_TO_HOST_REQUEST: 'connection/CONNECT_TO_HOST_REQUEST',
    MARK_ROUND_ENDED_REQUEST: 'connection/MARK_ROUND_ENDED_REQUEST',
    ADD_NEW_CONNECTION: 'connection/ADD_NEW_CONNECTION',
    SET_CONNECTION_AS_CONFIRMED: 'connection/SET_CONNECTION_AS_CONFIRMED',
    SET_CONNECTION_INTRO_SENT: 'connection/SET_CONNECTION_INTRO_SENT',
    SET_CONNECTION_INTRO_RECEIVED: 'connection/SET_CONNECTION_INTRO_RECEIVED',
    REMOVE_CONNECTION: 'connection/REMOVE_CONNECTION',
    TRY_RECONNECTING_TO_PEER_SERVER_REQUEST: 'connection/TRY_RECONNECTING_TO_PEER_SERVER_REQUEST',
};

/**
 * @param {ConnectionState} state
 * @returns {ConnectionState}
 */
function _getStateCopy(state) {
    return state ? {
        localPeerId: state.localPeerId,
        connectionListenerStatus: state.connectionListenerStatus,
        connections: state.connections.map(connection => ({
            remotePeerId: connection.remotePeerId,
            isIncoming: connection.isIncoming,
            isConfirmed: connection.isConfirmed,
            isIntroSent: connection.isIntroSent,
            isIntroReceived: connection.isIntroReceived,
            isThisTheConnectionToTheHost: connection.isThisTheConnectionToTheHost,
        })),
        hostPeerId: state.hostPeerId,
    } : {
        localPeerId: null,
        connectionListenerStatus: connectionListenerStatus.shouldConnectToPeerServer,
        connections: [],
        hostPeerId: null,
    };
}

export const actionCreators = {
    createStartAcceptingConnectionsSuccess: (localPeerId) => ({type: actionTypes.START_ACCEPTING_CONNECTIONS_SUCCESS, payload: localPeerId}),
    createDisconnectFromPeerServerSuccess: () => ({type: actionTypes.DISCONNECT_FROM_PEER_SERVER_SUCCESS}),
    createUpdateStatusRequest: (status) => ({type: actionTypes.UPDATE_STATUS, payload: status}),
    createConnectToHostRequest: (hostPeerId) => ({type: actionTypes.CONNECT_TO_HOST_REQUEST, payload: hostPeerId}),
    createAddNewConnectionRequest: (remotePeerId, isIncoming, isThisTheConnectionToTheHost) => ({type: actionTypes.ADD_NEW_CONNECTION, payload: {remotePeerId, isIncoming, isThisTheConnectionToTheHost}}),
    createRemoveConnectionRequest: (remotePeerId) => ({type: actionTypes.REMOVE_CONNECTION, payload: remotePeerId}),
    createSetConnectionAsConfirmedRequest: (remotePeerId) => ({type: actionTypes.SET_CONNECTION_AS_CONFIRMED, payload: remotePeerId}),
    createSetConnectionIntroSentRequest: (remotePeerId) => ({type: actionTypes.SET_CONNECTION_INTRO_SENT, payload: remotePeerId}),
    createSetConnectionIntroReceivedRequest: (remotePeerId) => ({type: actionTypes.SET_CONNECTION_INTRO_RECEIVED, payload: remotePeerId}),
    createTryReconnectingToPeerServerRequest: () => ({type: actionTypes.TRY_RECONNECTING_TO_PEER_SERVER_REQUEST}),
};

/**
 * @param {ConnectionState} state
 * @param {{type: string, payload: *, error: boolean?, meta: *?}} action
 * @return {ConnectionState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.START_ACCEPTING_CONNECTIONS_SUCCESS]: _startedAcceptingConnections,
        [actionTypes.DISCONNECT_FROM_PEER_SERVER_SUCCESS]: _stoppedAcceptingConnections,
        [actionTypes.UPDATE_STATUS]: _updateStatus,
        [actionTypes.CONNECT_TO_HOST_REQUEST]: _connectToHost,
        [actionTypes.ADD_NEW_CONNECTION]: _addNewConnection,
        [actionTypes.REMOVE_CONNECTION]: _removeConnection,
        [actionTypes.SET_CONNECTION_AS_CONFIRMED]: _setConnectionAsConfirmed,
        [actionTypes.SET_CONNECTION_INTRO_SENT]: _setConnectionIntroSent,
        [actionTypes.SET_CONNECTION_INTRO_RECEIVED]: _setConnectionIntroReceived,
        [actionTypes.TRY_RECONNECTING_TO_PEER_SERVER_REQUEST]: _tryReconnectingToPeerServer,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}

/**
 * @param {ConnectionState} state
 * @param {string|undefined} localPeerId The local peer ID, or undefined if not accepting connections.
 * @private
 */
function _startedAcceptingConnections(state, localPeerId) {
    state.connectionListenerStatus = connectionListenerStatus.listeningForConnections;
    state.localPeerId = localPeerId;
}

/**
 * @param {ConnectionState} state
 * @private
 */
function _stoppedAcceptingConnections(state) {
    state.connectionListenerStatus = connectionListenerStatus.notConnectedToPeerServer;
    state.localPeerId = undefined;
}

/**
 * @param {ConnectionState} state
 * @param {string} status
 * @private
 */
function _updateStatus(state, status) {
    state.connectionListenerStatus = status;
}

/**
 * @param {ConnectionState} state
 * @param {string} hostPeerId The remote peer ID.
 * @private
 */
function _connectToHost(state, hostPeerId) {
    state.hostPeerId = hostPeerId;
    state.connectionListenerStatus = connectionListenerStatus.shouldConnectToHost;
}

/**
 * @param {ConnectionState} state
 * @param {{remotePeerId: string, isIncoming: boolean, isThisTheConnectionToTheHost: boolean}} argument
 */
function _addNewConnection(state, {remotePeerId, isIncoming, isThisTheConnectionToTheHost}) {
    state.connections.push({remotePeerId, isIncoming, isConfirmed: false, isIntroSent: false, isIntroReceived: false, isThisTheConnectionToTheHost});
    if(isIncoming && isThisTheConnectionToTheHost) {
        state.hostPeerId = state.localPeerId;
    }
}

/**
 * @param {ConnectionState} state
 * @param {string} remotePeerId
 */
function _setConnectionAsConfirmed(state, remotePeerId) {
    state.connections.find(connectionStatus => connectionStatus.remotePeerId === remotePeerId).isConfirmed = true;
}

/**
 * @param {ConnectionState} state
 * @param {string} remotePeerId
 */
function _setConnectionIntroSent(state, remotePeerId) {
    const connection = state.connections.find(connectionStatus => connectionStatus.remotePeerId === remotePeerId);
    connection.isIntroSent = true;
    if (connection.isThisTheConnectionToTheHost && connection.isConfirmed && connection.isIntroSent && connection.isIntroReceived) {
        state.connectionListenerStatus = connectionListenerStatus.connectedToHost;
    }
}

/**
 * @param {ConnectionState} state
 * @param {string} remotePeerId
 */
function _setConnectionIntroReceived(state, remotePeerId) {
    const connection = state.connections.find(connectionStatus => connectionStatus.remotePeerId === remotePeerId);
    connection.isIntroReceived = true;
    if (connection.isThisTheConnectionToTheHost && connection.isConfirmed && connection.isIntroSent && connection.isIntroReceived) {
        state.connectionListenerStatus = connectionListenerStatus.connectedToHost;
    }
}

/**
 * @param {ConnectionState} state
 * @param {string} remotePeerId
 */
function _removeConnection(state, remotePeerId) {
    const connectionIndex = state.connections.findIndex(connectionStatus => connectionStatus.remotePeerId);
    if (connectionIndex > -1) {
        const deletedConnections = state.connections.splice(connectionIndex, 1);
        if (deletedConnections[0].isThisTheConnectionToTheHost) {
            state.connectionListenerStatus = connectionListenerStatus.listeningForConnections;
        }
        if (state.connections.length === 0) {
            state.connectionListenerStatus = connectionListenerStatus.listeningForConnections;
        }
    } else {
        console.error('Very weird, but can\'t find this connection: ' + remotePeerId);
    }
}

/**
 * @param {ConnectionState} state
 * @private
 */
function _tryReconnectingToPeerServer(state) {
    if (state.connectionListenerStatus === connectionListenerStatus.notConnectedToPeerServer) {
        state.connectionListenerStatus = connectionListenerStatus.shouldConnectToPeerServer;
    }
}
