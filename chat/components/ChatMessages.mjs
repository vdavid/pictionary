import {ChatMessage} from './ChatMessage.mjs';

const {useEffect, useRef} = window.React;
const {useSelector} = window.ReactRedux;

export const ChatMessages = () => {
    const messages = useSelector(state => state.chat.messages);
    const players = useSelector(state => [state.game.localPlayer, ...state.game.remotePlayers]);
    const chatMessages = useRef(null);

    useEffect(() => {
        chatMessages.current.scrollTop = chatMessages.current.scrollHeight;
    }, [messages.length]);

    return React.createElement('ul', {ref: chatMessages},
        messages.map((message, key) => React.createElement(ChatMessage, {key, message, players})));
};