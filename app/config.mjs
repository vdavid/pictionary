/**
 * @typedef {Object} Config
 * @property {string} environment
 * @property {string} baseUrl
 * @property {Object} game
 * @property {number} game.timeExtensionInSeconds
 * @property {number} game.gameLengthInSeconds
 * @property {number} game.roundLengthInSeconds
 * @property {number} game.checkForNewDrawnLinesIntervalInMilliseconds
 * @property {number} game.roundCountdownLengthInSeconds
 * @property {Object} peerJs
 * @property {string} peerJs.path
 * @property {string} peerJs.hostname
 * @property {number} peerJs.port
 * @property {number} peerJs.pingIntervalMs
 * @property {boolean} peerJs.isSecure
 * @property {string} peerJs.key
 * @property {number} peerJs.debugLevel
 * @property {string} minimumLogLevel
 */

/**
 * Merges keys from environment-specific configs to main config, and returns it.
 *
 * @returns {Config}
 */
export function getConfig() {
    const environmentSpecificConfig = window.location.host.startsWith('pictionary.eu')
        ? productionConfig
        : (window.location.host.startsWith('staging.pictionary.eu') ? stagingConfig : developmentConfig);
    mainConfig.environment = environmentSpecificConfig.environment;
    mainConfig.baseUrl = environmentSpecificConfig.baseUrl;
    mainConfig.minimumLogLevel = environmentSpecificConfig.minimumLogLevel;
    mainConfig.peerJs = environmentSpecificConfig.peerJs;
    return mainConfig;
}

const mainConfig = {
    environment: '', // Will be set to 'development', 'staging', or 'production' by main.mjs
    baseUrl: '', // Will be set by main.mjs. E.g. "https://pictionary.eu". Will not contain a slash at the end.
    minimumLogLevel: '', // Will be set to a valid value (e.g. "error") by main.mjs
    game: {
        roundCountdownLengthInSeconds: 3,
        roundLengthInSeconds: 10,
        timeExtensionInSeconds: 5,
        gameLengthInSeconds: 600,
        checkForNewDrawnLinesIntervalInMilliseconds: 500,
    },
    peerJs: { // Will be set by main.mjs
            hostname: '',
            port: 0,
            pingIntervalMs: 0,
            path: '/', /* Must have a slash at the end */
            isSecure: false,
            debugLevel: 0,
            key: '',
        },
};

const productionConfig = {
    environment: 'production',
    baseUrl: 'https://pictionary.eu',
    minimumLogLevel: 'error',
    peerJs: {
        key: '',
        hostname: '0.peerjs.com',
        port: 443,
        pingIntervalMs: 5000,
        path: '/',
        isSecure: true,
        debugLevel: 0,
    },
};

const stagingConfig = {
    environment: 'staging',
    baseUrl: 'https://staging.pictionary.eu',
    minimumLogLevel: 'info',
    peerJs: {
        key: '',
        hostname: '0.peerjs.com',
        port: 443,
        pingIntervalMs: 5000,
        path: '/',
        isSecure: true,
        debugLevel: 2,
    },
};

const developmentConfig = {
    environment: 'development',
    baseUrl: 'http://localhost:80',
    minimumLogLevel: 'debug',
    peerJs: {
        key: 'eekYaob94AonEPgGosQLPrXXHGQD6Bo',
        hostname: 'localhost',
        port: 9000,
        pingIntervalMs: 5000,
        path: '/',
        isSecure: false,
        debugLevel: 1,
    },
};
