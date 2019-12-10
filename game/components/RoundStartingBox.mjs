import {trialResult} from '../trial-result.mjs';

const React = window.React;
import {actionCreators as gameActionCreators} from '../store.mjs';

const {connect} = window.ReactRedux;

class RoundStartingBox extends React.Component {
    constructor(props) {
        super(props);
        this._updateSecondsRemaining = this._updateSecondsRemaining.bind(this);
        this._timeIsUp = this._timeIsUp.bind(this);
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidMount() {
        if (!this._intervalTimer && this.props.isRoundStarting) {
            this._intervalTimer = this.props.isRoundStarting ? setInterval(this._updateSecondsRemaining, 1000) : null;
            this._startGameTimeout = this.props.isRoundStarting ? setTimeout(this._timeIsUp, this.props.durationInMilliseconds) : null;
        }
        this.state = {secondsRemaining: (this.props.startingDateTime.getTime() + this.props.durationInMilliseconds - (new Date()).getTime()) / 1000};
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate() {
        if (!this._intervalTimer && this.props.isRoundStarted) {
            this._intervalTimer = setInterval(this._updateSecondsRemaining, 1000);
        } else if (this._intervalTimer && !this.props.isRoundStarted) {
            clearInterval(this._intervalTimer);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    componentWillUnmount() {
        if (this._intervalTimer) {
            clearInterval(this._intervalTimer);
            clearInterval(this._startGameTimeout);
        }
    }

    /**
     * @private
     */
    _updateSecondsRemaining() {
        this.setState({secondsRemaining: this.state.secondsRemaining - 1});
    }

    render() {
        return React.createElement('div', {},
            React.createElement('div', {className: 'fullScreenSemiTransparentCover'}),
            React.createElement('div', {id: 'gameStartingBox', className: 'midScreenBox'},
                React.createElement('p', {}, 'Game is starting in'),
                React.createElement('div', {className: 'timer'}, Math.ceil(this.state.secondsRemaining)),
                React.createElement('p', {className: 'whoDraws'}, this.props.isLocalPlayerDrawing ? 'You\'ll be the one drawing.' : 'You\'ll be the one guessing.'),
            ),
        );
    }

    _timeIsUp() {
        clearInterval(this._intervalTimer);
        this.props.startGame();
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    const latestRound = (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []};
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};
    const startingDateTime = latestTrial.startingDateTimeString ? new Date(latestTrial.startingDateTimeString) : undefined;
    return {
        isRoundStarting: latestTrial.trialResult === trialResult.starting,
        startingDateTime: startingDateTime,
        isLocalPlayerDrawing: latestRound.drawer.peerId === state.game.localPlayer.peerId
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