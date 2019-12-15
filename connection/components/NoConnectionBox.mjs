import {actionCreators as connectionActionCreators} from '../store.mjs';
import {connectionListenerStatus} from '../connection-listener-status.mjs';

const React = window.React;
const {useSelector, useDispatch} = window.ReactRedux;

export const NoConnectionBox = () => {
    const dispatch = useDispatch();
    const currentConnectionListenerStatus = useSelector(state=>state.connection.connectionListenerStatus);

    function _handleReconnectButtonClick() {
        dispatch(connectionActionCreators.createTryReconnectingToPeerServerRequest());
    }

    const isConnecting = [connectionListenerStatus.shouldConnectToPeerServer, connectionListenerStatus.connectingToPeerServer].includes(currentConnectionListenerStatus);

    return React.createElement('div', {},
        React.createElement('div', {className: 'fullScreenSemiTransparentCover'}),
        React.createElement('div', {id: 'noConnectionBox', className: 'midScreenBox'},
            React.createElement('div', {}, 'Game needs an internet connection, but none was found.'),
            isConnecting ? React.createElement('div', {className: 'progressIndicator'}) : null,
            React.createElement('button', {
                onClick: _handleReconnectButtonClick,
                disabled: isConnecting,
            }, 'Try again'),
        ),
    );
};