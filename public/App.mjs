import HostAndClient from './connection/HostAndClient.mjs';
const {BrowserRouter, Switch, Route, Redirect, Link} = window.ReactRouterDOM;

class App extends React.Component {
    constructor(props) {
        super(props);
    }

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
                    React.createElement(Route, {path: '/', component: () => React.createElement(HostAndClient, {messages: this.props.messages, addMessage: this.props.addMessage})}),
                    React.createElement(Redirect, {path: '*', to: {...window.history, pathname: "/"}}),
                )
            )
        );
    }
}

export default App;