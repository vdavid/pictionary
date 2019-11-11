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
 */

export const actionTypes = {
    START_GAME: 'game/startGame',
    START_ROUND: 'game/startRound',
    ROUND_STARTED: 'game/roundStarted',
    TIME_IS_UP: 'game/timeIsUp',
    ROUND_ENDED: 'game/roundEnded',
    UPDATE_SECONDS_REMAINING: 'game/updateSecondsRemaining',
    SET_ACTIVE_PHRASE: 'game/setActivePhrase',
    PHRASE_GUESSED_CORRECTLY: 'game/phraseGuessedCorrectly',
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
 * @param {{type: string, payload: *}} action
 * @return {GameState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.START_GAME]: _markGameAsStarted,
        [actionTypes.START_ROUND]: _markRoundAsStartingAndSetDrawingPlayer,
        [actionTypes.ROUND_STARTED]: _markRoundAsStarted,
        [actionTypes.TIME_IS_UP]: _setSecondsRemainingToZero,
        [actionTypes.ROUND_ENDED]: _markRoundAsEnded,
        [actionTypes.UPDATE_SECONDS_REMAINING]: _updateSecondsRemaining,
        [actionTypes.SET_ACTIVE_PHRASE]: _updateActivePhrase,
        [actionTypes.PHRASE_GUESSED_CORRECTLY]: _markPhraseGuessedCorrectly,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}