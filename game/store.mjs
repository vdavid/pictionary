import {trialResult} from './trial-result.mjs';
/**
 * @typedef {Object} GameState
 * @property {boolean} isGameStarted
 * @property {Player} localPlayer
 * @property {Player[]} remotePlayers
 * @property {RoundLog[]} rounds
 */
/**
 * @typedef {Object} Player
 * @property {string} name
 * @property {number} score
 * @property {string} peerId
 */
/**
 * @typedef {Object} RoundLog
 * @property {string|null} phrase
 * @property {Player} drawer
 * @property {Player[]} guessers
 * @property {Player|null} solver
 * @property {RoundTrialLog[]} trials
 */

/**
 * @typedef {Object} RoundTrialLog
 * @property {string|null} startingDateTimeString E.g. '2019-12-08T21:49:10.161Z'
 * @property {string|null} startedDateTimeString E.g. '2019-12-08T21:49:10.161Z'
 * @property {string|null} finishedDateTimeString E.g. '2019-12-08T21:49:10.161Z'
 * @property {{guessDateTimeString: string, guesserName: string, message: string, isCorrect: boolean}[]} guesses
 * @property {DrawnLine[]} lines
 * @property {string} trialResult One of the trialResult constants.
 */

export const actionTypes = {
    UPDATE_LOCAL_PLAYER_NAME_REQUEST: 'game/UPDATE_LOCAL_PLAYER_NAME_REQUEST',
    UPDATE_LOCAL_PLAYER_PEER_ID_REQUEST: 'game/UPDATE_LOCAL_PLAYER_PEER_ID_REQUEST',
    ADD_OR_UPDATE_REMOTE_PLAYER_REQUEST: 'game/ADD_OR_UPDATE_REMOTE_PLAYER_REQUEST',
    REMOVE_REMOTE_PLAYER_REQUEST: 'game/REMOVE_REMOTE_PLAYER_REQUEST',

    SET_GAME_STATE_REQUEST: 'game/SET_GAME_STATE_REQUEST',
    START_GAME_REQUEST: 'game/START_GAME_REQUEST',

    START_ROUND_REQUEST: 'game/START_ROUND_REQUEST',
    START_ROUND_SUCCESS: 'game/START_ROUND_SUCCESS',
    MARK_ROUND_ENDED_REQUEST: 'game/MARK_ROUND_ENDED_REQUEST',
    SAVE_NEW_LINES_REQUEST: 'game/SAVE_NEW_LINES_REQUEST',
    CLEAR_REQUEST: 'game/CLEAR_REQUEST',
    ADD_NEW_GUESS_REQUEST: 'game/ADD_NEW_GUESS_REQUEST',
    START_NEW_TRIAL_AFTER_CLEARING_REQUEST: 'game/START_NEW_TRIAL_AFTER_CLEARING_REQUEST',
};

/**
 * @param {GameState} state
 * @returns {GameState}
 */
function _getStateCopy(state) {
    return state ? {
        isGameStarted: state.isGameStarted,
        localPlayer: {
            name: state.localPlayer.name,
            score: state.localPlayer.score,
            peerId: state.localPlayer.peerId,
        },
        remotePlayers: state.remotePlayers.map(player => ({
            peerId: player.peerId,
            name: player.name,
            score: player.score,
        })),
        rounds: state.rounds.map(round => ({
            drawer: round.drawer,
            guessers: [...round.guessers],
            solver: round.solver,
            trials: round.trials.map(trial => ({
                startingDateTimeString: trial.startingDateTimeString,
                startedDateTimeString: trial.startedDateTimeString,
                finishedDateTimeString: trial.finishedDateTimeString,
                guesses: trial.guesses.map(guess => ({
                    guessDateTimeString: guess.guessDateTimeString,
                    guesserName: guess.guesserName,
                    message: guess.message,
                    isCorrect: guess.isCorrect
                })),
                lines: [...trial.lines],
                trialResult: trial.trialResult,
            })),
        })),
    } : {
        isGameStarted: false,
        localPlayer: {name: '', score: 0, peerId: undefined},
        remotePlayers: [],
        rounds: [],
    };
}

export const actionCreators = {
    createUpdateLocalPlayerNameRequest: (name) => ({type: actionTypes.UPDATE_LOCAL_PLAYER_NAME_REQUEST, payload: name}),
    createUpdateLocalPlayerPeerIdRequest: (name) => ({type: actionTypes.UPDATE_LOCAL_PLAYER_PEER_ID_REQUEST, payload: name}),
    createAddOrUpdateRemotePlayerRequest: (remotePlayer) => ({type: actionTypes.ADD_OR_UPDATE_REMOTE_PLAYER_REQUEST, payload: remotePlayer}),
    createRemoveRemotePlayerRequest: (peerId) => ({type: actionTypes.REMOVE_REMOTE_PLAYER_REQUEST, payload: peerId}),

    createSetGameStateRequest: (gameState) => ({type: actionTypes.SET_GAME_STATE_REQUEST, payload: gameState}),
    createStartGameRequest: () => ({type: actionTypes.START_GAME_REQUEST}),

    createStartRoundRequest: (nextDrawerPeerId, phrase) => ({type: actionTypes.START_ROUND_REQUEST, payload: {nextDrawerPeerId, phrase}}),
    createStartRoundSuccess: () => ({type: actionTypes.START_ROUND_SUCCESS}),
    createMarkRoundEndedRequest: (phrase, solverPeerId) => ({type: actionTypes.MARK_ROUND_ENDED_REQUEST, payload: {phrase, solverPeerId}}),
    createSaveNewLinesRequest: (newLines) => ({type: actionTypes.SAVE_NEW_LINES_REQUEST, payload: newLines}),
    createClearRequest: (newLines) => ({type: actionTypes.CLEAR_REQUEST, payload: newLines}),
    createAddNewGuessRequest: (guess) => ({type: actionTypes.ADD_NEW_GUESS_REQUEST, payload: guess}),
    createStartNewTrialAfterClearingRequest: () => ({type: actionTypes.START_NEW_TRIAL_AFTER_CLEARING_REQUEST}),
};

/**
 * @param {GameState} state
 * @param {{type: string, payload: *, error: boolean?, meta: *?}} action
 * @return {GameState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.UPDATE_LOCAL_PLAYER_NAME_REQUEST]: _updateLocalPlayerName,
        [actionTypes.UPDATE_LOCAL_PLAYER_PEER_ID_REQUEST]: _updateLocalPlayerPeerId,
        [actionTypes.ADD_OR_UPDATE_REMOTE_PLAYER_REQUEST]: _addOrUpdateRemotePlayer,
        [actionTypes.REMOVE_REMOTE_PLAYER_REQUEST]: _removeRemotePlayer,

        [actionTypes.SET_GAME_STATE_REQUEST]: _setGameState,
        [actionTypes.START_GAME_REQUEST]: _markGameAsStarted,

        [actionTypes.START_ROUND_REQUEST]: _markRoundAsStarting,
        [actionTypes.START_ROUND_SUCCESS]: _markRoundAsStarted,
        [actionTypes.MARK_ROUND_ENDED_REQUEST]: _markRoundEnded,
        [actionTypes.SAVE_NEW_LINES_REQUEST]: _saveNewLines,
        [actionTypes.ADD_NEW_GUESS_REQUEST]: _addNewGuess,
        [actionTypes.CLEAR_REQUEST]: _clear,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}

/**
 * @param {GameState} state
 * @param {GameStateToSendToNewPeer} receivedGameState
 * @private
 */
function _setGameState(state, receivedGameState) {
    state.isGameStarted = receivedGameState.isGameStarted;
    state.rounds = receivedGameState.rounds;
}

/**
 * @param {GameState} state
 */
function _markGameAsStarted(state) {
    state.isGameStarted = true;
    state.rounds = [];
}

/**
 * @param {GameState} state
 * @param {{nextDrawerPeerId: string, phrase: string|null}} argument
 */
function _markRoundAsStarting(state, {nextDrawerPeerId, phrase}) {
    state.rounds.push({
        phrase,
        drawer: phrase ? state.localPlayer : state.remotePlayers.find(player => player.peerId === nextDrawerPeerId),
        guessers: phrase
            ? state.remotePlayers
            : [...state.remotePlayers.filter(player => player.peerId !== nextDrawerPeerId), state.localPlayer],
        solver: null,
        trials: [{
            startingDateTimeString: new Date().toISOString(),
            startedDateTimeString: null,
            finishedDateTimeString: null,
            guesses: [],
            lines: [],
            trialResult: trialResult.starting
        }]
    });
}

/**
 * @param {GameState} state
 */
function _markRoundAsStarted(state) {
    const latestRound = (state.rounds.length > 0) ? state.rounds[state.rounds.length - 1] : {trials: []};
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};
    latestTrial.trialResult = trialResult.ongoing;
    latestTrial.startedDateTimeString = new Date().toISOString();
}

/**
 * @param {GameState} state
 * @param {{phrase: string, solverPeerId: string}} phraseAndSolverPeerId
 */
function _markRoundEnded(state, {phrase, solverPeerId}) {
    const currentRound = state.rounds[state.rounds.length - 1];
    const currentTrial = currentRound.trials[currentRound.trials.length - 1];
    const solverPlayer = [state.localPlayer, ...state.remotePlayers].find(player => player.peerId === solverPeerId);
    if (!solverPlayer) {
        console.error('Solver player with ID ' + solverPeerId + ' not found.');
    }
    currentRound.phrase = phrase;
    currentRound.solver = solverPlayer || {peerId: solverPeerId};
    currentTrial.trialResult = solverPeerId ? trialResult.solved : trialResult.failed;
    currentTrial.finishedDateTimeString = new Date().toISOString();

    /* Update score */
    if (currentTrial.trialResult === trialResult.solved) {
        const roundLengthInSeconds = (new Date(currentTrial.finishedDateTimeString).getTime() - new Date(currentRound.trials[0].startedDateTimeString).getTime()) / 1000;
        const score = Math.max(60 - roundLengthInSeconds, 0);

        currentRound.drawer.score += score;
        currentRound.solver.score += score;
    }
}

/**
 * @param {GameState} state
 * @param {string} name
 * @private
 */
function _updateLocalPlayerName(state, name) {
    state.localPlayer.name = name;
}

/**
 * @param {GameState} state
 * @param {string} peerId
 * @private
 */
function _updateLocalPlayerPeerId(state, peerId) {
    state.localPlayer.peerId = peerId;
}

/**
 * @param {GameState} state
 * @param {Player} remotePlayer May contain only partial data, but peerId is needed to identify the player.
 * @private
 */
function _addOrUpdateRemotePlayer(state, remotePlayer) {
    const player = state.remotePlayers.find(player => player.peerId === remotePlayer.peerId);
    if (player) {
        player.name = (remotePlayer.name !== undefined) ? remotePlayer.name : player.name;
        player.score = (remotePlayer.score !== undefined) ? remotePlayer.score : player.score;
    } else {
        state.remotePlayers.push(remotePlayer);
    }
}

/**
 * @param {GameState} state
 * @param {string} remotePeerId
 * @private
 */
function _removeRemotePlayer(state, remotePeerId) {
    const playerIndex = state.remotePlayers.findIndex(player => player.peerId === remotePeerId);
    if (playerIndex >= 0) {
        state.remotePlayers.splice(playerIndex, 1);
    }
}

/**
 * @param {GameState} state
 * @param {DrawnLine[]} newLines
 * @private
 */
function _saveNewLines(state, newLines) {
    const currentRound = state.rounds[state.rounds.length - 1];
    currentRound.trials[currentRound.trials.length - 1].lines.push(...newLines);
}

/**
 * @param {GameState} state
 * @param {DrawnLine[]} newLines Any remaining lines before clearing
 * @private
 */
function _clear(state, newLines) {
    if (newLines.length) {
        _saveNewLines(state, newLines);
    }
    const currentRound = state.rounds[state.rounds.length - 1];
    const currentTrial = currentRound.trials[currentRound.trials.length - 1];
    if (currentTrial.lines.length > 0) {
        currentTrial.trialResult = trialResult.cleared;
        currentRound.trials.push({
            startingDateTimeString: new Date().toISOString(),
            startedDateTimeString: new Date().toISOString(),
            finishedDateTimeString: null,
            lines: [],
            guesses: [],
            trialResult: trialResult.ongoing
        });
    }
}

/**
 * @param {GameState} state
 * @param {{guesserPeerId: string, messageText: string, isCorrect: boolean}} newGuess
 * @private
 */
function _addNewGuess(state, newGuess) {
    const currentRound = state.rounds[state.rounds.length - 1];
    const guesserPlayer = state.remotePlayers.find(player => player.peerId === newGuess.guesserPeerId);
    if (!guesserPlayer) {
        console.log('It\'s weird. Can\'t find the guesser player.');
    }
    currentRound.trials[currentRound.trials.length - 1].guesses.push({
        guessDateTimeString: new Date().toISOString(),
        guesserName: guesserPlayer ? guesserPlayer.name : '???',
        message: newGuess.messageText,
        isCorrect: newGuess.isCorrect
    });
}
