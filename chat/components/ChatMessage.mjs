export default class ChatMessage extends React.Component {
    _formatDate(date) {
        const h = date.getHours();
        const m = date.getMinutes().toString().padStart(2, '0');
        const s = date.getSeconds().toString().padStart(2, '0');
        return h + ':' + m + ':' + s;
    };

    _getPlayerNameByPeerId(peerId) {
        const player = this.props.players.find(player => player.peerId === peerId);
        return player ? player.name : 'Unknown player';
    }

    render() {
        const senderAndMessageText = ((this.props.message.isIncoming && this.props.message.senderPeerId)
            ? this._getPlayerNameByPeerId(this.props.message.senderPeerId) + ': ' : '') + this.props.message.text;
        return React.createElement('li', {className: [this.props.message.isIncoming ? 'in' : 'out', this.props.message.isSystemMessage ? 'system' : ''].join(' ').trim()},
            React.createElement('div', {className: 'message'},
                React.createElement('span', {className: 'text'}, senderAndMessageText),
                React.createElement('span', {className: 'dateTime'}, this._formatDate(new Date(this.props.message.dateTimeString))),
            ),
        );
    }
}