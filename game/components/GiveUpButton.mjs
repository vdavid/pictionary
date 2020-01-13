import {actionCreators as gameActionCreators} from '../store.mjs';
import {actionCreators as chatActionCreators} from '../../chat/store.mjs';

const {useSelector, useDispatch} = window.ReactRedux;

export const GiveUpButton = () => {
    const dispatch = useDispatch();

    const phrase = useSelector(state => ((state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []}).phrase);

    return React.createElement('button', {
        className: 'giveUpButton',
        onClick: () => {
            dispatch(gameActionCreators.createMarkRoundEndedRequest(phrase, null, new Date().toISOString()));
            dispatch(chatActionCreators.createSendRoundEndedRequest(null, null, null, null, phrase));
        }
    }, 'Give up');
};
