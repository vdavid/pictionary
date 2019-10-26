export default class HostConnector extends React.Component {
    constructor(props) {
        super(props);
        this._lastPeerId = null;
        this._peer = new Peer(null, {debug: 2});
        this._connection = null;
        this.state = {
            roomId: '123',
            statusText: 'initial status',
        };

        this._setupClientPeer();
    }

    _handlePeerOpen(id) {
        // Workaround for peer.reconnect deleting previous id
        if (id === null) {
            console.log('Host: Received null id from peer open');
            this._peer.id = this._lastPeerId;
        } else {
            this._lastPeerId = this._peer.id;
        }
        console.log('Host: ID: ' + this._peer.id);
        this.setState({roomId: this._peer.id, statusText: 'Awaiting connection...'}, null);
    }

    _handleConnectionDataReceived(data) {
        this._addMessage('<span class="peerMsg">Peer:</span> ' + data);
    }

    _handleConnectionOpenWhenAnotherIsAlreadyOpen(connection) {
        connection.send("Already connected to another client");
        setTimeout(function() { connection.close(); }, 500);
    }

    _handleConnectionClose() {
        this.setState({statusText: 'Connection reset. Awaiting connection...'}, null);
        this._connection = null;
    }

    _handlePeerIncomingConnection(connection) {
            // Allow only a single connection
            if (this._connection) {
                connection.on('open', this._handleConnectionOpenWhenAnotherIsAlreadyOpen.bind(this, connection), null);
            } else {
                this._connection = connection;
                console.log("Host: Connected to: " + this._connection.peer);
                this.setState({statusText: 'Connected'}, null);
                this._connection.on('data', this._handleConnectionDataReceived.bind(this), null);
                this._connection.on('close', this._handleConnectionClose.bind(this), null);
            }
    }

    _handlePeerDisconnected() {
        this.setState({statusText: 'Connection lost. Please reconnect.'}, null);

        // Workaround for peer.reconnect deleting previous id
        this._peer.id = this._lastPeerId;
        this._peer._lastServerId = this._lastPeerId;
        this._peer.reconnect();
    }

    _handlePeerClosed() {
        this._connection = null;
        this.setState({statusText: 'Connection destroyed. Please refresh.'}, null);
    }

    _handlePeerError(error) {
        this.setState({statusText: error}, null);
    }

    _setupClientPeer() {
        this._peer.on('open', this._handlePeerOpen.bind(this), null);
        this._peer.on('connection', this._handlePeerIncomingConnection.bind(this), null);
        this._peer.on('disconnected', this._handlePeerDisconnected.bind(this), null);
        this._peer.on('close', this._handlePeerClosed.bind(this), null);
        this._peer.on('error', this._handlePeerError.bind(this), null);
    };

    _addMessage(message) {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes().toString().padStart(2, '0');
        const s = now.getSeconds().toString().padStart(2, '0');
        //message.innerHTML = "<br><span class=\"msg-time\">" + h + ":" + m + ":" + s + "</span>  -  " + msg + message.innerHTML;
    };

    render() {
        return React.createElement('div', {className: 'hostConnector'},
            React.createElement('h2', {}, 'Host'),
            React.createElement('div', {className: 'hostId', title: 'Copy this ID to the input on send.html.'}, 'ID: ' + this.state.roomId),
            React.createElement('div', {className: 'status'}, this.state.statusText)
        );
    }
}