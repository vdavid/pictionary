const {connect} = window.ReactRedux;
import {actionCreators as gameActionCreators} from '../store.mjs';
import {actionCreators as chatActionCreators} from '../../chat/store.mjs';

class GuessWatcher extends React.Component {
    render() {
        return null;
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidMount() {
        this._parsedMessageCount = 0;
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate() {
        if ((this.props.drawerPeerId === this.props.localPeerId) && (this._parsedMessageCount < this.props.messages.length)) {
            /** @type {ChatMessage[]} messagesToParse */
            const messagesToParse = this.props.messages.slice(this._parsedMessageCount);
            for (const message of messagesToParse) {
                if ((message.dateTimeString >= this.props.roundStartedDateTimeString)
                    && message.isIncoming
                    && !message.isSystemMessage
                    && this._isMessageACorrectGuess(message)) {
                    this.props.markRoundAsSolved(this.props.phrase, message.senderPeerId, this._getPlayerNameByPeerId(message.senderPeerId), this.props.localPeerId);
                    break;
                }
            }
        }
    }

    _getPlayerNameByPeerId(peerId) {
        const player = this.props.players.find(player => player.peerId === peerId);
        return player ? player.name : 'Unknown player';
    }

    _isMessageACorrectGuess(message) {
        return (message.trim().toLowerCase().indexOf(this.props.phrase.toLowerCase()) > -1);
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    const latestRound = (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []};
    return {
        drawerPeerId: latestRound.drawer ? latestRound.drawer.peerId : undefined,
        localPeerId: state.connection.localPeerId,
        roundStartedDateTimeString: latestRound.trials.length ? latestRound.trials[0].startedDateTimeString : null,
        messages: state.chat.messages,
        phrase: latestRound.phrase,
        players: [state.game.localPlayer, ...state.game.remotePlayers],
    };
}

function mapDispatchToProps(dispatch) {
    return {
        markRoundAsSolved: (phrase, solverPeerId, solverPlayerName, localPeerId) => {
            dispatch(gameActionCreators.createMarkRoundEndedRequest(phrase, solverPeerId));
            dispatch(chatActionCreators.createSendRoundSolvedRequest(localPeerId, solverPeerId, solverPlayerName, localPeerId, phrase));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GuessWatcher);