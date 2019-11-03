const {connect} = window.ReactRedux;
import {actionTypes as connectionActionTypes} from './store.mjs';

import Chat from '../chat/Chat.mjs';
import HostConnectionBox from './HostConnectionBox.mjs';
import ConnectToPeerBox from './ConnectToPeerBox.mjs';
import ConnectionStatus from './ConnectionStatus.mjs';
import ConnectingIndicator from './ConnectingIndicator.mjs';

class HostAndClient extends React.Component {
    render() {
        return React.createElement('div', {className: 'page'},
            React.createElement('h1', null, 'Greetings, player!'),
            React.createElement(Chat, {state: this.props.chat}),
            React.createElement(HostConnectionBox, {localPeerId: this.props.localPeerId}),
            React.createElement(ConnectToPeerBox, {connect: this.props.connect, isConnecting: this.props.isConnecting, isConnected: this.props.isConnected}),
            React.createElement(ConnectionStatus, {status: this.props.status}),
            React.createElement(ConnectingIndicator, {isConnecting: this.props.isConnecting}),
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

export default connect(mapStateToProps, mapDispatchToProps)(HostAndClient);