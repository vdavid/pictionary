const {Redux} = window;
import {throttle} from './utils.mjs';
import socketMiddleware from '../connection/socketMiddleware.mjs';
import {reducer as connectionReducer} from '../connection/store.mjs';
import {reducer as chatReducer} from '../chat/store.mjs';
import {reducer as gameReducer} from '../game/store.mjs';
import {reducer as playerReducer} from '../player/store.mjs';
import {reducer as drawingCanvasReducer} from '../canvases/drawing-canvas-store.mjs';
import {reducer as guessingCanvasReducer} from '../canvases/guessing-canvas-store.mjs';
import {saveState} from './localStoragePersistence.mjs';

/**
 * @typedef {Object} State
 * @property {ConnectionState} connection
 * @property {ChatState} chat
 * @property {GameState} game
 * @property {PlayerState} players
 * @property {DrawingCanvasState} drawingCanvas
 * @property {GuessingCanvasState} guessingCanvas
 */

const combinedReducer = Redux.combineReducers({
    chat: chatReducer,
    connection: connectionReducer,
    game: gameReducer,
    players: playerReducer,
    drawingCanvas: drawingCanvasReducer,
    guessingCanvas: guessingCanvasReducer,
});

// noinspection JSUnresolvedVariable
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;

const store = Redux.createStore(combinedReducer, composeEnhancers(Redux.applyMiddleware(socketMiddleware)));

/* Save state to local storage every 5 minutes */
store.subscribe(throttle(() => saveState(store.getState()), 5000));

export default store;