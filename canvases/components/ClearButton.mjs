import {actionCreators as gameActionCreators} from '../../game/store.mjs';
import {actionCreators as chatActionCreators} from '../../chat/store.mjs';

const {useDispatch} = window.ReactRedux;

export const ClearButton = () => {
    const dispatch = useDispatch();

    return React.createElement('button', {
        className: 'clearButton',
        onClick: () => {
            dispatch(gameActionCreators.createClearRequest([]));
            dispatch(chatActionCreators.createNoteCanvasWasClearedRequest(true));
        }
    }, 'Clear');
};
