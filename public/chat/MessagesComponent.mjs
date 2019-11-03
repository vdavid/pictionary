import MessageComponent from './MessageComponent.mjs';

export default class MessagesComponent extends React.Component {
    render() {
        return React.createElement('ul', {},
            this.props.messages.map((message, index) => React.createElement(MessageComponent, {key: index, message})));
    }
}