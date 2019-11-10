/**
 * @typedef {Object} GuessingCanvasState
 * @property {DrawnLine[]} newLines
 */

export const actionTypes = {
    DRAWING_UPDATED: 'guessingCanvas/drawingUpdated',
    NEW_LINES_PROCESSED: 'guessingCanvas/newLinesProcessed',
};

/**
 * @param {GuessingCanvasState} state
 * @returns {*}
 */
function _getStateCopy(state) {
    return state ? {
        newLines: state.newLines,
    } : {
        newLines: [],
    };
}

/**
 * @param {GuessingCanvasState} state
 * @param {DrawnLine[]} payload The new lines received since the last action
 * @private
 */
function _drawingUpdated(state, payload) {
    state.newLines = [...state.newLines, ...payload];
}

/**
 * @param {GuessingCanvasState} state
 * @param {int} payload The number of drawn lines just displayed
 * @private
 */
function _newLinesProcessed(state, payload) {
    state.newLines = state.newLines.slice(payload)
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
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}