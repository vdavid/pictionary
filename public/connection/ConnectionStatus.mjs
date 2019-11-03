export default class ConnectionStatus extends React.Component {
    render() {
        return React.createElement('div', {className: 'status'}, this.props.status)
    }
}
