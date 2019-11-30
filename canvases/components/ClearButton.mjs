export default class ClearButton extends React.Component {
    render() {
        return React.createElement('button', {className: 'clearButton', onClick: this.props.clearDrawingCanvas}, 'Clear');
    }
}