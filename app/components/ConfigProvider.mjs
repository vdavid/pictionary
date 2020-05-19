import React, {createContext, useContext} from '../../web_modules/react.js';

export const ConfigContext = createContext();
export const useConfig = () => useContext(ConfigContext);

/**
 * @param {Object} config
 * @param children
 * @returns {React.ReactElement}
 * @constructor
 */
export default function ConfigProvider({config, children}) {
    return React.createElement(ConfigContext.Provider, {'value': config}, children);
}