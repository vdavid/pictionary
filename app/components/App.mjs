
const {connect} = window.ReactRedux;
import GamePage from './GamePage.mjs';
import ConnectionStatus from '../../connection/components/ConnectionStatus.mjs';
import {loadPlayerName} from '../localStoragePersistence.mjs';
import RandomNameGenerator from '../../player/RandomNameGenerator.mjs';
import {actionCreators as gameActionCreators} from '../../game/store.mjs';

const {BrowserRouter, Switch, Route, Redirect, Link} = window.ReactRouterDOM;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.props.initializePlayerName();
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
                React.createElement(ConnectionStatus),
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

/**
 * @param {State} state
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {
        initializePlayerName: () => {
            const playerNameFromLocalStorage = loadPlayerName();
            const playerName = playerNameFromLocalStorage || (new RandomNameGenerator()).getRandomName();
            dispatch(gameActionCreators.createUpdateLocalPlayerNameRequest(playerName));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);