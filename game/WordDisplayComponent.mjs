const React = window.React;
const {connect} = window.ReactRedux;
import {actionTypes as gameActionTypes} from './store.mjs';
import {getRandomPhrase} from '../data/phrases.mjs';

class WordDisplayComponent extends React.Component {
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
        return React.createElement('section', {id: 'wordDisplaySection'},
            React.createElement('span', {}, this._getContentText())
        );
    }

    _getContentText() {
        if (!this.props.isRoundStarted) {
            return '';
        } else if (this.props.whichPlayerDraws === 'local') {
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

export default connect(mapStateToProps, mapDispatchToProps)(WordDisplayComponent);