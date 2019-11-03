/**
 * @typedef {Object} MessageComponent
 * @property {string} text
 * @property {boolean} isIncoming
 * @property {boolean} isSystemMessage
 * @property {Date} dateTime
 */
/**
 * @typedef {Object} ChatState
 * @property {string} typedMessage
 * @property {boolean} isSendingMessage
 * @property {MessageComponent[]} messages
 */

export const actionTypes = {
    SAVE_TYPED_MESSAGE: 'chat/saveTypedMessage',
    MESSAGE_RECEIVED: 'chat/messageReceived',
    SEND_MESSAGE: 'chat/sendMessage',
    MESSAGE_SENT: 'chat/messageSent',
    SENDING_FAILED: 'chat/sendingFailed',
};

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
        messages: [{text: 'Chat is ready.', isIncoming: false, isSystemMessage: true, dateTime: new Date()}]
    };

    if (action.type === actionTypes.SAVE_TYPED_MESSAGE) {
        newState.typedMessage = action.payload;
    } else if (action.type === actionTypes.MESSAGE_RECEIVED) {
        newState.messages.push({text: action.payload, isIncoming: true, isSystemMessage: false, dateTime: new Date()});
    } else if (action.type === actionTypes.SEND_MESSAGE) {
        newState.messages.push({text: action.payload, isIncoming: false, isSystemMessage: false, dateTime: new Date()});
        newState.isSendingMessage = true;
    } else if (action.type === actionTypes.MESSAGE_SENT) {
        newState.isSendingMessage = false;
    } else if (action.type === actionTypes.SENDING_FAILED) {
        state.messages.push({text: 'Sending failed.', isIncoming: false, isSystemMessage: true, dateTime: new Date()});
        newState.isSendingMessage = false;
    }

    return newState;
}