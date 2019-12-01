export default class ConnectionPool {
    constructor() {
        /** @type {DataConnection[]} */
        this._connections = [];
        /** @type {DataConnection} */
        this._connectionToHost = null;
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
            console.error('Weird thing just happened.');
            console.error(connection);
        }
    }

    /**
     * @returns {DataConnection[]}
     */
    getAllConnections() {
        return this._connections;
    }

    getAllConnectedPeerIds() {
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

    /**
     * @returns {DataConnection}
     */
    getConnectionToHost() {
        return this._connectionToHost;
    }
}