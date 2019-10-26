export default class Chat extends React.Component {
    render() {
        return React.createElement('div', {className: 'chat'},
            React.createElement('input', {type: 'text', id: 'sendMessageBox', placeholder: 'Enter a message...', autoFocus: 'true'}),
            React.createElement('button', null, 'Send'),
            React.createElement('button', null, 'Clear messages'),
            React.createElement('div', {className: 'messages'})
        );
    }
}