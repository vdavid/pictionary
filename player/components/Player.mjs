import Avatar from './Avatar.mjs';

export default class Player extends React.Component {
    render() {
        return React.createElement('li', {className: [this.props.isHost ? 'host' : '', this.props.isLocal ? 'local' : ''].join(' ').trim()},
            React.createElement(Avatar, {name: this.props.name, size: 40}),
            React.createElement('span', {className: 'name'}, this.props.name),
            React.createElement('span', {className: 'score'}, this.props.score),
            React.createElement('span', {className: 'peerId'}, this.props.peerId),
        );
    }
}
