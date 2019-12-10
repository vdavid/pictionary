const React = window.React;
const {connect} = window.ReactRedux;
import {connectionListenerStatus} from '../connection-listener-status.mjs';
import IndicatorLight from './IndicatorLight.mjs';

class ConnectionStatusIndicator extends React.Component {
    render() {
        const {statusText, color} = this._getStatusTextAndColor();
        return React.createElement('section', {id: 'connectionSection'},
            React.createElement('div', {}, statusText),
            React.createElement(IndicatorLight, {color}),
        );
    }

    _getStatusTextAndColor() {
        const connectionListenerStatusToStatusTextAndColorMap = {
            [connectionListenerStatus.notConnectedToPeerServer]: {statusText: 'Not accepting connections.', color: 'red'},
            [connectionListenerStatus.shouldConnectToPeerServer]: {statusText: 'Starting connecting to server...', color: 'yellow'},
            [connectionListenerStatus.connectingToPeerServer]: {statusText: 'Connecting to server...', color: 'yellow'},
            [connectionListenerStatus.listeningForConnections]: {statusText: 'Awaiting connection.', color: 'green'},
            [connectionListenerStatus.shouldConnectToHost]: {statusText: 'Starting connecting to ' + this.props.hostPeerId + '...', color: 'yellow'},
            [connectionListenerStatus.connectingToHost]: {statusText: 'Connecting to ' + this.props.hostPeerId + '...', color: 'yellow'},
            [connectionListenerStatus.connectedToHost]: {statusText: 'Connected. Game ID: ' + this.props.hostPeerId + '.', color: 'green'},
            [connectionListenerStatus.shouldDisconnectFromPeerServer]: {statusText: 'Starting disconnecting...', color: 'yellow'},
            [connectionListenerStatus.disconnectingFromPeerServer]: {statusText: 'Disconnecting...', color: 'yellow'},
        };
        return connectionListenerStatusToStatusTextAndColorMap[this.props.connectionListenerStatus];
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        connectionListenerStatus: state.connection.connectionListenerStatus,
        isConnectingToHost: state.connection.isConnectingToHost,
        isConnectedToAnyPeers: state.connection.isConnectedToAnyPeers,
        hostPeerId: state.connection.hostPeerId
    };
}

export default connect(mapStateToProps)(ConnectionStatusIndicator);