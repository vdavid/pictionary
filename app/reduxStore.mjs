const {Redux} = window;
import socketMiddleware from '../connection/socketMiddleware.mjs';
import {reducer as connectionReducer} from '../connection/store.mjs';
import {reducer as chatReducer} from '../chat/store.mjs';
import {reducer as gameReducer} from '../game/store.mjs';
import {reducer as drawingCanvasReducer} from '../canvases/drawing-canvas-store.mjs';
import {reducer as guessingCanvasReducer} from '../canvases/guessing-canvas-store.mjs';

/**
 * @typedef {Object} State
 * @property {ConnectionState} connection
 * @property {ChatState} chat
 * @property {GameState} game
 * @property {DrawingCanvasState} drawingCanvas
 * @property {GuessingCanvasState} guessingCanvas
 */

const combinedReducer = Redux.combineReducers({
    chat: chatReducer,
    connection: connectionReducer,
    game: gameReducer,
    drawingCanvas: drawingCanvasReducer,
    guessingCanvas: guessingCanvasReducer,
});

// noinspection JSUnresolvedVariable
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;

export default Redux.createStore(combinedReducer, composeEnhancers(Redux.applyMiddleware(socketMiddleware)));