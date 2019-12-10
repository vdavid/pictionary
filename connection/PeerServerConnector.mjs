const {connect} = window.ReactRedux;
import {connectionListenerStatus} from './connection-listener-status.mjs';

class PeerServerConnector extends React.Component {
    constructor(props) {
        super(props);

        this._defaultIdLength = 2;
        this._idLength = this._defaultIdLength;
        this._lastActivePeerId = null;
    }

    render() {
        return null;
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate() {
        if (this.props.connectionListenerStatus === connectionListenerStatus.shouldConnectToPeerServer && (!this._peer || this._peer.disconnected)) {
            if (!this._peer || this._peer.destroyed) {
                this._idLength = this._defaultIdLength;
                this._peer = this._createPeer(this._lastActivePeerId);
            } else {
                this._peer.reconnect();
            }
            this.props.setListenerStatus(connectionListenerStatus.connectingToPeerServer, this._peer.id);

        } else if (this.props.connectionListenerStatus === connectionListenerStatus.shouldDisconnectFromPeerServer && !this._peer.disconnected) {
            this._peer.disconnect();
            this.props.setListenerStatus(connectionListenerStatus.disconnectingFromPeerServer, this._peer.id);
        }
    }

    /**
     * @private
     */
    _generateRandomId() {
        return Math.random().toString(36).substr(2, this._idLength);
    }

    /**
     * @param {string|null} peerId
     * @returns {Peer}
     * @private
     */
    _createPeer(peerId = null) {
        this.props.setListenerStatus(connectionListenerStatus.connectingToPeerServer, peerId);
        peerId = peerId || this._generateRandomId();
        const peer = new peerjs.Peer(peerId, {debug: this._debugLevel - 1});
        peer.on('open', () => {this.props.setListenerStatus(connectionListenerStatus.listeningForConnections, peerId);}, null);
        peer.on('disconnected', () => {this.props.setListenerStatus(connectionListenerStatus.notConnectedToPeerServer, peerId);}, null);
        //peer.on('close', this.props.setListenerStatus(connectionListenerStatus.notConnectedToPeerServer, peerId), null);
        peer.on('error', this._handlePeerError, null);
        this.props.peerCreatedCallback(peer);
        return peer;
    }

    /**
     * @private
     */
    _handlePeerError(error) {
        if (error.type === 'unavailable-id') {
            this._peer.destroy();
            this._peer = this._createPeer();
            this._idLength++;
        } else {
            if (this._debugLevel >= 1) {
                console.log('Peer error.');
                console.log(error);
            }
        }
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        localPeerId: state.connection.localPeerId,
        connectionListenerStatus: state.connection.connectionListenerStatus,
        connections: state.connection.connections,
        hostPeerId: state.connection.hostPeerId,
    };
}

export default connect(mapStateToProps)(PeerServerConnector);