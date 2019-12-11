import SendButton from './SendButton.mjs';
import ChatInput from './ChatInput.mjs';
import ChatMessages from './ChatMessages.mjs';
import {actionCreators as chatActionCreators} from '../store.mjs';

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
                    localPeerId: this.props.localPeerId,
                    typedMessage: this.props.typedMessage,
                    saveTypedMessage: this.props.saveTypedMessage,
                    addMessage: this.props.addMessage,
                    isGameStarted: this.props.isGameStarted,
                    isLocalPlayerDrawing: this.props.isLocalPlayerDrawing,
                }),
                React.createElement(SendButton, {
                    localPeerId: this.props.localPeerId,
                    typedMessage: this.props.typedMessage,
                    addMessage: this.props.addMessage,
                }),
            ),
            React.createElement(ChatMessages, {
                messages: this.props.messages,
                players: this.props.players,
            }),
        );
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    const latestRound = (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []};
    return {
        typedMessage: state.chat.typedMessage,
        messages: state.chat.messages,
        isGameStarted: state.game.isGameStarted,
        localPeerId: state.game.localPlayer.peerId,
        isLocalPlayerDrawing: latestRound.drawer ? (latestRound.drawer.peerId === state.game.localPlayer.peerId) : false,
        players: [state.game.localPlayer, ...state.game.remotePlayers],
    };
}

function mapDispatchToProps(dispatch) {
    return {
        saveTypedMessage: messageText => {
            dispatch(chatActionCreators.createSaveTypedMessageRequest(messageText));
        },
        addMessage: (localPeerId, message) => {
            dispatch(chatActionCreators.createSendMessageRequest(localPeerId, message));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat);