const {connect} = window.ReactRedux;
import {actionCreators as gameActionCreators} from '../../game/store.mjs';
import {actionCreators as chatActionCreators} from '../../chat/store.mjs';

class ClearButton extends React.Component {
    render() {
        return React.createElement('button', {className: 'clearButton', onClick: this.props.clearDrawingCanvas}, 'Clear');
    }
}

function mapDispatchToProps(dispatch) {
    return {
        clearDrawingCanvas: () => {
            dispatch(gameActionCreators.createClearRequest([]));
            dispatch(chatActionCreators.createNoteCanvasWasClearedRequest(true));
        },
    };
}

export default connect(null, mapDispatchToProps)(ClearButton);