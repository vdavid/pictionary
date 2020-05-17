import React, {StrictMode} from "../web_modules/react.js";
import ReactDOM from "../web_modules/react-dom.js";
import {Provider} from "../web_modules/react-redux.js";
import {createMuiTheme, MuiThemeProvider} from "../web_modules/@material-ui/core.js";
import {App} from './components/App.mjs';
import siteTheme from './theme.mjs';
import store from './reduxStore.mjs';

const theme = createMuiTheme(siteTheme);

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