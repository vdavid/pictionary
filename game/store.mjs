/**
 * @typedef {Object} GameState
 * @property {boolean} isGameStarted
 * @property {boolean} isRoundStarting
 * @property {boolean} isRoundStarted
 * @property {boolean} isRoundEnded
 * @property {Number} secondsRemaining
 * @property {int} localPlayerPoints
 * @property {int} remotePlayerPoints
 * @property {'local'|'remote'|undefined} whichPlayerDraws
 * @property {string|undefined} activePhrase
 * @property {boolean} isActivePhraseGuessedCorrectly
 * @property {boolean} isFullscreen
 */

export const actionTypes = {
    START_GAME_REQUEST: 'game/START_GAME_REQUEST',
    START_ROUND_REQUEST: 'game/START_ROUND_REQUEST',
    START_ROUND_SUCCESS: 'game/START_ROUND_SUCCESS',
    UPDATE_REMAINING_ROUND_TIME_REQUEST: 'game/UPDATE_REMAINING_ROUND_TIME_REQUEST',
    SET_REMAINING_ROUND_TIME_TO_ZERO_REQUEST: 'game/SET_REMAINING_ROUND_TIME_TO_ZERO_REQUEST',
    MARK_ROUND_AS_ENDED_REQUEST: 'game/MARK_ROUND_AS_ENDED_REQUEST',
    SET_ACTIVE_PHRASE_REQUEST: 'game/SET_ACTIVE_PHRASE_REQUEST',
    MARK_PHASE_GUESSED_REQUEST: 'game/MARK_PHASE_GUESSED_REQUEST',
    SET_FULLSCREEN_STATE_REQUEST: 'game/SET_FULLSCREEN_STATE_REQUEST',
};

/**
 * @param {GameState} state
 * @returns {GameState}
 */
function _getStateCopy(state) {
    return state ? {
        isGameStarted: state.isGameStarted,
        isRoundStarting: state.isRoundStarting,
        isRoundStarted: state.isRoundStarted,
        isRoundEnded: state.isRoundEnded,
        secondsRemaining: state.secondsRemaining,
        localPlayerPoints: state.localPlayerPoints,
        remotePlayerPoints: state.remotePlayerPoints,
        whichPlayerDraws: state.whichPlayerDraws,
        activePhrase: state.activePhrase,
        isActivePhraseGuessedCorrectly: state.isActivePhraseGuessedCorrectly,
        isFullscreen: state.isFullscreen,
    } : {
        isGameStarted: false,
        isRoundStarting: false,
        isRoundStarted: false,
        isRoundEnded: false,
        secondsRemaining: undefined,
        localPlayerPoints: 0,
        remotePlayerPoints: 0,
        whichPlayerDraws: undefined,
        activePhrase: undefined,
        isActivePhraseGuessedCorrectly: false,
    };
}

export const actionCreators = {
    createStartGameRequest: () => ({type: actionTypes.START_GAME_REQUEST}),
    createStartRoundRequest: (localOrRemote) => ({type: actionTypes.START_ROUND_REQUEST, payload: localOrRemote}),
    createStartRoundSuccess: () => ({type: actionTypes.START_ROUND_SUCCESS}),
    createUpdateRemainingRoundTimeRequest: (seconds) => ({type: actionTypes.UPDATE_REMAINING_ROUND_TIME_REQUEST, payload: seconds}),
    createSetRemainingRoundTimeToZeroRequest: () => ({type: actionTypes.SET_REMAINING_ROUND_TIME_TO_ZERO_REQUEST}),
    createMarkRoundAsEndedRequest: () => ({type: actionTypes.MARK_ROUND_AS_ENDED_REQUEST}),
    createSetActivePhraseRequest: (phrase) => ({type: actionTypes.SET_ACTIVE_PHRASE_REQUEST, payload: phrase}),
    createMarkPhaseGuessedRequest: (phrase) => ({type: actionTypes.MARK_PHASE_GUESSED_REQUEST, payload: phrase}),
    createSetFullscreenStateRequest: (isFullscreen) => ({type: actionTypes.SET_FULLSCREEN_STATE_REQUEST, payload: isFullscreen}),
};

/**
 * @param {GameState} state
 */
function _markGameAsStarted(state) {
    state.isGameStarted = true;
    state.isRoundStarting = false;
    state.isRoundStarted = false;
}

/**
 * @param {GameState} state
 * @param {'local'|'remote'} localOrRemote
 */
function _markRoundAsStartingAndSetDrawingPlayer(state, localOrRemote) {
    state.isRoundStarting = true;
    state.isRoundStarted = false;
    state.isRoundEnded = false;
    state.whichPlayerDraws = localOrRemote;
}

/**
 * @param {GameState} state
 */
function _markRoundAsStarted(state) {
    state.isRoundStarting = false;
    state.isRoundStarted = true;
    state.isRoundEnded = false;
}

/**
 * @param {GameState} state
 */
function _setSecondsRemainingToZero(state) {
    state.secondsRemaining = 0;
}

/**
 * @param {GameState} state
 */
function _markRoundAsEnded(state) {
    state.isRoundStarting = false;
    state.isRoundStarted = false;
    state.isRoundEnded = true;
}

/**
 * @param {GameState} state
 * @param {Number} seconds Seconds.
 */
function _updateSecondsRemaining(state, seconds) {
    state.secondsRemaining = seconds;
}

/**
 * @param {GameState} state
 * @param {string} phrase The new phrase to set
 */
function _updateActivePhrase(state, phrase) {
    state.activePhrase = phrase.trim();
    state.isActivePhraseGuessedCorrectly = false;
}

/**
 * @param {GameState} state
 * @param {string} phrase
 */
function _markPhraseGuessedCorrectly(state, phrase) {
    state.isActivePhraseGuessedCorrectly = true;
    if (state.whichPlayerDraws === 'local') {
        state.localPlayerPoints++;
    } else {
        state.remotePlayerPoints++;
    }
}

/**
 * @param {GameState} state
 * @param {boolean} isFullscreen
 */
function _setIsFullscreen(state, isFullscreen) {
    state.isFullscreen = isFullscreen;
}

/**
 * @param {GameState} state
 * @param {{type: string, payload: *, error: boolean?, meta: *?}} action
 * @return {GameState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.START_GAME_REQUEST]: _markGameAsStarted,
        [actionTypes.START_ROUND_REQUEST]: _markRoundAsStartingAndSetDrawingPlayer,
        [actionTypes.START_ROUND_SUCCESS]: _markRoundAsStarted,
        [actionTypes.UPDATE_REMAINING_ROUND_TIME_REQUEST]: _updateSecondsRemaining,
        [actionTypes.SET_REMAINING_ROUND_TIME_TO_ZERO_REQUEST]: _setSecondsRemainingToZero,
        [actionTypes.MARK_ROUND_AS_ENDED_REQUEST]: _markRoundAsEnded,
        [actionTypes.SET_ACTIVE_PHRASE_REQUEST]: _updateActivePhrase,
        [actionTypes.MARK_PHASE_GUESSED_REQUEST]: _markPhraseGuessedCorrectly,
        [actionTypes.SET_FULLSCREEN_STATE_REQUEST]: _setIsFullscreen,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}