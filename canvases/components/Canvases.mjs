import {actionCreators as chatActionCreators} from '../../chat/store.mjs';

const {connect} = window.ReactRedux;

import DrawingCanvas from './DrawingCanvas.mjs';
import GuessingCanvas from './GuessingCanvas.mjs';
import ClearButton from './ClearButton.mjs';
import FullscreenButton from './FullscreenButton.mjs';
import {actionCreators as drawingCanvasActionCreators} from '../drawing-canvas-store.mjs';
import {actionCreators as gameActionCreators} from '../../game/store.mjs';

class Canvases extends React.Component {
    render() {
        return React.createElement('section', {id: 'canvasSection'},
            this.props.whichPlayerDraws === 'local' ? React.createElement(DrawingCanvas, {updateEventDispatchIntervalInMilliseconds: 500}) : null,
            this.props.whichPlayerDraws === 'local' ? React.createElement(ClearButton, {clearDrawingCanvas: this.props.clearDrawingCanvas}) : null,
            React.createElement(FullscreenButton, {isFullscreen: this.props.isFullscreen, changeFullscreen: this.props.changeFullscreen}),
            this.props.whichPlayerDraws === 'remote' ? React.createElement(GuessingCanvas) : null,
        );
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        whichPlayerDraws: state.game.whichPlayerDraws,
        isFullscreen: state.game.isFullscreen,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        changeFullscreen: (isFullscreen) => {
            dispatch(gameActionCreators.createSetFullscreenStateRequest(isFullscreen));
        },
        clearDrawingCanvas: () => {
            dispatch(drawingCanvasActionCreators.createClearRequest());
            dispatch(chatActionCreators.createNoteCanvasWasClearedRequest('local'));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Canvases);