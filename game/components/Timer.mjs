import {trialResult} from '../trial-result.mjs';
import {actionCreators as gameActionCreators} from '../../game/store.mjs';
import {actionCreators as chatActionCreators} from '../../chat/store.mjs';

const {useState, useEffect} = window.React;
const {useSelector, useDispatch} = window.ReactRedux;

/**
 * @param {Number} totalSeconds
 * @return {string|null} Null if totalSeconds is not a number.
 * @private
 */
function formatRemainingTime(totalSeconds) {
    if (totalSeconds > 0) {
        const roundedSeconds = Math.round(totalSeconds);
        const minutes = Math.floor(roundedSeconds / 60);
        const seconds = Math.floor(roundedSeconds % 60);
        return minutes + ':' + seconds.toString().padStart(2, '0');
    } else if (totalSeconds < 0 || totalSeconds === 0) {
        return '0:00';
    } else {
        return null;
    }
}

export const Timer = () => {
    const [gameSecondsRemaining, setGameSecondsRemaining] = useState(0);
    const [roundSecondsRemaining, setRoundSecondsRemaining] = useState(0);
    const [intervalTimer, setIntervalTimer] = useState(null);
    const latestRound = useSelector(state => (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []});
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};
    const isGameStarted = useSelector(state => state.game.isGameStarted);
    const gameStartDateTime = useSelector(state => state.game.gameStartedDateTimeString ? new Date(state.game.gameStartedDateTimeString) : undefined);
    const isRoundStarted = latestTrial.trialResult === trialResult.ongoing;
    const roundStartDateTime = latestTrial.startedDateTimeString ? new Date(latestTrial.startedDateTimeString) : undefined;
    const roundLengthInSeconds = useSelector(state => state.app.config.roundLengthInSeconds);
    const timeExtensionInSeconds = useSelector(state => state.app.config.timeExtensionInSeconds);
    const gameLengthInSeconds = useSelector(state => state.app.config.gameLengthInSeconds);
    const isRoundBaseTimeElapsed = latestRound.isRoundBaseTimeElapsed;
    const isHost = useSelector(state => state.connection.hostPeerId === state.connection.localPeerId);
    const isThisTheDrawer = useSelector(state => latestRound.drawer && (latestRound.drawer.peerId === state.game.localPlayer.peerId));
    const phrase = latestRound.phrase;

    const dispatch = useDispatch();

    useEffect(() => {
        updateSecondsRemaining();

        return () => {
            if (intervalTimer) {
                clearInterval(intervalTimer);
                setIntervalTimer(null);
            }
        };
    }, []);

    useEffect(() => {
        if (!intervalTimer && isRoundStarted) {
            updateSecondsRemaining();
            setIntervalTimer(setInterval(updateSecondsRemaining, 1000));
        } else if (intervalTimer && !isRoundStarted) {
            clearInterval(intervalTimer);
            setIntervalTimer(null);
        }
    }, [isRoundStarted]);

    /**
     * @private
     */
    function updateSecondsRemaining() {
        const newlyCalculatedGameSecondsRemaining = gameStartDateTime
            ? (gameStartDateTime.getTime() + (gameLengthInSeconds * 1000) - (new Date()).getTime()) / 1000
            : undefined;

        const normalRoundSecondsRemaining = roundStartDateTime
            ? (roundStartDateTime.getTime() + (roundLengthInSeconds * 1000) - (new Date()).getTime()) / 1000
            : undefined;
        const newlyCalculatedRoundSecondsRemaining = normalRoundSecondsRemaining + (isRoundBaseTimeElapsed ? timeExtensionInSeconds : 0);
        setGameSecondsRemaining(newlyCalculatedGameSecondsRemaining);
        setRoundSecondsRemaining(newlyCalculatedRoundSecondsRemaining);

        if (!isRoundBaseTimeElapsed && (normalRoundSecondsRemaining <= 0)) {
            /* Mark base time elapsed if needed */
            dispatch(gameActionCreators.createMarkRoundBaseTimeElapsedRequest());
        } else if (isThisTheDrawer && (newlyCalculatedRoundSecondsRemaining <= 0)) {
            /* End round if needed */
            dispatch(gameActionCreators.createMarkRoundEndedRequest(phrase, null, new Date().toISOString()));
            dispatch(chatActionCreators.createSendRoundEndedRequest(null, null, null, null, phrase));
        }

        /* End game if needed */
        if (isHost && isGameStarted && newlyCalculatedGameSecondsRemaining < 0) {
            dispatch(gameActionCreators.createEndGameRequest(new Date().toISOString()));
        }
    }

    const formattedGameTime = formatRemainingTime(gameSecondsRemaining);
    const isGameTimeOverSoon = gameSecondsRemaining < gameLengthInSeconds / 20;
    const gameTimerClass = ['game', 'timer',
        isGameTimeOverSoon ? ((roundSecondsRemaining >= 0) ? 'overSoon' : 'over') : ''].join(' ').trim();

    const formattedRoundTime = formatRemainingTime(roundSecondsRemaining);
    const isRoundTimeOverSoon = roundSecondsRemaining
        < (!isRoundBaseTimeElapsed ? roundLengthInSeconds : timeExtensionInSeconds) / 6;
    const roundTimerClass = ['round', 'timer', isRoundBaseTimeElapsed ? 'extension' : '',
        isRoundTimeOverSoon ? ((roundSecondsRemaining >= 0) ? 'overSoon' : 'over') : ''].join(' ').trim();

    return React.createElement('div', {},
        React.createElement('div', {className: 'section round'},
            React.createElement('div', {className: 'round title'}, 'Round:'),
            React.createElement('div', {className: roundTimerClass}, (isRoundBaseTimeElapsed ? '+' : '') + formattedRoundTime),
        ),
        React.createElement('div', {className: 'section game'},
            React.createElement('div', {className: 'game title'}, 'Game:'),
            React.createElement('div', {className: gameTimerClass}, formattedGameTime),
        ),
    );
};
