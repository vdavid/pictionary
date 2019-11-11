const {connect} = window.ReactRedux;
import {actionTypes as drawingCanvasActionTypes} from './store.mjs';

class DrawingCanvas extends React.Component {
    constructor(props) {
        super(props);
        this._handleMouseMoved = this._handleMouseMoved.bind(this);
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._liftPen = this._liftPen.bind(this);
        this._clearAndRedraw = this._clearAndRedraw.bind(this);
        this._sendNewlyDrawnLines = this._sendNewlyDrawnLines.bind(this);
    }

    componentDidMount() {
        const canvas = this.refs.drawingCanvas;

        this._allDrawnLines = [];
        this._newlyDrawnLines = [];
        this._isPenDown = false;
        this._lastX = undefined;
        this._lastY = undefined;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this._clearCanvas(canvas);

        this._timer = setInterval(this._sendNewlyDrawnLines, this.props.updateEventDispatchIntervalInMilliseconds);

        canvas.addEventListener('mousemove', this._handleMouseMoved, false);
        canvas.addEventListener('mousedown', this._handleMouseDown, false);
        canvas.addEventListener('mouseup', this._liftPen, false);
        canvas.addEventListener('mouseout', this._liftPen, false);
        canvas.addEventListener('resize', this._clearAndRedraw, false);
    }

    componentDidUpdate(previousProps) {
        if (previousProps.lineCount > this.props.lineCount) {
            this._clearCanvas(this.refs.drawingCanvas);
        }
    }

    componentWillUnmount() {
        clearInterval(this._timer);
    }

    render() {
        return React.createElement('canvas', {id: 'drawingCanvas', ref: 'drawingCanvas'});
    }

    _clearAndRedraw() {
        const canvas = this.refs.drawingCanvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this._clearCanvas(canvas);
        this._allDrawnLines.map(line => this._drawLine(canvas, line));
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
        const context = canvas.getContext("2d");
        context.beginPath();
        context.moveTo(line.x1 * canvas.width, line.y1 * canvas.height);
        context.lineTo(line.x2 * canvas.width, line.y2 * canvas.height);
        context.strokeStyle = line.color;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();
    }

    _handleMouseMoved(e) {
        if (this.props.isRoundStarted && this._isPenDown) {
            const canvas = this.refs.drawingCanvas;
            const previousX = this._lastX;
            const previousY = this._lastY;

            this._lastX = (e.clientX - canvas.offsetLeft) / canvas.width;
            this._lastY = (e.clientY - canvas.offsetTop) / canvas.height;

            const newLine = {x1: previousX, y1: previousY, x2: this._lastX, y2: this._lastY, color: 'black'};

            this._drawLine(this.refs.drawingCanvas, newLine);

            this._newlyDrawnLines.push(newLine);
            this._allDrawnLines.push(newLine);
        }
    }

    _handleMouseDown(e) {
        if (this.props.isRoundStarted) {
            const canvas = this.refs.drawingCanvas;
            this._isPenDown = true;
            this._lastX = (e.clientX - canvas.offsetLeft) / canvas.width;
            this._lastY = (e.clientY - canvas.offsetTop) / canvas.height;
        }
    }

    _liftPen() {
        this._isPenDown = false;
    }

    _sendNewlyDrawnLines() {
        if (this._newlyDrawnLines.length) {
            this.props.sendNewlyDrawnLines(this._newlyDrawnLines);
            this._newlyDrawnLines = [];
        }
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        lineCount: state.drawingCanvas.lineCount,
        isRoundStarted: state.game.isRoundStarted,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        sendNewlyDrawnLines: newLines => {
            dispatch({type: drawingCanvasActionTypes.DRAWING_UPDATED, payload: newLines});
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawingCanvas);