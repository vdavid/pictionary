import IndicatorLight from './IndicatorLight.mjs';

export default class ConnectionStatus extends React.Component {
    render() {
        return React.createElement('div',
            React.createElement(IndicatorLight, {color: this.props.isConnected ? 'green' : (this.props.isConnecting ? 'yellow' : 'red')}),
            this.props.status);
    }
}
