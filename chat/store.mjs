/**
 * @typedef {Object} ChatMessage
 * @property {string|null} senderPeerId
 * @property {string} text
 * @property {boolean} isIncoming
 * @property {boolean} isSystemMessage
 * @property {string} dateTimeString
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
    SEND_ROUND_ENDED_REQUEST: 'chat/SEND_ROUND_ENDED_REQUEST',
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
        messages: [{senderPeerId: null, text: 'Chat is ready.', isIncoming: true, isSystemMessage: true, dateTimeString: new Date().toISOString()}]
    };
}

// noinspection JSUnusedGlobalSymbols TODO: Use createSendMessageFailure in case of failure
export const actionCreators = {
    createSaveTypedMessageRequest: (messageText) => ({type: actionTypes.SAVE_TYPED_MESSAGE_REQUEST, payload: messageText}),
    createAddReceivedMessageRequest: (senderPeerId, messageText) => ({type: actionTypes.ADD_RECEIVED_MESSAGE_REQUEST, payload: {senderPeerId, messageText}}),
    createSendMessageRequest: (senderPeerId, messageText) => ({type: actionTypes.SEND_MESSAGE_REQUEST, payload: {senderPeerId, messageText}}),
    createSendMessageSuccess: () => ({type: actionTypes.SEND_MESSAGE_SUCCESS}),
    createSendMessageFailure: () => ({type: actionTypes.SEND_MESSAGE_FAILURE}),
    createSendRoundEndedRequest: (drawerPeerId, solverPeerId, solverPeerName, localPeerId, phrase) => ({type: actionTypes.SEND_ROUND_ENDED_REQUEST, payload: {drawerPeerId, solverPeerId, solverPeerName, localPeerId, phrase}}),
    createNoteCanvasWasClearedRequest: (isLocalPlayerDrawing) => ({type: actionTypes.NOTE_CANVAS_WAS_CLEARED_REQUEST, payload: isLocalPlayerDrawing}),
};

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
        [actionTypes.SEND_ROUND_ENDED_REQUEST]: _addRoundEndedSystemMessage,
        [actionTypes.NOTE_CANVAS_WAS_CLEARED_REQUEST]: _addCanvasClearedSystemMessage,
    };
    const newState = _getStateCopy(state);

    if (actionTypeToFunctionMap[action.type]) {
        actionTypeToFunctionMap[action.type](newState, action.payload);
    }

    return newState;
}

/**
 * @param {ChatState} state
 * @param {string} messageText
 */
function _saveTypedMessage(state, messageText) {
    state.typedMessage = messageText;
}

/**
 * @param {ChatState} state
 * @param {{senderPeerId: string, messageText: string}} messageData
 */
function _addReceivedMessage(state, {senderPeerId, messageText}) {
    state.messages.push({senderPeerId, text: messageText.substr(0, 160), isIncoming: true, isSystemMessage: false, dateTimeString: new Date().toISOString()});
}

/**
 * @param {ChatState} state
 * @param {{senderPeerId: string, messageText: string}} messageData
 */
function _addMessageAsSending(state, {senderPeerId, messageText}) {
    state.messages.push({senderPeerId, text: messageText.substr(0, 160), isIncoming: false, isSystemMessage: false, dateTimeString: new Date().toISOString()});
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
    state.messages.push({senderPeerId: null, text: 'Sending failed.', isIncoming: false, isSystemMessage: true, dateTimeString: new Date().toISOString()});
    state.isSendingMessage = false;
}

/**
 * @param {ChatState} state
 * @param {{drawerPeerId: string, solverPeerId: string, solverPeerName: string, localPeerId: string, phrase: string}} drawerPeerIdAndPhrase
 * @private
 */
function _addRoundEndedSystemMessage(state, {drawerPeerId, solverPeerId, solverPeerName, localPeerId, phrase}) {
    const text = !solverPeerId
        ? 'No one got this one: “' + phrase + '”.'
        : ((drawerPeerId === localPeerId)
            ? 'Yay! ' + solverPeerName + ' guessed it correctly! Let\'s see another one!'
            : ((solverPeerId === localPeerId)
                ? 'Yay! You guessed it correctly, it was indeed “' + phrase + '”! Let\'s see another one!'
                : solverPeerName + ' guessed it correctly! The solution was “' + phrase + '”!'));
    state.messages.push({senderPeerId: null, text, isIncoming: true, isSystemMessage: true, dateTimeString: new Date().toISOString()});
}

/**
 * @param {ChatState} state
 * @param {boolean} isLocalPlayerDrawing
 * @private
 */
function _addCanvasClearedSystemMessage(state, isLocalPlayerDrawing) {
    const text = 'Let\'s try this again.';
    state.messages.push({senderPeerId: null, text, isIncoming: !isLocalPlayerDrawing, isSystemMessage: true, dateTimeString: new Date().toISOString()});
}
