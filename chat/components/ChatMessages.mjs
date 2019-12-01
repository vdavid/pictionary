import ChatMessage from './ChatMessage.mjs';

export default class ChatMessages extends React.Component {
    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate(previousProps) {
        if (this.props.messages.length !== previousProps.messages.length) {
            this.refs['chatMessages'].scrollTop = this.refs['chatMessages'].scrollHeight;
        }
    }

    render() {
        return React.createElement('ul', {ref: 'chatMessages'},
            this.props.messages.map((message, index) => React.createElement(ChatMessage, {key: index, message})));
    }
}