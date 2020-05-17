import React from "../../web_modules/react.js";
import {useSelector} from "../../web_modules/react-redux.js";
import {DrawingCanvas} from './DrawingCanvas.mjs';
import {GuessingCanvas} from './GuessingCanvas.mjs';
import {FullscreenButton} from './FullscreenButton.mjs';
import {DrawingButtonBar} from './DrawingButtonBar.mjs';

export const Canvases = () => {
    const latestRound = useSelector(state => (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []});
    const localPeerId = useSelector(state => state.game.localPlayer.peerId);
    const isLocalPlayerDrawing = latestRound.drawer ? (latestRound.drawer.peerId === localPeerId) : false;

    return React.createElement('section', {id: 'canvasSection'},
        isLocalPlayerDrawing ? React.createElement(DrawingCanvas) : null,
        React.createElement(FullscreenButton),
        isLocalPlayerDrawing ? React.createElement(DrawingButtonBar) : null,
        !isLocalPlayerDrawing ? React.createElement(GuessingCanvas) : null,
    );
};