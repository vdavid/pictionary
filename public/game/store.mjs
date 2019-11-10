/**
 * @typedef {Object} GameState
 * @property {boolean} isGameStarted
 * @property {boolean} isRoundStarting
 * @property {boolean} isRoundStarted
 * @property {Number} secondsRemaining
 * @property {int} localPlayerPoints
 * @property {int} remotePlayerPoints
 * @property {'local'|'remote'|undefined} whichPlayerDraws
 */

export const actionTypes = {
    START_GAME: 'game/startGame',
    START_ROUND: 'game/startRound',
    ROUND_STARTED: 'game/roundStarted',
    TIME_IS_UP: 'game/timeIsUp',
    ROUND_FINISHED: 'game/roundFinished',
    UPDATE_SECONDS_REMAINING: 'game/updateSecondsRemaining',
};

/**
 * @param {GameState} state
 * @returns {*}
 */
function _getStateCopy(state) {
    return state ? {
        isGameStarted: state.isGameStarted,
        isRoundStarting: state.isRoundStarting,
        isRoundStarted: state.isRoundStarted,
        secondsRemaining: state.secondsRemaining,
        localPlayerPoints: state.localPlayerPoints,
        remotePlayerPoints: state.remotePlayerPoints,
        whichPlayerDraws: state.whichPlayerDraws,
        activePhrase: state.activePhrase,
    } : {
        isGameStarted: false,
        isRoundStarting: false,
        isRoundStarted: false,
        secondsRemaining: undefined,
        localPlayerPoints: 0,
        remotePlayerPoints: 0,
        whichPlayerDraws: undefined,
        activePhrase: undefined,
    };
}

/**
 * @param {GameState} state
 * @param {{type: string, payload: *}} action
 * @return {GameState}
 */
export function reducer(state, action) {
    const newState = _getStateCopy(state);

    if (action.type === actionTypes.START_GAME) { /* Payload: undefined */
        newState.isGameStarted = true;
        newState.isRoundStarting = false;
        newState.isRoundStarted = false;
    } else if (action.type === actionTypes.START_ROUND) { /* Payload: {'local' or 'remote'} */
        newState.isRoundStarting = true;
        newState.isRoundStarted = false;
        newState.whichPlayerDraws = action.payload;
    } else if (action.type === actionTypes.ROUND_STARTED) { /* Payload: undefined */
        newState.isRoundStarting = false;
        newState.isRoundStarted = true;
    } else if (action.type === actionTypes.TIME_IS_UP) { /* Payload: undefined */
        newState.secondsRemaining = 0;
    } else if (action.type === actionTypes.ROUND_FINISHED) {
        newState.isRoundStarting = false;
        newState.isRoundStarted = false;
    } else if (action.type === actionTypes.UPDATE_SECONDS_REMAINING) { /* Payload: {float} seconds */
        newState.secondsRemaining = action.payload;
    }

    return newState;
}