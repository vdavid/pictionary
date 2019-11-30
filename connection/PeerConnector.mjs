import PeerServerConnector from './PeerServerConnector.mjs';
import ConnectionPool from './ConnectionPool.mjs';

/**
 * Documentation: https://docs.peerjs.com/
 */

/**
 * @typedef {Object} PeerConnectorOptions
 * @property {function(id: string): void} [onStartedAcceptingConnections] Called when the connection to the PeerServer is established.
 * @property {function(): void} [onStoppedAcceptingConnections] Called when the connection to the PeerServer is closed.
 * @property {function(id: string, isHost: boolean): void} [onConnected] Called when the connection to the peer is established.
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
        this._processOptions(options);

        this._handlePeerIncomingConnection = this._handlePeerIncomingConnection.bind(this);
        this._handleConnectionOpen = this._handleConnectionOpen.bind(this);
        this._handleConnectionDataReceived = this._handleConnectionDataReceived.bind(this);
        this._handleConnectionClose = this._handleConnectionClose.bind(this);
        this._handleConnectionError = this._handleConnectionError.bind(this);

        this._peerServerConnector = new PeerServerConnector({
            acceptingConnectionsCallback: options.onStartedAcceptingConnections,
            stoppedAcceptingConnectionsCallback: options.onStoppedAcceptingConnections,
            //destroyedCallback: options.destroyedCallback,
            incomingConnectionCallback: this._handlePeerIncomingConnection,
            errorCallback: options.onError,
            debugLevel: options.debugLevel,
        });
        this._connectionPool = new ConnectionPool();
    }

    /**
     * @param {string} hostPeerId
     */
    connectToHost(hostPeerId) {
        if (!this._connectionPool.getAllConnections().length) {
            const newConnection = this._peerServerConnector.connectToRemoteHost(hostPeerId);
            this._setUpConnectionEventHandlers(newConnection, false);
        }
    }

    /**
     * @param {string} message
     */
    sendMessage(message) {
        if (this._debugLevel >= 2) {
            console.log('Sent: message: ' + message);
        }
        this._sendToAllPeers({type: 'message', payload: message});
    }

    /**
     * @param {DrawnLine[]} newLines
     */
    sendNewLines(newLines) {
        if (this._debugLevel >= 2) {
            console.log('Sent: ' + newLines.length + ' new lines.');
        }
        this._sendToAllPeers({type: 'newLines', payload: newLines});
    }

    /**
     * @param {string} command
     * @param {Object} parameters
     */
    sendCommand(command, parameters) {
        if (this._debugLevel >= 2) {
            console.log('Sent: command: ' + command + ' with parameters: ' + JSON.stringify(parameters));
        }
        this._sendToAllPeers({type: 'command', payload: {command, parameters}});
    }

    disconnectFromAllPeers() {
        // noinspection JSUnresolvedFunction
        this._connectionPool.getAllConnections().forEach(connection => connection.close());
    }

    tryReconnectingToPeerServer() {
        this._peerServerConnector.tryToReconnectToPeerServer();
    }

    /**
     * @param {PeerConnectorOptions} options
     * @private
     */
    _processOptions(options) {
        this._onConnectedCallback = options.onConnected || (() => {});
        this._onDisconnectedCallback = options.onDisconnected || (() => {});
        this._onCommandReceived = options.onCommandReceived || (() => {});
        this._onDrawnLinesReceived = options.onDrawnLinesReceived || (() => {});
        this._onMessageReceived = options.onMessageReceived || (() => {});
        this._onErrorCallback = options.onError || (() => {});
        this._debugLevel = options.debugLevel || 0;
    }

    /**
     * @param {DataConnection} connection
     * @param {boolean} isIncoming
     * @private
     */
    _handleConnectionOpen(connection, isIncoming) {
        this._connectionPool.add(connection, !isIncoming);
        this._onConnectedCallback(connection, isIncoming);
    }

    /**
     * @param {DataConnection} connection
     * @param {{type: string, payload: *}} data
     * @private
     */
    _handleConnectionDataReceived(connection, data) {
        /* Log */
        if (this._debugLevel >= 2) {
            if (data.type === 'command') {
                console.log('Received: command: ' + data.payload.command + ' with parameters: ' + data.payload.parameters);
            } else if (data.type === 'newLines') {
                console.log('Received: ' + data.payload.length + ' new lines.');
            } else if (data.type === 'message') {
                console.log('Received: message: ' + data.payload);
            }
        }

        if (data.type === 'command') {
            this._onCommandReceived(data.payload.command, data.payload.parameters);
        } else if (data.type === 'newLines') {
            this._onDrawnLinesReceived(data.payload);
        } else if (data.type === 'message') {
            this._onMessageReceived(data.payload);
        } else {
            console.error('Invalid data received from peer.');
            console.error(data);
        }
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
     * @param {boolean} isIncoming
     * @private
     */
    _setUpConnectionEventHandlers(connection, isIncoming) {
        // noinspection JSUnresolvedFunction
        connection.on('open', () => this._handleConnectionOpen(connection, isIncoming), null);
        // noinspection JSUnresolvedFunction
        connection.on('data', (data) => this._handleConnectionDataReceived(connection, data), null);
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
        if (!this._connectionPool.getServerConnection()) { /* This is the host */
            this._setUpConnectionEventHandlers(connection, true);
        } else { /* This is a client. Don't allow connection. */
            // noinspection JSUnresolvedFunction
            connection.on('open', connection => connection.close(), null);
        }
    }

    /**
     * @param {Object} payload
     * @private
     */
    _sendToAllPeers(payload) {
        // noinspection JSUnresolvedFunction
        this._connectionPool.getAllConnections().forEach(connection => connection.send(payload));
    }
}