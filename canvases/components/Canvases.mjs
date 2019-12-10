import {actionCreators as chatActionCreators} from '../../chat/store.mjs';

const {connect} = window.ReactRedux;

import DrawingCanvas from './DrawingCanvas.mjs';
import GuessingCanvas from './GuessingCanvas.mjs';
import ClearButton from './ClearButton.mjs';
import FullscreenButton from './FullscreenButton.mjs';
import {actionCreators as appActionCreators} from '../../app/store.mjs';
import {actionCreators as gameActionCreators} from '../../game/store.mjs';

class Canvases extends React.Component {
    render() {
        return React.createElement('section', {id: 'canvasSection'},
            this.props.isLocalPlayerDrawing ? React.createElement(DrawingCanvas, {updateEventDispatchIntervalInMilliseconds: 500}) : null,
            this.props.isLocalPlayerDrawing ? React.createElement(ClearButton, {clearDrawingCanvas: this.props.clearDrawingCanvas}) : null,
            React.createElement(FullscreenButton, {isFullscreen: this.props.isFullscreen, changeFullscreen: this.props.changeFullscreen}),
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
        isFullscreen: state.app.isFullscreen,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        changeFullscreen: (isFullscreen) => {
            dispatch(appActionCreators.createSetFullscreenStateRequest(isFullscreen));
        },
        clearDrawingCanvas: () => {
            dispatch(gameActionCreators.createClearRequest());
            dispatch(gameActionCreators.createStartNewTrialAfterClearingRequest());
            dispatch(chatActionCreators.createNoteCanvasWasClearedRequest(true));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Canvases);