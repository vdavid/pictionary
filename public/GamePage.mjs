const {connect} = window.ReactRedux;
import {actionTypes as connectionActionTypes} from './connection/store.mjs';

import Chat from './chat/Chat.mjs';
import HostConnectionBox from './connection/HostConnectionBox.mjs';
import ConnectToPeerBox from './connection/ConnectToPeerBox.mjs';
import ConnectionStatus from './connection/ConnectionStatus.mjs';
import ConnectingIndicator from './connection/ConnectingIndicator.mjs';
import Timer from './game/Timer.mjs';

class GamePage extends React.Component {
    render() {
        return React.createElement('div', {id: 'gamePage'},
            React.createElement('div', {id: 'gamePageLayout'},
                React.createElement('section', {id: 'canvasSection'}, 'Game canvas comes here'),
                React.createElement('section', {id: 'gameControlsSection'}, 'Game controls come here'),
                React.createElement('section', {id: 'connectionSection'},
                    React.createElement(ConnectionStatus, {status: this.props.status}),
                    React.createElement(ConnectingIndicator, {isConnecting: this.props.isConnecting}),
                ),
                React.createElement(Chat, {state: this.props.chat}),
                React.createElement('section', {id: 'timerSection'},
                    React.createElement(Timer, {durationInMilliseconds: 60 * 1000}),
                    ),
            ),
            !this.props.isConnected ? React.createElement('div', {className: 'fullScreenSemiTransparentCover'}) : null,
            !this.props.isConnected ? React.createElement('div', {id: 'connectBox',},
                React.createElement(HostConnectionBox, {localPeerId: this.props.localPeerId}),
                React.createElement('div', {className: 'or'}, React.createElement('span', null, 'or')),
                React.createElement(ConnectToPeerBox, {connect: this.props.connect, isConnecting: this.props.isConnecting, isConnected: this.props.isConnected}),
            ) : null,
        );
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        localPeerId: state.connection.localPeerId,
        status: state.connection.status,
        isConnecting: state.connection.isConnectingInProgress,
        isConnected: state.connection.isConnectedToPeer,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        connect: remotePeerId => {
            dispatch({type: connectionActionTypes.CONNECT, payload: remotePeerId});
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GamePage);