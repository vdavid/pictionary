const {connect} = window.ReactRedux;
import {actionTypes as connectionActionTypes} from './store.mjs';

import HostConnectionBox from './HostConnectionBox.mjs';
import ConnectToPeerBox from './ConnectToPeerBox.mjs';

class ConnectBox extends React.Component {
    render() {
        return React.createElement('div', {},
            React.createElement('div', {className: 'fullScreenSemiTransparentCover'}),
            React.createElement('div', {id: 'connectBox', className: 'midScreenBox'},
                React.createElement(HostConnectionBox, {localPeerId: this.props.localPeerId}),
                React.createElement('div', {className: 'or'}, React.createElement('span', null, 'or')),
                React.createElement(ConnectToPeerBox, {connect: this.props.connect, isConnecting: this.props.isConnecting, isConnected: this.props.isConnected}),
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
        connect: remotePeerId => {
            dispatch({type: connectionActionTypes.CONNECT, payload: remotePeerId});
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectBox);