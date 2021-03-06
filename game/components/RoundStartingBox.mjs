import React, {useEffect, useRef, useState} from "../../web_modules/react.js";
import {useDispatch, useSelector} from "../../web_modules/react-redux.js";
import {trialResult} from '../trial-result.mjs';
import {actionCreators as gameActionCreators} from '../store.mjs';
import {useConfig} from "../../app/components/ConfigProvider.mjs";

export const RoundStartingBox = () => {
    const config = useConfig();
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    const [, setIntervalTimer] = useState(null);
    const intervalTimerRef = useRef(null);
    const setIntervalTimerWithRef = (value) => {
        setIntervalTimer(value);
        intervalTimerRef.current = value;
    };
    const dispatch = useDispatch();

    const latestRound = useSelector(state => (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []});
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};
    const isRoundStarting = latestTrial.trialResult === trialResult.starting;
    const startingDateTime = latestTrial.startingDateTimeString ? new Date(latestTrial.startingDateTimeString) : undefined;
    const startingDateTimeRef = useRef(null);
    startingDateTimeRef.current = startingDateTime;
    const isLocalPlayerDrawing = useSelector(state => latestRound.drawer.peerId === state.game.localPlayer.peerId);
    useEffect(() => {
        updateSecondsRemaining();
    }, []);

    useEffect(() => {
        let startRoundTimer;
        if (isRoundStarting && !intervalTimerRef.current) {
            setIntervalTimerWithRef(isRoundStarting ? setInterval(updateSecondsRemaining, 1000) : null);
            startRoundTimer = isRoundStarting ? setTimeout(timeIsUp, config.game.roundCountdownLengthInSeconds * 1000) : null;
        } else if (!isRoundStarting && intervalTimerRef.current) {
            clearInterval(intervalTimerRef.current);
            setIntervalTimerWithRef(null);
            if (startRoundTimer) {
                clearInterval(startRoundTimer);
                startRoundTimer = null;
            }
        }

        return () => {
            if (intervalTimerRef.current) {
                clearInterval(intervalTimerRef.current);
                setIntervalTimerWithRef(null);
            }
            if (startRoundTimer) {
                clearInterval(startRoundTimer);
                startRoundTimer = null;
            }
        };
    }, [startingDateTime.toISOString(), isRoundStarting]);

    return React.createElement('div', {},
        React.createElement('div', {className: 'fullScreenSemiTransparentCover'}),
        React.createElement('div', {id: 'gameStartingBox', className: 'midScreenBox'},
            React.createElement('p', {}, 'Next round is starting in'),
            React.createElement('div', {className: 'timer'}, Math.ceil(secondsRemaining)),
            React.createElement('p', {className: 'whoDraws'}, isLocalPlayerDrawing ? 'You\'ll be the one drawing.' : 'You\'ll be the one guessing.'),
        ),
    );

    /**
     * @private
     */
    function updateSecondsRemaining() {
        setSecondsRemaining(startingDateTimeRef.current
            ? (startingDateTimeRef.current.getTime() + (config.game.roundCountdownLengthInSeconds * 1000) - (new Date()).getTime()) / 1000
            : undefined);
    }

    function timeIsUp() {
        clearInterval(intervalTimerRef.current);
        dispatch(gameActionCreators.createStartRoundSuccess());
    }
};
