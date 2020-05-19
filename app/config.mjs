export const config = {
    environment: '', // Will be set to 'development', 'staging', or 'production' by main.mjs
    baseUrl: '', // Will be set by main.mjs. E.g. "https://pictionary.eu". Will not contain a slash at the end.
    minimumLogLevel: '', // Will be set to a valid value (e.g. "error") by main.mjs
    game: {
        roundCountdownLengthInSeconds: 3,
        roundLengthInSeconds: 60,
        timeExtensionInSeconds: 120,
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

export const productionConfig = {
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

export const stagingConfig = {
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

export const developmentConfig = {
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
