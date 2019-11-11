const {connect} = window.ReactRedux;
import {actionTypes as gameActionTypes} from '../game/store.mjs';

import ConnectBox from '../connection/ConnectBox.mjs';
import NoConnectionBox from '../connection/NoConnectionBox.mjs';
import RoundStartingBox from '../game/RoundStartingBox.mjs';

import Canvases from '../canvases/Canvases.mjs';
import WordDisplayComponent from '../game/WordDisplayComponent.mjs';

import ConnectionStatus from '../connection/ConnectionStatus.mjs';
import Chat from '../chat/Chat.mjs';
import Timer from '../game/Timer.mjs';

class GamePage extends React.Component {
    render() {
        return React.createElement('div', {id: 'gamePage'},
            React.createElement('div', {id: 'gamePageLayout'},
                React.createElement(Canvases),
                React.createElement(WordDisplayComponent),
                React.createElement(ConnectionStatus),
                React.createElement(Chat, {state: this.props.chat}),
                React.createElement('section', {id: 'timerSection'},
                    this.props.isRoundStarted ? React.createElement(Timer, {durationInMilliseconds: 60 * 1000}) : null,
                ),
            ),
            !this.props.isAcceptingConnections ? React.createElement(NoConnectionBox) : null,
            (this.props.isAcceptingConnections && !this.props.isConnected) ? React.createElement(ConnectBox) : null,
            this.props.isRoundStarting ? React.createElement(RoundStartingBox, {durationInMilliseconds: 3 * 1000}) : null,
        );
    }

    componentDidUpdate() {
        if (this.props.isConnected && this.props.isHost && !this.props.isRoundStarting && !this.props.isRoundStarted) {
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
        isConnected: state.connection.isConnectedToPeer,
        isRoundStarted: state.game.isRoundStarted,
        isRoundStarting: state.game.isRoundStarting,
        isHost: state.connection.isHost,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        startRound: () => {
            dispatch({type: gameActionTypes.START_ROUND, payload: getRandomStartingPlayer()});
        },
    };
}

function getRandomStartingPlayer() {
    return Math.round(Math.random()) === 1 ? 'remote' : 'local';
}

export default connect(mapStateToProps, mapDispatchToProps)(GamePage);