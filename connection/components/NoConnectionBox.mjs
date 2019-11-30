const React = window.React;
const {connect} = window.ReactRedux;
import {actionTypes as connectionActionTypes} from '../store.mjs';

class NoConnectionBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            connectingToPeerServer: false,
        };
        this._handleReconnectButtonClick = this._handleReconnectButtonClick.bind(this);
    }

    _handleReconnectButtonClick() {
        this.state.connectingToPeerServer = true;
        this._connectingProgressTimeout = setTimeout(() => {this.state.connectingToPeerServer = false; });
        this.props.reconnectToPeerServer();
    }

    componentWillUnmount() {
        this.state.connectingToPeerServer = false;
        clearInterval(this._connectingProgressTimeout);
    }

    render() {
        return React.createElement('div', {},
            React.createElement('div', {className: 'fullScreenSemiTransparentCover'}),
            React.createElement('div', {id: 'noConnectionBox', className: 'midScreenBox'},
                React.createElement('div', {}, 'Game needs an internet connection, but none was found.'),
                this.state.connectingToPeerServer ? React.createElement('div', {className: 'progressIndicator'}) : null,
                React.createElement('button', {onClick: this._handleReconnectButtonClick}, 'Try again'),
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
        reconnectToPeerServer: () => {
            dispatch({type: connectionActionTypes.TRY_RECONNECTING_TO_PEER_SERVER});
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NoConnectionBox);