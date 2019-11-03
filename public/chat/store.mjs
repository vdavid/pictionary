/**
 * @typedef {Object} ChatState
 * @property {string} typedMessage
 * @property {boolean} isSendingMessage
 * @property {string[]} messages
 */

export const actionTypes = {
    SAVE_TYPED_MESSAGE: 'chat/saveTypedMessage',
    MESSAGE_RECEIVED: 'chat/messageReceived',
    SEND_MESSAGE: 'chat/sendMessage',
    MESSAGE_SENT: 'chat/messageSent',
    SENDING_FAILED: 'chat/sendingFailed',
};

function _formatMessage(message) {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    return h + ":" + m + ":" + s + " – " + message;
}

/**
 * @param {ChatState} state
 * @param {{type: string, payload: 'addMessage'|'saveTypedMessage'}} action
 * @return {ChatState}
 */
export function reducer(state, action) {
    /** @type {ChatState} */
    const newState = state ? {
        typedMessage: state.typedMessage,
        isSendingMessage: state.isSendingMessage,
        messages: [...state.messages],
    } : {
        typedMessage: 'x',
        isSendingMessage: false,
        messages: ['cxxx']
    };

    if (action.type === actionTypes.SAVE_TYPED_MESSAGE) {
        newState.typedMessage = action.payload;
    } else if (action.type === actionTypes.MESSAGE_RECEIVED) {
        newState.messages = state.messages.concat('Received: ' + _formatMessage(action.payload));
    } else if (action.type === actionTypes.SEND_MESSAGE) {
        newState.messages = state.messages.concat('Sent: ' + _formatMessage(action.payload));
        newState.isSendingMessage = true;
    } else if (action.type === actionTypes.MESSAGE_SENT) {
        newState.isSendingMessage = false;
    } else if (action.type === actionTypes.SENDING_FAILED) {
        newState.messages = state.messages.concat('Sending failed.');
        newState.isSendingMessage = false;
    }

    return newState;
}