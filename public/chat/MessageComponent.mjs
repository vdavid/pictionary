export default class MessageComponent extends React.Component {
    _formatDate(date) {
        const h = date.getHours();
        const m = date.getMinutes().toString().padStart(2, '0');
        const s = date.getSeconds().toString().padStart(2, '0');
        return h + ":" + m + ":" + s;
    };

    render() {
        return React.createElement('li', {className: [this.props.message.isIncoming ? 'in' : 'out', this.props.message.isSystemMessage ? 'system' : ''].join(' ').trim()},
            React.createElement('span', {className: 'dateTime'}, this._formatDate(this.props.message.dateTime)),
            React.createElement('span', {className: 'sender'}, this.props.message.isIncoming ? 'Remote' : 'Local:'),
            React.createElement('span', {className: 'message'}, this.props.message.text),
        );
    }
}