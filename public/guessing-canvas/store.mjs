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
 * @param {{type: string, payload: *}} action
 * @return {GuessingCanvasState}
 */
export function reducer(state, action) {
    const newState = _getStateCopy(state);

    if (action.type === actionTypes.DRAWING_UPDATED) { /* Payload: {DrawnLine[]} The new lines received since the last action */
        newState.newLines = [...state.newLines, ...action.payload];
    } else if (action.type === actionTypes.NEW_LINES_PROCESSED) { /* Payload: {int} The number of drawn lines just displayed} */
        newState.newLines = state.newLines.slice(action.payload)
    }

    return newState;
}