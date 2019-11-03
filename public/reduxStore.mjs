const {Redux} = window;
import socketMiddleware from './connection/socketMiddleware.mjs';
import {reducer as connectionReducer} from './connection/store.mjs';
import {reducer as chatReducer} from './chat/store.mjs';

/**
 * @typedef {Object} State
 * @property {ConnectionState} connection
 * @property {ChatState} chat
 */

const combinedReducer = Redux.combineReducers({
    chat: chatReducer,
    connection: connectionReducer,
});

// noinspection JSUnresolvedVariable
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;

export default Redux.createStore(combinedReducer, composeEnhancers(Redux.applyMiddleware(socketMiddleware)));