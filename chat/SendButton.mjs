const React = window.React;
export default class SendButton extends React.Component {
    render() {
        return React.createElement('button', {
            onClick: () => this.props.addMessage(this.props.typedMessage), disabled: !this.props.typedMessage
        }, 'Send');
    }
}
