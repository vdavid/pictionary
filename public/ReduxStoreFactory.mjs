const {Redux} = window;

export default class ReduxStoreFactory {
    static createStore() {
        /**
         * @param {{messages: string[]}} state
         * @param {{type: string, payload: *}} action
         */
        function applyAction(state, action) {
            const newState = {};
            if (action.type === 'addMessage') {
                newState.messages = state.messages.concat(action.payload);
            } else {
                newState.messages = state.messages;
            }
            return newState;
        }

        return Redux.createStore(applyAction, {messages: ['cxxx']});
    }
}