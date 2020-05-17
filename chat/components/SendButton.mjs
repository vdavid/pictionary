import React from "../../web_modules/react.js";
import {useSelector, useDispatch} from "../../web_modules/react-redux.js";
import {actionCreators as chatActionCreators} from '../store.mjs';

export const SendButton = () => {
    const dispatch = useDispatch();

    const localPeerId = useSelector(state => state.game.localPlayer.peerId);
    const typedMessage = useSelector(state => state.chat.typedMessage);

    return React.createElement('button', {
        onClick: () => dispatch(chatActionCreators.createSendMessageRequest(localPeerId, typedMessage)),
        disabled: !typedMessage
    }, 'Send');
};
