export default class ConnectingIndicator extends React.Component {
    render() {
        return React.createElement('div', {className: 'connectingIndicator'}, this.props.isConnecting ? 'Connecting...' : '');
    }
}