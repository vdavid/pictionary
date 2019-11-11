import MessageComponent from './MessageComponent.mjs';

export default class MessagesComponent extends React.Component {
    componentDidUpdate(previousProps) {
        if (this.props.messages.length !== previousProps.messages.length) {
            this.refs['chatMessages'].scrollTop = this.refs['chatMessages'].scrollHeight;
        }
    }

    render() {
        return React.createElement('ul', {ref: 'chatMessages'},
            this.props.messages.map((message, index) => React.createElement(MessageComponent, {key: index, message})));
    }
}