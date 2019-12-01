/**
 * @typedef {Object} DrawnLine
 * @property {int} x1
 * @property {int} y1
 * @property {int} x2
 * @property {int} y2
 * @property {string} color
 */
/**
 * @typedef {Object} DrawingCanvasState
 * @property {int} lineCount
 */

export const actionTypes = {
    SEND_NEW_LINES_TO_GUESSERS_REQUEST: 'drawingCanvas/SEND_NEW_LINES_TO_GUESSERS_REQUEST',
    SEND_NEW_LINES_TO_GUESSERS_SUCCESS: 'drawingCanvas/SEND_NEW_LINES_TO_GUESSERS_SUCCESS',
    CLEAR_REQUEST: 'drawingCanvas/CLEAR_REQUEST',
};

/**
 * @param {DrawingCanvasState} state
 * @returns {DrawingCanvasState}
 */
function _getStateCopy(state) {
    return state ? {
        lineCount: state.lineCount,
    } : {
        lineCount: 0,
    };
}

export const actionCreators = {
    createSendNewLinesToGuessersRequest: (newLines) => ({type: actionTypes.SEND_NEW_LINES_TO_GUESSERS_REQUEST, payload: newLines}),
    createSendNewLinesToGuessersSuccess: (numberOfNewLines) => ({type: actionTypes.SEND_NEW_LINES_TO_GUESSERS_SUCCESS, payload: numberOfNewLines}),
    createClearRequest: () => ({type: actionTypes.CLEAR_REQUEST}),
};

/**
 * @param {DrawingCanvasState} state
 * @param {DrawnLine[]} newLines The new lines drawn since the last action
 */
function _increaseLineCount(state, newLines) {
    state.lineCount += newLines.length;
}

/**
 * @param {DrawingCanvasState} state
 */
function _setLineCountToZero(state) {
    state.lineCount = 0;
}

/**
 * @param {DrawingCanvasState} state
 * @param {{type: string, payload: *, error: boolean?, meta: *?}} action
 * @return {DrawingCanvasState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.SEND_NEW_LINES_TO_GUESSERS_REQUEST]: _increaseLineCount,
        [actionTypes.CLEAR_REQUEST]: _setLineCountToZero,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}