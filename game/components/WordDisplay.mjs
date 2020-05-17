import React from "../../web_modules/react.js";
import {useSelector} from "../../web_modules/react-redux.js";
import {trialResult} from '../trial-result.mjs';

export const WordDisplay = () => {
    const latestRound = useSelector(state => (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []});
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};
    const isRoundStarted = latestTrial.trialResult === trialResult.ongoing;
    const isLocalPlayerDrawing = useSelector(state => latestRound.drawer ? (latestRound.drawer.peerId === state.game.localPlayer.peerId) : false);
    const activePhrase = latestRound.phrase;

    return React.createElement('section', {id: 'wordDisplaySection'},
        React.createElement('span', {}, getContentText())
    );

    function getContentText() {
        if (!isRoundStarted) {
            return '';
        } else if (isLocalPlayerDrawing) {
            return 'Draw: “' + activePhrase + '”';
        } else {
            return 'See the drawing and start guessing what it is!';
        }
    }
};