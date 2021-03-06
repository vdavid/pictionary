import React, {useEffect} from "../../web_modules/react.js";
import {useSelector, useDispatch} from "../../web_modules/react-redux.js";

import {actionCreators as gameActionCreators} from '../store.mjs';
import ConnectBox from '../../connection/components/ConnectBox.mjs';
import {NoConnectionBox} from '../../connection/components/NoConnectionBox.mjs';
import {RoundStartingBox} from './RoundStartingBox.mjs';
import {Canvases} from '../../canvases/components/Canvases.mjs';
import {WordDisplay} from './WordDisplay.mjs';
import {GuessWatcher} from './GuessWatcher.mjs';
import {PlayerList} from '../../player/components/PlayerList.mjs';
import {Chat} from '../../chat/components/Chat.mjs';
import {Timer} from './Timer.mjs';
import {connectionListenerStatus} from '../../connection/connection-listener-status.mjs';
import {trialResult} from '../trial-result.mjs';
import {getRandomPhrase} from '../../data/phrases.mjs';

export const GamePage = () => {
    const dispatch = useDispatch();

    const latestRound = useSelector(state => (state.game.rounds.length > 0) ? state.game.rounds[state.game.rounds.length - 1] : {trials: []});
    const latestTrial = (latestRound.trials.length > 0) ? latestRound.trials[latestRound.trials.length - 1] : {};
    const currentConnectionListenerStatus = useSelector(state => state.connection.connectionListenerStatus);
    const shouldDisplayNoConnectionBox = [
        connectionListenerStatus.notConnectedToPeerServer,
        connectionListenerStatus.shouldConnectToPeerServer,
        connectionListenerStatus.connectingToPeerServer,
        connectionListenerStatus.shouldDisconnectFromPeerServer,
        connectionListenerStatus.disconnectingFromPeerServer].includes(currentConnectionListenerStatus);
    const shouldDisplayConnectBox = [
        connectionListenerStatus.listeningForConnections,
        connectionListenerStatus.shouldConnectToHost,
        connectionListenerStatus.connectingToHost].includes(currentConnectionListenerStatus);
    const isHost = useSelector(state => state.connection.hostPeerId === state.connection.localPeerId);
    const isGameStarted = useSelector(state => state.game.isGameStarted);
    const rounds = useSelector(state => state.game.rounds);
    const roundStatus = latestTrial.trialResult || trialResult.unstarted;
    const localPlayer = useSelector(state => state.game.localPlayer);
    const remotePlayers = useSelector(state => state.game.remotePlayers);

    /* Take control of the game if this is the host and there are players */
    useEffect(() => {
        if (isHost && (remotePlayers.length > 0)) {
            if (!isGameStarted) {
                dispatch(gameActionCreators.createStartGameRequest(new Date().toISOString()));
            }
            if ([trialResult.unstarted, trialResult.failed, trialResult.solved].includes(roundStatus)) {
                const randomStarterPlayer = _getRandomStartingPlayer();
                const phrase = (randomStarterPlayer.peerId === localPlayer.peerId) ? getRandomPhrase().trim() : null;
                dispatch(gameActionCreators.createStartRoundRequest(new Date().toISOString(), randomStarterPlayer.peerId, phrase));
            }
        }
    }, [isHost, remotePlayers.length, isGameStarted, roundStatus]);

    return React.createElement('div', {id: 'gamePage'},
        React.createElement('div', {id: 'gamePageLayout'},
            React.createElement(Canvases),
            React.createElement(WordDisplay),
            React.createElement(GuessWatcher),
            React.createElement(PlayerList),
            React.createElement(Chat),
            React.createElement('section', {id: 'timerSection'},
                (roundStatus === trialResult.ongoing) ? React.createElement(Timer, {}) : null,
            ),
        ),
        shouldDisplayNoConnectionBox ? React.createElement(NoConnectionBox) : null,
        shouldDisplayConnectBox ? React.createElement(ConnectBox) : null,
        (roundStatus === trialResult.starting) ? React.createElement(RoundStartingBox, {}) : null,
    );

    /**
     * Creates a list of potential next drawers.
     * If some player(s) have drawn 1 or more times less than someone else, they get to draw.
     * @returns {Player}
     * @private
     */
    function _getRandomStartingPlayer() {
        const maximumAllowedDifference = 1;
        const allPlayers = [localPlayer, ...remotePlayers];

        const peerIdToDrawCountMap = _calculateHowManyTimesEachPlayerDrew(allPlayers, rounds);
        const maxDrawerCount = Math.max(...Object.values(peerIdToDrawCountMap));
        const potentialNextDrawerPeerIds = Object.entries(peerIdToDrawCountMap).filter(([, drawerCount]) => drawerCount <= maxDrawerCount - maximumAllowedDifference).map(([peerId]) => peerId);

        /* Select players */
        const potentialNextDrawers = potentialNextDrawerPeerIds.length
            ? allPlayers.filter(player => potentialNextDrawerPeerIds.includes(player.peerId)) : allPlayers;

        /* This used to be random, but now we just return the first potential drawer to do a simple rotation. */
        return potentialNextDrawers[0];
    }

    /**
     * @param {Player[]} allPlayers
     * @param {RoundLog[]} rounds
     * @returns {Object<string, int>} Map: Keys: Peer IDs. Values: The number of times the player drew during the game.
     * @private
     */
    function _calculateHowManyTimesEachPlayerDrew(allPlayers, rounds) {
        const drawerCounts = allPlayers.reduce((emptyCounts, player) => {
            emptyCounts[player.peerId] = 0;
            return emptyCounts;
        }, {});
        rounds.forEach(round => drawerCounts[round.drawer.peerId]++);
        return drawerCounts;
    }
};