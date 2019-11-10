export default class ChatInputComponent extends React.Component {
    constructor(props) {
        super(props);
        this._onTyping = this._onTyping.bind(this)
    }

    _onTyping(event) {
        this.props.saveTypedMessage(event.target.value);
    }

    _onKeyUp(event) {
        if (event.keyCode === 13) {
            this.props.addMessage(event.target.value);
            event.target.value = '';
        }
    }

    render() {
        return React.createElement('input',{
            type: 'text',
            id: 'sendMessageBox',
            placeholder: 'Enter a message...',
            autoFocus: true,
            value: this.props.typedMessage,
            onChange: this._onTyping,
            onKeyUp: this._onKeyUp,
        });
    }
}
