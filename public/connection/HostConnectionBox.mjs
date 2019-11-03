export default class HostConnectionBox extends React.Component {
    render() {
        return React.createElement('div', {className: 'hostConnectionBox'},
            React.createElement('h2', {}, 'Host'),
            React.createElement('div', {className: 'localPeerId', title: 'Copy this ID to the input on send.html.'}, 'ID: ' + this.props.localPeerId),
        );
    }
}