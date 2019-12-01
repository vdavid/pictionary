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

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate() {
        if (this.props.isConnectedToAnyPeers && this.props.isHost && !this.props.isRoundStarting && !this.props.isRoundStarted) {
            this.props.startRound();
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
        isHost: state.connection.isHost,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        startRound: () => {
            dispatch(gameActionCreators.createStartRoundRequest(getRandomStartingPlayer()));
        },
    };
}

function getRandomStartingPlayer() {
    return Math.round(Math.random()) === 1 ? 'remote' : 'local';
}

export default connect(mapStateToProps, mapDispatchToProps)(GamePage);