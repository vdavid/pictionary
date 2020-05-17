import React from "../../web_modules/react.js";
import {useSelector} from "../../web_modules/react-redux.js";

export const HostConnectionBox = () => {
    const localPeerId = useSelector(state => state.connection.localPeerId);

    return React.createElement('div', {className: 'hostConnectionBox'},
        React.createElement('p', {}, 'Give this ID to your friend:'),
        React.createElement('div', {className: 'localPeerId', title: 'Copy this ID to the input on send.html.'}, localPeerId),
        React.createElement('p', {}, 'Then wait until they connect.'),
    );
};