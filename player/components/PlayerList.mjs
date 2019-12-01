const {connect} = window.ReactRedux;
import Player from './Player.mjs';

class PlayerList extends React.Component {
    render() {
        return React.createElement('div', {className: 'playerList'},
            React.createElement('ul', {},
                React.createElement(Player, {
                    name: this.props.localPlayer.name,
                    score: this.props.localPlayer.score,
                    peerId: this.props.localPlayer.peerId,
                    isHost: (this.props.hostPeerId === this.props.localPlayer.peerId),
                    isLocal: true,
                }),
                this.props.otherPlayers.map((player, index) => React.createElement(Player, {
                    key: index,
                    name: player.name,
                    score: player.score,
                    peerId: player.peerId,
                    isHost: (this.props.hostPeerId === player.peerId),
                })),
            ),
        );
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        localPlayer: state.players.localPlayer,
        otherPlayers: state.players.otherPlayers,
        hostPeerId: state.connection.hostPeerId,
    };
}

export default connect(mapStateToProps)(PlayerList);