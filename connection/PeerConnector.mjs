import ConnectionPool from './ConnectionPool.mjs';
import DataGateway from './DataGateway.mjs';
import PeerServerConnector from './PeerServerConnector.mjs';

/**
 * Documentation: https://docs.peerjs.com/
 */

/**
 * @typedef {Object} PeerConnectorOptions
 * @property {function(id: string): void} [onStartedAcceptingConnections] Called when the connection to the PeerServer is established.
 * @property {function(): void} [onStoppedAcceptingConnections] Called when the connection to the PeerServer is closed.
 * @property {function(allConnections: DataConnection[], newConnection: DataConnection, isHost: boolean): void} [onConnected] Called when the connection to the peer is established.
 * @property {function(): void} [onDisconnected] Called when the connection to the peer is closed/lost.
 * @property {function(command: string, parameters: Object): void} [onCommandReceived] Called when a command is received from the peer.
 * @property {function(DrawnLine[]): void} [onDrawnLinesReceived] Called when new drawn lines were received from the peer.
 * @property {function(string): void} [onMessageReceived] Called when a message is received from the peer.
 * @property {function(error: {type: string}): void} [onError] Called when an error happens in the underlying socket
 *        and PeerConnections. (Note: Errors on the peer are almost always fatal and will destroy the peer.)
 *        More info: https://docs.peerjs.com/#peeron-error
 * @property {int} [debugLevel] 0 Prints no logs. 1 Prints only errors. 2 Prints errors and warnings. 3 Prints all logs.
 *        Default is 0.
 */

export default class PeerConnector {
    /**
     * @param {PeerConnectorOptions} options
     */
    constructor(options) {
        this._onConnectedCallback = options.onConnected || (() => {});
        this._onDisconnectedCallback = options.onDisconnected || (() => {});
        this._onErrorCallback = options.onError || (() => {});

        this._handlePeerIncomingConnection = this._handlePeerIncomingConnection.bind(this);
        this._handleConnectionOpen = this._handleConnectionOpen.bind(this);
        this._handleConnectionClose = this._handleConnectionClose.bind(this);
        this._handleConnectionError = this._handleConnectionError.bind(this);

        this._peerServerConnector = new PeerServerConnector({
            acceptingConnectionsCallback: options.onStartedAcceptingConnections,
            stoppedAcceptingConnectionsCallback: options.onStoppedAcceptingConnections,
            incomingConnectionCallback: this._handlePeerIncomingConnection,
            errorCallback: options.onError,
            debugLevel: options.debugLevel,
        });
        this._connectionPool = new ConnectionPool();
        this._knownPeers = [];
        this._dataGateway = new DataGateway(this._connectionPool, {
            onCommandReceived: options.onCommandReceived || (() => {}),
            onDrawnLinesReceived: options.onDrawnLinesReceived || (() => {}),
            onMessageReceived: options.onMessageReceived || (() => {}),
            onPeerIdsReceived: this._updateKnownPeerIds,
        }, options.debugLevel);
    }

    _updateKnownPeerIds(peerIds) {
        if (!this._isHost()) {
            this._knownPeers = peerIds;
        } else {
            /* Hack attempt? */
        }
    }

    /**
     * @param {string} hostPeerId
     */
    connectToHost(hostPeerId) {
        if (!this._connectionPool.getAllConnections().length) {
            const newConnection = this._peerServerConnector.connectToRemoteHost(hostPeerId);
            this._setUpConnectionEventHandlers(newConnection, 'connectingToHost');
        }
    }

    /**
     * @param {string} message
     */
    sendMessage(message) {
        this._dataGateway.broadcastChatMessage(message);
    }

    /**
     * @param {DrawnLine[]} newLines
     */
    sendNewLines(newLines) {
        this._dataGateway.broadcastNewLines(newLines);
    }

    /**
     * @param {string} command
     * @param {Object} parameters
     */
    sendCommand(command, parameters) {
        this._dataGateway.broadcastCommand(command, parameters);
    }

    disconnectFromAllPeers() {
        // noinspection JSUnresolvedFunction
        this._connectionPool.getAllConnections().forEach(connection => connection.close());
    }

    tryReconnectingToPeerServer() {
        this._peerServerConnector.tryToReconnectToPeerServer();
    }

    /**
     * @param {DataConnection} newConnection
     * @param {string} whatIsHappening One of "connectingToHost", "becomingTheHost" and "anotherClientEstablishingADirectConnection"
     * @private
     */
    _handleConnectionOpen(newConnection, whatIsHappening) {
        if (this._isHost()) {
            // noinspection JSUnresolvedVariable
            this._dataGateway.broadcastKnownPeerList([...this._connectionPool.getAllConnectedPeerIds(), newConnection.peer]);
        }
        this._connectionPool.add(newConnection, whatIsHappening === 'connectingToHost');
        this._onConnectedCallback(this._connectionPool.getAllConnections(), newConnection, this._isHost());
    }

    /**
     * @param {DataConnection} connection
     * @private
     */
    _handleConnectionClose(connection) {
        this._connectionPool.remove(connection);
        this._onDisconnectedCallback();
    }

    /**
     * @param {DataConnection} connection
     * @param {{type: string}} error TODO: Errors might have other properties, dunno.
     * @private
     */
    _handleConnectionError(connection, error) {
        console.log('Connection error.');
        console.log(error);
        this._onErrorCallback(error);
    }

    /**
     * @param {DataConnection} connection
     * @param {string} whatIsHappening One of "connectingToHost", "becomingTheHost" and "anotherClientEstablishingADirectConnection"
     * @private
     */
    _setUpConnectionEventHandlers(connection, whatIsHappening) {
        // noinspection JSUnresolvedFunction
        connection.on('open', () => this._handleConnectionOpen(connection, whatIsHappening), null);
        // noinspection JSUnresolvedFunction
        connection.on('data', (data) => this._dataGateway.handleConnectionDataReceived(connection, data), null);
        // noinspection JSUnresolvedFunction
        connection.on('close', () => this._handleConnectionClose(connection), null);
        // noinspection JSUnresolvedFunction
        connection.on('error', (error) => this._handleConnectionError(connection, error), null);
    }

    /**
     * @param {DataConnection} connection
     * @private
     */
    _handlePeerIncomingConnection(connection) {
        if (this._isHost() || this._connectionPool.getAllConnections().length === 0) {
            this._setUpConnectionEventHandlers(connection, 'becomingTheHost');
        } else if (this._knownPeers.includes(connection.peer)) {
            this._setUpConnectionEventHandlers(connection, 'anotherClientEstablishingADirectConnection');
        } else {
            // noinspection JSUnresolvedFunction
            connection.on('open', connection => connection.close(), null);
        }
    }

    _isHost() {
        return this._connectionPool.getAllConnections().length > 0 && !this._connectionPool.getServerConnection();
    }
}