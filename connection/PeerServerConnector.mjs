/**
 * @typedef {Object} PeerServerConnectorOptions
 * @property {function(id: string): void} [acceptingConnectionsCallback] Called when the connection to the PeerServer is established.
 * @property {function(): void} [stoppedAcceptingConnectionsCallback] Called when the connection to the PeerServer is closed.
 * @property {function(): void} [destroyedCallback] Called when the connection to the Peer object is completely destroyed.
 * @property {function(connection: DataConnection): void} [incomingConnectionCallback] Called when a client tries to connect to this peer.
 * @property {function(error: {type: string}): void} [errorCallback] Called when an error occurs in the underlying socket
 *           or PeerConnections. (Note: Errors on the peer are almost always fatal and will destroy the peer.)
 *           More info: https://docs.peerjs.com/#peeron-error
 * @property {int} [debugLevel] 0 Prints no logs. 1 Prints only errors. 2 Prints errors and warnings. 3 Prints all logs.
 *        Default is 0.
 */

export default class PeerServerConnector {
    /**
     * @param {PeerServerConnectorOptions} options
     */
    constructor(options) {
        this._acceptingConnectionsCallback = options.acceptingConnectionsCallback || (() => {});
        this._stoppedAcceptingConnectionsCallback = options.stoppedAcceptingConnectionsCallback || (() => {});
        this._destroyedCallback = options.destroyedCallback || (() => {});
        this._incomingConnectionCallback = options.incomingConnectionCallback || (() => {});
        this._errorCallback = options.errorCallback || (() => {});
        this._debugLevel = options.debugLevel || 0;

        this._defaultIdLength = 2;
        this._lastActivePeerId = null;
        this._idLength = this._defaultIdLength;

        /** @type {Peer} */
        this._peer = this._createPeer();
    }

    // noinspection JSUnusedGlobalSymbols
    disconnectFromPeerServer() {
        this._peer.disconnect();
    }

    tryToReconnectToPeerServer() {
        if (this._peer.disconnected) {
            if (this._peer.destroyed) {
                this._idLength = this._defaultIdLength;
                this._peer = this._createPeer(this._lastActivePeerId);
            } else {
                this._peer.reconnect();
            }
        }
    }

    /**
     * @param {string} peerId
     * @return {DataConnection}
     */
    connectToRemotePeer(peerId) {
        if (peerId !== this._peer.id) {
            return this._peer.connect(peerId/*, {label: undefined, metadata: {}, serialization: 'json', reliable: true}*/);
        } else {
            throw new Error('Can\'t connect to self.');
        }
    }

    getLocalPeerId() {
        return this._peer.id;
    }

    /**
     * @param {string|null} peerId
     * @returns {Peer}
     * @private
     */
    _createPeer(peerId = null) {
        const peer = new peerjs.Peer(peerId || this._generateRandomId(), {debug: this._debugLevel});
        peer.on('open', this._acceptingConnectionsCallback, null);
        peer.on('connection', this._incomingConnectionCallback, null);
        peer.on('disconnected', this._stoppedAcceptingConnectionsCallback, null);
        peer.on('close', this._destroyedCallback, null);
        peer.on('error', this._handlePeerError, null);
        return peer;
    }

    /**
     * @private
     */
    _generateRandomId() {
        return Math.random().toString(36).substr(2, this._idLength);
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
            this._errorCallback(error);
        }
    }

}