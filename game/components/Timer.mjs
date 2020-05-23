import React, {useEffect, useRef, useState} from "../../web_modules/react.js";
import {useDispatch, useSelector} from "../../web_modules/react-redux.js";
import {trialResult} from '../trial-result.mjs';
import {actionCreators as gameActionCreators} from '../../game/store.mjs';
import {actionCreators as chatActionCreators} from '../../chat/store.mjs';
import {useConfig} from "../../app/components/ConfigProvider.mjs";

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
    const config = useConfig();
    const [gameSecondsRemaining, setGameSecondsRemaining] = useState(0);
    const [roundSecondsRemaining, setRoundSecondsRemaining] = useState(0);
    const dispatch = useDispatch();

    const latestRound = useSelector(state => (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []});
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};
    const isGameStarted = useSelector(state => state.game.isGameStarted);
    const isGameStartedRef = useRef(null);
    isGameStartedRef.current = isGameStarted;
    const gameStartDateTime = useSelector(state => state.game.gameStartedDateTimeString ? new Date(state.game.gameStartedDateTimeString) : undefined);
    const gameStartDateTimeRef = useRef(null);
    gameStartDateTimeRef.current = gameStartDateTime;
    const isRoundStarted = latestTrial.trialResult === trialResult.ongoing;
    const roundStartDateTime = latestTrial.startedDateTimeString ? new Date(latestTrial.startedDateTimeString) : undefined;
    const roundStartDateTimeRef = useRef(null);
    roundStartDateTimeRef.current = roundStartDateTime;
    const isRoundBaseTimeElapsed = latestRound.isRoundBaseTimeElapsed;
    const isRoundBaseTimeElapsedRef = useRef(null);
    isRoundBaseTimeElapsedRef.current = isRoundBaseTimeElapsed;
    const isHost = useSelector(state => state.connection.hostPeerId === state.connection.localPeerId);
    const isHostRef = useRef(null);
    isHostRef.current = isHost;
    const isThisTheDrawer = useSelector(state => latestRound.drawer && (latestRound.drawer.peerId === state.game.localPlayer.peerId));
    const isThisTheDrawerRef = useRef(null);
    isThisTheDrawerRef.current = isThisTheDrawer;
    const phrase = latestRound.phrase;
    const phraseRef = useRef(null);
    phraseRef.current = phrase;

    useEffect(() => {
        updateSecondsRemaining();
    }, []);

    useEffect(() => {
        let intervalTimer;
        if (!intervalTimer && isRoundStarted) {
            updateSecondsRemaining();
            intervalTimer = setInterval(updateSecondsRemaining, 1000);
        } else if (intervalTimer && !isRoundStarted) {
            clearInterval(intervalTimer);
            intervalTimer = null;
        }

        return () => {
            if (intervalTimer) {
                clearInterval(intervalTimer);
            }
        }
    }, [isRoundStarted]);

    /**
     * @private
     */
    function updateSecondsRemaining() {
        const newlyCalculatedGameSecondsRemaining = gameStartDateTimeRef.current
            ? (gameStartDateTimeRef.current.getTime() + (config.game.gameLengthInSeconds * 1000) - (new Date()).getTime()) / 1000
            : undefined;

        const normalRoundSecondsRemaining = roundStartDateTimeRef.current
            ? (roundStartDateTimeRef.current.getTime() + (config.game.roundLengthInSeconds * 1000) - (new Date()).getTime()) / 1000
            : undefined;
        const newlyCalculatedRoundSecondsRemaining = normalRoundSecondsRemaining + (isRoundBaseTimeElapsedRef.current ? config.game.timeExtensionInSeconds : 0);
        setGameSecondsRemaining(newlyCalculatedGameSecondsRemaining);
        setRoundSecondsRemaining(newlyCalculatedRoundSecondsRemaining);

        if (!isRoundBaseTimeElapsedRef.current && (normalRoundSecondsRemaining <= 0)) {
            /* Mark base time elapsed if needed */
            dispatch(gameActionCreators.createMarkRoundBaseTimeElapsedRequest());
        } else if (isThisTheDrawerRef.current && (newlyCalculatedRoundSecondsRemaining <= 0)) {
            /* End round if needed */
            dispatch(gameActionCreators.createMarkRoundEndedRequest(phraseRef.current, null, new Date().toISOString()));
            dispatch(chatActionCreators.createSendRoundEndedRequest(null, null, null, null, phraseRef.current));
        }

        /* End game if needed */
        if (isHostRef.current && isGameStartedRef.current && newlyCalculatedGameSecondsRemaining < 0) {
            dispatch(gameActionCreators.createEndGameRequest(new Date().toISOString()));
        }
    }

    const formattedGameTime = formatRemainingTime(gameSecondsRemaining);
    const isGameTimeOverSoon = gameSecondsRemaining < config.game.gameLengthInSeconds / 20;
    const gameTimerClass = ['game', 'timer',
        isGameTimeOverSoon ? ((roundSecondsRemaining >= 0) ? 'overSoon' : 'over') : ''].join(' ').trim();

    const formattedRoundTime = formatRemainingTime(roundSecondsRemaining);
    const isRoundTimeOverSoon = roundSecondsRemaining
        < (!isRoundBaseTimeElapsed ? config.game.roundLengthInSeconds : config.game.timeExtensionInSeconds) / 6;
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
