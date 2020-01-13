import {actionCreators as chatActionCreators} from '../store.mjs';

const {useSelector, useDispatch} = window.ReactRedux;

export const SendButton = () => {
    const dispatch = useDispatch();

    const localPeerId = useSelector(state => state.game.localPlayer.peerId);
    const typedMessage = useSelector(state => state.chat.typedMessage);

    return React.createElement('button', {
        onClick: () => dispatch(chatActionCreators.createSendMessageRequest(localPeerId, typedMessage)),
        disabled: !typedMessage
    }, 'Send');
};
