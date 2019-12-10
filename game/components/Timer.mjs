import {trialResult} from '../trial-result.mjs';

const React = window.React;

const {connect} = window.ReactRedux;

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this._updateSecondsRemaining = this._updateSecondsRemaining.bind(this);
        this._timeIsUp = this._timeIsUp.bind(this);
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidMount() {
        if (!this._intervalTimer && this.props.isRoundStarted) {
            this._intervalTimer = setInterval(this._updateSecondsRemaining, 1000);
        }
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
        }
    }

    /**
     * @param {Number} totalSeconds
     * @private
     */
    _formatRemainingTime(totalSeconds) {
        if (totalSeconds !== undefined) {
            const roundedSeconds = Math.round(totalSeconds);
            const minutes = Math.floor(roundedSeconds / 60);
            const seconds = Math.floor(roundedSeconds % 60);
            return minutes + ':' + seconds.toString().padStart(2, '0');
        } else {
            return '';
        }

    }

    render() {
        if (this.props.endDateTime) {
            const secondsRemaining = (this.props.endDateTime.getTime() - (new Date()).getTime()) / 1000;
            const formattedTime = this._formatRemainingTime(secondsRemaining);
            if (secondsRemaining > 5) {
                return React.createElement('div', {}, formattedTime);
            } else if (secondsRemaining >= 0) {
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
    const startDateTime = latestTrial.startedDateTimeString ? new Date(latestTrial.startedDateTimeString) : undefined;
    return {
        isRoundStarted: latestTrial.trialResult === trialResult.ongoing,
        endDateTime: startDateTime ? new Date(startDateTime.getTime() + this.props.durationInMilliseconds) : undefined,
    };
}

export default connect(mapStateToProps)(Timer);