import React from "../../web_modules/react.js";
import {BrowserRouter, Switch, Route, Redirect, Link} from "../../web_modules/react-router-dom.js";
import {GamePage} from '../../game/components/GamePage.mjs';
import PeerConnector from '../../connection/components/PeerConnector.mjs';
import {ConnectionStatusIndicator} from '../../connection/components/ConnectionStatusIndicator.mjs';

export function App() {
    return React.createElement(BrowserRouter, {basename: '/'},
        React.createElement('header', {},
            React.createElement('div', {className: 'logo'}),
            React.createElement('nav', {},
                React.createElement('ul', {},
                    React.createElement('li', {},
                        React.createElement(Link, {to: '/'}, 'Home'),
                        React.createElement(Link, {to: '/about'}, 'About'),
                    )
                )
            ),
            React.createElement(ConnectionStatusIndicator),
        ),
        React.createElement('main', null,
            React.createElement(Switch, null,
                React.createElement(Route, {path: '/about', component: () => React.createElement('h2', {}, 'Hello')}),
                React.createElement(Route, {path: '/', component: () => React.createElement(GamePage)}),
                React.createElement(Redirect, {path: '*', to: {...window.history, pathname: '/'}}),
            ),
        ),
        React.createElement('footer', null, React.createElement('span', {className: 'copyright'}, 'Made with ❤️ by David')),
        React.createElement(PeerConnector),
    );
}
