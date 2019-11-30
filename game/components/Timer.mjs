const React = window.React;
import {actionTypes as gameActionTypes} from '../store.mjs';

const {connect} = window.ReactRedux;

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this._updateSecondsRemaining = this._updateSecondsRemaining.bind(this);
        this._timeIsUp = this._timeIsUp.bind(this);
    }

    componentDidMount() {
        this._startDateTime = new Date();
        this._endDateTime = new Date(this._startDateTime.getTime() + this.props.durationInMilliseconds);
        this._intervalTimer = setInterval(this._updateSecondsRemaining, 1000);
        this._finishTimer = setTimeout(this._timeIsUp, this.props.durationInMilliseconds);
    }

    componentWillUnmount() {
        clearInterval(this._intervalTimer);
        clearInterval(this._finishTimer);
    }

    /**
     * @param {Number} totalSeconds
     * @private
     */
    _formatRemainingTime(totalSeconds) {
        if(totalSeconds !== undefined) {
            const roundedSeconds = Math.round(totalSeconds);
            const minutes = Math.floor(roundedSeconds / 60);
            const seconds = Math.floor(roundedSeconds % 60);
            return minutes + ':' + seconds.toString().padStart(2, '0');
        } else {
            return '';
        }

    }

    render() {
        return React.createElement('div', {className: this.props.secondsRemaining > 5 ? '' : 'overSoon'}, this._formatRemainingTime(this.props.secondsRemaining));
    }

    /**
     * @private
     */
    _updateSecondsRemaining() {
        this.props.updateSecondsRemaining((this._endDateTime.getTime() - (new Date()).getTime()) / 1000);
    }

    /**
     * @private
     */
    _timeIsUp() {
        this.props.timeIsUp();
        clearInterval(this._intervalTimer);
    }
}

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        secondsRemaining: state.game.secondsRemaining,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateSecondsRemaining: seconds => {
            dispatch({type: gameActionTypes.UPDATE_SECONDS_REMAINING, payload: seconds});
        },
        timeIsUp: () => {
            dispatch({type: gameActionTypes.TIME_IS_UP});
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Timer);