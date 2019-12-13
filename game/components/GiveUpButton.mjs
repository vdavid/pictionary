import {actionCreators as gameActionCreators} from '../store.mjs';
import {actionCreators as chatActionCreators} from '../../chat/store.mjs';

const {connect} = window.ReactRedux;

class GiveUpButton extends React.Component {
    render() {
        return React.createElement('button', {
            className: 'giveUpButton',
            onClick: () => this.props.markRoundAsFailed(this.props.phrase)
        }, 'Give up');
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    const latestRound = (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []};
    return {
        phrase: latestRound.phrase,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        markRoundAsFailed(phrase) {
            dispatch(gameActionCreators.createMarkRoundEndedRequest(phrase, null, new Date().toISOString()));
            dispatch(chatActionCreators.createSendRoundEndedRequest(null, null, null, null, phrase));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GiveUpButton);