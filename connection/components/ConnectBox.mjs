import {PlayerNameBox} from '../../player/components/PlayerNameBox.mjs';
import {HostConnectionBox} from './HostConnectionBox.mjs';
import {ConnectToPeerBox} from './ConnectToPeerBox.mjs';

export const ConnectBox = () => {
    return React.createElement('div', {},
        React.createElement('div', {className: 'fullScreenSemiTransparentCover'}),
        React.createElement('div', {id: 'connectBox', className: 'midScreenBox'},
            React.createElement('div', {className: 'instructions'}, 'This is a game for two players. One player is to draw a word that appears on the screen. The other player is to figure out what the word is, and type it in to the chat. One game takes 10 minutes.'),
            React.createElement(PlayerNameBox),
            React.createElement('div', {className: 'then'}, React.createElement('span', null, '→ then →')),
            React.createElement(HostConnectionBox),
            React.createElement('div', {className: 'or'}, React.createElement('span', null, 'or')),
            React.createElement(ConnectToPeerBox),
        ),
    );
};
