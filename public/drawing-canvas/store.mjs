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
    DRAWING_UPDATED: 'drawingCanvas/drawingUpdated',
    NEW_LINES_PROCESSED: 'drawingCanvas/newLinesProcessed',
    CLEARING_NEEDED: 'drawingCanvas/clearingNeeded',
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
 * @param {{type: string, payload: *}} action
 * @return {DrawingCanvasState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.DRAWING_UPDATED]: _increaseLineCount,
        [actionTypes.CLEARING_NEEDED]: _setLineCountToZero,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}