const {Redux, __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: reduxDevToolsCompose} = window;
import {reducer as appReducer} from './store.mjs';
import {reducer as connectionReducer} from '../connection/store.mjs';
import {reducer as chatReducer} from '../chat/store.mjs';
import {reducer as gameReducer} from '../game/store.mjs';

/**
 * @typedef {Object} State
 * @property {AppState} app
 * @property {ConnectionState} connection
 * @property {ChatState} chat
 * @property {GameState} game
 */

const combinedReducer = Redux.combineReducers({
    app: appReducer,
    chat: chatReducer,
    connection: connectionReducer,
    game: gameReducer,
});

// noinspection JSUnresolvedVariable
const composeEnhancers = reduxDevToolsCompose || Redux.compose;

const store = Redux.createStore(combinedReducer, composeEnhancers(Redux.applyMiddleware()));

export default store;