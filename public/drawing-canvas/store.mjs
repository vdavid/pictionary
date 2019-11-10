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
 */

export const actionTypes = {
    DRAWING_UPDATED: 'drawingCanvas/drawingUpdated',
    NEW_LINES_PROCESSED: 'drawingCanvas/newLinesProcessed',
};

/**
 * @param {DrawingCanvasState} state
 * @param {{type: string, payload: *}} action
 * @return {DrawingCanvasState}
 */
export function reducer(state, action) {
    /** @type {DrawingCanvasState} */
    return {};
}