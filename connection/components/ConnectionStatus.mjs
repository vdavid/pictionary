const React = window.React;
const {connect} = window.ReactRedux;
import IndicatorLight from './IndicatorLight.mjs';

class ConnectionStatus extends React.Component {
    render() {
        return React.createElement('section', {id: 'connectionSection'},
            React.createElement('div', {}, this._getStatusText()),
            React.createElement(IndicatorLight, {color: this.props.isConnectedToAnyPeers ? 'green' : (this.props.isConnectingToHost ? 'yellow' : 'red')}),
        );
    }

    _getStatusText() {
        if (!this.props.isAcceptingConnections) {
            return 'Not accepting connections.';
        } else if (this.props.isConnectingToHost) {
            return 'Connecting to ' + this.props.hostPeerId + '...';
        } else if (this.props.isConnectedToAnyPeers) {
            return 'Connected. Game ID: ' + this.props.hostPeerId + '.';
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
        isConnectingToHost: state.connection.isConnectingToHost,
        isConnectedToAnyPeers: state.connection.isConnectedToAnyPeers,
        hostPeerId: state.connection.hostPeerId
    };
}

export default connect(mapStateToProps)(ConnectionStatus);