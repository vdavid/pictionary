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
    return {
        isRoundStarted: state.game.isRoundStarted,
        isLocalPlayerDrawing: state.game.drawerPeerId === state.game.localPlayer.peerId,
        activePhrase: state.game.activePhrase,
        isRoundSolved: state.game.isRoundSolved,
    };
}

export default connect(mapStateToProps)(WordDisplay);