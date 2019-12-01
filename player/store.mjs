/**
 * @typedef {Object} Player
 * @property {string} name
 * @property {number} score
 * @property {string} peerId
 */

/**
 * @typedef {Object} PlayerState
 * @property {Player} localPlayer
 * @property {Player[]} otherPlayers
 */

export const actionTypes = {
    UPDATE_LOCAL_PLAYER_REQUEST: 'player/UPDATE_LOCAL_PLAYER_REQUEST',
    UPDATE_REMOTE_PLAYER_REQUEST: 'player/UPDATE_REMOTE_PLAYER_REQUEST',
    ADD_OR_UPDATE_REMOTE_PLAYER_REQUEST: 'player/ADD_OR_UPDATE_REMOTE_PLAYER_REQUEST',
    REMOVE_REMOTE_PLAYER_REQUEST: 'player/REMOVE_REMOTE_PLAYER_REQUEST',
};

/**
 * @param {PlayerState} state
 * @returns {PlayerState}
 */
function _getStateCopy(state) {
    return state ? {
        localPlayer: {
            name: state.localPlayer.name,
            score: state.localPlayer.score,
            peerId: state.localPlayer.peerId,
        },
        otherPlayers: state.otherPlayers.map(player => ({name: player.name, score: player.score, peerId: player.peerId})),
    } : {
        localPlayer: {name: '', score: 0, peerId: undefined},
        otherPlayers: [],
    };
}

export const actionCreators = {
    createUpdateLocalPlayerRequest: (localPlayer) => ({type: actionTypes.UPDATE_LOCAL_PLAYER_REQUEST, payload: localPlayer}),
    createAddOrUpdateRemotePlayerRequest: (remotePlayer) => ({type: actionTypes.ADD_OR_UPDATE_REMOTE_PLAYER_REQUEST, payload: remotePlayer}),
    createRemoveRemotePlayerRequest: (peerId) => ({type: actionTypes.REMOVE_REMOTE_PLAYER_REQUEST, payload: peerId}),
};

/**
 * @param {PlayerState} state
 * @param {Player} localPlayer May contain only partial data
 * @private
 */
function _updateLocalPlayer(state, localPlayer) {
    state.localPlayer.name = (localPlayer.name !== undefined) ? localPlayer.name : state.localPlayer.name;
    state.localPlayer.score = (localPlayer.score !== undefined) ? localPlayer.score : state.localPlayer.score;
    state.localPlayer.peerId = (localPlayer.peerId !== undefined) ? localPlayer.peerId : state.localPlayer.peerId;
}

/**
 * @param {PlayerState} state
 * @param {Player} remotePlayer May contain only partial data, but peerId is needed to identify the player.
 * @private
 */
function _addOrUpdateRemotePlayer(state, remotePlayer) {
    const player = state.otherPlayers.find(player => player.peerId === remotePlayer.peerId);
    if (player) {
        player.name = (remotePlayer.name !== undefined) ? remotePlayer.name : player.name;
        player.score = (remotePlayer.score !== undefined) ? remotePlayer.score : player.score;
    } else {
        state.otherPlayers.push(remotePlayer);
    }
}

/**
 * @param {PlayerState} state
 * @param {string} remotePeerId
 * @private
 */
function _removeRemotePlayer(state, remotePeerId) {
    const playerIndex = state.otherPlayers.findIndex(player => player.peerId === remotePeerId);
    if (playerIndex >= 0) {
        state.otherPlayers.splice(playerIndex, 1);
    }
}

/**
 * @param {PlayerState} state
 * @param {{type: string, payload: *, error: boolean?, meta: *?}} action
 * @return {PlayerState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.UPDATE_LOCAL_PLAYER_REQUEST]: _updateLocalPlayer,
        [actionTypes.ADD_OR_UPDATE_REMOTE_PLAYER_REQUEST]: _addOrUpdateRemotePlayer,
        [actionTypes.REMOVE_REMOTE_PLAYER_REQUEST]: _removeRemotePlayer,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}