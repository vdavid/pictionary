const React = window.React;
const {connect} = window.ReactRedux;
import IndicatorLight from './IndicatorLight.mjs';

class ConnectionStatus extends React.Component {
    render() {
        return React.createElement('section', {id: 'connectionSection'},
            React.createElement('div', {}, this._getStatusText()),
            React.createElement(IndicatorLight, {color: this.props.isConnected ? 'green' : (this.props.isConnecting ? 'yellow' : 'red')}),
        );
    }

    _getStatusText() {
        if (!this.props.isAcceptingConnections) {
            return 'Not accepting connections.';
        } else if (this.props.isConnectingInProgress) {
            return 'Connecting to ' + this.props.remotePeerId + '...';
        } else if (this.props.isConnected) {
            return 'Connected. Game ID: ' + (this.props.isHost ? this.props.localPeerId : this.props.remotePeerId) + '.';
        } else {
            return 'Awaiting connection.';
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
        isConnectingInProgress: state.connection.isConnectingInProgress,
        isConnected: state.connection.isConnectedToPeer,
        isHost: state.connection.isHost,
        localPeerId: state.connection.localPeerId,
        remotePeerId: state.connection.remotePeerId
    };
}

export default connect(mapStateToProps)(ConnectionStatus);