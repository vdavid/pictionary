export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {text: ''};
    }

    onTyping(event) {
        this.setState({text: event.target.value});
        if (event.keyCode === 13) {
            this.props.addMessage(this.state.text);
            this.state.text = '';
        }
    }

    render() {
        return React.createElement('div', {className: 'chat'},
            React.createElement('input', {type: 'text', id: 'sendMessageBox', placeholder: 'Enter a message...', autoFocus: true, onChange: this.onTyping.bind(this), value: this.state.text }),
            React.createElement('button', {onClick: () => this.props.addMessage(this.state.text)}, 'Send'),
            React.createElement('button', null, 'Clear messages'),
            React.createElement('div', {className: 'messages'}, this.props.messages.join('<br>'))
        );
    }
}