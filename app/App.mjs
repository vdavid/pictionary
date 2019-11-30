const React = window.React;
import GamePage from './GamePage.mjs';

const {BrowserRouter, Switch, Route, Redirect, Link} = window.ReactRouterDOM;

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
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
            ),
            React.createElement('main', null,
                React.createElement(Switch, null,
                    React.createElement(Route, {path: '/about', component: () => React.createElement('h2', {}, 'Hello')}),
                    React.createElement(Route, {path: '/', component: () => React.createElement(GamePage, {messages: this.props.messages, addMessage: this.props.addMessage})}),
                    React.createElement(Redirect, {path: '*', to: {...window.history, pathname: '/'}}),
                ),
            ),
            React.createElement('footer', null, React.createElement('span', {className: 'copyright'}, 'Made with ❤️ by David')),
        );
    }
}

export default App;