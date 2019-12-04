/**
 * @typedef {Object} GameState
 * @property {boolean} isGameStarted
 * @property {boolean} isRoundStarting
 * @property {boolean} isRoundStarted
 * @property {boolean} isRoundEnded
 * @property {boolean} isRoundSolved
 * @property {Number} secondsRemaining
 * @property {string|undefined} activePhrase
 * @property {boolean} isFullscreen
 * @property {GameLog} gameLog
 * @property {string} hostPeerId
 * @property {string} drawerPeerId
 * @property {string} previousDrawerPeerId
 * @property {Player} localPlayer
 * @property {Player[]} remotePlayers
 */
/**
 * @typedef {Object} Player
 * @property {string} name
 * @property {number} score
 * @property {string} peerId
 */
/**
 * @typedef {Object} GameLog
 * @property {RoundLog[]} rounds
 */
/**
 * @typedef {Object} RoundLog
 * @property {string} phrase
 * @property {string} drawerName
 * @property {string[]} guesserNames
 * @property {RoundTrialLog[]} trials
 */
/**
 * @typedef {Object} RoundTrialLog
 * @property {DrawnLine[]} lines
 * @property {{guesserName: string, message: string, isCorrect: boolean}[]} guesses
 * @property {'ongoing'|'cleared'|'solved'|'failed'} trialResult
 */
import {getRandomPhrase} from '../data/phrases.mjs';

export const actionTypes = {
    UPDATE_CONNECTIONS_SUCCESS: 'game/UPDATE_CONNECTIONS_SUCCESS',
    UPDATE_LOCAL_PLAYER_NAME_REQUEST: 'game/UPDATE_LOCAL_PLAYER_NAME_REQUEST',
    UPDATE_LOCAL_PLAYER_PEER_ID_REQUEST: 'game/UPDATE_LOCAL_PLAYER_PEER_ID_REQUEST',
    ADD_OR_UPDATE_REMOTE_PLAYER_REQUEST: 'game/ADD_OR_UPDATE_REMOTE_PLAYER_REQUEST',
    REMOVE_REMOTE_PLAYER_REQUEST: 'game/REMOVE_REMOTE_PLAYER_REQUEST',

    SET_GAME_STATE_REQUEST: 'game/SET_GAME_STATE_REQUEST',
    START_GAME_REQUEST: 'game/START_GAME_REQUEST',

    START_ROUND_REQUEST: 'game/START_ROUND_REQUEST',
    START_ROUND_SUCCESS: 'game/START_ROUND_SUCCESS',
    UPDATE_REMAINING_ROUND_TIME_REQUEST: 'game/UPDATE_REMAINING_ROUND_TIME_REQUEST',
    SET_REMAINING_ROUND_TIME_TO_ZERO_REQUEST: 'game/SET_REMAINING_ROUND_TIME_TO_ZERO_REQUEST',
    MARK_ROUND_SOLVED_REQUEST: 'game/MARK_ROUND_SOLVED_REQUEST',
    SAVE_NEW_LINES_REQUEST: 'game/SAVE_NEW_LINES_REQUEST',
    ADD_NEW_GUESS_REQUEST: 'game/ADD_NEW_GUESS_REQUEST',
    START_NEW_TRIAL_AFTER_CLEARING_REQUEST: 'game/START_NEW_TRIAL_AFTER_CLEARING_REQUEST',

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
        isRoundSolved: state.isRoundSolved,
        secondsRemaining: state.secondsRemaining,
        activePhrase: state.activePhrase,
        isFullscreen: state.isFullscreen,
        hostPeerId: state.hostPeerId,
        drawerPeerId: state.drawerPeerId,
        previousDrawerPeerId: state.previousDrawerPeerId,
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
        gameLog: {
            rounds: state.gameLog.rounds.map(round => ({
                drawerName: round.drawerName,
                guesserNames: [...round.guesserNames],
                trials: round.trials.map(trial => ({
                    lines: [...trial.lines],
                    guesses: trial.guesses.map(guess => ({
                        guesserName: guess.guesserName,
                        message: guess.message,
                        isCorrect: guess.isCorrect
                    })),
                    trialResult: trial.trialResult,
                })),
            })),
        },
    } : {
        isGameStarted: false,
        isRoundStarting: false,
        isRoundStarted: false,
        isRoundEnded: false,
        isRoundSolved: false,
        secondsRemaining: undefined,
        activePhrase: undefined,
        isFullscreen: false,
        hostPeerId: undefined,
        drawerPeerId: undefined,
        previousDrawerPeerId: undefined,
        localPlayer: {name: '', score: 0, peerId: undefined},
        remotePlayers: [],
        gameLog: {rounds: []},
    };
}

export const actionCreators = {
    createUpdateConnectionsSuccess: (hostPeerId) => ({type: actionTypes.UPDATE_CONNECTIONS_SUCCESS, payload: hostPeerId}),
    createUpdateLocalPlayerNameRequest: (name) => ({type: actionTypes.UPDATE_LOCAL_PLAYER_NAME_REQUEST, payload: name}),
    createUpdateLocalPlayerPeerIdRequest: (name) => ({type: actionTypes.UPDATE_LOCAL_PLAYER_PEER_ID_REQUEST, payload: name}),
    createAddOrUpdateRemotePlayerRequest: (remotePlayer) => ({type: actionTypes.ADD_OR_UPDATE_REMOTE_PLAYER_REQUEST, payload: remotePlayer}),
    createRemoveRemotePlayerRequest: (peerId) => ({type: actionTypes.REMOVE_REMOTE_PLAYER_REQUEST, payload: peerId}),

    createSetGameStateRequest: (gameState) => ({type: actionTypes.SET_GAME_STATE_REQUEST, payload: gameState}),
    createStartGameRequest: () => ({type: actionTypes.START_GAME_REQUEST}),

    createStartRoundRequest: (nextDrawerPeerId) => ({type: actionTypes.START_ROUND_REQUEST, payload: nextDrawerPeerId}),
    createStartRoundSuccess: () => ({type: actionTypes.START_ROUND_SUCCESS}),
    createUpdateRemainingRoundTimeRequest: (seconds) => ({type: actionTypes.UPDATE_REMAINING_ROUND_TIME_REQUEST, payload: seconds}),
    createSetRemainingRoundTimeToZeroRequest: () => ({type: actionTypes.SET_REMAINING_ROUND_TIME_TO_ZERO_REQUEST}),
    createMarkRoundSolvedRequest: (phrase, solverPeerId) => ({type: actionTypes.MARK_ROUND_SOLVED_REQUEST, payload: {phrase, solverPeerId}}),
    createSaveNewLinesRequest: (newLines) => ({type: actionTypes.SAVE_NEW_LINES_REQUEST, payload: newLines}),
    createAddNewGuessRequest: (guess) => ({type: actionTypes.ADD_NEW_GUESS_REQUEST, payload: guess}),
    createStartNewTrialAfterClearingRequest: () => ({type: actionTypes.START_NEW_TRIAL_AFTER_CLEARING_REQUEST}),

    createSetFullscreenStateRequest: (isFullscreen) => ({type: actionTypes.SET_FULLSCREEN_STATE_REQUEST, payload: isFullscreen}),
};

/**
 * @param {GameState} state
 * @param {GameStateToSendToNewPeer} receivedGameState
 * @private
 */
function _setGameState(state, receivedGameState) {
    state.isGameStarted = receivedGameState.isGameStarted;
    state.isRoundStarted = receivedGameState.isRoundStarted;
    state.isRoundStarting = receivedGameState.isRoundStarting;
    state.isRoundEnded = receivedGameState.isRoundEnded;
    state.isRoundSolved = receivedGameState.isRoundSolved;
    state.drawerPeerId = receivedGameState.drawerPeerId;
}

/**
 * @param {GameState} state
 */
function _markGameAsStarted(state) {
    state.isGameStarted = true;
    state.isRoundStarting = false;
    state.isRoundStarted = false;
    state.gameLog = {rounds: []};
}

/**
 * @param {GameState} state
 * @param {string} nextDrawerPeerId
 */
function _markRoundAsStartingAndSetDrawer(state, nextDrawerPeerId) {
    state.isRoundStarting = true;
    state.isRoundStarted = false;
    state.isRoundEnded = false;
    state.isRoundSolved = false;
    state.previousDrawerPeerId = state.drawerPeerId;
    state.drawerPeerId = nextDrawerPeerId;
    if (state.drawerPeerId === state.localPlayer.peerId) {
        const randomPhrase = getRandomPhrase();
        state.activePhrase = randomPhrase.trim();
        state.isRoundSolved = false;
    }
}

/**
 * @param {GameState} state
 */
function _markRoundAsStarted(state) {
    state.isRoundStarting = false;
    state.isRoundStarted = true;
    state.isRoundEnded = false;
    state.isRoundSolved = false;
    const allPlayers = [...state.remotePlayers, state.localPlayer];
    const drawerPlayerIndex = allPlayers.findIndex(player => player.peerId === state.drawerPeerId);
    if (drawerPlayerIndex > -1) {
        const guesserPlayers = [...allPlayers].splice(drawerPlayerIndex, 1);
        state.gameLog.rounds.push({
            phrase: state.activePhrase,
            drawerName: allPlayers[drawerPlayerIndex].name,
            guesserNames: guesserPlayers.map(player => player.name),
            trials: [{lines: [], guesses: [], trialResult: 'ongoing'}]
        });
    } else {
        console.error('Big problem.');
        state.gameLog.rounds.push({
            phrase: state.activePhrase,
            drawerName: '???',
            guesserNames: allPlayers.map(player => player.name),
            trials: [{lines: [], guesses: [], trialResult: 'ongoing'}]
        });
    }
}

/**
 * @param {GameState} state
 */
function _setSecondsRemainingToZero(state) {
    state.secondsRemaining = 0;
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
 * @param {{phrase: string, solverPeerId: string}} phraseAndSolverPeerId
 */
function _markRoundSolved(state, {phrase, solverPeerId}) { // TODO: Use these parameters!
    state.isRoundStarting = false;
    state.isRoundStarted = false;
    state.isRoundEnded = true;
    state.isRoundSolved = true;
    const currentRound = state.gameLog.rounds[state.gameLog.rounds.length - 1];
    currentRound.trials[currentRound.trials.length - 1].trialResult = 'solved'; // TODO: Or "failed"! Add info to parameter!
    state.activePhrase = undefined;

    if (state.drawerPeerId === state.localPlayer.peerId) {
        //state.localPlayerPoints++;
    } else {
        //state.remotePlayerPoints++;
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
 * @param {string} hostPeerId
 * @private
 */
function _setHostPeerId(state, hostPeerId) {
    state.hostPeerId = hostPeerId;
}

/**
 * @param {GameState} state
 * @param {DrawnLine[]} newLines
 * @private
 */
function _saveNewLines(state, newLines) {
    const currentRound = state.gameLog.rounds[state.gameLog.rounds.length - 1];
    currentRound.trials[currentRound.trials.length - 1].lines.push(...newLines);
}

/**
 * @param {GameState} state
 * @param {{guesserPeerId: string, messageText: string, isCorrect: boolean}} newGuess
 * @private
 */
function _addNewGuess(state, newGuess) {
    const currentRound = state.gameLog.rounds[state.gameLog.rounds.length - 1];
    const guesserPlayer = state.remotePlayers.find(player => player.peerId === newGuess.guesserPeerId);
    if (!guesserPlayer) {
        console.log('Weird that the guesser player is not found.');
    }
    currentRound.trials[currentRound.trials.length - 1].guesses.push({
        guesserName: guesserPlayer ? guesserPlayer.name : '???',
        message: newGuess.messageText,
        isCorrect: newGuess.isCorrect
    });
}

/**
 * @param {GameState} state
 * @private
 */
function _startNewTrialAfterClearing(state) {
    const currentRound = state.gameLog.rounds[state.gameLog.rounds.length - 1];
    const currentTrial = currentRound.trials[currentRound.trials.length - 1];
    if (currentTrial.lines.length > 0) {
        currentTrial.trialResult = 'cleared';
        currentRound.trials.push({lines: [], guesses: [], trialResult: 'ongoing'});
    }
}

/**
 * @param {GameState} state
 * @param {{type: string, payload: *, error: boolean?, meta: *?}} action
 * @return {GameState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.UPDATE_CONNECTIONS_SUCCESS]: _setHostPeerId,
        [actionTypes.UPDATE_LOCAL_PLAYER_NAME_REQUEST]: _updateLocalPlayerName,
        [actionTypes.UPDATE_LOCAL_PLAYER_PEER_ID_REQUEST]: _updateLocalPlayerPeerId,
        [actionTypes.ADD_OR_UPDATE_REMOTE_PLAYER_REQUEST]: _addOrUpdateRemotePlayer,
        [actionTypes.REMOVE_REMOTE_PLAYER_REQUEST]: _removeRemotePlayer,

        [actionTypes.SET_GAME_STATE_REQUEST]: _setGameState,
        [actionTypes.START_GAME_REQUEST]: _markGameAsStarted,

        [actionTypes.START_ROUND_REQUEST]: _markRoundAsStartingAndSetDrawer,
        [actionTypes.START_ROUND_SUCCESS]: _markRoundAsStarted,
        [actionTypes.UPDATE_REMAINING_ROUND_TIME_REQUEST]: _updateSecondsRemaining,
        [actionTypes.SET_REMAINING_ROUND_TIME_TO_ZERO_REQUEST]: _setSecondsRemainingToZero,
        [actionTypes.MARK_ROUND_SOLVED_REQUEST]: _markRoundSolved,
        [actionTypes.SAVE_NEW_LINES_REQUEST]: _saveNewLines,
        [actionTypes.ADD_NEW_GUESS_REQUEST]: _addNewGuess,
        [actionTypes.START_NEW_TRIAL_AFTER_CLEARING_REQUEST]: _startNewTrialAfterClearing,

        [actionTypes.SET_FULLSCREEN_STATE_REQUEST]: _setIsFullscreen,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}