import ConnectionPool from './ConnectionPool.mjs';
import DataGateway from './DataGateway.mjs';
import PeerServerConnector from './PeerServerConnector.mjs';
import {connectionChanges} from './connection-changes.mjs';
import {actionCreators as connectionActionCreators} from './store.mjs';
import {actionCreators as gameActionCreators} from '../game/store.mjs';

/**
 * Documentation: https://docs.peerjs.com/
 */

/**
 * @typedef {Object} PeerConnectorOptions
 * @property {function(error: {message: string, stack: string}, severity: int): void} [onError] Called when an error happens in the underlying socket
 *        and PeerConnections. (Note: Errors on the peer are almost always fatal and will destroy the peer.)
 *        More info: https://docs.peerjs.com/#peeron-error
 * @property {int} [debugLevel] 0 Prints no logs. 1 Prints only errors. 2 Prints errors and warnings. 3 Prints infos. 4 Verbose logging.
 *        Default is 0.
 */

export default class PeerConnector {
    /**
     * @param {{dispatch: function, getState: function(): State}} store
     * @param {PeerConnectorOptions} options
     */
    constructor(store, options) {
        this._store = store;
        this._errorCallback = options.onError || (() => {});
        this._debugLevel = options.debugLevel;

        this._handleAcceptingConnections = this._handleAcceptingConnections.bind(this);
        this._handlePeerIncomingConnection = this._handlePeerIncomingConnection.bind(this);
        this._handleConnectionOpen = this._handleConnectionOpen.bind(this);
        this._handleConnectionClose = this._handleConnectionClose.bind(this);
        this._handleConnectionError = this._handleConnectionError.bind(this);
        this._updateKnownPeerIds = this._updateKnownPeerIds.bind(this);
        this._handleGameStateReceivedFromHost = this._handleGameStateReceivedFromHost.bind(this);

        this._knownPeers = [];
        this._peerServerConnector = new PeerServerConnector({
            acceptingConnectionsCallback: this._handleAcceptingConnections,
            stoppedAcceptingConnectionsCallback: () => this._store.dispatch(connectionActionCreators.createStopAcceptingConnectionsSuccess()),
            incomingConnectionCallback: this._handlePeerIncomingConnection,
            errorCallback: options.onError,
            debugLevel: options.debugLevel,
        });
        this._connectionPool = new ConnectionPool();
        this._dataGateway = new DataGateway(this._store, this._connectionPool, {
            onPeerListReceived: this._updateKnownPeerIds,
            onGameStateReceived: this._handleGameStateReceivedFromHost,
        }, options.debugLevel);
    }

    _onConnectionsChanged(connectionChange, relatedPeerId, localPeerId, allPeerIds, hostPeerId) {
        this._store.dispatch(gameActionCreators.createUpdateConnectionsSuccess(hostPeerId));
        this._store.dispatch(connectionActionCreators.createUpdateConnectionsSuccess(localPeerId, allPeerIds, hostPeerId));
        if (connectionChange === connectionChanges.hostBecomingTheHost || connectionChange === connectionChanges.clientConnectingToHost) {
            this._store.dispatch(gameActionCreators.createStartGameRequest());
        }
        if (localPeerId === hostPeerId) {
            // noinspection JSUnresolvedVariable
            this.sendGameStateToClient(relatedPeerId);
        }
    }

    /**
     * @param {DataConnection} connection
     * @param {string} connectionChange One of the connectionChanges constants
     * @private
     */
    _setUpConnectionEventHandlers(connection, connectionChange) {
        // noinspection JSUnresolvedFunction
        connection.on('open', () => this._handleConnectionOpen(connection, connectionChange), null);
        // noinspection JSUnresolvedFunction
        connection.on('data', (data) => this._dataGateway.handleConnectionDataReceived(connection, data), null);
        // noinspection JSUnresolvedFunction
        connection.on('close', () => this._handleConnectionClose(connection), null);
        // noinspection JSUnresolvedFunction
        connection.on('error', (error) => this._handleConnectionError(connection, error), null);
    }

    /**
     * @param {string} hostPeerId
     */
    connectToHost(hostPeerId) {
        if (!this._connectionPool.getAllConnections().length) {
            const newConnection = this._peerServerConnector.connectToRemotePeer(hostPeerId);
            this._setUpConnectionEventHandlers(newConnection, connectionChanges.clientConnectingToHost);
        }
    }

    /**
     * @param {string} peerId
     */
    connectToOtherClient(peerId) {
        const newConnection = this._peerServerConnector.connectToRemotePeer(peerId);
        this._setUpConnectionEventHandlers(newConnection, connectionChanges.clientConnectingToAnotherClient);
    }

    /**
     * @param {GameStateToSendToNewPeer} gameState
     * @private
     */
    _handleGameStateReceivedFromHost(gameState) {
        // TODO: Dispatch action to update app state
        this._connectToOtherClientsAsClient(gameState.peerIds);
    }

    /**
     * @param {string[]} peerIds
     * @private
     */
    _connectToOtherClientsAsClient(peerIds) {
        peerIds.map(peerId => this.connectToOtherClient(peerId));
    }

    _handleAcceptingConnections(localPeerId) {
        this._store.dispatch(gameActionCreators.createUpdateLocalPlayerPeerIdRequest(localPeerId));
        this._store.dispatch(connectionActionCreators.createStartAcceptingConnectionsSuccess(localPeerId));
    }

    /**
     * @param {DataConnection} connection
     * @private
     */
    _handlePeerIncomingConnection(connection) {
        if (this._connectionPool.getAllConnections().length === 0) {
            this._setUpConnectionEventHandlers(connection, connectionChanges.hostBecomingTheHost);
        } else if (this._isHost()) {
            this._setUpConnectionEventHandlers(connection, connectionChanges.hostReceivingConnectionFromANewClient);
        } else {
            // noinspection JSUnresolvedVariable
            if (this._knownPeers.includes(connection.peer)) {
                this._setUpConnectionEventHandlers(connection, connectionChanges.clientReceivingConnectionFromAnotherClient);
            } else {
                // noinspection JSUnresolvedFunction
                connection.on('open', connection => connection.close(), null);
            }
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
     * @param {string} nextDrawerPeerId
     */
    sendStartRoundSignal(nextDrawerPeerId) {
        this._dataGateway.broadcastStartRoundSignal(nextDrawerPeerId);
    }

    /**
     * @param {string} phrase
     * @param {string} solverPeerId
     */
    sendPhraseFiguredOut(phrase, solverPeerId) {
        this._dataGateway.broadcastPhraseFiguredOut(phrase, solverPeerId);
    }

    /**
     */
    sendClearCanvasCommand() {
        this._dataGateway.broadcastClearCanvasCommand();
    }

    /**
     * @param {string} clientPeerId
     */
    sendGameStateToClient(clientPeerId) {
        this._dataGateway.sendGameStateToClient(clientPeerId);
    }

    // noinspection JSUnusedGlobalSymbols
    disconnectFromAllPeers() {
        // noinspection JSUnresolvedFunction
        this._connectionPool.getAllConnections().forEach(connection => connection.close());
    }

    tryReconnectingToPeerServer() {
        this._peerServerConnector.tryToReconnectToPeerServer();
    }

    /**
     * @param {DataConnection} newConnection
     * @param {string} connectionChange One of the connectionChanges constants
     * @private
     */
    _handleConnectionOpen(newConnection, connectionChange) {
        // noinspection JSUnresolvedVariable
        const newPeerId = newConnection.peer;
        if (connectionChange === connectionChanges.hostReceivingConnectionFromANewClient) {
            this._dataGateway.broadcastKnownPeerList([...this._connectionPool.getAllConnectedPeerIds(), newPeerId]);
        }
        this._connectionPool.add(newConnection, connectionChange === connectionChanges.clientConnectingToHost);

        const hostPeerId = this._connectionPool.getConnectionToHost() ? this._connectionPool.getConnectionToHost().peer : (this._isHost() ? this._peerServerConnector.getLocalPeerId() : undefined);

        /* If the other side is unknown, send them your name */
        if (!this._store.getState().game.remotePlayers.find(player => player.peerId === newPeerId)) {
            this._dataGateway.sendLocalPlayerDataToClient(newPeerId);
        }

        this._onConnectionsChanged(connectionChange, newPeerId, this._peerServerConnector.getLocalPeerId(), this._connectionPool.getAllConnectedPeerIds(), hostPeerId);
    }

    /**
     * @param {DataConnection} connection
     * @private
     */
    _handleConnectionClose(connection) {
        // noinspection JSUnresolvedVariable
        const remotePeerId = connection.peer;
        const connectionChange = this._isHost()
            ? connectionChanges.hostDisconnectedFromAClient
            : (this._connectionPool.getConnectionToHost() && (this._connectionPool.getConnectionToHost().peer === remotePeerId)
                ? connectionChanges.clientDisconnectedFromHost
                : connectionChanges.clientDisconnectedFromAnotherClient);
        this._connectionPool.remove(connection);
        const hostPeerId = this._connectionPool.getConnectionToHost() ? this._connectionPool.getConnectionToHost().peer : (this._isHost() ? this._peerServerConnector.getLocalPeerId() : undefined);

        /* Remove player from the list of players */
        this._store.dispatch(gameActionCreators.createRemoveRemotePlayerRequest(remotePeerId));

        this._onConnectionsChanged(connectionChange, remotePeerId, this._peerServerConnector.getLocalPeerId(), this._connectionPool.getAllConnectedPeerIds(), hostPeerId);
    }

    /**
     * @param {DataConnection} connection
     * @param {{message: string, stack: string}} error
     * @private
     */
    _handleConnectionError(connection, error) {
        if (this._debugLevel >= 2) {
            console.log(error);
        }
        this._errorCallback(error, 2);
    }

    _updateKnownPeerIds(peerIds) {
        if (!this._isHost()) {
            this._knownPeers = peerIds;
        } else {
            /* Hack attempt? */
        }
    }

    _isHost() {
        return this._connectionPool.getAllConnections().length > 0 && !this._connectionPool.getConnectionToHost();
    }
}