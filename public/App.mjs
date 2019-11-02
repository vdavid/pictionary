import HostAndClient from './HostAndClient.mjs';

const {BrowserRouter, Switch, Route, Redirect, Link} = window.ReactRouterDOM;

export default class App extends React.Component {
    render() {
        return React.createElement(BrowserRouter, {basename: '/'},
            React.createElement('div', null,
                React.createElement('nav', {},
                    React.createElement('ul', {},
                        React.createElement('li', {},
                            React.createElement(Link, {to: '/'}, 'Home'),
                            React.createElement(Link, {to: '/about'}, 'About'),
                        )
                    )
                ),
                React.createElement(Switch, null,
                    React.createElement(Route, {path: '/about', component: () => React.createElement('h2', {}, 'Hello')}),
                    React.createElement(Route, {path: '/', component: HostAndClient}),
                    React.createElement(Redirect, {path: '*', to: {...window.history, pathname: "/"}}),
                )
            )
        );
    }
}
