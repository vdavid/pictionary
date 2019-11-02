const {connect} = window.ReactRedux;

class Chat extends React.Component {
    /**
     * @param {{typedMessage: string, messages: string[], addMessage: function(string): void, saveTypedMessage: function(string):void}} props
     */
    constructor(props) {
        super(props);
    }

    onTyping(event) {
        this.props.saveTypedMessage(event.target.value);
        if (event.keyCode === 13) {
            this.props.addMessage(event.target.value);
            event.target.value = '';
        }
    }

    render() {
        return React.createElement('div', {className: 'chat'},
            React.createElement('input', {type: 'text', id: 'sendMessageBox', placeholder: 'Enter a message...', autoFocus: true, onChange: this.onTyping.bind(this), value: this.props.typedMessage }),
            React.createElement('button', {onClick: () => this.props.addMessage(this.props.typedMessage)}, 'Send'),
            React.createElement('button', null, 'Clear messages'),
            React.createElement('div', {className: 'messages'}, this.props.messages.join('<br>'))
        );
    }
}

function mapStateToProps(state) {
    return {
        typedMessage: state.chat.typedMessage,
        messages: state.chat.messages,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        addMessage: message => {
            dispatch({type: 'addMessage', payload: message});
        },
        saveTypedMessage: message => {
            dispatch({type: 'saveTypedMessage', payload: message});
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat);