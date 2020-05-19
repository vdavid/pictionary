import React, {createContext, useContext, useRef} from '../../web_modules/react.js';
import ConsoleLogger from '../ConsoleLogger.mjs';

export const LoggerContext = createContext();
export const useLogger = () => useContext(LoggerContext);

/**
 * @param {string} minimumLogLevel
 * @param children
 * @returns {React.ReactElement}
 * @constructor
 */
export default function LoggerProvider({minimumLogLevel, children}) {
    const consoleLoggerRef = useRef(new ConsoleLogger({minimumLogLevel}));

    return React.createElement(LoggerContext.Provider, {'value': {
            emergency: consoleLoggerRef.current.emergency.bind(consoleLoggerRef.current),
            alert: consoleLoggerRef.current.alert.bind(consoleLoggerRef.current),
            critical: consoleLoggerRef.current.critical.bind(consoleLoggerRef.current),
            error: consoleLoggerRef.current.error.bind(consoleLoggerRef.current),
            warning: consoleLoggerRef.current.warning.bind(consoleLoggerRef.current),
            notice: consoleLoggerRef.current.notice.bind(consoleLoggerRef.current),
            info: consoleLoggerRef.current.info.bind(consoleLoggerRef.current),
            debug: consoleLoggerRef.current.debug.bind(consoleLoggerRef.current),
            log: consoleLoggerRef.current.log.bind(consoleLoggerRef.current),
    }}, children);
}