import {actionTypes as gameActionTypes} from './store.mjs';

const {connect} = window.ReactRedux;

class RoundStartingBox extends React.Component {
    constructor(props) {
        super(props);
        this._updateSecondsRemaining = this._updateSecondsRemaining.bind(this);
        this._timeIsUp = this._timeIsUp.bind(this);

        this.state = {secondsRemaining: Math.ceil(this.props.durationInMilliseconds / 1000)};
    }

    componentDidMount() {
        this._intervalTimer = setInterval(this._updateSecondsRemaining, 1000);
        setTimeout(this._timeIsUp, this.props.durationInMilliseconds);
    }

    componentWillUnmount() {
        clearInterval(this._intervalTimer);
    }

    /**
     * @private
     */
    _updateSecondsRemaining() {
        this.setState({secondsRemaining: this.state.secondsRemaining - 1});
    }

    render() {
        return React.createElement('div', {},
            React.createElement('div', {className: 'fullScreenSemiTransparentCover'}),
            React.createElement('div', {id: 'gameStartingBox'},
                React.createElement('p', {}, 'Game is starting in'),
                React.createElement('div', {className: 'timer'}, this.state.secondsRemaining),
            ),
        );
    }

    _timeIsUp() {
        clearInterval(this._intervalTimer);
        this.props.startGame();
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {
        startGame: () => {
            dispatch({type: gameActionTypes.ROUND_STARTED});
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RoundStartingBox);