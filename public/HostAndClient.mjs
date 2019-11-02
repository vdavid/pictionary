import Chat from './Chat.mjs';
import HostConnector from './HostConnector.mjs';
import ClientConnector from './ClientConnector.mjs';

export default class HostAndClient extends React.Component {
    render() {
        return React.createElement('div', {className: 'page'},
                React.createElement('h1', null, 'Greetings, ' + this.props.name + '!'),
                React.createElement(Chat, {messages: this.props.messages, addMessage: this.props.addMessage}),
                React.createElement(HostConnector, {}),
                React.createElement(ClientConnector, {}),
        );
    }
}