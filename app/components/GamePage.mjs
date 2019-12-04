const {connect} = window.ReactRedux;
import {actionCreators as gameActionCreators} from '../../game/store.mjs';

import ConnectBox from '../../connection/components/ConnectBox.mjs';
import NoConnectionBox from '../../connection/components/NoConnectionBox.mjs';
import RoundStartingBox from '../../game/components/RoundStartingBox.mjs';

import Canvases from '../../canvases/components/Canvases.mjs';
import WordDisplayComponent from '../../game/components/WordDisplay.mjs';

import PlayerList from '../../player/components/PlayerList.mjs';
import Chat from '../../chat/components/Chat.mjs';
import Timer from '../../game/components/Timer.mjs';

class GamePage extends React.Component {
    render() {
        return React.createElement('div', {id: 'gamePage'},
            React.createElement('div', {id: 'gamePageLayout'},
                React.createElement(Canvases),
                React.createElement(WordDisplayComponent),
                React.createElement(PlayerList),
                React.createElement(Chat, {state: this.props.chat}),
                React.createElement('section', {id: 'timerSection'},
                    this.props.isRoundStarted ? React.createElement(Timer, {durationInMilliseconds: 60 * 1000}) : null,
                ),
            ),
            !this.props.isAcceptingConnections ? React.createElement(NoConnectionBox) : null,
            (this.props.isAcceptingConnections && !this.props.isConnectedToAnyPeers) ? React.createElement(ConnectBox) : null,
            this.props.isRoundStarting ? React.createElement(RoundStartingBox, {durationInMilliseconds: 3 * 1000}) : null,
        );
    }

    /**
     * @returns {Player}
     * @private
     */
    _getRandomStartingPlayer() {
        /* Create list of potential next drawers. If someone had the past 2 rounds, take them out of the potentials. */
        const potentialNextDrawers = [this.props.localPlayer, ...this.props.remotePlayers];
        if (this.props.previousDrawerPeerId && (this.props.previousDrawerPeerId === this.props.currentDrawerPeerId)) {
            potentialNextDrawers.splice(potentialNextDrawers.findIndex(
                player => player.peerId === this.props.currentDrawerPeerId));
        }
        return potentialNextDrawers[Math.floor(Math.random() * potentialNextDrawers.length)];
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate() {
        if ((this.props.remotePlayers.length > 0)  && this.props.isHost && !this.props.isRoundStarting && !this.props.isRoundStarted) {
            this.props.startRound(this._getRandomStartingPlayer().peerId);
        }
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        isAcceptingConnections: state.connection.isAcceptingConnections,
        isConnectedToAnyPeers: state.connection.isConnectedToAnyPeers,
        isRoundStarted: state.game.isRoundStarted,
        isRoundStarting: state.game.isRoundStarting,
        isHost: state.game.hostPeerId === state.game.localPlayer.peerId,
        previousDrawerPeerId: state.game.previousDrawerPeerId,
        currentDrawerPeerId: state.game.drawerPeerId,
        localPlayer: state.game.localPlayer,
        remotePlayers: state.game.remotePlayers,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        startRound: (nextDrawerPeerId) => {
            dispatch(gameActionCreators.createStartRoundRequest(nextDrawerPeerId));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GamePage);