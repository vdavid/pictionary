/**
 * @typedef {Object} GameState
 * @property {boolean} isGameStarted
 * @property {boolean} isRoundStarting
 * @property {boolean} isRoundStarted
 * @property {Number} secondsRemaining
 * @property {int} localPlayerPoints
 * @property {int} remotePlayerPoints
 * @property {'local'|'remote'|undefined} whichPlayerDraws
 * @property {string|undefined} activePhrase
 */

export const actionTypes = {
    START_GAME: 'game/startGame',
    START_ROUND: 'game/startRound',
    ROUND_STARTED: 'game/roundStarted',
    TIME_IS_UP: 'game/timeIsUp',
    ROUND_FINISHED: 'game/roundFinished',
    UPDATE_SECONDS_REMAINING: 'game/updateSecondsRemaining',
    SET_ACTIVE_PHRASE: 'game/setActivePhrase',
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
 */
function _startGame(state) {
    state.isGameStarted = true;
    state.isRoundStarting = false;
    state.isRoundStarted = false;
}

/**
 * @param {GameState} state
 * @param {'local'|'remote'} localOrRemote
 */
function _startRound(state, localOrRemote) {
    state.isRoundStarting = true;
    state.isRoundStarted = false;
    state.whichPlayerDraws = localOrRemote;
}

/**
 * @param {GameState} state
 */
function _roundStarted(state) {
    state.isRoundStarting = false;
    state.isRoundStarted = true;
}

/**
 * @param {GameState} state
 */
function _timeIsUp(state) {
    state.secondsRemaining = 0;
}

/**
 * @param {GameState} state
 */
function _roundFinished(state) {
    state.isRoundStarting = false;
    state.isRoundStarted = false;
}

/**
 * @param {GameState} state
 * @param {Number} payload Seconds.
 */
function _updateSecondsRemaining(state, payload) {
    state.secondsRemaining = payload;
}

/**
 * @param {GameState} state
 * @param {string} payload The new phrase to set
 */
function _setActivePhrase(state, payload) {
    state.activePhrase = payload;
}

/**
 * @param {GameState} state
 * @param {{type: string, payload: *}} action
 * @return {GameState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.START_GAME]: _startGame,
        [actionTypes.START_ROUND]: _startRound,
        [actionTypes.ROUND_STARTED]: _roundStarted,
        [actionTypes.TIME_IS_UP]: _timeIsUp,
        [actionTypes.ROUND_FINISHED]: _roundFinished,
        [actionTypes.UPDATE_SECONDS_REMAINING]: _updateSecondsRemaining,
        [actionTypes.SET_ACTIVE_PHRASE]: _setActivePhrase,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}