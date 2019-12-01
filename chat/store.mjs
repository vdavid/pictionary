/**
 * @typedef {Object} ChatMessage
 * @property {string} text
 * @property {boolean} isIncoming
 * @property {boolean} isSystemMessage
 * @property {Date} dateTime
 */
/**
 * @typedef {Object} ChatState
 * @property {string} typedMessage
 * @property {boolean} isSendingMessage
 * @property {ChatMessage[]} messages
 */

export const actionTypes = {
    SAVE_TYPED_MESSAGE_REQUEST: 'chat/SAVE_TYPED_MESSAGE_REQUEST',
    ADD_RECEIVED_MESSAGE_REQUEST: 'chat/ADD_RECEIVED_MESSAGE_REQUEST',
    SEND_MESSAGE_REQUEST: 'chat/SEND_MESSAGE_REQUEST',
    SEND_MESSAGE_SUCCESS: 'chat/SEND_MESSAGE_SUCCESS',
    SEND_MESSAGE_FAILURE: 'chat/SEND_MESSAGE_FAILURE',
    SEND_PHRASE_GUESSED_REQUEST: 'chat/SEND_PHRASE_GUESSED_REQUEST',
    NOTE_CANVAS_WAS_CLEARED_REQUEST: 'chat/NOTE_CANVAS_WAS_CLEARED_REQUEST',
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

export const actionCreators = {
    createSaveTypedMessageRequest: (message) => ({type: actionTypes.SAVE_TYPED_MESSAGE_REQUEST, payload: message}),
    createAddReceivedMessageRequest: (message) => ({type: actionTypes.ADD_RECEIVED_MESSAGE_REQUEST, payload: message}),
    createSendMessageRequest: (message) => ({type: actionTypes.SEND_MESSAGE_REQUEST, payload: message}),
    createSendMessageSuccess: () => ({type: actionTypes.SEND_MESSAGE_SUCCESS}),
    createSendMessageFailure: () => ({type: actionTypes.SEND_MESSAGE_FAILURE}),
    createSendPhraseGuessedRequest: (whoDrewAndPhrase) => ({type: actionTypes.SEND_PHRASE_GUESSED_REQUEST, payload: whoDrewAndPhrase}),
    createNoteCanvasWasClearedRequest: (whoDrew) => ({type: actionTypes.NOTE_CANVAS_WAS_CLEARED_REQUEST, payload: whoDrew}),
};

/**
 * @param {ChatState} state
 * @param {string} messageText
 */
function _saveTypedMessage(state, messageText) {
    state.typedMessage = messageText;
}

/**
 * @param {ChatState} state
 * @param {string} messageText
 */
function _addReceivedMessage(state, messageText) {
    state.messages.push({text: messageText.substr(0, 160), isIncoming: true, isSystemMessage: false, dateTime: new Date()});
}

/**
 * @param {ChatState} state
 * @param {string} messageText
 */
function _addMessageAsSending(state, messageText) {
    state.messages.push({text: messageText.substr(0, 160), isIncoming: false, isSystemMessage: false, dateTime: new Date()});
    state.typedMessage = '';
    state.isSendingMessage = true;
}

/**
 * @param {ChatState} state
 */
function _indicateSendingSucceeded(state) {
    state.isSendingMessage = false;
}

/**
 * @param {ChatState} state
 */
function _addSendingFailedSystemMessage(state) {
    state.messages.push({text: 'Sending failed.', isIncoming: false, isSystemMessage: true, dateTime: new Date()});
    state.isSendingMessage = false;
}

/**
 * @param {ChatState} state
 * @param {{whoDrew: 'local'|'remote', phrase: string}} argument2
 * @private
 */
function _addPhraseFoundOutSystemMessage(state, {whoDrew, phrase}) {
    const text = (whoDrew === 'local')
        ? 'Yay! Your friend guessed it right! Let\'s see another one!'
        : 'Yay! You guessed it right, it was indeed “' + phrase + '”! Let\'s see another one!';
    state.messages.push({text, isIncoming: true, isSystemMessage: true, dateTime: new Date()});
}

/**
 * @param {ChatState} state
 * @param {'local'|'remote'} whoDrew
 * @private
 */
function _addCanvasClearedSystemMessage(state, whoDrew) {
    const text = 'Let\'s try this again.';
    state.messages.push({text, isIncoming: (whoDrew === 'remote'), isSystemMessage: true, dateTime: new Date()});
}

/**
 * @param {ChatState} state
 * @param {{type: string, payload: *, error: boolean?, meta: *?}} action
 * @return {ChatState}
 */
export function reducer(state, action) {
    const actionTypeToFunctionMap = {
        [actionTypes.SAVE_TYPED_MESSAGE_REQUEST]: _saveTypedMessage,
        [actionTypes.ADD_RECEIVED_MESSAGE_REQUEST]: _addReceivedMessage,
        [actionTypes.SEND_MESSAGE_REQUEST]: _addMessageAsSending,
        [actionTypes.SEND_MESSAGE_SUCCESS]: _indicateSendingSucceeded,
        [actionTypes.SEND_MESSAGE_FAILURE]: _addSendingFailedSystemMessage,
        [actionTypes.SEND_PHRASE_GUESSED_REQUEST]: _addPhraseFoundOutSystemMessage,
        [actionTypes.NOTE_CANVAS_WAS_CLEARED_REQUEST]: _addCanvasClearedSystemMessage,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}