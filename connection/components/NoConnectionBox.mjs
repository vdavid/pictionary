import React from "../../web_modules/react.js";
import {useSelector, useDispatch} from "../../web_modules/react-redux.js";

import {actionCreators as connectionActionCreators} from '../store.mjs';
import {connectionListenerStatus} from '../connection-listener-status.mjs';

export const NoConnectionBox = () => {
    const dispatch = useDispatch();

    const currentConnectionListenerStatus = useSelector(state => state.connection.connectionListenerStatus);
    const isConnecting = [connectionListenerStatus.shouldConnectToPeerServer, connectionListenerStatus.connectingToPeerServer].includes(currentConnectionListenerStatus);

    return React.createElement('div', {},
        React.createElement('div', {className: 'fullScreenSemiTransparentCover'}),
        React.createElement('div', {id: 'noConnectionBox', className: 'midScreenBox'},
            React.createElement('div', {}, 'Game needs an internet connection, but none was found.'),
            isConnecting ? React.createElement('div', {className: 'progressIndicator'}) : null,
            React.createElement('button', {
                onClick: () => dispatch(connectionActionCreators.createTryReconnectingToPeerServerRequest()),
                disabled: isConnecting,
            }, 'Try again'),
        ),
    );
};