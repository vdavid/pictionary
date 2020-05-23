import {trialResult} from './trial-result.mjs';
/**
 * @typedef {Object} GameState
 * @property {boolean} isGameStarted
 * @property {Player} localPlayer
 * @property {Player[]} remotePlayers
 * @property {RoundLog[]} rounds
 * @property {string|null} gameStartedDateTimeString E.g. '2019-12-08T21:49:10.161Z'
 * @property {string|null} gameEndedDateTimeString E.g. '2019-12-08T21:49:10.161Z'
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
 * @property {boolean} isRoundBaseTimeElapsed
 */

/**
 * @typedef {Object} RoundTrialLog
 * @property {string|null} startingDateTimeString E.g. '2019-12-08T21:49:10.161Z'
 * @property {string|null} startedDateTimeString E.g. '2019-12-08T21:49:10.161Z'
 * @property {string|null} endedDateTimeString E.g. '2019-12-08T21:49:10.161Z'
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
    END_GAME_REQUEST: 'game/END_GAME_REQUEST',

    START_ROUND_REQUEST: 'game/START_ROUND_REQUEST',
    START_ROUND_SUCCESS: 'game/START_ROUND_SUCCESS',
    MARK_ROUND_BASE_TIME_ELAPSED: 'game/MARK_ROUND_BASE_TIME_ELAPSED',
    MARK_ROUND_ENDED_REQUEST: 'game/MARK_ROUND_ENDED_REQUEST',
    SAVE_NEW_LINES_REQUEST: 'game/SAVE_NEW_LINES_REQUEST',
    CLEAR_REQUEST: 'game/CLEAR_REQUEST',
    ADD_NEW_GUESS_REQUEST: 'game/ADD_NEW_GUESS_REQUEST',
};

/**
 * @param {GameState} state
 * @returns {GameState}
 */
function _getStateCopy(state) {
    return state ? {
        isGameStarted: state.isGameStarted,
        gameStartedDateTimeString: state.gameStartedDateTimeString,
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
            phrase: round.phrase,
            drawer: round.drawer,
            guessers: [...round.guessers],
            solver: round.solver,
            trials: round.trials.map(trial => ({
                startingDateTimeString: trial.startingDateTimeString,
                startedDateTimeString: trial.startedDateTimeString,
                endedDateTimeString: trial.endedDateTimeString,
                guesses: trial.guesses.map(guess => ({
                    guessDateTimeString: guess.guessDateTimeString,
                    guesserName: guess.guesserName,
                    message: guess.message,
                    isCorrect: guess.isCorrect
                })),
                lines: [...trial.lines],
                trialResult: trial.trialResult,
            })),
            isRoundBaseTimeElapsed: round.isRoundBaseTimeElapsed,
        })),
    } : {
        isGameStarted: false,
        gameStartedDateTimeString: undefined,
        localPlayer: {name: null, score: 0, peerId: undefined},
        remotePlayers: [],
        rounds: [],
    };
}

export const actionCreators = {
    createUpdateLocalPlayerNameRequest: (name) => ({type: actionTypes.UPDATE_LOCAL_PLAYER_NAME_REQUEST, payload: name}),
    createUpdateLocalPlayerPeerIdRequest: (name) => ({
        type: actionTypes.UPDATE_LOCAL_PLAYER_PEER_ID_REQUEST,
        payload: name
    }),
    createAddOrUpdateRemotePlayerRequest: (remotePlayer) => ({
        type: actionTypes.ADD_OR_UPDATE_REMOTE_PLAYER_REQUEST,
        payload: remotePlayer
    }),
    createRemoveRemotePlayerRequest: (peerId) => ({type: actionTypes.REMOVE_REMOTE_PLAYER_REQUEST, payload: peerId}),

    createSetGameStateRequest: (gameState) => ({type: actionTypes.SET_GAME_STATE_REQUEST, payload: gameState}),
    createStartGameRequest: (dateTimeString) => ({type: actionTypes.START_GAME_REQUEST, payload: dateTimeString}),
    createEndGameRequest: (dateTimeString) => ({type: actionTypes.END_GAME_REQUEST, payload: dateTimeString}),

    createStartRoundRequest: (dateTimeString, nextDrawerPeerId, phrase) => ({
        type: actionTypes.START_ROUND_REQUEST,
        payload: {dateTimeString, nextDrawerPeerId, phrase}
    }),
    createStartRoundSuccess: () => ({type: actionTypes.START_ROUND_SUCCESS}),
    createMarkRoundBaseTimeElapsedRequest: () => ({type: actionTypes.MARK_ROUND_BASE_TIME_ELAPSED}),
    createMarkRoundEndedRequest: (phrase, solverPeerId, solutionDateTimeString) => ({
        type: actionTypes.MARK_ROUND_ENDED_REQUEST,
        payload: {phrase, solverPeerId, solutionDateTimeString}
    }),
    createSaveNewLinesRequest: (newLines) => ({type: actionTypes.SAVE_NEW_LINES_REQUEST, payload: newLines}),
    createClearRequest: (newLines) => ({type: actionTypes.CLEAR_REQUEST, payload: newLines}),
    createAddNewGuessRequest: (guess) => ({type: actionTypes.ADD_NEW_GUESS_REQUEST, payload: guess}),
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
        [actionTypes.END_GAME_REQUEST]: _markGameAsEnded,

        [actionTypes.START_ROUND_REQUEST]: _createNewRound,
        [actionTypes.START_ROUND_SUCCESS]: _markRoundAsStarted,
        [actionTypes.MARK_ROUND_BASE_TIME_ELAPSED]: _markRoundBaseTimeElapsed,
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
    /* Store phrase */
    const latestRound = (state.rounds.length > 0) ? state.rounds[state.rounds.length - 1] : {trials: []};
    const phrase = latestRound.phrase;

    state.isGameStarted = receivedGameState.isGameStarted;
    state.gameStartedDateTimeString = receivedGameState.gameStartedDateTimeString;
    state.gameEndedDateTimeString = receivedGameState.gameEndedDateTimeString;
    state.rounds = receivedGameState.rounds;

    /* Replace null phrase with the stores phrase if this is the drawer */
    const latestRoundInNewState = (state.rounds.length > 0) ? state.rounds[state.rounds.length - 1] : {trials: []};
    if (latestRoundInNewState.drawer
        && (latestRoundInNewState.drawer.peerId === state.localPlayer.peerId)
        && latestRoundInNewState.phrase === null) {
        latestRoundInNewState.phrase = phrase;
    }
}

/**
 * @param {GameState} state
 * @param {string} dateTimeString
 */
function _markGameAsStarted(state, dateTimeString) {
    state.isGameStarted = true;
    state.gameStartedDateTimeString = dateTimeString;
    state.rounds = [];
}

/**
 * @param {GameState} state
 * @param {string} dateTimeString
 */
function _markGameAsEnded(state, dateTimeString) {
    state.isGameStarted = false;
    state.gameEndedDateTimeString = dateTimeString;
}

/**
 * @param {GameState} state
 * @param {{dateTimeString: string, nextDrawerPeerId: string, phrase: string|null}} argument
 */
function _createNewRound(state, {dateTimeString, nextDrawerPeerId, phrase}) {
    state.rounds.push({
        phrase,
        drawer: phrase ? state.localPlayer : state.remotePlayers.find(player => player.peerId === nextDrawerPeerId),
        guessers: phrase
            ? state.remotePlayers
            : [...state.remotePlayers.filter(player => player.peerId !== nextDrawerPeerId), state.localPlayer],
        solver: null,
        trials: [{
            startingDateTimeString: dateTimeString,
            startedDateTimeString: null,
            endedDateTimeString: null,
            guesses: [],
            lines: [],
            trialResult: trialResult.starting
        }],
        isRoundBaseTimeElapsed: false,
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

function _markRoundBaseTimeElapsed(state) {
    const latestRound = (state.rounds.length > 0) ? state.rounds[state.rounds.length - 1] : {};
    latestRound.isRoundBaseTimeElapsed = true;
}

/**
 * @param {GameState} state
 * @param {{phrase: string, solverPeerId: string, solutionDateTimeString: string}} phraseAndSolverPeerId
 */
function _markRoundEnded(state, {phrase, solverPeerId, solutionDateTimeString}) {
    const currentRound = state.rounds[state.rounds.length - 1];
    const currentTrial = currentRound.trials[currentRound.trials.length - 1];
    const allPlayers = [state.localPlayer, ...state.remotePlayers];
    const drawerPlayer = allPlayers.find(player => player.peerId === currentRound.drawer.peerId);
    const solverPlayer = solverPeerId && allPlayers.find(player => player.peerId === solverPeerId);
    if (!drawerPlayer) {
        console.error('Drawer player with ID ' + currentRound.drawer.peerId + ' not found.');
    }
    if (solverPeerId && !solverPlayer) {
        console.error('Solver player with ID ' + solverPeerId + ' not found.');
    }
    currentRound.phrase = phrase;
    currentRound.solver = solverPlayer || {peerId: solverPeerId};
    currentTrial.trialResult = solverPeerId ? trialResult.solved : trialResult.failed;
    currentTrial.endedDateTimeString = solutionDateTimeString;

    /* Update score */
    if (currentTrial.trialResult === trialResult.solved) {
        const roundLengthInSeconds = (new Date(currentTrial.endedDateTimeString).getTime() - new Date(currentRound.trials[0].startedDateTimeString).getTime()) / 1000;
        const score = Math.ceil(Math.max(60 - roundLengthInSeconds, 5));

        drawerPlayer.score += score;
        solverPlayer.score += score;
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
            endedDateTimeString: null,
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
        console.error('It\'s weird. Can\'t find the guesser player.');
    }
    currentRound.trials[currentRound.trials.length - 1].guesses.push({
        guessDateTimeString: new Date().toISOString(),
        guesserName: guesserPlayer ? guesserPlayer.name : '???',
        message: newGuess.messageText,
        isCorrect: newGuess.isCorrect
    });
}
