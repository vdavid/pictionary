import {actionCreators as chatActionCreators} from '../store.mjs';

const {useSelector, useDispatch} = window.ReactRedux;

export const ChatInput = () => {
    const dispatch = useDispatch();
    const typedMessage = useSelector(state => state.chat.typedMessage);
    const localPeerId = useSelector(state => state.game.localPlayer.peerId);

    const addMessage = messageText => dispatch(chatActionCreators.createSendMessageRequest(localPeerId, messageText));
    const saveTypedMessage = messageText => dispatch(chatActionCreators.createSaveTypedMessageRequest(messageText));

    return React.createElement('input', {
        type: 'text',
        placeholder: 'Enter message or guess...',
        maxLength: 160,
        autoFocus: true,
        value: typedMessage,
        onChange: event => saveTypedMessage(event.target.value),
        onKeyUp: event => {
            if (event.keyCode === 13) {
                addMessage(event.target.value);
                event.target.value = '';
            }
        },
    });
};
