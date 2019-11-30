export default class DataGateway {
    /**
     * @param {ConnectionPool} connectionPool
     * @param {Object<string, function>} eventHandlers
     * @param {int} [debugLevel] 0 Prints no logs. 1 Prints only errors. 2 Prints errors and warnings. 3 Prints all logs.
     *        Default is 0.
     */
    constructor(connectionPool, eventHandlers, debugLevel = 0) {
        this._connectionPool = connectionPool;
        this._eventHandlers = eventHandlers;
        this._debugLevel = debugLevel;
        this._messageTypes = {
            message: 'message',
            newLines: 'newLines',
            command: 'command',
            peerList: 'newPeerJoinedTheGame',
        };
    }


    /**
     * @param {string} message
     */
    broadcastChatMessage(message) {
        if (this._debugLevel >= 2) {
            console.log('Sent: message: ' + message);
        }
        this._sendToAllPeers({type: this._messageTypes.message, payload: message});
    }

    /**
     * @param {DrawnLine[]} newLines
     */
    broadcastNewLines(newLines) {
        if (this._debugLevel >= 2) {
            console.log('Sent: ' + newLines.length + ' new lines.');
        }
        this._sendToAllPeers({type: this._messageTypes.newLines, payload: newLines});
    }

    /**
     * @param {string} command
     * @param {Object} parameters
     */
    broadcastCommand(command, parameters) {
        if (this._debugLevel >= 2) {
            console.log('Sent: command: ' + command + ' with parameters: ' + JSON.stringify(parameters));
        }
        this._sendToAllPeers({type: this._messageTypes.command, payload: {command, parameters}});
    }

    /**
     * @param {string[]} latestPeerIds
     */
    broadcastKnownPeerList(latestPeerIds) {
        if (this._debugLevel >= 2) {
            console.log('Sent: peer IDs: ' + latestPeerIds.join(', '));
        }
        this._sendToAllPeers({type: this._messageTypes.peerList, payload: latestPeerIds});
    }

    /**
     * @param {DataConnection} connection
     * @param {{type: string, payload: *}} data
     * @private
     */
    handleConnectionDataReceived(connection, data) {
        /* Log */
        if (this._debugLevel >= 2) {
            if (data.type === this._messageTypes.command) {
                console.log('Received: command: ' + data.payload.command + ' with parameters: ' + data.payload.parameters);
            } else if (data.type === this._messageTypes.newLines) {
                console.log('Received: ' + data.payload.length + ' new lines.');
            } else if (data.type === this._messageTypes.message) {
                console.log('Received: message: ' + data.payload);
            } else if (data.type === this._messageTypes.peerList) {
                console.log('Received info: Peer IDs: ' + data.payload.join(', '));
            }
        }

        if (data.type === this._messageTypes.command) {
            this._eventHandlers.onCommandReceived(data.payload.command, data.payload.parameters);
        } else if (data.type === this._messageTypes.newLines) {
            this._eventHandlers.onDrawnLinesReceived(data.payload);
        } else if (data.type === this._messageTypes.message) {
            this._eventHandlers.onMessageReceived(data.payload);
        } else if (data.type === this._messageTypes.message) {
            this._eventHandlers.onPeerIdsReceived(data.payload);

        } else if (this._debugLevel >= 2) {
            console.warn('Invalid data received from peer.');
            console.warn(data);
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