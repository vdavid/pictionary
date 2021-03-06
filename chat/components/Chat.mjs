import React from "../../web_modules/react.js";
import {useSelector} from "../../web_modules/react-redux.js";
import {SendButton} from './SendButton.mjs';
import {ChatInput} from './ChatInput.mjs';
import {ChatMessages} from './ChatMessages.mjs';

export const Chat = () => {
    const messages = useSelector(state => state.chat.messages);
    const players = useSelector(state => [state.game.localPlayer, ...state.game.remotePlayers]);

    return React.createElement('section', {id: 'chatSection'},
        React.createElement('div', {className: 'chatInputAndButton'},
            React.createElement(ChatInput),
            React.createElement(SendButton),
        ),
        React.createElement(ChatMessages, {messages, players}),
    );
};