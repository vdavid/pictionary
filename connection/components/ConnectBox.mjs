const React = window.React;
const {connect} = window.ReactRedux;
import {actionCreators as connectionActionCreators} from '../store.mjs';

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
                React.createElement(ConnectToPeerBox, {connect: this.props.connectToHost, isConnectingToHost: this.props.isConnectingToHost, isConnectedToAnyPeers: this.props.isConnectedToAnyPeers}),
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
        isConnectingToHost: state.connection.isConnectingToHost,
        isConnectedToAnyPeers: state.connection.isConnectedToAnyPeers,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        connectToHost: hostId => {
            dispatch(connectionActionCreators.createConnectToHostRequest(hostId));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectBox);