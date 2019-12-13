import {trialResult} from '../../game/trial-result.mjs';

const {connect} = window.ReactRedux;
import {actionCreators as gameActionCreators} from '../../game/store.mjs';
import DrawingTools from '../DrawingTools.mjs';

/**
 * @typedef {Object} DrawnLine
 * @property {int} x1
 * @property {int} y1
 * @property {int} x2
 * @property {int} y2
 * @property {string} color
 */

class DrawingCanvas extends React.Component {
    constructor(props) {
        super(props);
        this._handleMouseMoved = this._handleMouseMoved.bind(this);
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._liftPen = this._liftPen.bind(this);
        this._sendNewlyDrawnLines = this._sendNewlyDrawnLines.bind(this);
        this._clearAndRedraw = this._clearAndRedraw.bind(this);

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

    render() {
        // noinspection JSUnusedGlobalSymbols
        return React.createElement('canvas', {
            id: 'drawingCanvas',
            ref: 'drawingCanvas',
            onContextMenu: event => event.preventDefault(),
            onPointerDown: this._handleMouseDown,
            onPointerMove: this._handleMouseMoved,
            onPointerUp: this._liftPen,
            onPointerCancel: this._liftPen,
            // onTouchStart: this._handleMouseDown,
            // onTouchMove: this._handleMouseMoved,
            // onTouchEnd: this._liftPen,
            // onTouchCancel: this._liftPen,
        });
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidMount() {
        const canvas = this.refs.drawingCanvas;
        this._drawingTools = new DrawingTools(canvas);

        this._drawingTools.updateCanvasSiteToItsClientSize();
        this._drawingTools.clearCanvas();
        this.props.lines.map(line => this._drawingTools.drawLine(line));

        this._timer = setInterval(this._sendNewlyDrawnLines, this.props.updateIntervalInMilliseconds);
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate(previousProps) {
        if (previousProps.lines.length > this.props.lines.length) {
            this._drawingTools.clearCanvas();
        } else if (previousProps.lines.length > this.props.lines.length) {
            const newLines = this.props.lines.slice(previousProps.lines.length);
            newLines.map(line => this._drawingTools.drawLine(line));
        }
    }

    // noinspection JSUnusedGlobalSymbols
    componentWillUnmount() {
        clearInterval(this._timer);
    }

    _sendNewlyDrawnLines() {
        if (this._newlyDrawnLines.length) {
            this.props.sendNewlyDrawnLines(this._newlyDrawnLines);
            this._newlyDrawnLines = [];
        }
    }

    _clearAndRedraw() {
        if (this._drawingTools) {
            this._drawingTools.updateCanvasSiteToItsClientSize();
            this._drawingTools.clearCanvas();
            this.props.lines.map(line => this._drawingTools.drawLine(line));
        }
    }

    _handleMouseDown(event) {
        if (this.props.isRoundStarted) {
            event.preventDefault();
            const canvas = this.refs.drawingCanvas;
            this._isPenDown = true;
            this._lastX = (event.clientX - canvas.getBoundingClientRect().left) / canvas.width;
            this._lastY = (event.clientY - canvas.getBoundingClientRect().top) / canvas.height;
            // this._drawingTools.drawDot(this._lastX, this._lastY);
        }
    }

    _handleMouseMoved(event) {
        if (this.props.isRoundStarted && this._isPenDown) {
            event.preventDefault();

            const canvas = this.refs.drawingCanvas;
            const previousX = this._lastX;
            const previousY = this._lastY;

            this._lastX = (event.clientX - canvas.getBoundingClientRect().left) / canvas.width;
            this._lastY = (event.clientY - canvas.getBoundingClientRect().top) / canvas.height;

            const newLine = {x1: previousX, y1: previousY, x2: this._lastX, y2: this._lastY, color: 'black'};

            this._drawingTools.drawLine(newLine);

            this._newlyDrawnLines.push(newLine);
        }
    }

    _liftPen() {
        this._isPenDown = false;
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    const latestRound = (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []};
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};
    return {
        lines: latestTrial.lines || [],
        isRoundStarted: latestTrial.trialResult === trialResult.ongoing,
        updateIntervalInMilliseconds: state.app.config.checkForNewDrawnLinesIntervalInMilliseconds,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        sendNewlyDrawnLines: newLines => {
            dispatch(gameActionCreators.createSaveNewLinesRequest(newLines));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawingCanvas);