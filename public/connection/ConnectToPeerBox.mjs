export default class ConnectToPeerBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            remotePeerId: '',
        };
    }

    render() {
        return React.createElement('div', {className: 'connectToPeerBox'},
            React.createElement('h2', {}, 'Client'),
            React.createElement('input', {
                className: 'hostId',
                title: 'Input the ID.',
                value: this.state.remotePeerId,
                disabled: this.props.isConnecting || this.props.isConnected,
                onChange: event => this.setState({remotePeerId: event.target.value}, null)
            }),
            React.createElement('button', {
                className: 'connectButton',
                onClick: () => this.props.connect(this.state.remotePeerId), disabled: this.props.isConnecting || this.props.isConnected || !this.state.remotePeerId
            }, 'Connect'),
        );
    }
}