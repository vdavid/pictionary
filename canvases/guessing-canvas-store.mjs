/**
 * @typedef {Object} GuessingCanvasState
 * @property {DrawnLine[]} newLines
 * @property {int} lineCount
 */

export const actionTypes = {
    UPDATE_CANVAS_REQUEST: 'guessingCanvas/UPDATE_CANVAS_REQUEST',
    UPDATE_CANVAS_SUCCESS: 'guessingCanvas/UPDATE_CANVAS_SUCCESS',
    CLEAR_REQUEST: 'guessingCanvas/CLEAR_REQUEST',
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

export const actionCreators = {
    createUpdateCanvasRequest: (newLines) => ({type: actionTypes.UPDATE_CANVAS_REQUEST, payload: newLines}),
    createUpdateCanvasSuccess: (numberOfNewLines) => ({type: actionTypes.UPDATE_CANVAS_SUCCESS, payload: numberOfNewLines}),
    createClearRequest: () => ({type: actionTypes.CLEAR_REQUEST}),
};


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
        [actionTypes.UPDATE_CANVAS_REQUEST]: _drawingUpdated,
        [actionTypes.UPDATE_CANVAS_SUCCESS]: _newLinesProcessed,
        [actionTypes.CLEAR_REQUEST]: _setLineCountToZero,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}