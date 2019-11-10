export default class IndicatorLight extends React.Component {
    render() {
        return React.createElement('div', {className: ['indicatorLight', this.props.color]});
    }
}