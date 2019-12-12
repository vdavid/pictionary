const {connect} = window.ReactRedux;
import {actionCreators as gameActionCreators} from '../store.mjs';
import {actionCreators as chatActionCreators} from '../../chat/store.mjs';

class GuessWatcher extends React.Component {
    render() {
        return null;
    }

    // noinspection JSUnusedGlobalSymbols
    componentDidUpdate(previousProps) {
        /* If this is the drawer, check if any new messages are a correct guess */
        if ((this.props.drawerPeerId === this.props.localPeerId) && (previousProps.messages.length < this.props.messages.length)) {
            /** @type {ChatMessage[]} messagesToParse */
            const messagesToParse = this.props.messages.slice(previousProps.messages.length);
            for (const message of messagesToParse) {
                if ((message.dateTimeString >= this.props.roundStartedDateTimeString)
                    && message.isIncoming
                    && !message.isSystemMessage
                    && this._isMessageACorrectGuess(message.text)) {
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

    _isMessageACorrectGuess(messageText) {
        return (messageText.trim().toLowerCase().indexOf(this.props.phrase.toLowerCase()) > -1);
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
            dispatch(gameActionCreators.createMarkRoundEndedRequest(phrase, solverPeerId, new Date().toISOString()));
            dispatch(chatActionCreators.createSendRoundEndedRequest(localPeerId, solverPeerId, solverPlayerName, localPeerId, phrase));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GuessWatcher);