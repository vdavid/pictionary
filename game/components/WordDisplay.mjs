import {trialResult} from '../trial-result.mjs';

const React = window.React;
const {connect} = window.ReactRedux;

class WordDisplay extends React.Component {
    constructor(props) {
        super(props);
        this._getContentText = this._getContentText.bind(this);
    }

    render() {
        return React.createElement('section', {id: 'wordDisplaySection'},
            React.createElement('span', {}, this._getContentText())
        );
    }

    _getContentText() {
        if (!this.props.isRoundStarted) {
            return '';
        } else if (this.props.isLocalPlayerDrawing) {
            return 'Draw: “' + this.props.activePhrase + '”';
        } else {
            return 'See the drawing and start guessing what it is!';
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
        isLocalPlayerDrawing: latestRound.drawer ? (latestRound.drawer.peerId === state.game.localPlayer.peerId) : false,
        activePhrase: latestRound.phrase,
    };
}

export default connect(mapStateToProps)(WordDisplay);