import {trialResult} from '../trial-result.mjs';

const React = window.React;
import {actionCreators as gameActionCreators} from '../store.mjs';

const {connect} = window.ReactRedux;

class RoundStartingBox extends React.Component {
    constructor(props) {
        super(props);
        this._updateSecondsRemaining = this._updateSecondsRemaining.bind(this);
        this._timeIsUp = this._timeIsUp.bind(this);
        this.state = {secondsRemaining: 0};
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidMount() {
        this._updateSecondsRemaining();
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate() {
        if (this.props.isRoundStarting && !this._intervalTimer) {
            this._intervalTimer = this.props.isRoundStarting ? setInterval(this._updateSecondsRemaining, 1000) : null;
            this._startRoundTimeout = this.props.isRoundStarting ? setTimeout(this._timeIsUp, this.props.roundCountdownLengthInSeconds * 1000) : null;
        } else if (!this.props.isRoundStarting && this._intervalTimer) {
            clearInterval(this._intervalTimer);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    componentWillUnmount() {
        if (this._intervalTimer) {
            clearInterval(this._intervalTimer);
            clearInterval(this._startRoundTimeout);
        }
    }

    /**
     * @private
     */
    _updateSecondsRemaining() {
        const secondsRemaining = this.props.startingDateTime
            ? (this.props.startingDateTime.getTime() + (this.props.roundCountdownLengthInSeconds * 1000) - (new Date()).getTime()) / 1000
            : undefined;
        this.setState({secondsRemaining});
    }

    render() {
        return React.createElement('div', {},
            React.createElement('div', {className: 'fullScreenSemiTransparentCover'}),
            React.createElement('div', {id: 'gameStartingBox', className: 'midScreenBox'},
                React.createElement('p', {}, 'Next round is starting in'),
                React.createElement('div', {className: 'timer'}, Math.ceil(this.state.secondsRemaining)),
                React.createElement('p', {className: 'whoDraws'}, this.props.isLocalPlayerDrawing ? 'You\'ll be the one drawing.' : 'You\'ll be the one guessing.'),
            ),
        );
    }

    _timeIsUp() {
        clearInterval(this._intervalTimer);
        this.props.startRound();
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
        isRoundStarting: latestTrial.trialResult === trialResult.starting,
        startingDateTime: latestTrial.startingDateTimeString ? new Date(latestTrial.startingDateTimeString) : undefined,
        isLocalPlayerDrawing: latestRound.drawer.peerId === state.game.localPlayer.peerId,
        roundCountdownLengthInSeconds: state.app.config.roundCountdownLengthInSeconds,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        startRound: () => {
            dispatch(gameActionCreators.createStartRoundSuccess());
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RoundStartingBox);