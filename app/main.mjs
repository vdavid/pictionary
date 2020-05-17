const ReactDOM = window.ReactDOM;
import {App} from './components/App.mjs';
import store from './reduxStore.mjs';

const {StrictMode} = window.React;

const {Provider} = window.ReactRedux;
import siteTheme from './theme.mjs';

const theme = window.MaterialUI.createMuiTheme(siteTheme);
const {MuiThemeProvider} = window.MaterialUI;

ReactDOM.render(
    React.createElement(MuiThemeProvider, {theme},
        React.createElement(Provider, {store},
            React.createElement(StrictMode, {},
                React.createElement(App),
            ),
        ),
    ),
    document.getElementById('app')
);