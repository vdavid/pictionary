const {connect} = window.ReactRedux;
import {actionTypes as guessingCanvasActionTypes} from '../guessing-canvas-store.mjs';
import DrawingTools from '../DrawingTools.mjs';

class GuessingCanvas extends React.Component {
    constructor(props) {
        super(props);
        this._clearAndRedraw = this._clearAndRedraw.bind(this);

    }
    componentDidMount() {
        this._allDrawnLines = [];
        this._drawingTools = new DrawingTools(this.refs.guessingCanvas);
        this._drawingTools.updateCanvasSiteToItsClientSize();
        this._drawingTools.clearCanvas();

        window.addEventListener('resize', this._clearAndRedraw);
    }

    _clearAndRedraw() {
        this._drawingTools.updateCanvasSiteToItsClientSize();
        this._drawingTools.clearCanvas();
        this._drawLines(this._allDrawnLines);
    }

    componentDidUpdate(previousProps) {
        const newLines = this.props.newLines;
        if (newLines.length) {
            this.props.markNewLinesAsProcessed(newLines.length);

            this._allDrawnLines = [...this._allDrawnLines, ...newLines];

            this._drawLines(newLines);
        }

        if (previousProps.lineCount > this.props.lineCount) {
            this._drawingTools.clearCanvas();
            this._allDrawnLines = [];
        }
    }

    render() {
        return React.createElement('canvas', {id: 'guessingCanvas', ref: 'guessingCanvas'});
    }

    _drawLines(lines) {
        lines.map(line => this._drawingTools.drawLine(line));
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        lineCount: state.guessingCanvas.lineCount,
        newLines: state.guessingCanvas.newLines,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        markNewLinesAsProcessed: lineCount => {
            dispatch({type: guessingCanvasActionTypes.NEW_LINES_PROCESSED, payload: lineCount});
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GuessingCanvas);