const React = window.React;
const {connect} = window.ReactRedux;
import {actionTypes as connectionActionTypes} from '../store.mjs';

import HostConnectionBox from './HostConnectionBox.mjs';
import ConnectToPeerBox from './ConnectToPeerBox.mjs';

class ConnectBox extends React.Component {
    render() {
        return React.createElement('div', {},
            React.createElement('div', {className: 'fullScreenSemiTransparentCover'}),
            React.createElement('div', {id: 'connectBox', className: 'midScreenBox'},
                React.createElement('div', {className: 'instructions'}, 'This is a game for two players. One player is to draw a word that appears on the screen. The other player is to figure out what the word is, and type it in to the chat. One game takes 10 minutes.'),
                React.createElement(HostConnectionBox, {localPeerId: this.props.localPeerId}),
                React.createElement('div', {className: 'or'}, React.createElement('span', null, 'or')),
                React.createElement(ConnectToPeerBox, {connect: this.props.connectToHost, isConnecting: this.props.isConnecting, isConnected: this.props.isConnected}),
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
        localPeerId: state.connection.localPeerId,
        isConnecting: state.connection.isConnectingInProgress,
        isConnected: state.connection.isConnectedToPeer,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        connectToHost: hostId => {
            dispatch({type: connectionActionTypes.CONNECT_TO_HOST, payload: hostId});
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectBox);