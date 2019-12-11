import {trialResult} from '../trial-result.mjs';

const React = window.React;

const {connect} = window.ReactRedux;

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this._updateSecondsRemaining = this._updateSecondsRemaining.bind(this);
        this.state = {secondsRemaining: 0};
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidMount() {
        this._updateSecondsRemaining();
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate() {
        if (!this._intervalTimer && this.props.isRoundStarted) {
            this._updateSecondsRemaining();
            this._intervalTimer = setInterval(this._updateSecondsRemaining, 1000);
        } else if (this._intervalTimer && !this.props.isRoundStarted) {
            clearInterval(this._intervalTimer);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    componentWillUnmount() {
        if (this._intervalTimer) {
            clearInterval(this._intervalTimer);
        }
    }

    /**
     * @param {Number} totalSeconds
     * @private
     */
    _formatRemainingTime(totalSeconds) {
        if (totalSeconds > 0) {
            const roundedSeconds = Math.round(totalSeconds);
            const minutes = Math.floor(roundedSeconds / 60);
            const seconds = Math.floor(roundedSeconds % 60);
            return minutes + ':' + seconds.toString().padStart(2, '0');
        } else {
            return '0:00';
        }
    }

    /**
     * @private
     */
    _updateSecondsRemaining() {
        const secondsRemaining = this.props.startDateTime
            ? (this.props.startDateTime.getTime() + this.props.durationInMilliseconds - (new Date()).getTime()) / 1000
            : undefined;
        this.setState({secondsRemaining});
    }

    render() {
        if (this.state.secondsRemaining !== undefined) {
            const formattedTime = this._formatRemainingTime(this.state.secondsRemaining);
            if (this.state.secondsRemaining > 5) {
                return React.createElement('div', {}, formattedTime);
            } else if (this.state.secondsRemaining >= 0) {
                return React.createElement('div', {className: 'overSoon'}, formattedTime);
            } else {
                return React.createElement('div', {className: 'over'}, formattedTime);
            }
        } else {
            return React.createElement('div', {}, '');
        }
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
        isRoundStarted: latestTrial.trialResult === trialResult.ongoing,
        startDateTime: latestTrial.startedDateTimeString ? new Date(latestTrial.startedDateTimeString) : undefined,
    };
}

export default connect(mapStateToProps)(Timer);