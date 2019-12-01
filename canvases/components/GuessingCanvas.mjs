const {connect} = window.ReactRedux;
import {actionCreators as guessingCanvasActionCreators} from '../guessing-canvas-store.mjs';
import DrawingTools from '../DrawingTools.mjs';

class GuessingCanvas extends React.Component {
    constructor(props) {
        super(props);
        this._clearAndRedraw = this._clearAndRedraw.bind(this);

    }

    // noinspection JSUnusedGlobalSymbols
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

    // noinspection JSUnusedGlobalSymbols
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
            dispatch(guessingCanvasActionCreators.createUpdateCanvasSuccess(lineCount));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GuessingCanvas);