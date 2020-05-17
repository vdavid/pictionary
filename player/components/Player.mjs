import React from "../../web_modules/react.js";
import {Avatar} from './Avatar.mjs';

export const Player = ({isHost, isLocal, name, score}) => {
    return React.createElement('li', {className: [isHost ? 'host' : '', isLocal ? 'local' : ''].join(' ').trim()},
        React.createElement(Avatar, {name, size: 40}),
        React.createElement('span', {className: 'name'}, name),
        React.createElement('span', {className: 'score'}, score),
    );
};