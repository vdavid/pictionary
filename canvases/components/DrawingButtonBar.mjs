import React from "../../web_modules/react.js";
import {useSelector} from "../../web_modules/react-redux.js";

import {GiveUpButton} from '../../game/components/GiveUpButton.mjs';
import {ClearButton} from './ClearButton.mjs';

export const DrawingButtonBar = () => {
    const isRoundBaseTimeElapsed = useSelector(state => ((state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []}).isRoundBaseTimeElapsed);
    return React.createElement('section', {id: 'drawingButtonBar'},
        React.createElement(ClearButton),
        isRoundBaseTimeElapsed ? React.createElement(GiveUpButton) : null,
    );
};
