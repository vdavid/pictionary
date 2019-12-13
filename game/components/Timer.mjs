const {connect} = window.ReactRedux;
import {trialResult} from '../trial-result.mjs';
import {actionCreators as gameActionCreators} from '../../game/store.mjs';
import {actionCreators as chatActionCreators} from '../../chat/store.mjs';

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this._updateSecondsRemaining = this._updateSecondsRemaining.bind(this);
        this.state = {gameSecondsRemaining: 0, roundSecondsRemaining: 0};
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
     * @return {string|null} Null if totalSeconds is not a number.
     * @private
     */
    _formatRemainingTime(totalSeconds) {
        if (totalSeconds > 0) {
            const roundedSeconds = Math.round(totalSeconds);
            const minutes = Math.floor(roundedSeconds / 60);
            const seconds = Math.floor(roundedSeconds % 60);
            return minutes + ':' + seconds.toString().padStart(2, '0');
        } else if (totalSeconds < 0 || totalSeconds === 0) {
            return '0:00';
        } else {
            return null;
        }
    }

    /**
     * @private
     */
    _updateSecondsRemaining() {
        const gameSecondsRemaining = this.props.gameStartDateTime
            ? (this.props.gameStartDateTime.getTime() + (this.props.gameLengthInSeconds * 1000) - (new Date()).getTime()) / 1000
            : undefined;

        const normalRoundSecondsRemaining = this.props.roundStartDateTime
            ? (this.props.roundStartDateTime.getTime() + (this.props.roundLengthInSeconds * 1000) - (new Date()).getTime()) / 1000
            : undefined;
        const roundSecondsRemaining = normalRoundSecondsRemaining + (this.props.isRoundBaseTimeElapsed ? this.props.timeExtensionInSeconds : 0);
        this.setState({gameSecondsRemaining, roundSecondsRemaining});

        if (!this.props.isRoundBaseTimeElapsed && (normalRoundSecondsRemaining <= 0)) {
            /* Mark base time elapsed if needed */
            this.props.markRoundBaseTimeElapsed();
        } else if (this.props.isThisTheDrawer && (roundSecondsRemaining <= 0)) {
            /* End round if needed */
            this.props.markRoundAsFailed(this.props.phrase);
        }

        /* End game if needed */
        if (this.props.isHost && this.props.isGameStarted && gameSecondsRemaining < 0) {
            this.props.endGame();
        }
    }

    render() {
        const formattedGameTime = this._formatRemainingTime(this.state.gameSecondsRemaining);
        const isGameTimeOverSoon = this.state.gameSecondsRemaining < this.props.gameLengthInSeconds / 20;
        const gameTimerClass = ['game', 'timer',
            isGameTimeOverSoon ? ((this.state.roundSecondsRemaining >= 0) ? 'overSoon' : 'over') : ''].join(' ').trim();

        const formattedRoundTime = this._formatRemainingTime(this.state.roundSecondsRemaining);
        const isRoundTimeOverSoon = this.state.roundSecondsRemaining
            < (!this.props.isRoundBaseTimeElapsed ? this.props.roundLengthInSeconds : this.props.timeExtensionInSeconds) / 6;
        const roundTimerClass = ['round', 'timer', this.props.isRoundBaseTimeElapsed ? 'extension' : '',
            isRoundTimeOverSoon ? ((this.state.roundSecondsRemaining >= 0) ? 'overSoon' : 'over') : ''].join(' ').trim();

        return React.createElement('div', {},
            React.createElement('div', {className: 'section round'},
                React.createElement('div', {className: 'round title'}, 'Round:'),
                React.createElement('div', {className: roundTimerClass}, (this.props.isRoundBaseTimeElapsed ? '+' : '') + formattedRoundTime),
            ),
            React.createElement('div', {className: 'section game'},
                React.createElement('div', {className: 'game title'}, 'Game:'),
                React.createElement('div', {className: gameTimerClass}, formattedGameTime),
            ),
        );
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
        isGameStarted: state.game.isGameStarted,
        gameStartDateTime: state.game.gameStartedDateTimeString ? new Date(state.game.gameStartedDateTimeString) : undefined,
        isRoundStarted: latestTrial.trialResult === trialResult.ongoing,
        roundStartDateTime: latestTrial.startedDateTimeString ? new Date(latestTrial.startedDateTimeString) : undefined,
        roundLengthInSeconds: state.app.config.roundLengthInSeconds,
        timeExtensionInSeconds: state.app.config.timeExtensionInSeconds,
        gameLengthInSeconds: state.app.config.gameLengthInSeconds,
        isRoundBaseTimeElapsed: latestRound.isRoundBaseTimeElapsed,
        isHost: state.connection.hostPeerId === state.connection.localPeerId,
        isThisTheDrawer: latestRound.drawer && (latestRound.drawer.peerId === state.game.localPlayer.peerId),
        phrase: latestRound.phrase,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        markRoundBaseTimeElapsed: () => {
            dispatch(gameActionCreators.createMarkRoundBaseTimeElapsedRequest());
        },
        endGame: () => {
            dispatch(gameActionCreators.createEndGameRequest(new Date().toISOString()));
        },
        markRoundAsFailed(phrase) {
            dispatch(gameActionCreators.createMarkRoundEndedRequest(phrase, null, new Date().toISOString()));
            dispatch(chatActionCreators.createSendRoundEndedRequest(null, null, null, null, phrase));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Timer);