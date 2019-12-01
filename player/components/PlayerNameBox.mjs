import Avatar from './Avatar.mjs';

export default class PlayerNameBox extends React.Component {
    render() {
        return React.createElement('div', {className: 'playerNameBox'},
            React.createElement(Avatar, {name: this.props.playerName, size: 80}),
            React.createElement('p', {}, 'Set your name:'),
            React.createElement('input', {
                value: this.props.playerName,
                maxLength: 25,
                autoCompleteType: 'nickname',
                onChange: event => this.props.setPlayerName(event.target.value),
            }, this.props.localPeerId),
            React.createElement('p', {}, 'Then wait until they connect.'),
        );
    }
}