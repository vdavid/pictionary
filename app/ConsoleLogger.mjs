export default class ConsoleLogger {
    /**
     * @param {string} logLevel Lowest log level to display. Default: "warning"
     */
    constructor({minimumLogLevel = 'warning'}) {
        this._minimumLogLevel = minimumLogLevel;
        this._logLevelsToSeverityMap = {
            emergency: 0, /* Emergency: system is unusable */
            alert: 1,     /* Alert: action must be taken immediately */
            critical: 2,  /* Critical: critical conditions */
            error: 3,     /* Error: error conditions */
            warning: 4,   /* Warning: warning conditions */
            notice: 5,    /* Notice: normal but significant condition */
            info: 6,      /* Informational: informational messages */
            debug: 7,     /* Debug: debug-level messages */
        };
        this._logLevelToColorMap = {
            emergency: 'red',
            alert: 'yellow',
            critical: 'red',
            error: 'red',
            warning: 'red',
            notice: 'yellow',
            info: 'green',
            debug: 'blue'
        };
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Meaning: All available resources are needed to immediately solve a problem.
     * @param {string} message
     * @param {...*?} metadata
     */
    emergency(message, ...metadata) {
        this.log('emergency', message, ...metadata);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Meaning: A very severe error occurred, needs immediate attention.
     * @param {string} message
     * @param {...*?} metadata
     */
    alert(message, ...metadata) {
        this.log('alert', message, ...metadata);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Meaning: A severe error occurred, it should be handled with high priority.
     * @param {string} message
     * @param {...*?} metadata
     */
    critical(message, ...metadata) {
        this.log('critical', message, ...metadata);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Meaning: An error was encountered in the software, it needs attention.
     * @param {string} message
     * @param {...*?} metadata
     */
    error(message, ...metadata) {
        this.log('error', message, ...metadata);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Meaning: A problem occurred but it was handled, no action is needed.
     * @param {string} message
     * @param {...*?} metadata
     */
    warning(message, ...metadata) {
        this.log('warning', message, ...metadata);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Meaning: Something out of the ordinary happened, which was not a problem.
     * @param {string} message
     * @param {...*?} metadata
     */
    notice(message, ...metadata) {
        this.log('notice', message, ...metadata);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Meaning: Something remarkable happened in the standard flow of things.
     * @param {string} message
     * @param {...*?} metadata
     */
    info(message, ...metadata) {
        this.log('info', message, ...metadata);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Meaning: Only for very low level debugging purposes
     * @param {string} message
     * @param {...*?} metadata
     */
    debug(message, ...metadata) {
        this.log('debug', message, ...metadata);
    }

    /**
     * @param {string} level
     * @param {string} message
     * @param {...*?} metadata
     */
    log(level, message, ...metadata) {
        if (this._isHigherOrEqualSeverityThanMinimumLogLevel) {
            const color = this._logLevelToColorMap[level];
            console.log(this._formatTimestamp() + ' | %c'  + level + '%c | ' + message, `color: ${color}`, 'color:auto');
            metadata.forEach(pieceOfMetadata => console.log(pieceOfMetadata));
        }
    }

    _isHigherOrEqualSeverityThanMinimumLogLevel(level) {
        return this._logLevelsToSeverityMap[level] <= this._logLevelsToSeverityMap[this._minimumLogLevel];
    }

    /**
     * @return {string} now(), formatted
     */
    _formatTimestamp() {
        return new Date().toISOString();
    }
}
