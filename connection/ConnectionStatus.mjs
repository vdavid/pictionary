const React = window.React;
const {connect} = window.ReactRedux;
import IndicatorLight from './IndicatorLight.mjs';

class ConnectionStatus extends React.Component {
    render() {
        return React.createElement('section', {id: 'connectionSection'},
            React.createElement(IndicatorLight, {color: this.props.isConnected ? 'green' : (this.props.isConnecting ? 'yellow' : 'red')}),
            React.createElement('div', {}, this._getStatusText()),
        );
    }

    _getStatusText() {
        if (!this.props.isAcceptingConnections) {
            return 'Not accepting connections right now.';
        } else if (this.props.isConnectingInProgress) {
            return 'Connecting to ' + this.props.remotePeerId + '...';
        } else if (this.props.isConnected) {
            return 'I\'m ' + this.props.localPeerId + ', connected to ' + this.props.remotePeerId + '.';
        } else {
            return 'Awaiting connection at “' + this.props.localPeerId + '”.';
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