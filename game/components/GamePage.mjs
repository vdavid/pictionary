const {connect} = window.ReactRedux;

import {actionCreators as gameActionCreators} from '../store.mjs';

import ConnectBox from '../../connection/components/ConnectBox.mjs';
import NoConnectionBox from '../../connection/components/NoConnectionBox.mjs';
import RoundStartingBox from './RoundStartingBox.mjs';
import Canvases from '../../canvases/components/Canvases.mjs';
import WordDisplayComponent from './WordDisplay.mjs';
import GuessWatcher from './GuessWatcher.mjs';
import PlayerList from '../../player/components/PlayerList.mjs';
import Chat from '../../chat/components/Chat.mjs';
import Timer from './Timer.mjs';

import {connectionListenerStatus} from '../../connection/connection-listener-status.mjs';
import {trialResult} from '../trial-result.mjs';
import {getRandomPhrase} from '../../data/phrases.mjs';

class GamePage extends React.Component {
    render() {
        return React.createElement('div', {id: 'gamePage'},
            React.createElement('div', {id: 'gamePageLayout'},
                React.createElement(Canvases),
                React.createElement(WordDisplayComponent),
                React.createElement(GuessWatcher),
                React.createElement(PlayerList),
                React.createElement(Chat, {state: this.props.chat}),
                React.createElement('section', {id: 'timerSection'},
                    (this.props.roundStatus === trialResult.ongoing) ? React.createElement(Timer, {}) : null,
                ),
            ),
            this.props.shouldDisplayNoConnectionBox ? React.createElement(NoConnectionBox) : null,
            this.props.shouldDisplayConnectBox ? React.createElement(ConnectBox) : null,
            (this.props.roundStatus === trialResult.starting) ? React.createElement(RoundStartingBox, {}) : null,
        );
    }

    /**
     * Creates a list of potential next drawers.
     * If some player(s) have drawn 1–2 or more times less than someone else, they get to draw.
     * In case of 2–3 players, the difference can be 2, in case of more players, 1.
     * @returns {Player}
     * @private
     */
    _getRandomStartingPlayer() {
        const allPlayers = [this.props.localPlayer, ...this.props.remotePlayers];
        const maxDifference = allPlayers.length < 4 ? 2 : 1;
        /* Calculate how many times each player wsa the drawer */
        /** @type {Object<string, int>} */
        const drawerCounts = allPlayers.reduce((counts, player) => {
            counts[player.peerId] = 0;
            return counts;
        }, {});
        this.props.rounds.forEach(round => drawerCounts[round.drawer.peerId]++);

        const maxDrawerCount = Math.max(...Object.values(drawerCounts));
        const idlePlayerPeerIds = Object.entries(drawerCounts).filter(([, drawerCount]) => drawerCount <= maxDrawerCount - maxDifference).map(([peerId]) => peerId);

        /* Select players */
        const potentialNextDrawers = idlePlayerPeerIds.length
            ? allPlayers.filter(player => idlePlayerPeerIds.includes(player.peerId)) : allPlayers;

        return potentialNextDrawers[Math.floor(Math.random() * potentialNextDrawers.length)];
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate() {
        /* Take control of the game if this is the host and there are players */
        if (this.props.isHost && (this.props.remotePlayers.length > 0)) {
            if (!this.props.isGameStarted) {
                this.props.startGame();
            }
            if ([trialResult.unstarted, trialResult.failed, trialResult.solved].includes(this.props.roundStatus)) {
                const randomStarterPlayer = this._getRandomStartingPlayer();
                const phrase = (randomStarterPlayer.peerId === this.props.localPlayer.peerId) ? getRandomPhrase().trim() : null;
                this.props.startRound(randomStarterPlayer.peerId, phrase);
            }
        }
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    const latestRound = (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []};
    const previousRound = (state.game.rounds.length > 1) ? state.game.rounds[state.game.rounds.length - 2] : {trials: []};
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};
    return {
        shouldDisplayNoConnectionBox: [connectionListenerStatus.notConnectedToPeerServer, connectionListenerStatus.shouldConnectToPeerServer, connectionListenerStatus.connectingToPeerServer, connectionListenerStatus.shouldDisconnectFromPeerServer, connectionListenerStatus.disconnectingFromPeerServer].includes(state.connection.connectionListenerStatus),
        shouldDisplayConnectBox: [connectionListenerStatus.listeningForConnections, connectionListenerStatus.shouldConnectToHost, connectionListenerStatus.connectingToHost].includes(state.connection.connectionListenerStatus),
        isHost: state.connection.hostPeerId === state.connection.localPeerId,
        isGameStarted: state.game.isGameStarted,
        rounds: state.game.rounds,
        roundStatus: latestTrial.trialResult || trialResult.unstarted,
        previousDrawerPeerId: previousRound.drawer ? previousRound.drawer.peerId : undefined,
        currentDrawerPeerId: latestRound.drawer ? latestRound.drawer.peerId : undefined,
        localPlayer: state.game.localPlayer,
        remotePlayers: state.game.remotePlayers,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        startGame: () => {
            dispatch(gameActionCreators.createStartGameRequest(new Date().toISOString()));
        },
        startRound: (nextDrawerPeerId, phrase) => {
            dispatch(gameActionCreators.createStartRoundRequest(new Date().toISOString(), nextDrawerPeerId, phrase));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GamePage);