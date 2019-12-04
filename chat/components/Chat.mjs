import {actionCreators as chatActionCreators} from '../store.mjs';
import SendButton from './SendButton.mjs';
import ChatInput from './ChatInput.mjs';
import ChatMessages from './ChatMessages.mjs';

const {connect} = window.ReactRedux;

class Chat extends React.Component {
    /**
     * @param {{typedMessage: string, messages: string[], addMessage: function(string): void, saveTypedMessage: function(string):void}} props
     */
    constructor(props) {
        super(props);
    }

    render() {
        return React.createElement('section', {id: 'chatSection'},
            React.createElement('div', {className: 'chatInputAndButton'},
                React.createElement(ChatInput, {
                    typedMessage: this.props.typedMessage,
                    saveTypedMessage: this.props.saveTypedMessage,
                    addMessage: this.props.addMessage,
                    isRoundStarted: this.props.isRoundStarted,
                    isLocalPlayerDrawing: this.props.isLocalPlayerDrawing,
                }),
                React.createElement(SendButton, {
                    typedMessage: this.props.typedMessage,
                    addMessage: this.props.addMessage,
                }),
            ),
            React.createElement(ChatMessages, {
                messages: this.props.messages
            }),
        );
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        typedMessage: state.chat.typedMessage,
        messages: state.chat.messages,
        isRoundStarted: state.game.isRoundStarted,
        isLocalPlayerDrawing: state.game.drawerPeerId === state.game.localPlayer.peerId,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        saveTypedMessage: message => {
            dispatch(chatActionCreators.createSaveTypedMessageRequest(message));
        },
        addMessage: message => {
            dispatch(chatActionCreators.createSendMessageRequest(message));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat);