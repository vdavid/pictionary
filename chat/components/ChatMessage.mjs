function formatDate(date) {
    const h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return h + ':' + m + ':' + s;
}

function getPlayerNameByPeerId(players, peerId) {
    const player = players.find(player => player.peerId === peerId);
    return player ? player.name : 'Unknown player';
}

export const ChatMessage = ({message, players}) => {
    const senderAndMessageText = ((message.isIncoming && message.senderPeerId)
        ? getPlayerNameByPeerId(players, message.senderPeerId) + ': ' : '') + message.text;

    return React.createElement('li', {className: [message.isIncoming ? 'in' : 'out', message.isSystemMessage ? 'system' : ''].join(' ').trim()},
        React.createElement('div', {className: 'message'},
            React.createElement('span', {className: 'text'}, senderAndMessageText),
            React.createElement('span', {className: 'dateTime'}, formatDate(new Date(message.dateTimeString))),
        ),
    );
};