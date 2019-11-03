export default class Input extends React.Component {
    onTyping(event) {
        this.props.saveTypedMessage(event.target.value);
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
            onChange: this.onTyping.bind(this),
        });
    }
}
