import GiveUpButton from '../../game/components/GiveUpButton.mjs';
import ClearButton from './ClearButton.mjs';

const {connect} = window.ReactRedux;

class DrawingButtonBar extends React.Component {
    render() {
        return React.createElement('section', {id: 'drawingButtonBar'},
            React.createElement(ClearButton),
            this.props.isRoundBaseTimeElapsed ? React.createElement(GiveUpButton) : null,
        );
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    const latestRound = (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []};
    return {
        isRoundBaseTimeElapsed: latestRound.isRoundBaseTimeElapsed,
    };
}

export default connect(mapStateToProps)(DrawingButtonBar);