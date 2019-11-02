import HostAndClient from './HostAndClient.mjs';
const {BrowserRouter, Switch, Route, Redirect, Link} = window.ReactRouterDOM;
const {connect} = window.ReactRedux;

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

function mapStateToProps(state) {
    return {
        messages: state.messages,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        addMessage: message => {
            dispatch({type: 'addMessage', payload: message});
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);