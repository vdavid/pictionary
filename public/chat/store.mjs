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
    PHRASE_GUESSED_CORRECTLY: 'chat/phraseGuessedCorrectly',
};

/**
 * @param {ChatState} state
 * @returns {ChatState}
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
 * @param {string} payload The message
 */
function _saveTypedMessage(state, payload) {
    state.typedMessage = payload;
}

/**
 * @param {ChatState} state
 * @param {string} payload The message
 */
function _messageReceived(state, payload) {
    state.messages.push({text: payload, isIncoming: true, isSystemMessage: false, dateTime: new Date()});
}

/**
 * @param {ChatState} state
 * @param {string} payload The message
 */
function _sendMessage(state, payload) {
    state.messages.push({text: payload, isIncoming: false, isSystemMessage: false, dateTime: new Date()});
    state.typedMessage = '';
    state.isSendingMessage = true;
}

/**
 * @param {ChatState} state
 */
function _messageSent(state) {
    state.isSendingMessage = false;
}

/**
 * @param {ChatState} state
 */
function _sendingFailed(state) {
    state.messages.push({text: 'Sending failed.', isIncoming: false, isSystemMessage: true, dateTime: new Date()});
    state.isSendingMessage = false;
}

/**
 * @param {ChatState} state
 * @param {'local'|'remote'} whoSaysIt
 * @param {string} phrase
 * @private
 */
function _addSystemMessageThatPhraseWasGuessedCorrectly(state, {whoDrew, phrase}) {
    const text = (whoDrew === 'local')
        ? 'Yay! Your friend guessed it right! Let\'s see another one!'
        : 'Yay! You guessed it right, it was indeed “' + phrase + '”! Let\'s see another one!';
    state.messages.push({text, isIncoming: true, isSystemMessage: true, dateTime: new Date()});
}

/**
 * @param {ChatState} state
 * @param {{type: string, payload: *}} action
 * @return {ChatState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.SAVE_TYPED_MESSAGE]: _saveTypedMessage,
        [actionTypes.MESSAGE_RECEIVED]: _messageReceived,
        [actionTypes.SEND_MESSAGE]: _sendMessage,
        [actionTypes.MESSAGE_SENT]: _messageSent,
        [actionTypes.SENDING_FAILED]: _sendingFailed,
        [actionTypes.PHRASE_GUESSED_CORRECTLY]: _addSystemMessageThatPhraseWasGuessedCorrectly,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}