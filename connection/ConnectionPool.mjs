export default class ConnectionPool {
    /**
     * @param {ConsoleLogger} logger
     */
    constructor({logger}) {
        /** @type {DataConnection[]} */
        this._connections = [];
        /** @type {DataConnection} */
        this._connectionToHost = null;
        /** @type {ConsoleLogger} */
        this._logger = logger;
    }

    /**
     * @param {DataConnection} connection
     * @param {boolean} isConnectionToHost
     */
    add(connection, isConnectionToHost) {
        this._connections.push(connection);
        if (isConnectionToHost) {
            this._connectionToHost = connection;
        }
    }

    remove(connection) {
        if (this._connections.indexOf(connection) >= 0) {
            this._connections.splice(this._connections.indexOf(connection), 1);
        } else {
            this._logger.error('A weird thing just happened.', connection);
        }
    }

    /**
     * @returns {DataConnection[]}
     */
    getAllConnections() {
        return this._connections;
    }

    /**
     * @returns {string[]}
     */
    getAllConnectedPeerIds() {
        // noinspection JSUnresolvedVariable
        return this._connections.map(connection => connection.peer);
    }

    /**
     * @param {string} peerId
     * @returns {DataConnection}
     */
    getByPeerId(peerId) {
        // noinspection JSUnresolvedVariable
        return this._connections.find(connection => connection.peer === peerId);
    }

    // noinspection JSUnusedGlobalSymbols TODO: Use this later or remove it
    /**
     * @returns {DataConnection}
     */
    getConnectionToHost() {
        return this._connectionToHost;
    }
}