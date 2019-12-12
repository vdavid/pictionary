import {trialResult} from '../trial-result.mjs';
import {actionCreators as gameActionCreators} from '../../game/store.mjs';
import {actionCreators as chatActionCreators} from '../../chat/store.mjs';

const React = window.React;

const {connect} = window.ReactRedux;

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this._updateSecondsRemaining = this._updateSecondsRemaining.bind(this);
        this.state = {gameSecondsRemaining: 0, roundSecondsRemaining: 0, isOnExtensionTime: false};
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
        const isOnExtensionTime = normalRoundSecondsRemaining <= 0;
        const roundSecondsRemaining = normalRoundSecondsRemaining + (isOnExtensionTime ? this.props.timeExtensionInSeconds : 0);
        this.setState({gameSecondsRemaining, roundSecondsRemaining, isOnExtensionTime});

        /* End round if needed */
        if (this.props.isThisTheDrawer && (roundSecondsRemaining <= 0)) {
            this.props.markRoundAsFailed(this.props.phrase);
        }

        /* End game if needed */
        if (this.props.isHost && this.props.isGameStarted && gameSecondsRemaining < 0) {
            this.props.endGame();
        }
    }

    render() {
        const formattedGameTime = this._formatRemainingTime(this.state.gameSecondsRemaining);
        const gameTimerClass = (this.state.gameSecondsRemaining > 30)
            ? 'timer' : ((this.state.roundSecondsRemaining >= 0) ? 'timer overSoon' : 'timer over');

        const formattedRoundTime = this._formatRemainingTime(this.state.roundSecondsRemaining);
        const roundTimerClass = [
            'timer',
            this.state.isOnExtensionTime ? 'extension' : '',
            (this.state.roundSecondsRemaining > (this.state.isOnExtensionTime ? 20 : 10))
                ? '' : ((this.state.roundSecondsRemaining >= 0) ? 'overSoon' : 'over')
        ].join(' ').trim();

        return React.createElement('div', {},
            React.createElement('div', {className: 'section round'},
                React.createElement('div', {className: 'title'}, 'Round:'),
                React.createElement('div', {className: roundTimerClass}, formattedRoundTime),
                (this.state.isOnExtensionTime ? React.createElement('div', {className: 'extensionIndicator'}, '(Extension)') : null),
            ),
            React.createElement('div', {className: 'section game'},
                React.createElement('div', {className: 'title'}, 'Game:'),
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
        isHost: state.connection.hostPeerId === state.connection.localPeerId,
        isThisTheDrawer: latestRound.drawer && (latestRound.drawer.peerId === state.game.localPlayer.peerId),
        phrase: latestRound.phrase,
    };
}

function mapDispatchToProps(dispatch) {
    return {
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