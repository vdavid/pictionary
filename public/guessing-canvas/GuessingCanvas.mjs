const {connect} = window.ReactRedux;
import {actionTypes as guessingCanvasActionTypes} from './store.mjs';

class GuessingCanvas extends React.Component {
    componentDidMount() {
        this._allDrawnLines = [];

        const canvas = this.refs.guessingCanvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this._clearCanvas(canvas);
    }

    componentDidUpdate(previousProps) {
        const newLines = this.props.newLines;
        if (newLines.length) {
            this.props.markNewLinesAsProcessed(newLines.length);

            this._allDrawnLines = [...this._allDrawnLines, ...newLines];

            this._drawLines(newLines);
        }

        if (previousProps.lineCount > this.props.lineCount) {
            this._clearCanvas(this.refs.guessingCanvas);
        }
    }

    render() {
        return React.createElement('canvas', {id: 'guessingCanvas', ref: 'guessingCanvas'});
    }

    _clearAndRedraw() {
        const canvas = this.refs.guessingCanvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this._clearCanvas(canvas);
        this._drawLines(this._allDrawnLines);
    }

    _drawLines(lines) {
        const canvas = this.refs.guessingCanvas;
        lines.map(line => this._drawLine(canvas, line));
    }

    _clearCanvas(canvas) {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {DrawnLine} line
     * @private
     */
    _drawLine(canvas, line) {
        const context = canvas.getContext('2d');
        context.beginPath();
        context.moveTo(line.x1 * canvas.width, line.y1 * canvas.height);
        context.lineTo(line.x2 * canvas.width, line.y2 * canvas.height);
        context.strokeStyle = line.color;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();
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