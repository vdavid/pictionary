export default class HostConnectionBox extends React.Component {
    render() {
        return React.createElement('div', {className: 'hostConnectionBox'},
            React.createElement('p', {}, 'Give this ID to your friend:'),
            React.createElement('div', {className: 'localPeerId', title: 'Copy this ID to the input on send.html.'}, this.props.localPeerId),
            React.createElement('p', {}, 'Then wait until they connect.'),
        );
    }
}