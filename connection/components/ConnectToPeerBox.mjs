import React, {useState} from "../../web_modules/react.js";
import {useSelector, useDispatch} from "../../web_modules/react-redux.js";
import {actionCreators as connectionActionCreators} from '../store.mjs';
import {connectionListenerStatus} from '../connection-listener-status.mjs';

export const ConnectToPeerBox = () => {
    const [remotePeerId, setRemotePeerId] = useState('');
    const dispatch = useDispatch();

    const isConnectingToHost = useSelector(state => state.connection.connectionListenerStatus === connectionListenerStatus.connectingToHost);
    const isConnectedToAnyPeers = useSelector(state => state.connection.connections.length > 0);

    const connectToHost = hostPeerId => dispatch(connectionActionCreators.createConnectToHostRequest(hostPeerId));

    return React.createElement('div', {className: 'connectToPeerBox'},
        React.createElement('p', {}, 'Enter your friend\'s ID here:'),
        React.createElement('input', {
            className: 'hostPeerId',
            title: 'Input the ID.',
            value: remotePeerId,
            disabled: isConnectingToHost || isConnectedToAnyPeers,
            maxLength: 6,
            autoCapitalize: 'none',
            autocompletetype: 'off',
            onChange: event => setRemotePeerId(event.target.value.toLowerCase()),
            onKeyUp: (event) => event.keyCode === 13 ? connectToHost(remotePeerId) : null,
        }),
        React.createElement('button', {
            className: 'connectButton',
            onClick: () => connectToHost(remotePeerId),
            disabled: isConnectingToHost || isConnectedToAnyPeers || !remotePeerId,
        }, 'Connect'),
    );
};