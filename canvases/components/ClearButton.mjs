import React from "../../web_modules/react.js";
import {useDispatch} from "../../web_modules/react-redux.js";
import {actionCreators as gameActionCreators} from '../../game/store.mjs';
import {actionCreators as chatActionCreators} from '../../chat/store.mjs';

export const ClearButton = () => {
    const dispatch = useDispatch();

    return React.createElement('button', {
        className: 'clearButton',
        onClick: () => {
            dispatch(gameActionCreators.createClearRequest([]));
            dispatch(chatActionCreators.createNoteCanvasWasClearedRequest(true));
        }
    }, 'Clear');
};
