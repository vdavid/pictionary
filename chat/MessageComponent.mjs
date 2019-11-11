export default class MessageComponent extends React.Component {
    _formatDate(date) {
        const h = date.getHours();
        const m = date.getMinutes().toString().padStart(2, '0');
        const s = date.getSeconds().toString().padStart(2, '0');
        return h + ':' + m + ':' + s;
    };

    render() {
        return React.createElement('li', {className: [this.props.message.isIncoming ? 'in' : 'out', this.props.message.isSystemMessage ? 'system' : ''].join(' ').trim()},
            React.createElement('div', {className: 'message'},
                React.createElement('span', {className: 'text'}, this.props.message.text),
                React.createElement('span', {className: 'dateTime'}, this._formatDate(this.props.message.dateTime)),
            ),
        );
    }
}