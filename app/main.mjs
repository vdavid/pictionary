import React, {StrictMode} from "../web_modules/react.js";
import ReactDOM from "../web_modules/react-dom.js";
import {config, developmentConfig, stagingConfig, productionConfig} from './config.mjs';
import {Provider} from "../web_modules/react-redux.js";
import {createMuiTheme, MuiThemeProvider} from "../web_modules/@material-ui/core.js";
import {App} from './components/App.mjs';
import siteTheme from './theme.mjs';
import store from './reduxStore.mjs';
import ConfigProvider from "./components/ConfigProvider.mjs";
import LoggerProvider from "./components/LoggerProvider.mjs";

const theme = createMuiTheme(siteTheme);

/**
 * Moves keys from environment-specific configs to common config.
 * This should be done at the very beginning of the app code (which is here).
 */
function initializeConfig() {
    const environmentSpecificConfig = window.location.host.startsWith('pictionary.eu')
        ? productionConfig
        : (window.location.host.startsWith('staging.pictionary.eu') ? stagingConfig : developmentConfig);
    config.environment = environmentSpecificConfig.environment;
    config.baseUrl = environmentSpecificConfig.baseUrl;
    config.minimumLogLevel = environmentSpecificConfig.minimumLogLevel;
    config.peerJs = environmentSpecificConfig.peerJs;
}

initializeConfig();

ReactDOM.render(
    React.createElement(ConfigProvider, {config},
        React.createElement(LoggerProvider, {minimumLogLevel: config.minimumLogLevel},
            React.createElement(MuiThemeProvider, {theme},
                React.createElement(Provider, {store},
                    React.createElement(StrictMode, {},
                        React.createElement(App),
                    ),
                ),
            ),
        ),
    ),
    document.getElementById('app')
);