import {useState, useEffect} from "../../web_modules/react.js";
import {useSelector, useDispatch} from "../../web_modules/react-redux.js";

import {actionCreators as gameActionCreators} from '../store.mjs';
import {actionCreators as chatActionCreators} from '../../chat/store.mjs';

function getPlayerNameByPeerId(players, peerId) {
    const player = players.find(player => player.peerId === peerId);
    return player ? player.name : 'Unknown player';
}

function isMessageACorrectGuess(phrase, messageText) {
    return (messageText.trim().toLowerCase().indexOf(phrase.toLowerCase()) > -1);
}

export const GuessWatcher = () => {
    const [processedMessageCount, setProcessedMessageCount] = useState(0);
    const dispatch = useDispatch();

    const latestRound = useSelector(state => (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []});
    const drawerPeerId = latestRound.drawer ? latestRound.drawer.peerId : undefined;
    const localPeerId = useSelector(state => state.connection.localPeerId);
    const roundStartedDateTimeString = latestRound.trials.length ? latestRound.trials[0].startedDateTimeString : null;
    const messages = useSelector(state => state.chat.messages);
    const phrase = latestRound.phrase;
    const players = useSelector(state => [state.game.localPlayer, ...state.game.remotePlayers]);

    useEffect(() => {
        /* If this is the drawer, check if any new messages are a correct guess */
        if ((drawerPeerId === localPeerId) && (processedMessageCount < messages.length)) {
            /** @type {ChatMessage[]} messagesToParse */
            const messagesToParse = messages.slice(processedMessageCount);
            for (const message of messagesToParse) {
                if ((message.dateTimeString >= roundStartedDateTimeString) && message.isIncoming && !message.isSystemMessage && isMessageACorrectGuess(phrase, message.text)) {
                    dispatch(gameActionCreators.createMarkRoundEndedRequest(phrase, message.senderPeerId, new Date().toISOString()));
                    dispatch(chatActionCreators.createSendRoundEndedRequest(localPeerId, message.senderPeerId,
                        getPlayerNameByPeerId(players, message.senderPeerId), localPeerId, phrase));
                    break; /* We got a winner, do not parse the rest of the guesses */
                }
            }
            setProcessedMessageCount(messages.length);
        }
    }, [drawerPeerId, localPeerId, messages]);
    return null;
};