const {connect} = window.ReactRedux;
import {actionTypes as drawingCanvasActionTypes} from './drawing-canvas-store.mjs';
import DrawingTools from './DrawingTools.mjs';

class DrawingCanvas extends React.Component {
    constructor(props) {
        super(props);
        this._handleMouseMoved = this._handleMouseMoved.bind(this);
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._liftPen = this._liftPen.bind(this);
        this._sendNewlyDrawnLines = this._sendNewlyDrawnLines.bind(this);
        this._clearAndRedraw = this._clearAndRedraw.bind(this);

        /** @type {DrawnLine[]} */
        this._allDrawnLines = [];
        /** @type {DrawnLine[]} */
        this._newlyDrawnLines = [];
        /** @type {boolean} */
        this._isPenDown = false;
        /** @type {Number|undefined} */
        this._lastX = undefined;
        /** @type {Number|undefined} */
        this._lastY = undefined;

        window.addEventListener('resize', this._clearAndRedraw);
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidMount() {
        const canvas = this.refs.drawingCanvas;
        this._drawingTools = new DrawingTools(canvas);

        this._drawingTools.updateCanvasSiteToItsClientSize();
        this._drawingTools.clearCanvas();
        this._allDrawnLines.map(line => this._drawingTools.drawLine(line));

        this._timer = setInterval(this._sendNewlyDrawnLines, this.props.updateEventDispatchIntervalInMilliseconds);
    }

    _clearAndRedraw() {
        if (this._drawingTools) {
            this._drawingTools.updateCanvasSiteToItsClientSize();
            this._drawingTools.clearCanvas();
            this._allDrawnLines.map(line => this._drawingTools.drawLine(line));
        }
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate(previousProps) {
        if (previousProps.lineCount > this.props.lineCount) {
            this._drawingTools.clearCanvas();
        }
    }

    // noinspection JSUnusedGlobalSymbols
    componentWillUnmount() {
        clearInterval(this._timer);
    }

    render() {
        // noinspection JSUnusedGlobalSymbols
        return React.createElement('canvas', {
            id: 'drawingCanvas',
            ref: 'drawingCanvas',
            onContextMenu: event => event.preventDefault(),
            onMouseMove: this._handleMouseMoved,
            onMouseDown: this._handleMouseDown,
            onMouseUp: this._liftPen,
            onMouseOut: this._liftPen,
        });
    }

    _handleMouseMoved(event) {
        if (this.props.isRoundStarted && this._isPenDown) {
            const canvas = this.refs.drawingCanvas;
            const previousX = this._lastX;
            const previousY = this._lastY;

            this._lastX = (event.clientX - canvas.getBoundingClientRect().left) / canvas.width;
            this._lastY = (event.clientY - canvas.getBoundingClientRect().top) / canvas.height;

            const newLine = {x1: previousX, y1: previousY, x2: this._lastX, y2: this._lastY, color: 'black'};

            this._drawingTools.drawLine(newLine);

            this._newlyDrawnLines.push(newLine);
            this._allDrawnLines.push(newLine);
        }
    }

    _handleMouseDown(event) {
        if (this.props.isRoundStarted) {
            event.preventDefault();
            const canvas = this.refs.drawingCanvas;
            this._isPenDown = true;
            this._lastX = (event.clientX - canvas.getBoundingClientRect().left) / canvas.width;
            this._lastY = (event.clientY - canvas.getBoundingClientRect().top) / canvas.height;
            this._drawingTools.drawDot(this._lastX, this._lastY);
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