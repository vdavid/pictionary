/**
 * Documentation: https://docs.peerjs.com/
 */

/**
 * @typedef {Object} PeerConnectorOptions
 * @property {function(id: string): void} onStartedAcceptingConnections Called when the connection to the PeerServer is established.
 * @property {function(): void} onStoppedAcceptingConnections Called when the connection to the PeerServer is closed.
 * @property {function(id: string, isHost: boolean): void} onConnected Called when the connection to the peer is established.
 * @property {function(): void} onDisconnected Called when the connection to the peer is closed/lost.
 * @property {function(command: string, parameters: Object): void} onCommandReceived Called when a command is received from the peer.
 * @property {function(DrawnLine[]): void} onDrawnLinesReceived Called when new drawn lines were received from the peer.
 * @property {function(string): void} onMessageReceived Called when a message is received from the peer.
 * @property {function(error: {type: string}): void} onError Called when an error happens in the underlying socket
 *        and PeerConnections. (Note: Errors on the peer are almost always fatal and will destroy the peer.)
 *        More info: https://docs.peerjs.com/#peeron-error
 * @property {int} [debugLevel] 0 Prints no logs. 1 Prints only errors. 2 Prints errors and warnings. 3 Prints all logs.
 *        Default is 0.
 */

export default class PeerConnector {
    /**
     * @param {PeerConnectorOptions} options
     * @private
     */
    _processOptions(options) {
        this._onStartedAcceptingConnectionsCallback = options.onStartedAcceptingConnections || (() => {});
        this._onStoppedAcceptingConnectionsCallback = options.onStoppedAcceptingConnections || (() => {});
        this._onConnectedCallback = options.onConnected || (() => {});
        this._onDisconnectedCallback = options.onDisconnected || (() => {});
        this._onCommandReceived = options.onCommandReceived || (() => {});
        this._onDrawnLinesReceived = options.onDrawnLinesReceived || (() => {});
        this._onMessageReceived = options.onMessageReceived || (() => {});
        this._onErrorCallback = options.onError || (() => {});
        this._debugLevel = options.debugLevel || 0;
    }

    /**
     * @private
     */
    _setEventHandlerBindings() {
        this._handlePeerOpen = this._handlePeerOpen.bind(this);
        this._handlePeerIncomingConnection = this._handlePeerIncomingConnection.bind(this);
        this._handlePeerDisconnected = this._handlePeerDisconnected.bind(this);
        this._handlePeerClosed = this._handlePeerClosed.bind(this);
        this._handlePeerError = this._handlePeerError.bind(this);
        this._handleConnectionOpen = this._handleConnectionOpen.bind(this);
        this._handleConnectionDataReceived = this._handleConnectionDataReceived.bind(this);
        this._handleConnectionClose = this._handleConnectionClose.bind(this);
        this._handleConnectionError = this._handleConnectionError.bind(this);
    }

    /**
     * @param {boolean} newValue
     * @private
     */
    _setIsAcceptingConnections(newValue) {
        if (!this._isAcceptingConnections && newValue) {
            this._onStartedAcceptingConnectionsCallback(this._peer.id);
        } else if (this._isAcceptingConnections && !newValue) {
            this._onStoppedAcceptingConnectionsCallback();
        }
        this._isAcceptingConnections = newValue;
    }

    /**
     * @param {string} id
     * @private
     */
    _handlePeerOpen(id) {
        this._setIsAcceptingConnections(true);
    }

    _handlePeerDisconnected() {
        this._setIsAcceptingConnections(false);
        // TODO: Try reconnecting if it's not intentional.
    }

    /**
     * @param {boolean} newValue
     * @private
     */
    _setIsConnectedToPeer(newValue) {
        if (!this._isConnectedToPeer && newValue) {
            this._onConnectedCallback(this._connection.peer, this._isHost);
        } else if (this._isAcceptingConnections && !newValue) {
            this._onDisconnectedCallback();
        }
        this._isConnectedToPeer = newValue;
    }

    /**
     * @private
     */
    _handlePeerClosed() {
        this._connection = null;
        this._setIsAcceptingConnections(false);
        this._setIsConnectedToPeer(false);
    }

    /**
     * @private
     */
    _handleConnectionOpen() {
        this._setIsConnectedToPeer(true);
    }

    /**
     * @param {{type: string, payload: *}} data
     * @private
     */
    _handleConnectionDataReceived(data) {
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
     * @private
     */
    _handleConnectionClose() {
        this._connection = null;
        this._setIsConnectedToPeer(false);
    }

    /**
     * @param {{type: string}} error TODO: Errors might have other properties, dunno.
     * @private
     */
    _handleConnectionError(error) {
        console.log('Connection error.');
        console.log(error);
        this._onErrorCallback(error);
    }

    /**
     * @private
     */
    _setUpConnectionEventHandlers() {
        this._connection.on('open', this._handleConnectionOpen, null);
        this._connection.on('data', this._handleConnectionDataReceived, null);
        this._connection.on('close', this._handleConnectionClose, null);
        this._connection.on('error', this._handleConnectionError, null);
    }

    /**
     * @param {DataConnection} connection
     * @private
     */
    _handlePeerIncomingConnection(connection) {
        if (this._connection) { /* Allow only a single connection */
            // noinspection JSCheckFunctionSignatures
            connection.on('open', connection => connection.close(), null);
        } else {
            this._connection = connection;
            this._isHost = true;
            this._setUpConnectionEventHandlers();
        }
    }

    /**
     * @private
     */
    _handlePeerError(error) {
        console.log('Peer error.');
        console.log(error);
        this._onErrorCallback(error);
    }

    /**
     * @private
     */
    _generateRandomId() {
        return Math.random().toString(36).substr(2, 4);
    }

    /**
     * @private
     */
    _createPeer() {
        this._peer = new Peer(this._generateRandomId(), {debug: this._debugLevel}); // TODO: Handle the case when we can't get a valid ID.
        this._peer.on('open', this._handlePeerOpen, null);
        this._peer.on('connection', this._handlePeerIncomingConnection, null);
        this._peer.on('disconnected', this._handlePeerDisconnected, null);
        this._peer.on('close', this._handlePeerClosed, null);
        this._peer.on('error', this._handlePeerError, null);
    }

    constructor(options) {
        this._processOptions(options);

        this._setEventHandlerBindings();

        this._isAcceptingConnections = false; /* True if correctly connected to the PeerServer, and has no live peer connection. */
        this._isConnectedToPeer = false; /* Only one connection is allowed at a time. */
        this._connection = null; /* Holds the current connection, or null if not connected */
        this._isHost = null; /* True if this peer has been connected by the other party. (Null if there's no connection.) */

        this._createPeer();
    }

    /**
     * @param {string} message
     */
    sendMessage(message) {
        if (this._debugLevel >= 2) {
            console.log('Sent: message: ' + message);
        }
        this._connection.send({type: 'message', payload: message});
    }

    /**
     * @param {DrawnLine[]} newLines
     */
    sendNewLines(newLines) {
        if (this._debugLevel >= 2) {
            console.log('Sent: ' + newLines.length + ' new lines.');
        }
        this._connection.send({type: 'newLines', payload: newLines});
    }

    /**
     * @param {string} command
     * @param {Object} parameters
     */
    sendCommand(command, parameters) {
        if (this._debugLevel >= 2) {
            console.log('Sent: command: ' + command + ' with parameters: ' + JSON.stringify(parameters));
        }
        this._connection.send({type: 'command', payload: {command, parameters}});
    }

    connect(id) {
        if (!this._connection) {
            this._connection = this._peer.connect(id, {});
            this._isHost = false;
            this._setUpConnectionEventHandlers();
        }
    }

    disconnect() {
        this._connection = null;
        this._isHost = null;
        this._setIsConnectedToPeer(false);
        this._setIsAcceptingConnections(true);
    }
}