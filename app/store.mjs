/**
 * @typedef {Object} AppState
 * @property {boolean} isFullscreen
 * @property {int} debugLevel
 */
export const actionTypes = {
    SET_FULLSCREEN_STATE_REQUEST: 'game/SET_FULLSCREEN_STATE_REQUEST',
};

/**
 * @param {AppState} state
 * @returns {AppState}
 */
function _getStateCopy(state) {
    return state ? {
        isFullscreen: state.isFullscreen,
        debugLevel: state.debugLevel,
    } : {
        isFullscreen: false,
        debugLevel: window.location.href.startsWith('http://localhost') ? 3 : 1,
    };
}

export const actionCreators = {
    createSetFullscreenStateRequest: (isFullscreen) => ({type: actionTypes.SET_FULLSCREEN_STATE_REQUEST, payload: isFullscreen}),
};

/**
 * @param {AppState} state
 * @param {{type: string, payload: *, error: boolean?, meta: *?}} action
 * @return {AppState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
       [actionTypes.SET_FULLSCREEN_STATE_REQUEST]: _setIsFullscreen,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}

/**
 * @param {AppState} state
 * @param {boolean} isFullscreen
 */
function _setIsFullscreen(state, isFullscreen) {
    state.isFullscreen = isFullscreen;
}
