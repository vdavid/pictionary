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
 * @returns {*}
 */
function _getStateCopy(state) {
    return state ? {
        typedMessage: state.typedMessage,
        isSendingMessage: state.isSendingMessage,
        messages: [...state.messages],
    } : {
        typedMessage: '',
        isSendingMessage: false,
        messages: [{text: 'Chat is ready.', isIncoming: true, isSystemMessage: true, dateTime: new Date()}]
    };
}

/**
 * @param {ChatState} state
 * @param {{type: string, payload: *}} action
 * @return {ChatState}
 */
export function reducer(state, action) {
    const newState = _getStateCopy(state);

    if (action.type === actionTypes.SAVE_TYPED_MESSAGE) {
        newState.typedMessage = action.payload;
    } else if (action.type === actionTypes.MESSAGE_RECEIVED) { /* Payload: {string} The remote peer ID */
        newState.messages.push({text: action.payload, isIncoming: true, isSystemMessage: false, dateTime: new Date()});
    } else if (action.type === actionTypes.SEND_MESSAGE) {
        newState.messages.push({text: action.payload, isIncoming: false, isSystemMessage: false, dateTime: new Date()});
        newState.typedMessage = '';
        newState.isSendingMessage = true;
    } else if (action.type === actionTypes.MESSAGE_SENT) {
        newState.isSendingMessage = false;
    } else if (action.type === actionTypes.SENDING_FAILED) {
        state.messages.push({text: 'Sending failed.', isIncoming: false, isSystemMessage: true, dateTime: new Date()});
        newState.isSendingMessage = false;
    }

    return newState;
}

function saveTypedMessage(state, payload) {

}