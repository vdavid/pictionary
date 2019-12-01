import RandomNameGenerator from './RandomNameGenerator.mjs';

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
    UPDATE_OTHER_PLAYERS_REQUEST: 'player/UPDATE_OTHER_PLAYERS_REQUEST',
};

/**
 * @param {PlayerState} state
 * @returns {PlayerState}
 */
function _getStateCopy(state) {
    return state ? {
        localPlayer: state.localPlayer,
        otherPlayers: state.otherPlayers,
    } : {
        localPlayer: {name: (new RandomNameGenerator()).getRandomName(), score: 0, peerId: undefined},
        otherPlayers: [],
    };
}

export const actionCreators = {
    createUpdateLocalPlayerRequest: (localPlayer) => ({type: actionTypes.UPDATE_LOCAL_PLAYER_REQUEST, payload: localPlayer}),
    createUpdateOtherPlayersRequest: (otherPlayers) => ({type: actionTypes.UPDATE_OTHER_PLAYERS_REQUEST, payload: otherPlayers}),
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
 * @param {Player[]} otherPlayers
 * @private
 */
function _updateOtherPlayers(state, otherPlayers) {
    state.otherPlayers = otherPlayers;
}

/**
 * @param {PlayerState} state
 * @param {{type: string, payload: *, error: boolean?, meta: *?}} action
 * @return {PlayerState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.UPDATE_LOCAL_PLAYER_REQUEST]: _updateLocalPlayer,
        [actionTypes.UPDATE_OTHER_PLAYERS_REQUEST]: _updateOtherPlayers,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}