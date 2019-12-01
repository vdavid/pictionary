const React = window.React;
export default class ConnectToPeerBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            remotePeerId: '',
        };
        this._onKeyUp = this._onKeyUp.bind(this);
        this._connectToCurrentlyEnteredRemotePeer = this._connectToCurrentlyEnteredRemotePeer.bind(this);
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidMount() {
        this.refs['hostId'].focus();
    }

    _onKeyUp(event) {
        if (event.keyCode === 13) {
            this._connectToCurrentlyEnteredRemotePeer();
        }
    }

    _connectToCurrentlyEnteredRemotePeer() {
        this.props.connect(this.state.remotePeerId);
    }

    render() {
        return React.createElement('div', {className: 'connectToPeerBox'},
            React.createElement('p', {}, 'Enter your friend\'s ID here:'),
            React.createElement('input', {
                className: 'hostId',
                ref: 'hostId',
                title: 'Input the ID.',
                value: this.state.remotePeerId,
                disabled: this.props.isConnectingToHost || this.props.isConnectedToAnyPeers,
                maxLength: 6,
                autoCapitalize: 'none',
                autoCompleteType: 'off',
                onChange: event => this.setState({remotePeerId: event.target.value.toLowerCase()}),
                onKeyUp: this._onKeyUp,
            }),
            React.createElement('button', {
                className: 'connectButton',
                onClick: this._connectToCurrentlyEnteredRemotePeer,
                disabled: this.props.isConnectingToHost || this.props.isConnectedToAnyPeers || !this.state.remotePeerId,
            }, 'Connect'),
        );
    }
}