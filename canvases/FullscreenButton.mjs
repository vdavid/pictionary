const React = window.React;
export default class FullscreenButton extends React.Component {
    constructor(props) {
        super(props);
        this._enableFullscreen = this._enableFullscreen.bind(this);
        this._disableFullscreen = this._disableFullscreen.bind(this);
    }
    _enableFullscreen() {
        const rootHtmlElement = document.documentElement;

        // noinspection JSUnresolvedVariable
        if (rootHtmlElement.requestFullscreen || rootHtmlElement.webkitRequestFullscreen || rootHtmlElement.mozRequestFullscreen || rootHtmlElement.msRequestFullscreen) {
            // noinspection JSUnresolvedVariable,JSUnresolvedFunction
            const result = rootHtmlElement.exitFullscreen ? rootHtmlElement.exitFullscreen()
                : (rootHtmlElement.webkitRequestFullscreen ? rootHtmlElement.webkitRequestFullscreen()
                    : (rootHtmlElement.mozRequestFullscreen ? rootHtmlElement.mozRequestFullscreen() : rootHtmlElement.msRequestFullscreen()));
            if (result && typeof result.then === 'function') {
                result.then(() => this.props.changeFullscreen(true));
            } else {
                this.props.changeFullscreen(true);
            }
        }
    }

    _disableFullscreen() {
        // noinspection JSUnresolvedVariable
        if (document.exitFullscreen || document.webkitExitFullscreen || document.mozExitFullscreen || document.msExitFullscreen) {
            // noinspection JSUnresolvedVariable,JSUnresolvedFunction
            const result = document.exitFullscreen ? document.exitFullscreen()
                : (document.webkitExitFullscreen ? document.webkitExitFullscreen()
                    : (document.mozExitFullscreen ? document.mozExitFullscreen() : document.msExitFullscreen()));
            if (result && typeof result.then === 'function') {
                result.then(() => this.props.changeFullscreen(false));
            } else {
                this.props.changeFullscreen(false);
            }
        }
    }

    render() {
        return !this.props.isFullscreen
            ? React.createElement('button', {className: 'fullscreenButton', title: 'Full screen', onClick: this._enableFullscreen}, '↗')
            : React.createElement('button', {className: 'fullscreenButton', title: 'Exit full screen', onClick: this._disableFullscreen}, '↙');
    }
}