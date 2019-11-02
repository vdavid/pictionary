const {Redux} = window;

/**
 * @typedef {Object} State
 * @property {Object} chat
 * @property {string} chat.typedMessage
 * @property {string[]} chat.messages
 */
export default class ReduxStoreFactory {
    /**
     * @returns {State}
     */
    static getInitialState() {
        return {chat:
                {
                    typedMessage: 'x',
                    messages: ['cxxx'],
                }
        };
    }

    /**
     * @param {State} state
     * @return {State}
     */
    static cloneState(state) {
        return {
            chat: {
                typedMessage: state.chat.typedMessage,
                messages: [...state.chat.messages],
            }
        };
    }
    static createStore() {
        /**
         * @param {State} state
         * @param {{type: string, payload: 'addMessage'|'saveTypedMessage'}} action
         * @return {State}
         */
        function applyAction(state, action) {
            const newState = ReduxStoreFactory.cloneState(state);

            if (action.type === 'addMessage') {
                newState.chat.messages = state.chat.messages.concat(action.payload);
            } else if (action.type === 'saveTypedMessage') {
                newState.chat.typedMessage = action.payload;
            } else {
                newState.chat.messages = state.chat.messages;
            }
            return newState;
        }

        return Redux.createStore(applyAction, ReduxStoreFactory.getInitialState());
    }
}