export default class ChatInput extends React.Component {
    constructor(props) {
        super(props);
        this._onTyping = this._onTyping.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate() {
        const input = this.refs['chatInput'];
        if (this.props.isGameStarted && (document.activeElement !== input) && (!this.props.isLocalPlayerDrawing)) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
    }

    render() {
        return React.createElement('input', {
            type: 'text',
            ref: 'chatInput',
            placeholder: 'Enter message or guess...',
            maxLength: 160,
            autoFocus: true,
            value: this.props.typedMessage,
            onChange: this._onTyping,
            onKeyUp: this._onKeyUp,
        });
    }

    _onTyping(event) {
        this.props.saveTypedMessage(event.target.value);
    }

    _onKeyUp(event) {
        if (event.keyCode === 13) {
            this.props.addMessage(this.props.localPeerId, event.target.value);
            event.target.value = '';
        }
    }
}
