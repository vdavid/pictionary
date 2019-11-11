/**
 * @typedef {Object} GuessingCanvasState
 * @property {DrawnLine[]} newLines
 * @property {int} lineCount
 */

export const actionTypes = {
    DRAWING_UPDATED: 'guessingCanvas/drawingUpdated',
    NEW_LINES_PROCESSED: 'guessingCanvas/newLinesProcessed',
    CLEARING_NEEDED: 'drawingCanvas/clearingNeeded',
};

/**
 * @param {GuessingCanvasState} state
 * @returns {GuessingCanvasState}
 */
function _getStateCopy(state) {
    return state ? {
        lineCount: state.lineCount,
        newLines: state.newLines,
    } : {
        lineCount: 0,
        newLines: [],
    };
}

/**
 * @param {GuessingCanvasState} state
 * @param {DrawnLine[]} newLines The new lines received since the last action
 */
function _drawingUpdated(state, newLines) {
    state.lineCount += newLines.length;
    state.newLines = [...state.newLines, ...newLines];
}

/**
 * @param {GuessingCanvasState} state
 * @param {int} payload The number of drawn lines just displayed
 */
function _newLinesProcessed(state, payload) {
    state.newLines = state.newLines.slice(payload);
}

function _setLineCountToZero(state) {
    state.lineCount = 0;
    state.newLines = [];
}

/**
 * @param {GuessingCanvasState} state
 * @param {{type: string, payload: *}} action
 * @return {GuessingCanvasState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.DRAWING_UPDATED]: _drawingUpdated,
        [actionTypes.NEW_LINES_PROCESSED]: _newLinesProcessed,
        [actionTypes.CLEARING_NEEDED]: _setLineCountToZero,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}