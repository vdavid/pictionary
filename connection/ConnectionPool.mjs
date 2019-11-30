export default class ConnectionPool {
    constructor() {
        /** @type {DataConnection[]} */
        this._connections = [];
        /** @type {DataConnection} */
        this._serverConnection = null;
    }

    /**
     * @param {DataConnection} connection
     * @param {boolean} isServerConnection
     */
    add(connection, isServerConnection) {
        this._connections.push(connection);
        if (isServerConnection) {
            this._serverConnection = connection;
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

    // noinspection JSUnusedGlobalSymbols
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
    getServerConnection() {
        return this._serverConnection;
    }
}