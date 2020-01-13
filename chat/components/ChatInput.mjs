import {actionCreators as chatActionCreators} from '../store.mjs';

const {useSelector, useDispatch} = window.ReactRedux;

export const ChatInput = () => {
    const dispatch = useDispatch();

    const typedMessage = useSelector(state => state.chat.typedMessage);
    const localPeerId = useSelector(state => state.game.localPlayer.peerId);

    return React.createElement('input', {
        type: 'text',
        placeholder: 'Enter message or guess...',
        maxLength: 160,
        autoFocus: true,
        value: typedMessage,
        onChange: event => dispatch(chatActionCreators.createSaveTypedMessageRequest(event.target.value)),
        onKeyUp: event => {
            if (event.keyCode === 13) {
                dispatch(chatActionCreators.createSendMessageRequest(localPeerId, event.target.value));
                event.target.value = '';
            }
        },
    });
};
