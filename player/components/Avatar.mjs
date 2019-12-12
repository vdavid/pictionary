export default class Avatar extends React.Component {
    render() {
        // noinspection JSUnresolvedFunction,JSUnresolvedVariable
        return React.createElement('img', {
            src: 'data:image/svg+xml;base64,' + btoa(jdenticon.toSvg(this.props.name, this.props.size)),
            alt: 'Avatar of ' + this.props.name,
            width: this.props.size,
            height: this.props.size
        });
    }
}