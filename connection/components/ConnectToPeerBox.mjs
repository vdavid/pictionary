import {actionCreators as connectionActionCreators} from '../store.mjs';

const React = window.React;
const {useState} = window.React;
const {useSelector, useDispatch} = window.ReactRedux;

export const ConnectToPeerBox = () => {
    const dispatch = useDispatch();
    const [remotePeerId, setRemotePeerId] = useState('');
    const isConnectingToHost = useSelector(state => state.connection.isConnectingToHost);
    const isConnectedToAnyPeers = useSelector(state => state.connection.isConnectedToAnyPeers);
    const connectToHost = (hostPeerId) => dispatch(connectionActionCreators.createConnectToHostRequest(hostPeerId));

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