import React from "../../web_modules/react.js";
import {useSelector, useDispatch} from "../../web_modules/react-redux.js";
import {actionCreators as appActionCreators} from '../../app/store.mjs';

function isRequestFullscreenSupported() {
    const root = document.documentElement;
    // noinspection JSUnresolvedVariable
    return (root.requestFullscreen || root.webkitRequestFullscreen || root.mozRequestFullscreen || root.msRequestFullscreen);
}

function requestFullscreen() {
    const root = document.documentElement;
    // noinspection JSUnresolvedVariable,JSUnresolvedFunction
    return root.requestFullscreen ? root.requestFullscreen()
        : (root.webkitRequestFullscreen ? root.webkitRequestFullscreen()
            : (root.mozRequestFullscreen ? root.mozRequestFullscreen() : root.msRequestFullscreen()));
}

function isExitFullscreenSupported() {
    // noinspection JSUnresolvedVariable
    return (document.exitFullscreen || document.webkitExitFullscreen || document.mozExitFullscreen || document.msExitFullscreen);
}

function exitFullscreen() {
    // noinspection JSUnresolvedVariable,JSUnresolvedFunction
    return document.exitFullscreen ? document.exitFullscreen()
        : (document.webkitExitFullscreen ? document.webkitExitFullscreen()
            : (document.mozExitFullscreen ? document.mozExitFullscreen() : document.msExitFullscreen()));
}

export const FullscreenButton = () => {
    const dispatch = useDispatch();

    const isFullscreen = useSelector(state => state.app.isFullscreen);

    function enableFullscreen() {
        if (isRequestFullscreenSupported) {
            const result = requestFullscreen();
            if (result && typeof result.then === 'function') {
                result.then(() => changeFullscreen(true));
            } else {
                changeFullscreen(true);
            }
        }
    }

    function disableFullscreen() {
        if (isExitFullscreenSupported) {
            const result = exitFullscreen();
            if (result && typeof result.then === 'function') {
                result.then(() => changeFullscreen(false));
            } else {
                changeFullscreen(false);
            }
        }
    }

    function changeFullscreen(isFullscreen) {
        dispatch(appActionCreators.createSetFullscreenStateRequest(isFullscreen));
    }

    return !isFullscreen
        ? React.createElement('button', {className: 'fullscreenButton', title: 'Full screen', onClick: enableFullscreen}, '↗')
        : React.createElement('button', {className: 'fullscreenButton', title: 'Exit full screen', onClick: disableFullscreen}, '↙');
};
