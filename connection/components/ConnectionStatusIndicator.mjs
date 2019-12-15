import {connectionListenerStatus as statuses} from '../connection-listener-status.mjs';

const React = window.React;
const {useSelector} = window.ReactRedux;

export const ConnectionStatusIndicator = () => {
    const hostPeerId = useSelector(state => state.connection.hostPeerId);
    const currentStatus = useSelector(state => state.connection.connectionListenerStatus);
    const {statusText, color} = _getStatusTextAndColor(hostPeerId, currentStatus);
    return React.createElement('section', {id: 'connectionSection'},
        React.createElement('div', {}, statusText),
        React.createElement('div', {className: 'indicatorLight' + ' ' + color}),
    );

    function _getStatusTextAndColor(hostPeerId, currentStatus) {
        const connectionListenerStatusToStatusTextAndColorMap = {
            [statuses.notConnectedToPeerServer]: {statusText: 'Not accepting connections.', color: 'red'},
            [statuses.shouldConnectToPeerServer]: {statusText: 'Starting connecting to server...', color: 'yellow'},
            [statuses.connectingToPeerServer]: {statusText: 'Connecting to server...', color: 'yellow'},
            [statuses.listeningForConnections]: {statusText: 'Awaiting connection.', color: 'green'},
            [statuses.shouldConnectToHost]: {statusText: 'Starting connecting to ' + hostPeerId + '...', color: 'yellow'},
            [statuses.connectingToHost]: {statusText: 'Connecting to ' + hostPeerId + '...', color: 'yellow'},
            [statuses.connectedToHost]: {statusText: 'Connected. Game ID: ' + hostPeerId + '.', color: 'green'},
            [statuses.shouldDisconnectFromPeerServer]: {statusText: 'Starting disconnecting...', color: 'yellow'},
            [statuses.disconnectingFromPeerServer]: {statusText: 'Disconnecting...', color: 'yellow'},
        };
        return connectionListenerStatusToStatusTextAndColorMap[currentStatus];
    }
};