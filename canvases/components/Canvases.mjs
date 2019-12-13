const {connect} = window.ReactRedux;
import DrawingCanvas from './DrawingCanvas.mjs';
import GuessingCanvas from './GuessingCanvas.mjs';
import FullscreenButton from './FullscreenButton.mjs';
import DrawingButtonBar from './DrawingButtonBar.mjs';

class Canvases extends React.Component {
    render() {
        return React.createElement('section', {id: 'canvasSection'},
            this.props.isLocalPlayerDrawing ? React.createElement(DrawingCanvas) : null,
            React.createElement(FullscreenButton),
            this.props.isLocalPlayerDrawing ? React.createElement(DrawingButtonBar) : null,
            !this.props.isLocalPlayerDrawing ? React.createElement(GuessingCanvas) : null,
        );
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    const latestRound = (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []};
    return {
        isLocalPlayerDrawing: latestRound.drawer ? (latestRound.drawer.peerId === state.game.localPlayer.peerId) : false,
    };
}

export default connect(mapStateToProps)(Canvases);