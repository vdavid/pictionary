/**
 * @typedef {Object} GameState
 * @property {boolean} isStarting
 * @property {boolean} isStarted
 * @property {Number} secondsRemaining
 */

export const actionTypes = {
    START_GAME: 'game/startGame',
    GAME_STARTING: 'game/gameStarting',
    GAME_STARTED: 'game/gameStarted',
    GAME_FINISHED: 'game/gameFinished',
    UPDATE_SECONDS_REMAINING: 'game/updateSecondsRemaining',
};

/**
 * @param {GameState} state
 * @param {{type: string, payload: *}} action
 * @return {GameState}
 */
export function reducer(state, action) {
    /** @type {GameState} */
    const newState = state ? {
        isStarting: state.isStarting,
        isStarted: state.isStarted,
        secondsRemaining: state.secondsRemaining,
    } : {
        isStarting: false,
        isStarted: false,
        secondsRemaining: undefined,
    };

    if (action.type === actionTypes.START_GAME) {
        newState.isStarting = true;
        newState.isStarted = false;
    } else if (action.type === actionTypes.GAME_STARTED) {
        newState.isStarting = false;
        newState.isStarted = true;
    } else if (action.type === actionTypes.GAME_FINISHED) {
        newState.isStarting = false;
        newState.isStarted = false;
    } else if (action.type === actionTypes.UPDATE_SECONDS_REMAINING) {
        newState.secondsRemaining = action.payload;
    }

    return newState;
}