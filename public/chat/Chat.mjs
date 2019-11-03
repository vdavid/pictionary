import SendButton from './SendButton.mjs';
import Input from './Input.mjs';
import {actionTypes as chatActionTypes} from './store.mjs';

const {connect} = window.ReactRedux;

class Chat extends React.Component {
    /**
     * @param {{typedMessage: string, messages: string[], addMessage: function(string): void, saveTypedMessage: function(string):void}} props
     */
    constructor(props) {
        super(props);
    }

    // TODO: Use this
    // _addMessage(message) {
    //     const now = new Date();
    //     const h = now.getHours();
    //     const m = now.getMinutes().toString().padStart(2, '0');
    //     const s = now.getSeconds().toString().padStart(2, '0');
    //     //message.innerHTML = "<br><span class=\"msg-time\">" + h + ":" + m + ":" + s + "</span>  -  " + msg + message.innerHTML;
    // };

    render() {
        return React.createElement('div', {className: 'chat'},
            React.createElement(Input, {
                typedMessage: this.props.typedMessage,
                saveTypedMessage: this.props.saveTypedMessage,
                addMessage: this.props.addMessage,
            }),
            React.createElement(SendButton, {
                typedMessage: this.props.typedMessage,
                addMessage: this.props.addMessage,
            }),
            React.createElement('div', {className: 'messages'}, this.props.messages.join('<br>'))
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