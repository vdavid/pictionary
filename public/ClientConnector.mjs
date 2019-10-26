export default class ClientConnector extends React.Component {
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

    /**
     * Get first "GET style" parameter from href.
     * This enables delivering an initial command upon page load.
     *
     * Would have been easier to use location.hash.
     */
    _getUrlParameter(name) {
        const cleanedName = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        const results = (new RegExp("[\\?&]" + cleanedName + "=([^&#]*)")).exec(window.location.href);
        return results ? results[1] : undefined;
    };

    _addMessage(message) {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes().toString().padStart(2, '0');
        const s = now.getSeconds().toString().padStart(2, '0');
        //message.innerHTML = "<br><span class=\"msg-time\">" + h + ":" + m + ":" + s + "</span>  -  " + msg + message.innerHTML;
    };

    _handleConnectionOpen() {
        this.setState({statusText: 'Connected to: ' + this._connection.peer}, null);
        // Check URL params for comamnds that should be sent immediately
        const command = this._getUrlParameter('command');
        if (command) {
            this._connection.send(command);
        }
    }

    _handleConnectionDataReceived(data) {
        this._addMessage('<span class="peerMsg">Peer:</span> ' + data);
    }

    _handleConnectionClose() {
        this.setState({statusText: 'Connection closed.'}, null);
    }

    _connect() {
        // Close old connection
        if (this._connection) {
            this._connection.close();
        }
        // Create connection to destination peer specified in the input field
        this._connection = this._peer.connect(this.state.roomId, {
            reliable: true
        });
        this._connection.on('open', this._handleConnectionOpen.bind(this), null);
        this._connection.on('data', this._handleConnectionDataReceived.bind(this), null);
        this._connection.on('close', this._handleConnectionClose.bind(this), null);
    }

    _handlePeerOpen(id) {
        // Workaround for peer.reconnect deleting previous id
        if (id === null) {
            console.log('Received null id from peer open');
            this._peer.id = this._lastPeerId;
        } else {
            this._lastPeerId = this._peer.id;
        }
        console.log('Client ID: ' + this._peer.id);
    }

    _handlePeerDisconnceted() {
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
        this._peer.on('disconnected', this._handlePeerDisconnceted.bind(this), null);
        this._peer.on('close', this._handlePeerClosed.bind(this), null);
        this._peer.on('error', this._handlePeerError.bind(this), null);
    };

    render() {
        return React.createElement('div', {className: 'clientConnector'},
            React.createElement('h2', {}, 'Client'),
            React.createElement('input', {className: 'hostId', title: 'Input the ID.', value: this.state.roomId, onChange: event => this.setState({roomId: event.target.value}, null)}),
            React.createElement('button', {className: 'connectButton', onClick: this._connect.bind(this)}, 'Connect'),
            React.createElement('div', {className: 'status'}, this.state.statusText)
        );
    }
}

// (function () {
//     function clearMessages() {
//         message.innerHTML = "";
//         addMessage("Msgs cleared");
//     };
//     // Listen for enter in message box
//     sendMessageBox.onkeypress = function (e) {
//         var event = e || window.event;
//         var char = event.which || event.keyCode;
//         if (char == '13')
//             sendButton.click();
//     };
//     // Send message
//     sendButton.onclick = function () {
//         if (conn.open) {
//             var msg = sendMessageBox.value;
//             sendMessageBox.value = "";
//             conn.send(msg);
//             console.log("Sent: " + msg);
//             addMessage("<span class=\"selfMsg\">Self: </span> " + msg);
//         }
//     };
//     // Clear messages box
//     clearMsgsButton.onclick = function () {
//         clearMessages();
//     };
//     // Start peer connection on click
//     connectButton.addEventListener('click', join);
// })();