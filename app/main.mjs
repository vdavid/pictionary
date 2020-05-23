import React, {StrictMode} from "../web_modules/react.js";
import ReactDOM from "../web_modules/react-dom.js";
import {getConfig} from './config.mjs';
import {Provider as ReduxProvider} from "../web_modules/react-redux.js";
import {createMuiTheme, MuiThemeProvider} from "../web_modules/@material-ui/core.js";
import {App} from './components/App.mjs';
import siteTheme from './theme.mjs';
import store from './reduxStore.mjs';
import ConfigProvider from "./components/ConfigProvider.mjs";
import LoggerProvider from "./components/LoggerProvider.mjs";

const theme = createMuiTheme(siteTheme);
const config = getConfig();

ReactDOM.render(
    React.createElement(ConfigProvider, {config},
        React.createElement(LoggerProvider, {minimumLogLevel: config.minimumLogLevel},
            React.createElement(ReduxProvider, {store},
                React.createElement(MuiThemeProvider, {theme},
                    React.createElement(StrictMode, {},
                        React.createElement(App),
                    ),
                ),
            ),
        ),
    ),
    document.getElementById('app')
);