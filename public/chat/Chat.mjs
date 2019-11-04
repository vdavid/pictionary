import {actionTypes as chatActionTypes} from './store.mjs';
import SendButton from './SendButton.mjs';
import ChatInputComponent from './ChatInputComponent.mjs';
import MessagesComponent from './MessagesComponent.mjs';

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
            React.createElement(ChatInputComponent, {
                typedMessage: this.props.typedMessage,
                saveTypedMessage: this.props.saveTypedMessage,
                addMessage: this.props.addMessage,
            }),
            React.createElement(SendButton, {
                typedMessage: this.props.typedMessage,
                addMessage: this.props.addMessage,
            }),
            React.createElement(MessagesComponent, {
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
    };
}

function mapDispatchToProps(dispatch) {
    return {
        saveTypedMessage: message => {
            dispatch({type: chatActionTypes.SAVE_TYPED_MESSAGE, payload: message});
        },
        addMessage: message => {
            dispatch({type: chatActionTypes.SEND_MESSAGE, payload: message});
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat);