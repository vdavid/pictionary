import {applyMiddleware, combineReducers, compose, createStore} from "../web_modules/redux.js";
import {getConfig} from "./config.mjs";
import ConsoleLogger from "./ConsoleLogger.mjs";

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

const {__REDUX_DEVTOOLS_EXTENSION_COMPOSE__: reduxDevToolsCompose} = window;
const config = getConfig();
const logger = new ConsoleLogger({minimumLogLevel: config.minimumLogLevel})

const combinedReducer = combineReducers({
    app: appReducer,
    chat: chatReducer,
    connection: connectionReducer,
    game: gameReducer,
});

// noinspection JSUnresolvedVariable
if (reduxDevToolsCompose) {
    logger.info('Redux dev tools connected.')
}
const composeEnhancers = reduxDevToolsCompose || compose;

const store = createStore(combinedReducer, composeEnhancers(applyMiddleware()));

export default store;