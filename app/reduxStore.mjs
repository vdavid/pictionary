const {Redux, __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: reduxDevToolsCompose} = window;
import {throttle} from './utils.mjs';
import {reducer as appReducer} from './store.mjs';
import {reducer as connectionReducer} from '../connection/store.mjs';
import {reducer as chatReducer} from '../chat/store.mjs';
import {reducer as gameReducer} from '../game/store.mjs';
import {saveState} from './localStoragePersistence.mjs';

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

/* Save state to local storage every 5 minutes */
store.subscribe(throttle(() => saveState(store.getState()), 5000));

export default store;