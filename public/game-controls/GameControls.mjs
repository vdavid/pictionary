const {connect} = window.ReactRedux;
import {actionTypes as gameActionTypes} from '../game/store.mjs';
import {getRandomPhrase} from '../data/phrases.mjs';

class GameControls extends React.Component {
    constructor(props) {
        super(props);
        this._getContentText = this._getContentText.bind(this);
    }

    componentDidUpdate(previousProps) {
        if (this.props.whichPlayerDraws === 'local'
            && ((!previousProps.isRoundStarted && this.props.isRoundStarted)
                || (!previousProps.isActivePhraseGuessedCorrectly && this.props.isActivePhraseGuessedCorrectly))) {
            const randomPhrase = getRandomPhrase();
            this.props.setActivePhrase(randomPhrase);
        }
    }

    render() {
        return React.createElement('section', {id: 'gameControlsSection'},
            React.createElement('span', {}, this._getContentText())
        );
    }

    _getContentText() {
        if (!this.props.isRoundStarted) {
            return '';
        } else if (this.props.whichPlayerDraws === 'local') {
            return this.props.activePhrase;
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
    return {
        isRoundStarted: state.game.isRoundStarted,
        whichPlayerDraws: state.game.whichPlayerDraws,
        activePhrase: state.game.activePhrase,
        isActivePhraseGuessedCorrectly: state.game.isActivePhraseGuessedCorrectly,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setActivePhrase: phrase => {
            dispatch({type: gameActionTypes.SET_ACTIVE_PHRASE, payload: phrase});
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GameControls);