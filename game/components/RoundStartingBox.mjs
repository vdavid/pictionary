import {trialResult} from '../trial-result.mjs';
import {actionCreators as gameActionCreators} from '../store.mjs';

const {useState, useEffect, useRef} = window.React;
const {useSelector, useDispatch} = window.ReactRedux;

export const RoundStartingBox = () => {
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    const [, setIntervalTimer] = useState(null);
    const intervalTimerRef = useRef(null);
    const setIntervalTimerWithRef = (value) => { setIntervalTimer(value); intervalTimerRef.current = value; };
    const [startRoundTimer, setStartRoundTimer] = useState(null);
    const dispatch = useDispatch();

    const latestRound = useSelector(state => (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []});
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};
    const isRoundStarting = latestTrial.trialResult === trialResult.starting;
    const startingDateTime = latestTrial.startingDateTimeString ? new Date(latestTrial.startingDateTimeString) : undefined;
    const isLocalPlayerDrawing = useSelector(state => latestRound.drawer.peerId === state.game.localPlayer.peerId);
    const roundCountdownLengthInSeconds = useSelector(state => state.app.config.roundCountdownLengthInSeconds);

    useEffect(() => {
        updateSecondsRemaining();
    }, []);

    useEffect(() => {
        if (isRoundStarting && !intervalTimerRef.current) {
            setIntervalTimerWithRef(isRoundStarting ? setInterval(updateSecondsRemaining, 1000) : null);
            setStartRoundTimer(isRoundStarting ? setTimeout(timeIsUp, roundCountdownLengthInSeconds * 1000) : null);
        } else if (!isRoundStarting && intervalTimerRef.current) {
            clearInterval(intervalTimerRef.current);
            setIntervalTimerWithRef(null);
            clearInterval(startRoundTimer);
            setStartRoundTimer(null);
        }

        return () => {
            if (intervalTimerRef.current) {
                clearInterval(intervalTimerRef.current);
                setIntervalTimerWithRef(null);
                clearInterval(startRoundTimer);
                setStartRoundTimer(null);
            }
        };
    }, [roundCountdownLengthInSeconds, startingDateTime.toISOString(), isRoundStarting]);

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
        setSecondsRemaining(startingDateTime
            ? (startingDateTime.getTime() + (roundCountdownLengthInSeconds * 1000) - (new Date()).getTime()) / 1000
            : undefined);
    }

    function timeIsUp() {
        clearInterval(intervalTimerRef.current);
        dispatch(gameActionCreators.createStartRoundSuccess());
    }
};
