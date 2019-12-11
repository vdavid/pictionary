const {connect} = window.ReactRedux;
import DrawingTools from '../DrawingTools.mjs';

class GuessingCanvas extends React.Component {
    constructor(props) {
        super(props);
        this._clearAndRedraw = this._clearAndRedraw.bind(this);
    }

    render() {
        return React.createElement('canvas', {id: 'guessingCanvas', ref: 'guessingCanvas'});
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidMount() {
        this._drawingTools = new DrawingTools(this.refs.guessingCanvas);
        this._drawingTools.updateCanvasSiteToItsClientSize();
        this._drawingTools.clearCanvas();

        window.addEventListener('resize', this._clearAndRedraw);
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate(previousProps) {
        if (previousProps.lines.length < this.props.lines.length) {
            this._drawLines(this.props.lines.slice(previousProps.lines.length));
        } else if (previousProps.lines.length > this.props.lines.length) {
            this._drawingTools.clearCanvas();
        }
    }

    _clearAndRedraw() {
        this._drawingTools.updateCanvasSiteToItsClientSize();
        this._drawingTools.clearCanvas();
        this._drawLines(this.props.lines);
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
    const latestRound = (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []};
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};
    return {
        lines: latestTrial.lines || [],
    };
}

export default connect(mapStateToProps)(GuessingCanvas);